"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from './ResumeForm.module.css';
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
  
  body.resume-analysis-page {
    background: #F5F5F5 !important;
    background-color: #F5F5F5 !important;
    background-image: none !important;
  }
`;

interface ResumeFormState {
    email: string;
    fullName: string;
    currentRole: string;
    targetRole: string;
    resume: File | null;
    careerObjectives: string;
}

interface FormErrors {
    email?: string;
    fullName?: string;
    currentRole?: string;
    targetRole?: string;
    resume?: string;
    careerObjectives?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export default function ResumeAnalysisForm() {
    // Form state
    const [formState, setFormState] = useState<ResumeFormState>({
        email: '',
        fullName: '',
        currentRole: '',
        targetRole: '',
        resume: null,
        careerObjectives: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    
    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);
    
    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add state for custom dropdowns
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCurrentRoleDropdownOpen, setIsCurrentRoleDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentRoleDropdownRef = useRef<HTMLDivElement>(null);
    
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

        // Resume file validation
        if (!formState.resume) {
            errors.resume = 'Resume is required';
        }

        return errors;
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

        // Validate form
        const errors = validateForm();
        setFormErrors(errors);

        // If no errors, submit form
        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                // Create FormData
                const formData = new FormData();
                
                // Add resume file
                if (formState.resume) {
                    formData.append('file', formState.resume);
                }
                
                // Add other form data as JSON string
                const jsonData = JSON.stringify({
                    email: formState.email,
                    fullName: formState.fullName,
                    currentRole: formState.currentRole,
                    targetRole: formState.targetRole,
                    careerObjectives: formState.careerObjectives
                });
                formData.append('form_data', jsonData);
                
                // Submit form data to the endpoint
                const response = await fetch(`${API_ENDPOINT}/resume-analysis-lab`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Submission failed: ${response.status} - ${errorText}`);
                }
                
                const data = await response.json();
                
                // Store the submission ID
                setAnalysisId(data.submission_id);
                
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

    // Add keyboard navigation for dropdown
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
        document.body.classList.add('resume-analysis-page');
        
        // Clean up function
        return () => {
            document.body.classList.remove('resume-analysis-page');
        };
    }, []);

    return (
        <div className={styles.container} style={{ backgroundColor: '#F5F5F5' }}>
            <Head>
                <title>Resume Analysis Lab</title>
                <meta name="description" content="Upload your resume for AI-powered analysis and optimization" />
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
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff' }}>Drop-Off Your Resume</h1>
                    <br/>

                    {submitSuccess ? (
                        <div className={styles.successMessage}>
                            <h2>Thank you for your submission!</h2>
                            <p>Your resume has been received and is being analyzed.</p>
                            {analysisId && (
                                <div>
                                    <p>Your Analysis ID: <strong>{analysisId}</strong></p>
                                    <p>Please save this ID for reference. We will also email your results to {formState.email}.</p>
                                </div>
                            )}
                            <button
                                className={styles.submitButton}
                                onClick={() => setSubmitSuccess(false)}
                            >
                                Submit Another Resume
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
                                <h2 className={styles.sectionTitle}>Upload Resume</h2>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Resume or Screenshot (PDF, Word, or Images, max 2MB) <span className={styles.required}>*</span>
                                    </label>
                                    
                                    <div 
                                        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${formErrors.resume ? styles.dropzoneError : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className={styles.dropzoneIcon}>
                                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M3 15V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <p className={styles.dropzoneText}>
                                            Drag and drop your resume or screenshot here, or click to select a file
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
                                        <div className={styles.filePreview}>
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
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="careerObjectives" className={styles.label}>
                                        Provide details about your career objectives
                                    </label>
                                    <textarea
                                        id="careerObjectives"
                                        name="careerObjectives"
                                        value={formState.careerObjectives}
                                        onChange={handleChange}
                                        className={`${styles.textarea} ${formErrors.careerObjectives ? styles.inputError : ''}`}
                                        placeholder="Describe your career goals or specific feedback you're looking for..."
                                        rows={4}
                                    />
                                    {formErrors.careerObjectives && (
                                        <p className={styles.errorText}>{formErrors.careerObjectives}</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.buttonContainer}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit & Checkout'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
} 