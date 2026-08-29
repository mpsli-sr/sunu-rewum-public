"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { http } from "@/lib/api";

export default function SponsorshipPage() {
  const { t } = useI18n();
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [cni, setCni] = useState("");
  const [voterCard, setVoterCard] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [engagementLetter, setEngagementLetter] = useState("");
  const [honor, setHonor] = useState(false);
  const [charter, setCharter] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        setUser(u);
        if (u) {
          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setEmail(u.email || "");
        }
      })
      .catch(() => setUser(null));

    http
      .get<any[]>("/api/sponsorships")
      .then(setSponsorships)
      .catch(() => setSponsorships([]));
  }, []);

  const handleSubmit = async () => {
    if (!cni) return setMessage(t("sponsorship.cniRequired"));
    if (!honor) return setMessage(t("sponsorship.honorRequired"));
    if (!charter) return setMessage(t("sponsorship.charterRequired"));

    const body = {
      userId: user.id,
      cniNumber: cni,
      voterCardNumber: voterCard || null,
      signatureData: signature || null,
      honorDeclaration: honor,
      charterSigned: charter,
      firstName,
      lastName,
      email,
      phone,
      address,
      engagementLetter,
    };

    try {
      await http.post("/api/sponsorships", body);
      setMessage(t("sponsorship.success"));
      setCni("");
      setVoterCard("");
      setPhone("");
      setAddress("");
      setSignature("");
      setEngagementLetter("");
      setHonor(false);
      setCharter(false);
      const updated = await http.get<any[]>("/api/sponsorships");
      setSponsorships(updated);
    } catch (err: any) {
      setMessage(err.message || t("sponsorship.error"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("sponsorship.title")}</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-4">
        <h2 className="font-semibold mb-2">{t("sponsorship.becomeParrain")}</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t("sponsorship.firstName")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder={t("sponsorship.lastName")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>
        <input
          type="email"
          placeholder={t("sponsorship.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          type="tel"
          placeholder={t("sponsorship.phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <textarea
          placeholder={t("sponsorship.address")}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          rows={2}
        />

        <input
          type="text"
          placeholder={t("sponsorship.cniNumber")}
          value={cni}
          onChange={(e) => setCni(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          placeholder={t("sponsorship.voterCard")}
          value={voterCard}
          onChange={(e) => setVoterCard(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("sponsorship.signature")}
          </label>
          <textarea
            placeholder={t("sponsorship.signaturePlaceholder")}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("sponsorship.engagementLetter")}
          </label>
          <textarea
            placeholder={t("sponsorship.engagementPlaceholder")}
            value={engagementLetter}
            onChange={(e) => setEngagementLetter(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-32"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={honor}
              onChange={(e) => setHonor(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm">{t("sponsorship.honorDeclaration")}</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={charter}
              onChange={(e) => setCharter(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm">{t("sponsorship.charterSign")}</span>
          </label>
        </div>

        {message && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="bg-brand-green text-white px-6 py-2 rounded"
        >
          {t("sponsorship.submitButton")}
        </button>
      </div>

      <div className="space-y-2">
        {sponsorships.map((s: any) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 p-3 rounded shadow"
          >
            <p className="font-medium">
              {s?.firstName || s?.user?.firstName || "—"}{" "}
              {s?.lastName || s?.user?.lastName || "—"}
            </p>
            {s.email && <p className="text-sm">{s.email}</p>}
            <p className="text-sm text-gray-500">
              {t("sponsorship.cniLabel")} {s.cniNumber}
            </p>
            {s.voterCardNumber && (
              <p className="text-sm text-gray-500">
                {t("sponsorship.voterCardLabel")} {s.voterCardNumber}
              </p>
            )}
            {s.phone && (
              <p className="text-sm text-gray-500">
                {t("sponsorship.phoneLabel")} {s.phone}
              </p>
            )}
            {s.address && (
              <p className="text-sm text-gray-500">
                {t("sponsorship.addressLabel")} {s.address}
              </p>
            )}
            {s.engagementLetter && (
              <p className="text-xs text-gray-600 mt-1 italic">
                {t("sponsorship.engagementPresent")}
              </p>
            )}
            {s.honorDeclaration && (
              <p className="text-xs text-green-600">
                {t("sponsorship.honorChecked")}
              </p>
            )}
            {s.charterSigned && (
              <p className="text-xs text-green-600">
                {t("sponsorship.charterChecked")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
