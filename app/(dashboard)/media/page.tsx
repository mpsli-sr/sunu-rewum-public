'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = [
  { id: '1', title: 'Conférence sur le numérique', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
];

export default function MediaPage() {
  const { data, loading } = useApiWithFallback('/api/media', FALLBACK);
  if (loading) return <div>Chargement des médias...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎬 Médias</h1>
      {data.map((item) => <div key={item.id} className="bg-white p-4 rounded shadow mb-4"><h3>{item.title}</h3><p>Type: {item.type}</p></div>)}
    </div>
  );
}
