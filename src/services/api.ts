import { 
  Animal, 
  Contact, 
  LivestockTransaction, 
  MilkCollectionEntry, 
  MilkProductionEntry, 
  MilkInventoryMovement, 
  DeliverySubscription, 
  MilkDelivery, 
  PaymentRecord, 
  AuditEvent,
  Enquiry,
  EnquiryStatus,
  LivestockOrder
} from '../types/domain';

async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ success: false, error: `Request failed (${res.status})` }));
  if (!data.success) throw new Error(data.error || `Request failed (${res.status})`);
  return data.data as T;
}

export const settingsApi = {
  getSite: () => send<import('../config/business').BusinessConfig>('/api/settings', 'GET'),
  saveSite: (partial: import('../config/business').BusinessSettings) =>
    send<import('../config/business').BusinessConfig>('/api/settings', 'PUT', partial),
  getSmtp: () => send<SmtpSettingsView>('/api/settings/smtp', 'GET'),
  saveSmtp: (partial: Partial<SmtpSettingsView> & { password?: string }) =>
    send<SmtpSettingsView>('/api/settings/smtp', 'PUT', partial),
  testSmtp: (to: string) => send<void>('/api/settings/smtp/test', 'POST', { to }),
};

export interface SmtpSettingsView {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  notifyEmail: string;
  hasPassword: boolean;
}

export const api = {
  // Livestock
  async getLivestock(params?: { species?: string; breed?: string; minPrice?: number; maxPrice?: number; status?: string; search?: string }): Promise<Animal[]> {
    const q = new URLSearchParams();
    if (params?.species && params.species !== 'ALL') q.set('species', params.species);
    if (params?.breed && params.breed !== 'ALL') q.set('breed', params.breed);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.minPrice !== undefined) q.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) q.set('maxPrice', params.maxPrice.toString());
    if (params?.search) q.set('search', params.search);

    const res = await fetch(`/api/livestock?${q.toString()}`);
    const data = await res.json();
    return data.data;
  },

  async getPublicLivestock(): Promise<Animal[]> {
    const res = await fetch('/api/livestock/public');
    const data = await res.json();
    return data.data;
  },

  async getAnimalById(id: string): Promise<Animal> {
    const res = await fetch(`/api/livestock/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async createAnimal(animal: Partial<Animal>, recordedBy: string): Promise<Animal> {
    const res = await fetch('/api/livestock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...animal, recordedBy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async updateAnimal(id: string, updates: Partial<Animal>, recordedBy: string): Promise<Animal> {
    const res = await fetch(`/api/livestock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, recordedBy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async reserveAnimal(id: string, deposit: number, contactId: string, recordedBy: string): Promise<Animal> {
    const res = await fetch(`/api/livestock/${id}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deposit, contactId, recordedBy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async releaseReservation(id: string, recordedBy: string): Promise<Animal> {
    const res = await fetch(`/api/livestock/${id}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordedBy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async completeSale(id: string, buyerContactId: string, agreedPrice: number, notes?: string, recordedBy?: string): Promise<LivestockTransaction> {
    const res = await fetch(`/api/livestock/${id}/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerContactId, agreedPrice, notes, recordedBy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getTransactions(): Promise<LivestockTransaction[]> {
    const res = await fetch('/api/livestock/transactions');
    const data = await res.json();
    return data.data;
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const res = await fetch('/api/contacts');
    const data = await res.json();
    return data.data;
  },

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Dairy
  async getProduction(date?: string): Promise<MilkProductionEntry[]> {
    const res = await fetch(`/api/dairy/production${date ? `?date=${date}` : ''}`);
    const data = await res.json();
    return data.data;
  },

  async addProduction(entry: Partial<MilkProductionEntry>): Promise<MilkProductionEntry> {
    const res = await fetch('/api/dairy/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getCollections(date?: string): Promise<MilkCollectionEntry[]> {
    const res = await fetch(`/api/dairy/collection${date ? `?date=${date}` : ''}`);
    const data = await res.json();
    return data.data;
  },

  async addCollection(entry: Partial<MilkCollectionEntry>): Promise<MilkCollectionEntry> {
    const res = await fetch('/api/dairy/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getReconciliation(date?: string) {
    const res = await fetch(`/api/dairy/reconciliation${date ? `?date=${date}` : ''}`);
    const data = await res.json();
    return data.data;
  },

  async getInventoryMovements(date?: string): Promise<MilkInventoryMovement[]> {
    const res = await fetch(`/api/dairy/movements${date ? `?date=${date}` : ''}`);
    const data = await res.json();
    return data.data;
  },

  async getSubscriptions(): Promise<DeliverySubscription[]> {
    const res = await fetch('/api/dairy/subscriptions');
    const data = await res.json();
    return data.data;
  },

  async createSubscription(sub: Partial<DeliverySubscription>): Promise<DeliverySubscription> {
    const res = await fetch('/api/dairy/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getDeliveries(date?: string): Promise<MilkDelivery[]> {
    const res = await fetch(`/api/dairy/deliveries${date ? `?date=${date}` : ''}`);
    const data = await res.json();
    return data.data;
  },

  async generateDeliveries(date: string, shift: 'MORNING' | 'EVENING', recordedBy: string): Promise<MilkDelivery[]> {
    const res = await fetch('/api/dairy/deliveries/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shift, recordedBy }),
    });
    const data = await res.json();
    return data.data;
  },

  async updateDeliveryStatus(id: string, status: string, actualLitres?: number, skipReason?: string, recordedBy?: string): Promise<MilkDelivery> {
    const res = await fetch(`/api/dairy/deliveries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actualLitres, skipReason, recordedBy }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Finance & Audit
  async getFinancialSummary() {
    const res = await fetch('/api/finance/summary');
    const data = await res.json();
    return data.data;
  },

  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch('/api/finance/payments');
    const data = await res.json();
    return data.data;
  },

  async addPayment(payment: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const res = await fetch('/api/finance/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getAuditLogs(): Promise<AuditEvent[]> {
    const res = await fetch('/api/audit');
    const data = await res.json();
    return data.data;
  },

  // PRD Enquiries & Orders
  async getEnquiries(status?: string): Promise<Enquiry[]> {
    const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`/api/enquiries${q}`);
    const data = await res.json();
    return data.data;
  },

  async getEnquiryById(id: string): Promise<Enquiry> {
    const res = await fetch(`/api/enquiries/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async createEnquiry(enquiry: Partial<Enquiry>): Promise<Enquiry> {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async updateEnquiryStatus(
    id: string, 
    status: EnquiryStatus, 
    quotationNotes?: string, 
    quotationAmount?: number, 
    transportQuotation?: number,
    assignedStaff?: string
  ): Promise<Enquiry> {
    const res = await fetch(`/api/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, quotationNotes, quotationAmount, transportQuotation, assignedStaff }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getOrders(): Promise<LivestockOrder[]> {
    const res = await fetch('/api/orders');
    const data = await res.json();
    return data.data;
  },

  async createOrder(order: Partial<LivestockOrder>): Promise<LivestockOrder> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async updateOrderStatus(
    id: string, 
    status: EnquiryStatus, 
    deliveryStatus?: string, 
    transporterDetails?: string
  ): Promise<LivestockOrder> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, deliveryStatus, transporterDetails }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
};
