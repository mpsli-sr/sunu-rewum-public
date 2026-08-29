'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = [
  { id: '1', title: 'Améliorer la connectivité internet', description: 'Étendre la fibre optique dans les zones rurales.', theme: 'Numérique' },
  { id: '2', title: 'Soutien aux start-ups locales', description: 'Créer un fonds d’aide pour les jeunes entrepreneurs.', theme: 'Économie' },
];

export default function ProposalsPage() {
  const { data, loading } = useApiWithFallback('/api/proposals', FALLBACK);
  if (loading) return <div>Chargement des propositions...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💡 Propositions</h1>
      <ul className="space-y-4">
        {data.map((prop) => (
          <li key={prop.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{prop.title}</h2>
            <p>{prop.description}</p>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">{prop.theme}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
