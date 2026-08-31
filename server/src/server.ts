import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';
import { initSocket } from './socket';

// ---- Routes API ----
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import rubriquesRoutes from './routes/rubriques';
import translationsRoutes from './routes/translations';
import siteSettingsRoutes from './routes/site-settings';
import settingsRoutes from './routes/settings';
import postsRoutes from './routes/posts';
import eventsRoutes from './routes/events';
import programRoutes from './routes/program';
import diasporaRoutes from './routes/diaspora';
import diasporaCandidatesRoutes from './routes/diaspora-candidates';
import recruitmentRoutes from './routes/recruitment';
import badgesRoutes from './routes/badges';
import adminRoutes from './routes/admin';
import adminUsersRoutes from './routes/admin-users';
import adminActionsRoutes from './routes/admin-actions';
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
import charterRoutes from './routes/charter-signatures';
import sponsorshipRoutes from './routes/sponsorship';
import sponsorshipsRoutes from './routes/sponsorships';
import newsletterRoutes from './routes/newsletter';
import reportsRoutes from './routes/reports';
import regionalStatsRoutes from './routes/regional-stats';
import siteVisibilityRoutes from './routes/site-visibility';
import verifyRoutes from './routes/verify';

const app = express();
const server = http.createServer(app);
// ---- CORS dynamique ----
const allowedOrigins = (process.env.CORS_ORIGINS || [
  'https://sunu-rewum.vercel.app',
  'https://sunu-rewum-git-main-mpsli-srs-projects.vercel.app',
  'http://localhost:3000',
].join(',')).split(',').map((s: string) => s.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

// ---- Fichiers statiques ----
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ---- Montage UNIQUE de toutes les routes sous /api/* ----
const api = express.Router();
api.use('/auth', authRoutes);                       // POST /api/auth/login, GET /api/auth/me
api.use('/user', userRoutes);
api.use('/rubriques', rubriquesRoutes);
api.use('/translations', translationsRoutes);       // GET /api/translations/fr
api.use('/site-settings', siteSettingsRoutes);      // GET /api/site-settings
api.use('/settings', settingsRoutes);
api.use('/posts', postsRoutes);
api.use('/events', eventsRoutes);
api.use('/program', programRoutes);
api.use('/diaspora', diasporaRoutes);
api.use('/diaspora-candidates', diasporaCandidatesRoutes);
api.use('/recruitment', recruitmentRoutes);
api.use('/badges', badgesRoutes);
api.use('/admin', adminRoutes);
api.use('/admin-users', adminUsersRoutes);
api.use('/admin-actions', adminActionsRoutes);
api.use('/messages', messagesRoutes);
api.use('/proposals', proposalsRoutes);
api.use('/propositions', propositionsRoutes);
api.use('/donations', donationsRoutes);
api.use('/articles', articlesRoutes);
api.use('/media', mediaRoutes);
api.use('/jobs', jobsRoutes);
api.use('/upload', uploadRoutes);
api.use('/candidatures', candidaturesRoutes);
api.use('/ministries', ministriesRoutes);
api.use('/organization', organizationRoutes);
api.use('/transparency', transparencyRoutes);
api.use('/search', searchRoutes);
api.use('/roles', rolesRoutes);
api.use('/custom-fields', customFieldsRoutes);
api.use('/pages', pagesRoutes);
api.use('/integrations', integrationsRoutes);
api.use('/public-integrations', publicIntegrationsRoutes);
api.use('/dashboard-config', dashboardConfigRoutes);
api.use('/social-links', socialLinksRoutes);
api.use('/payment-methods', paymentMethodsRoutes);
api.use('/menu-items', menuItemsRoutes);
api.use('/menus', menusRoutes);
api.use('/leaderboard', leaderboardRoutes);
api.use('/simulator', simulatorRoutes);
api.use('/content-blocks', contentBlocksRoutes);
api.use('/charter-signatures', charterRoutes);
api.use('/sponsorship', sponsorshipRoutes);
api.use('/sponsorships', sponsorshipsRoutes);
api.use('/newsletter', newsletterRoutes);
api.use('/reports', reportsRoutes);
api.use('/regional-stats', regionalStatsRoutes);
api.use('/site-visibility', siteVisibilityRoutes);
api.use('/verify', verifyRoutes);
api.get('/health', (_req, res) => res.json({ status: 'OK' }));
app.use('/api', api);

app.get('/', (_req, res) => res.send('API SUNU REWUM en ligne'));
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur + Socket.io sur http://localhost:${PORT}`));
