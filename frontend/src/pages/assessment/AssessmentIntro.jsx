import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Mic,
  MicOff,
  BookOpen,
  Volume2,
  HelpCircle,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export const AssessmentIntro = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [isCheckingMic, setIsCheckingMic] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Check microphone permissions
  const checkMicrophone = async () => {
    setIsCheckingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      stream.getTracks().forEach((t) => t.stop());
      addToast('Microphone access verified! 🎙️', 'success');
    } catch (err) {
      console.warn('Microphone permission error:', err);
      setHasMicPermission(false);
      addToast('Microphone access required for speech tasks. Please allow access.', 'error');
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
    if (hasMicPermission === false) {
      addToast('Please enable microphone access before proceeding.', 'error');
      return;
    }

    setIsStarting(true);
    try {
      const res = await assessmentApi.start();
      const session = res.data;
      // Store active session ID for cross-section navigation
      sessionStorage.setItem('bg_assessment_session_id', session.session_id);
      addToast('Assessment started! Good luck with Section A.', 'info');
      navigate('/assessment/section-a', { state: { sessionId: session.session_id } });
    } catch (err) {
      console.error('Failed to start assessment session:', err);
      addToast('Could not initialize assessment. Please verify your connection.', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const sectionsOverview = [
    {
      badge: 'Section A',
      title: 'Reading & Listening',
      accent: 'border-brain-500/40 bg-brain-950/40 text-brain-300',
      icon: BookOpen,
      items: '18 Read-Aloud + 5 Listen-Repeat',
      time: '~10 Mins',
      desc: 'Read sentences aloud under timed prompts, then listen to one-time audio clips and repeat.',
    },
    {
      badge: 'Section B',
      title: 'Speaking Tasks',
      accent: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
      icon: Mic,
      items: '4 Open Speaking Topics',
      time: '~10 Mins',
      desc: '90 seconds of silent thought and planning with guided hints, followed by 60 seconds of speaking.',
    },
    {
      badge: 'Section C',
      title: 'Grammar Accuracy',
      accent: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
      icon: HelpCircle,
      items: '34 Multiple-Choice Items',
      time: 'Untimed',
      desc: 'Test your grasp across Verb Forms, Tenses, Articles, Voice Change, and Sentence Agreement.',
    },
    {
      badge: 'Section D',
      title: 'Listening Comprehension',
      accent: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
      icon: Headphones,
      items: '4 Passages + 16 Questions',
      time: '~12 Mins',
      desc: 'Listen to each audio passage once. Questions reveal after playback completes.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brain-950/80 to-slate-900 border border-brain-500/30 p-8 shadow-2xl shadow-brain-950/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brain-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brain-500/20 border border-brain-500/40 text-brain-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive 4-Section Assessment
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              English Language & Cognitive Flow Assessment
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Calibrate your speech fluency, listening comprehension, grammar precision, and working memory
              rhythms in an integrated, ADHD-friendly testing flow.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 w-full md:w-auto bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Clock className="w-4 h-4 text-brain-400" />
              <span>Est. Duration: ~35–40 mins</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-focus-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Proctored Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring & Non-Clinical Framing Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-calm-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-brain-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Integrity & Proctoring Guidelines</span>
          </div>
          <p>
            Please remain on this browser tab throughout the assessment. Tab-switching and window minimizations
            are monitored and logged to ensure authentic results.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-calm-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Educational Calibration Disclaimer</span>
          </div>
          <p>
            This assessment measures educational study pacing, reading stamina, and working memory recall.
            It is <strong>not a medical or clinical diagnosis</strong> for ADHD or any other condition.
          </p>
        </div>
      </div>

      {/* 4 Sections Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-brain-400" />
          <span>Assessment Structure</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sectionsOverview.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between p-6 rounded-2xl bg-calm-900/80 border border-slate-800/80 hover:border-brain-500/40 transition-all duration-200 group shadow-lg shadow-black/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${sec.accent}`}
                    >
                      {sec.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {sec.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-brain-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-brain-300 transition-colors">
                        {sec.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{sec.items}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{sec.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Flight Checklist & Start Action */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brain-950/60 to-slate-900 border border-brain-500/40 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-brain-400" />
              <span>Microphone Hardware Check</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sections A and B require audio recording permissions to capture your speech.
            </p>
          </div>

          <button
            onClick={checkMicrophone}
            disabled={isCheckingMic}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              hasMicPermission
                ? 'bg-focus-500/20 border border-focus-500/40 text-focus-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {hasMicPermission ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-focus-400" />
                <span>Microphone Ready</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-brain-400" />
                <span>{isCheckingMic ? 'Checking...' : 'Test Microphone'}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-focus-400 flex-shrink-0" />
            <span>Your progress will be automatically saved across all four sections.</span>
          </div>

          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brain-600 to-indigo-600 hover:from-brain-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brain-900/40 hover:shadow-brain-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isStarting ? 'Initializing Session...' : 'Begin Section A'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentIntro;
