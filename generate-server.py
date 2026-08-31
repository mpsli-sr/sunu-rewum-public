import pathlib, re

route_dir = pathlib.Path('server/src/routes')
files = sorted([p.stem for p in route_dir.glob('*.ts') if p.stem not in ['index', 'types']])

def to_camel(name):
    parts = name.split('-')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:]) + 'Routes'

imports = "\n".join(f"import {to_camel(f)} from './routes/{f}';" for f in files)
mounts = "\n".join(f"api.use('/{f}', {to_camel(f)});" for f in files)

server_content = f'''import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import {{ Server }} from 'socket.io';

{imports}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {{
  cors: {{ origin: process.env.CORS_ORIGINS?.split(',') ?? '*' }},
}});

const allowedOrigins = (process.env.CORS_ORIGINS || [
  'https://sunu-rewum.vercel.app',
  'https://sunu-rewum-git-main-mpsli-srs-projects.vercel.app',
  'http://localhost:3000',
].join(',')).split(',').map((s: string) => s.trim());

app.use(cors({{
  origin(origin, callback) {{
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }},
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}}));

app.use(express.json());
app.use(cookieParser());

const api = express.Router();
{mounts}
api.get('/health', (_req, res) => res.json({{ status: 'OK' }}));
app.use('/api', api);

app.get('/', (_req, res) => res.send('API SUNU REWUM en ligne'));

io.on('connection', (socket) => {{
  console.log('Client connecté');
  socket.on('disconnect', () => console.log('Client déconnecté'));
}});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur + Socket.io sur http://localhost:${{PORT}}`));
'''

with open('server/src/server.ts', 'w', encoding='utf-8') as f:
    f.write(server_content)

print(f"✅ server.ts généré avec {len(files)} routes montées.")
