"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './LeadForm.module.css';
import '../globals.css';
import './global-override.css';
import { API_ENDPOINT } from "@/app/components/config";

// Add global styles to ensure proper rendering similar to flash-chat
const globalStyles = `
  html, body {
    overflow-y: auto !important;
    height: 100% !important;
    max-height: 100vh;
    background-color: #edece3 !important;
    padding: 0;
    margin: 0;
  }
  
  body {
    overflow: auto;
    overflow-x: hidden;
  }
  
  input, select, textarea, button, label {
    background-color: #edece3 !important;
    color: #333 !important;
  }
  
  body.lead-page {
    background: #edece3 !important;
    background-color: #edece3 !important;
    background-image: none !important;
  }
`;

interface LeadFormState {
    email: string;
}

interface FormErrors {
    email?: string;
}

export default function LeadForm() {
    // Form state
    const [formState, setFormState] = useState<LeadFormState>({
        email: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Email validation function
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate email
        const errors: FormErrors = {};
        if (!formState.email) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formState.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFormErrors(errors);

        // If validation passes
        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            
            try {
                // Call backend API to save email
                const response = await fetch(`${API_ENDPOINT}/lead_sign_up`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formState.email
                    }),
                });

                if (!response.ok) {
                    console.log('Failed to write email to dynamodb table lead_sign_up', response);
                }

                const data = await response.json();
                console.log('Lead signup successful:', data);
                
                setIsSubmitting(false);
                setSubmitSuccess(true);
                
                // Redirect to careerlandinggroup.com after 2 seconds
                setTimeout(() => {
                    window.location.href = 'https://www.careerlandinggroup.com/';
                }, 2000);
                
            } catch (error) {
                console.error('Error submitting lead signup:', error);
                setIsSubmitting(false);
                setFormErrors({ email: 'Failed to save email. Please try again.' });
            }
        }
    };

    // Add useEffect to set body class
    useEffect(() => {
        // Add class to body for specific styling
        document.body.classList.add('lead-page');
        
        // Clean up function
        return () => {
            document.body.classList.remove('lead-page');
        };
    }, []);

    useEffect(() => {
        const postHeight = () => {
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'setHeight',
              height: document.body.scrollHeight
            }, '*');
          }
        };
      
        postHeight(); // Call on mount
        const interval = setInterval(postHeight, 500); // Call repeatedly in case height changes
        return () => clearInterval(interval);
      }, []);

    return (
        <div className={styles.container} style={{ backgroundColor: '#edece3' }}>
            <Head>
                <title>Subscribe - Lead Capture</title>
                <meta name="description" content="Subscribe to get updates and insights" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{globalStyles}</style>
                <style>{`
                    body {
                        background: #edece3 !important;
                        background-color: #edece3 !important;
                        background-image: none !important;
                    }
                `}</style>
            </Head>

            <main className={styles.main} style={{ backgroundColor: '#edece3' }}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff', marginBottom: 12, paddingBottom: 0 }}>
                        Claim Free Career Boosts
                    </h1>

                    {submitSuccess ? (
                        <div className={styles.successMessage} style={{ 
                            background: '#fff', 
                            borderRadius: '16px', 
                            boxShadow: '0 4px 24px rgba(0,0,0,0.07)', 
                            padding: '2.5rem 2rem', 
                            maxWidth: 420, 
                            margin: '2rem auto' 
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                                <svg width="60" height="60" viewBox="0 0 52 52" style={{ marginBottom: 12 }}>
                                    <circle cx="26" cy="26" r="25" fill="none" stroke="#00c853" strokeWidth="3" />
                                    <path fill="none" stroke="#00c853" strokeWidth="4" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                                <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>
                                    Successfully Subscribed!
                                </h2>
                            </div>
                            <p style={{ color: '#4a5568', fontSize: '1.08rem', marginBottom: 8, textAlign: 'center' }}>
                                Thank you for subscribing! You'll receive updates and insights from Career Landing Group.
                            </p>
                            <p style={{ color: '#4a5568', fontSize: '1.08rem', marginBottom: 16, textAlign: 'center' }}>
                                Redirecting you to our main website
                            </p>
                            <div className={styles.loadingContainer}>
                                <div className={styles.loadingDots}>
                                    <div className={styles.dot}></div>
                                    <div className={styles.dot}></div>
                                    <div className={styles.dot}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>
                                    Get Career Insights & Resources
                                </h2>
                                
                                <div className={styles.noticeBox}>
                                    Join our community to receive:
                                    <br /><br />
                                    <span className={styles.bulletLine}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                            <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Career development resources
                                    </span><br />
                                    <span className={styles.bulletLine}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                            <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Job market insights and trends
                                    </span><br />
                                    <span className={styles.bulletLine}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                            <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Invites to FREE 1-1 sessions
                                    </span><br />
                                    <span className={styles.bulletLine}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                            <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Promo codes for services
                                    </span>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>
                                        Email Address <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formState.email}
                                        onChange={handleChange}
                                        className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                                        placeholder="your.email@example.com"
                                        autoFocus
                                    />
                                    {formErrors.email && (
                                        <p className={styles.errorText}>{formErrors.email}</p>
                                    )}
                                    
                                    <div className={styles.buttonContainerClose}>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}