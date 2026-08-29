"use client";
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-brand-green mb-4">
          Inscriptions fermées
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          L'inscription publique est actuellement désactivée. Veuillez contacter
          l'administration.
        </p>
      </div>
    </div>
  );
}
