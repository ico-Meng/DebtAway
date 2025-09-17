"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from './ReferralForm.module.css';
import '../globals.css';
import './global-override.css';
import { API_ENDPOINT } from "@/app/components/config";

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
  
  body.referral-page {
    background: #edece3 !important;
    background-color: #edece3 !important;
    background-image: none !important;
  }
`;

interface ReferralFormState {
    email: string;
    fullName: string;
    currentRole: string;
    targetCompany: string;
    resume: File | null;
    experience: string;
}

interface FormErrors {
    email?: string;
    fullName?: string;
    currentRole?: string;
    targetCompany?: string;
    resume?: string;
    experience?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export default function ReferralForm() {
    // Form state
    const [formState, setFormState] = useState<ReferralFormState>({
        email: '',
        fullName: '',
        currentRole: '',
        targetCompany: '',
        resume: null,
        experience: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showCloseNotification, setShowCloseNotification] = useState(false);
    
    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);
    
    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Handle drag events
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    // Handle drop event
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            validateAndSetFile(file);
        }
    }, []);

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            validateAndSetFile(file);
        }
    };

    // Validate and set file
    const validateAndSetFile = (file: File) => {
        // Reset previous errors
        setFormErrors(prev => ({ ...prev, resume: undefined }));
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setFormErrors(prev => ({ 
                ...prev, 
                resume: 'File size exceeds 2MB limit' 
            }));
            return;
        }
        
        // Check file type
        const allowedTypes = [
            // Documents
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/tiff',
            'image/bmp'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            setFormErrors(prev => ({ 
                ...prev, 
                resume: 'Unsupported file type. Please upload PDF, Word document, or common image formats (JPG, PNG, etc.)' 
            }));
            return;
        }
        
        // Set the file in state
        setFormState(prev => ({
            ...prev,
            resume: file
        }));
    };

    // Remove the selected file
    const removeFile = () => {
        setFormState(prev => ({
            ...prev,
            resume: null
        }));
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };
    
    // Check if file is an image
    const isImageFile = (mimeType: string): boolean => {
        return mimeType.startsWith('image/');
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('Form submitted! Current form state:', formState);
        
        // Validate form - only validate fields that exist in the form
        const errors: FormErrors = {};
        
        if (!formState.email) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formState.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formState.resume) {
            errors.resume = 'Resume is required';
        }

        setFormErrors(errors);
        console.log('Validation errors:', errors);

        // If validation passes
        if (Object.keys(errors).length === 0) {
            console.log('Validation passed, submitting form...');
            setIsSubmitting(true);
            
            // Start the API call in the background (non-blocking)
            const formData = new FormData();
            if (formState.resume) {
                formData.append('file', formState.resume);
            }
            formData.append('form_data', JSON.stringify({
                email: formState.email,
                fullName: formState.fullName || '',
                currentRole: formState.currentRole || '',
                targetCompany: formState.targetCompany || '',
                experience: formState.experience || ''
            }));

            console.log('Sending API request to:', `${API_ENDPOINT}/referral_application`);

            fetch(`${API_ENDPOINT}/referral_application`, {
                method: 'POST',
                body: formData,
            }).then(response => {
                console.log('API response received:', response.status, response.statusText);
                if (response.ok) {
                    console.log('Referral application successful');
                } else {
                    console.log('Failed to submit referral application', response);
                }
            }).catch(error => {
                console.error('Error submitting referral application:', error);
            });
            
            // Immediately show success and redirect (don't wait for API)
            setIsSubmitting(false);
            setSubmitSuccess(true);
            
            // Show close notification after 2 seconds
            setTimeout(() => {
                setShowCloseNotification(true);
            }, 1500);
        } else {
            console.log('Validation failed, not submitting');
        }
    };

    // Add useEffect to set body class
    useEffect(() => {
        // Add class to body for specific styling
        document.body.classList.add('referral-page');
        
        // Clean up function
        return () => {
            document.body.classList.remove('referral-page');
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
                <title>Top Company Referral Opportunity</title>
                <meta name="description" content="Upload your resume and win a top company referral opportunity" />
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
                        
                        input[type="email"], input[type="text"] {
                            min-width: 300px !important;
                        }
                        
                        button {
                            min-width: 140px !important;
                        }
                        
                        /* Align content below "Win Top Company Referral" with logo position */
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
                                    Successfully Submitted!
                                </h2>
                            </div>
                            <p style={{ color: '#4a5568', fontSize: '1.08rem', marginBottom: 8, textAlign: 'center' }}>
                                Thank you for applying! We'll review your resume and contact you if you match any referral opportunities.
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
                                    Career Coaching Opportunity
                                </h2>
                                
                                <span className={styles.bulletLine} style={{ marginLeft: '20px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Top company and FAANG experts
                                </span><br />
                                <span className={styles.bulletLine} style={{ marginLeft: '20px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Available roles: SDE, DS/DA, AI/ML
                                </span><br />
                                <span className={styles.bulletLine} style={{ marginLeft: '20px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <strong>30% OFF</strong>limited time offer
                                </span><br />
                                <span className={styles.bulletLine} style={{ marginLeft: '20px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="#e3c57c"/>
                                        <path d="M5 8.5L7 10.5L11 6.5" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <strong>FREE</strong> call for career coaching
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
                                        style={{ width: '320px', display: 'block', margin: '0 auto', backgroundColor: '#ffffff' }}
                                    />
                                    {formErrors.email && (
                                        <p className={styles.errorText}>{formErrors.email}</p>
                                    )}
                                </div>


                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ marginLeft: '24px' }}>
                                        Resume (PDF, Word, or Images, max 2MB) <span className={styles.required}>*</span>
                                    </label>
                                    
                                    <div 
                                        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${formErrors.resume ? styles.dropzoneError : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ width: '320px', margin: '8px auto', }}
                                    >
                                        <div className={styles.dropzoneIcon}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M3 15V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <p className={styles.dropzoneText}>
                                            Drag and drop your resume here, or click to select
                                        </p>
                                        <input
                                            type="file"
                                            id="resume"
                                            name="resume"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.tiff,.bmp"
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    
                                    {formState.resume && (
                                        <div className={styles.filePreview} style={{ width: '320px', margin: '8px auto' }}>
                                            {isImageFile(formState.resume.type) ? (
                                                <div className={styles.imagePreviewContainer}>
                                                    <img 
                                                        src={URL.createObjectURL(formState.resume)} 
                                                        alt="Preview" 
                                                        className={styles.imagePreview} 
                                                    />
                                                </div>
                                            ) : (
                                                <div className={styles.fileIcon}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            )}
                                            <div className={styles.fileInfo}>
                                                <span className={styles.fileName}>{formState.resume.name}</span>
                                                <span className={styles.fileSize}> - {formatFileSize(formState.resume.size)}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                className={styles.fileRemove} 
                                                onClick={removeFile}
                                                aria-label="Remove file"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                    
                                    {formErrors.resume && (
                                        <p className={styles.errorText}>{formErrors.resume}</p>
                                    )}
                                </div>

                                <div className={styles.buttonContainerClose}>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={isSubmitting}
                                        style={{ minWidth: '140px', width: 'auto' }}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Apply Now'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                    
                    {/* Career Landing Group branding at bottom */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        justifyContent: 'center',
                        padding: '1rem',
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid #eee',
                        fontSize: '0.85rem',
                        color: '#666',
                        fontWeight: 'bold'
                    }}>
                        <img src="/images/logo.svg" alt="Career Landing Group Logo" style={{ height: '24px', width: 'auto' }} />
                        Career Landing Group
                    </div>
                </div>
            </main>
        </div>
    );
}