'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './dashboard.module.css';

const ENCOURAGE_WORDS = ['Great', 'Awesome', 'Nice', 'Perfect', 'Excellent', 'Wonderful', 'Fantastic'];
function encourage() {
  return ENCOURAGE_WORDS[Math.floor(Math.random() * ENCOURAGE_WORDS.length)] + '!';
}

interface ProjectAnalysisData {
  projectType: string;
  projectSource?: string;
  projectName?: string;
  industrySector?: string;
  overview: string;
  techAndTeamwork: string;
  achievement: string;
  technologies: Record<string, string[]>;
  frameworks: Record<string, string[]>;
}

interface SanityCheckIssue {
  severity: 'High' | 'Mid' | 'Low';
  ordinal: string;
  message: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type:
      | 'ask_resume_intent'
      | 'navigate_to_existing_resume'
      | 'navigate_to_knowledge_base_resume'
      | 'navigate_to_established_personal_project'
      | 'navigate_to_expanding_personal_project'
      | 'navigate_to_established_professional_project'
      | 'navigate_to_expanding_professional_project'
      | 'navigate_to_professional_step'
      | 'ask_project_type'
      | 'ask_project_status'
      | 'text_choices'
      | 'update_project_description'
      | 'ask_project_meta'
      | 'show_pricing'
      | 'sanity_check_sequence'
      | 'navigate_to_career_focus';
    data?: ProjectAnalysisData;
    choices?: string[];
    cardDismissed?: boolean;
    techCardDismissed?: boolean;
    frameworkCardDismissed?: boolean;
    nameCardDismissed?: boolean;
    industryCardDismissed?: boolean;
    selectedChoice?: string;
    sanityData?: {
      issues: SanityCheckIssue[];
      currentIndex: number;
      matchedCount: number;
      animDir?: 'next' | 'back';
    };
  };
}

interface AIChatboxProps {
  userEmail?: string;
  userName?: string;
  apiEndpoint: string;
  careerFocus?: string;
  onNavigateToExistingResume?: () => void;
  onNavigateToKnowledgeBaseResume?: () => void;
  onNavigateToEstablishedPersonalProject?: () => void;
  onNavigateToExpandingPersonalProject?: () => void;
  onNavigateToEstablishedProfessionalProject?: () => void;
  onNavigateToExpandingProfessionalProject?: () => void;
  onUpdateProjectDescription?: (projectType: string, description: { overview: string; techAndTeamwork: string; achievement: string }, projectSource?: string) => void;
  onUpdateProjectTechnologies?: (projectType: string, technologies: Record<string, string[]>) => void;
  onUpdateProjectFrameworks?: (projectType: string, frameworks: Record<string, string[]>) => void;
  onUpdateProjectName?: (projectType: string, name: string) => void;
  onUpdateProjectIndustry?: (projectType: string, industry: string) => void;
  onNavigateToProfessionalStep?: () => void;
  onNavigateToCareerFocus?: () => void;
  onShowPricing?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  injectMessage?: { text: string; seq: number; action?: any } | null;
}

export default function AIChatbox({
  userEmail,
  userName,
  apiEndpoint,
  careerFocus,
  onNavigateToExistingResume,
  onNavigateToKnowledgeBaseResume,
  onNavigateToEstablishedPersonalProject,
  onNavigateToExpandingPersonalProject,
  onNavigateToEstablishedProfessionalProject,
  onNavigateToExpandingProfessionalProject,
  onUpdateProjectDescription,
  onUpdateProjectTechnologies,
  onUpdateProjectFrameworks,
  onUpdateProjectName,
  onUpdateProjectIndustry,
  onNavigateToProfessionalStep,
  onNavigateToCareerFocus,
  onShowPricing,
  injectMessage,
}: AIChatboxProps) {
  const [isBarOpen, setIsBarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // Track the project type from the most recent navigation action for update callbacks
  const [pendingProjectType, setPendingProjectType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus textarea when bar opens; also show history and scroll to bottom if messages exist
  useEffect(() => {
    if (isBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      if (messages.length > 0) {
        setHistoryOpen(true);
        // Wait for the slide-up animation (0.28s) to finish before scrolling
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 320);
      }
    }
  }, [isBarOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close bar when clicking outside
  useEffect(() => {
    if (!isBarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsBarOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBarOpen]);

  // Scroll to latest message when a new message arrives or history is toggled open
  useEffect(() => {
    if (historyOpen) {
      // Use a slightly longer delay so tall cards (e.g. sanity check) have time to fully render
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 120);
    }
  }, [messages, historyOpen]);

  // Re-focus the textarea after every send/receive so the user can keep typing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isBarOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [isLoading]);

  // Inject an assistant message from outside (e.g. info icon click)
  useEffect(() => {
    if (!injectMessage) return;
    const msg: Message = { id: Date.now().toString(), role: 'assistant', content: injectMessage.text, ...(injectMessage.action ? { action: injectMessage.action } : {}) };
    setMessages(prev => [...prev, msg]);
    setIsBarOpen(true);
    setHistoryOpen(true);
  }, [injectMessage?.seq]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setHistoryOpen(true);
    setIsLoading(true);

    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const res = await fetch(`${apiEndpoint}/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          email: userEmail || '',
          name: userName || '',
          career_focus: careerFocus || '',
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      const reply = data.reply || data.message || "I'm here to help with your career journey!";
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };

      const actionType = data.action?.type;
      if (actionType) {
        assistantMsg.action = {
          type: actionType,
          data: data.action?.data,
          choices: data.action?.choices,
        };
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm here to help with your career journey! How can I assist you today?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiEndpoint, userEmail, userName, careerFocus, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  const handleClearHistory = useCallback(() => {
    setMessages([]);
    setHistoryOpen(false);
    setPendingProjectType(null);
  }, []);

  const handleClose = useCallback(() => {
    setIsBarOpen(false);
    setIsFocused(false);
  }, []);

  // Helper: dismiss card on a specific message
  const dismissCard = useCallback((msgId: string) =>
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, action: { ...m.action!, cardDismissed: true } } : m
      )
    ), []);

  const dismissTechCard = useCallback((msgId: string) =>
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, action: { ...m.action!, techCardDismissed: true } } : m
      )
    ), []);

  const dismissFrameworkCard = useCallback((msgId: string) =>
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, action: { ...m.action!, frameworkCardDismissed: true } } : m
      )
    ), []);

  const dismissNameCard = useCallback((msgId: string) =>
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, action: { ...m.action!, nameCardDismissed: true } } : m
      )
    ), []);

  const dismissIndustryCard = useCallback((msgId: string) =>
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, action: { ...m.action!, industryCardDismissed: true } } : m
      )
    ), []);

  const advanceSanityCheck = useCallback((msgId: string, onLast?: () => void) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId || !m.action?.sanityData) return m;
        const next = m.action.sanityData.currentIndex + 1;
        if (next >= m.action.sanityData.issues.length && onLast) onLast();
        return { ...m, action: { ...m.action, sanityData: { ...m.action.sanityData, currentIndex: next, animDir: 'next' as const } } };
      })
    );
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 80);
  }, []);

  const retreatSanityCheck = useCallback((msgId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId || !m.action?.sanityData) return m;
        const prev_idx = Math.max(0, m.action.sanityData.currentIndex - 1);
        return { ...m, action: { ...m.action, sanityData: { ...m.action.sanityData, currentIndex: prev_idx, animDir: 'back' as const } } };
      })
    );
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 80);
  }, []);

  // Send a user message programmatically (used by choice cards)
  const sendChoiceMessage = useCallback(async (text: string) => {
    if (isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setHistoryOpen(true);
    setIsLoading(true);
    try {
      const res = await fetch(`${apiEndpoint}/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          email: userEmail || '',
          name: userName || '',
          career_focus: careerFocus || '',
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      const reply = data.reply || data.message || "I'm here to help with your career journey!";
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      const actionType = data.action?.type;
      if (actionType) assistantMsg.action = { type: actionType, data: data.action?.data, choices: data.action?.choices };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm here to help with your career journey! How can I assist you today?",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, apiEndpoint, userEmail, userName, careerFocus, messages]);

  // Mark a choice card as selected and auto-send the choice text
  const selectChoice = useCallback((msgId: string, choiceLabel: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, action: { ...m.action!, selectedChoice: choiceLabel } } : m
      )
    );
    sendChoiceMessage(choiceLabel);
  }, [sendChoiceMessage]);

  // Render message text with proper formatting (lists, paragraphs, line breaks)
  const renderMessage = (text: string) => {
    // Detect line-item prefixes: circled numbers ①②③…, bullets •, dashes -, numbered 1. 2. etc.
    const isListLine = (line: string) =>
      /^[①②③④⑤⑥⑦⑧⑨⑩]/.test(line) ||
      /^[•\-–—]\s/.test(line) ||
      /^\d+[.)]\s/.test(line);

    // Split a plain-text line into individual sentences so each renders on its own line.
    // Splits after . ! ? when followed by whitespace + an uppercase letter or circled number.
    const splitSentences = (line: string): string[] =>
      line.split(/(?<=[.!?])\s+(?=[A-Z①-⑩])/).map(s => s.trim()).filter(Boolean);

    const paragraphs = text.split(/\n\n+/);

    return (
      <span className={styles.chatboxMsgBody}>
        {paragraphs.map((para, pi) => {
          const rawLines = para.split('\n').filter(l => l !== undefined);
          const hasListLines = rawLines.some(isListLine);

          // For plain paragraphs also break by sentence boundaries
          const lines = hasListLines
            ? rawLines
            : rawLines.flatMap(splitSentences);

          return (
            <span key={pi} className={styles.chatboxMsgPara}>
              {hasListLines ? (
                <span className={styles.chatboxMsgList}>
                  {rawLines.map((line, li) => {
                    if (!line.trim()) return null;
                    if (isListLine(line)) {
                      const match = line.match(/^([①②③④⑤⑥⑦⑧⑨⑩]|[•\-–—]|\d+[.)])\s*(.*)/);
                      const prefix = match?.[1] ?? '•';
                      const body = match?.[2] ?? line;
                      return (
                        <span key={li} className={styles.chatboxListItem}>
                          <span className={styles.chatboxListBullet}>{prefix}</span>
                          <span>{body}</span>
                        </span>
                      );
                    }
                    return <span key={li} className={styles.chatboxMsgLine}>{line}</span>;
                  })}
                </span>
              ) : (
                lines.map((line, li) => (
                  <span key={li} className={styles.chatboxMsgLine}>{line}</span>
                ))
              )}
            </span>
          );
        })}
      </span>
    );
  };

  // Arrow icon shared across cards
  const ArrowUp = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className={styles.chatboxWrapper}>
      <div className={styles.chatboxContainer} ref={containerRef}>

        {/* Message history panel */}
        {isBarOpen && historyOpen && messages.length > 0 && (
          <div className={styles.chatboxWindow}>
            <div className={styles.chatboxHeader}>
              <div className={styles.chatboxHeaderLeft}>
                <div className={styles.chatboxAvatarDot} />
                <div>
                  <span className={styles.chatboxTitle}>AI Assistant</span>
                  <span className={styles.chatboxSubtitle}>Career Coach</span>
                </div>
              </div>
              <div className={styles.chatboxHeaderActions}>
                <button
                  className={styles.chatboxCloseBtn}
                  onClick={() => setHistoryOpen(false)}
                  aria-label="Minimise chat"
                  title="Minimise"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className={styles.chatboxCloseBtn}
                  onClick={handleClearHistory}
                  aria-label="Clear chat"
                  title="Clear"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.chatboxMessages}>
              {messages.flatMap(msg => {
                const messageEl = (
                  <div
                    key={msg.id}
                    className={msg.role === 'user' ? styles.chatboxMsgUser : styles.chatboxMsgAssistant}
                  >
                    <div className={msg.role === 'user' ? styles.chatboxBubbleUser : styles.chatboxBubbleAssistant}>
                      {renderMessage(msg.content)}
                    </div>
                  </div>
                );

                if (msg.role === 'assistant' && msg.action) {
                  const isClicked = !!msg.action.cardDismissed;
                  const cardElements: JSX.Element[] = [];

                  // ── Choice: Resume Intent (ambiguous — show both options) ──
                  if (msg.action.type === 'ask_resume_intent') {
                    const selected = !!msg.action.cardDismissed;
                    cardElements.push(
                      <div key={`${msg.id}-resume-intent`} className={styles.chatboxCardRowDouble}>
                        <button
                          className={`${styles.chatboxCard} ${styles.chatboxCardHalf}${selected ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={selected}
                          onClick={() => {
                            dismissCard(msg.id);
                            onNavigateToExistingResume?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: `${w} Taking you to the Craft from Existing Resume page.` },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content:
                                    "Here's what to fill in:\n\n" +
                                    "① Interested Job Position — paste a job URL, job title, or job description\n" +
                                    "② Interested Industry Sector — pick the sector that fits your target role\n" +
                                    "③ Upload Resume — upload your current resume (PDF, DOC, or DOCX)\n\n" +
                                    "Once all three are filled, hit the Craft button!",
                                },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Craft from Existing Resume</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                        <button
                          className={`${styles.chatboxCard} ${styles.chatboxCardHalf}${selected ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={selected}
                          onClick={() => {
                            dismissCard(msg.id);
                            onNavigateToKnowledgeBaseResume?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: `${w} Taking you to the Craft from Knowledge Base page.` },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content:
                                    "Here's what to do:\n\n" +
                                    "① Company Type — select the type of company you're targeting (startup, corporate, FAANG, etc.)\n" +
                                    "② Interested Job Position — enter the role you're aiming for\n\n" +
                                    "Hit Craft — we'll use your saved skills, projects, and experience to generate a tailored resume!",
                                },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Craft from Knowledge Base</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Craft from Existing Resume ──
                  } else if (msg.action.type === 'navigate_to_existing_resume') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            onNavigateToExistingResume?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content: `${w} Taking you to the Craft from Existing Resume page.`,
                                },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content:
                                    "Here's what to fill in:\n\n" +
                                    "① Interested Job Position — paste a job URL, job title, or job description\n" +
                                    "② Interested Industry Sector — pick the sector that fits your target role\n" +
                                    "③ Upload Resume — upload your current resume (PDF, DOC, or DOCX)\n\n" +
                                    "Once all three are filled, hit the Craft button!",
                                },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Craft from Existing Resume</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Craft from Knowledge Base ──
                  } else if (msg.action.type === 'navigate_to_knowledge_base_resume') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            onNavigateToKnowledgeBaseResume?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content: `${w} Taking you to the Craft from Knowledge Base page.`,
                                },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: Date.now().toString(),
                                  role: 'assistant',
                                  content:
                                    "Here's what to do:\n\n" +
                                    "① Company Type — select the type of company you're targeting (startup, corporate, FAANG, etc.)\n" +
                                    "② Interested Job Position — enter the role you're aiming for\n\n" +
                                    "Hit Craft — we'll use your saved skills, projects, and experience to generate a tailored resume!",
                                },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Craft Resume from Knowledge Base</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Established Personal Project ──
                  } else if (msg.action.type === 'navigate_to_established_personal_project') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            setPendingProjectType('personal_established');
                            onNavigateToEstablishedPersonalProject?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: `${w} A new Established Expertise personal project has been added for you.` },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: 'Could you share a project source URL, or give me a brief description of the project so I can help fill in the details?' },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Established Expertise</span>
                            <span className={styles.chatboxCardDesc}>Personal Project · Add new</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Expanding Personal Project ──
                  } else if (msg.action.type === 'navigate_to_expanding_personal_project') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            setPendingProjectType('personal_expanding');
                            onNavigateToExpandingPersonalProject?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: `${w} A new Expanding Knowledge personal project has been added for you.` },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: 'Could you share a project source URL, or describe what you\'re planning for this project so I can help fill in the details?' },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Expanding Knowledge</span>
                            <span className={styles.chatboxCardDesc}>Planned Personal Project · Add new</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Established Professional Project ──
                  } else if (msg.action.type === 'navigate_to_established_professional_project') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            setPendingProjectType('professional_established');
                            onNavigateToEstablishedProfessionalProject?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: `${w} A new Established Expertise professional project has been added for you.` },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: 'Could you share a project source URL, or give me a brief description of the project so I can help fill in the details?' },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Established Expertise</span>
                            <span className={styles.chatboxCardDesc}>Professional Project · Add new</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Expanding Professional Project ──
                  } else if (msg.action.type === 'navigate_to_expanding_professional_project') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            setPendingProjectType('professional_expanding');
                            onNavigateToExpandingProfessionalProject?.();
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: `${w} A new Expanding Knowledge professional project has been added for you.` },
                              ]);
                            }, 400);
                            setTimeout(() => {
                              setMessages(prev => [
                                ...prev,
                                { id: Date.now().toString(), role: 'assistant', content: 'Could you share a project source URL, or describe what you\'re planning for this project so I can help fill in the details?' },
                              ]);
                            }, 900);
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Expanding Knowledge</span>
                            <span className={styles.chatboxCardDesc}>Planned Professional Project · Add new</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Professional Step ──
                  } else if (msg.action.type === 'navigate_to_professional_step') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            onNavigateToProfessionalStep?.();
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Add Work Experience</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Navigate: Career Focus ──
                  } else if (msg.action.type === 'navigate_to_career_focus') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            onNavigateToCareerFocus?.();
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Set Career Focus</span>
                            <span className={styles.chatboxCardDesc}>Profile · Career Focus</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Show Pricing Modal ──
                  } else if (msg.action.type === 'show_pricing') {
                    cardElements.push(
                      <div key={`${msg.id}-card`} className={styles.chatboxCardRow}>
                        <button
                          className={`${styles.chatboxCard}${isClicked ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={isClicked}
                          onClick={() => {
                            dismissCard(msg.id);
                            onShowPricing?.();
                          }}
                        >
                          <div className={styles.chatboxCardContent}>
                            <span className={styles.chatboxCardTitle}>Plan Pricing</span>
                          </div>
                          <div className={styles.chatboxCardArrow}><ArrowUp /></div>
                        </button>
                      </div>
                    );

                  // ── Choice: Project Type ──
                  } else if (msg.action.type === 'ask_project_type') {
                    const selected = msg.action.selectedChoice;
                    const typeRow1 = ['Personal Project', 'Side Project'];
                    const typeRow2 = ['Work Project', 'Research Project'];
                    const renderTypeCard = (label: string) => (
                      <button
                        key={label}
                        className={`${styles.chatboxCard} ${styles.chatboxCardHalf}${selected ? ` ${styles.chatboxCardInactive}` : ''}`}
                        disabled={!!selected}
                        onClick={() => selectChoice(msg.id, label)}
                      >
                        <span className={styles.chatboxCardTitle}>{label}</span>
                      </button>
                    );
                    cardElements.push(
                      <div key={`${msg.id}-type-row-1`} className={styles.chatboxCardRowDouble}>
                        {typeRow1.map(renderTypeCard)}
                      </div>
                    );
                    cardElements.push(
                      <div key={`${msg.id}-type-row-2`} className={styles.chatboxCardRowDouble}>
                        {typeRow2.map(renderTypeCard)}
                      </div>
                    );

                  // ── Choice: Project Status ──
                  } else if (msg.action.type === 'ask_project_status') {
                    const selected = msg.action.selectedChoice;
                    const statusChoices = ['In Progress', 'Completed', 'Planning Ahead'];
                    cardElements.push(
                      <div key={`${msg.id}-status-row`} className={styles.chatboxCardRowTriple}>
                        {statusChoices.map(label => (
                          <button
                            key={label}
                            className={`${styles.chatboxCard} ${styles.chatboxCardThird}${selected ? ` ${styles.chatboxCardInactive}` : ''}`}
                            disabled={!!selected}
                            onClick={() => selectChoice(msg.id, label)}
                          >
                            <span className={styles.chatboxCardTitle}>{label}</span>
                          </button>
                        ))}
                      </div>
                    );

                  // ── Text Choices (auto-detected numbered list) ──
                  } else if (msg.action.type === 'text_choices' && msg.action.choices?.length) {
                    const selected = msg.action.selectedChoice;
                    cardElements.push(
                      <div key={`${msg.id}-choices-row`} className={styles.chatboxCardRowTriple}>
                        {msg.action.choices.map(label => (
                          <button
                            key={label}
                            className={`${styles.chatboxCard} ${styles.chatboxCardThird}${selected ? ` ${styles.chatboxCardInactive}` : ''}`}
                            disabled={!!selected}
                            onClick={() => selectChoice(msg.id, label)}
                          >
                            <span className={styles.chatboxCardTitle}>{label}</span>
                          </button>
                        ))}
                      </div>
                    );

                  // ── Update: Phase 1 — Bullet Points / Technologies / Frameworks & Tools ──
                  } else if (msg.action.type === 'update_project_description' && msg.action.data) {
                    const analysisData = msg.action.data;
                    const projType = analysisData.projectType || pendingProjectType || 'personal_established';

                    const descDismissed = !!msg.action.cardDismissed;
                    const techDismissed = !!msg.action.techCardDismissed;
                    const frameDismissed = !!msg.action.frameworkCardDismissed;
                    const firstGroupClicked = descDismissed || techDismissed || frameDismissed;

                    const hasTechKw = Object.values(analysisData.technologies ?? {}).some(arr => arr.length > 0);
                    const hasFrameKw = Object.values(analysisData.frameworks ?? {}).some(arr => arr.length > 0);
                    const hasName = !!analysisData.projectName;
                    const hasIndustry = !!analysisData.industrySector && (projType === 'personal_established' || projType === 'personal_expanding');
                    const hasPhase2 = hasName || hasIndustry;

                    // Helper: inject the Phase 2 ask message when the first Phase 1 card is clicked
                    const maybeInjectPhase2 = () => {
                      if (firstGroupClicked || !hasPhase2) return;
                      setTimeout(() => {
                        setMessages(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            role: 'assistant',
                            content: `Would you also like to update the Project Name${hasIndustry ? ' and Industry Sector' : ''}?`,
                            action: { type: 'ask_project_meta' as const, data: analysisData },
                          },
                        ]);
                      }, 900);
                    };

                    cardElements.push(
                      <div key={`${msg.id}-update-row`} className={styles.chatboxCardRowTriple}>
                        {/* Bullet Points */}
                        <button
                          className={`${styles.chatboxCard} ${styles.chatboxCardThird}${descDismissed ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={descDismissed}
                          onClick={() => {
                            dismissCard(msg.id);
                            onUpdateProjectDescription?.(projType, {
                              overview: analysisData.overview,
                              techAndTeamwork: analysisData.techAndTeamwork,
                              achievement: analysisData.achievement,
                            }, analysisData.projectSource);
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `${w} Bullet points have been filled in for your project.` }]);
                            }, 400);
                            maybeInjectPhase2();
                          }}
                        >
                          <span className={styles.chatboxCardTitle}>Bullet Points</span>
                        </button>

                        {/* Technologies */}
                        <button
                          className={`${styles.chatboxCard} ${styles.chatboxCardThird}${(techDismissed || !hasTechKw) ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={techDismissed || !hasTechKw}
                          onClick={() => {
                            dismissTechCard(msg.id);
                            onUpdateProjectTechnologies?.(projType, analysisData.technologies);
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `${w} Technologies have been updated with relevant keywords.` }]);
                            }, 400);
                            maybeInjectPhase2();
                          }}
                        >
                          <span className={styles.chatboxCardTitle}>Technologies</span>
                        </button>

                        {/* Frameworks & Tools */}
                        <button
                          className={`${styles.chatboxCard} ${styles.chatboxCardThird}${(frameDismissed || !hasFrameKw) ? ` ${styles.chatboxCardInactive}` : ''}`}
                          disabled={frameDismissed || !hasFrameKw}
                          onClick={() => {
                            dismissFrameworkCard(msg.id);
                            onUpdateProjectFrameworks?.(projType, analysisData.frameworks);
                            const w = encourage();
                            setTimeout(() => {
                              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `${w} Frameworks & tools have been filled in for your project.` }]);
                            }, 400);
                            maybeInjectPhase2();
                          }}
                        >
                          <span className={styles.chatboxCardTitle}>Frameworks & Tools</span>
                        </button>
                      </div>
                    );

                  // ── Update: Phase 2 — Project Name / Industry Sector ──
                  } else if (msg.action.type === 'ask_project_meta' && msg.action.data) {
                    const analysisData = msg.action.data;
                    const projType = analysisData.projectType || pendingProjectType || 'personal_established';
                    const nameDismissed = !!msg.action.nameCardDismissed;
                    const industryDismissed = !!msg.action.industryCardDismissed;
                    const hasName = !!analysisData.projectName;
                    const hasIndustry = !!analysisData.industrySector && (projType === 'personal_established' || projType === 'personal_expanding');

                    cardElements.push(
                      <div key={`${msg.id}-meta-row`} className={styles.chatboxCardRowDouble}>
                        {hasName && (
                          <button
                            className={`${styles.chatboxCard} ${styles.chatboxCardHalf}${nameDismissed ? ` ${styles.chatboxCardInactive}` : ''}`}
                            disabled={nameDismissed}
                            onClick={() => {
                              dismissNameCard(msg.id);
                              onUpdateProjectName?.(projType, analysisData.projectName!);
                              const w = encourage();
                              setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `${w} Project name has been set to "${analysisData.projectName}".` }]);
                              }, 400);
                              setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Is there anything else you\'d like to update on this project?' }]);
                              }, 900);
                            }}
                          >
                            <span className={styles.chatboxCardTitle}>Project Name</span>
                          </button>
                        )}
                        {hasIndustry && (
                          <button
                            className={`${styles.chatboxCard} ${styles.chatboxCardHalf}${industryDismissed ? ` ${styles.chatboxCardInactive}` : ''}`}
                            disabled={industryDismissed}
                            onClick={() => {
                              dismissIndustryCard(msg.id);
                              onUpdateProjectIndustry?.(projType, analysisData.industrySector!);
                              const w = encourage();
                              setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `${w} Industry sector has been set to "${analysisData.industrySector}".` }]);
                              }, 400);
                              setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Is there anything else you\'d like to update on this project?' }]);
                              }, 900);
                            }}
                          >
                            <span className={styles.chatboxCardTitle}>Industry Sector</span>
                          </button>
                        )}
                      </div>
                    );
                  // ── Sanity Check Sequence ──
                  } else if (msg.action.type === 'sanity_check_sequence' && msg.action.sanityData) {
                    const { issues, currentIndex, matchedCount, animDir } = msg.action.sanityData;
                    if (currentIndex < issues.length) {
                      const issue = issues[currentIndex];
                      const isLast = currentIndex === issues.length - 1;
                      const isFirst = currentIndex === 0;
                      const sevColor = issue.severity === 'High' ? '#EF9A9A' : issue.severity === 'Mid' ? '#9FA8DA' : '#FFCC80';
                      const sevText = issue.severity === 'High' ? '#8B0000' : issue.severity === 'Mid' ? '#1a237e' : '#7c4700';
                      const contentAnimClass = (animDir || 'next') === 'next'
                        ? styles.sanitycheckContentNext
                        : styles.sanitycheckContentBack;
                      cardElements.push(
                        <div key={`${msg.id}-sanity`} className={styles.sanitycheckCard}>
                          <div
                            key={`${msg.id}-content-${currentIndex}`}
                            className={`${styles.sanitycheckContent} ${contentAnimClass}`}
                          >
                            <div className={styles.sanitycheckHeader}>
                              <span className={styles.sanitycheckOrdinal}>{issue.ordinal} check</span>
                              <span className={styles.sanitycheckBadge} style={{ background: sevColor, color: sevText }}>
                                {issue.severity}
                              </span>
                              <span className={styles.sanitycheckCount}>{currentIndex + 1} / {matchedCount}</span>
                            </div>
                            <p className={styles.sanitycheckMessage}>{issue.message}</p>
                          </div>
                          <div className={styles.sanitycheckFooter}>
                            <button
                              className={`${styles.sanitycheckNavBtn} ${isFirst ? styles.sanitycheckNavBtnDisabled : ''}`}
                              disabled={isFirst}
                              onClick={() => retreatSanityCheck(msg.id)}
                            >
                              ← Back
                            </button>
                            <button
                              className={styles.sanitycheckNavBtn}
                              onClick={() => advanceSanityCheck(msg.id, () => {
                                setTimeout(() => {
                                  setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: `Congratulations! You've reviewed all ${matchedCount} sanity check result${matchedCount !== 1 ? 's' : ''}. Keep up the great work improving your resume!`,
                                  }]);
                                }, 300);
                              })}
                            >
                              {isLast ? 'Done ✓' : 'Next →'}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  }

                  if (cardElements.length > 0) return [messageEl, ...cardElements];
                }

                return [messageEl];
              })}
              {isLoading && (
                <div className={styles.chatboxMsgAssistant}>
                  <div className={styles.chatboxMsgAvatar} />
                  <div className={styles.chatboxTyping}>
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Collapsed history indicator */}
        {isBarOpen && !historyOpen && messages.length > 0 && (
          <button className={styles.chatboxHistoryPill} onClick={() => setHistoryOpen(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* ── Trigger button (default collapsed state) ── */}
        {!isBarOpen && (
          <button
            className={styles.chatboxTrigger}
            onClick={() => setIsBarOpen(true)}
            aria-label="Open AI assistant"
          >
            {/* Pulsing online dot */}
            <span className={styles.chatboxTriggerDot} />
            <span className={styles.chatboxTriggerLabel}>Let's do it</span>
            {/* Arrow icon */}
            <span className={styles.chatboxTriggerArrow}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        )}

        {/* ── Full input bar (open state) ── */}
        {isBarOpen && (
          <div className={`${styles.chatboxBar} ${isFocused ? styles.chatboxBarFocused : ''}`}>
            <textarea
              ref={inputRef}
              className={styles.chatboxBarInput}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Ask me anything${userName ? `, ${userName.split(' ')[0]}` : ''}…`}
              rows={1}
              readOnly={isLoading}
            />

            {/* Send button */}
            <button
              className={`${styles.chatboxBarSendBtn} ${input.trim() ? styles.chatboxBarSendBtnActive : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {isBarOpen && (
          <p className={styles.chatboxBarHint}>Enter to send · Shift+Enter for new line</p>
        )}
      </div>
    </div>
  );
}
