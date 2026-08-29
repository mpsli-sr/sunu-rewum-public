'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = { title: 'La parité chez Sunu Rewum', content: 'Nous promouvons l’égalité femmes-hommes dans toutes nos instances de décision. Notre objectif est d’atteindre 50% de femmes dans les postes à responsabilité.' };

export default function ParityPage() {
  const { data, loading } = useApiWithFallback('/api/parity', FALLBACK);
  if (loading) return <div>Chargement...</div>;
  return <div className="max-w-3xl mx-auto"><h1 className="text-2xl font-bold mb-4">⚖️ {data.title}</h1><div className="bg-white p-6 rounded shadow">{data.content}</div></div>;
}
