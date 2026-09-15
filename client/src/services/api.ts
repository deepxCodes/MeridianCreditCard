import axios from 'axios';
import type { AuthResponse, Card, CardStatus, CreditCardApplication, DashboardStats, FraudLog, NotificationItem, ProcessPaymentRequest, ProcessPaymentResponse, Transaction, User } from '../types';

const API_BASE_URL = 'http://localhost:5175/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { emailOrUsername, password });
    return res.data;
  },
  register: async (payload: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },
  sendForgotPasswordOtp: async (contact: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { contact });
    return res.data;
  },
  resetPassword: async (contact: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/reset-password', { contact, otp, newPassword });
    return res.data;
  },
};

export const applicationApi = {
  submit: async (payload: any): Promise<CreditCardApplication> => {
    const res = await api.post<any>('/application/submit', payload);
    const data = res.data;
    return {
      id: data.id,
      applicationReference: data.applicationReference,
      userId: data.userId,
      fullName: data.fullName,
      dob: data.dateOfBirth,
      pan: data.taxIdNumber,
      mobile: data.mobileNumber,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      empType: data.employmentType,
      employer: data.employerName,
      jobTitle: data.jobTitle,
      experience: data.workExperience,
      empDuration: data.employmentDuration,
      officeAddress: data.officeAddress,
      income: data.annualIncome,
      loans: data.existingLoans,
      cards: data.existingCards,
      obligations: data.monthlyObligations,
      expenses: data.estimatedExpenses,
      bank: data.primaryBankAccountLast4,
      cardChoice: data.selectedCardType,
      uploads: data.documents || {},
      currentStage: data.currentStage,
      isRejected: data.isRejected,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt,
      lastStageUpdatedAt: data.lastStageUpdatedAt,
      issuedCard: data.issuedCard,
    };
  },
  getCurrent: async (): Promise<CreditCardApplication | null> => {
    const res = await api.get<any>('/application/current');
    if (!res.data) return null;
    const data = res.data;
    return {
      id: data.id,
      applicationReference: data.applicationReference,
      userId: data.userId,
      fullName: data.fullName,
      dob: data.dateOfBirth,
      pan: data.taxIdNumber,
      mobile: data.mobileNumber,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      empType: data.employmentType,
      employer: data.employerName,
      jobTitle: data.jobTitle,
      experience: data.workExperience,
      empDuration: data.employmentDuration,
      officeAddress: data.officeAddress,
      income: data.annualIncome,
      loans: data.existingLoans,
      cards: data.existingCards,
      obligations: data.monthlyObligations,
      expenses: data.estimatedExpenses,
      bank: data.primaryBankAccountLast4,
      cardChoice: data.selectedCardType,
      uploads: data.documents || {},
      currentStage: data.currentStage,
      isRejected: data.isRejected,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt,
      lastStageUpdatedAt: data.lastStageUpdatedAt,
      issuedCard: data.issuedCard,
    };
  },
  advanceStage: async (payload: { targetStage?: number; forceReject?: boolean; rejectionReason?: string } = {}): Promise<CreditCardApplication> => {
    const res = await api.post<any>('/application/advance-stage', payload);
    const data = res.data;
    return {
      id: data.id,
      applicationReference: data.applicationReference,
      userId: data.userId,
      fullName: data.fullName,
      dob: data.dateOfBirth,
      pan: data.taxIdNumber,
      mobile: data.mobileNumber,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      empType: data.employmentType,
      employer: data.employerName,
      jobTitle: data.jobTitle,
      experience: data.workExperience,
      empDuration: data.employmentDuration,
      officeAddress: data.officeAddress,
      income: data.annualIncome,
      loans: data.existingLoans,
      cards: data.existingCards,
      obligations: data.monthlyObligations,
      expenses: data.estimatedExpenses,
      bank: data.primaryBankAccountLast4,
      cardChoice: data.selectedCardType,
      uploads: data.documents || {},
      currentStage: data.currentStage,
      isRejected: data.isRejected,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt,
      lastStageUpdatedAt: data.lastStageUpdatedAt,
      issuedCard: data.issuedCard,
    };
  },
  uploadDocument: async (file: File, docType: string): Promise<{ fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    const res = await api.post<{ fileName: string }>('/application/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const userApi = {
  getProfile: async (): Promise<User> => {
    const res = await api.get<User>('/user/profile');
    return res.data;
  },
  updateProfile: async (payload: Partial<User>): Promise<{ message: string }> => {
    const res = await api.put<{ message: string }>('/user/profile', payload);
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/user/change-password', { currentPassword, newPassword });
    return res.data;
  },
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get<NotificationItem[]>('/user/notifications');
    return res.data;
  },
  markNotificationRead: async (id: number): Promise<void> => {
    await api.patch(`/user/notifications/${id}/read`);
  },
};

export const supportApi = {
  sendMessage: async (subject: string, message: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/support/message', { subject, message });
    return res.data;
  },
};

export const cardApi = {
  getCards: async (): Promise<Card[]> => {
    const res = await api.get<Card[]>('/card');
    return res.data;
  },
  addCard: async (cardData: any): Promise<Card> => {
    const res = await api.post<Card>('/card', cardData);
    return res.data;
  },
  updateStatus: async (cardId: number, status: CardStatus): Promise<Card> => {
    const res = await api.put<Card>(`/card/${cardId}/status`, JSON.stringify(status));
    return res.data;
  },
  deleteCard: async (cardId: number): Promise<void> => {
    await api.delete(`/card/${cardId}`);
  },
};

export const paymentApi = {
  processPayment: async (request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> => {
    const res = await api.post<ProcessPaymentResponse>('/payment/process', request);
    return res.data;
  },
};

export const transactionApi = {
  getMyTransactions: async (): Promise<Transaction[]> => {
    const res = await api.get<Transaction[]>('/transaction/my-transactions');
    return res.data;
  },
  getMerchantTransactions: async (): Promise<Transaction[]> => {
    const res = await api.get<Transaction[]>('/transaction/merchant');
    return res.data;
  },
  downloadReceipt: async (transactionId: number, txnRef: string) => {
    const res = await api.get(`/transaction/${transactionId}/receipt`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MeridianCredit_Receipt_${txnRef}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export const adminApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/admin/stats');
    return res.data;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/admin/users');
    return res.data;
  },
  getMerchants: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/admin/merchants');
    return res.data;
  },
  getFraudLogs: async (): Promise<FraudLog[]> => {
    const res = await api.get<FraudLog[]>('/admin/fraud-logs');
    return res.data;
  },
  resolveFraudLog: async (fraudId: number): Promise<void> => {
    await api.put(`/admin/fraud-logs/${fraudId}/resolve`);
  },
  getApplications: async (): Promise<CreditCardApplication[]> => {
    const res = await api.get<any[]>('/admin/applications');
    return res.data.map((data) => ({
      id: data.id,
      applicationReference: data.applicationReference,
      userId: data.userId,
      fullName: data.fullName,
      dob: data.dateOfBirth,
      pan: data.taxIdNumber,
      mobile: data.mobileNumber,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      empType: data.employmentType,
      employer: data.employerName,
      jobTitle: data.jobTitle,
      experience: data.workExperience,
      empDuration: data.employmentDuration,
      officeAddress: data.officeAddress,
      income: data.annualIncome,
      loans: data.existingLoans,
      cards: data.existingCards,
      obligations: data.monthlyObligations,
      expenses: data.estimatedExpenses,
      bank: data.primaryBankAccountLast4,
      cardChoice: data.selectedCardType,
      uploads: data.documents || {},
      currentStage: data.currentStage,
      isRejected: data.isRejected,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt,
      lastStageUpdatedAt: data.lastStageUpdatedAt,
      issuedCard: data.issuedCard,
    }));
  },
  updateApplicationStage: async (
    applicationId: number,
    targetStage: number,
    forceReject?: boolean,
    rejectionReason?: string
  ): Promise<CreditCardApplication> => {
    const res = await api.put<any>(`/admin/applications/${applicationId}/stage`, {
      targetStage,
      forceReject,
      rejectionReason,
    });
    const data = res.data;
    return {
      id: data.id,
      applicationReference: data.applicationReference,
      userId: data.userId,
      fullName: data.fullName,
      dob: data.dateOfBirth,
      pan: data.taxIdNumber,
      mobile: data.mobileNumber,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      empType: data.employmentType,
      employer: data.employerName,
      jobTitle: data.jobTitle,
      experience: data.workExperience,
      empDuration: data.employmentDuration,
      officeAddress: data.officeAddress,
      income: data.annualIncome,
      loans: data.existingLoans,
      cards: data.existingCards,
      obligations: data.monthlyObligations,
      expenses: data.estimatedExpenses,
      bank: data.primaryBankAccountLast4,
      cardChoice: data.selectedCardType,
      uploads: data.documents || {},
      currentStage: data.currentStage,
      isRejected: data.isRejected,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt,
      lastStageUpdatedAt: data.lastStageUpdatedAt,
      issuedCard: data.issuedCard,
    };
  },
};
