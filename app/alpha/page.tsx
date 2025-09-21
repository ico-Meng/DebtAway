"use client";

import { useState, useRef, useEffect } from 'react';
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
        // Work Experience page fields
        companyName: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    // Radar chart data
    const labels = ['Background', 'Education', 'Professional', 'Tech Skills', 'Teamwork', 'Job Match'];
    const maxValue = 10;
    const radius = 180;
    const levels = 5;
    const angleSlice = (Math.PI * 2) / labels.length;

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
        const initChart = () => {
            if (svgRef.current) {
                console.log('SVG ref found, initializing D3 chart...');
                initializeChart();
            } else {
                console.log('SVG ref not ready yet, retrying...');
                setTimeout(initChart, 100);
            }
        };

        // Start initialization with small delay for DOM readiness
        const timer = setTimeout(initChart, 100);
        return () => clearTimeout(timer);
    }, []);

    // Add useEffect to set body class
    useEffect(() => {
        // Add class to body for specific styling
        document.body.classList.add('alpha-page');
        
        // Clean up function
        return () => {
            document.body.classList.remove('alpha-page');
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
        if (!targetJob && svgRef.current) {
            removeGreyArea();
        }
    }, [targetJob]);

    // Update chart when form data changes (works on both steps)
    useEffect(() => {
        if (svgRef.current) {
            updateChartWithFormData();
        }
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

            // Set SVG attributes
            svg.attr('width', width)
               .attr('height', height)
               .attr('viewBox', `0 0 ${width} ${height}`);

            // Clear any existing content
            svg.selectAll('*').remove();

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
                    greyArea.remove();
                    console.log('Grey area removed');
                });
        }
    };


    const updateChartWithFormData = () => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const svg = d3.select(svgElement);
        const g = svg.select('.chart-group');

        // Count filled fields (excluding target job since it's handled separately)
        const filledFields = Object.values(formData).filter(value => value.trim() !== '').length;
        
        // Check if any education fields are filled
        const educationFields = ['collegeName', 'degree', 'major', 'graduationYear'];
        const filledEducationFields = educationFields.filter(field => formData[field as keyof typeof formData].trim() !== '');
        const hasEducationData = filledEducationFields.length > 0;
        
        // Check if any skills fields are filled
        const skillsFields = ['programmingLanguages', 'frameworks', 'databases', 'tools'];
        const filledSkillsFields = skillsFields.filter(field => formData[field as keyof typeof formData].trim() !== '');
        const hasSkillsData = filledSkillsFields.length > 0;
        
        console.log('Updating chart with filled fields:', filledFields, formData);
        console.log('Education fields filled:', filledEducationFields.length, hasEducationData);
        console.log('Filled education fields:', filledEducationFields);
        console.log('Skills fields filled:', filledSkillsFields.length, hasSkillsData);
        console.log('Filled skills fields:', filledSkillsFields);

        // Only proceed if there are filled fields
        if (filledFields === 0) {
            // Remove any existing progress dots and triangle
            g.selectAll('.progress-dot, .progress-triangle, .education-dot, .professional-dot, .tech-skills-dot').remove();
            console.log('No filled fields, removing animations');
            return;
        }

        console.log('Proceeding with animation for', filledFields, 'filled fields');

        // Calculate values for Background and Job Match starting at level 2
        const baseLevel = 2;
        const maxLevel = 3.5; // Maximum level they can reach
        const progressPerField = (maxLevel - baseLevel) / 4; // 4 total fields to fill

        const backgroundValue = baseLevel + (filledFields * progressPerField);
        let jobMatchValue = baseLevel + (filledFields * progressPerField * 0.8); // Job Match grows slightly slower
        
        // Job Match gets additional boost from skills data
        if (hasSkillsData) {
            const skillsBoost = filledSkillsFields.length * 0.2; // Additional boost per skill field
            jobMatchValue += skillsBoost;
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
            // Move existing dot to new position with ultra-smooth animation
            backgroundDot
                .transition()
                .duration(1800)
                .ease(d3.easeElasticOut.amplitude(1.2).period(0.6))
                .attr('cx', backgroundPoint[0])
                .attr('cy', backgroundPoint[1])
                .on('start', function() {
                    // Add enhanced glow and scale effect during movement
                    const dot = d3.select(this);
                    dot.transition()
                        .duration(300)
                        .attr('r', 10)
                        .attr('opacity', 0.9)
                        .transition()
                        .duration(300)
                        .attr('r', 6)
                        .attr('opacity', 1);
                })
                .on('end', function() {
                    // Add a subtle "settle" effect when movement completes
                    const dot = d3.select(this);
                    dot.transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('r', 7)
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('r', 6);
                });
        }
        
        // Set final position for new dots
        backgroundDot.attr('cx', backgroundPoint[0]).attr('cy', backgroundPoint[1]);


        // Update or create Job Match dot (don't remove existing)
        let jobMatchDot = g.select('.jobmatch-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
        if (jobMatchDot.empty()) {
            jobMatchDot = g.append('circle')
                .attr('class', 'progress-dot jobmatch-dot')
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
            // Move existing dot to new position with ultra-smooth animation
            jobMatchDot
                .transition()
                .duration(1800)
                .ease(d3.easeElasticOut.amplitude(1.2).period(0.6))
                .attr('cx', jobMatchPoint[0])
                .attr('cy', jobMatchPoint[1])
                .on('start', function() {
                    // Add enhanced glow and scale effect during movement
                    const dot = d3.select(this);
                    dot.transition()
                        .duration(300)
                        .attr('r', 10)
                        .attr('opacity', 0.9)
                        .transition()
                        .duration(300)
                        .attr('r', 6)
                        .attr('opacity', 1);
                })
                .on('end', function() {
                    // Add a subtle "settle" effect when movement completes
                    const dot = d3.select(this);
                    dot.transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('r', 7)
                        .transition()
                        .duration(400)
                        .ease(d3.easeBounceOut)
                        .attr('r', 6);
                });
        }
        
        // Set final position for new dots
        jobMatchDot.attr('cx', jobMatchPoint[0]).attr('cy', jobMatchPoint[1]);


        // Update or create Education and Professional dots if education fields are filled
        if (hasEducationData) {
            // Calculate progressive levels based on number of filled education fields
            const baseEducationLevel = 1.0; // Starting level
            const maxEducationLevel = 2.5; // Maximum level they can reach
            const educationProgressPerField = (maxEducationLevel - baseEducationLevel) / educationFields.length;
            
            const educationLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField);
            let professionalLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField * 0.9); // Professional grows slightly slower
            
            // Professional gets additional boost from skills data
            if (hasSkillsData) {
                const skillsBoost = filledSkillsFields.length * 0.15; // Additional boost per skill field
                professionalLevel += skillsBoost;
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
                // Move existing dot to new position with ultra-smooth animation
                educationDot
                    .transition()
                    .duration(1800)
                    .ease(d3.easeElasticOut.amplitude(1.2).period(0.6))
                    .attr('cx', educationPoint[0])
                    .attr('cy', educationPoint[1])
                    .on('start', function() {
                        // Add enhanced glow and scale effect during movement
                        const dot = d3.select(this);
                        dot.transition()
                            .duration(300)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(300)
                            .attr('r', 6)
                            .attr('opacity', 1);
                    })
                    .on('end', function() {
                        // Add a subtle "settle" effect when movement completes
                        const dot = d3.select(this);
                        dot.transition()
                            .duration(400)
                            .ease(d3.easeBounceOut)
                            .attr('r', 7)
                            .transition()
                            .duration(400)
                            .ease(d3.easeBounceOut)
                            .attr('r', 6);
                    });
            }
            
            // Set final position for new dots
            educationDot.attr('cx', educationPoint[0]).attr('cy', educationPoint[1]);


            // Update or create Professional dot (don't remove existing)
            let professionalDot = g.select('.professional-dot') as d3.Selection<SVGCircleElement, unknown, null, undefined>;
            if (professionalDot.empty()) {
                professionalDot = g.append('circle')
                    .attr('class', 'professional-dot')
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
                // Move existing dot to new position with ultra-smooth animation
                professionalDot
                    .transition()
                    .duration(1800)
                    .ease(d3.easeElasticOut.amplitude(1.2).period(0.6))
                    .attr('cx', professionalPoint[0])
                    .attr('cy', professionalPoint[1])
                    .on('start', function() {
                        // Add enhanced glow and scale effect during movement
                        const dot = d3.select(this);
                        dot.transition()
                            .duration(300)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(300)
                            .attr('r', 6)
                            .attr('opacity', 1);
                    })
                    .on('end', function() {
                        // Add a subtle "settle" effect when movement completes
                        const dot = d3.select(this);
                        dot.transition()
                            .duration(400)
                            .ease(d3.easeBounceOut)
                            .attr('r', 7)
                            .transition()
                            .duration(400)
                            .ease(d3.easeBounceOut)
                            .attr('r', 6);
                    });
            }
            
            // Set final position for new dots
            professionalDot.attr('cx', professionalPoint[0]).attr('cy', professionalPoint[1]);


            // Add pulsing effect to education and professional dots
            const addPulse = (dot: any) => {
                const pulse = () => {
                    dot.transition()
                        .duration(1000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 8)
                        .transition()
                        .duration(1000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 6)
                        .on('end', () => {
                            if (g.select('.education-dot, .professional-dot').node()) {
                                pulse(); // Continue pulsing if elements still exist
                            }
                        });
                };

                // Start pulsing after initial animation
                setTimeout(pulse, 1000);
            };

            // Add pulsing to education and professional dots
            addPulse(educationDot);
            addPulse(professionalDot);
        } else {
            // Remove education and professional dots if no education data
            g.selectAll('.education-dot, .professional-dot').remove();
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
                // Move existing dot to new position with ultra-smooth animation
                techSkillsDot
                    .transition()
                    .duration(1800)
                    .ease(d3.easeElasticOut.amplitude(1.2).period(0.6))
                    .attr('cx', techSkillsPoint[0])
                    .attr('cy', techSkillsPoint[1])
                    .on('start', function() {
                        // Add enhanced glow and scale effect during movement
                        const dot = d3.select(this);
                        dot.transition()
                            .duration(300)
                            .attr('r', 10)
                            .attr('opacity', 0.9)
                            .transition()
                            .duration(300)
                            .attr('r', 6)
                            .attr('opacity', 1);
                    })
                    .on('end', function() {
                        // Add a subtle "settle" effect when movement completes
                        const dot = d3.select(this);
                        dot.transition()
                            .duration(400)
                            .ease(d3.easeBounceOut)
                            .attr('r', 7)
                            .transition()
                            .duration(400)
                            .ease(d3.easeBounceOut)
                            .attr('r', 6);
                    });
            }
            
            // Set final position for new dots
            techSkillsDot.attr('cx', techSkillsPoint[0]).attr('cy', techSkillsPoint[1]);

            // Add pulsing effect to tech skills dot
            const addTechSkillsPulse = (dot: any) => {
                const pulse = () => {
                    dot.transition()
                        .duration(1000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 8)
                        .transition()
                        .duration(1000)
                        .ease(d3.easeSinInOut)
                        .attr('r', 6)
                        .on('end', () => {
                            if (g.select('.tech-skills-dot').node()) {
                                pulse(); // Continue pulsing if element still exists
                            }
                        });
                };

                // Start pulsing after initial animation
                setTimeout(pulse, 1200);
            };

            // Add pulsing to tech skills dot
            addTechSkillsPulse(techSkillsDot);
        } else {
            // Remove tech skills dot if no skills data
            g.selectAll('.tech-skills-dot').remove();
        }

        // Create area that always covers all visible dots
        let trianglePoints: [number, number][] = [
            [0, 0], // Center
            backgroundPoint,
            jobMatchPoint
        ];

        // If education data exists, include education and professional dots in the shape
        if (hasEducationData) {
            // Use the same progressive calculation as above
            const baseEducationLevel = 1.0;
            const maxEducationLevel = 2.5;
            const educationProgressPerField = (maxEducationLevel - baseEducationLevel) / educationFields.length;
            
            const educationLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField);
            let professionalLevel = baseEducationLevel + (filledEducationFields.length * educationProgressPerField * 0.9);
            
            // Professional gets additional boost from skills data
            if (hasSkillsData) {
                const skillsBoost = filledSkillsFields.length * 0.15; // Additional boost per skill field
                professionalLevel += skillsBoost;
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

            // Create a shape that connects all visible dots in proper order
            // Order points to create a proper polygon that encloses all dots
            trianglePoints = [
                [0, 0], // Center
                backgroundPoint,
                educationPoint,
                professionalPoint,
                jobMatchPoint
            ];
            
            // Add Tech Skills dot to the shape if skills data exists
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
                
                // Insert Tech Skills point in the correct position (between Professional and Job Match)
                trianglePoints = [
                    [0, 0], // Center
                    backgroundPoint,
                    educationPoint,
                    professionalPoint,
                    techSkillsPoint,
                    jobMatchPoint
                ];
            }
        }

        // If no education data but skills data exists, create shape with Tech Skills dot
        if (!hasEducationData && hasSkillsData) {
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
            
            trianglePoints = [
                [0, 0], // Center
                backgroundPoint,
                techSkillsPoint,
                jobMatchPoint
            ];
        }

        // Ensure the shape always encloses all visible dots by creating a convex hull
        // Sort points by angle from center to ensure proper polygon formation
        const centerPoint = [0, 0];
        const sortedPoints = trianglePoints
            .filter(point => point[0] !== 0 || point[1] !== 0) // Remove center point
            .sort((a, b) => {
                const angleA = Math.atan2(a[1] - centerPoint[1], a[0] - centerPoint[0]);
                const angleB = Math.atan2(b[1] - centerPoint[1], b[0] - centerPoint[0]);
                return angleA - angleB;
            });

        // Reconstruct trianglePoints with center first, then sorted points
        trianglePoints = [centerPoint as [number, number], ...sortedPoints];

        // Create line generator for triangle
        const line = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveLinearClosed);

        // Remove existing triangle and create new one
        g.selectAll('.progress-triangle').remove();

        // Create triangle with growing animation
        const triangle = g.append('path')
            .datum(trianglePoints)
            .attr('class', 'progress-triangle')
            .attr('d', line)
            .attr('fill', 'rgba(207, 174, 232, 0.4)') // Purple with transparency
            .attr('stroke', '#CFAEE8')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0)
            .style('transform', 'scale(0)')
            .style('transform-origin', '0px 0px'); // Center at origin since g is translated

        // Animate triangle appearance with ultra-smooth timing
        triangle
            .transition()
            .duration(2000)
            .delay(400)
            .ease(d3.easeElasticOut.amplitude(0.8).period(0.4))
            .attr('opacity', 0.7)
            .style('transform', 'scale(1)');

        // Add elegant pulsing effect to dots
        const addPulse = (dot: any) => {
            const pulse = () => {
                dot.transition()
                    .duration(1500)
                    .ease(d3.easeSinInOut)
                    .attr('r', 9)
                    .transition()
                    .duration(1500)
                    .ease(d3.easeSinInOut)
                    .attr('r', 6)
                    .on('end', () => {
                        if (g.select('.progress-dot, .education-dot, .professional-dot').node()) {
                            pulse(); // Continue pulsing if elements still exist
                        }
                    });
            };

            // Start pulsing after initial animation
            setTimeout(pulse, 1800);
        };

        // Add pulsing to dots
        addPulse(backgroundDot);
        addPulse(jobMatchDot);
        
        // Add pulsing to tech skills dot if it exists
        if (hasSkillsData) {
            const techSkillsDot = g.select('.tech-skills-dot');
            if (!techSkillsDot.empty()) {
                addPulse(techSkillsDot);
            }
        }
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
            setTimeout(() => {
                updateChartWithFormData();
            }, 50);
        }
    };


    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
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

                                <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Target Job</h2>

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

                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="companyName" className={styles.label}>
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            value={formData.companyName}
                                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                            placeholder="Enter company name"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="jobTitle" className={styles.label}>
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                            placeholder="Enter job title"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer}>
                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="startDate" className={styles.label}>
                                            Start Date
                                        </label>
                                        <input
                                            type="month"
                                            id="startDate"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                        <label htmlFor="endDate" className={styles.label}>
                                            End Date
                                        </label>
                                        <input
                                            type="month"
                                            id="endDate"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                            placeholder="Leave blank if current"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRowContainer}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="description" className={styles.label}>
                                            Job Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            onBlur={handleInputBlur}
                                            className={styles.input}
                                            placeholder="Describe your key responsibilities and achievements"
                                            rows={4}
                                            style={{ resize: 'vertical', minHeight: '100px' }}
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
                                        onClick={() => alert('Form completed!')}
                                        style={{ minWidth: 120, maxWidth: 140 }}
                                    >
                                        Submit
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
