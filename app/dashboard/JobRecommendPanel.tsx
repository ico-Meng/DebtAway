'use client';

import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { API_ENDPOINT } from '@/app/components/config';

interface JobItem {
  job_title: string;
  company_name: string;
  job_url: string;
}

// ---------------------------------------------------------------------------
// Career focus → suggested position names (top 5 per focus)
// Keys match the `career_focus` string stored in the user profile.
// ---------------------------------------------------------------------------
const CAREER_FOCUS_POSITIONS: Record<string, string[]> = {
  'software-engineering': [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Platform Engineer',
    'Site Reliability Engineer',
  ],
  'ai-machine-learning': [
    'AI Engineer',
    'Machine Learning Engineer',
    'LLM Engineer',
    'Generative AI Engineer',
    'AI Platform Engineer',
  ],
  'ai-ml': [
    'AI Engineer',
    'Machine Learning Engineer',
    'LLM Engineer',
    'Generative AI Engineer',
    'AI Platform Engineer',
  ],
  'data-engineering': [
    'Data Engineer',
    'Data Pipeline Engineer',
    'Data Platform Engineer',
    'ETL Engineer',
    'Streaming Data Engineer',
  ],
  'data-science': [
    'Data Scientist',
    'ML Scientist',
    'Applied Scientist',
    'Data Analyst',
    'Research Scientist',
  ],
  'ui-ux-product-design': [
    'Product Designer',
    'UX Designer',
    'UI Designer',
    'Interaction Designer',
    'Visual Designer',
  ],
  'ui-ux': [
    'Product Designer',
    'UX Designer',
    'UI Designer',
    'Interaction Designer',
    'Visual Designer',
  ],
  'financial-engineering': [
    'Quant Researcher',
    'Financial Engineer',
    'Quant Developer',
    'Trading Engineer',
    'Financial Data Scientist',
  ],
  'cybersecurity': [
    'Security Engineer',
    'Cloud Security Engineer',
    'Application Security Engineer',
    'Security Architect',
    'IAM Engineer',
  ],
};

const DEFAULT_POSITIONS = [
  'Software Engineer',
  'AI Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
];

function getPositionsForFocus(careerFocus: string): string[] {
  const key = (careerFocus || '').toLowerCase().trim();
  if (CAREER_FOCUS_POSITIONS[key]) return CAREER_FOCUS_POSITIONS[key];
  // Partial match
  for (const [k, v] of Object.entries(CAREER_FOCUS_POSITIONS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_POSITIONS;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface JobRecommendPanelProps {
  show: boolean;
  careerFocus: string;
  /** Called when user clicks a job row (title + company text area, not the link icon) */
  onJobSelect: (title: string, company: string, url: string) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function JobRecommendPanel({
  show,
  careerFocus,
  onJobSelect,
  onClose,
}: JobRecommendPanelProps) {
  const [mode, setMode] = useState<'positions' | 'jobs'>('positions');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset to positions list whenever the panel becomes visible again
  useEffect(() => {
    if (show) {
      setMode('positions');
      setJobs([]);
      setSelectedPosition('');
    }
  }, [show]);

  if (!show) return null;

  const positions = getPositionsForFocus(careerFocus);

  const handlePositionClick = async (positionName: string) => {
    setSelectedPosition(positionName);
    setLoading(true);
    setMode('jobs');
    try {
      const res = await fetch(
        `${API_ENDPOINT}/job-recommendations?position_name=${encodeURIComponent(positionName)}`
      );
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobTextClick = (job: JobItem) => {
    onJobSelect(job.job_title, job.company_name, job.job_url);
  };

  const handleLinkIconClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={styles.jobRecommendPanel}>
      {/* ---- Positions list ---- */}
      {mode === 'positions' && positions.map((pos) => (
        <button
          key={pos}
          type="button"
          className={styles.jobRecommendPositionBtn}
          onClick={() => handlePositionClick(pos)}
        >
          <span className={styles.jobRecommendPositionName}>{pos}</span>
        </button>
      ))}

      {/* ---- Jobs list ---- */}
      {mode === 'jobs' && (
        <div className={styles.jobRecommendJobsContainer}>
          <div className={styles.jobRecommendHeader}>
            <button
              type="button"
              className={styles.jobRecommendBackBtn}
              onClick={() => setMode('positions')}
              title="Back to positions"
            >
              ←
            </button>
            <span className={styles.jobRecommendHeaderTitle} title={selectedPosition}>
              {selectedPosition}
            </span>
          </div>

          {loading ? (
            <div className={styles.jobRecommendLoading}>
              <div className={styles.jobRecommendSpinner} />
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.jobRecommendEmpty}>No listings cached yet</div>
          ) : (
            <div className={styles.jobRecommendScrollList}>
              {jobs.map((job, i) => (
                <div
                  key={i}
                  className={styles.jobRecommendJobItem}
                  onClick={() => handleJobTextClick(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleJobTextClick(job)}
                >
                  <div className={styles.jobRecommendJobText}>
                    <div className={styles.jobRecommendJobTitle}>{job.job_title}</div>
                    <div className={styles.jobRecommendCompany}>{job.company_name}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.jobRecommendLinkBtn}
                    onClick={(e) => handleLinkIconClick(e, job.job_url)}
                    aria-label="Open job posting in new tab"
                    title="Open job posting"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
