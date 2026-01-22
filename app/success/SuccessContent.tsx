"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './success.module.css';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function SuccessContent() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [email, setEmail] = useState('');
    const [servicePath, setServicePath] = useState('');
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const urlEmail = searchParams.get('email') || "";
    const urlServicePath = searchParams.get('service_path') || "";

    useEffect(() => {
        setEmail(urlEmail);
        setServicePath(urlServicePath);
        setIsAnimating(true);
    }, [sessionId]);

    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${isAnimating ? styles.animate : ''}`}>
                <div className={styles.checkmarkContainer}>
                    <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
                        <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                
                <h1 className={styles.title}>Payment Successful!</h1>
                <p className={styles.message}>
                    Thank you for booking with us.
                </p>
                <p className={styles.message}>
                    We will contact you via email soon.
                </p>
                
                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{email}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Status:</span>
                        <span className={`${styles.value} ${styles.success}`}>Completed</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        onClick={() => window.location.href = servicePath}
                        className={styles.button}
                    >
                        Book Another Session
                    </button>
                </div>
            </div>
        </div>
    );
} 