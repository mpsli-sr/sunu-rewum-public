'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = [
  { id: '1', title: 'Développeur Full Stack', description: 'Nous recherchons un développeur expérimenté.', department: 'IT', location: 'Dakar' },
  { id: '2', title: 'Chargé de communication', description: 'Gérer les relations presse et les réseaux sociaux.', department: 'Communication', location: 'Dakar' },
];

export default function JobsPage() {
  const { data, loading } = useApiWithFallback('/api/jobs', FALLBACK);
  if (loading) return <div>Chargement des offres...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧑‍💼 Recrutement</h1>
      {data.map((job) => (
        <div key={job.id} className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p>{job.description}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-600"><span>{job.department}</span><span>{job.location}</span></div>
        </div>
      ))}
    </div>
  );
}
