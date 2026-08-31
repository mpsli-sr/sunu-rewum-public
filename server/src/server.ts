import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import adminRoutes from './routes/admin';
import adminActionsRoutes from './routes/admin-actions';
import adminBackupRoutes from './routes/admin-backup';
import adminIdeologyRoutes from './routes/admin-ideology';
import adminJobsRoutes from './routes/admin-jobs';
import adminMediaRoutes from './routes/admin-media';
import adminResetRoutes from './routes/admin-reset';
import adminSponsorshipRoutes from './routes/admin-sponsorship';
import adminUsersRoutes from './routes/admin-users';
import adminUsersListRoutes from './routes/admin-users-list';
import adminVotesRoutes from './routes/admin-votes';
import articlesRoutes from './routes/articles';
import authRoutes from './routes/auth';
import badgesRoutes from './routes/badges';
import candidaturesRoutes from './routes/candidatures';
import charterSignaturesRoutes from './routes/charter-signatures';
import contentBlocksRoutes from './routes/content-blocks';
import customFieldValuesRoutes from './routes/custom-field-values';
import customFieldsRoutes from './routes/custom-fields';
import dashboardConfigRoutes from './routes/dashboard-config';
import diasporaRoutes from './routes/diaspora';
import diasporaCandidatesRoutes from './routes/diaspora-candidates';
import donationsRoutes from './routes/donations';
import eventsRoutes from './routes/events';
import exportPdfRoutes from './routes/export-pdf';
import ideologyRoutes from './routes/ideology';
import integrationsRoutes from './routes/integrations';
import jobsRoutes from './routes/jobs';
import leaderboardRoutes from './routes/leaderboard';
import mediaRoutes from './routes/media';
import menuItemsRoutes from './routes/menu-items';
import menusRoutes from './routes/menus';
import messagesRoutes from './routes/messages';
import ministriesRoutes from './routes/ministries';
import newsletterRoutes from './routes/newsletter';
import organizationRoutes from './routes/organization';
import pagesRoutes from './routes/pages';
import paymentMethodsRoutes from './routes/payment-methods';
import postsRoutes from './routes/posts';
import programRoutes from './routes/program';
import proposalsRoutes from './routes/proposals';
import propositionsRoutes from './routes/propositions';
import publicRoutes from './routes/public';
import publicIntegrationsRoutes from './routes/public-integrations';
import recruitmentRoutes from './routes/recruitment';
import regionalStatsRoutes from './routes/regional-stats';
import reportsRoutes from './routes/reports';
import rolesRoutes from './routes/roles';
import rubriquesRoutes from './routes/rubriques';
import searchRoutes from './routes/search';
import serverRoutes from './routes/server';
import settingsRoutes from './routes/settings';
import simulatorRoutes from './routes/simulator';
import siteSettingsRoutes from './routes/site-settings';
import siteVisibilityRoutes from './routes/site-visibility';
import socialLinksRoutes from './routes/social-links';
import sponsorshipRoutes from './routes/sponsorship';
import sponsorshipsRoutes from './routes/sponsorships';
import translationsRoutes from './routes/translations';
import transparencyRoutes from './routes/transparency';
import trueMinistriesRoutes from './routes/true-ministries';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/user';
import verifyRoutes from './routes/verify';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGINS?.split(',') ?? '*' },
});

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

const api = express.Router();
api.use('/admin', adminRoutes);
api.use('/admin-actions', adminActionsRoutes);
api.use('/admin-backup', adminBackupRoutes);
api.use('/admin-ideology', adminIdeologyRoutes);
api.use('/admin-jobs', adminJobsRoutes);
api.use('/admin-media', adminMediaRoutes);
api.use('/admin-reset', adminResetRoutes);
api.use('/admin-sponsorship', adminSponsorshipRoutes);
api.use('/admin-users', adminUsersRoutes);
api.use('/admin-users-list', adminUsersListRoutes);
api.use('/admin-votes', adminVotesRoutes);
api.use('/articles', articlesRoutes);
api.use('/auth', authRoutes);
api.use('/badges', badgesRoutes);
api.use('/candidatures', candidaturesRoutes);
api.use('/charter-signatures', charterSignaturesRoutes);
api.use('/content-blocks', contentBlocksRoutes);
api.use('/custom-field-values', customFieldValuesRoutes);
api.use('/custom-fields', customFieldsRoutes);
api.use('/dashboard-config', dashboardConfigRoutes);
api.use('/diaspora', diasporaRoutes);
api.use('/diaspora-candidates', diasporaCandidatesRoutes);
api.use('/donations', donationsRoutes);
api.use('/events', eventsRoutes);
api.use('/export-pdf', exportPdfRoutes);
api.use('/ideology', ideologyRoutes);
api.use('/integrations', integrationsRoutes);
api.use('/jobs', jobsRoutes);
api.use('/leaderboard', leaderboardRoutes);
api.use('/media', mediaRoutes);
api.use('/menu-items', menuItemsRoutes);
api.use('/menus', menusRoutes);
api.use('/messages', messagesRoutes);
api.use('/ministries', ministriesRoutes);
api.use('/newsletter', newsletterRoutes);
api.use('/organization', organizationRoutes);
api.use('/pages', pagesRoutes);
api.use('/payment-methods', paymentMethodsRoutes);
api.use('/posts', postsRoutes);
api.use('/program', programRoutes);
api.use('/proposals', proposalsRoutes);
api.use('/propositions', propositionsRoutes);
api.use('/public', publicRoutes);
api.use('/public-integrations', publicIntegrationsRoutes);
api.use('/recruitment', recruitmentRoutes);
api.use('/regional-stats', regionalStatsRoutes);
api.use('/reports', reportsRoutes);
api.use('/roles', rolesRoutes);
api.use('/rubriques', rubriquesRoutes);
api.use('/search', searchRoutes);
api.use('/server', serverRoutes);
api.use('/settings', settingsRoutes);
api.use('/simulator', simulatorRoutes);
api.use('/site-settings', siteSettingsRoutes);
api.use('/site-visibility', siteVisibilityRoutes);
api.use('/social-links', socialLinksRoutes);
api.use('/sponsorship', sponsorshipRoutes);
api.use('/sponsorships', sponsorshipsRoutes);
api.use('/translations', translationsRoutes);
api.use('/transparency', transparencyRoutes);
api.use('/true-ministries', trueMinistriesRoutes);
api.use('/upload', uploadRoutes);
api.use('/user', userRoutes);
api.use('/verify', verifyRoutes);
api.get('/health', (_req, res) => res.json({ status: 'OK' }));
app.use('/api', api);

app.get('/', (_req, res) => res.send('API SUNU REWUM en ligne'));

io.on('connection', (socket) => {
  console.log('Client connecté');
  socket.on('disconnect', () => console.log('Client déconnecté'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur + Socket.io sur http://localhost:${PORT}`));
