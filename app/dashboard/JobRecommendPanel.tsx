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
    'Full Stack Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Cloud Computing Engineer',
    'Platform Engineer',
    'AI Engineer',
    'Distributed System Engineer',
    'Site Reliability Engineer',
    'Mobile Engineer',
    'Infrastructure Engineer',
    'Low Latency Engineer',
  ],
  'ai-machine-learning': [
    'Machine Learning Engineer',
    'AI Engineer',
    'Deep Learning Engineer',
    'Machine Learning Scientist',
    'AI Research Scientist',
    'Generative AI Engineer',
    'LLM Engineer',
    'MLOps Engineer',
    'AI Platform Engineer',
  ],
  'ai-ml': [
    'Machine Learning Engineer',
    'AI Engineer',
    'Deep Learning Engineer',
    'Machine Learning Scientist',
    'AI Research Scientist',
    'Generative AI Engineer',
    'LLM Engineer',
    'MLOps Engineer',
    'AI Platform Engineer',
  ],
  'data-engineering': [
    'Data Engineer',
    'Data Platform Engineer',
    'Data Pipeline Engineer',
    'ETL Engineer',
    'Streaming Data Engineer',
    'Data Warehouse Engineer',
    'Data Infrastructure Engineer',
  ],
  'data-science': [
    'Data Scientist',
    'Applied Scientist',
    'Research Scientist',
    'Data Analyst',
    'Decision Scientist',
    'ML Scientist',
  ],
  'ui-ux-product-design': [
    'Product Designer',
    'UX Designer',
    'UI Designer',
    'Interaction Designer',
    'Visual Designer',
    'Design System Designer',
  ],
  'ui-ux': [
    'Product Designer',
    'UX Designer',
    'UI Designer',
    'Interaction Designer',
    'Visual Designer',
    'Design System Designer',
  ],
  'financial-engineering': [
    'Quant Researcher',
    'Quant Developer',
    'Financial Engineer',
    'Trading Engineer',
    'Financial Scientist',
    'Modeling Engineer',
  ],
  'cybersecurity': [
    'Security Engineer',
    'Application Security Engineer',
    'Cloud Security Engineer',
    'Security Architect',
    'IAM Engineer',
    'GRC Analyst',
  ],
};

const DEFAULT_POSITIONS = [
  'Full Stack Engineer',
  'AI Engineer',
  'Data Scientist',
  'Product Designer',
  'Security Engineer',
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
  /** User's established technical skills — used to rank job recommendations */
  userSkills?: string[];
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
  userSkills = [],
  onJobSelect,
  onClose,
}: JobRecommendPanelProps) {
  const [mode, setMode] = useState<'positions' | 'jobs'>('positions');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkCheckingIdx, setLinkCheckingIdx] = useState<number | null>(null);

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
      const res = await fetch(`${API_ENDPOINT}/job-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_name: positionName,
          career_focus: careerFocus,
          user_skills: userSkills,
        }),
      });
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

  const handleLinkIconClick = async (e: React.MouseEvent, job: JobItem, idx: number) => {
    e.stopPropagation();
    setLinkCheckingIdx(idx);
    try {
      const res = await fetch(`${API_ENDPOINT}/resolve_job_url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: job.job_url,
          job_title: job.job_title,
          company_name: job.company_name,
        }),
      });
      const data = await res.json();
      window.open(data.url || job.job_url, '_blank', 'noopener,noreferrer');
    } catch {
      // Network/server failure — open original URL anyway
      window.open(job.job_url, '_blank', 'noopener,noreferrer');
    } finally {
      setLinkCheckingIdx(null);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={styles.jobRecommendPanel}>
      {/* ---- Positions list ---- */}
      {mode === 'positions' && (
        <div className={styles.jobRecommendPositionsList}>
          {positions.map((pos) => (
            <button
              key={pos}
              type="button"
              className={styles.jobRecommendPositionBtn}
              onClick={() => handlePositionClick(pos)}
            >
              <span className={styles.jobRecommendPositionName}>{pos}</span>
            </button>
          ))}
        </div>
      )}

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
                    className={`${styles.jobRecommendLinkBtn}${linkCheckingIdx === i ? ` ${styles.checking}` : ''}`}
                    onClick={(e) => handleLinkIconClick(e, job, i)}
                    aria-label="Open job posting in new tab"
                    title={linkCheckingIdx === i ? 'Checking link…' : 'Open job posting'}
                    disabled={linkCheckingIdx !== null}
                  >
                    {linkCheckingIdx === i ? (
                      <span className={styles.jobRecommendLinkSpinner} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/images/open_in_new.svg" width="16" height="16" alt="" />
                    )}
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
