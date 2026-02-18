'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from '../dashboard.module.css';
import HexGraph from './HexGraph';
import { API_ENDPOINT } from '@/app/components/config';

// Type for fetched job data
interface FetchedJobData {
  target_job_title: string;
  target_job_company: string;
  target_job_description: string;
  target_job_skill_keywords: string[];
}

interface AnalysisSectionProps {
  jobPosition: string;
  setJobPosition: (value: string) => void;
  user?: { profile?: { sub?: string } } | null;
  // Optional initial data for auto-population
  initialResumeFile?: File | null;
  initialResumeFileName?: string | null;
  initialJobPosition?: string | null;
  initialFetchedJobData?: FetchedJobData | null;
  initialKnowledgeScope?: { establishedExpertise: boolean; expandingKnowledgeBase: boolean } | null;
  autoTriggerAnalysis?: boolean;
  onAnalysisLimitExceeded?: () => void;
}

// Job input type detection
type JobInputType = 'url' | 'job_title' | 'job_description' | null;

// Resume tips to show during analysis
const RESUME_TIPS = [
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
];

export default function AnalysisSection({ 
  jobPosition, 
  setJobPosition, 
  user,
  initialResumeFile,
  initialResumeFileName,
  initialJobPosition,
  initialFetchedJobData,
  initialKnowledgeScope,
  autoTriggerAnalysis = false,
  onAnalysisLimitExceeded,
}: AnalysisSectionProps) {
  const [analysisKnowledgeScope, setAnalysisKnowledgeScope] = useState<{
    establishedExpertise: boolean;
    expandingKnowledgeBase: boolean;
  }>({
    establishedExpertise: true,
    expandingKnowledgeBase: false,
  });
  const [analysisResumeFile, setAnalysisResumeFile] = useState<File | null>(null);
  const [cachedResumeFileName, setCachedResumeFileName] = useState<string | null>(null);
  
  // Analysis results state
  const [personalCapabilityAnalysis, setPersonalCapabilityAnalysis] = useState<any>(null);
  const [resumePowerAnalysis, setResumePowerAnalysis] = useState<any>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'personal' | 'resume'>('personal');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null); // Filter for analysis cards
  const [isAnalysisResultsFadingOut, setIsAnalysisResultsFadingOut] = useState<boolean>(false);
  
  // Job input states (matching Resume section functionality)
  const [jobInputType, setJobInputType] = useState<JobInputType>(null);
  const [jobUrlError, setJobUrlError] = useState<string>('');
  const [isJobUrlValid, setIsJobUrlValid] = useState<boolean>(false);
  const [isJobUrlFetching, setIsJobUrlFetching] = useState<boolean>(false);
  const [fetchedJobData, setFetchedJobData] = useState<FetchedJobData | null>(null);
  const [isCheckmarkFadingOut, setIsCheckmarkFadingOut] = useState<boolean>(false);
  const [showJobTooltipAuto, setShowJobTooltipAuto] = useState<boolean>(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(() => Math.floor(Math.random() * RESUME_TIPS.length));
  const tipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jobTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jobTooltipRef = useRef<HTMLDivElement>(null);
  const hasAutoTriggeredRef = useRef<boolean>(false);
  const previousInitialDataRef = useRef<{ fetchedJobData: FetchedJobData | null; resumeFile: File | null } | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const previousInitialPropsRef = useRef<{
    initialResumeFile: File | null | undefined;
    initialFetchedJobData: FetchedJobData | null | undefined;
    initialKnowledgeScope: { establishedExpertise: boolean; expandingKnowledgeBase: boolean } | null | undefined;
  } | null>(null);

  // URL validation helper
  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  // Helper function to detect job input type
  const detectJobInputType = (value: string): JobInputType => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    
    // Check if it's a URL
    if (isValidUrl(trimmedValue)) {
      return 'url';
    }
    
    // Check character length to determine if it's a job title or job description
    if (trimmedValue.length < 150) {
      return 'job_title';
    } else {
      return 'job_description';
    }
  };

  // Helper function to validate job description content
  // Must contain at least 2 of: "Responsibilities", "Qualifications", "Requirements", "What you'll do", "Basic/Preferred"
  const validateJobDescriptionContent = (value: string): boolean => {
    const keywords = [
      'responsibilities',
      'qualifications', 
      'requirements',
      'what you\'ll do',
      'what you will do',
      'basic',
      'preferred'
    ];
    
    const lowerValue = value.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of keywords) {
      if (lowerValue.includes(keyword)) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    
    return false;
  };

  // Function to clear analysis results with fade-out animation
  const clearAnalysisResultsWithFade = () => {
    // Only clear if we have results to clear
    if (personalCapabilityAnalysis || resumePowerAnalysis) {
      setIsAnalysisResultsFadingOut(true);
      
      // Wait for fade-out animation then clear data
      setTimeout(() => {
        setPersonalCapabilityAnalysis(null);
        setResumePowerAnalysis(null);
        setSelectedDimension(null);
        setIsAnalysisResultsFadingOut(false);
      }, 400); // Match animation duration
    }
  };

  // Handler for job position input change
  const handleJobPositionChange = (value: string) => {
    setJobPosition(value);
    
    // Detect input type
    const inputType = detectJobInputType(value);
    setJobInputType(inputType);
    
    // Reset error when user modifies input
    setJobUrlError('');
    
    // Reset fetched data with fade-out animation when user modifies the input
    if (fetchedJobData) {
      setIsCheckmarkFadingOut(true);
      setShowJobTooltipAuto(false);
      // Clear the timer if running
      if (jobTooltipTimerRef.current) {
        clearTimeout(jobTooltipTimerRef.current);
        jobTooltipTimerRef.current = null;
      }
      // Wait for fade-out animation then clear data
      setTimeout(() => {
        setFetchedJobData(null);
        setIsCheckmarkFadingOut(false);
        // Clear cache when user modifies the input
        try {
          localStorage.removeItem('cachedJobDataAnalysis');
          localStorage.removeItem('cachedJobPositionAnalysis');
        } catch (error) {
          console.error('Failed to clear cached job data:', error);
        }
      }, 300);
    }
    
    // Clear analysis results with fade animation when job position changes
    clearAnalysisResultsWithFade();
    
    // Set valid state based on input type - all types are valid for lookup
    if (value.trim()) {
      setIsJobUrlValid(true);
    } else {
      setIsJobUrlValid(false);
      setJobInputType(null);
    }
  };

  // Fetch job handler - handles 3 input types: URL, job title (<150 chars), job description (>150 chars)
  const handleFetchJob = async () => {
    if (!isJobUrlValid || isJobUrlFetching) return;
    
    const currentInputType = detectJobInputType(jobPosition);
    
    setIsJobUrlFetching(true);
    setJobUrlError('');
    
    try {
      let response;
      let result;
      
      if (currentInputType === 'url') {
        // Type 1: URL - use existing API
        response = await fetch(`${API_ENDPOINT}/validate_and_fetch_job_url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: jobPosition })
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.error('API Error:', response.status, response.statusText, errorText);
          setJobUrlError(`Server error (${response.status}): ${response.statusText}. Please try again.`);
          return;
        }
        
        result = await response.json();
        
        if (result.success) {
          setFetchedJobData(result.data);
          setJobUrlError('');
          setIsCheckmarkFadingOut(false);
          
          // Cache the job data and URL to localStorage
          try {
            localStorage.setItem('cachedJobDataAnalysis', JSON.stringify(result.data));
            localStorage.setItem('cachedJobPositionAnalysis', jobPosition);
          } catch (error) {
            console.error('Failed to cache job data:', error);
          }
          
          // Auto-show tooltip for 3 seconds
          setShowJobTooltipAuto(true);
          if (jobTooltipTimerRef.current) {
            clearTimeout(jobTooltipTimerRef.current);
          }
          jobTooltipTimerRef.current = setTimeout(() => {
            setShowJobTooltipAuto(false);
          }, 3000);
          
          console.log('Successfully fetched job data:', result.data);
        } else {
          setJobUrlError(result.message || 'Failed to fetch job posting. Please try again.');
        }
      } else if (currentInputType === 'job_title') {
        // Type 2: Generic job title (<150 chars) - call fetch_with_job_title API
        response = await fetch(`${API_ENDPOINT}/fetch_with_job_title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_title: jobPosition.trim() })
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.error('API Error:', response.status, response.statusText, errorText);
          setJobUrlError(`Server error (${response.status}): ${response.statusText}. Please try again.`);
          return;
        }
        
        result = await response.json();
        
        if (result.success) {
          setFetchedJobData(result.data);
          setJobUrlError('');
          setIsCheckmarkFadingOut(false);
          
          // Cache the job data and job position to localStorage
          try {
            localStorage.setItem('cachedJobDataAnalysis', JSON.stringify(result.data));
            localStorage.setItem('cachedJobPositionAnalysis', jobPosition.trim());
          } catch (error) {
            console.error('Failed to cache job data:', error);
          }
          
          // Auto-show tooltip for 3 seconds
          setShowJobTooltipAuto(true);
          if (jobTooltipTimerRef.current) {
            clearTimeout(jobTooltipTimerRef.current);
          }
          jobTooltipTimerRef.current = setTimeout(() => {
            setShowJobTooltipAuto(false);
          }, 3000);
          
          console.log('Successfully fetched job data from job title:', result.data);
        } else {
          // Invalid job title
          setJobUrlError(result.message || 'Please enter a valid job title');
        }
      } else if (currentInputType === 'job_description') {
        // Type 3: Job description (>150 chars) - validate content first, then call parse_job_description API
        
        // Frontend validation: must contain at least 2 of the required keywords
        if (!validateJobDescriptionContent(jobPosition)) {
          setJobUrlError('Please copy over the full context of the job description. It should include sections like Responsibilities, Qualifications, Requirements, etc.');
          setIsJobUrlFetching(false);
          return;
        }
        
        response = await fetch(`${API_ENDPOINT}/parse_job_description`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_description: jobPosition.trim() })
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.error('API Error:', response.status, response.statusText, errorText);
          setJobUrlError(`Server error (${response.status}): ${response.statusText}. Please try again.`);
          return;
        }
        
        result = await response.json();
        
        if (result.success) {
          setFetchedJobData(result.data);
          setJobUrlError('');
          setIsCheckmarkFadingOut(false);
          
          // Cache the job data and job position to localStorage
          try {
            localStorage.setItem('cachedJobDataAnalysis', JSON.stringify(result.data));
            localStorage.setItem('cachedJobPositionAnalysis', jobPosition.trim().substring(0, 100)); // Store first 100 chars for long descriptions
          } catch (error) {
            console.error('Failed to cache job data:', error);
          }
          
          // Auto-show tooltip for 3 seconds
          setShowJobTooltipAuto(true);
          if (jobTooltipTimerRef.current) {
            clearTimeout(jobTooltipTimerRef.current);
          }
          jobTooltipTimerRef.current = setTimeout(() => {
            setShowJobTooltipAuto(false);
          }, 3000);
          
          console.log('Successfully parsed job description:', result.data);
        } else {
          setJobUrlError(result.message || 'Failed to parse job description. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setJobUrlError('Network error: Could not connect to the server. Please check if the backend is running at ' + API_ENDPOINT);
      } else if (error instanceof SyntaxError) {
        setJobUrlError('Invalid response from server. The server may not be responding correctly.');
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Full error details:', error);
        setJobUrlError(`Error: ${errorMessage}. Please check the console for details.`);
      }
    } finally {
      setIsJobUrlFetching(false);
    }
  };

  // Load cached analysis results when component mounts (always load, regardless of initial data)
  useEffect(() => {
    try {
      // Always load cached analysis results first (they persist across navigation)
      const cachedPersonalCapability = localStorage.getItem('cachedPersonalCapabilityAnalysis');
      const cachedResumePower = localStorage.getItem('cachedResumePowerAnalysis');
      const cachedSelectedType = localStorage.getItem('cachedSelectedAnalysisType');

      if (cachedPersonalCapability || cachedResumePower) {
        if (cachedPersonalCapability) {
          try {
            const parsedPersonal = JSON.parse(cachedPersonalCapability);
            setPersonalCapabilityAnalysis(parsedPersonal);
            console.log('Loaded cached personal capability analysis:', parsedPersonal);
          } catch (error) {
            console.error('Failed to parse cached personal capability analysis:', error);
          }
        }

        if (cachedResumePower) {
          try {
            const parsedResume = JSON.parse(cachedResumePower);
            setResumePowerAnalysis(parsedResume);
            console.log('Loaded cached resume power analysis:', parsedResume);
          } catch (error) {
            console.error('Failed to parse cached resume power analysis:', error);
          }
        }

        if (cachedSelectedType && (cachedSelectedType === 'personal' || cachedSelectedType === 'resume')) {
          setSelectedAnalysisType(cachedSelectedType);
        }
      }

      // Load cached job data and other settings only if no initial data is provided
      // (initial data takes precedence for job position and resume file)
      if (!initialFetchedJobData && !initialResumeFile) {
        const cachedJobData = localStorage.getItem('cachedJobDataAnalysis');
        const cachedJobPosition = localStorage.getItem('cachedJobPositionAnalysis');
        
        if (cachedJobData && cachedJobPosition) {
          const parsedJobData = JSON.parse(cachedJobData);
          setFetchedJobData(parsedJobData);
          setJobPosition(cachedJobPosition);
          setIsJobUrlValid(true);
          setIsCheckmarkFadingOut(false);
          
          // Detect input type for cached data
          const inputType = detectJobInputType(cachedJobPosition);
          setJobInputType(inputType);
          
          // Show tooltip briefly to indicate cached data is loaded
          setShowJobTooltipAuto(true);
          if (jobTooltipTimerRef.current) {
            clearTimeout(jobTooltipTimerRef.current);
          }
          jobTooltipTimerRef.current = setTimeout(() => {
            setShowJobTooltipAuto(false);
          }, 3000);
          
          console.log('Loaded cached job data:', parsedJobData);
        }
      }

      // Always restore knowledge scope and resume filename, regardless of analysis results
      const cachedKnowledgeScope = localStorage.getItem('cachedAnalysisKnowledgeScope');
      const cachedResumeFileName = localStorage.getItem('cachedAnalysisResumeFileName');

      // Restore knowledge scope if available (but initial data takes precedence)
      if (cachedKnowledgeScope && !initialKnowledgeScope) {
        try {
          const parsedScope = JSON.parse(cachedKnowledgeScope);
          setAnalysisKnowledgeScope(parsedScope);
          console.log('Loaded cached knowledge scope:', parsedScope);
        } catch (error) {
          console.error('Failed to parse cached knowledge scope:', error);
        }
      }

      // Restore resume filename if available (file object cannot be restored from localStorage)
      if (cachedResumeFileName && !initialResumeFileName) {
        setCachedResumeFileName(cachedResumeFileName);
        console.log('Loaded cached resume filename:', cachedResumeFileName);
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }, []);

  // Populate fields from initial data props (takes precedence over cached data)
  // Only runs on initial mount or when initial props change (not when user edits fields)
  useEffect(() => {
    // Check if initial props have changed (comparing by reference for objects)
    const initialPropsChanged = 
      previousInitialPropsRef.current === null ||
      previousInitialPropsRef.current.initialResumeFile !== initialResumeFile ||
      previousInitialPropsRef.current.initialFetchedJobData !== initialFetchedJobData ||
      previousInitialPropsRef.current.initialKnowledgeScope !== initialKnowledgeScope;

    // Only update fields if:
    // 1. This is the first initialization, OR
    // 2. Initial props have changed (coming from resume page with new data)
    // Don't update if user is actively editing (hasInitializedRef is true and props haven't changed)
    if (!hasInitializedRef.current || initialPropsChanged) {
      // Set resume file if provided
      if (initialResumeFile) {
        setAnalysisResumeFile(initialResumeFile);
        // Cache the filename
        if (initialResumeFileName) {
          setCachedResumeFileName(initialResumeFileName);
          try {
            localStorage.setItem('cachedAnalysisResumeFileName', initialResumeFileName);
          } catch (error) {
            console.error('Failed to cache resume filename:', error);
          }
        }
      }

      // Set job position and fetched job data if provided
      // First, determine the job position text to use
      const jobPositionText = (initialJobPosition && initialJobPosition.trim())
        ? initialJobPosition.trim()
        : ((jobPosition && jobPosition.trim()) 
          ? jobPosition.trim() 
          : (initialFetchedJobData?.target_job_title || ''));

      // Set fetched job data if provided
      if (initialFetchedJobData) {
        setFetchedJobData(initialFetchedJobData);
        setIsJobUrlValid(true);
        setIsCheckmarkFadingOut(false);

        // Cache the job data
        try {
          localStorage.setItem('cachedJobDataAnalysis', JSON.stringify(initialFetchedJobData));
          if (jobPositionText) {
            localStorage.setItem('cachedJobPositionAnalysis', jobPositionText);
          }
        } catch (error) {
          console.error('Failed to cache job data:', error);
        }

        // Show tooltip briefly
        setShowJobTooltipAuto(true);
        if (jobTooltipTimerRef.current) {
          clearTimeout(jobTooltipTimerRef.current);
        }
        jobTooltipTimerRef.current = setTimeout(() => {
          setShowJobTooltipAuto(false);
        }, 3000);
      }

      // Always set job position if we have one (regardless of whether fetchedJobData exists)
      if (jobPositionText) {
        setJobPosition(jobPositionText);
        const inputType = detectJobInputType(jobPositionText);
        setJobInputType(inputType);
        setIsJobUrlValid(true);
        
        // Cache the job position
        try {
          localStorage.setItem('cachedJobPositionAnalysis', jobPositionText);
        } catch (error) {
          console.error('Failed to cache job position:', error);
        }
      }

      // Set knowledge scope if provided
      if (initialKnowledgeScope) {
        setAnalysisKnowledgeScope(initialKnowledgeScope);
        try {
          localStorage.setItem('cachedAnalysisKnowledgeScope', JSON.stringify(initialKnowledgeScope));
        } catch (error) {
          console.error('Failed to cache knowledge scope:', error);
        }
      }

      // Mark as initialized and store current props
      hasInitializedRef.current = true;
      previousInitialPropsRef.current = {
        initialResumeFile,
        initialFetchedJobData,
        initialKnowledgeScope,
      };
    }
  }, [initialResumeFile, initialResumeFileName, initialJobPosition, initialFetchedJobData, initialKnowledgeScope]);

  // Auto-trigger analysis when all data is ready and autoTriggerAnalysis is true
  useEffect(() => {
    // Check if we have new initial data (different from previous)
    const hasNewInitialData = 
      autoTriggerAnalysis &&
      initialFetchedJobData &&
      initialResumeFile &&
      (
        previousInitialDataRef.current === null ||
        previousInitialDataRef.current.fetchedJobData !== initialFetchedJobData ||
        previousInitialDataRef.current.resumeFile !== initialResumeFile
      );

    // If we have new initial data, reset the auto-trigger flag and clear cached results
    if (hasNewInitialData) {
      hasAutoTriggeredRef.current = false;
      previousInitialDataRef.current = {
        fetchedJobData: initialFetchedJobData,
        resumeFile: initialResumeFile,
      };
      // Clear cached analysis results when new data arrives from resume page
      setPersonalCapabilityAnalysis(null);
      setResumePowerAnalysis(null);
      setSelectedDimension(null);
      // Also clear from localStorage
      try {
        localStorage.removeItem('cachedPersonalCapabilityAnalysis');
        localStorage.removeItem('cachedResumePowerAnalysis');
      } catch (error) {
        console.error('Failed to clear cached analysis results:', error);
      }
    }

    // Don't auto-trigger if:
    // 1. autoTriggerAnalysis is false
    // 2. We've already triggered
    if (!autoTriggerAnalysis || hasAutoTriggeredRef.current) {
      return;
    }

    // Check if all required data is present
    if (
      fetchedJobData &&
      analysisResumeFile &&
      user?.profile?.sub &&
      (analysisKnowledgeScope.establishedExpertise || analysisKnowledgeScope.expandingKnowledgeBase) &&
      !isAnalyzing
    ) {
      // Small delay to ensure all state is set
      const triggerTimer = setTimeout(() => {
        hasAutoTriggeredRef.current = true;
        runAnalysis();
      }, 100);

      return () => {
        clearTimeout(triggerTimer);
      };
    }
  }, [
    autoTriggerAnalysis,
    fetchedJobData,
    analysisResumeFile,
    user?.profile?.sub,
    analysisKnowledgeScope.establishedExpertise,
    analysisKnowledgeScope.expandingKnowledgeBase,
    isAnalyzing,
    initialFetchedJobData,
    initialResumeFile,
    personalCapabilityAnalysis,
    resumePowerAnalysis
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (jobTooltipTimerRef.current) {
        clearTimeout(jobTooltipTimerRef.current);
      }
      if (tooltipHoverTimerRef.current) {
        clearTimeout(tooltipHoverTimerRef.current);
      }
      if (tipTimerRef.current) {
        clearInterval(tipTimerRef.current);
      }
    };
  }, []);

  // Rotate tips every 4 seconds when analyzing
  useEffect(() => {
    if (isAnalyzing) {
      // Set initial random tip
      setCurrentTipIndex(Math.floor(Math.random() * RESUME_TIPS.length));
      
      tipTimerRef.current = setInterval(() => {
        setCurrentTipIndex(prevIndex => {
          // Pick a random index different from current
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * RESUME_TIPS.length);
          } while (newIndex === prevIndex && RESUME_TIPS.length > 1);
          return newIndex;
        });
      }, 5000);
      
      return () => {
        if (tipTimerRef.current) {
          clearInterval(tipTimerRef.current);
          tipTimerRef.current = null;
        }
      };
    } else {
      // Clear timer when not analyzing
      if (tipTimerRef.current) {
        clearInterval(tipTimerRef.current);
        tipTimerRef.current = null;
      }
    }
  }, [isAnalyzing]);

  // Compute whether Analysis button should be enabled
  // Conditions: 1) Job data fetched, 2) At least one knowledge scope checked, 3) Resume file uploaded
  const isAnalysisButtonEnabled = 
    fetchedJobData !== null &&
    (analysisKnowledgeScope.establishedExpertise || analysisKnowledgeScope.expandingKnowledgeBase) &&
    analysisResumeFile !== null;

  // Extract analysis logic into reusable function
  const runAnalysis = async () => {
    if (!fetchedJobData || !analysisResumeFile || !user?.profile?.sub) {
      setAnalysisError('Please ensure all required fields are filled.');
      return;
    }

    // Clear previous analysis results with fade-out animation
    clearAnalysisResultsWithFade();
    setSelectedAnalysisType('personal'); // Reset to default view
    setAnalysisError('');

    setIsAnalyzing(true);

    try {
      // Build knowledge scope tags array
      const knowledgeScopeTags: string[] = [];
      if (analysisKnowledgeScope.establishedExpertise) {
        knowledgeScopeTags.push('Established Expertise');
      }
      if (analysisKnowledgeScope.expandingKnowledgeBase) {
        knowledgeScopeTags.push('Expanding Knowledge Base');
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('target_job_data', JSON.stringify(fetchedJobData));
      formData.append('knowledge_scope', JSON.stringify(knowledgeScopeTags));
      formData.append('resume_file', analysisResumeFile);
      formData.append('user_id', user.profile.sub);

      const response = await fetch(`${API_ENDPOINT}/overall_analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (result.error_code === 'ANALYSIS_LIMIT_EXCEEDED') {
        onAnalysisLimitExceeded?.();
        return;
      }

      if (result.status === 'success') {
        // Ensure fade-out is complete before setting new results
        setIsAnalysisResultsFadingOut(false);
        setPersonalCapabilityAnalysis(result.personal_capability);
        setResumePowerAnalysis(result.resume_power);
        setSelectedAnalysisType('personal'); // Default to personal capability view

        // Cache analysis results in localStorage
        try {
          localStorage.setItem('cachedPersonalCapabilityAnalysis', JSON.stringify(result.personal_capability));
          localStorage.setItem('cachedResumePowerAnalysis', JSON.stringify(result.resume_power));
          localStorage.setItem('cachedSelectedAnalysisType', 'personal');
          localStorage.setItem('cachedAnalysisKnowledgeScope', JSON.stringify(analysisKnowledgeScope));
          if (analysisResumeFile) {
            localStorage.setItem('cachedAnalysisResumeFileName', analysisResumeFile.name);
          }
          console.log('Cached analysis results to localStorage');
        } catch (error) {
          console.error('Failed to cache analysis results:', error);
        }
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAnalysisError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <div className={styles.analysisLayout}>
        <div className={styles.analysisLeftColumn}>
          <div className={`${styles.analysisLeftUpper} ${isAnalysisResultsFadingOut ? styles.analysisResultsFadeOut : ''}`}>
            <HexGraph
              personalCapabilityScores={personalCapabilityAnalysis ? {
                background: personalCapabilityAnalysis.background_score,
                education: personalCapabilityAnalysis.education_score,
                professional: personalCapabilityAnalysis.professional_score,
                techSkills: personalCapabilityAnalysis.tech_skills_score,
                teamwork: personalCapabilityAnalysis.teamwork_score,
                jobMatch: personalCapabilityAnalysis.job_match_score,
              } : undefined}
              resumePowerScores={resumePowerAnalysis ? {
                background: resumePowerAnalysis.background_score,
                education: resumePowerAnalysis.education_score,
                professional: resumePowerAnalysis.professional_score,
                techSkills: resumePowerAnalysis.tech_skills_score,
                teamwork: resumePowerAnalysis.teamwork_score,
                jobMatch: resumePowerAnalysis.job_match_score,
              } : undefined}
              selectedType={selectedAnalysisType}
              onEndpointClick={(dimensionName: string | null) => {
                setSelectedDimension(dimensionName);
              }}
            />
          </div>

          <div className={styles.analysisLeftLower}>
            <div className={styles.basicInfoSubPanel}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Target Job Position</label>
                <div 
                  className={styles.jobUrlInputWrapper}
                  onMouseEnter={() => {
                    if (fetchedJobData) {
                      // Clear any pending hide timer
                      if (tooltipHoverTimerRef.current) {
                        clearTimeout(tooltipHoverTimerRef.current);
                        tooltipHoverTimerRef.current = null;
                      }
                      setIsTooltipHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (fetchedJobData) {
                      // Delay hiding the tooltip
                      tooltipHoverTimerRef.current = setTimeout(() => {
                        setIsTooltipHovered(false);
                        tooltipHoverTimerRef.current = null;
                      }, 1000); // 1 second delay before hiding
                    }
                  }}
                >
                  <input
                    type="text"
                    className={styles.formInput}
                    value={jobPosition}
                    onChange={(e) => handleJobPositionChange(e.target.value)}
                    placeholder="Enter job URL, job title (e.g., Software Engineer at Meta), or paste job description"
                  />
                  {(isJobUrlValid || fetchedJobData) && !isCheckmarkFadingOut ? (
                    <div className={`${styles.jobUrlFetchButtonWrapper}`}>
                      <button
                        type="button"
                        className={`${styles.jobUrlFetchButton} ${fetchedJobData ? styles.jobUrlFetchButtonSuccess : ''}`}
                        onClick={fetchedJobData ? undefined : handleFetchJob}
                        disabled={isJobUrlFetching || !!fetchedJobData}
                        aria-label={fetchedJobData ? "Job data fetched successfully" : "Fetch job posting"}
                      >
                        {isJobUrlFetching ? (
                          <svg
                            className={styles.jobUrlFetchSpinner}
                            width="44"
                            height="44"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="10" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.4 31.4" />
                          </svg>
                        ) : fetchedJobData ? (
                          <svg
                            className={styles.jobUrlCheckmarkIcon}
                            width="44"
                            height="44"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="#22c55e"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            className={styles.jobUrlFetchIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            height="44px"
                            viewBox="0 -960 960 960"
                            width="44px"
                            fill="#5a5248"
                          >
                            <path d="M450-420q38 0 64-26t26-64q0-38-26-64t-64-26q-38 0-64 26t-26 64q0 38 26 64t64 26Zm193 160L538-365q-20 13-42.5 19t-45.5 6q-71 0-120.5-49.5T280-510q0-71 49.5-120.5T450-680q71 0 120.5 49.5T620-510q0 23-6.5 45.5T594-422l106 106-57 56ZM200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600ZM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : isCheckmarkFadingOut ? (
                    <div className={`${styles.jobUrlFetchButtonWrapper} ${styles.fadeOut}`}>
                      <button
                        type="button"
                        className={`${styles.jobUrlFetchButton} ${styles.jobUrlFetchButtonSuccess}`}
                        disabled
                      >
                        <svg
                          className={styles.jobUrlCheckmarkIcon}
                          width="44"
                          height="44"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                  {((isJobUrlValid || fetchedJobData) && !isCheckmarkFadingOut) && (
                    <>
                      {fetchedJobData && (
                        <div 
                          ref={jobTooltipRef} 
                          className={`${styles.jobUrlFetchTooltip} ${(showJobTooltipAuto || isTooltipHovered) ? styles.jobUrlFetchTooltipVisible : ''}`}
                          onMouseEnter={() => {
                            // Clear any pending hide timer when mouse enters tooltip
                            if (tooltipHoverTimerRef.current) {
                              clearTimeout(tooltipHoverTimerRef.current);
                              tooltipHoverTimerRef.current = null;
                            }
                            setIsTooltipHovered(true);
                          }}
                          onMouseLeave={() => {
                            // Delay hiding the tooltip when mouse leaves
                            tooltipHoverTimerRef.current = setTimeout(() => {
                              setIsTooltipHovered(false);
                              tooltipHoverTimerRef.current = null;
                            }, 1000); // 1 second delay before hiding
                          }}
                        >
                          <div className={styles.jobUrlFetchTooltipHeader}>
                            <span className={styles.jobUrlFetchTooltipTitle}>{fetchedJobData.target_job_title}</span>
                            <span className={styles.jobUrlFetchTooltipCompany}>{fetchedJobData.target_job_company}</span>
                          </div>
                          <div className={styles.jobUrlFetchTooltipContent}>
                            <p className={styles.jobUrlFetchTooltipDescription}>{fetchedJobData.target_job_description}</p>
                          </div>
                          <div className={styles.jobUrlFetchTooltipSkills}>
                            {fetchedJobData.target_job_skill_keywords && fetchedJobData.target_job_skill_keywords.map((skill, index) => (
                              <span key={index} className={styles.jobUrlFetchTooltipSkillTag}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {jobUrlError && (
                  <div className={styles.fieldWarningErrorBox}>
                    <svg className={styles.fieldWarningIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="#dc3545" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.fieldWarningErrorText}>{jobUrlError}</span>
                  </div>
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Knowledge Scope</label>
                <div className={styles.knowledgeScopeCheckboxes}>
                  <label className={styles.presentCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={analysisKnowledgeScope.establishedExpertise}
                      onChange={(e) => {
                        const newScope = {
                          ...analysisKnowledgeScope,
                          establishedExpertise: e.target.checked,
                        };
                        setAnalysisKnowledgeScope(newScope);
                        localStorage.setItem('cachedAnalysisKnowledgeScope', JSON.stringify(newScope));
                        // Clear analysis results with fade animation when knowledge scope changes
                        clearAnalysisResultsWithFade();
                      }}
                      className={styles.presentCheckbox}
                    />
                    <span className={styles.presentCheckboxText}>
                      Established Expertise
                    </span>
                  </label>
                  <label className={styles.presentCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={analysisKnowledgeScope.expandingKnowledgeBase}
                      onChange={(e) => {
                        const newScope = {
                          ...analysisKnowledgeScope,
                          expandingKnowledgeBase: e.target.checked,
                        };
                        setAnalysisKnowledgeScope(newScope);
                        localStorage.setItem('cachedAnalysisKnowledgeScope', JSON.stringify(newScope));
                        // Clear analysis results with fade animation when knowledge scope changes
                        clearAnalysisResultsWithFade();
                      }}
                      className={styles.presentCheckbox}
                    />
                    <span className={styles.presentCheckboxText}>
                      Expanding Knowledge Base
                    </span>
                  </label>
                </div>
              </div>

              <div className={styles.formField}>
                <div className={styles.resumeUploadContainer}>
                  <div className={styles.resumeUploadArea}>
                    <input
                      type="file"
                      id="analysis-resume-upload"
                      accept=".pdf,.doc,.docx"
                      className={styles.resumeFileInput}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setAnalysisResumeFile(file);
                        if (file) {
                          localStorage.setItem('cachedAnalysisResumeFileName', file.name);
                          setCachedResumeFileName(file.name);
                        }
                        // Clear analysis results with fade animation when resume file changes
                        clearAnalysisResultsWithFade();
                      }}
                    />
                    <label
                      htmlFor="analysis-resume-upload"
                      className={styles.resumeUploadLabel}
                    >
                      <div className={styles.resumeUploadIcon}>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 2V8H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 13H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 17H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 9H9H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className={styles.resumeUploadContent}>
                        <span className={styles.resumeUploadTitle}>
                          {analysisResumeFile
                            ? analysisResumeFile.name
                            : cachedResumeFileName
                            ? cachedResumeFileName
                            : 'Upload Resume'}
                        </span>
                        <span className={styles.resumeUploadSubtitle}>
                          {analysisResumeFile
                            ? 'Click to change file'
                            : cachedResumeFileName
                            ? 'Previously uploaded (re-upload to use)'
                            : 'PDF, DOC, or DOCX (Max 10MB)'}
                        </span>
                      </div>
                      {(analysisResumeFile || cachedResumeFileName) && (
                        <button
                          type="button"
                          className={styles.resumeRemoveButton}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAnalysisResumeFile(null);
                            setCachedResumeFileName(null);
                            localStorage.removeItem('cachedAnalysisResumeFileName');
                            const input = document.getElementById(
                              'analysis-resume-upload',
                            ) as HTMLInputElement | null;
                            if (input) input.value = '';
                          }}
                          aria-label="Remove file"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.nextButtonContainer}>
                <button
                  type="button"
                  className={styles.nextButton}
                  disabled={!isAnalysisButtonEnabled || isAnalyzing}
                  onClick={runAnalysis}
                  aria-label="Run Analysis"
                >
                  {isAnalyzing ? (
                    <div className={styles.analyzingDotsContainer}>
                      <span className={styles.analyzingDot}></span>
                      <span className={styles.analyzingDot}></span>
                      <span className={styles.analyzingDot}></span>
                    </div>
                  ) : (
                    <span className={styles.nextButtonText}>Analysis</span>
                  )}
                </button>
              </div>
              {analysisError && (
                <div className={styles.fieldWarningErrorBox} style={{ marginTop: '1rem' }}>
                  <svg className={styles.fieldWarningIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#dc3545" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className={styles.fieldWarningErrorText}>{analysisError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.analysisRightContent} ${isAnalyzing ? styles.analysisRightContentCentered : ''}`}>
          <div className={`${styles.iconHeader} ${isAnalyzing ? styles.iconHeaderCentered : ''}`}>
            <div className={styles.sectionIcon}>
              <Image
                src="/images/bubble-chart.svg"
                alt="Analysis"
                width={80}
                height={80}
                className={styles.sectionIconImage}
              />
            </div>
          </div>
          {(personalCapabilityAnalysis || resumePowerAnalysis) && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              alignItems: 'stretch',
              marginTop: '0rem',
              marginBottom: '1rem',
              padding: '0',
              backgroundColor: 'transparent',
              borderRadius: '0',
              boxShadow: 'none',
              border: 'none',
              width: '100%',
              height: '3rem',
            }}>
              <button
                type="button"
                className={styles.analysisSwitchButton}
                onClick={() => {
                  setSelectedAnalysisType('personal');
                  setSelectedDimension(null); // Reset filter when switching types
                  // Cache selected type
                  try {
                    localStorage.setItem('cachedSelectedAnalysisType', 'personal');
                  } catch (error) {
                    console.error('Failed to cache selected analysis type:', error);
                  }
                }}
                style={{
                  padding: '1.5rem 2.5rem',
                  borderRadius: '1rem',
                  border: selectedAnalysisType === 'personal' 
                    ? '2px solid rgba(139, 92, 246, 0.5)' 
                    : '2px solid rgba(214, 191, 154, 0.3)',
                  background: selectedAnalysisType === 'personal' 
                    ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.95) 0%, rgba(139, 92, 246, 0.9) 30%, rgba(124, 58, 237, 0.85) 70%, rgba(109, 40, 217, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(250, 248, 244, 0.98) 0%, rgba(237, 236, 227, 0.98) 100%)',
                  color: selectedAnalysisType === 'personal' ? '#fff' : '#5a5248',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  fontFamily: "var(--font-comfortaa), 'Comfortaa', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  letterSpacing: '0.02em',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: selectedAnalysisType === 'personal' 
                    ? '0 12px 40px rgba(139, 92, 246, 0.4), 0 6px 20px rgba(124, 58, 237, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                    : '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  transform: selectedAnalysisType === 'personal' ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
                  position: 'relative',
                  overflow: 'hidden',
                  flex: '1',
                  minWidth: '280px',
                  maxWidth: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (selectedAnalysisType !== 'personal') {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(124, 58, 237, 0.06) 100%)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(139, 92, 246, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.color = '#8b5cf6';
                  } else {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 1) 0%, rgba(139, 92, 246, 0.95) 30%, rgba(124, 58, 237, 0.9) 70%, rgba(109, 40, 217, 0.85) 100%)';
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(139, 92, 246, 0.35), 0 8px 32px rgba(124, 58, 237, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAnalysisType !== 'personal') {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(250, 248, 244, 0.98) 0%, rgba(237, 236, 227, 0.98) 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = '#5a5248';
                  } else {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167, 139, 250, 0.95) 0%, rgba(139, 92, 246, 0.9) 30%, rgba(124, 58, 237, 0.85) 70%, rgba(109, 40, 217, 0.8) 100%)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.4), 0 6px 20px rgba(124, 58, 237, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                <span className={styles.analysisSwitchButtonText} style={{ position: 'relative', zIndex: 1, display: 'block', fontSize: '1.5rem', fontFamily: "var(--font-comfortaa), 'Comfortaa', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: '700' }}>
                  Personal Capability
                </span>
              </button>
              <button
                type="button"
                className={styles.analysisSwitchButton}
                onClick={() => {
                  setSelectedAnalysisType('resume');
                  setSelectedDimension(null); // Reset filter when switching types
                  // Cache selected type
                  try {
                    localStorage.setItem('cachedSelectedAnalysisType', 'resume');
                  } catch (error) {
                    console.error('Failed to cache selected analysis type:', error);
                  }
                }}
                style={{
                  padding: '1.5rem 2.5rem',
                  borderRadius: '1rem',
                  border: selectedAnalysisType === 'resume' 
                    ? '2px solid rgba(251, 113, 133, 0.5)' 
                    : '2px solid rgba(214, 191, 154, 0.3)',
                  background: selectedAnalysisType === 'resume' 
                    ? 'linear-gradient(135deg, rgba(253, 164, 175, 0.95) 0%, rgba(251, 113, 133, 0.9) 30%, rgba(244, 63, 94, 0.85) 70%, rgba(225, 29, 72, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(250, 248, 244, 0.98) 0%, rgba(237, 236, 227, 0.98) 100%)',
                  color: selectedAnalysisType === 'resume' ? '#fff' : '#5a5248',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  fontFamily: "var(--font-comfortaa), 'Comfortaa', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  letterSpacing: '0.02em',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: selectedAnalysisType === 'resume' 
                    ? '0 12px 40px rgba(251, 113, 133, 0.4), 0 6px 20px rgba(244, 63, 94, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                    : '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  transform: selectedAnalysisType === 'resume' ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
                  position: 'relative',
                  overflow: 'hidden',
                  flex: '1',
                  minWidth: '280px',
                  maxWidth: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (selectedAnalysisType !== 'resume') {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(253, 164, 175, 0.12) 0%, rgba(251, 113, 133, 0.08) 50%, rgba(244, 63, 94, 0.06) 100%)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(251, 113, 133, 0.2), 0 4px 16px rgba(251, 113, 133, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.color = '#fb7185';
                  } else {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(253, 164, 175, 1) 0%, rgba(251, 113, 133, 0.95) 30%, rgba(244, 63, 94, 0.9) 70%, rgba(225, 29, 72, 0.85) 100%)';
                    e.currentTarget.style.boxShadow = '0 12px 48px rgba(251, 113, 133, 0.35), 0 8px 32px rgba(244, 63, 94, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAnalysisType !== 'resume') {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(250, 248, 244, 0.98) 0%, rgba(237, 236, 227, 0.98) 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = '#5a5248';
                  } else {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(253, 164, 175, 0.95) 0%, rgba(251, 113, 133, 0.9) 30%, rgba(244, 63, 94, 0.85) 70%, rgba(225, 29, 72, 0.8) 100%)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(251, 113, 133, 0.4), 0 6px 20px rgba(244, 63, 94, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                <span className={styles.analysisSwitchButtonText} style={{ position: 'relative', zIndex: 1, display: 'block', fontSize: '1.5rem', fontFamily: "var(--font-comfortaa), 'Comfortaa', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: '700' }}>
                  Resume Power
                </span>
              </button>
            </div>
          )}
          {isAnalyzing ? (
            <div className={`${styles.analysisInfoCard} ${styles.analysisInfoCardCentered} ${styles.analysisInfoCardAnalyzing}`}>
              <p className={styles.analysisInfoTextAnimated} key={currentTipIndex}>
                {RESUME_TIPS[currentTipIndex]}
              </p>
              <div className={styles.slidingLightContainer}>
                <div className={styles.slidingLightDot}></div>
              </div>
            </div>
          ) : (!personalCapabilityAnalysis && !resumePowerAnalysis) ? (
            <div className={styles.analysisInfoCard}>
              <p className={styles.analysisInfoText}>
                Analyzing your job fit strength based on personal capability with your knowledge scope and resume on your choice.
              </p>
            </div>
          ) : (
            <div className={`${styles.analysisCardsContainer} ${isAnalysisResultsFadingOut ? styles.analysisResultsFadeOut : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedAnalysisType === 'personal' && personalCapabilityAnalysis && (
                <>
                  {[
                    { name: 'Background', score: personalCapabilityAnalysis.background_score, advice: personalCapabilityAnalysis.background_advice },
                    { name: 'Education', score: personalCapabilityAnalysis.education_score, advice: personalCapabilityAnalysis.education_advice },
                    { name: 'Professional', score: personalCapabilityAnalysis.professional_score, advice: personalCapabilityAnalysis.professional_advice },
                    { name: 'Tech Skills', score: personalCapabilityAnalysis.tech_skills_score, advice: personalCapabilityAnalysis.tech_skills_advice },
                    { name: 'Teamwork', score: personalCapabilityAnalysis.teamwork_score, advice: personalCapabilityAnalysis.teamwork_advice },
                  ]
                    .filter((dimension) => !selectedDimension || dimension.name === selectedDimension)
                    .flatMap((dimension) => 
                      dimension.advice && dimension.advice.length > 0
                        ? dimension.advice.map((adviceItem: string, idx: number) => (
                            <div key={`${dimension.name}-${idx}`} className={`${styles.analysisInfoCard} ${styles.personalCapabilityCard}`}>
                              <p className={styles.analysisInfoText}>
                                <span className={styles.analysisTypeLabel}>{dimension.name}:</span> {adviceItem}
                              </p>
                            </div>
                          ))
                        : []
                    )}
                </>
              )}
              {selectedAnalysisType === 'resume' && resumePowerAnalysis && (
                <>
                  {/* ATS Compatibility Card */}
                  {resumePowerAnalysis.ats_compatibility_score !== undefined && (
                    <div className={`${styles.analysisInfoCard} ${styles.resumePowerCard}`}>
                      <p className={styles.analysisInfoText}>
                        <span className={styles.analysisTypeLabel}>ATS:</span> Compatibility: {resumePowerAnalysis.ats_compatibility_score}/100
                        {resumePowerAnalysis.ats_issues && resumePowerAnalysis.ats_issues.length > 0 && (
                          <>
                            {' '}
                            {resumePowerAnalysis.ats_issues.map((issue: string, idx: number) => (
                              <span key={idx}>
                                {idx > 0 ? ' ' : ''}{issue}
                              </span>
                            ))}
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  {/* All advice cards */}
                  {[
                    { name: 'Background', score: resumePowerAnalysis.background_score, advice: resumePowerAnalysis.background_advice },
                    { name: 'Education', score: resumePowerAnalysis.education_score, advice: resumePowerAnalysis.education_advice },
                    { name: 'Professional', score: resumePowerAnalysis.professional_score, advice: resumePowerAnalysis.professional_advice },
                    { name: 'Tech Skills', score: resumePowerAnalysis.tech_skills_score, advice: resumePowerAnalysis.tech_skills_advice },
                    { name: 'Teamwork', score: resumePowerAnalysis.teamwork_score, advice: resumePowerAnalysis.teamwork_advice },
                  ]
                    .filter((dimension) => !selectedDimension || dimension.name === selectedDimension)
                    .flatMap((dimension) => 
                      dimension.advice && dimension.advice.length > 0
                        ? dimension.advice.map((adviceItem: string, idx: number) => (
                            <div key={`${dimension.name}-${idx}`} className={`${styles.analysisInfoCard} ${styles.resumePowerCard}`}>
                              <p className={styles.analysisInfoText}>
                                <span className={styles.analysisTypeLabel}>{dimension.name}:</span> {adviceItem}
                              </p>
                            </div>
                          ))
                        : []
                    )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
