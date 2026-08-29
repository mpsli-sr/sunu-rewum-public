import translationsRoutes from './routes/translations';
import express from "express";
const cors = require('cors');
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket";
import path from 'path';

// Tous les imports de routes...
import authRoutes from "./routes/auth";
import postsRoutes from "./routes/posts";
import eventsRoutes from "./routes/events";
import programRoutes from "./routes/program";
import diasporaRoutes from "./routes/diaspora";
import recruitmentRoutes from "./routes/recruitment";
import badgesRoutes from "./routes/badges";
import adminRoutes from "./routes/admin";
import messagesRoutes from "./routes/messages";
import proposalsRoutes from "./routes/proposals";
import propositionsRoutes from './routes/propositions';
import simulatorRoutes from "./routes/simulator";
import leaderboardRoutes from "./routes/leaderboard";
import donationsRoutes from "./routes/donations";
import verifyRoutes from "./routes/verify";
import articlesRoutes from "./routes/articles";
import mediaRoutes from "./routes/media";
import settingsRoutes from "./routes/settings";
import userRoutes from "./routes/user";
import adminActionsRoutes from "./routes/admin-actions";
import ideologyRoutes from "./routes/ideology";
import sponsorshipRoutes from "./routes/sponsorship";
import adminSponsorshipRoutes from "./routes/admin-sponsorship";
import adminVotesRoutes from "./routes/admin-votes";
import adminResetRoutes from "./routes/admin-reset";
import adminMediaRoutes from "./routes/admin-media";
import adminJobsRoutes from "./routes/admin-jobs";
import adminIdeologyRoutes from "./routes/admin-ideology";
import adminUsersRoutes from "./routes/admin-users";
import adminBackupRoutes from "./routes/admin-backup";
import menuItemsRoutes from './routes/menu-items';
import publicRoutes from "./routes/public";
import jobsRoutes from './routes/jobs';
import contentBlocksRoutes from "./routes/content-blocks";
import socialLinksRoutes from "./routes/social-links";
import paymentMethodsRoutes from "./routes/payment-methods";
import uploadRoutes from "./routes/upload";
import publicIntegrationsRoutes from "./routes/public-integrations";
import candidaturesRoutes from "./routes/candidatures";
import ministriesRoutes from "./routes/ministries";
import adminUsersListRoutes from "./routes/admin-users-list";
import organizationRoutes from "./routes/organization";
import siteSettingsRoutes from "./routes/site-settings";
import pagesRoutes from './routes/pages';
import reportsRoutes from "./routes/reports";
import transparencyRoutes from "./routes/transparency";
import regionalStatsRoutes from "./routes/regional-stats";
import exportPdfRoutes from "./routes/export-pdf";
import charterSignaturesRoutes from "./routes/charter-signatures";
import menusRoutes from "./routes/menus";
import dashboardConfigRoutes from "./routes/dashboard-config";
import diasporaCandidatesRoutes from "./routes/diaspora-candidates";
import searchRoutes from "./routes/search";
import rolesRoutes from "./routes/roles";
import customFieldsRoutes from "./routes/custom-fields";
import siteVisibilityRoutes from "./routes/site-visibility";
import integrationsRoutes from "./routes/integrations";
import customFieldValuesRoutes from "./routes/custom-field-values";
import rubriquesRoutes from './routes/rubriques';

const app = express();

app.use(cors({
  origin: [
    'https://sunu-rewum.vercel.app',
    'https://sunu-rewum-git-main-mpsli-srs-projects.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Initialiser Socket.io
initSocket(server);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());

// Enregistrement des routes (conservé à l'identique)
app.use("/api/auth", authRoutes);
app.use('/api/rubriques', rubriquesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/posts", postsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/events", eventsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/program", programRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/diaspora", diasporaRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/badges", badgesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/proposals", proposalsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/donations", donationsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/verify", verifyRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/articles", articlesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/media", mediaRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/settings", settingsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/user", userRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-actions", adminActionsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/ideology", ideologyRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/sponsorship", sponsorshipRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-sponsorship", adminSponsorshipRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-votes", adminVotesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-reset", adminResetRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-media", adminMediaRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-jobs", adminJobsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-ideology", adminIdeologyRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-users", adminUsersRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-backup", adminBackupRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/menu-items', menuItemsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/public", publicRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/content-blocks", contentBlocksRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/social-links", socialLinksRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/payment-methods", paymentMethodsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/public/integrations", publicIntegrationsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/candidatures", candidaturesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/simulator/ministries", ministriesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/ministries", ministriesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/admin-users/list", adminUsersListRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/organization", organizationRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/reports", reportsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/transparency", transparencyRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/regional-stats", regionalStatsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/export-pdf", exportPdfRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/charter-signatures", charterSignaturesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/menus", menusRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/dashboard-config", dashboardConfigRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/diaspora-candidates", diasporaCandidatesRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/propositions', propositionsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/roles", rolesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/custom-fields", customFieldsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/site-visibility", siteVisibilityRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use('/api/translations', translationsRoutes);
app.use("/api/custom-field-values", customFieldValuesRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get("/", (_req, res) => res.send("API SUNU REWUM en ligne avec notifications temps réel"));

app.get("/api/health", (_req, res) => res.json({ status: "OK" }));

server.listen(PORT, () => console.log("🚀 Serveur + Socket.io sur http://localhost:" + PORT));
