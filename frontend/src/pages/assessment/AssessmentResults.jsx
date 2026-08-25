import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import {
  Trophy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  BookOpen,
  Mic,
  HelpCircle,
  Headphones,
  Sparkles,
  ArrowRight,
  RotateCcw,
  User,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function AssessmentResults() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId =
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id');

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAudioItem, setActiveAudioItem] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/assessment');
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await assessmentApi.getResults(sessionId);
        setResults(res.data);
      } catch (err) {
        console.error('Error fetching assessment results:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [sessionId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brain-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium text-sm">Compiling assessment scorecard...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Results Unavailable</h2>
          <p className="text-slate-600 text-xs">Could not locate scorecard for this assessment session.</p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-5 py-2.5 bg-brain-600 text-white rounded-xl text-xs font-bold"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const breakdown = results.per_section_breakdown || {};
  const secA = breakdown.section_a || {};
  const secB = breakdown.section_b || {};
  const secC = breakdown.section_c || {};
  const secD = breakdown.section_d || {};

  const audioUrls = results.audio_review_urls || {};
  const audioItemIds = Object.keys(audioUrls);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero Scorecard Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assessment Completed Successfully</span>
              </div>

              <h1 className="text-3xl font-black text-slate-900">
                English Proficiency Scorecard
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Candidate: {results.candidate_name || 'Candidate'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Completed on {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Auto-Graded Overall Score Pill */}
            <div className="flex flex-col items-center justify-center p-6 bg-brain-50 border-2 border-brain-100 rounded-2xl min-w-[170px] text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-brain-600">
                Auto-Graded Score
              </span>
              <span className="text-4xl font-black text-slate-900 mt-1">
                {results.auto_graded_score}%
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-1">
                (Sections C & D)
              </span>
            </div>
          </div>

          {/* AI Learning & Pacing Summary */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 bg-slate-50/70 p-5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-brain-700">
              <Sparkles className="w-4 h-4 text-brain-600" />
              <span>AI Learning & Pacing Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {results.ai_summary}
            </p>
          </div>
        </div>

        {/* 4 Section Breakdown Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Section-by-Section Performance Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Section A */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-600 text-white">
                  🅰️ Section A
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Review
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reading & Listening</h3>
                <p className="text-xs text-slate-500">18 Read Aloud + 5 Listen & Repeat items</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Audio Files Submitted:</span>
                <span className="text-blue-700 font-bold">{secA.audio_recorded || 0} / 23</span>
              </div>
            </div>

            {/* Section B */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-600 text-white">
                  🅱️ Section B
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Review
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Speaking Monologue</h3>
                <p className="text-xs text-slate-500">4 Open-ended speaking topic responses</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Speech Audio Recorded:</span>
                <span className="text-amber-700 font-bold">{secB.audio_recorded || 0} / 4</span>
              </div>
            </div>

            {/* Section C */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-600 text-white">
                  🅾️ Section C
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Auto-Graded
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Grammar Accuracy</h3>
                <p className="text-xs text-slate-500">34 Multiple-choice grammar items</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Score:</span>
                <span className="text-emerald-700 font-bold text-sm">
                  {secC.accuracy_percentage}% ({secC.correct_count} / {secC.total_count})
                </span>
              </div>
            </div>

            {/* Section D */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-600 text-white">
                  🅳 Section D
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Auto-Graded
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Listening Comprehension</h3>
                <p className="text-xs text-slate-500">4 Audio Passages + 16 Questions</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Score:</span>
                <span className="text-purple-700 font-bold text-sm">
                  {secD.accuracy_percentage}% ({secD.correct_count} / {secD.total_count})
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Proctoring Log */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              {results.tab_switch_count > 0 ? (
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              )}
              <span>Proctoring Integrity Report</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              results.tab_switch_count > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {results.tab_switch_count} Tab Switch Events Logged
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {results.tab_switch_count === 0
              ? 'Excellent proctoring compliance. No browser tab switches or window defocus events were detected.'
              : `The candidate switched browser tabs ${results.tab_switch_count} time(s) during the assessment. Timestamps have been recorded for instructor review.`}
          </p>
        </div>

        {/* Audio Recordings Review Player */}
        {audioItemIds.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Volume2 className="w-4 h-4 text-brain-600" />
              <span>Review Your Audio Submissions ({audioItemIds.length} Recordings)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {audioItemIds.map((itemId) => (
                <div
                  key={itemId}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Item: {itemId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      WebM Audio
                    </span>
                  </div>
                  <audio
                    controls
                    src={audioUrls[itemId]}
                    className="w-full h-8"
                    preload="none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/assessment')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3 bg-brain-600 hover:bg-brain-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
