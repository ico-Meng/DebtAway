"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from './ChatForm.module.css';
import '../globals.css';
import './global-override.css';
import { API_ENDPOINT } from "@/app/components/config";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

// Add global styles to ensure proper rendering
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
  
  input, select, textarea, button:not(.submitButton), label {
    background-color: #edece3 !important;
    color: #333 !important;
  }
  
  .submitButton,
  button.submitButton,
  button[class*="submitButton"] {
    background-color: #9B6A10 !important;
    color: white !important;
  }
  
  .submitButton:hover,
  button.submitButton:hover,
  button[class*="submitButton"]:hover {
    background-color: #9B6A10 !important;
    box-shadow: 0 0 8px 4px rgba(227, 197, 124, 1) !important;
  }
  
  .submitButton:disabled,
  button.submitButton:disabled,
  button[class*="submitButton"]:disabled {
    background-color: #ccc !important;
    color: white !important;
  }
  
  body.flash-chat-page {
    background: #edece3 !important;
    background-color: #edece3 !important;
    background-image: none !important;
  }
`;

interface ChatFormState {
    email: string;
    fullName: string;
    currentRole: string;
    targetRole: string;
    message: string;
    selectedQuestions: string[];
}

interface FormErrors {
    email?: string;
    fullName?: string;
    currentRole?: string;
    targetRole?: string;
    message?: string;
}

// Add this utility function at the top level
const openStripeCheckout = (url: string) => {
    // Try to open in new tab first
    const newWindow = window.open(url, '_blank');
    
    // If popup is blocked or failed, try to break out of iframe
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        try {
            // Try to access top level window
            if (window.top) {
                window.top.location.href = url;
            } else {
                // If we can't access top, fallback to current window
                window.location.href = url;
            }
        } catch (e) {
            // If we get a security error trying to access top
            // Open in current window/frame
            window.location.href = url;
        }
    }
};

// Add ProgressBar component
function ProgressBar({ step, totalSteps }: { step: number, totalSteps: number }) {
    const targetPercent = Math.round(((step - 1) / (totalSteps - 1)) * 100);
    const [displayPercent, setDisplayPercent] = useState(targetPercent);
    useEffect(() => {
        if (displayPercent === targetPercent) return;
        const increment = displayPercent < targetPercent ? 1 : -1;
        const timer = setTimeout(() => {
            setDisplayPercent(displayPercent + increment);
        }, 10);
        return () => clearTimeout(timer);
    }, [displayPercent, targetPercent]);
    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBarTrack}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: `${displayPercent}%` }}
                />
            </div>
            <div className={styles.progressBarLabel}>{displayPercent}% completed</div>
        </div>
    );
}

export default function FlashChatForm() {
    // Form state
    const [formState, setFormState] = useState<ChatFormState>({
        email: '',
        fullName: '',
        currentRole: '',
        targetRole: '',
        message: '',
        selectedQuestions: []
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    
    // Add state for custom dropdowns
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCurrentRoleDropdownOpen, setIsCurrentRoleDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentRoleDropdownRef = useRef<HTMLDivElement>(null);
    
    // Common questions for checkboxes
    const commonQuestions = [
        "How can I maximize my chances of receiving interview opportunities with my resume?",
        "Which programming languages and frameworks are most in-demand for my target role?",
        "Does practice LeetCode questions still necessary for software engineering roles?",
        "Is my background in software engineering sufficient to pursue a role in AI engineering?",
        "What AI/ML projects or personal portfolio work impress recruiters the most?",
        "What do recruiters and hiring managers look for when evaluating software engineers for AI roles?"
    ];
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (currentRoleDropdownRef.current && !currentRoleDropdownRef.current.contains(event.target as Node)) {
                setIsCurrentRoleDropdownOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    // Toggle target role dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    // Toggle current role dropdown
    const toggleCurrentRoleDropdown = () => {
        setIsCurrentRoleDropdownOpen(!isCurrentRoleDropdownOpen);
    };
    
    // Handle target role option selection
    const handleOptionSelect = (value: string) => {
        setFormState(prev => ({
            ...prev,
            targetRole: value
        }));
        setIsDropdownOpen(false);
    };
    
    // Handle current role option selection
    const handleCurrentRoleSelect = (value: string) => {
        setFormState(prev => ({
            ...prev,
            currentRole: value
        }));
        setIsCurrentRoleDropdownOpen(false);
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle question selection
    const handleQuestionSelect = (question: string) => {
        setFormState(prev => {
            const selectedQuestions = [...prev.selectedQuestions];
            if (selectedQuestions.includes(question)) {
                return {
                    ...prev,
                    selectedQuestions: selectedQuestions.filter(q => q !== question)
                };
            } else {
                return {
                    ...prev, 
                    selectedQuestions: [...selectedQuestions, question]
                };
            }
        });
    };

    // Add subscriptionType and step state
    const [step, setStep] = useState(1);
    const [subscriptionType, setSubscriptionType] = useState<'biweekly' | 'monthly' | null>(null);

    // Add a function to validate the current step
    const validateStep = (stepNum: number): boolean => {
        const errors: FormErrors = {};
        if (stepNum === 1) {
            if (!formState.email) errors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formState.email)) errors.email = 'Email is invalid';
            if (!formState.fullName) errors.fullName = 'Full name is required';
            if (!formState.currentRole) errors.currentRole = 'Current role is required';
            if (!formState.targetRole) errors.targetRole = 'Target role is required';
        }
        if (stepNum === 3) {
            if (formState.message && formState.message.length < 10) errors.message = 'Message must be at least 10 characters';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handler for Next button
    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };
    // Handler for Previous button
    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch(`${API_ENDPOINT}/flash-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formState.email,
                    fullName: formState.fullName,
                    currentRole: formState.currentRole,
                    targetRole: formState.targetRole,
                    message: formState.message,
                    selectedQuestions: formState.selectedQuestions,
                    subscriptionType: subscriptionType || 'monthly',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.payment_url) {
                // Use our new utility function
                openStripeCheckout(data.payment_url);
                
                // Show a message to the user
                setSubmitSuccess(true);
                setChatId(data.chat_id);
            } else {
                throw new Error('No payment URL received from server');
            }

        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add keyboard navigation for target role dropdown
    const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsDropdownOpen(true);
            return;
        }
        
        if (isDropdownOpen) {
            const options = ["Software Engineer", "AI Engineer", "ML Engineer", "Data Scientist", "Applied Scientist"];
            const currentIndex = options.indexOf(formState.targetRole);
            
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < options.length - 1) {
                        handleOptionSelect(options[currentIndex + 1]);
                    } else {
                        handleOptionSelect(options[0]);
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        handleOptionSelect(options[currentIndex - 1]);
                    } else {
                        handleOptionSelect(options[options.length - 1]);
                    }
                    break;
                    
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    break;
                    
                default:
                    // Handle first-letter navigation
                    const key = e.key.toLowerCase();
                    const matchingOption = options.find(option => 
                        option.toLowerCase().startsWith(key)
                    );
                    
                    if (matchingOption) {
                        handleOptionSelect(matchingOption);
                    }
                    break;
            }
        }
    };

    // Handle current role dropdown keyboard navigation
    const handleCurrentRoleKeyDown = (e: React.KeyboardEvent) => {
        if (!isCurrentRoleDropdownOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsCurrentRoleDropdownOpen(true);
            return;
        }
        
        if (isCurrentRoleDropdownOpen) {
            const options = [
                "College Student", 
                "Recent Graduate(within 1-2 years)", 
                "Employeed Professional", 
                "Freelancer / Contractor / Self Employed", 
                "Entrepreneur / Startup Founder", 
                "Other"
            ];
            const currentIndex = options.indexOf(formState.currentRole);
            
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    setIsCurrentRoleDropdownOpen(false);
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < options.length - 1) {
                        handleCurrentRoleSelect(options[currentIndex + 1]);
                    } else {
                        handleCurrentRoleSelect(options[0]);
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        handleCurrentRoleSelect(options[currentIndex - 1]);
                    } else {
                        handleCurrentRoleSelect(options[options.length - 1]);
                    }
                    break;
                    
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    setIsCurrentRoleDropdownOpen(false);
                    break;
                    
                default:
                    // Handle first-letter navigation
                    const key = e.key.toLowerCase();
                    const matchingOption = options.find(option => 
                        option.toLowerCase().startsWith(key)
                    );
                    
                    if (matchingOption) {
                        handleCurrentRoleSelect(matchingOption);
                    }
                    break;
            }
        }
    };

    // Add useEffect to set body class
    useEffect(() => {
        // Add class to body for specific styling
        document.body.classList.add('flash-chat-page');
        
        // Clean up function
        return () => {
            document.body.classList.remove('flash-chat-page');
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
                <title>Flash Chat</title>
                <meta name="description" content="Ask career questions and get quick expert answers" />
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
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff', marginBottom: 12, paddingBottom: 0 }}>Initiate a chat with your questions</h1>
                    <ProgressBar step={step} totalSteps={4} />

                    {submitSuccess ? (
                        <div className={styles.successMessage} style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', maxWidth: 420, margin: '2rem auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                                <svg width="60" height="60" viewBox="0 0 52 52" style={{ marginBottom: 12 }}>
                                    <circle cx="26" cy="26" r="25" fill="none" stroke="#00c853" strokeWidth="3" />
                                    <path fill="none" stroke="#00c853" strokeWidth="4" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                                <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Submission Received!</h2>
                            </div>
                            <p style={{ color: '#4a5568', fontSize: '1.08rem', marginBottom: 8 }}>
                                Thank you for your submission. Please complete your payment to initiate a chat with our experts.
                            </p>
                            <p style={{ color: '#4a5568', fontSize: '1.08rem', marginBottom: 24 }}>
                                We appreciate your trust and will contact you via email soon with next steps.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                <button
                                    className={styles.submitButton}
                                    style={{ minWidth: 200, marginBottom: 0 }}
                                    onClick={() => setSubmitSuccess(false)}
                                >
                                    Submit Another Question
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {submitError && (
                                <div className={styles.errorBanner}>
                                    {submitError}
                                </div>
                            )}

                            {step === 1 && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Basic Information</h2>
                                    <div className={styles.commonQuestionsContainer}>
                                        <div className={styles.formRowContainer}>
                                            <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                                <label htmlFor="email" className={styles.label}>
                                                    Email <span className={styles.required}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formState.email}
                                                    onChange={handleChange}
                                                    className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                                                    placeholder="your.email@example.com"
                                                />
                                                {formErrors.email && (
                                                    <p className={styles.errorText}>{formErrors.email}</p>
                                                )}
                                            </div>
                                            <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                                <label htmlFor="fullName" className={styles.label}>
                                                    Full Name <span className={styles.required}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    value={formState.fullName}
                                                    onChange={handleChange}
                                                    className={`${styles.input} ${formErrors.fullName ? styles.inputError : ''}`}
                                                    placeholder="John Doe"
                                                />
                                                {formErrors.fullName && (
                                                    <p className={styles.errorText}>{formErrors.fullName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.formRowContainer}>
                                            <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                                <label htmlFor="currentRole" className={styles.label}>
                                                    Current Role <span className={styles.required}>*</span>
                                                </label>
                                                <div 
                                                    className={`${styles.customDropdown} ${formErrors.currentRole ? styles.dropdownError : ''}`}
                                                    ref={currentRoleDropdownRef}
                                                >
                                                    <div 
                                                        className={styles.dropdownSelected} 
                                                        onClick={toggleCurrentRoleDropdown}
                                                        onKeyDown={handleCurrentRoleKeyDown}
                                                        aria-haspopup="listbox"
                                                        aria-expanded={isCurrentRoleDropdownOpen}
                                                        role="combobox"
                                                        tabIndex={0}
                                                    >
                                                        <span className={formState.currentRole ? '' : styles.placeholderText}>
                                                            {formState.currentRole || 'Select your current role'}
                                                        </span>
                                                        <svg 
                                                            className={`${styles.dropdownArrow} ${isCurrentRoleDropdownOpen ? styles.dropdownArrowUp : ''}`}
                                                            width="16" 
                                                            height="16" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    
                                                    {isCurrentRoleDropdownOpen && (
                                                        <ul className={styles.dropdownOptions} role="listbox">
                                                            {["College Student", "Recent Graduate(within 1-2 years)", "Employeed Professional", "Freelancer / Contractor / Self Employed", "Entrepreneur / Startup Founder", "Other"].map((option) => (
                                                                <li 
                                                                    key={option} 
                                                                    className={`${styles.dropdownOption} ${formState.currentRole === option ? styles.dropdownOptionSelected : ''}`}
                                                                    onClick={() => handleCurrentRoleSelect(option)}
                                                                    role="option"
                                                                    aria-selected={formState.currentRole === option}
                                                                >
                                                                    {option}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    
                                                    {/* Hidden real select for form submission */}
                                                    <select
                                                        id="currentRole"
                                                        name="currentRole"
                                                        value={formState.currentRole}
                                                        onChange={handleChange}
                                                        className={styles.hiddenSelect}
                                                        aria-hidden="true"
                                                        tabIndex={-1}
                                                    >
                                                        <option value="" disabled>Select your current role</option>
                                                        <option value="College Student">College Student</option>
                                                        <option value="Recent Graduate(within 1-2 years)">Recent Graduate(within 1-2 years)</option>
                                                        <option value="Employeed Professional">Employeed Professional</option>
                                                        <option value="Freelancer / Contractor / Self Employed">Freelancer / Contractor / Self Employed</option>
                                                        <option value="Entrepreneur / Startup Founder">Entrepreneur / Startup Founder</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                {formErrors.currentRole && (
                                                    <p className={styles.errorText}>{formErrors.currentRole}</p>
                                                )}
                                            </div>
                                            <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                                <label htmlFor="targetRole" className={styles.label}>
                                                    Target Role <span className={styles.required}>*</span>
                                                </label>
                                                <div 
                                                    className={`${styles.customDropdown} ${formErrors.targetRole ? styles.dropdownError : ''}`}
                                                    ref={dropdownRef}
                                                >
                                                    <div 
                                                        className={styles.dropdownSelected} 
                                                        onClick={toggleDropdown}
                                                        onKeyDown={handleDropdownKeyDown}
                                                        aria-haspopup="listbox"
                                                        aria-expanded={isDropdownOpen}
                                                        role="combobox"
                                                        tabIndex={0}
                                                    >
                                                        <span className={formState.targetRole ? '' : styles.placeholderText}>
                                                            {formState.targetRole || 'Select your target role'}
                                                        </span>
                                                        <svg 
                                                            className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowUp : ''}`}
                                                            width="16" 
                                                            height="16" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    
                                                    {isDropdownOpen && (
                                                        <ul className={styles.dropdownOptions} role="listbox">
                                                            {["Software Engineer", "AI Engineer", "Machine Learning Engineer", "Data Scientist", "Applied Scientist"].map((option) => (
                                                                <li 
                                                                    key={option} 
                                                                    className={`${styles.dropdownOption} ${formState.targetRole === option ? styles.dropdownOptionSelected : ''}`}
                                                                    onClick={() => handleOptionSelect(option)}
                                                                    role="option"
                                                                    aria-selected={formState.targetRole === option}
                                                                >
                                                                    {option}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    
                                                    {/* Hidden real select for form submission */}
                                                    <select
                                                        id="targetRole"
                                                        name="targetRole"
                                                        value={formState.targetRole}
                                                        onChange={handleChange}
                                                        className={styles.hiddenSelect}
                                                        aria-hidden="true"
                                                        tabIndex={-1}
                                                    >
                                                        <option value="" disabled>Select your target role</option>
                                                        <option value="Software Engineer">Software Engineer</option>
                                                        <option value="AI Engineer">AI Engineer</option>
                                                        <option value="ML Engineer">ML Engineer</option>
                                                        <option value="Data Scientist">Data Scientist</option>
                                                        <option value="Applied Scientist">Applied Scientist</option>
                                                    </select>
                                                </div>
                                                {formErrors.targetRole && (
                                                    <p className={styles.errorText}>{formErrors.targetRole}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.noticeBox}>
                                        This service includes:<br /><br />
                                        <span className={styles.bulletLine}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#e3c57c"/><path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            Match with one of our experts and discuss any topics of your interest;
                                        </span><br />
                                        <span className={styles.bulletLine}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#e3c57c"/><path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            Unlimited chat supported during your subscription;
                                        </span><br />
                                        <span className={styles.bulletLine}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#e3c57c"/><path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            Live communication or schedule a call with your coach;
                                        </span><br />
                                        <span className={styles.bulletLine}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#e3c57c"/><path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            On-demand guidance and insights from your dedicated career coach.
                                        </span>
                                    </div>
                                    <div className={styles.navButtonsRight}>
                                        <button
                                            type="button"
                                            className={styles.submitButton}
                                            onClick={handleNext}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                            {step === 2 && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>Start Chat With Common Questions</h2>
                                    <div className={styles.commonQuestionsContainer}>
                                        <div className={styles.questionsGrid}>
                                            {commonQuestions.map((question: string, index: number) => (
                                                <div
                                                    key={index}
                                                    className={`${styles.questionItem} ${
                                                        formState.selectedQuestions.includes(question) ? styles.questionItemSelected : ''
                                                    }`}
                                                    onClick={() => handleQuestionSelect(question)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleQuestionSelect(question);
                                                        }
                                                    }}
                                                >
                                                    {question}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.navButtons}>
                                        <button
                                            type="button"
                                            className={styles.submitButton}
                                            onClick={handlePrevious}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.submitButton}
                                            onClick={handleNext}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                            {step === 3 && (
                                <div className={styles.formSection}>
                                    <div className={styles.formGroup}>
                                        <h2 className={styles.sectionTitle}>What else would you like to ask?</h2>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formState.message}
                                            onChange={handleChange}
                                            className={`${styles.textarea} ${formErrors.message ? styles.inputError : ''}`}
                                            placeholder="Ask a question about your resume, job search, interview preparation, or career transition..."
                                            rows={4}
                                        />
                                        {formErrors.message && (
                                            <span className={styles.errorText}>{formErrors.message}</span>
                                        )}
                                    </div>
                                    <div className={styles.navButtons}>
                                        <button
                                            type="button"
                                            className={styles.submitButton}
                                            onClick={handlePrevious}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.submitButton}
                                            onClick={handleNext}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                            {step === 4 && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>Subscription Options</h2>
                                    <div className={styles.subscriptionOptionsRow}>
                                        <button
                                            type="button"
                                            className={`${styles.subscriptionOptionButton} ${subscriptionType === 'biweekly' ? styles.selected : ''}`}
                                            onClick={() => setSubscriptionType('biweekly')}
                                        >
                                            $24.99<br/>every 2 weeks
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.subscriptionOptionButton} ${subscriptionType === 'monthly' ? styles.selected : ''}`}
                                            onClick={() => setSubscriptionType('monthly')}
                                        >
                                            $39.00<br/>per month
                                        </button>
                                    </div>
                                    <div className={styles.navButtonsCenter}>
                                        <button
                                            type="button"
                                            className={styles.submitButton}
                                            onClick={handlePrevious}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className={`${styles.submitButton} ${styles.subscribeSubmitButton}`}
                                            disabled={isSubmitting || !subscriptionType}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Subscribe'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
} 