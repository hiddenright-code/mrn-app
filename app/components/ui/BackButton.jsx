'use client'
import { useRouter } from 'next/navigation'

export default function BackButton({ label = '← Back' }) {
  const router = useRouter()

  function handleBack() {
    sessionStorage.setItem('mrn_last_page', 'matches')
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleBack}
      style={{
        background: 'none', border: 'none',
        color: '#9FE1CB', fontSize: '14px',
        cursor: 'pointer', marginBottom: '8px',
        padding: 0, fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {label}
    </button>
  )
}