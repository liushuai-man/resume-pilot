import { useEffect, useState } from 'react';
import { profileApi, type ProfileOverview } from '@/api/profile.api';
export function useProfileOverview() { const [data, setData] = useState<ProfileOverview | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); useEffect(() => { profileApi.getOverview().then(setData).catch(() => setError(true)).finally(() => setLoading(false)); }, []); return { data, loading, error }; }
