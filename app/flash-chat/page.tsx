"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from './ChatForm.module.css';
import '../globals.css';
import './global-override.css';
import { API_ENDPOINT } from "@/app/components/config";

// Add global styles to ensure proper rendering
const globalStyles = `
  html, body {
    overflow-y: auto !important;
    height: 100% !important;
    max-height: 100vh;
    background-color: #F5F5F5 !important;
    padding: 0;
    margin: 0;
  }
  
  body {
    overflow: auto;
    overflow-x: hidden;
  }
  
  input, select, textarea, button, label {
    background-color: #ffffff !important;
    color: #333 !important;
  }
  
  body.flash-chat-page {
    background: #F5F5F5 !important;
    background-color: #F5F5F5 !important;
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
        "How can I make my resume stand out for software/AI engineering roles?",
        "Which programming languages and frameworks are most in-demand for my target role?",
        "How do I prepare for coding interviews and system design interviews?",
        "How important is a master's or PhD degree for AI engineering positions?",
        "What AI/ML projects or personal portfolio work impress recruiters the most?",
        "How can I transition into AI engineering from a traditional software development background?"
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

    // Handle checkbox changes
    const handleCheckboxChange = (question: string) => {
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

    // Validate the form
    const validateForm = (): FormErrors => {
        const errors: FormErrors = {};

        // Email validation
        if (!formState.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            errors.email = 'Email is invalid';
        }

        // Full name validation
        if (!formState.fullName) {
            errors.fullName = 'Full name is required';
        }
        
        // Current role validation
        if (!formState.currentRole) {
            errors.currentRole = 'Current role is required';
        }

        // Target role validation
        if (!formState.targetRole) {
            errors.targetRole = 'Target role is required';
        }

        // Message validation - only validate length if provided
        if (formState.message && formState.message.length < 10) {
            errors.message = 'Message must be at least 10 characters';
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        setFormErrors(errors);

        // If no errors, submit form
        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                // Submit form data to the endpoint
                const response = await fetch(`${API_ENDPOINT}/flash-chat`, {
                    method: 'POST',
                    //headers: {
                    //    'Content-Type': 'application/json',
                    //},
                    body: JSON.stringify({
                        email: formState.email,
                        fullName: formState.fullName,
                        currentRole: formState.currentRole,
                        targetRole: formState.targetRole,
                        message: formState.message,
                        selectedQuestions: formState.selectedQuestions
                    }),
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Submission failed: ${response.status} - ${errorText}`);
                }
                
                const data = await response.json();
                
                // Store the submission ID
                setChatId(data.chat_id);
                
                // Redirect to payment page (Stripe checkout with custom fields)
                if (data.payment_url) {
                    window.location.href = data.payment_url;
                } else {
                    // Fallback to direct payment link if Stripe checkout URL is not available
                    window.location.href = data.direct_payment_link;
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
                setIsSubmitting(false);
            }
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

    return (
        <div className={styles.container} style={{ backgroundColor: '#F5F5F5' }}>
            <Head>
                <title>Flash Chat</title>
                <meta name="description" content="Ask career questions and get quick expert answers" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{globalStyles}</style>
                <style>{`
                    body {
                        background: #F5F5F5 !important;
                        background-color: #F5F5F5 !important;
                        background-image: none !important;
                    }
                `}</style>
            </Head>

            <main className={styles.main} style={{ backgroundColor: '#F5F5F5' }}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff' }}>Initiate a chat with your questions</h1>
                    <br/>

                    {submitSuccess ? (
                        <div className={styles.successMessage}>
                            <h2>Thank you for your message!</h2>
                            <p>Your question has been received and will be answered by our experts.</p>
                            {chatId && (
                                <div>
                                    <p>Your Chat ID: <strong>{chatId}</strong></p>
                                    <p>Please save this ID for reference. We will also email our response to {formState.email}.</p>
                                </div>
                            )}
                            <button
                                className={styles.submitButton}
                                onClick={() => setSubmitSuccess(false)}
                            >
                                Submit Another Question
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {submitError && (
                                <div className={styles.errorBanner}>
                                    {submitError}
                                </div>
                            )}

                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Basic Information</h2>
                                
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
                                                    {[
                                                        "College Student", 
                                                        "Recent Graduate(within 1-2 years)", 
                                                        "Employeed Professional", 
                                                        "Freelancer / Contractor / Self Employed", 
                                                        "Entrepreneur / Startup Founder", 
                                                        "Other"
                                                    ].map((option) => (
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
                                                    {[
                                                        "Software Engineer", 
                                                        "AI Engineer", 
                                                        "Machine Learning Engineer", 
                                                        "Data Scientist", 
                                                        "Applied Scientist"
                                                    ].map((option) => (
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

                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Start your chat with:</h2>
                                
                                <div className={styles.formGroup}>
                                    <div className={styles.commonQuestionsContainer}>
                                        <p className={styles.commonQuestionsTitle}>Common questions (select any that apply):</p>
                                        {commonQuestions.map((question, index) => (
                                            <div key={index} className={styles.checkboxContainer}>
                                                <input
                                                    type="checkbox"
                                                    id={`question-${index}`}
                                                    checked={formState.selectedQuestions.includes(question)}
                                                    onChange={() => handleCheckboxChange(question)}
                                                    className={styles.checkbox}
                                                />
                                                <label htmlFor={`question-${index}`} className={styles.checkboxLabel}>
                                                    {question}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <label htmlFor="message" className={styles.label}>
                                        What else would you like to ask?
                                    </label>
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
                            </div>

                            <div className={styles.buttonContainer}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Subscribe - $39/month'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
} 