import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import {
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  UploadCloud,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Flame
} from 'lucide-react';

export default function SectionB() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId =
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id');

  const [topics, setTopics] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Phases: 'prep' (90s) -> 'speak' (60s)
  const [phase, setPhase] = useState('prep');
  const [timeLeft, setTimeLeft] = useState(90);
  const [showHints, setShowHints] = useState(true);
  const [recordingDone, setRecordingDone] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [tabSwitches, setTabSwitches] = useState(0);

  const { isRecording, startRecording, stopRecording, clearAudio } = useAudioRecorder();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/assessment');
    }
  }, [sessionId, navigate]);

  // Load Section B topics
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const res = await assessmentApi.getSection(sessionId, 'B');
        setTopics(res.data || []);
      } catch (err) {
        console.error('Error fetching Section B topics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchTopics();
    }
  }, [sessionId]);

  // Proctoring tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        const warningText = `Tab switch detected at ${new Date().toLocaleTimeString()}! Stay on this page.`;
        setWarnings((prev) => [...prev, warningText]);

        if (sessionId) {
          assessmentApi.recordTabSwitch(sessionId, { reason: 'Section B tab switch' }).catch((e) =>
            console.error('Failed to log tab switch:', e)
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId]);

  const currentTopic = topics[currentIdx] || null;

  // Reset phase and timer on topic change
  useEffect(() => {
    if (!currentTopic) return;

    setPhase('prep');
    setTimeLeft(90);
    setRecordingDone(false);
    setShowHints(true);
    clearAudio();
  }, [currentIdx, currentTopic, clearAudio]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      // Time expired for current phase
      if (phase === 'prep') {
        // Transition to speaking phase
        setPhase('speak');
        setTimeLeft(60);
      } else if (phase === 'speak') {
        // Stop recording if running
        if (isRecording) {
          handleStopAndSubmit();
        }
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, phase, isRecording]);

  const handleStartSpeakingNow = () => {
    setPhase('speak');
    setTimeLeft(60);
  };

  const handleStartRecord = async () => {
    await startRecording();
  };

  const handleStopAndSubmit = async () => {
    const blob = await stopRecording();
    if (blob && currentTopic) {
      await uploadRecording(blob, currentTopic.id);
    }
  };

  const uploadRecording = async (blob, itemId) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('item_id', itemId);
      formData.append('file', blob, `${itemId}.webm`);

      await assessmentApi.uploadAudio(sessionId, formData);
      setRecordingDone(true);
    } catch (err) {
      console.error('Error uploading speaking recording:', err);
      setWarnings((prev) => [...prev, '⚠️ Speech upload failed. Please try again.']);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < topics.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      navigate('/assessment/section-c', { state: { sessionId } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium text-sm">Loading Section B topics...</p>
        </div>
      </div>
    );
  }

  if (!currentTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-2xl border border-slate-200">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-slate-700 font-semibold">No topics found for Section B.</p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold"
          >
            Return to Assessment Intro
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIdx + 1) / topics.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg">
                🅱️ Section B
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                phase === 'prep'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              }`}>
                {phase === 'prep' ? '⏳ Preparation Phase' : '🎙️ Speaking Phase'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Spoken Monologue Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Topic {currentIdx + 1} of {topics.length} ({topics.length - (currentIdx + 1)} remaining)
            </p>
          </div>

          {/* Phase Countdown Timer */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-mono font-bold text-sm flex items-center gap-2 ${
              phase === 'speak'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{phase === 'prep' ? `Prep: ${timeLeft}s` : `Speak: ${timeLeft}s`}</span>
            </div>

            {tabSwitches > 0 && (
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{tabSwitches} Warning{tabSwitches > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Proctoring Alerts */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
            {warnings.slice(-2).map((w, idx) => (
              <div key={idx} className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Topic Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">

          {/* Phase Banner */}
          <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
            phase === 'prep'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span>
              {phase === 'prep'
                ? '🧠 Preparation Phase (90s): Think through your response and structure your key points.'
                : '🎙️ Speaking Phase (60s): Deliver your speech clearly. Audio is being recorded.'}
            </span>

            {phase === 'prep' && (
              <button
                type="button"
                onClick={handleStartSpeakingNow}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shrink-0 ml-3"
              >
                Start Speaking Now →
              </button>
            )}
          </div>

          {/* Topic Title */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topic Prompt
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentTopic.prompt_text}
            </h2>
          </div>

          {/* Collapsible Hints Panel */}
          {currentTopic.hints && currentTopic.hints.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Guiding Prompts & Structure Hints</span>
                </div>
                {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHints && (
                <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  {currentTopic.hints.map((hint, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-5 h-5 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Speaking Phase Recording Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {phase === 'prep' ? (
                <span className="text-xs font-semibold text-slate-500 italic">
                  Microphone will activate when the 90s prep phase concludes.
                </span>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartRecord}
                      disabled={recordingDone || isUploading}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{recordingDone ? 'Speech Saved ✓' : 'Start Recording Speech'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopAndSubmit}
                      className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition flex items-center gap-2 animate-pulse shadow-sm"
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-1" />
                      <span>Stop & Submit Speech</span>
                    </button>
                  )}
                </>
              )}

              {isUploading && (
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 animate-bounce" />
                  Uploading speech...
                </span>
              )}

              {recordingDone && !isUploading && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Speech recorded & saved
                </span>
              )}
            </div>

            {/* Next Topic Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!recordingDone && !isUploading}
              className="w-full sm:w-auto px-7 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <span>{currentIdx < topics.length - 1 ? 'Next Topic' : 'Proceed to Section C (Grammar)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
