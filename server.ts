import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db/repositories/index.ts';
import { BUSINESS_CONFIG } from './src/config/business.ts';
import { testMySQLConnection, isMySQLEnabled, getMySQLConfig } from './src/server/db/mysql.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// ----------------- HEALTH & SYSTEM STATUS -----------------
app.get('/api/health', async (_req: Request, res: Response) => {
  const mysqlEnabled = isMySQLEnabled();
  const mysqlConfig = getMySQLConfig();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mysql: {
      enabled: mysqlEnabled,
      host: mysqlConfig?.host || null,
      database: mysqlConfig?.database || null,
      port: mysqlConfig?.port || null,
    },
    version: '1.0.0',
    location: BUSINESS_CONFIG.location.displayAddress,
  });
});

// ----------------- API ROUTES -----------------

// Business Configuration
app.get('/api/business', (_req: Request, res: Response) => {
  res.json({ success: true, data: BUSINESS_CONFIG });
});

// Livestock Listings
app.get('/api/livestock', async (req: Request, res: Response) => {
  try {
    const { species, breed, minPrice, maxPrice, status, search } = req.query;
    const animals = await db.getAnimals({
      species: species as string,
      breed: breed as string,
      minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
      status: status as string,
      search: search as string,
    });
    res.json({ success: true, data: animals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/livestock/public', async (_req: Request, res: Response) => {
  try {
    const publicAnimals = await db.getPublicAnimals();
    res.json({ success: true, data: publicAnimals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/livestock/transactions', async (_req: Request, res: Response) => {
  try {
    const txns = await db.getTransactions();
    res.json({ success: true, data: txns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/livestock/:id', async (req: Request, res: Response) => {
  try {
    const animal = await db.getAnimalById(req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, error: 'Animal record not found' });
    }
    res.json({ success: true, data: animal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/livestock', async (req: Request, res: Response) => {
  try {
    const created = await db.createAnimal(req.body, req.body.recordedBy || 'Owner');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/livestock/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateAnimal(req.params.id, req.body, req.body.recordedBy || 'Owner');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Animal not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/livestock/:id/reserve', async (req: Request, res: Response) => {
  try {
    const { deposit, contactId, recordedBy } = req.body;
    const reserved = await db.reserveAnimal(req.params.id, deposit || 5000, contactId, recordedBy);
    res.json({ success: true, data: reserved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/livestock/:id/release', async (req: Request, res: Response) => {
  try {
    const released = await db.releaseReservation(req.params.id, req.body.recordedBy);
    res.json({ success: true, data: released });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/livestock/:id/sell', async (req: Request, res: Response) => {
  try {
    const { buyerContactId, agreedPrice, notes, recordedBy } = req.body;
    const txn = await db.completeSale(req.params.id, buyerContactId, agreedPrice, notes, recordedBy);
    res.json({ success: true, data: txn });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Contacts Directory
app.get('/api/contacts', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getContacts() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/contacts', async (req: Request, res: Response) => {
  try {
    const created = await db.createContact(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Dairy Operations
app.get('/api/dairy/production', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json({ success: true, data: await db.getProductionEntries(date) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/dairy/production', async (req: Request, res: Response) => {
  try {
    const entry = await db.addProductionEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/dairy/collection', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json({ success: true, data: await db.getCollectionEntries(date) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/dairy/collection', async (req: Request, res: Response) => {
  try {
    const entry = await db.addCollectionEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/dairy/reconciliation', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || undefined;
    res.json({ success: true, data: await db.getStockReconciliation(date) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/dairy/movements', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json({ success: true, data: await db.getInventoryMovements(date) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/dairy/subscriptions', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getSubscriptions() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/dairy/subscriptions', async (req: Request, res: Response) => {
  try {
    const sub = await db.createSubscription(req.body);
    res.status(201).json({ success: true, data: sub });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/dairy/deliveries', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || undefined;
    res.json({ success: true, data: await db.getDeliveries(date) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/dairy/deliveries/generate', async (req: Request, res: Response) => {
  try {
    const { date, shift, recordedBy } = req.body;
    const deliveries = await db.generateDailyDeliveries(date, shift, recordedBy);
    res.json({ success: true, data: deliveries });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.patch('/api/dairy/deliveries/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, actualLitres, skipReason, recordedBy } = req.body;
    const updated = await db.updateDeliveryStatus(req.params.id, status, actualLitres, skipReason, recordedBy);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Financials & Audit
app.get('/api/finance/summary', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getFinancialSummary() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/finance/payments', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getPayments() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/finance/payments', async (req: Request, res: Response) => {
  try {
    const payment = await db.addPayment(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/audit', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getAuditLogs() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- PRD ENQUIRIES & ORDERS -----------------
app.get('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    res.json({ success: true, data: await db.getEnquiries(status) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/enquiries/:id', async (req: Request, res: Response) => {
  try {
    const enquiry = await db.getEnquiryById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const created = await db.createEnquiry(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.patch('/api/enquiries/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, quotationNotes, quotationAmount, transportQuotation, assignedStaff } = req.body;
    const updated = await db.updateEnquiryStatus(
      req.params.id,
      status,
      quotationNotes,
      quotationAmount,
      transportQuotation,
      assignedStaff
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Enquiry record not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getOrders() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const created = await db.createOrder(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, deliveryStatus, transporterDetails } = req.body;
    const updated = await db.updateOrderStatus(req.params.id, status, deliveryStatus, transporterDetails);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order record not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- VITE & STATIC SERVING -----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  const connected = await testMySQLConnection();
  if (!connected) {
    console.error('[Database] FATAL: Could not connect to MySQL. Check MYSQL_HOST/PORT/USER/PASSWORD/DATABASE in .env. Server will not start without a working database.');
    process.exit(1);
  }

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Purvanchal Dairy & Pashu Kendra] Server running at http://localhost:${PORT}`);
  });
}

startServer();
