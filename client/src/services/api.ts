import axios from 'axios';
import type { AuthResponse, Card, CardStatus, CreditCardApplication, DashboardStats, FraudLog, NotificationItem, ProcessPaymentRequest, ProcessPaymentResponse, Transaction, User } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = 'http://localhost:5175/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
  withCredentials: true,
});

// Share one refresh request when several API calls receive 401 together.
let refreshPromise: Promise<AuthResponse> | null = null;

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;

  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh-token',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some((endpoint) => url.includes(endpoint));
};

const notifyUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean;
    }) | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (!storedRefreshToken) {
      notifyUnauthorized();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        // The backend action accepts the refresh token as a raw JSON string.
        refreshPromise = axios
          .post<AuthResponse>(
            `${API_BASE_URL}/auth/refresh-token`,
            storedRefreshToken,
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000,
              withCredentials: true,
            }
          )
          .then((response) => response.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const authResponse = await refreshPromise;

      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);

      // Keep Zustand's in-memory token and user synchronized with localStorage.
      useAuthStore.getState().setAuth(
        authResponse.user,
        authResponse.accessToken,
        authResponse.refreshToken
      );

      originalRequest.headers.Authorization = `Bearer ${authResponse.accessToken}`;

      return api(originalRequest);
    } catch (refreshError: any) {
      const status = refreshError.response?.status;

      // Invalid, expired, or revoked refresh tokens require a fresh login.
      // Network errors and server errors do not automatically destroy the session.
      if (status === 400 || status === 401 || status === 403) {
        notifyUnauthorized();
      }

      return Promise.reject(refreshError);
    }
  }
);

export const authApi = {
  login: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { emailOrUsername, password });
    return res.data;
  },

  register: async (payload: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  /**
   * Fetches the current authenticated user from the server.
   * Returns null for an unauthenticated session.
   * Network errors and server errors are rethrown.
   */
  me: async (): Promise<AuthResponse['user'] | null> => {
    try {
      const res = await api.get<AuthResponse['user']>('/auth/me');
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return null;
      }

      throw error;
    }
  },

  /**
   * Calls the backend logout endpoint to revoke the refresh token server-side.
   * Local token cleanup is performed even if the server request fails.
   */
  logout: async (refreshToken?: string | null): Promise<void> => {
    try {
      await api.post('/auth/logout', { refreshToken: refreshToken ?? null });
    } catch {
      // Continue with local cleanup if the server request fails.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
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
  registerMerchant: async (payload: {
    businessName: string;
    businessCategory: string;
    businessAddress?: string;
    gstNumber?: string;
    website?: string;
  }): Promise<{ message: string; user: User }> => {
    const res = await api.post<{ message: string; user: User }>('/user/register-merchant', payload);
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
