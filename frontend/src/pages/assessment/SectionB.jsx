import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useToast } from '../../context/ToastContext';
import {
  Mic,
  Square,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Volume2,
} from 'lucide-react';

export const SectionB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [sessionId, setSessionId] = useState(
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id') || ''
  );
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('prep'); // 'prep' (90s) or 'speaking' (60s)
  const [prepTimeLeft, setPrepTimeLeft] = useState(90);
  const [speakTimeLeft, setSpeakTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMap, setUploadedMap] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const prepTimerRef = useRef(null);
  const speakTimerRef = useRef(null);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const currentTopic = items[currentIndex] || null;

  // 1. Fetch Section B items on mount
  useEffect(() => {
    const fetchItems = async () => {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        navigate('/assessment');
        return;
      }

      try {
        const res = await assessmentApi.getSection(activeSessionId, 'B');
        setItems(res.data);
      } catch (err) {
        console.error('Failed to fetch Section B items:', err);
        addToast('Error loading Section B topics.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [sessionId, navigate, addToast]);

  // 2. Proctoring: Page Visibility API tab switch listener
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && sessionId) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarning(true);
        try {
          await assessmentApi.recordTabSwitch(sessionId, {
            warning_message: `Tab switch during Section B on topic ${currentIndex + 1}`,
          });
        } catch (err) {
          console.error('Failed to record tab switch:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, currentIndex]);

  // 3. Topic switch initializer: Reset to 90s prep phase
  useEffect(() => {
    if (!currentTopic) return;

    // Reset phases
    setPhase('prep');
    setPrepTimeLeft(currentTopic.display_seconds || 90);
    setSpeakTimeLeft(currentTopic.time_limit_seconds || 60);
    resetRecording();

    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    if (speakTimerRef.current) clearInterval(speakTimerRef.current);

    prepTimerRef.current = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          handleTransitionToSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (speakTimerRef.current) clearInterval(speakTimerRef.current);
    };
  }, [currentIndex, currentTopic]);

  // Transition from Prep to Speaking Phase
  const handleTransitionToSpeaking = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setPhase('speaking');
    addToast('Preparation time ended. Begin speaking now! 🎙️', 'info');

    // Automatically trigger speech recording
    startRecording();

    if (speakTimerRef.current) clearInterval(speakTimerRef.current);
    speakTimerRef.current = setInterval(() => {
      setSpeakTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(speakTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-stop recording when speaking time runs out
  useEffect(() => {
    if (phase === 'speaking' && speakTimeLeft === 0 && isRecording) {
      stopRecording();
      addToast('Speaking time completed! Recording saved.', 'info');
    }
  }, [phase, speakTimeLeft, isRecording, stopRecording, addToast]);

  // Upload captured audio for current topic
  const handleUploadAudio = async () => {
    if (!audioBlob || !currentTopic || !sessionId) {
      addToast('Please complete your speaking recording.', 'error');
      return false;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('item_id', currentTopic.id);
      formData.append('file', audioBlob, `${currentTopic.id}.webm`);

      await assessmentApi.uploadAudio(sessionId, formData);
      setUploadedMap((prev) => ({ ...prev, [currentTopic.id]: true }));
      addToast(`Topic ${currentIndex + 1} response recorded!`, 'success', 2000);
      return true;
    } catch (err) {
      console.error('Failed to upload speech recording:', err);
      addToast('Could not save audio recording. Please retry.', 'error');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Advance to next topic or Section C
  const handleNext = async () => {
    if (isRecording) {
      stopRecording();
    }

    if (audioBlob && !uploadedMap[currentTopic.id]) {
      const success = await handleUploadAudio();
      if (!success) return;
    }

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      addToast('Section B completed! Moving to Section C (Grammar).', 'success');
      navigate('/assessment/section-c', { state: { sessionId } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Section B (Speaking Tasks)...</p>
      </div>
    );
  }

  const isCurrentUploaded = uploadedMap[currentTopic?.id];
  const progressPercent = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Proctoring Warning Banner */}
      {showWarning && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Proctoring Alert:</span> Tab switch logged ({tabSwitchCount} times).
            </div>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="px-2 py-1 bg-rose-900/60 hover:bg-rose-900 rounded-lg text-[10px] font-bold uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              Section B
            </span>
            <span className="text-xs text-slate-400 font-medium">Spontaneous Speaking</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Speaking & Articulation Tasks</h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
          <span>
            Topic <strong className="text-amber-300">{currentIndex + 1}</strong> of {items.length}
          </span>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Topic Card */}
      {currentTopic && (
        <div className="p-6 sm:p-8 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-2xl space-y-6">
          {/* Phase Banner & Dual Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  phase === 'prep' ? 'bg-amber-400 animate-ping' : 'bg-rose-500 animate-pulse'
                }`}
              />
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {phase === 'prep' ? 'Phase 1: Silent Preparation' : 'Phase 2: Speaking & Recording'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {phase === 'prep'
                    ? 'Review the prompt and hint cards. Organize your thoughts silently.'
                    : 'Speak clearly into your microphone addressing the topic.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {phase === 'prep' ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Prep: {prepTimeLeft}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-sm font-bold animate-pulse">
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>Speaking: {speakTimeLeft}s</span>
                </div>
              )}

              {phase === 'prep' && (
                <button
                  onClick={handleTransitionToSpeaking}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  Skip Prep & Speak Now
                </button>
              )}
            </div>
          </div>

          {/* Topic Title Prompt */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Speaking Prompt</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentTopic.prompt_text}
            </h2>
          </div>

          {/* Hint Cards */}
          {currentTopic.hints && currentTopic.hints.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Guiding Questions to Structure Your Response</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTopic.hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speaking Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              {phase === 'speaking' && !isRecording && (
                <button
                  onClick={startRecording}
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-900/30"
                >
                  <Mic className="w-4 h-4" />
                  <span>Resume Recording</span>
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-rose-900/30 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Recording ({recordingTime}s)</span>
                </button>
              )}

              {audioBlob && !isRecording && (
                <span className="flex items-center gap-1.5 text-xs text-focus-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Speaking Response Captured ({recordingTime}s)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleNext}
                disabled={isUploading || phase === 'prep' || (!audioBlob && !isCurrentUploaded)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40"
              >
                <span>
                  {isUploading
                    ? 'Saving...'
                    : currentIndex === items.length - 1
                    ? 'Proceed to Section C'
                    : 'Save & Next Topic'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionB;
