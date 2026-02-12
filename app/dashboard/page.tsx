'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './dashboard.module.css';
import '../globals.css';
import ResumeSection, { FetchedJobData } from './resume/ResumeSection';
import AnalysisSection from './analysis/AnalysisSection';
import { userManager, signOutRedirect } from '@/types';
import type { User } from 'oidc-client-ts';
import { API_ENDPOINT } from '@/app/components/config';

// Force dynamic rendering to prevent chunk loading issues
export const dynamic = 'force-dynamic';

// DateDropdown component for Education section
interface DateDropdownProps {
  value: string;
  options: string[];
  placeholder: string;
  onSelect: (value: string) => void;
  degreeId: string;
  fieldType: 'startMonth' | 'startYear' | 'endMonth' | 'endYear';
  onFocus?: () => void;
  disabled?: boolean;
}

function DateDropdown({ value, options, placeholder, onSelect, degreeId, fieldType, onFocus, disabled = false }: DateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [disabled, isOpen]);

  // Scroll to current year when year dropdown opens
  useEffect(() => {
    if (isOpen && !disabled && (fieldType === 'startYear' || fieldType === 'endYear')) {
      const currentYear = new Date().getFullYear().toString();
      const currentYearIndex = options.indexOf(currentYear);
      
      if (currentYearIndex >= 0) {
        // If no value is selected, scroll to current year
        if (!value) {
          setTimeout(() => {
            const currentYearOption = optionRefs.current[currentYearIndex];
            if (currentYearOption && menuRef.current) {
              currentYearOption.scrollIntoView({ block: 'center', behavior: 'smooth' });
              setHighlightedIndex(currentYearIndex);
            }
          }, 50);
        } else {
          // If value is selected, scroll to that value
          const valueIndex = options.indexOf(value);
          if (valueIndex >= 0) {
            setTimeout(() => {
              const valueOption = optionRefs.current[valueIndex];
              if (valueOption && menuRef.current) {
                valueOption.scrollIntoView({ block: 'center', behavior: 'smooth' });
                setHighlightedIndex(valueIndex);
              }
            }, 50);
          }
        }
      }
    }
  }, [isOpen, fieldType, options, value, disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen && !disabled) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, disabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      const target = event.target as HTMLElement;
      if (!dropdownRef.current?.contains(target)) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        triggerRef.current?.focus();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const currentIndex = highlightedIndex < 0 ? -1 : highlightedIndex;
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        setHighlightedIndex(nextIndex);
        setTimeout(() => {
          optionRefs.current[nextIndex]?.focus();
          optionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const currentIndex = highlightedIndex < 0 ? options.length : highlightedIndex;
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        setHighlightedIndex(prevIndex);
        setTimeout(() => {
          optionRefs.current[prevIndex]?.focus();
          optionRefs.current[prevIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onSelect(options[highlightedIndex]);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        return;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, highlightedIndex, options, onSelect]);

  return (
    <div className={styles.customDropdown} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.customDropdownTrigger}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              const currentIndex = value ? options.indexOf(value) : -1;
              setHighlightedIndex(currentIndex);
            }
          }
        }}
        onFocus={onFocus}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span className={styles.dropdownValue}>
          {value || placeholder}
        </span>
        <svg 
          className={`${styles.dropdownArrow} ${isOpen ? styles.dropdownArrowOpen : ''}`}
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M7 10L12 15L17 10" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
      {isOpen && !disabled && (
        <div className={styles.customDropdownMenu} ref={menuRef}>
          {options.map((option, index) => (
            <button
              key={option}
              ref={(el) => { optionRefs.current[index] = el; }}
              type="button"
              className={`${styles.dropdownOption} ${value === option ? styles.dropdownOptionSelected : ''} ${highlightedIndex === index ? styles.dropdownOptionHighlighted : ''}`}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
                setHighlightedIndex(-1);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to normalize project description (migrate from old string format to new object format)
const normalizeProjectDescription = (description: any): { overview: string; techAndTeamwork: string; achievement: string } => {
  if (typeof description === 'string') {
    // Old format: migrate string to object
    return {
      overview: description,
      techAndTeamwork: '',
      achievement: '',
    };
  }
  if (description && typeof description === 'object' && 'overview' in description) {
    // New format: ensure all fields exist
    return {
      overview: description.overview || '',
      techAndTeamwork: description.techAndTeamwork || '',
      achievement: description.achievement || '',
    };
  }
  // Default: return empty object
  return {
    overview: '',
    techAndTeamwork: '',
    achievement: '',
  };
};

export default function DashboardPage() {
  const router = useRouter();
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Settings panel state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPricingPlan, setSelectedPricingPlan] = useState<'2weeks' | '1month' | '3months'>('3months');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const settingsContainerRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState<'profile' | 'knowledge' | 'resume' | 'analyzer'>('profile');
  const [showProfileIntro, setShowProfileIntro] = useState<boolean>(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  // Resume section persisted state - job URL fetch data and page navigation
  // Separate states for "From Knowledge Base" and "From Existing Resume" sections
  const [resumeInterestedJobPositionFromKnowledgeBase, setResumeInterestedJobPositionFromKnowledgeBase] = useState<string>('');
  const [resumeFetchedJobDataFromKnowledgeBase, setResumeFetchedJobDataFromKnowledgeBase] = useState<FetchedJobData | null>(null);
  const [resumeIsJobUrlValidFromKnowledgeBase, setResumeIsJobUrlValidFromKnowledgeBase] = useState<boolean>(false);
  
  const [resumeInterestedJobPositionFromExistingResume, setResumeInterestedJobPositionFromExistingResume] = useState<string>('');
  const [resumeFetchedJobDataFromExistingResume, setResumeFetchedJobDataFromExistingResume] = useState<FetchedJobData | null>(null);
  const [resumeIsJobUrlValidFromExistingResume, setResumeIsJobUrlValidFromExistingResume] = useState<boolean>(false);

  // Analysis section persisted state - separate from Resume section
  const [analysisJobPosition, setAnalysisJobPosition] = useState<string>('');
  const [resumeShowCompanyTypePage, setResumeShowCompanyTypePage] = useState<boolean>(false);
  const [resumeShowExistingResumePage, setResumeShowExistingResumePage] = useState<boolean>(false);
  
  // Analysis initial data state (for auto-population from Resume section)
  const [analysisInitialData, setAnalysisInitialData] = useState<{
    resumeFile: File | null;
    resumeFileName: string | null;
    jobPosition: string | null;
    fetchedJobData: FetchedJobData | null;
    knowledgeScope: { establishedExpertise: boolean; expandingKnowledgeBase: boolean } | null;
    autoTrigger: boolean;
  } | null>(null);
  
  const [showEstablishedExpertise, setShowEstablishedExpertise] = useState<boolean>(false);
  const expertiseSteps = [
    'Personal Project',
    'Professional Project',
    'Technical Skill Focus',
  ] as const;
  const [activeExpertiseStep, setActiveExpertiseStep] = useState<(typeof expertiseSteps)[number]>('Personal Project');
  
  const [showExpandingKnowledgeBase, setShowExpandingKnowledgeBase] = useState<boolean>(false);
  const expandingKnowledgeSteps = [
    'Future Personal Project',
    'Future Professional Project',
    'Future Technical Skills',
  ] as const;
  const [activeExpandingKnowledgeStep, setActiveExpandingKnowledgeStep] = useState<(typeof expandingKnowledgeSteps)[number]>('Future Personal Project');
  
  // Helper function to register user in backend after authentication
  const registerUserInBackend = async (authenticatedUser: User) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/user_authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cognito_sub: authenticatedUser.profile.sub,
          email: authenticatedUser.profile.email
        })
      });

      if (!response.ok) {
        console.error('Failed to register user in backend:', response.statusText);
        return;
      }

      const result = await response.json();
      console.log('User authentication result:', result.is_new_user ? 'New user registered' : 'Existing user authenticated');
    } catch (error) {
      console.error('Error registering user in backend:', error);
    }
  };

  const openStripeCheckout = (url: string) => {
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      try {
        if (window.top) {
          window.top.location.href = url;
        } else {
          window.location.href = url;
        }
      } catch {
        window.location.href = url;
      }
    }
  };

  const handleSubscriptionCheckout = async () => {
    if (!user?.profile?.sub || !user?.profile?.email) {
      console.error('Cannot start checkout: user not authenticated');
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/subscription_stripe_checkout_page_handler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cognito_sub: user.profile.sub,
          email: user.profile.email,
          selected_plan: selectedPricingPlan,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.payment_url) {
        openStripeCheckout(data.payment_url);
      } else {
        throw new Error('No payment URL received from server');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Helper function to submit profile data to backend
  const handleProfileSubmit = async () => {
    if (!user?.profile?.sub) {
      console.error('Cannot submit profile: user not authenticated');
      return;
    }

    // Show "Saved!" message when API call starts
    setShowSavedMessage(true);

    try {
      const profileData = {
        cognito_sub: user.profile.sub,
        careerFocus,
        basicInfo: {
          firstName,
          middleName,
          lastName,
          email,
          phone,
          addressStreet,
          addressState,
          addressZip,
          personalWebsite,
          linkedin,
          links
        },
        // Education: list of college objects, each with collegeName, location, and degrees
        education: colleges.map(college => ({
          id: college.id,
          collegeName: college.collegeName,
          location: college.location || '',
          degrees: college.degrees
        })),
        // Professional: list of companies and list of achievements
        professional: {
          companies: professionalExperiences.map(exp => ({
            id: exp.id,
            companyName: exp.companyName,
            jobTitle: exp.jobTitle,
            startMonth: exp.startMonth,
            startYear: exp.startYear,
            endMonth: exp.endMonth,
            endYear: exp.endYear,
            isPresent: exp.isPresent,
            location: exp.location || ''
          })),
          achievements: achievements.map(ach => ({
            id: ach.id,
            type: ach.type,
            value: ach.value
          }))
        }
      };

      const response = await fetch(`${API_ENDPOINT}/profile_update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        console.error('Failed to update profile:', response.statusText);
        return;
      }

      const result = await response.json();
      console.log('Profile update result:', result.is_new_profile ? 'New profile created' : 'Profile updated');
      
      // Mark profile as saved after successful API call
      setProfileFormState('profile_saved');
      setLastProfileUpdateTimestamp(null);
      // Clear the auto-save timer
      if (profileAutoSaveTimerRef.current) {
        clearTimeout(profileAutoSaveTimerRef.current);
        profileAutoSaveTimerRef.current = null;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Keep state as dirty on error - will retry on next update
    }
  };

  // Helper function to submit knowledge data to backend
  const handleKnowledgeSubmit = async () => {
    if (!user?.profile?.sub) {
      console.error('Cannot submit knowledge: user not authenticated');
      return;
    }

    // Show "Saved!" message when API call starts
    setShowEstablishedSavedMessage(true);

    try {
      const knowledgeData = {
        cognito_sub: user.profile.sub,
        personal_project: personalProjects,
        professional_project: professionalProjects,
        technical_skills: {
          selectedSkills: selectedTechnicalSkills,
          customKeywords: customTechnicalSkillKeywords,
          customLayers: customTechnicalSkillLayers
        }
      };

      const response = await fetch(`${API_ENDPOINT}/established_knowledge_update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledgeData)
      });

      if (!response.ok) {
        console.error('Failed to update knowledge:', response.statusText);
        return;
      }

      const result = await response.json();
      console.log('Knowledge update result:', result.is_new_record ? 'New knowledge record created' : 'Knowledge updated');
      
      // Mark established expertise as saved after successful API call
      setEstablishedFormState('established_saved');
      setLastEstablishedUpdateTimestamp(null);
      // Clear the auto-save timer
      if (establishedAutoSaveTimerRef.current) {
        clearTimeout(establishedAutoSaveTimerRef.current);
        establishedAutoSaveTimerRef.current = null;
      }
    } catch (error) {
      console.error('Error updating knowledge:', error);
      // Keep state as dirty on error - will retry on next update
    }
  };

  // Helper function to fetch knowledge data from backend
  const fetchKnowledge = async () => {
    if (!user?.profile?.sub) {
      console.error('Cannot fetch knowledge: user not authenticated');
      return;
    }

    // Don't fetch if already fetched or currently loading
    if (isKnowledgeFetched || isKnowledgeLoading) {
      return;
    }

    setIsKnowledgeLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINT}/get_knowledge/${encodeURIComponent(user.profile.sub)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.error('Failed to fetch knowledge:', response.statusText);
        setIsKnowledgeLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.knowledge_exists && result.data) {
        const knowledgeData = result.data;
        
        // Populate Personal Projects
        if (knowledgeData.personal_project && Array.isArray(knowledgeData.personal_project)) {
          setPersonalProjects(knowledgeData.personal_project.map((project: {
            id?: string;
            projectName?: string;
            projectDescription?: { overview?: string; techAndTeamwork?: string; achievement?: string } | string;
            selectedIndustries?: string[];
            projectStartMonth?: string;
            projectStartYear?: string;
            projectEndMonth?: string;
            projectEndYear?: string;
            location?: string;
            selectedTechnologies?: string[];
            selectedFrameworks?: string[];
            isInterviewReady?: boolean;
          }) => ({
            id: project.id || crypto.randomUUID(),
            projectName: project.projectName || '',
            projectDescription: typeof project.projectDescription === 'object' ? {
              overview: project.projectDescription?.overview || '',
              techAndTeamwork: project.projectDescription?.techAndTeamwork || '',
              achievement: project.projectDescription?.achievement || ''
            } : { overview: '', techAndTeamwork: '', achievement: '' },
            selectedIndustries: project.selectedIndustries || [],
            projectStartMonth: project.projectStartMonth || '',
            projectStartYear: project.projectStartYear || '',
            projectEndMonth: project.projectEndMonth || '',
            projectEndYear: project.projectEndYear || '',
            location: project.location || '',
            selectedTechnologies: project.selectedTechnologies || [],
            selectedFrameworks: project.selectedFrameworks || [],
            isInterviewReady: project.isInterviewReady || false
          })));
        }
        
        // Populate Professional Projects
        if (knowledgeData.professional_project && Array.isArray(knowledgeData.professional_project) && knowledgeData.professional_project.length > 0) {
          setProfessionalProjects(knowledgeData.professional_project.map((project: {
            id?: string;
            projectName?: string;
            projectDescription?: { overview?: string; techAndTeamwork?: string; achievement?: string } | string;
            selectedWorkExperience?: string;
            projectStartMonth?: string;
            projectStartYear?: string;
            projectEndMonth?: string;
            projectEndYear?: string;
            selectedTechnologies?: string[];
            selectedFrameworks?: string[];
            isInterviewReady?: boolean;
          }) => ({
            id: project.id || crypto.randomUUID(),
            projectName: project.projectName || '',
            projectDescription: typeof project.projectDescription === 'object' ? {
              overview: project.projectDescription?.overview || '',
              techAndTeamwork: project.projectDescription?.techAndTeamwork || '',
              achievement: project.projectDescription?.achievement || ''
            } : { overview: '', techAndTeamwork: '', achievement: '' },
            selectedWorkExperience: project.selectedWorkExperience || '',
            projectStartMonth: project.projectStartMonth || '',
            projectStartYear: project.projectStartYear || '',
            projectEndMonth: project.projectEndMonth || '',
            projectEndYear: project.projectEndYear || '',
            selectedTechnologies: project.selectedTechnologies || [],
            selectedFrameworks: project.selectedFrameworks || [],
            isInterviewReady: project.isInterviewReady || false
          })));
        }
        
        // Populate Technical Skills
        if (knowledgeData.technical_skills) {
          const techSkills = knowledgeData.technical_skills;
          
          if (techSkills.selectedSkills && Array.isArray(techSkills.selectedSkills)) {
            setSelectedTechnicalSkills(techSkills.selectedSkills);
          }
          
          if (techSkills.customKeywords && typeof techSkills.customKeywords === 'object') {
            setCustomTechnicalSkillKeywords(techSkills.customKeywords);
          }
          
          if (techSkills.customLayers && Array.isArray(techSkills.customLayers)) {
            setCustomTechnicalSkillLayers(techSkills.customLayers.map((layer: {
              id?: string;
              title?: string;
              items?: string[];
            }) => ({
              id: layer.id || crypto.randomUUID(),
              title: layer.title || '',
              items: layer.items || []
            })));
          }
        }
        
        console.log('Knowledge data loaded from backend');
      } else {
        console.log('No existing knowledge found in backend');
      }
      
      // Mark established expertise as saved after successful load (or no knowledge found)
      setEstablishedFormState('established_saved');
      setLastEstablishedUpdateTimestamp(null);
      // Clear any existing auto-save timer
      if (establishedAutoSaveTimerRef.current) {
        clearTimeout(establishedAutoSaveTimerRef.current);
        establishedAutoSaveTimerRef.current = null;
      }
      
      setIsKnowledgeFetched(true);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setIsKnowledgeLoading(false);
    }
  };

  // Helper function to submit expanding knowledge data to backend
  const handleExpandingKnowledgeSubmit = async () => {
    if (!user?.profile?.sub) {
      console.error('Cannot submit expanding knowledge: user not authenticated');
      return;
    }

    // Show "Saved!" message when API call starts
    setShowExpandingSavedMessage(true);

    try {
      const expandingKnowledgeData = {
        cognito_sub: user.profile.sub,
        future_personal_project: futurePersonalProjects,
        future_professional_project: futureProfessionalProjects,
        future_technical_skills: {
          selectedSkills: selectedFutureTechnicalSkills,
          customKeywords: customFutureTechnicalSkillKeywords,
          customLayers: customFutureTechnicalSkillLayers
        }
      };

      const response = await fetch(`${API_ENDPOINT}/expanding_knowledge_update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expandingKnowledgeData)
      });

      if (!response.ok) {
        console.error('Failed to update expanding knowledge:', response.statusText);
        return;
      }

      const result = await response.json();
      console.log('Expanding knowledge update result:', result.is_new_record ? 'New expanding knowledge record created' : 'Expanding knowledge updated');
      
      // Mark expanding knowledge base as saved after successful API call
      setExpandingFormState('expanding_saved');
      setLastExpandingUpdateTimestamp(null);
      // Clear the auto-save timer
      if (expandingAutoSaveTimerRef.current) {
        clearTimeout(expandingAutoSaveTimerRef.current);
        expandingAutoSaveTimerRef.current = null;
      }
    } catch (error) {
      console.error('Error updating expanding knowledge:', error);
      // Keep state as dirty on error - will retry on next update
    }
  };

  // Helper function to fetch expanding knowledge data from backend
  const fetchExpandingKnowledge = async () => {
    if (!user?.profile?.sub) {
      console.error('Cannot fetch expanding knowledge: user not authenticated');
      return;
    }

    // Don't fetch if already fetched or currently loading
    if (isExpandingKnowledgeFetched || isExpandingKnowledgeLoading) {
      return;
    }

    setIsExpandingKnowledgeLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINT}/get_expanding_knowledge/${encodeURIComponent(user.profile.sub)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.error('Failed to fetch expanding knowledge:', response.statusText);
        setIsExpandingKnowledgeLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.expanding_knowledge_exists && result.data) {
        const expandingKnowledgeData = result.data;
        
        // Populate Future Personal Projects
        if (expandingKnowledgeData.future_personal_project && Array.isArray(expandingKnowledgeData.future_personal_project)) {
          setFuturePersonalProjects(expandingKnowledgeData.future_personal_project.map((project: {
            id?: string;
            projectName?: string;
            projectDescription?: { overview?: string; techAndTeamwork?: string; achievement?: string } | string;
            selectedIndustries?: string[];
            projectStartMonth?: string;
            projectStartYear?: string;
            projectEndMonth?: string;
            projectEndYear?: string;
            location?: string;
            selectedTechnologies?: string[];
            selectedFrameworks?: string[];
            isInterviewReady?: boolean;
          }) => ({
            id: project.id || crypto.randomUUID(),
            projectName: project.projectName || '',
            projectDescription: typeof project.projectDescription === 'object' ? {
              overview: project.projectDescription?.overview || '',
              techAndTeamwork: project.projectDescription?.techAndTeamwork || '',
              achievement: project.projectDescription?.achievement || ''
            } : { overview: '', techAndTeamwork: '', achievement: '' },
            selectedIndustries: project.selectedIndustries || [],
            projectStartMonth: project.projectStartMonth || '',
            projectStartYear: project.projectStartYear || '',
            projectEndMonth: project.projectEndMonth || '',
            projectEndYear: project.projectEndYear || '',
            location: project.location || '',
            selectedTechnologies: project.selectedTechnologies || [],
            selectedFrameworks: project.selectedFrameworks || [],
            isInterviewReady: project.isInterviewReady || false
          })));
        }
        
        // Populate Future Professional Projects
        if (expandingKnowledgeData.future_professional_project && Array.isArray(expandingKnowledgeData.future_professional_project)) {
          setFutureProfessionalProjects(expandingKnowledgeData.future_professional_project.map((project: {
            id?: string;
            projectName?: string;
            projectDescription?: { overview?: string; techAndTeamwork?: string; achievement?: string } | string;
            selectedWorkExperience?: string;
            projectStartMonth?: string;
            projectStartYear?: string;
            projectEndMonth?: string;
            projectEndYear?: string;
            selectedTechnologies?: string[];
            selectedFrameworks?: string[];
            isInterviewReady?: boolean;
          }) => ({
            id: project.id || crypto.randomUUID(),
            projectName: project.projectName || '',
            projectDescription: typeof project.projectDescription === 'object' ? {
              overview: project.projectDescription?.overview || '',
              techAndTeamwork: project.projectDescription?.techAndTeamwork || '',
              achievement: project.projectDescription?.achievement || ''
            } : { overview: '', techAndTeamwork: '', achievement: '' },
            selectedWorkExperience: project.selectedWorkExperience || '',
            projectStartMonth: project.projectStartMonth || '',
            projectStartYear: project.projectStartYear || '',
            projectEndMonth: project.projectEndMonth || '',
            projectEndYear: project.projectEndYear || '',
            selectedTechnologies: project.selectedTechnologies || [],
            selectedFrameworks: project.selectedFrameworks || [],
            isInterviewReady: project.isInterviewReady || false
          })));
        }
        
        // Populate Future Technical Skills
        if (expandingKnowledgeData.future_technical_skills) {
          const futureTechSkills = expandingKnowledgeData.future_technical_skills;
          
          if (futureTechSkills.selectedSkills && Array.isArray(futureTechSkills.selectedSkills)) {
            setSelectedFutureTechnicalSkills(futureTechSkills.selectedSkills);
          }
          
          if (futureTechSkills.customKeywords && typeof futureTechSkills.customKeywords === 'object') {
            setCustomFutureTechnicalSkillKeywords(futureTechSkills.customKeywords);
          }
          
          if (futureTechSkills.customLayers && Array.isArray(futureTechSkills.customLayers)) {
            setCustomFutureTechnicalSkillLayers(futureTechSkills.customLayers.map((layer: {
              id?: string;
              title?: string;
              items?: string[];
            }) => ({
              id: layer.id || crypto.randomUUID(),
              title: layer.title || '',
              items: layer.items || []
            })));
          }
        }
        
        console.log('Expanding knowledge data loaded from backend');
      } else {
        console.log('No existing expanding knowledge found in backend');
      }
      
      // Mark expanding knowledge base as saved after successful load (or no knowledge found)
      setExpandingFormState('expanding_saved');
      setLastExpandingUpdateTimestamp(null);
      // Clear any existing auto-save timer
      if (expandingAutoSaveTimerRef.current) {
        clearTimeout(expandingAutoSaveTimerRef.current);
        expandingAutoSaveTimerRef.current = null;
      }
      
      setIsExpandingKnowledgeFetched(true);
    } catch (error) {
      console.error('Error fetching expanding knowledge:', error);
    } finally {
      setIsExpandingKnowledgeLoading(false);
    }
  };

  // Helper function to fetch profile data from backend
  const fetchProfile = async () => {
    if (!user?.profile?.sub) {
      console.error('Cannot fetch profile: user not authenticated');
      return;
    }

    // Don't fetch if already fetched or currently loading
    if (isProfileFetched || isProfileLoading) {
      return;
    }

    setIsProfileLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINT}/get_profile/${encodeURIComponent(user.profile.sub)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.error('Failed to fetch profile:', response.statusText);
        setIsProfileLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.profile_exists && result.data) {
        const profileData = result.data;
        
        // Populate Career Focus
        if (profileData.careerFocus) {
          setCareerFocus(profileData.careerFocus);
        }
        
        // Populate Basic Info
        if (profileData.basicInfo) {
          const basicInfo = profileData.basicInfo;
          if (basicInfo.firstName) setFirstName(basicInfo.firstName);
          if (basicInfo.middleName) setMiddleName(basicInfo.middleName);
          if (basicInfo.lastName) setLastName(basicInfo.lastName);
          if (basicInfo.email) setEmail(basicInfo.email);
          if (basicInfo.phone) setPhone(basicInfo.phone);
          if (basicInfo.addressStreet) setAddressStreet(basicInfo.addressStreet);
          if (basicInfo.addressState) setAddressState(basicInfo.addressState);
          if (basicInfo.addressZip) setAddressZip(basicInfo.addressZip);
          if (basicInfo.personalWebsite) setPersonalWebsite(basicInfo.personalWebsite);
          if (basicInfo.linkedin) setLinkedin(basicInfo.linkedin);
          if (basicInfo.links && Array.isArray(basicInfo.links)) {
            setLinks(basicInfo.links);
          }
        }
        
        // Populate Education (list of colleges)
        if (profileData.education && Array.isArray(profileData.education)) {
          setColleges(profileData.education.map((college: { id?: string; collegeName?: string; location?: string | null; degrees?: Array<{ id?: string; degree?: string; major?: string; startMonth?: string; startYear?: string; endMonth?: string; endYear?: string; coursework?: string }> }) => ({
            id: college.id || crypto.randomUUID(),
            collegeName: college.collegeName || '',
            location: college.location ?? '',
            degrees: (college.degrees || []).map((deg: { id?: string; degree?: string; major?: string; startMonth?: string; startYear?: string; endMonth?: string; endYear?: string; coursework?: string }) => ({
              id: deg.id || crypto.randomUUID(),
              degree: deg.degree || '',
              major: deg.major || '',
              startMonth: deg.startMonth || '',
              startYear: deg.startYear || '',
              endMonth: deg.endMonth || '',
              endYear: deg.endYear || '',
              coursework: deg.coursework || ''
            }))
          })));
        }
        
        // Populate Professional (companies and achievements)
        if (profileData.professional) {
          const professional = profileData.professional;
          
          // Populate companies
          if (professional.companies && Array.isArray(professional.companies)) {
            setProfessionalExperiences(professional.companies.map((exp: { id?: string; companyName?: string; jobTitle?: string; startMonth?: string; startYear?: string; endMonth?: string; endYear?: string; isPresent?: boolean; location?: string | null }) => ({
              id: exp.id || crypto.randomUUID(),
              companyName: exp.companyName || '',
              jobTitle: exp.jobTitle || '',
              startMonth: exp.startMonth || '',
              startYear: exp.startYear || '',
              endMonth: exp.endMonth || '',
              endYear: exp.endYear || '',
              isPresent: exp.isPresent || false,
              location: exp.location ?? ''
            })));
          }
          
          // Populate achievements
          if (professional.achievements && Array.isArray(professional.achievements)) {
            setAchievements(professional.achievements.map((ach: { id?: string; type?: string; value?: string }) => ({
              id: ach.id || crypto.randomUUID(),
              type: ach.type || '',
              value: ach.value || ''
            })));
          }
        }
        
        console.log('Profile data loaded from backend');
      } else {
        console.log('No existing profile found in backend');
      }
      
      // Mark profile as saved after successful load (or no profile found)
      setProfileFormState('profile_saved');
      setLastProfileUpdateTimestamp(null);
      // Clear any existing auto-save timer
      if (profileAutoSaveTimerRef.current) {
        clearTimeout(profileAutoSaveTimerRef.current);
        profileAutoSaveTimerRef.current = null;
      }
      
      setIsProfileFetched(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Authentication: Handle sign-in callback and get existing user
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to handle callback (if returning from Cognito)
        const callbackUser = await userManager.signinCallback();
        if (callbackUser) {
          setUser(callbackUser);
          // Register user in backend after successful login
          await registerUserInBackend(callbackUser);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Not a callback scenario or callback failed, continue to check for existing user
      }

      // If no callback, try to get existing user
      try {
        const existingUser = await userManager.getUser();
        if (existingUser && !existingUser.expired) {
          setUser(existingUser);
          // Register user in backend (handles both new and returning users)
          await registerUserInBackend(existingUser);
        }
      } catch (getUserError) {
        console.error("Get user error:", getUserError);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for user changes
  useEffect(() => {
    const handleUserLoaded = (loadedUser: User | null) => {
      setUser(loadedUser);
      setIsLoading(false);
    };

    const handleUserUnloaded = () => {
      setUser(null);
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
    };
  }, []);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [isLoading, user, router]);

  // Normalize project descriptions on mount (migrate old format)
  useEffect(() => {
    // Normalize personal projects
    const needsNormalization = personalProjects.some(p => 
      !p.projectDescription || 
      typeof p.projectDescription === 'string' ||
      !('overview' in p.projectDescription)
    );
    if (needsNormalization) {
      setPersonalProjects(prev => prev.map(p => ({
        ...p,
        projectDescription: normalizeProjectDescription(p.projectDescription),
      })));
    }
  }, []); // Only run on mount

  useEffect(() => {
    // Normalize professional projects
    const needsNormalization = professionalProjects.some(p => 
      !p.projectDescription || 
      typeof p.projectDescription === 'string' ||
      !('overview' in p.projectDescription)
    );
    if (needsNormalization) {
      setProfessionalProjects(prev => prev.map(p => ({
        ...p,
        projectDescription: normalizeProjectDescription(p.projectDescription),
      })));
    }
  }, []); // Only run on mount

  // Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSettingsOpen &&
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  // Personal Project state
  interface PersonalProject {
    id: string;
    projectName: string;
    projectDescription: {
      overview: string;
      techAndTeamwork: string;
      achievement: string;
    };
    selectedIndustries: string[];
    projectStartMonth: string;
    projectStartYear: string;
    projectEndMonth: string;
    projectEndYear: string;
    location?: string;
    selectedTechnologies: string[];
    selectedFrameworks: string[];
    isInterviewReady?: boolean;
  }
  
  const [personalProjects, setPersonalProjects] = useState<PersonalProject[]>([]);
  const [activePersonalProjectSubPanel, setActivePersonalProjectSubPanel] = useState<number>(1);
  const personalProjectDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [draggedPersonalProjectDotIndex, setDraggedPersonalProjectDotIndex] = useState<number | null>(null);
  const [draggedOverPersonalProjectDotIndex, setDraggedOverPersonalProjectDotIndex] = useState<number | null>(null);
  const [isTransitioningToTags, setIsTransitioningToTags] = useState<boolean>(false);
  const [tooltipBelowMap, setTooltipBelowMap] = useState<Record<number, boolean>>({});
  const [tagsInitialized, setTagsInitialized] = useState<boolean>(false);
  const [hoveredTagIndex, setHoveredTagIndex] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Future Personal Project state (separate from Personal Project)
  const [futurePersonalProjects, setFuturePersonalProjects] = useState<PersonalProject[]>([]);
  const [activeFuturePersonalProjectSubPanel, setActiveFuturePersonalProjectSubPanel] = useState<number>(1);
  const futurePersonalProjectDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [draggedFuturePersonalProjectDotIndex, setDraggedFuturePersonalProjectDotIndex] = useState<number | null>(null);
  const [draggedOverFuturePersonalProjectDotIndex, setDraggedOverFuturePersonalProjectDotIndex] = useState<number | null>(null);
  const [isTransitioningToTagsFuture, setIsTransitioningToTagsFuture] = useState<boolean>(false);
  const [tooltipBelowMapFuture, setTooltipBelowMapFuture] = useState<Record<number, boolean>>({});
  const [tagsInitializedFuture, setTagsInitializedFuture] = useState<boolean>(false);
  const [hoveredTagIndexFuture, setHoveredTagIndexFuture] = useState<number | null>(null);
  const hoverTimeoutRefFuture = useRef<NodeJS.Timeout | null>(null);
  
  // Professional Project state (same structure as Personal Project)
  interface ProfessionalProject {
    id: string;
    projectName: string;
    projectDescription: {
      overview: string;
      techAndTeamwork: string;
      achievement: string;
    };
    selectedWorkExperience: string; // Single work experience selection (company name + job title)
    projectStartMonth: string;
    projectStartYear: string;
    projectEndMonth: string;
    projectEndYear: string;
    selectedTechnologies: string[];
    selectedFrameworks: string[];
    isInterviewReady?: boolean;
  }
  
  const [professionalProjects, setProfessionalProjects] = useState<ProfessionalProject[]>([]);
  const [activeProfessionalProjectSubPanel, setActiveProfessionalProjectSubPanel] = useState<number>(1);
  const professionalProjectDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [draggedProfessionalProjectDotIndex, setDraggedProfessionalProjectDotIndex] = useState<number | null>(null);
  const [draggedOverProfessionalProjectDotIndex, setDraggedOverProfessionalProjectDotIndex] = useState<number | null>(null);
  const [isTransitioningToTagsProfessional, setIsTransitioningToTagsProfessional] = useState<boolean>(false);
  const [tooltipBelowMapProfessional, setTooltipBelowMapProfessional] = useState<Record<number, boolean>>({});
  const [tagsInitializedProfessional, setTagsInitializedProfessional] = useState<boolean>(false);
  const [hoveredTagIndexProfessional, setHoveredTagIndexProfessional] = useState<number | null>(null);
  const hoverTimeoutRefProfessional = useRef<NodeJS.Timeout | null>(null);
  
  // Future Professional Project state (separate from Professional Project)
  const [futureProfessionalProjects, setFutureProfessionalProjects] = useState<ProfessionalProject[]>([]);
  const [activeFutureProfessionalProjectSubPanel, setActiveFutureProfessionalProjectSubPanel] = useState<number>(1);
  const futureProfessionalProjectDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [draggedFutureProfessionalProjectDotIndex, setDraggedFutureProfessionalProjectDotIndex] = useState<number | null>(null);
  const [draggedOverFutureProfessionalProjectDotIndex, setDraggedOverFutureProfessionalProjectDotIndex] = useState<number | null>(null);
  const [isTransitioningToTagsFutureProfessional, setIsTransitioningToTagsFutureProfessional] = useState<boolean>(false);
  const [tooltipBelowMapFutureProfessional, setTooltipBelowMapFutureProfessional] = useState<Record<number, boolean>>({});
  const [tagsInitializedFutureProfessional, setTagsInitializedFutureProfessional] = useState<boolean>(false);
  const [hoveredTagIndexFutureProfessional, setHoveredTagIndexFutureProfessional] = useState<number | null>(null);
  const hoverTimeoutRefFutureProfessional = useRef<NodeJS.Timeout | null>(null);
  
  // Legacy state for backward compatibility (will be removed after refactoring)
  const [projectName, setProjectName] = useState<string>('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [projectStartMonth, setProjectStartMonth] = useState<string>('');
  const [projectStartYear, setProjectStartYear] = useState<string>('');
  const [projectEndMonth, setProjectEndMonth] = useState<string>('');
  const [projectEndYear, setProjectEndYear] = useState<string>('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState<boolean>(false);
  const [isIndustryHovered, setIsIndustryHovered] = useState<boolean>(false);
  const [isWorkExperienceDropdownOpen, setIsWorkExperienceDropdownOpen] = useState<boolean>(false);
  const workExperienceDropdownRef = useRef<HTMLDivElement>(null);
  const workExperienceTextRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [isDescriptionDropdownOpen, setIsDescriptionDropdownOpen] = useState<boolean>(false);
  const descriptionDropdownRef = useRef<HTMLDivElement>(null);
  const [activeDescriptionTab, setActiveDescriptionTab] = useState<'overview' | 'techAndTeamwork' | 'achievement'>('overview');
  const [isTechnologiesModalOpen, setIsTechnologiesModalOpen] = useState<boolean>(false);
  const [isFrameworksModalOpen, setIsFrameworksModalOpen] = useState<boolean>(false);
  const [tempSelectedTechnologies, setTempSelectedTechnologies] = useState<string[]>([]);
  const [tempSelectedFrameworks, setTempSelectedFrameworks] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState<Record<string, string[]>>({});
  const [isShowingCustomKeywordInput, setIsShowingCustomKeywordInput] = useState<Record<string, boolean>>({});
  const [customKeywordInputValue, setCustomKeywordInputValue] = useState<Record<string, string>>({});
  const [editingCustomKeyword, setEditingCustomKeyword] = useState<Record<string, string>>({});
  const [customFrameworkKeywords, setCustomFrameworkKeywords] = useState<Record<string, string[]>>({});
  const [isShowingCustomFrameworkKeywordInput, setIsShowingCustomFrameworkKeywordInput] = useState<Record<string, boolean>>({});
  const [customFrameworkKeywordInputValue, setCustomFrameworkKeywordInputValue] = useState<Record<string, string>>({});
  const [editingCustomFrameworkKeyword, setEditingCustomFrameworkKeyword] = useState<Record<string, string>>({});
  // Separate UI state for Future Professional Project (Expanding Knowledge Base)
  const [isFutureWorkExperienceDropdownOpen, setIsFutureWorkExperienceDropdownOpen] = useState<boolean>(false);
  const futureWorkExperienceDropdownRef = useRef<HTMLDivElement>(null);
  const [isFutureDescriptionDropdownOpen, setIsFutureDescriptionDropdownOpen] = useState<boolean>(false);
  const futureDescriptionDropdownRef = useRef<HTMLDivElement>(null);
  const [activeFutureDescriptionTab, setActiveFutureDescriptionTab] = useState<'overview' | 'techAndTeamwork' | 'achievement'>('overview');
  const [isFutureTechnologiesModalOpen, setIsFutureTechnologiesModalOpen] = useState<boolean>(false);
  const [isFutureFrameworksModalOpen, setIsFutureFrameworksModalOpen] = useState<boolean>(false);
  const [tempFutureSelectedTechnologies, setTempFutureSelectedTechnologies] = useState<string[]>([]);
  const [tempFutureSelectedFrameworks, setTempFutureSelectedFrameworks] = useState<string[]>([]);
  const [customFutureKeywords, setCustomFutureKeywords] = useState<Record<string, string[]>>({});
  const [isShowingCustomFutureKeywordInput, setIsShowingCustomFutureKeywordInput] = useState<Record<string, boolean>>({});
  const [customFutureKeywordInputValue, setCustomFutureKeywordInputValue] = useState<Record<string, string>>({});
  const [editingCustomFutureKeyword, setEditingCustomFutureKeyword] = useState<Record<string, string>>({});
  const [customFutureFrameworkKeywords, setCustomFutureFrameworkKeywords] = useState<Record<string, string[]>>({});
  const [isShowingCustomFutureFrameworkKeywordInput, setIsShowingCustomFutureFrameworkKeywordInput] = useState<Record<string, boolean>>({});
  const [customFutureFrameworkKeywordInputValue, setCustomFutureFrameworkKeywordInputValue] = useState<Record<string, string>>({});
  const [editingCustomFutureFrameworkKeyword, setEditingCustomFutureFrameworkKeyword] = useState<Record<string, string>>({});
  const [selectedTechnicalSkills, setSelectedTechnicalSkills] = useState<string[]>([]);
  const [customTechnicalSkillKeywords, setCustomTechnicalSkillKeywords] = useState<Record<string, string[]>>({});
  const [isShowingCustomTechnicalSkillKeywordInput, setIsShowingCustomTechnicalSkillKeywordInput] = useState<Record<string, boolean>>({});
  const [customTechnicalSkillKeywordInputValue, setCustomTechnicalSkillKeywordInputValue] = useState<Record<string, string>>({});
  const [editingCustomTechnicalSkillKeyword, setEditingCustomTechnicalSkillKeyword] = useState<Record<string, string>>({});
  const [expandedTechnicalSkillSections, setExpandedTechnicalSkillSections] = useState<Record<string, boolean>>({});
  const [customTechnicalSkillLayers, setCustomTechnicalSkillLayers] = useState<Array<{ id: string; title: string; items: string[] }>>([]);
  const [isAddingNewLayer, setIsAddingNewLayer] = useState<boolean>(false);
  const [newLayerTitle, setNewLayerTitle] = useState<string>('');
  const [newLayerItems, setNewLayerItems] = useState<string>('');
  // Separate state for Future Technical Skills (Expanding Knowledge Base)
  const [selectedFutureTechnicalSkills, setSelectedFutureTechnicalSkills] = useState<string[]>([]);
  const [customFutureTechnicalSkillKeywords, setCustomFutureTechnicalSkillKeywords] = useState<Record<string, string[]>>({});
  const [isShowingCustomFutureTechnicalSkillKeywordInput, setIsShowingCustomFutureTechnicalSkillKeywordInput] = useState<Record<string, boolean>>({});
  const [customFutureTechnicalSkillKeywordInputValue, setCustomFutureTechnicalSkillKeywordInputValue] = useState<Record<string, string>>({});
  const [editingCustomFutureTechnicalSkillKeyword, setEditingCustomFutureTechnicalSkillKeyword] = useState<Record<string, string>>({});
  const [expandedFutureTechnicalSkillSections, setExpandedFutureTechnicalSkillSections] = useState<Record<string, boolean>>({});
  const [customFutureTechnicalSkillLayers, setCustomFutureTechnicalSkillLayers] = useState<Array<{ id: string; title: string; items: string[] }>>([]);
  const [isAddingNewFutureLayer, setIsAddingNewFutureLayer] = useState<boolean>(false);
  const [newFutureLayerTitle, setNewFutureLayerTitle] = useState<string>('');
  const [newFutureLayerItems, setNewFutureLayerItems] = useState<string>('');
  const industryDropdownRef = useRef<HTMLDivElement>(null);
  const technologiesModalRef = useRef<HTMLDivElement>(null);
  const frameworksModalRef = useRef<HTMLDivElement>(null);
  
  const industryOptions = ['AI & Machine Learning', 'Blockchain & Web3', 'Cloud Computing', 'SaaS / Enterprise Software', 'Big Tech / Consumer Internet', 'FinTech', 'Trading & Quant Finance', 'E-commerce & Marketplace', 'Cybersecurity', 'Data & Analytics', 'Developer Tools', 'Healthcare & Insurance', 'Gaming', 'Autonomous Vehicles & Robotics', 'Generative AI Platforms'];
  
  // Software Engineering specific technology sections
  const softwareEngineeringTechnologySections = {
    'Languages, Runtimes & Build Tooling': ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Kotlin', 'SQL', 'Bash', 'Node.js', 'JVM', '.NET', 'PHP', 'Other'],
    'Client, UI & Product Experience': ['HTML5', 'CSS3', 'DOM', 'HTTP/HTTPS', 'PWA', 'Core Web Vitals', 'iOS', 'Android', 'Swift', 'Kotlin', 'WebSockets', 'WebGL / Canvas', 'Other'],
    'Backend Services & Distributed Systems': ['REST APIs', 'gRPC', 'GraphQL', 'Microservices', 'Event-driven architecture', 'Pub-Sub message queuing', 'Containers', 'Kubernetes', 'JWT', 'Distributed tracing', 'Rate limiting', 'Caching patterns', 'Load balancing', 'CAP', 'Other' ],
    'Data & Messaging Layer': ['Relational data modeling', 'Key–value data modeling', 'Indexing', 'ACID', 'Isolation & locking', 'Replication & failover', 'Partitioning', 'Consistency modeling', 'Caching', 'Event streaming', 'Message queuing', 'Pub/Sub messaging', 'Other'],
    'Operating Systems & Networks': ['CPU microarchitecture', 'Cache locality', 'False sharing', 'NUMA topology', 'Memory affinity', 'Lock-free concurrency', 'TCP/UDP', 'Multicast', 'Zero-copy I/O', 'Backpressure & queueing theory', 'Packet pacing', 'Other']
  };

  // Software Engineering specific technical skill focus sections
  const softwareEngineeringTechnicalSkillFocusSections = {
    'Languages, Runtimes & Build Tooling': ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Kotlin', 'SQL', 'Bash/Shell', 'Node.js', 'JVM', '.NET', 'PHP', 'Git', 'Docker', 'Jenkins', 'npm', 'pnpm', 'Yarn', 'pip', 'Cargo', 'Version control', 'Build automation', 'CI/CD pipelines', 'Testing strategy', 'Profiling & benchmarking', 'API design', 'Concurrency & Parallelism', 'Other'],
    'Client, UI & Product Experience': ['HTML5', 'CSS3', 'DOM', 'HTTP/HTTPS', 'PWA', 'ARIA', 'WebSockets', 'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Component architecture', 'State management', 'Frontend performance optimization', 'Cross-browser compatibility', 'i18n/l10n', 'UI consistency ', 'Other'],
    'Backend Services & Distributed Systems': ['REST APIs', 'gRPC', 'GraphQL', 'Microservices', 'Event-driven architecture', 'Pub-Sub Message queuing', 'Containers', 'Kubernetes', 'Distributed tracing', 'Rate limiting', 'Caching', 'Load balancing', 'CAP', 'Spring Boot', 'ASP.NET', 'FastAPI', 'Django', 'Flask', 'NestJS', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'Azure', 'API versioning', 'Data consistency', 'Concurrency & async programming', 'Zero-downtime deployments', 'Performance profiling', 'Other'],
    'Data & Messaging Layer': ['Relational data modeling', 'Key–value data modeling', 'Indexing', 'ACID', 'Isolation & locking', 'Partitioning', 'Consistency modeling', 'Caching', 'Event streaming', 'Message queuing', 'Pub/Sub messaging', 'MySQL', 'Redis', 'MongoDB', 'DynamoDB', 'Elasticsearch', 'Apache Kafka', 'RabbitMQ', 'AWS SQS', 'AWS Kinesis', 'Apache Spark', 'Apache Airflow', 'dbt (transformations)', 'Snowflake', 'Schema normalization', 'Query optimization', 'Index design strategy', 'Data modeling', 'Data consistency reasoning', 'Cache design', 'Idempotency & safe retries', 'Ordering strategies', 'Other'],
    'Operating Systems & Networks': ['perf (Linux performance profiling)', 'eBPF tooling', 'Flamegraphs tooling', 'valgrind tooling', 'vmstat', 'iostat', 'pidstat', 'sar (sysstat)', 'tcpdump', 'Wireshark', 'ethtool', 'numactl', 'Latency profiling', 'CPU pinning & thread affinity', 'NUMA-aware optimization', 'Lock contention analysis', 'Cache optimization', 'Network tuning', 'Packet capture & analysis', 'Kernel-path diagnosis', 'Allocator tuning', 'Zero-copy strategies', 'CPU microarchitecture', 'Cache locality', 'False sharing', 'High-resolution timing', 'Lock-free concurrency', 'TCP/UDP', 'Multicast', 'Zero-copy I/O', 'Backpressure & queueing theory', 'Other']
  };

  // Software Engineering specific framework sections
  const softwareEngineeringFrameworkSections = {
    'Languages, Runtimes & Build Tooling': ['Git', 'GitHub', 'Docker', 'GitHub Actions', 'Jenkins', 'Maven', 'Gradle', 'npm', 'pnpm', 'Yarn', 'pip', 'Poetry', 'Conda', 'Cargo', 'Bazel', 'Other'],
    'Client, UI & Product Experience': ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Vite', 'Webpack', 'Storybook', 'Playwright', 'Cypress', 'Lighthouse', 'React Native', 'SwiftUI', 'Jetpack Compose', 'Other'],
    'Backend Services & Distributed Systems': ['Node.js', 'Express', 'Spring Boot', 'ASP.NET Core', 'FastAPI', 'Django', 'Flask', 'NestJS', 'Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'AWS', 'GCP', 'Azure', 'Other'],
    'Data & Messaging Layer': ['PostgreSQL', 'MySQL', 'Redis', 'MongoDB', 'Elasticsearch', 'OpenSearch', 'Apache Kafka', 'RabbitMQ', 'AWS SQS', 'AWS Kinesis', 'Apache Spark', 'Apache Airflow', 'dbt (transformations)', 'Snowflake', 'BigQuery', 'Flyway', 'Liquibase', 'Other'],
    'Operating Systems & Networks': ['perf (Linux profiling)', 'eBPF tooling', 'Flamegraphs tooling', 'strace', 'gdb', 'valgrind tooling', 'rr (record/replay)', 'top / htop', 'vmstat', 'iostat', 'pidstat', 'sar (sysstat)', 'tcpdump', 'Wireshark', 'ethtool', 'numactl', 'Other']
  };

  const profileSteps = [
    'Career Focus',
    'Basic Info',
    'Education',
    'Professional',
  ] as const;
  const [activeProfileStep, setActiveProfileStep] = useState<(typeof profileSteps)[number]>('Career Focus');
  const [careerFocus, setCareerFocus] = useState<string>('');

  // Check if career focus has been selected
  const isCareerFocusSelected = useMemo(() => !!careerFocus, [careerFocus]);

  // Dynamic sections based on career focus - returns empty object when no career focus selected
  const technologySections = useMemo((): Record<string, string[]> => {
    if (careerFocus === 'software-engineering') {
      return softwareEngineeringTechnologySections;
    }
    return {}; // No sections available until career focus is selected
  }, [careerFocus]);

  const technicalSkillFocusSections = useMemo((): Record<string, string[]> => {
    if (careerFocus === 'software-engineering') {
      return softwareEngineeringTechnicalSkillFocusSections;
    }
    return {}; // No sections available until career focus is selected
  }, [careerFocus]);

  const frameworkSections = useMemo((): Record<string, string[]> => {
    if (careerFocus === 'software-engineering') {
      return softwareEngineeringFrameworkSections;
    }
    return {}; // No sections available until career focus is selected
  }, [careerFocus]);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const stepButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const stateDropdownOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedElement, setFocusedElement] = useState<'step' | 'field' | 'dot'>('step');
  const [highlightedStateIndex, setHighlightedStateIndex] = useState<number>(-1);
  // Field refs for each sub-panel
  const subPanel1FieldRefs = useRef<(HTMLInputElement | null)[]>([]);
  const subPanel2FieldRefs = useRef<(HTMLInputElement | HTMLButtonElement | null)[]>([]);
  const subPanel3FieldRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dotButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Basic Info sub-panel state
  const [activeBasicInfoSubPanel, setActiveBasicInfoSubPanel] = useState<number>(1);
  const [maxReachedBasicInfoSubPanel, setMaxReachedBasicInfoSubPanel] = useState<number>(1);
  // Sub-panel 1: Name fields
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  // Sub-panel 2: Contact fields
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [addressStreet, setAddressStreet] = useState<string>('');
  const [addressState, setAddressState] = useState<string>('');
  const [addressZip, setAddressZip] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  // Sub-panel 3: Links
  const [personalWebsite, setPersonalWebsite] = useState<string>('');
  const [linkedin, setLinkedin] = useState<string>('');
  interface Link {
    id: string;
    linkName: string;
    url: string;
  }
  const [links, setLinks] = useState<Link[]>([]);
  
  // Education section state
  interface Degree {
    id: string;
    degree: string;
    major: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    coursework: string;
  }
  
  interface College {
    id: string;
    collegeName: string;
    location: string;
    degrees: Degree[];
  }
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [activeCollegeSubPanel, setActiveCollegeSubPanel] = useState<number>(1);
  const educationCollegeDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [draggedDotIndex, setDraggedDotIndex] = useState<number | null>(null);
  const [draggedOverDotIndex, setDraggedOverDotIndex] = useState<number | null>(null);
  
  // Professional Experience state
  interface ProfessionalExperience {
    id: string;
    companyName: string;
    jobTitle: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    isPresent: boolean;
    location: string;
  }
  
  interface Achievement {
    id: string;
    type: string;
    value: string;
  }
  
  const [professionalExperiences, setProfessionalExperiences] = useState<ProfessionalExperience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAchievementDropdownOpen, setIsAchievementDropdownOpen] = useState<boolean>(false);
  const achievementDropdownRef = useRef<HTMLDivElement>(null);
  const achievementDropdownTriggerRef = useRef<HTMLButtonElement>(null);
  
  const achievementOptions = [
    'Paper Published',
    'Patent & Invention',
    'Certification',
    'Open-Source Contribution',
    'Conference Presentation',
    'Award',
    'Others'
  ];
  const [activeProfessionalSubPanel, setActiveProfessionalSubPanel] = useState<number>(1);
  const professionalDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // localStorage keys
  const DASHBOARD_STORAGE_KEY = 'dashboardPageState';
  const DASHBOARD_RESUME_FILE_KEY = 'dashboardResumeFileMetadata';
  
  // Flag to prevent saving during initial load
  const isInitialLoadRef = useRef(true);
  // Flag to track if data was loaded from localStorage
  const hasLoadedFromStorageRef = useRef(false);
  // Flag to track if profile has been fetched from backend API
  const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  // Flag to track if knowledge has been fetched from backend API
  const [isKnowledgeFetched, setIsKnowledgeFetched] = useState<boolean>(false);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState<boolean>(false);
  // Flag to track if expanding knowledge has been fetched from backend API
  const [isExpandingKnowledgeFetched, setIsExpandingKnowledgeFetched] = useState<boolean>(false);
  const [isExpandingKnowledgeLoading, setIsExpandingKnowledgeLoading] = useState<boolean>(false);
  
  // Profile form auto-save state management
  const [profileFormState, setProfileFormState] = useState<'profile_saved' | 'profile_dirty'>('profile_saved');
  const [lastProfileUpdateTimestamp, setLastProfileUpdateTimestamp] = useState<number | null>(null);
  const profileAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);
  const [showEstablishedSavedMessage, setShowEstablishedSavedMessage] = useState<boolean>(false);
  
  // Established expertise form auto-save state management
  const [establishedFormState, setEstablishedFormState] = useState<'established_saved' | 'established_dirty'>('established_saved');
  const [lastEstablishedUpdateTimestamp, setLastEstablishedUpdateTimestamp] = useState<number | null>(null);
  const establishedAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Expanding knowledge base form auto-save state management
  const [expandingFormState, setExpandingFormState] = useState<'expanding_saved' | 'expanding_dirty'>('expanding_saved');
  const [lastExpandingUpdateTimestamp, setLastExpandingUpdateTimestamp] = useState<number | null>(null);
  const expandingAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showExpandingSavedMessage, setShowExpandingSavedMessage] = useState<boolean>(false);
  
  // Helper function to mark profile form as dirty and update timestamp
  const markProfileDirty = () => {
    setProfileFormState('profile_dirty');
    setLastProfileUpdateTimestamp(Date.now());
    // Clear any existing auto-save timer - it will be reset by the useEffect
    if (profileAutoSaveTimerRef.current) {
      clearTimeout(profileAutoSaveTimerRef.current);
      profileAutoSaveTimerRef.current = null;
    }
  };
  
  // Helper function to mark established expertise form as dirty and update timestamp
  const markEstablishedDirty = () => {
    setEstablishedFormState('established_dirty');
    setLastEstablishedUpdateTimestamp(Date.now());
    // Clear any existing auto-save timer - it will be reset by the useEffect
    if (establishedAutoSaveTimerRef.current) {
      clearTimeout(establishedAutoSaveTimerRef.current);
      establishedAutoSaveTimerRef.current = null;
    }
  };
  
  // Helper function to mark expanding knowledge base form as dirty and update timestamp
  const markExpandingDirty = () => {
    setExpandingFormState('expanding_dirty');
    setLastExpandingUpdateTimestamp(Date.now());
    // Clear any existing auto-save timer - it will be reset by the useEffect
    if (expandingAutoSaveTimerRef.current) {
      clearTimeout(expandingAutoSaveTimerRef.current);
      expandingAutoSaveTimerRef.current = null;
    }
  };
  
  // Auto-save profile form after 60 seconds of inactivity
  useEffect(() => {
    // Only set up auto-save if form is dirty and we have a timestamp
    if (profileFormState === 'profile_dirty' && lastProfileUpdateTimestamp !== null) {
      // Clear any existing timer
      if (profileAutoSaveTimerRef.current) {
        clearTimeout(profileAutoSaveTimerRef.current);
      }

      // Calculate time remaining until 60 seconds
      const timeSinceUpdate = Date.now() - lastProfileUpdateTimestamp;
      const timeRemaining = Math.max(0, 60000 - timeSinceUpdate);

      // Set timeout to call handleProfileSubmit after remaining time
      profileAutoSaveTimerRef.current = setTimeout(async () => {
        await handleProfileSubmit();
        // Note: handleProfileSubmit will update profileFormState to 'profile_saved' on success
      }, timeRemaining);

      // Cleanup function to clear timer
      return () => {
        if (profileAutoSaveTimerRef.current) {
          clearTimeout(profileAutoSaveTimerRef.current);
          profileAutoSaveTimerRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileFormState, lastProfileUpdateTimestamp]);

  // Auto-save established expertise form after 60 seconds of inactivity
  useEffect(() => {
    // Only set up auto-save if form is dirty and we have a timestamp
    if (establishedFormState === 'established_dirty' && lastEstablishedUpdateTimestamp !== null) {
      // Clear any existing timer
      if (establishedAutoSaveTimerRef.current) {
        clearTimeout(establishedAutoSaveTimerRef.current);
      }

      // Calculate time remaining until 60 seconds
      const timeSinceUpdate = Date.now() - lastEstablishedUpdateTimestamp;
      const timeRemaining = Math.max(0, 60000 - timeSinceUpdate);

      // Set timeout to call handleKnowledgeSubmit after remaining time
      establishedAutoSaveTimerRef.current = setTimeout(async () => {
        await handleKnowledgeSubmit();
        // Note: handleKnowledgeSubmit will update establishedFormState to 'established_saved' on success
      }, timeRemaining);

      // Cleanup function to clear timer
      return () => {
        if (establishedAutoSaveTimerRef.current) {
          clearTimeout(establishedAutoSaveTimerRef.current);
          establishedAutoSaveTimerRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishedFormState, lastEstablishedUpdateTimestamp]);

  // Auto-save expanding knowledge base form after 60 seconds of inactivity
  useEffect(() => {
    // Only set up auto-save if form is dirty and we have a timestamp
    if (expandingFormState === 'expanding_dirty' && lastExpandingUpdateTimestamp !== null) {
      // Clear any existing timer
      if (expandingAutoSaveTimerRef.current) {
        clearTimeout(expandingAutoSaveTimerRef.current);
      }

      // Calculate time remaining until 60 seconds
      const timeSinceUpdate = Date.now() - lastExpandingUpdateTimestamp;
      const timeRemaining = Math.max(0, 60000 - timeSinceUpdate);

      // Set timeout to call handleExpandingKnowledgeSubmit after remaining time
      expandingAutoSaveTimerRef.current = setTimeout(async () => {
        await handleExpandingKnowledgeSubmit();
        // Note: handleExpandingKnowledgeSubmit will update expandingFormState to 'expanding_saved' on success
      }, timeRemaining);

      // Cleanup function to clear timer
      return () => {
        if (expandingAutoSaveTimerRef.current) {
          clearTimeout(expandingAutoSaveTimerRef.current);
          expandingAutoSaveTimerRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandingFormState, lastExpandingUpdateTimestamp]);

  // Cleanup auto-save timer on component unmount
  useEffect(() => {
    return () => {
      if (profileAutoSaveTimerRef.current) {
        clearTimeout(profileAutoSaveTimerRef.current);
        profileAutoSaveTimerRef.current = null;
      }
      if (establishedAutoSaveTimerRef.current) {
        clearTimeout(establishedAutoSaveTimerRef.current);
        establishedAutoSaveTimerRef.current = null;
      }
      if (expandingAutoSaveTimerRef.current) {
        clearTimeout(expandingAutoSaveTimerRef.current);
        expandingAutoSaveTimerRef.current = null;
      }
    };
  }, []);
  
  // Auto-hide "Saved!" message after 3 seconds
  useEffect(() => {
    if (showSavedMessage) {
      const timer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSavedMessage]);
  
  // Auto-hide "Saved!" message for established expertise after 5 seconds
  useEffect(() => {
    if (showEstablishedSavedMessage) {
      const timer = setTimeout(() => {
        setShowEstablishedSavedMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showEstablishedSavedMessage]);
  
  // Auto-hide "Saved!" message for expanding knowledge base after 5 seconds
  useEffect(() => {
    if (showExpandingSavedMessage) {
      const timer = setTimeout(() => {
        setShowExpandingSavedMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showExpandingSavedMessage]);
  
  // Utility functions for localStorage
  const saveDashboardState = () => {
    // Don't save during initial load
    if (isInitialLoadRef.current) {
      return;
    }
    
    try {
      const stateToSave = {
        // Page/Step state
        activeSection,
        activeProfileStep,
        activeExpertiseStep,
        activeExpandingKnowledgeStep,
        showProfileIntro,
        showEstablishedExpertise,
        showExpandingKnowledgeBase,
        activePersonalProjectSubPanel,
        activeFuturePersonalProjectSubPanel,
        activeProfessionalProjectSubPanel,
        activeFutureProfessionalProjectSubPanel,
        activeBasicInfoSubPanel,
        activeCollegeSubPanel,
        activeProfessionalSubPanel,
        // Profile form data
        careerFocus,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        addressStreet,
        addressState,
        addressZip,
        personalWebsite,
        linkedin,
        links,
        colleges,
        professionalExperiences,
        achievements,
        // Knowledge form data
        personalProjects,
        futurePersonalProjects,
        professionalProjects,
        futureProfessionalProjects,
        selectedTechnicalSkills,
        customTechnicalSkillKeywords,
        customTechnicalSkillLayers,
        // Analysis Section state (separate from Resume)
        analysisJobPosition,
      };
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(stateToSave));
      
      // Save resume file metadata (we can't store the file itself)
      if (resumeFile) {
        const fileMetadata = {
          name: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type,
          lastModified: resumeFile.lastModified,
        };
        localStorage.setItem(DASHBOARD_RESUME_FILE_KEY, JSON.stringify(fileMetadata));
      } else {
        localStorage.removeItem(DASHBOARD_RESUME_FILE_KEY);
      }
    } catch (error) {
      console.error('Error saving dashboard state to localStorage:', error);
    }
  };
  
  const loadDashboardState = () => {
    try {
      const savedState = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Restore page/step state
        if (parsed.activeSection !== undefined) setActiveSection(parsed.activeSection);
        if (parsed.activeProfileStep !== undefined) setActiveProfileStep(parsed.activeProfileStep);
        if (parsed.activeExpertiseStep !== undefined) setActiveExpertiseStep(parsed.activeExpertiseStep);
        if (parsed.activeExpandingKnowledgeStep !== undefined) setActiveExpandingKnowledgeStep(parsed.activeExpandingKnowledgeStep);
        if (parsed.showProfileIntro !== undefined) setShowProfileIntro(parsed.showProfileIntro);
        if (parsed.showEstablishedExpertise !== undefined) setShowEstablishedExpertise(parsed.showEstablishedExpertise);
        if (parsed.showExpandingKnowledgeBase !== undefined) setShowExpandingKnowledgeBase(parsed.showExpandingKnowledgeBase);
        if (parsed.activePersonalProjectSubPanel !== undefined) setActivePersonalProjectSubPanel(parsed.activePersonalProjectSubPanel);
        if (parsed.activeFuturePersonalProjectSubPanel !== undefined) setActiveFuturePersonalProjectSubPanel(parsed.activeFuturePersonalProjectSubPanel);
        if (parsed.activeProfessionalProjectSubPanel !== undefined) setActiveProfessionalProjectSubPanel(parsed.activeProfessionalProjectSubPanel);
        if (parsed.activeFutureProfessionalProjectSubPanel !== undefined) setActiveFutureProfessionalProjectSubPanel(parsed.activeFutureProfessionalProjectSubPanel);
        if (parsed.activeBasicInfoSubPanel !== undefined) setActiveBasicInfoSubPanel(parsed.activeBasicInfoSubPanel);
        if (parsed.activeCollegeSubPanel !== undefined) setActiveCollegeSubPanel(parsed.activeCollegeSubPanel);
        if (parsed.activeProfessionalSubPanel !== undefined) setActiveProfessionalSubPanel(parsed.activeProfessionalSubPanel);
        
        // Restore profile form data
        if (parsed.careerFocus !== undefined) setCareerFocus(parsed.careerFocus);
        if (parsed.firstName !== undefined) setFirstName(parsed.firstName);
        if (parsed.middleName !== undefined) setMiddleName(parsed.middleName);
        if (parsed.lastName !== undefined) setLastName(parsed.lastName);
        if (parsed.email !== undefined) setEmail(parsed.email);
        if (parsed.phone !== undefined) setPhone(parsed.phone);
        if (parsed.addressStreet !== undefined) setAddressStreet(parsed.addressStreet);
        if (parsed.addressState !== undefined) setAddressState(parsed.addressState);
        if (parsed.addressZip !== undefined) setAddressZip(parsed.addressZip);
        if (parsed.personalWebsite !== undefined) setPersonalWebsite(parsed.personalWebsite);
        if (parsed.linkedin !== undefined) setLinkedin(parsed.linkedin);
        if (parsed.links !== undefined) setLinks(parsed.links);
        if (parsed.colleges !== undefined) setColleges(parsed.colleges);
        if (parsed.professionalExperiences !== undefined) setProfessionalExperiences(parsed.professionalExperiences);
        if (parsed.achievements !== undefined) setAchievements(parsed.achievements);
        
        // Restore knowledge form data
        if (parsed.personalProjects !== undefined) {
          // Normalize project descriptions (migrate from old format if needed)
          const normalizedPersonalProjects = parsed.personalProjects.map((p: any) => ({
            ...p,
            projectDescription: normalizeProjectDescription(p.projectDescription),
          }));
          setPersonalProjects(normalizedPersonalProjects);
          hasLoadedFromStorageRef.current = true;
        }
        if (parsed.futurePersonalProjects !== undefined) {
          // Normalize project descriptions (migrate from old format if needed)
          const normalizedFuturePersonalProjects = parsed.futurePersonalProjects.map((p: any) => ({
            ...p,
            projectDescription: normalizeProjectDescription(p.projectDescription),
          }));
          setFuturePersonalProjects(normalizedFuturePersonalProjects);
          hasLoadedFromStorageRef.current = true;
        }
        if (parsed.professionalProjects !== undefined) {
          // Normalize project descriptions (migrate from old format if needed)
          const normalizedProfessionalProjects = parsed.professionalProjects.map((p: any) => ({
            ...p,
            projectDescription: normalizeProjectDescription(p.projectDescription),
          }));
          setProfessionalProjects(normalizedProfessionalProjects);
          hasLoadedFromStorageRef.current = true;
        }
        if (parsed.futureProfessionalProjects !== undefined) {
          // Normalize project descriptions (migrate from old format if needed)
          const normalizedFutureProfessionalProjects = parsed.futureProfessionalProjects.map((p: any) => ({
            ...p,
            projectDescription: normalizeProjectDescription(p.projectDescription),
          }));
          setFutureProfessionalProjects(normalizedFutureProfessionalProjects);
          hasLoadedFromStorageRef.current = true;
        }
        if (parsed.professionalProjects !== undefined) {
          // Normalize project descriptions (migrate from old format if needed)
          const normalizedProfessionalProjects = parsed.professionalProjects.map((p: any) => ({
            ...p,
            projectDescription: normalizeProjectDescription(p.projectDescription),
          }));
          setProfessionalProjects(normalizedProfessionalProjects);
          hasLoadedFromStorageRef.current = true;
        }
        if (parsed.selectedTechnicalSkills !== undefined) setSelectedTechnicalSkills(parsed.selectedTechnicalSkills);
        if (parsed.customTechnicalSkillKeywords !== undefined) setCustomTechnicalSkillKeywords(parsed.customTechnicalSkillKeywords);
        if (parsed.customTechnicalSkillLayers !== undefined) setCustomTechnicalSkillLayers(parsed.customTechnicalSkillLayers);

        // Restore Analysis Section state (separate from Resume)
        if (parsed.analysisJobPosition !== undefined) setAnalysisJobPosition(parsed.analysisJobPosition);
      }

      // Note: Resume file cannot be restored from localStorage, user will need to re-upload
      const fileMetadata = localStorage.getItem(DASHBOARD_RESUME_FILE_KEY);
      if (fileMetadata) {
        // File was previously uploaded but can't be restored
        setResumeFile(null);
      }
    } catch (error) {
      console.error('Error loading dashboard state from localStorage:', error);
    }
  };
  
  // Load state on component mount
  useEffect(() => {
    loadDashboardState();
    // Mark initial load as complete after a short delay to allow state to settle
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save state whenever relevant state changes
  useEffect(() => {
    saveDashboardState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSection,
    activeProfileStep,
    activeExpertiseStep,
    activeExpandingKnowledgeStep,
    showProfileIntro,
    showEstablishedExpertise,
    showExpandingKnowledgeBase,
    activePersonalProjectSubPanel,
    activeProfessionalProjectSubPanel,
    activeBasicInfoSubPanel,
    activeCollegeSubPanel,
    activeProfessionalSubPanel,
    careerFocus,
    firstName,
    middleName,
    lastName,
    email,
    phone,
    addressStreet,
    addressState,
    addressZip,
    personalWebsite,
    linkedin,
    links,
    colleges,
    professionalExperiences,
    achievements,
    personalProjects,
    professionalProjects,
    selectedTechnicalSkills,
    customTechnicalSkillKeywords,
    customTechnicalSkillLayers,
    resumeFile,
  ]);
  
  // Initialize with one personal project if empty when Personal Project step is active
  // Only initialize if data was NOT loaded from localStorage
  useEffect(() => {
    // Wait for initial load to complete
    if (isInitialLoadRef.current) {
      return;
    }
    
    // Don't initialize if we loaded data from storage (even if array is now empty, user might have cleared it)
    if (hasLoadedFromStorageRef.current) {
      return;
    }
    
    if (activeExpertiseStep === 'Personal Project' && personalProjects.length === 0) {
      const initialProject: PersonalProject = {
        id: `project-${Date.now()}-${Math.random()}`,
        projectName: '',
        projectDescription: {
          overview: '',
          techAndTeamwork: '',
          achievement: '',
        },
        selectedIndustries: [],
        projectStartMonth: '',
        projectStartYear: '',
        projectEndMonth: '',
        projectEndYear: '',
        location: '',
        selectedTechnologies: [],
        selectedFrameworks: [],
        isInterviewReady: false,
      };
      markEstablishedDirty();
      setPersonalProjects([initialProject]);
      setActivePersonalProjectSubPanel(1);
    }
  }, [activeExpertiseStep, personalProjects.length]);

  // Initialize with one professional project if empty when Professional Project step is active
  useEffect(() => {
    if (activeExpertiseStep === 'Professional Project' && professionalProjects.length === 0) {
      // Use a timeout to ensure this runs after knowledge loading completes
      const timer = setTimeout(() => {
        const initialProject: ProfessionalProject = {
          id: `professional-project-${Date.now()}-${Math.random()}`,
          projectName: '',
          projectDescription: {
            overview: '',
            techAndTeamwork: '',
            achievement: '',
          },
          selectedWorkExperience: '',
          projectStartMonth: '',
          projectStartYear: '',
          projectEndMonth: '',
          projectEndYear: '',
          selectedTechnologies: [],
          selectedFrameworks: [],
          isInterviewReady: false,
        };
        markEstablishedDirty();
        setProfessionalProjects([initialProject]);
        setActiveProfessionalProjectSubPanel(1);
      }, isKnowledgeLoading ? 500 : 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeExpertiseStep, professionalProjects.length, isKnowledgeLoading]);

  // Initialize with one personal project if empty when Future Personal Project step is active
  useEffect(() => {
    // Wait for initial load to complete
    if (isInitialLoadRef.current) {
      return;
    }
    
    // Always initialize if the section is active and array is empty
    // This ensures the section always has content to display
    if (activeExpandingKnowledgeStep === 'Future Personal Project' && futurePersonalProjects.length === 0) {
      const initialProject: PersonalProject = {
        id: `project-${Date.now()}-${Math.random()}`,
        projectName: '',
        projectDescription: {
          overview: '',
          techAndTeamwork: '',
          achievement: '',
        },
        selectedIndustries: [],
        projectStartMonth: '',
        projectStartYear: '',
        projectEndMonth: '',
        projectEndYear: '',
        location: '',
        selectedTechnologies: [],
        selectedFrameworks: [],
        isInterviewReady: false,
      };
      setFuturePersonalProjects([initialProject]);
      setActiveFuturePersonalProjectSubPanel(1);
    }
  }, [activeExpandingKnowledgeStep, futurePersonalProjects.length]);

  // Initialize with one professional project if empty when Future Professional Project step is active
  useEffect(() => {
    // Wait for initial load to complete
    if (isInitialLoadRef.current) {
      return;
    }
    
    // Always initialize if the section is active and array is empty
    // This ensures the section always has content to display
    if (activeExpandingKnowledgeStep === 'Future Professional Project' && futureProfessionalProjects.length === 0) {
      const initialProject: ProfessionalProject = {
        id: `professional-project-${Date.now()}-${Math.random()}`,
        projectName: '',
        projectDescription: {
          overview: '',
          techAndTeamwork: '',
          achievement: '',
        },
        selectedWorkExperience: '',
        projectStartMonth: '',
        projectStartYear: '',
        projectEndMonth: '',
        projectEndYear: '',
        selectedTechnologies: [],
        selectedFrameworks: [],
        isInterviewReady: false,
      };
      setFutureProfessionalProjects([initialProject]);
      setActiveFutureProfessionalProjectSubPanel(1);
    }
  }, [activeExpandingKnowledgeStep, futureProfessionalProjects.length]);

  // Mark tags as initialized after first render to disable animation on switch
  useEffect(() => {
    if (activeExpertiseStep === 'Personal Project' && personalProjects.length > 4) {
      if (!tagsInitialized) {
        const timer = setTimeout(() => {
          setTagsInitialized(true);
        }, 700); // Wait for animation to complete
        return () => clearTimeout(timer);
      }
    } else if (personalProjects.length <= 4) {
      // Reset when going back to dots
      setTagsInitialized(false);
    }
  }, [activeExpertiseStep, personalProjects.length, tagsInitialized]);

  // Mark professional project tags as initialized after first render to disable animation on switch
  useEffect(() => {
    if (activeExpertiseStep === 'Professional Project' && professionalProjects.length > 4) {
      if (!tagsInitializedProfessional) {
        const timer = setTimeout(() => {
          setTagsInitializedProfessional(true);
        }, 700); // Wait for animation to complete
        return () => clearTimeout(timer);
      }
    } else if (professionalProjects.length <= 4) {
      // Reset when going back to dots
      setTagsInitializedProfessional(false);
    }
  }, [activeExpertiseStep, professionalProjects.length, tagsInitializedProfessional]);

  // Cleanup hover timeout on unmount or step change
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hoverTimeoutRefProfessional.current) {
        clearTimeout(hoverTimeoutRefProfessional.current);
      }
    };
  }, [activeExpertiseStep]);

  // Validate and reset activeProfessionalProjectSubPanel if out of bounds
  useEffect(() => {
    if (activeExpertiseStep === 'Professional Project' && professionalProjects.length > 0) {
      if (activeProfessionalProjectSubPanel > professionalProjects.length || activeProfessionalProjectSubPanel < 1) {
        setActiveProfessionalProjectSubPanel(1);
      }
    }
  }, [activeExpertiseStep, professionalProjects.length, activeProfessionalProjectSubPanel]);

  // Validate and reset activeFutureProfessionalProjectSubPanel if out of bounds
  useEffect(() => {
    if (activeExpandingKnowledgeStep === 'Future Professional Project' && futureProfessionalProjects.length > 0) {
      if (activeFutureProfessionalProjectSubPanel > futureProfessionalProjects.length || activeFutureProfessionalProjectSubPanel < 1) {
        setActiveFutureProfessionalProjectSubPanel(1);
      }
    }
  }, [activeExpandingKnowledgeStep, futureProfessionalProjects.length, activeFutureProfessionalProjectSubPanel]);

  // Validate and reset activePersonalProjectSubPanel if out of bounds
  useEffect(() => {
    if (activeExpertiseStep === 'Personal Project' && personalProjects.length > 0) {
      if (activePersonalProjectSubPanel > personalProjects.length || activePersonalProjectSubPanel < 1) {
        setActivePersonalProjectSubPanel(1);
      }
    }
  }, [activeExpertiseStep, personalProjects.length, activePersonalProjectSubPanel]);

  // Validate and reset activeFuturePersonalProjectSubPanel if out of bounds
  useEffect(() => {
    if (activeExpandingKnowledgeStep === 'Future Personal Project' && futurePersonalProjects.length > 0) {
      if (activeFuturePersonalProjectSubPanel > futurePersonalProjects.length || activeFuturePersonalProjectSubPanel < 1) {
        setActiveFuturePersonalProjectSubPanel(1);
      }
    }
  }, [activeExpandingKnowledgeStep, futurePersonalProjects.length, activeFuturePersonalProjectSubPanel]);

  // Calculate scroll distance for work experience text when it changes
  useEffect(() => {
    if (activeExpertiseStep === 'Professional Project') {
      professionalProjects.forEach((project) => {
        const textElement = workExperienceTextRefs.current[project.id];
        if (textElement && project.selectedWorkExperience) {
          const container = textElement.parentElement;
          if (container) {
            const textWidth = textElement.scrollWidth;
            const containerWidth = container.clientWidth;
            if (textWidth > containerWidth) {
              const scrollDistance = containerWidth - textWidth;
              textElement.style.setProperty('--scroll-distance', `${scrollDistance}px`);
            } else {
              textElement.style.setProperty('--scroll-distance', '0px');
            }
          }
        }
      });
    }
  }, [professionalProjects, activeExpertiseStep]);
  
  // Initialize with one college if empty when Education step is active
  useEffect(() => {
    if (activeProfileStep === 'Education' && colleges.length === 0) {
      const initialCollege: College = {
        id: `college-${Date.now()}-${Math.random()}`,
        collegeName: '',
        location: '',
        degrees: [{
          id: `degree-${Date.now()}-${Math.random()}`,
          degree: '',
          major: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          coursework: ''
        }]
      };
      setColleges([initialCollege]);
      setActiveCollegeSubPanel(1);
    }
  }, [activeProfileStep]);
  
  // Initialize with one professional experience if empty when Professional step is active
  useEffect(() => {
    if (activeProfileStep === 'Professional' && professionalExperiences.length === 0) {
      const initialExperience: ProfessionalExperience = {
        id: `experience-${Date.now()}-${Math.random()}`,
        companyName: '',
        jobTitle: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        isPresent: false,
        location: ''
      };
      setProfessionalExperiences([initialExperience]);
      setActiveProfessionalSubPanel(1);
    }
  }, [activeProfileStep]);
  
  // Reset college sub-panel when switching away from Education
  useEffect(() => {
    if (activeProfileStep !== 'Education') {
      setActiveCollegeSubPanel(1);
    }
  }, [activeProfileStep]);
  
  // Reset professional sub-panel when switching away from Professional
  useEffect(() => {
    if (activeProfileStep !== 'Professional') {
      setActiveProfessionalSubPanel(1);
    }
  }, [activeProfileStep]);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => 2035 - i);
  
  // US States for dropdown
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const careerOptions = [
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'data-science', label: 'Data & Applied Science' },
    { value: 'data-engineering', label: 'Data Engineering' },
    { value: 'software-engineering', label: 'Software Engineering' },
  ];

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  // Check if all fields in current sub-panel are filled
  const isSubPanelComplete = (panelNumber: number): boolean => {
    switch (panelNumber) {
      case 1:
        return firstName.trim() !== '' && lastName.trim() !== '';
      case 2:
        return email.trim() !== '' && 
               phone.trim() !== '' && 
               addressStreet.trim() !== '' && 
               addressState !== '' && 
               addressZip.trim() !== '' &&
               emailError === '' && 
               phoneError === '';
      case 3:
        return true; // All fields are optional in panel 3
      default:
        return false;
    }
  };

  // Handle Enter key to switch to next sub-panel
  const handleEnterKey = (e: React.KeyboardEvent, panelNumber: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (panelNumber < 3) {
        const nextPanel = panelNumber + 1;
        setActiveBasicInfoSubPanel(nextPanel);
        setMaxReachedBasicInfoSubPanel(nextPanel);
      }
    }
  };

  // Check if a profile step is completed
  const isStepCompleted = (step: string): boolean => {
    switch (step) {
      case 'Career Focus':
        return careerFocus.trim() !== '';
      case 'Basic Info':
        return firstName.trim() !== '' &&
               lastName.trim() !== '' &&
               email.trim() !== '' &&
               phone.trim() !== '' &&
               addressStreet.trim() !== '' &&
               addressState !== '' &&
               addressZip.trim() !== '' &&
               emailError === '' &&
               phoneError === '';
      case 'Education':
        return colleges.length > 0 &&
               colleges.every(college => 
                 college.collegeName.trim() !== '' &&
                 college.degrees.length > 0 &&
                 college.degrees.every(degree => 
                   degree.degree.trim() !== '' &&
                   degree.major.trim() !== '' &&
                   degree.startMonth !== '' &&
                   degree.startYear !== ''
                 )
               );
      case 'Professional':
        return professionalExperiences.length > 0;
      default:
        return false;
    }
  };

  // Check if an expertise step is completed (has any field filled)
  const isExpertiseStepCompleted = (step: string): boolean => {
    switch (step) {
      case 'Personal Project':
        return personalProjects.length > 0 && personalProjects.some(project => 
          project.projectName.trim() !== '' ||
          ((project.projectDescription?.overview?.trim() || '') !== '' || (project.projectDescription?.techAndTeamwork?.trim() || '') !== '' || (project.projectDescription?.achievement?.trim() || '') !== '') ||
          project.selectedIndustries.length > 0 ||
          project.selectedTechnologies.length > 0 ||
          project.selectedFrameworks.length > 0 ||
          project.projectStartMonth !== '' ||
          project.projectStartYear !== '' ||
          project.projectEndMonth !== '' ||
          project.projectEndYear !== ''
        );
      case 'Professional Project':
        return professionalProjects.length > 0 && professionalProjects.some(project => 
          project.projectName.trim() !== '' ||
          ((project.projectDescription?.overview?.trim() || '') !== '' || (project.projectDescription?.techAndTeamwork?.trim() || '') !== '' || (project.projectDescription?.achievement?.trim() || '') !== '') ||
          project.selectedWorkExperience.trim() !== '' ||
          project.selectedTechnologies.length > 0 ||
          project.selectedFrameworks.length > 0
        );
      case 'Technical Skill Focus':
        return selectedTechnicalSkills.length > 0 || customTechnicalSkillLayers.length > 0;
      default:
        return false;
    }
  };

  // Check if an expanding knowledge step is completed (has any field filled)
  const isExpandingKnowledgeStepCompleted = (step: string): boolean => {
    switch (step) {
      case 'Future Personal Project':
        return personalProjects.length > 0 && personalProjects.some(project => 
          project.projectName.trim() !== '' ||
          ((project.projectDescription?.overview?.trim() || '') !== '' || (project.projectDescription?.techAndTeamwork?.trim() || '') !== '' || (project.projectDescription?.achievement?.trim() || '') !== '') ||
          project.selectedIndustries.length > 0 ||
          project.selectedTechnologies.length > 0 ||
          project.selectedFrameworks.length > 0 ||
          project.projectStartMonth !== '' ||
          project.projectStartYear !== '' ||
          project.projectEndMonth !== '' ||
          project.projectEndYear !== ''
        );
      case 'Future Professional Project':
        return professionalProjects.length > 0 && professionalProjects.some(project => 
          project.projectName.trim() !== '' ||
          ((project.projectDescription?.overview?.trim() || '') !== '' || (project.projectDescription?.techAndTeamwork?.trim() || '') !== '' || (project.projectDescription?.achievement?.trim() || '') !== '') ||
          project.selectedWorkExperience.trim() !== '' ||
          project.selectedTechnologies.length > 0 ||
          project.selectedFrameworks.length > 0
        );
      case 'Future Technical Skills':
        return selectedFutureTechnicalSkills.length > 0 || customFutureTechnicalSkillLayers.length > 0;
      default:
        return false;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
        setHighlightedStateIndex(-1);
      }
      if (achievementDropdownRef.current && !achievementDropdownRef.current.contains(event.target as Node)) {
        setIsAchievementDropdownOpen(false);
      }
      if (descriptionDropdownRef.current && !descriptionDropdownRef.current.contains(event.target as Node)) {
        // Value is already saved as user types, just close the dropdown
        setIsDescriptionDropdownOpen(false);
      }
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target as Node)) {
        setIsIndustryDropdownOpen(false);
      }
      if (workExperienceDropdownRef.current && !workExperienceDropdownRef.current.contains(event.target as Node)) {
        setIsWorkExperienceDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isStateDropdownOpen || isAchievementDropdownOpen || isDescriptionDropdownOpen || isIndustryDropdownOpen || isWorkExperienceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isStateDropdownOpen, isAchievementDropdownOpen, isDescriptionDropdownOpen, isIndustryDropdownOpen, isWorkExperienceDropdownOpen]);

  // Fetch profile data from backend when user first navigates to profile section
  useEffect(() => {
    // Only fetch if:
    // 1. User is authenticated
    // 2. Profile section is active
    // 3. Profile hasn't been fetched yet
    // 4. Not currently loading
    if (user?.profile?.sub && activeSection === 'profile' && !isProfileFetched && !isProfileLoading) {
      fetchProfile();
    }
  }, [user, activeSection, isProfileFetched, isProfileLoading]);

  // Fetch knowledge data when user enters Established Expertise pages
  useEffect(() => {
    // Only fetch if:
    // 1. User is authenticated
    // 2. Established Expertise is being shown
    // 3. Knowledge hasn't been fetched yet
    // 4. Not currently loading
    if (user?.profile?.sub && showEstablishedExpertise && !isKnowledgeFetched && !isKnowledgeLoading) {
      fetchKnowledge();
    }
  }, [user, showEstablishedExpertise, isKnowledgeFetched, isKnowledgeLoading]);

  // Fetch expanding knowledge data when user enters Expanding Knowledge Base pages
  useEffect(() => {
    // Only fetch if:
    // 1. User is authenticated
    // 2. Expanding Knowledge Base is being shown
    // 3. Expanding Knowledge hasn't been fetched yet
    // 4. Not currently loading
    if (user?.profile?.sub && showExpandingKnowledgeBase && !isExpandingKnowledgeFetched && !isExpandingKnowledgeLoading) {
      fetchExpandingKnowledge();
    }
  }, [user, showExpandingKnowledgeBase, isExpandingKnowledgeFetched, isExpandingKnowledgeLoading]);

  // Auto-focus the active step button when profile section is active
  useEffect(() => {
    if (activeSection === 'profile') {
      if (focusedElement === 'step') {
        const currentStepIdx = profileSteps.indexOf(activeProfileStep);
        // Only auto-focus if no input is currently focused
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
          return; // Don't steal focus from inputs
        }
        setTimeout(() => {
          stepButtonRefs.current[currentStepIdx]?.focus();
        }, 0);
      }
    }
  }, [activeSection, activeProfileStep, profileSteps, focusedElement]);

  // Reset Basic Info sub-panel when switching away from Basic Info
  useEffect(() => {
    if (activeProfileStep !== 'Basic Info') {
      setActiveBasicInfoSubPanel(1);
    }
  }, [activeProfileStep]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when profile section is active
      if (activeSection !== 'profile') return;

      // Don't interfere if dropdown menu is open and user is navigating dropdown options
      const target = event.target as HTMLElement;
      // Check if target is within the dropdown menu by checking if it's a button inside the dropdown
      const dropdownMenu = dropdownRef.current?.querySelector('[class*="customDropdownMenu"]') as HTMLElement;
      const stateDropdownMenu = stateDropdownRef.current?.querySelector('[class*="customDropdownMenu"]') as HTMLElement;
      const isInDropdownMenu = dropdownMenu?.contains(target);
      const isInStateDropdownMenu = stateDropdownMenu?.contains(target);
      
      if (isDropdownOpen && isInDropdownMenu) {
        // Allow native dropdown navigation for Up/Down arrows within dropdown options
        // Only handle Escape to close dropdown and return focus to trigger
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsDropdownOpen(false);
          setFocusedElement('field');
          setTimeout(() => {
            dropdownTriggerRef.current?.focus();
          }, 0);
          return;
        }
        // Allow other keys to work normally within dropdown (native behavior)
        return;
      }

      // Handle state dropdown navigation when dropdown is open
      if (isStateDropdownOpen) {
        // Check if focus is on the trigger button or inside the dropdown menu
        const isOnTrigger = stateDropdownRef.current?.querySelector('.customDropdownTrigger')?.contains(target);
        
        // Handle Escape to close state dropdown
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsStateDropdownOpen(false);
          setHighlightedStateIndex(-1);
          setFocusedElement('field');
          setTimeout(() => {
            const trigger = stateDropdownRef.current?.querySelector('.customDropdownTrigger') as HTMLButtonElement;
            trigger?.focus();
          }, 0);
          return;
        }
        // Handle Up/Down arrow keys for navigation within state dropdown
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const currentIndex = highlightedStateIndex < 0 ? -1 : highlightedStateIndex;
          const nextIndex = currentIndex < usStates.length - 1 ? currentIndex + 1 : 0;
          setHighlightedStateIndex(nextIndex);
          setTimeout(() => {
            stateDropdownOptionRefs.current[nextIndex]?.focus();
            // Scroll into view if needed
            stateDropdownOptionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 0);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const currentIndex = highlightedStateIndex < 0 ? usStates.length : highlightedStateIndex;
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : usStates.length - 1;
          setHighlightedStateIndex(prevIndex);
          setTimeout(() => {
            stateDropdownOptionRefs.current[prevIndex]?.focus();
            // Scroll into view if needed
            stateDropdownOptionRefs.current[prevIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 0);
          return;
        }
        // Handle Enter to select highlighted option
        if (event.key === 'Enter' && (isInStateDropdownMenu || isOnTrigger)) {
          event.preventDefault();
          if (highlightedStateIndex >= 0 && highlightedStateIndex < usStates.length) {
            markProfileDirty();
            setAddressState(usStates[highlightedStateIndex]);
            setIsStateDropdownOpen(false);
            setHighlightedStateIndex(-1);
            setFocusedElement('field');
          } else if (isOnTrigger && addressState) {
            // If Enter pressed on trigger and a state is already selected, close dropdown
            setIsStateDropdownOpen(false);
            setHighlightedStateIndex(-1);
          }
          return;
        }
        // If focus is inside dropdown menu, allow other keys to work normally
        if (isInStateDropdownMenu) {
          return;
        }
      }
      // Arrow key navigation for step circles, fields, and page switching has been removed
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection, isDropdownOpen, isStateDropdownOpen, highlightedStateIndex, usStates, addressState]);

  useEffect(() => {
    // Apply full-screen styling to body/html
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#edece3';

    return () => {
      // Cleanup on unmount
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  const navItems = [
    { id: 'profile' as const, label: 'Profile', icon: '/images/co-present.svg', iconType: 'image' as const },
    { id: 'knowledge' as const, label: 'Knowledge', icon: '/images/network-intel-node.svg', iconType: 'image' as const },
    { id: 'resume' as const, label: 'Resume', icon: '/images/file-copy.svg', iconType: 'image' as const },
    { id: 'analyzer' as const, label: 'Analysis', icon: '/images/bubble-chart.svg', iconType: 'image' as const },
  ];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #f0f4f8, #d9e6f2)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#4a5568', fontSize: '1rem' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated (redirect will happen via useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <h2 className={styles.sidebarTitle}>Ambitology</h2>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
              onClick={() => {
                // Clear autoTrigger flag when navigating away from analysis section
                if (activeSection === 'analyzer' && item.id !== 'analyzer') {
                  setAnalysisInitialData(prev => prev ? { ...prev, autoTrigger: false } : null);
                }
                setActiveSection(item.id);
                if (item.id === 'profile') {
                  // Restore the previous state from localStorage if available
                  // This ensures the user returns to the same step they were on
                  const savedState = localStorage.getItem(DASHBOARD_STORAGE_KEY);
                  if (savedState) {
                    try {
                      const parsed = JSON.parse(savedState);
                      // Restore showProfileIntro state if available
                      if (parsed.showProfileIntro !== undefined) {
                        setShowProfileIntro(parsed.showProfileIntro);
                      }
                      // Restore activeProfileStep if available and user was not on intro
                      if (parsed.activeProfileStep !== undefined && parsed.showProfileIntro === false) {
                        setActiveProfileStep(parsed.activeProfileStep);
                        // Also restore sub-panel if available
                        if (parsed.activeBasicInfoSubPanel !== undefined && parsed.activeProfileStep === 'Basic Info') {
                          setActiveBasicInfoSubPanel(parsed.activeBasicInfoSubPanel);
                        } else if (parsed.activeCollegeSubPanel !== undefined && parsed.activeProfileStep === 'Education') {
                          setActiveCollegeSubPanel(parsed.activeCollegeSubPanel);
                        } else if (parsed.activeProfessionalSubPanel !== undefined && parsed.activeProfileStep === 'Professional') {
                          setActiveProfessionalSubPanel(parsed.activeProfessionalSubPanel);
                        }
                      }
                    } catch (error) {
                      // If parsing fails, default to showing intro
                      setShowProfileIntro(true);
                    }
                  } else {
                    // No saved state, show intro
                    setShowProfileIntro(true);
                  }
                } else if (item.id !== 'knowledge') {
                  setShowEstablishedExpertise(false);
                }
              }}
            >
              <span className={styles.navIcon}>
                {item.iconType === 'image' ? (
                  <Image 
                    src={item.icon} 
                    alt={item.label} 
                    width={28} 
                    height={28} 
                    className={styles.navIconImage}
                  />
                ) : (
                  item.icon
                )}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
              {activeSection === item.id && <div className={styles.activeIndicator} />}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.footerDecorator}></div>
          <div className={styles.settingsContainer} ref={settingsContainerRef}>
            <button
              className={`${styles.settingsButton} ${isSettingsOpen ? styles.settingsButtonActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              aria-label="Settings"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: isSettingsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.settingsButtonText}>Settings</span>
            </button>
            {isSettingsOpen && (
              <div className={styles.settingsPanel}>
                <div className={styles.settingsPanelContent}>
                  <div className={styles.userEmailSection}>
                    <div className={styles.userEmailLabel}>Logged in as:</div>
                    <div className={styles.userEmail}>
                      {user?.profile?.email || user?.profile?.sub || 'Unknown'}
                    </div>
                  </div>
                  <button
                    className={styles.upgradePlanButton}
                    onClick={() => {
                      setIsUpgradeModalOpen(true);
                    }}
                  >
                    <span>Upgrade Plan</span>
                  </button>
                  <button
                    className={styles.logoutButton}
                    onClick={async () => {
                      try {
                        await signOutRedirect();
                      } catch (error) {
                        console.error("Logout error:", error);
                      }
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 17L21 12L16 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12H9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          <div className={`${styles.sectionContent} ${styles.fadeIn}`}>
            <div className={styles.contentWrapper}>
              {activeSection === 'profile' && showProfileIntro && (
                <>
                  <div className={styles.iconHeader}>
                    <div className={styles.sectionIcon}>
                      <Image 
                        src="/images/co-present.svg" 
                        alt="Profile" 
                        width={80} 
                        height={80} 
                        className={styles.sectionIconImage}
                      />
                    </div>
                  </div>
                  <h2 className={styles.sectionTitle}>Profile</h2>
                  <p className={styles.sectionText}>
                    Manage and organize your personal information and professional details.
                  </p>
                  <div className={styles.resumeUploadContainer}>
                    <div className={styles.resumeUploadArea}>
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.doc,.docx"
                        className={styles.resumeFileInput}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setResumeFile(file);
                        }}
                      />
                      <label htmlFor="resume-upload" className={styles.resumeUploadLabel}>
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
                            {resumeFile ? resumeFile.name : 'Upload Resume'}
                          </span>
                          <span className={styles.resumeUploadSubtitle}>
                            {resumeFile ? 'Click to change file' : 'PDF, DOC, or DOCX (Max 10MB)'}
                          </span>
                        </div>
                        {resumeFile && (
                          <button
                            type="button"
                            className={styles.resumeRemoveButton}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setResumeFile(null);
                              const input = document.getElementById('resume-upload') as HTMLInputElement;
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
                  <div className={styles.nextButtonContainer} style={{ marginTop: '3rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className={styles.nextButton}
                      onClick={() => setShowProfileIntro(false)}
                      aria-label="Continue to Profile"
                    >
                      <span className={styles.nextButtonText}>Next</span>
                      <svg 
                        className={styles.nextButtonIcon}
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M9 18L15 12L9 6" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
              {activeSection === 'profile' && !showProfileIntro && (
                <>
                  <div className={styles.resumeSectionHeader}>
                    <button
                      type="button"
                      className={`${styles.backButton} ${styles.resumeTopBackButton}`}
                      onClick={() => setShowProfileIntro(true)}
                      aria-label="Back to Profile"
                    >
                      <svg
                        className={styles.backButtonIcon}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 12H5M12 19L5 12L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.profileStepsContainer}>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBar}
                        style={{
                          width: profileSteps.indexOf(activeProfileStep) === 0 
                            ? '0%' 
                            : `${(profileSteps.indexOf(activeProfileStep) / (profileSteps.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    <ul className={styles.profileSteps}>
                      {profileSteps.map((step, idx) => {
                        const currentIdx = profileSteps.indexOf(activeProfileStep);
                        const isActive = idx === currentIdx;
                        const isBasicInfo = step === 'Basic Info';
                        const isEducation = step === 'Education';
                        const isProfessional = step === 'Professional';
                        const shouldShowActiveStyle = isActive || isStepCompleted(step);
                        return (
                          <li
                            key={step}
                            className={`${styles.profileStep} ${shouldShowActiveStyle ? styles.profileStepActive : ''} ${isActive ? styles.profileStepCurrent : ''} ${isBasicInfo && isActive ? styles.profileStepWithDots : ''} ${isEducation && isActive ? styles.profileStepWithDots : ''} ${isProfessional && isActive ? styles.profileStepWithDots : ''}`}
                          >
                            <button
                              ref={(el) => { 
                                stepButtonRefs.current[idx] = el;
                              }}
                              type="button"
                              className={styles.profileStepButton}
                              disabled={!isActive && !isStepCompleted(step)}
                              onClick={() => {
                                if (isActive || isStepCompleted(step)) {
                                  setActiveProfileStep(step);
                                  if (step === 'Basic Info') {
                                    setActiveBasicInfoSubPanel(1);
                                    setFocusedElement('dot');
                                  } else if (step === 'Education') {
                                    if (colleges.length > 0) {
                                      setActiveCollegeSubPanel(1);
                                      setFocusedElement('dot');
                                    } else {
                                      setFocusedElement('step');
                                    }
                                  } else if (step === 'Professional') {
                                    setActiveProfessionalSubPanel(1);
                                    setFocusedElement('dot');
                                  } else {
                                    setFocusedElement('step');
                                  }
                                }
                              }}
                              onFocus={() => {
                                if (isActive || isStepCompleted(step)) {
                                  setFocusedElement('step');
                                }
                              }}
                              tabIndex={(isActive || isStepCompleted(step)) ? (isActive ? 0 : -1) : -1}
                            >
                              <span className={styles.profileStepIndex}>{idx + 1}</span>
                              <span className={styles.profileStepLabel}>{step}</span>
                            </button>
                            {isBasicInfo && isActive && (
                              <div className={styles.subPanelDots}>
                                {[1, 2, 3].map((dotNum) => {
                                  // Determine if dot is accessible based on whether previous panel's content is filled
                                  // Dot 1: Always accessible (first panel)
                                  // Dot 2: Accessible if sub-panel 1 content (firstName AND lastName) is filled
                                  // Dot 3: Accessible if sub-panel 2 content (email) is filled AND sub-panel 1 is filled
                                  const isSubPanel1Filled = firstName.trim() !== '' && lastName.trim() !== '';
                                  const isSubPanel2Filled = email.trim() !== '';
                                  
                                  let isAccessible = false;
                                  if (dotNum === 1) {
                                    isAccessible = true; // First panel is always accessible
                                  } else if (dotNum === 2) {
                                    isAccessible = isSubPanel1Filled; // Accessible when name fields are filled
                                  } else if (dotNum === 3) {
                                    isAccessible = isSubPanel1Filled && isSubPanel2Filled; // Accessible when both previous panels are filled
                                  }
                                  
                                  const isLocked = !isAccessible;
                                  return (
                                    <button
                                      key={dotNum}
                                      ref={(el) => { dotButtonRefs.current[dotNum - 1] = el; }}
                                      type="button"
                                      className={`${styles.subPanelDot} ${activeBasicInfoSubPanel === dotNum ? styles.subPanelDotActive : ''} ${isLocked ? styles.subPanelDotLocked : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Only allow navigation to sub-panels when their content is filled
                                        if (!isLocked) {
                                          setActiveBasicInfoSubPanel(dotNum);
                                          setFocusedElement('dot');
                                        }
                                      }}
                                      onFocus={() => {
                                        if (!isLocked) {
                                          setFocusedElement('dot');
                                        }
                                      }}
                                      disabled={isLocked}
                                      tabIndex={isLocked ? -1 : (activeBasicInfoSubPanel === dotNum ? 0 : -1)}
                                      aria-label={`Sub-panel ${dotNum}${isLocked ? ' (locked)' : ''}`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                            {isEducation && isActive && colleges.length > 1 && (
                              <div className={styles.subPanelDots} style={{ cursor: draggedDotIndex !== null ? 'grabbing' : 'default' }}>
                                {colleges.map((college, collegeIdx) => (
                                  <button
                                    key={college.id}
                                    ref={(el) => { educationCollegeDotRefs.current[collegeIdx] = el; }}
                                    type="button"
                                    draggable={colleges.length > 1}
                                    className={`${styles.subPanelDot} ${activeCollegeSubPanel === collegeIdx + 1 ? styles.subPanelDotActive : ''} ${draggedDotIndex === collegeIdx ? styles.subPanelDotDragging : ''} ${draggedOverDotIndex === collegeIdx ? styles.subPanelDotDragOver : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCollegeSubPanel(collegeIdx + 1);
                                      setFocusedElement('dot');
                                    }}
                                    onDragStart={(e) => {
                                      setDraggedDotIndex(collegeIdx);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', collegeIdx.toString());
                                      // Create a custom drag image (transparent)
                                      const dragImage = document.createElement('div');
                                      dragImage.style.position = 'absolute';
                                      dragImage.style.top = '-1000px';
                                      dragImage.style.width = '18px';
                                      dragImage.style.height = '18px';
                                      document.body.appendChild(dragImage);
                                      e.dataTransfer.setDragImage(dragImage, 9, 9);
                                      setTimeout(() => document.body.removeChild(dragImage), 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (draggedDotIndex !== null && draggedDotIndex !== collegeIdx) {
                                        setDraggedOverDotIndex(collegeIdx);
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDraggedOverDotIndex(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const draggedIndex = draggedDotIndex;
                                      const dropIndex = collegeIdx;
                                      
                                      if (draggedIndex !== null && draggedIndex !== dropIndex) {
                                        const newColleges = [...colleges];
                                        const [draggedCollege] = newColleges.splice(draggedIndex, 1);
                                        newColleges.splice(dropIndex, 0, draggedCollege);
                                        
                                        setColleges(newColleges);
                                        
                                        // Update active sub-panel if needed
                                        if (activeCollegeSubPanel === draggedIndex + 1) {
                                          setActiveCollegeSubPanel(dropIndex + 1);
                                        } else if (activeCollegeSubPanel === dropIndex + 1) {
                                          setActiveCollegeSubPanel(draggedIndex + 1);
                                        } else if (draggedIndex < activeCollegeSubPanel - 1 && dropIndex >= activeCollegeSubPanel - 1) {
                                          setActiveCollegeSubPanel(activeCollegeSubPanel - 1);
                                        } else if (draggedIndex > activeCollegeSubPanel - 1 && dropIndex < activeCollegeSubPanel - 1) {
                                          setActiveCollegeSubPanel(activeCollegeSubPanel + 1);
                                        }
                                      }
                                      
                                      setDraggedDotIndex(null);
                                      setDraggedOverDotIndex(null);
                                    }}
                                    onDragEnd={(e) => {
                                      setDraggedDotIndex(null);
                                      setDraggedOverDotIndex(null);
                                    }}
                                    onFocus={() => {
                                      setFocusedElement('dot');
                                    }}
                                    tabIndex={activeCollegeSubPanel === collegeIdx + 1 ? 0 : -1}
                                    aria-label={`College ${collegeIdx + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                            {isProfessional && isActive && (
                              <div className={styles.subPanelDots}>
                                {[1, 2].map((dotNum) => (
                                  <button
                                    key={dotNum}
                                    ref={(el) => { professionalDotRefs.current[dotNum - 1] = el; }}
                                    type="button"
                                    className={`${styles.subPanelDot} ${activeProfessionalSubPanel === dotNum ? styles.subPanelDotActive : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveProfessionalSubPanel(dotNum);
                                      setFocusedElement('dot');
                                    }}
                                    onFocus={() => {
                                      setFocusedElement('dot');
                                    }}
                                    tabIndex={activeProfessionalSubPanel === dotNum ? 0 : -1}
                                    aria-label={`Sub-panel ${dotNum}`}
                                  />
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className={styles.profilePanel}>
                    {activeProfileStep === 'Career Focus' && (
                      <div className={styles.profilePanelSection}>
                        {showSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        <div className={styles.formField}>
                          <label htmlFor="career-focus" className={styles.formLabel}>
                            Career Focus <span className={styles.requiredIndicator}>*</span>
                          </label>
                          <div className={styles.customDropdown} ref={dropdownRef}>
                            <button
                              ref={dropdownTriggerRef}
                              type="button"
                              className={styles.customDropdownTrigger}
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              onFocus={() => setFocusedElement('field')}
                              aria-expanded={isDropdownOpen}
                              aria-haspopup="listbox"
                              tabIndex={focusedElement === 'field' ? 0 : -1}
                            >
                              <span className={styles.dropdownValue}>
                                {careerFocus 
                                  ? careerOptions.find(opt => opt.value === careerFocus)?.label 
                                  : 'Select a career focus'}
                              </span>
                              <svg 
                                className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                width="22" 
                                height="22" 
                                viewBox="0 0 24 24" 
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  d="M7 10L12 15L17 10" 
                                  stroke="currentColor" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  fill="none"
                                />
                              </svg>
                            </button>
                            {isDropdownOpen && (
                              <div className={styles.customDropdownMenu}>
                                {careerOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    className={`${styles.dropdownOption} ${careerFocus === option.value ? styles.dropdownOptionSelected : ''} ${option.disabled ? styles.dropdownOptionDisabled : ''}`}
                                    onClick={() => {
                                      if (!option.disabled) {
                                        markProfileDirty();
                                        setCareerFocus(option.value);
                                        setIsDropdownOpen(false);
                                      }
                                    }}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={styles.buttonRowContainer} style={{ justifyContent: 'center', gap: '30rem' }}>
                          <button
                            type="button"
                            className={styles.nextButton}
                            onClick={() => {
                              setShowProfileIntro(true);
                            }}
                            aria-label="Back to Profile"
                          >
                            <svg 
                              className={styles.nextButtonIcon}
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ transform: 'rotate(180deg)' }}
                            >
                              <path 
                                d="M9 18L15 12L9 6" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className={styles.nextButtonText}>Back</span>
                          </button>
                          <button
                            type="button"
                            className={styles.nextButton}
                            disabled={!careerFocus}
                            onClick={async () => {
                              // Save profile if dirty before navigating
                              if (profileFormState === 'profile_dirty') {
                                await handleProfileSubmit();
                              }
                              setActiveProfileStep('Basic Info');
                            }}
                            aria-label="Next to Basic Info"
                          >
                            <span className={styles.nextButtonText}>Next</span>
                            <svg 
                              className={styles.nextButtonIcon}
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M9 18L15 12L9 6" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {activeProfileStep === 'Basic Info' && (
                      <div className={styles.profilePanelSection}>
                        {showSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {/* Sub-panel 1: Name fields */}
                        {activeBasicInfoSubPanel === 1 && (
                          <div className={styles.basicInfoSubPanel}>
                            <div className={styles.formRow}>
                              <div className={`${styles.formField} ${styles.formFieldName}`}>
                                <label htmlFor="first-name" className={styles.formLabel}>
                                  First Name <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <input
                                  key="first-name"
                                  ref={(el) => { subPanel1FieldRefs.current[0] = el; }}
                                  type="text"
                                  id="first-name"
                                  className={styles.formInput}
                                  value={firstName}
                                  onChange={(e) => {
                                    markProfileDirty();
                                    setFirstName(e.target.value);
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 1)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="First name"
                                  autoComplete="off"
                                />
                              </div>
                              <div className={`${styles.formField} ${styles.formFieldNameMiddle}`}>
                                <label htmlFor="middle-name" className={styles.formLabel}>
                                  Middle Name
                                </label>
                                <input
                                  key="middle-name"
                                  ref={(el) => { subPanel1FieldRefs.current[1] = el; }}
                                  type="text"
                                  id="middle-name"
                                  className={styles.formInput}
                                  value={middleName}
                                  onChange={(e) => {
                                    markProfileDirty();
                                    setMiddleName(e.target.value);
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 1)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="Middle name"
                                  autoComplete="off"
                                />
                              </div>
                              <div className={`${styles.formField} ${styles.formFieldName}`}>
                                <label htmlFor="last-name" className={styles.formLabel}>
                                  Last Name <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <input
                                  key="last-name"
                                  ref={(el) => { subPanel1FieldRefs.current[2] = el; }}
                                  type="text"
                                  id="last-name"
                                  className={styles.formInput}
                                  value={lastName}
                                  onChange={(e) => {
                                    markProfileDirty();
                                    setLastName(e.target.value);
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 1)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="Last name"
                                  autoComplete="off"
                                />
                              </div>
                            </div>
                            <div className={styles.buttonRowContainer}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save profile if dirty before navigating
                                  if (profileFormState === 'profile_dirty') {
                                    await handleProfileSubmit();
                                  }
                                  setActiveProfileStep('Career Focus');
                                }}
                                aria-label="Back to Career Focus"
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                disabled={!firstName.trim() || !lastName.trim()}
                                onClick={() => {
                                  setActiveBasicInfoSubPanel(2);
                                  setMaxReachedBasicInfoSubPanel(2);
                                }}
                                aria-label="Next to Contact Information"
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Sub-panel 2: Contact fields */}
                        {activeBasicInfoSubPanel === 2 && (
                          <div className={styles.basicInfoSubPanel}>
                            <div className={styles.formRow}>
                              <div className={styles.formField}>
                                <label htmlFor="email" className={styles.formLabel}>
                                  Email Address <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <input
                                  ref={(el) => { subPanel2FieldRefs.current[0] = el; }}
                                  type="email"
                                  id="email"
                                  className={`${styles.formInput} ${emailError ? styles.formInputError : ''}`}
                                  value={email}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    markProfileDirty();
                                    setEmail(value);
                                    if (value.trim() !== '' && !validateEmail(value)) {
                                      setEmailError('Please enter a valid email address');
                                    } else {
                                      setEmailError('');
                                    }
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 2)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="example@email.com"
                                />
                                {emailError && <span className={styles.formError}>{emailError}</span>}
                              </div>
                              <div className={styles.formField}>
                                <label htmlFor="phone" className={styles.formLabel}>
                                  Phone Number <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <input
                                  ref={(el) => { subPanel2FieldRefs.current[1] = el; }}
                                  type="tel"
                                  id="phone"
                                  className={`${styles.formInput} ${phoneError ? styles.formInputError : ''}`}
                                  value={phone}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    markProfileDirty();
                                    setPhone(value);
                                    if (value.trim() !== '' && !validatePhone(value)) {
                                      setPhoneError('Please enter a valid phone number (at least 10 digits)');
                                    } else {
                                      setPhoneError('');
                                    }
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 2)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="(123) 456-7890"
                                />
                                {phoneError && <span className={styles.formError}>{phoneError}</span>}
                              </div>
                            </div>
                            <div className={styles.formRow}>
                              <div className={`${styles.formField} ${styles.formFieldWide}`}>
                                <label htmlFor="address-street" className={styles.formLabel}>
                                  Home Address <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <input
                                  ref={(el) => { subPanel2FieldRefs.current[2] = el; }}
                                  type="text"
                                  id="address-street"
                                  className={styles.formInput}
                                  value={addressStreet}
                                  onChange={(e) => {
                                    markProfileDirty();
                                    setAddressStreet(e.target.value);
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 2)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="Street address"
                                  list="address-suggestions"
                                />
                              </div>
                              <div className={`${styles.formField} ${styles.formFieldState}`}>
                                <label htmlFor="address-state" className={styles.formLabel}>
                                  State <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <div className={styles.customDropdown} ref={stateDropdownRef}>
                                  <button
                                    ref={(el) => { subPanel2FieldRefs.current[3] = el; }}
                                    type="button"
                                    className={styles.customDropdownTrigger}
                                    onClick={() => {
                                      setIsStateDropdownOpen(!isStateDropdownOpen);
                                      if (!isStateDropdownOpen) {
                                        // If a state is already selected, highlight it; otherwise start at -1
                                        const currentIndex = addressState ? usStates.indexOf(addressState) : -1;
                                        setHighlightedStateIndex(currentIndex);
                                      } else {
                                        // When closing, reset highlight
                                        setHighlightedStateIndex(-1);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      // Handle Down arrow when dropdown is closed to open it
                                      if (!isStateDropdownOpen && e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setIsStateDropdownOpen(true);
                                        setHighlightedStateIndex(0);
                                        setTimeout(() => {
                                          stateDropdownOptionRefs.current[0]?.focus();
                                        }, 0);
                                      }
                                    }}
                                    onFocus={() => setFocusedElement('field')}
                                    aria-expanded={isStateDropdownOpen}
                                    aria-haspopup="listbox"
                                  >
                                    <span className={styles.dropdownValue}>
                                      {addressState || ''}
                                    </span>
                                    <svg 
                                      className={`${styles.dropdownArrow} ${isStateDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                      width="22" 
                                      height="22" 
                                      viewBox="0 0 24 24" 
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path 
                                        d="M7 10L12 15L17 10" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        fill="none"
                                      />
                                    </svg>
                                  </button>
                                  {isStateDropdownOpen && (
                                    <div className={styles.customDropdownMenu}>
                                      {usStates.map((state, index) => (
                                        <button
                                          key={state}
                                          ref={(el) => { stateDropdownOptionRefs.current[index] = el; }}
                                          type="button"
                                          className={`${styles.dropdownOption} ${addressState === state ? styles.dropdownOptionSelected : ''} ${highlightedStateIndex === index ? styles.dropdownOptionHighlighted : ''}`}
                                          onClick={() => {
                                            markProfileDirty();
                                            setAddressState(state);
                                            setIsStateDropdownOpen(false);
                                            setHighlightedStateIndex(-1);
                                          }}
                                        >
                                          {state}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className={`${styles.formField} ${styles.formFieldNarrow}`}>
                                <label htmlFor="address-zip" className={styles.formLabel}>
                                  Zip Code <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <input
                                  ref={(el) => { subPanel2FieldRefs.current[4] = el; }}
                                  type="text"
                                  id="address-zip"
                                  className={styles.formInput}
                                  value={addressZip}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 5) {
                                      markProfileDirty();
                                      setAddressZip(value);
                                    }
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 2)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="12345"
                                  maxLength={5}
                                />
                              </div>
                            </div>
                            <div className={styles.buttonRowContainer}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={() => setActiveBasicInfoSubPanel(1)}
                                aria-label="Back to Name Information"
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                disabled={
                                  !email.trim() || 
                                  !phone.trim() || 
                                  !addressStreet.trim() || 
                                  !addressState || 
                                  !addressZip.trim() ||
                                  emailError !== '' || 
                                  phoneError !== ''
                                }
                                onClick={() => {
                                  setActiveBasicInfoSubPanel(3);
                                  setMaxReachedBasicInfoSubPanel(3);
                                }}
                                aria-label="Next to Links"
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Sub-panel 3: Links */}
                        {activeBasicInfoSubPanel === 3 && (
                          <div className={styles.basicInfoSubPanel}>
                            <div className={styles.formRow}>
                              <div className={styles.formField}>
                                <label htmlFor="personal-website" className={styles.formLabel}>
                                  Personal Website
                                </label>
                                <input
                                  ref={(el) => { subPanel3FieldRefs.current[0] = el; }}
                                  type="url"
                                  id="personal-website"
                                  className={styles.formInput}
                                  value={personalWebsite}
                                  onChange={(e) => {
                                    markProfileDirty();
                                    setPersonalWebsite(e.target.value);
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 3)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="https://yourwebsite.com"
                                />
                              </div>
                              <div className={styles.formField}>
                                <label htmlFor="linkedin" className={styles.formLabel}>
                                  LinkedIn
                                </label>
                                <input
                                  ref={(el) => { subPanel3FieldRefs.current[1] = el; }}
                                  type="url"
                                  id="linkedin"
                                  className={styles.formInput}
                                  value={linkedin}
                                  onChange={(e) => {
                                    markProfileDirty();
                                    setLinkedin(e.target.value);
                                  }}
                                  onKeyDown={(e) => handleEnterKey(e, 3)}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="https://linkedin.com/in/yourprofile"
                                />
                              </div>
                            </div>
                            {links.map((link, linkIndex) => (
                              <div key={link.id} className={styles.formRow}>
                                <div className={styles.formField} style={{ flex: '0 0 35%' }}>
                                  <label htmlFor={`link-name-${link.id}`} className={styles.formLabel}>
                                    Link Name
                                  </label>
                                  <input
                                    ref={(el) => { 
                                      const baseIndex = 2; // After personal-website (0) and linkedin (1)
                                      subPanel3FieldRefs.current[baseIndex + linkIndex * 2] = el; 
                                    }}
                                    type="text"
                                    id={`link-name-${link.id}`}
                                    className={styles.formInput}
                                    value={link.linkName}
                                    onChange={(e) => {
                                      markProfileDirty();
                                      setLinks(links.map(l => 
                                        l.id === link.id ? { ...l, linkName: e.target.value } : l
                                      ));
                                    }}
                                    onKeyDown={(e) => handleEnterKey(e, 3)}
                                    onFocus={() => setFocusedElement('field')}
                                    placeholder="Link name"
                                  />
                                </div>
                                <div className={styles.formField} style={{ flex: '1' }}>
                                  <label htmlFor={`link-url-${link.id}`} className={styles.formLabel}>
                                    URL
                                  </label>
                                  <input
                                    ref={(el) => { 
                                      const baseIndex = 2; // After personal-website (0) and linkedin (1)
                                      subPanel3FieldRefs.current[baseIndex + linkIndex * 2 + 1] = el; 
                                    }}
                                    type="url"
                                    id={`link-url-${link.id}`}
                                    className={styles.formInput}
                                    value={link.url}
                                    onChange={(e) => {
                                      markProfileDirty();
                                      setLinks(links.map(l => 
                                        l.id === link.id ? { ...l, url: e.target.value } : l
                                      ));
                                    }}
                                    onKeyDown={(e) => handleEnterKey(e, 3)}
                                    onFocus={() => setFocusedElement('field')}
                                    placeholder="https://example.com"
                                  />
                                </div>
                                <div className={styles.collegeSectionHeader} style={{ marginBottom: '-0.5rem', marginLeft: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className={styles.deleteCollegeButton}
                                    data-tooltip="Delete"
                                    onClick={() => {
                                      markProfileDirty();
                                      setLinks(links.filter(l => l.id !== link.id));
                                    }}
                                    aria-label="Delete Link"
                                  >
                                    <svg 
                                      className={styles.deleteButtonIcon}
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
                                </div>
                              </div>
                            ))}
                            <div className={styles.formRow}>
                              <button
                                type="button"
                                className={styles.addCollegeButton}
                                disabled={links.length > 0 && links.some(link => link.linkName.trim() === '' || link.url.trim() === '')}
                                onClick={() => {
                                  markProfileDirty();
                                  const newLink: Link = {
                                    id: `link-${Date.now()}-${Math.random()}`,
                                    linkName: '',
                                    url: ''
                                  };
                                  setLinks([...links, newLink]);
                                }}
                                aria-label="Add Link"
                              >
                                <span className={styles.addButtonIcon}>+</span>
                                <span className={styles.addButtonText}>Add Link</span>
                              </button>
                            </div>
                            <div className={styles.buttonRowContainer}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={() => setActiveBasicInfoSubPanel(2)}
                                aria-label="Back to Contact Information"
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save profile if dirty before navigating
                                  if (profileFormState === 'profile_dirty') {
                                    await handleProfileSubmit();
                                  }
                                  setActiveProfileStep('Education');
                                }}
                                aria-label="Next to Education"
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {activeProfileStep === 'Education' && (
                      <div className={styles.profilePanelSection}>
                        {showSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        <div className={styles.educationContainer}>
                          {colleges.map((college, collegeIndex) => {
                            if (collegeIndex + 1 !== activeCollegeSubPanel) return null;
                            
                            return (
                              <div key={college.id} className={styles.collegeSection}>
                                {colleges.length > 1 && (
                                  <div className={styles.collegeSectionHeader}>
                                    <button
                                      type="button"
                                      className={styles.deleteCollegeButton}
                                      data-tooltip="Delete"
                                      onClick={() => {
                                      const collegeIndex = colleges.findIndex(c => c.id === college.id);
                                      const newColleges = colleges.filter(c => c.id !== college.id);
                                      
                                      // Adjust active sub-panel before deleting
                                      if (newColleges.length === 0) {
                                        // Will be handled by useEffect that creates initial college
                                        setActiveCollegeSubPanel(1);
                                      } else if (collegeIndex < activeCollegeSubPanel - 1) {
                                        // Deleted college was before active one, no change needed to active index
                                        // But we need to adjust the index since array shifted
                                        setActiveCollegeSubPanel(activeCollegeSubPanel - 1);
                                      } else if (collegeIndex === activeCollegeSubPanel - 1) {
                                        // Deleted college was the active one, switch to previous or first
                                        setActiveCollegeSubPanel(Math.max(1, activeCollegeSubPanel - 1));
                                      } else if (activeCollegeSubPanel > newColleges.length) {
                                        // Active index exceeds array length, set to last college
                                        setActiveCollegeSubPanel(newColleges.length);
                                      }
                                      
                                      markProfileDirty();
                                      setColleges(newColleges);
                                    }}
                                    aria-label="Delete College"
                                  >
                                    <svg 
                                      className={styles.deleteButtonIcon}
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
                                  </div>
                                )}
                                <div className={styles.collegeFields}>
                                  {college.degrees.map((degree, degreeIndex) => (
                                    <div key={degree.id} className={styles.degreeSection}>
                                      <div className={styles.degreeFields}>
                                        {degreeIndex === 0 && (
                                          <div className={styles.formRow}>
                                            <div className={styles.formField}>
                                              <label htmlFor={`college-name-${college.id}`} className={styles.formLabel}>
                                                College Name <span className={styles.requiredIndicator}>*</span>
                                              </label>
                                              <input
                                                type="text"
                                                id={`college-name-${college.id}`}
                                                className={styles.formInput}
                                                value={college.collegeName}
                                                onChange={(e) => {
                                                  markProfileDirty();
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? { ...c, collegeName: e.target.value } : c
                                                  ));
                                                }}
                                                onFocus={() => setFocusedElement('field')}
                                                placeholder="College or University name"
                                              />
                                            </div>
                                            <div className={styles.formField}>
                                              <label htmlFor={`degree-${degree.id}`} className={styles.formLabel}>
                                                Degree <span className={styles.requiredIndicator}>*</span>
                                              </label>
                                              <input
                                                type="text"
                                                id={`degree-${degree.id}`}
                                                className={styles.formInput}
                                                value={degree.degree}
                                                onChange={(e) => {
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? {
                                                      ...c,
                                                      degrees: c.degrees.map(d =>
                                                        d.id === degree.id ? { ...d, degree: e.target.value } : d
                                                      )
                                                    } : c
                                                  ));
                                                }}
                                                onFocus={() => setFocusedElement('field')}
                                                placeholder="e.g., Bachelor's, Master's, PhD"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {degreeIndex > 0 && (
                                          <div className={styles.formRow}>
                                            <div className={styles.formField}>
                                              <label htmlFor={`degree-${degree.id}`} className={styles.formLabel}>
                                                Degree <span className={styles.requiredIndicator}>*</span>
                                              </label>
                                              <input
                                                type="text"
                                                id={`degree-${degree.id}`}
                                                className={styles.formInput}
                                                value={degree.degree}
                                                onChange={(e) => {
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? {
                                                      ...c,
                                                      degrees: c.degrees.map(d =>
                                                        d.id === degree.id ? { ...d, degree: e.target.value } : d
                                                      )
                                                    } : c
                                                  ));
                                                }}
                                                onFocus={() => setFocusedElement('field')}
                                                placeholder="e.g., Bachelor's, Master's, PhD"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className={styles.formRow}>
                                          <div className={styles.formField}>
                                            <label htmlFor={`major-${degree.id}`} className={styles.formLabel}>
                                              Major <span className={styles.requiredIndicator}>*</span>
                                            </label>
                                            <input
                                              type="text"
                                              id={`major-${degree.id}`}
                                              className={styles.formInput}
                                              value={degree.major}
                                              onChange={(e) => {
                                                markProfileDirty();
                                                setColleges(colleges.map(c => 
                                                  c.id === college.id ? {
                                                    ...c,
                                                    degrees: c.degrees.map(d =>
                                                      d.id === degree.id ? { ...d, major: e.target.value } : d
                                                    )
                                                  } : c
                                                ));
                                              }}
                                              onFocus={() => setFocusedElement('field')}
                                              placeholder="Field of study"
                                            />
                                          </div>
                                          <div className={styles.formField}>
                                            <label htmlFor={`coursework-${degree.id}`} className={styles.formLabel}>
                                              Coursework
                                            </label>
                                            <input
                                              type="text"
                                              id={`coursework-${degree.id}`}
                                              className={styles.formInput}
                                              value={degree.coursework}
                                              onChange={(e) => {
                                                markProfileDirty();
                                                setColleges(colleges.map(c => 
                                                  c.id === college.id ? {
                                                    ...c,
                                                    degrees: c.degrees.map(d =>
                                                      d.id === degree.id ? { ...d, coursework: e.target.value } : d
                                                    )
                                                  } : c
                                                ));
                                              }}
                                              onFocus={() => setFocusedElement('field')}
                                              placeholder="Relevant coursework or courses"
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className={styles.formRow}>
                                          <div className={styles.formField}>
                                            <label className={styles.formLabel}>Start Date <span className={styles.requiredIndicator}>*</span></label>
                                            <div className={styles.dateRow}>
                                              <DateDropdown
                                                value={degree.startMonth}
                                                options={months}
                                                placeholder="Month"
                                                onSelect={(value) => {
                                                  markProfileDirty();
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? {
                                                      ...c,
                                                      degrees: c.degrees.map(d =>
                                                        d.id === degree.id ? { ...d, startMonth: value } : d
                                                      )
                                                    } : c
                                                  ));
                                                }}
                                                degreeId={degree.id}
                                                fieldType="startMonth"
                                                onFocus={() => setFocusedElement('field')}
                                              />
                                              <DateDropdown
                                                value={degree.startYear}
                                                options={years.map(y => y.toString())}
                                                placeholder="Year"
                                                onSelect={(value) => {
                                                  markProfileDirty();
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? {
                                                      ...c,
                                                      degrees: c.degrees.map(d =>
                                                        d.id === degree.id ? { ...d, startYear: value } : d
                                                      )
                                                    } : c
                                                  ));
                                                }}
                                                degreeId={degree.id}
                                                fieldType="startYear"
                                                onFocus={() => setFocusedElement('field')}
                                              />
                                            </div>
                                          </div>
                                          <div className={styles.formField}>
                                            <label className={styles.formLabel}>End Date</label>
                                            <div className={styles.dateRow}>
                                              <DateDropdown
                                                value={degree.endMonth}
                                                options={months}
                                                placeholder="Month"
                                                onSelect={(value) => {
                                                  markProfileDirty();
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? {
                                                      ...c,
                                                      degrees: c.degrees.map(d =>
                                                        d.id === degree.id ? { ...d, endMonth: value } : d
                                                      )
                                                    } : c
                                                  ));
                                                }}
                                                degreeId={degree.id}
                                                fieldType="endMonth"
                                                onFocus={() => setFocusedElement('field')}
                                              />
                                              <DateDropdown
                                                value={degree.endYear}
                                                options={years.map(y => y.toString())}
                                                placeholder="Year"
                                                onSelect={(value) => {
                                                  markProfileDirty();
                                                  setColleges(colleges.map(c => 
                                                    c.id === college.id ? {
                                                      ...c,
                                                      degrees: c.degrees.map(d =>
                                                        d.id === degree.id ? { ...d, endYear: value } : d
                                                      )
                                                    } : c
                                                  ));
                                                }}
                                                degreeId={degree.id}
                                                fieldType="endYear"
                                                onFocus={() => setFocusedElement('field')}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className={`${styles.formRow} ${styles.formRowLeft}`}>
                                          <div className={styles.formField}>
                                            <label htmlFor={`college-location-${college.id}`} className={styles.formLabel}>
                                              Location <span className={styles.requiredIndicator}>*</span>
                                            </label>
                                            <input
                                              type="text"
                                              id={`college-location-${college.id}`}
                                              className={styles.formInput}
                                              value={college.location || ''}
                                              onChange={(e) => {
                                                markProfileDirty();
                                                setColleges(colleges.map(c => 
                                                  c.id === college.id ? { ...c, location: e.target.value } : c
                                                ));
                                              }}
                                              onFocus={() => setFocusedElement('field')}
                                              placeholder="The city for this college experience"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {(() => {
                                  // Check if all required fields are filled (except coursework and end date)
                                  const isAllFieldsFilled = 
                                    college.collegeName.trim() !== '' &&
                                    college.location.trim() !== '' &&
                                    college.degrees.length > 0 &&
                                    college.degrees.every(degree => 
                                      degree.degree.trim() !== '' &&
                                      degree.major.trim() !== '' &&
                                      degree.startMonth !== '' &&
                                      degree.startYear !== ''
                                    );
                                  
                                  const isLastCollege = collegeIndex === colleges.length - 1;
                                  
                                  return (
                                    <>
                                      {isLastCollege && (
                                        <div className={styles.formRow}>
                                          <button
                                            type="button"
                                            className={styles.addCollegeButton}
                                            disabled={!isAllFieldsFilled}
                                            onClick={() => {
                                              markProfileDirty();
                                              const newCollege: College = {
                                                id: `college-${Date.now()}-${Math.random()}`,
                                                collegeName: '',
                                                location: '',
                                                degrees: [{
                                                  id: `degree-${Date.now()}-${Math.random()}`,
                                                  degree: '',
                                                  major: '',
                                                  startMonth: '',
                                                  startYear: '',
                                                  endMonth: '',
                                                  endYear: '',
                                                  coursework: ''
                                                }]
                                              };
                                              setColleges([...colleges, newCollege]);
                                              setActiveCollegeSubPanel(colleges.length + 1);
                                            }}
                                            aria-label="Add College"
                                          >
                                            <span className={styles.addButtonIcon}>+</span>
                                            <span className={styles.addButtonText}>Add College</span>
                                          </button>
                                        </div>
                                      )}
                                      <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                                        <button
                                          type="button"
                                          className={styles.nextButton}
                                          onClick={async () => {
                                            // Save profile if dirty before navigating
                                            if (profileFormState === 'profile_dirty') {
                                              await handleProfileSubmit();
                                            }
                                            if (collegeIndex === 0) {
                                              setActiveProfileStep('Basic Info');
                                              setActiveBasicInfoSubPanel(3);
                                            } else {
                                              setActiveCollegeSubPanel(collegeIndex);
                                            }
                                          }}
                                          aria-label={collegeIndex === 0 ? "Back to Basic Info" : "Back to Previous College"}
                                        >
                                          <svg 
                                            className={styles.nextButtonIcon}
                                            width="18" 
                                            height="18" 
                                            viewBox="0 0 24 24" 
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ transform: 'rotate(180deg)' }}
                                          >
                                            <path 
                                              d="M5 12H19M19 12L12 5M19 12L12 19" 
                                              stroke="currentColor" 
                                              strokeWidth="2.5" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                          <span className={styles.nextButtonText}>Back</span>
                                        </button>
                                        <button
                                          type="button"
                                          className={styles.nextButton}
                                          disabled={!isAllFieldsFilled}
                                          onClick={async () => {
                                            // Save profile if dirty before navigating
                                            if (profileFormState === 'profile_dirty') {
                                              await handleProfileSubmit();
                                            }
                                            if (isLastCollege) {
                                              setActiveProfileStep('Professional');
                                            } else {
                                              setActiveCollegeSubPanel(collegeIndex + 2);
                                            }
                                          }}
                                          aria-label={isLastCollege ? "Next to Professional" : "Next to Next College"}
                                        >
                                          <span className={styles.nextButtonText}>Next</span>
                                          <svg 
                                            className={styles.nextButtonIcon}
                                            width="18" 
                                            height="18" 
                                            viewBox="0 0 24 24" 
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path 
                                              d="M5 12H19M19 12L12 5M19 12L12 19" 
                                              stroke="currentColor" 
                                              strokeWidth="2.5" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {activeProfileStep === 'Professional' && (
                      <div className={styles.profilePanelSection}>
                        {showSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {activeProfessionalSubPanel === 1 && (
                          <div className={styles.educationContainer}>
                            {professionalExperiences.map((experience, expIndex) => {
                              const isFieldsFilled = 
                                experience.companyName.trim() !== '' &&
                                experience.jobTitle.trim() !== '' &&
                                (experience.isPresent || (experience.endMonth !== '' && experience.endYear !== ''));
                              
                              return (
                                <>
                                  <div key={experience.id} className={styles.collegeSection}>
                                    {professionalExperiences.length > 1 && (
                                      <div className={styles.collegeSectionHeader}>
                                        <button
                                          type="button"
                                          className={styles.deleteCollegeButton}
                                          data-tooltip="Delete Company"
                                          onClick={() => {
                                            markProfileDirty();
                                            setProfessionalExperiences(professionalExperiences.filter(exp => exp.id !== experience.id));
                                          }}
                                          aria-label="Delete Company"
                                        >
                                          <svg 
                                            className={styles.deleteButtonIcon}
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
                                      </div>
                                    )}
                                    <div className={styles.collegeFields}>
                                      <div className={styles.degreeSection}>
                                        <div className={styles.degreeFields}>
                                          <div className={styles.formRow}>
                                            <div className={styles.formField}>
                                              <label htmlFor={`company-name-${experience.id}`} className={styles.formLabel}>
                                                Company Name
                                              </label>
                                              <input
                                                type="text"
                                                id={`company-name-${experience.id}`}
                                                className={styles.formInput}
                                                value={experience.companyName}
                                                onChange={(e) => {
                                                  markProfileDirty();
                                                  setProfessionalExperiences(professionalExperiences.map(exp => 
                                                    exp.id === experience.id ? { ...exp, companyName: e.target.value } : exp
                                                  ));
                                                }}
                                                onFocus={() => setFocusedElement('field')}
                                                placeholder="Company name"
                                              />
                                            </div>
                                            <div className={styles.formField}>
                                              <label htmlFor={`job-title-${experience.id}`} className={styles.formLabel}>
                                                Job Title
                                              </label>
                                              <input
                                                type="text"
                                                id={`job-title-${experience.id}`}
                                                className={styles.formInput}
                                                value={experience.jobTitle}
                                                onChange={(e) => {
                                                  markProfileDirty();
                                                  setProfessionalExperiences(professionalExperiences.map(exp => 
                                                    exp.id === experience.id ? { ...exp, jobTitle: e.target.value } : exp
                                                  ));
                                                }}
                                                onFocus={() => setFocusedElement('field')}
                                                placeholder="Job title"
                                              />
                                            </div>
                                          </div>
                                          
                                          <div className={styles.formRow}>
                                            <div className={styles.formField}>
                                              <label className={styles.formLabel}>Start Date</label>
                                              <div className={styles.dateRow}>
                                                <DateDropdown
                                                  value={experience.startMonth}
                                                  options={months}
                                                  placeholder="Month"
                                                  onSelect={(value) => {
                                                    markProfileDirty();
                                                    setProfessionalExperiences(professionalExperiences.map(exp => 
                                                      exp.id === experience.id ? { ...exp, startMonth: value } : exp
                                                    ));
                                                  }}
                                                  degreeId={experience.id}
                                                  fieldType="startMonth"
                                                  onFocus={() => setFocusedElement('field')}
                                                />
                                                <DateDropdown
                                                  value={experience.startYear}
                                                  options={years.map(y => y.toString())}
                                                  placeholder="Year"
                                                  onSelect={(value) => {
                                                    markProfileDirty();
                                                    setProfessionalExperiences(professionalExperiences.map(exp => 
                                                      exp.id === experience.id ? { ...exp, startYear: value } : exp
                                                    ));
                                                  }}
                                                  degreeId={experience.id}
                                                  fieldType="startYear"
                                                  onFocus={() => setFocusedElement('field')}
                                                />
                                              </div>
                                            </div>
                                            <div className={styles.formField}>
                                              <label className={styles.formLabel}>End Date</label>
                                              <div className={styles.dateRow} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
                                                <DateDropdown
                                                  value={experience.endMonth}
                                                  options={months}
                                                  placeholder="Month"
                                                  onSelect={(value) => {
                                                    markProfileDirty();
                                                    setProfessionalExperiences(professionalExperiences.map(exp => 
                                                      exp.id === experience.id ? { ...exp, endMonth: value, isPresent: false } : exp
                                                    ));
                                                  }}
                                                  degreeId={experience.id}
                                                  fieldType="endMonth"
                                                  onFocus={() => setFocusedElement('field')}
                                                  disabled={experience.isPresent}
                                                />
                                                <DateDropdown
                                                  value={experience.endYear}
                                                  options={years.map(y => y.toString())}
                                                  placeholder="Year"
                                                  onSelect={(value) => {
                                                    markProfileDirty();
                                                    setProfessionalExperiences(professionalExperiences.map(exp => 
                                                      exp.id === experience.id ? { ...exp, endYear: value, isPresent: false } : exp
                                                    ));
                                                  }}
                                                  degreeId={experience.id}
                                                  fieldType="endYear"
                                                  onFocus={() => setFocusedElement('field')}
                                                  disabled={experience.isPresent}
                                                />
                                                <div className={styles.formField} style={{ alignSelf: 'flex-end', paddingTop: 0 }}>
                                                  <label className={styles.presentCheckboxLabel}>
                                                    <input
                                                      type="checkbox"
                                                      checked={experience.isPresent}
                                                      onChange={(e) => {
                                                        markProfileDirty();
                                                        if (e.target.checked) {
                                                          setProfessionalExperiences(professionalExperiences.map(exp => 
                                                            exp.id === experience.id ? { ...exp, endMonth: '', endYear: '', isPresent: true } : exp
                                                          ));
                                                        } else {
                                                          setProfessionalExperiences(professionalExperiences.map(exp => 
                                                            exp.id === experience.id ? { ...exp, isPresent: false } : exp
                                                          ));
                                                        }
                                                      }}
                                                      className={styles.presentCheckbox}
                                                    />
                                                    <span className={styles.presentCheckboxText}>Present</span>
                                                  </label>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className={`${styles.formRow} ${styles.formRowLeft}`}>
                                            <div className={styles.formField}>
                                              <label htmlFor={`company-location-${experience.id}`} className={styles.formLabel}>
                                                Location
                                              </label>
                                              <input
                                                type="text"
                                                id={`company-location-${experience.id}`}
                                                className={styles.formInput}
                                                value={experience.location || ''}
                                                onChange={(e) => {
                                                  markProfileDirty();
                                                  setProfessionalExperiences(professionalExperiences.map(exp => 
                                                    exp.id === experience.id ? { ...exp, location: e.target.value } : exp
                                                  ));
                                                }}
                                                onFocus={() => setFocusedElement('field')}
                                                placeholder="Input the city for this company experience"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {professionalExperiences.length > 1 && expIndex < professionalExperiences.length - 1 && (
                                    <div className={styles.companySeparator}></div>
                                  )}
                                  
                                  {expIndex === professionalExperiences.length - 1 && (
                                    <>
                                      <div className={styles.formRow}>
                                        <button
                                          type="button"
                                          className={styles.addCollegeButton}
                                          disabled={!isFieldsFilled}
                                          onClick={() => {
                                            markProfileDirty();
                                            const newExperience: ProfessionalExperience = {
                                              id: `experience-${Date.now()}-${Math.random()}`,
                                              companyName: '',
                                              jobTitle: '',
                                              startMonth: '',
                                              startYear: '',
                                              endMonth: '',
                                              endYear: '',
                                              isPresent: false,
                                              location: ''
                                            };
                                            setProfessionalExperiences([...professionalExperiences, newExperience]);
                                          }}
                                          aria-label="Add Company"
                                        >
                                          <span className={styles.addButtonIcon}>+</span>
                                          <span className={styles.addButtonText}>Add Company</span>
                                        </button>
                                      </div>
                                      <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                                        <button
                                          type="button"
                                          className={styles.nextButton}
                                          onClick={async () => {
                                            // Save profile if dirty before navigating
                                            if (profileFormState === 'profile_dirty') {
                                              await handleProfileSubmit();
                                            }
                                            const lastCollegeIndex = colleges.length;
                                            setActiveProfileStep('Education');
                                            setActiveCollegeSubPanel(lastCollegeIndex);
                                          }}
                                          aria-label="Back to Education"
                                        >
                                          <svg 
                                            className={styles.nextButtonIcon}
                                            width="18" 
                                            height="18" 
                                            viewBox="0 0 24 24" 
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ transform: 'rotate(180deg)' }}
                                          >
                                            <path 
                                              d="M5 12H19M19 12L12 5M19 12L12 19" 
                                              stroke="currentColor" 
                                              strokeWidth="2.5" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                          <span className={styles.nextButtonText}>Back</span>
                                        </button>
                                        <button
                                          type="button"
                                          className={styles.nextButton}
                                          onClick={() => {
                                            setActiveProfessionalSubPanel(2);
                                          }}
                                          aria-label="Next to Achievements"
                                        >
                                          <span className={styles.nextButtonText}>Next</span>
                                          <svg 
                                            className={styles.nextButtonIcon}
                                            width="18" 
                                            height="18" 
                                            viewBox="0 0 24 24" 
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path 
                                              d="M5 12H19M19 12L12 5M19 12L12 19" 
                                              stroke="currentColor" 
                                              strokeWidth="2.5" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        )}
                        
                        {activeProfessionalSubPanel === 2 && (
                          <div className={styles.educationContainer}>
                            <div className={styles.collegeSection}>
                              <div className={styles.collegeFields}>
                                <div className={styles.degreeSection}>
                                  <div className={styles.degreeFields}>
                                    {achievements.map((achievement) => (
                                      <div key={achievement.id} className={styles.formRow}>
                                        <div className={styles.formField} style={{ flex: '1' }}>
                                          <label htmlFor={`achievement-${achievement.id}`} className={styles.formLabel}>
                                            {achievement.type}
                                          </label>
                                          <input
                                            type="text"
                                            id={`achievement-${achievement.id}`}
                                            className={styles.formInput}
                                            value={achievement.value}
                                            onChange={(e) => {
                                              markProfileDirty();
                                              setAchievements(achievements.map(a =>
                                                a.id === achievement.id ? { ...a, value: e.target.value } : a
                                              ));
                                            }}
                                            onFocus={() => setFocusedElement('field')}
                                            placeholder={`Enter ${achievement.type.toLowerCase()}`}
                                          />
                                        </div>
                                        <div className={styles.collegeSectionHeader} style={{ marginBottom: '-0.5rem', marginLeft: '0.5rem' }}>
                                          <button
                                            type="button"
                                            className={styles.deleteCollegeButton}
                                            data-tooltip="Delete"
                                            onClick={() => {
                                              markProfileDirty();
                                              setAchievements(achievements.filter(a => a.id !== achievement.id));
                                            }}
                                            aria-label="Delete Achievement"
                                          >
                                            <svg 
                                              className={styles.deleteButtonIcon}
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
                                        </div>
                                      </div>
                                    ))}
                                    
                                    <div className={styles.formRow}>
                                      <div className={styles.formField} style={{ width: '100%' }}>
                                        <label htmlFor="add-achievement" className={styles.formLabel}>
                                          Add Achievement
                                        </label>
                                        <div className={styles.customDropdown} ref={achievementDropdownRef}>
                                          <button
                                            ref={achievementDropdownTriggerRef}
                                            type="button"
                                            className={styles.customDropdownTrigger}
                                            onClick={() => {
                                              setIsAchievementDropdownOpen(!isAchievementDropdownOpen);
                                            }}
                                            onFocus={() => setFocusedElement('field')}
                                            aria-expanded={isAchievementDropdownOpen}
                                            aria-haspopup="listbox"
                                          >
                                            <span className={styles.dropdownValue}>
                                              Add Achievement
                                            </span>
                                            <svg 
                                              className={`${styles.dropdownArrow} ${isAchievementDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                              width="22" 
                                              height="22" 
                                              viewBox="0 0 24 24" 
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path 
                                                d="M7 10L12 15L17 10" 
                                                stroke="currentColor" 
                                                strokeWidth="2.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                fill="none"
                                              />
                                            </svg>
                                          </button>
                                          {isAchievementDropdownOpen && (
                                            <div className={styles.customDropdownMenu}>
                                              {achievementOptions.map((option, index) => (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={styles.dropdownOption}
                                                  onClick={() => {
                                                    const newAchievement: Achievement = {
                                                      id: `achievement-${Date.now()}-${Math.random()}`,
                                                      type: option,
                                                      value: ''
                                                    };
                                                    markProfileDirty();
                                                    setAchievements([...achievements, newAchievement]);
                                                    setIsAchievementDropdownOpen(false);
                                                  }}
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={() => setActiveProfessionalSubPanel(1)}
                                aria-label="Back to Professional Experience"
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              {(() => {
                                // Validate all required fields across all profile panels
                                const isCareerFocusValid = careerFocus.trim() !== '';
                                
                                const isBasicInfoValid = 
                                  firstName.trim() !== '' &&
                                  lastName.trim() !== '' &&
                                  email.trim() !== '' &&
                                  phone.trim() !== '' &&
                                  addressStreet.trim() !== '' &&
                                  addressState !== '' &&
                                  addressZip.trim() !== '' &&
                                  emailError === '' &&
                                  phoneError === '';
                                
                                const isEducationValid = 
                                  colleges.length > 0 &&
                                  colleges.every(college => 
                                    college.collegeName.trim() !== '' &&
                                    college.degrees.length > 0 &&
                                    college.degrees.every(degree => 
                                      degree.degree.trim() !== '' &&
                                      degree.major.trim() !== '' &&
                                      degree.startMonth !== '' &&
                                      degree.startYear !== ''
                                    )
                                  );
                                
                                // Professional fields are all optional, so no validation needed
                                
                                const isAllFieldsValid = 
                                  isCareerFocusValid &&
                                  isBasicInfoValid &&
                                  isEducationValid;
                                
                                return (
                                  <button
                                    type="button"
                                    className={styles.nextButton}
                                    disabled={!isAllFieldsValid}
                                    onClick={async () => {
                                      // Save profile if dirty before navigating
                                      if (profileFormState === 'profile_dirty') {
                                        await handleProfileSubmit();
                                        if (profileAutoSaveTimerRef.current) {
                                          clearTimeout(profileAutoSaveTimerRef.current);
                                          profileAutoSaveTimerRef.current = null;
                                        }
                                      }
                                      // Navigate to knowledge tag page with both options
                                      setActiveSection('knowledge');
                                      setShowEstablishedExpertise(false);
                                      setShowExpandingKnowledgeBase(false);
                                    }}
                                    aria-label="Edit Knowledge"
                                  >
                                    <span className={styles.nextButtonText}>Edit Knowledge</span>
                                    <svg 
                                      className={styles.nextButtonIcon}
                                      width="18" 
                                      height="18" 
                                      viewBox="0 0 24 24" 
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path 
                                        d="M5 12H19M19 12L12 5M19 12L12 19" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeSection === 'knowledge' && !showEstablishedExpertise && !showExpandingKnowledgeBase && (
                <>
                  <div className={styles.iconHeader}>
                    <div className={styles.sectionIcon}>
                      <Image 
                        src="/images/network-intel-node.svg" 
                        alt="Knowledge" 
                        width={80} 
                        height={80} 
                        className={styles.sectionIconImage}
                      />
                    </div>
                  </div>
                  <h2 className={styles.sectionTitle}>Knowledge Asset</h2>
                  <p className={styles.sectionText}>
                    Manage and organize your knowledge assets and resources.
                  </p>
                  <div className={styles.knowledgeButtonContainer}>
                    <button
                      type="button"
                      className={styles.knowledgeButton}
                      onClick={() => {
                        setShowEstablishedExpertise(true);
                        // Only reset to first step if no step is currently set or if it's invalid
                        // Otherwise, keep the current step (restored from localStorage)
                        if (!activeExpertiseStep || !expertiseSteps.includes(activeExpertiseStep)) {
                          setActiveExpertiseStep('Personal Project');
                        }
                      }}
                      aria-label="Established Expertise"
                    >
                      <span className={styles.knowledgeButtonText}>Established Expertise</span>
                    </button>
                    <button
                      type="button"
                      className={styles.knowledgeButton}
                      onClick={() => {
                        setShowExpandingKnowledgeBase(true);
                        // Only reset to first step if no step is currently set or if it's invalid
                        // Otherwise, keep the current step (restored from localStorage)
                        if (!activeExpandingKnowledgeStep || !expandingKnowledgeSteps.includes(activeExpandingKnowledgeStep)) {
                          setActiveExpandingKnowledgeStep('Future Personal Project');
                        }
                      }}
                      aria-label="Expanding Knowledge Base"
                    >
                      <span className={styles.knowledgeButtonText}>Expanding Knowledge Base</span>
                    </button>
                  </div>
                </>
              )}
              {activeSection === 'knowledge' && showEstablishedExpertise && (
                <>
                  <div className={styles.resumeSectionHeader}>
                    <button
                      type="button"
                      className={`${styles.backButton} ${styles.resumeTopBackButton}`}
                      onClick={() => setShowEstablishedExpertise(false)}
                      aria-label="Back to Knowledge Asset"
                    >
                      <svg
                        className={styles.backButtonIcon}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 12H5M12 19L5 12L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.profileStepsContainer}>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBar}
                        style={{
                          width: expertiseSteps.indexOf(activeExpertiseStep) === 0 
                            ? '0%' 
                            : `${(expertiseSteps.indexOf(activeExpertiseStep) / (expertiseSteps.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    <ul className={styles.profileSteps}>
                      {expertiseSteps.map((step, idx) => {
                        const currentIdx = expertiseSteps.indexOf(activeExpertiseStep);
                        const isActive = idx === currentIdx;
                        const isCompleted = isExpertiseStepCompleted(step);
                        const shouldShowActiveStyle = isActive || isCompleted;
                        return (
                          <li
                            key={step}
                            className={`${styles.profileStep} ${shouldShowActiveStyle ? styles.profileStepActive : ''} ${isActive ? styles.profileStepCurrent : ''}`}
                          >
                            <button
                              type="button"
                              className={styles.profileStepButton}
                              disabled={!isActive && !isCompleted}
                              onClick={() => {
                                if (isActive || isCompleted) {
                                  setActiveExpertiseStep(step);
                                }
                              }}
                              aria-label={step}
                            >
                              <span className={styles.profileStepIndex}>{idx + 1}</span>
                              <span className={styles.profileStepLabel}>{step}</span>
                            </button>
                            {step === 'Personal Project' && isActive && personalProjects.length > 1 && (personalProjects.length <= 4 || isTransitioningToTags) && (
                              <div className={`${styles.subPanelDots} ${(personalProjects.length > 4 || isTransitioningToTags) ? styles.subPanelDotsExiting : ''}`} style={{ cursor: draggedPersonalProjectDotIndex !== null ? 'grabbing' : 'default' }}>
                                {personalProjects.map((project, projectIdx) => (
                                  <button
                                    key={project.id}
                                    ref={(el) => { personalProjectDotRefs.current[projectIdx] = el; }}
                                    type="button"
                                    draggable={personalProjects.length > 1}
                                    className={`${styles.subPanelDot} ${activePersonalProjectSubPanel === projectIdx + 1 ? styles.subPanelDotActive : ''} ${draggedPersonalProjectDotIndex === projectIdx ? styles.subPanelDotDragging : ''} ${draggedOverPersonalProjectDotIndex === projectIdx ? styles.subPanelDotDragOver : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActivePersonalProjectSubPanel(projectIdx + 1);
                                      setFocusedElement('dot');
                                    }}
                                    onDragStart={(e) => {
                                      setDraggedPersonalProjectDotIndex(projectIdx);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', projectIdx.toString());
                                      // Create a custom drag image (transparent)
                                      const dragImage = document.createElement('div');
                                      dragImage.style.position = 'absolute';
                                      dragImage.style.top = '-1000px';
                                      dragImage.style.width = '18px';
                                      dragImage.style.height = '18px';
                                      document.body.appendChild(dragImage);
                                      e.dataTransfer.setDragImage(dragImage, 9, 9);
                                      setTimeout(() => document.body.removeChild(dragImage), 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (draggedPersonalProjectDotIndex !== null && draggedPersonalProjectDotIndex !== projectIdx) {
                                        setDraggedOverPersonalProjectDotIndex(projectIdx);
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDraggedOverPersonalProjectDotIndex(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const draggedIndex = draggedPersonalProjectDotIndex;
                                      const dropIndex = projectIdx;
                                      
                                      if (draggedIndex !== null && draggedIndex !== dropIndex) {
                                        const newProjects = [...personalProjects];
                                        const [draggedProject] = newProjects.splice(draggedIndex, 1);
                                        newProjects.splice(dropIndex, 0, draggedProject);
                                        
                                        markEstablishedDirty();
                                        setPersonalProjects(newProjects);
                                        
                                        // Update active sub-panel if needed
                                        if (activePersonalProjectSubPanel === draggedIndex + 1) {
                                          setActivePersonalProjectSubPanel(dropIndex + 1);
                                        } else if (activePersonalProjectSubPanel === dropIndex + 1) {
                                          setActivePersonalProjectSubPanel(draggedIndex + 1);
                                        } else if (draggedIndex < activePersonalProjectSubPanel - 1 && dropIndex >= activePersonalProjectSubPanel - 1) {
                                          setActivePersonalProjectSubPanel(activePersonalProjectSubPanel - 1);
                                        } else if (draggedIndex > activePersonalProjectSubPanel - 1 && dropIndex < activePersonalProjectSubPanel - 1) {
                                          setActivePersonalProjectSubPanel(activePersonalProjectSubPanel + 1);
                                        }
                                      }
                                      
                                      setDraggedPersonalProjectDotIndex(null);
                                      setDraggedOverPersonalProjectDotIndex(null);
                                    }}
                                    onDragEnd={(e) => {
                                      setDraggedPersonalProjectDotIndex(null);
                                      setDraggedOverPersonalProjectDotIndex(null);
                                    }}
                                    onFocus={() => {
                                      setFocusedElement('dot');
                                    }}
                                    tabIndex={activePersonalProjectSubPanel === projectIdx + 1 ? 0 : -1}
                                    aria-label={`Personal Project ${projectIdx + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                            {step === 'Professional Project' && isActive && professionalProjects.length > 1 && (professionalProjects.length <= 4 || isTransitioningToTagsProfessional) && (
                              <div className={`${styles.subPanelDots} ${(professionalProjects.length > 4 || isTransitioningToTagsProfessional) ? styles.subPanelDotsExiting : ''}`} style={{ cursor: draggedProfessionalProjectDotIndex !== null ? 'grabbing' : 'default' }}>
                                {professionalProjects.map((project, projectIdx) => (
                                  <button
                                    key={project.id}
                                    ref={(el) => { professionalProjectDotRefs.current[projectIdx] = el; }}
                                    type="button"
                                    draggable={professionalProjects.length > 1}
                                    className={`${styles.subPanelDot} ${activeProfessionalProjectSubPanel === projectIdx + 1 ? styles.subPanelDotActive : ''} ${draggedProfessionalProjectDotIndex === projectIdx ? styles.subPanelDotDragging : ''} ${draggedOverProfessionalProjectDotIndex === projectIdx ? styles.subPanelDotDragOver : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveProfessionalProjectSubPanel(projectIdx + 1);
                                      setFocusedElement('dot');
                                    }}
                                    onDragStart={(e) => {
                                      setDraggedProfessionalProjectDotIndex(projectIdx);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', projectIdx.toString());
                                      // Create a custom drag image (transparent)
                                      const dragImage = document.createElement('div');
                                      dragImage.style.position = 'absolute';
                                      dragImage.style.top = '-1000px';
                                      dragImage.style.width = '18px';
                                      dragImage.style.height = '18px';
                                      document.body.appendChild(dragImage);
                                      e.dataTransfer.setDragImage(dragImage, 9, 9);
                                      setTimeout(() => document.body.removeChild(dragImage), 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (draggedProfessionalProjectDotIndex !== null && draggedProfessionalProjectDotIndex !== projectIdx) {
                                        setDraggedOverProfessionalProjectDotIndex(projectIdx);
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDraggedOverProfessionalProjectDotIndex(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const draggedIndex = draggedProfessionalProjectDotIndex;
                                      const dropIndex = projectIdx;
                                      
                                      if (draggedIndex !== null && draggedIndex !== dropIndex) {
                                        const newProjects = [...professionalProjects];
                                        const [draggedProject] = newProjects.splice(draggedIndex, 1);
                                        newProjects.splice(dropIndex, 0, draggedProject);
                                        
                                        markEstablishedDirty();
                                        setProfessionalProjects(newProjects);
                                        
                                        // Update active sub-panel if needed
                                        if (activeProfessionalProjectSubPanel === draggedIndex + 1) {
                                          setActiveProfessionalProjectSubPanel(dropIndex + 1);
                                        } else if (activeProfessionalProjectSubPanel === dropIndex + 1) {
                                          setActiveProfessionalProjectSubPanel(draggedIndex + 1);
                                        } else if (draggedIndex < activeProfessionalProjectSubPanel - 1 && dropIndex >= activeProfessionalProjectSubPanel - 1) {
                                          setActiveProfessionalProjectSubPanel(activeProfessionalProjectSubPanel - 1);
                                        } else if (draggedIndex > activeProfessionalProjectSubPanel - 1 && dropIndex < activeProfessionalProjectSubPanel - 1) {
                                          setActiveProfessionalProjectSubPanel(activeProfessionalProjectSubPanel + 1);
                                        }
                                      }
                                      
                                      setDraggedProfessionalProjectDotIndex(null);
                                      setDraggedOverProfessionalProjectDotIndex(null);
                                    }}
                                    onDragEnd={(e) => {
                                      setDraggedProfessionalProjectDotIndex(null);
                                      setDraggedOverProfessionalProjectDotIndex(null);
                                    }}
                                    onFocus={() => {
                                      setFocusedElement('dot');
                                    }}
                                    tabIndex={activeProfessionalProjectSubPanel === projectIdx + 1 ? 0 : -1}
                                    aria-label={`Professional Project ${projectIdx + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className={styles.profilePanel}>
                    {activeExpertiseStep === 'Personal Project' && personalProjects.length > 4 && (
                      <div className={`${styles.projectTagsContainer} ${personalProjects.length > 11 ? styles.projectTagsContainerScrollable : ''} ${tagsInitialized ? styles.projectTagsInitialized : ''}`}>
                        {personalProjects.map((project, projectIdx) => (
                          <button
                            key={project.id}
                            type="button"
                            className={`${styles.projectTag} ${activePersonalProjectSubPanel === projectIdx + 1 ? styles.projectTagActive : ''} ${tooltipBelowMap[projectIdx] ? styles.projectTagTooltipBelow : ''} ${tagsInitialized ? styles.projectTagNoAnimation : ''} ${hoveredTagIndex === projectIdx ? styles.projectTagHovered : ''}`}
                            onClick={() => {
                              setActivePersonalProjectSubPanel(projectIdx + 1);
                              setFocusedElement('dot');
                            }}
                            onFocus={() => {
                              setFocusedElement('dot');
                            }}
                            onMouseEnter={(e) => {
                              // Clear any existing timeout
                              if (hoverTimeoutRef.current) {
                                clearTimeout(hoverTimeoutRef.current);
                              }
                              
                              // Store reference to the button element
                              const button = e.currentTarget;
                              
                              // Set timeout to show tooltip after 1.1 seconds
                              hoverTimeoutRef.current = setTimeout(() => {
                                // Check if button still exists in DOM
                                if (!button || !button.parentElement) {
                                  return;
                                }
                                
                                setHoveredTagIndex(projectIdx);
                                
                                if (personalProjects.length > 11) {
                                  const container = button.parentElement;
                                  if (container) {
                                    const buttonRect = button.getBoundingClientRect();
                                    const containerRect = container.getBoundingClientRect();
                                    const spaceAbove = buttonRect.top - containerRect.top;
                                    const tooltipHeight = 40; // Approximate tooltip height
                                    const spaceNeeded = tooltipHeight + 20; // tooltip + gap
                                    
                                    if (spaceAbove < spaceNeeded) {
                                      setTooltipBelowMap(prev => ({ ...prev, [projectIdx]: true }));
                                    } else {
                                      setTooltipBelowMap(prev => ({ ...prev, [projectIdx]: false }));
                                    }
                                  }
                                }
                              }, 1100);
                            }}
                            onMouseLeave={() => {
                              // Clear timeout if mouse leaves before 1.5 seconds
                              if (hoverTimeoutRef.current) {
                                clearTimeout(hoverTimeoutRef.current);
                                hoverTimeoutRef.current = null;
                              }
                              setHoveredTagIndex(null);
                            }}
                            aria-label={`Personal Project ${projectIdx + 1}: ${project.projectName || 'Untitled'}`}
                            data-tooltip={project.projectName || `Project ${projectIdx + 1}`}
                            style={{
                              animationDelay: `${projectIdx * 0.05}s`
                            }}
                          >
                            <span className={styles.projectTagNumber}>{projectIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {activeExpertiseStep === 'Personal Project' && (
                      <div className={styles.knowledgePanelSection}>
                        {showEstablishedSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {personalProjects.map((project, projectIndex) => {
                          if (projectIndex + 1 !== activePersonalProjectSubPanel) return null;
                          
                          return (
                            <div key={project.id} className={styles.collegeSection}>
                              {personalProjects.length > 1 && (
                                <div className={styles.collegeSectionHeader}>
                                  <button
                                    type="button"
                                    className={styles.deleteCollegeButton}
                                    data-tooltip="Delete"
                                    onClick={() => {
                                      const newProjects = personalProjects.filter(p => p.id !== project.id);
                                      
                                      // Adjust active sub-panel before deleting
                                      if (newProjects.length === 0) {
                                        // Will be handled by useEffect that creates initial project
                                        setActivePersonalProjectSubPanel(1);
                                      } else if (projectIndex < activePersonalProjectSubPanel - 1) {
                                        setActivePersonalProjectSubPanel(activePersonalProjectSubPanel - 1);
                                      } else if (projectIndex === activePersonalProjectSubPanel - 1) {
                                        setActivePersonalProjectSubPanel(Math.max(1, activePersonalProjectSubPanel - 1));
                                      } else if (activePersonalProjectSubPanel > newProjects.length) {
                                        setActivePersonalProjectSubPanel(newProjects.length);
                                      }
                                      
                                      markEstablishedDirty();
                                      setPersonalProjects(newProjects);
                                    }}
                                    aria-label="Delete Personal Project"
                                  >
                                    <svg 
                                      className={styles.deleteButtonIcon}
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
                                </div>
                              )}
                              <div className={styles.knowledgeFormRow} style={{ marginBottom: '1.5rem' }}>
                                <div className={styles.knowledgeFormField} style={{ maxWidth: '300px', minWidth: '200px' }}>
                                  <label htmlFor={`project-name-${project.id}`} className={styles.formLabel}>
                                    Project Name <span style={{ color: '#d32f2f' }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id={`project-name-${project.id}`}
                                    className={styles.formInput}
                                    value={project.projectName}
                                    onChange={(e) => {
                                      markEstablishedDirty();
                                      setPersonalProjects(personalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectName: e.target.value } : p
                                      ));
                                    }}
                                    onFocus={() => setFocusedElement('field')}
                                    placeholder="Enter project name"
                                    required
                                  />
                                </div>
                                <div className={styles.knowledgeFormField} style={{ maxWidth: '300px', minWidth: '200px' }}>
                                  <label htmlFor="project-description" className={styles.formLabel}>
                                    Project Description <span style={{ color: '#d32f2f' }}>*</span>
                                  </label>
                                  <div className={styles.customDropdown} ref={descriptionDropdownRef} style={{ maxWidth: '320px', width: '100%' }}>
                                    <button
                                      type="button"
                                      className={styles.customDropdownTrigger}
                                      onClick={() => {
                                        setIsDescriptionDropdownOpen(!isDescriptionDropdownOpen);
                                        if (!isDescriptionDropdownOpen) {
                                          setActiveDescriptionTab('overview');
                                        }
                                      }}
                                      onFocus={() => setFocusedElement('field')}
                                      aria-label="Edit Project Description"
                                      aria-expanded={isDescriptionDropdownOpen}
                                      aria-haspopup="listbox"
                                    >
                                      <span className={styles.dropdownValue}>
                                        {(project.projectDescription?.overview?.trim() || project.projectDescription?.techAndTeamwork?.trim() || project.projectDescription?.achievement?.trim()) 
                                          ? 'Edit description...' 
                                          : 'Add description...'}
                                      </span>
                                      <svg 
                                        className={`${styles.dropdownArrow} ${isDescriptionDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                        width="22" 
                                        height="22" 
                                        viewBox="0 0 24 24" 
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path 
                                          d="M7 10L12 15L17 10" 
                                          stroke="currentColor" 
                                          strokeWidth="2.5" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round"
                                          fill="none"
                                        />
                                      </svg>
                                    </button>
                                    {isDescriptionDropdownOpen && (
                                      <div className={styles.descriptionDropdownMenu}>
                                        <div className={styles.descriptionTabs}>
                                          <button
                                            type="button"
                                            className={`${styles.descriptionTab} ${activeDescriptionTab === 'overview' ? styles.descriptionTabActive : ''}`}
                                            onClick={() => setActiveDescriptionTab('overview')}
                                          >
                                            Overview
                                          </button>
                                          <button
                                            type="button"
                                            className={`${styles.descriptionTab} ${activeDescriptionTab === 'techAndTeamwork' ? styles.descriptionTabActive : ''}`}
                                            onClick={() => setActiveDescriptionTab('techAndTeamwork')}
                                          >
                                            Showcase
                                          </button>
                                          <button
                                            type="button"
                                            className={`${styles.descriptionTab} ${activeDescriptionTab === 'achievement' ? styles.descriptionTabActive : ''}`}
                                            onClick={() => setActiveDescriptionTab('achievement')}
                                          >
                                            Achievement
                                          </button>
                                        </div>
                                        <div className={styles.descriptionTabContent}>
                                          <textarea
                                            className={styles.descriptionTextarea}
                                            value={(project.projectDescription && typeof project.projectDescription === 'object' && 'overview' in project.projectDescription) 
                                              ? (project.projectDescription[activeDescriptionTab] || '') 
                                              : ''}
                                            onChange={(e) => {
                                              markEstablishedDirty();
                                              const normalizedDesc = normalizeProjectDescription(project.projectDescription);
                                              setPersonalProjects(personalProjects.map(p => 
                                                p.id === project.id ? { 
                                                  ...p, 
                                                  projectDescription: {
                                                    ...normalizedDesc,
                                                    [activeDescriptionTab]: e.target.value
                                                  }
                                                } : p
                                              ));
                                            }}
                                            placeholder={
                                              activeDescriptionTab === 'overview' 
                                                ? 'Enter project overview...' 
                                                : activeDescriptionTab === 'techAndTeamwork'
                                                ? 'Enter technologies used and teamwork details...'
                                                : 'Enter achievements and outcomes...'
                                            }
                                            rows={6}
                                            style={{ resize: 'vertical' }}
                                            onFocus={() => setFocusedElement('field')}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                        
                        <div className={styles.knowledgeFormRow}>
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`industry-${project.id}`} className={styles.formLabel}>
                                      Industry Sector
                                    </label>
                                    <div 
                                      className={`${styles.customDropdown} ${isIndustryHovered && project.selectedIndustries.length > 0 && !isIndustryDropdownOpen ? styles.customDropdownWithTooltip : ''}`}
                                      ref={industryDropdownRef} 
                                      style={{ maxWidth: '320px', width: '100%', position: 'relative' }}
                                      onMouseEnter={() => project.selectedIndustries.length > 0 && setIsIndustryHovered(true)}
                                      onMouseLeave={() => setIsIndustryHovered(false)}
                                    >
                                      <button
                                        type="button"
                                        className={styles.customDropdownTrigger}
                                        onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Industry Sector"
                                        aria-expanded={isIndustryDropdownOpen}
                                        aria-haspopup="listbox"
                                      >
                                        <span className={styles.dropdownValue}>
                                          {project.selectedIndustries.length > 0 
                                            ? `${project.selectedIndustries.length} selected` 
                                            : 'Select Industry Sector'}
                                        </span>
                                <svg 
                                  className={`${styles.dropdownArrow} ${isIndustryDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                  width="22" 
                                  height="22" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M7 10L12 15L17 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              </button>
                                        {isIndustryHovered && project.selectedIndustries.length > 0 && !isIndustryDropdownOpen && (
                                          <div className={styles.selectedItemsTooltip}>
                                            <div className={styles.tooltipArrow}></div>
                                            <div className={styles.tooltipHeader}>
                                              <span className={styles.tooltipTitle}>Selected Industry Sectors</span>
                                              <span className={styles.tooltipCount}>({project.selectedIndustries.length})</span>
                                            </div>
                                            <div className={styles.tooltipItems}>
                                              {project.selectedIndustries.map((industry, index) => (
                                      <div key={industry} className={styles.tooltipItem}>
                                        <svg
                                          className={styles.tooltipCheckIcon}
                                          width="14"
                                          height="14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M20 6L9 17L4 12"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <span className={styles.tooltipItemText}>{industry}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                                        {isIndustryDropdownOpen && (
                                          <div className={styles.customDropdownMenu}>
                                            {industryOptions.map((option) => {
                                              const isSelected = project.selectedIndustries.includes(option);
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ''}`}
                                                  onClick={() => {
                                                    markEstablishedDirty();
                                                    setPersonalProjects(personalProjects.map(p => 
                                                      p.id === project.id 
                                                        ? { 
                                                            ...p, 
                                                            selectedIndustries: isSelected 
                                                              ? p.selectedIndustries.filter(i => i !== option)
                                                              : [...p.selectedIndustries, option]
                                                          }
                                                        : p
                                                    ));
                                                  }}
                                                >
                                        <div className={styles.optionContent}>
                                          <div className={`${styles.customCheckbox} ${isSelected ? styles.customCheckboxChecked : ''}`}>
                                            {isSelected && (
                                              <svg
                                                className={styles.checkmarkIcon}
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="3"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                          <span className={styles.optionText}>{option}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                                  
                          <div className={styles.knowledgeFormField} style={{ maxWidth: '300px', minWidth: '200px' }}>
                            <label htmlFor={`project-location-${project.id}`} className={styles.formLabel}>
                              Location
                            </label>
                            <input
                              type="text"
                              id={`project-location-${project.id}`}
                              className={styles.formInput}
                              value={project.location || ''}
                              onChange={(e) => {
                                markEstablishedDirty();
                                setPersonalProjects(personalProjects.map(p => 
                                  p.id === project.id ? { ...p, location: e.target.value } : p
                                ));
                              }}
                              onFocus={() => setFocusedElement('field')}
                              placeholder="The city for this project"
                            />
                          </div>
                        </div>
                        
                        
                              <div className={styles.knowledgeFormRow}>
                                <div className={styles.knowledgeFormField}>
                                  <label htmlFor={`technologies-${project.id}`} className={styles.formLabel}>
                                    Technologies
                                  </label>
                                  <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                    {!isCareerFocusSelected && (
                                      <div className={styles.careerFocusTooltip}>
                                        Please select Career Focus in Profile first
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                      disabled={!isCareerFocusSelected}
                                      onClick={() => {
                                        if (!isCareerFocusSelected) return;
                                        // Convert stored technologies to section-specific format
                                        const convertedTechnologies = project.selectedTechnologies.map(t => {
                                          // Check if this is a custom keyword (not in any section's options)
                                          const isCustomKeyword = !Object.values(technologySections).some(options => options.includes(t));
                                          if (isCustomKeyword) {
                                            return t; // Keep custom keywords as-is
                                          }
                                          return t;
                                        });
                                        
                                        // Restore section-specific "Other" selections
                                        const restoredTechnologies = convertedTechnologies.map(t => {
                                          if (t === 'Other') {
                                            return t;
                                          }
                                          return t;
                                        });
                                        
                                        setTempSelectedTechnologies(restoredTechnologies);
                                        setIsTechnologiesModalOpen(true);
                                        
                                        // Preserve custom keywords when reopening
                                        const preservedKeywords: Record<string, string[]> = {};
                                        Object.entries(technologySections).forEach(([sectionName, options]) => {
                                          const customItems = project.selectedTechnologies.filter(t => 
                                            !options.includes(t) && 
                                            t !== 'Other' &&
                                            !Object.values(technologySections).some(sectionOptions => 
                                              sectionOptions.includes(t) && sectionOptions !== options
                                            )
                                          );
                                          if (customItems.length > 0) {
                                            preservedKeywords[sectionName] = customItems;
                                          }
                                        });
                                        setTempSelectedTechnologies(restoredTechnologies);
                                        setCustomKeywords(preservedKeywords);
                                      }}
                                      onFocus={() => setFocusedElement('field')}
                                      aria-label="Select Technologies"
                                    >
                                      <span className={styles.industryButtonText}>
                                        {project.selectedTechnologies.length > 0 
                                          ? `${project.selectedTechnologies.length} selected` 
                                          : 'Select Technologies'}
                                      </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                  </div>
                                  </div>
                                  
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`frameworks-${project.id}`} className={styles.formLabel}>
                                      Framework & Tools
                                    </label>
                                    <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                      {!isCareerFocusSelected && (
                                        <div className={styles.careerFocusTooltip}>
                                          Please select Career Focus in Profile first
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                        disabled={!isCareerFocusSelected}
                                        onClick={() => {
                                          if (!isCareerFocusSelected) return;
                                          const convertedFrameworks = project.selectedFrameworks.map(t => {
                                            const isCustomKeyword = !Object.values(frameworkSections).some(options => options.includes(t));
                                            if (isCustomKeyword) {
                                              return t;
                                            }
                                            return t;
                                          });
                                          const restoredFrameworks = convertedFrameworks.map(t => {
                                            if (t === 'Other') {
                                              return t;
                                            }
                                            return t;
                                          });
                                          setTempSelectedFrameworks(restoredFrameworks);
                                          setIsFrameworksModalOpen(true);
                                          const preservedKeywords: Record<string, string[]> = {};
                                          Object.entries(frameworkSections).forEach(([sectionName, options]) => {
                                            const customItems = project.selectedFrameworks.filter(t => 
                                              !options.includes(t) && 
                                              t !== 'Other' &&
                                              !Object.values(frameworkSections).some(sectionOptions => 
                                                sectionOptions.includes(t) && sectionOptions !== options
                                              )
                                            );
                                            if (customItems.length > 0) {
                                              preservedKeywords[sectionName] = customItems;
                                            }
                                          });
                                          setTempSelectedFrameworks(restoredFrameworks);
                                          setCustomFrameworkKeywords(preservedKeywords);
                                        }}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Framework & Tools"
                                      >
                                        <span className={styles.industryButtonText}>
                                          {project.selectedFrameworks.length > 0 
                                            ? `${project.selectedFrameworks.length} selected` 
                                            : 'Select Framework & Tools'}
                                        </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                    </div>
                          </div>
                        </div>
                        
                        {isTechnologiesModalOpen && (
                          <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                            setTempSelectedTechnologies([...selectedTechnologies]);
                            setIsTechnologiesModalOpen(false);
                          }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={technologiesModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Technologies</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempSelectedTechnologies([...selectedTechnologies]);
                                    setIsTechnologiesModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(technologySections).map(([sectionName, options]) => {
                                    // Count selections including section-specific "Other" and custom keywords from this section
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempSelectedTechnologies.includes(`Other_${sectionName}`);
                                      }
                                      return tempSelectedTechnologies.includes(opt);
                                    }).length;
                                    // Also count custom keywords that belong to this section
                                    const customKeywordsForSection = customKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempSelectedTechnologies.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                // Remove all options from this section (including section-specific "Other")
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempSelectedTechnologies(prev => 
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                // Clear custom keywords for this section
                                                setCustomKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          // For "Other", use section-specific identifier
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempSelectedTechnologies.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          // Don't render "Other" button here - it will be shown at the end
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempSelectedTechnologies(tempSelectedTechnologies.filter(t => t !== optionKey));
                                                } else {
                                                  setTempSelectedTechnologies([...tempSelectedTechnologies, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempSelectedTechnologies.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempSelectedTechnologies(tempSelectedTechnologies.filter(t => t !== keyword));
                                                  } else {
                                                    setTempSelectedTechnologies([...tempSelectedTechnologies, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempSelectedTechnologies(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customKeywordInputValue[sectionName].trim();
                                                  if (!(customKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedTechnologies([...tempSelectedTechnologies, newKeyword]);
                                                    setCustomKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                    // Keep input field open for adding more
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  // Add the keyword if there's content
                                                  const newKeyword = inputValue;
                                                  if (!(customKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedTechnologies([...tempSelectedTechnologies, newKeyword]);
                                                  }
                                                  setCustomKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                  // Keep input field open for adding more
                                                } else {
                                                  // Close input field if empty
                                                  setIsShowingCustomKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              // Show input field when "+" is clicked
                                              setIsShowingCustomKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
                                  onClick={() => {
                                        // Use tempSelectedTechnologies directly - selected items are already tracked there
                                        // Convert section-specific "Other" keys to just "Other" for storage
                                        const hasOther = tempSelectedTechnologies.some(t => t.startsWith('Other_'));
                                        const cleanedTechnologies = tempSelectedTechnologies
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markEstablishedDirty();
                                        setPersonalProjects(personalProjects.map(p => 
                                          p.id === project.id ? { ...p, selectedTechnologies: cleanedTechnologies } : p
                                        ));
                                        setIsTechnologiesModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isFrameworksModalOpen && (
                              <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                                setTempSelectedFrameworks([...project.selectedFrameworks]);
                                setIsFrameworksModalOpen(false);
                              }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={frameworksModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Framework & Tools</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempSelectedFrameworks([...selectedFrameworks]);
                                    setIsFrameworksModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(frameworkSections).map(([sectionName, options]) => {
                                    // Count selections including section-specific "Other" and custom keywords from this section
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempSelectedFrameworks.includes(`Other_${sectionName}`);
                                      }
                                      return tempSelectedFrameworks.includes(opt);
                                    }).length;
                                    // Also count custom keywords that belong to this section
                                    const customKeywordsForSection = customFrameworkKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempSelectedFrameworks.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                // Remove all options from this section (including section-specific "Other")
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customFrameworkKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempSelectedFrameworks(prev => 
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                // Clear custom keywords for this section
                                                setCustomFrameworkKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomFrameworkKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomFrameworkKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          // For "Other", use section-specific identifier
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempSelectedFrameworks.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          // Don't render "Other" button here - it will be shown at the end
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempSelectedFrameworks(tempSelectedFrameworks.filter(t => t !== optionKey));
                                                } else {
                                                  setTempSelectedFrameworks([...tempSelectedFrameworks, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customFrameworkKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomFrameworkKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomFrameworkKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempSelectedFrameworks.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempSelectedFrameworks(tempSelectedFrameworks.filter(t => t !== keyword));
                                                  } else {
                                                    setTempSelectedFrameworks([...tempSelectedFrameworks, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomFrameworkKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customFrameworkKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomFrameworkKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempSelectedFrameworks(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomFrameworkKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomFrameworkKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomFrameworkKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomFrameworkKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customFrameworkKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomFrameworkKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customFrameworkKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customFrameworkKeywordInputValue[sectionName].trim();
                                                  if (!(customFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedFrameworks([...tempSelectedFrameworks, newKeyword]);
                                                    setCustomFrameworkKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customFrameworkKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedFrameworks([...tempSelectedFrameworks, newKeyword]);
                                                  }
                                                  setCustomFrameworkKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomFrameworkKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomFrameworkKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
                                  onClick={() => {
                                        // Use tempSelectedFrameworks directly - selected items are already tracked there
                                        // Convert section-specific "Other" keys to just "Other" for storage
                                        const hasOther = tempSelectedFrameworks.some(t => t.startsWith('Other_'));
                                        const cleanedFrameworks = tempSelectedFrameworks
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markEstablishedDirty();
                                        setPersonalProjects(personalProjects.map(p => 
                                          p.id === project.id ? { ...p, selectedFrameworks: cleanedFrameworks } : p
                                        ));
                                        setIsFrameworksModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className={styles.knowledgeFormRow}>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>Start Date</label>
                                <div className={styles.dateRow}>
                                  <DateDropdown
                                    value={project.projectStartMonth}
                                    options={months}
                                    placeholder="Month"
                                    onSelect={(value) => {
                                      markEstablishedDirty();
                                      setPersonalProjects(personalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectStartMonth: value } : p
                                      ));
                                    }}
                                    degreeId={`project-start-${project.id}`}
                                    fieldType="startMonth"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                  <DateDropdown
                                    value={project.projectStartYear}
                                    options={years.map(y => y.toString())}
                                    placeholder="Year"
                                    onSelect={(value) => {
                                      markEstablishedDirty();
                                      setPersonalProjects(personalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectStartYear: value } : p
                                      ));
                                    }}
                                    degreeId={`project-start-${project.id}`}
                                    fieldType="startYear"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                </div>
                              </div>
                              
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>End Date</label>
                                <div className={styles.dateRow}>
                                  <DateDropdown
                                    value={project.projectEndMonth}
                                    options={months}
                                    placeholder="Month"
                                    onSelect={(value) => {
                                      markEstablishedDirty();
                                      setPersonalProjects(personalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectEndMonth: value } : p
                                      ));
                                    }}
                                    degreeId={`project-end-${project.id}`}
                                    fieldType="endMonth"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                  <DateDropdown
                                    value={project.projectEndYear}
                                    options={years.map(y => y.toString())}
                                    placeholder="Year"
                                    onSelect={(value) => {
                                      markEstablishedDirty();
                                      setPersonalProjects(personalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectEndYear: value } : p
                                      ));
                                    }}
                                    degreeId={`project-end-${project.id}`}
                                    fieldType="endYear"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {projectIndex === personalProjects.length - 1 && (
                              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className={styles.addCollegeButton}
                                  disabled={!project.projectName.trim() || (!project.projectDescription?.overview?.trim() && !project.projectDescription?.techAndTeamwork?.trim() && !project.projectDescription?.achievement?.trim())}
                                  onClick={() => {
                                    const newProject: PersonalProject = {
                                      id: `project-${Date.now()}-${Math.random()}`,
                                      projectName: '',
                                      projectDescription: {
                                        overview: '',
                                        techAndTeamwork: '',
                                        achievement: '',
                                      },
                                      selectedIndustries: [],
                                      projectStartMonth: '',
                                      projectStartYear: '',
                                      projectEndMonth: '',
                                      projectEndYear: '',
                                      location: '',
                                      selectedTechnologies: [],
                                      selectedFrameworks: [],
                                      isInterviewReady: false,
                                    };
                                    const willTransitionToTags = personalProjects.length === 4;
                                    if (willTransitionToTags) {
                                      setIsTransitioningToTags(true);
                                      setTimeout(() => {
                                        setIsTransitioningToTags(false);
                                      }, 600);
                                    }
                                    markEstablishedDirty();
                                    setPersonalProjects([...personalProjects, newProject]);
                                    setActivePersonalProjectSubPanel(personalProjects.length + 1);
                                  }}
                                  aria-label="Add Personal Project"
                                >
                                  <span className={styles.addButtonIcon}>+</span>
                                  <span className={styles.addButtonText}>Add Personal Project</span>
                                </button>
                              </div>
                            )}
                            
                            <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save established expertise if dirty before navigating
                                  if (establishedFormState === 'established_dirty') {
                                    await handleKnowledgeSubmit();
                                  }
                                  if (projectIndex === 0) {
                                    setShowEstablishedExpertise(false);
                                  } else {
                                    setActivePersonalProjectSubPanel(projectIndex);
                                  }
                                }}
                                aria-label={projectIndex === 0 ? "Back to Knowledge Asset" : "Back to Previous Project"}
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save established expertise if dirty before navigating
                                  if (establishedFormState === 'established_dirty') {
                                    await handleKnowledgeSubmit();
                                  }
                                  if (projectIndex < personalProjects.length - 1) {
                                    setActivePersonalProjectSubPanel(projectIndex + 2);
                                  } else {
                                    setActiveExpertiseStep('Professional Project');
                                  }
                                }}
                                aria-label={projectIndex < personalProjects.length - 1 ? "Next to Next Project" : "Next to Professional Project"}
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                    {activeExpertiseStep === 'Professional Project' && professionalProjects.length > 4 && (
                      <div className={`${styles.projectTagsContainer} ${professionalProjects.length > 11 ? styles.projectTagsContainerScrollable : ''} ${tagsInitializedProfessional ? styles.projectTagsInitialized : ''}`}>
                        {professionalProjects.map((project, projectIdx) => (
                          <button
                            key={project.id}
                            type="button"
                            className={`${styles.projectTag} ${activeProfessionalProjectSubPanel === projectIdx + 1 ? styles.projectTagActive : ''} ${tooltipBelowMapProfessional[projectIdx] ? styles.projectTagTooltipBelow : ''} ${tagsInitializedProfessional ? styles.projectTagNoAnimation : ''} ${hoveredTagIndexProfessional === projectIdx ? styles.projectTagHovered : ''}`}
                            onClick={() => {
                              setActiveProfessionalProjectSubPanel(projectIdx + 1);
                              setFocusedElement('dot');
                            }}
                            onFocus={() => {
                              setFocusedElement('dot');
                            }}
                            onMouseEnter={(e) => {
                              if (hoverTimeoutRefProfessional.current) {
                                clearTimeout(hoverTimeoutRefProfessional.current);
                              }
                              const button = e.currentTarget;
                              hoverTimeoutRefProfessional.current = setTimeout(() => {
                                if (!button || !button.parentElement) {
                                  return;
                                }
                                setHoveredTagIndexProfessional(projectIdx);
                                if (professionalProjects.length > 11) {
                                  const container = button.parentElement;
                                  if (container) {
                                    const buttonRect = button.getBoundingClientRect();
                                    const containerRect = container.getBoundingClientRect();
                                    const spaceAbove = buttonRect.top - containerRect.top;
                                    const tooltipHeight = 40;
                                    const spaceNeeded = tooltipHeight + 20;
                                    if (spaceAbove < spaceNeeded) {
                                      setTooltipBelowMapProfessional(prev => ({ ...prev, [projectIdx]: true }));
                                    } else {
                                      setTooltipBelowMapProfessional(prev => ({ ...prev, [projectIdx]: false }));
                                    }
                                  }
                                }
                              }, 1100);
                            }}
                            onMouseLeave={() => {
                              if (hoverTimeoutRefProfessional.current) {
                                clearTimeout(hoverTimeoutRefProfessional.current);
                                hoverTimeoutRefProfessional.current = null;
                              }
                              setHoveredTagIndexProfessional(null);
                            }}
                            aria-label={`Professional Project ${projectIdx + 1}: ${project.projectName || 'Untitled'}`}
                            data-tooltip={project.projectName || `Project ${projectIdx + 1}`}
                            style={{
                              animationDelay: `${projectIdx * 0.05}s`
                            }}
                          >
                            <span className={styles.projectTagNumber}>{projectIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {activeExpertiseStep === 'Professional Project' && (
                      <div className={styles.knowledgePanelSection}>
                        {showEstablishedSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {professionalProjects.length > 0 ? (
                          professionalProjects.map((project, projectIndex) => {
                            if (projectIndex + 1 !== activeProfessionalProjectSubPanel) return null;
                            
                            return (
                              <div key={project.id} className={styles.collegeSection}>
                              {professionalProjects.length > 1 && (
                                <div className={styles.collegeSectionHeader}>
                                  <button
                                    type="button"
                                    className={styles.deleteCollegeButton}
                                    data-tooltip="Delete"
                                    onClick={() => {
                                      const newProjects = professionalProjects.filter(p => p.id !== project.id);
                                      if (newProjects.length === 0) {
                                        setActiveProfessionalProjectSubPanel(1);
                                      } else if (projectIndex < activeProfessionalProjectSubPanel - 1) {
                                        setActiveProfessionalProjectSubPanel(activeProfessionalProjectSubPanel - 1);
                                      } else if (projectIndex === activeProfessionalProjectSubPanel - 1) {
                                        setActiveProfessionalProjectSubPanel(Math.max(1, activeProfessionalProjectSubPanel - 1));
                                      } else if (activeProfessionalProjectSubPanel > newProjects.length) {
                                        setActiveProfessionalProjectSubPanel(newProjects.length);
                                      }
                                      markEstablishedDirty();
                                      setProfessionalProjects(newProjects);
                                    }}
                                    aria-label="Delete Professional Project"
                                  >
                                    <svg 
                                      className={styles.deleteButtonIcon}
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
                                </div>
                              )}
                              <div className={styles.knowledgeFormField} style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor={`professional-project-name-${project.id}`} className={styles.formLabel}>
                                  Project Name <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  id={`professional-project-name-${project.id}`}
                                  className={styles.formInput}
                                  value={project.projectName}
                                  onChange={(e) => {
                                    markEstablishedDirty();
                                    setProfessionalProjects(professionalProjects.map(p => 
                                      p.id === project.id ? { ...p, projectName: e.target.value } : p
                                    ));
                                  }}
                                  onFocus={() => setFocusedElement('field')}
                                  placeholder="Enter project name"
                                  required
                                />
                              </div>
                        
                        <div className={styles.knowledgeFormRow}>
                          <div className={styles.knowledgeFormField}>
                            <label htmlFor={`professional-project-description-${project.id}`} className={styles.formLabel}>
                              Project Description <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <div className={styles.customDropdown} ref={descriptionDropdownRef} style={{ maxWidth: '320px', width: '100%' }}>
                              <button
                                type="button"
                                className={styles.customDropdownTrigger}
                                onClick={() => {
                                  setIsDescriptionDropdownOpen(!isDescriptionDropdownOpen);
                                  if (!isDescriptionDropdownOpen) {
                                    setActiveDescriptionTab('overview');
                                  }
                                }}
                                onFocus={() => setFocusedElement('field')}
                                aria-label="Edit Project Description"
                                aria-expanded={isDescriptionDropdownOpen}
                                aria-haspopup="listbox"
                              >
                                <span className={styles.dropdownValue}>
                                  {(project.projectDescription?.overview?.trim() || project.projectDescription?.techAndTeamwork?.trim() || project.projectDescription?.achievement?.trim()) 
                                    ? 'Edit description...' 
                                    : 'Add description...'}
                                </span>
                                <svg 
                                  className={`${styles.dropdownArrow} ${isDescriptionDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                  width="22" 
                                  height="22" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M7 10L12 15L17 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              </button>
                                      {isDescriptionDropdownOpen && (
                                        <div className={styles.descriptionDropdownMenu}>
                                          <div className={styles.descriptionTabs}>
                                            <button
                                              type="button"
                                              className={`${styles.descriptionTab} ${activeDescriptionTab === 'overview' ? styles.descriptionTabActive : ''}`}
                                              onClick={() => setActiveDescriptionTab('overview')}
                                            >
                                              Overview
                                            </button>
                                            <button
                                              type="button"
                                              className={`${styles.descriptionTab} ${activeDescriptionTab === 'techAndTeamwork' ? styles.descriptionTabActive : ''}`}
                                              onClick={() => setActiveDescriptionTab('techAndTeamwork')}
                                            >
                                              Showcase
                                            </button>
                                            <button
                                              type="button"
                                              className={`${styles.descriptionTab} ${activeDescriptionTab === 'achievement' ? styles.descriptionTabActive : ''}`}
                                              onClick={() => setActiveDescriptionTab('achievement')}
                                            >
                                              Achievement
                                            </button>
                                          </div>
                                          <div className={styles.descriptionTabContent}>
                                            <textarea
                                              className={styles.descriptionTextarea}
                                              value={project.projectDescription?.[activeDescriptionTab] || ''}
                                              onChange={(e) => {
                                                markEstablishedDirty();
                                                const normalizedDesc = normalizeProjectDescription(project.projectDescription);
                                                setProfessionalProjects(professionalProjects.map(p => 
                                                  p.id === project.id ? { 
                                                    ...p, 
                                                    projectDescription: {
                                                      ...normalizedDesc,
                                                      [activeDescriptionTab]: e.target.value
                                                    }
                                                  } : p
                                                ));
                                              }}
                                              placeholder={
                                                activeDescriptionTab === 'overview' 
                                                  ? 'Enter project overview...' 
                                                  : activeDescriptionTab === 'techAndTeamwork'
                                                  ? 'Enter technologies used and teamwork details...'
                                                  : 'Enter achievements and outcomes...'
                                              }
                                              rows={6}
                                              style={{ resize: 'vertical' }}
                                              onFocus={() => setFocusedElement('field')}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`professional-work-experience-${project.id}`} className={styles.formLabel}>
                                      Work Experience <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <div 
                                      className={styles.customDropdown}
                                      ref={workExperienceDropdownRef} 
                                      style={{ maxWidth: '320px', width: '100%', position: 'relative' }}
                                    >
                                      <button
                                        type="button"
                                        className={styles.customDropdownTrigger}
                                        onClick={() => {
                                          if (professionalExperiences.length > 0) {
                                            setIsWorkExperienceDropdownOpen(!isWorkExperienceDropdownOpen);
                                          }
                                        }}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Work Experience"
                                        aria-expanded={isWorkExperienceDropdownOpen}
                                        aria-haspopup="listbox"
                                        disabled={professionalExperiences.length === 0}
                                        style={{ 
                                          opacity: professionalExperiences.length === 0 ? 0.5 : 1,
                                          cursor: professionalExperiences.length === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                      >
                                        <span className={`${styles.dropdownValue} ${project.selectedWorkExperience ? styles.workExperienceValue : ''}`}>
                                          <span 
                                            ref={(el) => { workExperienceTextRefs.current[project.id] = el; }}
                                            className={styles.workExperienceText}
                                            onMouseEnter={(e) => {
                                              if (project.selectedWorkExperience) {
                                                const textElement = e.currentTarget;
                                                const container = textElement.parentElement;
                                                if (container && textElement) {
                                                  const textWidth = textElement.scrollWidth;
                                                  const containerWidth = container.clientWidth;
                                                  if (textWidth > containerWidth) {
                                                    const scrollDistance = containerWidth - textWidth;
                                                    textElement.style.setProperty('--scroll-distance', `${scrollDistance}px`);
                                                  } else {
                                                    textElement.style.setProperty('--scroll-distance', '0px');
                                                  }
                                                }
                                              }
                                            }}
                                          >
                                            {project.selectedWorkExperience 
                                              ? project.selectedWorkExperience
                                              : professionalExperiences.length === 0 
                                                ? 'Fill work experience'
                                                : 'Select Work Experience'}
                                          </span>
                                        </span>
                                <svg 
                                  className={`${styles.dropdownArrow} ${isWorkExperienceDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                  width="22" 
                                  height="22" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M7 10L12 15L17 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              </button>
                                        {isWorkExperienceDropdownOpen && professionalExperiences.length > 0 && (
                                          <div className={styles.customDropdownMenu}>
                                            {professionalExperiences.map((experience) => {
                                              const optionValue = `${experience.companyName} - ${experience.jobTitle}`;
                                              const isSelected = project.selectedWorkExperience === optionValue;
                                              return (
                                                <button
                                                  key={experience.id}
                                                  type="button"
                                                  className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ''}`}
                                                  onClick={() => {
                                                    markEstablishedDirty();
                                                    setProfessionalProjects(professionalProjects.map(p => 
                                                      p.id === project.id 
                                                        ? { 
                                                            ...p, 
                                                            selectedWorkExperience: isSelected ? '' : optionValue
                                                          }
                                                        : p
                                                    ));
                                                    setIsWorkExperienceDropdownOpen(false);
                                                  }}
                                                >
                                        <span className={styles.optionText}>{optionValue}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        
                              <div className={styles.knowledgeFormRow}>
                                <div className={styles.knowledgeFormField}>
                                  <label htmlFor={`professional-technologies-${project.id}`} className={styles.formLabel}>
                                    Technologies
                                  </label>
                                  <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                    {!isCareerFocusSelected && (
                                      <div className={styles.careerFocusTooltip}>
                                        Please select Career Focus in Profile first
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                      disabled={!isCareerFocusSelected}
                                      onClick={() => {
                                        if (!isCareerFocusSelected) return;
                                        const convertedTechnologies = project.selectedTechnologies.map(t => {
                                          const isCustomKeyword = !Object.values(technologySections).some(options => options.includes(t));
                                          if (isCustomKeyword) {
                                            return t;
                                          }
                                          return t;
                                        });
                                        const restoredTechnologies = convertedTechnologies.map(t => {
                                          if (t === 'Other') {
                                            return t;
                                          }
                                          return t;
                                        });
                                        setTempSelectedTechnologies(restoredTechnologies);
                                        setIsTechnologiesModalOpen(true);
                                        const preservedKeywords: Record<string, string[]> = {};
                                        Object.entries(technologySections).forEach(([sectionName, options]) => {
                                          const customItems = project.selectedTechnologies.filter(t => 
                                            !options.includes(t) && 
                                            t !== 'Other' &&
                                            !Object.values(technologySections).some(sectionOptions => 
                                              sectionOptions.includes(t) && sectionOptions !== options
                                            )
                                          );
                                          if (customItems.length > 0) {
                                            preservedKeywords[sectionName] = customItems;
                                          }
                                        });
                                        setTempSelectedTechnologies(restoredTechnologies);
                                        setCustomKeywords(preservedKeywords);
                                      }}
                                      onFocus={() => setFocusedElement('field')}
                                      aria-label="Select Technologies"
                                    >
                                      <span className={styles.industryButtonText}>
                                        {project.selectedTechnologies.length > 0 
                                          ? `${project.selectedTechnologies.length} selected` 
                                          : 'Select Technologies'}
                                      </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                  </div>
                                  </div>
                                  
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`professional-frameworks-${project.id}`} className={styles.formLabel}>
                                      Framework & Tools
                                    </label>
                                    <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                      {!isCareerFocusSelected && (
                                        <div className={styles.careerFocusTooltip}>
                                          Please select Career Focus in Profile first
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                        disabled={!isCareerFocusSelected}
                                        onClick={() => {
                                          if (!isCareerFocusSelected) return;
                                          const convertedFrameworks = project.selectedFrameworks.map(t => {
                                            const isCustomKeyword = !Object.values(frameworkSections).some(options => options.includes(t));
                                            if (isCustomKeyword) {
                                              return t;
                                            }
                                            return t;
                                          });
                                          const restoredFrameworks = convertedFrameworks.map(t => {
                                            if (t === 'Other') {
                                              return t;
                                            }
                                            return t;
                                          });
                                          setTempSelectedFrameworks(restoredFrameworks);
                                          setIsFrameworksModalOpen(true);
                                          const preservedKeywords: Record<string, string[]> = {};
                                          Object.entries(frameworkSections).forEach(([sectionName, options]) => {
                                            const customItems = project.selectedFrameworks.filter(t => 
                                              !options.includes(t) && 
                                              t !== 'Other' &&
                                              !Object.values(frameworkSections).some(sectionOptions => 
                                                sectionOptions.includes(t) && sectionOptions !== options
                                              )
                                            );
                                            if (customItems.length > 0) {
                                              preservedKeywords[sectionName] = customItems;
                                            }
                                          });
                                          setTempSelectedFrameworks(restoredFrameworks);
                                          setCustomFrameworkKeywords(preservedKeywords);
                                        }}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Framework & Tools"
                                      >
                                        <span className={styles.industryButtonText}>
                                          {project.selectedFrameworks.length > 0 
                                            ? `${project.selectedFrameworks.length} selected` 
                                            : 'Select Framework & Tools'}
                                        </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                    </div>
                          </div>
                        </div>
                        
                        {isTechnologiesModalOpen && (
                          <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                            setTempSelectedTechnologies([...selectedTechnologies]);
                            setIsTechnologiesModalOpen(false);
                          }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={technologiesModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Technologies</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempSelectedTechnologies([...selectedTechnologies]);
                                    setIsTechnologiesModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(technologySections).map(([sectionName, options]) => {
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempSelectedTechnologies.includes(`Other_${sectionName}`);
                                      }
                                      return tempSelectedTechnologies.includes(opt);
                                    }).length;
                                    const customKeywordsForSection = customKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempSelectedTechnologies.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempSelectedTechnologies(prev => 
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                setCustomKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempSelectedTechnologies.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          // Don't render "Other" button here - it will be shown at the end
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempSelectedTechnologies(tempSelectedTechnologies.filter(t => t !== optionKey));
                                                } else {
                                                  setTempSelectedTechnologies([...tempSelectedTechnologies, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempSelectedTechnologies.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempSelectedTechnologies(tempSelectedTechnologies.filter(t => t !== keyword));
                                                  } else {
                                                    setTempSelectedTechnologies([...tempSelectedTechnologies, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempSelectedTechnologies(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customKeywordInputValue[sectionName].trim();
                                                  if (!(customKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedTechnologies([...tempSelectedTechnologies, newKeyword]);
                                                    setCustomKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedTechnologies([...tempSelectedTechnologies, newKeyword]);
                                                  }
                                                  setCustomKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
                                  onClick={() => {
                                        // Use tempSelectedTechnologies directly - selected items are already tracked there
                                        const hasOther = tempSelectedTechnologies.some(t => t.startsWith('Other_'));
                                        const cleanedTechnologies = tempSelectedTechnologies
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markEstablishedDirty();
                                        setProfessionalProjects(professionalProjects.map(p => 
                                          p.id === project.id ? { ...p, selectedTechnologies: cleanedTechnologies } : p
                                        ));
                                        setIsTechnologiesModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isFrameworksModalOpen && (
                              <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                                setTempSelectedFrameworks([...project.selectedFrameworks]);
                                setIsFrameworksModalOpen(false);
                              }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={frameworksModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Framework & Tools</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempSelectedFrameworks([...selectedFrameworks]);
                                    setIsFrameworksModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(frameworkSections).map(([sectionName, options]) => {
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempSelectedFrameworks.includes(`Other_${sectionName}`);
                                      }
                                      return tempSelectedFrameworks.includes(opt);
                                    }).length;
                                    const customKeywordsForSection = customFrameworkKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempSelectedFrameworks.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customFrameworkKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempSelectedFrameworks(prev => 
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                setCustomFrameworkKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomFrameworkKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomFrameworkKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempSelectedFrameworks.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          // Don't render "Other" button here - it will be shown at the end
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempSelectedFrameworks(tempSelectedFrameworks.filter(t => t !== optionKey));
                                                } else {
                                                  setTempSelectedFrameworks([...tempSelectedFrameworks, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customFrameworkKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomFrameworkKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomFrameworkKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempSelectedFrameworks.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempSelectedFrameworks(tempSelectedFrameworks.filter(t => t !== keyword));
                                                  } else {
                                                    setTempSelectedFrameworks([...tempSelectedFrameworks, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomFrameworkKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customFrameworkKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomFrameworkKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempSelectedFrameworks(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomFrameworkKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomFrameworkKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomFrameworkKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomFrameworkKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customFrameworkKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomFrameworkKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customFrameworkKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customFrameworkKeywordInputValue[sectionName].trim();
                                                  if (!(customFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedFrameworks([...tempSelectedFrameworks, newKeyword]);
                                                    setCustomFrameworkKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customFrameworkKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempSelectedFrameworks([...tempSelectedFrameworks, newKeyword]);
                                                  }
                                                  setCustomFrameworkKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomFrameworkKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomFrameworkKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
                                  onClick={() => {
                                        // Use tempSelectedFrameworks directly - selected items are already tracked there
                                        const hasOther = tempSelectedFrameworks.some(t => t.startsWith('Other_'));
                                        const cleanedFrameworks = tempSelectedFrameworks
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markEstablishedDirty();
                                        setProfessionalProjects(professionalProjects.map(p => 
                                          p.id === project.id ? { ...p, selectedFrameworks: cleanedFrameworks } : p
                                        ));
                                        setIsFrameworksModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {projectIndex === professionalProjects.length - 1 && (
                              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className={styles.addCollegeButton}
                                  disabled={!project.projectName.trim() || (!project.projectDescription?.overview?.trim() && !project.projectDescription?.techAndTeamwork?.trim() && !project.projectDescription?.achievement?.trim())}
                                  onClick={() => {
                                    const newProject: ProfessionalProject = {
                                      id: `professional-project-${Date.now()}-${Math.random()}`,
                                      projectName: '',
                                      projectDescription: {
                                        overview: '',
                                        techAndTeamwork: '',
                                        achievement: '',
                                      },
                                      selectedWorkExperience: '',
                                      projectStartMonth: '',
                                      projectStartYear: '',
                                      projectEndMonth: '',
                                      projectEndYear: '',
                                      selectedTechnologies: [],
                                      selectedFrameworks: [],
                                      isInterviewReady: false,
                                    };
                                    const willTransitionToTags = professionalProjects.length === 4;
                                    if (willTransitionToTags) {
                                      setIsTransitioningToTagsProfessional(true);
                                      setTimeout(() => {
                                        setIsTransitioningToTagsProfessional(false);
                                      }, 600);
                                    }
                                    markEstablishedDirty();
                                    setProfessionalProjects([...professionalProjects, newProject]);
                                    setActiveProfessionalProjectSubPanel(professionalProjects.length + 1);
                                  }}
                                  aria-label="Add Professional Project"
                                >
                                  <span className={styles.addButtonIcon}>+</span>
                                  <span className={styles.addButtonText}>Add Professional Project</span>
                                </button>
                              </div>
                            )}
                            
                            <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save established expertise if dirty before navigating
                                  if (establishedFormState === 'established_dirty') {
                                    await handleKnowledgeSubmit();
                                  }
                                  if (projectIndex === 0) {
                                    setActiveExpertiseStep('Personal Project');
                                  } else {
                                    setActiveProfessionalProjectSubPanel(projectIndex);
                                  }
                                }}
                                aria-label={projectIndex === 0 ? "Back to Personal Project" : "Back to Previous Project"}
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save established expertise if dirty before navigating
                                  if (establishedFormState === 'established_dirty') {
                                    await handleKnowledgeSubmit();
                                  }
                                  if (projectIndex < professionalProjects.length - 1) {
                                    setActiveProfessionalProjectSubPanel(projectIndex + 2);
                                  } else {
                                    setActiveExpertiseStep('Technical Skill Focus');
                                  }
                                }}
                                aria-label={projectIndex < professionalProjects.length - 1 ? "Next to Next Project" : "Next to Technical Skill Focus"}
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                            );
                          })
                        ) : (
                          <div className={styles.collegeSection}>
                            <div className={styles.knowledgeFormField} style={{ marginBottom: '1.5rem' }}>
                              <label className={styles.formLabel}>
                                Project Name <span style={{ color: '#d32f2f' }}>*</span>
                              </label>
                              <input
                                type="text"
                                className={styles.formInput}
                                value=""
                                readOnly
                                placeholder="Initializing project..."
                              />
                            </div>
                            <div className={styles.knowledgeFormRow}>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>
                                  Project Description <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <div className={styles.customDropdown} style={{ maxWidth: '320px', width: '100%' }}>
                                  <button
                                    type="button"
                                    className={styles.customDropdownTrigger}
                                    disabled
                                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                  >
                                    <span className={styles.dropdownValue}>Add description...</span>
                                    <svg 
                                      className={styles.dropdownArrow}
                                      width="22" 
                                      height="22" 
                                      viewBox="0 0 24 24" 
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path 
                                        d="M7 10L12 15L17 10" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        fill="none"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>Work Experience</label>
                                <div className={styles.customDropdown} style={{ maxWidth: '320px', width: '100%' }}>
                                  <button
                                    type="button"
                                    className={styles.customDropdownTrigger}
                                    disabled
                                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                  >
                                    <span className={styles.dropdownValue}>Select Work Experience</span>
                                    <svg 
                                      className={styles.dropdownArrow}
                                      width="22" 
                                      height="22" 
                                      viewBox="0 0 24 24" 
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path 
                                        d="M7 10L12 15L17 10" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        fill="none"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className={styles.knowledgeFormRow}>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>Technologies</label>
                                <button
                                  type="button"
                                  className={styles.industryButton}
                                  disabled
                                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                  <span className={styles.industryButtonText}>Select Technologies</span>
                                  <svg 
                                    className={styles.industryButtonIcon}
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path 
                                      d="M9 18L15 12L9 6" 
                                      stroke="currentColor" 
                                      strokeWidth="2.5" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>Framework & Tools</label>
                                <button
                                  type="button"
                                  className={styles.industryButton}
                                  disabled
                                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                  <span className={styles.industryButtonText}>Select Framework & Tools</span>
                                  <svg 
                                    className={styles.industryButtonIcon}
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path 
                                      d="M9 18L15 12L9 6" 
                                      stroke="currentColor" 
                                      strokeWidth="2.5" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className={styles.knowledgeFormRow}>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>Start Date</label>
                                <div className={styles.dateRow}>
                                  <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                    <div className={styles.customDropdownTrigger} style={{ cursor: 'not-allowed' }}>
                                      <span className={styles.dropdownValue}>Month</span>
                                    </div>
                                  </div>
                                  <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                    <div className={styles.customDropdownTrigger} style={{ cursor: 'not-allowed' }}>
                                      <span className={styles.dropdownValue}>Year</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>End Date</label>
                                <div className={styles.dateRow}>
                                  <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                    <div className={styles.customDropdownTrigger} style={{ cursor: 'not-allowed' }}>
                                      <span className={styles.dropdownValue}>Month</span>
                                    </div>
                                  </div>
                                  <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                    <div className={styles.customDropdownTrigger} style={{ cursor: 'not-allowed' }}>
                                      <span className={styles.dropdownValue}>Year</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {activeExpertiseStep === 'Technical Skill Focus' && (
                      <div className={styles.profilePanelSection}>
                        {showEstablishedSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {!isCareerFocusSelected ? (
                          <div className={styles.careerFocusRequiredMessage}>
                            <div className={styles.careerFocusRequiredIcon}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                              </svg>
                            </div>
                            <h3 className={styles.careerFocusRequiredTitle}>Career Focus Required</h3>
                            <p className={styles.careerFocusRequiredText}>
                              Please select your Career Focus in the Profile section first to access the Technical Skill Focus options.
                            </p>
                            <button
                              type="button"
                              className={styles.careerFocusRequiredButton}
                              onClick={() => setActiveSection('profile')}
                            >
                              Go to Profile
                            </button>
                          </div>
                        ) : (
                        <>
                        {/* Legend explaining the three states */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          gap: '2rem', 
                          marginBottom: '1.5rem',
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, rgba(250, 248, 244, 0.9) 0%, rgba(245, 242, 235, 0.95) 100%)',
                          borderRadius: '12px',
                          border: '1px solid rgba(214, 191, 154, 0.3)',
                          maxWidth: '600px',
                          margin: '0 auto 1.5rem auto'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: 'linear-gradient(135deg, rgba(255, 245, 220, 0.9) 0%, rgba(255, 238, 200, 0.85) 100%)',
                              border: '2px solid rgba(230, 197, 131, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#5a5248', fontWeight: 500 }}>Current Skills</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: 'linear-gradient(135deg, rgba(240, 235, 255, 0.95) 0%, rgba(230, 220, 250, 0.9) 100%)',
                              border: '2px solid rgba(168, 140, 220, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="16" height="14" viewBox="0 0 28 24" fill="none">
                                <path d="M14 6L6 14L2 10" stroke="#7c5daf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M26 6L15 17L11 13" stroke="#7c5daf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#5a4878', fontWeight: 500 }}>Future Goals</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: 'linear-gradient(135deg, #ffffff 0%, #faf8f4 100%)',
                              border: '2px solid rgba(214, 191, 154, 0.4)'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#888', fontWeight: 500 }}>Not Selected</span>
                          </div>
                        </div>
                        <p style={{ 
                          textAlign: 'center', 
                          color: '#888', 
                          fontSize: '0.875rem', 
                          marginBottom: '1.5rem',
                          fontStyle: 'italic'
                        }}>
                          Click once to mark as current skill, click again for future goal, click third time to deselect
                        </p>
                        <div className={styles.technologySectionsContainer} style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                          {Object.entries(technicalSkillFocusSections).map(([sectionName, options]) => {
                            // Count Technical Skill Focus selections
                            const sectionTechnicalCount = options.filter(opt => {
                              if (opt === 'Other') {
                                return selectedTechnicalSkills.includes(`Other_${sectionName}`);
                              }
                              return selectedTechnicalSkills.includes(opt);
                            }).length;
                            // Count Future Technical Skills selections
                            const sectionFutureCount = options.filter(opt => {
                              if (opt === 'Other') {
                                return selectedFutureTechnicalSkills.includes(`Other_${sectionName}`);
                              }
                              return selectedFutureTechnicalSkills.includes(opt);
                            }).length;
                            const customKeywordsForSection = customTechnicalSkillKeywords[sectionName] || [];
                            const customTechnicalKeywordsCount = customKeywordsForSection.filter(k => selectedTechnicalSkills.includes(k)).length;
                            const customFutureKeywordsCount = customKeywordsForSection.filter(k => selectedFutureTechnicalSkills.includes(k)).length;
                            const totalTechnical = sectionTechnicalCount + customTechnicalKeywordsCount;
                            const totalFuture = sectionFutureCount + customFutureKeywordsCount;
                            const totalSelected = totalTechnical + totalFuture;
                            // If section has no selected items, default to collapsed; otherwise default to expanded
                            const isExpanded = expandedTechnicalSkillSections[sectionName] !== undefined 
                              ? expandedTechnicalSkillSections[sectionName] 
                              : totalSelected > 0;
                            return (
                              <div 
                                key={sectionName} 
                                className={styles.technologySection}
                                style={{ 
                                  border: isExpanded ? '2px solid rgba(214, 191, 154, 0.3)' : 'none',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setExpandedTechnicalSkillSections(prev => ({
                                    ...prev,
                                    [sectionName]: !isExpanded
                                  }));
                                }}
                              >
                                <div 
                                  className={styles.sectionHeader}
                                  style={{
                                    borderBottom: isExpanded ? '2px solid rgba(214, 191, 154, 0.2)' : 'none'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      style={{
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease'
                                      }}
                                    >
                                      <path
                                        d="M9 18L15 12L9 6"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                  </div>
                                  <div className={styles.sectionHeaderRight}>
                                    <span className={styles.sectionCount}>
                                      {totalTechnical > 0 && <span style={{ color: '#9b6a10' }}>{totalTechnical} current</span>}
                                      {totalTechnical > 0 && totalFuture > 0 && <span style={{ margin: '0 4px', color: '#888' }}>·</span>}
                                      {totalFuture > 0 && <span style={{ color: '#7c5daf' }}>{totalFuture} future</span>}
                                      {totalTechnical === 0 && totalFuture === 0 && '0 selected'}
                                    </span>
                                    {(totalSelected > 0) && (
                                      <button
                                        type="button"
                                        className={styles.sectionClearButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const sectionOtherKey = `Other_${sectionName}`;
                                          const sectionCustomKeywords = customTechnicalSkillKeywords[sectionName] || [];
                                          const sectionOptions = [...options]; // Capture current section options
                                          markEstablishedDirty();
                                          markExpandingDirty();
                                          // Clear from Technical Skills
                                          setSelectedTechnicalSkills(prev =>
                                            prev.filter(t => 
                                              !sectionOptions.includes(t) && 
                                              t !== sectionOtherKey &&
                                              !sectionCustomKeywords.includes(t)
                                            )
                                          );
                                          // Clear from Future Technical Skills
                                          setSelectedFutureTechnicalSkills(prev =>
                                            prev.filter(t => 
                                              !sectionOptions.includes(t) && 
                                              t !== sectionOtherKey &&
                                              !sectionCustomKeywords.includes(t)
                                            )
                                          );
                                          setCustomTechnicalSkillKeywords(prev => {
                                            const updated = { ...prev };
                                            delete updated[sectionName];
                                            return updated;
                                          });
                                          setIsShowingCustomTechnicalSkillKeywordInput(prev => {
                                            const updated = { ...prev };
                                            delete updated[sectionName];
                                            return updated;
                                          });
                                          setCustomTechnicalSkillKeywordInputValue(prev => {
                                            const updated = { ...prev };
                                            delete updated[sectionName];
                                            return updated;
                                          });
                                        }}
                                        aria-label={`Clear all selected items in ${sectionName}`}
                                        title="Clear all selections in this section"
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {isExpanded && (
                                  <>
                                <div className={styles.sectionItems} onClick={(e) => e.stopPropagation()}>
                                  {options.map((option) => {
                                    const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                    const isSelectedTechnical = selectedTechnicalSkills.includes(optionKey);
                                    const isSelectedFuture = selectedFutureTechnicalSkills.includes(optionKey);
                                    const isOther = option === 'Other';
                                    
                                    // Don't render "Other" button here - it will be shown at the end
                                    if (isOther) {
                                      return null;
                                    }
                                    
                                    // Determine item class based on state
                                    const itemClass = isSelectedFuture 
                                      ? `${styles.technologyItem} ${styles.technologyItemFuture}`
                                      : isSelectedTechnical 
                                        ? `${styles.technologyItem} ${styles.technologyItemSelected}`
                                        : styles.technologyItem;
                                    
                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        className={itemClass}
                                        onClick={() => {
                                          markEstablishedDirty();
                                          markExpandingDirty();
                                          // Three-state toggle: unchecked -> technical -> future -> unchecked
                                          if (isSelectedFuture) {
                                            // Currently future, go to unchecked
                                            setSelectedFutureTechnicalSkills(prev => prev.filter(t => t !== optionKey));
                                          } else if (isSelectedTechnical) {
                                            // Currently technical, go to future
                                            setSelectedTechnicalSkills(prev => prev.filter(t => t !== optionKey));
                                            setSelectedFutureTechnicalSkills(prev => [...prev, optionKey]);
                                          } else {
                                            // Currently unchecked, go to technical
                                            setSelectedTechnicalSkills(prev => [...prev, optionKey]);
                                          }
                                        }}
                                      >
                                        <span className={styles.technologyItemText}>{option}</span>
                                        {isSelectedTechnical && !isSelectedFuture && (
                                          <svg
                                            className={styles.technologyCheckmark}
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M20 6L9 17L4 12"
                                              stroke="currentColor"
                                              strokeWidth="3"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                        {isSelectedFuture && (
                                          <svg
                                            className={styles.technologyDoubleCheckmark}
                                            width="24"
                                            height="20"
                                            viewBox="0 0 28 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M14 6L6 14L2 10"
                                              stroke="currentColor"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <path
                                              d="M26 6L15 17L11 13"
                                              stroke="currentColor"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                                  {(customTechnicalSkillKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                    const isEditing = editingCustomTechnicalSkillKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                    const editValue = editingCustomTechnicalSkillKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                    const isSelectedTechnical = selectedTechnicalSkills.includes(keyword);
                                    const isSelectedFuture = selectedFutureTechnicalSkills.includes(keyword);
                                    
                                    // Determine item class based on state
                                    const itemClass = isSelectedFuture 
                                      ? `${styles.technologyItem} ${styles.technologyItemFuture}`
                                      : isSelectedTechnical 
                                        ? `${styles.technologyItem} ${styles.technologyItemSelected}`
                                        : styles.technologyItem;
                                    
                                    return (
                                      <button
                                        key={`${sectionName}_${keywordIndex}`}
                                        type="button"
                                        className={itemClass}
                                        onClick={() => {
                                          if (!isEditing) {
                                            markEstablishedDirty();
                                            markExpandingDirty();
                                            // Three-state toggle: unchecked -> technical -> future -> unchecked
                                            if (isSelectedFuture) {
                                              // Currently future, go to unchecked
                                              setSelectedFutureTechnicalSkills(prev => prev.filter(t => t !== keyword));
                                            } else if (isSelectedTechnical) {
                                              // Currently technical, go to future
                                              setSelectedTechnicalSkills(prev => prev.filter(t => t !== keyword));
                                              setSelectedFutureTechnicalSkills(prev => [...prev, keyword]);
                                            } else {
                                              // Currently unchecked, go to technical
                                              setSelectedTechnicalSkills(prev => [...prev, keyword]);
                                            }
                                          }
                                        }}
                                        style={{ position: 'relative' }}
                                      >
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => {
                                              setEditingCustomTechnicalSkillKeyword(prev => ({
                                                ...prev,
                                                [`${sectionName}_${keywordIndex}`]: e.target.value
                                              }));
                                            }}
                                            onBlur={() => {
                                              const newValue = editValue.trim();
                                              if (newValue && newValue !== keyword) {
                                                const updatedKeywords = [...(customTechnicalSkillKeywords[sectionName] || [])];
                                                updatedKeywords[keywordIndex] = newValue;
                                                setCustomTechnicalSkillKeywords(prev => ({
                                                  ...prev,
                                                  [sectionName]: updatedKeywords
                                                }));
                                                if (isSelectedTechnical) {
                                                  setSelectedTechnicalSkills(prev => 
                                                    prev.map(t => t === keyword ? newValue : t)
                                                  );
                                                }
                                                if (isSelectedFuture) {
                                                  setSelectedFutureTechnicalSkills(prev => 
                                                    prev.map(t => t === keyword ? newValue : t)
                                                  );
                                                }
                                              }
                                              setEditingCustomTechnicalSkillKeyword(prev => {
                                                const updated = { ...prev };
                                                delete updated[`${sectionName}_${keywordIndex}`];
                                                return updated;
                                              });
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                              } else if (e.key === 'Escape') {
                                                setEditingCustomTechnicalSkillKeyword(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[`${sectionName}_${keywordIndex}`];
                                                  return updated;
                                                });
                                              }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              outline: 'none',
                                              color: 'inherit',
                                              fontSize: 'inherit',
                                              fontWeight: 'inherit',
                                              width: '100%',
                                              textAlign: 'center'
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <>
                                            <span
                                              className={styles.technologyItemText}
                                              onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCustomTechnicalSkillKeyword(prev => ({
                                                  ...prev,
                                                  [`${sectionName}_${keywordIndex}`]: keyword
                                                }));
                                              }}
                                            >
                                              {keyword}
                                            </span>
                                            {isSelectedTechnical && !isSelectedFuture && (
                                              <svg
                                                className={styles.technologyCheckmark}
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="3"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                            {isSelectedFuture && (
                                              <svg
                                                className={styles.technologyDoubleCheckmark}
                                                width="24"
                                                height="20"
                                                viewBox="0 0 28 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M14 6L6 14L2 10"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M26 6L15 17L11 13"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </>
                                        )}
                                      </button>
                                    );
                                  })}
                                  {isShowingCustomTechnicalSkillKeywordInput[sectionName] && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <input
                                        type="text"
                                        className={styles.customKeywordsInput}
                                        placeholder="Enter keyword"
                                        value={customTechnicalSkillKeywordInputValue[sectionName] || ''}
                                        onChange={(e) => {
                                          setCustomTechnicalSkillKeywordInputValue(prev => ({
                                            ...prev,
                                            [sectionName]: e.target.value
                                          }));
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && customTechnicalSkillKeywordInputValue[sectionName]?.trim()) {
                                            e.preventDefault();
                                            const newKeyword = customTechnicalSkillKeywordInputValue[sectionName].trim();
                                            if (!(customTechnicalSkillKeywords[sectionName] || []).includes(newKeyword)) {
                                              markEstablishedDirty();
                                              setCustomTechnicalSkillKeywords(prev => ({
                                                ...prev,
                                                [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                              }));
                                              markEstablishedDirty();
                                              setSelectedTechnicalSkills([...selectedTechnicalSkills, newKeyword]);
                                              setCustomTechnicalSkillKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }
                                          } else if (e.key === 'Escape') {
                                            setIsShowingCustomTechnicalSkillKeywordInput(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                            setCustomTechnicalSkillKeywordInputValue(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                          }
                                        }}
                                        onBlur={() => {
                                          const inputValue = customTechnicalSkillKeywordInputValue[sectionName]?.trim();
                                          if (inputValue) {
                                            const newKeyword = inputValue;
                                            if (!(customTechnicalSkillKeywords[sectionName] || []).includes(newKeyword)) {
                                              setCustomTechnicalSkillKeywords(prev => ({
                                                ...prev,
                                                [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                              }));
                                              setSelectedTechnicalSkills([...selectedTechnicalSkills, newKeyword]);
                                            }
                                            setCustomTechnicalSkillKeywordInputValue(prev => ({
                                              ...prev,
                                              [sectionName]: ''
                                            }));
                                          } else {
                                            setIsShowingCustomTechnicalSkillKeywordInput(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                            setCustomTechnicalSkillKeywordInputValue(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                          }
                                        }}
                                        style={{ maxWidth: '150px', minWidth: '100px' }}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  )}
                                  {options.includes('Other') && (
                                    <button
                                      type="button"
                                      className={styles.technologyItem}
                                      onClick={() => {
                                        setIsShowingCustomTechnicalSkillKeywordInput(prev => ({
                                          ...prev,
                                          [sectionName]: true
                                        }));
                                        setCustomTechnicalSkillKeywordInputValue(prev => ({
                                          ...prev,
                                          [sectionName]: ''
                                        }));
                                      }}
                                    >
                                      <span className={styles.technologyItemText}>+</span>
                                    </button>
                                  )}
                                </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {customTechnicalSkillLayers.map((layer) => {
                            // Count Technical Skill Focus selections
                            const layerTechnicalCount = layer.items.filter(opt => {
                              if (opt === 'Other') {
                                return selectedTechnicalSkills.includes(`Other_${layer.id}`);
                              }
                              return selectedTechnicalSkills.includes(opt);
                            }).length;
                            // Count Future Technical Skills selections
                            const layerFutureCount = layer.items.filter(opt => {
                              if (opt === 'Other') {
                                return selectedFutureTechnicalSkills.includes(`Other_${layer.id}`);
                              }
                              return selectedFutureTechnicalSkills.includes(opt);
                            }).length;
                            const customKeywordsForSection = customTechnicalSkillKeywords[layer.id] || [];
                            const customTechnicalKeywordsCount = customKeywordsForSection.filter(k => selectedTechnicalSkills.includes(k)).length;
                            const customFutureKeywordsCount = customKeywordsForSection.filter(k => selectedFutureTechnicalSkills.includes(k)).length;
                            const totalTechnical = layerTechnicalCount + customTechnicalKeywordsCount;
                            const totalFuture = layerFutureCount + customFutureKeywordsCount;
                            const totalSelected = totalTechnical + totalFuture;
                            const isExpanded = expandedTechnicalSkillSections[layer.id] !== undefined 
                              ? expandedTechnicalSkillSections[layer.id] 
                              : totalSelected > 0;
                            return (
                              <div 
                                key={layer.id} 
                                className={styles.technologySection}
                                style={{ 
                                  border: isExpanded ? '2px solid rgba(214, 191, 154, 0.3)' : 'none',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setExpandedTechnicalSkillSections(prev => ({
                                    ...prev,
                                    [layer.id]: !isExpanded
                                  }));
                                }}
                              >
                                <div 
                                  className={styles.sectionHeader}
                                  style={{
                                    borderBottom: isExpanded ? '2px solid rgba(214, 191, 154, 0.2)' : 'none'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      style={{
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease'
                                      }}
                                    >
                                      <path
                                        d="M9 18L15 12L9 6"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <h4 className={styles.sectionTitle}>{layer.title}</h4>
                                  </div>
                                  <div className={styles.sectionHeaderRight}>
                                    <span className={styles.sectionCount}>
                                      {totalTechnical > 0 && <span style={{ color: '#9b6a10' }}>{totalTechnical} current</span>}
                                      {totalTechnical > 0 && totalFuture > 0 && <span style={{ margin: '0 4px', color: '#888' }}>·</span>}
                                      {totalFuture > 0 && <span style={{ color: '#7c5daf' }}>{totalFuture} future</span>}
                                      {totalTechnical === 0 && totalFuture === 0 && '0 selected'}
                                    </span>
                                    <button
                                      type="button"
                                      className={styles.sectionClearButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markEstablishedDirty();
                                        markExpandingDirty();
                                        const layerItems = [...layer.items]; // Capture current layer items
                                        setCustomTechnicalSkillLayers(prev => prev.filter(l => l.id !== layer.id));
                                        const sectionOtherKey = `Other_${layer.id}`;
                                        const sectionCustomKeywords = customTechnicalSkillKeywords[layer.id] || [];
                                        // Clear from Technical Skills
                                        setSelectedTechnicalSkills(prev =>
                                          prev.filter(t => 
                                            !layerItems.includes(t) && 
                                            t !== sectionOtherKey &&
                                            !sectionCustomKeywords.includes(t)
                                          )
                                        );
                                        // Clear from Future Technical Skills
                                        setSelectedFutureTechnicalSkills(prev =>
                                          prev.filter(t => 
                                            !layerItems.includes(t) && 
                                            t !== sectionOtherKey &&
                                            !sectionCustomKeywords.includes(t)
                                          )
                                        );
                                        setCustomTechnicalSkillKeywords(prev => {
                                          const updated = { ...prev };
                                          delete updated[layer.id];
                                          return updated;
                                        });
                                        setIsShowingCustomTechnicalSkillKeywordInput(prev => {
                                          const updated = { ...prev };
                                          delete updated[layer.id];
                                          return updated;
                                        });
                                        setCustomTechnicalSkillKeywordInputValue(prev => {
                                          const updated = { ...prev };
                                          delete updated[layer.id];
                                          return updated;
                                        });
                                      }}
                                      aria-label={`Delete layer ${layer.title}`}
                                      title="Delete this layer"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
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
                                  </div>
                                </div>
                                {isExpanded && (
                                  <>
                                    <div className={styles.sectionItems} onClick={(e) => e.stopPropagation()}>
                                      {layer.items.map((option) => {
                                        const optionKey = option === 'Other' ? `Other_${layer.id}` : option;
                                        const isSelectedTechnical = selectedTechnicalSkills.includes(optionKey);
                                        const isSelectedFuture = selectedFutureTechnicalSkills.includes(optionKey);
                                        const isOther = option === 'Other';
                                        
                                        // Don't render "Other" button here - it will be shown at the end
                                        if (isOther) {
                                          return null;
                                        }
                                        
                                        // Determine item class based on state
                                        const itemClass = isSelectedFuture 
                                          ? `${styles.technologyItem} ${styles.technologyItemFuture}`
                                          : isSelectedTechnical 
                                            ? `${styles.technologyItem} ${styles.technologyItemSelected}`
                                            : styles.technologyItem;
                                        
                                        return (
                                          <button
                                            key={option}
                                            type="button"
                                            className={itemClass}
                                            onClick={() => {
                                              markEstablishedDirty();
                                              markExpandingDirty();
                                              // Three-state toggle: unchecked -> technical -> future -> unchecked
                                              if (isSelectedFuture) {
                                                // Currently future, go to unchecked
                                                setSelectedFutureTechnicalSkills(prev => prev.filter(t => t !== optionKey));
                                              } else if (isSelectedTechnical) {
                                                // Currently technical, go to future
                                                setSelectedTechnicalSkills(prev => prev.filter(t => t !== optionKey));
                                                setSelectedFutureTechnicalSkills(prev => [...prev, optionKey]);
                                              } else {
                                                // Currently unchecked, go to technical
                                                setSelectedTechnicalSkills(prev => [...prev, optionKey]);
                                              }
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>{option}</span>
                                            {isSelectedTechnical && !isSelectedFuture && (
                                              <svg
                                                className={styles.technologyCheckmark}
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="3"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                            {isSelectedFuture && (
                                              <svg
                                                className={styles.technologyDoubleCheckmark}
                                                width="24"
                                                height="20"
                                                viewBox="0 0 28 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M14 6L6 14L2 10"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M26 6L15 17L11 13"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </button>
                                        );
                                      })}
                                      {(customTechnicalSkillKeywords[layer.id] || []).map((keyword, keywordIndex) => {
                                        const isEditing = editingCustomTechnicalSkillKeyword[`${layer.id}_${keywordIndex}`] !== undefined;
                                        const editValue = editingCustomTechnicalSkillKeyword[`${layer.id}_${keywordIndex}`] ?? keyword;
                                        const isSelectedTechnical = selectedTechnicalSkills.includes(keyword);
                                        const isSelectedFuture = selectedFutureTechnicalSkills.includes(keyword);
                                        
                                        // Determine item class based on state
                                        const itemClass = isSelectedFuture 
                                          ? `${styles.technologyItem} ${styles.technologyItemFuture}`
                                          : isSelectedTechnical 
                                            ? `${styles.technologyItem} ${styles.technologyItemSelected}`
                                            : styles.technologyItem;
                                        
                                        return (
                                          <button
                                            key={`${layer.id}_${keywordIndex}`}
                                            type="button"
                                            className={itemClass}
                                            onClick={() => {
                                              if (!isEditing) {
                                                markEstablishedDirty();
                                                markExpandingDirty();
                                                // Three-state toggle: unchecked -> technical -> future -> unchecked
                                                if (isSelectedFuture) {
                                                  // Currently future, go to unchecked
                                                  setSelectedFutureTechnicalSkills(prev => prev.filter(t => t !== keyword));
                                                } else if (isSelectedTechnical) {
                                                  // Currently technical, go to future
                                                  setSelectedTechnicalSkills(prev => prev.filter(t => t !== keyword));
                                                  setSelectedFutureTechnicalSkills(prev => [...prev, keyword]);
                                                } else {
                                                  // Currently unchecked, go to technical
                                                  setSelectedTechnicalSkills(prev => [...prev, keyword]);
                                                }
                                              }
                                            }}
                                            style={{ position: 'relative' }}
                                          >
                                            {isEditing ? (
                                              <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => {
                                                  setEditingCustomTechnicalSkillKeyword(prev => ({
                                                    ...prev,
                                                    [`${layer.id}_${keywordIndex}`]: e.target.value
                                                  }));
                                                }}
                                                onBlur={() => {
                                                  const newValue = editValue.trim();
                                                  if (newValue && newValue !== keyword) {
                                                    const updatedKeywords = [...(customTechnicalSkillKeywords[layer.id] || [])];
                                                    updatedKeywords[keywordIndex] = newValue;
                                                    setCustomTechnicalSkillKeywords(prev => ({
                                                      ...prev,
                                                      [layer.id]: updatedKeywords
                                                    }));
                                                    if (isSelectedTechnical) {
                                                      setSelectedTechnicalSkills(prev => 
                                                        prev.map(t => t === keyword ? newValue : t)
                                                      );
                                                    }
                                                    if (isSelectedFuture) {
                                                      setSelectedFutureTechnicalSkills(prev => 
                                                        prev.map(t => t === keyword ? newValue : t)
                                                      );
                                                    }
                                                  }
                                                  setEditingCustomTechnicalSkillKeyword(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[`${layer.id}_${keywordIndex}`];
                                                    return updated;
                                                  });
                                                }}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    e.currentTarget.blur();
                                                  } else if (e.key === 'Escape') {
                                                    setEditingCustomTechnicalSkillKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${layer.id}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                  background: 'transparent',
                                                  border: 'none',
                                                  outline: 'none',
                                                  color: 'inherit',
                                                  fontSize: 'inherit',
                                                  fontWeight: 'inherit',
                                                  width: '100%',
                                                  textAlign: 'center'
                                                }}
                                                autoFocus
                                              />
                                            ) : (
                                              <>
                                                <span
                                                  className={styles.technologyItemText}
                                                  onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCustomTechnicalSkillKeyword(prev => ({
                                                      ...prev,
                                                      [`${layer.id}_${keywordIndex}`]: keyword
                                                    }));
                                                  }}
                                                >
                                                  {keyword}
                                                </span>
                                                {isSelectedTechnical && !isSelectedFuture && (
                                                  <svg
                                                    className={styles.technologyCheckmark}
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <path
                                                      d="M20 6L9 17L4 12"
                                                      stroke="currentColor"
                                                      strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                  </svg>
                                                )}
                                                {isSelectedFuture && (
                                                  <svg
                                                    className={styles.technologyDoubleCheckmark}
                                                    width="24"
                                                    height="20"
                                                    viewBox="0 0 28 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <path
                                                      d="M14 6L6 14L2 10"
                                                      stroke="currentColor"
                                                      strokeWidth="2.5"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                    <path
                                                      d="M26 6L15 17L11 13"
                                                      stroke="currentColor"
                                                      strokeWidth="2.5"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                  </svg>
                                                )}
                                              </>
                                            )}
                                          </button>
                                        );
                                      })}
                                      {isShowingCustomTechnicalSkillKeywordInput[layer.id] && (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <input
                                            type="text"
                                            className={styles.customKeywordsInput}
                                            placeholder="Enter keyword"
                                            value={customTechnicalSkillKeywordInputValue[layer.id] || ''}
                                            onChange={(e) => {
                                              setCustomTechnicalSkillKeywordInputValue(prev => ({
                                                ...prev,
                                                [layer.id]: e.target.value
                                              }));
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && customTechnicalSkillKeywordInputValue[layer.id]?.trim()) {
                                                e.preventDefault();
                                                const newKeyword = customTechnicalSkillKeywordInputValue[layer.id].trim();
                                                if (!(customTechnicalSkillKeywords[layer.id] || []).includes(newKeyword)) {
                                                  markEstablishedDirty();
                                                  setCustomTechnicalSkillKeywords(prev => ({
                                                    ...prev,
                                                    [layer.id]: [...(prev[layer.id] || []), newKeyword]
                                                  }));
                                                  markEstablishedDirty();
                                                  setSelectedTechnicalSkills([...selectedTechnicalSkills, newKeyword]);
                                                  setCustomTechnicalSkillKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [layer.id]: ''
                                                  }));
                                                }
                                              } else if (e.key === 'Escape') {
                                                setIsShowingCustomTechnicalSkillKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                                setCustomTechnicalSkillKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                              }
                                            }}
                                            onBlur={() => {
                                              const inputValue = customTechnicalSkillKeywordInputValue[layer.id]?.trim();
                                              if (inputValue) {
                                                const newKeyword = inputValue;
                                                if (!(customTechnicalSkillKeywords[layer.id] || []).includes(newKeyword)) {
                                                  setCustomTechnicalSkillKeywords(prev => ({
                                                    ...prev,
                                                    [layer.id]: [...(prev[layer.id] || []), newKeyword]
                                                  }));
                                                  setSelectedTechnicalSkills([...selectedTechnicalSkills, newKeyword]);
                                                }
                                                setCustomTechnicalSkillKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [layer.id]: ''
                                                }));
                                              } else {
                                                setIsShowingCustomTechnicalSkillKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                                setCustomTechnicalSkillKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                              }
                                            }}
                                            style={{ maxWidth: '150px', minWidth: '100px' }}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                      {layer.items.includes('Other') && (
                                        <button
                                          type="button"
                                          className={styles.technologyItem}
                                          onClick={() => {
                                            setIsShowingCustomTechnicalSkillKeywordInput(prev => ({
                                              ...prev,
                                              [layer.id]: true
                                            }));
                                            setCustomTechnicalSkillKeywordInputValue(prev => ({
                                              ...prev,
                                              [layer.id]: ''
                                            }));
                                          }}
                                        >
                                          <span className={styles.technologyItemText}>+</span>
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {isAddingNewLayer && (
                            <div className={styles.technologySection} style={{ border: '2px dashed rgba(214, 191, 154, 0.5)', background: 'rgba(255, 255, 255, 0.5)' }}>
                              <div className={styles.sectionHeader}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                  <input
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="Enter layer title (e.g., Architecture & System Design)"
                                    value={newLayerTitle}
                                    onChange={(e) => setNewLayerTitle(e.target.value)}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                  />
                                  <textarea
                                    className={styles.formInput}
                                    placeholder="Enter items (one per line or comma-separated)"
                                    value={newLayerItems}
                                    onChange={(e) => setNewLayerItems(e.target.value)}
                                    rows={4}
                                    style={{ width: '100%', resize: 'vertical' }}
                                  />
                                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                      type="button"
                                      className={styles.nextButton}
                                      onClick={() => {
                                        setIsAddingNewLayer(false);
                                        setNewLayerTitle('');
                                        setNewLayerItems('');
                                      }}
                                    >
                                      <span className={styles.nextButtonText}>Cancel</span>
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.nextButton}
                                      onClick={() => {
                                        if (newLayerTitle.trim() && newLayerItems.trim()) {
                                          const items = newLayerItems
                                            .split(/[,\n]/)
                                            .map(item => item.trim())
                                            .filter(item => item.length > 0);
                                          if (items.length > 0) {
                                            const newLayer = {
                                              id: `custom-layer-${Date.now()}-${Math.random()}`,
                                              title: newLayerTitle.trim(),
                                              items: [...items, 'Other']
                                            };
                                            markEstablishedDirty();
                                            setCustomTechnicalSkillLayers([...customTechnicalSkillLayers, newLayer]);
                                            setIsAddingNewLayer(false);
                                            setNewLayerTitle('');
                                            setNewLayerItems('');
                                          }
                                        }
                                      }}
                                    >
                                      <span className={styles.nextButtonText}>Add Section</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <button
                            type="button"
                            className={styles.addCollegeButton}
                            onClick={() => {
                              setIsAddingNewLayer(true);
                            }}
                            aria-label="Add Technical Section"
                          >
                            <span className={styles.addButtonIcon}>+</span>
                            <span className={styles.addButtonText}>Add Technical Section</span>
                          </button>
                        </div>
                        </>
                        )}
                        <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                          <button
                            type="button"
                            className={styles.nextButton}
                            onClick={async () => {
                              // Save established expertise if dirty before navigating
                              if (establishedFormState === 'established_dirty') {
                                await handleKnowledgeSubmit();
                              }
                              setActiveExpertiseStep('Professional Project');
                            }}
                            aria-label="Back to Professional Project"
                          >
                            <svg 
                              className={styles.nextButtonIcon}
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ transform: 'rotate(180deg)' }}
                            >
                              <path 
                                d="M9 18L15 12L9 6" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className={styles.nextButtonText}>Back</span>
                          </button>
                          <button
                            type="button"
                            className={styles.nextButton}
                            onClick={async () => {
                              // Save established expertise if dirty before navigating
                              if (establishedFormState === 'established_dirty') {
                                await handleKnowledgeSubmit();
                                if (establishedAutoSaveTimerRef.current) {
                                  clearTimeout(establishedAutoSaveTimerRef.current);
                                  establishedAutoSaveTimerRef.current = null;
                                }
                              }
                              // Navigate to Expanding Knowledge Base first page
                              setShowEstablishedExpertise(false);
                              setShowExpandingKnowledgeBase(true);
                              setActiveExpandingKnowledgeStep('Future Personal Project');
                            }}
                            aria-label="Edit Expanding Knowledge Base"
                          >
                            <span className={styles.nextButtonText}>Edit Expanding Knowledge Base</span>
                            <svg 
                              className={styles.nextButtonIcon}
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M5 12H19M19 12L12 5M19 12L12 19" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeSection === 'knowledge' && showExpandingKnowledgeBase && (
                <>
                  <div className={styles.resumeSectionHeader}>
                    <button
                      type="button"
                      className={`${styles.backButton} ${styles.resumeTopBackButton}`}
                      onClick={() => setShowExpandingKnowledgeBase(false)}
                      aria-label="Back to Knowledge Asset"
                    >
                      <svg
                        className={styles.backButtonIcon}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 12H5M12 19L5 12L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.profileStepsContainer}>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBar}
                        style={{
                          width: expandingKnowledgeSteps.indexOf(activeExpandingKnowledgeStep) === 0 
                            ? '0%' 
                            : `${(expandingKnowledgeSteps.indexOf(activeExpandingKnowledgeStep) / (expandingKnowledgeSteps.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    <ul className={styles.profileSteps}>
                      {expandingKnowledgeSteps.map((step, idx) => {
                        const currentIdx = expandingKnowledgeSteps.indexOf(activeExpandingKnowledgeStep);
                        const isActive = idx === currentIdx;
                        const isCompleted = isExpandingKnowledgeStepCompleted(step);
                        const shouldShowActiveStyle = isActive || isCompleted;
                        return (
                          <li
                            key={step}
                            className={`${styles.profileStep} ${shouldShowActiveStyle ? styles.profileStepActive : ''} ${isActive ? styles.profileStepCurrent : ''}`}
                          >
                            <button
                              type="button"
                              className={styles.profileStepButton}
                              disabled={!isActive && !isCompleted}
                              onClick={() => {
                                if (isActive || isCompleted) {
                                  setActiveExpandingKnowledgeStep(step);
                                }
                              }}
                              aria-label={step}
                            >
                              <span className={styles.profileStepIndex}>{idx + 1}</span>
                              <span className={styles.profileStepLabel}>{step}</span>
                            </button>
                            {step === 'Future Personal Project' && isActive && futurePersonalProjects.length > 1 && (futurePersonalProjects.length <= 4 || isTransitioningToTagsFuture) && (
                              <div className={`${styles.subPanelDots} ${(futurePersonalProjects.length > 4 || isTransitioningToTagsFuture) ? styles.subPanelDotsExiting : ''}`} style={{ cursor: draggedFuturePersonalProjectDotIndex !== null ? 'grabbing' : 'default' }}>
                                {futurePersonalProjects.map((project, projectIdx) => (
                                  <button
                                    key={project.id}
                                    ref={(el) => { futurePersonalProjectDotRefs.current[projectIdx] = el; }}
                                    type="button"
                                    draggable={futurePersonalProjects.length > 1}
                                    className={`${styles.subPanelDot} ${activeFuturePersonalProjectSubPanel === projectIdx + 1 ? styles.subPanelDotActive : ''} ${draggedFuturePersonalProjectDotIndex === projectIdx ? styles.subPanelDotDragging : ''} ${draggedOverFuturePersonalProjectDotIndex === projectIdx ? styles.subPanelDotDragOver : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFuturePersonalProjectSubPanel(projectIdx + 1);
                                      setFocusedElement('dot');
                                    }}
                                    onDragStart={(e) => {
                                      setDraggedFuturePersonalProjectDotIndex(projectIdx);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', projectIdx.toString());
                                      const dragImage = document.createElement('div');
                                      dragImage.style.position = 'absolute';
                                      dragImage.style.top = '-1000px';
                                      dragImage.style.width = '18px';
                                      dragImage.style.height = '18px';
                                      document.body.appendChild(dragImage);
                                      e.dataTransfer.setDragImage(dragImage, 9, 9);
                                      setTimeout(() => document.body.removeChild(dragImage), 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (draggedFuturePersonalProjectDotIndex !== null && draggedFuturePersonalProjectDotIndex !== projectIdx) {
                                        setDraggedOverFuturePersonalProjectDotIndex(projectIdx);
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDraggedOverFuturePersonalProjectDotIndex(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const draggedIndex = draggedFuturePersonalProjectDotIndex;
                                      const dropIndex = projectIdx;
                                      
                                      if (draggedIndex !== null && draggedIndex !== dropIndex) {
                                        const newProjects = [...futurePersonalProjects];
                                        const [draggedProject] = newProjects.splice(draggedIndex, 1);
                                        newProjects.splice(dropIndex, 0, draggedProject);
                                        
                                        markExpandingDirty();
                                        setFuturePersonalProjects(newProjects);
                                        
                                        if (activeFuturePersonalProjectSubPanel === draggedIndex + 1) {
                                          setActiveFuturePersonalProjectSubPanel(dropIndex + 1);
                                        } else if (activeFuturePersonalProjectSubPanel === dropIndex + 1) {
                                          setActiveFuturePersonalProjectSubPanel(draggedIndex + 1);
                                        } else if (draggedIndex < activeFuturePersonalProjectSubPanel - 1 && dropIndex >= activeFuturePersonalProjectSubPanel - 1) {
                                          setActiveFuturePersonalProjectSubPanel(activeFuturePersonalProjectSubPanel - 1);
                                        } else if (draggedIndex > activeFuturePersonalProjectSubPanel - 1 && dropIndex < activeFuturePersonalProjectSubPanel - 1) {
                                          setActiveFuturePersonalProjectSubPanel(activeFuturePersonalProjectSubPanel + 1);
                                        }
                                      }
                                      
                                      setDraggedFuturePersonalProjectDotIndex(null);
                                      setDraggedOverFuturePersonalProjectDotIndex(null);
                                    }}
                                    onDragEnd={(e) => {
                                      setDraggedPersonalProjectDotIndex(null);
                                      setDraggedOverPersonalProjectDotIndex(null);
                                    }}
                                    onFocus={() => {
                                      setFocusedElement('dot');
                                    }}
                                    tabIndex={activePersonalProjectSubPanel === projectIdx + 1 ? 0 : -1}
                                    aria-label={`Future Personal Project ${projectIdx + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                            {step === 'Future Professional Project' && isActive && futureProfessionalProjects.length > 1 && (futureProfessionalProjects.length <= 4 || isTransitioningToTagsFutureProfessional) && (
                              <div className={`${styles.subPanelDots} ${(futureProfessionalProjects.length > 4 || isTransitioningToTagsFutureProfessional) ? styles.subPanelDotsExiting : ''}`} style={{ cursor: draggedFutureProfessionalProjectDotIndex !== null ? 'grabbing' : 'default' }}>
                                {futureProfessionalProjects.map((project, projectIdx) => (
                                  <button
                                    key={project.id}
                                    ref={(el) => { futureProfessionalProjectDotRefs.current[projectIdx] = el; }}
                                    type="button"
                                    draggable={futureProfessionalProjects.length > 1}
                                    className={`${styles.subPanelDot} ${activeFutureProfessionalProjectSubPanel === projectIdx + 1 ? styles.subPanelDotActive : ''} ${draggedFutureProfessionalProjectDotIndex === projectIdx ? styles.subPanelDotDragging : ''} ${draggedOverFutureProfessionalProjectDotIndex === projectIdx ? styles.subPanelDotDragOver : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFutureProfessionalProjectSubPanel(projectIdx + 1);
                                      setFocusedElement('dot');
                                    }}
                                    onDragStart={(e) => {
                                      setDraggedFutureProfessionalProjectDotIndex(projectIdx);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', projectIdx.toString());
                                      const dragImage = document.createElement('div');
                                      dragImage.style.position = 'absolute';
                                      dragImage.style.top = '-1000px';
                                      dragImage.style.width = '18px';
                                      dragImage.style.height = '18px';
                                      document.body.appendChild(dragImage);
                                      e.dataTransfer.setDragImage(dragImage, 9, 9);
                                      setTimeout(() => document.body.removeChild(dragImage), 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (draggedFutureProfessionalProjectDotIndex !== null && draggedFutureProfessionalProjectDotIndex !== projectIdx) {
                                        setDraggedOverFutureProfessionalProjectDotIndex(projectIdx);
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDraggedOverFutureProfessionalProjectDotIndex(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const draggedIndex = draggedFutureProfessionalProjectDotIndex;
                                      const dropIndex = projectIdx;
                                      
                                      if (draggedIndex !== null && draggedIndex !== dropIndex) {
                                        const newProjects = [...futureProfessionalProjects];
                                        const [draggedProject] = newProjects.splice(draggedIndex, 1);
                                        newProjects.splice(dropIndex, 0, draggedProject);
                                        
                                        markExpandingDirty();
                                        setFutureProfessionalProjects(newProjects);
                                        
                                        if (activeFutureProfessionalProjectSubPanel === draggedIndex + 1) {
                                          setActiveFutureProfessionalProjectSubPanel(dropIndex + 1);
                                        } else if (activeFutureProfessionalProjectSubPanel === dropIndex + 1) {
                                          setActiveFutureProfessionalProjectSubPanel(draggedIndex + 1);
                                        } else if (draggedIndex < activeFutureProfessionalProjectSubPanel - 1 && dropIndex >= activeFutureProfessionalProjectSubPanel - 1) {
                                          setActiveFutureProfessionalProjectSubPanel(activeFutureProfessionalProjectSubPanel - 1);
                                        } else if (draggedIndex > activeFutureProfessionalProjectSubPanel - 1 && dropIndex < activeFutureProfessionalProjectSubPanel - 1) {
                                          setActiveFutureProfessionalProjectSubPanel(activeFutureProfessionalProjectSubPanel + 1);
                                        }
                                      }
                                      
                                      setDraggedFutureProfessionalProjectDotIndex(null);
                                      setDraggedOverFutureProfessionalProjectDotIndex(null);
                                    }}
                                    onDragEnd={(e) => {
                                      setDraggedFutureProfessionalProjectDotIndex(null);
                                      setDraggedOverFutureProfessionalProjectDotIndex(null);
                                    }}
                                    onFocus={() => {
                                      setFocusedElement('dot');
                                    }}
                                    tabIndex={activeFutureProfessionalProjectSubPanel === projectIdx + 1 ? 0 : -1}
                                    aria-label={`Future Professional Project ${projectIdx + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className={styles.profilePanel}>
                    {activeExpandingKnowledgeStep === 'Future Personal Project' && futurePersonalProjects.length > 4 && (
                      <div className={`${styles.projectTagsContainer} ${futurePersonalProjects.length > 11 ? styles.projectTagsContainerScrollable : ''} ${tagsInitializedFuture ? styles.projectTagsInitialized : ''}`}>
                        {futurePersonalProjects.map((project, projectIdx) => (
                          <button
                            key={project.id}
                            type="button"
                            className={`${styles.projectTag} ${activeFuturePersonalProjectSubPanel === projectIdx + 1 ? styles.projectTagActive : ''} ${tooltipBelowMapFuture[projectIdx] ? styles.projectTagTooltipBelow : ''} ${tagsInitializedFuture ? styles.projectTagNoAnimation : ''} ${hoveredTagIndexFuture === projectIdx ? styles.projectTagHovered : ''}`}
                            onClick={() => {
                              setActiveFuturePersonalProjectSubPanel(projectIdx + 1);
                              setFocusedElement('dot');
                            }}
                            onFocus={() => {
                              setFocusedElement('dot');
                            }}
                            onMouseEnter={(e) => {
                              if (hoverTimeoutRefFuture.current) {
                                clearTimeout(hoverTimeoutRefFuture.current);
                              }
                              const button = e.currentTarget;
                              hoverTimeoutRefFuture.current = setTimeout(() => {
                                if (!button || !button.parentElement) {
                                  return;
                                }
                                setHoveredTagIndexFuture(projectIdx);
                                if (futurePersonalProjects.length > 11) {
                                  const container = button.parentElement;
                                  if (container) {
                                    const buttonRect = button.getBoundingClientRect();
                                    const containerRect = container.getBoundingClientRect();
                                    const spaceAbove = buttonRect.top - containerRect.top;
                                    const tooltipHeight = 40;
                                    const spaceNeeded = tooltipHeight + 20;
                                    if (spaceAbove < spaceNeeded) {
                                      setTooltipBelowMapFuture(prev => ({ ...prev, [projectIdx]: true }));
                                    } else {
                                      setTooltipBelowMapFuture(prev => ({ ...prev, [projectIdx]: false }));
                                    }
                                  }
                                }
                              }, 1100);
                            }}
                            onMouseLeave={() => {
                              if (hoverTimeoutRefFuture.current) {
                                clearTimeout(hoverTimeoutRefFuture.current);
                                hoverTimeoutRefFuture.current = null;
                              }
                              setHoveredTagIndexFuture(null);
                            }}
                            aria-label={`Future Personal Project ${projectIdx + 1}: ${project.projectName || 'Untitled'}`}
                            data-tooltip={project.projectName || `Project ${projectIdx + 1}`}
                            style={{
                              animationDelay: `${projectIdx * 0.05}s`
                            }}
                          >
                            <span className={styles.projectTagNumber}>{projectIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {activeExpandingKnowledgeStep === 'Future Personal Project' && (
                      <div className={styles.knowledgePanelSection}>
                        {showExpandingSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {futurePersonalProjects.length === 0 ? (
                          <div className={styles.collegeSection}>
                            <div className={styles.knowledgeFormField} style={{ marginBottom: '1.5rem', marginLeft: 0, marginRight: 0, alignSelf: 'flex-start', paddingLeft: '2rem', maxWidth: '510px' }}>
                              <p style={{ color: '#666', fontStyle: 'italic' }}>No projects yet. Click "Add Future Personal Project" to get started.</p>
                            </div>
                          </div>
                        ) : (
                          futurePersonalProjects.map((project, projectIndex) => {
                            if (projectIndex + 1 !== activeFuturePersonalProjectSubPanel) return null;
                            
                            return (
                            <div key={project.id} className={styles.collegeSection}>
                              {futurePersonalProjects.length > 1 && (
                                <div className={styles.collegeSectionHeader}>
                                  <button
                                    type="button"
                                    className={styles.deleteCollegeButton}
                                    data-tooltip="Delete"
                                    onClick={() => {
                                      const newProjects = futurePersonalProjects.filter(p => p.id !== project.id);
                                      if (newProjects.length === 0) {
                                        setActiveFuturePersonalProjectSubPanel(1);
                                      } else if (projectIndex < activeFuturePersonalProjectSubPanel - 1) {
                                        setActiveFuturePersonalProjectSubPanel(activeFuturePersonalProjectSubPanel - 1);
                                      } else if (projectIndex === activeFuturePersonalProjectSubPanel - 1) {
                                        setActiveFuturePersonalProjectSubPanel(Math.max(1, activeFuturePersonalProjectSubPanel - 1));
                                      } else if (activeFuturePersonalProjectSubPanel > newProjects.length) {
                                        setActiveFuturePersonalProjectSubPanel(newProjects.length);
                                      }
                                      markExpandingDirty();
                                      setFuturePersonalProjects(newProjects);
                                    }}
                                    aria-label="Delete Future Personal Project"
                                  >
                                    <svg 
                                      className={styles.deleteButtonIcon}
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
                                </div>
                              )}
                              <div className={styles.knowledgeFormRow} style={{ marginBottom: '1.5rem' }}>
                                <div className={styles.knowledgeFormField} style={{ maxWidth: '300px', minWidth: '200px' }}>
                                  <label htmlFor={`future-project-name-${project.id}`} className={styles.formLabel}>
                                    Project Name <span style={{ color: '#d32f2f' }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id={`future-project-name-${project.id}`}
                                    className={styles.formInput}
                                    value={project.projectName}
                                    onChange={(e) => {
                                      markExpandingDirty();
                                      setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectName: e.target.value } : p
                                      ));
                                    }}
                                    onFocus={() => setFocusedElement('field')}
                                    placeholder="Enter project name"
                                    required
                                  />
                                </div>
                                <div className={styles.knowledgeFormField} style={{ maxWidth: '300px', minWidth: '200px' }}>
                                  <label htmlFor={`future-project-description-${project.id}`} className={styles.formLabel}>
                                    Project Description <span style={{ color: '#d32f2f' }}>*</span>
                                  </label>
                                  <div className={styles.customDropdown} ref={descriptionDropdownRef} style={{ maxWidth: '320px', width: '100%' }}>
                                    <button
                                      type="button"
                                      className={styles.customDropdownTrigger}
                                      onClick={() => {
                                        setIsDescriptionDropdownOpen(!isDescriptionDropdownOpen);
                                        if (!isDescriptionDropdownOpen) {
                                          setActiveDescriptionTab('overview');
                                        }
                                      }}
                                      onFocus={() => setFocusedElement('field')}
                                      aria-label="Edit Project Description"
                                      aria-expanded={isDescriptionDropdownOpen}
                                      aria-haspopup="listbox"
                                    >
                                      <span className={styles.dropdownValue}>
                                        {(project.projectDescription?.overview?.trim() || project.projectDescription?.techAndTeamwork?.trim() || project.projectDescription?.achievement?.trim()) 
                                          ? 'Edit description...' 
                                          : 'Add description...'}
                                      </span>
                                      <svg 
                                        className={`${styles.dropdownArrow} ${isDescriptionDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                        width="22" 
                                        height="22" 
                                        viewBox="0 0 24 24" 
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path 
                                          d="M7 10L12 15L17 10" 
                                          stroke="currentColor" 
                                          strokeWidth="2.5" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round"
                                          fill="none"
                                        />
                                      </svg>
                                    </button>
                                    {isDescriptionDropdownOpen && (
                                      <div className={styles.descriptionDropdownMenu}>
                                        <div className={styles.descriptionTabs}>
                                          <button
                                            type="button"
                                            className={`${styles.descriptionTab} ${activeDescriptionTab === 'overview' ? styles.descriptionTabActive : ''}`}
                                            onClick={() => setActiveDescriptionTab('overview')}
                                          >
                                            Overview
                                          </button>
                                          <button
                                            type="button"
                                            className={`${styles.descriptionTab} ${activeDescriptionTab === 'techAndTeamwork' ? styles.descriptionTabActive : ''}`}
                                            onClick={() => setActiveDescriptionTab('techAndTeamwork')}
                                          >
                                            Showcase
                                          </button>
                                          <button
                                            type="button"
                                            className={`${styles.descriptionTab} ${activeDescriptionTab === 'achievement' ? styles.descriptionTabActive : ''}`}
                                            onClick={() => setActiveDescriptionTab('achievement')}
                                          >
                                            Achievement
                                          </button>
                                        </div>
                                        <div className={styles.descriptionTabContent}>
                                          <textarea
                                            className={styles.descriptionTextarea}
                                            value={(project.projectDescription && typeof project.projectDescription === 'object' && 'overview' in project.projectDescription) 
                                              ? (project.projectDescription[activeDescriptionTab] || '') 
                                              : ''}
                                            onChange={(e) => {
                                              markExpandingDirty();
                                              const normalizedDesc = normalizeProjectDescription(project.projectDescription);
                                              setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                                p.id === project.id ? { 
                                                  ...p, 
                                                  projectDescription: {
                                                    ...normalizedDesc,
                                                    [activeDescriptionTab]: e.target.value
                                                  }
                                                } : p
                                              ));
                                            }}
                                            placeholder={
                                              activeDescriptionTab === 'overview' 
                                                ? 'Enter project overview...' 
                                                : activeDescriptionTab === 'techAndTeamwork'
                                                ? 'Enter technologies used and teamwork details...'
                                                : 'Enter achievements and outcomes...'
                                            }
                                            rows={6}
                                            style={{ resize: 'vertical' }}
                                            onFocus={() => setFocusedElement('field')}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                        
                        <div className={styles.knowledgeFormRow}>
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`future-industry-${project.id}`} className={styles.formLabel}>
                                      Industry Sector
                                    </label>
                                    <div 
                                      className={`${styles.customDropdown} ${isIndustryHovered && project.selectedIndustries.length > 0 && !isIndustryDropdownOpen ? styles.customDropdownWithTooltip : ''}`}
                                      ref={industryDropdownRef} 
                                      style={{ maxWidth: '320px', width: '100%', position: 'relative' }}
                                      onMouseEnter={() => project.selectedIndustries.length > 0 && setIsIndustryHovered(true)}
                                      onMouseLeave={() => setIsIndustryHovered(false)}
                                    >
                                      <button
                                        type="button"
                                        className={styles.customDropdownTrigger}
                                        onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Industry Sector"
                                        aria-expanded={isIndustryDropdownOpen}
                                        aria-haspopup="listbox"
                                      >
                                        <span className={styles.dropdownValue}>
                                          {project.selectedIndustries.length > 0 
                                            ? `${project.selectedIndustries.length} selected` 
                                            : 'Select Industry Sector'}
                                        </span>
                                <svg 
                                  className={`${styles.dropdownArrow} ${isIndustryDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                  width="22" 
                                  height="22" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M7 10L12 15L17 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              </button>
                                        {isIndustryHovered && project.selectedIndustries.length > 0 && !isIndustryDropdownOpen && (
                                          <div className={styles.selectedItemsTooltip}>
                                            <div className={styles.tooltipArrow}></div>
                                            <div className={styles.tooltipHeader}>
                                              <span className={styles.tooltipTitle}>Selected Industry Sectors</span>
                                              <span className={styles.tooltipCount}>({project.selectedIndustries.length})</span>
                                            </div>
                                            <div className={styles.tooltipItems}>
                                              {project.selectedIndustries.map((industry, index) => (
                                      <div key={industry} className={styles.tooltipItem}>
                                        <svg
                                          className={styles.tooltipCheckIcon}
                                          width="14"
                                          height="14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M20 6L9 17L4 12"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <span className={styles.tooltipItemText}>{industry}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                                        {isIndustryDropdownOpen && (
                                          <div className={styles.customDropdownMenu}>
                                            {industryOptions.map((option) => {
                                              const isSelected = project.selectedIndustries.includes(option);
                                              return (
                                                <button
                                                  key={option}
                                                  type="button"
                                                  className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ''}`}
                                                  onClick={() => {
                                                    markExpandingDirty();
                                                    setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                                      p.id === project.id 
                                                        ? { 
                                                            ...p, 
                                                            selectedIndustries: isSelected 
                                                              ? p.selectedIndustries.filter(i => i !== option)
                                                              : [...p.selectedIndustries, option]
                                                          }
                                                        : p
                                                    ));
                                                  }}
                                                >
                                        <div className={styles.optionContent}>
                                          <div className={`${styles.customCheckbox} ${isSelected ? styles.customCheckboxChecked : ''}`}>
                                            {isSelected && (
                                              <svg
                                                className={styles.checkmarkIcon}
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="3"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                          <span className={styles.optionText}>{option}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                                  
                          <div className={styles.knowledgeFormField} style={{ maxWidth: '300px', minWidth: '200px' }}>
                            <label htmlFor={`future-project-location-${project.id}`} className={styles.formLabel}>
                              Location
                            </label>
                            <input
                              type="text"
                              id={`future-project-location-${project.id}`}
                              className={styles.formInput}
                              value={project.location || ''}
                              onChange={(e) => {
                                markExpandingDirty();
                                setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                  p.id === project.id ? { ...p, location: e.target.value } : p
                                ));
                              }}
                              onFocus={() => setFocusedElement('field')}
                              placeholder="The city for this project"
                            />
                          </div>
                        </div>
                        
                        
                              <div className={styles.knowledgeFormRow}>
                                <div className={styles.knowledgeFormField}>
                                  <label htmlFor={`future-technologies-${project.id}`} className={styles.formLabel}>
                                    Technologies
                                  </label>
                                  <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                    {!isCareerFocusSelected && (
                                      <div className={styles.careerFocusTooltip}>
                                        Please select Career Focus in Profile first
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                      disabled={!isCareerFocusSelected}
                                      onClick={() => {
                                        if (!isCareerFocusSelected) return;
                                        const convertedTechnologies = project.selectedTechnologies.map(t => {
                                          const isCustomKeyword = !Object.values(technologySections).some(options => options.includes(t));
                                          if (isCustomKeyword) {
                                            return t;
                                          }
                                          return t;
                                        });
                                        const restoredTechnologies = convertedTechnologies.map(t => {
                                          if (t === 'Other') {
                                            return t;
                                          }
                                          return t;
                                        });
                                        setTempFutureSelectedTechnologies(restoredTechnologies);
                                        setIsFutureTechnologiesModalOpen(true);
                                        const preservedKeywords: Record<string, string[]> = {};
                                        Object.entries(technologySections).forEach(([sectionName, options]) => {
                                          const customItems = project.selectedTechnologies.filter(t => 
                                            !options.includes(t) && 
                                            t !== 'Other' &&
                                            !Object.values(technologySections).some(sectionOptions => 
                                              sectionOptions.includes(t) && sectionOptions !== options
                                            )
                                          );
                                          if (customItems.length > 0) {
                                            preservedKeywords[sectionName] = customItems;
                                          }
                                        });
                                        setTempFutureSelectedTechnologies(restoredTechnologies);
                                        setCustomFutureKeywords(preservedKeywords);
                                      }}
                                      onFocus={() => setFocusedElement('field')}
                                      aria-label="Select Technologies"
                                    >
                                      <span className={styles.industryButtonText}>
                                        {project.selectedTechnologies.length > 0 
                                          ? `${project.selectedTechnologies.length} selected` 
                                        : 'Select Technologies'}
                                    </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                  </div>
                                  </div>
                                  
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`future-frameworks-${project.id}`} className={styles.formLabel}>
                                      Framework & Tools
                                    </label>
                                    <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                      {!isCareerFocusSelected && (
                                        <div className={styles.careerFocusTooltip}>
                                          Please select Career Focus in Profile first
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                        disabled={!isCareerFocusSelected}
                                        onClick={() => {
                                          if (!isCareerFocusSelected) return;
                                          const convertedFrameworks = project.selectedFrameworks.map(t => {
                                            const isCustomKeyword = !Object.values(frameworkSections).some(options => options.includes(t));
                                            if (isCustomKeyword) {
                                              return t;
                                            }
                                            return t;
                                          });
                                          const restoredFrameworks = convertedFrameworks.map(t => {
                                            if (t === 'Other') {
                                              return t;
                                            }
                                            return t;
                                          });
                                          setTempFutureSelectedFrameworks(restoredFrameworks);
                                          setIsFutureFrameworksModalOpen(true);
                                          const preservedKeywords: Record<string, string[]> = {};
                                          Object.entries(frameworkSections).forEach(([sectionName, options]) => {
                                            const customItems = project.selectedFrameworks.filter(t => 
                                              !options.includes(t) && 
                                              t !== 'Other' &&
                                              !Object.values(frameworkSections).some(sectionOptions => 
                                                sectionOptions.includes(t) && sectionOptions !== options
                                              )
                                            );
                                            if (customItems.length > 0) {
                                              preservedKeywords[sectionName] = customItems;
                                            }
                                          });
                                          setTempFutureSelectedFrameworks(restoredFrameworks);
                                          setCustomFutureFrameworkKeywords(preservedKeywords);
                                        }}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Framework & Tools"
                                      >
                                        <span className={styles.industryButtonText}>
                                          {project.selectedFrameworks.length > 0 
                                            ? `${project.selectedFrameworks.length} selected` 
                                            : 'Select Framework & Tools'}
                                        </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                    </div>
                          </div>
                        </div>
                        
                        {isFutureTechnologiesModalOpen && activeExpandingKnowledgeStep === 'Future Personal Project' && (
                          <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                            setTempFutureSelectedTechnologies([...project.selectedTechnologies]);
                            setIsFutureTechnologiesModalOpen(false);
                          }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={technologiesModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Technologies</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempFutureSelectedTechnologies([...project.selectedTechnologies]);
                                    setIsFutureTechnologiesModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(technologySections).map(([sectionName, options]) => {
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempFutureSelectedTechnologies.includes(`Other_${sectionName}`);
                                      }
                                      return tempFutureSelectedTechnologies.includes(opt);
                                    }).length;
                                    const customKeywordsForSection = customFutureKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempFutureSelectedTechnologies.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customFutureKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempFutureSelectedTechnologies(prev =>
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                setCustomFutureKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomFutureKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomFutureKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempFutureSelectedTechnologies.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempFutureSelectedTechnologies(tempFutureSelectedTechnologies.filter(t => t !== optionKey));
                                                } else {
                                                  setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customFutureKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomFutureKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomFutureKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempFutureSelectedTechnologies.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempFutureSelectedTechnologies(tempFutureSelectedTechnologies.filter(t => t !== keyword));
                                                  } else {
                                                    setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomFutureKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customFutureKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomFutureKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempFutureSelectedTechnologies(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomFutureKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomFutureKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomFutureKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomFutureKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customFutureKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomFutureKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customFutureKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customFutureKeywordInputValue[sectionName].trim();
                                                  if (!(customFutureKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, newKeyword]);
                                                    setCustomFutureKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomFutureKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customFutureKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customFutureKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, newKeyword]);
                                                  }
                                                  setCustomFutureKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomFutureKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomFutureKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomFutureKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
                                  onClick={() => {
                                        // Use tempFutureSelectedTechnologies directly - selected items are already tracked there
                                        const hasOther = tempFutureSelectedTechnologies.some(t => t.startsWith('Other_'));
                                        const cleanedTechnologies = tempFutureSelectedTechnologies
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markExpandingDirty();
                                        setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                          p.id === project.id ? { ...p, selectedTechnologies: cleanedTechnologies } : p
                                        ));
                                        setIsFutureTechnologiesModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isFutureFrameworksModalOpen && activeExpandingKnowledgeStep === 'Future Personal Project' && (
                              <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                                setTempFutureSelectedFrameworks([...project.selectedFrameworks]);
                                setIsFutureFrameworksModalOpen(false);
                              }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={frameworksModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Framework & Tools</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempFutureSelectedFrameworks([...project.selectedFrameworks]);
                                    setIsFutureFrameworksModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(frameworkSections).map(([sectionName, options]) => {
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempFutureSelectedFrameworks.includes(`Other_${sectionName}`);
                                      }
                                      return tempFutureSelectedFrameworks.includes(opt);
                                    }).length;
                                    const customKeywordsForSection = customFutureFrameworkKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempFutureSelectedFrameworks.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customFutureFrameworkKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempFutureSelectedFrameworks(prev =>
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                setCustomFutureFrameworkKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomFutureFrameworkKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomFutureFrameworkKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempFutureSelectedFrameworks.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempFutureSelectedFrameworks(tempFutureSelectedFrameworks.filter(t => t !== optionKey));
                                                } else {
                                                  setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customFutureFrameworkKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomFutureFrameworkKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomFutureFrameworkKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempFutureSelectedFrameworks.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempFutureSelectedFrameworks(tempFutureSelectedFrameworks.filter(t => t !== keyword));
                                                  } else {
                                                    setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomFutureFrameworkKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customFutureFrameworkKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomFutureFrameworkKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempFutureSelectedFrameworks(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomFutureFrameworkKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomFutureFrameworkKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomFutureFrameworkKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomFutureFrameworkKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customFutureFrameworkKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customFutureFrameworkKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customFutureFrameworkKeywordInputValue[sectionName].trim();
                                                  if (!(customFutureFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, newKeyword]);
                                                    setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomFutureFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customFutureFrameworkKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customFutureFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, newKeyword]);
                                                  }
                                                  setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomFutureFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomFutureFrameworkKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
                                  onClick={() => {
                                        // Use tempFutureSelectedFrameworks directly - selected items are already tracked there
                                        const hasOther = tempFutureSelectedFrameworks.some(t => t.startsWith('Other_'));
                                        const cleanedFrameworks = tempFutureSelectedFrameworks
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markExpandingDirty();
                                        setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                          p.id === project.id ? { ...p, selectedFrameworks: cleanedFrameworks } : p
                                        ));
                                        setIsFutureFrameworksModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className={styles.knowledgeFormRow}>
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>Start Date</label>
                                <div className={styles.dateRow}>
                                  <DateDropdown
                                    value={project.projectStartMonth}
                                    options={months}
                                    placeholder="Month"
                                    onSelect={(value) => {
                                      markExpandingDirty();
                                      setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectStartMonth: value } : p
                                      ));
                                    }}
                                    degreeId={`future-project-start-${project.id}`}
                                    fieldType="startMonth"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                  <DateDropdown
                                    value={project.projectStartYear}
                                    options={years.map(y => y.toString())}
                                    placeholder="Year"
                                    onSelect={(value) => {
                                      markExpandingDirty();
                                      setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectStartYear: value } : p
                                      ));
                                    }}
                                    degreeId={`future-project-start-${project.id}`}
                                    fieldType="startYear"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                </div>
                              </div>
                              
                              <div className={styles.knowledgeFormField}>
                                <label className={styles.formLabel}>End Date</label>
                                <div className={styles.dateRow}>
                                  <DateDropdown
                                    value={project.projectEndMonth}
                                    options={months}
                                    placeholder="Month"
                                    onSelect={(value) => {
                                      markExpandingDirty();
                                      setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectEndMonth: value } : p
                                      ));
                                    }}
                                    degreeId={`future-project-end-${project.id}`}
                                    fieldType="endMonth"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                  <DateDropdown
                                    value={project.projectEndYear}
                                    options={years.map(y => y.toString())}
                                    placeholder="Year"
                                    onSelect={(value) => {
                                      markExpandingDirty();
                                      setFuturePersonalProjects(futurePersonalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectEndYear: value } : p
                                      ));
                                    }}
                                    degreeId={`future-project-end-${project.id}`}
                                    fieldType="endYear"
                                    onFocus={() => setFocusedElement('field')}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {projectIndex === futurePersonalProjects.length - 1 && (
                              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className={styles.addCollegeButton}
                                  disabled={!project.projectName.trim() || (!project.projectDescription?.overview?.trim() && !project.projectDescription?.techAndTeamwork?.trim() && !project.projectDescription?.achievement?.trim())}
                                  onClick={() => {
                                    const newProject: PersonalProject = {
                                      id: `project-${Date.now()}-${Math.random()}`,
                                      projectName: '',
                                      projectDescription: {
                                        overview: '',
                                        techAndTeamwork: '',
                                        achievement: '',
                                      },
                                      selectedIndustries: [],
                                      projectStartMonth: '',
                                      projectStartYear: '',
                                      projectEndMonth: '',
                                      projectEndYear: '',
                                      location: '',
                                      selectedTechnologies: [],
                                      selectedFrameworks: [],
                                      isInterviewReady: false,
                                    };
                                    const willTransitionToTags = futurePersonalProjects.length === 4;
                                    if (willTransitionToTags) {
                                      setIsTransitioningToTagsFuture(true);
                                      setTimeout(() => {
                                        setIsTransitioningToTagsFuture(false);
                                      }, 600);
                                    }
                                    markExpandingDirty();
                                    setFuturePersonalProjects([...futurePersonalProjects, newProject]);
                                    setActiveFuturePersonalProjectSubPanel(futurePersonalProjects.length + 1);
                                  }}
                                  aria-label="Add Future Personal Project"
                                >
                                  <span className={styles.addButtonIcon}>+</span>
                                  <span className={styles.addButtonText}>Add Future Personal Project</span>
                                </button>
                              </div>
                            )}
                            
                            <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save expanding knowledge if dirty before navigating
                                  if (expandingFormState === 'expanding_dirty') {
                                    await handleExpandingKnowledgeSubmit();
                                  }
                                  if (projectIndex === 0) {
                                    setShowExpandingKnowledgeBase(false);
                                  } else {
                                    setActiveFuturePersonalProjectSubPanel(projectIndex);
                                  }
                                }}
                                aria-label={projectIndex === 0 ? "Back to Knowledge Asset" : "Back to Previous Project"}
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save expanding knowledge if dirty before navigating
                                  if (expandingFormState === 'expanding_dirty') {
                                    await handleExpandingKnowledgeSubmit();
                                  }
                                  if (projectIndex < futurePersonalProjects.length - 1) {
                                    setActiveFuturePersonalProjectSubPanel(projectIndex + 2);
                                  } else {
                                    setActiveExpandingKnowledgeStep('Future Professional Project');
                                  }
                                }}
                                aria-label={projectIndex < futurePersonalProjects.length - 1 ? "Next to Next Project" : "Next to Future Professional Project"}
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                            );
                          })
                        )}
                      </div>
                    )}
                    {activeExpandingKnowledgeStep === 'Future Professional Project' && futureProfessionalProjects.length > 4 && (
                      <div className={`${styles.projectTagsContainer} ${futureProfessionalProjects.length > 11 ? styles.projectTagsContainerScrollable : ''} ${tagsInitializedFutureProfessional ? styles.projectTagsInitialized : ''}`}>
                        {futureProfessionalProjects.map((project, projectIdx) => (
                          <button
                            key={project.id}
                            type="button"
                            className={`${styles.projectTag} ${activeFutureProfessionalProjectSubPanel === projectIdx + 1 ? styles.projectTagActive : ''} ${tooltipBelowMapFutureProfessional[projectIdx] ? styles.projectTagTooltipBelow : ''} ${tagsInitializedFutureProfessional ? styles.projectTagNoAnimation : ''} ${hoveredTagIndexFutureProfessional === projectIdx ? styles.projectTagHovered : ''}`}
                            onClick={() => {
                              setActiveFutureProfessionalProjectSubPanel(projectIdx + 1);
                              setFocusedElement('dot');
                            }}
                            onFocus={() => {
                              setFocusedElement('dot');
                            }}
                            onMouseEnter={(e) => {
                              if (hoverTimeoutRefFutureProfessional.current) {
                                clearTimeout(hoverTimeoutRefFutureProfessional.current);
                              }
                              const button = e.currentTarget;
                              hoverTimeoutRefFutureProfessional.current = setTimeout(() => {
                                if (!button || !button.parentElement) {
                                  return;
                                }
                                setHoveredTagIndexFutureProfessional(projectIdx);
                                if (futureProfessionalProjects.length > 11) {
                                  const container = button.parentElement;
                                  if (container) {
                                    const buttonRect = button.getBoundingClientRect();
                                    const containerRect = container.getBoundingClientRect();
                                    const spaceAbove = buttonRect.top - containerRect.top;
                                    const tooltipHeight = 40;
                                    const spaceNeeded = tooltipHeight + 20;
                                    if (spaceAbove < spaceNeeded) {
                                      setTooltipBelowMapProfessional(prev => ({ ...prev, [projectIdx]: true }));
                                    } else {
                                      setTooltipBelowMapProfessional(prev => ({ ...prev, [projectIdx]: false }));
                                    }
                                  }
                                }
                              }, 1100);
                            }}
                            onMouseLeave={() => {
                              if (hoverTimeoutRefProfessional.current) {
                                clearTimeout(hoverTimeoutRefProfessional.current);
                                hoverTimeoutRefProfessional.current = null;
                              }
                              setHoveredTagIndexProfessional(null);
                            }}
                            aria-label={`Future Professional Project ${projectIdx + 1}: ${project.projectName || 'Untitled'}`}
                            data-tooltip={project.projectName || `Project ${projectIdx + 1}`}
                            style={{
                              animationDelay: `${projectIdx * 0.05}s`
                            }}
                          >
                            <span className={styles.projectTagNumber}>{projectIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {activeExpandingKnowledgeStep === 'Future Professional Project' && (
                      <div className={styles.knowledgePanelSection}>
                        {showExpandingSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {futureProfessionalProjects.length === 0 ? (
                          <div className={styles.collegeSection}>
                            <div className={styles.knowledgeFormField} style={{ marginBottom: '1.5rem', marginLeft: 0, marginRight: 0, alignSelf: 'flex-start', paddingLeft: '2rem', maxWidth: '510px' }}>
                              <p style={{ color: '#666', fontStyle: 'italic' }}>No projects yet. Click "Add Future Professional Project" to get started.</p>
                            </div>
                          </div>
                        ) : (
                          futureProfessionalProjects.map((project, projectIndex) => {
                            if (projectIndex + 1 !== activeFutureProfessionalProjectSubPanel) return null;
                            
                            return (
                            <div key={project.id} className={styles.collegeSection}>
                              {futureProfessionalProjects.length > 1 && (
                                <div className={styles.collegeSectionHeader}>
                                  <button
                                    type="button"
                                    className={styles.deleteCollegeButton}
                                    data-tooltip="Delete"
                                    onClick={() => {
                                      const newProjects = futureProfessionalProjects.filter(p => p.id !== project.id);
                                      if (newProjects.length === 0) {
                                        setActiveFutureProfessionalProjectSubPanel(1);
                                      } else if (projectIndex < activeFutureProfessionalProjectSubPanel - 1) {
                                        setActiveFutureProfessionalProjectSubPanel(activeFutureProfessionalProjectSubPanel - 1);
                                      } else if (projectIndex === activeFutureProfessionalProjectSubPanel - 1) {
                                        setActiveFutureProfessionalProjectSubPanel(Math.max(1, activeFutureProfessionalProjectSubPanel - 1));
                                      } else if (activeFutureProfessionalProjectSubPanel > newProjects.length) {
                                        setActiveFutureProfessionalProjectSubPanel(newProjects.length);
                                      }
                                      markExpandingDirty();
                                      setFutureProfessionalProjects(newProjects);
                                    }}
                                    aria-label="Delete Future Professional Project"
                                  >
                                    <svg 
                                      className={styles.deleteButtonIcon}
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
                                </div>
                              )}
                              <div className={styles.knowledgeFormField} style={{ marginBottom: '1.5rem', marginLeft: 'auto', marginRight: 'auto', alignSelf: 'center', paddingLeft: 0, maxWidth: '510px' }}>
                                <label htmlFor={`future-professional-project-name-${project.id}`} className={styles.formLabel}>
                                  Project Name <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
                                  <input
                                    type="text"
                                    id={`future-professional-project-name-${project.id}`}
                                    className={styles.formInput}
                                    value={project.projectName}
                                    onChange={(e) => {
                                      markExpandingDirty();
                                      setFutureProfessionalProjects(futureProfessionalProjects.map(p => 
                                        p.id === project.id ? { ...p, projectName: e.target.value } : p
                                      ));
                                    }}
                                    onFocus={() => setFocusedElement('field')}
                                    placeholder="Enter project name"
                                    style={{ flex: 1 }}
                                    required
                                  />
                                </div>
                              </div>
                        
                        <div className={styles.knowledgeFormRow}>
                          <div className={styles.knowledgeFormField}>
                            <label htmlFor={`future-professional-project-description-${project.id}`} className={styles.formLabel}>
                              Project Description <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <div className={styles.customDropdown} ref={futureDescriptionDropdownRef} style={{ maxWidth: '320px', width: '100%' }}>
                              <button
                                type="button"
                                className={styles.customDropdownTrigger}
                                onClick={() => {
                                  setIsFutureDescriptionDropdownOpen(!isFutureDescriptionDropdownOpen);
                                  if (!isFutureDescriptionDropdownOpen) {
                                    setActiveFutureDescriptionTab('overview');
                                  }
                                }}
                                onFocus={() => setFocusedElement('field')}
                                aria-label="Edit Project Description"
                                aria-expanded={isFutureDescriptionDropdownOpen}
                                aria-haspopup="listbox"
                              >
                                <span className={styles.dropdownValue}>
                                  {(project.projectDescription?.overview?.trim() || project.projectDescription?.techAndTeamwork?.trim() || project.projectDescription?.achievement?.trim()) 
                                    ? 'Edit description...' 
                                    : 'Add description...'}
                                </span>
                                <svg 
                                  className={`${styles.dropdownArrow} ${isFutureDescriptionDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                  width="22" 
                                  height="22" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M7 10L12 15L17 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              </button>
                                      {isFutureDescriptionDropdownOpen && (
                                        <div className={styles.descriptionDropdownMenu}>
                                          <div className={styles.descriptionTabs}>
                                            <button
                                              type="button"
                                              className={`${styles.descriptionTab} ${activeFutureDescriptionTab === 'overview' ? styles.descriptionTabActive : ''}`}
                                              onClick={() => setActiveFutureDescriptionTab('overview')}
                                            >
                                              Overview
                                            </button>
                                            <button
                                              type="button"
                                              className={`${styles.descriptionTab} ${activeFutureDescriptionTab === 'techAndTeamwork' ? styles.descriptionTabActive : ''}`}
                                              onClick={() => setActiveFutureDescriptionTab('techAndTeamwork')}
                                            >
                                              Showcase
                                            </button>
                                            <button
                                              type="button"
                                              className={`${styles.descriptionTab} ${activeFutureDescriptionTab === 'achievement' ? styles.descriptionTabActive : ''}`}
                                              onClick={() => setActiveFutureDescriptionTab('achievement')}
                                            >
                                              Achievement
                                            </button>
                                          </div>
                                          <div className={styles.descriptionTabContent}>
                                            <textarea
                                              className={styles.descriptionTextarea}
                                              value={project.projectDescription?.[activeFutureDescriptionTab] || ''}
                                              onChange={(e) => {
                                                markExpandingDirty();
                                                const normalizedDesc = normalizeProjectDescription(project.projectDescription);
                                                setFutureProfessionalProjects(futureProfessionalProjects.map(p => 
                                                  p.id === project.id ? { 
                                                    ...p, 
                                                    projectDescription: {
                                                      ...normalizedDesc,
                                                      [activeFutureDescriptionTab]: e.target.value
                                                    }
                                                  } : p
                                                ));
                                              }}
                                              placeholder={
                                                activeFutureDescriptionTab === 'overview' 
                                                  ? 'Enter project overview...' 
                                                  : activeFutureDescriptionTab === 'techAndTeamwork'
                                                  ? 'Enter technologies used and teamwork details...'
                                                  : 'Enter achievements and outcomes...'
                                              }
                                              rows={6}
                                              style={{ resize: 'vertical' }}
                                              onFocus={() => setFocusedElement('field')}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`future-professional-work-experience-${project.id}`} className={styles.formLabel}>
                                      Work Experience <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <div 
                                      className={styles.customDropdown}
                                      ref={futureWorkExperienceDropdownRef} 
                                      style={{ maxWidth: '320px', width: '100%', position: 'relative' }}
                                    >
                                      <button
                                        type="button"
                                        className={styles.customDropdownTrigger}
                                        onClick={() => {
                                          if (professionalExperiences.length > 0) {
                                            setIsFutureWorkExperienceDropdownOpen(!isFutureWorkExperienceDropdownOpen);
                                          }
                                        }}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Work Experience"
                                        aria-expanded={isFutureWorkExperienceDropdownOpen}
                                        aria-haspopup="listbox"
                                        disabled={professionalExperiences.length === 0}
                                        style={{ 
                                          opacity: professionalExperiences.length === 0 ? 0.5 : 1,
                                          cursor: professionalExperiences.length === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                      >
                                        <span className={`${styles.dropdownValue} ${project.selectedWorkExperience ? styles.workExperienceValue : ''}`}>
                                          <span 
                                            ref={(el) => { workExperienceTextRefs.current[project.id] = el; }}
                                            className={styles.workExperienceText}
                                            onMouseEnter={(e) => {
                                              if (project.selectedWorkExperience) {
                                                const textElement = e.currentTarget;
                                                const container = textElement.parentElement;
                                                if (container && textElement) {
                                                  const textWidth = textElement.scrollWidth;
                                                  const containerWidth = container.clientWidth;
                                                  if (textWidth > containerWidth) {
                                                    const scrollDistance = containerWidth - textWidth;
                                                    textElement.style.setProperty('--scroll-distance', `${scrollDistance}px`);
                                                  } else {
                                                    textElement.style.setProperty('--scroll-distance', '0px');
                                                  }
                                                }
                                              }
                                            }}
                                          >
                                            {project.selectedWorkExperience 
                                              ? project.selectedWorkExperience
                                              : professionalExperiences.length === 0 
                                                ? 'Fill work experience'
                                                : 'Select Work Experience'}
                                          </span>
                                        </span>
                                <svg 
                                  className={`${styles.dropdownArrow} ${isFutureWorkExperienceDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                                  width="22" 
                                  height="22" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M7 10L12 15L17 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              </button>
                                        {isFutureWorkExperienceDropdownOpen && professionalExperiences.length > 0 && (
                                          <div className={styles.customDropdownMenu}>
                                            {professionalExperiences.map((experience) => {
                                              const optionValue = `${experience.companyName} - ${experience.jobTitle}`;
                                              const isSelected = project.selectedWorkExperience === optionValue;
                                              return (
                                                <button
                                                  key={experience.id}
                                                  type="button"
                                                  className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ''}`}
                                                  onClick={() => {
                                                    markExpandingDirty();
                                                    setFutureProfessionalProjects(futureProfessionalProjects.map(p => 
                                                      p.id === project.id 
                                                        ? { 
                                                            ...p, 
                                                            selectedWorkExperience: isSelected ? '' : optionValue
                                                          }
                                                        : p
                                                    ));
                                                    setIsFutureWorkExperienceDropdownOpen(false);
                                                  }}
                                                >
                                        <span className={styles.optionText}>{optionValue}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        
                              <div className={styles.knowledgeFormRow}>
                                <div className={styles.knowledgeFormField}>
                                  <label htmlFor={`future-professional-technologies-${project.id}`} className={styles.formLabel}>
                                    Technologies
                                  </label>
                                  <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                    {!isCareerFocusSelected && (
                                      <div className={styles.careerFocusTooltip}>
                                        Please select Career Focus in Profile first
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                      disabled={!isCareerFocusSelected}
                                      onClick={() => {
                                        if (!isCareerFocusSelected) return;
                                        const convertedTechnologies = project.selectedTechnologies.map(t => {
                                          const isCustomKeyword = !Object.values(technologySections).some(options => options.includes(t));
                                          if (isCustomKeyword) {
                                            return t;
                                          }
                                          return t;
                                        });
                                        const restoredTechnologies = convertedTechnologies.map(t => {
                                          if (t === 'Other') {
                                            return t;
                                          }
                                          return t;
                                        });
                                        setTempFutureSelectedTechnologies(restoredTechnologies);
                                        setIsFutureTechnologiesModalOpen(true);
                                        const preservedKeywords: Record<string, string[]> = {};
                                        Object.entries(technologySections).forEach(([sectionName, options]) => {
                                          const customItems = project.selectedTechnologies.filter(t => 
                                            !options.includes(t) && 
                                            t !== 'Other' &&
                                            !Object.values(technologySections).some(sectionOptions => 
                                              sectionOptions.includes(t) && sectionOptions !== options
                                            )
                                          );
                                          if (customItems.length > 0) {
                                            preservedKeywords[sectionName] = customItems;
                                          }
                                        });
                                        setTempFutureSelectedTechnologies(restoredTechnologies);
                                        setCustomFutureKeywords(preservedKeywords);
                                      }}
                                      onFocus={() => setFocusedElement('field')}
                                      aria-label="Select Technologies"
                                    >
                                      <span className={styles.industryButtonText}>
                                        {project.selectedTechnologies.length > 0 
                                          ? `${project.selectedTechnologies.length} selected` 
                                          : 'Select Technologies'}
                                      </span>
                                <svg 
                                className={styles.industryButtonIcon}
                                width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                  </div>
                                  </div>
                                  
                                  <div className={styles.knowledgeFormField}>
                                    <label htmlFor={`future-professional-frameworks-${project.id}`} className={styles.formLabel}>
                                      Framework & Tools
                                    </label>
                                    <div className={!isCareerFocusSelected ? styles.disabledFieldWrapper : ''}>
                                      {!isCareerFocusSelected && (
                                        <div className={styles.careerFocusTooltip}>
                                          Please select Career Focus in Profile first
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        className={`${styles.industryButton} ${!isCareerFocusSelected ? styles.industryButtonDisabled : ''}`}
                                        disabled={!isCareerFocusSelected}
                                        onClick={() => {
                                          if (!isCareerFocusSelected) return;
                                          const convertedFrameworks = project.selectedFrameworks.map(t => {
                                            const isCustomKeyword = !Object.values(frameworkSections).some(options => options.includes(t));
                                            if (isCustomKeyword) {
                                              return t;
                                            }
                                            return t;
                                          });
                                          const restoredFrameworks = convertedFrameworks.map(t => {
                                            if (t === 'Other') {
                                              return t;
                                            }
                                            return t;
                                          });
                                          setTempFutureSelectedFrameworks(restoredFrameworks);
                                          setIsFutureFrameworksModalOpen(true);
                                          const preservedKeywords: Record<string, string[]> = {};
                                          Object.entries(frameworkSections).forEach(([sectionName, options]) => {
                                            const customItems = project.selectedFrameworks.filter(t => 
                                              !options.includes(t) && 
                                              t !== 'Other' &&
                                              !Object.values(frameworkSections).some(sectionOptions => 
                                                sectionOptions.includes(t) && sectionOptions !== options
                                              )
                                            );
                                            if (customItems.length > 0) {
                                              preservedKeywords[sectionName] = customItems;
                                            }
                                          });
                                          setTempFutureSelectedFrameworks(restoredFrameworks);
                                          setCustomFutureFrameworkKeywords(preservedKeywords);
                                        }}
                                        onFocus={() => setFocusedElement('field')}
                                        aria-label="Select Framework & Tools"
                                      >
                                        <span className={styles.industryButtonText}>
                                          {project.selectedFrameworks.length > 0 
                                            ? `${project.selectedFrameworks.length} selected` 
                                            : 'Select Framework & Tools'}
                                        </span>
                                <svg 
                                  className={styles.industryButtonIcon}
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                                    </div>
                          </div>
                        </div>
                        
                        {isFutureTechnologiesModalOpen && (
                          <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                            setTempFutureSelectedTechnologies([...project.selectedTechnologies]);
                            setIsFutureTechnologiesModalOpen(false);
                          }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={technologiesModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Technologies</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempFutureSelectedTechnologies([...project.selectedTechnologies]);
                                    setIsFutureTechnologiesModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(technologySections).map(([sectionName, options]) => {
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempFutureSelectedTechnologies.includes(`Other_${sectionName}`);
                                      }
                                      return tempFutureSelectedTechnologies.includes(opt);
                                    }).length;
                                    const customKeywordsForSection = customFutureKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempFutureSelectedTechnologies.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customFutureKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempFutureSelectedTechnologies(prev =>
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                setCustomFutureKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomFutureKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomFutureKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempFutureSelectedTechnologies.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempFutureSelectedTechnologies(tempFutureSelectedTechnologies.filter(t => t !== optionKey));
                                                } else {
                                                  setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customFutureKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomFutureKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomFutureKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempFutureSelectedTechnologies.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempFutureSelectedTechnologies(tempFutureSelectedTechnologies.filter(t => t !== keyword));
                                                  } else {
                                                    setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomFutureKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customFutureKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomFutureKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempFutureSelectedTechnologies(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomFutureKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomFutureKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomFutureKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomFutureKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customFutureKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomFutureKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customFutureKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customFutureKeywordInputValue[sectionName].trim();
                                                  if (!(customFutureKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, newKeyword]);
                                                    setCustomFutureKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomFutureKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customFutureKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customFutureKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedTechnologies([...tempFutureSelectedTechnologies, newKeyword]);
                                                  }
                                                  setCustomFutureKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomFutureKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomFutureKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomFutureKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
onClick={() => {
                                        // Use tempFutureSelectedTechnologies directly - selected items are already tracked there
                                        const hasOther = tempFutureSelectedTechnologies.some(t => t.startsWith('Other_'));
                                        const cleanedTechnologies = tempFutureSelectedTechnologies
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markExpandingDirty();
                                        setFutureProfessionalProjects(futureProfessionalProjects.map(p =>
                                          p.id === project.id ? { ...p, selectedTechnologies: cleanedTechnologies } : p
                                        ));
                                        setIsFutureTechnologiesModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isFutureFrameworksModalOpen && (
                              <div className={`${styles.modalOverlay} ${styles.technologiesModalOverlay}`} onClick={() => {
                                setTempFutureSelectedFrameworks([...project.selectedFrameworks]);
                                setIsFutureFrameworksModalOpen(false);
                              }}>
                            <div className={`${styles.modalContent} ${styles.technologiesModalContent}`} ref={frameworksModalRef} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Select Framework & Tools</h3>
                                <button
                                  type="button"
                                  className={styles.modalCloseButton}
                                  onClick={() => {
                                    setTempFutureSelectedFrameworks([...project.selectedFrameworks]);
                                    setIsFutureFrameworksModalOpen(false);
                                  }}
                                  aria-label="Close"
                                >
                                  <svg 
                                    width="20" 
                                    height="20" 
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
                              </div>
                              <div className={styles.modalBody}>
                                <div className={styles.technologySectionsContainer}>
                                  {Object.entries(frameworkSections).map(([sectionName, options]) => {
                                    const sectionSelectedCount = options.filter(opt => {
                                      if (opt === 'Other') {
                                        return tempFutureSelectedFrameworks.includes(`Other_${sectionName}`);
                                      }
                                      return tempFutureSelectedFrameworks.includes(opt);
                                    }).length;
                                    const customKeywordsForSection = customFutureFrameworkKeywords[sectionName] || [];
                                    const customKeywordsCount = customKeywordsForSection.filter(k => tempFutureSelectedFrameworks.includes(k)).length;
                                    return (
                                    <div key={sectionName} className={styles.technologySection}>
                                      <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                        <div className={styles.sectionHeaderRight}>
                                          <span className={styles.sectionCount}>
                                            {sectionSelectedCount + customKeywordsCount} / {options.length}
                                          </span>
                                          {(sectionSelectedCount > 0 || customKeywordsCount > 0) && (
                                            <button
                                              type="button"
                                              className={styles.sectionClearButton}
                                              onClick={() => {
                                                const sectionOtherKey = `Other_${sectionName}`;
                                                const sectionCustomKeywords = customFutureFrameworkKeywords[sectionName] || [];
                                                const sectionOptions = [...options]; // Capture current section options
                                                setTempFutureSelectedFrameworks(prev =>
                                                  prev.filter(t => 
                                                    !sectionOptions.includes(t) && 
                                                    t !== sectionOtherKey &&
                                                    !sectionCustomKeywords.includes(t)
                                                  )
                                                );
                                                setCustomFutureFrameworkKeywords(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setIsShowingCustomFutureFrameworkKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                                setCustomFutureFrameworkKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[sectionName];
                                                  return updated;
                                                });
                                              }}
                                              aria-label={`Clear all selected items in ${sectionName}`}
                                              title="Clear all selections in this section"
                                            >
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sectionItems}>
                                        {options.map((option) => {
                                          const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                          const isSelected = tempFutureSelectedFrameworks.includes(optionKey);
                                          const isOther = option === 'Other';
                                          
                                          if (isOther) {
                                            return null;
                                          }
                                          
                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setTempFutureSelectedFrameworks(tempFutureSelectedFrameworks.filter(t => t !== optionKey));
                                                } else {
                                                  setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, optionKey]);
                                                }
                                              }}
                                            >
                                              <span className={styles.technologyItemText}>{option}</span>
                                              {isSelected && (
                                                <svg
                                                  className={styles.technologyCheckmark}
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {(customFutureFrameworkKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                          const isEditing = editingCustomFutureFrameworkKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                          const editValue = editingCustomFutureFrameworkKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                          const isSelected = tempFutureSelectedFrameworks.includes(keyword);
                                          
                                          return (
                                            <button
                                              key={`${sectionName}_${keywordIndex}`}
                                              type="button"
                                              className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                              onClick={() => {
                                                if (!isEditing) {
                                                  if (isSelected) {
                                                    setTempFutureSelectedFrameworks(tempFutureSelectedFrameworks.filter(t => t !== keyword));
                                                  } else {
                                                    setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, keyword]);
                                                  }
                                                }
                                              }}
                                              style={{ position: 'relative' }}
                                            >
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editValue}
                                                  onChange={(e) => {
                                                    setEditingCustomFutureFrameworkKeyword(prev => ({
                                                      ...prev,
                                                      [`${sectionName}_${keywordIndex}`]: e.target.value
                                                    }));
                                                  }}
                                                  onBlur={() => {
                                                    const newValue = editValue.trim();
                                                    if (newValue && newValue !== keyword) {
                                                      const updatedKeywords = [...(customFutureFrameworkKeywords[sectionName] || [])];
                                                      updatedKeywords[keywordIndex] = newValue;
                                                      setCustomFutureFrameworkKeywords(prev => ({
                                                        ...prev,
                                                        [sectionName]: updatedKeywords
                                                      }));
                                                      if (isSelected) {
                                                        setTempFutureSelectedFrameworks(prev => 
                                                          prev.map(t => t === keyword ? newValue : t)
                                                        );
                                                      }
                                                    }
                                                    setEditingCustomFutureFrameworkKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${sectionName}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.currentTarget.blur();
                                                    } else if (e.key === 'Escape') {
                                                      setEditingCustomFutureFrameworkKeyword(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[`${sectionName}_${keywordIndex}`];
                                                        return updated;
                                                      });
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    outline: 'none',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    className={styles.technologyItemText}
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCustomFutureFrameworkKeyword(prev => ({
                                                        ...prev,
                                                        [`${sectionName}_${keywordIndex}`]: keyword
                                                      }));
                                                    }}
                                                  >
                                                    {keyword}
                                                  </span>
                                                  {isSelected && (
                                                    <svg
                                                      className={styles.technologyCheckmark}
                                                      width="18"
                                                      height="18"
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  )}
                                                </>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {isShowingCustomFutureFrameworkKeywordInput[sectionName] && (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              className={styles.customKeywordsInput}
                                              placeholder="Enter keyword"
                                              value={customFutureFrameworkKeywordInputValue[sectionName] || ''}
                                              onChange={(e) => {
                                                setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [sectionName]: e.target.value
                                                }));
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customFutureFrameworkKeywordInputValue[sectionName]?.trim()) {
                                                  e.preventDefault();
                                                  const newKeyword = customFutureFrameworkKeywordInputValue[sectionName].trim();
                                                  if (!(customFutureFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, newKeyword]);
                                                    setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                      ...prev,
                                                      [sectionName]: ''
                                                    }));
                                                  }
                                                } else if (e.key === 'Escape') {
                                                  setIsShowingCustomFutureFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              onBlur={() => {
                                                const inputValue = customFutureFrameworkKeywordInputValue[sectionName]?.trim();
                                                if (inputValue) {
                                                  const newKeyword = inputValue;
                                                  if (!(customFutureFrameworkKeywords[sectionName] || []).includes(newKeyword)) {
                                                    setCustomFutureFrameworkKeywords(prev => ({
                                                      ...prev,
                                                      [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                                    }));
                                                    setTempFutureSelectedFrameworks([...tempFutureSelectedFrameworks, newKeyword]);
                                                  }
                                                  setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [sectionName]: ''
                                                  }));
                                                } else {
                                                  setIsShowingCustomFutureFrameworkKeywordInput(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                  setCustomFutureFrameworkKeywordInputValue(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[sectionName];
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              style={{ maxWidth: '150px', minWidth: '100px' }}
                                              autoFocus
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                        {options.includes('Other') && (
                                          <button
                                            type="button"
                                            className={styles.technologyItem}
                                            onClick={() => {
                                              setIsShowingCustomFutureFrameworkKeywordInput(prev => ({
                                                ...prev,
                                                [sectionName]: true
                                              }));
                                              setCustomFutureFrameworkKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>+</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.modalDoneButton}
onClick={() => {
                                        // Use tempFutureSelectedFrameworks directly - selected items are already tracked there
                                        const hasOther = tempFutureSelectedFrameworks.some(t => t.startsWith('Other_'));
                                        const cleanedFrameworks = tempFutureSelectedFrameworks
                                          .filter(t => !t.startsWith('Other_'))
                                          .concat(hasOther ? ['Other'] : []);
                                        markExpandingDirty();
                                        setFutureProfessionalProjects(futureProfessionalProjects.map(p =>
                                          p.id === project.id ? { ...p, selectedFrameworks: cleanedFrameworks } : p
                                        ));
                                        setIsFutureFrameworksModalOpen(false);
                                      }}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {projectIndex === futureProfessionalProjects.length - 1 && (
                              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className={styles.addCollegeButton}
                                  disabled={!project.projectName.trim() || (!project.projectDescription?.overview?.trim() && !project.projectDescription?.techAndTeamwork?.trim() && !project.projectDescription?.achievement?.trim())}
                                  onClick={() => {
                                    const newProject: ProfessionalProject = {
                                      id: `professional-project-${Date.now()}-${Math.random()}`,
                                      projectName: '',
                                      projectDescription: {
                                        overview: '',
                                        techAndTeamwork: '',
                                        achievement: '',
                                      },
                                      selectedWorkExperience: '',
                                      projectStartMonth: '',
                                      projectStartYear: '',
                                      projectEndMonth: '',
                                      projectEndYear: '',
                                      selectedTechnologies: [],
                                      selectedFrameworks: [],
                                      isInterviewReady: false,
                                    };
                                    const willTransitionToTags = futureProfessionalProjects.length === 4;
                                    if (willTransitionToTags) {
                                      setIsTransitioningToTagsFutureProfessional(true);
                                      setTimeout(() => {
                                        setIsTransitioningToTagsFutureProfessional(false);
                                      }, 600);
                                    }
                                    markExpandingDirty();
                                    setFutureProfessionalProjects([...futureProfessionalProjects, newProject]);
                                    setActiveFutureProfessionalProjectSubPanel(futureProfessionalProjects.length + 1);
                                  }}
                                  aria-label="Add Future Professional Project"
                                >
                                  <span className={styles.addButtonIcon}>+</span>
                                  <span className={styles.addButtonText}>Add Future Professional Project</span>
                                </button>
                              </div>
                            )}
                            
                            <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save expanding knowledge if dirty before navigating
                                  if (expandingFormState === 'expanding_dirty') {
                                    await handleExpandingKnowledgeSubmit();
                                  }
                                  if (projectIndex === 0) {
                                    setActiveExpandingKnowledgeStep('Future Personal Project');
                                  } else {
                                    setActiveFutureProfessionalProjectSubPanel(projectIndex);
                                  }
                                }}
                                aria-label={projectIndex === 0 ? "Back to Future Personal Project" : "Back to Previous Project"}
                              >
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transform: 'rotate(180deg)' }}
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className={styles.nextButtonText}>Back</span>
                              </button>
                              <button
                                type="button"
                                className={styles.nextButton}
                                onClick={async () => {
                                  // Save expanding knowledge if dirty before navigating
                                  if (expandingFormState === 'expanding_dirty') {
                                    await handleExpandingKnowledgeSubmit();
                                  }
                                  if (projectIndex < futureProfessionalProjects.length - 1) {
                                    setActiveFutureProfessionalProjectSubPanel(projectIndex + 2);
                                  } else {
                                    setActiveExpandingKnowledgeStep('Future Technical Skills');
                                  }
                                }}
                                aria-label={projectIndex < futureProfessionalProjects.length - 1 ? "Next to Next Project" : "Next to Future Technical Skills"}
                              >
                                <span className={styles.nextButtonText}>Next</span>
                                <svg 
                                  className={styles.nextButtonIcon}
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          );
                        })
                      )}
                      </div>
                    )}
                    {activeExpandingKnowledgeStep === 'Future Technical Skills' && (
                      <div className={styles.profilePanelSection}>
                        {showExpandingSavedMessage && (
                          <div className={styles.savedMessage}>
                            Saved!
                          </div>
                        )}
                        {!isCareerFocusSelected ? (
                          <div className={styles.careerFocusRequiredMessage}>
                            <div className={styles.careerFocusRequiredIcon}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                              </svg>
                            </div>
                            <h3 className={styles.careerFocusRequiredTitle}>Career Focus Required</h3>
                            <p className={styles.careerFocusRequiredText}>
                              Please select your Career Focus in the Profile section first to access the Future Technical Skills options.
                            </p>
                            <button
                              type="button"
                              className={styles.careerFocusRequiredButton}
                              onClick={() => setActiveSection('profile')}
                            >
                              Go to Profile
                            </button>
                          </div>
                        ) : (
                        <>
                        {/* Legend explaining the three states - same as Technical Skill Focus */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          gap: '2rem', 
                          marginBottom: '1.5rem',
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, rgba(250, 248, 244, 0.9) 0%, rgba(245, 242, 235, 0.95) 100%)',
                          borderRadius: '12px',
                          border: '1px solid rgba(214, 191, 154, 0.3)',
                          maxWidth: '600px',
                          margin: '0 auto 1.5rem auto'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: 'linear-gradient(135deg, rgba(255, 245, 220, 0.9) 0%, rgba(255, 238, 200, 0.85) 100%)',
                              border: '2px solid rgba(230, 197, 131, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#5a5248', fontWeight: 500 }}>Current Skills</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: 'linear-gradient(135deg, rgba(240, 235, 255, 0.95) 0%, rgba(230, 220, 250, 0.9) 100%)',
                              border: '2px solid rgba(168, 140, 220, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="16" height="14" viewBox="0 0 28 24" fill="none">
                                <path d="M14 6L6 14L2 10" stroke="#7c5daf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M26 6L15 17L11 13" stroke="#7c5daf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#5a4878', fontWeight: 500 }}>Future Goals</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: 'linear-gradient(135deg, #ffffff 0%, #faf8f4 100%)',
                              border: '2px solid rgba(214, 191, 154, 0.4)'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#888', fontWeight: 500 }}>Not Selected</span>
                          </div>
                        </div>
                        <p style={{ 
                          textAlign: 'center', 
                          color: '#888', 
                          fontSize: '0.875rem', 
                          marginBottom: '1.5rem',
                          fontStyle: 'italic'
                        }}>
                          Click once to mark as current skill, click again for future goal, click third time to deselect
                        </p>
                        <div className={styles.technologySectionsContainer} style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                          {Object.entries(technicalSkillFocusSections).map(([sectionName, options]) => {
                            // Count Technical Skill Focus selections
                            const sectionTechnicalCount = options.filter(opt => {
                              if (opt === 'Other') {
                                return selectedTechnicalSkills.includes(`Other_${sectionName}`);
                              }
                              return selectedTechnicalSkills.includes(opt);
                            }).length;
                            // Count Future Technical Skills selections
                            const sectionFutureCount = options.filter(opt => {
                              if (opt === 'Other') {
                                return selectedFutureTechnicalSkills.includes(`Other_${sectionName}`);
                              }
                              return selectedFutureTechnicalSkills.includes(opt);
                            }).length;
                            const customKeywordsForSection = customFutureTechnicalSkillKeywords[sectionName] || [];
                            const customTechnicalKeywordsCount = customKeywordsForSection.filter(k => selectedTechnicalSkills.includes(k)).length;
                            const customFutureKeywordsCount = customKeywordsForSection.filter(k => selectedFutureTechnicalSkills.includes(k)).length;
                            const totalTechnical = sectionTechnicalCount + customTechnicalKeywordsCount;
                            const totalFuture = sectionFutureCount + customFutureKeywordsCount;
                            const totalSelected = totalTechnical + totalFuture;
                            // If section has no selected items, default to collapsed; otherwise default to expanded
                            const isExpanded = expandedFutureTechnicalSkillSections[sectionName] !== undefined 
                              ? expandedFutureTechnicalSkillSections[sectionName] 
                              : totalSelected > 0;
                            return (
                              <div 
                                key={sectionName} 
                                className={styles.technologySection}
                                style={{ 
                                  border: isExpanded ? '2px solid rgba(214, 191, 154, 0.3)' : 'none',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setExpandedFutureTechnicalSkillSections(prev => ({
                                    ...prev,
                                    [sectionName]: !isExpanded
                                  }));
                                }}
                              >
                                <div 
                                  className={styles.sectionHeader}
                                  style={{
                                    borderBottom: isExpanded ? '2px solid rgba(214, 191, 154, 0.2)' : 'none'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      style={{
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease'
                                      }}
                                    >
                                      <path
                                        d="M9 18L15 12L9 6"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <h4 className={styles.sectionTitle}>{sectionName}</h4>
                                  </div>
                                  <div className={styles.sectionHeaderRight}>
                                    <span className={styles.sectionCount}>
                                      {totalTechnical > 0 && <span style={{ color: '#9b6a10' }}>{totalTechnical} current</span>}
                                      {totalTechnical > 0 && totalFuture > 0 && <span style={{ margin: '0 4px', color: '#888' }}>·</span>}
                                      {totalFuture > 0 && <span style={{ color: '#7c5daf' }}>{totalFuture} future</span>}
                                      {totalTechnical === 0 && totalFuture === 0 && '0 selected'}
                                    </span>
                                    {(totalSelected > 0) && (
                                      <button
                                        type="button"
                                        className={styles.sectionClearButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const sectionOtherKey = `Other_${sectionName}`;
                                          const sectionCustomKeywords = customFutureTechnicalSkillKeywords[sectionName] || [];
                                          const sectionOptions = [...options]; // Capture current section options
                                          markEstablishedDirty();
                                          markExpandingDirty();
                                          // Clear from Technical Skills
                                          setSelectedTechnicalSkills(prev =>
                                            prev.filter(t => 
                                              !sectionOptions.includes(t) && 
                                              t !== sectionOtherKey &&
                                              !sectionCustomKeywords.includes(t)
                                            )
                                          );
                                          // Clear from Future Technical Skills
                                          setSelectedFutureTechnicalSkills(prev =>
                                            prev.filter(t => 
                                              !sectionOptions.includes(t) && 
                                              t !== sectionOtherKey &&
                                              !sectionCustomKeywords.includes(t)
                                            )
                                          );
                                          setCustomFutureTechnicalSkillKeywords(prev => {
                                            const updated = { ...prev };
                                            delete updated[sectionName];
                                            return updated;
                                          });
                                          setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => {
                                            const updated = { ...prev };
                                            delete updated[sectionName];
                                            return updated;
                                          });
                                          setCustomFutureTechnicalSkillKeywordInputValue(prev => {
                                            const updated = { ...prev };
                                            delete updated[sectionName];
                                            return updated;
                                          });
                                        }}
                                        aria-label={`Clear all selected items in ${sectionName}`}
                                        title="Clear all selections in this section"
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {isExpanded && (
                                  <>
                                <div className={styles.sectionItems} onClick={(e) => e.stopPropagation()}>
                                  {options.map((option) => {
                                    const optionKey = option === 'Other' ? `Other_${sectionName}` : option;
                                    const isSelectedTechnical = selectedTechnicalSkills.includes(optionKey);
                                    const isSelectedFuture = selectedFutureTechnicalSkills.includes(optionKey);
                                    const isOther = option === 'Other';
                                    
                                    // Don't render "Other" button here - it will be shown at the end
                                    if (isOther) {
                                      return null;
                                    }
                                    
                                    // Determine item class based on state
                                    const itemClass = isSelectedFuture 
                                      ? `${styles.technologyItem} ${styles.technologyItemFuture}`
                                      : isSelectedTechnical 
                                        ? `${styles.technologyItem} ${styles.technologyItemSelected}`
                                        : styles.technologyItem;
                                    
                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        className={itemClass}
                                        onClick={() => {
                                          markEstablishedDirty();
                                          markExpandingDirty();
                                          // Three-state toggle: unchecked -> technical -> future -> unchecked
                                          if (isSelectedFuture) {
                                            // Currently future, go to unchecked
                                            setSelectedFutureTechnicalSkills(prev => prev.filter(t => t !== optionKey));
                                          } else if (isSelectedTechnical) {
                                            // Currently technical, go to future
                                            setSelectedTechnicalSkills(prev => prev.filter(t => t !== optionKey));
                                            setSelectedFutureTechnicalSkills(prev => [...prev, optionKey]);
                                          } else {
                                            // Currently unchecked, go to technical
                                            setSelectedTechnicalSkills(prev => [...prev, optionKey]);
                                          }
                                        }}
                                      >
                                        <span className={styles.technologyItemText}>{option}</span>
                                        {isSelectedTechnical && !isSelectedFuture && (
                                          <svg
                                            className={styles.technologyCheckmark}
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M20 6L9 17L4 12"
                                              stroke="currentColor"
                                              strokeWidth="3"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                        {isSelectedFuture && (
                                          <svg
                                            className={styles.technologyDoubleCheckmark}
                                            width="24"
                                            height="20"
                                            viewBox="0 0 28 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M14 6L6 14L2 10"
                                              stroke="currentColor"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <path
                                              d="M26 6L15 17L11 13"
                                              stroke="currentColor"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                                  {(customFutureTechnicalSkillKeywords[sectionName] || []).map((keyword, keywordIndex) => {
                                    const isEditing = editingCustomFutureTechnicalSkillKeyword[`${sectionName}_${keywordIndex}`] !== undefined;
                                    const editValue = editingCustomFutureTechnicalSkillKeyword[`${sectionName}_${keywordIndex}`] ?? keyword;
                                    const isSelected = selectedFutureTechnicalSkills.includes(keyword);
                                    
                                    return (
                                      <button
                                        key={`${sectionName}_${keywordIndex}`}
                                        type="button"
                                        className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                        onClick={() => {
                                          if (!isEditing) {
                                            markExpandingDirty();
                                            if (isSelected) {
                                              setSelectedFutureTechnicalSkills(selectedFutureTechnicalSkills.filter(t => t !== keyword));
                                            } else {
                                              setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, keyword]);
                                            }
                                          }
                                        }}
                                        style={{ position: 'relative' }}
                                      >
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => {
                                              setEditingCustomFutureTechnicalSkillKeyword(prev => ({
                                                ...prev,
                                                [`${sectionName}_${keywordIndex}`]: e.target.value
                                              }));
                                            }}
                                            onBlur={() => {
                                              const newValue = editValue.trim();
                                              if (newValue && newValue !== keyword) {
                                                const updatedKeywords = [...(customFutureTechnicalSkillKeywords[sectionName] || [])];
                                                updatedKeywords[keywordIndex] = newValue;
                                                markExpandingDirty();
                                                setCustomFutureTechnicalSkillKeywords(prev => ({
                                                  ...prev,
                                                  [sectionName]: updatedKeywords
                                                }));
                                                if (isSelected) {
                                                  markExpandingDirty();
                                                  setSelectedFutureTechnicalSkills(prev => 
                                                    prev.map(t => t === keyword ? newValue : t)
                                                  );
                                                }
                                              }
                                              setEditingCustomFutureTechnicalSkillKeyword(prev => {
                                                const updated = { ...prev };
                                                delete updated[`${sectionName}_${keywordIndex}`];
                                                return updated;
                                              });
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                              } else if (e.key === 'Escape') {
                                                setEditingCustomFutureTechnicalSkillKeyword(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[`${sectionName}_${keywordIndex}`];
                                                  return updated;
                                                });
                                              }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              outline: 'none',
                                              color: 'inherit',
                                              fontSize: 'inherit',
                                              fontWeight: 'inherit',
                                              width: '100%',
                                              textAlign: 'center'
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <>
                                            <span
                                              className={styles.technologyItemText}
                                              onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCustomFutureTechnicalSkillKeyword(prev => ({
                                                  ...prev,
                                                  [`${sectionName}_${keywordIndex}`]: keyword
                                                }));
                                              }}
                                            >
                                              {keyword}
                                            </span>
                                            {isSelected && (
                                              <svg
                                                className={styles.technologyCheckmark}
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="3"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </>
                                        )}
                                      </button>
                                    );
                                  })}
                                  {isShowingCustomFutureTechnicalSkillKeywordInput[sectionName] && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <input
                                        type="text"
                                        className={styles.customKeywordsInput}
                                        placeholder="Enter keyword"
                                        value={customFutureTechnicalSkillKeywordInputValue[sectionName] || ''}
                                        onChange={(e) => {
                                          setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                            ...prev,
                                            [sectionName]: e.target.value
                                          }));
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && customFutureTechnicalSkillKeywordInputValue[sectionName]?.trim()) {
                                            e.preventDefault();
                                            const newKeyword = customFutureTechnicalSkillKeywordInputValue[sectionName].trim();
                                            if (!(customFutureTechnicalSkillKeywords[sectionName] || []).includes(newKeyword)) {
                                              markExpandingDirty();
                                              setCustomFutureTechnicalSkillKeywords(prev => ({
                                                ...prev,
                                                [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                              }));
                                              markExpandingDirty();
                                              setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, newKeyword]);
                                              setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                                ...prev,
                                                [sectionName]: ''
                                              }));
                                            }
                                          } else if (e.key === 'Escape') {
                                            setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                            setCustomFutureTechnicalSkillKeywordInputValue(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                          }
                                        }}
                                        onBlur={() => {
                                          const inputValue = customFutureTechnicalSkillKeywordInputValue[sectionName]?.trim();
                                          if (inputValue) {
                                            const newKeyword = inputValue;
                                            if (!(customFutureTechnicalSkillKeywords[sectionName] || []).includes(newKeyword)) {
                                              markExpandingDirty();
                                              setCustomFutureTechnicalSkillKeywords(prev => ({
                                                ...prev,
                                                [sectionName]: [...(prev[sectionName] || []), newKeyword]
                                              }));
                                              markExpandingDirty();
                                              setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, newKeyword]);
                                            }
                                            setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                              ...prev,
                                              [sectionName]: ''
                                            }));
                                          } else {
                                            setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                            setCustomFutureTechnicalSkillKeywordInputValue(prev => {
                                              const updated = { ...prev };
                                              delete updated[sectionName];
                                              return updated;
                                            });
                                          }
                                        }}
                                        style={{ maxWidth: '150px', minWidth: '100px' }}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  )}
                                  {options.includes('Other') && (
                                    <button
                                      type="button"
                                      className={styles.technologyItem}
                                      onClick={() => {
                                        setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => ({
                                          ...prev,
                                          [sectionName]: true
                                        }));
                                        setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                          ...prev,
                                          [sectionName]: ''
                                        }));
                                      }}
                                    >
                                      <span className={styles.technologyItemText}>+</span>
                                    </button>
                                  )}
                                </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {customFutureTechnicalSkillLayers.map((layer) => {
                            const sectionSelectedCount = layer.items.filter(opt => {
                              if (opt === 'Other') {
                                return selectedFutureTechnicalSkills.includes(`Other_${layer.id}`);
                              }
                              return selectedFutureTechnicalSkills.includes(opt);
                            }).length;
                            const customKeywordsForSection = customFutureTechnicalSkillKeywords[layer.id] || [];
                            const customKeywordsCount = customKeywordsForSection.filter(k => selectedFutureTechnicalSkills.includes(k)).length;
                            const totalSelected = sectionSelectedCount + customKeywordsCount;
                            const isExpanded = expandedFutureTechnicalSkillSections[layer.id] !== undefined 
                              ? expandedFutureTechnicalSkillSections[layer.id] 
                              : totalSelected > 0;
                            return (
                              <div 
                                key={layer.id} 
                                className={styles.technologySection}
                                style={{ 
                                  border: isExpanded ? '2px solid rgba(214, 191, 154, 0.3)' : 'none',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setExpandedFutureTechnicalSkillSections(prev => ({
                                    ...prev,
                                    [layer.id]: !isExpanded
                                  }));
                                }}
                              >
                                <div 
                                  className={styles.sectionHeader}
                                  style={{
                                    borderBottom: isExpanded ? '2px solid rgba(214, 191, 154, 0.2)' : 'none'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      style={{
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease'
                                      }}
                                    >
                                      <path
                                        d="M9 18L15 12L9 6"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <h4 className={styles.sectionTitle}>{layer.title}</h4>
                                  </div>
                                  <div className={styles.sectionHeaderRight}>
                                    <span className={styles.sectionCount}>
                                      {totalSelected} selected
                                    </span>
                                    <button
                                      type="button"
                                      className={styles.sectionClearButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markExpandingDirty();
                                        const layerItems = [...layer.items]; // Capture current layer items
                                        setCustomFutureTechnicalSkillLayers(prev => prev.filter(l => l.id !== layer.id));
                                        const sectionOtherKey = `Other_${layer.id}`;
                                        const sectionCustomKeywords = customFutureTechnicalSkillKeywords[layer.id] || [];
                                        setSelectedFutureTechnicalSkills(prev =>
                                          prev.filter(t => 
                                            !layerItems.includes(t) && 
                                            t !== sectionOtherKey &&
                                            !sectionCustomKeywords.includes(t)
                                          )
                                        );
                                        setCustomFutureTechnicalSkillKeywords(prev => {
                                          const updated = { ...prev };
                                          delete updated[layer.id];
                                          return updated;
                                        });
                                        setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => {
                                          const updated = { ...prev };
                                          delete updated[layer.id];
                                          return updated;
                                        });
                                        setCustomFutureTechnicalSkillKeywordInputValue(prev => {
                                          const updated = { ...prev };
                                          delete updated[layer.id];
                                          return updated;
                                        });
                                      }}
                                      aria-label={`Delete layer ${layer.title}`}
                                      title="Delete this layer"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
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
                                  </div>
                                </div>
                                {isExpanded && (
                                  <>
                                    <div className={styles.sectionItems} onClick={(e) => e.stopPropagation()}>
                                      {layer.items.map((option) => {
                                        const optionKey = option === 'Other' ? `Other_${layer.id}` : option;
                                        const isSelected = selectedFutureTechnicalSkills.includes(optionKey);
                                        const isOther = option === 'Other';
                                        
                                        // Don't render "Other" button here - it will be shown at the end
                                        if (isOther) {
                                          return null;
                                        }
                                        
                                        return (
                                          <button
                                            key={option}
                                            type="button"
                                            className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                            onClick={() => {
                                              markExpandingDirty();
                                              if (isSelected) {
                                                setSelectedFutureTechnicalSkills(selectedFutureTechnicalSkills.filter(t => t !== optionKey));
                                              } else {
                                                setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, optionKey]);
                                              }
                                            }}
                                          >
                                            <span className={styles.technologyItemText}>{option}</span>
                                            {isSelected && (
                                              <svg
                                                className={styles.technologyCheckmark}
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="3"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </button>
                                        );
                                      })}
                                      {(customFutureTechnicalSkillKeywords[layer.id] || []).map((keyword, keywordIndex) => {
                                        const isEditing = editingCustomFutureTechnicalSkillKeyword[`${layer.id}_${keywordIndex}`] !== undefined;
                                        const editValue = editingCustomFutureTechnicalSkillKeyword[`${layer.id}_${keywordIndex}`] ?? keyword;
                                        const isSelected = selectedFutureTechnicalSkills.includes(keyword);
                                        
                                        return (
                                          <button
                                            key={`${layer.id}_${keywordIndex}`}
                                            type="button"
                                            className={`${styles.technologyItem} ${isSelected ? styles.technologyItemSelected : ''}`}
                                            onClick={() => {
                                              if (!isEditing) {
                                                markExpandingDirty();
                                                if (isSelected) {
                                                  setSelectedFutureTechnicalSkills(selectedFutureTechnicalSkills.filter(t => t !== keyword));
                                                } else {
                                                  setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, keyword]);
                                                }
                                              }
                                            }}
                                            style={{ position: 'relative' }}
                                          >
                                            {isEditing ? (
                                              <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => {
                                                  setEditingCustomFutureTechnicalSkillKeyword(prev => ({
                                                    ...prev,
                                                    [`${layer.id}_${keywordIndex}`]: e.target.value
                                                  }));
                                                }}
                                                onBlur={() => {
                                                  const newValue = editValue.trim();
                                                  if (newValue && newValue !== keyword) {
                                                    const updatedKeywords = [...(customFutureTechnicalSkillKeywords[layer.id] || [])];
                                                    updatedKeywords[keywordIndex] = newValue;
                                                    markExpandingDirty();
                                                    setCustomFutureTechnicalSkillKeywords(prev => ({
                                                      ...prev,
                                                      [layer.id]: updatedKeywords
                                                    }));
                                                    if (isSelected) {
                                                      markExpandingDirty();
                                                      setSelectedFutureTechnicalSkills(prev => 
                                                        prev.map(t => t === keyword ? newValue : t)
                                                      );
                                                    }
                                                  }
                                                  setEditingCustomFutureTechnicalSkillKeyword(prev => {
                                                    const updated = { ...prev };
                                                    delete updated[`${layer.id}_${keywordIndex}`];
                                                    return updated;
                                                  });
                                                }}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    e.currentTarget.blur();
                                                  } else if (e.key === 'Escape') {
                                                    setEditingCustomFutureTechnicalSkillKeyword(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[`${layer.id}_${keywordIndex}`];
                                                      return updated;
                                                    });
                                                  }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                  background: 'transparent',
                                                  border: 'none',
                                                  outline: 'none',
                                                  color: 'inherit',
                                                  fontSize: 'inherit',
                                                  fontWeight: 'inherit',
                                                  width: '100%',
                                                  textAlign: 'center'
                                                }}
                                                autoFocus
                                              />
                                            ) : (
                                              <>
                                                <span
                                                  className={styles.technologyItemText}
                                                  onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCustomFutureTechnicalSkillKeyword(prev => ({
                                                      ...prev,
                                                      [`${layer.id}_${keywordIndex}`]: keyword
                                                    }));
                                                  }}
                                                >
                                                  {keyword}
                                                </span>
                                                {isSelected && (
                                                  <svg
                                                    className={styles.technologyCheckmark}
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <path
                                                      d="M20 6L9 17L4 12"
                                                      stroke="currentColor"
                                                      strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                  </svg>
                                                )}
                                              </>
                                            )}
                                          </button>
                                        );
                                      })}
                                      {isShowingCustomFutureTechnicalSkillKeywordInput[layer.id] && (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <input
                                            type="text"
                                            className={styles.customKeywordsInput}
                                            placeholder="Enter keyword"
                                            value={customFutureTechnicalSkillKeywordInputValue[layer.id] || ''}
                                            onChange={(e) => {
                                              setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                                ...prev,
                                                [layer.id]: e.target.value
                                              }));
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && customFutureTechnicalSkillKeywordInputValue[layer.id]?.trim()) {
                                                e.preventDefault();
                                                const newKeyword = customFutureTechnicalSkillKeywordInputValue[layer.id].trim();
                                                if (!(customFutureTechnicalSkillKeywords[layer.id] || []).includes(newKeyword)) {
                                                  markExpandingDirty();
                                                  setCustomFutureTechnicalSkillKeywords(prev => ({
                                                    ...prev,
                                                    [layer.id]: [...(prev[layer.id] || []), newKeyword]
                                                  }));
                                                  markExpandingDirty();
                                                  setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, newKeyword]);
                                                  setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                                    ...prev,
                                                    [layer.id]: ''
                                                  }));
                                                }
                                              } else if (e.key === 'Escape') {
                                                setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                                setCustomFutureTechnicalSkillKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                              }
                                            }}
                                            onBlur={() => {
                                              const inputValue = customFutureTechnicalSkillKeywordInputValue[layer.id]?.trim();
                                              if (inputValue) {
                                                const newKeyword = inputValue;
                                                if (!(customFutureTechnicalSkillKeywords[layer.id] || []).includes(newKeyword)) {
                                                  setCustomFutureTechnicalSkillKeywords(prev => ({
                                                    ...prev,
                                                    [layer.id]: [...(prev[layer.id] || []), newKeyword]
                                                  }));
                                                  setSelectedFutureTechnicalSkills([...selectedFutureTechnicalSkills, newKeyword]);
                                                }
                                                setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                                  ...prev,
                                                  [layer.id]: ''
                                                }));
                                              } else {
                                                setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                                setCustomFutureTechnicalSkillKeywordInputValue(prev => {
                                                  const updated = { ...prev };
                                                  delete updated[layer.id];
                                                  return updated;
                                                });
                                              }
                                            }}
                                            style={{ maxWidth: '150px', minWidth: '100px' }}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                      {layer.items.includes('Other') && (
                                        <button
                                          type="button"
                                          className={styles.technologyItem}
                                          onClick={() => {
                                            setIsShowingCustomFutureTechnicalSkillKeywordInput(prev => ({
                                              ...prev,
                                              [layer.id]: true
                                            }));
                                            setCustomFutureTechnicalSkillKeywordInputValue(prev => ({
                                              ...prev,
                                              [layer.id]: ''
                                            }));
                                          }}
                                        >
                                          <span className={styles.technologyItemText}>+</span>
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {isAddingNewFutureLayer && (
                            <div className={styles.technologySection} style={{ border: '2px dashed rgba(214, 191, 154, 0.5)', background: 'rgba(255, 255, 255, 0.5)' }}>
                              <div className={styles.sectionHeader}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                  <input
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="Enter layer title (e.g., Architecture & System Design)"
                                    value={newFutureLayerTitle}
                                    onChange={(e) => setNewFutureLayerTitle(e.target.value)}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                  />
                                  <textarea
                                    className={styles.formInput}
                                    placeholder="Enter items (one per line or comma-separated)"
                                    value={newFutureLayerItems}
                                    onChange={(e) => setNewFutureLayerItems(e.target.value)}
                                    rows={4}
                                    style={{ width: '100%', resize: 'vertical' }}
                                  />
                                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                      type="button"
                                      className={styles.nextButton}
                                      onClick={() => {
                                        setIsAddingNewFutureLayer(false);
                                        setNewFutureLayerTitle('');
                                        setNewFutureLayerItems('');
                                      }}
                                    >
                                      <span className={styles.nextButtonText}>Cancel</span>
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.nextButton}
                                      onClick={() => {
                                        if (newFutureLayerTitle.trim() && newFutureLayerItems.trim()) {
                                          const items = newFutureLayerItems
                                            .split(/[,\n]/)
                                            .map(item => item.trim())
                                            .filter(item => item.length > 0);
                                          if (items.length > 0) {
                                            const newLayer = {
                                              id: `custom-layer-${Date.now()}-${Math.random()}`,
                                              title: newFutureLayerTitle.trim(),
                                              items: [...items, 'Other']
                                            };
                                            markExpandingDirty();
                                            setCustomFutureTechnicalSkillLayers([...customFutureTechnicalSkillLayers, newLayer]);
                                            setIsAddingNewFutureLayer(false);
                                            setNewFutureLayerTitle('');
                                            setNewFutureLayerItems('');
                                          }
                                        }
                                      }}
                                    >
                                      <span className={styles.nextButtonText}>Add Section</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <button
                            type="button"
                            className={styles.addCollegeButton}
                            onClick={() => {
                              setIsAddingNewFutureLayer(true);
                            }}
                            aria-label="Add Technical Section"
                          >
                            <span className={styles.addButtonIcon}>+</span>
                            <span className={styles.addButtonText}>Add Technical Section</span>
                          </button>
                        </div>
                        </>
                        )}
                        <div className={styles.buttonRowContainer} style={{ marginTop: '0.75rem' }}>
                          <button
                            type="button"
                            className={styles.nextButton}
                            onClick={async () => {
                              // Save expanding knowledge if dirty before navigating
                              if (expandingFormState === 'expanding_dirty') {
                                await handleExpandingKnowledgeSubmit();
                              }
                              setActiveExpandingKnowledgeStep('Future Professional Project');
                            }}
                            aria-label="Back to Future Professional Project"
                          >
                            <svg 
                              className={styles.nextButtonIcon}
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ transform: 'rotate(180deg)' }}
                            >
                              <path 
                                d="M9 18L15 12L9 6" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className={styles.nextButtonText}>Back</span>
                          </button>
                          <button
                            type="button"
                            className={styles.nextButton}
                            onClick={async () => {
                              // Save expanding knowledge if dirty before navigating
                              if (expandingFormState === 'expanding_dirty') {
                                await handleExpandingKnowledgeSubmit();
                                if (expandingAutoSaveTimerRef.current) {
                                  clearTimeout(expandingAutoSaveTimerRef.current);
                                  expandingAutoSaveTimerRef.current = null;
                                }
                              }
                              // Navigate to resume tag "From Knowledge Base" page
                              setActiveSection('resume');
                              setShowExpandingKnowledgeBase(false);
                              setResumeShowCompanyTypePage(true);
                            }}
                            aria-label="Craft resume from knowledge base"
                          >
                            <span className={styles.nextButtonText}>Craft resume from knowledge base</span>
                            <svg 
                              className={styles.nextButtonIcon}
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d="M5 12H19M19 12L12 5M19 12L12 19" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeSection === 'resume' && (
                <ResumeSection
                  interestedJobPositionFromKnowledgeBase={resumeInterestedJobPositionFromKnowledgeBase}
                  setInterestedJobPositionFromKnowledgeBase={setResumeInterestedJobPositionFromKnowledgeBase}
                  fetchedJobDataFromKnowledgeBase={resumeFetchedJobDataFromKnowledgeBase}
                  setFetchedJobDataFromKnowledgeBase={setResumeFetchedJobDataFromKnowledgeBase}
                  isJobUrlValidFromKnowledgeBase={resumeIsJobUrlValidFromKnowledgeBase}
                  setIsJobUrlValidFromKnowledgeBase={setResumeIsJobUrlValidFromKnowledgeBase}
                  interestedJobPositionFromExistingResume={resumeInterestedJobPositionFromExistingResume}
                  setInterestedJobPositionFromExistingResume={setResumeInterestedJobPositionFromExistingResume}
                  fetchedJobDataFromExistingResume={resumeFetchedJobDataFromExistingResume}
                  setFetchedJobDataFromExistingResume={setResumeFetchedJobDataFromExistingResume}
                  isJobUrlValidFromExistingResume={resumeIsJobUrlValidFromExistingResume}
                  setIsJobUrlValidFromExistingResume={setResumeIsJobUrlValidFromExistingResume}
                  showCompanyTypePage={resumeShowCompanyTypePage}
                  setShowCompanyTypePage={setResumeShowCompanyTypePage}
                  showExistingResumePage={resumeShowExistingResumePage}
                  setShowExistingResumePage={setResumeShowExistingResumePage}
                  personalProjects={personalProjects}
                  professionalProjects={professionalProjects}
                  futurePersonalProjects={futurePersonalProjects}
                  futureProfessionalProjects={futureProfessionalProjects}
                  selectedTechnicalSkills={selectedTechnicalSkills}
                  selectedFutureTechnicalSkills={selectedFutureTechnicalSkills}
                  basicInfo={{
                    firstName,
                    middleName,
                    lastName,
                    email,
                    phone,
                    addressStreet,
                    addressState,
                    addressZip,
                    personalWebsite,
                    linkedin,
                    links: links.map((l) => ({ name: l.linkName, url: l.url })),
                  }}
                  education={colleges}
                  professionalHistory={professionalExperiences}
                  achievements={achievements}
                  onNavigateToAnalysis={(data) => {
                    if (data) {
                      // Store the initial data for AnalysisSection
                      setAnalysisInitialData({
                        resumeFile: data.resumeFile || null,
                        resumeFileName: data.resumeFileName || null,
                        jobPosition: data.jobPosition,
                        fetchedJobData: data.fetchedJobData,
                        knowledgeScope: data.knowledgeScope,
                        // Auto-trigger when all required data is available
                        autoTrigger: !!(data.resumeFile && data.fetchedJobData && data.knowledgeScope),
                      });
                      // Also update the job position state
                      if (data.jobPosition) {
                        setAnalysisJobPosition(data.jobPosition);
                      }
                    }
                    setActiveSection('analyzer');
                  }}
                />
              )}
              {activeSection === 'analyzer' && (
                <AnalysisSection
                  jobPosition={analysisJobPosition}
                  setJobPosition={setAnalysisJobPosition}
                  user={user}
                  initialResumeFile={analysisInitialData?.resumeFile || null}
                  initialResumeFileName={analysisInitialData?.resumeFileName || null}
                  initialJobPosition={analysisInitialData?.jobPosition || null}
                  initialFetchedJobData={analysisInitialData?.fetchedJobData || null}
                  initialKnowledgeScope={analysisInitialData?.knowledgeScope || null}
                  autoTriggerAnalysis={analysisInitialData?.autoTrigger || false}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      {isUpgradeModalOpen && (
        <div
          className={`${styles.modalOverlay} ${styles.upgradeModalOverlay}`}
          onClick={() => setIsUpgradeModalOpen(false)}
        >
          <div
            className={`${styles.modalContent} ${styles.upgradeModalContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <span className={styles.modalTitleHighlight}>Ambitology Pro</span> users get 3x more interviews
              </h3>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={() => setIsUpgradeModalOpen(false)}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
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
            </div>
            <div className={styles.modalBody}>
              <div className={styles.subscriptionPlans}>
                <div className={`${styles.planCard} ${styles.planCardFree}`}>
                  <div className={styles.planHeader}>
                    <h4 className={styles.planName}>Free</h4>
                    <p className={styles.planSubtitle}>To unleash your full potential by building knowledge base and 1-click AI resume craft and career power analysis.</p>
                  </div>
                  <ul className={styles.planFeatures}>
                    <li>Basic use case to build personal profile</li>
                    <li>
                      Unlimited knowledge base build up for established and expanding
                      scope
                    </li>
                    <li>Unlimited existing resume edit</li>
                    <li>Up to 3 times intelligent resume craft</li>
                    <li>
                      Up to 3 times personal capability and resume power analysis
                    </li>
                  </ul>
                </div>
                <div className={`${styles.planCard} ${styles.planCardPro}`}>
                  <div className={styles.planHeader}>
                    <h4 className={styles.planName}>Pro</h4>
                    <p className={styles.planSubtitle}>Our AI-powered platform empowers you to maximize potential, boost interviews, and accelerate hiring success.</p>
                  </div>
                  <ul className={styles.planFeatures}>
                    <li>Everything in Free plan</li>
                    <li>Unlimited intelligent resume craft</li>
                    <li>Unlimited personal capability and resume power analysis</li>
                    <li>
                      Unlimited AI powered career consulting chat regarding to your
                      knowledge base (Coming soon)
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.pricingRow}>
                <div
                  className={`${styles.pricingOption} ${selectedPricingPlan === '2weeks' ? styles.pricingOptionSelected : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedPricingPlan('2weeks');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPricingPlan('2weeks');
                    }
                  }}
                >
                  <div className={styles.pricingDuration}>2 weeks of Pro Plan</div>
                  <div className={styles.pricingHighlight}>$1.99/day</div>
                  <div className={styles.pricingAmount}>$27.86 total</div>
                </div>
                <div
                  className={`${styles.pricingOption} ${styles.pricingOptionRecommended} ${selectedPricingPlan === '1month' ? styles.pricingOptionSelected : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedPricingPlan('1month');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPricingPlan('1month');
                    }
                  }}
                >
                  <div className={styles.pricingDuration}>1 month of Pro Plan</div>
                  <div className={styles.pricingHighlight}>$1.33/day</div>
                  <div className={styles.pricingAmount}>$39.99 total</div>
                </div>
                <div
                  className={`${styles.pricingOption} ${styles.pricingOptionRecommended} ${selectedPricingPlan === '3months' ? styles.pricingOptionSelected : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedPricingPlan('3months');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPricingPlan('3months');
                    }
                  }}
                >
                  <div className={styles.pricingBadge}>Most Popular</div>
                  <div className={styles.pricingDuration}>3 months of Pro Plan</div>
                  <div className={styles.pricingHighlight}>$0.99/day</div>
                  <div className={styles.pricingAmount}>$89.99 total</div>
                </div>
              </div>
              <div className={styles.upgradeModalFooter}>
                <p className={styles.communityMessage}>Join our community where tens of thousands job seekers boosted their interview opportunities 3 times more and get job offer faster.</p>
                <button
                  type="button"
                  className={styles.getStartedButton}
                  disabled={isCheckoutLoading}
                  onClick={handleSubscriptionCheckout}
                >
                  {isCheckoutLoading ? 'Loading...' : 'Get Started!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

