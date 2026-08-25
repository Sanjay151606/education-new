import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  Volume2,
  BookOpen,
  HelpCircle,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Sparkles,
  Info,
  Layers
} from 'lucide-react';

export default function AssessmentIntro() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [candidateName, setCandidateName] = useState(user?.full_name || 'John Doe');
  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [isCheckingMic, setIsCheckingMic] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.full_name) {
      setCandidateName(user.full_name);
    }
  }, [user]);

  // Check microphone permissions
  const checkMicrophone = async () => {
    setIsCheckingMic(true);
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.warn('Microphone permission error:', err);
      setHasMicPermission(false);
      setErrorMsg('Microphone access is required for Sections A and B. Please grant permission in your browser.');
    } finally {
      setIsCheckingMic(false);
    }
  };

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' })
        .then((res) => {
          if (res.state === 'granted') setHasMicPermission(true);
        })
        .catch(() => {});
    }
  }, []);

  const handleStart = async () => {
    if (!candidateName.trim()) {
      setErrorMsg('Please enter candidate name before starting.');
      return;
    }

    setIsStarting(true);
    setErrorMsg('');
    try {
      const res = await assessmentApi.start({ candidate_name: candidateName.trim() });
      const session = res.data;
      
      // Store session data in sessionStorage
      sessionStorage.setItem('bg_assessment_session_id', session.session_id);
      sessionStorage.setItem('bg_assessment_candidate_name', session.candidate_name || candidateName.trim());
      sessionStorage.setItem('bg_assessment_section_a_items', JSON.stringify(session.items || []));

      navigate('/assessment/section-a', { state: { sessionId: session.session_id } });
    } catch (err) {
      console.error('Failed to start assessment session:', err);
      setErrorMsg('Could not initialize assessment session. Please verify your connection.');
    } finally {
      setIsStarting(false);
    }
  };

  const sectionsOverview = [
    {
      badge: '🅰️ Section A',
      title: 'Reading & Listening',
      color: 'border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-blue-900',
      badgeColor: 'bg-blue-600 text-white',
      icon: BookOpen,
      count: '23 Questions',
      items: '18 Read-Aloud + 5 Listen-Repeat',
      time: '~15 Mins',
      desc: 'Read sentences aloud under timed prompts, then listen to single-play audio sentences and repeat.',
    },
    {
      badge: '🅱️ Section B',
      title: 'Speaking Tasks',
      color: 'border-amber-200 bg-amber-50/70 hover:bg-amber-50 text-amber-900',
      badgeColor: 'bg-amber-600 text-white',
      icon: Mic,
      count: '4 Topics',
      items: '4 Open-Ended Speaking Topics',
      time: '~10 Mins',
      desc: '90 seconds of silent preparation with hint prompts, followed by 60 seconds of recorded speaking.',
    },
    {
      badge: '🅾️ Section C',
      title: 'Grammar Accuracy',
      color: 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900',
      badgeColor: 'bg-emerald-600 text-white',
      icon: HelpCircle,
      count: '34 Questions',
      items: 'Verb Forms, Tenses, Articles & Voice',
      time: '~20 Mins',
      desc: 'Multiple-choice questions testing core syntactic patterns, tenses, prepositions, and sentence correction.',
    },
    {
      badge: '🅳 Section D',
      title: 'Listening Comprehension',
      color: 'border-purple-200 bg-purple-50/70 hover:bg-purple-50 text-purple-900',
      badgeColor: 'bg-purple-600 text-white',
      icon: Headphones,
      count: '16 Questions',
      items: '4 Passages (4 MCQs each)',
      time: '~20 Mins',
      desc: 'Listen to full audio passages played once without pause/rewind. Questions unlock only after listening.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brain-50 text-brain-600 border border-brain-100">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive English Proficiency Test
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Comprehensive English Assessment
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
                A structured 4-section assessment evaluating spoken fluency, speech repetition, grammar accuracy, and listening comprehension.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex sm:flex-col gap-3 justify-center bg-slate-50 border border-slate-200/80 rounded-xl p-4 min-w-[200px]">
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-brain-500" />
                <span><strong>60–90 min</strong> total duration</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span><strong>77 Questions</strong> across 4 sections</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span><strong>Proctored</strong> tab & mic tracking</span>
              </div>
            </div>
          </div>

          {/* Candidate Name Input */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="candidate_name" className="block text-sm font-semibold text-slate-700 mb-1">
                Candidate Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="candidate_name"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter full name for certificate & results"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brain-500 font-medium"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={checkMicrophone}
                disabled={isCheckingMic}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition ${
                  hasMicPermission
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                <Mic className={`w-4 h-4 ${hasMicPermission ? 'text-emerald-600' : 'text-slate-500'}`} />
                {isCheckingMic
                  ? 'Testing Mic...'
                  : hasMicPermission
                  ? 'Mic Verified ✓'
                  : 'Test Microphone'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 4 Sections Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>Assessment Sections Overview</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionsOverview.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${sec.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${sec.badgeColor}`}>
                        {sec.badge}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600">
                        {sec.time}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{sec.title}</h3>
                      <p className="text-xs font-semibold opacity-75 mt-0.5">{sec.items}</p>
                    </div>

                    <p className="text-xs leading-relaxed opacity-90">{sec.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold">
                    <span>{sec.count}</span>
                    <span className="text-slate-500">Audio/Response Saved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Info className="w-5 h-5 text-brain-600" />
            <h3>Important Instructions & Proctoring Guidelines</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Microphone Requirement:</strong> Please ensure microphone access is granted. Speak clearly into your mic during speaking questions.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Single-Play Audio:</strong> Audio clips in Sections A and D play strictly ONCE with no pause or replay available.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Tab Proctoring:</strong> Do not switch tabs or minimize your window during the test. Tab switch events are tracked and logged.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Autosaving:</strong> Answers and audio recordings are saved directly to the server as you progress through each section.</span>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-brain-600 rounded-2xl text-white shadow-md">
          <div>
            <h4 className="font-bold text-lg">Ready to begin your assessment?</h4>
            <p className="text-brain-100 text-xs sm:text-sm">Make sure you are in a quiet room with headphones or speakers ready.</p>
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={isStarting}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-brain-600 hover:bg-brain-50 font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isStarting ? (
              <span>Initializing Test...</span>
            ) : (
              <>
                <span>Start New Test</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
