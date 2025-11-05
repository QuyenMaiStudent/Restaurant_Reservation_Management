import React, { useEffect, useMemo, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';

type Reservation = {
    id: number;
    customer_name: string;
    phone: string;
    party_size: number;
    reserved_at: string;
    status: string;
    created_at?: string;
    updated_at?: string;
};

type Props = {
    reservations: Reservation[];
};

export default function Index({ reservations }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flashSuccess = props?.flash?.success as string | undefined;

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated' | 'canceled'>('all');
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return reservations.filter((r) => {
            if (statusFilter !== 'all' && r.status !== statusFilter) return false;
            if (!q) return true;
            return (
                r.customer_name.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q)
            );
        }).sort((a, b) => new Date(a.reserved_at).getTime() - new Date(b.reserved_at).getTime());
    }, [reservations, query, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageList = filtered.slice((page - 1) * pageSize, page * pageSize);

    const gotoPage = (p: number) => {
        setPage(Math.min(Math.max(1, p), totalPages));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this reservation?')) return;
        router.delete(`/reservations/${id}`);
    };

    const formatDateTime = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString();
    };

    return (
        <div style={{ padding: 20, maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h1 style={{ margin: 0 }}>Reservations</h1>
                <Link href="/reservations/create" className="btn" style={{
                    background: '#2563eb', color: 'white', padding: '8px 12px', borderRadius: 6, textDecoration: 'none'
                }}>
                    New
                </Link>
            </div>

            {flashSuccess && (
                <div style={{ marginBottom: 12, padding: 10, background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: 6 }}>
                    {flashSuccess}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                <input
                    placeholder="Search by name or phone..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
                >
                    <option value="all">All statuses</option>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="seated">seated</option>
                    <option value="canceled">canceled</option>
                </select>
            </div>

            <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb' }}>
                            <th style={{ textAlign: 'left', padding: 12 }}>Name</th>
                            <th style={{ textAlign: 'left', padding: 12 }}>Phone</th>
                            <th style={{ textAlign: 'center', padding: 12, width: 110 }}>Party</th>
                            <th style={{ textAlign: 'left', padding: 12 }}>When</th>
                            <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                            <th style={{ textAlign: 'right', padding: 12, width: 150 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageList.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: 18, textAlign: 'center', color: '#666' }}>
                                    No reservations found.
                                </td>
                            </tr>
                        ) : pageList.map((r) => (
                            <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: 12 }}>{r.customer_name}</td>
                                <td style={{ padding: 12 }}>{r.phone}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{r.party_size}</td>
                                <td style={{ padding: 12 }}>{formatDateTime(r.reserved_at)}</td>
                                <td style={{ padding: 12 }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        background: r.status === 'pending' ? '#fef3c7' : r.status === 'confirmed' ? '#d1fae5' : r.status === 'seated' ? '#e0f2fe' : '#fee2e2',
                                        color: '#111',
                                        fontSize: 13
                                    }}>{r.status}</span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'right' }}>
                                    <Link href={`/reservations/${r.id}/edit`} style={{ marginRight: 8, color: '#2563eb' }}>Edit</Link>
                                    <button onClick={() => handleDelete(r.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div style={{ color: '#666' }}>
                    Showing {(filtered.length === 0) ? 0 : ((page - 1) * pageSize + 1)} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => gotoPage(page - 1)} disabled={page <= 1} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: 'white' }}>
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                onClick={() => gotoPage(p)}
                                style={{
                                    padding: '6px 10px',
                                    borderRadius: 6,
                                    border: p === page ? '1px solid #2563eb' : '1px solid #eee',
                                    background: p === page ? '#eef2ff' : 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button onClick={() => gotoPage(page + 1)} disabled={page >= totalPages} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: 'white' }}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}