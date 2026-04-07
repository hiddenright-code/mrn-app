'use client'

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Introduction',
      content: `Muslim Referral Network ("MRN", "we", "us", or "our") is a trust-based professional referral platform connecting Muslim professionals. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using MRN you agree to the practices described here.`
    },
    {
      title: '2. Information We Collect',
      content: `We collect information you provide directly: account information (name, email, password), profile information (job title, tagline, LinkedIn URL, profile photo, employment history, education, portfolio links), insider information (company, department, role level, referral vault links), seeker information (job preferences, visa status, work preference, target cities, relocation preference, career summary), pitch content, private chat messages, and notification preferences. We also collect authentication tokens and session data automatically.`
    },
    {
      title: '3. How We Use Your Information',
      content: `We use your information to operate the MRN platform, match seekers with insiders, send transactional emails via Resend, calculate and award Barakah Points, enforce platform rules, display your profile to users with whom you have a pitch or match relationship, and improve the platform through usage analytics.`
    },
    {
      title: '4. What We Share',
      content: `We do not sell your personal data. Once a pitch is accepted, both insider and seeker can see each other's profile and communicate via private chat. If an insider has anonymity mode enabled, seekers only see their role level and company until a match is made. We use Supabase (database and authentication) and Resend (email delivery) as service providers. We may share data if required by law or to protect user safety.`
    },
    {
      title: '5. Data Storage and Security',
      content: `Your data is stored securely on Supabase's infrastructure with Row Level Security (RLS) policies ensuring users can only access data they are authorized to see. Passwords are hashed and never stored in plain text. Profile photos are stored in Supabase Storage.`
    },
    {
      title: '6. Your Rights',
      content: `You have the right to access your personal data through your profile settings, correct inaccurate information, delete your account and all associated data via Settings → Account → Delete Account, export your data (contact privacy@mrn.app), and opt out of email notifications via Settings → Notifications. For GDPR or CCPA requests contact privacy@mrn.app. We will respond within 30 days.`
    },
    {
      title: '7. Data Retention',
      content: `We retain your data for as long as your account is active. When you delete your account, all personal data including your profile, employment history, education, pitches, messages, and notifications are permanently deleted. Anonymized aggregate statistics may be retained for platform analytics.`
    },
    {
      title: "8. Children's Privacy",
      content: `MRN is intended for professional use by adults aged 18 and over. We do not knowingly collect data from anyone under 18. If you believe a minor has created an account, contact us at privacy@mrn.app.`
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notification. Continued use of MRN after changes constitutes acceptance of the updated policy.`
    },
    {
      title: '10. Contact',
      content: `For privacy-related questions: privacy@mrn.app`
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ background: '#085041', padding: '16px 20px' }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: 'none', border: 'none', color: '#9FE1CB', fontSize: '14px', cursor: 'pointer', marginBottom: '8px', padding: 0, fontFamily: 'DM Sans, sans-serif' }}
        >
          ← Back
        </button>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '500', color: '#E1F5EE' }}>
          Privacy Policy
        </div>
        <div style={{ fontSize: '12px', color: '#9FE1CB', marginTop: '2px' }}>Last updated: April 2026</div>
      </div>

      <div style={{ padding: '16px', maxWidth: '420px', margin: '0 auto' }}>
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#085041', lineHeight: '1.6' }}>
          We take your privacy seriously. This policy explains exactly what data we collect and how we use it.
        </div>

        {sections.map((section, i) => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#085041', marginBottom: '8px' }}>
              {section.title}
            </div>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
              {section.content}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', padding: '16px 0 32px' }}>
          Questions? Contact us at{' '}
          <a href="mailto:privacy@mrn.app" style={{ color: '#085041' }}>privacy@mrn.app</a>
        </div>
      </div>
    </div>
  )
}