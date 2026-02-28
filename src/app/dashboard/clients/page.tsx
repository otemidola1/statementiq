'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Client {
    id: string
    name: string
    email: string
    company: string
    upload_token: string
    notes: string
    created_at: string
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [newClient, setNewClient] = useState({ name: '', email: '', company: '' })
    const supabase = createClient()

    useEffect(() => { loadClients() }, [])

    const loadClients = async () => {
        const { data } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })
        setClients(data || [])
        setLoading(false)
    }

    const addClient = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('clients').insert({
            accountant_user_id: user.id,
            name: newClient.name,
            email: newClient.email,
            company: newClient.company,
        })
        setNewClient({ name: '', email: '', company: '' })
        setShowModal(false)
        loadClients()
    }

    const copyUploadLink = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/upload/${token}`)
    }

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>My Clients</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        Manage your clients and their statement uploads
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Client
                </button>
            </div>

            {/* Client table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No clients yet</p>
                        <p style={{ fontSize: 13, marginBottom: 20, color: 'var(--text-secondary)' }}>Add your first client to start managing their statements</p>
                        <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>Add New Client</button>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Company</th>
                                <th>Email</th>
                                <th>Created</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}>
                                                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{client.name}</span>
                                        </div>
                                    </td>
                                    <td>{client.company || '—'}</td>
                                    <td>{client.email || '—'}</td>
                                    <td>{new Date(client.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn-ghost btn-sm"
                                            onClick={() => copyUploadLink(client.upload_token)}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                            Copy Link
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Client Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Add New Client</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-tertiary)' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="input-label">Client Name *</label>
                                <input className="input" placeholder="John Doe" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="input-label">Email</label>
                                <input className="input" type="email" placeholder="client@example.com" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div>
                                <label className="input-label">Company</label>
                                <input className="input" placeholder="Company name" value={newClient.company} onChange={e => setNewClient(p => ({ ...p, company: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={addClient} disabled={!newClient.name}>Add Client</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
