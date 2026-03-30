'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import {
    IconHome, IconUpload, IconFileText,
    IconUsers, IconSettings, IconLogOut, IconBarChart
} from '@/components/Icons'
import { ThemeToggle } from '@/components/ThemeToggle'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: IconHome },
    { href: '/dashboard/upload', label: 'Upload', icon: IconUpload },
    { href: '/dashboard/reports', label: 'Reports', icon: IconFileText },
    { href: '/dashboard/clients', label: 'Clients', icon: IconUsers },
    { href: '/dashboard/settings', label: 'Settings', icon: IconSettings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<{ email?: string; name?: string; plan?: string } | null>(null)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('name, plan')
                    .eq('id', authUser.id)
                    .single()
                setUser({
                    email: authUser.email,
                    name: profile?.name || authUser.email?.split('@')[0],
                    plan: profile?.plan || 'free',
                })
            }
        }
        getUser()
    }, [supabase])

    useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {mobileNavOpen && (
                <button
                    className="dashboard-overlay"
                    aria-label="Close navigation menu"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${mobileNavOpen ? 'dashboard-sidebar-open' : ''}`} style={{
                width: 248,
                background: 'var(--card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 12px',
                position: 'fixed',
                top: 0,
                bottom: 0,
                zIndex: 150,
            }}>
                {/* Logo */}
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '4px 12px',
                    marginBottom: 28,
                    textDecoration: 'none',
                }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <IconBarChart size={18} color="white" />
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

                {/* Navigation label */}
                <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0 12px',
                    marginBottom: 8,
                }}>
                    Menu
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 450,
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--primary-light)' : 'transparent',
                                    transition: 'all var(--transition)',
                                    letterSpacing: '-0.005em',
                                }}
                            >
                                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-tertiary)'} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User section */}
                <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 14,
                    marginTop: 12,
                }}>
                    <Link href="/dashboard/account" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 8,
                        transition: 'background var(--transition)',
                        textDecoration: 'none',
                    }}>
                        <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {user?.name || 'Loading...'}
                            </div>
                            <div style={{
                                fontSize: 11,
                                color: 'var(--text-tertiary)',
                                textTransform: 'capitalize',
                            }}>
                                {user?.plan || 'free'} plan
                            </div>
                        </div>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flexShrink: 0 }}>
                            <ThemeToggle />
                        </div>
                        <button
                            onClick={handleSignOut}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 13,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                            }}
                        >
                            <IconLogOut size={14} />
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="dashboard-main" style={{
                flex: 1,
                marginLeft: 248,
                padding: '28px 36px',
                minHeight: '100vh',
            }}>
                <div className="dashboard-mobile-topbar">
                    <button
                        type="button"
                        className="dashboard-mobile-menu-btn"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileNavOpen}
                        onClick={() => setMobileNavOpen((prev) => !prev)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <p className="dashboard-mobile-title">StatementIQ</p>
                    <ThemeToggle />
                </div>
                {children}
            </main>
        </div>
    )
}
