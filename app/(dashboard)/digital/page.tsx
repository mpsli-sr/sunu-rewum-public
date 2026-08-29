'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = { title: 'Notre vision du numérique', content: 'Le numérique est un levier de développement pour le Sénégal. Nous souhaitons connecter toutes les zones rurales et former les jeunes aux métiers du digital.' };

export default function DigitalPage() {
  const { data, loading } = useApiWithFallback('/api/digital', FALLBACK);
  if (loading) return <div>Chargement...</div>;
  return <div className="max-w-3xl mx-auto"><h1 className="text-2xl font-bold mb-4">💻 {data.title}</h1><div className="bg-white p-6 rounded shadow">{data.content}</div></div>;
}
