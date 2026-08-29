'use client';
import { useApiWithFallback } from '@/hooks/useApiWithFallback';

const FALLBACK = [
  { id: '1', title: 'Photo de la conférence', url: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Atelier participatif', url: 'https://via.placeholder.com/150' },
];

export default function GalleryPage() {
  const { data, loading } = useApiWithFallback('/api/gallery', FALLBACK);
  if (loading) return <div>Chargement de la galerie...</div>;
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🖼️ Galerie</h1>
      <div className="grid grid-cols-2 gap-4">
        {data.map((img) => <div key={img.id} className="bg-white p-2 rounded shadow"><img src={img.url} alt={img.title} className="w-full h-32 object-cover" /><p className="text-center mt-2">{img.title}</p></div>)}
      </div>
    </div>
  );
}
