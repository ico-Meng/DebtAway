"use client";

import React, { useState } from "react";
import { API_ENDPOINT } from "@/app/components/config";
import styles from "@/app/dashboard/dashboard.module.css";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cognitoSub?: string;
  email?: string;
}

export default function PricingModal({ isOpen, onClose, cognitoSub, email }: PricingModalProps) {
  const [selectedPricingPlan, setSelectedPricingPlan] = useState<"2weeks" | "1month" | "3months">("3months");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  if (!isOpen) return null;

  const openStripeCheckout = (url: string) => {
    const newWindow = window.open(url, "_blank");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      try {
        if (window.top) {
          window.top.location.href = url;
        } else {
          window.location.href = url;
        }
      } catch {
        window.location.href = url;
      }
    }
  };

  const handleSubscriptionCheckout = async () => {
    if (!cognitoSub || !email) {
      console.error("Cannot start checkout: user not authenticated");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/subscription_stripe_checkout_page_handler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cognito_sub: cognitoSub,
          email,
          selected_plan: selectedPricingPlan,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.payment_url) {
        openStripeCheckout(data.payment_url);
      } else {
        throw new Error("No payment URL received from server");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${styles.upgradeModalOverlay} ${styles.pricingModalRoot}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modalContent} ${styles.upgradeModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <span className={styles.modalTitleHighlight}>Ambitology Pro</span> users get 3x more interviews
          </h3>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.subscriptionPlans}>
            <div className={`${styles.planCard} ${styles.planCardFree}`}>
              <div className={styles.planHeader}>
                <h4 className={styles.planName}>Free</h4>
                <p className={styles.planSubtitle}>To unleash your full potential by building knowledge base and 1-click AI resume craft and career power analysis.</p>
              </div>
              <ul className={styles.planFeatures}>
                <li>Basic use case to build personal profile</li>
                <li>Unlimited knowledge base build up for established and expanding scope</li>
                <li>Unlimited existing resume edit</li>
                <li>Up to 3 times intelligent resume craft</li>
                <li>Up to 3 times personal capability and resume power analysis</li>
                <li>Up to 3 times smart download</li>
              </ul>
            </div>
            <div className={`${styles.planCard} ${styles.planCardPro}`}>
              <div className={styles.planHeader}>
                <h4 className={styles.planName}>Pro</h4>
                <p className={styles.planSubtitle}>Our AI-powered platform empowers you to maximize potential, boost interviews, and accelerate hiring success.</p>
              </div>
              <ul className={styles.planFeatures}>
                <li>Everything in Free plan</li>
                <li>Unlimited intelligent resume craft</li>
                <li>Unlimited smart download</li>
                <li>Unlimited personal capability and resume power analysis</li>
                <li>Unlimited AI powered career consulting chat regarding to your knowledge base (Coming soon)</li>
              </ul>
            </div>
          </div>

          <div className={styles.pricingRow}>
            <div
              className={`${styles.pricingOption} ${selectedPricingPlan === "2weeks" ? styles.pricingOptionSelected : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPricingPlan("2weeks")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPricingPlan("2weeks"); } }}
            >
              <div className={styles.pricingDuration}>2 weeks of Pro Plan</div>
              <div className={styles.pricingHighlight}>$1.99/day</div>
              <div className={styles.pricingAmount}>$27.86 total</div>
            </div>
            <div
              className={`${styles.pricingOption} ${styles.pricingOptionRecommended} ${selectedPricingPlan === "1month" ? styles.pricingOptionSelected : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPricingPlan("1month")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPricingPlan("1month"); } }}
            >
              <div className={styles.pricingDuration}>1 month of Pro Plan</div>
              <div className={styles.pricingHighlight}>$1.33/day</div>
              <div className={styles.pricingAmount}>$39.99 total</div>
            </div>
            <div
              className={`${styles.pricingOption} ${styles.pricingOptionRecommended} ${selectedPricingPlan === "3months" ? styles.pricingOptionSelected : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPricingPlan("3months")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPricingPlan("3months"); } }}
            >
              <div className={styles.pricingBadge}>Most Popular</div>
              <div className={styles.pricingDuration}>3 months of Pro Plan</div>
              <div className={styles.pricingHighlight}>$0.99/day</div>
              <div className={styles.pricingAmount}>$89.99 total</div>
            </div>
          </div>

          <div className={styles.upgradeModalFooter}>
            <p className={styles.communityMessage}>
              Join our community where tens of thousands job seekers boosted their interview opportunities 3 times more and get job offer faster.
            </p>
            <button
              type="button"
              className={styles.getStartedButton}
              disabled={isCheckoutLoading}
              onClick={handleSubscriptionCheckout}
            >
              {isCheckoutLoading ? "Loading..." : "Get Started!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
