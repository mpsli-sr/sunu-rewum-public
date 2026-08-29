#!/usr/bin/env bash
cd ~/sunu-rewum

echo "💾 Sauvegarde Git..."
git add -A && git commit -m "Correctifs : charte toutes langues, sponsorships.map" 2>/dev/null || echo "Rien à commit"

# ============================================================
# 1. Page Charte : afficher toutes les versions (sans menu déroulant)
# ============================================================
cat > "client/app/(dashboard)/charter/page.tsx" << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import EditableBlockRenderer from '@/components/EditableBlockRenderer';

const languages = [
  { slug: 'charter-wol', title: 'Wolof – Mbïr SUNU REWUM' },
  { slug: 'charter-sereer', title: 'Sérère – Charte SUNU REWUM' },
  { slug: 'charter-peuhl', title: 'Peul – Charte SUNU REWUM' },
  { slug: 'charter-diola', title: 'Diola – Charte SUNU REWUM' },
  { slug: 'charter-toucouleur', title: 'Toucouleur – Charte SUNU REWUM' },
  { slug: 'charter-manding', title: 'Manding – Charte SUNU REWUM' },
  { slug: 'charter', title: 'Français – Charte du mouvement' },
];

export default function CharterPage() {
  const [user, setUser] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [form, setForm] = useState({
    cni: '', region: '', departement: '', commune: '', adresse: '', telephone: '', carteElecteur: ''
  });
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'init' | 'verify'>('init');
  const [message, setMessage] = useState('');
  const [signatures, setSignatures] = useState(0);
  const [signing, setSigning] = useState(false);

  // Charger toutes les versions de la charte
  const loadVersions = async () => {
    const promises = languages.map(lang =>
      fetch(`http://localhost:3001/api/ideology/${lang.slug}`)
        .then(r => r.ok ? r.json() : { title: lang.title, content: '<p>Contenu indisponible</p>' })
        .catch(() => ({ title: lang.title, content: '<p>Contenu indisponible</p>' }))
    );
    const data = await Promise.all(promises);
    setVersions(data);
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/me', { credentials: 'include' }).then(r => r.json()).then(u => {
      setUser(u);
      setForm(f => ({
        ...f,
        region: u.region || '',
        telephone: u.phone || '',
        cni: u.cni || '',
        departement: u.departement || '',
        commune: u.commune || '',
        adresse: u.adresse || '',
        carteElecteur: u.carteElecteur || '',
      }));
    });
    fetch('http://localhost:3001/api/charter-signatures/count').then(r => r.json()).then(d => setSignatures(d.count || 0));
    loadVersions();
  }, []);

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'COORDINATOR');

  const startEdit = (slug: string, content: string) => {
    setEditingSlug(slug);
    setEditContent(content);
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!editingSlug) return;
    await fetch(`http://localhost:3001/api/ideology/${editingSlug}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: languages.find(l => l.slug === editingSlug)?.title || 'Charte', content: editContent }),
    });
    setEditMode(false);
    setEditingSlug(null);
    loadVersions();
  };

  const initSignature = async () => {
    if (!form.cni.match(/^[A-Z]\d{8}$/)) { setMessage('CNI invalide (ex: A12345678)'); return; }
    if (!form.region) { setMessage('Région obligatoire'); return; }
    if (!form.telephone) { setMessage('Téléphone obligatoire'); return; }
    setSigning(true);
    const res = await fetch('http://localhost:3001/api/charter-signatures/init', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Code envoyé (console). Entrez le code.');
      setStep('verify');
    } else setMessage(data.message);
    setSigning(false);
  };

  const verifySignature = async () => {
    if (!code) return;
    setSigning(true);
    const res = await fetch('http://localhost:3001/api/charter-signatures/verify', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (res.ok) { setMessage('✅ Signé !'); setStep('init'); setCode(''); setSignatures(s => s + 1); }
    else setMessage(data.message);
    setSigning(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📜 Charte du mouvement</h1>

      {/* Toutes les versions linguistiques */}
      {versions.map((v, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{languages[i]?.title || 'Version'}</h2>
            {isAdmin && (
              <button
                onClick={() => startEdit(languages[i].slug, v.content)}
                className="text-blue-500 text-sm"
              >
                Modifier
              </button>
            )}
          </div>
          {editMode && editingSlug === languages[i].slug ? (
            <div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full p-2 border rounded min-h-[200px] dark:bg-gray-700 dark:text-white"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded">Enregistrer</button>
                <button onClick={() => setEditMode(false)} className="bg-gray-500 text-white px-3 py-1 rounded">Annuler</button>
              </div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: v.content }} />
          )}
        </div>
      ))}

      {/* Formulaire de signature */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">✍️ Signer la charte ({signatures} signatures)</h2>
        {user && <p className="mb-2">Connecté en tant que <strong>{user.firstName} {user.lastName}</strong></p>}
        {step === 'init' ? (
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="CNI (ex: A12345678)" required pattern="[A-Z]\d{8}" value={form.cni} onChange={e => setForm({...form, cni: e.target.value.toUpperCase()})} className="p-2 border rounded" />
            <input placeholder="Région" required value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="p-2 border rounded" />
            <input placeholder="Département" value={form.departement} onChange={e => setForm({...form, departement: e.target.value})} className="p-2 border rounded" />
            <input placeholder="Commune" value={form.commune} onChange={e => setForm({...form, commune: e.target.value})} className="p-2 border rounded" />
            <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} className="p-2 border rounded col-span-2" />
            <input placeholder="Téléphone" required type="tel" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="p-2 border rounded" />
            <input placeholder="Carte électeur" value={form.carteElecteur} onChange={e => setForm({...form, carteElecteur: e.target.value})} className="p-2 border rounded" />
            <button onClick={initSignature} disabled={signing} className="col-span-2 bg-brand-green text-white py-2 rounded">Signer</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input placeholder="Code reçu" value={code} onChange={e => setCode(e.target.value)} className="flex-1 p-2 border rounded" />
            <button onClick={verifySignature} disabled={signing} className="bg-green-600 text-white px-4 py-2 rounded">Vérifier</button>
            <button onClick={() => { setStep('init'); setMessage(''); }} className="bg-gray-500 text-white px-4 py-2 rounded">Annuler</button>
          </div>
        )}
        {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
      </div>
      <EditableBlockRenderer page="charter" />
    </div>
  );
}
EOF

# ============================================================
# 2. Correction de la page Digital (sponsorships.map)
# ============================================================
cat > "client/app/(dashboard)/digital/page.tsx" << 'EOF'
'use client';
import { useEffect, useState } from 'react';

export default function DigitalSovereigntyPage() {
  const [user, setUser] = useState<any>(null);
  const [regionalStats, setRegionalStats] = useState<any[]>([]);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [cni, setCni] = useState('');
  const [region, setRegion] = useState('Dakar');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'init' | 'verify'>('init');
  const [sponsorshipId, setSponsorshipId] = useState('');

  const regions = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Diourbel', 'Fatick', 'Louga', 'Tambacounda', 'Kolda', 'Matam', 'Sédhiou', 'Kaffrine', 'Kédougou'];

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/me', { credentials: 'include' }).then(r => r.json()).then(setUser);
    fetch('http://localhost:3001/api/regional-stats').then(r => r.json()).then(data => setRegionalStats(Array.isArray(data) ? data : []));
    // Charger les parrainages vérifiés
    fetch('http://localhost:3001/api/admin-sponsorship?status=verified')
      .then(r => r.json())
      .then(data => setSponsorships(Array.isArray(data) ? data : []))
      .catch(() => setSponsorships([]));
  }, []);

  const initSponsorship = async () => {
    if (!cni.match(/^[A-Z]\d{8}$/)) { setMessage('Format CNI invalide (ex: A12345678)'); return; }
    if (!region) { setMessage('Région obligatoire'); return; }
    const res = await fetch('http://localhost:3001/api/sponsorship/init', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cniNumber: cni, region })
    });
    const data = await res.json();
    if (res.ok) {
      setSponsorshipId(data.sponsorshipId);
      setMessage('Code envoyé (console). Entrez le code');
      setStep('verify');
    } else setMessage(data.message);
  };

  const verifySponsorship = async () => {
    if (!code.match(/^\d{6}$/)) { setMessage('Code à 6 chiffres'); return; }
    const res = await fetch('http://localhost:3001/api/sponsorship/verify', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sponsorshipId, code })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('✅ Parrainage vérifié !');
      setCni(''); setCode(''); setStep('init');
      fetch('http://localhost:3001/api/regional-stats').then(r => r.json()).then(data => setRegionalStats(Array.isArray(data) ? data : []));
      fetch('http://localhost:3001/api/admin-sponsorship?status=verified')
        .then(r => r.json())
        .then(data => setSponsorships(Array.isArray(data) ? data : []));
    } else setMessage(data.message);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💻 Souveraineté numérique</h1>
      <p className="text-gray-500 mb-8">Parrainez le mouvement avec votre CNI, suivez la couverture régionale.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">✍️ Parrainer le parti</h2>
          {step === 'init' ? (
            <div className="space-y-3">
              <input
                value={cni}
                onChange={e => setCni(e.target.value.toUpperCase())}
                placeholder="Numéro CNI (ex: A12345678)"
                required
                pattern="[A-Z]\d{8}"
                title="Format: A12345678"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <select value={region} onChange={e => setRegion(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
                <option value="">-- Choisir une région --</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={initSponsorship} className="bg-brand-green text-white px-6 py-2 rounded hover:bg-green-700">Envoyer le code SMS</button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">Un code à 6 chiffres a été envoyé (console serveur).</p>
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code reçu" pattern="\d{6}" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <div className="flex gap-2">
                <button onClick={verifySponsorship} className="bg-green-600 text-white px-4 py-2 rounded">Vérifier</button>
                <button onClick={() => setStep('init')} className="bg-gray-500 text-white px-4 py-2 rounded">Annuler</button>
              </div>
            </div>
          )}
          {message && <p className="mt-3 text-sm text-blue-600">{message}</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">📇 Mon statut</h2>
          {user ? (
            <p>✅ {user.firstName} {user.lastName}, vous avez parrainé le mouvement</p>
          ) : <p>Connectez-vous pour voir votre statut.</p>}
        </div>
      </div>

      {/* Carte régionale */}
      <h2 className="text-2xl font-bold mb-4">🗺️ Couverture régionale</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {regionalStats.map((r: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
            <p className="font-bold text-brand-green">{r.region}</p>
            <p className="text-sm text-gray-500">{r.members} membres</p>
          </div>
        ))}
      </div>

      {/* Liste des derniers parrainages validés */}
      <h2 className="text-2xl font-bold mb-4">📋 Derniers parrainages validés</h2>
      <div className="space-y-2">
        {sponsorships.length > 0 ? (
          sponsorships.map((s: any) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{s.user?.firstName} {s.user?.lastName}</p>
                <p className="text-xs text-gray-500">{s.region} • CNI: {s.cniNumber}</p>
              </div>
              <span className="text-green-600">✅</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun parrainage validé pour le moment.</p>
        )}
      </div>
    </div>
  );
}
EOF

echo "✅ Corrections appliquées."
echo "🔁 Redémarrez le frontend : cd ~/sunu-rewum/client && npm run dev"
