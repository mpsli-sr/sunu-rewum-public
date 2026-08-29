'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = [
  { id: '1', content: 'Bienvenue sur Sunu Rewum ! Découvrez notre nouvelle plateforme participative.', createdAt: new Date().toISOString() },
  { id: '2', content: 'Nous lançons un appel à projets pour le développement durable.', createdAt: new Date().toISOString() },
  { id: '3', content: 'Rejoignez notre communauté et faites entendre votre voix.', createdAt: new Date().toISOString() },
];

export default function FeedPage() {
  const { data, loading } = useApiWithFallback('/api/posts', FALLBACK);
  if (loading) return <div>Chargement des actualités...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📰 Actualités</h1>
      <ul className="space-y-4">
        {data.map((post) => (
          <li key={post.id} className="bg-white p-4 rounded shadow">
            <p>{post.content}</p>
            <small className="text-gray-500">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
