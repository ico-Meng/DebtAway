"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import styles from './LeadForm.module.css';
import '../globals.css';
import './global-override.css';
import { API_ENDPOINT } from "@/app/components/config";
import { userManager } from "@/types";
import type { User } from "oidc-client-ts";

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
    const router = useRouter();
    // Authentication state
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [formState, setFormState] = useState<LeadFormState>({
        email: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showCloseNotification, setShowCloseNotification] = useState(false);

    // Handle sign-in callback and get existing user
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // First, try to handle callback (if returning from Cognito)
                const callbackUser = await userManager.signinCallback();
                if (callbackUser) {
                    setUser(callbackUser);
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                // Not a callback scenario or callback failed, continue to check for existing user
            }

            // If no callback, try to get existing user
            try {
                const existingUser = await userManager.getUser();
                if (existingUser && !existingUser.expired) {
                    setUser(existingUser);
                }
            } catch (getUserError) {
                console.error("Get user error:", getUserError);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Listen for user changes
    useEffect(() => {
        const handleUserLoaded = (loadedUser: User | null) => {
            setUser(loadedUser);
            setIsLoading(false);
        };

        const handleUserUnloaded = () => {
            setUser(null);
        };

        userManager.events.addUserLoaded(handleUserLoaded);
        userManager.events.addUserUnloaded(handleUserUnloaded);

        return () => {
            userManager.events.removeUserLoaded(handleUserLoaded);
            userManager.events.removeUserUnloaded(handleUserUnloaded);
        };
    }, []);

    const handleSignIn = async () => {
        try {
            await userManager.signinRedirect();
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

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
            
            // Start the API call in the background (non-blocking)
            fetch(`${API_ENDPOINT}/lead_sign_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formState.email
                }),
            }).then(response => {
                if (response.ok) {
                    console.log('Lead signup successful');
                } else {
                    console.log('Failed to write email to dynamodb table lead_sign_up', response);
                }
            }).catch(error => {
                console.error('Error submitting lead signup:', error);
            });
            
            // Immediately show success and redirect (don't wait for API)
            setIsSubmitting(false);
            setSubmitSuccess(true);
            
            // Show close notification after 2 seconds
            setTimeout(() => {
                setShowCloseNotification(true);
            }, 1500);
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

    // Show loading state
    if (isLoading) {
        return (
            <div className={styles.container} style={{ backgroundColor: '#edece3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <div className={styles.container} style={{ backgroundColor: '#edece3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Head>
                    <title>Login Required - Lead Capture</title>
                    <meta name="description" content="Please login to access this page" />
                    <style>{globalStyles}</style>
                </Head>
                <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                    padding: '2.5rem 2rem',
                    maxWidth: 420,
                    margin: '2rem auto',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#2d3748', marginBottom: 16 }}>
                        Login Required
                    </h2>
                    <p style={{ color: '#4a5568', fontSize: '1.08rem', marginBottom: 24 }}>
                        Please sign in or sign up to access this page.
                    </p>
                    <button
                        onClick={handleSignIn}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        Sign In / Sign Up
                    </button>
                </div>
            </div>
        );
    }

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
                    
                    /* Prevent responsive changes - maintain desktop layout */
                    @media (max-width: 768px) {
                        * {
                            min-width: unset !important;
                        }
                        
                        .container, .main, .formContainer, .form, .formSection {
                            width: auto !important;
                            min-width: 400px !important;
                            max-width: none !important;
                            padding: inherit !important;
                            margin: inherit !important;
                            transform: none !important;
                            flex-direction: column !important;
                        }
                        
                        h1, h2, p, span, label, input, button {
                            font-size: inherit !important;
                            line-height: inherit !important;
                            padding: inherit !important;
                            margin: inherit !important;
                            white-space: nowrap !important;
                        }
                        
                        img {
                            height: 40px !important;
                            width: auto !important;
                        }
                        
                        input[type="email"] {
                            min-width: 300px !important;
                        }
                        
                        button {
                            min-width: 140px !important;
                        }
                        
                        /* Align content below "Claim Career Boost Resources" with logo position */
                        .formSection > *:not(h2) {
                            margin-left: 52px !important; /* Logo width + gap (40px + 12px) */
                        }
                        
                        .formSection hr {
                            margin-left: 52px !important;
                        }
                        
                        .formSection .formGroup {
                            margin-left: 52px !important;
                        }
                    }
                `}</style>
            </Head>

            <main className={styles.main} style={{ backgroundColor: '#edece3' }}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff', marginBottom: 2, paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                        <img src="/images/logo.svg" alt="Career Landing Group Logo" style={{ height: '40px', width: 'auto' }} />
                        Career Landing Group
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
                                Thank you for subscribing! You'll receive updates from Career Landing Group.
                            </p>
                            {!showCloseNotification ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.loadingDots}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ 
                                    marginTop: '16px',
                                    textAlign: 'center' as const
                                }}>
                                    <p style={{ 
                                        color: '#16a34a', 
                                        fontSize: '1.5rem', 
                                        margin: 0,
                                        fontWeight: 700,
                                        animation: 'slideInFromBottom 0.5s ease-out'
                                    }}>
                                        Received!
                                    </p>
                                    <style jsx>{`
                                        @keyframes slideInFromBottom {
                                            0% {
                                                transform: translateY(20px);
                                                opacity: 0;
                                            }
                                            100% {
                                                transform: translateY(0);
                                                opacity: 1;
                                            }
                                        }
                                    `}</style>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16, marginTop: 4 }}>
                                    Claim Following Benefits
                                </h2>
                                
                                <span className={styles.bulletLine} style={{ marginLeft: '30px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Interview tips and cheatsheets
                                </span><br />
                                <span className={styles.bulletLine} style={{ marginLeft: '30px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Join us for referral opportunities
                                </span><br />
                                <span className={styles.bulletLine} style={{ marginLeft: '30px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Invite to <strong>FREE</strong> 1-on-1 session
                                </span><br />
                                <span className={styles.bulletLine} style={{ marginLeft: '30px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <strong>30% OFF</strong> for career services
                                </span>

                                <hr style={{ border: 'none', borderTop: '1px solid #e2e2e2', margin: '24px 0 16px 0' }} />
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label} style={{ marginLeft: '24px' }}>
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
                                        style={{ width: '320px', display: 'block', margin: '0 auto' }}
                                    />
                                    {formErrors.email && (
                                        <p className={styles.errorText}>{formErrors.email}</p>
                                    )}
                                    
                                    <div className={styles.buttonContainerClose}>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={isSubmitting}
                                            style={{ minWidth: '140px', width: 'auto' }}
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