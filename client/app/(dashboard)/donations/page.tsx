"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const RATE = 655.957;

export default function DonationsPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [amountEur, setAmountEur] = useState("");
  const [amountFcfp, setAmountFcfp] = useState(0);
  const [donations, setDonations] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    http
      .get<any[]>("/api/payment-methods")
      .then(setMethods)
      .catch(() => setMethods([]));
    const saved = localStorage.getItem("donations");
    if (saved) setDonations(JSON.parse(saved));
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountEur(val);
    const eur = parseFloat(val);
    if (!isNaN(eur)) setAmountFcfp(Math.round(eur * RATE));
    else setAmountFcfp(0);
  };

  const selectMethod = (method: any) => {
    setSelectedMethod(method);
    setFormData({});
    setShowForm(true);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleDonate = async () => {
    if (!amountEur || parseFloat(amountEur) <= 0) {
      setMessage("Veuillez entrer un montant valide.");
      return;
    }
    if (!selectedMethod) {
      setMessage("Veuillez choisir un moyen de paiement.");
      return;
    }
    if (!donorName.trim() || !donorEmail.trim() || !donorPhone.trim()) {
      setMessage("Veuillez remplir vos coordonnées (nom, email, téléphone).");
      return;
    }
    if (selectedMethod.fields) {
      const fields =
        typeof selectedMethod.fields === "string"
          ? JSON.parse(selectedMethod.fields)
          : selectedMethod.fields;
      for (const field of fields) {
        if (field.required && !formData[field.name]) {
          setMessage(`Le champ "${field.label}" est requis.`);
          return;
        }
      }
    }

    const donation = {
      id: Date.now().toString(),
      amount: parseFloat(amountEur),
      method: selectedMethod.name,
      donor: { name: donorName, email: donorEmail, phone: donorPhone },
      paymentData: formData,
      date: new Date().toLocaleDateString("fr"),
    };
    const updated = [donation, ...donations];
    setDonations(updated);
    localStorage.setItem("donations", JSON.stringify(updated));

    setMessage("✅ Don enregistré (simulation). Merci !");
    setAmountEur("");
    setAmountFcfp(0);
    setShowForm(false);
    setSelectedMethod(null);
    setFormData({});
    setDonorName("");
    setDonorEmail("");
    setDonorPhone("");
    setTimeout(() => setMessage(""), 3000);
  };

  const total = donations.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💰 Financement & Dons</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-brand-green">
            {total.toLocaleString()} €
          </p>
          <p className="text-gray-500">Total collecté</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-brand-gold">
            {Math.round(total * RATE).toLocaleString()} FCFA
          </p>
          <p className="text-gray-500">Équivalent FCFA</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-brand-red">
            {donations.length}
          </p>
          <p className="text-gray-500">Donateurs</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8 max-w-2xl">
        <h2 className="font-bold text-lg mb-4">Faire un don</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">Vos informations</label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Nom et prénom"
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            value={donorPhone}
            onChange={(e) => setDonorPhone(e.target.value)}
            placeholder="Téléphone"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Montant en Euros</label>
          <input
            type="number"
            value={amountEur}
            onChange={handleAmountChange}
            placeholder="Ex: 25"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          {amountFcfp > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Soit {amountFcfp.toLocaleString()} FCFA
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Moyen de paiement</label>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMethod(m)}
                className={`flex items-center gap-2 p-2 rounded border text-left ${
                  selectedMethod?.id === m.id
                    ? "border-brand-green bg-green-50 dark:bg-green-900"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <span>{m.icon}</span> {m.name}
              </button>
            ))}
          </div>
        </div>

        {showForm && selectedMethod && (
          <div className="mb-4 p-4 border rounded dark:border-gray-600">
            <h3 className="font-medium mb-2">{selectedMethod.name}</h3>

            {selectedMethod.recipientPhone && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded mb-3">
                <p className="text-sm font-medium">
                  📱 Envoyer au :{" "}
                  <span className="font-bold">
                    {selectedMethod.recipientPhone}
                  </span>
                </p>
              </div>
            )}

            {selectedMethod.instructions && (
              <p className="text-sm text-gray-500 mb-3">
                {selectedMethod.instructions}
              </p>
            )}

            {selectedMethod.fields && (
              <div className="space-y-2">
                {(typeof selectedMethod.fields === "string"
                  ? JSON.parse(selectedMethod.fields)
                  : selectedMethod.fields
                ).map((field: any) => (
                  <div key={field.name}>
                    <label className="block text-sm mb-1">
                      Votre {field.label} {field.required && "*"}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleDonate}
          disabled={!selectedMethod}
          className="w-full bg-brand-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
        >
          Donner
        </button>
        {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Historique des dons</h2>
      <div className="space-y-2">
        {donations.map((d, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between"
          >
            <div>
              <span className="font-medium">{d.amount} €</span> via{" "}
              <span className="text-sm">{d.method}</span>
              <p className="text-xs text-gray-500">
                De : {d.donor?.name} ({d.donor?.email})
              </p>
              <p className="text-xs text-gray-400">{d.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
