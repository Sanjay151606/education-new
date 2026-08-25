import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { assessmentApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Mic,
  BookOpen,
  HelpCircle,
  Headphones,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCw,
  Sliders,
  Play,
  Volume2,
  Flame,
  LayoutDashboard,
} from 'lucide-react';

export const AssessmentResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [sessionId, setSessionId] = useState(
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id') || ''
  );
  const [results, setResults] = useState(location.state?.results || null);
  const [isLoading, setIsLoading] = useState(!location.state?.results);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // Fetch results from backend if not passed in location state
  useEffect(() => {
    const fetchResults = async () => {
      if (results) return;
      if (!sessionId) {
        navigate('/assessment');
        return;
      }

      try {
        const res = await assessmentApi.getResults(sessionId);
        setResults(res.data);
      } catch (err) {
        console.error('Failed to fetch assessment results:', err);
        addToast('Could not load assessment results.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [sessionId, results, navigate, addToast]);

  const handleApplyProfile = async () => {
    if (!results) return;
    setIsApplying(true);
    try {
      await authApi.updateProfile({
        focus_span_minutes: results.recommended_focus_span_minutes || 25,
        preferred_content_style: results.recommended_content_style || 'bullet_points',
        difficulty_level: results.recommended_difficulty_level || 'adaptive',
      });
      setApplied(true);
      addToast('ADHD Study Profile calibrated and applied! 🎯', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast('Could not update profile settings.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-brain-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Synthesizing Assessment Analytics...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No Assessment Data Found</h2>
        <p className="text-sm text-slate-400">Please start an assessment session to generate results.</p>
        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brain-600 hover:bg-brain-500 text-white font-bold text-sm"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const breakdown = results.per_section_breakdown || {};
  const audioUrls = results.audio_review_urls || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brain-950/80 to-slate-900 border border-brain-500/40 p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brain-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-focus-500/20 border border-focus-500/40 text-focus-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Assessment Completed
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Performance & Cognitive Profile Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Session ID: <span className="font-mono text-brain-300">{results.session_id}</span>
            </p>
          </div>

          {/* Auto-graded score pill */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl min-w-[180px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Auto-Graded Score
            </span>
            <div className="text-4xl font-black bg-gradient-to-r from-brain-300 via-focus-400 to-indigo-400 bg-clip-text text-transparent mt-1">
              {results.auto_graded_score}%
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Sections C & D Evaluated</span>
          </div>
        </div>

        {/* AI Plain-Language Non-Diagnostic Summary */}
        <div className="relative z-10 p-6 rounded-2xl bg-calm-950/70 border border-brain-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brain-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Study-Pacing & Momentum Synthesis</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{results.ai_summary}</p>
        </div>
      </div>

      {/* 4 Sections Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-brain-400" />
          <span>Section Performance Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Section A */}
          <div className="p-5 rounded-2xl bg-calm-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brain-500/20 text-brain-300 border border-brain-500/40">
                Section A
              </span>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                Pending Review
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reading & Listening</h3>
              <p className="text-xs text-slate-400 mt-1">
                {breakdown.section_a?.audio_recorded || 0} / {breakdown.section_a?.items_count || 23} Audio Clips Saved
              </p>
            </div>
          </div>

          {/* Section B */}
          <div className="p-5 rounded-2xl bg-calm-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Section B
              </span>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                Pending Review
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Speaking Tasks</h3>
              <p className="text-xs text-slate-400 mt-1">
                {breakdown.section_b?.audio_recorded || 0} / {breakdown.section_b?.items_count || 4} Topics Recorded
              </p>
            </div>
          </div>

          {/* Section C */}
          <div className="p-5 rounded-2xl bg-calm-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Section C
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Auto-Graded
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Grammar Accuracy</h3>
              <p className="text-xs text-slate-400 mt-1">
                {breakdown.section_c?.correct_count ?? '--'} / {breakdown.section_c?.total_count ?? 34} Correct (
                {breakdown.section_c?.accuracy_percentage ?? 0}%)
              </p>
            </div>
          </div>

          {/* Section D */}
          <div className="p-5 rounded-2xl bg-calm-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Section D
              </span>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                Auto-Graded
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Listening Comprehension</h3>
              <p className="text-xs text-slate-400 mt-1">
                {breakdown.section_d?.correct_count ?? '--'} / {breakdown.section_d?.total_count ?? 16} Correct (
                {breakdown.section_d?.accuracy_percentage ?? 0}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Log & Audio Review Player */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Recordings Review Player */}
        <div className="p-6 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-brain-400" />
              <span>Your Audio Recordings Review</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {Object.keys(audioUrls).length} Files
            </span>
          </div>

          {Object.keys(audioUrls).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No audio recordings found for this session.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {Object.entries(audioUrls).map(([itemId, storagePath]) => {
                const audioSrc = `http://localhost:8000/api/assessment/audio/${storagePath}`;
                return (
                  <div
                    key={itemId}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="font-mono text-brain-300">{itemId}</span>
                      <span className="text-[10px] text-slate-500 uppercase">Audio Capture</span>
                    </div>
                    <audio
                      controls
                      src={audioSrc}
                      className="w-full h-8 rounded-lg outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calibrated ADHD Learning Settings & Proctoring */}
        <div className="p-6 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-focus-400" />
              <span>Calibrated Study Profile</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-focus-400" />
              <span>Tab Switches: {results.tab_switch_count ?? 0}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-400">Recommended Focus Sprint:</span>
              <strong className="text-brain-300 font-bold">
                {results.recommended_focus_span_minutes || 25} Minutes
              </strong>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-400">Content Processing Style:</span>
              <strong className="text-focus-300 font-bold uppercase">
                {results.recommended_content_style?.replace('_', ' ') || 'Bullet Points'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-400">Difficulty Pacing:</span>
              <strong className="text-amber-300 font-bold uppercase">
                {results.recommended_difficulty_level || 'Adaptive'}
              </strong>
            </div>
          </div>

          <button
            onClick={handleApplyProfile}
            disabled={isApplying || applied}
            className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              applied
                ? 'bg-focus-600/20 border border-focus-500/40 text-focus-300'
                : 'bg-gradient-to-r from-focus-600 to-emerald-600 hover:from-focus-500 hover:to-emerald-500 text-white shadow-focus-900/30'
            }`}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-focus-400" />
                <span>Profile Settings Applied</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isApplying ? 'Applying Settings...' : 'Apply Calibrated Settings'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>

        <Link
          to="/focus"
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brain-600 to-indigo-600 hover:from-brain-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-brain-900/40 flex items-center justify-center gap-2 transition-all"
        >
          <span>Start a Calibrated Focus Sprint</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AssessmentResults;
