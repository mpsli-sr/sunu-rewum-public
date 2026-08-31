import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import rubriquesRoutes from './routes/rubriques';
import userRoutes from './routes/user';

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

app.use('/auth', authRoutes);
app.use('/rubriques', rubriquesRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => res.send('API SUNU REWUM'));

io.on('connection', (socket) => {
  console.log('Client connecté');
  socket.on('disconnect', () => console.log('Client déconnecté'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
