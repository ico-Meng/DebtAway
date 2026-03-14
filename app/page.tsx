"use client";

import React, { useState, useEffect, useRef } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { userManager, signOutRedirect } from "@/types";
import type { User } from "oidc-client-ts";
import { Orbitron, Comfortaa, Plus_Jakarta_Sans } from "next/font/google";
import styles from "./landing.module.css";
import { API_ENDPOINT } from "@/app/components/config";
import PricingModal from "@/app/components/PricingModal";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-orbitron",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-comfortaa",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

Amplify.configure(outputs);

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("Free Plan");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideTransition, setSlideTransition] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

  const heroSlides = [
    "/images/slide-1.png",
    "/images/slide-2.png",
    "/images/slide-3.png",
    "/images/slide-4.png",
    "/images/slide-5.png",
    "/images/slide-6.png",
    "/images/slide-7.png",
    "/images/slide-8.png",
    "/images/slide-10.png",
    "/images/slide-11.png",
  ];
  const slideCount = heroSlides.length;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        try {
          const callbackUser = await userManager.signinCallback();
          if (callbackUser) {
            // Redirect to dashboard after successful login/signup
            window.location.replace('/dashboard');
            return;
          }
        } catch {
          // Not a callback scenario
        }

        const existingUser = await userManager.getUser();
        if (existingUser && !existingUser.expired) {
          setUser(existingUser);
          fetchUserPlan(existingUser.profile.sub);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleUserLoaded = (loadedUser: User | null) => {
      setUser(loadedUser);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentSlide === slideCount) {
      const timeout = setTimeout(() => {
        setSlideTransition(false);
        setCurrentSlide(0);
      }, 700);
      return () => clearTimeout(timeout);
    }
    if (!slideTransition) {
      const raf = requestAnimationFrame(() => {
        setSlideTransition(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [currentSlide, slideCount, slideTransition]);

  const testimonials = [
    { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "Sarah K.", role: "Software Engineer", text: "Ambitology made the whole job prep process feel effortless. It's the most intuitive career tool I've ever used." },
    { avatar: "https://randomuser.me/api/portraits/men/32.jpg",   name: "James L.", role: "Backend Developer", text: "Within just four weeks of using Ambitology, my interview invites tripled. I finally feel like I'm being seen by recruiters." },
    { avatar: "https://randomuser.me/api/portraits/women/63.jpg", name: "Priya M.", role: "Full Stack Developer", text: "The ability to plan future projects and have Ambitology build a resume around those goals completely changed my strategy." },
    { avatar: "https://randomuser.me/api/portraits/men/18.jpg",   name: "David C.", role: "Frontend Engineer", text: "After AI-driven interview prep sessions, my confidence in technical rounds went through the roof. Truly invaluable." },
    { avatar: "https://randomuser.me/api/portraits/women/28.jpg", name: "Angela T.", role: "Data Scientist", text: "The capability analysis gave me an honest look at where I stood — and a clear roadmap to level up. Absolutely eye-opening." },
    { avatar: "https://randomuser.me/api/portraits/men/55.jpg",   name: "Marcus R.", role: "DevOps Engineer", text: "I signed up expecting a basic resume tool, but Ambitology is so much more. It genuinely understands your career trajectory." },
    { avatar: "https://randomuser.me/api/portraits/women/75.jpg", name: "Yuki N.", role: "Mobile Developer", text: "A month after using Ambitology, I went from zero callbacks to six interview requests in a single week. Unbelievable results." },
    { avatar: "https://randomuser.me/api/portraits/men/22.jpg",   name: "Chen W.", role: "ML Engineer", text: "Mapping out future skills and seeing them reflected in my resume made me instantly more competitive for the roles I want." },
  ];

  const fetchUserPlan = async (cognitoSub: string) => {
    try {
      const res = await fetch(`${API_ENDPOINT}/get_subscription/${cognitoSub}`);
      if (res.ok) {
        const data = await res.json();
        const raw = (data.plan || "free").toLowerCase();
        const labels: Record<string, string> = {
          free:     "Free Plan",
          pro:      "Pro Plan",
          "2weeks": "2-Week Plan",
          "1month": "Monthly Plan",
          "3months": "3-Month Plan",
        };
        setUserPlan(labels[raw] ?? raw.charAt(0).toUpperCase() + raw.slice(1) + " Plan");
      }
    } catch (error) {
      console.error("Failed to fetch subscription plan:", error);
    }
  };

  const handleSignIn = async () => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleServiceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      handleSignIn();
    }
  };

  const handleSignOut = async () => {
    try {
      setUser(null);
      setDropdownOpen(false);
      await signOutRedirect();
    } catch (error) {
      console.error("Sign-out error:", error);
      setUser(null);
      try {
        await userManager.removeUser();
      } catch (removeError) {
        console.error("Error clearing local user:", removeError);
      }
    }
  };

  const userEmail = user?.profile?.email as string | undefined;
  const userInitial = userEmail ? userEmail[0].toUpperCase() : "U";

  if (isLoading) {
    return (
      <div className={`${styles.loadingContainer} ${orbitron.variable} ${comfortaa.variable} ${plusJakartaSans.variable}`}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${orbitron.variable} ${comfortaa.variable} ${plusJakartaSans.variable}`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <img src="/images/atg-logo.svg" alt="Ambitology logo" className={styles.logoIcon} />
            Ambitology
          </div>
          <nav className={styles.nav}>
            <div
              className={styles.servicesNavItem}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <a href="#" className={`${styles.navLink} ${servicesOpen ? styles.navLinkActive : ""}`}>
                Services
                <svg
                  className={`${styles.servicesChevron} ${servicesOpen ? styles.servicesChevronOpen : ""}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>

              {servicesOpen && (
                <div className={styles.servicesDropdown}>
                  <div className={styles.servicesGrid}>
                    {/* AI Solution */}
                    <div className={styles.servicesSection}>
                      <span className={styles.servicesSectionTitle}>AI Solution</span>
                      <a href="/dashboard?tab=knowledge" className={styles.servicesItem} onClick={handleServiceClick}>
                        <span className={styles.servicesItemIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            <line x1="12" y1="7" x2="16" y2="7" />
                            <line x1="12" y1="11" x2="16" y2="11" />
                          </svg>
                        </span>
                        <div className={styles.servicesItemContent}>
                          <span className={styles.servicesItemLabel}>Build Knowledge Base</span>
                          <span className={styles.servicesItemDesc}>Manage your skills &amp; projects with AI</span>
                        </div>
                      </a>
                      <a href="/dashboard?tab=resume" className={styles.servicesItem} onClick={handleServiceClick}>
                        <span className={styles.servicesItemIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </span>
                        <div className={styles.servicesItemContent}>
                          <span className={styles.servicesItemLabel}>Resume Craft</span>
                          <span className={styles.servicesItemDesc}>AI-tailored resume for your target role</span>
                        </div>
                      </a>
                      <a href="/dashboard?tab=analysis" className={styles.servicesItem} onClick={handleServiceClick}>
                        <span className={styles.servicesItemIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                          </svg>
                        </span>
                        <div className={styles.servicesItemContent}>
                          <span className={styles.servicesItemLabel}>Career Fit Analysis</span>
                          <span className={styles.servicesItemDesc}>Six-dimension match score for any position</span>
                        </div>
                      </a>
                    </div>

                    <div className={styles.servicesDivider} />

                    {/* Live Coach */}
                    <div className={styles.servicesSection}>
                      <span className={styles.servicesSectionTitle}>Live Coach</span>
                      <a href="https://www.careerlandinggroup.com/resume-design/" target="_blank" rel="noopener noreferrer" className={styles.servicesItem} onClick={handleServiceClick}>
                        <span className={styles.servicesItemIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                          </svg>
                        </span>
                        <div className={styles.servicesItemContent}>
                          <span className={styles.servicesItemLabel}>Resume Design</span>
                          <span className={styles.servicesItemDesc}>Professional visual resume by experts</span>
                        </div>
                      </a>
                      <a href="https://www.careerlandinggroup.com/interview-prep/" target="_blank" rel="noopener noreferrer" className={styles.servicesItem} onClick={handleServiceClick}>
                        <span className={styles.servicesItemIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </span>
                        <div className={styles.servicesItemContent}>
                          <span className={styles.servicesItemLabel}>Interview Prep</span>
                          <span className={styles.servicesItemDesc}>Mock interviews with real-time coaching</span>
                        </div>
                      </a>
                      <a href="https://www.careerlandinggroup.com/career-cruise/" target="_blank" rel="noopener noreferrer" className={styles.servicesItem} onClick={handleServiceClick}>
                        <span className={styles.servicesItemIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                          </svg>
                        </span>
                        <div className={styles.servicesItemContent}>
                          <span className={styles.servicesItemLabel}>Career Coach</span>
                          <span className={styles.servicesItemDesc}>Personalized guidance for your career path</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a href="#" className={styles.navLink} onClick={(e) => { e.preventDefault(); setPricingOpen(true); }}>Pricing</a>
            <div
              className={styles.servicesNavItem}
              onMouseEnter={() => setLearnOpen(true)}
              onMouseLeave={() => setLearnOpen(false)}
            >
              <a href="#" className={`${styles.navLink} ${learnOpen ? styles.navLinkActive : ""}`}>
                Learn
                <svg
                  className={`${styles.servicesChevron} ${learnOpen ? styles.servicesChevronOpen : ""}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>

              {learnOpen && (
                <div className={styles.learnDropdown}>
                  <div className={styles.learnItem} style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}>
                    <span className={styles.learnItemIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </span>
                    <div className={styles.learnItemContent}>
                      <span className={styles.learnItemLabel}>
                        Tutorial
                        <span className={styles.learnComingSoon}>Soon</span>
                      </span>
                      <span className={styles.learnItemDesc}>Step-by-step guides & walkthroughs</span>
                    </div>
                  </div>
                  <div className={styles.learnItem} style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}>
                    <span className={styles.learnItemIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </span>
                    <div className={styles.learnItemContent}>
                      <span className={styles.learnItemLabel}>
                        Use Case
                        <span className={styles.learnComingSoon}>Soon</span>
                      </span>
                      <span className={styles.learnItemDesc}>Real-world examples & scenarios</span>
                    </div>
                  </div>
                  <a href="/learn/career-insights" className={styles.learnItem}>
                    <span className={styles.learnItemIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </span>
                    <div className={styles.learnItemContent}>
                      <span className={styles.learnItemLabel}>Career Insights</span>
                      <span className={styles.learnItemDesc}>Articles to grow your career</span>
                    </div>
                  </a>
                </div>
              )}
            </div>
            <div
              className={styles.servicesNavItem}
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <a href="#" className={`${styles.navLink} ${aboutOpen ? styles.navLinkActive : ""}`}>
                About
                <svg
                  className={`${styles.servicesChevron} ${aboutOpen ? styles.servicesChevronOpen : ""}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>

              {aboutOpen && (
                <div className={styles.aboutDropdown}>
                  <a href="/mission" className={styles.aboutItem}>
                    <span className={styles.aboutItemIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8l4 4-4 4M8 12h8" />
                      </svg>
                    </span>
                    <div className={styles.aboutItemContent}>
                      <span className={styles.aboutItemLabel}>Mission</span>
                      <span className={styles.aboutItemDesc}>Our mission, vision &amp; story</span>
                    </div>
                  </a>
                  <a href="/careers" className={styles.aboutItem}>
                    <span className={styles.aboutItemIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                    </span>
                    <div className={styles.aboutItemContent}>
                      <span className={styles.aboutItemLabel}>Careers</span>
                      <span className={styles.aboutItemDesc}>Join our growing team</span>
                    </div>
                  </a>
                  <a href="/contact" className={styles.aboutItem}>
                    <span className={styles.aboutItemIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <div className={styles.aboutItemContent}>
                      <span className={styles.aboutItemLabel}>Contact Us</span>
                      <span className={styles.aboutItemDesc}>Get in touch with our team</span>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {user ? (
            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileButton}
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="User profile menu"
              >
                <span className={styles.profileAvatar}>{userInitial}</span>
              </button>

              {dropdownOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownAvatar}>{userInitial}</span>
                    <div className={styles.dropdownUserInfo}>
                      <span className={styles.dropdownEmail}>{userEmail || "User"}</span>
                      <span className={styles.dropdownPlan}>{userPlan}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownLogout} onClick={handleSignOut}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleSignIn} className={styles.signInButton}>
              Sign up / Login
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroHeading}>
              Welcome to{" "}
              <span className={styles.heroHighlight}>Ambitology!</span>
            </h1>
            <p className={styles.heroSubheading}>
              Unleash your technical potential and boost your career opportunities in the AI era!
            </p>
            {user ? (
              <a href="/dashboard" className={styles.freeTrialButton}>
                Go to Dashboard
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            ) : (
              <button onClick={handleSignIn} className={styles.freeTrialButton}>
                Free Start
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
          <div className={styles.heroMedia}>
            <div className={styles.carouselContainer}>
              <div
                className={styles.carouselTrack}
                style={{
                  width: `${(slideCount + 1) * 100}%`,
                  transform: `translateX(-${(currentSlide / (slideCount + 1)) * 100}%)`,
                  transition: slideTransition ? "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                }}
              >
                {heroSlides.map((src, i) => (
                  <div key={i} className={styles.carouselSlideWrapper} style={{ width: `${100 / (slideCount + 1)}%` }}>
                    <img
                      src={src}
                      alt={`Ambitology feature preview ${i + 1}`}
                      className={styles.carouselSlide}
                    />
                  </div>
                ))}
                <div className={styles.carouselSlideWrapper} style={{ width: `${100 / (slideCount + 1)}%` }}>
                  <img
                    src={heroSlides[0]}
                    alt="Ambitology feature preview 1"
                    className={styles.carouselSlide}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section — Capability Analysis */}
      <section className={styles.featureSection}>
        <div className={styles.featureInner}>
          <div className={styles.featureImage}>
            <img
              src="/images/capability-analysis.png"
              alt="Personal capability and resume power analysis"
              className={styles.featureImg}
            />
          </div>
          <div className={styles.featureText}>
            <span className={styles.featureBadge}>AI-Powered Insights</span>
            <h2 className={styles.featureHeading}>
            Career fit analysis 
            </h2>
            <p className={styles.featureDescription}>
              The AI-driven personalized capability analysis built from your knowledge base and aligned to your target position. Understand your strengths, identify skill gaps, and get actionable recommendations to stand out in your next job search.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section — Resume Analysis */}
      <section className={styles.featureSectionAlt}>
        <div className={styles.featureInnerReversed}>
          <div className={styles.featureText}>
            <span className={styles.featureBadge}>Six-Dimension Scoring</span>
            <h2 className={styles.featureHeading}>
              LLM-powered agentic analysis that scores your resume
            </h2>
            <p className={styles.featureDescription}>
              From background and education to technical skills and job match — get a comprehensive breakdown that pinpoints exactly where to improve.
            </p>
          </div>
          <div className={styles.featureImage}>
            <img
              src="/images/resume-analysis.png"
              alt="Resume power analysis across six dimensions"
              className={styles.featureImg}
            />
          </div>
        </div>
      </section>

      {/* Feature Section — Resume Crafting */}
      <section className={styles.featureSection}>
        <div className={styles.featureInner}>
          <div className={styles.featureImage}>
            <img
              src="/images/resume-crafting.png"
              alt="AI-driven resume crafting interface"
              className={styles.featureImg}
            />
          </div>
          <div className={styles.featureText}>
            <span className={styles.featureBadge}>Smart Resume Builder</span>
            <h2 className={styles.featureHeading}>
              AI-driven resume crafting for target roles
            </h2>
            <p className={styles.featureDescription}>
              Tailor your resume that leverages your present and planned knowledge base to match your target position and industry focus.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section — Knowledge Base */}
      <section className={styles.featureSectionAlt}>
        <div className={styles.featureInnerReversed}>
          <div className={styles.featureText}>
            <span className={styles.featureBadge}>Future-Ready Skills</span>
            <h2 className={styles.featureHeading}>
              Unlock your growing technical potential by building your knowledge base around planned projects and the skills you aim to develop.
            </h2>
            <p className={styles.featureDescription}>
              Map out your current expertise and future learning goals to create a living skills portfolio that evolves with your career.
            </p>
          </div>
          <div className={styles.featureImage}>
            <img
              src="/images/knowledge-base.png"
              alt="Knowledge base and skills selection interface"
              className={styles.featureImg}
            />
          </div>
        </div>
      </section>

      {/* Showcase Section — AI Agent in Action */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseInner}>
          <div className={styles.showcaseImage}>
            <img
              src="/images/ai-chat-showcase.png"
              alt="AI Career Coach in action"
              className={styles.showcaseImg}
            />
          </div>
          <div className={styles.showcaseText}>
            <span className={styles.featureBadge}>AI Agent in Action</span>
            <h2 className={styles.featureHeading}>
              End-to-end agentic solution — powered by flows of smart conversation
            </h2>
            <div className={styles.showcaseList}>
              <div className={styles.showcaseItem}>
                <span className={styles.showcaseItemIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>Build your complete knowledge base — profile, projects, skills, and future goals — in minutes, under your review, with guided AI agenti cconversations</span>
              </div>
              <div className={styles.showcaseItem}>
                <span className={styles.showcaseItemIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>Get personalized six-dimension career fit analysis instantly — no manual input required</span>
              </div>
              <div className={styles.showcaseItem}>
                <span className={styles.showcaseItemIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>One intelligent AI agent handles the entire pipeline — from knowledge capture to interview readiness</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ambitology — Differentiator Cards */}
      <section className={styles.differentiatorSection}>
        <div className={styles.differentiatorInner}>
          <div className={styles.differentiatorHeader}>
            <span className={styles.featureBadge}>Built for the AI Era</span>
            <h2 className={styles.differentiatorHeading}>Why Ambitology is different</h2>
            <p className={styles.differentiatorSub}>
              The rules of career growth have changed. Ambitology is the only platform built for how fast the world actually moves.
            </p>
          </div>
          <div className={styles.differentiatorGrid}>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Skills compound faster than ever</h3>
              <p className={styles.diffCardBody}>
                In the AI era, technical professionals absorb more tools and frameworks in a single week than they once did in months. Your real capability is growing far ahead of what any static resume can capture.
              </p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                  <path d="M7 8h2M11 8h6M7 11h4M13 11h4" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Agentic tools raise the ceiling</h3>
              <p className={styles.diffCardBody}>
                Developers now use AI coding agents to implement complex products at a higher level of abstraction — shipping in days what once took months. Your architectural understanding is your true differentiator, and Ambitology helps you articulate it.
              </p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Plan months ahead — not weeks behind</h3>
              <p className={styles.diffCardBody}>
                The gap between starting your job search and landing an offer can stretch weeks to months. Ambitology's AI agents let you plan and document future projects and experiences in advance, so your profile is always ahead of your job search — not catching up to it.
              </p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <line x1="12" y1="7" x2="16" y2="7" />
                  <line x1="12" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Your full knowledge, ready at interview time</h3>
              <p className={styles.diffCardBody}>
                Candidates can catalogue both their established experience and their planned future skills. When interview time comes, Ambitology matches everything you know — and everything you will know — to the exact role you're targeting.
              </p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>End-to-end AI agent — not just a tool</h3>
              <p className={styles.diffCardBody}>
                Ambitology is not a resume editor or a job board. It's a complete AI agent system that guides you from skill planning to resume crafting, fit analysis, and interview preparation — one continuous intelligent loop that compounds over your entire job search.
              </p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Solve the market gap, not just your resume</h3>
              <p className={styles.diffCardBody}>
                Recruitment has a fundamental inefficiency: exceptional candidates are constantly undersold while companies struggle to find the right people. Ambitology closes that gap by ensuring every candidate is represented at their true ceiling — not just their last job title.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialSection}>
        <div className={styles.testimonialInner}>
          <div className={styles.testimonialHeader}>
            <span className={styles.testimonialBadge}>User Stories</span>
            <h2 className={styles.testimonialHeading}>Loved by ambitious professionals</h2>
            <p className={styles.testimonialSubheading}>See how Ambitology is helping people land more interviews and build stronger careers.</p>
          </div>
          <div className={styles.testimonialCarouselOuter}>
            <div className={styles.testimonialCarousel}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className={styles.testimonialCard}>
                  <div className={styles.testimonialQuoteMark}>&ldquo;</div>
                  <p className={styles.testimonialText}>{t.text}</p>
                  <div className={styles.testimonialAuthorRow}>
                    <img src={t.avatar} alt={t.name} className={styles.testimonialAvatar} />
                    <div className={styles.testimonialAuthorInfo}>
                      <span className={styles.testimonialName}>{t.name}</span>
                      <span className={styles.testimonialRole}>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content — empty for now */}
      <main className={styles.main} />

      {/* Company Logos Section */}
      {(() => {
        const allLogos = [
          { name: "OpenAI",     src: "/images/logos/openai.svg" },
          { name: "Anthropic",  src: "/images/logos/anthropic.svg" },
          { name: "Nvidia",     src: "/images/logos/nvidia.svg" },
          { name: "Mistral AI", src: "/images/logos/mistralai.svg" },
          { name: "xAI",        src: "/images/logos/xai.svg" },
          { name: "Google",     src: "/images/logos/google.svg" },
          { name: "Microsoft",  src: "/images/logos/microsoft.svg" },
          { name: "Apple",      src: "/images/logos/apple.svg" },
          { name: "Amazon",     src: "/images/logos/amazon.svg" },
          { name: "Meta",       src: "/images/logos/meta.svg" },
          { name: "Stripe",     src: "/images/logos/stripe.svg" },
          { name: "Coinbase",   src: "/images/logos/coinbase.svg" },
          { name: "Two Sigma",  src: "/images/logos/twosigma.svg" },
          { name: "Robinhood",  src: "/images/logos/robinhood.svg" },
        ];
        return (
          <section className={styles.logoSection}>
            <p className={styles.logoSectionLabel}>Trusted by engineers from world-class companies</p>
            <div className={styles.logoTrackWrapper}>
              <div className={styles.logoTrack}>
                {[...allLogos, ...allLogos].map((logo, i) => (
                  <div key={i} className={styles.logoItem}>
                    <img src={logo.src} alt={logo.name} className={styles.logoImg} />
                    <span className={styles.logoName}>{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogo}>
                <img src="/images/atg-logo.svg" alt="Ambitology logo" className={styles.footerLogoIcon} />
                Ambitology
              </h3>
            </div>
            <div className={styles.footerColumns}>
              <div className={styles.footerColumn}>
                <a
                  href="#"
                  className={styles.footerLink}
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >Home</a>
                <a
                  href="#"
                  className={styles.footerLink}
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setServicesOpen(true);
                  }}
                >Services</a>
                <a href="/careers" className={styles.footerLink}>Career</a>
              </div>
              <div className={styles.footerColumn}>
                <a href="/privacy-policy" className={styles.footerLink}>Privacy Policy</a>
                <a href="/terms-of-service" className={styles.footerLink}>Terms of Service</a>
                <a href="/disclaimer" className={styles.footerLink}>Disclaimer</a>
              </div>
              <div className={styles.footerColumn}>
                <a href="/refund-policy" className={styles.footerLink}>Refund Policy</a>
                <a href="/contact" className={styles.footerLink}>Contact</a>
                <a href="#" className={styles.footerLink}>FAQ</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.companyName}>
              &copy; {new Date().getFullYear()} Ambit Technology Group, L.L.C.
            </span>
          </div>
        </div>
      </footer>

      <PricingModal
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        cognitoSub={user?.profile?.sub}
        email={user?.profile?.email as string | undefined}
      />
    </div>
  );
}
