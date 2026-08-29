'use client';
import { useEffect, useState } from 'react';

const resources = [
  { key: 'payments', label: '💳 Paiement' },
];

export default function AdminPage() {
  const [active, setActive] = useState('payments');
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});

  useEffect(() => {
    fetch('http://localhost:3001/api/payment-methods', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setData(Array.isArray(json) ? json : []))
      .catch(() => setData([]));
  }, []);

  const openEdit = (item: any) => {
    setEditItem(item);
    setNewItem({ ...item });
    setShowModal(true);
  };

  const saveEdit = async () => {
    const url = `http://localhost:3001/api/payment-methods/${editItem.id}`;
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newItem),
    });
    setShowModal(false);
    setEditItem(null);
    setNewItem({});
    fetch('http://localhost:3001/api/payment-methods', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setData(Array.isArray(json) ? json : []));
  };

  const createItem = async () => {
    await fetch('http://localhost:3001/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newItem),
    });
    setShowModal(false);
    setNewItem({});
    fetch('http://localhost:3001/api/payment-methods', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setData(Array.isArray(json) ? json : []));
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    await fetch(`http://localhost:3001/api/payment-methods/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetch('http://localhost:3001/api/payment-methods', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setData(Array.isArray(json) ? json : []));
  };

  return (
    <div className="flex gap-6">
      <div className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow p-4 h-fit sticky top-4">
        <h2 className="text-lg font-bold mb-4">Ressources</h2>
        <nav className="space-y-1">
          {resources.map(r => (
            <button key={r.key} onClick={() => setActive(r.key)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${active === r.key ? 'bg-brand-green text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >{r.label}</button>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">⚙️ Administration</h1>
          <button onClick={() => { setEditItem(null); setNewItem({}); setShowModal(true); }} className="bg-brand-green text-white px-4 py-2 rounded">+ Ajouter</button>
        </div>

        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between">
              <div>
                <p className="font-bold">{item.name}</p>
                <span>{item.icon} {item.enabled ? '✅' : '❌'} {item.config ? `– ${item.config}` : ''}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="text-blue-500">Modifier</button>
                <button onClick={() => deleteItem(item.id)} className="text-red-500">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">{editItem ? 'Modifier' : 'Ajouter'} un moyen de paiement</h3>
            <div className="space-y-3">
              <input className="w-full p-2 border rounded" placeholder="Nom (ex: Orange Money)" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <input className="w-full p-2 border rounded" placeholder="Icône (emoji)" value={newItem.icon || ''} onChange={e => setNewItem({...newItem, icon: e.target.value})} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={newItem.enabled !== false} onChange={e => setNewItem({...newItem, enabled: e.target.checked})} /> Actif</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Configuration (ex: {\"phone\":\"+221777777777\", \"api_key\":\"sk_live_xxx\"})"
                rows={2}
                value={newItem.config || ''}
                onChange={e => setNewItem({...newItem, config: e.target.value})}
              />
              <p className="text-xs text-gray-500">Entrez vos instructions ou identifiants au format JSON.</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
              {editItem ? (
                <button onClick={saveEdit} className="px-4 py-2 bg-brand-green text-white rounded">Enregistrer</button>
              ) : (
                <button onClick={createItem} className="px-4 py-2 bg-brand-green text-white rounded">Créer</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
