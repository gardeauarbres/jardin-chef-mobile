export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  clientId: string;
  title: string;
  description: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  depositPercentage?: number;
  depositAmount?: number;
}

export interface Site {
  id: string;
  clientId: string;
  quoteId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  siteId: string;
  clientId: string;
  amount: number;
  type: 'deposit' | 'progress' | 'final';
  status: 'pending' | 'paid';
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}
