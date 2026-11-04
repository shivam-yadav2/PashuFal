import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db/repositories/index.ts';
import { BUSINESS_CONFIG } from './src/config/business.ts';
import { testMySQLConnection, isMySQLEnabled, getMySQLConfig } from './src/server/db/mysql.ts';
import { handleApiError, BusinessError } from './src/server/errors.ts';
import { getSiteSettings, saveSiteSettings, getSmtpSettings, saveSmtpSettings } from './src/server/db/repositories/settingsRepository.ts';
import { notifyNewEnquiry, sendTestEmail } from './src/server/mailer.ts';
import { startListening } from './src/server/listen.ts';

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
app.get('/api/business', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getSiteSettings() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

// ----------------- SITE SETTINGS (admin-editable content) -----------------
// NOTE: the PUT/POST routes below are not yet protected by server-side auth —
// that lands with the authentication plan, alongside every other admin route.
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getSiteSettings() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await saveSiteSettings(req.body ?? {}) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/settings/smtp', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getSmtpSettings() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.put('/api/settings/smtp', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await saveSmtpSettings(req.body ?? {}) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/settings/smtp/test', async (req: Request, res: Response) => {
  try {
    const to = String(req.body?.to ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new BusinessError('Enter a valid email address to send the test to.');
    }
    await sendTestEmail(to);
    res.json({ success: true });
  } catch (err: any) {
    handleApiError(err, res);
  }
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
    handleApiError(err, res);
  }
});

app.get('/api/livestock/public', async (_req: Request, res: Response) => {
  try {
    const publicAnimals = await db.getPublicAnimals();
    // Strip staff-only fields: who the seller is, our brokerage cut, internal notes.
    const safe = publicAnimals.map(({ internalNotes, sellerContactId, brokerageCommission, ...rest }) => ({
      ...rest,
      listing: { ...rest.listing, reservedForContactId: undefined, soldToContactId: undefined },
    }));
    res.json({ success: true, data: safe });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/livestock/transactions', async (_req: Request, res: Response) => {
  try {
    const txns = await db.getTransactions();
    res.json({ success: true, data: txns });
  } catch (err: any) {
    handleApiError(err, res);
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
    handleApiError(err, res);
  }
});

app.post('/api/livestock', async (req: Request, res: Response) => {
  try {
    const created = await db.createAnimal(req.body, req.body.recordedBy || 'Owner');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    handleApiError(err, res);
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
    handleApiError(err, res);
  }
});

app.post('/api/livestock/:id/reserve', async (req: Request, res: Response) => {
  try {
    const { deposit, contactId, recordedBy } = req.body;
    const reserved = await db.reserveAnimal(req.params.id, deposit || 5000, contactId, recordedBy);
    res.json({ success: true, data: reserved });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/livestock/:id/release', async (req: Request, res: Response) => {
  try {
    const released = await db.releaseReservation(req.params.id, req.body.recordedBy);
    res.json({ success: true, data: released });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/livestock/:id/sell', async (req: Request, res: Response) => {
  try {
    const { buyerContactId, agreedPrice, notes, recordedBy } = req.body;
    const txn = await db.completeSale(req.params.id, buyerContactId, agreedPrice, notes, recordedBy);
    res.json({ success: true, data: txn });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

// Contacts Directory
app.get('/api/contacts', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getContacts() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/contacts', async (req: Request, res: Response) => {
  try {
    const created = await db.createContact(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

// Dairy Operations
app.get('/api/dairy/production', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json({ success: true, data: await db.getProductionEntries(date) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/dairy/production', async (req: Request, res: Response) => {
  try {
    const entry = await db.addProductionEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/dairy/collection', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json({ success: true, data: await db.getCollectionEntries(date) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/dairy/collection', async (req: Request, res: Response) => {
  try {
    const entry = await db.addCollectionEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/dairy/reconciliation', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || undefined;
    res.json({ success: true, data: await db.getStockReconciliation(date) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/dairy/movements', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json({ success: true, data: await db.getInventoryMovements(date) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/dairy/subscriptions', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getSubscriptions() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/dairy/subscriptions', async (req: Request, res: Response) => {
  try {
    const sub = await db.createSubscription(req.body);
    res.status(201).json({ success: true, data: sub });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/dairy/deliveries', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || undefined;
    res.json({ success: true, data: await db.getDeliveries(date) });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/dairy/deliveries/generate', async (req: Request, res: Response) => {
  try {
    const { date, shift, recordedBy } = req.body;
    const deliveries = await db.generateDailyDeliveries(date, shift, recordedBy);
    res.json({ success: true, data: deliveries });
  } catch (err: any) {
    handleApiError(err, res);
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
    handleApiError(err, res);
  }
});

// Financials & Audit
app.get('/api/finance/summary', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getFinancialSummary() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/finance/payments', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getPayments() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/finance/payments', async (req: Request, res: Response) => {
  try {
    const payment = await db.addPayment(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.get('/api/audit', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getAuditLogs() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

// ----------------- PRD ENQUIRIES & ORDERS -----------------
app.get('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    res.json({ success: true, data: await db.getEnquiries(status) });
  } catch (err: any) {
    handleApiError(err, res);
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
    handleApiError(err, res);
  }
});

app.post('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const created = await db.createEnquiry(req.body);
    res.status(201).json({ success: true, data: created });
    void notifyNewEnquiry(created);
  } catch (err: any) {
    handleApiError(err, res);
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
    handleApiError(err, res);
  }
});

app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await db.getOrders() });
  } catch (err: any) {
    handleApiError(err, res);
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const created = await db.createOrder(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    handleApiError(err, res);
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
    handleApiError(err, res);
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

  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Run Vite's live-reload websocket over this app's own port instead of
        // its separate default (24678), which collides with any other Vite dev
        // server running on the same machine. Whether HMR is on at all is still
        // controlled by `server.hmr` in vite.config.ts (DISABLE_HMR).
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  try {
    await startListening(httpServer, PORT, '0.0.0.0');
  } catch (err: any) {
    console.error(`[Server] Could not start: ${err.message}`);
    process.exit(1);
  }
  console.log(`[${BUSINESS_CONFIG.brandName}] Server running at http://localhost:${PORT}`);
}

startServer();
