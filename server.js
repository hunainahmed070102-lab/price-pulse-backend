const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const complaintRoutes = require('./routes/complaints');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

app.use(cors({
  origin: '*', // Allow all origins for production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/price_control_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('DB_STATUS: CONNECTED'))
  .catch(err => console.error('DB_STATUS: ERROR', err));

app.get('/api/raw-view/:id', async (req, res) => {
  try {
    const Product = mongoose.models.Product || mongoose.model('Product');
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).send('Document not found.');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(doc, null, 4));
  } catch {
    res.status(404).send('Invalid ID or database error.');
  }
});

app.get('/api/raw-view/complaint/:id', async (req, res) => {
  try {
    const Complaint = mongoose.models.Complaint || mongoose.model('Complaint');
    const doc = await Complaint.findById(req.params.id);
    if (!doc) return res.status(404).send('Complaint not found.');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(doc, null, 4));
  } catch {
    res.status(404).send('Invalid ID or database error.');
  }
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Backend Explorer</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; margin: 0; background: #f5f5f5; color: #333; }
    .container { background: white; padding: 20px; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 15px; margin: 0 0 20px 0; }
    h2 { margin-top: 25px; margin-bottom: 10px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #ddd; font-size: 14px; }
    th, td { padding: 10px 12px; border: 1px solid #ddd; text-align: left; }
    th { background: #f8f9fa; font-size: 11px; text-transform: uppercase; color: #555; font-weight: 600; }
    tr:hover { background: #f8f9fa; }
    .loading { color: #888; padding: 15px; text-align: center; font-size: 13px; }
    a { color: #228be6; font-weight: 500; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .status-indicator { width: 8px; height: 8px; background: #2b8a3e; border-radius: 50%; display: inline-block; margin-right: 6px; }
    .no { width: 40px; text-align: center; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex;align-items:center;margin-bottom:10px;color:#2b8a3e;font-weight:bold;font-size:12px;">
      <span class="status-indicator"></span> Server Online
    </div>
    <h1>Backend Data Explorer</h1>
    <h2>Products</h2>
    <div id="products-loading" class="loading">Loading products...</div>
    <table id="products-table" style="display:none;">
      <thead>
        <tr><th class="no">No.</th><th>Name</th><th>Category</th><th>Price</th><th>Unit</th><th>Updated</th><th>Action</th></tr>
      </thead>
      <tbody id="products-body"></tbody>
    </table>
    <h2>Complaints</h2>
    <div id="complaints-loading" class="loading">Loading complaints...</div>
    <table id="complaints-table" style="display:none;">
      <thead>
        <tr><th class="no">No.</th><th>Product</th><th>Complainant</th><th>Status</th><th>Date</th><th>Action</th></tr>
      </thead>
      <tbody id="complaints-body"></tbody>
    </table>
  </div>
  <script>
    async function loadData() {
      try {
        const [pRes, cRes] = await Promise.all([fetch('/api/products').then(r => r.json()), fetch('/api/complaints').then(r => r.json())]);
        const products = pRes.success ? pRes.data : [];
        const complaints = cRes.success ? cRes.data : [];

        document.getElementById('products-loading').style.display = 'none';
        document.getElementById('products-table').style.display = 'table';
        document.getElementById('products-body').innerHTML = products.length ? products.map((p, i) => {
          const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '';
          return \`<tr><td class="no">\${i + 1}</td><td><b>\${p.name}</b></td><td>\${cat}</td><td><b>\${p.price}</b></td><td>\${p.unit}</td><td>\${new Date(p.updatedAt || Date.now()).toLocaleDateString()}</td><td><a href="/api/raw-view/\${p._id}" target="_blank">JSON</a></td></tr>\`;
        }).join('') : '<tr><td colspan="7" style="text-align:center;color:#888;">No products found</td></tr>';

        document.getElementById('complaints-loading').style.display = 'none';
        document.getElementById('complaints-table').style.display = 'table';
        document.getElementById('complaints-body').innerHTML = complaints.length ? complaints.map((c, i) => {
          const status = c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Pending';
          return \`<tr><td class="no">\${i + 1}</td><td><b>\${c.productName || 'N/A'}</b></td><td>\${c.customerName || 'Anonymous'}</td><td>\${status}</td><td>\${new Date(c.createdAt || Date.now()).toLocaleDateString()}</td><td><a href="/api/raw-view/complaint/\${c._id}" target="_blank">JSON</a></td></tr>\`;
        }).join('') : '<tr><td colspan="6" style="text-align:center;color:#888;">No complaints found</td></tr>';
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    loadData();
  </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log('SERVER ONLINE: http://localhost:' + PORT + ' (accessible from all interfaces)'));
