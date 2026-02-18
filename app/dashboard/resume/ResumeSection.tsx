'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import styles from '../dashboard.module.css';
import { API_ENDPOINT } from '@/app/components/config';

interface JobTitle {
  id: string;
  title: string;
  date: string;
  bullets: string[];
  projectTechnologies?: Record<string, string | string[]>; // Map project name to technologies (string or array for backwards compatibility)
}

// Internal marker used to separate projects under the same role
const PROJECT_HEADER_PREFIX = '__PROJECT_NAME__:';

interface ProfessionalExperience {
  id: string;
  company: string;
  jobTitles: JobTitle[];
}

interface Project {
  id: string;
  name: string;
  date: string;
  description: string;
  bullets: string[];
  // Optional list of technologies used in the project (e.g. ["React", "TypeScript"])
  technologies?: string[];
}

interface Degree {
  id: string;
  degree: string;
  description: string;
}

interface Education {
  id: string;
  university: string;
  date: string;
  degrees: Degree[];
}

interface ContactField {
  id: string;
  label: string;
  value: string;
  isDefault: boolean; // Default fields (email, phone, location, linkedin) cannot be deleted
}

// Type for fetched job data
export interface FetchedJobData {
  target_job_title: string;
  target_job_company: string;
  target_job_description: string;
  target_job_skill_keywords: string[];
}

// Project interfaces matching the parent component
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

interface ProfessionalProject {
  id: string;
  projectName: string;
  projectDescription: {
    overview: string;
    techAndTeamwork: string;
    achievement: string;
  };
  selectedWorkExperience: string;
  projectStartMonth: string;
  projectStartYear: string;
  projectEndMonth: string;
  projectEndYear: string;
  selectedTechnologies: string[];
  selectedFrameworks: string[];
  isInterviewReady?: boolean;
}

// Helper: shorten long URLs for display while keeping them recognizable
const shortenUrl = (value: string): string => {
  if (!value) return '';
  if (value.length <= 35) return value;

  try {
    const withScheme = value.match(/^https?:\/\//i) ? value : `https://${value}`;
    const url = new URL(withScheme);
    const host = url.host.replace(/^www\./i, '');
    const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
    let display = host + path;
    if (display.length > 35) {
      display = `${display.slice(0, 32)}...`;
    }
    return display;
  } catch {
    // Fallback: simple truncation
    return `${value.slice(0, 32)}...`;
  }
};

// Helper: format contact field for display in resume document / download
const formatContactDisplay = (field: ContactField): string => {
  const rawValue = field.value?.trim() || '';
  if (!rawValue) return '';

  // For non-link fields (email, phone, location), show as-is
  const lowerLabel = (field.label || '').toLowerCase();
  const isLinkField =
    lowerLabel.includes('link') ||
    lowerLabel.includes('website') ||
    lowerLabel.includes('github') ||
    lowerLabel.includes('portfolio');

  const displayValue = isLinkField ? shortenUrl(rawValue) : rawValue;

  // Always include the label so contact info shows topics like "LinkedIn"
  return `${field.label}: ${displayValue}`;
};

// Props interface for persisted state from parent
interface ResumeSectionProps {
  // Persisted job URL state from parent - "From Knowledge Base" section
  interestedJobPositionFromKnowledgeBase: string;
  setInterestedJobPositionFromKnowledgeBase: (value: string) => void;
  fetchedJobDataFromKnowledgeBase: FetchedJobData | null;
  setFetchedJobDataFromKnowledgeBase: (data: FetchedJobData | null) => void;
  isJobUrlValidFromKnowledgeBase: boolean;
  setIsJobUrlValidFromKnowledgeBase: (value: boolean) => void;
  // Persisted job URL state from parent - "From Existing Resume" section
  interestedJobPositionFromExistingResume: string;
  setInterestedJobPositionFromExistingResume: (value: string) => void;
  fetchedJobDataFromExistingResume: FetchedJobData | null;
  setFetchedJobDataFromExistingResume: (data: FetchedJobData | null) => void;
  isJobUrlValidFromExistingResume: boolean;
  setIsJobUrlValidFromExistingResume: (value: boolean) => void;
  // Persisted page navigation state
  showCompanyTypePage: boolean;
  setShowCompanyTypePage: (value: boolean) => void;
  showExistingResumePage: boolean;
  setShowExistingResumePage: (value: boolean) => void;
  // Projects from Knowledge section
  personalProjects: PersonalProject[];
  professionalProjects: ProfessionalProject[];
  futurePersonalProjects: PersonalProject[];
  futureProfessionalProjects: ProfessionalProject[];
  // Technical skills from Knowledge section
  selectedTechnicalSkills: string[];
  selectedFutureTechnicalSkills: string[];
  // Profile data for crafting resume
  basicInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    addressStreet: string;
    addressState: string;
    addressZip: string;
    personalWebsite?: string;
    linkedin?: string;
    links: { name: string; url: string }[];
  };
  education: Array<{
    id: string;
    collegeName: string;
    location: string;
    degrees: Array<{
      id: string;
      degree: string;
      major: string;
      startMonth: string;
      startYear: string;
      endMonth: string;
      endYear: string;
      coursework: string;
    }>;
  }>; // Renamed to educationProp in function body to avoid conflict
  professionalHistory: Array<{
    id: string;
    companyName: string;
    jobTitle: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    isPresent: boolean;
    location: string;
  }>;
  achievements: Array<{
    id: string;
    type: string;
    value: string;
  }>;
  onNavigateToAnalysis?: (data?: {
    resumeFile?: File;
    resumeFileName?: string;
    jobPosition: string;
    fetchedJobData: FetchedJobData | null;
    knowledgeScope: { establishedExpertise: boolean; expandingKnowledgeBase: boolean };
  }) => void;
  cognitoSub?: string;
  onCraftLimitExceeded?: () => void;
}

export default function ResumeSection({
  interestedJobPositionFromKnowledgeBase,
  setInterestedJobPositionFromKnowledgeBase,
  fetchedJobDataFromKnowledgeBase,
  setFetchedJobDataFromKnowledgeBase,
  isJobUrlValidFromKnowledgeBase,
  setIsJobUrlValidFromKnowledgeBase,
  interestedJobPositionFromExistingResume,
  setInterestedJobPositionFromExistingResume,
  fetchedJobDataFromExistingResume,
  setFetchedJobDataFromExistingResume,
  isJobUrlValidFromExistingResume,
  setIsJobUrlValidFromExistingResume,
  showCompanyTypePage,
  setShowCompanyTypePage,
  showExistingResumePage,
  setShowExistingResumePage,
  personalProjects,
  professionalProjects,
  futurePersonalProjects,
  futureProfessionalProjects,
  selectedTechnicalSkills,
  selectedFutureTechnicalSkills,
  basicInfo,
  education: educationProp,
  professionalHistory,
  achievements,
  onNavigateToAnalysis,
  cognitoSub,
  onCraftLimitExceeded,
}: ResumeSectionProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showResumePage, setShowResumePage] = useState<boolean>(false);
  const [resumeMode, setResumeMode] = useState<'industry' | 'targetJob' | 'existing' | null>(null);
  const [hasCachedResume, setHasCachedResume] = useState<boolean>(false);
  
  // Industry Sector page state
  const [interestedCompanyType, setInterestedCompanyType] = useState<string>('');
  // Job input type detection: 'url' | 'job_title' | 'job_description' | null
  type JobInputType = 'url' | 'job_title' | 'job_description' | null;
  const [jobInputType, setJobInputType] = useState<JobInputType>(null);
  // Job URL validation and fetch state (transient UI states - don't need persistence)
  const [jobUrlError, setJobUrlError] = useState<string>('');
  const [isJobUrlFetching, setIsJobUrlFetching] = useState<boolean>(false);
  const [jobUrlFetchFailed, setJobUrlFetchFailed] = useState<boolean>(false);
  const [showJobTooltipAuto, setShowJobTooltipAuto] = useState<boolean>(false);
  const [isCheckmarkFadingOut, setIsCheckmarkFadingOut] = useState<boolean>(false);
  const [isCraftingResume, setIsCraftingResume] = useState<boolean>(false);
  
  // Tooltip state for download and analysis buttons
  const [showDownloadTooltip, setShowDownloadTooltip] = useState<boolean>(false);
  const [showAnalysisTooltip, setShowAnalysisTooltip] = useState<boolean>(false);
  const downloadTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const downloadTooltipHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisTooltipHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [craftingCardIndex, setCraftingCardIndex] = useState<number>(0);
  const craftButtonRef = useRef<HTMLButtonElement>(null);
  const [isJobUrlBlockedFromExistingResume, setIsJobUrlBlockedFromExistingResume] = useState<boolean>(false);
  const [isJobUrlBlockedFromKnowledgeBase, setIsJobUrlBlockedFromKnowledgeBase] = useState<boolean>(false);
  const [blockedMessage, setBlockedMessage] = useState<string>('');
  const jobTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Selected projects state (up to 4 from each section)
  const [selectedPersonalProjectIds, setSelectedPersonalProjectIds] = useState<Set<string>>(new Set());
  const [selectedProfessionalProjectIds, setSelectedProfessionalProjectIds] = useState<Set<string>>(new Set());
  const [selectedTechnicalSkillIds, setSelectedTechnicalSkillIds] = useState<Set<string>>(new Set());
  const [showProjectSelectionPopup, setShowProjectSelectionPopup] = useState<boolean>(false);
  const projectSelectionIconRef = useRef<HTMLDivElement>(null);
  const projectSelectionPopupRef = useRef<HTMLDivElement>(null);
  const projectSelectionPopupTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Future projects selection state
  const [selectedFuturePersonalProjectIds, setSelectedFuturePersonalProjectIds] = useState<Set<string>>(new Set());
  const [selectedFutureProfessionalProjectIds, setSelectedFutureProfessionalProjectIds] = useState<Set<string>>(new Set());
  const [selectedFutureTechnicalSkillIds, setSelectedFutureTechnicalSkillIds] = useState<Set<string>>(new Set());
  const [showFutureProjectSelectionPopup, setShowFutureProjectSelectionPopup] = useState<boolean>(false);
  const futureProjectSelectionIconRef = useRef<HTMLDivElement>(null);
  const futureProjectSelectionPopupRef = useRef<HTMLDivElement>(null);
  const futureProjectSelectionPopupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCompanyTypeDropdownOpen, setIsCompanyTypeDropdownOpen] = useState<boolean>(false);
  const companyTypeDropdownRef = useRef<HTMLDivElement>(null);
  const companyTypeDropdownTriggerRef = useRef<HTMLButtonElement>(null);
  // Dropdown state for resume left column industry sector
  const [isResumeLeftCompanyTypeDropdownOpen, setIsResumeLeftCompanyTypeDropdownOpen] = useState<boolean>(false);
  const resumeLeftCompanyTypeDropdownRef = useRef<HTMLDivElement>(null);
  const resumeLeftCompanyTypeDropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const knowledgeBaseSectionContentRef = useRef<HTMLDivElement>(null);
  const knowledgeBaseJobTooltipRef = useRef<HTMLDivElement>(null);
  const knowledgeBaseTooltipHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isKnowledgeBaseTooltipHovered, setIsKnowledgeBaseTooltipHovered] = useState<boolean>(false);
  const [knowledgeScope, setKnowledgeScope] = useState<{
    establishedExpertise: boolean;
    expandingKnowledgeBase: boolean;
  }>({
    establishedExpertise: true,
    expandingKnowledgeBase: false,
  });
  
  // Saved resume data state (what's displayed on the resume document)
  const [savedName, setSavedName] = useState('Your Name');
  const [savedContactFields, setSavedContactFields] = useState<ContactField[]>([
    { id: 'email', label: 'Email', value: 'your.email@example.com', isDefault: true },
    { id: 'phone', label: 'Phone', value: '+1 (555) 123-4567', isDefault: true },
    { id: 'location', label: 'Location', value: 'City, State, Country', isDefault: true },
    { id: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/yourprofile', isDefault: true }
  ]);
  const [savedProfessionalExperiences, setSavedProfessionalExperiences] = useState<ProfessionalExperience[]>([
    { id: '1', company: 'Company Name', jobTitles: [{ id: '1-1', title: 'Job Title', date: '2020 - Present', bullets: ['Key achievement or responsibility description goes here', 'Another important accomplishment or task description', 'Additional professional experience details'] }] },
    { id: '2', company: 'Previous Company Name', jobTitles: [{ id: '2-1', title: 'Previous Job Title', date: '2018 - 2020', bullets: ['Previous role responsibilities and achievements', 'Notable projects or contributions'] }] }
  ]);
  const [savedEducation, setSavedEducation] = useState<Education[]>([
    { id: '1', university: 'University Name', date: '2014 - 2018', degrees: [{ id: '1-1', degree: 'Degree Name', description: 'GPA: 3.8/4.0 | Relevant coursework or honors' }] }
  ]);
  // Separate saved projects for Established Expertise and Expanding Knowledge Base
  const [savedProjectsEstablished, setSavedProjectsEstablished] = useState<Project[]>([
    { id: '1', name: 'Project Name', date: '2023', description: 'Brief project description highlighting technologies used and outcomes achieved.', bullets: ['Key feature or contribution', 'Technologies: React, TypeScript, Node.js'] },
    { id: '2', name: 'Another Project', date: '2022', description: 'Project description and impact.', bullets: [] }
  ]);
  const [savedProjectsExpanding, setSavedProjectsExpanding] = useState<Project[]>([]);
  const [savedSkills, setSavedSkills] = useState([
    { id: '1', topic: 'Languages', keywords: 'JavaScript, TypeScript, Python, Java' },
    { id: '2', topic: 'Frameworks', keywords: 'React, Next.js, Node.js, Express' },
    { id: '3', topic: 'Tools', keywords: 'Git, Docker, AWS, CI/CD' },
    { id: '4', topic: 'Databases', keywords: 'PostgreSQL, MongoDB, Redis' }
  ]);
  const [savedAchievements, setSavedAchievements] = useState<Array<{ id: string; type: string; value: string }>>([]);

  // Editing state (what's being edited in the left column)
  const [name, setName] = useState('Your Name');
  const [contactFields, setContactFields] = useState<ContactField[]>([
    { id: 'email', label: 'Email', value: 'your.email@example.com', isDefault: true },
    { id: 'phone', label: 'Phone', value: '+1 (555) 123-4567', isDefault: true },
    { id: 'location', label: 'Location', value: 'City, State, Country', isDefault: true },
    { id: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/yourprofile', isDefault: true }
  ]);
  const [industrySector, setIndustrySector] = useState('');
  const [targetJobPosition, setTargetJobPosition] = useState('');
  // Persisted fetched job data for display on refresh
  const [persistedFetchedJobData, setPersistedFetchedJobData] = useState<FetchedJobData | null>(null);
  
  // Track initial values when resume page is shown to detect changes
  const [initialResumePageValues, setInitialResumePageValues] = useState<{
    industrySector: string;
    targetJobPosition: string;
    knowledgeScope: { establishedExpertise: boolean; expandingKnowledgeBase: boolean };
    resumeFile: File | null;
  } | null>(null);
  
  // Editing state for resume document sections
  const [editingSection, setEditingSection] = useState<'name' | 'contact' | 'professional' | 'education' | 'project' | 'technical' | 'achievements' | null>(null);
  const [hoveredSection, setHoveredSection] = useState<'name' | 'contact' | 'professional' | 'education' | 'project' | 'technical' | 'achievements' | null>(null);
  // Debounce timer for hover state changes to prevent vibration when editing panel appears
  const hoverDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Scroll indicator state for left column
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  // Collapsed state for professional experience company sections in the left panel
  const [collapsedProfessionalIds, setCollapsedProfessionalIds] = useState<string[]>([]);
  // Collapsed state for job title sections (Date and Project Bullet Point)
  const [collapsedJobTitleIds, setCollapsedJobTitleIds] = useState<string[]>([]);
  // Collapsed state for project groups (expId-jobTitleId-projectName)
  const [collapsedProjectGroupIds, setCollapsedProjectGroupIds] = useState<Set<string>>(new Set());
  // Collapsed state for education sections in the left panel
  const [collapsedEducationIds, setCollapsedEducationIds] = useState<string[]>([]);
  // Track if education section has been initialized (to collapse all except first)
  const [educationSectionInitialized, setEducationSectionInitialized] = useState(false);
  // State to track which company experience has hover/focus for showing buttons
  const [hoveredProjectOverviewId, setHoveredProjectOverviewId] = useState<string | null>(null);
  const [focusedProjectOverviewId, setFocusedProjectOverviewId] = useState<string | null>(null);
  // State to track which company section is hovered for showing operation buttons
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);
  // State to track which job title field has hover/focus for showing buttons
  const [hoveredJobTitleId, setHoveredJobTitleId] = useState<string | null>(null);
  const [focusedJobTitleId, setFocusedJobTitleId] = useState<string | null>(null);
  // Drag state for job titles
  const [draggedJobTitle, setDraggedJobTitle] = useState<{ expId: string; jobTitleId: string } | null>(null);
  const [dragOverJobTitle, setDragOverJobTitle] = useState<{ expId: string; jobTitleId: string } | null>(null);
  const lastJobTitleDragUpdateRef = useRef<number>(0);
  // State to track which education section is hovered for showing operation buttons
  const [hoveredEducationId, setHoveredEducationId] = useState<string | null>(null);
  // Collapsed state for project sections in the left panel
  const [collapsedProjectIds, setCollapsedProjectIds] = useState<string[]>([]);
  // State to track which project section is hovered for showing operation buttons
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  // Drag state for projects
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverProject, setDragOverProject] = useState<string | null>(null);
  // State to track which professional project group is hovered for showing operation buttons
  const [hoveredProfessionalProjectGroup, setHoveredProfessionalProjectGroup] = useState<{expId: string; jobTitleId: string; groupIdx: number} | null>(null);
  // Drag state for professional project groups
  const [draggedProfessionalProjectGroup, setDraggedProfessionalProjectGroup] = useState<{expId: string; jobTitleId: string; groupIdx: number} | null>(null);
  const [dragOverProfessionalProjectGroup, setDragOverProfessionalProjectGroup] = useState<{expId: string; jobTitleId: string; groupIdx: number} | null>(null);
  // State to track which skill section is hovered for showing operation buttons
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  // Drag state for skills
  const [draggedSkill, setDraggedSkill] = useState<string | null>(null);
  const [dragOverSkill, setDragOverSkill] = useState<string | null>(null);
  // State to track which skill topic is being edited
  const [editingSkillTopicId, setEditingSkillTopicId] = useState<string | null>(null);
  const [editingSkillTopicValue, setEditingSkillTopicValue] = useState<string>('');
  // State to track which contact field is hovered for showing operation buttons
  const [hoveredContactId, setHoveredContactId] = useState<string | null>(null);
  // State to track which contact field label is being edited
  const [editingContactLabelId, setEditingContactLabelId] = useState<string | null>(null);
  const [editingContactLabelValue, setEditingContactLabelValue] = useState<string>('');
  // State to track which project bullet points have hover/focus for showing buttons
  const [hoveredProjectBulletId, setHoveredProjectBulletId] = useState<string | null>(null);
  const [focusedProjectBulletId, setFocusedProjectBulletId] = useState<string | null>(null);
  // Drag state for project bullets
  const [draggedProjectBullet, setDraggedProjectBullet] = useState<{ projId: string; index: number } | null>(null);
  const [dragOverProjectBullet, setDragOverProjectBullet] = useState<{ projId: string; index: number } | null>(null);
  const lastProjectBulletDragUpdateRef = useRef<number>(0);
  // State to track which degree field has hover/focus for showing buttons
  const [hoveredDegreeId, setHoveredDegreeId] = useState<string | null>(null);
  const [focusedDegreeId, setFocusedDegreeId] = useState<string | null>(null);
  const [collapsedDegreeIds, setCollapsedDegreeIds] = useState<string[]>([]);
  // Drag state for degrees
  const [draggedDegree, setDraggedDegree] = useState<{ eduId: string; degreeId: string } | null>(null);
  const [dragOverDegree, setDragOverDegree] = useState<{ eduId: string; degreeId: string } | null>(null);
  const lastDegreeDragUpdateRef = useRef<number>(0);
  
  // Original values when section opens (for change detection)
  const [originalName, setOriginalName] = useState('');
  const [originalContactFields, setOriginalContactFields] = useState<ContactField[]>([]);
  const [originalProfessionalExperiences, setOriginalProfessionalExperiences] = useState<ProfessionalExperience[]>([]);
  const [originalEducation, setOriginalEducation] = useState<Education[]>([]);
  const [originalProjectsEstablished, setOriginalProjectsEstablished] = useState<Project[]>([]);
  const [originalProjectsExpanding, setOriginalProjectsExpanding] = useState<Project[]>([]);
  
  const getCurrentOriginalProjects = (): Project[] => {
    if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
      return originalProjectsExpanding;
    }
    return originalProjectsEstablished;
  };
  
  const setCurrentOriginalProjects = (projects: Project[]) => {
    if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
      setOriginalProjectsExpanding(projects);
    } else if (knowledgeScope.establishedExpertise && knowledgeScope.expandingKnowledgeBase) {
      // When both scopes are selected, set all projects to established and clear expanding
      setOriginalProjectsEstablished(projects);
      setOriginalProjectsExpanding([]);
    } else {
      setOriginalProjectsEstablished(projects);
    }
  };
  const [originalSkills, setOriginalSkills] = useState<Array<{ id: string; topic: string; keywords: string }>>([]);
  
  // Refs for contact info inputs to auto-size them
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for click outside detection
  const resumeHeaderRef = useRef<HTMLDivElement>(null);
  const resumeInfoRowRef = useRef<HTMLDivElement>(null);
  const resumeLeftColumnRef = useRef<HTMLDivElement>(null);
  const resumeDocumentRef = useRef<HTMLDivElement>(null);
  const professionalSectionRef = useRef<HTMLDivElement>(null);
  const educationSectionRef = useRef<HTMLDivElement>(null);
  const projectSectionRef = useRef<HTMLDivElement>(null);
  const technicalSectionRef = useRef<HTMLDivElement>(null);
  
  // Editing state for professional experiences, education, projects, and skills
  const [professionalExperiences, setProfessionalExperiences] = useState<ProfessionalExperience[]>([]);
  
  const [educationData, setEducationData] = useState<Education[]>([
    { id: '1', university: 'University Name', date: '2014 - 2018', degrees: [{ id: '1-1', degree: 'Degree Name', description: 'GPA: 3.8/4.0 | Relevant coursework or honors' }] }
  ]);
  
  // Separate editing projects for Established Expertise and Expanding Knowledge Base
  const [projectsEstablished, setProjectsEstablished] = useState<Project[]>([
    { id: '1', name: 'Project Name', date: '2023', description: 'Brief project description highlighting technologies used and outcomes achieved.', bullets: ['Key feature or contribution', 'Technologies: React, TypeScript, Node.js'] },
    { id: '2', name: 'Another Project', date: '2022', description: 'Project description and impact.', bullets: [] }
  ]);
  const [projectsExpanding, setProjectsExpanding] = useState<Project[]>([]);
  
  // Helper functions to get current active projects based on knowledge scope
  const getCurrentProjects = (): Project[] => {
    if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
      return projectsExpanding;
    }
    if (knowledgeScope.establishedExpertise && knowledgeScope.expandingKnowledgeBase) {
      // When both scopes are selected, combine all projects
      return [...projectsEstablished, ...projectsExpanding];
    }
    return projectsEstablished;
  };
  
  const getCurrentSavedProjects = (): Project[] => {
    if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
      return savedProjectsExpanding;
    }
    if (knowledgeScope.establishedExpertise && knowledgeScope.expandingKnowledgeBase) {
      // When both scopes are selected, combine all projects
      return [...savedProjectsEstablished, ...savedProjectsExpanding];
    }
    return savedProjectsEstablished;
  };
  
  const setCurrentProjects = (updater: Project[] | ((prev: Project[]) => Project[])) => {
    if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
      setProjectsExpanding(updater as (prev: Project[]) => Project[]);
    } else if (knowledgeScope.establishedExpertise && knowledgeScope.expandingKnowledgeBase) {
      // When both scopes are selected, set all projects to established and clear expanding
      // This prevents duplicates when getCurrentProjects combines them
      if (typeof updater === 'function') {
        setProjectsEstablished(updater);
      } else {
        setProjectsEstablished(updater);
      }
      setProjectsExpanding([]);
    } else {
      setProjectsEstablished(updater as (prev: Project[]) => Project[]);
    }
  };
  
  const setCurrentSavedProjects = (projects: Project[]) => {
    if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
      setSavedProjectsExpanding(projects);
    } else if (knowledgeScope.establishedExpertise && knowledgeScope.expandingKnowledgeBase) {
      // When both scopes are selected, save all projects to established and clear expanding
      // This prevents duplicates when getCurrentSavedProjects combines them
      setSavedProjectsEstablished(projects);
      setSavedProjectsExpanding([]);
    } else {
      setSavedProjectsEstablished(projects);
    }
  };
  
  const [skills, setSkills] = useState<Array<{ id: string; topic: string; keywords: string }>>([]);
  
  // localStorage keys
  const STORAGE_KEY = 'resumeSectionState';
  const RESUME_FILE_KEY = 'resumeFileMetadata';
  
  // Flag to prevent saving during initial load
  const isInitialLoadRef = useRef(true);
  
  // Utility functions for localStorage
  const saveResumeState = () => {
    // Don't save during initial load
    if (isInitialLoadRef.current) {
      return;
    }
    try {
      const stateToSave = {
        // Page state
        showResumePage,
        showCompanyTypePage,
        showExistingResumePage,
        resumeMode,
        // Form data
        name,
        contactFields,
        professionalExperiences,
        educationData,
        projectsEstablished,
        projectsExpanding,
        skills,
        industrySector,
        targetJobPosition,
        knowledgeScope,
        interestedCompanyType,
        persistedFetchedJobData,
        // Note: interestedJobPosition is now managed by parent component separately for each section
        // Saved data (what's displayed on resume)
        savedName,
        savedContactFields,
        savedProfessionalExperiences,
        savedEducation,
        savedProjectsEstablished,
        savedProjectsExpanding,
        savedSkills,
        savedAchievements,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      
      // Save resume file metadata (we can't store the file itself)
      if (resumeFile) {
        const fileMetadata = {
          name: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type,
          lastModified: resumeFile.lastModified,
        };
        localStorage.setItem(RESUME_FILE_KEY, JSON.stringify(fileMetadata));
      } else {
        localStorage.removeItem(RESUME_FILE_KEY);
      }
    } catch (error) {
      console.error('Error saving resume state to localStorage:', error);
    }
  };
  
  const loadResumeState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Restore page state
        if (parsed.showResumePage !== undefined) setShowResumePage(parsed.showResumePage);
        if (parsed.showCompanyTypePage !== undefined) setShowCompanyTypePage(parsed.showCompanyTypePage);
        if (parsed.showExistingResumePage !== undefined) setShowExistingResumePage(parsed.showExistingResumePage);
        if (parsed.resumeMode !== undefined) setResumeMode(parsed.resumeMode);
        
        // Restore form data
        if (parsed.name !== undefined) setName(parsed.name);
        if (parsed.contactFields !== undefined) setContactFields(parsed.contactFields);
        if (parsed.professionalExperiences !== undefined) setProfessionalExperiences(parsed.professionalExperiences);
        if (parsed.education !== undefined) setEducationData(parsed.education);
        // Handle both old format (projects) and new format (projectsEstablished/projectsExpanding)
        if (parsed.projectsEstablished !== undefined) {
          setProjectsEstablished(parsed.projectsEstablished);
        } else if (parsed.projects !== undefined) {
          // Migrate old format to established expertise
          setProjectsEstablished(parsed.projects);
        }
        if (parsed.projectsExpanding !== undefined) {
          setProjectsExpanding(parsed.projectsExpanding);
        }
        if (parsed.skills !== undefined) setSkills(parsed.skills);
        if (parsed.industrySector !== undefined) setIndustrySector(parsed.industrySector);
        if (parsed.targetJobPosition !== undefined) setTargetJobPosition(parsed.targetJobPosition);
        if (parsed.knowledgeScope !== undefined) setKnowledgeScope(parsed.knowledgeScope);
        if (parsed.interestedCompanyType !== undefined) setInterestedCompanyType(parsed.interestedCompanyType);
        if (parsed.persistedFetchedJobData !== undefined) setPersistedFetchedJobData(parsed.persistedFetchedJobData);
        // Note: interestedJobPosition is now managed by parent component separately for each section
        
        // Restore saved data
        if (parsed.savedName !== undefined) setSavedName(parsed.savedName);
        if (parsed.savedContactFields !== undefined) setSavedContactFields(parsed.savedContactFields);
        if (parsed.savedProfessionalExperiences !== undefined) setSavedProfessionalExperiences(parsed.savedProfessionalExperiences);
        if (parsed.savedEducation !== undefined) setSavedEducation(parsed.savedEducation);
        // Handle both old format (savedProjects) and new format (savedProjectsEstablished/savedProjectsExpanding)
        if (parsed.savedProjectsEstablished !== undefined) {
          setSavedProjectsEstablished(parsed.savedProjectsEstablished);
        } else if (parsed.savedProjects !== undefined) {
          // Migrate old format to established expertise
          setSavedProjectsEstablished(parsed.savedProjects);
        }
        if (parsed.savedProjectsExpanding !== undefined) {
          setSavedProjectsExpanding(parsed.savedProjectsExpanding);
        }
        if (parsed.savedSkills !== undefined) setSavedSkills(parsed.savedSkills);
        if (parsed.savedAchievements !== undefined) setSavedAchievements(parsed.savedAchievements);
      }
      
      // Note: Resume file cannot be restored from localStorage, user will need to re-upload
      // But we can check if there was a file and show a message
      const fileMetadata = localStorage.getItem(RESUME_FILE_KEY);
      if (fileMetadata) {
        // File was previously uploaded but can't be restored
        // The user will need to re-upload if they want to use it
        setResumeFile(null);
      }
    } catch (error) {
      console.error('Error loading resume state from localStorage:', error);
    }
  };
  
  // Load state on component mount
  useEffect(() => {
    loadResumeState();
    // Mark initial load as complete after a short delay to allow state to settle
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Sync fetchedJobDataFromKnowledgeBase prop to persisted state
  useEffect(() => {
    if (fetchedJobDataFromKnowledgeBase) {
      setPersistedFetchedJobData(fetchedJobDataFromKnowledgeBase);
    }
  }, [fetchedJobDataFromKnowledgeBase]);

  // Save state whenever relevant state changes
  useEffect(() => {
    saveResumeState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showResumePage,
    showCompanyTypePage,
    showExistingResumePage,
    resumeMode,
    name,
    contactFields,
    professionalExperiences,
    educationProp,
    projectsEstablished,
    projectsExpanding,
    skills,
        industrySector,
        targetJobPosition,
        knowledgeScope,
        interestedCompanyType,
        persistedFetchedJobData,
        // Note: interestedJobPosition is now managed by parent component separately for each section
        savedName,
    savedContactFields,
    savedProfessionalExperiences,
    savedEducation,
    savedProjectsEstablished,
    savedProjectsExpanding,
    savedSkills,
    resumeFile,
  ]);
  
  const updateProfessionalExperience = (id: string, field: keyof ProfessionalExperience, value: string | string[]) => {
    setProfessionalExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const toggleProfessionalCollapse = (id: string) => {
    setCollapsedProfessionalIds(prev =>
      prev.includes(id) ? prev.filter(expId => expId !== id) : [...prev, id]
    );
  };

  const toggleJobTitleCollapse = (id: string) => {
    setCollapsedJobTitleIds(prev =>
      prev.includes(id) ? prev.filter(expId => expId !== id) : [...prev, id]
    );
  };

  const toggleProjectGroupCollapse = (expId: string, jobTitleId: string, projectName: string) => {
    const projectKey = `${expId}-${jobTitleId}-${projectName}`;
    setCollapsedProjectGroupIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectKey)) {
        newSet.delete(projectKey);
      } else {
        newSet.add(projectKey);
      }
      return newSet;
    });
  };

  const isProjectGroupCollapsed = (expId: string, jobTitleId: string, projectName: string): boolean => {
    const projectKey = `${expId}-${jobTitleId}-${projectName}`;
    return collapsedProjectGroupIds.has(projectKey);
  };
  
  const updateProfessionalBullet = (expId: string, jobTitleId: string, bulletIndex: number, value: string) => {
    setProfessionalExperiences(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt =>
          jt.id === jobTitleId ? {
            ...jt,
            bullets: jt.bullets.map((bullet, idx) => idx === bulletIndex ? value : bullet)
          } : jt
        )
      } : exp
    ));
  };
  
  const addProfessionalBullet = (expId: string, jobTitleId: string) => {
    setProfessionalExperiences(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt =>
          jt.id === jobTitleId ? { ...jt, bullets: [...jt.bullets, ''] } : jt
        )
      } : exp
    ));
  };

  const deleteProfessionalBullet = (expId: string, jobTitleId: string, bulletIndex: number) => {
    setProfessionalExperiences(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt =>
          jt.id === jobTitleId ? {
            ...jt,
            bullets: jt.bullets.filter((_, idx) => idx !== bulletIndex)
          } : jt
        )
      } : exp
    ));
  };

  const addProfessionalProjectBullet = (expId: string, jobTitleId: string, projectName: string) => {
    setProfessionalExperiences(prev => prev.map(exp => 
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt => {
          if (jt.id !== jobTitleId) return jt;
          
          const projectHeaderIndex = jt.bullets.findIndex(bullet => bullet === `${PROJECT_HEADER_PREFIX}${projectName}`);
          if (projectHeaderIndex === -1) return jt;
          
          // Find the last bullet index for this project (before next project header or end)
          const nextProjectHeaderIndex = jt.bullets.findIndex((bullet, idx) => 
            idx > projectHeaderIndex && bullet.startsWith(PROJECT_HEADER_PREFIX)
          );
          
          const insertIndex = nextProjectHeaderIndex === -1 
            ? jt.bullets.length 
            : nextProjectHeaderIndex;
          
          const newBullets = [...jt.bullets];
          newBullets.splice(insertIndex, 0, '');
          
          return {
            ...jt,
            bullets: newBullets
          };
        })
      } : exp
    ));
  };

  const deleteProfessionalProjectGroup = (expId: string, jobTitleId: string, projectName: string) => {
    setProfessionalExperiences(prev => prev.map(exp =>
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt =>
          jt.id === jobTitleId ? {
            ...jt,
            bullets: jt.bullets.filter(bullet => {
              // Remove the project header and all bullets until the next project header
              if (bullet === `${PROJECT_HEADER_PREFIX}${projectName}`) {
                return false;
              }
              // Check if this bullet belongs to the project being deleted
              const projectHeaderIndex = jt.bullets.indexOf(`${PROJECT_HEADER_PREFIX}${projectName}`);
              if (projectHeaderIndex === -1) return true;

              const bulletIndex = jt.bullets.indexOf(bullet);
              const nextProjectHeaderIndex = jt.bullets.findIndex((b, idx) =>
                idx > projectHeaderIndex && b.startsWith(PROJECT_HEADER_PREFIX)
              );

              // If between this project header and next (or end), remove it
              if (bulletIndex > projectHeaderIndex &&
                  (nextProjectHeaderIndex === -1 || bulletIndex < nextProjectHeaderIndex)) {
                return false;
              }
              return true;
            }),
            projectTechnologies: jt.projectTechnologies ?
              Object.fromEntries(
                Object.entries(jt.projectTechnologies).filter(([name]) => name !== projectName)
              ) : undefined
          } : jt
        )
      } : exp
    ));
  };

  const reorderProfessionalProjectGroups = (expId: string, jobTitleId: string, fromIdx: number, toIdx: number) => {
    setProfessionalExperiences(prev => prev.map(exp =>
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt => {
          if (jt.id !== jobTitleId) return jt;

          // Build project groups
          interface ProjectGroup {
            name: string;
            bullets: string[];
          }
          const projectGroups: ProjectGroup[] = [];
          let currentGroup: ProjectGroup | null = null;

          jt.bullets.forEach(bullet => {
            if (bullet.startsWith(PROJECT_HEADER_PREFIX)) {
              if (currentGroup) projectGroups.push(currentGroup);
              currentGroup = {
                name: bullet.slice(PROJECT_HEADER_PREFIX.length).trim(),
                bullets: [bullet]
              };
            } else if (currentGroup) {
              currentGroup.bullets.push(bullet);
            }
          });
          if (currentGroup) projectGroups.push(currentGroup);

          // Reorder groups
          const [movedGroup] = projectGroups.splice(fromIdx, 1);
          projectGroups.splice(toIdx, 0, movedGroup);

          // Flatten back to bullets array
          const newBullets = projectGroups.flatMap(g => g.bullets);

          return { ...jt, bullets: newBullets };
        })
      } : exp
    ));
  };

  const updateProjectTechnologies = (expId: string, jobTitleId: string, projectName: string, technologies: string | string[]) => {
    setProfessionalExperiences(prev => prev.map(exp =>
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt =>
          jt.id === jobTitleId ? {
            ...jt,
            projectTechnologies: {
              ...(jt.projectTechnologies || {}),
              [projectName]: technologies
            }
          } : jt
        )
      } : exp
    ));
  };

  const removeProfessionalExperience = (expId: string) => {
    setProfessionalExperiences(prev => prev.filter(exp => exp.id !== expId));
    // Also remove from collapsed list if it was there
    setCollapsedProfessionalIds(prev => prev.filter(id => id !== expId));
  };

  const addProfessionalExperience = () => {
    const newId = Date.now().toString();
    const newExperience: ProfessionalExperience = {
      id: newId,
      company: '',
      jobTitles: [{ id: Date.now().toString() + '-1', title: '', date: '', bullets: [''] }]
    };
    setProfessionalExperiences(prev => [newExperience, ...prev]);
  };

  const addJobTitle = (expId: string) => {
    setProfessionalExperiences(prev => prev.map(exp =>
      exp.id === expId ? {
        ...exp,
        jobTitles: [{ id: Date.now().toString(), title: '', date: '', bullets: [''] }, ...exp.jobTitles]
      } : exp
    ));
  };

  const removeJobTitle = (expId: string, jobTitleId: string) => {
    setProfessionalExperiences(prev => prev.map(exp =>
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.filter(jt => jt.id !== jobTitleId)
      } : exp
    ));
  };

  const updateJobTitle = (expId: string, jobTitleId: string, field: keyof JobTitle, value: string | string[]) => {
    setProfessionalExperiences(prev => prev.map(exp =>
      exp.id === expId ? {
        ...exp,
        jobTitles: exp.jobTitles.map(jt =>
          jt.id === jobTitleId ? { ...jt, [field]: value } : jt
        )
      } : exp
    ));
  };

  // Drag handlers for job titles
  const handleJobTitleDragStart = (e: React.DragEvent<HTMLElement>, expId: string, jobTitleId: string) => {
    setDraggedJobTitle({ expId, jobTitleId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleJobTitleDragOver = (e: React.DragEvent<HTMLDivElement>, expId: string, jobTitleId: string) => {
    e.preventDefault();
    if (!draggedJobTitle || (draggedJobTitle.expId === expId && draggedJobTitle.jobTitleId === jobTitleId)) return;

    const now = Date.now();
    if (now - lastJobTitleDragUpdateRef.current < 25) {
      return;
    }
    lastJobTitleDragUpdateRef.current = now;

    setDragOverJobTitle({ expId, jobTitleId });

    const exp = professionalExperiences.find(e => e.id === expId);
    if (!exp) return;

    const draggedIndex = exp.jobTitles.findIndex(jt => jt.id === draggedJobTitle.jobTitleId);
    const targetIndex = exp.jobTitles.findIndex(jt => jt.id === jobTitleId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setProfessionalExperiences(prev => prev.map(exp => {
      if (exp.id !== expId) return exp;
      const jobTitles = [...exp.jobTitles];
      const [moved] = jobTitles.splice(draggedIndex, 1);
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > jobTitles.length) insertIndex = jobTitles.length;

      jobTitles.splice(insertIndex, 0, moved);
      return { ...exp, jobTitles };
    }));
  };

  const handleJobTitleDragEnd = () => {
    setDraggedJobTitle(null);
    setDragOverJobTitle(null);
  };

  const addEducation = () => {
    const newId = Date.now().toString();
    const newEducation: Education = {
      id: newId,
      university: '',
      date: '',
      degrees: [{ id: Date.now().toString() + '-1', degree: '', description: '' }]
    };
    setEducationData(prev => [newEducation, ...prev]);
  };

  const addDegree = (eduId: string) => {
    setEducationData(prev => prev.map(edu =>
      edu.id === eduId ? {
        ...edu,
        degrees: [{ id: Date.now().toString(), degree: '', description: '' }, ...edu.degrees]
      } : edu
    ));
  };

  const removeDegree = (eduId: string, degreeId: string) => {
    setEducationData(prev => prev.map(edu =>
      edu.id === eduId ? {
        ...edu,
        degrees: edu.degrees.filter(deg => deg.id !== degreeId)
      } : edu
    ));
  };

  const updateDegree = (eduId: string, degreeId: string, field: keyof Degree, value: string) => {
    setEducationData(prev => prev.map(edu =>
      edu.id === eduId ? {
        ...edu,
        degrees: edu.degrees.map(deg =>
          deg.id === degreeId ? { ...deg, [field]: value } : deg
        )
      } : edu
    ));
  };

  const handleDegreeDragStart = (e: React.DragEvent<HTMLElement>, eduId: string, degreeId: string) => {
    setDraggedDegree({ eduId, degreeId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDegreeDragOver = (e: React.DragEvent<HTMLDivElement>, eduId: string, degreeId: string) => {
    e.preventDefault();
    if (!draggedDegree || draggedDegree.eduId !== eduId) return;
    if (draggedDegree.degreeId === degreeId) return;

    const now = Date.now();
    if (now - lastDegreeDragUpdateRef.current < 25) {
      return;
    }
    lastDegreeDragUpdateRef.current = now;

    setDragOverDegree({ eduId, degreeId });

    const edu = educationData.find(e => e.id === eduId);
    if (!edu) return;

    const normalizedEdu = normalizeEducation(edu);
    const draggedIndex = normalizedEdu.degrees.findIndex(d => d.id === draggedDegree.degreeId);
    const targetIndex = normalizedEdu.degrees.findIndex(d => d.id === degreeId);

    if (draggedIndex === -1 || targetIndex === -1) return;
    if (draggedIndex === targetIndex) return;

    const targetElement = e.currentTarget;
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setEducationData(prev => {
      const prevEdu = prev.find(e => e.id === eduId);
      if (!prevEdu) return prev;

      const prevNormalizedEdu = normalizeEducation(prevEdu);
      const degrees = [...prevNormalizedEdu.degrees];
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > degrees.length) insertIndex = degrees.length;

      const [moved] = degrees.splice(draggedIndex, 1);
      degrees.splice(insertIndex, 0, moved);

      return prev.map(e => 
        e.id === eduId ? { ...e, degrees } : e
      );
    });
  };

  const handleDegreeDragEnd = () => {
    setDraggedDegree(null);
    setDragOverDegree(null);
  };

  // Drag state for professional experience bullet points
  const [draggedBullet, setDraggedBullet] = useState<{ expId: string; jobTitleId: string; index: number } | null>(null);
  const [dragOverBullet, setDragOverBullet] = useState<{ expId: string; jobTitleId: string; index: number } | null>(null);
  const lastBulletDragUpdateRef = useRef<number>(0);

  // Drag state for company sections
  const [draggedCompany, setDraggedCompany] = useState<string | null>(null);
  const [dragOverCompany, setDragOverCompany] = useState<string | null>(null);
  const lastCompanyDragUpdateRef = useRef<number>(0);
  
  // Drag state for education sections
  const [draggedEducation, setDraggedEducation] = useState<string | null>(null);
  const [dragOverEducation, setDragOverEducation] = useState<string | null>(null);
  const lastEducationDragUpdateRef = useRef<number>(0);

  const handleBulletDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    expId: string,
    jobTitleId: string,
    index: number
  ) => {
    setDraggedBullet({ expId, jobTitleId, index });
    e.dataTransfer.effectAllowed = 'move';
    // Use default drag preview from the browser for simplicity
  };

  const handleBulletDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    expId: string,
    jobTitleId: string,
    targetIndex: number
  ) => {
    e.preventDefault();
    if (!draggedBullet || draggedBullet.expId !== expId || draggedBullet.jobTitleId !== jobTitleId) return;

    const now = Date.now();
    // Throttle slightly for smoother, but still very responsive, animation
    if (now - lastBulletDragUpdateRef.current < 25) {
      return;
    }
    lastBulletDragUpdateRef.current = now;

    setDragOverBullet({ expId, jobTitleId, index: targetIndex });

    if (draggedBullet.index === targetIndex) return;

    const targetElement = e.currentTarget;
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setProfessionalExperiences(prev =>
      prev.map(exp => {
        if (exp.id !== expId) return exp;
        const jobTitles = exp.jobTitles.map(jt => {
          if (jt.id !== jobTitleId) return jt;
          const bullets = [...jt.bullets];
          const from = draggedBullet.index;
          let to = position === 'above' ? targetIndex : targetIndex + 1;

          // Adjust target index if removing from before target
          if (from < targetIndex && position === 'below') {
            to -= 1;
          }
          if (from > targetIndex && position === 'above') {
            // no change
          }

          if (to < 0) to = 0;
          if (to > bullets.length) to = bullets.length;

          const [moved] = bullets.splice(from, 1);
          bullets.splice(to, 0, moved);

          // Update dragged index so subsequent dragOver uses new position
          setDraggedBullet({ expId, jobTitleId, index: to });

          return { ...jt, bullets };
        });
        return { ...exp, jobTitles };
      })
    );
  };

  const handleBulletDragEnd = () => {
    setDraggedBullet(null);
    setDragOverBullet(null);
  };

  // Drag handlers for company sections
  const handleCompanyDragStart = (e: React.DragEvent<HTMLElement>, expId: string) => {
    setDraggedCompany(expId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCompanyDragOver = (e: React.DragEvent<HTMLDivElement>, targetExpId: string) => {
    e.preventDefault();
    if (!draggedCompany || draggedCompany === targetExpId) return;

    const now = Date.now();
    if (now - lastCompanyDragUpdateRef.current < 25) {
      return;
    }
    lastCompanyDragUpdateRef.current = now;

    setDragOverCompany(targetExpId);

    const draggedIndex = professionalExperiences.findIndex(exp => exp.id === draggedCompany);
    const targetIndex = professionalExperiences.findIndex(exp => exp.id === targetExpId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setProfessionalExperiences(prev => {
      const newExperiences = [...prev];
      const [moved] = newExperiences.splice(draggedIndex, 1);
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > newExperiences.length) insertIndex = newExperiences.length;

      newExperiences.splice(insertIndex, 0, moved);
      return newExperiences;
    });
  };

  const handleCompanyDragEnd = () => {
    setDraggedCompany(null);
    setDragOverCompany(null);
  };
  
  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setCurrentProjects(prev => prev.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };
  
  const updateProjectBullet = (projId: string, bulletIndex: number, value: string) => {
    setCurrentProjects(prev => prev.map(proj => 
      proj.id === projId ? {
        ...proj,
        bullets: proj.bullets.map((bullet, idx) => idx === bulletIndex ? value : bullet)
      } : proj
    ));
  };
  
  const addProject = () => {
    const newId = Date.now().toString();
    const newProject: Project = {
      id: newId,
      name: '',
      date: '',
      description: '',
      bullets: ['']
    };
    setCurrentProjects(prev => [newProject, ...prev]);
  };

  const addProjectBullet = (projId: string) => {
    setCurrentProjects(prev => prev.map(proj =>
      proj.id === projId ? { ...proj, bullets: [...proj.bullets, ''] } : proj
    ));
  };

  const deleteProjectBullet = (projId: string, bulletIndex: number) => {
    setCurrentProjects(prev => prev.map(proj =>
      proj.id === projId ? {
        ...proj,
        bullets: proj.bullets.filter((_, idx) => idx !== bulletIndex)
      } : proj
    ));
  };

  const handleProjectBulletDragStart = (e: React.DragEvent<HTMLElement>, projId: string, bulletIndex: number) => {
    setDraggedProjectBullet({ projId, index: bulletIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectBulletDragOver = (e: React.DragEvent<HTMLDivElement>, projId: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedProjectBullet || draggedProjectBullet.projId !== projId) return;

    const now = Date.now();
    if (now - lastProjectBulletDragUpdateRef.current < 25) {
      return;
    }
    lastProjectBulletDragUpdateRef.current = now;

    setDragOverProjectBullet({ projId, index: targetIndex });

    if (draggedProjectBullet.index === targetIndex) return;

    const targetElement = e.currentTarget;
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setCurrentProjects(prev => prev.map(p => {
      if (p.id !== projId) return p;
      const bullets = [...p.bullets];
      const from = draggedProjectBullet.index;
      let to = position === 'above' ? targetIndex : targetIndex + 1;

      // Adjust target index if removing from before target
      if (from < targetIndex && position === 'below') {
        to -= 1;
      }
      if (from > targetIndex && position === 'above') {
        // no change
      }

      if (to < 0) to = 0;
      if (to > bullets.length) to = bullets.length;

      const [moved] = bullets.splice(from, 1);
      bullets.splice(to, 0, moved);

      // Update dragged index so subsequent dragOver uses new position
      setDraggedProjectBullet({ projId, index: to });

      return { ...p, bullets };
    }));
  };

  const handleProjectBulletDragEnd = () => {
    setDraggedProjectBullet(null);
    setDragOverProjectBullet(null);
  };

  const toggleProjectCollapse = (id: string) => {
    setCollapsedProjectIds(prev =>
      prev.includes(id) ? prev.filter(projId => projId !== id) : [...prev, id]
    );
  };

  const removeProject = (id: string) => {
    setCurrentProjects(prev => prev.filter(proj => proj.id !== id));
  };

  const handleProjectDragStart = (e: React.DragEvent<HTMLElement>, projId: string) => {
    setDraggedProject(projId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragOver = (e: React.DragEvent<HTMLDivElement>, targetProjId: string) => {
    e.preventDefault();
    if (!draggedProject || draggedProject === targetProjId) return;

    const targetElement = e.currentTarget;
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setCurrentProjects(prev => {
      const draggedIndex = prev.findIndex(p => p.id === draggedProject);
      const targetIndex = prev.findIndex(p => p.id === targetProjId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newProjects = [...prev];
      const [moved] = newProjects.splice(draggedIndex, 1);
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > newProjects.length) insertIndex = newProjects.length;

      newProjects.splice(insertIndex, 0, moved);
      return newProjects;
    });

    setDragOverProject(targetProjId);
  };

  const handleProjectDragEnd = () => {
    setDraggedProject(null);
    setDragOverProject(null);
  };

  const removeSkill = (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };

  const handleSkillDragStart = (e: React.DragEvent<HTMLElement>, skillId: string) => {
    setDraggedSkill(skillId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSkillDragOver = (e: React.DragEvent<HTMLDivElement>, targetSkillId: string) => {
    e.preventDefault();
    if (!draggedSkill || draggedSkill === targetSkillId) return;

    const targetElement = e.currentTarget;
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setSkills(prev => {
      const draggedIndex = prev.findIndex(s => s.id === draggedSkill);
      const targetIndex = prev.findIndex(s => s.id === targetSkillId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newSkills = [...prev];
      const [moved] = newSkills.splice(draggedIndex, 1);
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > newSkills.length) insertIndex = newSkills.length;

      newSkills.splice(insertIndex, 0, moved);
      return newSkills;
    });

    setDragOverSkill(targetSkillId);
  };

  const handleSkillDragEnd = () => {
    setDraggedSkill(null);
    setDragOverSkill(null);
  };
  
  // Helper function to normalize education entries to new structure
  const normalizeEducation = (edu: any): Education => {
    if (edu.degrees && Array.isArray(edu.degrees)) {
      return edu as Education;
    }
    // Migrate old structure to new structure
    return {
      id: edu.id,
      university: edu.university || '',
      date: edu.date || '',
      degrees: [{
        id: edu.id + '-degree-1',
        degree: edu.degree || '',
        description: edu.description || ''
      }]
    };
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducationData(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const toggleEducationCollapse = (id: string) => {
    setCollapsedEducationIds(prev =>
      prev.includes(id) ? prev.filter(eduId => eduId !== id) : [...prev, id]
    );
  };

  const toggleDegreeCollapse = (eduId: string) => {
    setCollapsedDegreeIds(prev =>
      prev.includes(eduId) ? prev.filter(id => id !== eduId) : [...prev, eduId]
    );
  };

  const removeEducation = (eduId: string) => {
        setEducationData(prev => prev.filter(edu => edu.id !== eduId));
    // Also remove from collapsed list if it was there
    setCollapsedEducationIds(prev => prev.filter(id => id !== eduId));
  };

  // Drag handlers for education sections
  const handleEducationDragStart = (e: React.DragEvent<HTMLElement>, eduId: string) => {
    setDraggedEducation(eduId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEducationDragOver = (e: React.DragEvent<HTMLDivElement>, targetEduId: string) => {
    e.preventDefault();
    if (!draggedEducation || draggedEducation === targetEduId) return;

    const now = Date.now();
    if (now - lastEducationDragUpdateRef.current < 25) {
      return;
    }
    lastEducationDragUpdateRef.current = now;

    setDragOverEducation(targetEduId);

    const draggedIndex = educationData.findIndex(edu => edu.id === draggedEducation);
    const targetIndex = educationData.findIndex(edu => edu.id === targetEduId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setEducationData(prev => {
      const newEducation = [...prev];
      const [moved] = newEducation.splice(draggedIndex, 1);
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > newEducation.length) insertIndex = newEducation.length;

      newEducation.splice(insertIndex, 0, moved);
      return newEducation;
    });
  };

  const handleEducationDragEnd = () => {
    setDraggedEducation(null);
    setDragOverEducation(null);
  };

  // Contact field helpers
  const updateContactField = (id: string, field: 'label' | 'value', value: string) => {
    setContactFields(prev => prev.map(fieldItem => 
      fieldItem.id === id ? { ...fieldItem, [field]: value } : fieldItem
    ));
  };

  const addContactField = () => {
    const newId = `contact-${Date.now()}`;
    setContactFields(prev => [...prev, { id: newId, label: 'New Field', value: '', isDefault: false }]);
  };

  const removeContactField = (id: string) => {
    setContactFields(prev => prev.filter(field => field.id !== id));
  };

  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [dragOverContactId, setDragOverContactId] = useState<string | null>(null);
  const lastContactDragUpdateRef = useRef<number>(0);

  const handleContactDragStart = (e: React.DragEvent<HTMLElement>, contactId: string) => {
    setDraggedContactId(contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleContactDragOver = (e: React.DragEvent<HTMLDivElement>, targetContactId: string) => {
    e.preventDefault();
    if (!draggedContactId || draggedContactId === targetContactId) return;

    const now = Date.now();
    if (now - lastContactDragUpdateRef.current < 25) {
      return;
    }
    lastContactDragUpdateRef.current = now;

    const targetElement = e.currentTarget;
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'above' : 'below';

    setDragOverContactId(targetContactId);

    setContactFields(prev => {
      const draggedIndex = prev.findIndex(f => f.id === draggedContactId);
      const targetIndex = prev.findIndex(f => f.id === targetContactId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;
      if (draggedIndex === targetIndex) return prev;

      const newFields = [...prev];
      let insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

      if (draggedIndex < targetIndex && position === 'below') {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > newFields.length) insertIndex = newFields.length;

      const [moved] = newFields.splice(draggedIndex, 1);
      newFields.splice(insertIndex, 0, moved);

      return newFields;
    });
  };

  const handleContactDragEnd = () => {
    setDraggedContactId(null);
    setDragOverContactId(null);
  };

  const handleContactSectionClick = () => {
    if (editingSection === 'contact') {
      // Closing the section - revert changes
      setContactFields(JSON.parse(JSON.stringify(savedContactFields)));
      setEditingSection(null);
      setHoveredSection(null);
      setOriginalContactFields([]);
    } else {
      // Opening the section - initialize contactFields with savedContactFields to preserve display
      setContactFields(JSON.parse(JSON.stringify(savedContactFields)));
      setOriginalContactFields(JSON.parse(JSON.stringify(savedContactFields)));
      setEditingSection('contact');
      setHoveredSection('contact');
    }
  };


  // Determine which section to display in the left column
  // If hovering over a different section than the one being edited, show hovered section
  // Otherwise, show the editing section (if any)
  const getDisplayedSection = (): 'name' | 'contact' | 'professional' | 'education' | 'project' | 'technical' | 'achievements' | null => {
    if (hoveredSection && hoveredSection !== editingSection) {
      return hoveredSection;
    }
    return editingSection;
  };

  // Initialize editing values from saved values when section opens or is hovered
  useEffect(() => {
    const displayedSection = getDisplayedSection();
    
    if (displayedSection === 'name') {
      // Only initialize if not already editing this section (to preserve changes)
      if (editingSection !== 'name') {
        setOriginalName(savedName);
        setName(savedName);
      }
    } else if (displayedSection === 'contact') {
      if (editingSection !== 'contact') {
        setOriginalContactFields(JSON.parse(JSON.stringify(savedContactFields)));
        setContactFields(JSON.parse(JSON.stringify(savedContactFields)));
      }
    } else if (displayedSection === 'professional') {
      if (editingSection !== 'professional') {
        setOriginalProfessionalExperiences(JSON.parse(JSON.stringify(savedProfessionalExperiences)));
        setProfessionalExperiences(JSON.parse(JSON.stringify(savedProfessionalExperiences)));
      }
    } else if (displayedSection === 'education') {
      if (editingSection !== 'education') {
        const normalizedEducation = savedEducation.map(normalizeEducation);
        setOriginalEducation(JSON.parse(JSON.stringify(normalizedEducation)));
        setEducationData(JSON.parse(JSON.stringify(normalizedEducation)));
      }
      // Collapse all education entries except the first one when section is first displayed
      if (!educationSectionInitialized && educationData.length > 0) {
        const allEducationIds = educationData.map(edu => edu.id);
        const firstEducationId = educationData[0].id;
        const idsToCollapse = allEducationIds.filter(id => id !== firstEducationId);
        setCollapsedEducationIds(idsToCollapse);
        setEducationSectionInitialized(true);
      }
    } else if (displayedSection === 'project') {
      if (editingSection !== 'project') {
        const currentSaved = getCurrentSavedProjects();
        setCurrentOriginalProjects(JSON.parse(JSON.stringify(currentSaved)));
        setCurrentProjects(JSON.parse(JSON.stringify(currentSaved)));
      }
    } else if (displayedSection === 'technical') {
      if (editingSection !== 'technical') {
        setOriginalSkills(JSON.parse(JSON.stringify(savedSkills)));
        setSkills(JSON.parse(JSON.stringify(savedSkills)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSection, hoveredSection, educationData, educationSectionInitialized]);

  // Reset education section initialization flag when leaving education section
  useEffect(() => {
    const displayedSection = getDisplayedSection();
    if (displayedSection !== 'education' && educationSectionInitialized) {
      setEducationSectionInitialized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSection, hoveredSection, educationSectionInitialized]);

  // Switch projects when knowledge scope changes
  useEffect(() => {
    // If we're currently editing projects, switch to the correct set
    if (editingSection === 'project') {
      const currentSaved = getCurrentSavedProjects();
      setCurrentOriginalProjects(JSON.parse(JSON.stringify(currentSaved)));
      setCurrentProjects(JSON.parse(JSON.stringify(currentSaved)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeScope.establishedExpertise, knowledgeScope.expandingKnowledgeBase]);

  // Constrain tooltip position so it never goes above sectionContent
  useEffect(() => {
    if (!fetchedJobDataFromKnowledgeBase || !knowledgeBaseSectionContentRef.current || !knowledgeBaseJobTooltipRef.current) {
      return;
    }

    const constrainTooltipPosition = () => {
      const sectionContent = knowledgeBaseSectionContentRef.current;
      const tooltip = knowledgeBaseJobTooltipRef.current;
      
      if (!sectionContent || !tooltip) return;
      
      const inputWrapper = tooltip.parentElement; // Now parent is jobUrlInputWrapper
      if (!inputWrapper) return;
      
      const sectionTop = sectionContent.getBoundingClientRect().top;
      const inputWrapperBottom = inputWrapper.getBoundingClientRect().bottom;
      const availableSpace = inputWrapperBottom - sectionTop - 4; // 4px for gap
      
      // Set max-height to ensure tooltip never extends above sectionContent
      const maxHeight = Math.min(250, Math.max(150, availableSpace));
      tooltip.style.maxHeight = `${maxHeight}px`;
    };

    // Constrain initially
    constrainTooltipPosition();
    
    // Constrain on window resize and scroll
    window.addEventListener('resize', constrainTooltipPosition);
    window.addEventListener('scroll', constrainTooltipPosition, true);
    
    // Also check periodically when tooltip might be visible (on hover)
    const intervalId = setInterval(() => {
      const tooltip = knowledgeBaseJobTooltipRef.current;
      if (tooltip && tooltip.offsetParent !== null) { // Tooltip is visible
        constrainTooltipPosition();
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', constrainTooltipPosition);
      window.removeEventListener('scroll', constrainTooltipPosition, true);
      clearInterval(intervalId);
    };
  }, [fetchedJobDataFromKnowledgeBase]);

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (knowledgeBaseTooltipHoverTimerRef.current) {
        clearTimeout(knowledgeBaseTooltipHoverTimerRef.current);
        knowledgeBaseTooltipHoverTimerRef.current = null;
      }
    };
  }, []);

  // Handle card switching for crafting popup
  useEffect(() => {
    if (!isCraftingResume) {
      return;
    }

    // Don't set up interval if we're already on the last card (index 5)
    if (craftingCardIndex >= 5) {
      return;
    }

    const intervalId = setInterval(() => {
      setCraftingCardIndex((prevIndex) => {
        // Stop at card 6 (index 5)
        if (prevIndex >= 5) {
          return 5;
        }
        return prevIndex + 1;
      });
    }, 7000); // Switch every 7 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [isCraftingResume, craftingCardIndex]);

  // Check if there are changes in the current editing section
  const hasChanges = (): boolean => {
    if (editingSection === 'name') {
      return name !== originalName;
    } else if (editingSection === 'contact') {
      return JSON.stringify(contactFields) !== JSON.stringify(originalContactFields);
    } else if (editingSection === 'professional') {
      return JSON.stringify(professionalExperiences) !== JSON.stringify(originalProfessionalExperiences);
    } else if (editingSection === 'education') {
      return JSON.stringify(educationData) !== JSON.stringify(originalEducation);
    } else if (editingSection === 'project') {
      const currentProjects = getCurrentProjects();
      const currentOriginal = getCurrentOriginalProjects();
      return JSON.stringify(currentProjects) !== JSON.stringify(currentOriginal);
    } else if (editingSection === 'technical') {
      return JSON.stringify(skills) !== JSON.stringify(originalSkills);
    }
    return false;
  };

  // Auto-save when name changes (only when editing name section)
  useEffect(() => {
    if (editingSection === 'name' && name !== savedName) {
      setSavedName(name);
    }
  }, [name, editingSection, savedName]);

  // Auto-save when contact fields change (only when editing contact section)
  useEffect(() => {
    if (editingSection === 'contact') {
      setSavedContactFields(JSON.parse(JSON.stringify(contactFields)));
    }
  }, [contactFields, editingSection]);

  // Auto-save when professional experiences change (only when editing professional section)
  useEffect(() => {
    if (editingSection === 'professional') {
      setSavedProfessionalExperiences(JSON.parse(JSON.stringify(professionalExperiences)));
    }
  }, [professionalExperiences, editingSection]);

  // Auto-save when education data changes (only when editing education section)
  useEffect(() => {
    if (editingSection === 'education') {
      setSavedEducation(JSON.parse(JSON.stringify(educationData)));
    }
  }, [educationData, editingSection]);

  // Auto-save when projects change (only when editing project section)
  useEffect(() => {
    if (editingSection === 'project') {
      const currentProjects = getCurrentProjects();
      setCurrentSavedProjects(JSON.parse(JSON.stringify(currentProjects)));
    }
  }, [projectsEstablished, projectsExpanding, editingSection, knowledgeScope]);

  // Auto-save when skills change (only when editing technical section)
  useEffect(() => {
    if (editingSection === 'technical') {
      setSavedSkills(JSON.parse(JSON.stringify(skills)));
    }
  }, [skills, editingSection]);

  // Check if any field in resume left column has been updated
  const hasResumeLeftFieldsChanged = () => {
    if (!initialResumePageValues) return false;
    
    // Check if industry sector or job position changed
    const companyTypeChanged = industrySector !== initialResumePageValues.industrySector;
    const jobPositionChanged = targetJobPosition !== initialResumePageValues.targetJobPosition;
    
    // Check if knowledge scope changed (for "From Knowledge Base" mode)
    const knowledgeScopeChanged = 
      resumeMode === 'industry' &&
      (knowledgeScope.establishedExpertise !== initialResumePageValues.knowledgeScope.establishedExpertise ||
       knowledgeScope.expandingKnowledgeBase !== initialResumePageValues.knowledgeScope.expandingKnowledgeBase);
    
    // Check if resume file changed (for "From Existing Resume" mode)
    const resumeFileChanged = 
      resumeMode === 'existing' &&
      resumeFile !== initialResumePageValues.resumeFile;
    
    return companyTypeChanged || jobPositionChanged || knowledgeScopeChanged || resumeFileChanged;
  };

  const handleConstructResume = () => {
    // Placeholder for construct resume functionality
    console.log('Constructing resume with:', { industrySector, targetJobPosition, knowledgeScope, resumeFile });
  };

  const handleCompanyTypeNext = async () => {
    // Validate that we have the required data
    if (!interestedCompanyType && !interestedJobPositionFromKnowledgeBase) {
      return;
    }

    // Check if we need to craft resume from knowledge base
    const shouldCraftFromKnowledgeBase = 
      (knowledgeScope.establishedExpertise && (selectedPersonalProjectIds.size > 0 || selectedProfessionalProjectIds.size > 0 || selectedTechnicalSkillIds.size > 0)) ||
      (knowledgeScope.expandingKnowledgeBase && (selectedFuturePersonalProjectIds.size > 0 || selectedFutureProfessionalProjectIds.size > 0 || selectedFutureTechnicalSkillIds.size > 0));

    if (shouldCraftFromKnowledgeBase) {
      setHasCachedResume(false);
      setIsCraftingResume(true);
      setCraftingCardIndex(0); // Reset to first card
      
      try {
        // Prepare selected projects
        const selectedPersonalProjects = personalProjects.filter(p => selectedPersonalProjectIds.has(p.id));
        const selectedProfessionalProjects = professionalProjects.filter(p => selectedProfessionalProjectIds.has(p.id));
        const selectedFuturePersonalProjects = futurePersonalProjects.filter(p => selectedFuturePersonalProjectIds.has(p.id));
        const selectedFutureProfessionalProjects = futureProfessionalProjects.filter(p => selectedFutureProfessionalProjectIds.has(p.id));
        
        // Combine technical skills
        const combinedSkills = [
          ...Array.from(selectedTechnicalSkillIds),
          ...Array.from(selectedFutureTechnicalSkillIds)
        ];
        
        // Prepare target job position data
        let targetJobPositionData = null;
        if (interestedJobPositionFromKnowledgeBase && fetchedJobDataFromKnowledgeBase) {
          targetJobPositionData = {
            title: fetchedJobDataFromKnowledgeBase.target_job_title,
            company: fetchedJobDataFromKnowledgeBase.target_job_company,
            description: fetchedJobDataFromKnowledgeBase.target_job_description,
            skill_keywords: fetchedJobDataFromKnowledgeBase.target_job_skill_keywords
          };
        } else if (interestedJobPositionFromKnowledgeBase && jobUrlFetchFailed) {
          // User pasted job description manually
          targetJobPositionData = {
            description: interestedJobPositionFromKnowledgeBase
          };
        }
        
        // Prepare request payload
        // Collect all links with both name (topic) and url (link text) from Profile/Basic Info
        const allLinks: Array<{ name: string; url: string }> = [];
        
        // Include personalWebsite if provided
        if (basicInfo.personalWebsite && basicInfo.personalWebsite.trim()) {
          allLinks.push({
            name: 'Personal Website',
            url: basicInfo.personalWebsite.trim()
          });
        }
        
        // Include LinkedIn if provided
        if (basicInfo.linkedin && basicInfo.linkedin.trim()) {
          allLinks.push({
            name: 'LinkedIn',
            url: basicInfo.linkedin.trim()
          });
        }
        
        // Include additional links from basicInfo.links (already in { name, url } format)
        if (basicInfo.links && Array.isArray(basicInfo.links)) {
          basicInfo.links.forEach(link => {
            // Ensure both name (topic) and url (link text) are present and non-empty
            if (link && typeof link === 'object') {
              const linkName = (link.name || 'Link').trim();
              const linkUrl = (link.url || '').trim();
              if (linkName && linkUrl) {
                allLinks.push({
                  name: linkName,  // Link topic/name from Profile/Basic Info
                  url: linkUrl     // Link URL text from user input
                });
              }
            }
          });
        }
        
        const requestPayload = {
          cognito_sub: cognitoSub,
          basic_info: {
            firstName: basicInfo.firstName,
            middleName: basicInfo.middleName || '',
            lastName: basicInfo.lastName,
            email: basicInfo.email,
            phone: basicInfo.phone,
            addressStreet: basicInfo.addressStreet,
            addressState: basicInfo.addressState,
            addressZip: basicInfo.addressZip,
            personalWebsite: basicInfo.personalWebsite || '',
            linkedin: basicInfo.linkedin || '',
            links: allLinks  // Send all links with both name (topic) and url (link text)
          },
          target_company_type: interestedCompanyType || null,
          target_job_position: targetJobPositionData,
          personal_projects: selectedPersonalProjects,
          professional_projects: selectedProfessionalProjects,
          future_personal_projects: selectedFuturePersonalProjects,
          future_professional_projects: selectedFutureProfessionalProjects,
          skills: combinedSkills,
          education: educationProp.map(college => ({
            id: college.id,
            collegeName: college.collegeName,
            location: college.location || '',
            degrees: college.degrees
          })),
          professional_history: professionalHistory.map(exp => ({
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
          achievements: achievements
        };
        
        const response = await fetch(`${API_ENDPOINT}/craft_resume_from_knowledge_base`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Process the crafted resume data and populate the resume document
          // Pass the original links from Profile/Basic Info to preserve exact user input
          await processCraftedResumeData(result.data, allLinks);
          
          // Navigate to resume page
          if (interestedCompanyType) {
            setIndustrySector(interestedCompanyType);
            setTargetJobPosition('');
          } else if (interestedJobPositionFromKnowledgeBase) {
            setTargetJobPosition(interestedJobPositionFromKnowledgeBase);
            setIndustrySector('');
          }
          setResumeMode('industry');
          setShowCompanyTypePage(false);
          setShowResumePage(true);
        } else if (result.error_code === 'CRAFT_LIMIT_EXCEEDED') {
          onCraftLimitExceeded?.();
        } else {
          console.error('Failed to craft resume:', result.message);
          alert(`Failed to craft resume: ${result.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error crafting resume:', error);
        alert('Failed to craft resume. Please try again.');
      } finally {
        setIsCraftingResume(false);
        setCraftingCardIndex(0); // Reset card index
      }
    } else {
      // No knowledge base projects selected, proceed normally
      if (interestedCompanyType) {
        setIndustrySector(interestedCompanyType);
        setTargetJobPosition('');
      } else if (interestedJobPositionFromKnowledgeBase) {
        setTargetJobPosition(interestedJobPositionFromKnowledgeBase);
        setIndustrySector('');
      }
      setResumeMode('industry');
      setShowCompanyTypePage(false);
      setShowResumePage(true);
    }
  };
  
  // Process crafted resume data and populate resume document
  // originalLinks: Array of { name, url } from Profile/Basic Info that was sent to OpenAI
  const processCraftedResumeData = async (data: any, originalLinks?: Array<{ name: string; url: string }>) => {
    try {
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // Preserve explicit "Present"
        if (dateStr.trim().toLowerCase() === 'present') {
          return 'Present';
        }
        // If it's just a year, return as is
        if (/^\d{4}$/.test(dateStr)) return dateStr;
        // If it's YYYY-MM format, convert to "Month YYYY"
        if (/^\d{4}-\d{2}$/.test(dateStr)) {
          const [year, month] = dateStr.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${monthNames[parseInt(month) - 1]} ${year}`;
        }
        // If it's already formatted, return as is
        return dateStr;
      };
      
      // Update name
      if (data.full_name) {
        setSavedName(data.full_name);
      }
      
      // Update contact fields
      const contactFields: ContactField[] = [];
      if (data.email_address) {
        contactFields.push({
          id: 'email',
          label: 'Email',
          value: data.email_address,
          isDefault: true
        });
      }
      if (data.phone_number) {
        contactFields.push({
          id: 'phone',
          label: 'Phone',
          value: data.phone_number,
          isDefault: true
        });
      }
      if (data.home_address) {
        contactFields.push({
          id: 'location',
          label: 'Address',
          value: data.home_address,
          isDefault: true
        });
      }
      
      // Use original links from Profile/Basic Info (exact user input) instead of what OpenAI returns
      // This ensures we preserve the exact link name (topic) and link text (URL) entered by the user
      if (originalLinks && originalLinks.length > 0) {
        originalLinks.forEach((link, index: number) => {
          // Use exact data from Profile/Basic Info: link name (topic) and link text (URL)
          if (link.name && link.url) {
            contactFields.push({
              id: `link-${index}`,
              label: link.name.trim(),  // Link name (topic) from user input
              value: link.url.trim(),    // Link text (URL) from user input
              isDefault: false
            });
          }
        });
      } else if (data.links && data.links.length > 0) {
        // Fallback: Use links from OpenAI response if original links not available
        data.links.forEach((link: any, index: number) => {
          // Handle both string format (legacy) and object format (new)
          let linkName = 'Link';
          let linkUrl = '';
          
          if (typeof link === 'string') {
            linkUrl = link;
            // Try to infer name from URL
            try {
              const urlObj = new URL(link.startsWith('http') ? link : `https://${link}`);
              const host = urlObj.host.replace(/^www\./i, '');
              if (host.includes('linkedin')) linkName = 'LinkedIn';
              else if (host.includes('github')) linkName = 'GitHub';
              else if (host.includes('portfolio') || host.includes('personal')) linkName = 'Personal Website';
              else linkName = 'Link';
            } catch {
              linkName = 'Link';
            }
          } else if (typeof link === 'object' && link !== null) {
            linkName = (link.name || link.label || 'Link') as string;
            linkUrl = (link.url || '') as string;
          }
          
          if (linkUrl) {
            contactFields.push({
              id: `link-${index}`,
              label: linkName,
              value: linkUrl,
              isDefault: false
            });
          }
        });
      }
      setSavedContactFields(contactFields);
      
      // Update education
      if (data.education_history && Array.isArray(data.education_history)) {
        const educationData: Education[] = data.education_history.map((edu: any, index: number) => {
          const start = formatDate(edu.start_date);
          const rawEnd = edu.end_date;
          const end =
            !rawEnd || rawEnd.toString().trim() === ''
              ? 'Present'
              : formatDate(rawEnd);
          
          const location = edu.location ? `${edu.location}, ` : '';
          const dateWithLocation = `${location}${start} - ${end}`;

          return {
            id: `edu-${index + 1}`,
            university: edu.college_name || '',
            date: dateWithLocation,
            degrees: [{
              id: `degree-${index + 1}-1`,
              degree: `${edu.degree}${edu.major ? `, ${edu.major}` : ''}`,
              description: edu.coursework && edu.coursework.length > 0 
                ? `Coursework: ${edu.coursework.join(', ')}`
                : ''
            }]
          };
        });
        setSavedEducation(educationData);
      }
      
      // Update professional experiences - merge with professional projects
      if (data.professional_history && Array.isArray(data.professional_history)) {
        // Group professional projects by work_experience
        const projectsByWorkExp: Record<string, any[]> = {};
        if (data.professional_projects && Array.isArray(data.professional_projects)) {
          data.professional_projects.forEach((proj: any) => {
            const workExp = proj.work_experience || '';
            if (!projectsByWorkExp[workExp]) {
              projectsByWorkExp[workExp] = [];
            }
            projectsByWorkExp[workExp].push(proj);
          });
        }
        
        const professionalData: ProfessionalExperience[] = data.professional_history.map((prof: any, index: number) => {
          // Find matching projects for this company/job
          // Try multiple matching strategies
          const companyName = prof.company_name || '';
          const jobTitle = prof.job_title || '';
          const companyKey = `${companyName} - ${jobTitle}`;
          
          // Try exact match first
          let matchingProjects = projectsByWorkExp[companyKey] || [];
          
          // If no exact match, try matching by company name only
          if (matchingProjects.length === 0) {
            Object.keys(projectsByWorkExp).forEach((key) => {
              if (key.includes(companyName)) {
                matchingProjects = projectsByWorkExp[key];
              }
            });
          }
          
          // Build bullets from projects and store technologies
          const bullets: string[] = [];
          const projectTechnologies: Record<string, string[]> = {};
          matchingProjects.forEach((proj: any) => {
            // Add a synthetic header marker so the UI can group bullets per project
            if (proj.project_name) {
              bullets.push(`${PROJECT_HEADER_PREFIX}${proj.project_name}`);
              // Store technologies for this project
              if (proj.technologies && Array.isArray(proj.technologies) && proj.technologies.length > 0) {
                projectTechnologies[proj.project_name] = proj.technologies;
              }
            }
            if (proj.overview_content) bullets.push(proj.overview_content);
            if (proj.tech_content && Array.isArray(proj.tech_content)) {
              proj.tech_content.forEach((tech: any) => {
                if (tech.content) bullets.push(tech.content);
              });
            }
            if (proj.achievement_content) bullets.push(proj.achievement_content);
          });
          
          const location = prof.location ? `${prof.location}, ` : '';
          const dateWithLocation = `${location}${formatDate(prof.start_date)} - ${
            !prof.end_date || prof.end_date.toString().trim() === ''
              ? 'Present'
              : formatDate(prof.end_date)
          }`;
          
          return {
            id: `prof-${index + 1}`,
            company: companyName,
            jobTitles: [{
              id: `job-${index + 1}-1`,
              title: jobTitle,
              date: dateWithLocation,
              bullets: bullets,
              projectTechnologies: Object.keys(projectTechnologies).length > 0 ? projectTechnologies : undefined
            }]
          };
        });
        setSavedProfessionalExperiences(professionalData);
      }
      
          // Update projects (combine personal and professional)
          const allProjects: Project[] = [];
          
          // Add personal projects
          if (data.personal_projects && Array.isArray(data.personal_projects)) {
            data.personal_projects.forEach((proj: any, index: number) => {
              const bullets: string[] = [];
              if (proj.overview_content) bullets.push(proj.overview_content);
              if (proj.tech_content && Array.isArray(proj.tech_content)) {
                proj.tech_content.forEach((tech: any) => {
                  if (tech.content) bullets.push(tech.content);
                });
              }
              if (proj.achievement_content) bullets.push(proj.achievement_content);
              
              const location = proj.location ? `${proj.location}, ` : '';
              const dateWithLocation = `${location}${formatDate(proj.start_date)} - ${
                !proj.end_date || proj.end_date.toString().trim() === ''
                  ? 'Present'
                  : formatDate(proj.end_date)
              }`;
              
              allProjects.push({
                id: `personal-${index + 1}`,
                name: proj.project_name || '',
                date: dateWithLocation,
                description: proj.overview_content || '',
                bullets: bullets,
                // Keep technologies list on the project itself so the UI can render it separately
                technologies: Array.isArray(proj.technologies) ? proj.technologies : []
              } as Project & { technologies?: string[] });
            });
          }
      
      // Note: Professional projects are already integrated into professional experiences above
      // So we don't add them separately to the projects list
      
      // Determine which project list to use based on knowledge scope
      if (knowledgeScope.establishedExpertise && !knowledgeScope.expandingKnowledgeBase) {
        setSavedProjectsEstablished(allProjects);
        setSavedProjectsExpanding([]);
      } else if (knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise) {
        setSavedProjectsEstablished([]);
        setSavedProjectsExpanding(allProjects);
      } else if (knowledgeScope.establishedExpertise && knowledgeScope.expandingKnowledgeBase) {
        // Split projects - first half to established, second half to expanding
        const midPoint = Math.ceil(allProjects.length / 2);
        setSavedProjectsEstablished(allProjects.slice(0, midPoint));
        setSavedProjectsExpanding(allProjects.slice(midPoint));
      }
      
      // Update technical skills
      if (data.technical_skills) {
        const skillsData: Array<{ id: string; topic: string; keywords: string }> = [];
        
        if (data.technical_skills.Languages && data.technical_skills.Languages.length > 0) {
          skillsData.push({
            id: 'languages',
            topic: 'Languages',
            keywords: data.technical_skills.Languages.join(', ')
          });
        }
        if (data.technical_skills.Frameworks && data.technical_skills.Frameworks.length > 0) {
          skillsData.push({
            id: 'frameworks',
            topic: 'Frameworks',
            keywords: data.technical_skills.Frameworks.join(', ')
          });
        }
        if (data.technical_skills.Tools && data.technical_skills.Tools.length > 0) {
          skillsData.push({
            id: 'tools',
            topic: 'Tools',
            keywords: data.technical_skills.Tools.join(', ')
          });
        }
        
        // Add any other topics
        Object.keys(data.technical_skills).forEach((topic) => {
          if (!['Languages', 'Frameworks', 'Tools'].includes(topic) && Array.isArray(data.technical_skills[topic])) {
            skillsData.push({
              id: topic.toLowerCase().replace(/\s+/g, '-'),
              topic: topic,
              keywords: data.technical_skills[topic].join(', ')
            });
          }
        });
        
        setSavedSkills(skillsData);
      }
      
      // Handle achievements if present
      if (data.professional_achievement && Array.isArray(data.professional_achievement) && data.professional_achievement.length > 0) {
        const achievementsData = data.professional_achievement.map((ach: any, index: number) => ({
          id: `ach-${index + 1}`,
          type: ach.type || '',
          value: ach.value || ''
        }));
        setSavedAchievements(achievementsData);
      } else {
        setSavedAchievements([]);
      }
      
    } catch (error) {
      console.error('Error processing crafted resume data:', error);
      throw error;
    }
  };

  const handleExistingResumeNext = () => {
    if (interestedCompanyType) {
      setIndustrySector(interestedCompanyType);
      setTargetJobPosition(''); // Clear job position when industry sector is selected
    } else if (interestedJobPositionFromExistingResume) {
      setTargetJobPosition(interestedJobPositionFromExistingResume);
      setIndustrySector(''); // Clear industry sector when job position is entered
    }
    setResumeMode('existing');
    setShowExistingResumePage(false);
    setShowResumePage(true);
  };

  // URL validation helper
  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  // Check if text looks like it's trying to be a URL (starts with http or www)
  const looksLikeUrl = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    return trimmed.startsWith('http') || trimmed.startsWith('www.') || trimmed.includes('://');
  };

  // Handler for "From Existing Resume" page - uses its own state
  const handleJobPositionChangeFromExistingResume = (value: string) => {
    setInterestedJobPositionFromExistingResume(value);
    
    // Store the current state before any changes
    const wasInTextareaMode = jobUrlFetchFailed;
    
    // Reset blocked state when user starts typing
    if (isJobUrlBlockedFromExistingResume) {
      setIsJobUrlBlockedFromExistingResume(false);
      setBlockedMessage('');
    }
    
    // Reset fetched data with fade-out animation when user modifies the input
    if (fetchedJobDataFromExistingResume) {
      setIsCheckmarkFadingOut(true);
      setShowJobTooltipAuto(false);
      // Clear the timer if running
      if (jobTooltipTimerRef.current) {
        clearTimeout(jobTooltipTimerRef.current);
        jobTooltipTimerRef.current = null;
      }
      // Wait for fade-out animation then clear data
      setTimeout(() => {
        setFetchedJobDataFromExistingResume(null);
        setIsCheckmarkFadingOut(false);
      }, 300);
    }
    
    // URL validation logic - only validate URL format when NOT in textarea mode
    // When in textarea mode, any text input is valid
    if (value.trim()) {
      if (wasInTextareaMode) {
        // In textarea mode, any text is valid - no URL validation needed
        setIsJobUrlValidFromExistingResume(true);
        setJobUrlError('');
        // Keep textarea mode unless user enters a valid URL
        if (isValidUrl(value)) {
          // User entered a valid URL, switch back to URL input mode
          setJobUrlFetchFailed(false);
        }
      } else {
        // In URL input mode, validate URL format
        if (isValidUrl(value)) {
          setIsJobUrlValidFromExistingResume(true);
          setJobUrlError('');
        } else {
          setIsJobUrlValidFromExistingResume(false);
          setJobUrlError('Please enter a valid job posting URL: https://example.com/jobs/...');
        }
      }
      setInterestedCompanyType(''); // Clear industry sector when job position is entered
      setIsCompanyTypeDropdownOpen(false);
    } else {
      setIsJobUrlValidFromExistingResume(false);
      setJobUrlError('');
      // Reset fetch failed state when field is cleared
      if (jobUrlFetchFailed) {
        setJobUrlFetchFailed(false);
      }
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

  // Handler for "From Knowledge Base" page - uses its own state
  const handleJobPositionChangeFromKnowledgeBase = (value: string) => {
    setInterestedJobPositionFromKnowledgeBase(value);
    
    // Detect input type
    const inputType = detectJobInputType(value);
    setJobInputType(inputType);
    
    // Reset blocked state when user starts typing
    if (isJobUrlBlockedFromKnowledgeBase) {
      setIsJobUrlBlockedFromKnowledgeBase(false);
      setBlockedMessage('');
    }
    
    // Reset error when user modifies input
    setJobUrlError('');
    
    // Reset fetched data with fade-out animation when user modifies the input
    if (fetchedJobDataFromKnowledgeBase) {
      setIsCheckmarkFadingOut(true);
      setShowJobTooltipAuto(false);
      // Clear the timer if running
      if (jobTooltipTimerRef.current) {
        clearTimeout(jobTooltipTimerRef.current);
        jobTooltipTimerRef.current = null;
      }
      // Wait for fade-out animation then clear data
      setTimeout(() => {
        setFetchedJobDataFromKnowledgeBase(null);
        setIsCheckmarkFadingOut(false);
      }, 300);
    }
    
    // Set valid state based on input type - all types are valid for lookup
    if (value.trim()) {
      setIsJobUrlValidFromKnowledgeBase(true);
      // Only clear industry sector when it's NOT a generic job title (keep it for job_title type)
      if (inputType !== 'job_title') {
        setInterestedCompanyType(''); // Clear industry sector when job position is entered (URL or description)
        setIsCompanyTypeDropdownOpen(false);
      }
      
      // Reset textarea mode if user enters a URL
      if (inputType === 'url' && jobUrlFetchFailed) {
        setJobUrlFetchFailed(false);
      }
    } else {
      setIsJobUrlValidFromKnowledgeBase(false);
      setJobInputType(null);
      // Reset fetch failed state when field is cleared
      if (jobUrlFetchFailed) {
        setJobUrlFetchFailed(false);
      }
    }
  };

  // Fetch job URL handler for "From Existing Resume" page
  const handleFetchJobUrlFromExistingResume = async () => {
    if (!isJobUrlValidFromExistingResume || isJobUrlFetching) return;
    
    setIsJobUrlFetching(true);
    setJobUrlError('');
    
    try {
      const response = await fetch(`${API_ENDPOINT}/validate_and_fetch_job_url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: interestedJobPositionFromExistingResume })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFetchedJobDataFromExistingResume(result.data);
        setJobUrlFetchFailed(false);
        setJobUrlError('');
        setIsCheckmarkFadingOut(false);
        setIsJobUrlBlockedFromExistingResume(false);
        setBlockedMessage('');
        
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
        // Check if it's a blocked/auth required error
        if (result.error_code === 'BLOCKED_OR_AUTH_REQUIRED') {
          setIsJobUrlBlockedFromExistingResume(true);
          setBlockedMessage('The website blocks direct fetch. Please find the original job post URL from the company\'s official website.');
          setJobUrlFetchFailed(false);
          setJobUrlError('');
          
          // Auto-show tooltip for 3 seconds
          setShowJobTooltipAuto(true);
          if (jobTooltipTimerRef.current) {
            clearTimeout(jobTooltipTimerRef.current);
          }
          jobTooltipTimerRef.current = setTimeout(() => {
            setShowJobTooltipAuto(false);
          }, 3000);
        } else {
          setIsJobUrlBlockedFromExistingResume(false);
          setBlockedMessage('');
          setJobUrlFetchFailed(true);
          setJobUrlError('URL cannot be fetched. Please copy and paste the job description content below.');
          setInterestedJobPositionFromExistingResume(''); // Clear the URL to allow text input
        }
      }
    } catch (error) {
      console.error('Error fetching job URL:', error);
      setJobUrlFetchFailed(true);
      setJobUrlError('Failed to fetch URL. Please paste the job description manually.');
      setInterestedJobPositionFromExistingResume(''); // Clear the URL to allow text input
    } finally {
      setIsJobUrlFetching(false);
    }
  };

  // Fetch job handler for "From Knowledge Base" page
  // Handles 3 input types: URL, job title (<150 chars), job description (>150 chars)
  const handleFetchJobUrlFromKnowledgeBase = async () => {
    if (!isJobUrlValidFromKnowledgeBase || isJobUrlFetching) return;
    
    const currentInputType = detectJobInputType(interestedJobPositionFromKnowledgeBase);
    
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
          body: JSON.stringify({ url: interestedJobPositionFromKnowledgeBase })
        });
        result = await response.json();
        
        if (result.success) {
          setFetchedJobDataFromKnowledgeBase(result.data);
          setJobUrlFetchFailed(false);
          setJobUrlError('');
          setIsCheckmarkFadingOut(false);
          setIsJobUrlBlockedFromKnowledgeBase(false);
          setBlockedMessage('');
          
          // Cache the job data and URL to localStorage
          try {
            localStorage.setItem('cachedJobDataFromKnowledgeBase', JSON.stringify(result.data));
            localStorage.setItem('cachedJobUrlFromKnowledgeBase', interestedJobPositionFromKnowledgeBase);
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
          // Check if it's a blocked/auth required error
          if (result.error_code === 'BLOCKED_OR_AUTH_REQUIRED') {
            setIsJobUrlBlockedFromKnowledgeBase(true);
            setBlockedMessage('The website blocks direct fetch. Please find the original job post URL from the company\'s official website.');
            setJobUrlFetchFailed(false);
            setJobUrlError('');
            
            // Auto-show tooltip for 3 seconds
            setShowJobTooltipAuto(true);
            if (jobTooltipTimerRef.current) {
              clearTimeout(jobTooltipTimerRef.current);
            }
            jobTooltipTimerRef.current = setTimeout(() => {
              setShowJobTooltipAuto(false);
            }, 3000);
          } else {
            setIsJobUrlBlockedFromKnowledgeBase(false);
            setBlockedMessage('');
            setJobUrlFetchFailed(true);
            setJobUrlError('URL cannot be fetched. Please copy and paste the job description content below.');
            setInterestedJobPositionFromKnowledgeBase(''); // Clear the URL to allow text input
          }
        }
      } else if (currentInputType === 'job_title') {
        // Type 2: Generic job title (<150 chars) - call fetch_with_job_title API
        response = await fetch(`${API_ENDPOINT}/fetch_with_job_title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_title: interestedJobPositionFromKnowledgeBase.trim() })
        });
        result = await response.json();
        
        if (result.success) {
          setFetchedJobDataFromKnowledgeBase(result.data);
          setJobUrlFetchFailed(false);
          setJobUrlError('');
          setIsCheckmarkFadingOut(false);
          setIsJobUrlBlockedFromKnowledgeBase(false);
          setBlockedMessage('');
          
          // Cache the job data
          try {
            localStorage.setItem('cachedJobDataFromKnowledgeBase', JSON.stringify(result.data));
            localStorage.setItem('cachedJobUrlFromKnowledgeBase', interestedJobPositionFromKnowledgeBase);
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
        if (!validateJobDescriptionContent(interestedJobPositionFromKnowledgeBase)) {
          setJobUrlError('Please copy over the full context of the job description. It should include sections like Responsibilities, Qualifications, Requirements, etc.');
          setIsJobUrlFetching(false);
          return;
        }
        
        response = await fetch(`${API_ENDPOINT}/parse_job_description`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_description: interestedJobPositionFromKnowledgeBase.trim() })
        });
        result = await response.json();
        
        if (result.success) {
          setFetchedJobDataFromKnowledgeBase(result.data);
          setJobUrlFetchFailed(false);
          setJobUrlError('');
          setIsCheckmarkFadingOut(false);
          setIsJobUrlBlockedFromKnowledgeBase(false);
          setBlockedMessage('');
          
          // Cache the job data
          try {
            localStorage.setItem('cachedJobDataFromKnowledgeBase', JSON.stringify(result.data));
            localStorage.setItem('cachedJobUrlFromKnowledgeBase', interestedJobPositionFromKnowledgeBase.substring(0, 100));
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
      if (currentInputType === 'url') {
        setJobUrlFetchFailed(true);
        setJobUrlError('Failed to fetch URL. Please paste the job description manually.');
        setInterestedJobPositionFromKnowledgeBase(''); // Clear the URL to allow text input
      } else {
        setJobUrlError('An error occurred. Please try again.');
      }
    } finally {
      setIsJobUrlFetching(false);
    }
  };

  // Handler for industry sector change - does not impact job position field
  const handleCompanyTypeChange = (value: string) => {
    setInterestedCompanyType(value);
    // Job position field remains unchanged when industry sector is updated
  };

  // Industry sector options - you can customize this list
  const companyTypeOptions = [
    { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
    { value: 'Blockchain & Web3', label: 'Blockchain & Web3' },
    { value: 'Cloud Computing', label: 'Cloud Computing' },
    { value: 'SaaS / Enterprise Software', label: 'SaaS / Enterprise Software' },
    { value: 'Big Tech / Consumer Internet', label: 'Big Tech / Consumer Internet' },
    { value: 'FinTech', label: 'FinTech' },
    { value: 'Trading & Quant Finance', label: 'Trading & Quant Finance' },
    { value: 'E-commerce & Marketplace', label: 'E-commerce & Marketplace' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'Data & Analytics', label: 'Data & Analytics' },
    { value: 'Developer Tools', label: 'Developer Tools' },
    { value: 'Healthcare & Insurance', label: 'Healthcare & Insurance' },
    { value: 'Gaming', label: 'Gaming' },
    { value: 'Autonomous Vehicles & Robotics', label: 'Autonomous Vehicles & Robotics' },
    { value: 'Generative AI Platforms', label: 'Generative AI Platforms' },
  ];

  // Capture initial values when resume page is shown
  useEffect(() => {
    if (showResumePage && !initialResumePageValues) {
      setInitialResumePageValues({
        industrySector,
        targetJobPosition,
        knowledgeScope: { ...knowledgeScope },
        resumeFile,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResumePage]);

  // Reset initial values when leaving resume page
  useEffect(() => {
    if (!showResumePage) {
      setInitialResumePageValues(null);
    }
  }, [showResumePage]);

  // Load cached job data when navigating to "From Knowledge Base" page
  useEffect(() => {
    if (showCompanyTypePage) {
      // Set resumeMode to 'industry' if not already set (for navigation from knowledge section)
      if (resumeMode !== 'industry') {
        setResumeMode('industry');
      }
      
      try {
        const cachedJobData = localStorage.getItem('cachedJobDataFromKnowledgeBase');
        const cachedJobUrl = localStorage.getItem('cachedJobUrlFromKnowledgeBase');
        
        if (cachedJobData && cachedJobUrl) {
          const parsedJobData = JSON.parse(cachedJobData);
          setFetchedJobDataFromKnowledgeBase(parsedJobData);
          setInterestedJobPositionFromKnowledgeBase(cachedJobUrl);
          setIsJobUrlValidFromKnowledgeBase(true);
          setJobUrlFetchFailed(false);
          setIsCheckmarkFadingOut(false);
          setIsJobUrlBlockedFromKnowledgeBase(false);
          setBlockedMessage('');
          
          // Show tooltip briefly to indicate cached data is loaded
          setShowJobTooltipAuto(true);
          if (jobTooltipTimerRef.current) {
            clearTimeout(jobTooltipTimerRef.current);
          }
          jobTooltipTimerRef.current = setTimeout(() => {
            setShowJobTooltipAuto(false);
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to load cached job data:', error);
      }
    }
  }, [showCompanyTypePage, resumeMode]);

  // Auto-select first 4 projects from each section and first 20 technical skills when Established Expertise is checked
  useEffect(() => {
    if (knowledgeScope.establishedExpertise) {
      // Auto-select first 4 personal projects
      const personalIds = new Set(
        personalProjects
          .slice(0, 4)
          .map(p => p.id)
      );
      setSelectedPersonalProjectIds(personalIds);

      // Auto-select first 4 professional projects
      const professionalIds = new Set(
        professionalProjects
          .slice(0, 4)
          .map(p => p.id)
      );
      setSelectedProfessionalProjectIds(professionalIds);

      // Auto-select first 20 technical skills
      const technicalSkillIds = new Set(
        selectedTechnicalSkills
          .slice(0, 20)
      );
      setSelectedTechnicalSkillIds(technicalSkillIds);
    } else {
      // Clear selections when unchecked
      setSelectedPersonalProjectIds(new Set());
      setSelectedProfessionalProjectIds(new Set());
      setSelectedTechnicalSkillIds(new Set());
    }
  }, [knowledgeScope.establishedExpertise, personalProjects, professionalProjects, selectedTechnicalSkills]);

  // Auto-select first 4 future projects from each section and first 20 future technical skills when Expanding Knowledge Base is checked
  useEffect(() => {
    if (knowledgeScope.expandingKnowledgeBase) {
      // Auto-select first 4 future personal projects
      const futurePersonalIds = new Set(
        futurePersonalProjects
          .slice(0, 4)
          .map(p => p.id)
      );
      setSelectedFuturePersonalProjectIds(futurePersonalIds);

      // Auto-select first 4 future professional projects
      const futureProfessionalIds = new Set(
        futureProfessionalProjects
          .slice(0, 4)
          .map(p => p.id)
      );
      setSelectedFutureProfessionalProjectIds(futureProfessionalIds);

      // Auto-select first 20 future technical skills
      const futureTechnicalSkillIds = new Set(
        selectedFutureTechnicalSkills
          .slice(0, 20)
      );
      setSelectedFutureTechnicalSkillIds(futureTechnicalSkillIds);
    } else {
      // Clear selections when unchecked
      setSelectedFuturePersonalProjectIds(new Set());
      setSelectedFutureProfessionalProjectIds(new Set());
      setSelectedFutureTechnicalSkillIds(new Set());
    }
  }, [knowledgeScope.expandingKnowledgeBase, futurePersonalProjects, futureProfessionalProjects, selectedFutureTechnicalSkills]);

  // Handle project selection toggle
  const handleProjectToggle = (projectId: string, isPersonal: boolean) => {
    if (isPersonal) {
      setSelectedPersonalProjectIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          if (newSet.size < 4) {
            newSet.add(projectId);
          }
        }
        return newSet;
      });
    } else {
      setSelectedProfessionalProjectIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          if (newSet.size < 4) {
            newSet.add(projectId);
          }
        }
        return newSet;
      });
    }
  };

  // Handle technical skill selection toggle
  const handleTechnicalSkillToggle = (skillId: string) => {
    setSelectedTechnicalSkillIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        if (newSet.size < 20) {
          newSet.add(skillId);
        }
      }
      return newSet;
    });
  };

  // Handle future project selection toggle
  const handleFutureProjectToggle = (projectId: string, isPersonal: boolean) => {
    if (isPersonal) {
      setSelectedFuturePersonalProjectIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          if (newSet.size < 4) {
            newSet.add(projectId);
          }
        }
        return newSet;
      });
    } else {
      setSelectedFutureProfessionalProjectIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          if (newSet.size < 4) {
            newSet.add(projectId);
          }
        }
        return newSet;
      });
    }
  };

  // Handle future technical skill selection toggle
  const handleFutureTechnicalSkillToggle = (skillId: string) => {
    setSelectedFutureTechnicalSkillIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        if (newSet.size < 20) {
          newSet.add(skillId);
        }
      }
      return newSet;
    });
  };

  // Cleanup tooltip timers on unmount
  useEffect(() => {
    return () => {
      if (downloadTooltipTimerRef.current) {
        clearTimeout(downloadTooltipTimerRef.current);
      }
      if (downloadTooltipHideTimerRef.current) {
        clearTimeout(downloadTooltipHideTimerRef.current);
      }
      if (analysisTooltipTimerRef.current) {
        clearTimeout(analysisTooltipTimerRef.current);
      }
      if (analysisTooltipHideTimerRef.current) {
        clearTimeout(analysisTooltipHideTimerRef.current);
      }
    };
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (projectSelectionPopupTimerRef.current) {
        clearTimeout(projectSelectionPopupTimerRef.current);
      }
      if (futureProjectSelectionPopupTimerRef.current) {
        clearTimeout(futureProjectSelectionPopupTimerRef.current);
      }
    };
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyTypeDropdownRef.current &&
        !companyTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyTypeDropdownOpen(false);
      }
      if (
        resumeLeftCompanyTypeDropdownRef.current &&
        !resumeLeftCompanyTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsResumeLeftCompanyTypeDropdownOpen(false);
      }
    };

    if (isCompanyTypeDropdownOpen || isResumeLeftCompanyTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isCompanyTypeDropdownOpen, isResumeLeftCompanyTypeDropdownOpen]);

  // Auto-size contact info inputs based on content
  const autoSizeInput = (input: HTMLInputElement | null, value: string) => {
    if (!input) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const style = window.getComputedStyle(input);
    context.font = `${style.fontSize} ${style.fontFamily}`;
    const textWidth = context.measureText(value || input.placeholder || '').width;
    const minWidth = 120;
    const padding = 20; // Account for input padding
    input.style.width = `${Math.max(minWidth, textWidth + padding)}px`;
  };

  // Calculate exact single-line height accounting for line-height multiplier
  const calculateSingleLineHeight = (textarea: HTMLTextAreaElement): string => {
    const computedStyle = getComputedStyle(textarea);
    const fontSize = parseFloat(computedStyle.fontSize) || 19.2; // 1.2rem = 19.2px
    const lineHeightValue = computedStyle.lineHeight;
    
    // Parse line-height (could be 'normal', pixel value, or unitless multiplier)
    let actualLineHeight: number;
    if (lineHeightValue === 'normal') {
      actualLineHeight = fontSize * 1.2;
    } else if (lineHeightValue.includes('px')) {
      actualLineHeight = parseFloat(lineHeightValue);
    } else {
      // It's a unitless number (multiplier like 2.0) - multiply by fontSize
      const multiplier = parseFloat(lineHeightValue);
      actualLineHeight = fontSize * (isNaN(multiplier) ? 1.2 : multiplier);
    }
    
    const paddingTop = parseFloat(computedStyle.paddingTop) || 12;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 12;
    // Calculate exact height: one line + padding, rounded down
    const singleLineHeight = Math.floor(actualLineHeight + paddingTop + paddingBottom);
    return `${singleLineHeight}px`;
  };

  // Handle textarea focus: expand to show all content
  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    if (textarea.readOnly) return;
    
    // Store original height if not already stored
    if (!textarea.dataset.originalHeight) {
      textarea.dataset.originalHeight = calculateSingleLineHeight(textarea);
    }
    
    // Expand to show all content - use !important to override CSS
    textarea.style.setProperty('min-height', 'auto', 'important');
    textarea.style.setProperty('max-height', 'none', 'important');
    textarea.style.setProperty('height', 'auto', 'important');
    textarea.style.setProperty('overflow-y', 'hidden', 'important');
    
    // Use multiple attempts to ensure expansion works
    const expandTextarea = () => {
      // Reset height to auto first to get accurate scrollHeight
      textarea.style.setProperty('height', 'auto', 'important');
      // Force a reflow to ensure scrollHeight is accurate
      void textarea.offsetHeight;
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > 0) {
        textarea.style.setProperty('height', `${scrollHeight}px`, 'important');
        const originalHeightNum = parseFloat(textarea.dataset.originalHeight?.replace('px', '') || '40');
        if (scrollHeight > originalHeightNum) {
          textarea.style.setProperty('overflow-y', 'auto', 'important');
        } else {
          textarea.style.setProperty('overflow-y', 'hidden', 'important');
        }
      }
    };
    
    // Try immediately
    expandTextarea();
    
    // Try after a short delay to ensure browser has recalculated
    setTimeout(expandTextarea, 0);
    setTimeout(expandTextarea, 10);
    
    // Try after requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(expandTextarea, 0);
      setTimeout(expandTextarea, 10);
    });
  };

  // Handle textarea blur: collapse to default size
  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    if (textarea.readOnly) return;
    
    // Restore to original height (exact single line) - use !important to override CSS
    const originalHeight = textarea.dataset.originalHeight || calculateSingleLineHeight(textarea);
    textarea.style.setProperty('height', originalHeight, 'important');
    textarea.style.setProperty('min-height', originalHeight, 'important');
    textarea.style.setProperty('overflow-y', 'hidden', 'important');
    textarea.style.setProperty('max-height', 'none', 'important');
  };

  useEffect(() => {
    if (showResumePage) {
      // Reset input widths to fixed full width (remove any auto-sizing)
      const inputs = [emailInputRef.current, phoneInputRef.current, locationInputRef.current, linkedinInputRef.current];
      inputs.forEach(input => {
        if (input) {
          input.style.width = '';
        }
      });
      
      // Function to setup textarea auto-expand
      const setupTextarea = (textarea: HTMLTextAreaElement) => {
        // Skip readonly textareas (they're in the resume document, not left column)
        if (textarea.readOnly) return;
        
        // Calculate exact single-line height
        const defaultHeight = calculateSingleLineHeight(textarea);
        
        // Store original default height if not set
        if (!textarea.dataset.originalHeight) {
          textarea.dataset.originalHeight = defaultHeight;
        }
        
        // Set collapsed state - use !important to override CSS
        if (!textarea.matches(':focus')) {
          textarea.style.setProperty('height', textarea.dataset.originalHeight, 'important');
          textarea.style.setProperty('overflow-y', 'hidden', 'important');
          textarea.style.setProperty('min-height', textarea.dataset.originalHeight, 'important');
        }
      };

      // Function to handle focus (backup for textareas that might not have React handlers)
      const handleFocus = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        if (target.readOnly || target.tagName !== 'TEXTAREA') return;
        
        // Ensure original height is stored
        if (!target.dataset.originalHeight) {
          target.dataset.originalHeight = calculateSingleLineHeight(target);
        }
        
        // Always expand - React handlers might not fire for some reason
        // Use !important to override CSS
        target.style.setProperty('min-height', 'auto', 'important');
        target.style.setProperty('max-height', 'none', 'important');
        target.style.setProperty('height', 'auto', 'important');
        target.style.setProperty('overflow-y', 'hidden', 'important');
        
        // Use multiple attempts to ensure expansion works
        const expandTextarea = () => {
          // Reset height to auto first to get accurate scrollHeight
          target.style.setProperty('height', 'auto', 'important');
          // Force a reflow to ensure scrollHeight is accurate
          void target.offsetHeight;
          const scrollHeight = target.scrollHeight;
          if (scrollHeight > 0) {
            target.style.setProperty('height', `${scrollHeight}px`, 'important');
            const originalHeightNum = parseFloat(target.dataset.originalHeight?.replace('px', '') || '40');
            if (scrollHeight > originalHeightNum) {
              target.style.setProperty('overflow-y', 'auto', 'important');
            } else {
              target.style.setProperty('overflow-y', 'hidden', 'important');
            }
          }
        };
        
        // Try immediately
        expandTextarea();
        
        // Try after a short delay to ensure browser has recalculated
        setTimeout(expandTextarea, 0);
        setTimeout(expandTextarea, 10);
        
        // Try after requestAnimationFrame
        requestAnimationFrame(() => {
          setTimeout(expandTextarea, 0);
          setTimeout(expandTextarea, 10);
        });
      };
      
      // Function to handle input (re-expand as user types)
      const handleInput = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        if (target.readOnly || target.tagName !== 'TEXTAREA') return;
        if (document.activeElement !== target) return; // Only expand if still focused
        
        // Re-expand to fit content - use !important to override CSS
        target.style.setProperty('height', 'auto', 'important');
        // Force a reflow to ensure scrollHeight is accurate
        void target.offsetHeight;
        const scrollHeight = target.scrollHeight;
        target.style.setProperty('height', `${scrollHeight}px`, 'important');
      };
      
      // Function to handle blur (for textareas without React handlers)
      const handleBlur = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        if (target.readOnly) return;
        
        // Collapse to default height (exact single line) - use !important to override CSS
        const originalHeight = target.dataset.originalHeight || calculateSingleLineHeight(target);
        target.style.setProperty('height', originalHeight, 'important');
        target.style.setProperty('min-height', originalHeight, 'important');
        target.style.setProperty('overflow-y', 'hidden', 'important');
        target.style.setProperty('max-height', 'none', 'important');
      };
      
      // Setup all textareas in resume left column
      const setupAllTextareas = () => {
        if (!resumeLeftColumnRef.current) return;
        
        // Find all textareas within the resume left column (more robust than class-based selector)
        const leftColumn = resumeLeftColumnRef.current;
        const textareas = leftColumn.querySelectorAll('textarea');
        
        textareas.forEach((textarea) => {
          const el = textarea as HTMLTextAreaElement;
          // Skip readonly textareas (they're in the resume document, not left column)
          if (el.readOnly) return;
          
          // Setup initial collapsed state
          setupTextarea(el);
          
          // Remove old listeners if any (using the same function reference)
          el.removeEventListener('focus', handleFocus, false);
          el.removeEventListener('blur', handleBlur, false);
          el.removeEventListener('input', handleInput, false);
          
          // Add new listeners (use bubble phase so React handlers run first, then we can ensure expansion)
          // This ensures expansion even if React handlers don't fire
          el.addEventListener('focus', handleFocus, false);
          el.addEventListener('blur', handleBlur, false);
          el.addEventListener('input', handleInput, false);
          
          // Also ensure the textarea has the correct initial state
          if (!el.dataset.originalHeight) {
            el.dataset.originalHeight = calculateSingleLineHeight(el);
          }
          // Only set collapsed state if not currently focused
          if (document.activeElement !== el) {
            el.style.setProperty('height', el.dataset.originalHeight, 'important');
            el.style.setProperty('overflow-y', 'hidden', 'important');
            el.style.setProperty('min-height', el.dataset.originalHeight, 'important');
          }
        });
      };
      
      // Setup immediately
      setupAllTextareas();
      
      // Also setup after delays to catch dynamically rendered textareas (including first/last bullets)
      const timeoutId1 = setTimeout(setupAllTextareas, 50);
      const timeoutId2 = setTimeout(setupAllTextareas, 150);
      const timeoutId3 = setTimeout(setupAllTextareas, 300);
      const timeoutId4 = setTimeout(setupAllTextareas, 500);
      const timeoutId5 = setTimeout(setupAllTextareas, 1000);
      
      // Setup on any DOM changes (catches conditionally rendered textareas)
      const observer = new MutationObserver(() => {
        setupAllTextareas();
      });
      
      if (resumeLeftColumnRef.current) {
        observer.observe(resumeLeftColumnRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style']
        });
      }
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
        clearTimeout(timeoutId4);
        clearTimeout(timeoutId5);
        observer.disconnect();
        // Clean up event listeners
        if (resumeLeftColumnRef.current) {
          const textareas = resumeLeftColumnRef.current.querySelectorAll('textarea');
          textareas.forEach((textarea) => {
            textarea.removeEventListener('focus', handleFocus, false);
            textarea.removeEventListener('blur', handleBlur, false);
            textarea.removeEventListener('input', handleInput, false);
          });
        }
      };
    }
  }, [showResumePage, savedContactFields, editingSection, contactFields, savedEducation, savedProfessionalExperiences, savedProjectsEstablished, savedProjectsExpanding]);

  // Sync left column height with resume document height
  useEffect(() => {
    const syncHeights = () => {
      if (resumeDocumentRef.current && resumeLeftColumnRef.current && (hoveredSection || editingSection)) {
        const documentHeight = resumeDocumentRef.current.offsetHeight;
        resumeLeftColumnRef.current.style.maxHeight = `${documentHeight}px`;
      } else if (resumeLeftColumnRef.current && !hoveredSection && !editingSection) {
        // Remove max-height constraint when not hovering/editing
        resumeLeftColumnRef.current.style.maxHeight = '';
      }
    };

    // Sync on mount and when sections change
    syncHeights();

    // Also sync on window resize
    window.addEventListener('resize', syncHeights);

    // Use ResizeObserver to detect resume document size changes
    let resizeObserver: ResizeObserver | null = null;
    if (resumeDocumentRef.current) {
      resizeObserver = new ResizeObserver(syncHeights);
      resizeObserver.observe(resumeDocumentRef.current);
    }

    return () => {
      window.removeEventListener('resize', syncHeights);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [showResumePage, hoveredSection, editingSection]);

  // Track scroll position for scroll indicators
  useEffect(() => {
    const leftColumn = resumeLeftColumnRef.current;
    if (!leftColumn) return;

    const updateScrollIndicators = () => {
      const { scrollTop, scrollHeight, clientHeight } = leftColumn;
      setCanScrollUp(scrollTop > 5);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5);
    };

    // Initial check
    updateScrollIndicators();

    // Listen for scroll events
    leftColumn.addEventListener('scroll', updateScrollIndicators);

    // Also update when content changes
    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(leftColumn);

    return () => {
      leftColumn.removeEventListener('scroll', updateScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [showResumePage, hoveredSection, editingSection]);

  // Click outside handler removed - editing panels now stay open until explicitly closed

  // Generate PDF and return blob and filename (without downloading)
  const generateResumePDF = async (): Promise<{ blob: Blob; filename: string } | null> => {
    try {
      // Prepare projects based on knowledge scope (frontend decides)
      const projectsToInclude = getCurrentSavedProjects();

      // Prepare resume data for API
      const resumeData = {
        name: savedName,
        contact: savedContactFields.map(f => ({ label: f.label, value: f.value })),
        professional_experiences: savedProfessionalExperiences,
        education: savedEducation,
        projects: projectsToInclude,
        skills: savedSkills,
        achievements: savedAchievements
      };

      // Call backend API to generate PDF
      const response = await fetch(`${API_ENDPOINT}/generate_resume_pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        console.error('PDF generation failed:', response.status, response.statusText);
        return null;
      }

      // Get the PDF blob
      const blob = await response.blob();
      const filename = `resume_${savedName.replace(/\s+/g, '_')}.pdf`;
      
      return { blob, filename };
    } catch (error) {
      console.error('Error generating resume PDF:', error);
      return null;
    }
  };

  const handleDownloadResume = async () => {
    const result = await generateResumePDF();
    if (!result) {
      alert('Failed to generate resume PDF. Please try again.');
      return;
    }

    // Download the PDF
    const { blob, filename } = result;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Tooltip handlers for download button
  const handleDownloadButtonMouseEnter = () => {
    // Clear any existing timers
    if (downloadTooltipTimerRef.current) {
      clearTimeout(downloadTooltipTimerRef.current);
    }
    if (downloadTooltipHideTimerRef.current) {
      clearTimeout(downloadTooltipHideTimerRef.current);
    }
    
    // Show tooltip after 1 second
    downloadTooltipTimerRef.current = setTimeout(() => {
      setShowDownloadTooltip(true);
      // Auto-hide after 3 seconds
      downloadTooltipHideTimerRef.current = setTimeout(() => {
        setShowDownloadTooltip(false);
      }, 3000);
    }, 1000);
  };

  const handleDownloadButtonMouseLeave = () => {
    // Clear timers and hide tooltip immediately
    if (downloadTooltipTimerRef.current) {
      clearTimeout(downloadTooltipTimerRef.current);
      downloadTooltipTimerRef.current = null;
    }
    if (downloadTooltipHideTimerRef.current) {
      clearTimeout(downloadTooltipHideTimerRef.current);
      downloadTooltipHideTimerRef.current = null;
    }
    setShowDownloadTooltip(false);
  };

  // Tooltip handlers for analysis button
  const handleAnalysisButtonMouseEnter = () => {
    // Clear any existing timers
    if (analysisTooltipTimerRef.current) {
      clearTimeout(analysisTooltipTimerRef.current);
    }
    if (analysisTooltipHideTimerRef.current) {
      clearTimeout(analysisTooltipHideTimerRef.current);
    }
    
    // Show tooltip after 1 second
    analysisTooltipTimerRef.current = setTimeout(() => {
      setShowAnalysisTooltip(true);
      // Auto-hide after 3 seconds
      analysisTooltipHideTimerRef.current = setTimeout(() => {
        setShowAnalysisTooltip(false);
      }, 3000);
    }, 1000);
  };

  const handleAnalysisButtonMouseLeave = () => {
    // Clear timers and hide tooltip immediately
    if (analysisTooltipTimerRef.current) {
      clearTimeout(analysisTooltipTimerRef.current);
      analysisTooltipTimerRef.current = null;
    }
    if (analysisTooltipHideTimerRef.current) {
      clearTimeout(analysisTooltipHideTimerRef.current);
      analysisTooltipHideTimerRef.current = null;
    }
    setShowAnalysisTooltip(false);
  };

  // Handle navigation to Analysis page with auto-populated data
  const handleNavigateToAnalysisWithData = async () => {
    if (!onNavigateToAnalysis) {
      // Fallback to simple navigation if handler not provided
      return;
    }

    // Determine which job position data to use based on resumeMode
    let jobPosition: string;
    let fetchedJobData: FetchedJobData | null;

    if (resumeMode === 'existing') {
      // Use data from "From Existing Resume" section
      jobPosition = interestedJobPositionFromExistingResume;
      fetchedJobData = fetchedJobDataFromExistingResume;
    } else {
      // Use data from "From Knowledge Base" section
      // Use targetJobPosition (displayed in resume left column) as the primary value
      // Fallback to interestedJobPositionFromKnowledgeBase if targetJobPosition is not set
      fetchedJobData = fetchedJobDataFromKnowledgeBase || persistedFetchedJobData;
      
      // Prioritize: fetched job title > targetJobPosition > interestedJobPositionFromKnowledgeBase
      if (fetchedJobData?.target_job_title) {
        jobPosition = fetchedJobData.target_job_title;
      } else if (targetJobPosition) {
        jobPosition = targetJobPosition;
      } else {
        jobPosition = interestedJobPositionFromKnowledgeBase;
      }
    }

    // Get current knowledge scope
    const currentKnowledgeScope = {
      establishedExpertise: knowledgeScope.establishedExpertise,
      expandingKnowledgeBase: knowledgeScope.expandingKnowledgeBase,
    };

    try {
      // Generate PDF
      const pdfResult = await generateResumePDF();
      if (!pdfResult) {
        // Still navigate with job data but without PDF - user can upload manually
        onNavigateToAnalysis({
          resumeFile: undefined,
          resumeFileName: undefined,
          jobPosition: jobPosition || '',
          fetchedJobData,
          knowledgeScope: currentKnowledgeScope,
        });
        return;
      }

      // Convert blob to File object
      const { blob, filename } = pdfResult;
      const resumeFile = new File([blob], filename, { type: 'application/pdf' });

      // Call navigation handler with all data
      onNavigateToAnalysis({
        resumeFile,
        resumeFileName: filename,
        jobPosition: jobPosition || '',
        fetchedJobData,
        knowledgeScope: currentKnowledgeScope,
      });
    } catch (error) {
      console.error('Error preparing data for analysis:', error);
      // Still navigate with job data even if there's an error
      if (onNavigateToAnalysis) {
        onNavigateToAnalysis({
          resumeFile: undefined,
          resumeFileName: undefined,
          jobPosition: jobPosition || '',
          fetchedJobData,
          knowledgeScope: currentKnowledgeScope,
        });
      }
    }
  };

  const handleResumeBack = () => {
    setHasCachedResume(true);
    setShowResumePage(false);
    // Determine which page to go back to based on resume mode
    if (resumeMode === 'existing') {
      setShowExistingResumePage(true);
      // Sync the form fields with current values when going back to "From Existing Resume"
      if (industrySector) {
        setInterestedCompanyType(industrySector);
        setInterestedJobPositionFromExistingResume('');
      } else if (targetJobPosition) {
        setInterestedJobPositionFromExistingResume(targetJobPosition);
        setInterestedCompanyType('');
      }
    } else {
      setShowCompanyTypePage(true);
      // Sync the form fields with current values when going back to "From Knowledge Base"
      if (industrySector) {
        setInterestedCompanyType(industrySector);
        setInterestedJobPositionFromKnowledgeBase('');
      } else if (targetJobPosition) {
        setInterestedJobPositionFromKnowledgeBase(targetJobPosition);
        setInterestedCompanyType('');
      }
    }
  };

  // If showing the existing resume page, render it
  if (showExistingResumePage) {
    return (
      <>
        <div className={styles.resumeSectionHeader}>
          <button
            type="button"
            className={`${styles.backButton} ${styles.resumeTopBackButton}`}
            onClick={() => {
              setShowExistingResumePage(false);
              setResumeMode(null);
              setInterestedCompanyType('');
              // Keep interestedJobPosition cached - don't clear it
              setResumeFile(null);
            }}
            aria-label="Back"
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
        <div className={`${styles.sectionContent} ${styles.companyTypeSectionContent}`}>
          <h2 className={styles.companyTypePageTitle}>From Existing Resume</h2>
          <p className={styles.companyTypePageDescription}>
            Choose either your interested industry sector or job position, and upload your existing resume.
          </p>

          <div className={styles.companyTypeForm}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Interested Industry Sector</label>
              <div className={styles.customDropdown} ref={companyTypeDropdownRef}>
                <button
                  ref={companyTypeDropdownTriggerRef}
                  type="button"
                  className={`${styles.customDropdownTrigger} ${interestedJobPositionFromExistingResume ? styles.customDropdownTriggerDisabled : ''}`}
                  onClick={() => {
                    if (!interestedJobPositionFromExistingResume) {
                      setIsCompanyTypeDropdownOpen(!isCompanyTypeDropdownOpen);
                    }
                  }}
                  disabled={!!interestedJobPositionFromExistingResume}
                  aria-expanded={isCompanyTypeDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className={styles.dropdownValue}>
                    {interestedCompanyType
                      ? companyTypeOptions.find(opt => opt.value === interestedCompanyType)?.label
                      : 'Select an industry sector'}
                  </span>
                  <svg
                    className={`${styles.dropdownArrow} ${isCompanyTypeDropdownOpen ? styles.dropdownArrowOpen : ''}`}
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
                {isCompanyTypeDropdownOpen && !interestedJobPositionFromExistingResume && (
                  <div className={styles.customDropdownMenu}>
                    <button
                      key="select-default"
                      type="button"
                      className={`${styles.dropdownOption} ${!interestedCompanyType ? styles.dropdownOptionSelected : ''}`}
                      onClick={() => {
                        handleCompanyTypeChange('');
                        setIsCompanyTypeDropdownOpen(false);
                      }}
                    >
                      Select an industry sector
                    </button>
                    {companyTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.dropdownOption} ${interestedCompanyType === option.value ? styles.dropdownOptionSelected : ''}`}
                        onClick={() => {
                          handleCompanyTypeChange(option.value);
                          setIsCompanyTypeDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Interested Job Position</label>
              {jobUrlFetchFailed ? (
                <>
                  <textarea
                    className={`${styles.formInput} ${styles.formTextarea}`}
                    value={interestedJobPositionFromExistingResume}
                    onChange={(e) => handleJobPositionChangeFromExistingResume(e.target.value)}
                    placeholder="Paste the job description content here..."
                    rows={6}
                  />
                </>
              ) : (
                <div className={styles.jobUrlInputWrapper}>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={interestedJobPositionFromExistingResume}
                    onChange={(e) => handleJobPositionChangeFromExistingResume(e.target.value)}
                    placeholder="Enter job posting URL (e.g., https://linkedin.com/jobs/...)"
                  />
                  {(isJobUrlValidFromExistingResume || fetchedJobDataFromExistingResume || isJobUrlBlockedFromExistingResume) && !isCheckmarkFadingOut ? (
                    <div className={`${styles.jobUrlFetchButtonWrapper}`}>
                      <button
                        type="button"
                        className={`${styles.jobUrlFetchButton} ${fetchedJobDataFromExistingResume ? styles.jobUrlFetchButtonSuccess : isJobUrlBlockedFromExistingResume ? styles.jobUrlFetchButtonBlocked : ''}`}
                        onClick={fetchedJobDataFromExistingResume || isJobUrlBlockedFromExistingResume ? undefined : handleFetchJobUrlFromExistingResume}
                        disabled={isJobUrlFetching || !!fetchedJobDataFromExistingResume || isJobUrlBlockedFromExistingResume}
                        aria-label={fetchedJobDataFromExistingResume ? "Job data fetched successfully" : isJobUrlBlockedFromExistingResume ? "Website blocks direct fetch" : "Fetch job posting"}
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
                        ) : isJobUrlBlockedFromExistingResume ? (
                          <svg
                            className={styles.jobUrlBlockedIcon}
                            width="44"
                            height="44"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2" fill="none"/>
                            <path d="M8 8l8 8M16 8l-8 8" stroke="#dc3545" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        ) : fetchedJobDataFromExistingResume ? (
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
                      {isJobUrlBlockedFromExistingResume && blockedMessage && (
                        <div className={`${styles.jobUrlFetchTooltip} ${showJobTooltipAuto ? styles.jobUrlFetchTooltipVisible : ''}`}>
                          <div className={styles.jobUrlFetchTooltipContent}>
                            <p className={styles.jobUrlFetchTooltipDescription}>{blockedMessage}</p>
                          </div>
                        </div>
                      )}
                      {fetchedJobDataFromExistingResume && (
                        <div className={`${styles.jobUrlFetchTooltip} ${showJobTooltipAuto ? styles.jobUrlFetchTooltipVisible : ''}`}>
                          <div className={styles.jobUrlFetchTooltipHeader}>
                            <span className={styles.jobUrlFetchTooltipTitle}>{fetchedJobDataFromExistingResume.target_job_title}</span>
                            <span className={styles.jobUrlFetchTooltipCompany}>{fetchedJobDataFromExistingResume.target_job_company}</span>
                          </div>
                          <div className={styles.jobUrlFetchTooltipContent}>
                            <p className={styles.jobUrlFetchTooltipDescription}>{fetchedJobDataFromExistingResume.target_job_description}</p>
                          </div>
                          <div className={styles.jobUrlFetchTooltipSkills}>
                            {fetchedJobDataFromExistingResume.target_job_skill_keywords.slice(0, 8).map((skill, index) => (
                              <span key={index} className={styles.jobUrlFetchTooltipSkillTag}>{skill}</span>
                            ))}
                            {fetchedJobDataFromExistingResume.target_job_skill_keywords.length > 8 && (
                              <span className={styles.jobUrlFetchTooltipSkillMore}>+{fetchedJobDataFromExistingResume.target_job_skill_keywords.length - 8} more</span>
                            )}
                          </div>
                        </div>
                      )}
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
                </div>
              )}
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
              <div className={styles.resumeUploadContainer}>
                <div className={styles.resumeUploadArea}>
                  <input
                    type="file"
                    id="existing-resume-upload"
                    accept=".pdf,.doc,.docx"
                    className={styles.resumeFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setResumeFile(file);
                    }}
                  />
                  <label htmlFor="existing-resume-upload" className={styles.resumeUploadLabel}>
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
                          const input = document.getElementById('existing-resume-upload') as HTMLInputElement;
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
          </div>

          <div className={styles.companyTypePageButtons} style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className={styles.nextButton}
              onClick={handleExistingResumeNext}
              disabled={
                !interestedCompanyType && (
                  jobUrlFetchFailed 
                    ? !interestedJobPositionFromExistingResume.trim()
                    : (!interestedJobPositionFromExistingResume || !fetchedJobDataFromExistingResume)
                )
              }
              aria-label="Craft"
            >
              <span className={styles.nextButtonText}>Craft</span>
              <svg
                className={styles.nextButtonIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M12 5L19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  }

  // If showing the industry sector selection page, render it
  if (showCompanyTypePage) {
    return (
      <>
        <div className={styles.resumeSectionHeader}>
          <button
            type="button"
            className={`${styles.backButton} ${styles.resumeTopBackButton}`}
            onClick={() => {
              setShowCompanyTypePage(false);
              setResumeMode(null);
              setInterestedCompanyType('');
              // Keep interestedJobPosition cached - don't clear it
            }}
            aria-label="Back"
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
          {hasCachedResume && (
            <button
              type="button"
              className={`${styles.backButton} ${styles.resumeTopBackButton}`}
              onClick={() => {
                setShowCompanyTypePage(false);
                setShowResumePage(true);
              }}
              aria-label="Go to resume"
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
                  d="M5 12H19M12 5L19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        <div ref={knowledgeBaseSectionContentRef} className={`${styles.sectionContent} ${styles.companyTypeSectionContent}`}>
          <h2 className={styles.companyTypePageTitle}>From Knowledge Base</h2>
          <p className={styles.companyTypePageDescription}>
            Choose either your interested industry sector or job position, along with knowledge scope to generate your resume.
          </p>

          <div className={styles.companyTypeForm}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Interested Job Position</label>
              {jobUrlFetchFailed ? (
                <>
                  <textarea
                    className={`${styles.formInput} ${styles.formTextarea}`}
                    value={interestedJobPositionFromKnowledgeBase}
                    onChange={(e) => handleJobPositionChangeFromKnowledgeBase(e.target.value)}
                    placeholder="Paste the job description content here..."
                    rows={6}
                  />
                </>
              ) : (
                <div 
                  className={styles.jobUrlInputWrapper}
                  onMouseEnter={() => {
                    if (fetchedJobDataFromKnowledgeBase) {
                      // Clear any pending hide timer
                      if (knowledgeBaseTooltipHoverTimerRef.current) {
                        clearTimeout(knowledgeBaseTooltipHoverTimerRef.current);
                        knowledgeBaseTooltipHoverTimerRef.current = null;
                      }
                      setIsKnowledgeBaseTooltipHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (fetchedJobDataFromKnowledgeBase) {
                      // Delay hiding the tooltip
                      knowledgeBaseTooltipHoverTimerRef.current = setTimeout(() => {
                        setIsKnowledgeBaseTooltipHovered(false);
                        knowledgeBaseTooltipHoverTimerRef.current = null;
                      }, 300); // 300ms delay before hiding
                    }
                  }}
                >
                  <input
                    type="text"
                    className={styles.formInput}
                    value={interestedJobPositionFromKnowledgeBase}
                    onChange={(e) => handleJobPositionChangeFromKnowledgeBase(e.target.value)}
                    placeholder="Enter job URL, job title (e.g., Software Engineer at Meta), or paste job description"
                  />
                  {(isJobUrlValidFromKnowledgeBase || fetchedJobDataFromKnowledgeBase || isJobUrlBlockedFromKnowledgeBase) && !isCheckmarkFadingOut ? (
                    <div className={`${styles.jobUrlFetchButtonWrapper}`}>
                      <button
                        type="button"
                        className={`${styles.jobUrlFetchButton} ${fetchedJobDataFromKnowledgeBase ? styles.jobUrlFetchButtonSuccess : isJobUrlBlockedFromKnowledgeBase ? styles.jobUrlFetchButtonBlocked : ''}`}
                        onClick={fetchedJobDataFromKnowledgeBase || isJobUrlBlockedFromKnowledgeBase ? undefined : handleFetchJobUrlFromKnowledgeBase}
                        disabled={isJobUrlFetching || !!fetchedJobDataFromKnowledgeBase || isJobUrlBlockedFromKnowledgeBase}
                        aria-label={fetchedJobDataFromKnowledgeBase ? "Job data fetched successfully" : isJobUrlBlockedFromKnowledgeBase ? "Website blocks direct fetch" : "Fetch job posting"}
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
                        ) : isJobUrlBlockedFromKnowledgeBase ? (
                          <svg
                            className={styles.jobUrlBlockedIcon}
                            width="44"
                            height="44"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2" fill="none"/>
                            <path d="M8 8l8 8M16 8l-8 8" stroke="#dc3545" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        ) : fetchedJobDataFromKnowledgeBase ? (
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
                  {(isJobUrlValidFromKnowledgeBase || fetchedJobDataFromKnowledgeBase || isJobUrlBlockedFromKnowledgeBase) && !isCheckmarkFadingOut && (
                    <>
                      {isJobUrlBlockedFromKnowledgeBase && blockedMessage && (
                        <div className={`${styles.jobUrlFetchTooltip} ${showJobTooltipAuto ? styles.jobUrlFetchTooltipVisible : ''}`}>
                          <div className={styles.jobUrlFetchTooltipContent}>
                            <p className={styles.jobUrlFetchTooltipDescription}>{blockedMessage}</p>
                          </div>
                        </div>
                      )}
                      {fetchedJobDataFromKnowledgeBase && (
                        <div 
                          ref={knowledgeBaseJobTooltipRef} 
                          className={`${styles.jobUrlFetchTooltip} ${(showJobTooltipAuto || isKnowledgeBaseTooltipHovered) ? styles.jobUrlFetchTooltipVisible : ''}`}
                          onMouseEnter={() => {
                            // Clear any pending hide timer when mouse enters tooltip
                            if (knowledgeBaseTooltipHoverTimerRef.current) {
                              clearTimeout(knowledgeBaseTooltipHoverTimerRef.current);
                              knowledgeBaseTooltipHoverTimerRef.current = null;
                            }
                            setIsKnowledgeBaseTooltipHovered(true);
                          }}
                          onMouseLeave={() => {
                            // Delay hiding the tooltip when mouse leaves
                            knowledgeBaseTooltipHoverTimerRef.current = setTimeout(() => {
                              setIsKnowledgeBaseTooltipHovered(false);
                              knowledgeBaseTooltipHoverTimerRef.current = null;
                            }, 300); // 300ms delay before hiding
                          }}
                        >
                          <div className={styles.jobUrlFetchTooltipHeader}>
                            <span className={styles.jobUrlFetchTooltipTitle}>{fetchedJobDataFromKnowledgeBase.target_job_title}</span>
                            <span className={styles.jobUrlFetchTooltipCompany}>{fetchedJobDataFromKnowledgeBase.target_job_company}</span>
                          </div>
                          <div className={styles.jobUrlFetchTooltipContent}>
                            <p className={styles.jobUrlFetchTooltipDescription}>{fetchedJobDataFromKnowledgeBase.target_job_description}</p>
                          </div>
                          <div className={styles.jobUrlFetchTooltipSkills}>
                            {fetchedJobDataFromKnowledgeBase.target_job_skill_keywords.map((skill, index) => (
                              <span key={index} className={styles.jobUrlFetchTooltipSkillTag}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
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
              <label className={styles.formLabel}>Interested Industry Sector</label>
              <div className={styles.customDropdown} ref={companyTypeDropdownRef}>
                <button
                  ref={companyTypeDropdownTriggerRef}
                  type="button"
                  className={`${styles.customDropdownTrigger} ${(interestedJobPositionFromKnowledgeBase && (jobInputType === 'url' || jobInputType === 'job_description')) ? styles.customDropdownTriggerDisabled : ''}`}
                  onClick={() => {
                    if (!(interestedJobPositionFromKnowledgeBase && (jobInputType === 'url' || jobInputType === 'job_description'))) {
                      setIsCompanyTypeDropdownOpen(!isCompanyTypeDropdownOpen);
                    }
                  }}
                  disabled={!!(interestedJobPositionFromKnowledgeBase && (jobInputType === 'url' || jobInputType === 'job_description'))}
                  aria-expanded={isCompanyTypeDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className={styles.dropdownValue}>
                    {interestedCompanyType
                      ? companyTypeOptions.find(opt => opt.value === interestedCompanyType)?.label
                      : 'Select an industry sector'}
                  </span>
                  <svg
                    className={`${styles.dropdownArrow} ${isCompanyTypeDropdownOpen ? styles.dropdownArrowOpen : ''}`}
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
                {isCompanyTypeDropdownOpen && !(interestedJobPositionFromKnowledgeBase && (jobInputType === 'url' || jobInputType === 'job_description')) && (
                  <div className={styles.customDropdownMenu}>
                    <button
                      key="select-default"
                      type="button"
                      className={`${styles.dropdownOption} ${!interestedCompanyType ? styles.dropdownOptionSelected : ''}`}
                      onClick={() => {
                        handleCompanyTypeChange('');
                        setIsCompanyTypeDropdownOpen(false);
                      }}
                    >
                      Select an industry sector
                    </button>
                    {companyTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.dropdownOption} ${interestedCompanyType === option.value ? styles.dropdownOptionSelected : ''}`}
                        onClick={() => {
                          handleCompanyTypeChange(option.value);
                          setIsCompanyTypeDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formField} style={{ position: 'relative', overflow: 'visible' }}>
              <label className={styles.formLabel}>Knowledge Scope</label>
              <div className={styles.knowledgeScopeCheckboxes}>
                <div
                  className={styles.establishedExpertiseContainer}
                  onMouseEnter={() => {
                    if (knowledgeScope.establishedExpertise) {
                      // Clear any pending close timer
                      if (projectSelectionPopupTimerRef.current) {
                        clearTimeout(projectSelectionPopupTimerRef.current);
                        projectSelectionPopupTimerRef.current = null;
                      }
                      setShowProjectSelectionPopup(true);
                    }
                  }}
                  onMouseLeave={() => {
                    // Delay closing by 0.5 seconds
                    if (projectSelectionPopupTimerRef.current) {
                      clearTimeout(projectSelectionPopupTimerRef.current);
                    }
                    projectSelectionPopupTimerRef.current = setTimeout(() => {
                      setShowProjectSelectionPopup(false);
                      projectSelectionPopupTimerRef.current = null;
                    }, 50);
                  }}
                >
                  <label className={styles.presentCheckboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.presentCheckbox}
                      checked={knowledgeScope.establishedExpertise}
                      onChange={(e) =>
                        setKnowledgeScope({
                          ...knowledgeScope,
                          establishedExpertise: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.presentCheckboxText}>Established Expertise</span>
                    {knowledgeScope.establishedExpertise && (
                      <div
                        ref={projectSelectionIconRef}
                        className={`${styles.projectSelectionIcon} ${
                          selectedPersonalProjectIds.size > 0 || selectedProfessionalProjectIds.size > 0 || selectedTechnicalSkillIds.size > 0
                            ? styles.projectSelectionIconActive
                            : styles.projectSelectionIconInactive
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
                          <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q32 0 62-6t58-17l60 61q-41 20-86 31t-94 11Zm280-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM424-296 254-466l56-56 114 114 400-401 56 56-456 457Z"/>
                        </svg>
                      </div>
                    )}
                  </label>
                  {showProjectSelectionPopup && knowledgeScope.establishedExpertise && (
                    <div
                      ref={projectSelectionPopupRef}
                      className={styles.projectSelectionPopup}
                      onMouseEnter={() => {
                        // Clear any pending close timer when mouse enters popup
                        if (projectSelectionPopupTimerRef.current) {
                          clearTimeout(projectSelectionPopupTimerRef.current);
                          projectSelectionPopupTimerRef.current = null;
                        }
                        setShowProjectSelectionPopup(true);
                      }}
                      onMouseLeave={() => {
                        // Delay closing by 0.5 seconds when mouse leaves popup
                        if (projectSelectionPopupTimerRef.current) {
                          clearTimeout(projectSelectionPopupTimerRef.current);
                        }
                        projectSelectionPopupTimerRef.current = setTimeout(() => {
                          setShowProjectSelectionPopup(false);
                          projectSelectionPopupTimerRef.current = null;
                        }, 500);
                      }}
                    >
                      <div className={styles.projectSelectionPopupHeader}>
                        <h2 className={styles.projectSelectionPopupTitle}>Pickup projects for your resume</h2>
                        <p className={styles.projectSelectionPopupSubtitle}>Choose up to 4 projects from each section</p>
                      </div>
                      <div className={styles.projectSelectionPopupContent}>
                        <div className={`${styles.projectSelectionSection} ${styles.projectSelectionSectionPersonal}`}>
                          <div className={styles.projectSelectionSectionHeader}>
                            <h3 className={styles.projectSelectionSectionTitle}>Personal Project</h3>
                            <span className={styles.projectSelectionCount}>
                              {selectedPersonalProjectIds.size}/4
                            </span>
                          </div>
                          <div className={styles.projectSelectionList}>
                            {personalProjects.map((project) => (
                              <label
                                key={project.id}
                                className={`${styles.projectSelectionItem} ${selectedPersonalProjectIds.has(project.id) ? styles.projectSelectionItemSelected : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPersonalProjectIds.has(project.id)}
                                  onChange={() => handleProjectToggle(project.id, true)}
                                  disabled={!selectedPersonalProjectIds.has(project.id) && selectedPersonalProjectIds.size >= 4}
                                />
                                <span className={styles.projectSelectionItemText}>{project.projectName}</span>
                              </label>
                            ))}
                            {personalProjects.length === 0 && (
                              <div className={styles.projectSelectionEmpty}>No personal projects available</div>
                            )}
                          </div>
                        </div>
                        <div className={`${styles.projectSelectionSection} ${styles.projectSelectionSectionProfessional}`}>
                          <div className={styles.projectSelectionSectionHeader}>
                            <h3 className={styles.projectSelectionSectionTitle}>Professional Project</h3>
                            <span className={styles.projectSelectionCount}>
                              {selectedProfessionalProjectIds.size}/4
                            </span>
                          </div>
                          <div className={styles.projectSelectionList}>
                            {professionalProjects.map((project) => (
                              <label
                                key={project.id}
                                className={`${styles.projectSelectionItem} ${selectedProfessionalProjectIds.has(project.id) ? styles.projectSelectionItemSelected : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedProfessionalProjectIds.has(project.id)}
                                  onChange={() => handleProjectToggle(project.id, false)}
                                  disabled={!selectedProfessionalProjectIds.has(project.id) && selectedProfessionalProjectIds.size >= 4}
                                />
                                <span className={styles.projectSelectionItemText}>{project.projectName}</span>
                              </label>
                            ))}
                            {professionalProjects.length === 0 && (
                              <div className={styles.projectSelectionEmpty}>No professional projects available</div>
                            )}
                          </div>
                        </div>
                        <div className={`${styles.projectSelectionSection} ${styles.projectSelectionSectionTechnical}`}>
                          <div className={styles.projectSelectionSectionHeader}>
                            <h3 className={styles.projectSelectionSectionTitle}>Technical Skill Focus</h3>
                            <span className={styles.projectSelectionCount}>
                              {selectedTechnicalSkillIds.size}/20
                            </span>
                          </div>
                          <div className={styles.projectSelectionList}>
                            {selectedTechnicalSkills.map((skill) => (
                              <label
                                key={skill}
                                className={`${styles.projectSelectionItem} ${selectedTechnicalSkillIds.has(skill) ? styles.projectSelectionItemSelected : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedTechnicalSkillIds.has(skill)}
                                  onChange={() => handleTechnicalSkillToggle(skill)}
                                  disabled={!selectedTechnicalSkillIds.has(skill) && selectedTechnicalSkillIds.size >= 20}
                                />
                                <span className={styles.projectSelectionItemText}>{skill}</span>
                              </label>
                            ))}
                            {selectedTechnicalSkills.length === 0 && (
                              <div className={styles.projectSelectionEmpty}>No technical skills available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={styles.establishedExpertiseContainer}
                  onMouseEnter={() => {
                    if (knowledgeScope.expandingKnowledgeBase) {
                      // Clear any pending close timer
                      if (futureProjectSelectionPopupTimerRef.current) {
                        clearTimeout(futureProjectSelectionPopupTimerRef.current);
                        futureProjectSelectionPopupTimerRef.current = null;
                      }
                      setShowFutureProjectSelectionPopup(true);
                    }
                  }}
                  onMouseLeave={() => {
                    // Delay closing by 0.5 seconds
                    if (futureProjectSelectionPopupTimerRef.current) {
                      clearTimeout(futureProjectSelectionPopupTimerRef.current);
                    }
                    futureProjectSelectionPopupTimerRef.current = setTimeout(() => {
                      setShowFutureProjectSelectionPopup(false);
                      futureProjectSelectionPopupTimerRef.current = null;
                    }, 50);
                  }}
                >
                  <label className={styles.presentCheckboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.presentCheckbox}
                      checked={knowledgeScope.expandingKnowledgeBase}
                      onChange={(e) =>
                        setKnowledgeScope({
                          ...knowledgeScope,
                          expandingKnowledgeBase: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.presentCheckboxText}>Expanding Knowledge Base</span>
                    {knowledgeScope.expandingKnowledgeBase && (
                      <div
                        ref={futureProjectSelectionIconRef}
                        className={`${styles.projectSelectionIcon} ${
                          selectedFuturePersonalProjectIds.size > 0 || selectedFutureProfessionalProjectIds.size > 0 || selectedFutureTechnicalSkillIds.size > 0
                            ? styles.projectSelectionIconActive
                            : styles.projectSelectionIconInactive
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
                          <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q32 0 62-6t58-17l60 61q-41 20-86 31t-94 11Zm280-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM424-296 254-466l56-56 114 114 400-401 56 56-456 457Z"/>
                        </svg>
                      </div>
                    )}
                  </label>
                  {showFutureProjectSelectionPopup && knowledgeScope.expandingKnowledgeBase && (
                    <div
                      ref={futureProjectSelectionPopupRef}
                      className={styles.projectSelectionPopup}
                      onMouseEnter={() => {
                        // Clear any pending close timer when mouse enters popup
                        if (futureProjectSelectionPopupTimerRef.current) {
                          clearTimeout(futureProjectSelectionPopupTimerRef.current);
                          futureProjectSelectionPopupTimerRef.current = null;
                        }
                        setShowFutureProjectSelectionPopup(true);
                      }}
                      onMouseLeave={() => {
                        // Delay closing by 0.5 seconds when mouse leaves popup
                        if (futureProjectSelectionPopupTimerRef.current) {
                          clearTimeout(futureProjectSelectionPopupTimerRef.current);
                        }
                        futureProjectSelectionPopupTimerRef.current = setTimeout(() => {
                          setShowFutureProjectSelectionPopup(false);
                          futureProjectSelectionPopupTimerRef.current = null;
                        }, 50);
                      }}
                    >
                      <div className={styles.projectSelectionPopupHeader}>
                        <h2 className={styles.projectSelectionPopupTitle}>Pickup future projects for your resume</h2>
                        <p className={styles.projectSelectionPopupSubtitle}>Choose up to 4 projects from each section and up to 20 future technical skills</p>
                      </div>
                      <div className={styles.projectSelectionPopupContent}>
                        <div className={`${styles.projectSelectionSection} ${styles.projectSelectionSectionPersonal}`}>
                          <div className={styles.projectSelectionSectionHeader}>
                            <h3 className={styles.projectSelectionSectionTitle}>Future Personal Project</h3>
                            <span className={styles.projectSelectionCount}>
                              {selectedFuturePersonalProjectIds.size}/4
                            </span>
                          </div>
                          <div className={styles.projectSelectionList}>
                            {futurePersonalProjects.map((project) => (
                              <label
                                key={project.id}
                                className={`${styles.projectSelectionItem} ${selectedFuturePersonalProjectIds.has(project.id) ? styles.projectSelectionItemSelected : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFuturePersonalProjectIds.has(project.id)}
                                  onChange={() => handleFutureProjectToggle(project.id, true)}
                                  disabled={!selectedFuturePersonalProjectIds.has(project.id) && selectedFuturePersonalProjectIds.size >= 4}
                                />
                                <span className={styles.projectSelectionItemText}>{project.projectName}</span>
                              </label>
                            ))}
                            {futurePersonalProjects.length === 0 && (
                              <div className={styles.projectSelectionEmpty}>No future personal projects available</div>
                            )}
                          </div>
                        </div>
                        <div className={`${styles.projectSelectionSection} ${styles.projectSelectionSectionProfessional}`}>
                          <div className={styles.projectSelectionSectionHeader}>
                            <h3 className={styles.projectSelectionSectionTitle}>Future Professional Project</h3>
                            <span className={styles.projectSelectionCount}>
                              {selectedFutureProfessionalProjectIds.size}/4
                            </span>
                          </div>
                          <div className={styles.projectSelectionList}>
                            {futureProfessionalProjects.map((project) => (
                              <label
                                key={project.id}
                                className={`${styles.projectSelectionItem} ${selectedFutureProfessionalProjectIds.has(project.id) ? styles.projectSelectionItemSelected : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFutureProfessionalProjectIds.has(project.id)}
                                  onChange={() => handleFutureProjectToggle(project.id, false)}
                                  disabled={!selectedFutureProfessionalProjectIds.has(project.id) && selectedFutureProfessionalProjectIds.size >= 4}
                                />
                                <span className={styles.projectSelectionItemText}>{project.projectName}</span>
                              </label>
                            ))}
                            {futureProfessionalProjects.length === 0 && (
                              <div className={styles.projectSelectionEmpty}>No future professional projects available</div>
                            )}
                          </div>
                        </div>
                        <div className={`${styles.projectSelectionSection} ${styles.projectSelectionSectionTechnical}`}>
                          <div className={styles.projectSelectionSectionHeader}>
                            <h3 className={styles.projectSelectionSectionTitle}>Future Technical Skills</h3>
                            <span className={styles.projectSelectionCount}>
                              {selectedFutureTechnicalSkillIds.size}/20
                            </span>
                          </div>
                          <div className={styles.projectSelectionList}>
                            {selectedFutureTechnicalSkills.map((skill) => (
                              <label
                                key={skill}
                                className={`${styles.projectSelectionItem} ${selectedFutureTechnicalSkillIds.has(skill) ? styles.projectSelectionItemSelected : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFutureTechnicalSkillIds.has(skill)}
                                  onChange={() => handleFutureTechnicalSkillToggle(skill)}
                                  disabled={!selectedFutureTechnicalSkillIds.has(skill) && selectedFutureTechnicalSkillIds.size >= 20}
                                />
                                <span className={styles.projectSelectionItemText}>{skill}</span>
                              </label>
                            ))}
                            {selectedFutureTechnicalSkills.length === 0 && (
                              <div className={styles.projectSelectionEmpty}>No future technical skills available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.companyTypePageButtons} style={{ justifyContent: 'flex-end' }}>
            <button
              ref={craftButtonRef}
              type="button"
              className={styles.nextButton}
              onClick={handleCompanyTypeNext}
              disabled={
                isCraftingResume ||
                // Disable if no industry sector AND job position validation fails
                (!interestedCompanyType && (
                  // If fetch failed, only check if field is empty (user can paste description)
                  jobUrlFetchFailed 
                    ? !interestedJobPositionFromKnowledgeBase.trim()
                    // If fetch didn't fail, check if field is empty OR no fetched data
                    : (!interestedJobPositionFromKnowledgeBase.trim() || !fetchedJobDataFromKnowledgeBase)
                )) ||
                // Disable if knowledge scope has nothing checked
                (!knowledgeScope.establishedExpertise && !knowledgeScope.expandingKnowledgeBase)
              }
              aria-label="Craft"
            >
              {isCraftingResume ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ opacity: 1, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
                >
                  <style>{`.spinner_qM83{animation:spinner_8HQG 1.05s infinite}.spinner_oXPr{animation-delay:.1s}.spinner_ZTLf{animation-delay:.2s}@keyframes spinner_8HQG{0%,57.14%{animation-timing-function:cubic-bezier(0.33,.66,.66,1);transform:translate(0)}28.57%{animation-timing-function:cubic-bezier(0.33,0,.66,.33);transform:translateY(-6px)}100%{transform:translate(0)}}`}</style>
                  <circle className="spinner_qM83" cx="4" cy="12" r="3" fill="#4a4a4a"/>
                  <circle className="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3" fill="#4a4a4a"/>
                  <circle className="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3" fill="#4a4a4a"/>
                </svg>
              ) : (
                <span className={styles.nextButtonText}>Craft</span>
              )}
              {!isCraftingResume && (
                <svg
                  className={styles.nextButtonIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            {isCraftingResume && (
              <div className={styles.craftingProgressText}>
                {[
                  'Thinking...',
                  'Analyzing the target job...',
                  'Analyzing your background...',
                  'Analyzing your knowledge scope...',
                  'Crafting your customized resume...',
                  'Almost there! Your resume is in the final stretch!'
                ].map((text, index) => (
                  <span
                    key={index}
                    className={`${styles.craftingProgressTextItem} ${
                      index === craftingCardIndex ? styles.craftingProgressTextItemActive : ''
                    }`}
                  >
                    {index === craftingCardIndex && text.split('').map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className={styles.craftingProgressChar}
                        style={{ animationDelay: `${charIndex * 0.05}s` }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                    {index !== craftingCardIndex && text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // If showing the resume page, render it
  if (showResumePage) {
    return (
      <>
        <div className={styles.resumeSectionHeader}>
          <button
            type="button"
            className={`${styles.backButton} ${styles.resumeTopBackButton}`}
            onClick={handleResumeBack}
            aria-label="Back"
          >
            <svg
              className={styles.backButtonIcon}
              width="32"
              height="32"
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
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`${styles.resumeDownloadButton} ${showDownloadTooltip ? styles.tooltipVisible : ''}`}
              onClick={handleDownloadResume}
              onMouseEnter={handleDownloadButtonMouseEnter}
              onMouseLeave={handleDownloadButtonMouseLeave}
              aria-label="Download Resume"
              data-tooltip="Download Resume"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 -960 960 960"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.resumeAnalysisButton} ${showAnalysisTooltip ? styles.tooltipVisible : ''}`}
              onClick={handleNavigateToAnalysisWithData}
              onMouseEnter={handleAnalysisButtonMouseEnter}
              onMouseLeave={handleAnalysisButtonMouseLeave}
              aria-label="Go to Analysis"
              data-tooltip="Analysis"
            >
              <Image
                src="/images/bubble-chart.svg"
                alt="Analysis"
                width={32}
                height={32}
                className={styles.resumeAnalysisIcon}
              />
            </button>
          </div>
        </div>

        <div className={styles.resumeDocumentContainer}>
          <div className={styles.resumeLeftColumn} ref={resumeLeftColumnRef}>
            {/* Scroll up indicator */}
            {canScrollUp && (
              <div 
                className={styles.scrollIndicatorUp}
                onClick={() => {
                  if (resumeLeftColumnRef.current) {
                    resumeLeftColumnRef.current.scrollBy({ top: -100, behavior: 'smooth' });
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className={styles.resumeLeftColumnContent}>
              {industrySector ? (
                <>
                  {/* Always show Interested Job Position when industry sector is selected */}
                  {interestedJobPositionFromKnowledgeBase && (
                    <div className={`${styles.resumeLeftField} ${styles.resumeLeftFieldCompact}`}>
                      <label className={styles.resumeLeftLabel}>Interested Job Position</label>
                      <div className={styles.resumeLeftDisplayText}>
                        {(fetchedJobDataFromKnowledgeBase || persistedFetchedJobData) ? (
                          <>
                            <div className={styles.resumeLeftJobTitle}>{(fetchedJobDataFromKnowledgeBase || persistedFetchedJobData)!.target_job_title}</div>
                            <div className={styles.resumeLeftJobCompany}>{(fetchedJobDataFromKnowledgeBase || persistedFetchedJobData)!.target_job_company}</div>
                          </>
                        ) : (
                          <div className={styles.resumeLeftJobTitle}>{interestedJobPositionFromKnowledgeBase}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Industry Sector - Read-only display when selected from "from knowledge base" */}
                  <div className={`${styles.resumeLeftField} ${styles.resumeLeftFieldCompact}`}>
                    <label className={styles.resumeLeftLabel}>Industry Sector</label>
                    <div className={styles.resumeLeftDisplayText}>
                      <div className={styles.resumeLeftJobTitle}>
                        {companyTypeOptions.find(opt => opt.value === industrySector)?.label || industrySector}
                      </div>
                    </div>
                  </div>
                </>
              ) : targetJobPosition ? (
                <div className={styles.resumeLeftField}>
                  <label className={styles.resumeLeftLabel}>Target Job Position</label>
                  <div className={styles.resumeLeftDisplayText}>
                    {(fetchedJobDataFromKnowledgeBase || persistedFetchedJobData) ? (
                      <>
                        <div className={styles.resumeLeftJobTitle}>{(fetchedJobDataFromKnowledgeBase || persistedFetchedJobData)!.target_job_title}</div>
                        <div className={styles.resumeLeftJobCompany}>{(fetchedJobDataFromKnowledgeBase || persistedFetchedJobData)!.target_job_company}</div>
                      </>
                    ) : (
                      <div className={styles.resumeLeftJobTitle}>{targetJobPosition}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.resumeLeftField}>
                  <label className={styles.resumeLeftLabel}>Industry Sector</label>
                  <div className={styles.customDropdown} ref={resumeLeftCompanyTypeDropdownRef}>
                    <button
                      ref={resumeLeftCompanyTypeDropdownTriggerRef}
                      type="button"
                      className={styles.customDropdownTrigger}
                      onClick={() => {
                        setIsResumeLeftCompanyTypeDropdownOpen(!isResumeLeftCompanyTypeDropdownOpen);
                      }}
                      aria-expanded={isResumeLeftCompanyTypeDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      <span className={styles.dropdownValue}>
                        {industrySector
                          ? companyTypeOptions.find(opt => opt.value === industrySector)?.label
                          : 'Select an industry sector'}
                      </span>
                      <svg
                        className={`${styles.dropdownArrow} ${isResumeLeftCompanyTypeDropdownOpen ? styles.dropdownArrowOpen : ''}`}
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
                    {isResumeLeftCompanyTypeDropdownOpen && (
                      <div className={styles.customDropdownMenu}>
                        <button
                          key="select-default"
                          type="button"
                          className={`${styles.dropdownOption} ${!industrySector ? styles.dropdownOptionSelected : ''}`}
                          onClick={() => {
                            setIndustrySector('');
                            setIsResumeLeftCompanyTypeDropdownOpen(false);
                          }}
                        >
                          Select an industry sector
                        </button>
                        {companyTypeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`${styles.dropdownOption} ${industrySector === option.value ? styles.dropdownOptionSelected : ''}`}
                            onClick={() => {
                              setIndustrySector(option.value);
                              setIsResumeLeftCompanyTypeDropdownOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Resume upload section for "From existing resume" mode */}
              {resumeMode === 'existing' && (
                <div className={styles.resumeLeftField}>
                  <label className={styles.resumeLeftLabel}>Base Resume File</label>
                  <div className={styles.resumeLeftUploadContainer}>
                    <div className={styles.resumeLeftUploadArea}>
                      <input
                        type="file"
                        id="resume-left-upload"
                        accept=".pdf,.doc,.docx"
                        className={styles.resumeFileInput}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setResumeFile(file);
                        }}
                      />
                      <label htmlFor="resume-left-upload" className={styles.resumeLeftUploadLabel}>
                        <div className={styles.resumeLeftUploadIcon}>
                          <svg 
                            width="20" 
                            height="20" 
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
                        <div className={styles.resumeLeftUploadContent}>
                          <span className={styles.resumeLeftUploadTitle}>
                            {resumeFile ? resumeFile.name : 'Upload Resume'}
                          </span>
                          <span className={styles.resumeLeftUploadSubtitle}>
                            {resumeFile ? 'Click to change file' : 'PDF, DOC, or DOCX (Max 10MB)'}
                          </span>
                        </div>
                        {resumeFile && (
                          <button
                            type="button"
                            className={styles.resumeLeftRemoveButton}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setResumeFile(null);
                              const input = document.getElementById('resume-left-upload') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            aria-label="Remove file"
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
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Knowledge scope selection for "From Knowledge Base" mode */}
              {resumeMode === 'industry' && (
                <div className={`${styles.resumeLeftField} ${styles.resumeLeftFieldCompact}`}>
                  <label className={styles.resumeLeftLabel}>Knowledge Scope</label>
                  <div className={styles.resumeLeftDisplayText}>
                    {[
                      knowledgeScope.establishedExpertise && 'Established Expertise',
                      knowledgeScope.expandingKnowledgeBase && 'Expanding Knowledge Base'
                    ].filter(Boolean).length > 0 ? (
                      [
                        knowledgeScope.establishedExpertise && 'Established Expertise',
                        knowledgeScope.expandingKnowledgeBase && 'Expanding Knowledge Base'
                      ].filter(Boolean).map((item, index) => (
                        <div key={index} className={styles.resumeLeftJobTitle}>
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className={styles.resumeLeftJobTitle}>None selected</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Editing panel for resume sections - show on hover, persist when clicked */}
              {getDisplayedSection() === 'name' && (
                <div className={styles.resumeEditingPanel}>
                  <h3 className={styles.resumeEditingPanelTitle}>Edit Name</h3>
                  <div className={styles.resumeLeftField}>
                    <label className={styles.resumeLeftLabel}>Name</label>
                    <input
                      type="text"
                      className={styles.resumeLeftInput}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>
                </div>
              )}
              
              {getDisplayedSection() === 'contact' && (
                <div className={styles.resumeEditingPanel}>
                  <div className={styles.resumeEditingPanelTitleContainer}>
                    <h3 className={styles.resumeEditingPanelTitle}>Edit Contact Information</h3>
                    <button
                      type="button"
                      className={styles.resumeAddFieldButton}
                      onClick={addContactField}
                      aria-label="Add contact field"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  {contactFields.map((field, idx) => {
                    const inputRef = field.id === 'email' ? emailInputRef : 
                                     field.id === 'phone' ? phoneInputRef :
                                     field.id === 'location' ? locationInputRef :
                                     field.id === 'linkedin' ? linkedinInputRef : null;
                    return (
                      <div
                        key={field.id}
                        className={`${styles.resumeProfessionalSection} ${
                          draggedContactId === field.id ? styles.resumeProfessionalSectionDragging : ''
                        } ${
                          dragOverContactId === field.id ? styles.resumeProfessionalSectionDragOver : ''
                        }`}
                        onDragOver={(e) => handleContactDragOver(e, field.id)}
                        onDragEnd={handleContactDragEnd}
                        onMouseEnter={() => setHoveredContactId(field.id)}
                        onMouseLeave={() => setHoveredContactId(null)}
                        style={{
                          marginBottom: '1.5rem',
                          paddingBottom: '1.5rem',
                          borderBottom: idx < contactFields.length - 1 ? '1px solid rgba(214, 191, 154, 0.2)' : 'none'
                        }}
                      >
                        <div className={styles.resumeLeftField}>
                          <div className={styles.resumeProfessionalHeaderRow}>
                            {editingContactLabelId === field.id ? (
                              <input
                                type="text"
                                className={styles.resumeLeftInput}
                                value={editingContactLabelValue}
                                onChange={(e) => setEditingContactLabelValue(e.target.value)}
                                onBlur={() => {
                                  updateContactField(field.id, 'label', editingContactLabelValue);
                                  setEditingContactLabelId(null);
                                  setEditingContactLabelValue('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateContactField(field.id, 'label', editingContactLabelValue);
                                    setEditingContactLabelId(null);
                                    setEditingContactLabelValue('');
                                  } else if (e.key === 'Escape') {
                                    setEditingContactLabelId(null);
                                    setEditingContactLabelValue('');
                                  }
                                }}
                                placeholder="Field Label"
                                autoFocus
                                style={{ flex: '1 1 auto', minWidth: 0 }}
                              />
                            ) : (
                              <span
                                className={styles.resumeLeftLabel}
                                onDoubleClick={() => {
                                  setEditingContactLabelId(field.id);
                                  setEditingContactLabelValue(field.label);
                                }}
                                style={{ cursor: 'text', userSelect: 'text', flex: '1 1 auto', minWidth: 0 }}
                              >
                                {field.label || 'Field Label'}
                              </span>
                            )}
                            <div className={styles.resumeProfessionalOperationButton}>
                              <div className={styles.resumeProfessionalOperationButtons}>
                                {(!field.isDefault || field.id === 'linkedin') && (
                                  <button
                                    type="button"
                                    className={`${styles.resumeDeleteFieldButton} ${
                                      hoveredContactId === field.id ? styles.resumeDeleteFieldButtonVisible : ''
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeContactField(field.id);
                                    }}
                                    aria-label="Remove contact field"
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
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                )}
                                <div
                                  className={styles.resumeDragHandleButton}
                                  draggable
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    handleContactDragStart(e, field.id);
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  aria-label="Drag to reorder"
                                  role="button"
                                  tabIndex={0}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.resumeLeftField}>
                          <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            className={styles.resumeLeftInput}
                            value={field.value}
                            onChange={(e) => {
                              updateContactField(field.id, 'value', e.target.value);
                            }}
                            placeholder="Field Value"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Editing panel for Professional section */}
              {getDisplayedSection() === 'professional' && (
                <div className={styles.resumeEditingPanel}>
                  <div className={styles.resumeEditingPanelTitleContainer}>
                    <h3 className={styles.resumeEditingPanelTitle}>Edit Professional Experience</h3>
                    <button
                      type="button"
                      className={styles.resumeAddFieldButton}
                      onClick={addProfessionalExperience}
                      aria-label="Add new company experience"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {professionalExperiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className={`${styles.resumeProfessionalSection} ${
                        draggedCompany === exp.id ? styles.resumeProfessionalSectionDragging : ''
                      } ${
                        dragOverCompany === exp.id ? styles.resumeProfessionalSectionDragOver : ''
                      }`}
                      onDragOver={(e) => handleCompanyDragOver(e, exp.id)}
                      onDragEnd={handleCompanyDragEnd}
                      onMouseEnter={() => setHoveredCompanyId(exp.id)}
                      onMouseLeave={() => setHoveredCompanyId(null)}
                      style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom:
                          idx < professionalExperiences.length - 1
                            ? '1px solid rgba(214, 191, 154, 0.3)'
                            : 'none',
                      }}
                    >
                      <div className={styles.resumeProfessionalHeaderRow}>
                        <div className={styles.resumeProfessionalHeaderText}>
                          <span className={styles.resumeProfessionalCompany}>
                            {exp.company || 'Company'}
                          </span>
                        </div>
                        <div className={styles.resumeProfessionalOperationButton}>
                          <div className={styles.resumeProfessionalOperationButtons}>
                            <button
                              type="button"
                              className={styles.resumeCollapseButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProfessionalCollapse(exp.id);
                              }}
                              aria-label={
                                collapsedProfessionalIds.includes(exp.id)
                                  ? 'Expand experience'
                                  : 'Collapse experience'
                              }
                            >
                              <svg
                                className={
                                  collapsedProfessionalIds.includes(exp.id)
                                    ? styles.resumeCollapseIconCollapsed
                                    : styles.resumeCollapseIconExpanded
                                }
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 9l6 6 6-6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className={`${styles.resumeDeleteFieldButton} ${
                                hoveredCompanyId === exp.id ? styles.resumeDeleteFieldButtonVisible : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeProfessionalExperience(exp.id);
                              }}
                              aria-label="Remove company experience"
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
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <div
                              className={styles.resumeDragHandleButton}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              aria-label="Drag to reorder"
                              role="button"
                              tabIndex={0}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!collapsedProfessionalIds.includes(exp.id) && (
                        <>
                          <div className={styles.resumeLeftField}>
                            <label className={styles.resumeLeftLabel}>Company</label>
                            <input
                              type="text"
                              className={styles.resumeLeftInput}
                              value={exp.company}
                              onChange={(e) =>
                                updateProfessionalExperience(exp.id, 'company', e.target.value)
                              }
                              placeholder="Company Name"
                            />
                          </div>
                          {exp.jobTitles.map((jobTitle, jobTitleIdx) => (
                            <div
                              key={jobTitle.id}
                              className={`${styles.resumeProfessionalSection} ${
                                draggedJobTitle?.expId === exp.id && draggedJobTitle?.jobTitleId === jobTitle.id ? styles.resumeProfessionalSectionDragging : ''
                              } ${
                                dragOverJobTitle?.expId === exp.id && dragOverJobTitle?.jobTitleId === jobTitle.id ? styles.resumeProfessionalSectionDragOver : ''
                              } ${jobTitleIdx < exp.jobTitles.length - 1 ? styles.resumeJobTitleSeparator : ''}`}
                              onDragOver={(e) => handleJobTitleDragOver(e, exp.id, jobTitle.id)}
                              onDragEnd={handleJobTitleDragEnd}
                              style={{ marginBottom: '1rem', paddingBottom: '1rem' }}
                            >
                              <div 
                                className={styles.resumeLeftField}
                                onMouseEnter={() => setHoveredJobTitleId(jobTitle.id)}
                                onMouseLeave={() => setHoveredJobTitleId(null)}
                              >
                                <div className={styles.resumeProfessionalHeaderRow}>
                                  <label className={styles.resumeLeftLabel}>Job Title</label>
                                  <div className={styles.resumeProfessionalOperationButton}>
                                    <div className={styles.resumeProfessionalOperationButtons}>
                                      <button
                                        type="button"
                                        className={styles.resumeCollapseButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleJobTitleCollapse(jobTitle.id);
                                        }}
                                        aria-label={
                                          collapsedJobTitleIds.includes(jobTitle.id)
                                            ? 'Expand job details'
                                            : 'Collapse job details'
                                        }
                                      >
                                        <svg
                                          className={
                                            collapsedJobTitleIds.includes(jobTitle.id)
                                              ? styles.resumeCollapseIconCollapsed
                                              : styles.resumeCollapseIconExpanded
                                          }
                                          viewBox="0 0 24 24"
                                          aria-hidden="true"
                                        >
                                          <path
                                            d="M6 9l6 6 6-6"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className={`${styles.resumeBulletAddButton} ${
                                          (hoveredJobTitleId === jobTitle.id || focusedJobTitleId === jobTitle.id) ? styles.resumeBulletAddButtonVisible : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addJobTitle(exp.id);
                                        }}
                                        aria-label="Add job title"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path
                                            d="M12 5V19M5 12H19"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className={`${styles.resumeDeleteFieldButton} ${
                                          (hoveredJobTitleId === jobTitle.id || focusedJobTitleId === jobTitle.id) ? styles.resumeDeleteFieldButtonVisible : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeJobTitle(exp.id, jobTitle.id);
                                        }}
                                        aria-label="Remove job title"
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
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <div
                                        className={styles.resumeDragHandleButton}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          handleJobTitleDragStart(e, exp.id, jobTitle.id);
                                        }}
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                        }}
                                        aria-label="Drag to reorder"
                                        role="button"
                                        tabIndex={0}
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  className={styles.resumeLeftInput}
                                  value={jobTitle.title}
                                  onChange={(e) =>
                                    updateJobTitle(exp.id, jobTitle.id, 'title', e.target.value)
                                  }
                                  onFocus={() => setFocusedJobTitleId(jobTitle.id)}
                                  onBlur={() => setFocusedJobTitleId(null)}
                                  placeholder="Job Title"
                                />
                              </div>
                              {!collapsedJobTitleIds.includes(jobTitle.id) && (
                                <>
                                  <div className={styles.resumeLeftField}>
                                    <label className={styles.resumeLeftLabel}>Location & Duration</label>
                                    <input
                                      type="text"
                                      className={styles.resumeLeftInput}
                                      value={jobTitle.date}
                                      onChange={(e) =>
                                        updateJobTitle(exp.id, jobTitle.id, 'date', e.target.value)
                                      }
                                      placeholder="2020 - Present"
                                    />
                                  </div>
                                  <div 
                                    className={styles.resumeLeftField}
                                    onMouseEnter={() => setHoveredProjectOverviewId(jobTitle.id)}
                                    onMouseLeave={() => setHoveredProjectOverviewId(null)}
                                  >
                                    <div className={styles.resumeLeftLabelContainer}>
                                      <label className={styles.resumeLeftLabel}>Projects</label>
                                    </div>
                                    {(() => {
                                      // Group bullets by project
                                      interface ProjectGroup {
                                        name: string;
                                        bulletIndices: number[];
                                      }
                                      
                                      const projectGroups: ProjectGroup[] = [];
                                      let currentGroup: ProjectGroup | null = null;
                                      
                                      jobTitle.bullets.forEach((bullet, idx) => {
                                        if (bullet.startsWith(PROJECT_HEADER_PREFIX)) {
                                          if (currentGroup) {
                                            projectGroups.push(currentGroup);
                                          }
                                          currentGroup = {
                                            name: bullet.slice(PROJECT_HEADER_PREFIX.length).trim(),
                                            bulletIndices: [idx]
                                          };
                                        } else if (currentGroup) {
                                          currentGroup.bulletIndices.push(idx);
                                        } else {
                                          // Bullets before any project header
                                          if (projectGroups.length === 0 || projectGroups[projectGroups.length - 1].name !== '') {
                                            projectGroups.push({ name: '', bulletIndices: [idx] });
                                          } else {
                                            projectGroups[projectGroups.length - 1].bulletIndices.push(idx);
                                          }
                                        }
                                      });
                                      
                                      if (currentGroup) {
                                        projectGroups.push(currentGroup);
                                      }
                                      
                                      return projectGroups.map((group, groupIdx) => (
                                        <div key={groupIdx}>
                                          {groupIdx > 0 && (
                                            <div className={styles.resumeProjectSeparator}></div>
                                          )}
                                          {group.name && (
                                            <div
                                              className={`${styles.resumeProjectNameInLeftPanel} ${
                                                dragOverProfessionalProjectGroup?.expId === exp.id &&
                                                dragOverProfessionalProjectGroup?.jobTitleId === jobTitle.id &&
                                                dragOverProfessionalProjectGroup?.groupIdx === groupIdx
                                                  ? styles.resumeBulletRowActive
                                                  : ''
                                              }`}
                                              style={{ marginTop: groupIdx > 0 ? '1rem' : '0', marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}
                                              onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragOverProfessionalProjectGroup({expId: exp.id, jobTitleId: jobTitle.id, groupIdx});
                                              }}
                                              onDragLeave={() => setDragOverProfessionalProjectGroup(null)}
                                              onDrop={(e) => {
                                                e.preventDefault();
                                                if (draggedProfessionalProjectGroup &&
                                                    draggedProfessionalProjectGroup.expId === exp.id &&
                                                    draggedProfessionalProjectGroup.jobTitleId === jobTitle.id &&
                                                    draggedProfessionalProjectGroup.groupIdx !== groupIdx) {
                                                  reorderProfessionalProjectGroups(exp.id, jobTitle.id, draggedProfessionalProjectGroup.groupIdx, groupIdx);
                                                }
                                                setDraggedProfessionalProjectGroup(null);
                                                setDragOverProfessionalProjectGroup(null);
                                              }}
                                            >
                                              <span>{group.name}</span>
                                              <div className={styles.resumeProfessionalOperationButton}>
                                                <div className={styles.resumeProfessionalOperationButtons}>
                                                  <button
                                                    type="button"
                                                    className={styles.resumeCollapseButton}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleProjectGroupCollapse(exp.id, jobTitle.id, group.name);
                                                    }}
                                                    aria-label={
                                                      isProjectGroupCollapsed(exp.id, jobTitle.id, group.name)
                                                        ? 'Expand project'
                                                        : 'Collapse project'
                                                    }
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                  >
                                                    <svg
                                                      className={
                                                        isProjectGroupCollapsed(exp.id, jobTitle.id, group.name)
                                                          ? styles.resumeCollapseIconCollapsed
                                                          : styles.resumeCollapseIconExpanded
                                                      }
                                                      viewBox="0 0 24 24"
                                                      aria-hidden="true"
                                                    >
                                                      <path
                                                        d="M6 9l6 6 6-6"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className={`${styles.resumeBulletAddButton} ${styles.resumeBulletAddButtonVisible}`}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      addProfessionalProjectBullet(exp.id, jobTitle.id, group.name);
                                                    }}
                                                    aria-label="Add bullet point to project"
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                  >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path
                                                        d="M12 5V19M5 12H19"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                      />
                                                    </svg>
                                                  </button>
                                                  <div
                                                    className={styles.resumeDragHandleButton}
                                                    draggable
                                                    onDragStart={(e) => {
                                                      e.stopPropagation();
                                                      setDraggedProfessionalProjectGroup({expId: exp.id, jobTitleId: jobTitle.id, groupIdx});
                                                    }}
                                                    onDragEnd={() => {
                                                      setDraggedProfessionalProjectGroup(null);
                                                      setDragOverProfessionalProjectGroup(null);
                                                    }}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    aria-label="Drag to reorder project"
                                                    role="button"
                                                    tabIndex={0}
                                                    style={{ flexShrink: 0 }}
                                                  >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    className={styles.resumeDeleteFieldButton}
                                                    onClick={() => deleteProfessionalProjectGroup(exp.id, jobTitle.id, group.name)}
                                                    aria-label="Delete project"
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                  >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {!isProjectGroupCollapsed(exp.id, jobTitle.id, group.name) && (
                                            <>
                                          {group.bulletIndices.map((bulletIdx) => {
                                            // Skip rendering input field for project header bullets
                                            if (jobTitle.bullets[bulletIdx].startsWith(PROJECT_HEADER_PREFIX)) {
                                              return null;
                                            }

                                            return (
                                            <div
                                              key={bulletIdx}
                                              className={`${styles.resumeBulletRow} ${
                                                dragOverBullet &&
                                                dragOverBullet.expId === exp.id &&
                                                dragOverBullet.jobTitleId === jobTitle.id &&
                                                dragOverBullet.index === bulletIdx
                                                  ? styles.resumeBulletRowActive
                                                  : ''
                                              }`}
                                              onDragOver={e =>
                                                handleBulletDragOver(e, exp.id, jobTitle.id, bulletIdx)
                                              }
                                              onDragEnd={handleBulletDragEnd}
                                            >
                                              <div
                                                className={`${styles.resumeDragHandleButton} ${
                                                  (hoveredProjectOverviewId === jobTitle.id || focusedProjectOverviewId === jobTitle.id) ? styles.resumeDragHandleButtonVisible : ''
                                                }`}
                                                draggable
                                                onDragStart={e => {
                                                  e.stopPropagation();
                                                  handleBulletDragStart(e, exp.id, jobTitle.id, bulletIdx);
                                                }}
                                                onMouseDown={(e) => {
                                                  e.stopPropagation();
                                                }}
                                                aria-label="Drag to reorder"
                                                role="button"
                                                tabIndex={0}
                                                style={{ flexShrink: 0 }}
                                              >
                                                <svg
                                                  width="12"
                                                  height="12"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              </div>
                                              <textarea
                                                className={styles.resumeLeftInput}
                                                value={jobTitle.bullets[bulletIdx]}
                                                onChange={e =>
                                                  updateProfessionalBullet(exp.id, jobTitle.id, bulletIdx, e.target.value)
                                                }
                                                onFocus={(e) => {
                                                  e.stopPropagation();
                                                  setFocusedProjectOverviewId(jobTitle.id);
                                                  handleTextareaFocus(e);
                                                }}
                                                onBlur={(e) => {
                                                  e.stopPropagation();
                                                  setFocusedProjectOverviewId(null);
                                                  handleTextareaBlur(e);
                                                }}
                                                placeholder="Key achievement or responsibility"
                                                rows={1}
                                              />
                                              <button
                                                type="button"
                                                className={`${styles.resumeDeleteFieldButton} ${
                                                  (hoveredProjectOverviewId === jobTitle.id || focusedProjectOverviewId === jobTitle.id) ? styles.resumeDeleteFieldButtonVisible : ''
                                                }`}
                                                onClick={() => deleteProfessionalBullet(exp.id, jobTitle.id, bulletIdx)}
                                                aria-label="Delete bullet point"
                                                onMouseDown={(e) => e.stopPropagation()}
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
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                            );
                                          })}
                                          {group.name && (
                                            <div className={styles.resumeLeftField} style={{ marginTop: '0.5rem' }}>
                                              <label className={styles.resumeLeftLabel} style={{ fontSize: '1.1rem' }}>Technologies</label>
                                              <textarea
                                                className={styles.resumeLeftInput}
                                                value={
                                                  (() => {
                                                    const techValue = jobTitle.projectTechnologies?.[group.name];
                                                    return Array.isArray(techValue)
                                                      ? techValue.join(', ')
                                                      : (typeof techValue === 'string' ? techValue : '');
                                                  })()
                                                }
                                                onChange={(e) => {
                                                  updateProjectTechnologies(exp.id, jobTitle.id, group.name, e.target.value);
                                                }}
                                                onFocus={(e) => {
                                                  setFocusedProjectOverviewId(jobTitle.id);
                                                  handleTextareaFocus(e);
                                                }}
                                                onBlur={(e) => {
                                                  setFocusedProjectOverviewId(null);
                                                  handleTextareaBlur(e);
                                                }}
                                                placeholder="React, TypeScript, Node.js"
                                                rows={1}
                                              />
                                            </div>
                                          )}
                                            </>
                                          )}
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Editing panel for Education section */}
              {getDisplayedSection() === 'education' && (
                <div className={styles.resumeEditingPanel}>
                  <div className={styles.resumeEditingPanelTitleContainer}>
                    <h3 className={styles.resumeEditingPanelTitle}>Edit Education</h3>
                    <button
                      type="button"
                      className={styles.resumeAddFieldButton}
                      onClick={addEducation}
                      aria-label="Add new education"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {educationData.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className={`${styles.resumeProfessionalSection} ${
                        draggedEducation === edu.id ? styles.resumeProfessionalSectionDragging : ''
                      } ${
                        dragOverEducation === edu.id ? styles.resumeProfessionalSectionDragOver : ''
                      }`}
                      onDragOver={(e) => handleEducationDragOver(e, edu.id)}
                      onDragEnd={handleEducationDragEnd}
                      onMouseEnter={() => setHoveredEducationId(edu.id)}
                      onMouseLeave={() => setHoveredEducationId(null)}
                      style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom:
                          idx < educationData.length - 1
                            ? '1px solid rgba(214, 191, 154, 0.3)'
                            : 'none',
                      }}
                    >
                      <div className={styles.resumeProfessionalHeaderRow}>
                        <div className={styles.resumeProfessionalHeaderText}>
                          <span className={styles.resumeProfessionalCompany}>
                            {edu.university || 'University'}
                          </span>
                        </div>
                        <div className={styles.resumeProfessionalOperationButton}>
                          <div className={styles.resumeProfessionalOperationButtons}>
                            <button
                              type="button"
                              className={styles.resumeCollapseButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEducationCollapse(edu.id);
                              }}
                              aria-label={
                                collapsedEducationIds.includes(edu.id)
                                  ? 'Expand education'
                                  : 'Collapse education'
                              }
                            >
                              <svg
                                className={
                                  collapsedEducationIds.includes(edu.id)
                                    ? styles.resumeCollapseIconCollapsed
                                    : styles.resumeCollapseIconExpanded
                                }
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 9l6 6 6-6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className={`${styles.resumeDeleteFieldButton} ${
                                hoveredEducationId === edu.id ? styles.resumeDeleteFieldButtonVisible : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEducation(edu.id);
                              }}
                              aria-label="Remove education"
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
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <div
                              className={styles.resumeDragHandleButton}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleEducationDragStart(e, edu.id);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              aria-label="Drag to reorder"
                              role="button"
                              tabIndex={0}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!collapsedEducationIds.includes(edu.id) && (
                        <>
                          <div className={styles.resumeLeftField}>
                            <label className={styles.resumeLeftLabel}>University</label>
                            <input
                              type="text"
                              className={styles.resumeLeftInput}
                              value={edu.university}
                              onChange={(e) => updateEducation(edu.id, 'university', e.target.value)}
                              placeholder="University Name"
                            />
                          </div>
                          <div className={styles.resumeLeftField}>
                            <label className={styles.resumeLeftLabel}>Location & Duration</label>
                            <input
                              type="text"
                              className={styles.resumeLeftInput}
                              value={edu.date}
                              onChange={(e) => updateEducation(edu.id, 'date', e.target.value)}
                              placeholder="2014 - 2018"
                            />
                          </div>
                          {(() => {
                            const normalizedEdu = normalizeEducation(edu);
                            return normalizedEdu.degrees.map((degree, degreeIdx) => (
                              <div
                                key={degree.id}
                                className={`${styles.resumeProfessionalSection} ${
                                  draggedDegree?.eduId === edu.id && draggedDegree?.degreeId === degree.id ? styles.resumeProfessionalSectionDragging : ''
                                } ${
                                  dragOverDegree?.eduId === edu.id && dragOverDegree?.degreeId === degree.id ? styles.resumeProfessionalSectionDragOver : ''
                                }`}
                                style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: degreeIdx < normalizedEdu.degrees.length - 1 ? '1px dashed rgba(214, 191, 154, 0.2)' : 'none' }}
                                onDragOver={(e) => handleDegreeDragOver(e, edu.id, degree.id)}
                                onDragEnd={handleDegreeDragEnd}
                              >
                              <div 
                                className={styles.resumeLeftField}
                                onMouseEnter={() => setHoveredDegreeId(degree.id)}
                                onMouseLeave={() => setHoveredDegreeId(null)}
                              >
                                <div className={styles.resumeProfessionalHeaderRow}>
                                  <label className={styles.resumeLeftLabel}>Degree</label>
                                  <div className={styles.resumeProfessionalOperationButton}>
                                    <div className={styles.resumeProfessionalOperationButtons}>
                                      <button
                                        type="button"
                                        className={styles.resumeCollapseButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleDegreeCollapse(degree.id);
                                        }}
                                        aria-label={
                                          collapsedDegreeIds.includes(degree.id)
                                            ? 'Expand degree details'
                                            : 'Collapse degree details'
                                        }
                                      >
                                        <svg
                                          className={
                                            collapsedDegreeIds.includes(degree.id)
                                              ? styles.resumeCollapseIconCollapsed
                                              : styles.resumeCollapseIconExpanded
                                          }
                                          viewBox="0 0 24 24"
                                          aria-hidden="true"
                                        >
                                          <path
                                            d="M6 9l6 6 6-6"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className={`${styles.resumeBulletAddButton} ${
                                          (hoveredDegreeId === degree.id || focusedDegreeId === degree.id) ? styles.resumeBulletAddButtonVisible : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addDegree(edu.id);
                                        }}
                                        aria-label="Add degree"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path
                                            d="M12 5V19M5 12H19"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className={`${styles.resumeDeleteFieldButton} ${
                                          (hoveredDegreeId === degree.id || focusedDegreeId === degree.id) ? styles.resumeDeleteFieldButtonVisible : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeDegree(edu.id, degree.id);
                                        }}
                                        aria-label="Remove degree"
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
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <div
                                        className={styles.resumeDragHandleButton}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          handleDegreeDragStart(e, edu.id, degree.id);
                                        }}
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                        }}
                                        aria-label="Drag to reorder"
                                        role="button"
                                        tabIndex={0}
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <textarea
                                  className={styles.resumeLeftInput}
                                  value={degree.degree}
                                  onChange={(e) => updateDegree(edu.id, degree.id, 'degree', e.target.value)}
                                  onFocus={(e) => {
                                    setFocusedDegreeId(degree.id);
                                    handleTextareaFocus(e);
                                  }}
                                  onBlur={(e) => {
                                    setFocusedDegreeId(null);
                                    handleTextareaBlur(e);
                                  }}
                                  placeholder="Degree Name"
                                  rows={1}
                                />
                              </div>
                              {!collapsedDegreeIds.includes(degree.id) && (
                                <div className={styles.resumeLeftField}>
                                  <label className={styles.resumeLeftLabel}>Description</label>
                                  <textarea
                                    className={styles.resumeLeftInput}
                                    value={degree.description}
                                    onChange={(e) => updateDegree(edu.id, degree.id, 'description', e.target.value)}
                                    onFocus={handleTextareaFocus}
                                    onBlur={handleTextareaBlur}
                                    placeholder="GPA: 3.8/4.0 | Relevant coursework or honors"
                                    rows={1}
                                  />
                                </div>
                              )}
                              </div>
                            ));
                          })()}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Editing panel for Project Experience section */}
              {getDisplayedSection() === 'project' && (
                <div className={styles.resumeEditingPanel}>
                  <div className={styles.resumeEditingPanelTitleContainer}>
                    <h3 className={styles.resumeEditingPanelTitle}>Edit Project Experience</h3>
                    <button
                      type="button"
                      className={styles.resumeAddFieldButton}
                      onClick={addProject}
                      aria-label="Add new project"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {getCurrentProjects().map((proj, idx) => {
                    const currentProjects = getCurrentProjects();
                    return (
                    <div
                      key={proj.id}
                      className={`${styles.resumeProfessionalSection} ${
                        draggedProject === proj.id ? styles.resumeProfessionalSectionDragging : ''
                      } ${
                        dragOverProject === proj.id ? styles.resumeProfessionalSectionDragOver : ''
                      }`}
                      onDragOver={(e) => handleProjectDragOver(e, proj.id)}
                      onDragEnd={handleProjectDragEnd}
                      onMouseEnter={() => setHoveredProjectId(proj.id)}
                      onMouseLeave={() => setHoveredProjectId(null)}
                      style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: idx < currentProjects.length - 1 ? '1px solid rgba(214, 191, 154, 0.3)' : 'none'
                      }}
                    >
                      <div className={styles.resumeProfessionalHeaderRow}>
                        <div className={styles.resumeProfessionalHeaderText}>
                          <span className={styles.resumeProfessionalCompany}>
                            {proj.name || 'Project'}
                          </span>
                        </div>
                        <div className={styles.resumeProfessionalOperationButton}>
                          <div className={styles.resumeProfessionalOperationButtons}>
                            <button
                              type="button"
                              className={styles.resumeCollapseButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectCollapse(proj.id);
                              }}
                              aria-label={
                                collapsedProjectIds.includes(proj.id)
                                  ? 'Expand project'
                                  : 'Collapse project'
                              }
                            >
                              <svg
                                className={
                                  collapsedProjectIds.includes(proj.id)
                                    ? styles.resumeCollapseIconCollapsed
                                    : styles.resumeCollapseIconExpanded
                                }
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 9l6 6 6-6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className={`${styles.resumeDeleteFieldButton} ${
                                hoveredProjectId === proj.id ? styles.resumeDeleteFieldButtonVisible : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeProject(proj.id);
                              }}
                              aria-label="Remove project"
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
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <div
                              className={styles.resumeDragHandleButton}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleProjectDragStart(e, proj.id);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              aria-label="Drag to reorder"
                              role="button"
                              tabIndex={0}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!collapsedProjectIds.includes(proj.id) && (
                        <>
                          <div className={styles.resumeLeftField}>
                            <label className={styles.resumeLeftLabel}>Project Name</label>
                            <input
                              type="text"
                              className={styles.resumeLeftInput}
                              value={proj.name}
                              onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                              placeholder="Project Name"
                            />
                          </div>
                          <div className={styles.resumeLeftField}>
                            <label className={styles.resumeLeftLabel}>Location & Duration</label>
                            <input
                              type="text"
                              className={styles.resumeLeftInput}
                              value={proj.date}
                              onChange={(e) => updateProject(proj.id, 'date', e.target.value)}
                              placeholder="2023"
                            />
                          </div>
                          <div 
                            className={styles.resumeLeftField}
                            onMouseEnter={() => setHoveredProjectBulletId(proj.id)}
                            onMouseLeave={() => setHoveredProjectBulletId(null)}
                          >
                            <div className={styles.resumeLeftLabelContainer}>
                              <label className={styles.resumeLeftLabel}>Project Bullet Point</label>
                              <button
                                type="button"
                                className={`${styles.resumeBulletAddButton} ${
                                  (hoveredProjectBulletId === proj.id || focusedProjectBulletId === proj.id) ? styles.resumeBulletAddButtonVisible : ''
                                }`}
                                onClick={() => addProjectBullet(proj.id)}
                                aria-label="Add bullet point"
                              >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    d="M12 5V19M5 12H19"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                            {proj.bullets.map((bullet, bulletIdx) => (
                              <div
                                key={bulletIdx}
                                className={`${styles.resumeBulletRow} ${
                                  dragOverProjectBullet?.projId === proj.id && dragOverProjectBullet?.index === bulletIdx
                                    ? styles.resumeBulletRowActive
                                    : ''
                                }`}
                                onDragOver={e => handleProjectBulletDragOver(e, proj.id, bulletIdx)}
                                onDragEnd={handleProjectBulletDragEnd}
                              >
                                <div
                                  className={`${styles.resumeDragHandleButton} ${
                                    (hoveredProjectBulletId === proj.id || focusedProjectBulletId === proj.id) ? styles.resumeDragHandleButtonVisible : ''
                                  }`}
                                  draggable
                                  onDragStart={e => {
                                    e.stopPropagation();
                                    handleProjectBulletDragStart(e, proj.id, bulletIdx);
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  aria-label="Drag to reorder"
                                  role="button"
                                  tabIndex={0}
                                  style={{ flexShrink: 0 }}
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                                <textarea
                                  className={styles.resumeLeftInput}
                                  value={bullet}
                                  onChange={e => updateProjectBullet(proj.id, bulletIdx, e.target.value)}
                                  onFocus={(e) => {
                                    e.stopPropagation();
                                    setFocusedProjectBulletId(proj.id);
                                    handleTextareaFocus(e);
                                  }}
                                  onBlur={(e) => {
                                    e.stopPropagation();
                                    setFocusedProjectBulletId(null);
                                    handleTextareaBlur(e);
                                  }}
                                  placeholder="Key feature or contribution"
                                  rows={1}
                                />
                                <button
                                  type="button"
                                  className={`${styles.resumeDeleteFieldButton} ${
                                    (hoveredProjectBulletId === proj.id || focusedProjectBulletId === proj.id) ? styles.resumeDeleteFieldButtonVisible : ''
                                  }`}
                                  onClick={() => deleteProjectBullet(proj.id, bulletIdx)}
                                  aria-label="Delete bullet point"
                                  onMouseDown={(e) => e.stopPropagation()}
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
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className={styles.resumeLeftField}>
                            <label className={styles.resumeLeftLabel}>Technologies</label>
                            <textarea
                              className={styles.resumeLeftInput}
                              value={(proj.technologies || []).join(', ')}
                              onChange={(e) => {
                                const raw = e.target.value || '';
                                const list = raw
                                  .split(',')
                                  .map(t => t.trim())
                                  .filter(Boolean);
                                updateProject(proj.id, 'technologies', list);
                              }}
                              onFocus={handleTextareaFocus}
                              onBlur={handleTextareaBlur}
                              placeholder="React, TypeScript, Node.js"
                              rows={1}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
              
              {/* Editing panel for Technical Skills section */}
              {getDisplayedSection() === 'technical' && (
                <div className={styles.resumeEditingPanel}>
                  <div className={styles.resumeEditingPanelTitleContainer}>
                    <h3 className={styles.resumeEditingPanelTitle}>Edit Technical Skills</h3>
                    <button
                      type="button"
                      className={styles.resumeAddFieldButton}
                      onClick={() => {
                        const newId = Date.now().toString();
                        const newSkill = { id: newId, topic: '', keywords: '' };
                        setSkills(prev => [newSkill, ...prev]);
                      }}
                      aria-label="Add new skill"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {skills.map((skill, idx) => (
                    <div
                      key={skill.id}
                      className={`${styles.resumeProfessionalSection} ${
                        draggedSkill === skill.id ? styles.resumeProfessionalSectionDragging : ''
                      } ${
                        dragOverSkill === skill.id ? styles.resumeProfessionalSectionDragOver : ''
                      }`}
                      onDragOver={(e) => handleSkillDragOver(e, skill.id)}
                      onDragEnd={handleSkillDragEnd}
                      onMouseEnter={() => setHoveredSkillId(skill.id)}
                      onMouseLeave={() => setHoveredSkillId(null)}
                      style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: idx < skills.length - 1 ? '1px solid rgba(214, 191, 154, 0.2)' : 'none'
                      }}
                    >
                      <div className={styles.resumeLeftField}>
                        <div className={styles.resumeProfessionalHeaderRow}>
                          {editingSkillTopicId === skill.id ? (
                            <input
                              type="text"
                              className={styles.resumeLeftInput}
                              value={editingSkillTopicValue}
                              onChange={(e) => setEditingSkillTopicValue(e.target.value)}
                              onBlur={() => {
                                setSkills(prev => prev.map(s => 
                                  s.id === skill.id ? { ...s, topic: editingSkillTopicValue } : s
                                ));
                                setEditingSkillTopicId(null);
                                setEditingSkillTopicValue('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setSkills(prev => prev.map(s => 
                                    s.id === skill.id ? { ...s, topic: editingSkillTopicValue } : s
                                  ));
                                  setEditingSkillTopicId(null);
                                  setEditingSkillTopicValue('');
                                } else if (e.key === 'Escape') {
                                  setEditingSkillTopicId(null);
                                  setEditingSkillTopicValue('');
                                }
                              }}
                              placeholder="Skill Set"
                              autoFocus
                              style={{ flex: '1 1 auto', minWidth: 0 }}
                            />
                          ) : (
                            <span
                              className={styles.resumeLeftLabel}
                              onDoubleClick={() => {
                                setEditingSkillTopicId(skill.id);
                                setEditingSkillTopicValue(skill.topic);
                              }}
                              style={{ cursor: 'text', userSelect: 'text', flex: '1 1 auto', minWidth: 0 }}
                            >
                              {skill.topic || 'Skill Set'}
                            </span>
                          )}
                          <div className={styles.resumeProfessionalOperationButton}>
                            <div className={styles.resumeProfessionalOperationButtons}>
                              <button
                                type="button"
                                className={`${styles.resumeDeleteFieldButton} ${
                                  hoveredSkillId === skill.id ? styles.resumeDeleteFieldButtonVisible : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSkill(skill.id);
                                }}
                                aria-label="Remove skill"
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
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                              <div
                                className={styles.resumeDragHandleButton}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handleSkillDragStart(e, skill.id);
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                aria-label="Drag to reorder"
                                role="button"
                                tabIndex={0}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.resumeLeftField} style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className={styles.resumeLeftInput}
                          value={skill.keywords}
                          onChange={(e) => {
                            setSkills(prev => prev.map(s => 
                              s.id === skill.id ? { ...s, keywords: e.target.value } : s
                            ));
                          }}
                          placeholder="Skill set keywords"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
            </div>
            {/* Scroll down indicator */}
            {canScrollDown && (
              <div 
                className={styles.scrollIndicatorDown}
                onClick={() => {
                  if (resumeLeftColumnRef.current) {
                    resumeLeftColumnRef.current.scrollBy({ top: 100, behavior: 'smooth' });
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
          <div className={styles.resumeDocument} ref={resumeDocumentRef}>
            <div 
              ref={resumeHeaderRef}
              className={`${styles.resumeHeader} ${hoveredSection === 'name' || editingSection === 'name' ? styles.resumeSectionHovered : ''}`}
              onMouseEnter={() => {
                if (hoverDebounceTimerRef.current) {
                  clearTimeout(hoverDebounceTimerRef.current);
                  hoverDebounceTimerRef.current = null;
                }
                setHoveredSection('name');
              }}
              onMouseLeave={() => {
                // Debounce the mouse leave to prevent vibration from layout shifts
                if (hoverDebounceTimerRef.current) {
                  clearTimeout(hoverDebounceTimerRef.current);
                }
                hoverDebounceTimerRef.current = setTimeout(() => {
                  setHoveredSection(null);
                  hoverDebounceTimerRef.current = null;
                }, 150);
              }}
              onClick={() => {
                if (editingSection === 'name') {
                  // Closing the section - revert changes
                  setName(savedName);
                  setEditingSection(null);
                  setHoveredSection(null);
                  setOriginalName('');
                } else {
                  setEditingSection('name');
                  setHoveredSection('name');
                }
              }}
            >
              <input
                type="text"
                className={styles.resumeNameInput}
                value={editingSection === 'name' ? name : savedName}
                readOnly
                placeholder="Your Name"
              />
            </div>
            
            <div 
              className={styles.resumeSection}
              onClick={handleContactSectionClick}
            >
              <div className={styles.resumeSectionContent}>
                <div 
                  ref={resumeInfoRowRef}
                  className={`${styles.resumeInfoRow} ${styles.resumeContactInfoRow} ${hoveredSection === 'contact' || editingSection === 'contact' ? styles.resumeSectionHovered : ''}`}
                  onMouseEnter={() => {
                    if (hoverDebounceTimerRef.current) {
                      clearTimeout(hoverDebounceTimerRef.current);
                      hoverDebounceTimerRef.current = null;
                    }
                    setHoveredSection('contact');
                  }}
                  onMouseLeave={() => {
                    // Debounce the mouse leave to prevent vibration from layout shifts
                    if (hoverDebounceTimerRef.current) {
                      clearTimeout(hoverDebounceTimerRef.current);
                    }
                    hoverDebounceTimerRef.current = setTimeout(() => {
                      setHoveredSection(null);
                      hoverDebounceTimerRef.current = null;
                    }, 150);
                  }}
                >
                  {savedContactFields.map((field, index, arr) => {
                    const inputRef = field.id === 'email' ? emailInputRef : 
                                     field.id === 'phone' ? phoneInputRef :
                                     field.id === 'location' ? locationInputRef :
                                     field.id === 'linkedin' ? linkedinInputRef : null;

                    const displayValue = formatContactDisplay(field);

                    if (!displayValue?.trim()) {
                      return null;
                    }

                    return (
                      <React.Fragment key={field.id}>
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="text"
                          className={styles.resumeEditableInput}
                          value={displayValue}
                          readOnly
                          placeholder={field.label}
                          size={Math.max(displayValue.length, field.label?.length || 0, 15)}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

          <div 
            ref={professionalSectionRef}
            className={`${styles.resumeSection} ${hoveredSection === 'professional' || editingSection === 'professional' ? styles.resumeSectionHovered : ''}`}
            onMouseEnter={() => {
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
                hoverDebounceTimerRef.current = null;
              }
              setHoveredSection('professional');
            }}
            onMouseLeave={() => {
              // Debounce the mouse leave to prevent vibration from layout shifts
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
              }
              hoverDebounceTimerRef.current = setTimeout(() => {
                setHoveredSection(null);
                hoverDebounceTimerRef.current = null;
              }, 150);
            }}
            onClick={() => {
              if (editingSection === 'professional') {
                // Closing the section - revert changes
                setProfessionalExperiences(JSON.parse(JSON.stringify(savedProfessionalExperiences)));
                setEditingSection(null);
                setHoveredSection(null);
                setOriginalProfessionalExperiences([]);
              } else {
                setEditingSection('professional');
                setHoveredSection('professional');
                // Collapse all company sections except the first one
                if (savedProfessionalExperiences.length > 0) {
                  const firstId = savedProfessionalExperiences[0].id;
                  const allOtherIds = savedProfessionalExperiences.slice(1).map(exp => exp.id);
                  setCollapsedProfessionalIds(allOtherIds);
                }
              }
            }}
          >
            <h2 className={styles.resumeSectionTitle}>Professional</h2>
            <div className={styles.resumeSectionContent}>
              {(editingSection === 'professional' ? professionalExperiences : savedProfessionalExperiences).map((exp) => (
                <div key={exp.id} className={styles.resumeItem}>
                  <div className={styles.resumeItemHeader}>
                    <input
                      type="text"
                      className={styles.resumeItemTitleInput}
                      value={exp.company}
                      readOnly
                      placeholder="Company Name"
                    />
                  </div>
                  {exp.jobTitles.map((jobTitle) => (
                    <div key={jobTitle.id}>
                      <div className={styles.resumeItemHeader}>
                        <input
                          type="text"
                          className={styles.resumeItemCompanyInput}
                          value={jobTitle.title}
                          readOnly
                          placeholder="Job Title"
                        />
                        <input
                          type="text"
                          className={styles.resumeItemDateInput}
                          value={jobTitle.date}
                          size={Math.max(jobTitle.date.length, 15)}
                          readOnly
                          placeholder="2020 - Present"
                        />
                      </div>
                      {(() => {
                        interface ProjectGroup {
                          name: string;
                          bullets: string[];
                        }

                        const groups: ProjectGroup[] = [];
                        let currentGroup: ProjectGroup | null = null;

                        for (const bullet of jobTitle.bullets) {
                          if (bullet.startsWith(PROJECT_HEADER_PREFIX)) {
                            if (currentGroup) {
                              groups.push(currentGroup);
                            }
                            currentGroup = {
                              name: bullet.slice(PROJECT_HEADER_PREFIX.length).trim(),
                              bullets: [],
                            };
                          } else if (currentGroup) {
                            currentGroup.bullets.push(bullet);
                          } else {
                            if (groups.length === 0 || groups[groups.length - 1].name !== '') {
                              groups.push({ name: '', bullets: [bullet] });
                            } else {
                              groups[groups.length - 1].bullets.push(bullet);
                            }
                          }
                        }

                        if (currentGroup) {
                          groups.push(currentGroup);
                        }

                        const groupsToRender =
                          groups.length > 0 ? groups : [{ name: '', bullets: jobTitle.bullets }];

                        return groupsToRender.map((group, gIdx) => {
                          const technologies = jobTitle.projectTechnologies && group.name 
                            ? jobTitle.projectTechnologies[group.name] 
                            : undefined;
                          
                          return (
                            <div key={gIdx} className={styles.resumeProjectGroup}>
                              {group.name && (
                                <div className={styles.resumeProjectName}>{group.name}</div>
                              )}
                              {group.bullets.length > 0 && (
                                <ul className={styles.resumeItemList}>
                                  {group.bullets.map((bullet, idx) => (
                                    <li key={idx}>
                                      <textarea
                                        className={styles.resumeBulletInput}
                                        value={bullet}
                                        readOnly
                                        placeholder="Key achievement or responsibility"
                                        rows={1}
                                        style={{
                                          resize: 'none',
                                          minHeight: '1.5rem',
                                        }}
                                        onInput={(e) => {
                                          const target = e.target as HTMLTextAreaElement;
                                          target.style.height = 'auto';
                                          target.style.height = `${target.scrollHeight}px`;
                                        }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {technologies && (
                                <div className={styles.resumeProjectTechnologies}>
                                  <span className={styles.resumeTechnologiesLabel}>Technologies: </span>
                                  <span className={styles.resumeTechnologiesList}>
                                    {Array.isArray(technologies) ? technologies.join(', ') : technologies}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div 
            ref={educationSectionRef}
            className={`${styles.resumeSection} ${hoveredSection === 'education' || editingSection === 'education' ? styles.resumeSectionHovered : ''}`}
            onMouseEnter={() => {
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
                hoverDebounceTimerRef.current = null;
              }
              setHoveredSection('education');
            }}
            onMouseLeave={() => {
              // Debounce the mouse leave to prevent vibration from layout shifts
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
              }
              hoverDebounceTimerRef.current = setTimeout(() => {
                setHoveredSection(null);
                hoverDebounceTimerRef.current = null;
              }, 150);
            }}
            onClick={() => {
              if (editingSection === 'education') {
                // Closing the section - revert changes
                const normalizedEducation = savedEducation.map(normalizeEducation);
                setEducationData(JSON.parse(JSON.stringify(normalizedEducation)));
                setEditingSection(null);
                setHoveredSection(null);
                setOriginalEducation([]);
              } else {
                setEditingSection('education');
                setHoveredSection('education');
              }
            }}
          >
            <h2 className={styles.resumeSectionTitle}>Education</h2>
            <div className={styles.resumeSectionContent}>
              {(editingSection === 'education' ? educationData : savedEducation).map((edu) => {
                const normalizedEdu = normalizeEducation(edu);
                return (
                  <div key={edu.id} className={styles.resumeItem}>
                    <div className={styles.resumeItemHeader}>
                      <input
                        type="text"
                        className={styles.resumeItemTitleInput}
                        value={normalizedEdu.university}
                        readOnly
                        placeholder="University Name"
                      />
                      <input
                        type="text"
                        className={styles.resumeItemDateInput}
                        value={normalizedEdu.date}
                        size={Math.max(normalizedEdu.date.length, 15)}
                        readOnly
                        placeholder="2014 - 2018"
                      />
                    </div>
                    {normalizedEdu.degrees.map((degree) => (
                      <div key={degree.id}>
                        <textarea
                          className={styles.resumeItemCompanyInput}
                          value={degree.degree}
                          readOnly
                          placeholder="Degree Name"
                          rows={1}
                          style={{
                            resize: 'none',
                            overflow: 'hidden',
                            minHeight: '1.5rem',
                            height: 'auto',
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                        />
                        {degree.description && degree.description.trim() && (
                          <textarea
                            className={styles.resumeItemDescriptionInput}
                            value={degree.description}
                            readOnly
                            placeholder="GPA: 3.8/4.0 | Relevant coursework or honors"
                            rows={1}
                            style={{
                              resize: 'none',
                              overflow: 'hidden',
                              minHeight: '1.5rem',
                              height: 'auto',
                            }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div 
            ref={projectSectionRef}
            className={`${styles.resumeSection} ${hoveredSection === 'project' || editingSection === 'project' ? styles.resumeSectionHovered : ''}`}
            onMouseEnter={() => {
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
                hoverDebounceTimerRef.current = null;
              }
              setHoveredSection('project');
              // Only collapse projects if section is not already being edited
              // This prevents disrupting the user's current view when they're actively working
              if (editingSection !== 'project') {
                // Collapse all project sections except the first one (same as click behavior)
                const currentSaved = getCurrentSavedProjects();
                if (currentSaved.length > 0) {
                  const firstId = currentSaved[0].id;
                  const allOtherIds = currentSaved.slice(1).map(proj => proj.id);
                  setCollapsedProjectIds(allOtherIds);
                }
              }
            }}
            onMouseLeave={() => {
              // Debounce the mouse leave to prevent vibration from layout shifts
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
              }
              hoverDebounceTimerRef.current = setTimeout(() => {
                setHoveredSection(null);
                hoverDebounceTimerRef.current = null;
              }, 150);
            }}
            onClick={() => {
              if (editingSection === 'project') {
                // Closing the section - revert changes
                const currentSaved = getCurrentSavedProjects();
                setCurrentProjects(JSON.parse(JSON.stringify(currentSaved)));
                setEditingSection(null);
                setHoveredSection(null);
                setCurrentOriginalProjects([]);
              } else {
                setEditingSection('project');
                setHoveredSection('project');
                // Collapse all project sections except the first one
                const currentSaved = getCurrentSavedProjects();
                if (currentSaved.length > 0) {
                  const firstId = currentSaved[0].id;
                  const allOtherIds = currentSaved.slice(1).map(proj => proj.id);
                  setCollapsedProjectIds(allOtherIds);
                }
              }
            }}
          >
            <h2 className={styles.resumeSectionTitle}>
              {knowledgeScope.expandingKnowledgeBase && !knowledgeScope.establishedExpertise
                ? 'Future Project Experience'
                : 'Project Experience'}
            </h2>
            <div className={styles.resumeSectionContent}>
              {(editingSection === 'project' ? getCurrentProjects() : getCurrentSavedProjects()).map((proj: any) => {
                const bullets = proj.bullets || [];
                const technologies: string[] = Array.isArray(proj.technologies) ? proj.technologies : [];
                
                return (
                  <div key={proj.id} className={styles.resumeItem}>
                    <div className={styles.resumeItemHeader}>
                      <input
                        type="text"
                        className={styles.resumeItemTitleInput}
                        value={proj.name}
                        readOnly
                        placeholder="Project Name"
                      />
                      <input
                        type="text"
                        className={styles.resumeItemDateInput}
                        value={proj.date}
                        size={Math.max(proj.date.length, 15)}
                        readOnly
                        placeholder="2023"
                      />
                    </div>
                    {bullets.length > 0 && (
                      <ul className={styles.resumeItemList}>
                        {bullets.map((bullet: string, idx: number) => (
                          <li key={idx}>
                            <textarea
                              className={styles.resumeBulletInput}
                              value={bullet}
                              readOnly
                              placeholder="Key feature or contribution"
                              rows={1}
                              style={{
                                resize: 'none',
                                minHeight: '1.5rem',
                              }}
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    {technologies.length > 0 && (
                      <div className={styles.resumeProjectTechnologies}>
                        Technologies: {technologies.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div 
            ref={technicalSectionRef}
            className={`${styles.resumeSection} ${hoveredSection === 'technical' || editingSection === 'technical' ? styles.resumeSectionHovered : ''}`}
            onMouseEnter={() => {
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
                hoverDebounceTimerRef.current = null;
              }
              setHoveredSection('technical');
            }}
            onMouseLeave={() => {
              // Debounce the mouse leave to prevent vibration from layout shifts
              if (hoverDebounceTimerRef.current) {
                clearTimeout(hoverDebounceTimerRef.current);
              }
              hoverDebounceTimerRef.current = setTimeout(() => {
                setHoveredSection(null);
                hoverDebounceTimerRef.current = null;
              }, 150);
            }}
            onClick={() => {
              if (editingSection === 'technical') {
                // Closing the section - revert changes
                setSkills(JSON.parse(JSON.stringify(savedSkills)));
                setEditingSection(null);
                setHoveredSection(null);
                setOriginalSkills([]);
              } else {
                setEditingSection('technical');
                setHoveredSection('technical');
              }
            }}
          >
            <h2 className={styles.resumeSectionTitle}>Technical Skills</h2>
            <div className={styles.resumeSectionContent}>
              <div className={styles.resumeSkillsList}>
                {(editingSection === 'technical' ? skills : savedSkills).map((skill) => (
                  <div key={skill.id} className={styles.resumeSkillRow}>
                    <span className={styles.resumeSkillLabel}>{skill.topic}:</span>
                    <input
                      type="text"
                      className={styles.resumeSkillInput}
                      value={skill.keywords}
                      readOnly
                      placeholder="JavaScript, TypeScript, Python, Java"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Achievements Section */}
          {savedAchievements.length > 0 && (
            <div
              className={styles.resumeSection}
              onMouseEnter={() => {
                if (hoverDebounceTimerRef.current) {
                  clearTimeout(hoverDebounceTimerRef.current);
                  hoverDebounceTimerRef.current = null;
                }
                setHoveredSection('achievements');
              }}
              onMouseLeave={() => {
                // Debounce the mouse leave to prevent vibration from layout shifts
                if (hoverDebounceTimerRef.current) {
                  clearTimeout(hoverDebounceTimerRef.current);
                }
                hoverDebounceTimerRef.current = setTimeout(() => {
                  if (editingSection !== 'achievements') {
                    setHoveredSection(null);
                  }
                  hoverDebounceTimerRef.current = null;
                }, 150);
              }}
            >
            <h2 className={styles.resumeSectionTitle}>Achievements</h2>
            <div className={styles.resumeSectionContent}>
              <div className={styles.resumeAchievementsList}>
                {savedAchievements.map((achievement) => (
                  <div key={achievement.id} className={styles.resumeAchievementItem}>
                    <span className={styles.resumeAchievementType}>{achievement.type}:</span>
                    <span className={styles.resumeAchievementValue}>{achievement.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.iconHeader}>
        <div className={styles.sectionIcon}>
          <Image 
            src="/images/file-copy.svg" 
            alt="Resume" 
            width={80} 
            height={80} 
            className={styles.sectionIconImage}
          />
        </div>
      </div>
      <h2 className={styles.sectionTitle}>Resume</h2>
      <p className={styles.sectionText}>
        Create, edit, and manage your resume and professional documents.
      </p>

      <div className={styles.knowledgeButtonContainer}>
        <button
          type="button"
          className={styles.knowledgeButton}
          onClick={() => {
            setResumeMode('industry');
            setShowCompanyTypePage(true);
          }}
          aria-label="From Knowledge Base"
        >
          <span className={styles.knowledgeButtonText}>From Knowledge Base</span>
        </button>
        <button
          type="button"
          className={styles.knowledgeButton}
          onClick={() => {
            setResumeMode('existing');
            setShowExistingResumePage(true);
          }}
          aria-label="From Existing Resume"
        >
          <span className={styles.knowledgeButtonText}>From Existing Resume</span>
        </button>
      </div>
    </>
  );
}

