import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const features = [
  {
    title: 'Convert Any PDF Statement',
    desc: 'Upload statements from any bank worldwide. Our parser handles text-based and scanned PDFs automatically.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Auto-Categorize Transactions',
    desc: '2,000+ merchant dictionary with regex patterns. Every transaction sorted into the right category — instantly.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    title: 'Detect All Subscriptions',
    desc: "Find every recurring charge eating into your budget. See annual totals and cancel what you don't need.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    title: 'Income Verification Reports',
    desc: 'Professional PDF reports for mortgage, loan, and rental applications. Replace hours of manual work.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Export to QuickBooks & Xero',
    desc: 'Push categorized transactions directly into your accounting software with one click.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: 'Accountant Client Portal',
    desc: 'Manage clients, send upload links, and generate branded reports — all from one dashboard.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const trustItems = [
  { label: 'Bank-Grade Encryption', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
  { label: 'SOC 2 Ready', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { label: 'Trusted by Accountants', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
  { label: 'No Data Sold', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg> },
]

const testimonials = [
  { quote: 'StatementIQ cut my statement review time from 2 hours to 5 minutes. The income verification report alone is worth the subscription.', name: 'Michael Chen', title: 'Mortgage Broker, Pacific Lending' },
  { quote: 'The client portal changed how I work with my clients. They upload, I get categorized data. No more back-and-forth email attachments.', name: 'Sarah Williams', title: 'CPA, Williams & Co Accounting' },
  { quote: 'I was manually entering bank data into spreadsheets every month. Now I upload, review, and export to QuickBooks in under 10 minutes.', name: 'David Adeyemi', title: 'Small Business Owner, Lagos' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 40px',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute',
          top: -120,
          right: -180,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(67, 97, 238, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -200,
          left: -100,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ flex: 1, maxWidth: 560, zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            background: 'var(--primary-light)',
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: 20,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            Now with AI-powered analysis
          </div>
          <h1 style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            marginBottom: 20,
            color: 'var(--text)',
          }}>
            Your Bank Statements.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Fully Understood.</span>
          </h1>
          <p style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 32,
            maxWidth: 460,
          }}>
            Upload any PDF bank statement and get back categorized transactions,
            visual insights, and professional reports — instantly.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <Link href="#features" className="btn-ghost" style={{ padding: '13px 28px', fontSize: 15 }}>
              See How It Works
            </Link>
          </div>
        </div>

        {/* Hero visual card */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            width: 400,
            background: 'var(--card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            padding: 28,
            transform: 'rotate(1deg)',
          }}>
            {/* Mini header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Statement Analysis</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Jan 2025 • First Bank</div>
              </div>
            </div>

            {/* Mini stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
              <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#065F46' }}>$4,250</div>
                <div style={{ fontSize: 10, color: '#047857', fontWeight: 500 }}>Income</div>
              </div>
              <div style={{ background: 'var(--danger-light)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#991B1B' }}>$3,120</div>
                <div style={{ fontSize: 10, color: '#B91C1C', fontWeight: 500 }}>Expenses</div>
              </div>
              <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>+$1,130</div>
                <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 500 }}>Net</div>
              </div>
            </div>

            {/* Mini chart bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 48, marginBottom: 16 }}>
              {[65, 45, 80, 55, 70, 90, 40, 60, 75, 50, 85, 65].map((h, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i === 5 ? 'var(--primary)' : 'var(--primary-light)',
                  borderRadius: 3,
                  transition: 'height 0.3s',
                }} />
              ))}
            </div>

            {/* Mini transaction rows */}
            {[
              { name: 'Netflix', cat: 'Subscription', amt: '-$15.99' },
              { name: 'Salary Deposit', cat: 'Income', amt: '+$3,200' },
            ].map((tx) => (
              <div key={tx.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{tx.name}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{tx.cat}</div>
                </div>
                <div style={{
                  fontWeight: 600,
                  color: tx.amt.startsWith('+') ? 'var(--success)' : 'var(--text)',
                }}>{tx.amt}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{
        background: 'var(--bg-elevated)',
        padding: '18px 40px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
        }}>
          {trustItems.map((item) => (
            <span key={item.label} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              <span style={{ color: 'var(--text-tertiary)' }}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: '88px 40px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{
            fontSize: 34,
            fontWeight: 700,
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}>
            Everything a basic converter is{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>missing</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Go beyond raw CSV exports. Get intelligence, automation, and professional reports.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {features.map((feature) => (
            <div key={feature.title} className="card" style={{
              padding: 28,
              transition: 'all var(--transition)',
              cursor: 'default',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        background: 'var(--bg-elevated)',
        padding: '88px 40px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Trusted by professionals
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: 20,
                  flex: 1,
                }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary), #3730A3)',
        padding: '72px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 300,
          height: 300,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <h2 style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'white',
          marginBottom: 14,
          letterSpacing: '-0.02em',
          position: 'relative',
        }}>
          Start converting in 60 seconds
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 16,
          marginBottom: 28,
          position: 'relative',
        }}>
          No credit card required. Free plan available.
        </p>
        <Link href="/signup" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '13px 32px',
          background: 'white',
          color: 'var(--primary)',
          borderRadius: 'var(--radius)',
          fontWeight: 700,
          fontSize: 15,
          transition: 'all var(--transition)',
          position: 'relative',
        }}>
          Start Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>
      </section>

      <Footer />
    </>
  )
}
