import { Client, Quote, Site, Payment, Employee, Timesheet } from '@/types';

const STORAGE_KEYS = {
  CLIENTS: 'paysagiste_clients',
  QUOTES: 'paysagiste_quotes',
  SITES: 'paysagiste_sites',
  PAYMENTS: 'paysagiste_payments',
  EMPLOYEES: 'paysagiste_employees',
  TIMESHEETS: 'paysagiste_timesheets',
};

// Generic storage functions
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Clients
export const getClients = (): Client[] => getItems<Client>(STORAGE_KEYS.CLIENTS);
export const saveClient = (client: Client): void => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  setItems(STORAGE_KEYS.CLIENTS, clients);
};
export const deleteClient = (id: string): void => {
  const clients = getClients().filter(c => c.id !== id);
  setItems(STORAGE_KEYS.CLIENTS, clients);
};

// Quotes
export const getQuotes = (): Quote[] => getItems<Quote>(STORAGE_KEYS.QUOTES);
export const saveQuote = (quote: Quote): void => {
  const quotes = getQuotes();
  const index = quotes.findIndex(q => q.id === quote.id);
  if (index >= 0) {
    quotes[index] = quote;
  } else {
    quotes.push(quote);
  }
  setItems(STORAGE_KEYS.QUOTES, quotes);
};
export const deleteQuote = (id: string): void => {
  const quotes = getQuotes().filter(q => q.id !== id);
  setItems(STORAGE_KEYS.QUOTES, quotes);
};

// Sites
export const getSites = (): Site[] => getItems<Site>(STORAGE_KEYS.SITES);
export const saveSite = (site: Site): void => {
  const sites = getSites();
  const index = sites.findIndex(s => s.id === site.id);
  if (index >= 0) {
    sites[index] = site;
  } else {
    sites.push(site);
  }
  setItems(STORAGE_KEYS.SITES, sites);
};
export const deleteSite = (id: string): void => {
  const sites = getSites().filter(s => s.id !== id);
  setItems(STORAGE_KEYS.SITES, sites);
};

// Payments
export const getPayments = (): Payment[] => getItems<Payment>(STORAGE_KEYS.PAYMENTS);
export const savePayment = (payment: Payment): void => {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === payment.id);
  if (index >= 0) {
    payments[index] = payment;
  } else {
    payments.push(payment);
  }
  setItems(STORAGE_KEYS.PAYMENTS, payments);
};
export const deletePayment = (id: string): void => {
  const payments = getPayments().filter(p => p.id !== id);
  setItems(STORAGE_KEYS.PAYMENTS, payments);
};

// Employees
export const getEmployees = (): Employee[] => getItems<Employee>(STORAGE_KEYS.EMPLOYEES);
export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  setItems(STORAGE_KEYS.EMPLOYEES, employees);
};
export const deleteEmployee = (id: string): void => {
  const employees = getEmployees().filter(e => e.id !== id);
  setItems(STORAGE_KEYS.EMPLOYEES, employees);
};

// Timesheets
export const getTimesheets = (): Timesheet[] => getItems<Timesheet>(STORAGE_KEYS.TIMESHEETS);
export const saveTimesheet = (timesheet: Timesheet): void => {
  const timesheets = getTimesheets();
  const index = timesheets.findIndex(t => t.id === timesheet.id);
  if (index >= 0) {
    timesheets[index] = timesheet;
  } else {
    timesheets.push(timesheet);
  }
  setItems(STORAGE_KEYS.TIMESHEETS, timesheets);
};
export const deleteTimesheet = (id: string): void => {
  const timesheets = getTimesheets().filter(t => t.id !== id);
  setItems(STORAGE_KEYS.TIMESHEETS, timesheets);
};
