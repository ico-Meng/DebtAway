"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import styles from './JobsForm.module.css';
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
    background-color: #ffffff !important;
    color: #333 !important;
  }
  
  .submitButton,
  button[class*="submitButton"] {
    background-color: #9B6A10 !important;
    color: white !important;
  }
  
  .submitButton:hover,
  button[class*="submitButton"]:hover {
    background-color: #9B6A10 !important;
    box-shadow: 0 0 8px 4px rgba(227, 197, 124, 1) !important;
  }
  
  .submitButton:disabled,
  button[class*="submitButton"]:disabled {
    background-color: #ccc !important;
    color: white !important;
  }
  
  body.jobs-page {
    background: #edece3 !important;
    background-color: #edece3 !important;
    background-image: none !important;
  }
  
`;

interface JobFormState {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isStudent: string;
    currentEmployer: string;
    resume: File | null;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    websiteUrl: string;
    selectedPosition: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    isStudent?: string;
    currentEmployer?: string;
    resume?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    websiteUrl?: string;
    selectedPosition?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const JOB_POSITIONS = [
    "Software Engineer Internship: Full Stack",
    "Full Stack Software Engineer", 
    "Backend Software Engineer",
    "Frontend Software Engineer",
    "Data Analyst",
    "Data Scientist"
];

// Component that handles search params
function JobsFormWithParams() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    
    // Determine default position based on URL parameter
    const getDefaultPosition = () => {
        if (roleParam && JOB_POSITIONS.includes(roleParam)) {
            return roleParam;
        }
        return "Full Stack Software Engineer";
    };

    return <JobsFormContent defaultPosition={getDefaultPosition()} />;
}

// Main form component
function JobsFormContent({ defaultPosition }: { defaultPosition: string }) {

    // Form state
    const [formState, setFormState] = useState<JobFormState>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        isStudent: '',
        currentEmployer: '',
        resume: null,
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        websiteUrl: '',
        selectedPosition: defaultPosition
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    
    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);
    
    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Custom dropdown state
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const positionDropdownRef = useRef<HTMLDivElement>(null);
    const studentDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
                setIsPositionDropdownOpen(false);
            }
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Toggle position dropdown
    const togglePositionDropdown = () => {
        setIsPositionDropdownOpen(!isPositionDropdownOpen);
    };

    // Toggle student dropdown
    const toggleStudentDropdown = () => {
        setIsStudentDropdownOpen(!isStudentDropdownOpen);
    };

    // Handle position selection
    const handlePositionSelect = (value: string) => {
        setFormState(prev => ({
            ...prev,
            selectedPosition: value
        }));
        setIsPositionDropdownOpen(false);
    };

    // Handle student selection
    const handleStudentSelect = (value: string) => {
        setFormState(prev => ({
            ...prev,
            isStudent: value
        }));
        setIsStudentDropdownOpen(false);
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

        // Required field validation
        if (!formState.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!formState.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        // Email validation
        if (!formState.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            errors.email = 'Email is invalid';
        }

        // Phone number validation
        if (!formState.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        }

        // Student status validation
        if (!formState.isStudent) {
            errors.isStudent = 'Please select student status';
        }

        // Current employer validation
        if (!formState.currentEmployer.trim()) {
            errors.currentEmployer = 'Current or most recent employer is required';
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
        setIsSubmitting(true);
        setSubmitError(null);

        const errors = validateForm();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                // Create FormData for file upload
                const formData = new FormData();
                
                // Add form fields
                formData.append('firstName', formState.firstName);
                formData.append('lastName', formState.lastName);
                formData.append('email', formState.email);
                formData.append('phoneNumber', formState.phoneNumber);
                formData.append('isStudent', formState.isStudent);
                formData.append('currentEmployer', formState.currentEmployer);
                formData.append('linkedinUrl', formState.linkedinUrl);
                formData.append('githubUrl', formState.githubUrl);
                formData.append('portfolioUrl', formState.portfolioUrl);
                formData.append('websiteUrl', formState.websiteUrl);
                formData.append('selectedPosition', formState.selectedPosition);
                
                // Add resume file if exists
                if (formState.resume) {
                    formData.append('resume', formState.resume);
                }
                
                // Make API call
                const response = await fetch(`${API_ENDPOINT}/job_application`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('Job application submitted successfully:', result);
                setSubmitSuccess(true);
            } catch (error) {
                console.error('Submission error:', error);
                setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
            }
        }
        
        setIsSubmitting(false);
    };

    // Add useEffect to set body class and handle role parameter
    useEffect(() => {
        document.body.classList.add('jobs-page');
        
        // Listen for role parameter from parent window
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SET_ROLE' && event.data.role) {
                setFormState(prev => ({
                    ...prev,
                    selectedPosition: event.data.role
                }));
            }
        };
        
        window.addEventListener('message', handleMessage);
        
        return () => {
            document.body.classList.remove('jobs-page');
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Simple height posting for iframe embedding (following flash-chat pattern)
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
                <title>Job Application</title>
                <meta name="description" content="Apply for job positions at our company" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{globalStyles}</style>
                <style>{`
                    body {
                        background: #edece3 !important;
                        background-color: #edece3 !important;
                        background-image: none !important;
                    }
                    
                    /* CRITICAL: Force submit button background */
                    button[class*="submitButton"] {
                        background-color: #9B6A10 !important;
                        color: white !important;
                        border: none !important;
                    }
                    
                    button[class*="submitButton"]:hover {
                        background-color: #9B6A10 !important;
                        box-shadow: 0 0 8px 4px rgba(227, 197, 124, 1) !important;
                    }
                    
                    button[class*="submitButton"]:disabled {
                        background-color: #ccc !important;
                        color: white !important;
                    }
                `}</style>
            </Head>

            <main className={styles.main} style={{ backgroundColor: '#edece3' }}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff' }}>Job Application</h1>
                    <br/>

                    {submitSuccess ? (
                        <div className={styles.successMessage} style={{ 
                            background: '#fff', 
                            borderRadius: '16px', 
                            boxShadow: '0 4px 24px rgba(0,0,0,0.07)', 
                            padding: '2rem 1.5rem', 
                            maxWidth: 420, 
                            margin: '1rem auto',
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                                <svg width="50" height="50" viewBox="0 0 52 52" style={{ marginBottom: 12 }}>
                                    <circle cx="26" cy="26" r="25" fill="none" stroke="#00c853" strokeWidth="3" />
                                    <path fill="none" stroke="#00c853" strokeWidth="4" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', marginBottom: 8, textAlign: 'center' }}>Application Submitted!</h2>
                            </div>
                            <p style={{ color: '#4a5568', fontSize: '1rem', marginBottom: 16, textAlign: 'center' }}>
                                Thank you for your application. We will review your submission and contact you soon.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                <button
                                    className={styles.submitButton}
                                    style={{ 
                                        minWidth: 200, 
                                        marginBottom: 0, 
                                        backgroundColor: '#9B6A10', 
                                        color: 'white',
                                        border: 'none'
                                    }}
                                    onClick={() => setSubmitSuccess(false)}
                                >
                                    Submit Another Application
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

                            {/* Job Position Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Job Position</h2>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="selectedPosition" className={styles.label}>
                                        Select Position
                                    </label>
                                    <div 
                                        className={`${styles.customDropdown} ${formErrors.selectedPosition ? styles.dropdownError : ''}`}
                                        ref={positionDropdownRef}
                                    >
                                        <div 
                                            className={styles.dropdownSelected} 
                                            onClick={togglePositionDropdown}
                                            aria-haspopup="listbox"
                                            aria-expanded={isPositionDropdownOpen}
                                            role="combobox"
                                            tabIndex={0}
                                        >
                                            <span className={formState.selectedPosition ? '' : styles.placeholderText}>
                                                {formState.selectedPosition || 'Select a position'}
                                            </span>
                                            <svg 
                                                className={`${styles.dropdownArrow} ${isPositionDropdownOpen ? styles.dropdownArrowUp : ''}`}
                                                width="16" 
                                                height="16" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        
                                        {isPositionDropdownOpen && (
                                            <ul className={styles.dropdownOptions} role="listbox">
                                                {JOB_POSITIONS.map((position) => (
                                                    <li 
                                                        key={position} 
                                                        className={`${styles.dropdownOption} ${formState.selectedPosition === position ? styles.dropdownOptionSelected : ''}`}
                                                        onClick={() => handlePositionSelect(position)}
                                                        role="option"
                                                        aria-selected={formState.selectedPosition === position}
                                                    >
                                                        {position}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Job Description Area */}
                                <div className={styles.jobDescriptionSection}>
                                    <h3 className={styles.jobDescriptionTitle}>Job Description</h3>
                                    <div className={styles.jobDescriptionContent}>
                                        <h4 className={styles.jobTitle}>{formState.selectedPosition}</h4>
{formState.selectedPosition === "Full Stack Software Engineer" ? (
                                            <div className={styles.jobDetailsContainer}>
                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Company Description</h5>
                                                    <p className={styles.sectionText}>
                                                        Ambit Technology Group, LLC is a technology startup specializing in delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Our flagship platform, Career Landing Group, offers expert coaching and career development support for aspiring professionals in the tech industry.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Role Description</h5>
                                                    <p className={styles.sectionText}>
                                                        This is a full-time remote role for a Full Stack Engineer, located in the US. The Full Stack Engineer will be responsible for designing, developing, and maintaining both back-end and front-end solutions. Day-to-day tasks will include system design, coding, troubleshooting, and collaborating with cross-functional teams to build highly scalable and efficient software applications. The role involves ensuring seamless user experiences, optimizing performance, and maintaining code quality and consistency.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Qualifications</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Experience in Back-End Web Development. Familiar with Python, FastAPI, or related tools</p>
                                                        <p>• Proficiency in Front-End Development, including knowledge of Javascript, React or related framework</p>
                                                        <p>• Strong understanding and experience with cloud computing platform like AWS</p>
                                                        <p>• Strong Software Development skills and understanding of the software lifecycle</p>
                                                        <p>• Excellent problem-solving abilities and attention to detail</p>
                                                        <p>• Effective communication and teamwork skills</p>
                                                        <p>• Bachelor's degree in Computer Science, Engineering, or related field</p>
                                                        <p>• Experience with AI coding tools (Cursor, Claude Code, etc.) is a plus</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Compensation</h5>
                                                    <p className={styles.sectionText}>
                                                        The expected salary range for this position is:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Annual Base Salary:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        $120,000 - $135,000
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Plus bonus depends on annual performance.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Education Requirements</h5>
                                                    <p className={styles.sectionText}>
                                                        We require at least a Bachelor's degree in a related field or equivalent experience.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Visa Sponsorship</h5>
                                                    <p className={styles.sectionText}>
                                                        We do sponsor visas! However, we aren't able to successfully sponsor visas for every role and every candidate. But if we make you an offer, we will make every reasonable effort to get you a visa.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>How We're Different</h5>
                                                    <p className={styles.sectionText}>
                                                        We are a rapidly growing technology startup harnessing the power of AI to drive software development. Our team is building innovative solutions from the ground up to enhance the efficiency of career analytics, coaching, and job matching for young professionals.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : formState.selectedPosition === "Backend Software Engineer" ? (
                                            <div className={styles.jobDetailsContainer}>
                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Company Description</h5>
                                                    <p className={styles.sectionText}>
                                                        Ambit Technology Group, LLC is a technology startup specializing in delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Our flagship platform, Career Landing Group, offers expert coaching and career development support for aspiring professionals in the tech industry.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Role Description</h5>
                                                    <p className={styles.sectionText}>
                                                        This is a full-time remote role for a Backend Software Engineer, located in the US. The Backend Software Engineer will be responsible for designing, developing, and maintaining large-scale, distributed backend systems that power our platform. Day-to-day tasks include system architecture, API development, database optimization, and ensuring scalability to support high throughput and a growing client base. The role requires deep expertise in backend engineering, performance tuning, and working with cloud-native infrastructure to deliver reliable and secure services.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Qualifications</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Strong experience in Back-End Web Development, with proficiency in Python (FastAPI, Django, or Flask) or a comparable backend framework.</p>
                                                        <p>• Solid understanding of distributed systems and building applications that handle large-scale throughput and concurrent users.</p>
                                                        <p>• Hands-on experience with databases (SQL and NoSQL), data modeling, query optimization, and caching strategies.</p>
                                                        <p>• Proficiency with cloud platforms (AWS strongly preferred), including services like Lambda, API Gateway, S3, DynamoDB, RDS, ECS/EKS.</p>
                                                        <p>• Experience with API design (REST, GraphQL) and microservices architecture.</p>
                                                        <p>• Strong understanding of system performance, scalability, and reliability engineering.</p>
                                                        <p>• Familiarity with CI/CD pipelines, containerization (Docker), and infrastructure-as-code tools (Terraform, CloudFormation, or SAM).</p>
                                                        <p>• Strong knowledge of security best practices in backend systems.</p>
                                                        <p>• Excellent problem-solving abilities, debugging skills, and attention to detail.</p>
                                                        <p>• Effective communication and collaboration skills with cross-functional teams.</p>
                                                        <p>• Bachelor's degree in Computer Science, Engineering, or related field (or equivalent practical experience).</p>
                                                        <p>• Experience with AI-assisted coding tools (Cursor, Claude Code, Copilot, etc.) is a plus.</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Compensation</h5>
                                                    <p className={styles.sectionText}>
                                                        The expected salary range for this position is:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Annual Base Salary:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        $125,000 – $140,000
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Bonus: Performance-based annual bonus
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Education Requirements</h5>
                                                    <p className={styles.sectionText}>
                                                        Bachelor's degree in Computer Science, Engineering, or related technical field, or equivalent experience.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Visa Sponsorship</h5>
                                                    <p className={styles.sectionText}>
                                                        We do sponsor visas! While not guaranteed for every role and candidate, if we extend you an offer, we will make every reasonable effort to secure visa sponsorship.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>How We're Different</h5>
                                                    <p className={styles.sectionText}>
                                                        We are a rapidly growing technology startup harnessing the power of AI to drive software development. Our team is building innovative solutions from the ground up to enhance the efficiency of career analytics, coaching, and job matching for young professionals. Joining us means working on high-impact projects with modern cloud-native technologies, solving challenges of scale, and shaping the future of AI-driven career development platforms.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : formState.selectedPosition === "Software Engineer Internship: Full Stack" ? (
                                            <div className={styles.jobDetailsContainer}>
                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Company Description</h5>
                                                    <p className={styles.sectionText}>
                                                        Ambit Technology Group, LLC is a technology startup specializing in delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Our flagship platform, Career Landing Group, offers expert coaching and career development support for aspiring professionals in the tech industry.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Role Description</h5>
                                                    <p className={styles.sectionText}>
                                                        This is a full-time remote internship for a Full Stack Software Engineer Intern, located in the US. The intern will work closely with our engineering team to gain hands-on experience in both front-end and back-end development. Day-to-day tasks will include coding simple features, learning system design concepts, debugging basic issues, and collaborating with team members on real projects. This role is designed to provide practical experience in building scalable web applications while receiving mentorship and guidance from experienced engineers.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Qualifications</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Currently enrolled in a Computer Science, Engineering, or related degree program (or recent graduate within 1 year)</p>
                                                        <p>• Basic knowledge of programming fundamentals and data structures</p>
                                                        <p>• Some experience with at least one programming language (Python, JavaScript, Java, or similar)</p>
                                                        <p>• Familiarity with web development concepts (HTML, CSS, basic JavaScript)</p>
                                                        <p>• Basic understanding of databases and SQL</p>
                                                        <p>• Eagerness to learn new technologies and frameworks</p>
                                                        <p>• Strong problem-solving mindset and attention to detail</p>
                                                        <p>• Good communication skills and ability to work in a team environment</p>
                                                        <p>• Experience with Git/version control is a plus</p>
                                                        <p>• Any exposure to React, Node.js, or cloud platforms (AWS) is a plus</p>
                                                        <p>• Experience with AI coding tools (Cursor, Claude Code, etc.) is a plus</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Compensation</h5>
                                                    <p className={styles.sectionText}>
                                                        The expected compensation for this internship is:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Hourly Rate: $25 - $40 per hour
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Full-time internship (40 hours per week)
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Potential for full-time offer upon successful completion
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Education Requirements</h5>
                                                    <p className={styles.sectionText}>
                                                        Currently pursuing or recently completed a Bachelor's degree or above in Computer Science, Engineering, or related technical field. We also welcome self-taught developers with demonstrable programming skills and portfolio projects.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>What You'll Learn</h5>
                                                    <p className={styles.sectionText}>
                                                        This internship offers hands-on experience with modern web development technologies, cloud computing platforms, and AI-driven development tools. You'll work on real products used by thousands of users, learn industry best practices, and receive mentorship from experienced engineers. We provide a supportive learning environment where interns can grow their technical skills while contributing to meaningful projects that impact career development for young professionals.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : formState.selectedPosition === "Frontend Software Engineer" ? (
                                            <div className={styles.jobDetailsContainer}>
                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Company Description</h5>
                                                    <p className={styles.sectionText}>
                                                        Ambit Technology Group, LLC is a technology startup specializing in delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Our flagship platform, Career Landing Group, offers expert coaching and career development support for aspiring professionals in the tech industry.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Role Description</h5>
                                                    <p className={styles.sectionText}>
                                                        This is a full-time remote role for a Frontend Software Engineer, located in the US. The Frontend Software Engineer will be responsible for building exceptional user interfaces and experiences that power our AI-driven career coaching platform. Day-to-day tasks include developing responsive web applications, implementing modern UI/UX designs, optimizing application performance, and collaborating with design and backend teams to deliver seamless user experiences. The role involves working with cutting-edge frontend technologies, ensuring accessibility standards, and maintaining high code quality across all user-facing applications.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Qualifications</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Strong proficiency in modern JavaScript (ES6+) and TypeScript</p>
                                                        <p>• Expert-level experience with React 18+ including hooks, context, and concurrent features</p>
                                                        <p>• Proficiency with Next.js 14+ (App Router, Server Components, Server Actions)</p>
                                                        <p>• Strong skills in modern CSS (Grid, Flexbox, CSS-in-JS) and CSS preprocessors (Sass/SCSS)</p>
                                                        <p>• Experience with component libraries (Material-UI, Chakra UI, Ant Design) and design systems</p>
                                                        <p>• Proficiency with state management solutions (Redux Toolkit, Zustand, or React Query/TanStack Query)</p>
                                                        <p>• Experience with modern build tools (Vite, Webpack, Turbopack) and package managers (npm, yarn, pnpm)</p>
                                                        <p>• Strong understanding of responsive design, mobile-first development, and progressive web apps (PWA)</p>
                                                        <p>• Experience with testing frameworks (Jest, React Testing Library, Playwright, or Cypress)</p>
                                                        <p>• Knowledge of web accessibility standards (WCAG) and SEO best practices</p>
                                                        <p>• Experience with Git workflows, code reviews, and collaborative development practices</p>
                                                        <p>• Understanding of web performance optimization and Core Web Vitals</p>
                                                        <p>• Bachelor's degree in Computer Science, Engineering, or related field</p>
                                                        <p>• Experience with AI-assisted coding tools (Cursor, Claude Code, GitHub Copilot, etc.) is a plus</p>
                                                        <p>• Familiarity with headless CMS, GraphQL, or micro-frontend architecture is a plus</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Compensation</h5>
                                                    <p className={styles.sectionText}>
                                                        The expected salary range for this position is:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Annual Base Salary:
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        $110,000 - $130,000
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Plus performance-based annual bonus
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Education Requirements</h5>
                                                    <p className={styles.sectionText}>
                                                        Bachelor's degree in Computer Science, Engineering, Design, or related technical field, or equivalent experience with a strong portfolio of frontend projects.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Visa Sponsorship</h5>
                                                    <p className={styles.sectionText}>
                                                        We do sponsor visas! While not guaranteed for every role and candidate, if we extend you an offer, we will make every reasonable effort to secure visa sponsorship.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>How We're Different</h5>
                                                    <p className={styles.sectionText}>
                                                        We are a rapidly growing technology startup harnessing the power of AI to drive software development. Our frontend team works with cutting-edge technologies to build intuitive, accessible, and performant user interfaces that directly impact career development for thousands of young professionals. You'll have the opportunity to work with modern frontend architectures, contribute to design system development, and shape the user experience of AI-powered career coaching tools.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : formState.selectedPosition === "Data Analyst" ? (
                                            <div className={styles.jobDetailsContainer}>
                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Company Description</h5>
                                                    <p className={styles.sectionText}>
                                                        Ambit Technology Group, LLC is a fast-growing technology startup specializing in delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Our flagship platform, Career Landing Group, provides expert coaching and career development support for aspiring professionals in the tech industry. We leverage data to drive product innovation, optimize user experiences, and help clients achieve career success.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Role Description</h5>
                                                    <p className={styles.sectionText}>
                                                        We are seeking a Data Analyst to join our remote U.S. team full-time. The Data Analyst will play a key role in collecting, analyzing, and interpreting data that informs product development, marketing strategies, and business decisions. The ideal candidate is detail-oriented, skilled in translating data into actionable insights, and passionate about supporting a data-driven culture in a dynamic startup environment.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Responsibilities</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Collect, clean, and validate data from multiple sources, ensuring accuracy and integrity.</p>
                                                        <p>• Develop dashboards, reports, and visualizations to track KPIs and business performance.</p>
                                                        <p>• Analyze product usage, client behavior, and campaign performance to identify trends and opportunities.</p>
                                                        <p>• Support A/B testing and other experiments, providing data-driven insights to product and marketing teams.</p>
                                                        <p>• Collaborate with engineers and product managers to improve data pipelines and ensure reliable data availability.</p>
                                                        <p>• Document methodologies, metrics definitions, and data workflows for cross-team transparency.</p>
                                                        <p>• Present findings and recommendations to stakeholders in a clear and actionable way.</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Qualifications</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Bachelor's degree in Data Science, Statistics, Mathematics, Computer Science, Economics, or a related field.</p>
                                                        <p>• Strong proficiency with SQL for querying and managing data.</p>
                                                        <p>• Experience with data visualization tools (Tableau, Power BI, Looker, or similar).</p>
                                                        <p>• Proficiency with Excel and at least one scripting language (Python, R) for data analysis.</p>
                                                        <p>• Solid understanding of data modeling, descriptive statistics, and basic inferential methods.</p>
                                                        <p>• Strong analytical thinking, problem-solving skills, and attention to detail.</p>
                                                        <p>• Excellent written and verbal communication skills for conveying insights.</p>
                                                        <p>• Experience with cloud data environments (AWS Redshift, Snowflake, BigQuery) is a plus.</p>
                                                        <p>• Familiarity with marketing or product analytics tools (Google Analytics, Mixpanel, Amplitude) is a plus.</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Compensation</h5>
                                                    <p className={styles.sectionText}>
                                                        Annual Base Salary: $80,000 – $100,000
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Additional performance-based incentives may be available.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Education Requirements</h5>
                                                    <p className={styles.sectionText}>
                                                        Bachelor's degree in a quantitative or related field is required. Master's degree is a plus but not required.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Visa Sponsorship</h5>
                                                    <p className={styles.sectionText}>
                                                        We do sponsor visas! While sponsorship is not guaranteed for every role or candidate, if we extend an offer we will make every reasonable effort to secure visa support.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>How We're Different</h5>
                                                    <p className={styles.sectionText}>
                                                        We are a rapidly growing technology startup harnessing the power of AI and data to transform career coaching and job matching. Joining our team means working with cutting-edge tools, collaborating with passionate professionals, and having a direct impact on how data drives innovation and client success.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : formState.selectedPosition === "Data Scientist" ? (
                                            <div className={styles.jobDetailsContainer}>
                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Company Description</h5>
                                                    <p className={styles.sectionText}>
                                                        Ambit Technology Group, LLC is a fast-growing technology startup delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Our flagship platform, Career Landing Group, provides expert coaching and career development support for aspiring professionals in the tech industry. We rely on data science and machine learning to power insights, personalize user experiences, and drive impactful outcomes for our clients.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Role Description</h5>
                                                    <p className={styles.sectionText}>
                                                        We are seeking a Data Scientist to join our team full-time (remote, U.S. based). This near entry-level role is ideal for someone with a strong foundation in data science and machine learning who is eager to apply academic or project experience to real-world business challenges. You will work closely with cross-functional teams to analyze data, build predictive models, and generate actionable insights that support product innovation and decision-making.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Responsibilities</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Collect, clean, and preprocess structured and unstructured data for analysis.</p>
                                                        <p>• Develop statistical models, predictive algorithms, and machine learning prototypes.</p>
                                                        <p>• Evaluate and validate model performance using standard metrics and techniques.</p>
                                                        <p>• Collaborate with engineers to deploy models into production environments.</p>
                                                        <p>• Design and run experiments (A/B tests, hypothesis testing) to measure product impact.</p>
                                                        <p>• Communicate findings and insights clearly to both technical and non-technical stakeholders.</p>
                                                        <p>• Stay up to date on modern data science tools, libraries, and best practices.</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Qualifications</h5>
                                                    <div className={styles.qualificationsText}>
                                                        <p>• Bachelor's degree in Computer Science, Data Science, Statistics, Mathematics, or related field (Master's preferred).</p>
                                                        <p>• Strong skills in Python (NumPy, Pandas, Scikit-learn) or R for data analysis and modeling.</p>
                                                        <p>• Solid understanding of statistics, probability, and hypothesis testing.</p>
                                                        <p>• Experience with SQL for querying and managing relational data.</p>
                                                        <p>• Familiarity with machine learning concepts (classification, regression, clustering, recommendation systems).</p>
                                                        <p>• Exposure to data visualization tools (Matplotlib, Seaborn, Tableau, Power BI, or similar).</p>
                                                        <p>• Knowledge of cloud platforms (AWS, GCP, or Azure) and big data tools is a plus.</p>
                                                        <p>• Strong problem-solving skills and ability to learn quickly in a startup environment.</p>
                                                        <p>• Excellent communication skills for sharing technical insights with non-technical teams.</p>
                                                        <p>• Prior internships, academic projects, or research in data science/ML highly valued.</p>
                                                    </div>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Compensation</h5>
                                                    <p className={styles.sectionText}>
                                                        Annual Base Salary: $110,000 – $150,000
                                                    </p>
                                                    <p className={styles.sectionText}>
                                                        Additional performance-based incentives may be available.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Education Requirements</h5>
                                                    <p className={styles.sectionText}>
                                                        Bachelor's degree required; Master's degree or equivalent experience is a plus.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>Visa Sponsorship</h5>
                                                    <p className={styles.sectionText}>
                                                        We do sponsor visas! While sponsorship is not guaranteed for every role or candidate, if we extend an offer, we will make every reasonable effort to secure visa support.
                                                    </p>
                                                </div>

                                                <div className={styles.jobSection}>
                                                    <h5 className={styles.sectionHeading}>How We're Different</h5>
                                                    <p className={styles.sectionText}>
                                                        We are a rapidly growing technology startup harnessing the power of AI and data science to transform career coaching and job matching. Joining our team means working directly with cutting-edge tools, solving meaningful problems, and building data-driven solutions that impact the careers of thousands of professionals.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={styles.sectionText}>Detailed job description will be added here.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Application Information Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Application Information</h2>
                                
                                {/* Required Fields */}
                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="firstName" className={styles.label}>
                                            First Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formState.firstName}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.firstName ? styles.inputError : ''}`}
                                            placeholder="John"
                                        />
                                        {formErrors.firstName && (
                                            <p className={styles.errorText}>{formErrors.firstName}</p>
                                        )}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="lastName" className={styles.label}>
                                            Last Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formState.lastName}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.lastName ? styles.inputError : ''}`}
                                            placeholder="Doe"
                                        />
                                        {formErrors.lastName && (
                                            <p className={styles.errorText}>{formErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

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
                                            placeholder="john.doe@example.com"
                                        />
                                        {formErrors.email && (
                                            <p className={styles.errorText}>{formErrors.email}</p>
                                        )}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="phoneNumber" className={styles.label}>
                                            Phone Number <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formState.phoneNumber}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.phoneNumber ? styles.inputError : ''}`}
                                            placeholder="(555) 123-4567"
                                        />
                                        {formErrors.phoneNumber && (
                                            <p className={styles.errorText}>{formErrors.phoneNumber}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="isStudent" className={styles.label}>
                                            Are you currently a student? <span className={styles.required}>*</span>
                                        </label>
                                        <div 
                                            className={`${styles.customDropdown} ${formErrors.isStudent ? styles.dropdownError : ''}`}
                                            ref={studentDropdownRef}
                                        >
                                            <div 
                                                className={styles.dropdownSelected} 
                                                onClick={toggleStudentDropdown}
                                                aria-haspopup="listbox"
                                                aria-expanded={isStudentDropdownOpen}
                                                role="combobox"
                                                tabIndex={0}
                                            >
                                                <span className={formState.isStudent ? '' : styles.placeholderText}>
                                                    {formState.isStudent || 'Select an option'}
                                                </span>
                                                <svg 
                                                    className={`${styles.dropdownArrow} ${isStudentDropdownOpen ? styles.dropdownArrowUp : ''}`}
                                                    width="16" 
                                                    height="16" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            
                                            {isStudentDropdownOpen && (
                                                <ul className={styles.dropdownOptions} role="listbox">
                                                    {["Yes", "No"].map((option) => (
                                                        <li 
                                                            key={option} 
                                                            className={`${styles.dropdownOption} ${formState.isStudent === option ? styles.dropdownOptionSelected : ''}`}
                                                            onClick={() => handleStudentSelect(option)}
                                                            role="option"
                                                            aria-selected={formState.isStudent === option}
                                                        >
                                                            {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {formErrors.isStudent && (
                                            <p className={styles.errorText}>{formErrors.isStudent}</p>
                                        )}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="currentEmployer" className={styles.label}>
                                            Current or most recent Employer <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="currentEmployer"
                                            name="currentEmployer"
                                            value={formState.currentEmployer}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.currentEmployer ? styles.inputError : ''}`}
                                            placeholder="Company Name"
                                        />
                                        {formErrors.currentEmployer && (
                                            <p className={styles.errorText}>{formErrors.currentEmployer}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Optional Fields */}
                                <h3 className={styles.optionalSectionTitle}>Optional Information</h3>
                                
                                {/* Resume Upload */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Resume Upload (PDF, Word, or Images, max 2MB)
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
                                            Drag and drop your resume here, or click to select a file
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

                                {/* URL Fields */}
                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="linkedinUrl" className={styles.label}>
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            id="linkedinUrl"
                                            name="linkedinUrl"
                                            value={formState.linkedinUrl}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="githubUrl" className={styles.label}>
                                            Github
                                        </label>
                                        <input
                                            type="url"
                                            id="githubUrl"
                                            name="githubUrl"
                                            value={formState.githubUrl}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="https://github.com/yourusername"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="portfolioUrl" className={styles.label}>
                                            Personal Portfolio
                                        </label>
                                        <input
                                            type="url"
                                            id="portfolioUrl"
                                            name="portfolioUrl"
                                            value={formState.portfolioUrl}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="websiteUrl" className={styles.label}>
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            id="websiteUrl"
                                            name="websiteUrl"
                                            value={formState.websiteUrl}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.buttonContainer}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    style={{ 
                                        backgroundColor: '#9B6A10', 
                                        color: 'white',
                                        border: 'none'
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

// Default export with Suspense wrapper
export default function JobsForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JobsFormWithParams />
        </Suspense>
    );
}