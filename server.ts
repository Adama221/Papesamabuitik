import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "3d3dd60177e60537427c87735fb978db0095c4e37e7ede848ced6d0725aba0c5726d1d718e3c0303ea2fcf6674f98480ade69d378b1e92b7ac6aa311806f79a3";
const ADMIN_USER = process.env.ADMIN_USER || "Papesn";
const ADMIN_PASS = process.env.ADMIN_PASS || "Pape221@";

// Initialize SQLite Database
const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'XOF',
    image TEXT,
    stock INTEGER DEFAULT 0,
    category TEXT,
    wave_payment_link TEXT,
    om_payment_link TEXT,
    commission REAL DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS affiliates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    payment_info TEXT,
    earnings REAL DEFAULT 0,
    sales INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Try to add new columns to existing affiliates table if they don't exist
try {
  db.exec(`ALTER TABLE products ADD COLUMN om_payment_link TEXT;`);
} catch (e) { /* Ignore if column exists */ }
try {
  db.exec(`ALTER TABLE affiliates ADD COLUMN phone TEXT;`);
} catch (e) { /* Ignore if column exists */ }
try {
  db.exec(`ALTER TABLE affiliates ADD COLUMN payment_info TEXT;`);
} catch (e) { /* Ignore if column exists */ }
try {
  db.exec(`ALTER TABLE affiliates ADD COLUMN status TEXT DEFAULT 'pending';`);
} catch (e) { /* Ignore if column exists */ }

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size for base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Identifiants incorrects" });
    }
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    // Parse images if needed, but we store as string
    res.json(products);
  });

  app.post("/api/products", authenticateToken, (req, res) => {
    const { id, name, description, price, currency, image, stock, category, wave_payment_link, om_payment_link, commission } = req.body;
    const stmt = db.prepare(`
      INSERT INTO products (id, name, description, price, currency, image, stock, category, wave_payment_link, om_payment_link, commission)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, description, price, currency, image, stock, category, wave_payment_link, om_payment_link, commission);
    res.status(201).json({ success: true });
  });

  app.put("/api/products/:id", authenticateToken, (req, res) => {
    const { name, description, price, currency, image, stock, category, wave_payment_link, om_payment_link, commission } = req.body;
    const stmt = db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, currency = ?, image = ?, stock = ?, category = ?, wave_payment_link = ?, om_payment_link = ?, commission = ?
      WHERE id = ?
    `);
    stmt.run(name, description, price, currency, image, stock, category, wave_payment_link, om_payment_link, commission, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", authenticateToken, (req, res) => {
    const stmt = db.prepare("DELETE FROM products WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  // Settings (Cover Image)
  app.get("/api/settings/cover", (req, res) => {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'coverImage'").get() as any;
    res.json({ coverImage: row ? row.value : null });
  });

  app.post("/api/settings/cover", authenticateToken, (req, res) => {
    const { coverImage } = req.body;
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES ('coverImage', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(coverImage);
    res.json({ success: true });
  });

  // Affiliates
  app.get("/api/affiliates", authenticateToken, (req, res) => {
    const affiliates = db.prepare("SELECT * FROM affiliates").all();
    res.json(affiliates);
  });

  app.post("/api/affiliates/register", (req, res) => {
    const { name, phone, payment_info } = req.body;
    const id = 'REF' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const stmt = db.prepare(`
      INSERT INTO affiliates (id, name, phone, payment_info, earnings, sales, clicks)
      VALUES (?, ?, ?, ?, 0, 0, 0)
    `);
    stmt.run(id, name, phone, payment_info);
    res.status(201).json({ id, name, phone, payment_info, earnings: 0, sales: 0, clicks: 0 });
  });

  app.post("/api/affiliates/login", (req, res) => {
    const { phone } = req.body;
    const affiliate = db.prepare("SELECT * FROM affiliates WHERE phone = ?").get(phone);
    if (affiliate) {
      res.json(affiliate);
    } else {
      res.status(404).json({ error: "Affilié non trouvé" });
    }
  });

  app.post("/api/affiliates/:id/click", (req, res) => {
    const stmt = db.prepare("UPDATE affiliates SET clicks = clicks + 1 WHERE id = ?");
    const result = stmt.run(req.params.id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Affilié non trouvé" });
    }
  });

  app.post("/api/affiliates/:id/sale", (req, res) => {
    const { commissionAmount } = req.body;
    if (!commissionAmount || isNaN(commissionAmount)) {
      return res.status(400).json({ error: "Montant de commission invalide" });
    }
    const stmt = db.prepare("UPDATE affiliates SET sales = sales + 1, earnings = earnings + ? WHERE id = ?");
    const result = stmt.run(commissionAmount, req.params.id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Affilié non trouvé" });
    }
  });

  app.put("/api/affiliates/:id", authenticateToken, (req, res) => {
    const { name, phone, payment_info, earnings, sales, clicks, status } = req.body;
    const stmt = db.prepare(`
      UPDATE affiliates 
      SET name = ?, phone = ?, payment_info = ?, earnings = ?, sales = ?, clicks = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(name, phone, payment_info, earnings, sales, clicks, status, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/affiliates/:id/verify", authenticateToken, (req, res) => {
    const stmt = db.prepare("UPDATE affiliates SET status = 'verified' WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/affiliates/:id", authenticateToken, (req, res) => {
    const stmt = db.prepare("DELETE FROM affiliates WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
