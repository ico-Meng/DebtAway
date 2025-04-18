"use client";

import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { post } from 'aws-amplify/api';
import Head from 'next/head';
import styles from './Form.module.css';
import '../globals.css'; // Import global CSS
import { API_ENDPOINT } from "@/app/components/config";

// Add global styles to ensure proper rendering
const globalStyles = `
  html, body {
    overflow-y: auto !important;
    height: auto !important;
    min-height: 100%;
    background-color: #f5f7fa;
  }
  
  /* Fix for dark backgrounds and text colors */
  input, select, textarea, button, label {
    background-color: #ffffff !important;
    color: #333 !important;
  }
  
  .radioLabel {
    color: #333 !important;
  }
  
  input[type="radio"], input[type="checkbox"] {
    background-color: #ffffff !important;
    border: 1px solid #ddd !important;
  }
`;

interface VustFormState {
    // Student Information
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    birthdate: string;
    citizenship: string;
    residency: string;
    passportNumber: string;
    hasSevisId: boolean;
    sevisIdNumber: string;
    hasUsVisa: boolean;
    
    // Contact Information
    usAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    homeAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    phone: string;
    email: string;
    
    // Emergency Contact
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    emergencyContactEmail: string;

    // Education Information
    undergraduateEducation: {
        collegeName: string;
        entryDate: string;
        graduated: boolean;
        graduationDate: string;
        major: string;
        minor: string;
        gpa: string;
        degree: string;
    };
    
    hasGraduateEducation: boolean;
    graduateEducation?: {
        universityName: string;
        graduated: boolean;
        entryDate: string;
        graduationDate: string;
        major: string;
        degree: string;
        gpa: string;
    };

    // Work Experience
    hasWorkExperience: boolean;
    workExperience?: {
        employerName: string;
        supervisorName: string;
        jobTitle: string;
        phone: string;
        email: string;
        responsibilities: string;
        startDate: string;
        endDate: string;
    };

    // Program Information
    program: string;
    startingSemester: string;

    // Document Information
    isTransferring: boolean;
    hasTranscript: boolean;
    hasDegree: boolean;
    hasTranscriptEvaluation: boolean;
    hasEnglishProficiency: boolean;
    hasResume: boolean;
    hasStatementOfPurpose: boolean;
    hasRecommendationLetters: boolean;
    hasPassport: boolean;
    hasVisa: boolean;
    hasI94: boolean;
    hasI20: boolean;
    hasBankStatement: boolean;

    // Agreement
    agreementDate: string;
    agreementSignature: string;
    agreement: boolean;

    // Add file upload states
    transcriptFile: File | null;
    degreeFile: File | null;
    transcriptEvaluationFile: File | null;
    englishProficiencyFile: File | null; 
    resumeFile: File | null;
    statementOfPurposeFile: File | null;
    recommendationLettersFile: File | null;
    passportFile: File | null;
    visaFile: File | null;
    i94File: File | null;
    i20File: File | null;
    bankStatementFile: File | null;
}

// Configure Amplify
//Amplify.configure({
//    API: {
//        endpoints: [
//            {
//                name: "formAPI",
//                endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
//                region: process.env.NEXT_PUBLIC_REGION
//            },
//        ]
//    }
//});

export default function VustApplicationForm() {
    const [formState, setFormState] = useState<VustFormState>({
        // Initialize with empty values
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        birthdate: '',
        citizenship: '',
        residency: '',
        passportNumber: '',
        hasSevisId: false,
        sevisIdNumber: '',
        hasUsVisa: false,
        
        usAddress: {
            street: '',
        city: '',
        state: '',
            zipCode: '',
            country: 'United States of America'
        },
        homeAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        phone: '',
        email: '',
        
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        emergencyContactEmail: '',

        undergraduateEducation: {
            collegeName: '',
            entryDate: '',
            graduated: false,
            graduationDate: '',
            major: '',
            minor: '',
            gpa: '',
            degree: ''
        },
        
        hasGraduateEducation: false,
        hasWorkExperience: false,
        
        program: '',
        startingSemester: '',

        isTransferring: false,
        hasTranscript: false,
        hasDegree: false,
        hasTranscriptEvaluation: false,
        hasEnglishProficiency: false,
        hasResume: false,
        hasStatementOfPurpose: false,
        hasRecommendationLetters: false,
        hasPassport: false,
        hasVisa: false,
        hasI94: false,
        hasI20: false,
        hasBankStatement: false,

        agreementDate: '',
        agreementSignature: '',
        agreement: false,

        // Initialize file states
        transcriptFile: null,
        degreeFile: null,
        transcriptEvaluationFile: null,
        englishProficiencyFile: null,
        resumeFile: null,
        statementOfPurposeFile: null,
        recommendationLettersFile: null,
        passportFile: null,
        visaFile: null,
        i94File: null,
        i20File: null,
        bankStatementFile: null
    });

    interface FormErrors {
        firstName?: string;
        lastName?: string;
        gender?: string;
        birthdate?: string;
        citizenship?: string;
        email?: string;
        phone?: string;
        agreement?: string;
        passportNumber?: string;
        sevisIdNumber?: string;
        undergraduateEducation?: {
            collegeName?: string;
            entryDate?: string;
            major?: string;
            degree?: string;
        };
        workExperience?: {
            employerName?: string;
        };
        program?: string;
        startingSemester?: string;
    }

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validateForm = () => {
        const errors: FormErrors = {};

        // Required fields validation
        if (!formState.firstName) errors.firstName = 'First name is required';
        if (!formState.lastName) errors.lastName = 'Last name is required';
        if (!formState.gender) errors.gender = 'Gender is required';
        if (!formState.birthdate) errors.birthdate = 'Birthdate is required';
        if (!formState.citizenship) errors.citizenship = 'Citizenship is required';
        if (!formState.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            errors.email = 'Email is invalid';
        }
        if (!formState.phone) errors.phone = 'Phone number is required';
        if (!formState.agreement) errors.agreement = 'You must agree to the terms';

        // Validate undergraduate education
        if (!formState.undergraduateEducation.collegeName) {
            errors.undergraduateEducation = {
                ...errors.undergraduateEducation,
                collegeName: 'College name is required'
            };
        }
        if (!formState.undergraduateEducation.entryDate) {
            errors.undergraduateEducation = {
                ...errors.undergraduateEducation,
                entryDate: 'Entry date is required'
            };
        }
        if (!formState.undergraduateEducation.major) {
            errors.undergraduateEducation = {
                ...errors.undergraduateEducation,
                major: 'Major is required'
            };
        }
        if (!formState.undergraduateEducation.degree) {
            errors.undergraduateEducation = {
                ...errors.undergraduateEducation,
                degree: 'Degree is required'
            };
        }

        // Validate work experience if applicable
        if (formState.hasWorkExperience && formState.workExperience) {
            if (!formState.workExperience.employerName) {
                errors.workExperience = {
                    ...errors.workExperience,
                    employerName: 'Employer name is required'
                };
            }
        }

        // Validate program information
        if (!formState.program) errors.program = 'Program is required';
        if (!formState.startingSemester) errors.startingSemester = 'Starting semester is required';

        return errors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.includes('.')) {
            // Handle nested objects (e.g., usAddress.street)
            const [parent, child] = name.split('.');
            setFormState(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof VustFormState] as Record<string, unknown>),
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormState(prev => ({
                ...prev,
            [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Function to test single file upload
    const handleSingleFileUpload = async (fieldName: string, file: File | null) => {
        if (!file) {
            console.error(`No ${fieldName} file selected`);
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            console.log(`Uploading ${fieldName} file: ${file.name}`);
            
            const apiEndpoint = `${API_ENDPOINT}/upload-document`;
            const apiResponse = await fetch(apiEndpoint, {
                method: 'POST',
                //headers: { "Content-Type": "application/json" },
                body: formData
            });
            
            if (!apiResponse.ok) {
                throw new Error(`API responded with status: ${apiResponse.status}`);
            }
            
            const responseData = await apiResponse.json();
            console.log(`${fieldName} upload successful:`, responseData);
            
            // You can add user feedback here if needed
            alert(`File ${file.name} uploaded successfully!`);
            
        } catch (error) {
            console.error(`Error uploading ${fieldName}:`, error);
            alert(`Error uploading file. Please try again.`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0] || null;
        setFormState(prev => ({
            ...prev,
            [fieldName]: file
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                // Create form data for file uploads
                const formData = new FormData();
                
                // Add all files to the form data
                if (formState.transcriptFile) formData.append('files', formState.transcriptFile);
                if (formState.degreeFile) formData.append('files', formState.degreeFile);
                if (formState.transcriptEvaluationFile) formData.append('files', formState.transcriptEvaluationFile);
                if (formState.englishProficiencyFile) formData.append('files', formState.englishProficiencyFile);
                if (formState.resumeFile) formData.append('files', formState.resumeFile);
                
                // Add form data as JSON string
                formData.append('form_data', JSON.stringify(formState));
                
                // Send the form data to the backend API
                const apiEndpoint = `${API_ENDPOINT}/submit-application`;
                const apiResponse = await fetch(apiEndpoint, {
                    method: 'POST',
                    body: formData
                });
                
                if (!apiResponse.ok) {
                    throw new Error(`API responded with status: ${apiResponse.status}`);
                }
                
                const responseData = await apiResponse.json();
                console.log('Form submission successful:', responseData);

                setSubmitSuccess(true);
                // Reset form state after successful submission
                setFormState({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    gender: '',
                    birthdate: '',
                    citizenship: '',
                    residency: '',
                    passportNumber: '',
                    hasSevisId: false,
                    sevisIdNumber: '',
                    hasUsVisa: false,
                    usAddress: {
                        street: '',
                    city: '',
                    state: '',
                        zipCode: '',
                        country: 'United States of America'
                    },
                    homeAddress: {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    },
                    phone: '',
                    email: '',
                    emergencyContactName: '',
                    emergencyContactRelationship: '',
                    emergencyContactPhone: '',
                    emergencyContactEmail: '',
                    undergraduateEducation: {
                        collegeName: '',
                        entryDate: '',
                        graduated: false,
                        graduationDate: '',
                        major: '',
                        minor: '',
                        gpa: '',
                        degree: ''
                    },
                    hasGraduateEducation: false,
                    hasWorkExperience: false,
                    program: '',
                    startingSemester: '',
                    isTransferring: false,
                    hasTranscript: false,
                    hasDegree: false,
                    hasTranscriptEvaluation: false,
                    hasEnglishProficiency: false,
                    hasResume: false,
                    hasStatementOfPurpose: false,
                    hasRecommendationLetters: false,
                    hasPassport: false,
                    hasVisa: false,
                    hasI94: false,
                    hasI20: false,
                    hasBankStatement: false,
                    agreementDate: '',
                    agreementSignature: '',
                    agreement: false,
                    transcriptFile: null,
                    degreeFile: null,
                    transcriptEvaluationFile: null,
                    englishProficiencyFile: null,
                    resumeFile: null,
                    statementOfPurposeFile: null,
                    recommendationLettersFile: null,
                    passportFile: null,
                    visaFile: null,
                    i94File: null,
                    i20File: null,
                    bankStatementFile: null
                });
            } catch (error) {
                console.error('Form submission error:', error);
                setSubmitError('There was an error submitting your form. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>VUST Application Form</title>
                <meta name="description" content="Virginia University of Science & Technology Application Form" />
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{globalStyles}</style>
            </Head>

            <main className={styles.main}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>Virginia University of Science & Technology</h1>
                    <h2 className={styles.subtitle}>Application Form</h2>

                    {submitSuccess ? (
                        <div className={styles.successMessage}>
                            <h2>Thank you for your application!</h2>
                            <p>Your application has been received. We will contact you shortly.</p>
                            <button
                                className={styles.button}
                                onClick={() => setSubmitSuccess(false)}
                            >
                                Submit Another Application
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {submitError && (
                                <div className={styles.errorBanner}>
                                    {submitError}
                                </div>
                            )}

                            {/* Student Information Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>1. Student Information</h2>

                                <div className={styles.formRow}>
                                <div className={styles.formGroup}>
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
                                        />
                                        {formErrors.firstName && (
                                            <p className={styles.errorText}>{formErrors.firstName}</p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="middleName" className={styles.label}>
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            id="middleName"
                                            name="middleName"
                                            value={formState.middleName}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
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
                                        />
                                        {formErrors.lastName && (
                                            <p className={styles.errorText}>{formErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="gender" className={styles.label}>
                                            Gender <span className={styles.required}>*</span>
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formState.gender}
                                            onChange={handleChange}
                                            className={`${styles.select} ${formErrors.gender ? styles.inputError : ''}`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {formErrors.gender && (
                                            <p className={styles.errorText}>{formErrors.gender}</p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="birthdate" className={styles.label}>
                                            Birthdate <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="birthdate"
                                            name="birthdate"
                                            value={formState.birthdate}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.birthdate ? styles.inputError : ''}`}
                                        />
                                        {formErrors.birthdate && (
                                            <p className={styles.errorText}>{formErrors.birthdate}</p>
                                        )}
                                    </div>
                                    </div>

                                {/* Add Citizenship Section */}
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="citizenship" className={styles.label}>
                                            Citizenship <span className={styles.required}>*</span>
                                        </label>
                                        <select
                                            id="citizenship"
                                            name="citizenship"
                                            value={formState.citizenship}
                                            onChange={handleChange}
                                            className={`${styles.select} ${formErrors.citizenship ? styles.inputError : ''}`}
                                        >
                                            <option value="">Select Citizenship</option>
                                            <option value="US">United States of America</option>
                                            <option value="CA">Canada</option>
                                            {/* Add more countries */}
                                        </select>
                                        {formErrors.citizenship && (
                                            <p className={styles.errorText}>{formErrors.citizenship}</p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="residency" className={styles.label}>
                                            Residency
                                        </label>
                                        <select
                                            id="residency"
                                            name="residency"
                                            value={formState.residency}
                                            onChange={handleChange}
                                            className={styles.select}
                                        >
                                            <option value="">Select Residency</option>
                                            <option value="resident">US - Resident</option>
                                            <option value="nonresident">US - Nonresident</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="passportNumber" className={styles.label}>
                                            Passport Number <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="passportNumber"
                                            name="passportNumber"
                                            value={formState.passportNumber}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.passportNumber ? styles.inputError : ''}`}
                                        />
                                        {formErrors.passportNumber && (
                                            <p className={styles.errorText}>{formErrors.passportNumber}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Do you have Sevis ID? <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasSevisId"
                                                checked={formState.hasSevisId}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasSevisId: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasSevisId"
                                                checked={!formState.hasSevisId}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasSevisId: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>

                                {formState.hasSevisId && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="sevisIdNumber" className={styles.label}>
                                            Sevis ID Number <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                            id="sevisIdNumber"
                                            name="sevisIdNumber"
                                            value={formState.sevisIdNumber}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.sevisIdNumber ? styles.inputError : ''}`}
                                        />
                                        {formErrors.sevisIdNumber && (
                                            <p className={styles.errorText}>{formErrors.sevisIdNumber}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* US Address Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>US Address</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="usAddress.street" className={styles.label}>
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        id="usAddress.street"
                                        name="usAddress.street"
                                        value={formState.usAddress.street}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="123 Main St"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="usAddress.city" className={styles.label}>
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="usAddress.city"
                                            name="usAddress.city"
                                            value={formState.usAddress.city}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="usAddress.state" className={styles.label}>
                                            State
                                        </label>
                                        <select
                                            id="usAddress.state"
                                            name="usAddress.state"
                                            value={formState.usAddress.state}
                                            onChange={handleChange}
                                            className={styles.select}
                                        >
                                            <option value="">Choose a state...</option>
                                            <option value="AL">Alabama</option>
                                            <option value="AK">Alaska</option>
                                            <option value="AZ">Arizona</option>
                                            <option value="AR">Arkansas</option>
                                            <option value="CA">California</option>
                                            {/* Add all states */}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="usAddress.zipCode" className={styles.label}>
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            id="usAddress.zipCode"
                                            name="usAddress.zipCode"
                                            value={formState.usAddress.zipCode}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="12345"
                                        />
                                    </div>
                                    </div>
                            </div>

                            {/* Home Address Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Home Address</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="homeAddress.street" className={styles.label}>
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        id="homeAddress.street"
                                        name="homeAddress.street"
                                        value={formState.homeAddress.street}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="123 Main St"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="homeAddress.city" className={styles.label}>
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="homeAddress.city"
                                            name="homeAddress.city"
                                            value={formState.homeAddress.city}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="homeAddress.state" className={styles.label}>
                                            State/Province/Region
                                        </label>
                                        <input
                                            type="text"
                                            id="homeAddress.state"
                                            name="homeAddress.state"
                                            value={formState.homeAddress.state}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="homeAddress.zipCode" className={styles.label}>
                                            ZIP/Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="homeAddress.zipCode"
                                            name="homeAddress.zipCode"
                                            value={formState.homeAddress.zipCode}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="homeAddress.country" className={styles.label}>
                                        Country
                                        </label>
                                        <select
                                        id="homeAddress.country"
                                        name="homeAddress.country"
                                        value={formState.homeAddress.country}
                                            onChange={handleChange}
                                            className={styles.select}
                                        >
                                        <option value="">Choose a country...</option>
                                        <option value="US">United States of America</option>
                                        <option value="CA">Canada</option>
                                        {/* Add more countries */}
                                        </select>
                                    </div>
                                </div>

                            {/* Contact Information */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Contact Information</h2>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone" className={styles.label}>
                                            Phone Number <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formState.phone}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                                            placeholder="(123) 456-7890"
                                        />
                                        {formErrors.phone && (
                                            <p className={styles.errorText}>{formErrors.phone}</p>
                                        )}
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
                                            placeholder="example@email.com"
                                        />
                                        {formErrors.email && (
                                            <p className={styles.errorText}>{formErrors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Emergency Contact</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="emergencyContactName" className={styles.label}>
                                        Emergency Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        id="emergencyContactName"
                                        name="emergencyContactName"
                                        value={formState.emergencyContactName}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="emergencyContactRelationship" className={styles.label}>
                                            Relationship
                                        </label>
                                        <input
                                            type="text"
                                            id="emergencyContactRelationship"
                                            name="emergencyContactRelationship"
                                            value={formState.emergencyContactRelationship}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="Parent, Spouse, etc."
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="emergencyContactPhone" className={styles.label}>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="emergencyContactPhone"
                                            name="emergencyContactPhone"
                                            value={formState.emergencyContactPhone}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="(123) 456-7890"
                                        />
                                </div>

                                <div className={styles.formGroup}>
                                        <label htmlFor="emergencyContactEmail" className={styles.label}>
                                            Email Address
                                    </label>
                                        <input
                                            type="email"
                                            id="emergencyContactEmail"
                                            name="emergencyContactEmail"
                                            value={formState.emergencyContactEmail}
                                        onChange={handleChange}
                                            className={styles.input}
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Education Information Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>2. Education Information</h2>

                                <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.collegeName" className={styles.label}>
                                            College Name <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                            id="undergraduateEducation.collegeName"
                                            name="undergraduateEducation.collegeName"
                                            value={formState.undergraduateEducation.collegeName}
                                        onChange={handleChange}
                                            className={`${styles.input} ${formErrors.undergraduateEducation?.collegeName ? styles.inputError : ''}`}
                                        />
                                        {formErrors.undergraduateEducation?.collegeName && (
                                            <p className={styles.errorText}>{formErrors.undergraduateEducation?.collegeName}</p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.entryDate" className={styles.label}>
                                            Entry Date <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="undergraduateEducation.entryDate"
                                            name="undergraduateEducation.entryDate"
                                            value={formState.undergraduateEducation.entryDate}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.undergraduateEducation?.entryDate ? styles.inputError : ''}`}
                                        />
                                        {formErrors.undergraduateEducation?.entryDate && (
                                            <p className={styles.errorText}>{formErrors.undergraduateEducation?.entryDate}</p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.graduated" className={styles.label}>
                                            Graduated
                                        </label>
                                        <div className={styles.radioGroup}>
                                            <label className={styles.radioLabel}>
                                                <input
                                                    type="radio"
                                                    name="undergraduateEducation.graduated"
                                                    checked={formState.undergraduateEducation.graduated}
                                                    onChange={(e) => setFormState(prev => ({ ...prev, undergraduateEducation: { ...prev.undergraduateEducation, graduated: true } }))}
                                                    className={styles.radioInput}
                                                />
                                                Yes
                                            </label>
                                            <label className={styles.radioLabel}>
                                                <input
                                                    type="radio"
                                                    name="undergraduateEducation.graduated"
                                                    checked={!formState.undergraduateEducation.graduated}
                                                    onChange={(e) => setFormState(prev => ({ ...prev, undergraduateEducation: { ...prev.undergraduateEducation, graduated: false } }))}
                                                    className={styles.radioInput}
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.graduationDate" className={styles.label}>
                                            Graduation Date
                                        </label>
                                        <input
                                            type="date"
                                            id="undergraduateEducation.graduationDate"
                                            name="undergraduateEducation.graduationDate"
                                            value={formState.undergraduateEducation.graduationDate}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.major" className={styles.label}>
                                            Major <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="undergraduateEducation.major"
                                            name="undergraduateEducation.major"
                                            value={formState.undergraduateEducation.major}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.undergraduateEducation?.major ? styles.inputError : ''}`}
                                        />
                                        {formErrors.undergraduateEducation?.major && (
                                            <p className={styles.errorText}>{formErrors.undergraduateEducation?.major}</p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.minor" className={styles.label}>
                                            Minor
                                        </label>
                                        <input
                                            type="text"
                                            id="undergraduateEducation.minor"
                                            name="undergraduateEducation.minor"
                                            value={formState.undergraduateEducation.minor}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>
                                    </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.gpa" className={styles.label}>
                                            GPA
                                        </label>
                                        <input
                                            type="text"
                                            id="undergraduateEducation.gpa"
                                            name="undergraduateEducation.gpa"
                                            value={formState.undergraduateEducation.gpa}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="undergraduateEducation.degree" className={styles.label}>
                                            Degree <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="undergraduateEducation.degree"
                                            name="undergraduateEducation.degree"
                                            value={formState.undergraduateEducation.degree}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.undergraduateEducation?.degree ? styles.inputError : ''}`}
                                        />
                                        {formErrors.undergraduateEducation?.degree && (
                                            <p className={styles.errorText}>{formErrors.undergraduateEducation?.degree}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Work Experience Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>3. Work Experience</h2>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                        Do you have work experience? <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.radioGroup}>
                                            <label className={styles.radioLabel}>
                                                <input
                                                    type="radio"
                                                name="hasWorkExperience"
                                                checked={formState.hasWorkExperience}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasWorkExperience: true }))}
                                                    className={styles.radioInput}
                                                />
                                            Yes
                                            </label>
                                            <label className={styles.radioLabel}>
                                                <input
                                                    type="radio"
                                                name="hasWorkExperience"
                                                checked={!formState.hasWorkExperience}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasWorkExperience: false }))}
                                                    className={styles.radioInput}
                                                />
                                            No
                                            </label>
                                        </div>
                                    </div>

                                {formState.hasWorkExperience && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="workExperience.employerName" className={styles.label}>
                                            Employer Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="workExperience.employerName"
                                            name="workExperience.employerName"
                                            value={formState.workExperience?.employerName}
                                            onChange={handleChange}
                                            className={`${styles.input} ${formErrors.workExperience?.employerName ? styles.inputError : ''}`}
                                        />
                                        {formErrors.workExperience?.employerName && (
                                            <p className={styles.errorText}>{formErrors.workExperience?.employerName}</p>
                                        )}
                                    </div>
                                )}

                                {formState.hasWorkExperience && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="workExperience.supervisorName" className={styles.label}>
                                            Supervisor Name
                                        </label>
                                        <input
                                            type="text"
                                            id="workExperience.supervisorName"
                                            name="workExperience.supervisorName"
                                            value={formState.workExperience?.supervisorName}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>
                                )}

                                {formState.hasWorkExperience && (
                                <div className={styles.formGroup}>
                                        <label htmlFor="workExperience.jobTitle" className={styles.label}>
                                            Job Title
                                    </label>
                                    <input
                                        type="text"
                                            id="workExperience.jobTitle"
                                            name="workExperience.jobTitle"
                                            value={formState.workExperience?.jobTitle}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>
                                )}

                                {formState.hasWorkExperience && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="workExperience.phone" className={styles.label}>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="workExperience.phone"
                                            name="workExperience.phone"
                                            value={formState.workExperience?.phone}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>
                                )}

                                {formState.hasWorkExperience && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="workExperience.email" className={styles.label}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="workExperience.email"
                                            name="workExperience.email"
                                            value={formState.workExperience?.email}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>
                                )}

                                {formState.hasWorkExperience && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="workExperience.responsibilities" className={styles.label}>
                                            Responsibilities
                                        </label>
                                        <textarea
                                            id="workExperience.responsibilities"
                                            name="workExperience.responsibilities"
                                            value={formState.workExperience?.responsibilities}
                                            onChange={handleChange}
                                            className={styles.textarea}
                                        />
                                </div>
                                )}

                                {formState.hasWorkExperience && (
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="workExperience.startDate" className={styles.label}>
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                id="workExperience.startDate"
                                                name="workExperience.startDate"
                                                value={formState.workExperience?.startDate}
                                                onChange={handleChange}
                                                className={styles.input}
                                            />
                            </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="workExperience.endDate" className={styles.label}>
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                id="workExperience.endDate"
                                                name="workExperience.endDate"
                                                value={formState.workExperience?.endDate}
                                                onChange={handleChange}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Program Information Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>4. Program Information</h2>

                                <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                        <label htmlFor="program" className={styles.label}>
                                            Program <span className={styles.required}>*</span>
                                    </label>
                                        <input
                                            type="text"
                                            id="program"
                                            name="program"
                                            value={formState.program}
                                        onChange={handleChange}
                                            className={`${styles.input} ${formErrors.program ? styles.inputError : ''}`}
                                        />
                                        {formErrors.program && (
                                            <p className={styles.errorText}>{formErrors.program}</p>
                                        )}
                                </div>

                                <div className={styles.formGroup}>
                                        <label htmlFor="startingSemester" className={styles.label}>
                                            Starting Semester <span className={styles.required}>*</span>
                                    </label>
                                        <input
                                            type="text"
                                            id="startingSemester"
                                            name="startingSemester"
                                            value={formState.startingSemester}
                                        onChange={handleChange}
                                            className={`${styles.input} ${formErrors.startingSemester ? styles.inputError : ''}`}
                                        />
                                        {formErrors.startingSemester && (
                                            <p className={styles.errorText}>{formErrors.startingSemester}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Document Information Section */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>5. Document Information</h2>
                                
                                {/* Transferring question */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Are you transferring from another University? <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="isTransferring"
                                                checked={formState.isTransferring}
                                                onChange={(e) => setFormState(prev => ({ ...prev, isTransferring: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="isTransferring"
                                                checked={!formState.isTransferring}
                                                onChange={(e) => setFormState(prev => ({ ...prev, isTransferring: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>

                                {/* Transcript question */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Do you have a transcript to submit? <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasTranscript"
                                                checked={formState.hasTranscript}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasTranscript: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasTranscript"
                                                checked={!formState.hasTranscript}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasTranscript: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                    <div className={styles.fileUploadContainer}>
                                        <input
                                            type="file"
                                            id="transcriptFile"
                                            onChange={(e) => handleFileChange(e, 'transcriptFile')}
                                            className={styles.fileInput}
                                            disabled={!formState.hasTranscript}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                        <label 
                                            htmlFor="transcriptFile" 
                                            className={`${styles.fileInputLabel} ${!formState.hasTranscript ? styles.fileInputDisabled : ''}`}
                                        >
                                            {formState.transcriptFile ? formState.transcriptFile.name : 'Upload Transcript'}
                                        </label>
                                        {formState.hasTranscript && formState.transcriptFile && (
                                            <button 
                                                type="button"
                                                onClick={() => handleSingleFileUpload('transcript', formState.transcriptFile)}
                                                className={styles.testUploadButton}
                                            >
                                                Test Upload
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Degree/Diploma question */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Do you have a degree/diploma to submit? <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasDegree"
                                                checked={formState.hasDegree}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasDegree: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasDegree"
                                                checked={!formState.hasDegree}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasDegree: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                    <div className={styles.fileUploadContainer}>
                                        <input
                                            type="file"
                                            id="degreeFile"
                                            onChange={(e) => handleFileChange(e, 'degreeFile')}
                                            className={styles.fileInput}
                                            disabled={!formState.hasDegree}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                        <label 
                                            htmlFor="degreeFile" 
                                            className={`${styles.fileInputLabel} ${!formState.hasDegree ? styles.fileInputDisabled : ''}`}
                                        >
                                            {formState.degreeFile ? formState.degreeFile.name : 'Upload Degree/Diploma'}
                                        </label>
                                    </div>
                                </div>

                                {/* Transcript Evaluation question */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Do you have a transcript evaluation to submit?
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasTranscriptEvaluation"
                                                checked={formState.hasTranscriptEvaluation}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasTranscriptEvaluation: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasTranscriptEvaluation"
                                                checked={!formState.hasTranscriptEvaluation}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasTranscriptEvaluation: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                    <div className={styles.fileUploadContainer}>
                                        <input
                                            type="file"
                                            id="transcriptEvaluationFile"
                                            onChange={(e) => handleFileChange(e, 'transcriptEvaluationFile')}
                                            className={styles.fileInput}
                                            disabled={!formState.hasTranscriptEvaluation}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                        <label 
                                            htmlFor="transcriptEvaluationFile" 
                                            className={`${styles.fileInputLabel} ${!formState.hasTranscriptEvaluation ? styles.fileInputDisabled : ''}`}
                                        >
                                            {formState.transcriptEvaluationFile ? formState.transcriptEvaluationFile.name : 'Upload Transcript Evaluation'}
                                        </label>
                                    </div>
                                </div>

                                {/* English Proficiency question */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Do you have English proficiency documentation? <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasEnglishProficiency"
                                                checked={formState.hasEnglishProficiency}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasEnglishProficiency: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasEnglishProficiency"
                                                checked={!formState.hasEnglishProficiency}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasEnglishProficiency: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                    <div className={styles.fileUploadContainer}>
                                        <input
                                            type="file"
                                            id="englishProficiencyFile"
                                            onChange={(e) => handleFileChange(e, 'englishProficiencyFile')}
                                            className={styles.fileInput}
                                            disabled={!formState.hasEnglishProficiency}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                        <label 
                                            htmlFor="englishProficiencyFile" 
                                            className={`${styles.fileInputLabel} ${!formState.hasEnglishProficiency ? styles.fileInputDisabled : ''}`}
                                        >
                                            {formState.englishProficiencyFile ? formState.englishProficiencyFile.name : 'Upload English Proficiency'}
                                        </label>
                                    </div>
                                </div>

                                {/* Resume/CV question */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Do you have a resume/CV? <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasResume"
                                                checked={formState.hasResume}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasResume: true }))}
                                                className={styles.radioInput}
                                            />
                                            Yes
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="hasResume"
                                                checked={!formState.hasResume}
                                                onChange={(e) => setFormState(prev => ({ ...prev, hasResume: false }))}
                                                className={styles.radioInput}
                                            />
                                            No
                                        </label>
                                    </div>
                                    <div className={styles.fileUploadContainer}>
                                        <input
                                            type="file"
                                            id="resumeFile"
                                            onChange={(e) => handleFileChange(e, 'resumeFile')}
                                            className={styles.fileInput}
                                            disabled={!formState.hasResume}
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <label 
                                            htmlFor="resumeFile" 
                                            className={`${styles.fileInputLabel} ${!formState.hasResume ? styles.fileInputDisabled : ''}`}
                                        >
                                            {formState.resumeFile ? formState.resumeFile.name : 'Upload Resume/CV'}
                                        </label>
                                    </div>
                                </div>

                                {/* Continue with Statement of Purpose and other questions if needed */}
                            </div>

                            {/* Agreement Section */}
                            <div className={styles.formSection}>
                            <div className={styles.formGroup}>
                                <label className={`${styles.checkboxLabel} ${formErrors.agreement ? styles.checkboxLabelError : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="agreement"
                                        checked={formState.agreement}
                                        onChange={handleChange}
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.checkboxText}>
                                            I agree to the policies and regulations of Virginia University of Science & Technology (VUST).
                                            To the best of my knowledge, the information in this application is true.
                                            <span className={styles.required}>*</span>
                                    </span>
                                </label>
                                    {formErrors.agreement && (
                                        <p className={styles.errorText}>{formErrors.agreement}</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.buttonContainer}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} Virginia University of Science & Technology. All rights reserved.</p>
            </footer>
        </div>
    );
}
