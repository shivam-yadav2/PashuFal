import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/mockDb.ts';
import { BUSINESS_CONFIG } from './src/config/business.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// ----------------- API ROUTES -----------------

// Business Configuration
app.get('/api/business', (_req: Request, res: Response) => {
  res.json({ success: true, data: BUSINESS_CONFIG });
});

// Livestock Listings
app.get('/api/livestock', (req: Request, res: Response) => {
  const { species, breed, minPrice, maxPrice, status, search } = req.query;
  const animals = db.getAnimals({
    species: species as string,
    breed: breed as string,
    minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
    status: status as string,
    search: search as string,
  });
  res.json({ success: true, data: animals });
});

app.get('/api/livestock/public', (_req: Request, res: Response) => {
  const publicAnimals = db.getPublicAnimals();
  res.json({ success: true, data: publicAnimals });
});

app.get('/api/livestock/transactions', (_req: Request, res: Response) => {
  const txns = (db as any).state.transactions;
  res.json({ success: true, data: txns });
});

app.get('/api/livestock/:id', (req: Request, res: Response) => {
  const animal = db.getAnimalById(req.params.id);
  if (!animal) {
    return res.status(404).json({ success: false, error: 'Animal record not found' });
  }
  res.json({ success: true, data: animal });
});

app.post('/api/livestock', (req: Request, res: Response) => {
  try {
    const created = db.createAnimal(req.body, req.body.recordedBy || 'Owner');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/livestock/:id', (req: Request, res: Response) => {
  const updated = db.updateAnimal(req.params.id, req.body, req.body.recordedBy || 'Owner');
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Animal not found' });
  }
  res.json({ success: true, data: updated });
});

app.post('/api/livestock/:id/reserve', (req: Request, res: Response) => {
  try {
    const { deposit, contactId, recordedBy } = req.body;
    const reserved = db.reserveAnimal(req.params.id, deposit || 5000, contactId, recordedBy);
    res.json({ success: true, data: reserved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/livestock/:id/release', (req: Request, res: Response) => {
  try {
    const released = db.releaseReservation(req.params.id, req.body.recordedBy);
    res.json({ success: true, data: released });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/livestock/:id/sell', (req: Request, res: Response) => {
  try {
    const { buyerContactId, agreedPrice, notes, recordedBy } = req.body;
    const txn = db.completeSale(req.params.id, buyerContactId, agreedPrice, notes, recordedBy);
    res.json({ success: true, data: txn });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Contacts Directory
app.get('/api/contacts', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getContacts() });
});

app.post('/api/contacts', (req: Request, res: Response) => {
  const created = db.createContact(req.body);
  res.status(201).json({ success: true, data: created });
});

// Dairy Operations
app.get('/api/dairy/production', (req: Request, res: Response) => {
  const date = req.query.date as string | undefined;
  res.json({ success: true, data: db.getProductionEntries(date) });
});

app.post('/api/dairy/production', (req: Request, res: Response) => {
  const entry = db.addProductionEntry(req.body);
  res.status(201).json({ success: true, data: entry });
});

app.get('/api/dairy/collection', (req: Request, res: Response) => {
  const date = req.query.date as string | undefined;
  res.json({ success: true, data: db.getCollectionEntries(date) });
});

app.post('/api/dairy/collection', (req: Request, res: Response) => {
  const entry = db.addCollectionEntry(req.body);
  res.status(201).json({ success: true, data: entry });
});

app.get('/api/dairy/reconciliation', (req: Request, res: Response) => {
  const date = (req.query.date as string) || undefined;
  res.json({ success: true, data: db.getStockReconciliation(date) });
});

app.get('/api/dairy/movements', (req: Request, res: Response) => {
  const date = req.query.date as string | undefined;
  res.json({ success: true, data: db.getInventoryMovements(date) });
});

app.get('/api/dairy/subscriptions', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getSubscriptions() });
});

app.post('/api/dairy/subscriptions', (req: Request, res: Response) => {
  const sub = db.createSubscription(req.body);
  res.status(201).json({ success: true, data: sub });
});

app.get('/api/dairy/deliveries', (req: Request, res: Response) => {
  const date = (req.query.date as string) || undefined;
  res.json({ success: true, data: db.getDeliveries(date) });
});

app.post('/api/dairy/deliveries/generate', (req: Request, res: Response) => {
  const { date, shift, recordedBy } = req.body;
  const deliveries = db.generateDailyDeliveries(date, shift, recordedBy);
  res.json({ success: true, data: deliveries });
});

app.patch('/api/dairy/deliveries/:id/status', (req: Request, res: Response) => {
  const { status, actualLitres, skipReason, recordedBy } = req.body;
  const updated = db.updateDeliveryStatus(req.params.id, status, actualLitres, skipReason, recordedBy);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Delivery record not found' });
  }
  res.json({ success: true, data: updated });
});

// Financials & Audit
app.get('/api/finance/summary', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getFinancialSummary() });
});

app.get('/api/finance/payments', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getPayments() });
});

app.post('/api/finance/payments', (req: Request, res: Response) => {
  const payment = db.addPayment(req.body);
  res.status(201).json({ success: true, data: payment });
});

app.get('/api/audit', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getAuditLogs() });
});

// ----------------- PRD ENQUIRIES & ORDERS -----------------
app.get('/api/enquiries', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  res.json({ success: true, data: db.getEnquiries(status) });
});

app.get('/api/enquiries/:id', (req: Request, res: Response) => {
  const enquiry = db.getEnquiryById(req.params.id);
  if (!enquiry) {
    return res.status(404).json({ success: false, error: 'Enquiry not found' });
  }
  res.json({ success: true, data: enquiry });
});

app.post('/api/enquiries', (req: Request, res: Response) => {
  try {
    const created = db.createEnquiry(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.patch('/api/enquiries/:id/status', (req: Request, res: Response) => {
  const { status, quotationNotes, quotationAmount, transportQuotation, assignedStaff } = req.body;
  const updated = db.updateEnquiryStatus(
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
});

app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getOrders() });
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const created = db.createOrder(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, deliveryStatus, transporterDetails } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status, deliveryStatus, transporterDetails);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Order record not found' });
  }
  res.json({ success: true, data: updated });
});

// ----------------- VITE & STATIC SERVING -----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

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
