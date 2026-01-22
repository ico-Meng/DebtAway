// Common types used across the application
import { UserManager, UserManagerSettings } from "oidc-client-ts";

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Debt {
  id: string
  userId: string
  name: string
  type: DebtType
  balance: number
  originalAmount: number
  interestRate: number
  minimumPayment: number
  dueDate: string
  status: DebtStatus
  createdAt: string
  updatedAt: string
}

export type DebtType = 
  | 'credit_card'
  | 'student_loan'
  | 'personal_loan'
  | 'mortgage'
  | 'auto_loan'
  | 'medical'
  | 'other'

export type DebtStatus = 
  | 'active'
  | 'paid_off'
  | 'in_collections'
  | 'settled'

export interface Payment {
  id: string
  debtId: string
  amount: number
  date: string
  method: PaymentMethod
  status: PaymentStatus
  notes?: string
}

export type PaymentMethod = 
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card'
  | 'check'
  | 'cash'

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface Transaction {
  id: string
  accountId: string
  amount: number
  date: string
  description: string
  category: string
  pending: boolean
}

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  institution: string
  lastSync: string
}

export type AccountType = 
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'investment'
  | 'loan'

// UI Component types
export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface DashboardStats {
  totalDebt: number
  monthlyPayment: number
  debtFreeDate: string
  interestSaved: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

// Form types
export type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export interface FormError {
  field: string
  message: string
}

// OIDC Authentication Configuration
export interface CognitoAuthConfig {
  authority: string
  client_id: string
  redirect_uri: string
  response_type: string
  scope: string
}

export const cognitoAuthConfig: CognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_OMJe8BlbK",
  client_id: "1ff46n1liq6r0nlaets9m02grr",
  //redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
  redirect_uri: "http://localhost:3000/dashboard",
  response_type: "code",
  scope: "email openid phone",
}

// Create a UserManager instance
export const userManager = new UserManager({
  ...cognitoAuthConfig,
} as UserManagerSettings);

// Sign out redirect function
export async function signOutRedirect(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  // Get ID token BEFORE removing user (we need it for logout hint)
  let idToken: string | undefined;
  try {
    const user = await userManager.getUser();
    idToken = user?.id_token;
  } catch (error) {
    console.error("Error getting user for logout:", error);
  }

  // Clear user locally (this always works)
  try {
    await userManager.removeUser();
  } catch (removeError) {
    console.error("Error removing user:", removeError);
  }

  // Try to redirect to Cognito logout for full session termination
  // If logout_uri is not configured in Cognito, the redirect will fail
  // but the user will already be logged out locally
  const clientId = "1ff46n1liq6r0nlaets9m02grr";
  const logoutUri = window.location.origin; // No trailing slash - MUST match Cognito config exactly
  const cognitoDomain = "https://us-east-1omje8blbk.auth.us-east-1.amazoncognito.com";
  
  // Build logout URL
  // Note: logout_uri MUST be registered in Cognito App Client settings under "Sign-out URLs"
  let logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  if (idToken) {
    logoutUrl += `&id_token_hint=${encodeURIComponent(idToken)}`;
  }
  
  // Redirect to Cognito logout
  // If logout_uri is not configured, Cognito will return 400, but user is already logged out locally
  // The redirect happens anyway - Cognito will show an error page, but when user comes back to your app, they'll be logged out
  window.location.href = logoutUrl;
}