'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'categories'>('general')
    const [profile, setProfile] = useState({ name: '', email: '' })
    const [saving, setSaving] = useState(false)
    const [newCategory, setNewCategory] = useState('')
    const [customCategories, setCustomCategories] = useState<string[]>([])
    const supabase = createClient()

    useEffect(() => { loadProfile() }, [])

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('profiles').select('name, email').eq('id', user.id).single()
            if (data) setProfile(data)
        }
    }

    const saveProfile = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({ name: profile.name }).eq('id', user.id)
        }
        setSaving(false)
    }

    const addCategory = () => {
        if (newCategory && !customCategories.includes(newCategory)) {
            setCustomCategories([...customCategories, newCategory])
            setNewCategory('')
        }
    }

    const tabs = [
        {
            id: 'general' as const,
            label: 'General',
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
        },
        {
            id: 'integrations' as const,
            label: 'Integrations',
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><circle cx="8" cy="6" r="1" fill="currentColor" /><circle cx="8" cy="18" r="1" fill="currentColor" /></svg>,
        },
        {
            id: 'categories' as const,
            label: 'Categories',
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
        },
    ]

    const integrations = [
        {
            name: 'QuickBooks Online',
            desc: 'Push categorized transactions directly to QuickBooks',
            connected: false,
            color: '#2CA01C',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CA01C" strokeWidth="1.75"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></svg>,
        },
        {
            name: 'Xero',
            desc: 'Sync your analyzed statements with Xero',
            connected: false,
            color: '#13B5EA',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#13B5EA" strokeWidth="1.75"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
        },
        {
            name: 'Google Sheets',
            desc: 'Export transactions to Google Sheets automatically',
            connected: false,
            color: '#34A853',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="1.75"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></svg>,
        },
    ]

    return (
        <div className="animate-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your account and preferences</p>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 24 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* General */}
            {activeTab === 'general' && (
                <div className="card" style={{ padding: 24, maxWidth: 520 }}>
                    <div style={{ marginBottom: 18 }}>
                        <label className="input-label">Full Name</label>
                        <input className="input" value={profile.name || ''} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label className="input-label">Email</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input className="input" value={profile.email || ''} disabled style={{ opacity: 0.6 }} />
                            <span className="badge badge-success">Verified</span>
                        </div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label className="input-label">Timezone</label>
                        <select className="input" defaultValue="auto">
                            <option value="auto">Auto-detect</option>
                            <option value="UTC">UTC</option>
                            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>
                    <button className="btn-primary" onClick={saveProfile} disabled={saving}>
                        {saving ? (
                            <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving...</>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {integrations.map(int => (
                        <div key={int.name} className="card" style={{
                            padding: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                        }}>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                background: `${int.color}10`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {int.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{int.name}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{int.desc}</p>
                            </div>
                            {int.connected ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className="badge badge-success">Connected</span>
                                    <button className="btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Disconnect</button>
                                </div>
                            ) : (
                                <button className="btn-secondary btn-sm">Connect</button>
                            )}
                        </div>
                    ))}
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        Integration connections will be available once API keys are configured.
                    </p>
                </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="card" style={{ padding: 22 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Custom Categories</h3>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            <input className="input" placeholder="New category name" value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ flex: 1 }} />
                            <button className="btn-primary" onClick={addCategory}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add
                            </button>
                        </div>
                        {customCategories.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No custom categories added yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {customCategories.map(cat => (
                                    <span key={cat} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {cat}
                                        <button onClick={() => setCustomCategories(cs => cs.filter(c => c !== cat))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'inherit', padding: 0, lineHeight: 1 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: 22 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Default Categories</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Built-in categories used for auto-categorization</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {['Groceries', 'Dining', 'Shopping', 'Transportation', 'Fuel', 'Subscriptions', 'Entertainment', 'Healthcare', 'Education', 'Rent & Mortgage', 'Utilities', 'Insurance', 'Travel', 'Income', 'Transfers', 'Cash', 'Bank Fees', 'Checks', 'Investments', 'Other'].map(cat => (
                                <span key={cat} className="badge badge-gray">{cat}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
