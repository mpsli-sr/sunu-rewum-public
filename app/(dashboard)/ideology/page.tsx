'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = { title: 'L’idéologie de Sunu Rewum', content: 'Nous croyons en une société juste, durable et participative. L’engagement citoyen est au cœur de notre démarche.' };

export default function IdeologyPage() {
  const { data, loading } = useApiWithFallback('/api/ideology', FALLBACK);
  if (loading) return <div>Chargement...</div>;
  return <div className="max-w-3xl mx-auto"><h1 className="text-2xl font-bold mb-4">🧠 {data.title}</h1><div className="bg-white p-6 rounded shadow">{data.content}</div></div>;
}
