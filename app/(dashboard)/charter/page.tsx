'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = {
  title: 'Charte de Sunu Rewum',
  content: 'Nous nous engageons à respecter les valeurs de transparence, d’intégrité et de participation citoyenne. Cette charte définit les principes fondamentaux de notre communauté.',
};

export default function CharterPage() {
  const { data, loading } = useApiWithFallback('/api/charter', FALLBACK);
  if (loading) return <div>Chargement de la charte...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📜 {data.title}</h1>
      <div className="bg-white p-6 rounded shadow whitespace-pre-wrap">{data.content}</div>
    </div>
  );
}
