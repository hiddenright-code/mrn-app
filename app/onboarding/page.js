'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import StepRole from '../components/onboarding/StepRole'
import StepBasicInfo from '../components/onboarding/StepBasicInfo'
import StepInsiderInfo from '../components/onboarding/StepInsiderInfo'
import StepSeekerInfo from '../components/onboarding/StepSeekerInfo'
import StepComplete from '../components/onboarding/StepComplete'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null)

  const [data, setData] = useState({
    role: '',
    fullName: '',
    tagLine: '',
    linkedinUrl: '',
    company: '',
    roleLevel: '',
    department: '',
    anonymityOn: true,
    isMuslim: false,
    seekingStatus: 'Actively seeking referrals',
    summary: '',
    currentLocation: '',
    relocatePreference: 'Yes — within US',
    workPreference: 'Hybrid',
    visaStatus: 'Not required — US citizen',
  })

  useEffect(() => {
    async function getUser() {
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserId(session.user.id)
      } else {
        // Try one more time after another short wait
        await new Promise(resolve => setTimeout(resolve, 1000))
        const { data: { session: session2 } } = await supabase.auth.getSession()
        if (session2?.user) {
          setUserId(session2.user.id)
        } else {
          window.location.href = '/login'
        }
      }
    }
    getUser()
  }, [])

  function onChange(field, value) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function getSteps() {
    if (data.role === 'insider') return ['role', 'basic', 'insider', 'complete']
    if (data.role === 'seeker')  return ['role', 'basic', 'seeker',  'complete']
    if (data.role === 'both')    return ['role', 'basic', 'insider', 'seeker', 'complete']
    return ['role']
  }

  const steps = getSteps()
  const currentStep = steps[step]

  async function handleComplete() {
    setLoading(true)
    setError('')

    try {
      // 1. Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          tag_line: data.tagLine,
          linkedin_url: data.linkedinUrl || null,
          role: data.role,
          is_muslim: data.isMuslim,
        })
        .eq('id', userId)

      if (userError) throw userError

      // 2. Create insider profile if needed
      if (data.role === 'insider' || data.role === 'both') {
        const { error: insiderError } = await supabase
          .from('insider_profiles')
          .insert({
            user_id: userId,
            company: data.company,
            role_level: data.roleLevel,
            department: data.department,
            anonymity_on: data.anonymityOn,
            open_to_referring: true,
            barakah_points: 0,
          })

        if (insiderError && insiderError.code !== '23505') throw insiderError
      }

      // 3. Create seeker profile if needed
      if (data.role === 'seeker' || data.role === 'both') {
        const { error: seekerError } = await supabase
          .from('seeker_profiles')
          .insert({
            user_id: userId,
            summary: data.summary,
            seeking_status: data.seekingStatus,
            current_location: data.currentLocation,
            relocate_preference: data.relocatePreference,
            work_preference: data.workPreference,
            visa_status: data.visaStatus,
          })

        if (seekerError && seekerError.code !== '23505') throw seekerError
      }

      // 4. Award community verified badge if LinkedIn provided
      if (data.linkedinUrl) {
        await supabase
          .from('badges')
          .insert({ user_id: userId, badge_type: 'community_verified' })
          .then(() => {
            supabase.from('barakah_log').insert({
              user_id: userId,
              event: 'Profile verified via LinkedIn',
              points: 20,
            })
          })
      }
 // Mark onboarding as complete
      await supabase
        .from('users')
        .update({ onboarding_complete: true })
        .eq('id', userId)
      setStep(prev => prev + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function nextStep() {
    if (currentStep === 'role') return
    const isLastDataStep = steps[step + 1] === 'complete'
    if (isLastDataStep) {
      handleComplete()
    } else {
      setStep(prev => prev + 1)
    }
  }

  function prevStep() {
    setStep(prev => Math.max(0, prev - 1))
  }

  const totalSteps = steps.length - 1
  const progressPct = Math.round((step / totalSteps) * 100)

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f4f0',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', padding: '40px 16px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '24px', fontWeight: '600',
            color: '#085041', letterSpacing: '-0.02em',
          }}>
            MRN
          </div>
          <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginTop: '2px' }}>
            THE INSIDER NETWORK · FOR THE UMMAH
          </div>
        </div>

        {/* Progress bar */}
        {currentStep !== 'complete' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              height: '4px', background: '#E1F5EE',
              borderRadius: '20px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '20px',
                background: '#085041',
                width: `${progressPct}%`,
                transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '6px', textAlign: 'right' }}>
              Step {step + 1} of {totalSteps + 1}
            </div>
          </div>
        )}

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid rgba(0,0,0,0.1)',
          padding: '28px',
        }}>
          {error && (
            <div style={{
              background: '#FCEBEB', border: '0.5px solid #F09595',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', color: '#A32D2D', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {currentStep === 'role' && (
            <StepRole onSelect={(r) => {
              onChange('role', r)
              setStep(1)
            }} />
          )}

          {currentStep === 'basic' && (
            <StepBasicInfo
              data={data}
              onChange={onChange}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'insider' && (
            <StepInsiderInfo
              data={data}
              onChange={onChange}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'seeker' && (
            <StepSeekerInfo
              data={data}
              onChange={onChange}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 'complete' && (
            <StepComplete role={data.role} />
          )}

          {loading && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', color: '#085041', fontWeight: '500',
            }}>
              Setting up your profile...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}