"use client";

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import Head from 'next/head';
import * as d3 from 'd3';
import styles from './alpha.module.css';
import '../globals.css';

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
  
  body.alpha-page {
    background: #edece3 !important;
    background-color: #edece3 !important;
    background-image: none !important;
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
        }, [formData, basicInfoFocusCount, isTypingBasicInfo, educationFocusCount, isTypingEducation, jobMatchFocusCount, isTypingJobMatch, techSkillsFocusCount, isTypingTechSkills, professionalFocusCount, isTypingProfessional, teamworkFocusCount, isTypingTeamwork]);

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
                .style('stop-color', '#e0e0e0')
                .style('stop-opacity', 0.8);

            greyGradient.append('stop')
                .attr('offset', '100%')
                .style('stop-color', '#e0e0e0')
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

            // Add category labels
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
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', '#333')
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
                    .transition()
                    .duration(500)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', backgroundPoint[0])
                    .attr('cy', backgroundPoint[1])
                    .attr('r', backgroundValue === 0 ? 6 : 8); // Smaller at center, larger when positioned
            }

            // Enhanced typing animation with radar pulse effect (original timing)
            if (isTypingBasicInfo && basicInfoFocusCount > 0) {
                const addTypingReactionAnimation = () => {
                    if (isTypingBasicInfo && basicInfoFocusCount > 0) { // Still typing
                        // Get current actual position of the background dot
                        const currentX = parseFloat(backgroundDot.attr('cx'));
                        const currentY = parseFloat(backgroundDot.attr('cy'));

                        // Create expanding ring effect at dot's current position
                        const ring = g.append('circle')
                            .attr('class', 'typing-ring')
                            .attr('cx', currentX)
                            .attr('cy', currentY)
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

                        // Dot reaction animation
                        backgroundDot
                            .transition()
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
                    .attr('fill', '#3742fa')
                    .attr('stroke', '#2f3542')
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
                    .transition()
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
                            .attr('stroke', '#3742fa')
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

                        // Dot reaction animation
                        jobMatchDot
                            .transition()
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
                    .attr('stroke', '#2c3e50')
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
                    .transition()
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

                        // Dot reaction animation
                        educationDot
                            .transition()
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
                    .attr('fill', '#e74c3c')
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
                    .transition()
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
                            .attr('stroke', '#e74c3c')
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

                        // Dot reaction animation
                        professionalDot
                            .transition()
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
                    .transition()
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

                        // Dot reaction animation
                        techSkillsDot
                            .transition()
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
                    .attr('fill', '#8e44ad')
                    .attr('stroke', '#9b59b6')
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
                    .transition()
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

                        // Dot reaction animation
                        teamworkDot
                            .transition()
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
            }
        } else {
            // Safely remove teamwork dot if no work experience data and not typing
            const teamworkDotsToRemove = g.selectAll('.teamwork-dot');
            safeRemove(teamworkDotsToRemove);
        }

        // Create comprehensive shape that encloses all visible dots
        // Collect all visible dot positions with their proper hexagon indices
        const dotPositions: { point: [number, number], index: number }[] = [];

        // Include Background (index 0) only if it should be shown
        if (shouldShowBackground) {
            dotPositions.push({ point: backgroundPoint, index: 0 });
        }
        
        // Include Job Match (index 5) only if it has completed education, skills, or work experience fields (not just typing)
        if (shouldShowJobMatch && jobMatchValue > 0) {
            dotPositions.push({ point: jobMatchPoint, index: 5 });
        }

        // Add Education dot if education data exists or user is typing
        const shouldIncludeEducationInShape = hasEducationData || (isTypingEducation && educationFocusCount > 0);
        if (shouldIncludeEducationInShape) {
            // Calculate education dot position using same logic as main calculation
            let educationValue = 0;
            if (hasEducationData) {
                educationValue = filledEducationFields.length * 2;
            }
            const educationLevel = educationValue / maxValue;

            const educationAngle = angleSlice * 1 - Math.PI / 2;
            const educationRadius = educationLevel * radius; // educationLevel is already 0-1 scale

            const educationPoint: [number, number] = [
                Math.cos(educationAngle) * educationRadius,
                Math.sin(educationAngle) * educationRadius
            ];

            // Only include education dot in shape if it's not at center (has actual data)
            if (educationValue > 0) {
                dotPositions.push({ point: educationPoint, index: 1 });
            }
        }

        // Add Professional dot if work experience data exists or user is typing
        const shouldIncludeProfessionalInShape = hasWorkExperienceData || (isTypingProfessional && professionalFocusCount > 0);
        if (shouldIncludeProfessionalInShape) {
            // Calculate Professional dot position using same logic as main calculation
            let professionalValue = 0;
            if (hasWorkExperienceData) {
                // Cap at maximum to not exceed endpoint
                professionalValue = Math.min(filledWorkExperienceFields.length * 2, 10); // Cap at 10 to not exceed endpoint
            }
            const professionalLevel = professionalValue / maxValue;

            const professionalAngle = angleSlice * 2 - Math.PI / 2;
            const professionalRadius = professionalLevel * radius;

            const professionalPoint: [number, number] = [
                Math.cos(professionalAngle) * professionalRadius,
                Math.sin(professionalAngle) * professionalRadius
            ];

            // Only include in shape if has actual data (not just typing)
            if (hasWorkExperienceData && professionalValue > 0) {
                dotPositions.push({ point: professionalPoint, index: 2 });
            }
        }

        // Add Tech Skills dot if skills data exists or user is typing
        const shouldIncludeTechSkillsInShape = hasSkillsData || (isTypingTechSkills && techSkillsFocusCount > 0);
        if (shouldIncludeTechSkillsInShape) {
            // Calculate TechSkills dot position using same logic as main calculation
            let techSkillsValue = 0;

            // Count completed skills fields (Programming Languages, Technologies, Frameworks & Tools, Achievements)
            const completedSkillsFieldCount = filledSkillsFields.length;

            // Each completed field moves dot 2 units outward (2/10 of max value)
            // Cap at maximum to not exceed endpoint
            if (completedSkillsFieldCount > 0) {
                techSkillsValue = Math.min(completedSkillsFieldCount * 2, 10); // Cap at 10 to not exceed endpoint (100% of max radius)
            }
            const techSkillsLevel = techSkillsValue / maxValue;

            const techSkillsAngle = angleSlice * 3 - Math.PI / 2;
            const techSkillsRadius = techSkillsLevel * radius;

            const techSkillsPoint: [number, number] = [
                Math.cos(techSkillsAngle) * techSkillsRadius,
                Math.sin(techSkillsAngle) * techSkillsRadius
            ];

            // Only include in shape if has actual data (not just typing)
            if (hasSkillsData && techSkillsValue > 0) {
                dotPositions.push({ point: techSkillsPoint, index: 3 });
            }
        }

        // Add Teamwork dot if work experience data exists or user is typing
        const shouldIncludeTeamworkInShape = hasWorkExperienceData || (isTypingTeamwork && teamworkFocusCount > 0);
        if (shouldIncludeTeamworkInShape) {
            // Calculate Teamwork dot position using same logic as main calculation
            let teamworkValue = 0;
            if (hasWorkExperienceData) {
                // Cap at maximum to not exceed endpoint
                teamworkValue = Math.min(filledWorkExperienceFields.length * 2, 10); // Cap at 10 to not exceed endpoint
            }
            const teamworkLevel = teamworkValue / maxValue;

            const teamworkAngle = angleSlice * 4 - Math.PI / 2;
            const teamworkRadius = teamworkLevel * radius;

            const teamworkPoint: [number, number] = [
                Math.cos(teamworkAngle) * teamworkRadius,
                Math.sin(teamworkAngle) * teamworkRadius
            ];

            // Only include in shape if has actual data (not just typing)
            if (hasWorkExperienceData && teamworkValue > 0) {
                dotPositions.push({ point: teamworkPoint, index: 4 });
            }
        }

        // Sort dots by their hexagon index to maintain proper order
        dotPositions.sort((a, b) => a.index - b.index);

        // Extract the points in correct order
        const orderedDotPoints = dotPositions.map(dp => dp.point);

        // Create shape that connects all dots and encloses center area
        let shapePoints: [number, number][];

        if (orderedDotPoints.length === 2) {
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

        // Update existing shape or create new one
        let progressShape = g.select<SVGPathElement>('.progress-triangle');

        if (progressShape.empty()) {
            // Create shape for the first time
            progressShape = g.append('path')
                .attr('class', 'progress-triangle')
                .attr('fill', 'rgba(207, 174, 232, 0.4)') // Purple with transparency
                .attr('stroke', '#CFAEE8')
                .attr('stroke-width', 1.5)
                .attr('opacity', 0)
                .style('transform', 'scale(0)')
                .style('transform-origin', '0px 0px'); // Center at origin since g is translated

            // Initial appearance animation
            progressShape
                .datum(shapePoints)
                .attr('d', line)
                .transition()
                .duration(1000)
                .delay(400)
                .ease(d3.easeBackOut.overshoot(1.1))
                .attr('opacity', 0.7)
                .style('transform', 'scale(1)');
        } else {
            // Smoothly transition existing shape to new configuration
            progressShape
                .datum(shapePoints)
                .transition()
                .duration(800)
                .ease(d3.easeQuadInOut)
                .attr('d', line)
                .attr('opacity', 0.7);
        }

        // Static dots - no pulsing animation
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
    };

    const handleBasicInfoBlur = () => {
        setBasicInfoFocusCount(count => Math.max(0, count - 1));
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
        
        // Set timeout to stop typing animation
        educationTypingTimeoutRef.current = setTimeout(() => {
            setIsTypingEducation(false);
        }, 500); // Stop animation 500ms after last blur
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
        
        // Set timeout to stop typing animation
        jobMatchTypingTimeoutRef.current = setTimeout(() => {
            setIsTypingJobMatch(false);
        }, 500); // Stop animation 500ms after last blur
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
        
        // Set timeout to stop typing animation
        techSkillsTypingTimeoutRef.current = setTimeout(() => {
            setIsTypingTechSkills(false);
        }, 500); // Stop animation 500ms after last blur
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
        
        // Set timeout to stop typing animation
        professionalTypingTimeoutRef.current = setTimeout(() => {
            setIsTypingProfessional(false);
        }, 500); // Stop animation 500ms after last blur
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
        
        // Set timeout to stop typing animation
        teamworkTypingTimeoutRef.current = setTimeout(() => {
            setIsTypingTeamwork(false);
        }, 500); // Stop animation 500ms after last blur
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
        }
    };

    // Remove work experience entry
    const removeWorkExperience = (index: number) => {
        if (formData.workExperiences.length > 1) {
            setFormData(prev => ({
                ...prev,
                workExperiences: prev.workExperiences.filter((_, i) => i !== index)
            }));
        }
    };


    const handleNext = () => {
        if (currentStep < 6) {
            // Interrupt any ongoing D3 transitions before step change
            if (svgRef.current) {
                const svg = d3.select(svgRef.current);
                svg.selectAll('*').interrupt();
            }

            setCurrentStep(currentStep + 1);
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
            alert('Unsupported file type. Please upload PDF, Word document, or common image formats.');
            return;
        }
        
        setResumeFile(file);
    };

    const removeFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const isImageFile = (mimeType: string): boolean => {
        return mimeType.startsWith('image/');
    };

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
                `}</style>
            </Head>

            <main className={styles.main} style={{ backgroundColor: '#edece3' }}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title} style={{ 
                        backgroundColor: '#ffffff', 
                        marginBottom: 12, 
                        paddingBottom: 0,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: '"Playfair Display", "Georgia", serif',
                        fontWeight: 700,
                        fontSize: '2.5rem',
                        letterSpacing: '0.05em',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Ambit Alpha
                    </h1>
                    {progressBarElement}

                    <div className={styles.form}>
                        {currentStep === 1 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-3rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="500"
                                            height="500"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block'
                                            }}
                                        >
                                            {/* Fallback content */}
                                            <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                                                Loading chart...
                                            </text>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8' }}></div>
                                            <span>Self Potential</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Background</h2>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="targetJob" className={styles.label}>
                                        Target Job <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="targetJob"
                                        value={targetJob}
                                        onChange={(e) => setTargetJob(e.target.value)}
                                        onBlur={handleTargetJobBlur}
                                        className={styles.input}
                                        placeholder="Enter your target job position"
                                    />
                                </div>

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
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer} style={{ marginTop: '-1.4rem' }}>
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
                                            placeholder="Enter your email address"
                                        />
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
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div className={styles.navButtonsRight}>
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
                                <div className={styles.chartContainer} style={{ marginTop: '-3rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="500"
                                            height="500"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block'
                                            }}
                                        >
                                            {/* Fallback content */}
                                            <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                                                Loading chart...
                                            </text>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8' }}></div>
                                            <span>Self Potential</span>
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
                                            placeholder="Enter your college/university name"
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
                                            placeholder="e.g., Bachelor's, Master's, PhD"
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
                                            placeholder="e.g., Computer Science, Business Administration"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="graduationYear" className={styles.label}>
                                            Graduation Year <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="graduationYear"
                                            value={formData.graduationYear}
                                            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                                            onFocus={() => { handleEducationFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleEducationBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="e.g., 2020"
                                            min="1950"
                                            max="2030"
                                            step="1"
                                        />
                                    </div>
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
                                        onClick={handleNext}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 3 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-3rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="500"
                                            height="500"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block'
                                            }}
                                        >
                                            {/* Fallback content */}
                                            <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                                                Loading chart...
                                            </text>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8' }}></div>
                                            <span>Self Potential</span>
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
                                            placeholder="e.g., JavaScript, Python, Java"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="frameworks" className={styles.label}>
                                            Technologies
                                        </label>
                                        <input
                                            type="text"
                                            id="frameworks"
                                            value={formData.frameworks}
                                            onChange={(e) => handleInputChange('frameworks', e.target.value)}
                                            onFocus={() => { handleTechSkillsFocus(); handleJobMatchFocus(); }}
                                            onBlur={() => { handleTechSkillsBlur(); handleJobMatchBlur(); }}
                                            className={styles.input}
                                            placeholder="e.g., React, Node.js, Django"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer} style={{ marginTop: '-0.8rem' }}>
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
                                            placeholder="e.g., React, Angular, Vue.js"
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
                                            placeholder="e.g., Awards, Certifications, Projects"
                                        />
                                    </div>
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
                                        onClick={handleNext}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 4 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-3rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="500"
                                            height="500"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block'
                                            }}
                                        >
                                            {/* Fallback content */}
                                            <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                                                Loading chart...
                                            </text>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8' }}></div>
                                            <span>Self Potential</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Work Experience</h2>


                                {formData.workExperiences.map((experience, index) => (
                                    <div key={index} style={{ marginBottom: '16px' }}>
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
                                                        marginTop: '30px',
                                                        background: '#ffcccb',
                                                        color: '#d63031',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        width: '32px',
                                                        height: '32px',
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
                                                height: '32px',
                                                padding: '0',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
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
                                <div className={styles.chartContainer} style={{ marginTop: '-3rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg
                                            ref={svgRef}
                                            width="500"
                                            height="500"
                                            className={styles.radarChart}
                                            style={{
                                                display: 'block'
                                            }}
                                        >
                                            {/* Fallback content */}
                                            <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                                                Loading chart...
                                            </text>
                                        </svg>
                                    </div>

                                    <div className={styles.legend}>
                                        <div className={styles.legendItem}>
                                            <div className={styles.legendColor} style={{ background: '#CFAEE8' }}></div>
                                            <span>Self Potential</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.resumeAnalysisContainer}>
                                    <h2 className={styles.sectionTitle} style={{ marginBottom: 24 }}>Resume Analysis</h2>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Resume or Screenshot (PDF, Word, or Images, max 2MB) <span style={{ color: '#ff4757' }}>*</span>
                                        </label>
                                        
                                        <div 
                                            className={`${styles.input} ${isDragging ? styles.dropzoneActive : ''}`}
                                            style={{
                                                height: '200px',
                                                border: '2px dashed #ccc',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onDragEnter={handleDrag}
                                            onDragOver={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div style={{ marginBottom: '16px' }}>
                                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#666' }}>
                                                    <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M3 15V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <p style={{ margin: 0, color: '#666', textAlign: 'center', fontSize: '16px' }}>
                                                Drag and drop your resume or screenshot here, or click to select a file
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
                                                padding: '16px', 
                                                border: '1px solid #ddd', 
                                                borderRadius: '8px',
                                                backgroundColor: '#f9f9f9'
                                            }}>
                                                {isImageFile(resumeFile.type) ? (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <img 
                                                            src={URL.createObjectURL(resumeFile)} 
                                                            alt="Resume Preview" 
                                                            style={{ 
                                                                maxWidth: '200px', 
                                                                maxHeight: '200px', 
                                                                objectFit: 'contain',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px'
                                                            }} 
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', color: '#666' }}>
                                                            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <span style={{ color: '#333' }}>{resumeFile.name}</span>
                                                    </div>
                                                )}
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: '#666', fontSize: '14px' }}>
                                                        {formatFileSize(resumeFile.size)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={removeFile}
                                                        style={{
                                                            background: '#ff4757',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
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
                                            onClick={() => setCurrentStep(6)}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : currentStep === 6 ? (
                            <div className={styles.formSection}>
                                <div className={styles.chartContainer} style={{ marginTop: '-3rem' }}>
                                    <div className={styles.chartWrapper}>
                                        <svg ref={svgRef} className={styles.radarChart} style={{ width: '100%', height: '500px' }}></svg>
                                    </div>
                                </div>
                                
                                <div className={styles.analysisContainer}>
                                    <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Analysis Results</h2>
                                    <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                        Your comprehensive resume analysis and recommendations will appear here.
                                    </p>
                                    
                                    <div style={{ 
                                        background: '#f8f9fa', 
                                        border: '1px solid #e9ecef', 
                                        borderRadius: '8px', 
                                        padding: '2rem', 
                                        textAlign: 'center',
                                        margin: '2rem 0'
                                    }}>
                                        <h3 style={{ color: '#333', marginBottom: '1rem' }}>Analysis Coming Soon</h3>
                                        <p style={{ color: '#666', lineHeight: '1.6' }}>
                                            We're preparing your personalized analysis based on your profile information. 
                                            This will include skill assessments, career recommendations, and improvement suggestions.
                                        </p>
                                    </div>
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
                                        onClick={() => alert('Analysis complete!')}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Complete
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    );
}
