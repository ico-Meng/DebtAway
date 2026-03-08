'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../dashboard.module.css';
import { API_ENDPOINT } from '../../components/config';

interface UsageData {
  craft_count: number;
  analysis_count: number;
  download_count: number;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  description: string;
  invoice_url: string | null;
  invoice_pdf: string | null;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

interface AccountSectionProps {
  cognitoSub: string;
  email: string;
  userPlan: string;
  onUpgrade: () => void;
}

const FREE_LIMIT = 3;

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export default function AccountSection({ cognitoSub, email, userPlan, onUpgrade }: AccountSectionProps) {
  const [activeTab, setActiveTab] = useState<'usage' | 'billing'>('usage');
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchUsage = useCallback(async () => {
    if (!cognitoSub) return;
    setIsLoadingUsage(true);
    try {
      const res = await fetch(`${API_ENDPOINT}/get_usage/${cognitoSub}`);
      const data = await res.json();
      setUsageData(data);
    } catch (e) {
      console.error('Failed to fetch usage:', e);
    } finally {
      setIsLoadingUsage(false);
    }
  }, [cognitoSub]);

  const fetchBilling = useCallback(async () => {
    if (!email && !cognitoSub) return;
    setIsLoadingBilling(true);
    setBillingError('');
    try {
      const res = await fetch(`${API_ENDPOINT}/get_payment_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cognito_sub: cognitoSub }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setBillingError(err.detail || 'Failed to load billing data.');
        return;
      }
      const data = await res.json();
      setPayments(data.payments || []);
      setSubscription(data.subscription || null);
    } catch (e) {
      console.error('Failed to fetch billing:', e);
      setBillingError('Network error. Could not load billing data.');
    } finally {
      setIsLoadingBilling(false);
    }
  }, [email, cognitoSub]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBilling();
    }
  }, [activeTab, fetchBilling]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`${API_ENDPOINT}/cancel_subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cognito_sub: cognitoSub }),
      });
      const data = await res.json();
      if (res.ok) {
        setCancelSuccess(true);
        setShowCancelModal(false);
        fetchBilling();
      } else {
        setCancelError(data.detail || 'Failed to cancel subscription.');
      }
    } catch {
      setCancelError('Network error. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const isPro = userPlan === 'pro';

  const usageItems = [
    {
      label: 'Resume Craft',
      count: usageData?.craft_count ?? 0,
      limit: isPro ? null : FREE_LIMIT,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8M16 17H8M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Smart Download',
      count: usageData?.download_count ?? 0,
      limit: isPro ? null : FREE_LIMIT,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Analysis',
      count: usageData?.analysis_count ?? 0,
      limit: isPro ? null : FREE_LIMIT,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.accountSection}>
      {/* Header */}
      <div className={styles.accountHeader}>
        <div className={styles.accountHeaderTop}>
          <div className={styles.accountAvatarWrap}>
            <div className={styles.accountAvatar}>
              {email ? email[0].toUpperCase() : 'U'}
            </div>
          </div>
          <div className={styles.accountHeaderInfo}>
            <div className={styles.accountEmail}>{email}</div>
            <div className={`${styles.accountPlanBadge} ${isPro ? styles.accountPlanBadgePro : styles.accountPlanBadgeFree}`}>
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </div>
          </div>
        </div>
      </div>

      {/* Switch Tabs */}
      <div className={styles.accountSwitchRow}>
        <div className={styles.accountSwitchGroup}>
          <button
            className={`${styles.accountSwitchBtn} ${activeTab === 'usage' ? styles.accountSwitchBtnActive : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            Usage
          </button>
          <button
            className={`${styles.accountSwitchBtn} ${activeTab === 'billing' ? styles.accountSwitchBtnActive : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
        </div>
      </div>

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className={styles.accountTabContent}>
          <p className={styles.accountTabDescription}>
            {isPro
              ? 'You have unlimited access to all features.'
              : 'Free plan includes 3 uses per feature. Upgrade for unlimited access.'}
          </p>
          {isLoadingUsage ? (
            <div className={styles.accountLoadingRow}>
              <div className={styles.accountSpinner} />
              <span>Loading usage data…</span>
            </div>
          ) : (
            <div className={styles.usageCards}>
              {usageItems.map((item) => {
                const pct = item.limit ? Math.min((item.count / item.limit) * 100, 100) : 0;
                const atLimit = item.limit !== null && item.count >= item.limit;
                return (
                  <div key={item.label} className={`${styles.usageCard} ${atLimit ? styles.usageCardAtLimit : ''}`}>
                    <div className={styles.usageCardHeader}>
                      <span className={styles.usageCardIcon}>{item.icon}</span>
                      <span className={styles.usageCardLabel}>{item.label}</span>
                    </div>
                    <div className={styles.usageCardCount}>
                      <span className={styles.usageCountNumber}>{item.count}</span>
                      {item.limit !== null && (
                        <span className={styles.usageCountLimit}> / {item.limit}</span>
                      )}
                      {item.limit === null && (
                        <span className={styles.usageCountUnlimited}> uses</span>
                      )}
                    </div>
                    {item.limit !== null ? (
                      <div className={styles.usageProgressBar}>
                        <div
                          className={`${styles.usageProgressFill} ${atLimit ? styles.usageProgressFillFull : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    ) : (
                      <div className={styles.usageUnlimitedBadge}>Unlimited</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className={styles.accountTabContent}>
          {/* Subscription action card — always visible regardless of loading/error state */}
          <div className={styles.subscriptionCard}>
            <div className={styles.subscriptionCardLeft}>
              <div className={styles.subscriptionStatus}>
                <span className={`${styles.subscriptionDot} ${
                  cancelSuccess || subscription?.cancel_at_period_end
                    ? styles.subscriptionDotWarning
                    : isPro
                      ? styles.subscriptionDotActive
                      : styles.subscriptionDotInactive
                }`} />
                <span className={styles.subscriptionStatusText}>
                  {cancelSuccess
                    ? 'Cancels at period end'
                    : subscription?.cancel_at_period_end
                      ? 'Cancels at period end'
                      : isPro
                        ? 'Active subscription'
                        : 'Free plan — no active subscription'}
                </span>
              </div>
              {subscription?.current_period_end && (
                <div className={styles.subscriptionPeriodEnd}>
                  {subscription.cancel_at_period_end || cancelSuccess
                    ? `Access until: ${formatDate(subscription.current_period_end)}`
                    : `Renews: ${formatDate(subscription.current_period_end)}`}
                </div>
              )}
            </div>
            {isPro && !cancelSuccess && !subscription?.cancel_at_period_end && (
              <button className={styles.cancelSubButton} onClick={() => setShowCancelModal(true)}>
                Cancel Plan
              </button>
            )}
            {!isPro && (
              <button className={styles.upgradeSubButton} onClick={onUpgrade}>
                Upgrade Plan
              </button>
            )}
          </div>

          {cancelSuccess && (
            <div className={styles.cancelSuccessBanner}>
              Your subscription has been cancelled. You&apos;ll keep access until the end of your billing period.
            </div>
          )}

          {/* Payment History — below the always-visible action card */}
          {isLoadingBilling ? (
            <div className={styles.accountLoadingRow}>
              <div className={styles.accountSpinner} />
              <span>Loading payment history…</span>
            </div>
          ) : billingError ? (
            <div className={styles.billingErrorBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {billingError}
            </div>
          ) : (
            <div className={styles.billingHistorySection}>
              <h3 className={styles.billingHistoryTitle}>Payment History</h3>
              {payments.length === 0 ? (
                <div className={styles.billingEmpty}>No payment history found.</div>
              ) : (
                <div className={styles.billingTable}>
                  <div className={styles.billingTableHeader}>
                    <span>Date</span>
                    <span>Description</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  {payments.map((p) => (
                    <div key={p.id} className={styles.billingTableRow}>
                      <span className={styles.billingDate}>{formatDate(p.date)}</span>
                      <span className={styles.billingDesc}>{p.description}</span>
                      <span className={styles.billingAmount}>{formatAmount(p.amount, p.currency)}</span>
                      <span className={`${styles.billingStatus} ${p.status === 'paid' ? styles.billingStatusPaid : styles.billingStatusOther}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className={styles.cancelModalOverlay} onClick={() => !isCancelling && setShowCancelModal(false)}>
          <div className={styles.cancelModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cancelModalIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#d97706" strokeWidth="2"/>
                <path d="M12 8V12" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 16H12.01" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className={styles.cancelModalTitle}>Cancel Subscription?</h3>
            <p className={styles.cancelModalDesc}>
              You&apos;ll keep Pro access until the end of your current billing period. After that, your account will revert to the Free plan.
            </p>
            {cancelError && (
              <div className={styles.cancelModalError}>{cancelError}</div>
            )}
            <div className={styles.cancelModalActions}>
              <button
                className={styles.cancelModalKeep}
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Plan
              </button>
              <button
                className={styles.cancelModalConfirm}
                onClick={handleCancelSubscription}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
