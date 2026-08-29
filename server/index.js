const cors = require('cors');

// Autoriser les origines Vercel et locales
app.use(cors({
  origin: [
    'https://sunu-rewum.vercel.app',
    'https://sunu-rewum-git-main-mpsli-srs-projects.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,   // Important car vous utilisez credentials: 'include'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
