'use client'

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By creating an account on Muslim Referral Network ("MRN") you agree to these Terms of Service. If you do not agree, do not use the platform. These terms apply to all users — insiders, seekers, and users registered as both.`
    },
    {
      title: '2. What MRN Is',
      content: `MRN is a trust-based professional referral platform for Muslim professionals. Insiders (employed professionals) can refer seekers (job candidates) at their companies. MRN facilitates the connection — we are not an employment agency, recruiter, or guarantor of any job outcome. We do not guarantee that any referral will result in a job offer or hire.`
    },
    {
      title: '3. Eligibility',
      content: `You must be 18 years or older to use MRN. By creating an account you represent that all information you provide is accurate and truthful. Creating fake, misleading, or duplicate accounts is prohibited and may result in permanent suspension.`
    },
    {
      title: '4. User Conduct',
      content: `You agree not to: provide false information on your profile; impersonate another person or organization; send spam, abusive, or harassing messages; attempt to circumvent platform rate limits or safety features; use MRN to solicit users for services outside the platform; scrape or harvest other users' data; or attempt to compromise the platform's security. Violations may result in account suspension or permanent ban at MRN's sole discretion.`
    },
    {
      title: '5. Insider Responsibilities',
      content: `Insiders represent that they are currently employed at the company listed on their profile, have a genuine ability to refer candidates, and will respond to pitches in good faith. MRN is not responsible for insiders who accept pitches but fail to submit referrals. Pipeline stage updates are self-reported and not verified by MRN.`
    },
    {
      title: '6. Seeker Responsibilities',
      content: `Seekers represent that their profile, employment history, and education are accurate, and that pitches are written honestly and in good faith. Seekers are subject to weekly pitch limits based on their badge tier. Abuse of the pitch system may result in account suspension.`
    },
    {
      title: '7. Barakah Points',
      content: `Barakah Points are awarded for referral milestones and community participation. They have no cash value and cannot be transferred, sold, or exchanged outside the platform. MRN reserves the right to modify, suspend, or terminate the Barakah Points system at any time.`
    },
    {
      title: '8. Success Gifts',
      content: `Success gifts offered by seekers to insiders upon hire are voluntary commitments between users. MRN does not facilitate, guarantee, or enforce success gift payments at this time. Any payment disputes are between the users involved and are not MRN's responsibility.`
    },
    {
      title: '9. Privacy',
      content: `Your use of MRN is also governed by our Privacy Policy, which is incorporated into these Terms by reference.`
    },
    {
      title: '10. Intellectual Property',
      content: `All MRN branding, design, code, and content is owned by MRN. Users retain ownership of the content they submit but grant MRN a non-exclusive license to display and use that content to operate the platform.`
    },
    {
      title: '11. Disclaimers',
      content: `MRN is provided "as is" without warranties of any kind. We do not guarantee platform uptime, referral outcomes, or job placement. MRN is not liable for any damages arising from use of the platform, including lost employment opportunities.`
    },
    {
      title: '12. Termination',
      content: `MRN reserves the right to suspend or terminate any account that violates these Terms, at our sole discretion, with or without notice. You may delete your account at any time via Settings → Account → Delete Account.Nothing in these Terms limits any rights you may have under applicable New Jersey consumer protection laws, including the New Jersey Consumer Fraud Act.`
    },
    {
      title: '13. Governing Law',
      content: `These Terms are governed by the laws of the State of New Jersey, United States, without regard to conflict of law principles. Any disputes arising from these Terms or your use of MRN shall be subject to the exclusive jurisdiction of the state and federal courts located in New Jersey.`
    },
    {
      title: '14. Changes to Terms',
      content: `We may update these Terms from time to time. We will notify you of significant changes via email or in-app notification. Continued use of MRN after changes constitutes acceptance of the updated Terms.`
    },
    {
      title: '15. Contact',
      content: `For questions about these Terms: legal@mrn.app`
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
          Terms of Service
        </div>
        <div style={{ fontSize: '12px', color: '#9FE1CB', marginTop: '2px' }}>Last updated: April 2026</div>
      </div>

      <div style={{ padding: '16px', maxWidth: '420px', margin: '0 auto' }}>
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#085041', lineHeight: '1.6' }}>
          Please read these terms carefully before using MRN. By creating an account you agree to be bound by these terms.
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
          <a href="mailto:legal@mrn.app" style={{ color: '#085041' }}>legal@mrn.app</a>
        </div>
      </div>
    </div>
  )
}