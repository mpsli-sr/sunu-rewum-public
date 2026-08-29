import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 – Page introuvable</h1>
      <p className="mt-4">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/" className="mt-6 underline text-brand-green">
        Retour à l'accueil
      </Link>
    </main>
  );
}
