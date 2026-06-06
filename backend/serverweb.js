import mongoose from 'mongoose';
const { connection } = mongoose;

const START_TIME = Date.now();

const formatUptime = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

const getDbLatency = async (dbConnected) => {
  if (!dbConnected) return null;
  try {
    const t = Date.now();
    await connection.db.admin().ping();
    return Date.now() - t;
  } catch {
    return null;
  }
};

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/auth/register',        desc: 'Register user' },
  { method: 'POST', path: '/api/auth/login',           desc: 'Login' },
  { method: 'POST', path: '/api/auth/logout',          desc: 'Logout' },
  { method: 'POST', path: '/api/auth/refresh',         desc: 'Refresh token' },
  { method: 'GET',  path: '/api/auth/me',              desc: 'Current user' },
  { method: 'GET',  path: '/api/users',                desc: 'List users' },
  { method: 'GET',  path: '/api/users/:id',            desc: 'Get user' },
  { method: 'GET',  path: '/api/drivers',              desc: 'List drivers' },
  { method: 'GET',  path: '/api/drivers/:id',          desc: 'Get driver' },
  { method: 'GET',  path: '/api/drivers/:id/availability', desc: 'Driver availability' },
  { method: 'GET',  path: '/api/bookings',             desc: 'List bookings' },
  { method: 'POST', path: '/api/bookings',             desc: 'Create booking' },
  { method: 'POST', path: '/api/payments/create-order', desc: 'Create Razorpay order' },
  { method: 'POST', path: '/api/payments/verify',      desc: 'Verify payment' },
  { method: 'GET',  path: '/api/admin/dashboard',      desc: 'Admin dashboard stats' },
];

const methodColor = { GET: '#4ade80', POST: '#60a5fa', PUT: '#f59e0b', DELETE: '#f87171', PATCH: '#c084fc' };

const buildHtml = (status) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>GoPilot API</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0A0B14;color:#E2E8F0;font-family:'Inter',system-ui,sans-serif;min-height:100vh;padding:40px 24px}
    .container{max-width:900px;margin:auto}
    header{display:flex;align-items:center;gap:16px;margin-bottom:40px}
    .logo{font-size:28px;font-weight:800;color:#E8B84B;letter-spacing:-0.5px}
    .logo span{color:#4F63FF}
    .badge{background:#1E293B;border:1px solid #334155;padding:4px 12px;border-radius:999px;font-size:12px;color:#94A3B8}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px}
    .card{background:#111827;border:1px solid #1E293B;border-radius:12px;padding:20px}
    .card-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748B;margin-bottom:8px}
    .card-value{font-size:22px;font-weight:700}
    .card-sub{font-size:12px;color:#64748B;margin-top:4px}
    .online{color:#4ade80}.offline{color:#f87171}.warn{color:#f59e0b}
    .dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;animation:pulse 2s infinite}
    .dot.green{background:#4ade80;box-shadow:0 0 6px #4ade80}
    .dot.red{background:#f87171}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    h2{font-size:14px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}
    tr{border-bottom:1px solid #1E293B}
    tr:last-child{border-bottom:none}
    td{padding:10px 12px;font-size:13px}
    .method{font-weight:700;font-size:11px;font-family:monospace}
    .path{font-family:monospace;color:#CBD5E1}
    .desc{color:#64748B}
    .section{background:#111827;border:1px solid #1E293B;border-radius:12px;padding:20px;margin-bottom:24px}
    footer{text-align:center;color:#334155;font-size:12px;margin-top:40px}
  </style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo">Go<span>Pilot</span></div>
    <div class="badge">v1.0.0</div>
    <div class="badge">${status.env}</div>
  </header>

  <div class="grid">
    <div class="card">
      <div class="card-label">API Status</div>
      <div class="card-value online"><span class="dot green"></span>Online</div>
      <div class="card-sub">All systems operational</div>
    </div>
    <div class="card">
      <div class="card-label">Database</div>
      <div class="card-value ${status.dbConnected ? 'online' : 'offline'}">
        <span class="dot ${status.dbConnected ? 'green' : 'red'}"></span>${status.dbConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div class="card-sub">${status.dbLatency !== null ? `Latency: ${status.dbLatency}ms` : 'MongoDB Atlas'}</div>
    </div>
    <div class="card">
      <div class="card-label">Uptime</div>
      <div class="card-value" style="color:#E8B84B">${status.uptime}</div>
      <div class="card-sub">Since last restart</div>
    </div>
    <div class="card">
      <div class="card-label">Node.js</div>
      <div class="card-value" style="color:#4F63FF">${status.nodeVersion}</div>
      <div class="card-sub">${status.platform}</div>
    </div>
  </div>

  <div class="section">
    <h2>API Endpoints</h2>
    <table>
      ${API_ENDPOINTS.map(e => `
      <tr>
        <td><span class="method" style="color:${methodColor[e.method] || '#94A3B8'}">${e.method}</span></td>
        <td class="path">${e.path}</td>
        <td class="desc">${e.desc}</td>
      </tr>`).join('')}
    </table>
  </div>

  <footer>GoPilot Backend API &mdash; ${new Date().getFullYear()}</footer>
</div>
</body>
</html>`;

export const registerWebRoutes = (app) => {
  // HTML status dashboard
  app.get('/', async (req, res) => {
    const dbConnected = req.app.locals.dbConnected;
    const dbLatency   = await getDbLatency(dbConnected);
    const html = buildHtml({
      dbConnected,
      dbLatency,
      uptime:      formatUptime(Date.now() - START_TIME),
      env:         process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform:    process.platform,
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // /health — used by Render, Docker HEALTHCHECK, uptime monitors
  app.get('/health', async (req, res) => {
    const dbConnected = req.app.locals.dbConnected;
    const dbLatency   = await getDbLatency(dbConnected);
    const status = dbConnected ? 200 : 503;
    res.status(status).json({
      success:     dbConnected,
      status:      dbConnected ? 'healthy' : 'degraded',
      uptime:      formatUptime(Date.now() - START_TIME),
      database:    dbConnected ? 'connected' : 'disconnected',
      dbLatencyMs: dbLatency,
      environment: process.env.NODE_ENV || 'development',
      timestamp:   new Date().toISOString(),
    });
  });
};
