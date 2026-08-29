"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/api";

type Lang = "fr" | "wol" | "en";

const messages: Record<Lang, any> = {
  fr: {
    hero: {
      title: "SUNU REWUM",
      subtitle: "COTHIE AK M.P.S.L.I",
      slogan: "Travail, Dignité, Souveraineté, Solidarité",
    },
    cta: {
      join: "Adhérer",
      donate: "Faire un don",
      event: "Participer à un événement",
    },
    counters: {
      members: "Membres",
      proposals: "Propositions",
      events: "Événements",
    },
    explore: "Explorez le mouvement",
    newsletter: {
      title: "Restez informé",
      desc: "Recevez les dernières actualités du mouvement.",
      placeholder: "votre@email.com",
      button: "S'abonner",
    },
    login: {
      title: "Connexion",
      email: "Email",
      password: "Mot de passe",
      submit: "Se connecter",
      register: "Créer un compte",
    },
    sidebar: {
      groupDashboard: "📊 Dashboard",
      groupVieDuMouvement: "📢 Vie du mouvement",
      groupProgrammeOutils: "📋 Programme & Outils",
      groupMediasDons: "📸 Médias & Dons",
      groupNosValeurs: "📌 Nos Valeurs",
      groupMonCompte: "👤 Mon compte",
      dashboard: "Dashboard",
      feed: "Fil actualité",
      proposals: "Propositions",
      events: "Événements",
      leaderboard: "Classement",
      badges: "Badges",
      program: "Programme 2029",
      simulator: "Simulateur",
      recruitment: "Recrutement",
      gallery: "Galerie",
      media: "Médias",
      donations: "Dons",
      diaspora: "Diaspora",
      messages: "Messages",
      sponsorship: " Parrainage",
      map: "Carte",
      candidatures: "Candidatures",
      admin: "Admin",
      generalSettings: "Paramètres généraux",
      government: "Gouvernement",
      organization: "Organisation",
      activeNeutrality: "Neutralité active",
      parity: "Parité",
      foodSovereignty: "Souv. alimentaire",
      digitalSovereignty: "Souv. numérique",
      transparency: "Transparence",
      charter: "Charte",
      profile: "Profil",
      settings: "Paramètres",
      logout: "Déconnexion",
      discover: "Découvrir",
      contact: "Contacter",
      appearance: "Apparence",
    },
    sponsorship: {
      title: "🤝 Parrainages",
      becomeParrain: "Devenir parrain",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse complète",
      cniNumber: "Numéro CNI *",
      voterCard: "Numéro carte électeur",
      signature: "Signature numérique",
      signaturePlaceholder: "Écrivez votre signature ici...",
      engagementLetter: "Lettre d'engagement",
      engagementPlaceholder: "Rédigez votre engagement envers le mouvement...",
      honorDeclaration:
        "Je déclare sur l'honneur l'exactitude des informations fournies et mon soutien au mouvement SUNU REWUM.",
      charterSign:
        "J'adhère à la charte du mouvement SUNU REWUM et m'engage à en respecter les valeurs.",
      submitButton: "S'inscrire comme parrain",
      cniRequired: "Veuillez entrer votre numéro CNI.",
      honorRequired: "Vous devez accepter la déclaration sur l'honneur.",
      charterRequired: "Vous devez signer la charte du mouvement.",
      success: "✅ Parrainage enregistré avec succès !",
      error: "Erreur lors du parrainage.",
      cniLabel: "CNI :",
      voterCardLabel: "Carte électeur :",
      phoneLabel: "Tél :",
      addressLabel: "Adresse :",
      engagementPresent: "Lettre d'engagement présente",
      honorChecked: "✅ Déclaration sur l'honneur",
      charterChecked: "✅ Charte signée",
    },
  },
  wol: {
    hero: {
      title: "SUNU REWUM",
      subtitle: "COTHIE AK M.P.S.L.I",
      slogan: "Liggey, Ngor, Souveraineté, Solidarité",
    },
    cta: { join: "Dugg", donate: "Maye ndimbal", event: "Jëfandikoo" },
    counters: {
      members: "Xaritu yëngal",
      proposals: "Propositions yi",
      events: "Jëf yi",
    },
    explore: "Xool mbooloo mi",
    newsletter: {
      title: "Defal sa mbind",
      desc: "Amal xibaar yu bees ci mbooloo mi.",
      placeholder: "sa@imeel.sn",
      button: "Tontu",
    },
    login: {
      title: "Dugal",
      email: "Imeel",
      password: "Baatu-jàmm",
      submit: "Dugal",
      register: "Sos am kàntaan",
    },
    sidebar: {
      groupDashboard: "📊 Tabló",
      groupVieDuMouvement: "📢 Dunde ak mbooloo",
      groupProgrammeOutils: "📋 Porogaraam & Jumtukaay",
      groupMediasDons: "📸 Médias & Ndimbal",
      groupNosValeurs: "📌 Sunu yoon",
      groupMonCompte: "👤 Sama xel",
      dashboard: "Tabló",
      feed: "Xibaar yi",
      proposals: "Soppali",
      events: "Jëf",
      leaderboard: "Téew",
      badges: "Màndarga",
      program: "Porogaraam 2029",
      simulator: "Xaymam",
      recruitment: "Liggeeyu bopp",
      gallery: "Nataalu",
      media: "Mëdiyas",
      donations: "Ndimbal",
      diaspora: "Diaspora",
      messages: "Bataaxal yi",
      sponsorship: " Tànneefi",
      map: "Kaart mboooloo mi",
      candidatures: "Tànneef",
      admin: "Admin",
      generalSettings: "Tànneef yu mag",
      government: "Ngur",
      organization: "Organisasyon",
      activeNeutrality: "Ndëgëral gu jëf",
      parity: "Digaale",
      foodSovereignty: "Ndépp lekk",
      digitalSovereignty: "Ndépp jokkoo",
      transparency: "Wees",
      charter: "Kàrt",
      profile: "Xel",
      settings: "Tànneef",
      logout: "Génn",
      discover: "Xool",
      contact: "Contacter",
      appearance: "Apparence",
    },
    sponsorship: {
      title: "🤝 Tànneefi",
      becomeParrain: "Delloo parrain",
      firstName: "Turu njëkk",
      lastName: "Sant",
      email: "Imeel",
      phone: "Telefoŋ",
      address: "Adresse bu am mbëggeel",
      cniNumber: "Numéro CNI *",
      voterCard: "Numéro karte électeur",
      signature: "Siñatuur bu nëtëxee",
      signaturePlaceholder: "Bindil siñatuur sa si...",
      engagementLetter: "Bataaxalu jëngu",
      engagementPlaceholder: "Bindil sa jëngu ci mbooloo mi...",
      honorDeclaration:
        "Dégë naa ci sama ngor ne xibaar yi may jottalii di wóor, te di naa jàppale mbooloo mi SUNU REWUM.",
      charterSign:
        "Dugg naa ci kàrtu mbooloo mi SUNU REWUM, di naa jëfandikoo ay yoonam.",
      submitButton: "Tànneefi niki parrain",
      cniRequired: "Defal sa numéro CNI.",
      honorRequired: "War ngaa nangu ndéggëral gu ngor.",
      charterRequired: "War ngaa siñé kàrtu mbooloo mi.",
      success: "✅ Tànneefi rafet na lañu koy def !",
      error: "Njaaxu ci tànneefi.",
      cniLabel: "CNI :",
      voterCardLabel: "Karte électeur :",
      phoneLabel: "Tel :",
      addressLabel: "Adresse :",
      engagementPresent: "Bataaxalu jëngu am na",
      honorChecked: "✅ Ndëgëral gu ngor",
      charterChecked: "✅ Kàrt siñé na",
    },
  },
  en: {
    hero: {
      title: "SUNU REWUM",
      subtitle: "COTHIE AK M.P.S.L.I",
      slogan: "Work, Dignity, Sovereignty, Solidarity",
    },
    cta: { join: "Join", donate: "Donate", event: "Attend an event" },
    counters: { members: "Members", proposals: "Proposals", events: "Events" },
    explore: "Explore the movement",
    newsletter: {
      title: "Stay informed",
      desc: "Receive the latest news from the movement.",
      placeholder: "your@email.com",
      button: "Subscribe",
    },
    login: {
      title: "Login",
      email: "Email",
      password: "Password",
      submit: "Login",
      register: "Create account",
    },
    sidebar: {
      groupDashboard: "📊 Dashboard",
      groupVieDuMouvement: "📢 Movement Life",
      groupProgrammeOutils: "📋 Program & Tools",
      groupMediasDons: "📸 Media & Donations",
      groupNosValeurs: "📌 Our Values",
      groupMonCompte: "👤 My Account",
      dashboard: "Dashboard",
      feed: "News Feed",
      proposals: "Proposals",
      events: "Events",
      leaderboard: "Leaderboard",
      badges: "Badges",
      program: "2029 Program",
      simulator: "Simulator",
      recruitment: "Recruitment",
      gallery: "Gallery",
      media: "Media",
      donations: "Donations",
      diaspora: "Diaspora",
      messages: "Messages",
      sponsorship: " Sponsorship",
      map: " map",
      candidatures: "Candidatures",
      admin: "Admin",
      generalSettings: "General Settings",
      government: "Government",
      organization: "Organization",
      activeNeutrality: "Active Neutrality",
      parity: "Parity",
      foodSovereignty: "Food Sovereignty",
      digitalSovereignty: "Digital Sovereignty",
      transparency: "Transparency",
      charter: "Charter",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      discover: "Discover",
      contact: "Contact",
      appearance: "Appearance",
    },
    sponsorship: {
      title: "🤝 Sponsorships",
      becomeParrain: "Become a sponsor",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      address: "Full address",
      cniNumber: "ID Card Number *",
      voterCard: "Voter card number",
      signature: "Digital signature",
      signaturePlaceholder: "Write your signature here...",
      engagementLetter: "Engagement letter",
      engagementPlaceholder: "Write your commitment to the movement...",
      honorDeclaration:
        "I hereby declare on my honour the accuracy of the information provided and my support for the SUNU REWUM movement.",
      charterSign:
        "I adhere to the charter of the SUNU REWUM movement and undertake to respect its values.",
      submitButton: "Register as a sponsor",
      cniRequired: "Please enter your ID card number.",
      honorRequired: "You must accept the declaration on honour.",
      charterRequired: "You must sign the movement charter.",
      success: "✅ Sponsorship successfully registered!",
      error: "Error during sponsorship.",
      cniLabel: "ID:",
      voterCardLabel: "Voter card:",
      phoneLabel: "Phone:",
      addressLabel: "Address:",
      engagementPresent: "Engagement letter present",
      honorChecked: "✅ Declaration on honour",
      charterChecked: "✅ Charter signed",
    },
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    http
      .get<Record<string, string>>(`/api/translations/${lang}`)
      .then((data) => setCustomMessages(data))
      .catch(() => setCustomMessages({}));
  }, [lang]);
  const [customMessages, setCustomMessages] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("i18n-lang") as Lang;
      if (savedLang && ["fr", "wol", "en"].includes(savedLang)) {
        setLangState(savedLang);
      }
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("i18n-lang", l);
    document.documentElement.lang = l;
  };

  const t = (key: string): string => {
    if (customMessages[key]) return customMessages[key];
    const keys = key.split(".");
    let result: any = messages[lang];
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    return typeof result === "string" ? result : key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
