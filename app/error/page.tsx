"use client";

import styles from './error.module.css';

export default function PaymentError() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconContainer}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <defs>
                            <radialGradient id="errorGradient" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#f9b6d2" />
                                <stop offset="100%" stopColor="#d72660" />
                            </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="url(#errorGradient)" />
                        <rect x="46" y="28" width="8" height="32" rx="4" fill="#fff" />
                        <rect x="46" y="66" width="8" height="8" rx="4" fill="#fff" />
                    </svg>
                </div>
                <h1 className={styles.title}>Payment Error</h1>
                <p className={styles.message}>
                    There was an issue processing your payment.<br/>
                    Please contact <a href="mailto:support@careerlandinggroup.com" className={styles.link}>support@careerlandinggroup.com</a> to check if your payment was completed.
                </p>

                {/* <div className={styles.actions}>
                    <button 
                        onClick={() => {
                            if (window.top) {
                                window.top.location.href = 'https://www.careerlandinggroup.com';
                            } else {
                                window.location.href = 'https://www.careerlandinggroup.com';
                            }
                        }}
                        className={styles.button}
                    >
                        Return to Home
                    </button>
                </div> */}
            </div>
        </div>
    );
} 