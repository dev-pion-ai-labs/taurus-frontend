'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import {
  BarChart3,
  Bell,
  Zap,
  Users,
  CircleCheck,
  ArrowRight,
  Search,
  MessageSquare,
  FileText,
  Map,
  Activity,
  ClipboardList,
  Star,
  Mail,
  GitBranch,
  AtSign,
  Link2,
  Send,
  Check,
  Sparkles,
  Target,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';
import { HeaderAuthActions } from '@/components/shared/header-auth-actions';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Feature tabs data                                                  */
/* ------------------------------------------------------------------ */
const featureTabs = [
  {
    label: 'AI Assessment',
    title: 'Comprehensive AI Readiness Assessment',
    description:
      'Evaluate your organization\'s AI maturity across key dimensions. Our intelligent assessment engine analyzes your data infrastructure, talent readiness, and strategic alignment to provide actionable insights.',
  },
  {
    label: 'Industry Analysis',
    title: 'Deep Industry Intelligence',
    description:
      'Leverage AI-powered analysis of your industry landscape. Understand competitive positioning, emerging trends, and transformation opportunities specific to your sector.',
  },
  {
    label: 'Roadmap Generation',
    title: 'AI-Powered Roadmap Creation',
    description:
      'Generate comprehensive transformation roadmaps tailored to your organization. Our engine creates phased plans with clear milestones, resource allocation, and risk mitigation strategies.',
  },
  {
    label: 'Implementation',
    title: 'Guided Implementation Framework',
    description:
      'Execute your transformation with confidence. Our platform provides step-by-step guidance, automated task management, and real-time progress monitoring throughout your journey.',
  },
  {
    label: 'Progress Tracking',
    title: 'Real-Time Progress Analytics',
    description:
      'Monitor every aspect of your transformation in real-time. Track KPIs, milestone completion, team velocity, and ROI with comprehensive dashboards and automated reporting.',
  },
  {
    label: 'Team Management',
    title: 'Collaborative Team Workspace',
    description:
      'Empower your transformation team with collaborative tools. Assign roles, track contributions, manage workflows, and ensure alignment across all stakeholders.',
  },
];

/* ------------------------------------------------------------------ */
/*  Process tabs data                                                  */
/* ------------------------------------------------------------------ */
const processTabs = [
  {
    label: 'Discover',
    title: 'Understand Your Needs',
    description:
      'Our AI-powered discovery engine conducts an in-depth analysis of your current state, identifying gaps, opportunities, and quick wins. Through intelligent conversation, we map your organization\'s unique transformation landscape.',
  },
  {
    label: 'Strategize',
    title: 'Build Your Strategy',
    description:
      'Transform insights into actionable strategy. Our platform generates customized questionnaires, benchmarks your performance, and creates a data-driven strategic framework aligned with your business objectives.',
  },
  {
    label: 'Quantify',
    title: 'Measure the Value',
    description:
      'Put concrete numbers behind your transformation potential. Our scoring engine evaluates readiness across multiple dimensions, calculates expected ROI, and identifies high-impact opportunities for immediate action.',
  },
  {
    label: 'Transform',
    title: 'Implement & Track',
    description:
      'Execute your transformation with precision. Track progress across workstreams, manage tasks with kanban boards, and monitor real-time KPIs. Our platform ensures nothing falls through the cracks.',
  },
];

/* ------------------------------------------------------------------ */
/*  Pricing data                                                       */
/* ------------------------------------------------------------------ */
const pricingPlans = {
  starter: {
    name: 'Starter',
    price: '$499',
    period: '/mo',
    description: 'Perfect for small teams beginning their AI transformation journey.',
    cta: 'Get Started',
    testimonial: {
      quote: 'The perfect starting point for our AI journey.',
      name: 'Sarah K.',
      role: 'CTO, TechStart',
    },
    features: [
      'AI Readiness Assessment',
      'Basic Industry Analysis',
      'Single Transformation Roadmap',
      'Email Support',
      'Up to 5 Team Members',
      'Monthly Progress Reports',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: '$9,999',
    period: '/mo',
    description: 'For large organizations driving transformation at scale.',
    cta: 'Contact Sales',
    testimonial: {
      quote: 'Scaled our transformation across 12 business units.',
      name: 'David L.',
      role: 'VP Digital, Fortune 500',
    },
    features: [
      'Everything in Professional',
      'Unlimited Assessments',
      'Custom AI Model Training',
      'Dedicated Success Manager',
      'SSO & Advanced Security',
      'Custom Integrations & API Access',
      'On-Premise Deployment Option',
      'Executive Strategy Sessions',
    ],
  },
  professional: {
    name: 'Professional',
    price: '$2,499',
    period: '/mo',
    description: 'Comprehensive tools for mid-size organizations serious about AI transformation.',
    cta: 'Start Free Trial',
    testimonial: {
      quote: 'ROI was visible within the first quarter of implementation.',
      name: 'James W.',
      role: 'Director of Innovation, MedCorp',
    },
    features: [
      'Everything in Starter',
      'Advanced Industry Analysis',
      'Unlimited Roadmaps',
      'Implementation Tracking',
      'Priority Support',
      'Up to 25 Team Members',
      'Weekly Progress Reports',
      'Team Collaboration Tools',
      'Custom Branding',
    ],
  },
};

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                */
/* ================================================================== */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [activeProcessTab, setActiveProcessTab] = useState(0);

  /* ---- Smooth scroll with Lenis ---- */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  /* ---- Scroll detection for navbar ---- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---- Smooth scroll handler ---- */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* ============================================================ */}
      {/*  NAVIGATION BAR                                              */}
      {/* ============================================================ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-[#E7E5E4]'
            : 'bg-transparent'
        }`}
        style={{ paddingLeft: 24, paddingRight: 24 }}
      >
        <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-[20px] font-bold tracking-tight"
            style={{ color: '#1C1917' }}
          >
            Taurus
          </Link>

          {/* Center links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Features', id: 'features' },
              { label: 'Process', id: 'process' },
              { label: 'Pricing', id: 'pricing' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium transition-colors cursor-pointer hover:text-[#1C1917]"
                style={{ color: '#78716C', fontSize: 14 }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <HeaderAuthActions />
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  SECTION 1: HERO                                             */}
      {/* ============================================================ */}
      <section
        id="hero"
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FEF3C7 0%, #FECACA 30%, #FDE68A 60%, #FFF7ED 85%, #FFFFFF 100%)',
          paddingTop: 140,
          paddingBottom: 0,
        }}
      >
        <div className="relative z-10 max-w-[1200px] mx-auto px-6">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="uppercase font-semibold mb-6"
              style={{
                fontSize: 12,
                letterSpacing: 4,
                color: '#78716C',
              }}
            >
              AI Transformation Operating System
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="font-normal max-w-[800px] mb-6"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 64px)',
                lineHeight: 1.1,
                color: '#1C1917',
              }}
            >
              Design Your AI Transformation with Precision.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="max-w-[600px] mb-10"
              style={{
                fontSize: 17,
                fontWeight: 400,
                color: '#57534E',
                lineHeight: 1.7,
              }}
            >
              Streamline your transformation journey and eliminate guesswork with
              intelligent AI consultation. Let our platform help you discover,
              strategize, and implement faster with unmatched precision.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: '#1C1917',
                  color: '#FFFFFF',
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 15,
                }}
              >
                Start for free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center font-medium rounded-full border transition-all hover:bg-white/40"
                style={{
                  color: '#1C1917',
                  borderColor: '#1C1917',
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 15,
                }}
              >
                Contact Us
              </Link>
            </motion.div>

            {/* Hero Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="w-full mt-16"
            >
              <div className="animate-float">
                <div
                  className="w-full max-w-[960px] mx-auto rounded-2xl border overflow-hidden"
                  style={{
                    borderColor: '#E7E5E4',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Browser chrome */}
                  <div
                    className="flex items-center gap-2 px-4 h-10 border-b"
                    style={{ backgroundColor: '#F9F9F8', borderColor: '#E7E5E4' }}
                  >
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E7E5E4' }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E7E5E4' }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E7E5E4' }} />
                    </div>
                    <div
                      className="flex-1 h-6 rounded-md mx-12"
                      style={{ backgroundColor: '#F5F5F4', maxWidth: 300 }}
                    />
                  </div>

                  {/* App content */}
                  <div className="flex min-h-[380px]" style={{ backgroundColor: '#FFFFFF' }}>
                    {/* Left sidebar */}
                    <div
                      className="hidden md:flex flex-col w-[240px] border-r p-4 shrink-0"
                      style={{ borderColor: '#E7E5E4', backgroundColor: '#FAFAF9' }}
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#1C1917' }}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                          Taurus AI
                        </span>
                      </div>

                      <p
                        className="text-[11px] font-medium uppercase mb-2"
                        style={{ color: '#A8A29E', letterSpacing: 1 }}
                      >
                        Today
                      </p>
                      {[
                        'Organization AI assessment',
                        'Industry analysis report',
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-[13px] truncate"
                          style={{
                            backgroundColor: i === 0 ? '#F5F5F4' : 'transparent',
                            color: '#1C1917',
                          }}
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: '#A8A29E' }} />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}

                      <p
                        className="text-[11px] font-medium uppercase mt-4 mb-2"
                        style={{ color: '#A8A29E', letterSpacing: 1 }}
                      >
                        Previous 7 Days
                      </p>
                      {[
                        'Roadmap generation',
                        'Implementation tracking',
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-[13px] truncate"
                          style={{ color: '#78716C' }}
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: '#A8A29E' }} />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Center content */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                      <div className="text-center max-w-md">
                        <h3
                          className="text-xl font-bold mb-2"
                          style={{ color: '#1C1917' }}
                        >
                          Generate AI Transformation Insights
                        </h3>
                        <p className="text-sm mb-6" style={{ color: '#A8A29E' }}>
                          Start a conversation with Taurus AI to discover, strategize, and transform.
                        </p>

                        {/* Input bar */}
                        <div
                          className="flex items-center gap-2 rounded-xl border px-4 py-3 mb-5"
                          style={{ borderColor: '#E7E5E4', backgroundColor: '#FAFAF9' }}
                        >
                          <Search className="w-4 h-4" style={{ color: '#A8A29E' }} />
                          <span className="text-sm" style={{ color: '#A8A29E' }}>
                            Ask me anything...
                          </span>
                          <div className="ml-auto">
                            <Send className="w-4 h-4" style={{ color: '#A8A29E' }} />
                          </div>
                        </div>

                        {/* Pill chips */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {[
                            'AI Assessment',
                            'Strategy Workshop',
                            'Transformation Roadmap',
                          ].map((chip) => (
                            <div
                              key={chip}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border"
                              style={{
                                borderColor: '#E7E5E4',
                                color: '#1C1917',
                                backgroundColor: '#FFFFFF',
                              }}
                            >
                              {chip}
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top-right floating card */}
                      <div
                        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg border"
                        style={{
                          borderColor: '#E7E5E4',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: '#0D9488' }}
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#1C1917' }}>
                          Taurus AI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Social proof — inside hero gradient */}
        <div
          className="max-w-[1200px] mx-auto px-6"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="flex flex-col items-center gap-8"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-center"
              style={{ fontSize: 13, color: '#A8A29E' }}
            >
              Trusted by forward-thinking organizations
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center"
              style={{ gap: 48 }}
            >
              {['Accenture', 'Deloitte', 'KPMG', 'McKinsey', 'EY', 'BCG'].map(
                (brand) => (
                  <span
                    key={brand}
                    className="font-semibold select-none"
                    style={{ fontSize: 18, color: '#A8A29E' }}
                  >
                    {brand}
                  </span>
                )
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3: FEATURES TAB SHOWCASE                            */}
      {/* ============================================================ */}
      <section
        id="features"
        className="relative z-10"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF9F0 30%, #FEFCE8 60%, #FFF7ED 100%)',
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            {/* Heading */}
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center font-bold mb-4"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: '#1C1917',
              }}
            >
              Powerful Features Built for Transformation
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center mx-auto mb-12 max-w-[600px]"
              style={{ fontSize: 16, color: '#78716C', lineHeight: 1.7 }}
            >
              From assessment to analytics, every tool you need to drive
              successful AI transformation across your organization.
            </motion.p>

            {/* Tab row */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2 mb-12"
            >
              {featureTabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveFeatureTab(i)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      activeFeatureTab === i ? '#1C1917' : '#FFFFFF',
                    color:
                      activeFeatureTab === i ? '#FFFFFF' : '#1C1917',
                    borderColor:
                      activeFeatureTab === i ? '#1C1917' : '#E7E5E4',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Tab content */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16"
                >
                  {/* Left text */}
                  <div className="lg:col-span-2 flex flex-col justify-center">
                    <h3
                      className="text-2xl font-bold mb-4"
                      style={{ color: '#1C1917' }}
                    >
                      {featureTabs[activeFeatureTab].title}
                    </h3>
                    <p
                      className="leading-relaxed"
                      style={{ fontSize: 15, color: '#78716C', lineHeight: 1.7 }}
                    >
                      {featureTabs[activeFeatureTab].description}
                    </p>
                  </div>

                  {/* Right mockup visual */}
                  <div className="lg:col-span-3">
                    <FeatureTabVisual index={activeFeatureTab} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Stacking scroll cards */}
            <div className="space-y-6 pb-[20vh]">
              {[
                {
                  icon: BarChart3,
                  title: 'Data Driven Insights',
                  desc: 'Transform raw data into actionable intelligence with AI-powered analytics and visualization. Identify opportunities and predict ROI with our comprehensive dashboards.',
                  gradient: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
                },
                {
                  icon: Bell,
                  title: 'Smart Notifications',
                  desc: 'Stay informed with intelligent alerts that prioritize what matters most to your transformation. Get personalized updates for critical milestones and deadlines.',
                  gradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                },
                {
                  icon: Zap,
                  title: 'Automated Task Management',
                  desc: 'Streamline workflows with AI-powered task automation, assignment, and progress tracking. Eliminate repetitive work so your team can focus on meaningful impact.',
                  gradient: 'linear-gradient(135deg, #FFF1F2, #FECACA)',
                },
                {
                  icon: Users,
                  title: 'Team Collaboration Hub',
                  desc: 'Unite your team with real-time collaboration tools designed for transformation initiatives. Share insights, assign tasks, and track progress seamlessly.',
                  gradient: 'linear-gradient(135deg, #FECACA, #FEF3C7)',
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="sticky rounded-2xl border p-8 md:p-10 shadow-sm"
                  style={{
                    top: `${120 + i * 20}px`,
                    background: card.gradient,
                    borderColor: 'rgba(231,229,228,0.6)',
                    zIndex: i + 1,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                    >
                      <card.icon className="w-6 h-6" style={{ color: '#1C1917' }} />
                    </div>
                    <div>
                      <h4
                        className="text-lg font-semibold mb-2"
                        style={{ color: '#1C1917' }}
                      >
                        {card.title}
                      </h4>
                      <p className="text-sm leading-relaxed max-w-xl" style={{ color: '#57534E' }}>
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4: OUR PROCESS                                      */}
      {/* ============================================================ */}
      <section
        id="process"
        className="relative z-10"
        style={{
          background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 40%, #FFF1F2 100%)',
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="font-bold mb-4"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: '#1C1917',
              }}
            >
              Our Process
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="max-w-[500px] mb-12"
              style={{ fontSize: 16, color: '#78716C', lineHeight: 1.7 }}
            >
              A proven four-step methodology that takes you from discovery to
              transformation, powered by AI at every stage.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-10 gap-8"
            >
              {/* Left vertical tabs */}
              <div className="lg:col-span-3 flex flex-col gap-1">
                {processTabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveProcessTab(i)}
                    className="text-left px-4 py-3 rounded-lg transition-all cursor-pointer"
                    style={{
                      borderLeft:
                        activeProcessTab === i
                          ? '3px solid #1C1917'
                          : '3px solid transparent',
                      color:
                        activeProcessTab === i ? '#1C1917' : '#A8A29E',
                      fontWeight: activeProcessTab === i ? 700 : 500,
                      fontSize: 16,
                      backgroundColor:
                        activeProcessTab === i ? '#F5F5F4' : 'transparent',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right content */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProcessTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3
                      className="text-2xl font-bold mb-3"
                      style={{ color: '#1C1917' }}
                    >
                      {processTabs[activeProcessTab].title}
                    </h3>
                    <p
                      className="mb-8 max-w-lg"
                      style={{
                        fontSize: 15,
                        color: '#78716C',
                        lineHeight: 1.7,
                      }}
                    >
                      {processTabs[activeProcessTab].description}
                    </p>
                    <ProcessTabVisual index={activeProcessTab} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5: PRICING                                          */}
      {/* ============================================================ */}
      <section
        id="pricing"
        className="relative z-10"
        style={{
          background: 'linear-gradient(180deg, #FFF1F2 0%, #FEF3C7 40%, #FDE68A 70%, #FECACA 100%)',
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center font-bold mb-4"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: '#1C1917',
              }}
            >
              Pricing Plans
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center mx-auto mb-12 max-w-[600px]"
              style={{ fontSize: 16, color: '#78716C', lineHeight: 1.7 }}
            >
              Choose the plan that fits your organization&apos;s transformation needs. Scale as you grow.
            </motion.p>

            {/* Two cards side by side */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              {/* Starter */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border p-8"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7E5E4',
                }}
              >
                <PricingCard plan={pricingPlans.starter} variant="light" />
              </motion.div>

              {/* Enterprise */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border p-8"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7E5E4',
                }}
              >
                <PricingCard plan={pricingPlans.enterprise} variant="light" />
              </motion.div>
            </motion.div>

            {/* Professional - featured dark card */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
              style={{ backgroundColor: '#1C1917' }}
            >
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#FFFFFF', color: '#1C1917' }}
              >
                Most Popular
              </div>
              <PricingCard plan={pricingPlans.professional} variant="dark" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6: TESTIMONIALS                                     */}
      {/* ============================================================ */}
      <section
        className="relative z-10"
        style={{
          background: 'linear-gradient(180deg, #FECACA 0%, #FFF7ED 30%, #FFFFFF 100%)',
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center font-bold mb-8"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: '#1C1917',
              }}
            >
              What Our Clients Say
            </motion.h2>

            {/* Avatar cluster */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex items-center mb-8"
            >
              <div className="flex -space-x-3">
                {['M', 'S', 'A', 'J'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: ['#E7E5E4', '#D6D3D1', '#C4C0BD', '#B5B1AD'][i],
                      color: '#78716C',
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <span className="ml-3 text-sm" style={{ color: '#A8A29E' }}>
                200+ organizations transformed
              </span>
            </motion.div>

            {/* Testimonial card */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="max-w-[700px] w-full rounded-2xl border p-8 md:p-10"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-4 h-4"
                    style={{
                      color: s <= 4 ? '#F59E0B' : '#E7E5E4',
                      fill: s <= 4 ? '#F59E0B' : 'none',
                    }}
                  />
                ))}
                <span className="ml-2 text-sm font-medium" style={{ color: '#78716C' }}>
                  4.9
                </span>
              </div>

              <blockquote
                className="font-semibold mb-4"
                style={{
                  fontSize: 'clamp(18px, 2.5vw, 22px)',
                  color: '#1C1917',
                  lineHeight: 1.4,
                }}
              >
                &ldquo;Our transformation journey finally has structure. Taurus gave us
                the clarity and confidence to move forward with our AI strategy
                across the entire organization.&rdquo;
              </blockquote>

              <p
                className="mb-6"
                style={{ fontSize: 15, color: '#78716C', lineHeight: 1.7 }}
              >
                The AI insights helped us identify $1.2M in operational savings
                within the first 90 days. The roadmap generation feature alone saved
                our strategy team hundreds of hours of manual work.
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ backgroundColor: '#F5F5F4', color: '#1C1917' }}
                >
                  MR
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                    Michael R.
                  </p>
                  <p className="text-xs" style={{ color: '#A8A29E' }}>
                    Chief Digital Officer, Global Enterprises
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 7: CTA BANNER                                       */}
      {/* ============================================================ */}
      <section
        className="relative z-10"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF9F0 100%)',
          paddingTop: 0,
          paddingBottom: 100,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-10 md:p-16 text-center"
              style={{
                background:
                  'linear-gradient(135deg, #FEF3C7, #FECACA, #FDE68A)',
              }}
            >
              <h2
                className="font-bold mb-4"
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  color: '#1C1917',
                }}
              >
                Ready to Transform Your Organization?
              </h2>
              <p
                className="mx-auto mb-8 max-w-[500px]"
                style={{ fontSize: 16, color: '#78716C', lineHeight: 1.7 }}
              >
                Join hundreds of forward-thinking organizations already using
                Taurus to accelerate their AI transformation journey.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-white font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundColor: '#1C1917',
                    height: 48,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontSize: 15,
                  }}
                >
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center font-medium rounded-full border transition-all hover:bg-white/50"
                  style={{
                    color: '#1C1917',
                    borderColor: '#A8A29E',
                    height: 48,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontSize: 15,
                  }}
                >
                  Contact Sales
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 8: FOOTER                                           */}
      {/* ============================================================ */}
      <footer
        className="relative z-10"
        style={{
          background: 'linear-gradient(180deg, #FEF9F0 0%, #FFFFFF 30%, #FFFFFF 100%)',
          paddingTop: 64,
          paddingBottom: 48,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <Link
              href="/"
              className="text-[20px] font-bold tracking-tight mb-4 sm:mb-0"
              style={{ color: '#1C1917' }}
            >
              Taurus
            </Link>
            <div className="flex items-center gap-3">
              {[
                { icon: AtSign, href: '#', label: 'Twitter' },
                { icon: Link2, href: '#', label: 'LinkedIn' },
                { icon: GitBranch, href: '#', label: 'GitHub' },
                { icon: Mail, href: '#', label: 'Email' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:bg-[#F5F5F4]"
                  style={{ borderColor: '#E7E5E4' }}
                >
                  <social.icon className="w-4 h-4" style={{ color: '#78716C' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-8" style={{ backgroundColor: '#E7E5E4' }} />

          {/* 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Newsletter */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: '#1C1917' }}
              >
                Stay Updated
              </h4>
              <p className="text-sm mb-4" style={{ color: '#78716C' }}>
                Get the latest insights on AI transformation delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-9 px-3 text-sm rounded-lg border outline-none focus:border-[#1C1917] transition-colors"
                  style={{
                    borderColor: '#E7E5E4',
                    backgroundColor: '#FFFFFF',
                    minWidth: 0,
                  }}
                />
                <button
                  className="h-9 px-4 text-sm font-medium text-white rounded-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                  style={{ backgroundColor: '#1C1917' }}
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: '#1C1917' }}
              >
                Product
              </h4>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'Integrations', 'Changelog', 'Documentation'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors hover:text-[#1C1917]"
                        style={{ color: '#78716C' }}
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: '#1C1917' }}
              >
                Company
              </h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact', 'Partners'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors hover:text-[#1C1917]"
                        style={{ color: '#78716C' }}
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: '#1C1917' }}
              >
                Legal
              </h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors hover:text-[#1C1917]"
                        style={{ color: '#78716C' }}
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Watermark */}
          <div className="relative overflow-hidden mb-8">
            <p
              className="text-center font-bold select-none"
              style={{
                fontSize: 'clamp(120px, 15vw, 220px)',
                color: '#F5F5F4',
                lineHeight: 1,
              }}
            >
              TAURUS
            </p>
          </div>

          {/* Bottom copyright */}
          <div className="h-px mb-6" style={{ backgroundColor: '#E7E5E4' }} />
          <p className="text-center text-sm" style={{ color: '#A8A29E' }}>
            &copy; 2026 MARQAIT AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  FEATURE TAB VISUAL COMPONENT                                       */
/* ================================================================== */
function FeatureTabVisual({ index }: { index: number }) {
  const visuals = [
    /* 0: AI Assessment */
    <div
      key="assessment"
      className="rounded-xl border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <Target className="w-4 h-4" style={{ color: '#1C1917' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            AI Readiness Score
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            Overall Assessment
          </p>
        </div>
      </div>
      {[
        { label: 'Data Infrastructure', value: 72 },
        { label: 'Talent & Skills', value: 58 },
        { label: 'Strategic Alignment', value: 85 },
        { label: 'Technology Stack', value: 64 },
        { label: 'Culture & Change', value: 45 },
      ].map((item) => (
        <div key={item.label} className="mb-3 last:mb-0">
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: '#78716C' }}>
              {item.label}
            </span>
            <span className="text-xs font-medium" style={{ color: '#1C1917' }}>
              {item.value}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: '#F5F5F4' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${item.value}%`,
                backgroundColor:
                  item.value >= 70
                    ? '#0D9488'
                    : item.value >= 50
                    ? '#F59E0B'
                    : '#EF4444',
              }}
            />
          </div>
        </div>
      ))}
    </div>,

    /* 1: Industry Analysis */
    <div
      key="industry"
      className="rounded-xl border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: '#1C1917' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Industry Intelligence
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            Competitive Landscape
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Market Position', value: 'Top 20%', color: '#0D9488' },
          { label: 'AI Adoption Rate', value: '67%', color: '#F59E0B' },
          { label: 'Growth Potential', value: 'High', color: '#0D9488' },
          { label: 'Risk Level', value: 'Medium', color: '#F59E0B' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-3 border"
            style={{ borderColor: '#E7E5E4' }}
          >
            <p className="text-xs mb-1" style={{ color: '#A8A29E' }}>
              {stat.label}
            </p>
            <p className="text-sm font-semibold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 h-20">
        {[40, 55, 35, 70, 60, 80, 75, 90, 65, 85, 95, 78].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              backgroundColor: i >= 9 ? '#0D9488' : '#E7E5E4',
            }}
          />
        ))}
      </div>
    </div>,

    /* 2: Roadmap Generation */
    <div
      key="roadmap"
      className="rounded-xl border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <Map className="w-4 h-4" style={{ color: '#1C1917' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Transformation Roadmap
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            Q1 2026 - Q4 2026
          </p>
        </div>
      </div>
      {[
        { phase: 'Phase 1', title: 'Foundation', status: 'Completed', pct: 100 },
        { phase: 'Phase 2', title: 'Pilot Programs', status: 'In Progress', pct: 65 },
        { phase: 'Phase 3', title: 'Scale & Optimize', status: 'Upcoming', pct: 0 },
        { phase: 'Phase 4', title: 'Enterprise Rollout', status: 'Planned', pct: 0 },
      ].map((item) => (
        <div
          key={item.phase}
          className="flex items-center gap-3 p-3 rounded-lg mb-2 last:mb-0"
          style={{
            backgroundColor: item.pct === 100 ? '#F0FDFA' : item.pct > 0 ? '#FFFBEB' : '#F5F5F4',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              backgroundColor: item.pct === 100 ? '#0D9488' : item.pct > 0 ? '#F59E0B' : '#A8A29E',
              color: '#FFFFFF',
            }}
          >
            {item.pct === 100 ? <Check className="w-3.5 h-3.5" /> : item.phase.slice(-1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: '#1C1917' }}>
              {item.title}
            </p>
            <p className="text-[11px]" style={{ color: '#A8A29E' }}>
              {item.status}
            </p>
          </div>
          {item.pct > 0 && item.pct < 100 && (
            <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>
              {item.pct}%
            </span>
          )}
        </div>
      ))}
    </div>,

    /* 3: Implementation */
    <div
      key="implementation"
      className="rounded-xl border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <LayoutDashboard className="w-4 h-4" style={{ color: '#1C1917' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Implementation Dashboard
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            Active Workstreams
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Completed', count: 24, color: '#0D9488' },
          { label: 'In Progress', count: 12, color: '#F59E0B' },
          { label: 'Pending', count: 8, color: '#A8A29E' },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F5F5F4' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.count}
            </p>
            <p className="text-[11px]" style={{ color: '#A8A29E' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
      {[
        { task: 'Data pipeline setup', assignee: 'JK', done: true },
        { task: 'ML model training', assignee: 'SR', done: false },
        { task: 'API integration', assignee: 'MT', done: false },
      ].map((task) => (
        <div
          key={task.task}
          className="flex items-center gap-3 p-2.5 rounded-lg mb-2 last:mb-0 border"
          style={{ borderColor: '#E7E5E4' }}
        >
          <div
            className="w-5 h-5 rounded border flex items-center justify-center shrink-0"
            style={{
              borderColor: task.done ? '#0D9488' : '#E7E5E4',
              backgroundColor: task.done ? '#0D9488' : 'transparent',
            }}
          >
            {task.done && <Check className="w-3 h-3 text-white" />}
          </div>
          <span
            className="text-xs flex-1"
            style={{
              color: task.done ? '#A8A29E' : '#1C1917',
              textDecoration: task.done ? 'line-through' : 'none',
            }}
          >
            {task.task}
          </span>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
            style={{ backgroundColor: '#F5F5F4', color: '#78716C' }}
          >
            {task.assignee}
          </div>
        </div>
      ))}
    </div>,

    /* 4: Progress Tracking */
    <div
      key="progress"
      className="rounded-xl border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <Activity className="w-4 h-4" style={{ color: '#1C1917' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Progress Analytics
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            Real-time Dashboard
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Overall Progress', value: '73%' },
          { label: 'ROI Achieved', value: '$1.2M' },
          { label: 'Tasks Completed', value: '156' },
          { label: 'Team Velocity', value: '+24%' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-3 rounded-lg"
            style={{ backgroundColor: '#F5F5F4' }}
          >
            <p className="text-[11px] mb-0.5" style={{ color: '#A8A29E' }}>
              {kpi.label}
            </p>
            <p className="text-lg font-bold" style={{ color: '#1C1917' }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-[2px] h-16">
        {[30, 45, 38, 52, 48, 60, 55, 65, 70, 62, 75, 73].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              backgroundColor: '#0D9488',
              opacity: 0.3 + (i / 12) * 0.7,
            }}
          />
        ))}
      </div>
    </div>,

    /* 5: Team Management */
    <div
      key="team"
      className="rounded-xl border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <Users className="w-4 h-4" style={{ color: '#1C1917' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Team Workspace
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            12 Active Members
          </p>
        </div>
      </div>
      {[
        { name: 'Sarah Kim', role: 'Project Lead', status: 'Online', initials: 'SK' },
        { name: 'James Wu', role: 'Data Engineer', status: 'Online', initials: 'JW' },
        { name: 'Maria Torres', role: 'ML Engineer', status: 'Away', initials: 'MT' },
        { name: 'Alex Chen', role: 'Strategy Analyst', status: 'Offline', initials: 'AC' },
      ].map((member) => (
        <div
          key={member.name}
          className="flex items-center gap-3 p-2.5 rounded-lg mb-2 last:mb-0"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium relative"
            style={{ backgroundColor: '#E7E5E4', color: '#1C1917' }}
          >
            {member.initials}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#F5F5F4]"
              style={{
                backgroundColor:
                  member.status === 'Online'
                    ? '#0D9488'
                    : member.status === 'Away'
                    ? '#F59E0B'
                    : '#A8A29E',
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: '#1C1917' }}>
              {member.name}
            </p>
            <p className="text-[11px]" style={{ color: '#A8A29E' }}>
              {member.role}
            </p>
          </div>
        </div>
      ))}
    </div>,
  ];

  return visuals[index] || visuals[0];
}

/* ================================================================== */
/*  PROCESS TAB VISUAL COMPONENT                                       */
/* ================================================================== */
function ProcessTabVisual({ index }: { index: number }) {
  const visuals = [
    /* 0: Discover - Chat interface mockup */
    <div
      key="discover"
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#E7E5E4' }}
    >
      <div
        className="h-10 flex items-center px-4 border-b"
        style={{ backgroundColor: '#FAFAF9', borderColor: '#E7E5E4' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" style={{ color: '#A8A29E' }} />
          <span className="text-xs font-medium" style={{ color: '#1C1917' }}>
            Discovery Session
          </span>
        </div>
      </div>
      <div className="p-5 space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
        {/* AI message */}
        <div className="flex gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1C1917' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#F5F5F4', color: '#1C1917' }}>
            What are your primary business objectives for AI transformation?
          </div>
        </div>
        {/* User message */}
        <div className="flex gap-3 justify-end">
          <div className="rounded-xl px-4 py-3 text-sm text-white" style={{ backgroundColor: '#1C1917' }}>
            We want to automate our customer service and improve data analytics capabilities.
          </div>
        </div>
        {/* AI response */}
        <div className="flex gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1C1917' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#F5F5F4', color: '#1C1917' }}>
            Great goals. I&apos;ve identified 3 key areas for assessment. Let me analyze your current infrastructure...
          </div>
        </div>
        {/* Input */}
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
          style={{ borderColor: '#E7E5E4' }}
        >
          <span className="text-sm" style={{ color: '#A8A29E' }}>
            Type your response...
          </span>
        </div>
      </div>
    </div>,

    /* 1: Strategize - Questionnaire mockup */
    <div
      key="strategize"
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#E7E5E4' }}
    >
      <div
        className="h-10 flex items-center px-4 border-b"
        style={{ backgroundColor: '#FAFAF9', borderColor: '#E7E5E4' }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5" style={{ color: '#A8A29E' }} />
          <span className="text-xs font-medium" style={{ color: '#1C1917' }}>
            Strategic Assessment
          </span>
        </div>
        <span className="ml-auto text-[11px] font-medium" style={{ color: '#0D9488' }}>
          3 of 8
        </span>
      </div>
      <div className="p-5" style={{ backgroundColor: '#FFFFFF' }}>
        <p className="text-sm font-semibold mb-4" style={{ color: '#1C1917' }}>
          How would you rate your current data infrastructure?
        </p>
        {[
          { label: 'Enterprise-grade, fully modernized', selected: false },
          { label: 'Mostly modern with some legacy systems', selected: true },
          { label: 'Predominantly legacy infrastructure', selected: false },
          { label: 'Just beginning infrastructure modernization', selected: false },
        ].map((opt) => (
          <div
            key={opt.label}
            className="flex items-center gap-3 p-3 rounded-lg mb-2 border cursor-pointer"
            style={{
              borderColor: opt.selected ? '#1C1917' : '#E7E5E4',
              backgroundColor: opt.selected ? '#FAFAF9' : '#FFFFFF',
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{
                borderColor: opt.selected ? '#1C1917' : '#D6D3D1',
              }}
            >
              {opt.selected && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#1C1917' }}
                />
              )}
            </div>
            <span className="text-sm" style={{ color: '#1C1917' }}>
              {opt.label}
            </span>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button
            className="h-9 px-4 rounded-lg border text-sm font-medium"
            style={{ borderColor: '#E7E5E4', color: '#78716C' }}
          >
            Back
          </button>
          <button
            className="h-9 px-4 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#1C1917' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>,

    /* 2: Quantify - Report card mockup */
    <div
      key="quantify"
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#E7E5E4' }}
    >
      <div
        className="h-10 flex items-center px-4 border-b"
        style={{ backgroundColor: '#FAFAF9', borderColor: '#E7E5E4' }}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" style={{ color: '#A8A29E' }} />
          <span className="text-xs font-medium" style={{ color: '#1C1917' }}>
            Readiness Report
          </span>
        </div>
      </div>
      <div className="p-5" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center mb-5">
          <p className="text-sm mb-2" style={{ color: '#A8A29E' }}>
            Overall AI Readiness
          </p>
          <div className="relative inline-flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#E7E5E4"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${58 * 3.14} ${100 * 3.14}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: '#1C1917' }}>
                58
              </span>
              <span className="text-[11px]" style={{ color: '#A8A29E' }}>
                /100
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Data Readiness', score: '72/100', color: '#0D9488' },
            { label: 'Team Skills', score: '45/100', color: '#EF4444' },
            { label: 'Infrastructure', score: '64/100', color: '#F59E0B' },
            { label: 'Strategy', score: '51/100', color: '#F59E0B' },
          ].map((dim) => (
            <div
              key={dim.label}
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#F5F5F4' }}
            >
              <p className="text-[11px] mb-0.5" style={{ color: '#A8A29E' }}>
                {dim.label}
              </p>
              <p className="text-sm font-bold" style={{ color: dim.color }}>
                {dim.score}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>,

    /* 3: Transform - Kanban board mockup */
    <div
      key="transform"
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#E7E5E4' }}
    >
      <div
        className="h-10 flex items-center px-4 border-b"
        style={{ backgroundColor: '#FAFAF9', borderColor: '#E7E5E4' }}
      >
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-3.5 h-3.5" style={{ color: '#A8A29E' }} />
          <span className="text-xs font-medium" style={{ color: '#1C1917' }}>
            Implementation Board
          </span>
        </div>
      </div>
      <div
        className="p-4 grid grid-cols-3 gap-3"
        style={{ backgroundColor: '#FAFAF9' }}
      >
        {/* To Do column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A8A29E' }} />
            <span className="text-xs font-medium" style={{ color: '#78716C' }}>
              To Do
            </span>
            <span className="text-[10px] px-1.5 rounded-full" style={{ backgroundColor: '#E7E5E4', color: '#78716C' }}>
              3
            </span>
          </div>
          {['API integration', 'User testing', 'Documentation'].map((task) => (
            <div
              key={task}
              className="p-2.5 rounded-lg border mb-2 text-xs"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                color: '#1C1917',
              }}
            >
              {task}
            </div>
          ))}
        </div>
        {/* In Progress column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
            <span className="text-xs font-medium" style={{ color: '#78716C' }}>
              In Progress
            </span>
            <span className="text-[10px] px-1.5 rounded-full" style={{ backgroundColor: '#E7E5E4', color: '#78716C' }}>
              2
            </span>
          </div>
          {['ML model training', 'Data pipeline'].map((task) => (
            <div
              key={task}
              className="p-2.5 rounded-lg border mb-2 text-xs"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                color: '#1C1917',
              }}
            >
              {task}
            </div>
          ))}
        </div>
        {/* Done column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0D9488' }} />
            <span className="text-xs font-medium" style={{ color: '#78716C' }}>
              Done
            </span>
            <span className="text-[10px] px-1.5 rounded-full" style={{ backgroundColor: '#E7E5E4', color: '#78716C' }}>
              4
            </span>
          </div>
          {['Infrastructure setup', 'Team onboarding'].map((task) => (
            <div
              key={task}
              className="p-2.5 rounded-lg border mb-2 text-xs"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                color: '#1C1917',
              }}
            >
              <span style={{ textDecoration: 'line-through', color: '#A8A29E' }}>
                {task}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
  ];

  return visuals[index] || visuals[0];
}

/* ================================================================== */
/*  PRICING CARD COMPONENT                                             */
/* ================================================================== */
function PricingCard({
  plan,
  variant,
}: {
  plan: (typeof pricingPlans)[keyof typeof pricingPlans];
  variant: 'light' | 'dark';
}) {
  const isDark = variant === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#1C1917';
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#78716C';

  return (
    <div className={isDark ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: textPrimary }}
        >
          {plan.name}
        </h3>
        <p className="text-sm mb-4" style={{ color: textSecondary }}>
          {plan.description}
        </p>
        <div className="flex items-baseline gap-1 mb-6">
          <span
            className="text-4xl font-bold"
            style={{ color: textPrimary }}
          >
            {plan.price}
          </span>
          <span className="text-sm" style={{ color: textSecondary }}>
            {plan.period}
          </span>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-md mb-6"
          style={{
            backgroundColor: isDark ? '#FFFFFF' : '#1C1917',
            color: isDark ? '#1C1917' : '#FFFFFF',
            height: 44,
            paddingLeft: 28,
            paddingRight: 28,
            fontSize: 14,
          }}
        >
          {plan.cta}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>

        {/* Inline testimonial */}
        <div
          className="rounded-lg p-3 mt-2"
          style={{
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : '#F5F5F4',
          }}
        >
          <p className="text-xs italic mb-1" style={{ color: textSecondary }}>
            &ldquo;{plan.testimonial.quote}&rdquo;
          </p>
          <p className="text-[11px] font-medium" style={{ color: textPrimary }}>
            {plan.testimonial.name}
            <span style={{ color: textSecondary }}> &middot; {plan.testimonial.role}</span>
          </p>
        </div>
      </div>

      <div>
        <p
          className="text-xs font-semibold uppercase mb-3"
          style={{ color: textSecondary, letterSpacing: 1 }}
        >
          What&apos;s included
        </p>
        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <CircleCheck
                className="w-4 h-4 shrink-0"
                style={{ color: '#0D9488' }}
              />
              <span className="text-sm" style={{ color: textPrimary }}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
