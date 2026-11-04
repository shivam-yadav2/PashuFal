import * as animalsRepo from './animalsRepository';
import * as contactsRepo from './contactsRepository';
import * as enquiriesRepo from './enquiriesRepository';
import * as ordersRepo from './ordersRepository';
import * as dairyRepo from './dairyRepository';
import * as deliveryRepo from './deliveryRepository';
import * as financeRepo from './financeRepository';
import * as auditRepo from './auditRepository';

export const db = {
  // Livestock
  getAnimals: animalsRepo.getAnimals,
  getPublicAnimals: animalsRepo.getPublicAnimals,
  getAnimalById: animalsRepo.getAnimalById,
  createAnimal: animalsRepo.createAnimal,
  updateAnimal: animalsRepo.updateAnimal,
  reserveAnimal: animalsRepo.reserveAnimal,
  releaseReservation: animalsRepo.releaseReservation,
  completeSale: animalsRepo.completeSale,
  getTransactions: animalsRepo.getTransactions,

  // Contacts
  getContacts: contactsRepo.getContacts,
  getContactById: contactsRepo.getContactById,
  createContact: contactsRepo.createContact,

  // Enquiries
  getEnquiries: enquiriesRepo.getEnquiries,
  getEnquiryById: enquiriesRepo.getEnquiryById,
  createEnquiry: enquiriesRepo.createEnquiry,
  updateEnquiryStatus: enquiriesRepo.updateEnquiryStatus,

  // Orders
  getOrders: ordersRepo.getOrders,
  getOrderById: ordersRepo.getOrderById,
  createOrder: ordersRepo.createOrder,
  updateOrderStatus: ordersRepo.updateOrderStatus,

  // Dairy
  getProductionEntries: dairyRepo.getProductionEntries,
  addProductionEntry: dairyRepo.addProductionEntry,
  getCollectionEntries: dairyRepo.getCollectionEntries,
  addCollectionEntry: dairyRepo.addCollectionEntry,
  getInventoryMovements: dairyRepo.getInventoryMovements,
  getStockReconciliation: dairyRepo.getStockReconciliation,

  // Deliveries & subscriptions
  getSubscriptions: deliveryRepo.getSubscriptions,
  createSubscription: deliveryRepo.createSubscription,
  getDeliveries: deliveryRepo.getDeliveries,
  generateDailyDeliveries: deliveryRepo.generateDailyDeliveries,
  updateDeliveryStatus: deliveryRepo.updateDeliveryStatus,

  // Finance
  getFinancialSummary: financeRepo.getFinancialSummary,
  getPayments: financeRepo.getPayments,
  addPayment: financeRepo.addPayment,

  // Audit
  getAuditLogs: auditRepo.getAuditLogs,
};
