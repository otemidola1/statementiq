 'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 900) {
                setMenuOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const closeMenu = () => setMenuOpen(false)

    return (
        <nav className={`landing-nav${menuOpen ? ' landing-nav-open' : ''}`} style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            minHeight: 60,
            alignItems: 'center',
        }}>
            <Link href="/" onClick={closeMenu} className="landing-nav-brand" style={{
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

            <button
                type="button"
                className="landing-nav-toggle"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
            >
                {menuOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                )}
            </button>

            <div className="landing-nav-links" style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-secondary)',
            }}>
                <Link href="/#features" onClick={closeMenu} style={{ transition: 'color var(--transition)' }}>Features</Link>
                <Link href="/pricing" onClick={closeMenu} style={{ transition: 'color var(--transition)' }}>Pricing</Link>
                <Link href="/accountants-portal" onClick={closeMenu} style={{ transition: 'color var(--transition)' }}>For Accountants</Link>
            </div>

            <div className="landing-nav-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <ThemeToggle />
                <Link href="/login" onClick={closeMenu} className="btn-ghost" style={{ padding: '7px 16px' }}>
                    Log In
                </Link>
                <Link href="/signup" onClick={closeMenu} className="btn-primary" style={{ padding: '7px 20px' }}>
                    Start Free
                </Link>
            </div>
        </nav>
    )
}
