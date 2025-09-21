"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
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
    const [isAnimating, setIsAnimating] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    
    // Resume upload states
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Ultra Enhanced ProgressBar component with smooth growing animations
    function ProgressBar({ step, totalSteps }: { step: number, totalSteps: number }) {
        const targetPercent = Math.round(((step - 1) / (totalSteps - 1)) * 100);
        const [displayPercent, setDisplayPercent] = useState(targetPercent);
        const [barWidth, setBarWidth] = useState(targetPercent);
        const [isAnimating, setIsAnimating] = useState(false);
        const [showSparkles, setShowSparkles] = useState(false);
        const [showFireworks, setShowFireworks] = useState(false);
        const [showWave, setShowWave] = useState(false);
        const [bounceEffect, setBounceEffect] = useState(false);
        
        // Handle smooth bar width animation
        useEffect(() => {
            if (barWidth === targetPercent) return;
            
            setIsAnimating(true);
            
            // Immediately start smooth bar transition
            setBarWidth(targetPercent);
            
            // Enhanced sparkles for any change
            if (Math.abs(barWidth - targetPercent) > 0) {
                setShowSparkles(true);
                setTimeout(() => setShowSparkles(false), 600);
            }
            
            // Wave effect for significant progress
            if (Math.abs(barWidth - targetPercent) > 10) {
                setShowWave(true);
                setTimeout(() => setShowWave(false), 800);
            }
            
            // Fireworks for major milestones
            if (targetPercent >= 50 && barWidth < 50) {
                setTimeout(() => {
                    setShowFireworks(true);
                    setTimeout(() => setShowFireworks(false), 1000);
                }, 400); // Delay to sync with bar animation
            }
            if (targetPercent >= 100 && barWidth < 100) {
                setTimeout(() => {
                    setShowFireworks(true);
                    setTimeout(() => setShowFireworks(false), 1500);
                }, 600); // Delay to sync with bar animation
            }
            
            // Animation cleanup
            setTimeout(() => {
                setIsAnimating(false);
            }, 1200); // Match the CSS transition duration
            
        }, [targetPercent]);
        
        // Handle smooth number counting animation
        useEffect(() => {
            if (displayPercent === targetPercent) return;
            
            const increment = displayPercent < targetPercent ? 1 : -1;
            const timer = setTimeout(() => {
                setDisplayPercent(displayPercent + increment);
            }, 25); // Smooth number counting
            
            // Bounce effect when reaching target
            if (Math.abs(displayPercent - targetPercent) <= 1) {
                setBounceEffect(true);
                setTimeout(() => setBounceEffect(false), 500);
            }
            
            return () => clearTimeout(timer);
        }, [displayPercent, targetPercent]);
        
        return (
            <div className={`${styles.progressBarContainer} ${bounceEffect ? styles.progressBounce : ''}`}>
                <div className={`${styles.progressBarTrack} ${showWave ? styles.progressWave : ''}`}>
                    <div
                        className={`${styles.progressBarFill} ${isAnimating ? styles.progressBarAnimating : ''} ${bounceEffect ? styles.progressFillBounce : ''}`}
                        style={{ 
                            width: `${barWidth}%`,
                            transition: 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            boxShadow: isAnimating ? '0 0 30px rgba(155, 106, 16, 0.8), 0 0 60px rgba(155, 106, 16, 0.4)' : 'none',
                            background: isAnimating ? 
                                'linear-gradient(90deg, #9B6A10 0%, #FFD700 50%, #e3c57c 100%)' : 
                                'linear-gradient(90deg, #9B6A10 0%, #e3c57c 100%)'
                        }}
                    />
                    
                    {/* Enhanced Sparkles */}
                    {showSparkles && (
                        <div className={styles.progressSparkles}>
                            <span className={styles.sparkle} style={{ left: '15%', animationDelay: '0s' }}>✨</span>
                            <span className={styles.sparkle} style={{ left: '35%', animationDelay: '0.1s' }}>⭐</span>
                            <span className={styles.sparkle} style={{ left: '55%', animationDelay: '0.2s' }}>💫</span>
                            <span className={styles.sparkle} style={{ left: '75%', animationDelay: '0.3s' }}>✨</span>
                            <span className={styles.sparkle} style={{ left: '90%', animationDelay: '0.4s' }}>🌟</span>
                        </div>
                    )}
                    
                    {/* Fireworks for milestones */}
                    {showFireworks && (
                        <div className={styles.progressFireworks}>
                            <span className={styles.firework} style={{ left: '25%', animationDelay: '0s' }}>🎆</span>
                            <span className={styles.firework} style={{ left: '50%', animationDelay: '0.2s' }}>🎇</span>
                            <span className={styles.firework} style={{ left: '75%', animationDelay: '0.4s' }}>🎆</span>
                        </div>
                    )}
                    
                    {/* Progress indicator dot */}
                    {isAnimating && (
                        <div 
                            className={styles.progressDot}
                            style={{ 
                                left: `${barWidth}%`,
                                transition: 'left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                        />
                    )}
                </div>
                
                <div className={`${styles.progressBarLabel} ${isAnimating ? styles.progressLabelAnimating : ''} ${bounceEffect ? styles.progressLabelBounce : ''}`}>
                    <span className={styles.progressText}>
                        {displayPercent}% completed
                    </span>
                    {isAnimating && (
                        <span className={styles.progressPulse}>
                            {displayPercent < 50 ? '🚀' : displayPercent < 100 ? '⚡' : '🎉'}
                        </span>
                    )}
                    {showFireworks && <span className={styles.celebrationText}>Amazing Progress!</span>}
                </div>
            </div>
        );
    }

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
        };
    }, [formData]);

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

        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
        }, 1000);
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
        
        // Count total filled fields (excluding target job and workExperiences array since they're handled separately)
        const basicFields = Object.entries(formData).filter(([key, value]) => 
            key !== 'workExperiences' && typeof value === 'string' && value.trim() !== ''
        );
        const workExperienceFieldCount = filledWorkExperienceFields.length;
        const filledFields = basicFields.length + workExperienceFieldCount;
        
        console.log('Updating chart with filled fields:', filledFields, formData);
        console.log('Education fields filled:', filledEducationFields.length, hasEducationData);
        console.log('Filled education fields:', filledEducationFields);
        console.log('Skills fields filled:', filledSkillsFields.length, hasSkillsData);
        console.log('Filled skills fields:', filledSkillsFields);
        console.log('Work Experience fields filled:', filledWorkExperienceFields.length, hasWorkExperienceData);
        console.log('Filled work experience fields:', filledWorkExperienceFields);

        // Only proceed if there are filled fields
        if (filledFields === 0) {
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

            console.log('No filled fields, fading out animations');
            return;
        }

        console.log('Proceeding with animation for', filledFields, 'filled fields');

        // Calculate values for Background and Job Match starting at level 2
        const baseLevel = 2;
        const maxLevel = 3.5; // Maximum level they can reach
        const progressPerField = (maxLevel - baseLevel) / 4; // 4 total fields to fill

        const backgroundValue = baseLevel + (filledFields * progressPerField);
        let jobMatchValue = baseLevel + (filledFields * progressPerField * 0.8); // Job Match grows slightly slower
        
        // Job Match gets additional boost from skills and work experience data
        if (hasSkillsData) {
            const skillsBoost = filledSkillsFields.length * 0.2; // Additional boost per skill field
            jobMatchValue += skillsBoost;
        }
        if (hasWorkExperienceData) {
            const workExperienceBoost = filledWorkExperienceFields.length * 0.25; // Additional boost per work experience field
            jobMatchValue += workExperienceBoost;
        }

        // Calculate positions for Background (index 0) and Job Match (index 5)
        const backgroundAngle = angleSlice * 0 - Math.PI / 2;
        const jobMatchAngle = angleSlice * 5 - Math.PI / 2;

        const backgroundRadius = (backgroundValue / maxValue) * radius;
        const jobMatchRadius = (jobMatchValue / maxValue) * radius;

        const backgroundPoint: [number, number] = [
            Math.cos(backgroundAngle) * backgroundRadius,
            Math.sin(backgroundAngle) * backgroundRadius
        ];

        const jobMatchPoint: [number, number] = [
            Math.cos(jobMatchAngle) * jobMatchRadius,
            Math.sin(jobMatchAngle) * jobMatchRadius
        ];

        // Update or create Background dot (don't remove existing)
        let backgroundDot = g.select('.background-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
        if (backgroundDot.empty()) {
            backgroundDot = g.append('circle')
                .attr('class', 'progress-dot background-dot')
                .attr('cx', backgroundPoint[0])
                .attr('cy', backgroundPoint[1])
                .attr('r', 0)
                .attr('fill', '#ff6b6b')
                .attr('stroke', '#ff4757')
                .attr('stroke-width', 2)
                .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

            backgroundDot
                .transition()
                .duration(600)
                .ease(d3.easeBackOut)
                .attr('r', 6)
                .attr('opacity', 1);
        } else {
            // Move existing dot to new position with smooth animation
            backgroundDot
                .transition()
                .duration(800)
                .ease(d3.easeQuadInOut)
                .attr('cx', backgroundPoint[0])
                .attr('cy', backgroundPoint[1]);
        }


        // Update or create Job Match dot (don't remove existing)
        let jobMatchDot = g.select('.jobmatch-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
        if (jobMatchDot.empty()) {
            jobMatchDot = g.append('circle')
                .attr('class', 'progress-dot jobmatch-dot')
                .attr('cx', jobMatchPoint[0])
                .attr('cy', jobMatchPoint[1])
                .attr('r', 0)
                .attr('fill', '#3742fa')
                .attr('stroke', '#2f3542')
                .attr('stroke-width', 2)
                .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

            jobMatchDot
                .transition()
                .duration(600)
                .delay(200)
                .ease(d3.easeBackOut)
                .attr('r', 6)
                .attr('opacity', 1);
        } else {
            // Move existing dot to new position with smooth animation
            jobMatchDot
                .transition()
                .duration(800)
                .ease(d3.easeQuadInOut)
                .attr('cx', jobMatchPoint[0])
                .attr('cy', jobMatchPoint[1]);
        }


        // Update or create Education and Professional dots if education fields are filled
        if (hasEducationData) {
            // Calculate progressive levels based on number of filled education fields
            const baseEducationLevel = 1.0; // Starting level
            const maxEducationLevel = 2.5; // Maximum level they can reach
            const educationProgressPerField = (maxEducationLevel - baseEducationLevel) / educationFields.length;
            
            const educationLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField);
            let professionalLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField * 0.9); // Professional grows slightly slower
            
            // Professional gets additional boost from skills and work experience data
            if (hasSkillsData) {
                const skillsBoost = filledSkillsFields.length * 0.15; // Additional boost per skill field
                professionalLevel += skillsBoost;
            }
            if (hasWorkExperienceData) {
                const workExperienceBoost = filledWorkExperienceFields.length * 0.2; // Additional boost per work experience field
                professionalLevel += workExperienceBoost;
            }
            
            console.log('Education progression:', {
                filledCount: filledEducationFields.length,
                totalFields: educationFields.length,
                educationLevel,
                professionalLevel,
                progressPerField: educationProgressPerField
            });
            
            const educationAngle = angleSlice * 1 - Math.PI / 2; // Education is at index 1
            const professionalAngle = angleSlice * 2 - Math.PI / 2; // Professional is at index 2

            const educationRadius = (educationLevel / maxValue) * radius;
            const professionalRadius = (professionalLevel / maxValue) * radius;

            const educationPoint: [number, number] = [
                Math.cos(educationAngle) * educationRadius,
                Math.sin(educationAngle) * educationRadius
            ];

            const professionalPoint: [number, number] = [
                Math.cos(professionalAngle) * professionalRadius,
                Math.sin(professionalAngle) * professionalRadius
            ];

            // Update or create Education dot (don't remove existing)
            let educationDot = g.select('.education-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (educationDot.empty()) {
                educationDot = g.append('circle')
                    .attr('class', 'education-dot')
                    .attr('cx', educationPoint[0])
                    .attr('cy', educationPoint[1])
                    .attr('r', 0)
                    .attr('fill', '#4ecdc4')
                    .attr('stroke', '#2c3e50')
                    .attr('stroke-width', 2)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                educationDot
                    .transition()
                    .duration(600)
                    .delay(400)
                    .ease(d3.easeBackOut)
                    .attr('r', 6)
                    .attr('opacity', 1);
            } else {
                // Move existing dot to new position with smooth animation
                educationDot
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', educationPoint[0])
                    .attr('cy', educationPoint[1]);
            }


            // Update or create Professional dot (don't remove existing)
            let professionalDot = g.select('.professional-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (professionalDot.empty()) {
                professionalDot = g.append('circle')
                    .attr('class', 'professional-dot')
                    .attr('cx', professionalPoint[0])
                    .attr('cy', professionalPoint[1])
                    .attr('r', 0)
                    .attr('fill', '#e74c3c')
                    .attr('stroke', '#c0392b')
                    .attr('stroke-width', 2)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                professionalDot
                    .transition()
                    .duration(600)
                    .delay(600)
                    .ease(d3.easeBackOut)
                    .attr('r', 6)
                    .attr('opacity', 1);
            } else {
                // Move existing dot to new position with smooth animation
                professionalDot
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', professionalPoint[0])
                    .attr('cy', professionalPoint[1]);
            }


            // Add subtle pulsing effect to education and professional dots
            const addSubtlePulse = (dot: any) => {
                const pulse = () => {
                    dot.transition()
                        .duration(2000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 7)
                        .transition()
                        .duration(2000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 6)
                        .on('end', () => {
                            if (g.select('.education-dot, .professional-dot').node()) {
                                pulse(); // Continue pulsing if elements still exist
                            }
                        });
                };

                // Start pulsing after initial animation
                setTimeout(pulse, 1500);
            };

            // Add subtle pulsing to education and professional dots
            addSubtlePulse(educationDot);
            addSubtlePulse(professionalDot);
        } else {
            // Safely remove education and professional dots if no education data
            const educationDotsToRemove = g.selectAll('.education-dot, .professional-dot');
            safeRemove(educationDotsToRemove);
        }

        // Update or create Tech Skills dot if skills fields are filled
        if (hasSkillsData) {
            // Calculate progressive levels based on number of filled skills fields
            const baseTechSkillsLevel = 1.0; // Starting level
            const maxTechSkillsLevel = 2.8; // Maximum level they can reach
            const techSkillsProgressPerField = (maxTechSkillsLevel - baseTechSkillsLevel) / skillsFields.length;
            
            const techSkillsLevel = baseTechSkillsLevel + (filledSkillsFields.length * techSkillsProgressPerField);
            
            console.log('Tech Skills progression:', {
                filledCount: filledSkillsFields.length,
                totalFields: skillsFields.length,
                techSkillsLevel,
                progressPerField: techSkillsProgressPerField
            });
            
            const techSkillsAngle = angleSlice * 3 - Math.PI / 2; // Tech Skills is at index 3
            const techSkillsRadius = (techSkillsLevel / maxValue) * radius;

            const techSkillsPoint: [number, number] = [
                Math.cos(techSkillsAngle) * techSkillsRadius,
                Math.sin(techSkillsAngle) * techSkillsRadius
            ];

            // Update or create Tech Skills dot (don't remove existing)
            let techSkillsDot = g.select('.tech-skills-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (techSkillsDot.empty()) {
                techSkillsDot = g.append('circle')
                    .attr('class', 'tech-skills-dot')
                    .attr('cx', techSkillsPoint[0])
                    .attr('cy', techSkillsPoint[1])
                    .attr('r', 0)
                    .attr('fill', '#f39c12')
                    .attr('stroke', '#e67e22')
                    .attr('stroke-width', 2)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                techSkillsDot
                    .transition()
                    .duration(600)
                    .delay(800)
                    .ease(d3.easeBackOut)
                    .attr('r', 6)
                    .attr('opacity', 1);
            } else {
                // Move existing dot to new position with smooth animation
                techSkillsDot
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', techSkillsPoint[0])
                    .attr('cy', techSkillsPoint[1]);
            }

            // Add subtle pulsing effect to tech skills dot
            const addTechSkillsSubtlePulse = (dot: any) => {
                const pulse = () => {
                    dot.transition()
                        .duration(2000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 7)
                        .transition()
                        .duration(2000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 6)
                        .on('end', () => {
                            if (g.select('.tech-skills-dot').node()) {
                                pulse(); // Continue pulsing if element still exists
                            }
                        });
                };

                // Start pulsing after initial animation
                setTimeout(pulse, 1700);
            };

            // Add subtle pulsing to tech skills dot
            addTechSkillsSubtlePulse(techSkillsDot);
        } else {
            // Safely remove tech skills dot if no skills data
            const techSkillsDotsToRemove = g.selectAll('.tech-skills-dot');
            safeRemove(techSkillsDotsToRemove);
        }

        // Update or create Teamwork dot if work experience fields are filled
        if (hasWorkExperienceData) {
            // Calculate progressive levels based on number of filled work experience fields
            const baseTeamworkLevel = 1.0; // Starting level
            const maxTeamworkLevel = 2.6; // Maximum level they can reach
            const teamworkProgressPerField = (maxTeamworkLevel - baseTeamworkLevel) / workExperienceFields.length;
            
            const teamworkLevel = baseTeamworkLevel + (filledWorkExperienceFields.length * teamworkProgressPerField);
            
            console.log('Teamwork progression:', {
                filledCount: filledWorkExperienceFields.length,
                totalFields: workExperienceFields.length,
                teamworkLevel,
                progressPerField: teamworkProgressPerField
            });
            
            const teamworkAngle = angleSlice * 4 - Math.PI / 2; // Teamwork is at index 4
            const teamworkRadius = (teamworkLevel / maxValue) * radius;

            const teamworkPoint: [number, number] = [
                Math.cos(teamworkAngle) * teamworkRadius,
                Math.sin(teamworkAngle) * teamworkRadius
            ];

            // Update or create Teamwork dot (don't remove existing)
            let teamworkDot = g.select('.teamwork-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (teamworkDot.empty()) {
                teamworkDot = g.append('circle')
                    .attr('class', 'teamwork-dot')
                    .attr('cx', teamworkPoint[0])
                    .attr('cy', teamworkPoint[1])
                    .attr('r', 0)
                    .attr('fill', '#8e44ad')
                    .attr('stroke', '#9b59b6')
                    .attr('stroke-width', 2)
                    .attr('opacity', 0) as d3.Selection<SVGCircleElement, unknown, null, undefined>;

                teamworkDot
                    .transition()
                    .duration(600)
                    .delay(1000)
                    .ease(d3.easeBackOut)
                    .attr('r', 6)
                    .attr('opacity', 1);
            } else {
                // Move existing dot to new position with smooth animation
                teamworkDot
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadInOut)
                    .attr('cx', teamworkPoint[0])
                    .attr('cy', teamworkPoint[1]);
            }

            // Add subtle pulsing effect to teamwork dot
            const addTeamworkSubtlePulse = (dot: any) => {
                const pulse = () => {
                    dot.transition()
                        .duration(2000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 7)
                        .transition()
                        .duration(2000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 6)
                        .on('end', () => {
                            if (g.select('.teamwork-dot').node()) {
                                pulse(); // Continue pulsing if element still exists
                            }
                        });
                };

                // Start pulsing after initial animation
                setTimeout(pulse, 1900);
            };

            // Add subtle pulsing to teamwork dot
            addTeamworkSubtlePulse(teamworkDot);
        } else {
            // Safely remove teamwork dot if no work experience data
            const teamworkDotsToRemove = g.selectAll('.teamwork-dot');
            safeRemove(teamworkDotsToRemove);
        }

        // Create comprehensive shape that encloses all visible dots
        // Collect all visible dot positions with their proper hexagon indices
        const dotPositions: { point: [number, number], index: number }[] = [];

        // Always include Background (index 0) and Job Match (index 5)
        dotPositions.push({ point: backgroundPoint, index: 0 });
        dotPositions.push({ point: jobMatchPoint, index: 5 });

        // Add Education and Professional dots if education data exists
        if (hasEducationData) {
            // Calculate education and professional positions
            const baseEducationLevel = 1.0;
            const maxEducationLevel = 2.5;
            const educationProgressPerField = (maxEducationLevel - baseEducationLevel) / educationFields.length;

            const educationLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField);
            let professionalLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField * 0.9);

            // Professional gets additional boost from skills and work experience data
            if (hasSkillsData) {
                const skillsBoost = filledSkillsFields.length * 0.15;
                professionalLevel += skillsBoost;
            }
            if (hasWorkExperienceData) {
                const workExperienceBoost = filledWorkExperienceFields.length * 0.2;
                professionalLevel += workExperienceBoost;
            }

            const educationAngle = angleSlice * 1 - Math.PI / 2;
            const professionalAngle = angleSlice * 2 - Math.PI / 2;
            const educationRadius = (educationLevel / maxValue) * radius;
            const professionalRadius = (professionalLevel / maxValue) * radius;

            const educationPoint: [number, number] = [
                Math.cos(educationAngle) * educationRadius,
                Math.sin(educationAngle) * educationRadius
            ];
            const professionalPoint: [number, number] = [
                Math.cos(professionalAngle) * professionalRadius,
                Math.sin(professionalAngle) * professionalRadius
            ];

            dotPositions.push({ point: educationPoint, index: 1 });
            dotPositions.push({ point: professionalPoint, index: 2 });
        }

        // Add Tech Skills dot if skills data exists
        if (hasSkillsData) {
            const baseTechSkillsLevel = 1.0;
            const maxTechSkillsLevel = 2.8;
            const techSkillsProgressPerField = (maxTechSkillsLevel - baseTechSkillsLevel) / skillsFields.length;
            const techSkillsLevel = baseTechSkillsLevel + (filledSkillsFields.length * techSkillsProgressPerField);

            const techSkillsAngle = angleSlice * 3 - Math.PI / 2;
            const techSkillsRadius = (techSkillsLevel / maxValue) * radius;

            const techSkillsPoint: [number, number] = [
                Math.cos(techSkillsAngle) * techSkillsRadius,
                Math.sin(techSkillsAngle) * techSkillsRadius
            ];

            dotPositions.push({ point: techSkillsPoint, index: 3 });
        }

        // Add Teamwork dot if work experience data exists
        if (hasWorkExperienceData) {
            const baseTeamworkLevel = 1.0;
            const maxTeamworkLevel = 2.6;
            const teamworkProgressPerField = (maxTeamworkLevel - baseTeamworkLevel) / workExperienceFields.length;
            const teamworkLevel = baseTeamworkLevel + (filledWorkExperienceFields.length * teamworkProgressPerField);

            const teamworkAngle = angleSlice * 4 - Math.PI / 2;
            const teamworkRadius = (teamworkLevel / maxValue) * radius;

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

        // Add gentle pulsing effect to main dots
        const addGentlePulse = (dot: any) => {
            const pulse = () => {
                dot.transition()
                    .duration(2500)
                    .ease(d3.easeSinInOut)
                    .attr('r', 7)
                    .transition()
                    .duration(2500)
                    .ease(d3.easeSinInOut)
                    .attr('r', 6)
                    .on('end', () => {
                        if (g.select('.progress-dot, .background-dot, .jobmatch-dot').node()) {
                            pulse(); // Continue pulsing if elements still exist
                        }
                    });
            };

            // Start pulsing after initial animation
            setTimeout(pulse, 2000);
        };

        // Add gentle pulsing to main dots
        addGentlePulse(backgroundDot);
        addGentlePulse(jobMatchDot);
    };


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputBlur = () => {
        // Trigger chart update when user leaves any field
        if (svgRef.current) {
            // Small delay to ensure state is updated
            const updateTimer = setTimeout(() => {
                if (svgRef.current) {
                    updateChartWithFormData();
                }
            }, 50);

            // Store the timer reference for potential cleanup
            return () => clearTimeout(updateTimer);
        }
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
        if (currentStep < 5) {
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

    return (
        <div className={styles.container} style={{ backgroundColor: '#edece3' }}>
            <Head>
                <title>Resume Evaluation Assessment</title>
                <meta name="description" content="Interactive resume evaluation radar chart" />
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
                    <h1 className={styles.title} style={{ backgroundColor: '#ffffff', marginBottom: 12, paddingBottom: 0 }}>Resume Evaluation Assessment</h1>
                    <ProgressBar step={currentStep} totalSteps={4} />

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
                                            <div className={styles.legendColor} style={{ background: '#90EE90' }}></div>
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            <div className={styles.legendColor} style={{ background: '#90EE90' }}></div>
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            <div className={styles.legendColor} style={{ background: '#90EE90' }}></div>
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
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
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                            placeholder="e.g., React, Angular, Vue.js"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="tools" className={styles.label}>
                                            Others
                                        </label>
                                        <input
                                            type="text"
                                            id="tools"
                                            value={formData.tools}
                                            onChange={(e) => handleInputChange('tools', e.target.value)}
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                            placeholder="e.g., Soft skills, Certifications"
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
                                            <div className={styles.legendColor} style={{ background: '#90EE90' }}></div>
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
                                                    onBlur={handleInputBlur}
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
                                                    onBlur={handleInputBlur}
                                                    className={styles.input}
                                                    placeholder="Enter job title"
                                                />
                                            </div>

                                            <div className={styles.formGroup} style={{ width: '20%', marginLeft: '2.5%' }}>
                                                <label htmlFor={`employedYears_${index}`} className={styles.label}>
                                                    Years
                                                </label>
                                                <select
                                                    id={`employedYears_${index}`}
                                                    value={experience.employedYears}
                                                    onChange={(e) => handleWorkExperienceChange(index, 'employedYears', e.target.value)}
                                                    onBlur={handleInputBlur}
                                                    className={styles.input}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="None">None</option>
                                                    <option value="Less than 1 year">&lt; 1 year</option>
                                                    <option value="1 to 3 years">1-3 years</option>
                                                    <option value="3 to 8 years">3-8 years</option>
                                                    <option value="8 years or more">8+ years</option>
                                                </select>
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
                                            <div className={styles.legendColor} style={{ background: '#90EE90' }}></div>
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
                                            onClick={() => alert('Analysis feature coming soon!')}
                                            style={{ minWidth: 120, maxWidth: 140 }}
                                        >
                                            Analysis
                                        </button>
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
