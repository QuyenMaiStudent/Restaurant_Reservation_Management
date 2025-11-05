import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';

type Reservation = {
    id?: number;
    customer_name?: string;
    phone?: string;
    party_size?: number;
    reserved_at?: string;
    status?: string;
};

type Props = {
    reservation?: Reservation;
};

function toInputDateTime(iso?: string) {
    if (!iso) return '';
    const s = iso.trim();

    // Nếu có timezone rõ ràng (Z hoặc +HH:MM / -HH:MM) => parse và chuyển sang giờ local
    if (/[zZ]$|[+\-]\d{2}:?\d{2}$/.test(s)) {
        const d = new Date(s);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // Không có timezone => coi như local. Hỗ trợ "YYYY-MM-DD HH:MM:SS" hoặc "YYYY-MM-DDTHH:MM"
    const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:[T ]?(\d{2}):(\d{2})(?::\d{2})?)?$/);
    if (!m) return '';
    const date = m[1];
    const hh = m[2] ?? '00';
    const mm = m[3] ?? '00';
    return `${date}T${hh}:${mm}`;
}

export default function Form({ reservation }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flashSuccess = props?.flash?.success as string | undefined;
    const isEdit = !!reservation?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        customer_name: reservation?.customer_name ?? '',
        phone: reservation?.phone ?? '',
        party_size: reservation?.party_size ?? 1,
        reserved_at: reservation?.reserved_at ? toInputDateTime(reservation.reserved_at) : '',
        status: reservation?.status ?? 'pending',
    });

    // if reservation prop changes (shouldn't normally), update form
    useEffect(() => {
        setData({
            customer_name: reservation?.customer_name ?? '',
            phone: reservation?.phone ?? '',
            party_size: reservation?.party_size ?? 1,
            reserved_at: reservation?.reserved_at ? toInputDateTime(reservation.reserved_at) : '',
            status: reservation?.status ?? 'pending',
        });
    }, [reservation]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Keep local datetime value (datetime-local is local) to match server "after_or_equal:now"
        // datetime-local format: "YYYY-MM-DDTHH:MM" => convert to "YYYY-MM-DD HH:MM:00"
        const payload = {
            customer_name: String(data.customer_name ?? ''),
            phone: String(data.phone ?? ''),
            party_size: Number(data.party_size ?? 1),
            reserved_at: data.reserved_at ? data.reserved_at.replace('T', ' ') + ':00' : data.reserved_at,
            status: String(data.status ?? 'pending'),
        };

        // update form state first, then submit using useForm APIs (post/put accept options, not data)
        setData(payload);

        if (isEdit) {
            put(`/reservations/${reservation!.id}`);
        } else {
            post('/reservations');
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h1 style={{ margin: 0 }}>{isEdit ? 'Edit Reservation' : 'Create Reservation'}</h1>
                <Link href="/reservations" style={{ textDecoration: 'none', color: '#2563eb' }}>Back to list</Link>
            </div>

            {flashSuccess && (
                <div style={{ marginBottom: 12, padding: 10, background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: 6 }}>
                    {flashSuccess}
                </div>
            )}

            <form onSubmit={submit} style={{ background: 'white', padding: 18, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
                    <input
                        type="text"
                        value={data.customer_name}
                        onChange={(e) => setData('customer_name', e.target.value)}
                        maxLength={100}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                    />
                    {errors.customer_name && <div style={{ color: 'red', marginTop: 6 }}>{errors.customer_name}</div>}
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Phone</label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                        pattern="^\+?\d{8,15}$"
                        title="Enter 8–15 digits, optional leading +"
                    />
                    {errors.phone && <div style={{ color: 'red', marginTop: 6 }}>{errors.phone}</div>}
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 6 }}>Party size</label>
                        <input
                            type="number"
                            value={String(data.party_size ?? '')}
                            onChange={(e) => {
                                const v = e.target.value; // string
                                setData('party_size', v === '' ? 0 : parseInt(v, 10));
                            }}
                            min={1}
                            max={50}
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                        />
                        {errors.party_size && <div style={{ color: 'red', marginTop: 6 }}>{errors.party_size}</div>}
                    </div>

                    <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', marginBottom: 6 }}>Reserved at</label>
                        <input
                            type="datetime-local"
                            value={data.reserved_at}
                            onChange={(e) => setData('reserved_at', e.target.value)}
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                        />
                        {errors.reserved_at && <div style={{ color: 'red', marginTop: 6 }}>{errors.reserved_at}</div>}
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Status</label>
                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} style={{ width: 200, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="seated">seated</option>
                        <option value="canceled">canceled</option>
                    </select>
                    {errors.status && <div style={{ color: 'red', marginTop: 6 }}>{errors.status}</div>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={processing} style={{ background: '#2563eb', color: 'white', padding: '8px 14px', borderRadius: 6, border: 'none' }}>
                        {processing ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                    </button>
                    <Link href="/reservations" style={{ padding: '8px 14px', borderRadius: 6, textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}