'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = {
  sections: [
    { id: '1', title: 'Développement durable', objective: 'Réduire l’empreinte carbone', measures: [{ description: 'Planter 1 million d’arbres' }] },
  ],
};

export default function ProgramPage() {
  const { data, loading } = useApiWithFallback('/api/program', FALLBACK);
  if (loading) return <div>Chargement du programme...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Programme</h1>
      {data.sections.map((section) => (
        <div key={section.id} className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <p>{section.objective}</p>
          <ul className="list-disc pl-5 mt-2">
            {section.measures.map((m, i) => <li key={i}>{m.description}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
