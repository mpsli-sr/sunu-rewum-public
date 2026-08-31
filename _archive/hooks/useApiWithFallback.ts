import { useState, useEffect } from 'react';

export function useApiWithFallback<T>(url: string, fallbackData: T) {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Erreur HTTP');
        const json = await res.json();
        if (Array.isArray(json) ? json.length > 0 : json) {
          setData(json);
        }
      } catch (error) {
        console.error(`Erreur sur ${url}, fallback activé.`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading };
}
