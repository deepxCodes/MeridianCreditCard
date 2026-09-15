export type UserRole = 'Customer' | 'Merchant' | 'Admin';
export type CardStatus = 'Active' | 'Blocked' | 'Expired' | 'Inactive';
export type TransactionStatus = 'Pending' | 'Approved' | 'Declined' | 'Failed' | 'Cancelled';
export type FraudSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type NavPanel = 'dashboard' | 'merchant' | 'apply' | 'tracking' | 'profile' | 'support' | 'confirmation';

export type AuthScreen = 'login' | 'register' | 'forgot';

export interface MerchantProfile {
  id: number;
  businessName: string;
  businessCategory: string;
  businessAddress?: string;
  gstNumber?: string;
  website?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  merchantProfile?: MerchantProfile;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: User;
}

export interface Card {
  id: number;
  userId: number;
  cardHolderName: string;
  maskedCardNumber: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  availableBalance: number;
  creditLimit?: number;
  cardType?: string;
  cardStatus: CardStatus;
  createdAt: string;
}

export interface CreditCardApplication {
  id?: number;
  applicationReference: string; // MC-XXXXXX
  userId?: number;
  
  // Personal
  fullName: string;
  dob: string;
  pan: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  // Employment
  empType: string;
  employer?: string;
  jobTitle?: string;
  experience?: string;
  empDuration?: string;
  officeAddress?: string;

  // Financial
  income: number;
  loans?: string;
  cards?: string;
  obligations?: number;
  expenses?: number;
  bank?: string;

  // Card
  cardChoice: 'Classic' | 'Rewards' | 'Premium';

  // Uploads (docKey -> filename)
  uploads: Record<string, string>;

  // Stage Tracking
  currentStage: number; // 1 to 6
  isRejected: boolean;
  rejectionReason?: string;
  submittedAt: string;
  lastStageUpdatedAt?: string;

  // Issued Card Details
  issuedCard?: Card;
}

export interface NotificationItem {
  id?: number;
  title: string;
  body: string;
  time: string;
  isRead?: boolean;
}

export interface Transaction {
  id: number;
  transactionReference: string;
  cardId: number;
  maskedCardNumber: string;
  customerId: number;
  customerName: string;
  merchantId: number;
  businessName: string;
  amount: number;
  currency: string;
  transactionStatus: TransactionStatus;
  gatewayResponse: string;
  failureReason?: string;
  processedAt: string;
  isFraudFlagged: boolean;
}

export interface FraudLog {
  id: number;
  transactionId: number;
  transactionReference: string;
  amount: number;
  customerName: string;
  fraudReason: string;
  severity: FraudSeverity;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalMerchants: number;
  totalTransactions: number;
  totalVolumeAmount: number;
  totalApprovedTransactions: number;
  totalDeclinedTransactions: number;
  totalFraudLogsCount: number;
  pendingFraudLogsCount: number;
  approvalRatePercentage: number;
}

export interface ProcessPaymentRequest {
  customerId: number;
  merchantId: number;
  cardId: number;
  amount: number;
  cvv: string;
}

export interface ProcessPaymentResponse {
  transactionId?: number;
  transactionReference: string;
  status: TransactionStatus;
  gatewayResponse: string;
  failureReason?: string;
  amount: number;
  currency: string;
  processedAt: string;
  isFraudFlagged: boolean;
  fraudSeverity?: FraudSeverity;
}
