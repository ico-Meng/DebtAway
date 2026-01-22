'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../dashboard.module.css';

interface HexGraphProps {
  personalCapabilityScores?: {
    background: number;
    education: number;
    professional: number;
    techSkills: number;
    teamwork: number;
    jobMatch: number;
  };
  resumePowerScores?: {
    background: number;
    education: number;
    professional: number;
    techSkills: number;
    teamwork: number;
    jobMatch: number;
  };
  selectedType: 'personal' | 'resume';
  onEndpointClick?: (dimensionName: string | null) => void;
}

export default function HexGraph({ 
  personalCapabilityScores, 
  resumePowerScores, 
  selectedType,
  onEndpointClick 
}: HexGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const selectedDimensionRef = useRef<string | null>(null);
  const onEndpointClickRef = useRef(onEndpointClick);
  const previousScoresRef = useRef<{ personal?: any; resume?: any; type?: string }>({});
  
  // Update ref when callback changes (but don't trigger re-render)
  useEffect(() => {
    onEndpointClickRef.current = onEndpointClick;
  }, [onEndpointClick]);

  // Helper function to compare scores objects
  const scoresEqual = (a: any, b: any): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      a.background === b.background &&
      a.education === b.education &&
      a.professional === b.professional &&
      a.techSkills === b.techSkills &&
      a.teamwork === b.teamwork &&
      a.jobMatch === b.jobMatch
    );
  };

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Check if scores actually changed
    const currentScores = selectedType === 'personal' ? personalCapabilityScores : resumePowerScores;
    const previousScores = previousScoresRef.current[selectedType];
    const typeChanged = previousScoresRef.current.type !== selectedType;
    
    // Only redraw if scores changed or type changed
    if (!typeChanged && scoresEqual(currentScores, previousScores)) {
      // Scores haven't changed, don't redraw - just update selected state if needed
      return;
    }

    // Update previous scores reference
    previousScoresRef.current = {
      personal: personalCapabilityScores,
      resume: resumePowerScores,
      type: selectedType
    };

    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const labels = ['Background', 'Education', 'Professional', 'Tech Skills', 'Teamwork', 'Job Match'];
    const radius = 140;
    const levels = 5;
    const angleSlice = (Math.PI * 2) / labels.length;

    // Clear existing content
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Set SVG attributes
    svg.attr('width', width)
       .attr('height', height)
       .attr('viewBox', `0 0 ${width} ${height}`);

    // Create gradients
    const defs = svg.append('defs');

    // Warm beige gradient for the hexagon (matching dashboard theme)
    const mainHexGradient = defs.append('radialGradient')
      .attr('id', 'analysisMainHexGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    mainHexGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#faf8f4')
      .attr('stop-opacity', 0.95);

    mainHexGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#f5f2eb')
      .attr('stop-opacity', 0.85);

    mainHexGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#edece3')
      .attr('stop-opacity', 0.7);

    // Subtle accent gradient for data area
    const dataAreaGradient = defs.append('linearGradient')
      .attr('id', 'analysisDataGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    dataAreaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#D6BF9A')
      .attr('stop-opacity', 0.25);

    dataAreaGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#9B6A10')
      .attr('stop-opacity', 0.15);

    dataAreaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#D6BF9A')
      .attr('stop-opacity', 0.2);

    // Create main group and translate to center with subtle 3D effect
    const g = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .style('filter', 'drop-shadow(0 0 1px rgba(155, 106, 16, 0.05))');

    // Draw grid
    drawGrid(g);

    // Draw both data hexagons (personal and resume) if they exist
    // Draw non-selected one first (behind) with 0.3 opacity
    if (personalCapabilityScores && selectedType !== 'personal') {
      drawDataHexagon(g, personalCapabilityScores, 'personal', labels, angleSlice, radius, defs, false, 0.3);
    }
    if (resumePowerScores && selectedType !== 'resume') {
      drawDataHexagon(g, resumePowerScores, 'resume', labels, angleSlice, radius, defs, false, 0.3);
    }
    
    // Draw selected hexagon on top with full opacity and interactivity
    const scores = selectedType === 'personal' ? personalCapabilityScores : resumePowerScores;
    if (scores) {
      drawDataHexagon(g, scores, selectedType, labels, angleSlice, radius, defs, true, 0.7);
    }

    function drawGrid(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
      // Create the main hexagon points
      const hexPoints: [number, number][] = [];
      for (let i = 0; i < labels.length; i++) {
        const angle = angleSlice * i - Math.PI / 2;
        hexPoints.push([
          Math.cos(angle) * radius,
          Math.sin(angle) * radius
        ]);
      }

      // Create D3 line generator for hexagon
      const line = d3.line<[number, number]>()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveLinearClosed);

      // Draw the main hexagon with warm beige gradient and 3D shadow
      const mainHexPath = g.append('path')
        .datum(hexPoints)
        .attr('class', 'main-hexagon')
        .attr('d', line)
        .attr('fill', 'url(#analysisMainHexGradient)')
        .attr('stroke', 'rgba(214, 191, 154, 0.6)')
        .attr('stroke-width', 2.5)
        .attr('opacity', 1)
        .style('filter', 'drop-shadow(0 4px 8px rgba(155, 106, 16, 0.15)) drop-shadow(0 8px 16px rgba(155, 106, 16, 0.1)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))')
        .style('cursor', 'pointer');
      
      // Make hexagon body clickable to show all results
      if (onEndpointClick) {
        mainHexPath.on('click', () => {
          onEndpointClick(null);
        });
      }

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
          .attr('stroke', 'rgba(214, 191, 154, 0.3)')
          .attr('stroke-width', 1)
          .attr('opacity', 0.6)
          .style('stroke-dasharray', level === levels ? 'none' : '3,3')
          .style('filter', level === levels ? 'drop-shadow(0 1px 2px rgba(155, 106, 16, 0.05))' : 'none');
      }

      // Draw axis lines with modern styling
      g.selectAll('.axis-line')
        .data(labels)
        .enter()
        .append('line')
        .attr('class', 'axis-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (_, i) => Math.cos(angleSlice * i - Math.PI / 2) * radius)
        .attr('y2', (_, i) => Math.sin(angleSlice * i - Math.PI / 2) * radius)
        .attr('stroke', 'rgba(214, 191, 154, 0.4)')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.5);

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
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', "var(--font-comfortaa), 'Comfortaa', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif")
        .attr('fill', '#5a5248')
        .attr('letter-spacing', '0.2px')
        .style('text-shadow', '0 1px 2px rgba(255, 255, 255, 0.8)')
        .text(d => d);
    }

    function drawGreyArea(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
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

      // Create data area with modern gradient and 3D shadow effect
      const dataArea = g.insert('path', ':first-child')
        .datum(hexPoints)
        .attr('class', 'data-area')
        .attr('d', line)
        .attr('fill', 'url(#analysisDataGradient)')
        .attr('stroke', 'rgba(155, 106, 16, 0.3)')
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .style('transform', 'scale(0)')
        .style('transform-origin', '0px 0px')
        .style('filter', 'drop-shadow(0 3px 8px rgba(155, 106, 16, 0.2)) drop-shadow(0 6px 12px rgba(155, 106, 16, 0.12)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))');

      // Animate data area appearance with smooth easing
      dataArea
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('opacity', 0.6)
        .style('transform', 'scale(1)');
    }

    function drawDataHexagon(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      scores: { background: number; education: number; professional: number; techSkills: number; teamwork: number; jobMatch: number },
      type: 'personal' | 'resume',
      labelsArray: string[],
      angleSliceValue: number,
      radiusValue: number,
      defsElement: d3.Selection<SVGDefsElement, unknown, null, undefined>,
      isInteractive: boolean = true,
      targetOpacity: number = 0.7
    ) {
      // Map scores to data points (0-10 scale, center is 0, edge is 10)
      const scoreValues = [
        scores.background,
        scores.education,
        scores.professional,
        scores.techSkills,
        scores.teamwork,
        scores.jobMatch,
      ];

      // Create data points based on scores (normalized to radius, where 0 = center, 10 = full radius)
      const dataPoints: [number, number][] = [];
      for (let i = 0; i < labelsArray.length; i++) {
        const angle = angleSliceValue * i - Math.PI / 2;
        // Scale: 0 = center (0), 10 = full radius (radiusValue)
        const scoreRadius = (scoreValues[i] / 10) * radiusValue;
        dataPoints.push([
          Math.cos(angle) * scoreRadius,
          Math.sin(angle) * scoreRadius
        ]);
      }

      // Create D3 line generator
      const line = d3.line<[number, number]>()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveLinearClosed);

      // Define colors based on type
      const colors = type === 'personal' 
        ? { 
            fill: '#8b5cf6', 
            stroke: '#7c3aed',
            gradient: ['#a78bfa', '#8b5cf6', '#7c3aed']
          }
        : { 
            fill: '#fb7185', 
            stroke: '#f43f5e',
            gradient: ['#fda4af', '#fb7185', '#f43f5e']
          };

      // Create gradient for data hexagon
      const dataGradient = defsElement.append('linearGradient')
        .attr('id', `dataGradient-${type}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');

      dataGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.gradient[0])
        .attr('stop-opacity', 1.0);

      dataGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', colors.gradient[1])
        .attr('stop-opacity', 1.0);

      dataGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.gradient[2])
        .attr('stop-opacity', 1.0);

      // Draw data hexagon
      const dataHex = g.append('path')
        .datum(dataPoints)
        .attr('class', `data-hexagon data-hexagon-${type}`)
        .attr('d', line)
        .attr('fill', `url(#dataGradient-${type})`)
        .attr('stroke', colors.stroke)
        .attr('stroke-width', 2.5)
        .attr('opacity', 0)
        .style('filter', `drop-shadow(0 3px 8px rgba(${type === 'personal' ? '139, 92, 246' : '251, 113, 133'}, 0.3)) drop-shadow(0 6px 12px rgba(${type === 'personal' ? '139, 92, 246' : '251, 113, 133'}, 0.2))`)
        .style('cursor', isInteractive ? 'pointer' : 'default')
        .style('pointer-events', isInteractive ? 'auto' : 'none');
      
      // Make data hexagon clickable only if interactive
      if (isInteractive && onEndpointClickRef.current) {
        dataHex.on('click', () => {
          onEndpointClickRef.current?.(null);
        });
      }

      // Animate data hexagon appearance
      dataHex
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('opacity', targetOpacity);

      // Store endpoint circles for synchronized hover effects
      const endpointCircles: d3.Selection<SVGCircleElement, unknown, null, undefined>[] = [];
      const endpointDimensionMap: Map<SVGCircleElement, string> = new Map();
      let selectedEndpoint: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;

      // Function to apply selected style to an endpoint
      const applySelectedStyle = (circle: d3.Selection<SVGCircleElement, unknown, null, undefined>) => {
        // Interrupt any ongoing transitions
        circle.interrupt();
        // Set opacity immediately to ensure visibility
        circle.attr('opacity', 1);
        // Then animate other properties
        circle
          .transition()
          .duration(50)
          .ease(d3.easeElasticOut)
          .attr('r', 7)
          .attr('stroke-width', 3.5)
          .attr('fill', type === 'personal' ? '#a78bfa' : '#fda4af')
          .style('filter', `drop-shadow(0 0 12px ${colors.fill}) drop-shadow(0 0 20px ${colors.fill})`);
      };

      // Function to remove selected style from an endpoint
      const removeSelectedStyle = (circle: d3.Selection<SVGCircleElement, unknown, null, undefined>) => {
        // Interrupt any ongoing transitions
        circle.interrupt();
        circle
          .transition()
          .duration(50)
          .ease(d3.easeQuadOut)
          .attr('r', 4)
          .attr('stroke-width', 2)
          .attr('opacity', 1)
          .attr('fill', colors.fill)
          .style('filter', 'none');
      };

      // Draw score points (endpoints) - only for interactive hexagon
      if (isInteractive) {
        scoreValues.forEach((score, i) => {
          const angle = angleSliceValue * i - Math.PI / 2;
          const scoreRadius = (score / 10) * radiusValue;
          const x = Math.cos(angle) * scoreRadius;
          const y = Math.sin(angle) * scoreRadius;
          
          // Map index to dimension name (skip Job Match which is index 5)
          const dimensionNames = ['Background', 'Education', 'Professional', 'Tech Skills', 'Teamwork', 'Job Match'];
          const dimensionName = dimensionNames[i];

          const endpointCircle = g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', colors.fill)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0)
            .style('cursor', 'pointer')
            .style('pointer-events', 'auto');
          
          // Store endpoint circle reference before transition
          endpointCircles.push(endpointCircle);
          
          // Store dimension name mapping for this endpoint
          if (i < 5) {
            endpointCircle.each(function() {
              endpointDimensionMap.set(this, dimensionName);
            });
          }
          
          // Animate endpoint circle appearance
          endpointCircle
            .transition()
            .delay(400 + i * 50)
            .duration(300)
            .attr('opacity', 1);
          
          // Make endpoint clickable (skip Job Match as it's not in the analysis cards)
          if (onEndpointClickRef.current && i < 5) {
            // Use native DOM event handling for better control
            endpointCircle.each(function() {
              const element = this;
              // Store the click handler so we can remove it if needed
              const clickHandler = function(event: MouseEvent) {
                event.stopPropagation(); // Prevent hexagon body click
                
                const clickedDimension = endpointDimensionMap.get(element);
                if (!clickedDimension) return;
                
                // Remove selected style from previously selected endpoint
                if (selectedEndpoint && selectedEndpoint.node() !== element) {
                  removeSelectedStyle(selectedEndpoint);
                }
                
                // Apply selected style to clicked endpoint
                const clickedCircle = d3.select(element);
                if (selectedEndpoint?.node() === element || selectedDimensionRef.current === clickedDimension) {
                  // If clicking the same endpoint, deselect it
                  removeSelectedStyle(clickedCircle);
                  selectedEndpoint = null;
                  selectedDimensionRef.current = null;
                  onEndpointClickRef.current?.(null);
                } else {
                  // Select the new endpoint
                  applySelectedStyle(clickedCircle);
                  selectedEndpoint = clickedCircle;
                  selectedDimensionRef.current = clickedDimension;
                  onEndpointClickRef.current?.(clickedDimension);
                }
              };
              
              element.addEventListener('click', clickHandler);
            });
          }
        });
      }

      // Hover effect for data hexagon body only (only if interactive)
      if (isInteractive) {
        dataHex
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(50)
              .ease(d3.easeQuadOut)
              .attr('opacity', 0.7)
              .attr('stroke', type === 'personal' ? '#8b5cf6' : '#fb7185')
              .style('filter', `drop-shadow(0 4px 12px rgba(${type === 'personal' ? '139, 92, 246' : '251, 113, 133'}, 0.4)) drop-shadow(0 8px 16px rgba(${type === 'personal' ? '139, 92, 246' : '251, 113, 133'}, 0.3))`);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(50)
              .ease(d3.easeQuadOut)
              .attr('opacity', targetOpacity)
              .attr('stroke', colors.stroke)
              .style('filter', `drop-shadow(0 3px 8px rgba(${type === 'personal' ? '139, 92, 246' : '251, 113, 133'}, 0.3)) drop-shadow(0 6px 12px rgba(${type === 'personal' ? '139, 92, 246' : '251, 113, 133'}, 0.2))`);
          })
          .on('click', function() {
            // When clicking hexagon body, deselect any selected endpoint
            if (selectedEndpoint) {
              removeSelectedStyle(selectedEndpoint);
              selectedEndpoint = null;
              selectedDimensionRef.current = null;
            }
            if (onEndpointClickRef.current) {
              onEndpointClickRef.current(null);
            }
          });
      }

      // Different hover effect for endpoint circles (only if interactive and not selected)
      if (isInteractive) {
        endpointCircles.forEach(circle => {
          circle
            .on('mouseenter', function() {
              // Only apply hover effect if this endpoint is not selected
              if (selectedEndpoint?.node() !== this) {
                d3.select(this)
                  .transition()
                  .duration(150)
                  .ease(d3.easeElasticOut)
                  .attr('r', 7)
                  .attr('stroke-width', 3.5)
                  .attr('fill', type === 'personal' ? '#a78bfa' : '#fda4af')
                  .style('filter', `drop-shadow(0 0 12px ${colors.fill}) drop-shadow(0 0 20px ${colors.fill})`);
              }
            })
            .on('mouseleave', function() {
              // Only remove hover effect if this endpoint is not selected
              if (selectedEndpoint?.node() !== this) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .ease(d3.easeQuadOut)
                  .attr('r', 4)
                  .attr('stroke-width', 2)
                  .attr('fill', colors.fill)
                  .style('filter', 'none');
              }
            });
        });
      }

      // Reapply selected style if there was a previously selected dimension (only for interactive hexagon)
      // Apply immediately after endpoints are created (they start with opacity 0, then animate)
      if (isInteractive && selectedDimensionRef.current) {
        // Wait for endpoints to be created, then apply selected style
        const checkAndApply = () => {
          endpointCircles.forEach((circle, i) => {
            if (i < 5) {
              circle.each(function() {
                const dimension = endpointDimensionMap.get(this);
                if (dimension === selectedDimensionRef.current) {
                  const circleSelection = d3.select(this);
                  // Ensure it's visible and apply selected style
                  circleSelection.attr('opacity', 1);
                  applySelectedStyle(circleSelection);
                  selectedEndpoint = circleSelection;
                }
              });
            }
          });
        };
        // Apply after endpoints are created (they animate in with delay)
        setTimeout(checkAndApply, 100);
      }
    }
  }, [personalCapabilityScores, resumePowerScores, selectedType]);

  return (
    <div className={styles.hexGraphContainer}>
      <svg
        ref={svgRef}
        className={styles.hexGraphSvg}
      />
    </div>
  );
}

