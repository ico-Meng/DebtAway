"use client";

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import Head from 'next/head';
import * as d3 from 'd3';
import styles from './alpha.module.css';
import '../globals.css';
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
  
  @media (max-width: 768px) {
    html, body {
      font-size: 14px;
    }
  }
  
  @media (max-width: 480px) {
    html, body {
      font-size: 13px;
    }
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
  
  body.alpha-page {
    background: #edece3 !important;
    background-color: #edece3 !important;
    background-image: none !important;
  }

  @keyframes pulse-0 {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }

  @keyframes pulse-1 {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }

  .advice-card {
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .advice-card:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  }

  @keyframes thinking-pulse {
    0%, 80%, 100% { 
      opacity: 0.3;
      transform: scale(0.8);
    }
    40% { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes spinner-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes progress-ring-fill {
    0% {
      stroke-dashoffset: 100;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes tip-fancy-in {
    0% {
      opacity: 0;
      transform: translateY(18px) scale(0.96) rotate(-1.5deg);
    }
    60% {
      opacity: 1;
      transform: translateY(-2px) scale(1.02) rotate(0.4deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0deg);
    }
  }
`;

export default function AlphaPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [targetJob, setTargetJob] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        collegeName: '',
        degree: '',
        major: '',
        graduationYear: '',
        // Skills page fields
        programmingLanguages: '',
        frameworks: '',
        databases: '',
        tools: '',
        // Work Experience page fields (array to support multiple entries)
        workExperiences: [
            {
                companyName: '',
                jobTitle: '',
                employedYears: ''
            }
        ]
    });
    
    // Track basic info fields (firstName, lastName, email, phoneNumber) for background dot behavior
    const [basicInfoFocusCount, setBasicInfoFocusCount] = useState(0);
    const [isTypingBasicInfo, setIsTypingBasicInfo] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Track education fields (collegeName, degree, major, graduationYear) for education dot behavior
    const [educationFocusCount, setEducationFocusCount] = useState(0);
    const [isTypingEducation, setIsTypingEducation] = useState(false);
    const educationTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Track JobMatch fields (education, skills, work experience) for job match dot behavior
    const [jobMatchFocusCount, setJobMatchFocusCount] = useState(0);
    const [isTypingJobMatch, setIsTypingJobMatch] = useState(false);
    const jobMatchTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Track TechSkills fields (programmingLanguages, frameworks, databases, tools) for tech skills dot behavior
    const [techSkillsFocusCount, setTechSkillsFocusCount] = useState(0);
    const [isTypingTechSkills, setIsTypingTechSkills] = useState(false);
    const techSkillsTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Track Professional fields (education, skills, work experience) for professional dot behavior
    const [professionalFocusCount, setProfessionalFocusCount] = useState(0);
    const [isTypingProfessional, setIsTypingProfessional] = useState(false);
    const professionalTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Track Teamwork fields (work experience) for teamwork dot behavior
    const [teamworkFocusCount, setTeamworkFocusCount] = useState(0);
    const [isTypingTeamwork, setIsTypingTeamwork] = useState(false);
    const teamworkTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const svgRef = useRef<SVGSVGElement>(null);
    
    // Resume upload states
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Years dropdown states for each work experience
    const [yearsDropdownStates, setYearsDropdownStates] = useState<{[key: number]: boolean}>({});
    const yearsDropdownRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
    
    // Track active tab in Career Fit Analysis
    const [activeTab, setActiveTab] = useState('Personal Capability');
    // Background page validation errors
    const [bgErrors, setBgErrors] = useState<{ [key: string]: boolean }>({});
    const [bgErrorMessage, setBgErrorMessage] = useState<string>('');
    const [bgErrorHints, setBgErrorHints] = useState<{ [key: string]: string }>({});
    // Education page validation
    const [eduErrors, setEduErrors] = useState<{ [key: string]: boolean }>({});
    const [eduErrorMessage, setEduErrorMessage] = useState<string>('');
    // Skills page validation
    const [skillsErrors, setSkillsErrors] = useState<{ [key: string]: boolean }>({});
    const [skillsErrorMessage, setSkillsErrorMessage] = useState<string>('');
    // Work page validation
    const [workErrors, setWorkErrors] = useState<{ [key: string]: boolean }>({});
    const [workErrorMessage, setWorkErrorMessage] = useState<string>('');
    // Resume page validation
    const [resumeErrorMessage, setResumeErrorMessage] = useState<string>('');

    // Simple validators
    const isValidEmail = (value: string) => {
        // RFC5322-lite
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };
    const isValidPhone = (value: string) => {
        // Allow +, spaces, dashes, parentheses, and digits. Require 10+ digits overall
        const digits = (value || '').replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    };
    
    // Function to control shape layering based on active tab
    const updateShapeLayering = (tab: string) => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        const g = svg.select('.chart-group');
        
        if (tab === 'Personal Capability') {
            // Bring progress triangle to front, send resume shape to back
            const progressShape = g.select('.progress-triangle');
            const resumeShape = g.select('.resume-power-shape');
            
            if (!progressShape.empty()) {
                progressShape.raise(); // Move to front
            }
            if (!resumeShape.empty()) {
                resumeShape.lower(); // Move to back
            }
        } else if (tab === 'Resume Power') {
            // Bring resume shape to front, send progress triangle to back
            const progressShape = g.select('.progress-triangle');
            const resumeShape = g.select('.resume-power-shape');
            
            if (!resumeShape.empty()) {
                resumeShape.raise(); // Move to front
            }
            if (!progressShape.empty()) {
                progressShape.lower(); // Move to back
            }
        }
    };

    // Removed automatic animation states - now using individual blocks

    // Analysis results state
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ringProgress, setRingProgress] = useState<number>(0);
    
    // Analysis tips state
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [analysisTips] = useState([
        "Quantify results with metrics to prove impact.",
        "Start bullet points with strong action verbs.",
        "Highlight key technologies and programming languages clearly.",
        "Tailor every résumé for the target role.",
        "Keep layout clean and easy to scan.",
        "Focus on achievements, not daily responsibilities.",
        "Showcase open-source or personal technical projects.",
        "Include links to GitHub or portfolio site.",
        "Emphasize teamwork and cross-functional collaboration experience.",
        "Mention performance improvements or efficiency gains.",
        "Use consistent formatting for roles and dates.",
        "Keep it one page if under 10 years experience.",
        "Avoid buzzwords without measurable context.",
        "Include internships or hackathon achievements if early career.",
        "Demonstrate understanding of system design or scalability.",
        "Add relevant certifications or continuous learning credentials.",
        "Prioritize recent, relevant experience at the top.",
        "Include brief summaries for complex projects.",
        "Review for grammar and concise language.",
        "Regularly update résumé as new skills develop."
    ]);
    
    // Resume analysis data
    const [resumeAnalysisData, setResumeAnalysisData] = useState<any>(null);
    
    // Effect to cycle through analysis tips while analyzing
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAnalyzing) {
            interval = setInterval(() => {
                setCurrentTipIndex(prev => (prev + 1) % analysisTips.length);
            }, 5000); // Change tip every 5 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnalyzing, analysisTips.length]);

    // Effect: smooth stepwise loader ring from 45% to 100% in ~20s (2s per step)
    useEffect(() => {
        if (!isAnalyzing) {
            setRingProgress(0);
            return;
        }
        setRingProgress(45);
        const stepMs = 2000;
        const totalSteps = 10; // 10 * 2s = 20s
        const stepSize = 55 / totalSteps; // 45 -> 100
        let steps = 0;
        const id = setInterval(() => {
            steps += 1;
            setRingProgress(prev => {
                const next = prev + stepSize;
                return next >= 100 ? 100 : parseFloat(next.toFixed(2));
            });
            if (steps >= totalSteps) clearInterval(id);
        }, stepMs);
        return () => clearInterval(id);
    }, [isAnalyzing]);
    
    // Effect to set initial shape layering when analysis data is available
    useEffect(() => {
        if (analysisResult && resumeAnalysisData) {
            // Small delay to ensure chart is rendered
            setTimeout(() => {
                updateShapeLayering(activeTab);
            }, 100);
        }
    }, [analysisResult, resumeAnalysisData, activeTab]);
    
    // Generate resume analysis suggestions from backend data
    const getResumeAnalysisSuggestions = () => {
        if (!resumeAnalysisData) {
            console.log('No resume analysis data available');
            return [];
        }
        
        console.log('Resume analysis data structure:', resumeAnalysisData);
        
        const suggestions: Array<{
            category: string;
            icon: string;
            advice: string;
            color: string;
        }> = [];
        
        // ATS Issues from parsed data
        if (resumeAnalysisData.parsed_data?.ats_review) {
            const atsReview = resumeAnalysisData.parsed_data.ats_review;
            
            // Formatting issues
            if (atsReview.formatting_issues && atsReview.formatting_issues.length > 0) {
                atsReview.formatting_issues.forEach((issue: string) => {
                    if (issue && issue.trim() && issue !== "N/A") {
                        suggestions.push({
                            category: "ATS Format",
                            icon: "📝",
                            advice: issue,
                            color: "#EA580C"
                        });
                    }
                });
            }
            
            // Syntax issues
            if (atsReview.syntax_issues && atsReview.syntax_issues.length > 0) {
                atsReview.syntax_issues.forEach((issue: string) => {
                    if (issue && issue.trim() && issue !== "N/A") {
                        suggestions.push({
                            category: "ATS Syntax",
                            icon: "⚠️",
                            advice: issue,
                            color: "#DC2626"
                        });
                    }
                });
            }
        }
        
        // Improvement suggestions from analysis
        if (resumeAnalysisData.analysis) {
            console.log('Analysis data found:', resumeAnalysisData.analysis);
            const analysis = resumeAnalysisData.analysis;
            
            // Background improvements
            if (analysis.background_improvements && analysis.background_improvements.length > 0) {
                analysis.background_improvements.forEach((improvement: string) => {
                    if (improvement && improvement.trim() && improvement !== "N/A") {
                        suggestions.push({
                            category: "Background",
                            icon: "👤",
                            advice: improvement,
                            color: "#4F46E5"
                        });
                    }
                });
            }
            
            // Education improvements
            if (analysis.education_improvements && analysis.education_improvements.length > 0) {
                analysis.education_improvements.forEach((improvement: string) => {
                    if (improvement && improvement.trim() && improvement !== "N/A") {
                        suggestions.push({
                            category: "Education",
                            icon: "🎓",
                            advice: improvement,
                            color: "#059669"
                        });
                    }
                });
            }
            
            // Professional improvements
            if (analysis.professional_improvements && analysis.professional_improvements.length > 0) {
                analysis.professional_improvements.forEach((improvement: string) => {
                    if (improvement && improvement.trim() && improvement !== "N/A") {
                        suggestions.push({
                            category: "Professional",
                            icon: "💼",
                            advice: improvement,
                            color: "#7C3AED"
                        });
                    }
                });
            }
            
            // Technical skills improvements
            if (analysis.technical_skills_improvements && analysis.technical_skills_improvements.length > 0) {
                analysis.technical_skills_improvements.forEach((improvement: string) => {
                    if (improvement && improvement.trim() && improvement !== "N/A") {
                        suggestions.push({
                            category: "Tech Skills",
                            icon: "⚡",
                            advice: improvement,
                            color: "#0891B2"
                        });
                    }
                });
            }
            
            // Teamwork improvements
            if (analysis.teamwork_improvements && analysis.teamwork_improvements.length > 0) {
                analysis.teamwork_improvements.forEach((improvement: string) => {
                    if (improvement && improvement.trim() && improvement !== "N/A") {
                        suggestions.push({
                            category: "Teamwork",
                            icon: "🤝",
                            advice: improvement,
                            color: "#EA580C"
                        });
                    }
                });
            }
            
            // ATS improvements
            if (analysis.ats_improvements && analysis.ats_improvements.length > 0) {
                analysis.ats_improvements.forEach((improvement: string) => {
                    if (improvement && improvement.trim() && improvement !== "N/A") {
                        suggestions.push({
                            category: "ATS Improvement",
                            icon: "📊",
                            advice: improvement,
                            color: "#D97706"
                        });
                    }
                });
            }
        }
        
        console.log(`Generated ${suggestions.length} resume analysis suggestions:`, suggestions);
        return suggestions;
    };

    // Sample improvement advice data (this would come from the backend API response)
    const improvementAdvice = [
        {
            category: "Tech Skills",
            icon: "⚡",
            advice: "Learn React.js and Next.js frameworks through online courses and build 2-3 portfolio projects",
            color: "#4F46E5"
        },
        {
            category: "Professional",
            icon: "🚀",
            advice: "Gain experience with microservices architecture by contributing to open-source projects",
            color: "#059669"
        },
        {
            category: "Education",
            icon: "🎓",
            advice: "Consider obtaining AWS certifications to strengthen your cloud computing knowledge",
            color: "#DC2626"
        },
        {
            category: "Background",
            icon: "💼",
            advice: "Develop leadership skills by mentoring junior developers or leading small team projects",
            color: "#7C3AED"
        },
        {
            category: "Teamwork",
            icon: "🤝",
            advice: "Improve communication skills by participating in tech meetups and presenting your work",
            color: "#EA580C"
        },
        {
            category: "Job Match",
            icon: "🎯",
            advice: "Focus on building full-stack applications that demonstrate both frontend and backend expertise",
            color: "#0891B2"
        }
    ];

    // Radar chart data
    const labels = ['Background', 'Education', 'Professional', 'Tech Skills', 'Teamwork', 'Job Match'];
    const maxValue = 10;
    const radius = 180;
    const levels = 5;
    const angleSlice = (Math.PI * 2) / labels.length;

    // Helper function to safely remove D3 elements
    const safeRemove = (selection: any) => {
        try {
            if (selection && !selection.empty()) {
                selection.each(function(this: any) {
                    const element = this;
                    if (element && element.parentNode) {
                        selection.remove();
                    }
                });
            }
        } catch (error) {
            console.warn('Safe remove caught error:', error);
        }
    };

    // Multi-Step ProgressBar component with step indicators - memoized to prevent unnecessary re-renders
    const ProgressBar = memo(function ProgressBar({ step }: { step: number }) {
        const [lastStep, setLastStep] = useState(step);
        const [flashStep, setFlashStep] = useState(step);

        useEffect(() => {
            if (step !== lastStep) {
                setFlashStep(step);
                setLastStep(step);
            }
        }, [step, lastStep]);
        const stepNames = ['Background', 'Education', 'Skills', 'Work Exp', 'Resume', 'Analysis'];

        return (
            <div className={styles.progressBarContainer}>
                {/* Step indicators */}
                <div className={styles.stepIndicators}>
                    {stepNames.map((stepName, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < step;
                        const isCurrent = stepNumber === step;

                        return (
                            <div
                                key={stepNumber}
                                className={`${styles.stepIndicator} ${
                                    isCompleted ? styles.stepCompleted :
                                    isCurrent ? styles.stepCurrent :
                                    styles.stepUpcoming
                                }`}
                            >
                                <div className={`${styles.stepCircle} ${flashStep === stepNumber ? styles.stepCircleFlash : ''}`}>
                                    {isCompleted ? (
                                        <span className={styles.stepCheckmark}>✓</span>
                                    ) : (
                                        <span className={styles.stepNumber}>{stepNumber}</span>
                                    )}
                                </div>
                                <div className={styles.stepName}>{stepName}</div>
                                {index < stepNames.length - 1 && (
                                    <div className={`${styles.stepConnector} ${
                                        isCompleted ? styles.connectorCompleted : styles.connectorIncomplete
                                    }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    });

    // Initialize radar chart
    useEffect(() => {
        let isMounted = true;
        let retryTimer: NodeJS.Timeout;

        const initChart = () => {
            if (!isMounted) return;

            if (svgRef.current) {
                console.log('SVG ref found, initializing D3 chart...');
                initializeChart();
            } else {
                console.log('SVG ref not ready yet, retrying...');
                retryTimer = setTimeout(initChart, 100);
            }
        };

        // Start initialization with small delay for DOM readiness
        const timer = setTimeout(initChart, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, []);

    // Add useEffect to set body class
    useEffect(() => {
        // Add class to body for specific styling
        document.body.classList.add('alpha-page');

        // Clean up function
        return () => {
            document.body.classList.remove('alpha-page');
            // Also cleanup any pending D3 transitions
            if (svgRef.current) {
                const svg = d3.select(svgRef.current);
                svg.selectAll('*').interrupt();
            }
        };
    }, []);

    // Handle target job blur event
    const handleTargetJobBlur = () => {
        if (targetJob.trim() && svgRef.current) {
            animateGreyFill();
        }
    };

    // Handle target job clearing
    useEffect(() => {
        let isMounted = true;

        if (isMounted && !targetJob && svgRef.current) {
            removeGreyArea();
        }

        return () => {
            isMounted = false;
        };
    }, [targetJob]);

    // Update chart when form data changes (works on both steps)
    useEffect(() => {
        let isMounted = true;

        if (isMounted && svgRef.current) {
            updateChartWithFormData();
        }

        return () => {
            isMounted = false;
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
        }, [formData, basicInfoFocusCount, isTypingBasicInfo, educationFocusCount, isTypingEducation, jobMatchFocusCount, isTypingJobMatch, techSkillsFocusCount, isTypingTechSkills, professionalFocusCount, isTypingProfessional, teamworkFocusCount, isTypingTeamwork, resumeAnalysisData]);

    // Close years dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            Object.keys(yearsDropdownRefs.current).forEach(key => {
                const index = parseInt(key);
                const ref = yearsDropdownRefs.current[index];
                if (ref && !ref.contains(event.target as Node)) {
                    setYearsDropdownStates(prev => ({
                        ...prev,
                        [index]: false
                    }));
                }
            });
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Toggle years dropdown for specific index
    const toggleYearsDropdown = (index: number) => {
        setYearsDropdownStates(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Handle years option selection
    const handleYearsSelect = (index: number, value: string) => {
        handleWorkExperienceChange(index, 'employedYears', value);
        setYearsDropdownStates(prev => ({
            ...prev,
            [index]: false
        }));
    };

    const initializeChart = () => {
        const svgElement = svgRef.current;
        if (!svgElement) {
            console.log('SVG ref not available');
            return;
        }

        console.log('Initializing D3.js chart...');

        const width = 500;
        const height = 500;
        const centerX = width / 2;
        const centerY = height / 2;

        try {
            // Clear existing content and setup SVG with D3
            const svg = d3.select(svgElement);

            // Check if chart is already initialized to avoid conflicts
            const existingChart = svg.select('.chart-group');
            if (!existingChart.empty()) {
                console.log('Chart already initialized, skipping initialization');
                return;
            }

            // Set SVG attributes
            svg.attr('width', width)
               .attr('height', height)
               .attr('viewBox', `0 0 ${width} ${height}`);

            // Interrupt any ongoing transitions before clearing
            svg.selectAll('*').interrupt();

            // Safely clear any existing content
            const existingContent = svg.selectAll('*');
            safeRemove(existingContent);

            // Create gradients
            const defs = svg.append('defs');

            // Light green gradient for the hexagon
            const lightGreenGradient = defs.append('radialGradient')
                .attr('id', 'lightGreenGradient')
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%');

            lightGreenGradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', '#90EE90')
                .style('stop-opacity', 0.3);

            lightGreenGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#90EE90')
                .style('stop-opacity', 0.1);

            // Grey gradient for target job
            const greyGradient = defs.append('radialGradient')
                .attr('id', 'greyGradient')
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%');

            greyGradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', '#F0E8BB')
                .style('stop-opacity', 0.8);

            greyGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#F0E8BB')
                .style('stop-opacity', 0.3);

            // Green gradient for form data
            const greenGradient = defs.append('radialGradient')
                .attr('id', 'greenGradient')
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%');

            greenGradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', '#4ecdc4')
                .style('stop-opacity', 0.8);

            greenGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#4ecdc4')
                .style('stop-opacity', 0.3);

            // Gradient for Personal Capability shape (progress triangle)
            const capabilityGradient = defs.append('linearGradient')
                .attr('id', 'capabilityGradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '100%');
            capabilityGradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', '#A874E6')
                .style('stop-opacity', 0.85);
            capabilityGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#6E3FB8')
                .style('stop-opacity', 0.9);

            // Gradient for Resume Power shape
            const resumeGradient = defs.append('linearGradient')
                .attr('id', 'resumeGradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '100%');
            resumeGradient.append('stop')
                .attr('offset', '0%')
                .style('stop-color', '#FF8A8A')
                .style('stop-opacity', 0.35);
            resumeGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#FF5C5C')
                .style('stop-opacity', 0.5);

            // Create main group
            const g = svg.append('g')
                .attr('transform', `translate(${centerX}, ${centerY})`)
                .attr('class', 'chart-group');

            console.log('D3 setup complete, drawing grid...');

            // Draw grid using D3
            drawGrid(g);
        } catch (error) {
            console.error('Error initializing D3 chart:', error);
        }
    };

    const drawGrid = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
        console.log('Drawing D3 grid with', labels.length, 'labels');

        try {

            // Create the main hexagon points
            const hexPoints: [number, number][] = [];
            for (let i = 0; i < labels.length; i++) {
                const angle = angleSlice * i - Math.PI / 2;
                hexPoints.push([
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius
                ]);
            }

            console.log('Hexagon points:', hexPoints);

            // Create D3 line generator for hexagon
            const line = d3.line<[number, number]>()
                .x(d => d[0])
                .y(d => d[1])
                .curve(d3.curveLinearClosed);

            // Draw the main hexagon with light green fill
            g.append('path')
                .datum(hexPoints)
                .attr('class', 'main-hexagon')
                .attr('d', line)
                .attr('fill', 'url(#lightGreenGradient)')
                .attr('stroke', '#90EE90')
                .attr('stroke-width', 2)
                .attr('opacity', 0.8);

            console.log('Main hexagon created with D3');

            // Draw concentric hexagon levels for grid
            for (let level = 1; level <= levels; level++) {
                const levelRadius = (radius / levels) * level;
                const levelPoints: [number, number][] = [];

                for (let i = 0; i < labels.length; i++) {
                    const angle = angleSlice * i - Math.PI / 2;
                    levelPoints.push([
                        Math.cos(angle) * levelRadius,
                        Math.sin(angle) * levelRadius
                    ]);
                }

                g.append('path')
                    .datum(levelPoints)
                    .attr('class', 'grid-level')
                    .attr('d', line)
                    .attr('fill', 'none')
                    .attr('stroke', '#f0f0f0')
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.7);
            }

            // Draw axis lines
            g.selectAll('.axis-line')
                .data(labels)
                .enter()
                .append('line')
                .attr('class', 'axis-line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', (_, i) => Math.cos(angleSlice * i - Math.PI / 2) * radius)
                .attr('y2', (_, i) => Math.sin(angleSlice * i - Math.PI / 2) * radius)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 1);

            // Add category labels with elegant styling
            g.selectAll('.radar-label')
                .data(labels)
                .enter()
                .append('text')
                .attr('class', 'radar-label')
                .attr('x', (_, i) => {
                    const angle = angleSlice * i - Math.PI / 2;
                    return Math.cos(angle) * (radius + 30);
                })
                .attr('y', (_, i) => {
                    const angle = angleSlice * i - Math.PI / 2;
                    return Math.sin(angle) * (radius + 30);
                })
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', '14px')
                .attr('font-weight', '700')
                .attr('font-family', "'Playfair Display', 'Georgia', serif")
                .attr('fill', '#2c2c2c')
                .attr('letter-spacing', '0.5px')
                .text(d => d);

            console.log('Grid completed with D3');
        } catch (error) {
            console.error('Error in drawGrid:', error);
        }
    };


    const animateGreyFill = () => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        const g = svg.select('.chart-group');

        // Only animate if grey area doesn't already exist
        if (g.select('.grey-area').node()) {
            console.log('Grey area already exists, skipping animation');
            return;
        }

        console.log('Creating grey area with animation...');

        // Create full hexagon points
        const hexPoints: [number, number][] = [];
        for (let i = 0; i < labels.length; i++) {
            const angle = angleSlice * i - Math.PI / 2;
            hexPoints.push([
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            ]);
        }

        // Create D3 line generator
        const line = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveLinearClosed);

        // Create grey area with fancy energetic animation - insert at the beginning to stay behind other elements
        const greyArea = g.insert('path', ':first-child')
            .datum(hexPoints)
            .attr('class', 'grey-area')
            .attr('d', line)
            .attr('fill', 'url(#greyGradient)')
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 2)
            .attr('opacity', 0)
            .style('transform', 'scale(0)')
            .style('transform-origin', '0px 0px'); // Center at 0,0 since g is already translated

        // Energetic multi-stage animation
        greyArea
            .transition()
            .duration(200)
            .ease(d3.easeQuadOut)
            .attr('opacity', 0.8)
            .style('transform', 'scale(0.3)')
            .transition()
            .duration(400)
            .ease(d3.easeElasticOut.amplitude(1.2).period(0.3))
            .style('transform', 'scale(1.1)')
            .transition()
            .duration(300)
            .ease(d3.easeBackOut)
            .style('transform', 'scale(1)')
            .attr('opacity', 0.7);

        // Add pulsing effect for extra energy
        const pulse = () => {
            greyArea
                .transition()
                .duration(800)
                .ease(d3.easeSinInOut)
                .attr('opacity', 0.9)
                .transition()
                .duration(800)
                .ease(d3.easeSinInOut)
                .attr('opacity', 0.7)
                .on('end', () => {
                    if (g.select('.grey-area').node()) {
                        pulse(); // Continue pulsing if element still exists
                    }
                });
        };

        // Start pulsing after initial animation
        setTimeout(pulse, 900);

    };

    const removeGreyArea = () => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        const g = svg.select('.chart-group');
        const greyArea = g.select('.grey-area');

        if (greyArea.node()) {
            console.log('Removing grey area with fancy animation...');

            // Fancy exit animation
            greyArea
                .transition()
                .duration(200)
                .ease(d3.easeQuadIn)
                .attr('opacity', 0.3)
                .style('transform', 'scale(1.2)')
                .transition()
                .duration(300)
                .ease(d3.easeBackIn)
                .attr('opacity', 0)
                .style('transform', 'scale(0)')
                .on('end', function() {
                    safeRemove(greyArea);
                    console.log('Grey area removed');
                });
        }
    };


    const updateChartWithFormData = () => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        const g = svg.select('.chart-group');

        // Hide dots on Analysis page after shapes are drawn
        if (currentStep === 6) {
            // Hide all dots when on Analysis page
            g.selectAll('.progress-dot, .background-dot, .education-dot, .professional-dot, .tech-skills-dot, .teamwork-dot, .jobmatch-dot')
                .style('opacity', 0)
                .style('display', 'none');
        } else {
            // Show dots when not on Analysis page
            g.selectAll('.progress-dot, .background-dot, .education-dot, .professional-dot, .tech-skills-dot, .teamwork-dot, .jobmatch-dot')
                .style('display', 'block')
                .style('opacity', 1);
        }

        // Check if any education fields are filled
        const educationFields = ['collegeName', 'degree', 'major', 'graduationYear'];
        const filledEducationFields = educationFields.filter(field => {
            const value = formData[field as keyof typeof formData];
            return typeof value === 'string' && value.trim() !== '';
        });
        const hasEducationData = filledEducationFields.length > 0;
        
        // Check if any skills fields are filled
        const skillsFields = ['programmingLanguages', 'frameworks', 'databases', 'tools'];
        const filledSkillsFields = skillsFields.filter(field => {
            const value = formData[field as keyof typeof formData];
            return typeof value === 'string' && value.trim() !== '';
        });
        const hasSkillsData = filledSkillsFields.length > 0;
        
        // Check if any work experience fields are filled
        const workExperienceFields = ['companyName', 'jobTitle', 'employedYears'];
        let filledWorkExperienceFields: string[] = [];
        
        // Count filled fields across all work experience entries
        formData.workExperiences.forEach((experience, index) => {
            workExperienceFields.forEach(field => {
                if (experience[field as keyof typeof experience].trim() !== '') {
                    filledWorkExperienceFields.push(`${field}_${index}`);
                }
            });
        });
        
        const hasWorkExperienceData = filledWorkExperienceFields.length > 0;
        
        // Calculate background dot value based only on basic info fields (firstName, lastName, email, phoneNumber)
        const basicInfoKeys = ['firstName', 'lastName', 'email', 'phoneNumber'] as const;
        const completedBasicCount = basicInfoKeys.filter(key => (formData[key] as string).trim() !== '').length;
        const hasAnyBasicInput = basicInfoKeys.some(key => (formData[key] as string).trim() !== '');

        // Background dot value calculation: +2 per completed field, max 8
        let backgroundValue = completedBasicCount * 2;
        
        // Count non-basic fields for other dots and job match calculation
        const workExperienceFieldCount = filledWorkExperienceFields.length;
        const nonBasicFilledCount = filledEducationFields.length + filledSkillsFields.length + workExperienceFieldCount;
        const totalNonBasicFields = nonBasicFilledCount; // Only non-basic fields affect other dots
        
        // Job Match calculation based on education, skills, AND work experience fields (table-driven)
        // Each completed field moves dot 0.5 units outward (0.5/10 of max value)
        // Cap at maximum to not exceed endpoint
        let jobMatchValue = 0;
        const totalJobMatchFields = filledEducationFields.length + filledSkillsFields.length + filledWorkExperienceFields.length;
        if (totalJobMatchFields > 0) {
            jobMatchValue = Math.min(totalJobMatchFields * 0.5, 8); // Cap at 8 to not exceed endpoint (8/10 of max radius)
        }
        
        // Check if we should show any dots at all
        const shouldShowBackground = true; // Always show background dot
        const shouldShowJobMatch = jobMatchValue > 0; // Only show when any job match fields are completed
        
        console.log('Background dot calculation:', {
            completedBasicCount,
            hasAnyBasicInput,
            backgroundValue,
            shouldShowBackground
        });
        console.log('Job Match calculation:', { 
            filledEducationFields: filledEducationFields.length, 
            filledSkillsFields: filledSkillsFields.length,
            filledWorkExperienceFields: filledWorkExperienceFields.length,
            totalJobMatchFields,
            jobMatchValue 
        });
        console.log('Education fields filled:', filledEducationFields.length, hasEducationData);
        console.log('Skills fields filled:', filledSkillsFields.length, hasSkillsData);
        console.log('Work Experience fields filled:', filledWorkExperienceFields.length, hasWorkExperienceData);
        const hasAnyActivity = shouldShowBackground || shouldShowJobMatch || hasEducationData || hasSkillsData || hasWorkExperienceData;
        
        if (!hasAnyActivity) {
            // Safely remove any existing progress dots
            const dotsToRemove = g.selectAll('.progress-dot, .education-dot, .professional-dot, .tech-skills-dot, .teamwork-dot');
            safeRemove(dotsToRemove);

            // Fade out triangle instead of removing it
            const existingTriangle = g.select('.progress-triangle');
            if (!existingTriangle.empty()) {
                existingTriangle
                    .transition()
                    .duration(600)
                    .ease(d3.easeQuadInOut)
                    .attr('opacity', 0)
                    .style('transform', 'scale(0.1)');
            }

            console.log('No activity, fading out animations');
            return;
        }

        console.log('Proceeding with animation. Background:', shouldShowBackground, 'Job Match:', shouldShowJobMatch);

        // Calculate positions for Background (index 0) and Job Match (index 5)
        const backgroundAngle = angleSlice * 0 - Math.PI / 2;
        const jobMatchAngle = angleSlice * 5 - Math.PI / 2;

        const backgroundRadius = (backgroundValue / maxValue) * radius;
        // JobMatch radius calculation: start at center when just typing, move outward when fields completed
        let actualJobMatchValue = 0;
        if (hasEducationData) {
            actualJobMatchValue = jobMatchValue; // Use calculated value for completed fields
        }
        // If just typing but no completed fields, stay at center (value = 0)
        
        const jobMatchRadius = (actualJobMatchValue / maxValue) * radius;

        const backgroundPoint: [number, number] = [
            Math.cos(backgroundAngle) * backgroundRadius,
            Math.sin(backgroundAngle) * backgroundRadius
        ];

        const jobMatchPoint: [number, number] = [
            Math.cos(jobMatchAngle) * jobMatchRadius,
            Math.sin(jobMatchAngle) * jobMatchRadius
        ];

        // Handle Background dot based on basic info fields
        let backgroundDot = g.select('.background-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
        
        if (shouldShowBackground) {
            if (backgroundDot.empty()) {
                // Create background dot with fancy drop-in animation
                backgroundDot = g.append('circle')
                    .attr('class', 'progress-dot background-dot')
                    .attr('cx', backgroundPoint[0])
                    .attr('cy', backgroundPoint[1] - 20) // Start above
                    .attr('r', 0)
                    .attr('fill', '#ff6b6b')
                    .attr('stroke', '#ff4757')
                    .attr('stroke-width', 3)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                // Fancy drop-in animation with bounce
                backgroundDot
                    .transition()
                    .duration(100)
                    .ease(d3.easeQuadOut)
                    .attr('cy', backgroundPoint[1] + 5) // Drop down past target
                    .attr('opacity', 1)
                    .attr('r', 10) // Start larger
                    .transition()
                    .duration(400)
                    .ease(d3.easeBounceOut)
                    .attr('cy', backgroundPoint[1]) // Bounce to final position
                    .attr('r', 8) // Larger final size for better visibility
                    .on('end', () => {
                        // No automatic radar signal - dot should remain static when not typing
                    });
            } else {
                // Move existing dot to new position with smooth animation
                backgroundDot
                    .transition('position')
                    .duration(400)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', backgroundPoint[0])
                    .attr('cy', backgroundPoint[1])
                    .attr('r', backgroundValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect (original timing)
            if (isTypingBasicInfo && basicInfoFocusCount > 0) {
                const addTypingReactionAnimation = () => {
                    if (isTypingBasicInfo && basicInfoFocusCount > 0) { // Still typing
                        // Use target position instead of current position to ensure radar ring appears at correct location
                        //const targetX = backgroundPoint[0];
                        //const targetY = backgroundPoint[0];
                        const targetX = parseFloat(backgroundDot.attr('cx'));
                        const targetY = parseFloat(backgroundDot.attr('cy'));

                        // Create expanding ring effect at dot's target position
                        const ring = g.append('circle')
                            .attr('class', 'typing-ring')
                            .attr('cx', targetX)
                            .attr('cy', targetY)
                            .attr('r', 6)
                            .attr('fill', 'none')
                            .attr('stroke', '#ff6b6b')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0.8);

                        ring.transition()
                            .duration(800)
                            .ease(d3.easeQuadOut)
                            .attr('r', 25)
                            .attr('opacity', 0)
                            .on('end', function() {
                                ring.remove();
                            });

                        // Dot reaction animation - use a separate named transition so it doesn't cancel position
                        backgroundDot
                            .transition('pulse')
                            .duration(200)
                            .ease(d3.easeQuadOut)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(600)
                            .ease(d3.easeBackOut)
                            .attr('r', 8)
                            .attr('opacity', 1)
                            .on('end', () => {
                                if (isTypingBasicInfo && basicInfoFocusCount > 0) {
                                    setTimeout(addTypingReactionAnimation, 300);
                                }
                            });
                    }
                };
                addTypingReactionAnimation();
            } else {
                // Not typing: ensure no radar rings and no pulse animation
                g.selectAll('.typing-ring').remove();
                if (!backgroundDot.empty()) {
                    (backgroundDot as any).interrupt('pulse');
                }
            }
        } else {
            // Remove background dot if it exists and shouldn't be shown
            if (!backgroundDot.empty()) {
                backgroundDot
                    .transition()
                    .duration(300)
                    .ease(d3.easeQuadIn)
                    .attr('opacity', 0)
                    .attr('r', 0)
                    .on('end', function() {
                        safeRemove(backgroundDot);
                    });
            }
        }

        // No continuous radar signal animation - dot remains static when not typing


        // Handle Job Match dot with enhanced UX like BackgroundDot (education, skills, and work experience fields)
        const shouldShowJobMatchDot = hasEducationData || hasSkillsData || hasWorkExperienceData || 
                                     (isTypingEducation && educationFocusCount > 0) || 
                                     (isTypingTechSkills && techSkillsFocusCount > 0) ||
                                     (isTypingJobMatch && jobMatchFocusCount > 0);
        let jobMatchDot = g.select('.jobmatch-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
        
        if (shouldShowJobMatchDot) {
            if (jobMatchDot.empty()) {
                // Create job match dot - start at center if just typing, or at final position if has data
                const startPosition = actualJobMatchValue === 0 ? [0, 0] : jobMatchPoint;
                jobMatchDot = g.append('circle')
                    .attr('class', 'progress-dot jobmatch-dot')
                    .attr('cx', startPosition[0])
                    .attr('cy', startPosition[1] - (actualJobMatchValue === 0 ? 0 : 50)) // No drop if at center
                    .attr('r', 0)
                    .attr('fill', '#4794ED')
                    .attr('stroke', '#3960BD')
                    .attr('stroke-width', 3)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                if (actualJobMatchValue === 0) {
                    // Simple fade-in at center when typing
                jobMatchDot
                    .transition()
                        .duration(400)
                        .ease(d3.easeQuadOut)
                        .attr('opacity', 1)
                        .attr('r', 6);
            } else {
                    // Fancy drop-in animation with bounce for positioned dots
                jobMatchDot
                    .transition()
                    .duration(800)
                        .ease(d3.easeQuadOut)
                        .attr('cy', jobMatchPoint[1] + 10) // Drop down past target
                        .attr('opacity', 1)
                        .attr('r', 10) // Start larger
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('cy', jobMatchPoint[1]) // Bounce to final position
                        .attr('r', 8); // Larger final size for better visibility
                }
            } else {
                // Move existing dot to new position with smooth animation
                jobMatchDot
                    .transition('position-job')
                    .duration(500)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', jobMatchPoint[0])
                    .attr('cy', jobMatchPoint[1])
                    .attr('r', actualJobMatchValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect for JobMatch (education, skills, and work experience fields)
            if ((isTypingEducation && educationFocusCount > 0) || (isTypingTechSkills && techSkillsFocusCount > 0) || (isTypingJobMatch && jobMatchFocusCount > 0)) {
                const addJobMatchTypingAnimation = () => {
                    if ((isTypingEducation && educationFocusCount > 0) || (isTypingTechSkills && techSkillsFocusCount > 0) || (isTypingJobMatch && jobMatchFocusCount > 0)) { // Still typing
                        // Get current actual position of the job match dot
                        const currentX = parseFloat(jobMatchDot.attr('cx'));
                        const currentY = parseFloat(jobMatchDot.attr('cy'));

                        // Create expanding ring effect at dot's current position
                        const ring = g.append('circle')
                            .attr('class', 'jobmatch-typing-ring')
                            .attr('cx', currentX)
                            .attr('cy', currentY)
                            .attr('r', 6)
                            .attr('fill', 'none')
                            .attr('stroke', '#4794ED')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0.8);

                        ring.transition()
                            .duration(800)
                            .ease(d3.easeQuadOut)
                            .attr('r', 25)
                            .attr('opacity', 0)
                            .on('end', function() {
                                ring.remove();
                            });

                        // Dot reaction animation - separate transition name to avoid cancelling movement
                        jobMatchDot
                            .transition('pulse-job')
                            .duration(200)
                            .ease(d3.easeQuadOut)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(600)
                            .ease(d3.easeBackOut)
                            .attr('r', 8)
                            .attr('opacity', 1)
                            .on('end', () => {
                                if ((isTypingEducation && educationFocusCount > 0) || (isTypingTechSkills && techSkillsFocusCount > 0) || (isTypingJobMatch && jobMatchFocusCount > 0)) {
                                    setTimeout(addJobMatchTypingAnimation, 300);
                                }
                            });
                    }
                };
                addJobMatchTypingAnimation();
            } else {
                // Not typing: remove any job match rings and stop pulse
                g.selectAll('.jobmatch-typing-ring').remove();
                if (!jobMatchDot.empty()) {
                    (jobMatchDot as any).interrupt('pulse-job');
                }
            }
        } else {
            // Remove job match dot if it exists and shouldn't be shown
            if (!jobMatchDot.empty()) {
                jobMatchDot
                    .transition()
                    .duration(300)
                    .ease(d3.easeQuadIn)
                    .attr('opacity', 0)
                    .attr('r', 0)
                    .on('end', function() {
                        safeRemove(jobMatchDot);
                    });
            }
        }


        // Update or create Education dot if education fields are filled OR user is typing
        const shouldShowEducationDot = hasEducationData || (isTypingEducation && educationFocusCount > 0);
        
        // Update or create Professional dot if work experience fields are filled OR user is typing work experience
        const shouldShowProfessionalDot = hasWorkExperienceData || (isTypingProfessional && professionalFocusCount > 0);
        
        if (shouldShowEducationDot) {
            // Calculate education dot position based on table:
            // Start typing: 0 (center), 1 field: 2 (1/5), 2 fields: 4 (2/5), 3 fields: 6 (3/5), 4 fields: 8 (4/5)
            let educationValue = 0; // Start at center when typing
            
            if (hasEducationData) {
                // Each completed field moves dot 2 units outward (2/10 of max value)
                educationValue = filledEducationFields.length * 2;
            }
            
            const educationLevel = educationValue / maxValue; // Convert to 0-1 scale for radius calculation
            
            // Professional dot calculation based only on work experience fields (table-driven)
            // Each completed work experience field moves dot 2 units outward (2/10 of max value)
            let professionalValue = 0;
            if (hasWorkExperienceData) {
                professionalValue = filledWorkExperienceFields.length * 2;
            }
            const professionalLevel = professionalValue / maxValue; // Convert to 0-1 scale for radius calculation
            
            console.log('Education progression:', {
                filledCount: filledEducationFields.length,
                totalFields: educationFields.length,
                educationValue,
                educationLevel,
                professionalLevel,
                isTyping: isTypingEducation && educationFocusCount > 0
            });
            
            const educationAngle = angleSlice * 1 - Math.PI / 2; // Education is at index 1
            const professionalAngle = angleSlice * 2 - Math.PI / 2; // Professional is at index 2

            const educationRadius = educationLevel * radius; // educationLevel is already 0-1 scale
            const professionalRadius = professionalLevel * radius;

            const educationPoint: [number, number] = [
                Math.cos(educationAngle) * educationRadius,
                Math.sin(educationAngle) * educationRadius
            ];

            const professionalPoint: [number, number] = [
                Math.cos(professionalAngle) * professionalRadius,
                Math.sin(professionalAngle) * professionalRadius
            ];

            // Handle Education dot with enhanced UX like BackgroundDot
            let educationDot = g.select('.education-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (educationDot.empty()) {
                // Create education dot - start at center if just typing, or at final position if has data
                const startPosition = educationValue === 0 ? [0, 0] : educationPoint;
                educationDot = g.append('circle')
                    .attr('class', 'progress-dot education-dot')
                    .attr('cx', startPosition[0])
                    .attr('cy', startPosition[1] - (educationValue === 0 ? 0 : 50)) // No drop if at center
                    .attr('r', 0)
                    .attr('fill', '#4ecdc4')
                    .attr('stroke', '#38ABAB')
                    .attr('stroke-width', 3)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                if (educationValue === 0) {
                    // Simple fade-in at center when typing
                educationDot
                    .transition()
                        .duration(400)
                        .ease(d3.easeQuadOut)
                        .attr('opacity', 1)
                        .attr('r', 6);
            } else {
                    // Fancy drop-in animation with bounce for positioned dots
                educationDot
                    .transition()
                    .duration(800)
                        .ease(d3.easeQuadOut)
                        .attr('cy', educationPoint[1] + 10) // Drop down past target
                        .attr('opacity', 1)
                        .attr('r', 10) // Start larger
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('cy', educationPoint[1]) // Bounce to final position
                        .attr('r', 8); // Larger final size for better visibility
                }
            } else {
                // Move existing dot to new position with smooth animation
                educationDot
                    .transition('position-edu')
                    .duration(500)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', educationPoint[0])
                    .attr('cy', educationPoint[1])
                    .attr('r', educationValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect for education
            if (isTypingEducation && educationFocusCount > 0) {
                const addEducationTypingAnimation = () => {
                    if (isTypingEducation && educationFocusCount > 0) { // Still typing
                        // Get current actual position of the education dot
                        const currentX = parseFloat(educationDot.attr('cx'));
                        const currentY = parseFloat(educationDot.attr('cy'));

                        // Create expanding ring effect at dot's current position
                        const ring = g.append('circle')
                            .attr('class', 'education-typing-ring')
                            .attr('cx', currentX)
                            .attr('cy', currentY)
                            .attr('r', 6)
                            .attr('fill', 'none')
                            .attr('stroke', '#4ecdc4')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0.8);

                        ring.transition()
                            .duration(800)
                            .ease(d3.easeQuadOut)
                            .attr('r', 25)
                            .attr('opacity', 0)
                            .on('end', function() {
                                ring.remove();
                            });

                        // Dot reaction animation - separate transition name to avoid cancelling movement
                        educationDot
                            .transition('pulse-edu')
                            .duration(200)
                            .ease(d3.easeQuadOut)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(600)
                            .ease(d3.easeBackOut)
                            .attr('r', 8)
                            .attr('opacity', 1)
                            .on('end', () => {
                                if (isTypingEducation && educationFocusCount > 0) {
                                    setTimeout(addEducationTypingAnimation, 300);
                                }
                            });
                    }
                };
                addEducationTypingAnimation();
            } else {
                // Not typing: remove any education rings and stop pulse
                g.selectAll('.education-typing-ring').remove();
                if (!educationDot.empty()) {
                    (educationDot as any).interrupt('pulse-edu');
                }
            }


            // Static dots - no pulsing animation
        } else {
            // Safely remove education dots if no education data and not typing
            const educationDotsToRemove = g.selectAll('.education-dot');
            safeRemove(educationDotsToRemove);
        }

        // Update or create Professional dot with enhanced UX like BackgroundDot
        if (shouldShowProfessionalDot) {
            // Calculate Professional dot position based on table:
            // Start typing: 0 (center), 1 field: 2 (1/5), 2 fields: 4 (2/5), 3 fields: 6 (3/5), 4 fields: 8 (4/5)
            let professionalValue = 0; // Start at center when typing
            
            if (hasWorkExperienceData) {
                // Each completed work experience field moves dot 2 units outward (2/10 of max value)
                // Cap at maximum to not exceed endpoint
                professionalValue = Math.min(filledWorkExperienceFields.length * 2, 10); // Cap at 10 to not exceed endpoint (100% of max radius)
            }
            
            const professionalLevel = professionalValue / maxValue; // Convert to 0-1 scale for radius calculation
            
            console.log('Professional progression:', {
                filledCount: filledWorkExperienceFields.length,
                totalFields: workExperienceFields.length,
                professionalValue,
                professionalLevel,
                isTyping: isTypingProfessional && professionalFocusCount > 0
            });
            
            const professionalAngle = angleSlice * 2 - Math.PI / 2; // Professional is at index 2
            const professionalRadius = professionalLevel * radius; // professionalLevel is already 0-1 scale

            const professionalPoint: [number, number] = [
                Math.cos(professionalAngle) * professionalRadius,
                Math.sin(professionalAngle) * professionalRadius
            ];

            // Handle Professional dot with enhanced UX like BackgroundDot
            let professionalDot = g.select('.professional-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (professionalDot.empty()) {
                // Create professional dot - start at center if just typing, or at final position if has data
                const startPosition = professionalValue === 0 ? [0, 0] : professionalPoint;
                professionalDot = g.append('circle')
                    .attr('class', 'progress-dot professional-dot')
                    .attr('cx', startPosition[0])
                    .attr('cy', startPosition[1] - (professionalValue === 0 ? 0 : 50)) // No drop if at center
                    .attr('r', 0)
                    .attr('fill', '#F0611A')
                    .attr('stroke', '#c0392b')
                    .attr('stroke-width', 3)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                if (professionalValue === 0) {
                    // Simple fade-in at center when typing
                professionalDot
                    .transition()
                        .duration(400)
                        .ease(d3.easeQuadOut)
                        .attr('opacity', 1)
                        .attr('r', 6);
            } else {
                    // Fancy drop-in animation with bounce for positioned dots
                professionalDot
                    .transition()
                    .duration(800)
                        .ease(d3.easeQuadOut)
                        .attr('cy', professionalPoint[1] + 10) // Drop down past target
                        .attr('opacity', 1)
                        .attr('r', 10) // Start larger
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('cy', professionalPoint[1]) // Bounce to final position
                        .attr('r', 8); // Larger final size for better visibility
                }
            } else {
                // Move existing dot to new position with smooth animation
                professionalDot
                    .transition('position-prof')
                    .duration(500)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', professionalPoint[0])
                    .attr('cy', professionalPoint[1])
                    .attr('r', professionalValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect for Professional
            if (isTypingProfessional && professionalFocusCount > 0) {
                const addProfessionalTypingAnimation = () => {
                    if (isTypingProfessional && professionalFocusCount > 0) { // Still typing
                        // Get current actual position of the professional dot
                        const currentX = parseFloat(professionalDot.attr('cx'));
                        const currentY = parseFloat(professionalDot.attr('cy'));

                        // Create expanding ring effect at dot's current position
                        const ring = g.append('circle')
                            .attr('class', 'professional-typing-ring')
                            .attr('cx', currentX)
                            .attr('cy', currentY)
                            .attr('r', 6)
                            .attr('fill', 'none')
                            .attr('stroke', '#F0611A')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0.8);

                        ring.transition()
                            .duration(800)
                            .ease(d3.easeQuadOut)
                            .attr('r', 25)
                            .attr('opacity', 0)
                            .on('end', function() {
                                ring.remove();
                            });

                        // Dot reaction animation - separate transition name to avoid cancelling movement
                        professionalDot
                            .transition('pulse-prof')
                            .duration(200)
                            .ease(d3.easeQuadOut)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(600)
                            .ease(d3.easeBackOut)
                            .attr('r', 8)
                            .attr('opacity', 1)
                            .on('end', () => {
                                if (isTypingProfessional && professionalFocusCount > 0) {
                                    setTimeout(addProfessionalTypingAnimation, 300);
                                }
                            });
                    }
                };
                addProfessionalTypingAnimation();
        } else {
                // Not typing: remove any professional rings and stop pulse
                g.selectAll('.professional-typing-ring').remove();
                if (!professionalDot.empty()) {
                    (professionalDot as any).interrupt('pulse-prof');
                }
            }
        } else {
            // Safely remove professional dot if no work experience data and not typing
            const professionalDotsToRemove = g.selectAll('.professional-dot');
            safeRemove(professionalDotsToRemove);
        }

        // Update or create Tech Skills dot with enhanced UX like BackgroundDot
        const shouldShowTechSkillsDot = hasSkillsData || (isTypingTechSkills && techSkillsFocusCount > 0);
        
        if (shouldShowTechSkillsDot) {
            // Calculate TechSkills dot position based on table:
            // Start typing: 0 (center), 1 field: 2 (1/5), 2 fields: 4 (2/5), 3 fields: 6 (3/5), 4 fields: 8 (4/5)
            let techSkillsValue = 0; // Start at center when typing

            // Count completed skills fields (Programming Languages, Technologies, Frameworks & Tools, Achievements)
            const completedSkillsFieldCount = filledSkillsFields.length;

            // Each completed field moves dot 2 units outward (2/10 of max value)
            // Cap at maximum to not exceed endpoint
            if (completedSkillsFieldCount > 0) {
                techSkillsValue = Math.min(completedSkillsFieldCount * 2, 10); // Cap at 10 to not exceed endpoint (100% of max radius)
            }
            
            const techSkillsLevel = techSkillsValue / maxValue; // Convert to 0-1 scale for radius calculation
            
            console.log('Tech Skills progression:', {
                completedSkillsFieldCount,
                techSkillsValue,
                techSkillsLevel,
                isTyping: isTypingTechSkills && techSkillsFocusCount > 0
            });
            
            const techSkillsAngle = angleSlice * 3 - Math.PI / 2; // Tech Skills is at index 3
            const techSkillsRadius = techSkillsLevel * radius; // techSkillsLevel is already 0-1 scale

            const techSkillsPoint: [number, number] = [
                Math.cos(techSkillsAngle) * techSkillsRadius,
                Math.sin(techSkillsAngle) * techSkillsRadius
            ];

            // Handle Tech Skills dot with enhanced UX like BackgroundDot
            let techSkillsDot = g.select('.tech-skills-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (techSkillsDot.empty()) {
                // Create tech skills dot - start at center if just typing, or at final position if has data
                const startPosition = techSkillsValue === 0 ? [0, 0] : techSkillsPoint;
                techSkillsDot = g.append('circle')
                    .attr('class', 'progress-dot tech-skills-dot')
                    .attr('cx', startPosition[0])
                    .attr('cy', startPosition[1] - (techSkillsValue === 0 ? 0 : 50)) // No drop if at center
                    .attr('r', 0)
                    .attr('fill', '#f39c12')
                    .attr('stroke', '#e67e22')
                    .attr('stroke-width', 3)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                if (techSkillsValue === 0) {
                    // Simple fade-in at center when typing
                techSkillsDot
                    .transition()
                        .duration(400)
                        .ease(d3.easeQuadOut)
                        .attr('opacity', 1)
                        .attr('r', 6);
            } else {
                    // Fancy drop-in animation with bounce for positioned dots
                techSkillsDot
                    .transition()
                    .duration(800)
                        .ease(d3.easeQuadOut)
                        .attr('cy', techSkillsPoint[1] + 10) // Drop down past target
                        .attr('opacity', 1)
                        .attr('r', 10) // Start larger
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('cy', techSkillsPoint[1]) // Bounce to final position
                        .attr('r', 8); // Larger final size for better visibility
                }
            } else {
                // Move existing dot to new position with smooth animation
                techSkillsDot
                    .transition('position-tech')
                    .duration(500)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', techSkillsPoint[0])
                    .attr('cy', techSkillsPoint[1])
                    .attr('r', techSkillsValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect for TechSkills
            if (isTypingTechSkills && techSkillsFocusCount > 0) {
                const addTechSkillsTypingAnimation = () => {
                    if (isTypingTechSkills && techSkillsFocusCount > 0) { // Still typing
                        // Get current actual position of the tech skills dot
                        const currentX = parseFloat(techSkillsDot.attr('cx'));
                        const currentY = parseFloat(techSkillsDot.attr('cy'));

                        // Create expanding ring effect at dot's current position
                        const ring = g.append('circle')
                            .attr('class', 'techskills-typing-ring')
                            .attr('cx', currentX)
                            .attr('cy', currentY)
                            .attr('r', 6)
                            .attr('fill', 'none')
                            .attr('stroke', '#f39c12')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0.8);

                        ring.transition()
                            .duration(800)
                            .ease(d3.easeQuadOut)
                            .attr('r', 25)
                            .attr('opacity', 0)
                            .on('end', function() {
                                ring.remove();
                            });

                        // Dot reaction animation - separate transition name to avoid cancelling movement
                        techSkillsDot
                            .transition('pulse-tech')
                            .duration(200)
                            .ease(d3.easeQuadOut)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(600)
                            .ease(d3.easeBackOut)
                            .attr('r', 8)
                            .attr('opacity', 1)
                            .on('end', () => {
                                if (isTypingTechSkills && techSkillsFocusCount > 0) {
                                    setTimeout(addTechSkillsTypingAnimation, 300);
                                }
                            });
                    }
                };
                addTechSkillsTypingAnimation();
        } else {
                // Not typing: remove any tech skills rings and stop pulse
                g.selectAll('.techskills-typing-ring').remove();
                if (!techSkillsDot.empty()) {
                    (techSkillsDot as any).interrupt('pulse-tech');
                }
            }
        } else {
            // Safely remove tech skills dot if no skills data and not typing
            const techSkillsDotsToRemove = g.selectAll('.tech-skills-dot');
            safeRemove(techSkillsDotsToRemove);
        }

        // Update or create Teamwork dot with enhanced UX like BackgroundDot
        const shouldShowTeamworkDot = hasWorkExperienceData || (isTypingTeamwork && teamworkFocusCount > 0);
        
        if (shouldShowTeamworkDot) {
            // Calculate Teamwork dot position based on table:
            // Start typing: 0 (center), 1 field: 2 (1/5), 2 fields: 4 (2/5), 3 fields: 6 (3/5), 4 fields: 8 (4/5)
            let teamworkValue = 0; // Start at center when typing
            
        if (hasWorkExperienceData) {
                // Each completed work experience field moves dot 2 units outward (2/10 of max value)
                // Cap at maximum to not exceed endpoint
                teamworkValue = Math.min(filledWorkExperienceFields.length * 2, 10); // Cap at 10 to not exceed endpoint (100% of max radius)
            }
            
            const teamworkLevel = teamworkValue / maxValue; // Convert to 0-1 scale for radius calculation
            
            console.log('Teamwork progression:', {
                filledCount: filledWorkExperienceFields.length,
                totalFields: workExperienceFields.length,
                teamworkValue,
                teamworkLevel,
                isTyping: isTypingTeamwork && teamworkFocusCount > 0
            });
            
            const teamworkAngle = angleSlice * 4 - Math.PI / 2; // Teamwork is at index 4
            const teamworkRadius = teamworkLevel * radius; // teamworkLevel is already 0-1 scale

            const teamworkPoint: [number, number] = [
                Math.cos(teamworkAngle) * teamworkRadius,
                Math.sin(teamworkAngle) * teamworkRadius
            ];

            // Handle Teamwork dot with enhanced UX like BackgroundDot
            let teamworkDot = g.select('.teamwork-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (teamworkDot.empty()) {
                // Create teamwork dot - start at center if just typing, or at final position if has data
                const startPosition = teamworkValue === 0 ? [0, 0] : teamworkPoint;
                teamworkDot = g.append('circle')
                    .attr('class', 'progress-dot teamwork-dot')
                    .attr('cx', startPosition[0])
                    .attr('cy', startPosition[1] - (teamworkValue === 0 ? 0 : 50)) // No drop if at center
                    .attr('r', 0)
                    .attr('fill', '#BF60DB')
                    .attr('stroke', '#9645AD')
                    .attr('stroke-width', 3)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                if (teamworkValue === 0) {
                    // Simple fade-in at center when typing
                teamworkDot
                    .transition()
                        .duration(400)
                        .ease(d3.easeQuadOut)
                        .attr('opacity', 1)
                        .attr('r', 6);
            } else {
                    // Fancy drop-in animation with bounce for positioned dots
                teamworkDot
                    .transition()
                    .duration(800)
                        .ease(d3.easeQuadOut)
                        .attr('cy', teamworkPoint[1] + 10) // Drop down past target
                        .attr('opacity', 1)
                        .attr('r', 10) // Start larger
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('cy', teamworkPoint[1]) // Bounce to final position
                        .attr('r', 8); // Larger final size for better visibility
                }
            } else {
                // Move existing dot to new position with smooth animation
                teamworkDot
                    .transition('position-team')
                    .duration(500)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', teamworkPoint[0])
                    .attr('cy', teamworkPoint[1])
                    .attr('r', teamworkValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect for Teamwork
            if (isTypingTeamwork && teamworkFocusCount > 0) {
                const addTeamworkTypingAnimation = () => {
                    if (isTypingTeamwork && teamworkFocusCount > 0) { // Still typing
                        // Get current actual position of the teamwork dot
                        const currentX = parseFloat(teamworkDot.attr('cx'));
                        const currentY = parseFloat(teamworkDot.attr('cy'));

                        // Create expanding ring effect at dot's current position
                        const ring = g.append('circle')
                            .attr('class', 'teamwork-typing-ring')
                            .attr('cx', currentX)
                            .attr('cy', currentY)
                            .attr('r', 6)
                            .attr('fill', 'none')
                            .attr('stroke', '#8e44ad')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0.8);

                        ring.transition()
                            .duration(800)
                            .ease(d3.easeQuadOut)
                            .attr('r', 25)
                            .attr('opacity', 0)
                            .on('end', function() {
                                ring.remove();
                            });

                        // Dot reaction animation - separate transition name to avoid cancelling movement
                        teamworkDot
                            .transition('pulse-team')
                            .duration(200)
                            .ease(d3.easeQuadOut)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(600)
                            .ease(d3.easeBackOut)
                            .attr('r', 8)
                            .attr('opacity', 1)
                            .on('end', () => {
                                if (isTypingTeamwork && teamworkFocusCount > 0) {
                                    setTimeout(addTeamworkTypingAnimation, 300);
                                }
                            });
                    }
                };
                addTeamworkTypingAnimation();
        } else {
                // Not typing: remove any teamwork rings and stop pulse
                g.selectAll('.teamwork-typing-ring').remove();
                if (!teamworkDot.empty()) {
                    (teamworkDot as any).interrupt('pulse-team');
                }
            }
        } else {
            // Safely remove teamwork dot if no work experience data and not typing
            const teamworkDotsToRemove = g.selectAll('.teamwork-dot');
            safeRemove(teamworkDotsToRemove);
        }

        // Create comprehensive shape that uses exact dot positions from rendered dots
        // Collect all visible dot positions by reading actual positions from DOM
        const dotPositions: { point: [number, number], index: number }[] = [];

        // Include Background (index 0) only if it should be shown - use exact same position
        if (shouldShowBackground) {
            dotPositions.push({ point: backgroundPoint, index: 0 });
        }
        
        // Include Job Match (index 5) only if it should be shown - use exact same position
        if (shouldShowJobMatch) {
            dotPositions.push({ point: jobMatchPoint, index: 5 });
        }

        // Include Education dot if it's being shown - use exact same position
        if (shouldShowEducationDot) {
            // Calculate education dot position using same logic as main calculation
            let educationValue = 0;
        if (hasEducationData) {
                educationValue = filledEducationFields.length * 2;
            }
            const educationLevel = educationValue / maxValue;
            const educationAngle = angleSlice * 1 - Math.PI / 2;
            const educationRadius = educationLevel * radius;
            const educationPoint: [number, number] = [
                Math.cos(educationAngle) * educationRadius,
                Math.sin(educationAngle) * educationRadius
            ];
            dotPositions.push({ point: educationPoint, index: 1 });
        }

        // Include Professional dot if it's being shown - use exact same position
        if (shouldShowProfessionalDot) {
            // Calculate Professional dot position using same logic as main calculation
            let professionalValue = 0;
            if (hasWorkExperienceData) {
                professionalValue = Math.min(filledWorkExperienceFields.length * 2, 10);
            }
            const professionalLevel = professionalValue / maxValue;
            const professionalAngle = angleSlice * 2 - Math.PI / 2;
            const professionalRadius = professionalLevel * radius;
            const professionalPoint: [number, number] = [
                Math.cos(professionalAngle) * professionalRadius,
                Math.sin(professionalAngle) * professionalRadius
            ];
            dotPositions.push({ point: professionalPoint, index: 2 });
        }

        // Include Tech Skills dot if it's being shown - use exact same position
        if (shouldShowTechSkillsDot) {
            // Calculate TechSkills dot position using same logic as main calculation
            let techSkillsValue = 0;
            const completedSkillsFieldCount = filledSkillsFields.length;
            if (completedSkillsFieldCount > 0) {
                techSkillsValue = Math.min(completedSkillsFieldCount * 2, 10);
            }
            const techSkillsLevel = techSkillsValue / maxValue;
            const techSkillsAngle = angleSlice * 3 - Math.PI / 2;
            const techSkillsRadius = techSkillsLevel * radius;
            const techSkillsPoint: [number, number] = [
                Math.cos(techSkillsAngle) * techSkillsRadius,
                Math.sin(techSkillsAngle) * techSkillsRadius
            ];
            dotPositions.push({ point: techSkillsPoint, index: 3 });
        }

        // Include Teamwork dot if it's being shown - use exact same position
        if (shouldShowTeamworkDot) {
            // Calculate Teamwork dot position using same logic as main calculation
            let teamworkValue = 0;
        if (hasWorkExperienceData) {
                teamworkValue = Math.min(filledWorkExperienceFields.length * 2, 10);
            }
            const teamworkLevel = teamworkValue / maxValue;
            const teamworkAngle = angleSlice * 4 - Math.PI / 2;
            const teamworkRadius = teamworkLevel * radius;
            const teamworkPoint: [number, number] = [
                Math.cos(teamworkAngle) * teamworkRadius,
                Math.sin(teamworkAngle) * teamworkRadius
            ];
            dotPositions.push({ point: teamworkPoint, index: 4 });
        }


        // Sort dots by their hexagon index to maintain proper order
        dotPositions.sort((a, b) => a.index - b.index);

        // Extract the points in correct order
        const orderedDotPoints = dotPositions.map(dp => dp.point);

        // Create shape that connects all dots and encloses center area
        let shapePoints: [number, number][];

        if (orderedDotPoints.length === 0) {
            // No dots, create small triangle at center
            shapePoints = [
                [0, 0],
                [10, 0],
                [5, 10]
            ];
        } else if (orderedDotPoints.length === 1) {
            // With only 1 dot, create a triangle using the dot + center point
            shapePoints = [
                [0, 0], // Center point
                orderedDotPoints[0],
                [orderedDotPoints[0][0] * 0.5, orderedDotPoints[0][1] * 0.5] // Midpoint
            ];
        } else if (orderedDotPoints.length === 2) {
            // With only 2 dots, create a triangle using the 2 dots + center point
            shapePoints = [
                [0, 0], // Center point
                orderedDotPoints[0],
                orderedDotPoints[1]
            ];
        } else {
            // With 3+ dots, create a proper polygon connecting all dots
            // This naturally encloses the center area and defines the shape by the dots
            shapePoints = orderedDotPoints;
        }

        // Create line generator for the shape
        const line = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveLinearClosed);

        // Always create/update the shape when there are dots to connect
        if (orderedDotPoints.length > 0) {
        // Update existing shape or create new one
        let progressShape = g.select<SVGPathElement>('.progress-triangle');

        if (progressShape.empty()) {
                    // Create shape for the first time - insert at beginning so it stays behind dots
                    progressShape = g.insert('path', ':first-child')
                .attr('class', 'progress-triangle')
                        .attr('fill', 'url(#capabilityGradient)')
                    .attr('stroke', '#7E59B3')
                        .attr('stroke-width', 2)
                        .attr('stroke-opacity', 1)
                    .attr('opacity', currentStep === 6 ? 0.6 : 0.8)
                .style('transform', 'scale(0)')
                .style('transform-origin', '0px 0px'); // Center at origin since g is translated

                    // Initial appearance animation - show immediately when dots appear
            progressShape
                .datum(shapePoints)
                .attr('d', line)
                .transition()
                        .duration(400)
                        .delay(100)
                .ease(d3.easeBackOut.overshoot(1.1))
                        .attr('opacity', currentStep === 6 ? 0.6 : 0.8)
                .style('transform', 'scale(1)');
        } else {
            // Smoothly transition existing shape to new configuration
            progressShape
                .datum(shapePoints)
                .transition()
                        .duration(400)
                .ease(d3.easeQuadInOut)
                .attr('d', line)
                    .attr('stroke', '#7E59B3')
                    .attr('stroke-width', 3)
                    .attr('stroke-opacity', 1)
                    .attr('opacity', currentStep === 6 ? 0.6 : 0.8);
                }
        } else {
            // No dots visible, hide the progress shape
            const progressShape = g.select<SVGPathElement>('.progress-triangle');
            if (!progressShape.empty()) {
                progressShape
                    .transition()
                    .duration(400)
                    .attr('opacity', 0.8)
                    .style('transform', 'scale(0)')
                    .on('end', function() {
                        progressShape.remove();
                    });
            }
        }

        // Draw Resume Power shape if resume analysis data is available
        if (resumeAnalysisData && resumeAnalysisData.analysis) {
            const analysis = resumeAnalysisData.analysis;
            
            // Get scores for each axis (1-10 scale, convert to 0-1 for radius calculation)
            const backgroundScore = (analysis.background_score || 1) / 10;
            const educationScore = (analysis.education_score || 1) / 10;
            const professionalScore = (analysis.professional_score || 1) / 10;
            const techSkillsScore = (analysis.technical_skills_score || 1) / 10;
            const teamworkScore = (analysis.teamwork_score || 1) / 10;
            const overallScore = (analysis.overall_score || 1) / 10;
            
            // Calculate positions for each axis
            const resumePowerPoints: [number, number][] = [];
            
            // Background (index 0)
            const backgroundAngle = angleSlice * 0 - Math.PI / 2;
            resumePowerPoints.push([
                Math.cos(backgroundAngle) * radius * backgroundScore,
                Math.sin(backgroundAngle) * radius * backgroundScore
            ]);
            
            // Education (index 1)
            const educationAngle = angleSlice * 1 - Math.PI / 2;
            resumePowerPoints.push([
                Math.cos(educationAngle) * radius * educationScore,
                Math.sin(educationAngle) * radius * educationScore
            ]);
            
            // Professional (index 2)
            const professionalAngle = angleSlice * 2 - Math.PI / 2;
            resumePowerPoints.push([
                Math.cos(professionalAngle) * radius * professionalScore,
                Math.sin(professionalAngle) * radius * professionalScore
            ]);
            
            // Tech Skills (index 3)
            const techSkillsAngle = angleSlice * 3 - Math.PI / 2;
            resumePowerPoints.push([
                Math.cos(techSkillsAngle) * radius * techSkillsScore,
                Math.sin(techSkillsAngle) * radius * techSkillsScore
            ]);
            
            // Teamwork (index 4)
            const teamworkAngle = angleSlice * 4 - Math.PI / 2;
            resumePowerPoints.push([
                Math.cos(teamworkAngle) * radius * teamworkScore,
                Math.sin(teamworkAngle) * radius * teamworkScore
            ]);
            
            // Job Match (index 5) - use overall score
            const jobMatchAngle = angleSlice * 5 - Math.PI / 2;
            resumePowerPoints.push([
                Math.cos(jobMatchAngle) * radius * overallScore,
                Math.sin(jobMatchAngle) * radius * overallScore
            ]);
            
            // Create line generator for closed shape
            const resumePowerLine = d3.line<[number, number]>()
                .x(d => d[0])
                .y(d => d[1])
                .curve(d3.curveLinearClosed);
            
            // Remove existing resume power shape
            g.selectAll('.resume-power-shape').remove();
            
            // Draw the resume power shape
            g.append('path')
                .attr('class', 'resume-power-shape')
                .datum(resumePowerPoints)
                .attr('d', resumePowerLine)
                .attr('fill', 'url(#resumeGradient)')
                .attr('stroke', '#D94A4A')
                .attr('stroke-width', 2)
                .attr('opacity', 0.9)
                .style('filter', 'drop-shadow(0 6px 14px rgba(217,74,74,0.25))');
                
            console.log('Resume Power shape drawn with scores:', {
                background: analysis.background_score,
                education: analysis.education_score,
                professional: analysis.professional_score,
                techSkills: analysis.technical_skills_score,
                teamwork: analysis.teamwork_score,
                overall: analysis.overall_score
            });
        } else {
            // Remove resume power shape if no data
            g.selectAll('.resume-power-shape').remove();
        }

        // Static dots - no pulsing animation
    };

    const repaintProgressShapeWithCapabilityScores = (scores: {
        background: number;
        education: number;
        professional: number;
        techSkills: number;
        teamwork: number;
        jobMatch: number;
    }) => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        const g = svg.select('.chart-group');

        // Use the same coordinate system as the existing chart
        const labels = ['Background', 'Education', 'Professional', 'Tech Skills', 'Teamwork', 'Job Match'];
        const maxValue = 10;
        const radius = 180;
        const angleSlice = (Math.PI * 2) / labels.length;

        // Calculate positions for each axis using the same system as existing chart
        const backgroundAngle = angleSlice * 0 - Math.PI / 2;
        const educationAngle = angleSlice * 1 - Math.PI / 2;
        const professionalAngle = angleSlice * 2 - Math.PI / 2;
        const techSkillsAngle = angleSlice * 3 - Math.PI / 2;
        const teamworkAngle = angleSlice * 4 - Math.PI / 2;
        const jobMatchAngle = angleSlice * 5 - Math.PI / 2;

        // Convert scores to radius values (scores are 1-10, map to 0-180 radius)
        const backgroundRadius = (scores.background / maxValue) * radius;
        const educationRadius = (scores.education / maxValue) * radius;
        const professionalRadius = (scores.professional / maxValue) * radius;
        const techSkillsRadius = (scores.techSkills / maxValue) * radius;
        const teamworkRadius = (scores.teamwork / maxValue) * radius;
        const jobMatchRadius = (scores.jobMatch / maxValue) * radius;

        // Calculate positions for each point
        const backgroundPoint: [number, number] = [
            Math.cos(backgroundAngle) * backgroundRadius,
            Math.sin(backgroundAngle) * backgroundRadius
        ];
        const educationPoint: [number, number] = [
            Math.cos(educationAngle) * educationRadius,
            Math.sin(educationAngle) * educationRadius
        ];
        const professionalPoint: [number, number] = [
            Math.cos(professionalAngle) * professionalRadius,
            Math.sin(professionalAngle) * professionalRadius
        ];
        const techSkillsPoint: [number, number] = [
            Math.cos(techSkillsAngle) * techSkillsRadius,
            Math.sin(techSkillsAngle) * techSkillsRadius
        ];
        const teamworkPoint: [number, number] = [
            Math.cos(teamworkAngle) * teamworkRadius,
            Math.sin(teamworkAngle) * teamworkRadius
        ];
        const jobMatchPoint: [number, number] = [
            Math.cos(jobMatchAngle) * jobMatchRadius,
            Math.sin(jobMatchAngle) * jobMatchRadius
        ];

        // Create progress shape points in the correct order
        const progressPoints = [
            backgroundPoint,
            educationPoint,
            professionalPoint,
            techSkillsPoint,
            teamworkPoint,
            jobMatchPoint
        ];

        // Remove existing progress shape
        g.selectAll('.progress-triangle').remove();

        // Create the progress shape line generator
        const progressLine = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveLinearClosed);

        // Draw the new progress shape with capability scores using exact same styling as existing progress shape
        g.append('path')
            .attr('class', 'progress-triangle')
            .datum(progressPoints)
            .attr('d', progressLine as any)
            .attr('fill', 'url(#capabilityGradient)')
            .attr('stroke', '#7E59B3')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1)
            .attr('opacity', 0.6);

        console.log('Progress shape repainted with capability scores:', scores);
        console.log('Progress points:', progressPoints);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Track typing in basic info fields
        const basicInfoFields = ['firstName', 'lastName', 'email', 'phoneNumber'];
        if (basicInfoFields.includes(field)) {
            setIsTypingBasicInfo(true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing animation after 1 second of no typing
            typingTimeoutRef.current = setTimeout(() => {
                setIsTypingBasicInfo(false);
            }, 1000);
        }

        // Track typing in education fields
        const educationFields = ['collegeName', 'degree', 'major', 'graduationYear'];
        if (educationFields.includes(field)) {
            setIsTypingEducation(true);

            // Clear existing timeout
            if (educationTypingTimeoutRef.current) {
                clearTimeout(educationTypingTimeoutRef.current);
            }

            // Set new timeout to stop typing animation after 1 second of no typing
            educationTypingTimeoutRef.current = setTimeout(() => {
                setIsTypingEducation(false);
            }, 1000);
        }

        // Track typing in JobMatch fields (education, skills, and work experience fields)
        const jobMatchFields = ['collegeName', 'degree', 'major', 'graduationYear', 'programmingLanguages', 'frameworks', 'databases', 'tools'];
        const isJobMatchWorkExperienceField = field.startsWith('workExperience_') || ['companyName', 'jobTitle', 'employedYears'].some(f => field.includes(f));
        
        if (jobMatchFields.includes(field) || isJobMatchWorkExperienceField) {
            setIsTypingJobMatch(true);

            // Clear existing timeout
            if (jobMatchTypingTimeoutRef.current) {
                clearTimeout(jobMatchTypingTimeoutRef.current);
            }

            // Set new timeout to stop typing animation after 1 second of no typing
            jobMatchTypingTimeoutRef.current = setTimeout(() => {
                setIsTypingJobMatch(false);
            }, 1000);
        }

        // Track typing in TechSkills fields (skills only)
        const techSkillsFields = ['programmingLanguages', 'frameworks', 'databases', 'tools'];
        
        if (techSkillsFields.includes(field)) {
            setIsTypingTechSkills(true);

            // Clear existing timeout
            if (techSkillsTypingTimeoutRef.current) {
                clearTimeout(techSkillsTypingTimeoutRef.current);
            }

            // Set new timeout to stop typing animation after 1 second of no typing
            techSkillsTypingTimeoutRef.current = setTimeout(() => {
                setIsTypingTechSkills(false);
            }, 1000);
        }

        // Track typing in Professional fields (only work experience)
        const isProfessionalWorkExperienceField = field.startsWith('workExperience_') || ['companyName', 'jobTitle', 'employedYears'].some(f => field.includes(f));
        
        if (isProfessionalWorkExperienceField) {
            setIsTypingProfessional(true);

            // Clear existing timeout
            if (professionalTypingTimeoutRef.current) {
                clearTimeout(professionalTypingTimeoutRef.current);
            }

            // Set new timeout to stop typing animation after 1 second of no typing
            professionalTypingTimeoutRef.current = setTimeout(() => {
                setIsTypingProfessional(false);
            }, 1000);
        }

        // Track typing in Teamwork fields (work experience - same as Professional)
        const isTeamworkWorkExperienceField = field.startsWith('workExperience_') || ['companyName', 'jobTitle', 'employedYears'].some(f => field.includes(f));
        
        if (isTeamworkWorkExperienceField) {
            setIsTypingTeamwork(true);

            // Clear existing timeout
            if (teamworkTypingTimeoutRef.current) {
                clearTimeout(teamworkTypingTimeoutRef.current);
            }

            // Set new timeout to stop typing animation after 1 second of no typing
            teamworkTypingTimeoutRef.current = setTimeout(() => {
                setIsTypingTeamwork(false);
            }, 1000);
        }
    };


    // Specialized handlers for basic info fields (firstName, lastName, email, phoneNumber)
    const handleBasicInfoFocus = () => {
        setBasicInfoFocusCount(count => count + 1);
        setIsTypingBasicInfo(true);
    };

    const handleBasicInfoBlur = () => {
        setBasicInfoFocusCount(count => Math.max(0, count - 1));
        setIsTypingBasicInfo(false);
        // Ensure immediate position update on blur
        // Defer to next frame to allow state to flush before recalculating
        requestAnimationFrame(() => {
            if (svgRef.current) {
                updateChartWithFormData();
            }
        });
    };

    // Specialized handlers for education fields (collegeName, degree, major, graduationYear)
    const handleEducationFocus = () => {
        setEducationFocusCount(count => count + 1);
        setIsTypingEducation(true);
        
        // Clear existing timeout
        if (educationTypingTimeoutRef.current) {
            clearTimeout(educationTypingTimeoutRef.current);
        }
    };

    const handleEducationBlur = () => {
        setEducationFocusCount(count => Math.max(0, count - 1));
        setIsTypingEducation(false);
        // Force an immediate dot recompute so EducationDot moves on blur
        requestAnimationFrame(() => {
            if (svgRef.current) {
                updateChartWithFormData();
            }
        });
    };

    // Specialized handlers for JobMatch fields (education, skills, work experience)
    const handleJobMatchFocus = () => {
        setJobMatchFocusCount(count => count + 1);
        setIsTypingJobMatch(true);
        
        // Clear existing timeout
        if (jobMatchTypingTimeoutRef.current) {
            clearTimeout(jobMatchTypingTimeoutRef.current);
        }
    };

    const handleJobMatchBlur = () => {
        setJobMatchFocusCount(count => Math.max(0, count - 1));
        setIsTypingJobMatch(false);
        // Force immediate recompute so JobMatchDot moves on blur
        requestAnimationFrame(() => {
            if (svgRef.current) {
                updateChartWithFormData();
            }
        });
    };

    // Specialized handlers for TechSkills fields (programmingLanguages, frameworks, databases, tools)
    const handleTechSkillsFocus = () => {
        setTechSkillsFocusCount(count => count + 1);
        setIsTypingTechSkills(true);
        
        // Clear existing timeout
        if (techSkillsTypingTimeoutRef.current) {
            clearTimeout(techSkillsTypingTimeoutRef.current);
        }
    };

    const handleTechSkillsBlur = () => {
        setTechSkillsFocusCount(count => Math.max(0, count - 1));
        setIsTypingTechSkills(false);
        // Force immediate recompute so TechSkillsDot moves on blur
        requestAnimationFrame(() => {
            if (svgRef.current) {
                updateChartWithFormData();
            }
        });
    };

    // Specialized handlers for Professional fields (education, skills, work experience)
    const handleProfessionalFocus = () => {
        setProfessionalFocusCount(count => count + 1);
        setIsTypingProfessional(true);
        
        // Clear existing timeout
        if (professionalTypingTimeoutRef.current) {
            clearTimeout(professionalTypingTimeoutRef.current);
        }
    };

    const handleProfessionalBlur = () => {
        setProfessionalFocusCount(count => Math.max(0, count - 1));
        setIsTypingProfessional(false);
        // Force immediate recompute so ProfessionalDot moves on blur
        requestAnimationFrame(() => {
            if (svgRef.current) {
                updateChartWithFormData();
            }
        });
    };

    // Specialized handlers for Teamwork fields (work experience)
    const handleTeamworkFocus = () => {
        setTeamworkFocusCount(count => count + 1);
        setIsTypingTeamwork(true);
        
        // Clear existing timeout
        if (teamworkTypingTimeoutRef.current) {
            clearTimeout(teamworkTypingTimeoutRef.current);
        }
    };

    const handleTeamworkBlur = () => {
        setTeamworkFocusCount(count => Math.max(0, count - 1));
        setIsTypingTeamwork(false);
        // Force immediate recompute so TeamworkDot moves on blur
        requestAnimationFrame(() => {
            if (svgRef.current) {
                updateChartWithFormData();
            }
        });
    };

    // Handle work experience input changes
    const handleWorkExperienceChange = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newWorkExperiences = [...prev.workExperiences];
            newWorkExperiences[index] = {
                ...newWorkExperiences[index],
                [field]: value
            };
            return {
                ...prev,
                workExperiences: newWorkExperiences
            };
        });
    };

    // Add new work experience entry (maximum 4 entries)
    const addWorkExperience = () => {
        if (formData.workExperiences.length < 4) {
            setFormData(prev => ({
                ...prev,
                workExperiences: [
                    ...prev.workExperiences,
                    {
                        companyName: '',
                        jobTitle: '',
                        employedYears: ''
                    }
                ]
            }));
            
            // Trigger height update after adding work experience row
            setTimeout(() => {
                sendHeightToParent(true);
            }, 200);
        }
    };

    // Remove work experience entry
    const removeWorkExperience = (index: number) => {
        if (formData.workExperiences.length > 1) {
            setFormData(prev => ({
                ...prev,
                workExperiences: prev.workExperiences.filter((_, i) => i !== index)
            }));
            
            // Trigger height update after removing work experience row
            setTimeout(() => {
                sendHeightToParent(true);
            }, 200);
        }
    };


    //const handleNext = () => {icoico original
    const handleNext = () => {
        if (currentStep < 6) {
            // Interrupt transitions first so we don't cancel the movement we trigger below
            if (svgRef.current) {
                const svg = d3.select(svgRef.current);
                svg.selectAll('*').interrupt();
            }

            // Clear typing/focus and force recompute so backgroundDot moves before step change
            setIsTypingBasicInfo(false);
            setBasicInfoFocusCount(0);
            if (svgRef.current) {
                requestAnimationFrame(() => {
                    updateChartWithFormData();
                });
            }

            // Validate Background page required fields before leaving step 1
            if (currentStep === 1) {
                const errors: { [key: string]: boolean } = {};
                const errorHints: { [key: string]: string } = {};
                const requiredFields: Array<{ key: string; value: string }> = [
                    { key: 'targetJob', value: (targetJob || '').trim() },
                    { key: 'firstName', value: (formData.firstName || '').trim() },
                    { key: 'lastName', value: (formData.lastName || '').trim() },
                    { key: 'email', value: (formData.email || '').trim() },
                ];
                requiredFields.forEach(({ key, value }) => {
                    if (!value) errors[key] = true;
                });
                // Format checks
                if (!errors['email'] && formData.email && !isValidEmail(formData.email.trim())) {
                    errors['email'] = true;
                    errorHints['email'] = 'Please enter a valid email address (e.g., name@example.com).';
                }
                // Phone number format check (only if provided)
                if (formData.phoneNumber && !isValidPhone(formData.phoneNumber.trim())) {
                    errors['phoneNumber'] = true;
                    errorHints['phoneNumber'] = 'Please enter a valid phone number with at least 10 digits.';
                }
                if (Object.keys(errors).length > 0) {
                    setBgErrors(errors);
                    setBgErrorHints(errorHints);
                    //setBgErrorMessage('Please fix the highlighted fields before continuing.');
                    // Do not proceed to next step
                    return;
                } else {
                    // Clear previous errors
                    if (Object.keys(bgErrors).length > 0) {
                        setBgErrors({});
                        setBgErrorMessage('');
                        setBgErrorHints({});
                    }
                }

                //icoico
                // Call alpha_target_job_analysis API when moving from step 1 to step 2 (asynchronously)
                // Calculate user_id based on email address
                const email = formData.email || '';
                const user_id = email.replace(/[^a-zA-Z0-9]/g, '_');
                
                // Cache the user_id for later use
                localStorage.setItem('jobAnalysisUserId', user_id);
                console.log('Generated and cached user_id:', user_id);
                
                // Start the API call but don't wait for it - let it run in the background
                (async () => {
                    try {
                        console.log('Calling alpha_target_job_analysis API asynchronously...');
                        
                        const formDataToSend = new FormData();
                        formDataToSend.append('target_job', targetJob);
                        formDataToSend.append('form_data', JSON.stringify(formData));
                        formDataToSend.append('user_id', user_id);
                        
                        const response = await fetch(`${API_ENDPOINT}/alpha_target_job_analysis`, {
                            method: 'POST',
                            //headers: {
                            //    'Content-Type': 'application/json',
                            //},
                            body: formDataToSend,
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            console.log('Job analysis completed:', result);
                        } else {
                            console.error('Job analysis failed:', response.statusText);
                        }
                    } catch (error) {
                        console.error('Error calling alpha_target_job_analysis API:', error);
                    }
                })(); // Immediately invoke the async function
            }

            // Validate Education page required fields before leaving step 2
            if (currentStep === 2) {
                const errors: { [key: string]: boolean } = {};
                const { collegeName, degree, major } = formData as any;
                if (!String(collegeName || '').trim()) errors['collegeName'] = true;
                if (!String(degree || '').trim()) errors['degree'] = true;
                if (!String(major || '').trim()) errors['major'] = true;
                if (Object.keys(errors).length > 0) {
                    setEduErrors(errors);
                    setEduErrorMessage('Please fill out all required Education fields.');
                    return;
                } else {
                    if (Object.keys(eduErrors).length > 0) {
                        setEduErrors({});
                        setEduErrorMessage('');
                    }
                }
            }

            // Skills page has no required fields - no validation needed

            // Work page has no required fields, so no validation needed for step 4

            // Call alpha_capability_analysis API when moving from step 4 (Work Experience) to step 5
            if (currentStep === 4) {
                // Get cached user_id
                const user_id = localStorage.getItem('jobAnalysisUserId');
                
                if (user_id) {
                    // Start the API call but don't wait for it - let it run in the background
                    (async () => {
                        try {
                            console.log('Calling alpha_capability_analysis API asynchronously...');
                            
                            const formDataToSend = new FormData();
                            formDataToSend.append('target_job', targetJob);
                            formDataToSend.append('form_data', JSON.stringify(formData));
                            formDataToSend.append('user_id', user_id);
                            
                            const response = await fetch(`${API_ENDPOINT}/alpha_capability_analysis`, {
                                method: 'POST',
                                //headers: {
                                //    'Content-Type': 'application/json',
                                //},
                                body: formDataToSend,
                            });
                            
                            if (response.ok) {
                                const result = await response.json();
                                console.log('Ambit Alpha analysis completed:', result);
                            } else {
                                console.error('Alpha Capability analysis failed:', response.statusText);
                            }
                        } catch (error) {
                            console.error('Error calling alpha_capability_analysis API:', error);
                        }
                    })(); // Immediately invoke the async function
                } else {
                    console.warn('No user_id found in localStorage for alpha_capability_analysis call');
                }
            }
            //icoico

            setCurrentStep(currentStep + 1);
        }
    };

    // Handle Resume Analysis
    const handleResumeAnalysis = async () => {
        // Validate resume page: require resume file and an email
        if (!resumeFile) {
            setResumeErrorMessage('Please upload a resume file (PDF preferred) before analysis.');
            return;
        }
        if (!formData.email || !isValidEmail(formData.email.trim())) {
            setBgErrors(prev => ({ ...prev, email: true }));
            setBgErrorHints(prev => ({ ...prev, email: 'Please enter a valid email address before analysis.' }));
            //setBgErrorMessage('Please fix the highlighted fields before continuing.');
            return;
        }
        setResumeErrorMessage('');
        // Initialize variables outside try block
        let postSucceeded = false;
        let user_id = '';
        
        try {
            setIsAnalyzing(true); // Start thinking animation
            console.log('Sending data to Resume Analysis API...');
            
            // Get cached user_id
            user_id = localStorage.getItem('jobAnalysisUserId') || '';
            if (!user_id) {
                alert('No user ID found. Please complete the job analysis first.');
                setIsAnalyzing(false);
                return;
            }
            
            // Create FormData to handle file upload
            const formDataToSend = new FormData();
            formDataToSend.append('form_data', JSON.stringify(formData));
            formDataToSend.append('user_id', user_id);
            
            // Add resume file (required for resume analysis)
            if (resumeFile) {
                formDataToSend.append('resume_file', resumeFile);
                console.log('Including resume file:', resumeFile.name, resumeFile.size, 'bytes');
            } else {
                alert('Please upload a resume file to proceed with analysis.');
                setIsAnalyzing(false);
                return;
            }

            // Helper: fetch with timeout
            const fetchWithTimeout = async (resource: RequestInfo, options: RequestInit & { timeout?: number }) => {
                const { timeout = 35000, ...rest } = options || {} as any;
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);
                try {
                    const res = await fetch(resource as any, { ...rest, signal: controller.signal });
                    return res;
                } finally {
                    clearTimeout(id);
                }
            };

            // Try POST with a 25s timeout to avoid API Gateway 29s cutoff
            try {
                const response = await fetchWithTimeout(`${API_ENDPOINT}/alpha_resume_analysis`, {
                    method: 'POST',
                    body: formDataToSend,
                    timeout: 25000
                } as any);
                if (response.ok) {
                    const result = await response.json();
                    console.log('Resume analysis successful:', result);
                    setAnalysisResult(result);
                    if (result.resume_analysis) {
                        setResumeAnalysisData(result.resume_analysis);
                        console.log('Resume analysis data stored:', result.resume_analysis);
                    }
                    if (result.capability_analysis) {
                        console.log('Capability analysis data received:', result.capability_analysis);
                        const capabilityData = result.capability_analysis;
                        const scores = {
                            background: capabilityData.background_score?.score || 0,
                            education: capabilityData.education_score?.score || 0,
                            professional: capabilityData.professional_score?.score || 0,
                            techSkills: capabilityData.tech_skills_score?.score || 0,
                            teamwork: capabilityData.teamwork_score?.score || 0,
                            jobMatch: capabilityData.job_match_score?.score || 0
                        };
                        console.log('Capability scores extracted:', scores);
                        setTimeout(() => {
                            if (svgRef.current) {
                                repaintProgressShapeWithCapabilityScores(scores);
                            }
                        }, 200);
                    }
                    setCurrentStep(6);
                    postSucceeded = true;
                } else {
                    console.error('Resume analysis request returned non-OK:', response.status, response.statusText);
                }
            } catch (err) {
                console.warn('POST alpha_resume_analysis timed out or failed, switching to polling...', err);
            }

            // If POST didn't succeed (likely API GW timeout), poll for results saved by the backend
            if (!postSucceeded) {
                const maxPolls = 40; // ~2 minutes at 3s interval
                const intervalMs = 3000;
                let attempt = 0;
                while (attempt < maxPolls) {
                    attempt += 1;
                    try {
                        const res = await fetch(`${API_ENDPOINT}/get_job_analysis/${encodeURIComponent(user_id)}`);
                        if (res.ok) {
                            const data = await res.json();
                            const item = data && (data.analysis_data || data);
                            const hasResume = item && item.resume_analysis && item.resume_analysis.analysis;
                            if (hasResume) {
                                // Construct a result compatible with existing UI expectations
                                const constructedResult: any = {
                                    resume_analysis: item.resume_analysis,
                                    capability_analysis: item.capability_analysis || null,
                                    job_analysis: { analysis: item.job_analysis || {} }
                                };
                                console.log('Polled analysis ready:', constructedResult);
                                setAnalysisResult(constructedResult);
                                if (constructedResult.resume_analysis) {
                                    setResumeAnalysisData(constructedResult.resume_analysis);
                                }
                                if (constructedResult.capability_analysis) {
                                    const capabilityData = constructedResult.capability_analysis;
                                    const scores = {
                                        background: capabilityData.background_score?.score || 0,
                                        education: capabilityData.education_score?.score || 0,
                                        professional: capabilityData.professional_score?.score || 0,
                                        techSkills: capabilityData.tech_skills_score?.score || 0,
                                        teamwork: capabilityData.teamwork_score?.score || 0,
                                        jobMatch: capabilityData.job_match_score?.score || 0
                                    };
                                    setTimeout(() => {
                                        if (svgRef.current) {
                                            repaintProgressShapeWithCapabilityScores(scores);
                                        }
                                    }, 200);
                                }
                                setCurrentStep(6);
                                setIsAnalyzing(false); // Stop analyzing when results are found
                                break;
                            }
                        }
                    } catch (pollErr) {
                        console.warn('Polling attempt failed:', pollErr);
                    }
                    await new Promise(resolve => setTimeout(resolve, intervalMs));
                }
                // If we exhausted polling without success, show a friendly message and stop analyzing
                if (attempt >= maxPolls) {
                    alert('The analysis is taking longer than usual. Please keep this page open and try again in a moment.');
                    setIsAnalyzing(false);
                }
            }
        } catch (error) {
            console.error('Error calling Resume Analysis API:', error);
            // Don't show error popup - let the polling handle it gracefully
            // The analyzing state will continue until polling succeeds or times out
        } finally {
            // Only stop analyzing if POST succeeded or if we're not in polling mode
            if (postSucceeded) {
                setIsAnalyzing(false);
            }
            // If postSucceeded is false, keep analyzing state active for polling
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            // Interrupt any ongoing D3 transitions before step change
            if (svgRef.current) {
                const svg = d3.select(svgRef.current);
                svg.selectAll('*').interrupt();
            }

            setCurrentStep(currentStep - 1);
        }
    };

    // Resume upload handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert('File size must be less than 2MB');
            return;
        }
        
        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/tiff',
            'image/bmp'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Unsupported file type. Please upload PDF formats.');
            return;
        }
        
        setResumeFile(file);
        
        // Trigger immediate height update for file upload
        setTimeout(() => {
            sendHeightToParent(true);
        }, 100);
    };

    const removeFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        // Trigger immediate height update for file removal
        setTimeout(() => {
            sendHeightToParent(true);
        }, 100);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const isImageFile = (mimeType: string): boolean => {
        return mimeType.startsWith('image/');
    };

    // Stable height tracking to prevent update loops
    const heightTracker = useRef({
        lastSentHeight: 0,
        lastCalculatedHeight: 0,
        updateCount: 0,
        isUpdating: false,
        isScrolling: false,
        scrollTimeout: null as NodeJS.Timeout | null
    });

    // Function to calculate and send page height to parent window (for iframe resizing)
    const sendHeightToParent = useCallback((forceUpdate = false) => {
        if (typeof window !== 'undefined' && window.parent !== window && !heightTracker.current.isUpdating && !heightTracker.current.isScrolling) {
            heightTracker.current.isUpdating = true;
            
            // Use a more stable height calculation that doesn't change during scrolling
            const bodyHeight = document.body.offsetHeight; // Use offsetHeight instead of scrollHeight
            const documentHeight = document.documentElement.offsetHeight;
            
            // Use the larger of the two to ensure we capture all content
            const contentHeight = Math.max(bodyHeight, documentHeight);
            
            // Add minimal padding only when needed
            const heightWithPadding = contentHeight + 30;
            
            // For file uploads, use a lower threshold and allow more updates
            const heightDifference = Math.abs(heightWithPadding - heightTracker.current.lastSentHeight);
            const isSignificantChange = forceUpdate ? heightDifference > 20 : heightDifference > 50;
            const hasNotExceededLimit = forceUpdate ? heightTracker.current.updateCount < 15 : heightTracker.current.updateCount < 10;
            
            if (isSignificantChange && hasNotExceededLimit) {
                heightTracker.current.lastSentHeight = heightWithPadding;
                heightTracker.current.updateCount++;
                
                // Send height to parent window
                window.parent.postMessage({
                    type: 'setHeight',
                    height: heightWithPadding
                }, '*');
            }
            
            // Reset update flag after a delay
            setTimeout(() => {
                heightTracker.current.isUpdating = false;
            }, forceUpdate ? 500 : 1000);
        }
    }, []);

    // Send height on component mount and when content changes (much more conservative)
    useEffect(() => {
        // Only send height on major step changes, not on every form data change
        const timer = setTimeout(() => {
            sendHeightToParent();
        }, 500); // Longer delay to ensure content is fully rendered

        return () => clearTimeout(timer);
    }, [currentStep, sendHeightToParent]); // Removed resumeFile and formData to reduce updates

    // Send height when window is resized (very conservative to prevent loops)
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;
        let lastResizeTime = 0;
        let lastWindowSize = { width: window.innerWidth, height: window.innerHeight };
        
        const handleResize = () => {
            const now = Date.now();
            const currentSize = { width: window.innerWidth, height: window.innerHeight };
            
            // Only handle resize if it's been more than 3 seconds since last resize
            // AND the size actually changed (not just iframe resizing)
            const sizeChanged = currentSize.width !== lastWindowSize.width || currentSize.height !== lastWindowSize.height;
            
            if (now - lastResizeTime > 3000 && sizeChanged) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    sendHeightToParent();
                    lastResizeTime = now;
                    lastWindowSize = currentSize;
                }, 1500); // Longer delay to prevent rapid updates
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [sendHeightToParent]);

    // Track scrolling to prevent height updates during scroll
    useEffect(() => {
        const handleScroll = () => {
            heightTracker.current.isScrolling = true;
            
            // Clear existing timeout
            if (heightTracker.current.scrollTimeout) {
                clearTimeout(heightTracker.current.scrollTimeout);
            }
            
            // Set scrolling to false after scroll ends
            heightTracker.current.scrollTimeout = setTimeout(() => {
                heightTracker.current.isScrolling = false;
            }, 150); // 150ms after scroll ends
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (heightTracker.current.scrollTimeout) {
                clearTimeout(heightTracker.current.scrollTimeout);
            }
        };
    }, []);

    // Send height when analysis completes (content changes) - very conservative
    useEffect(() => {
        if (analysisResult) {
            const timer = setTimeout(() => {
                sendHeightToParent();
            }, 1000); // Longer delay to allow content to fully render
            return () => clearTimeout(timer);
        }
    }, [analysisResult, sendHeightToParent]);

    // Send height when analysis starts (loading state changes) - very conservative
    useEffect(() => {
        if (isAnalyzing) {
            const timer = setTimeout(() => {
                sendHeightToParent();
            }, 500); // Longer delay to allow loading content to render
            return () => clearTimeout(timer);
        }
    }, [isAnalyzing, sendHeightToParent]);

    // Removed tips height updates to prevent excessive height changes during loading

    // Send height when resume file is uploaded or removed (important for mobile iframe)
    useEffect(() => {
        if (resumeFile !== null) { // This triggers for both upload and removal
            const timer = setTimeout(() => {
                sendHeightToParent(true); // Force update for file uploads
            }, 300); // Shorter delay for file uploads since they're important
            return () => clearTimeout(timer);
        }
    }, [resumeFile, sendHeightToParent]);

    // Send height when work experience entries are added or removed
    useEffect(() => {
        const timer = setTimeout(() => {
            sendHeightToParent(true); // Force update for work experience changes
        }, 300); // Delay to allow DOM to update
        return () => clearTimeout(timer);
    }, [formData.workExperiences.length, sendHeightToParent]);

    const progressBarElement = useMemo(() => <ProgressBar step={currentStep} />, [currentStep]);

    return (
        <div className={styles.container} style={{ backgroundColor: '#edece3' }}>
            <Head>
                <title>Resume Evaluation Assessment</title>
                <meta name="description" content="Interactive resume evaluation radar chart" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <style>{globalStyles}</style>
                <style>{`
                    body {
                        background: #edece3 !important;
                        background-color: #edece3 !important;
                        background-image: none !important;
                    }
                    
                    @keyframes gradientShift {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                    
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }
                `}</style>
            </Head>

            <main className={styles.main} style={{ backgroundColor: '#edece3' }}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title} style={{ 
                        backgroundColor: '#ffffff', 
                        marginBottom: 4, 
                        paddingBottom: 0,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: '"Playfair Display", "Georgia", serif',
                        fontWeight: 700,
                        fontSize: '2rem',
                        letterSpacing: '0.05em',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Ambit Alpha
                    </h1>
                    {progressBarElement}

                    <div className={styles.form}>
                        {currentStep === 1 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-1rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="400"
                                            height="400"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto'
                                            }}
                                            viewBox="0 0 400 400"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Fancy dots loading animation */}
                                            <g className="dots-loading-animation">
                                                {/* First dot - slightly lighter */}
                                                <circle cx="230" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Second dot - slightly darker */}
                                                <circle cx="250" cy="250" r="6" fill="#B8733A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Third dot - original color */}
                                                <circle cx="270" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Loading text with elegant font */}
                                                <text x="250" y="280" textAnchor="middle" fill="#CF844A" fontSize="20" fontWeight="400" fontFamily="'Playfair Display', 'Georgia', serif" opacity="0.9">
                                                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
                                                    Loading...
                                            </text>
                                            </g>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Personal Capability</span>
                                        </div>
                                        <div className={styles.legendItem} style={{ marginLeft: '20px' }}>
                                            <div className={styles.legendColor} style={{ background: '#ff6b6b', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Resume Power</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Background</h2>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="targetJob" className={styles.label}>
                                        Target Job Position(URL or JD) <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="targetJob"
                                        value={targetJob}
                                        onChange={(e) => setTargetJob(e.target.value)}
                                        onBlur={handleTargetJobBlur}
                                        className={styles.input}
                                        style={bgErrors['targetJob'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                        placeholder="Enter the job URL <https://www...>, or paste the job description"
                                    />
                                </div>

                                <div onBlurCapture={handleBasicInfoBlur}>
                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="firstName" className={styles.label}>
                                            First Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            onFocus={handleBasicInfoFocus}
                                            onBlur={handleBasicInfoBlur}
                                            className={styles.input}
                                            style={bgErrors['firstName'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Enter your first name"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="lastName" className={styles.label}>
                                            Last Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            onFocus={handleBasicInfoFocus}
                                            onBlur={handleBasicInfoBlur}
                                            className={styles.input}
                                            style={bgErrors['lastName'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer} style={{ marginTop: '-2.0rem' }}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="email" className={styles.label}>
                                            Email Address <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            onFocus={handleBasicInfoFocus}
                                            onBlur={handleBasicInfoBlur}
                                            className={styles.input}
                                            style={bgErrors['email'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Enter your email address"
                                        />
                                        {bgErrors['email'] && bgErrorHints['email'] && (
                                            <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '4px' }}>{bgErrorHints['email']}</div>
                                        )}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="phoneNumber" className={styles.label}>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            onFocus={handleBasicInfoFocus}
                                            onBlur={handleBasicInfoBlur}
                                            className={styles.input}
                                            style={bgErrors['phoneNumber'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Enter your phone number"
                                        />
                                        {bgErrors['phoneNumber'] && bgErrorHints['phoneNumber'] && (
                                            <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '4px' }}>{bgErrorHints['phoneNumber']}</div>
                                        )}
                                    </div>
                                    </div>
                                </div>

                                {bgErrorMessage && (
                                    <div style={{ color: '#DC2626', marginTop: '8px', marginBottom: '-4px', fontSize: '0.9rem' }}>
                                        {bgErrorMessage}
                                    </div>
                                )}
                                <div className={styles.navButtonsRight} style={{ marginTop: '-0.6rem' }}>
                                    <button 
                                        className={styles.submitButton}
                                        onClick={handleNext}
                                        disabled={!targetJob.trim()}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 2 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-1rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="400"
                                            height="400"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto'
                                            }}
                                            viewBox="0 0 400 400"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Fancy dots loading animation */}
                                            <g className="dots-loading-animation">
                                                {/* First dot - slightly lighter */}
                                                <circle cx="230" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Second dot - slightly darker */}
                                                <circle cx="250" cy="250" r="6" fill="#B8733A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Third dot - original color */}
                                                <circle cx="270" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Loading text with elegant font */}
                                                <text x="250" y="280" textAnchor="middle" fill="#CF844A" fontSize="20" fontWeight="400" fontFamily="'Playfair Display', 'Georgia', serif" opacity="0.9">
                                                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
                                                    Loading...
                                            </text>
                                            </g>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Personal Capability</span>
                                        </div>
                                        <div className={styles.legendItem} style={{ marginLeft: '20px' }}>
                                            <div className={styles.legendColor} style={{ background: '#ff6b6b', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Resume Power</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Education</h2>

                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="collegeName" className={styles.label}>
                                            College Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="collegeName"
                                            value={formData.collegeName}
                                            onChange={(e) => handleInputChange('collegeName', e.target.value)}
                                            onFocus={() => { handleEducationFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleEducationBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            style={eduErrors['collegeName'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Enter your most recent college name"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="degree" className={styles.label}>
                                            Degree <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="degree"
                                            value={formData.degree}
                                            onChange={(e) => handleInputChange('degree', e.target.value)}
                                            onFocus={() => { handleEducationFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleEducationBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            style={eduErrors['degree'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Bachelor's, Master's, PhD"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer} style={{ marginTop: '-1.4rem' }}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="major" className={styles.label}>
                                            Major <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="major"
                                            value={formData.major}
                                            onChange={(e) => handleInputChange('major', e.target.value)}
                                            onFocus={() => { handleEducationFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleEducationBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            style={eduErrors['major'] ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.2)' } : undefined}
                                            placeholder="Computer Science, Business Administration"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="graduationYear" className={styles.label}>
                                            Graduation Year
                                        </label>
                                        <input
                                            type="number"
                                            id="graduationYear"
                                            value={formData.graduationYear}
                                            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                                            onFocus={() => { handleEducationFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleEducationBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="e.g., 2025"
                                            min="2010"
                                            max="2035"
                                            step="1"
                                        />
                                    </div>
                                </div>
                                
                                {eduErrorMessage && (
                                    <div style={{ color: '#DC2626', marginTop: '8px', marginBottom: '-4px', fontSize: '0.9rem' }}>
                                        {eduErrorMessage}
                                    </div>
                                )}
                                <div className={styles.navButtons}>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleBack}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleNext}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 3 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-1rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="400"
                                            height="400"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto'
                                            }}
                                            viewBox="0 0 400 400"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Fancy dots loading animation */}
                                            <g className="dots-loading-animation">
                                                {/* First dot - slightly lighter */}
                                                <circle cx="230" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Second dot - slightly darker */}
                                                <circle cx="250" cy="250" r="6" fill="#B8733A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Third dot - original color */}
                                                <circle cx="270" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Loading text with elegant font */}
                                                <text x="250" y="280" textAnchor="middle" fill="#CF844A" fontSize="20" fontWeight="400" fontFamily="'Playfair Display', 'Georgia', serif" opacity="0.9">
                                                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
                                                    Loading...
                                            </text>
                                            </g>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Personal Capability</span>
                                        </div>
                                        <div className={styles.legendItem} style={{ marginLeft: '20px' }}>
                                            <div className={styles.legendColor} style={{ background: '#ff6b6b', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Resume Power</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Skills</h2>

                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="programmingLanguages" className={styles.label}>
                                            Programming Languages
                                        </label>
                                        <input
                                            type="text"
                                            id="programmingLanguages"
                                            value={formData.programmingLanguages}
                                            onChange={(e) => handleInputChange('programmingLanguages', e.target.value)}
                                            onFocus={() => { handleTechSkillsFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleTechSkillsBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="Python, JS, Rust, Golang, SQL"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="frameworks" className={styles.label}>
                                            Technology Domain
                                        </label>
                                        <input
                                            type="text"
                                            id="frameworks"
                                            value={formData.frameworks}
                                            onChange={(e) => handleInputChange('frameworks', e.target.value)}
                                            onFocus={() => { handleTechSkillsFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleTechSkillsBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="AI, Cloud, Blockchain, Fintech"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer} style={{ marginTop: '-1.2rem' }}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="databases" className={styles.label}>
                                            Frameworks & Tools
                                        </label>
                                        <input
                                            type="text"
                                            id="databases"
                                            value={formData.databases}
                                            onChange={(e) => handleInputChange('databases', e.target.value)}
                                            onFocus={() => { handleTechSkillsFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleTechSkillsBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="React, FastApi, AWS, Docker"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="tools" className={styles.label}>
                                            Achievements
                                        </label>
                                        <input
                                            type="text"
                                            id="tools"
                                            value={formData.tools}
                                            onChange={(e) => handleInputChange('tools', e.target.value)}
                                            onFocus={() => { handleTechSkillsFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleTechSkillsBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="Awards, Certifications, Paper"
                                        />
                                    </div>
                                </div>

                                <div className={styles.navButtons} style={{ marginTop: '-0.4rem' }}>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleBack}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleNext}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 4 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-1rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="400"
                                            height="400"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto'
                                            }}
                                            viewBox="0 0 400 400"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Fancy dots loading animation */}
                                            <g className="dots-loading-animation">
                                                {/* First dot - slightly lighter */}
                                                <circle cx="230" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Second dot - slightly darker */}
                                                <circle cx="250" cy="250" r="6" fill="#B8733A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Third dot - original color */}
                                                <circle cx="270" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Loading text with elegant font */}
                                                <text x="250" y="280" textAnchor="middle" fill="#CF844A" fontSize="20" fontWeight="400" fontFamily="'Playfair Display', 'Georgia', serif" opacity="0.9">
                                                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
                                                    Loading...
                                            </text>
                                            </g>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Personal Capability</span>
                                        </div>
                                        <div className={styles.legendItem} style={{ marginLeft: '20px' }}>
                                            <div className={styles.legendColor} style={{ background: '#ff6b6b', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Resume Power</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Work Experience</h2>


                                {formData.workExperiences.map((experience, index) => (
                                    <div key={index} style={{ marginBottom: '4px' }}>
                                        <div className={styles.formRowContainer}>
                                            <div className={styles.formGroup} style={{ width: '40%' }}>
                                                <label htmlFor={`companyName_${index}`} className={styles.label}>
                                                    Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`companyName_${index}`}
                                                    value={experience.companyName}
                                                    onChange={(e) => handleWorkExperienceChange(index, 'companyName', e.target.value)}
                                                    onFocus={() => { handleProfessionalFocus(); handleTeamworkFocus(); handleJobMatchFocus(); }}
                                                    onBlur={() => { handleProfessionalBlur(); handleTeamworkBlur(); handleJobMatchBlur(); }}
                                                    className={styles.input}
                                                    placeholder="Enter company name"
                                                />
                                            </div>

                                            <div className={styles.formGroup} style={{ width: '35%', marginLeft: '2.5%' }}>
                                                <label htmlFor={`jobTitle_${index}`} className={styles.label}>
                                                    Job Title
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`jobTitle_${index}`}
                                                    value={experience.jobTitle}
                                                    onChange={(e) => handleWorkExperienceChange(index, 'jobTitle', e.target.value)}
                                                    onFocus={() => { handleProfessionalFocus(); handleTeamworkFocus(); handleJobMatchFocus(); }}
                                                    onBlur={() => { handleProfessionalBlur(); handleTeamworkBlur(); handleJobMatchBlur(); }}
                                                    className={styles.input}
                                                    placeholder="Enter job title"
                                                />
                                            </div>

                                            <div className={styles.formGroup} style={{ width: '20%', marginLeft: '2.5%' }}>
                                                <label htmlFor={`employedYears_${index}`} className={styles.label}>
                                                    Years
                                                </label>
                                                <div 
                                                    className={styles.customDropdown}
                                                    ref={(ref) => { yearsDropdownRefs.current[index] = ref; }}
                                                >
                                                    <div 
                                                        className={styles.dropdownSelected} 
                                                        onClick={() => toggleYearsDropdown(index)}
                                                        onFocus={() => { handleProfessionalFocus(); handleTeamworkFocus(); handleJobMatchFocus(); }}
                                                        onBlur={() => { handleProfessionalBlur(); handleTeamworkBlur(); handleJobMatchBlur(); }}
                                                        aria-haspopup="listbox"
                                                        aria-expanded={yearsDropdownStates[index] || false}
                                                        role="combobox"
                                                        tabIndex={0}
                                                    >
                                                        <span className={experience.employedYears ? '' : styles.placeholderText}>
                                                            {experience.employedYears || 'Select'}
                                                        </span>
                                                        <svg 
                                                            className={`${styles.dropdownArrow} ${yearsDropdownStates[index] ? styles.dropdownArrowUp : ''}`}
                                                            width="16" 
                                                            height="16" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    
                                                    {yearsDropdownStates[index] && (
                                                        <ul className={styles.dropdownOptions} role="listbox">
                                                            {["<1 year", "1 to 3 years", "3 to 8 years", ">8 years"].map((option) => (
                                                                <li 
                                                                    key={option} 
                                                                    className={`${styles.dropdownOption} ${experience.employedYears === option ? styles.dropdownOptionSelected : ''}`}
                                                                    onClick={() => handleYearsSelect(index, option)}
                                                                    role="option"
                                                                    aria-selected={experience.employedYears === option}
                                                                >
                                                                    {option}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    
                                                    {/* Hidden real select for form submission */}
                                                    <select
                                                        id={`employedYears_${index}`}
                                                        value={experience.employedYears}
                                                        onChange={(e) => handleWorkExperienceChange(index, 'employedYears', e.target.value)}
                                                        className={styles.hiddenSelect}
                                                        aria-hidden="true"
                                                        tabIndex={-1}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="<1 year">&lt; 1 year</option>
                                                        <option value="1 to 3 years">1-3 years</option>
                                                        <option value="3 to 8 years">3-8 years</option>
                                                        <option value=">8 years">&gt;8 years</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Remove button for additional entries */}
                                            {formData.workExperiences.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeWorkExperience(index)}
                                                    style={{
                                                        marginLeft: '10px',
                                                        marginTop: '20px',
                                                        background: '#ffcccb',
                                                        color: '#d63031',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        width: '32px',
                                                        height: '24px',
                                                        fontSize: '20px',
                                                        fontWeight: '300',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease',
                                                        padding: '0',
                                                        flexShrink: 0
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#ffb3b3';
                                                        e.currentTarget.style.boxShadow = '0 0 8px 4px rgba(214, 48, 49, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#ffcccb';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add button aligned to the right (only show if less than 4 entries) */}
                                {formData.workExperiences.length < 4 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                                        <button
                                            type="button"
                                            onClick={addWorkExperience}
                                            className={styles.submitButton}
                                            style={{
                                                minWidth: '32px',
                                                maxWidth: '32px',
                                                height: '24px',
                                                padding: '0',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: '1',
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                )}

                                <div className={styles.navButtons}>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleBack}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleNext}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 5 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-1rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="400"
                                            height="400"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto'
                                            }}
                                            viewBox="0 0 400 400"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Fancy dots loading animation */}
                                            <g className="dots-loading-animation">
                                                {/* First dot - slightly lighter */}
                                                <circle cx="230" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Second dot - slightly darker */}
                                                <circle cx="250" cy="250" r="6" fill="#B8733A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Third dot - original color */}
                                                <circle cx="270" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Loading text with elegant font */}
                                                <text x="250" y="280" textAnchor="middle" fill="#CF844A" fontSize="20" fontWeight="400" fontFamily="'Playfair Display', 'Georgia', serif" opacity="0.9">
                                                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
                                                    Loading...
                                            </text>
                                            </g>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Personal Capability</span>
                                        </div>
                                        <div className={styles.legendItem} style={{ marginLeft: '20px' }}>
                                            <div className={styles.legendColor} style={{ background: '#ff6b6b', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Resume Power</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.resumeAnalysisContainer}>
                                    <h2 className={styles.sectionTitle} style={{ marginBottom: 24 }}>Resume Analysis</h2>
                                    
                                    {/* Full-page loading overlay while analyzing */}
                                    {isAnalyzing && (
                                        <div style={{
                                            position: 'fixed', inset: 0,
                                            background: 'rgba(237, 236, 227, 0.75)',
                                            backdropFilter: 'blur(2px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 999
                                        }}>
                                            <div style={{
                                                background: 'white',
                                                borderRadius: 20,
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 16px 50px rgba(0,0,0,0.15)',
                                                padding: '20px 24px',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                                maxWidth: 640,
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {/* Larger 20s smooth filling ring using pathLength for simple CSS control */}
                                                    <svg width="40" height="40" viewBox="0 0 36 36" aria-label="loading progress" role="img">
                                                        {/* Track */}
                                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                                                        {/* Progress - uses pathLength=100 so dash values are percentage based */}
                                                        <circle
                                                          cx="18" cy="18" r="16" fill="none"
                                                          stroke="#9B6A10" strokeWidth="4" strokeLinecap="round"
                                                          pathLength="100"
                                                          style={{
                                                            strokeDasharray: 100,
                                                            strokeDashoffset: Math.max(0, 100 - ringProgress),
                                                            transform: 'rotate(-90deg)',
                                                            transformOrigin: '50% 50%',
                                                            transition: 'stroke-dashoffset 600ms ease'
                                                          }}
                                                        />
                                                    </svg>
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 16 }}>
                                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#9B6A10', animation: 'dot-bounce 0.9s ease-in-out infinite' }} />
                                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#B8860B', animation: 'dot-bounce 0.9s ease-in-out infinite 0.15s' }} />
                                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#9B6A10', animation: 'dot-bounce 0.9s ease-in-out infinite 0.3s' }} />
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: 20, fontWeight: 600, color: '#2d3748',
                                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                                    letterSpacing: '-0.01em'
                                                }}>Analyzing your resume and job match…</div>
                                                <div style={{
                                                    fontSize: 16, color: '#4a5568', textAlign: 'center',
                                                    maxWidth: 580, lineHeight: 1.6,
                                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                                    fontWeight: 500,
                                                    animation: 'tip-fancy-in 600ms ease'
                                                }}>Tip {currentTipIndex + 1}: {analysisTips[currentTipIndex]}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Resume or Screenshot (PDF format, max 2MB) <span style={{ color: '#ff4757' }}>*</span>
                                        </label>
                                        
                                        <div 
                                            className={`${styles.input} ${isDragging ? styles.dropzoneActive : ''}`}
                                            style={{
                                                height: '140px',
                                                border: `3px dashed ${isDragging ? '#667eea' : '#cbd5e1'}`,
                                                borderRadius: '20px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                background: isDragging 
                                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                backgroundSize: isDragging ? '400% 400%' : '100% 100%',
                                                animation: isDragging ? 'gradientShift 3s ease infinite' : 'none',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                boxShadow: isDragging 
                                                    ? '0 20px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                                    : '0 8px 25px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                                                transform: isDragging ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                                                backdropFilter: 'blur(10px)',
                                                WebkitBackdropFilter: 'blur(10px)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isDragging) {
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
                                                    e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isDragging) {
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)';
                                                }
                                            }}
                                            onDragEnter={handleDrag}
                                            onDragOver={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div style={{ 
                                                marginBottom: '16px',
                                                padding: '16px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                backdropFilter: 'blur(10px)',
                                                WebkitBackdropFilter: 'blur(10px)',
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                transition: 'all 0.4s ease',
                                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ 
                                                    color: '#ffffff',
                                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                                                    transition: 'all 0.4s ease'
                                                }}>
                                                    <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M3 15V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <p style={{ 
                                                margin: 0, 
                                                color: '#ffffff', 
                                                textAlign: 'center', 
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                transition: 'all 0.4s ease',
                                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                                letterSpacing: '0.025em'
                                            }}>
                                                <span style={{ fontWeight: '700' }}>Drop your resume here</span>
                                            </p>
                                            <p style={{ 
                                                margin: '6px 0 0 0', 
                                                color: 'rgba(255, 255, 255, 0.8)', 
                                                textAlign: 'center', 
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                                            }}>
                                                PDF (max 2MB)
                                            </p>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.tiff,.bmp"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        
                                        {resumeFile && (
                                            <div style={{ 
                                                marginTop: '16px', 
                                                padding: '16px 20px', 
                                                border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                                backdropFilter: 'blur(10px)',
                                                WebkitBackdropFilter: 'blur(10px)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                                                transition: 'all 0.4s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '12px'
                                            }}>
                                                {isImageFile(resumeFile.type) ? (
                                                    <div style={{ 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        marginBottom: 0,
                                                        flex: 1
                                                    }}>
                                                        <img 
                                                            src={URL.createObjectURL(resumeFile)} 
                                                            alt="Resume Preview" 
                                                            style={{ 
                                                                maxWidth: '120px', 
                                                                maxHeight: '120px', 
                                                                objectFit: 'contain',
                                                                border: '2px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                            }} 
                                                        />
                                                        <div style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}>{resumeFile.name}</div>
                                                    </div>
                                                ) : (
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        marginBottom: 0,
                                                        padding: '12px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                                        flex: 1
                                                    }}>
                                                        <div style={{
                                                            padding: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: '#f3f4f6',
                                                            marginRight: '12px'
                                                        }}>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#6b7280' }}>
                                                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ 
                                                                color: '#374151', 
                                                                fontWeight: '500',
                                                                fontSize: '14px'
                                                            }}>{resumeFile.name}</span>
                                                            <div style={{ 
                                                                color: '#6b7280', 
                                                                fontSize: '12px',
                                                                marginTop: '2px'
                                                            }}>{formatFileSize(resumeFile.size)}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'flex-end', 
                                                    alignItems: 'center'
                                                }}>
                                                    <button
                                                        type="button"
                                                        onClick={removeFile}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            padding: '10px 18px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            backdropFilter: 'blur(10px)',
                                                            WebkitBackdropFilter: 'blur(10px)',
                                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)';
                                                            e.currentTarget.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                                                            e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {!resumeFile && resumeErrorMessage && (
                                            <div style={{ 
                                                color: '#DC2626', 
                                                fontSize: '13px', 
                                                marginTop: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {resumeErrorMessage}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.navButtons}>
                                        <button
                                            className={styles.submitButton}
                                            onClick={handleBack}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            className={styles.submitButton}
                                            onClick={handleResumeAnalysis}
                                            disabled={isAnalyzing}
                                            style={{ 
                                                minWidth: 120, 
                                                maxWidth: 140,
                                                opacity: isAnalyzing ? 0.7 : 1,
                                                cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isAnalyzing ? (
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {/* Three medium-sized animated dots */}
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '4px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            animation: 'thinking-pulse 1.2s ease-in-out infinite',
                                                            boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)'
                                                        }} />
                                                        <div style={{
                                                            width: '8px',
                                                            height: '4px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            animation: 'thinking-pulse 1.2s ease-in-out infinite 0.15s',
                                                            boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)'
                                                        }} />
                                                        <div style={{
                                                            width: '8px',
                                                            height: '4px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            animation: 'thinking-pulse 1.2s ease-in-out infinite 0.3s',
                                                            boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)'
                                                        }} />
                                                    </div>
                                                    <span style={{ 
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}>Analyzing</span>
                                                </div>
                                            ) : (
                                                'Analysis'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : currentStep === 6 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-1rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="400"
                                            height="400"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto'
                                            }}
                                            viewBox="0 0 400 400"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Fancy dots loading animation */}
                                            <g className="dots-loading-animation">
                                                {/* First dot - slightly lighter */}
                                                <circle cx="230" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Second dot - slightly darker */}
                                                <circle cx="250" cy="250" r="6" fill="#B8733A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Third dot - original color */}
                                                <circle cx="270" cy="250" r="6" fill="#CF844A" opacity="0.8">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                                                </circle>
                                                
                                                {/* Loading text with elegant font */}
                                                <text x="250" y="280" textAnchor="middle" fill="#CF844A" fontSize="20" fontWeight="400" fontFamily="'Playfair Display', 'Georgia', serif" opacity="0.9">
                                                    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
                                                    Loading...
                                            </text>
                                            </g>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Personal Capability</span>
                                        </div>
                                        <div className={styles.legendItem} style={{ marginLeft: '20px' }}>
                                            <div className={styles.legendColor} style={{ background: '#ff6b6b', width: '16px', height: '2px' }}></div>
                                            <span style={{ 
                                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#2c2c2c',
                                                letterSpacing: '0.5px'
                                            }}>Resume Power</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.analysisContainer}>
                                    <div style={{ marginBottom: 16 }}>
                                        <h2 className={styles.sectionTitle} style={{ 
                                            marginBottom: 8,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            fontFamily: '"Playfair Display", "Georgia", serif',
                                            fontWeight: 700,
                                            borderBottom: 'none'
                                        }}>Career Fit Analysis</h2>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '16px',
                                            color: '#6c757d',
                                            fontWeight: '500',
                                            lineHeight: '1.4',
                                            letterSpacing: '-0.01em',
                                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                        }}>
                                            <span style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#2c2c2c'
                                            }}>
                                                {analysisResult?.job_analysis?.analysis?.standardized_title || 'Job Title'}
                                            </span>
                                            <span style={{ color: '#9ca3af' }}>at</span>
                                            <span style={{ fontStyle: 'italic' }}>
                                                {analysisResult?.job_analysis?.analysis?.company_name || 'companies in general'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Modern Tab Design */}
                                    <div style={{ 
                                        display: 'flex', 
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '12px',
                                        padding: '3px',
                                        marginBottom: '8px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <button
                                            className={styles.tabButton}
                                            onClick={() => {
                                                setActiveTab('Personal Capability');
                                                updateShapeLayering('Personal Capability');
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px 16px',
                                                border: 'none',
                                        borderRadius: '8px', 
                                                backgroundColor: activeTab === 'Personal Capability' 
                                                    ? 'linear-gradient(135deg, #9B6A10 0%, #B8860B 100%)' 
                                                    : 'transparent',
                                                color: activeTab === 'Personal Capability' ? '#8B4513' : '#495057',
                                                fontWeight: '600',
                                                fontSize: '17px',
                                                cursor: 'pointer',
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                position: 'relative',
                                                outline: 'none',
                                                boxShadow: activeTab === 'Personal Capability' 
                                                    ? '0 4px 16px rgba(155, 106, 16, 0.25)' 
                                                    : 'none',
                                                transform: activeTab === 'Personal Capability' 
                                                    ? 'translateY(-1px) scale(1.02)' 
                                                    : 'translateY(0) scale(1)',
                                                letterSpacing: '0.3px',
                                                textTransform: 'none',
                                                overflow: 'hidden'
                                            }}
                                            onFocus={(e) => e.target.style.outline = 'none'}
                                            onMouseEnter={(e) => {
                                                if (activeTab !== 'Personal Capability') {
                                                    e.currentTarget.style.backgroundColor = 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%)';
                                                    e.currentTarget.style.color = '#9B6A10';
                                                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(155, 106, 16, 0.15)';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 106, 16, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (activeTab !== 'Personal Capability') {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#495057';
                                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(155, 106, 16, 0.25)';
                                                }
                                            }}
                                        >
                                            <span style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ 
                                                    opacity: activeTab === 'Personal Capability' ? 1 : 0.7 
                                                }}>
                                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Personal Capability
                                            </span>
                                        </button>
                                        <button
                                            className={styles.tabButton}
                                            onClick={() => {
                                                setActiveTab('Resume Power');
                                                updateShapeLayering('Resume Power');
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px 16px',
                                                border: 'none',
                                                borderRadius: '8px',
                                                backgroundColor: activeTab === 'Resume Power' 
                                                    ? 'linear-gradient(135deg, #9B6A10 0%, #B8860B 100%)' 
                                                    : 'transparent',
                                                color: activeTab === 'Resume Power' ? '#8B4513' : '#495057',
                                                fontWeight: '600',
                                                fontSize: '17px',
                                                cursor: 'pointer',
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                position: 'relative',
                                                outline: 'none',
                                                boxShadow: activeTab === 'Resume Power' 
                                                    ? '0 4px 16px rgba(155, 106, 16, 0.25)' 
                                                    : 'none',
                                                transform: activeTab === 'Resume Power' 
                                                    ? 'translateY(-1px) scale(1.02)' 
                                                    : 'translateY(0) scale(1)',
                                                letterSpacing: '0.3px',
                                                textTransform: 'none',
                                                overflow: 'hidden'
                                            }}
                                            onFocus={(e) => e.target.style.outline = 'none'}
                                            onMouseEnter={(e) => {
                                                if (activeTab !== 'Resume Power') {
                                                    e.currentTarget.style.backgroundColor = 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%)';
                                                    e.currentTarget.style.color = '#9B6A10';
                                                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(155, 106, 16, 0.15)';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 106, 16, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (activeTab !== 'Resume Power') {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#495057';
                                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(155, 106, 16, 0.25)';
                                                }
                                            }}
                                        >
                                            <span style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ 
                                                    opacity: activeTab === 'Resume Power' ? 1 : 0.7 
                                                }}>
                                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                                                </svg>
                                                Resume Power
                                            </span>
                                        </button>
                                    </div>
                                    
                                    {/* Tab Content */}
                                    <div style={{ minHeight: '280px', padding: '6px 0' }}>
                                        {activeTab === 'Personal Capability' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                {/* Individual Suggestion Blocks - Show 3 at a time with scroll */}
                                                <div style={{
                                                    height: '300px', // Fixed height for exactly 3 items
                                                    overflowY: 'auto',
                                                    paddingRight: '4px'
                                                }}>
                                                    {/* Custom scrollbar styling */}
                                                    <style jsx>{`
                                                        div::-webkit-scrollbar {
                                                            width: 8px;
                                                        }
                                                        div::-webkit-scrollbar-track {
                                                            background: #f1f3f4;
                                                            border-radius: 4px;
                                                        }
                                                        div::-webkit-scrollbar-thumb {
                                                            background: linear-gradient(180deg, #9B6A10 0%, #B8860B 100%);
                                                            border-radius: 4px;
                                                            border: 1px solid #f1f3f4;
                                                        }
                                                        div::-webkit-scrollbar-thumb:hover {
                                                            background: linear-gradient(180deg, #8B5A0A 0%, #A67C0A 100%);
                                                        }
                                                    `}</style>
                                                    
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '16px'
                                                    }}>
                                                        {improvementAdvice.map((advice, index) => (
                                                            <div
                                                                key={`advice-${index}`}
                                                                style={{
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                                                    borderRadius: '20px',
                                                                    padding: '12px 16px',
                                                                    border: '1px solid #e2e8f0',
                                                                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                                                                }}
                                                            >
                                                                <p style={{
                                                                    fontSize: '18px',
                                                                    lineHeight: '1.7',
                                                                    color: '#2c2c2c',
                                                                    margin: 0,
                                                                    fontWeight: '600',
                                                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                                                    letterSpacing: '-0.01em'
                                                                }}>
                                                                    <span style={{ fontWeight: 800, fontStyle: 'italic' }}><strong>{advice.category}:</strong></span> {advice.advice}
                                                                </p>
                                                            </div>
                                                        ))}
                                    </div>
                                </div>

                                                {/* Add buttons to Personal Capability */}
                                                <div className={styles.navButtons} style={{ marginTop: '12px' }}>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleBack}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className={styles.submitButton}
                                        onClick={() => window.open('https://calendar.app.google/gE2pcatrA4j83c547', '_blank')}
                                        style={{ minWidth: 150, maxWidth: 150 }}
                                    >
                                        Free Session
                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                {/* Resume Analysis Suggestions - Show 3 at a time with scroll */}
                                                <div style={{
                                                    height: '300px', // Fixed height for exactly 3 items
                                                    overflowY: 'auto',
                                                    paddingRight: '4px'
                                                }}>
                                                    {/* Custom scrollbar styling */}
                                                    <style jsx>{`
                                                        div::-webkit-scrollbar {
                                                            width: 8px;
                                                        }
                                                        div::-webkit-scrollbar-track {
                                                            background: #f1f3f4;
                                                            border-radius: 4px;
                                                        }
                                                        div::-webkit-scrollbar-thumb {
                                                            background: linear-gradient(180deg, #9B6A10 0%, #B8860B 100%);
                                                            border-radius: 4px;
                                                            border: 1px solid #f1f3f4;
                                                        }
                                                        div::-webkit-scrollbar-thumb:hover {
                                                            background: linear-gradient(180deg, #8B5A0A 0%, #A67C0A 100%);
                                                        }
                                                    `}</style>
                                                    
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '16px'
                                                    }}>
                                                        {getResumeAnalysisSuggestions().length > 0 ? (
                                                            getResumeAnalysisSuggestions().map((suggestion, index) => (
                                                                <div
                                                                    key={`resume-advice-${index}`}
                                                                    style={{
                                                                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                                                        borderRadius: '20px',
                                                                        padding: '12px 16px',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                                                                    }}
                                                                >
                                                                    <p style={{
                                                                        fontSize: '18px',
                                                                        lineHeight: '1.7',
                                                                        color: '#2c2c2c',
                                                                        margin: 0,
                                                                        fontWeight: '600',
                                                                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                                                        letterSpacing: '-0.01em'
                                                                    }}>
                                                                        <span style={{ fontWeight: 800, fontStyle: 'italic' }}><strong>{suggestion.category}:</strong></span> {suggestion.advice}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div style={{
                                                                textAlign: 'center',
                                                                fontSize: '18px',
                                                                fontWeight: '600',
                                                                color: '#666',
                                                                padding: '24px 12px',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                                                borderRadius: '20px',
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                No resume analysis available. Please upload a resume and run the analysis.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Move buttons closer to the suggestions */}
                                                <div className={styles.navButtons} style={{ marginTop: '12px' }}>
                                                    <button
                                                        className={styles.submitButton}
                                                        onClick={handleBack}
                                                        style={{ minWidth: 120, maxWidth: 140 }}
                                                    >
                                                        Back
                                                    </button>
                                                    <button
                                                        className={styles.submitButton}
                                                        onClick={() => window.open('https://www.careerlandinggroup.com/resume-design/#resume-analysis-lab', '_blank')}
                                                        style={{ minWidth: 150, maxWidth: 150 }}
                                                    >
                                                        Improve
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    );
}
