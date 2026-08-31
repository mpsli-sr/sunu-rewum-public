import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// --- Imports automatiques de toutes les routes ---
import authRoutes from './routes/auth';
import rubriquesRoutes from './routes/rubriques';
import userRoutes from './routes/user';
import translationsRoutes from './routes/translations';
import siteSettingsRoutes from './routes/site-settings';
import postsRoutes from './routes/posts';
import eventsRoutes from './routes/events';
import programRoutes from './routes/program';
import diasporaRoutes from './routes/diaspora';
import recruitmentRoutes from './routes/recruitment';
import badgesRoutes from './routes/badges';
import adminRoutes from './routes/admin';
import messagesRoutes from './routes/messages';
import proposalsRoutes from './routes/proposals';
import propositionsRoutes from './routes/propositions';
import donationsRoutes from './routes/donations';
import articlesRoutes from './routes/articles';
import mediaRoutes from './routes/media';
import jobsRoutes from './routes/jobs';
import uploadRoutes from './routes/upload';
import candidaturesRoutes from './routes/candidatures';
import ministriesRoutes from './routes/ministries';
import organizationRoutes from './routes/organization';
import transparencyRoutes from './routes/transparency';
import searchRoutes from './routes/search';
import rolesRoutes from './routes/roles';
import customFieldsRoutes from './routes/custom-fields';
import pagesRoutes from './routes/pages';
import integrationsRoutes from './routes/integrations';
import publicIntegrationsRoutes from './routes/public-integrations';
import dashboardConfigRoutes from './routes/dashboard-config';
import socialLinksRoutes from './routes/social-links';
import paymentMethodsRoutes from './routes/payment-methods';
import menuItemsRoutes from './routes/menu-items';
import menusRoutes from './routes/menus';
import leaderboardRoutes from './routes/leaderboard';
import simulatorRoutes from './routes/simulator';
import contentBlocksRoutes from './routes/content-blocks';
import charterSignaturesRoutes from './routes/charter-signatures';
import sponsorshipRoutes from './routes/sponsorship';
import sponsorshipsRoutes from './routes/sponsorships';
import newsletterRoutes from './routes/newsletter';
import reportsRoutes from './routes/reports';
import regionalStatsRoutes from './routes/regional-stats';
import siteVisibilityRoutes from './routes/site-visibility';
import verifyRoutes from './routes/verify';
// Ajoutez ici les autres routes si elles existent (admin-actions, etc.)
// Pour les noms avec tirets, utilisez le nom du fichier sans le tiret
// Exemple: admin-actions → adminActionsRoutes (mais on peut les ajouter manuellement)

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const allowedOrigins = (process.env.CORS_ORIGINS || 'https://sunu-rewum.vercel.app,http://localhost:3000')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/rubriques', rubriquesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/program', programRoutes);
app.use('/api/diaspora', diasporaRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/propositions', propositionsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/candidatures', candidaturesRoutes);
app.use('/api/ministries', ministriesRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/transparency', transparencyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/public-integrations', publicIntegrationsRoutes);
app.use('/api/dashboard-config', dashboardConfigRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/menu-items', menuItemsRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/content-blocks', contentBlocksRoutes);
app.use('/api/charter-signatures', charterSignaturesRoutes);
app.use('/api/sponsorship', sponsorshipRoutes);
app.use('/api/sponsorships', sponsorshipsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/regional-stats', regionalStatsRoutes);
app.use('/api/site-visibility', siteVisibilityRoutes);
app.use('/api/verify', verifyRoutes);

// Route racine
app.get('/', (req, res) => res.send('API SUNU REWUM'));

io.on('connection', (socket) => {
  console.log('Client connecté');
  socket.on('disconnect', () => console.log('Client déconnecté'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});
