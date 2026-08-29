'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = [
  { id: '1', name: 'Or', description: 'Badge d’or – plus de 1000 points', icon: '🥇' },
  { id: '2', name: 'Argent', description: 'Badge d’argent – plus de 500 points', icon: '🥈' },
  { id: '3', name: 'Bronze', description: 'Badge de bronze – plus de 100 points', icon: '🥉' },
];

export default function BadgesPage() {
  const { data, loading } = useApiWithFallback('/api/badges', FALLBACK);
  if (loading) return <div>Chargement des badges...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎖️ Badges</h1>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((badge) => (
          <li key={badge.id} className="bg-white p-4 rounded shadow text-center">
            <div className="text-4xl mb-2">{badge.icon}</div>
            <h2 className="text-xl font-semibold">{badge.name}</h2>
            <p className="text-gray-600 text-sm">{badge.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
