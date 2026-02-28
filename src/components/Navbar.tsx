import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {
    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            padding: '0 40px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            <Link href="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                </div>
                <span style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                }}>
                    Statement<span style={{ color: 'var(--primary)' }}>IQ</span>
                </span>
            </Link>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-secondary)',
            }}>
                <Link href="/#features" style={{ transition: 'color var(--transition)' }}>Features</Link>
                <Link href="/pricing" style={{ transition: 'color var(--transition)' }}>Pricing</Link>
                <Link href="/accountants-portal" style={{ transition: 'color var(--transition)' }}>For Accountants</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ThemeToggle />
                <Link href="/login" className="btn-ghost" style={{ padding: '7px 16px' }}>
                    Log In
                </Link>
                <Link href="/signup" className="btn-primary" style={{ padding: '7px 20px' }}>
                    Start Free
                </Link>
            </div>
        </nav>
    )
}
