import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useOneTimeSpeech } from '../../hooks/useOneTimeSpeech';
import {
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  VolumeX,
  UploadCloud,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function SectionA() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId =
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id');

  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [recordingDone, setRecordingDone] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [tabSwitches, setTabSwitches] = useState(0);

  const { isRecording, startRecording, stopRecording, clearAudio } = useAudioRecorder();
  const { isPlaying, hasPlayed, speak, resetForNewItem } = useOneTimeSpeech();

  const timerRef = useRef(null);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      navigate('/assessment');
    }
  }, [sessionId, navigate]);

  // Load items from API
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const cached = sessionStorage.getItem('bg_assessment_section_a_items');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setItems(parsed);
            setIsLoading(false);
            return;
          }
        }
        const res = await assessmentApi.getSection(sessionId, 'A');
        setItems(res.data || []);
      } catch (err) {
        console.error('Error fetching Section A items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchItems();
    }
  }, [sessionId]);

  // Proctoring: Tab switch visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        const warningText = `Tab switch detected at ${new Date().toLocaleTimeString()}! Stay on this page.`;
        setWarnings((prev) => [...prev, warningText]);

        if (sessionId) {
          assessmentApi.recordTabSwitch(sessionId, { reason: 'Section A tab switch' }).catch((e) =>
            console.error('Failed to log tab switch:', e)
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId]);

  const currentItem = items[currentIdx] || null;
  const isListenRepeat = currentItem?.item_type === 'listen_repeat';

  // Per-item reset
  useEffect(() => {
    if (!currentItem) return;

    setTimeLeft(currentItem.time_limit_seconds || 15);
    setRecordingDone(false);
    clearAudio();
    resetForNewItem();
  }, [currentIdx, currentItem, clearAudio, resetForNewItem]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isRecording && !recordingDone && !isPlaying) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isRecording, recordingDone, isPlaying]);

  const handlePlaySentence = () => {
    if (!currentItem || hasPlayed || isPlaying) return;
    speak(currentItem.prompt_text, { rate: 0.92 });
  };

  const handleStartRecord = async () => {
    if (isListenRepeat && !hasPlayed) {
      setWarnings((prev) => [...prev, '⚠️ Please listen to the audio sentence before recording.']);
      return;
    }
    await startRecording();
  };

  const handleStopRecord = async () => {
    const blob = await stopRecording();
    if (blob && currentItem) {
      await uploadRecording(blob, currentItem.id);
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
      console.error('Error uploading recording:', err);
      setWarnings((prev) => [...prev, '⚠️ Recording upload failed. Please try again.']);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < items.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      navigate('/assessment/section-b', { state: { sessionId } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brain-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium text-sm">Loading Section A questions...</p>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-2xl border border-slate-200">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-slate-700 font-semibold">No questions found for Section A.</p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-4 py-2 bg-brain-600 text-white rounded-xl text-sm font-semibold"
          >
            Return to Assessment Intro
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIdx + 1) / items.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">
                🅰️ Section A
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {isListenRepeat ? 'Listen and Repeat' : 'Read Aloud'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Reading & Listening Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Question {currentIdx + 1} of {items.length} ({items.length - (currentIdx + 1)} remaining)
            </p>
          </div>

          {/* Timer & Proctoring pill */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-mono font-bold text-sm flex items-center gap-2 ${
              timeLeft <= 5 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{timeLeft}s</span>
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
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Warning Messages */}
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

        {/* Main Task Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          
          {/* Question Type Instruction */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {isListenRepeat
                ? 'Task: Listen to the audio clip once, then repeat the sentence clearly.'
                : 'Task: Read the following sentence aloud into your microphone.'}
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold capitalize">
              {currentItem.difficulty || 'standard'}
            </span>
          </div>

          {/* Sentence Content Box */}
          <div className="p-8 bg-blue-50/50 border-2 border-blue-100 rounded-2xl min-h-[140px] flex items-center justify-center text-center">
            {isListenRepeat ? (
              <div className="space-y-4">
                {!hasPlayed ? (
                  <button
                    type="button"
                    onClick={handlePlaySentence}
                    disabled={isPlaying}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
                    <span>{isPlaying ? 'Playing Audio (Listen Carefully)...' : 'Play Audio Sentence (Once Only)'}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Audio Played (Replay Disabled)</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      Now record yourself repeating the sentence clearly.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed max-w-2xl">
                "{currentItem.prompt_text}"
              </p>
            )}
          </div>

          {/* Recording Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecord}
                  disabled={recordingDone || isUploading || (isListenRepeat && !hasPlayed)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <Mic className="w-4 h-4" />
                  <span>{recordingDone ? 'Recorded & Saved ✓' : 'Start Recording'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecord}
                  className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition flex items-center gap-2 animate-pulse shadow-sm"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-1" />
                  <span>Stop & Submit Recording</span>
                </button>
              )}

              {isUploading && (
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 animate-bounce" />
                  Uploading audio...
                </span>
              )}

              {recordingDone && !isUploading && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Audio saved to server
                </span>
              )}
            </div>

            {/* Next Question Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!recordingDone && !isUploading}
              className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <span>{currentIdx < items.length - 1 ? 'Next Question' : 'Proceed to Section B'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
