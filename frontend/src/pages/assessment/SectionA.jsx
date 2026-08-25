import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useOneTimeSpeech } from '../../hooks/useOneTimeSpeech';
import { useToast } from '../../context/ToastContext';
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  ArrowRight,
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCw,
} from 'lucide-react';

export const SectionA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [sessionId, setSessionId] = useState(
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id') || ''
  );
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMap, setUploadedMap] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Per-item countdown timer for read-aloud
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const currentItem = items[currentIndex] || null;
  const isListenRepeat = currentItem?.item_type === 'listen_repeat';

  // One-time speech hook for listen-and-repeat items
  const { isPlaying: isSpeakingPrompt, isPlayed: promptPlayed, speak } = useOneTimeSpeech(
    currentItem?.id || 'none'
  );

  // 1. Fetch Section A items on mount
  useEffect(() => {
    const fetchItems = async () => {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        try {
          const startRes = await assessmentApi.start();
          activeSessionId = startRes.data.session_id;
          setSessionId(activeSessionId);
          sessionStorage.setItem('bg_assessment_session_id', activeSessionId);
        } catch (err) {
          console.error('Failed to create session:', err);
          addToast('Could not load assessment session.', 'error');
          setIsLoading(false);
          return;
        }
      }

      try {
        const res = await assessmentApi.getSection(activeSessionId, 'A');
        setItems(res.data);
        if (res.data.length > 0) {
          setTimeLeft(res.data[0].time_limit_seconds || 15);
        }
      } catch (err) {
        console.error('Failed to fetch Section A items:', err);
        addToast('Error loading Section A items.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [sessionId, addToast]);

  // 2. Proctoring: Page Visibility API tab switch listener
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && sessionId) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarning(true);
        try {
          await assessmentApi.recordTabSwitch(sessionId, {
            warning_message: `Tab switch during Section A on item ${currentIndex + 1}`,
          });
        } catch (err) {
          console.error('Failed to record tab switch event:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, currentIndex]);

  // 3. Countdown timer management for Read-Aloud items
  useEffect(() => {
    if (!currentItem) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const duration = currentItem.time_limit_seconds || 15;
    setTimeLeft(duration);

    // Read-aloud items start timer immediately
    if (!isListenRepeat) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentItem, isListenRepeat]);

  // Auto-stop recording if time runs out
  useEffect(() => {
    if (timeLeft === 0 && isRecording) {
      stopRecording();
      addToast('Time limit reached. Recording captured.', 'info');
    }
  }, [timeLeft, isRecording, stopRecording, addToast]);

  // 4. Handle audio blob capture and upload
  const handleUploadAudio = async () => {
    if (!audioBlob || !currentItem || !sessionId) {
      addToast('Please record your response before proceeding.', 'error');
      return false;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('item_id', currentItem.id);
      formData.append('file', audioBlob, `${currentItem.id}.webm`);

      await assessmentApi.uploadAudio(sessionId, formData);
      setUploadedMap((prev) => ({ ...prev, [currentItem.id]: true }));
      addToast(`Response for Item ${currentIndex + 1} saved!`, 'success', 2000);
      return true;
    } catch (err) {
      console.error('Failed to upload recording:', err);
      addToast('Could not save audio recording. Please try again.', 'error');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Navigate to Next Item or Section B
  const handleNext = async () => {
    if (isRecording) {
      stopRecording();
    }

    if (audioBlob && !uploadedMap[currentItem.id]) {
      const success = await handleUploadAudio();
      if (!success) return;
    }

    resetRecording();

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      addToast('Section A completed! Moving to Section B.', 'success');
      navigate('/assessment/section-b', { state: { sessionId } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-brain-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Section A (Reading & Listening)...</p>
      </div>
    );
  }

  const isCurrentUploaded = uploadedMap[currentItem?.id];
  const progressPercent = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Tab Switch Warning Banner */}
      {showWarning && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Proctoring Notice:</span> Tab switch or window change detected
              ({tabSwitchCount} {tabSwitchCount === 1 ? 'time' : 'times'}). Please keep your focus on this assessment.
            </div>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="px-2 py-1 bg-rose-900/60 hover:bg-rose-900 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-brain-500/20 border border-brain-500/40 text-brain-300 text-xs font-bold uppercase tracking-wider">
              Section A
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isListenRepeat ? 'Listen and Repeat' : 'Read Aloud'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Reading & Listening Tasks</h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
          <span>
            Item <strong className="text-brain-300">{currentIndex + 1}</strong> of {items.length}
          </span>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brain-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Item Main Card */}
      {currentItem && (
        <div className="p-6 sm:p-8 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-2xl space-y-6">
          {/* Card Top: Instructions & Timer */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Sparkles className="w-4 h-4 text-brain-400" />
              <span>
                {isListenRepeat
                  ? 'Listen to the audio sentence ONCE, then repeat it clearly.'
                  : 'Read the following sentence aloud before the countdown expires.'}
              </span>
            </div>

            {!isListenRepeat && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  timeLeft <= 5
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Prompt Area */}
          <div className="min-h-[120px] flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center space-y-4">
            {isListenRepeat ? (
              <div className="space-y-3">
                <button
                  onClick={() => speak(currentItem.prompt_text)}
                  disabled={isSpeakingPrompt || promptPlayed}
                  className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-3 shadow-lg ${
                    promptPlayed
                      ? 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : isSpeakingPrompt
                      ? 'bg-brain-600 text-white border border-brain-400 animate-pulse'
                      : 'bg-brain-600 hover:bg-brain-500 text-white border border-brain-400/40 hover:shadow-brain-600/30'
                  }`}
                >
                  {isSpeakingPrompt ? (
                    <>
                      <Volume2 className="w-5 h-5 animate-bounce" />
                      <span>Playing Sentence...</span>
                    </>
                  ) : promptPlayed ? (
                    <>
                      <VolumeX className="w-5 h-5 text-slate-500" />
                      <span>Audio Played (Replay Disabled)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 text-brain-200" />
                      <span>Play Sentence (Once Only)</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 italic">
                  {promptPlayed
                    ? 'Now tap "Start Recording" below and repeat the sentence.'
                    : 'Click above to listen. The sentence will play only once.'}
                </p>
              </div>
            ) : (
              <p className="text-lg sm:text-2xl font-medium text-slate-100 leading-relaxed tracking-wide">
                "{currentItem.prompt_text}"
              </p>
            )}
          </div>

          {/* Audio Recording Controller */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isListenRepeat && !promptPlayed}
                  className="px-5 py-3 rounded-xl bg-brain-600 hover:bg-brain-500 disabled:opacity-40 disabled:hover:bg-brain-600 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-brain-900/30"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              ) : (
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
                  <span>Audio Captured ({recordingTime}s)</span>
                </span>
              )}
            </div>

            {/* Next Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleNext}
                disabled={isUploading || (!audioBlob && !isCurrentUploaded)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brain-600 to-indigo-600 hover:from-brain-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-brain-900/40"
              >
                <span>
                  {isUploading
                    ? 'Saving...'
                    : currentIndex === items.length - 1
                    ? 'Complete Section A'
                    : 'Save & Next Item'}
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

export default SectionA;
