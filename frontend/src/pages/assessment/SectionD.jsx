import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useOneTimeSpeech } from '../../hooks/useOneTimeSpeech';
import { useToast } from '../../context/ToastContext';
import {
  Headphones,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Save,
  Check,
} from 'lucide-react';

const PASSAGE_GROUPS = [
  { id: 'p1', title: 'Passage 1: The James Webb Space Telescope' },
  { id: 'p2', title: 'Passage 2: The Invention of the Printing Press' },
  { id: 'p3', title: 'Passage 3: Deep Sea Biodiversity' },
  { id: 'p4', title: 'Passage 4: Artificial Intelligence in Medicine' },
];

export const SectionD = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [sessionId, setSessionId] = useState(
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id') || ''
  );
  const [items, setItems] = useState([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [passagePlayedMap, setPassagePlayedMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const currentGroup = PASSAGE_GROUPS[currentPassageIndex];

  // 1. Fetch Section D items
  useEffect(() => {
    const fetchItems = async () => {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        navigate('/assessment');
        return;
      }

      try {
        const res = await assessmentApi.getSection(activeSessionId, 'D');
        setItems(res.data);
      } catch (err) {
        console.error('Failed to load Section D:', err);
        addToast('Error loading Section D items.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [sessionId, navigate, addToast]);

  // 2. Proctoring tab-switch tracking
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && sessionId) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarning(true);
        try {
          await assessmentApi.recordTabSwitch(sessionId, {
            warning_message: `Tab switch during Section D on passage ${currentPassageIndex + 1}`,
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
  }, [sessionId, currentPassageIndex]);

  // Extract passage prompt item and question items for active passage group
  const passageItem = items.find(
    (it) => it.passage_group_id === currentGroup?.id && it.options === null
  );
  const questionItems = items.filter(
    (it) => it.passage_group_id === currentGroup?.id && it.options !== null
  );

  // Speech synthesis for passage playback
  const { isPlaying: isSpeakingPassage, isPlayed: currentPassageFinished, speak } = useOneTimeSpeech(
    currentGroup?.id || 'none'
  );

  const handlePlayPassage = () => {
    if (!passageItem) return;
    speak(passageItem.prompt_text, () => {
      setPassagePlayedMap((prev) => ({ ...prev, [currentGroup.id]: true }));
      addToast('Passage completed. Comprehension questions unlocked! 🔓', 'success');
    });
  };

  const isQuestionsUnlocked = passagePlayedMap[currentGroup?.id] || currentPassageFinished;

  // Option selection
  const handleSelectOption = async (itemId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [itemId]: option }));
    setSavedStatus((prev) => ({ ...prev, [itemId]: 'saving' }));

    try {
      await assessmentApi.respond(sessionId, {
        item_id: itemId,
        mcq_choice: option,
        response_time_ms: 0,
      });
      setSavedStatus((prev) => ({ ...prev, [itemId]: 'saved' }));
    } catch (err) {
      console.error('Failed to save answer:', err);
      setSavedStatus((prev) => ({ ...prev, [itemId]: 'error' }));
    }
  };

  // Submit complete assessment
  const handleCompleteAssessment = async () => {
    const totalMCQs = items.filter((it) => it.options !== null).length;
    const totalAnswered = Object.keys(selectedAnswers).length;

    if (totalAnswered < totalMCQs) {
      const unanswered = totalMCQs - totalAnswered;
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''} in Section D. Complete assessment anyway?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const res = await assessmentApi.complete(sessionId);
      addToast('Assessment completed successfully! 🎉', 'success');
      navigate('/assessment/results', { state: { sessionId, results: res.data } });
    } catch (err) {
      console.error('Failed to complete assessment:', err);
      addToast('Could not complete assessment session. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Section D (Listening Comprehension)...</p>
      </div>
    );
  }

  const allMCQs = items.filter((it) => it.options !== null);
  const totalAnsweredCount = Object.keys(selectedAnswers).length;
  const progressPercent = allMCQs.length > 0 ? (totalAnsweredCount / allMCQs.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Proctoring Warning */}
      {showWarning && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Proctoring Notice:</span> Tab switch logged ({tabSwitchCount} times).
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
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              Section D
            </span>
            <span className="text-xs text-slate-400 font-medium">Listening Comprehension</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Passage {currentPassageIndex + 1} of {PASSAGE_GROUPS.length}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
          <span>
            Total Answered: <strong className="text-cyan-300">{totalAnsweredCount}</strong> of {allMCQs.length}
          </span>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Passage Audio Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Headphones className="w-5 h-5 text-cyan-400" />
              <span>{currentGroup?.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Listen carefully to the passage audio. Questions will reveal only after playback ends.
            </p>
          </div>

          <button
            onClick={handlePlayPassage}
            disabled={isSpeakingPassage || isQuestionsUnlocked}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
              isQuestionsUnlocked
                ? 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                : isSpeakingPassage
                ? 'bg-cyan-600 text-white border border-cyan-400 animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40 hover:shadow-cyan-600/30'
            }`}
          >
            {isSpeakingPassage ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Playing Passage Audio...</span>
              </>
            ) : isQuestionsUnlocked ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Audio Played (No Replay)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-200" />
                <span>Play Passage Audio</span>
              </>
            )}
          </button>
        </div>

        {/* Questions Area: Gated until audio completes */}
        {!isQuestionsUnlocked ? (
          <div className="p-12 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Comprehension Questions Locked</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Please listen to the passage audio above. The 4 multiple-choice questions will automatically unlock
              once playback concludes.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Unlock className="w-4 h-4" />
              <span>Questions for {currentGroup?.title}</span>
            </div>

            <div className="space-y-5">
              {questionItems.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">
                      Question {qIndex + 1}
                    </span>
                    {savedStatus[q.id] === 'saved' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Saved
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-medium text-slate-100">
                    {q.prompt_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options?.map((option, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === option;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, option)}
                          className={`p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/50 border-cyan-500/80 text-cyan-200 shadow-md shadow-cyan-950/30'
                              : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-5 h-5 rounded font-bold flex items-center justify-center text-[10px] ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>

                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Passage Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentPassageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentPassageIndex === 0}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 text-xs font-semibold"
              >
                Previous Passage
              </button>

              {currentPassageIndex < PASSAGE_GROUPS.length - 1 ? (
                <button
                  onClick={() => setCurrentPassageIndex((prev) => prev + 1)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2"
                >
                  <span>Next Passage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteAssessment}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Finalizing Assessment...' : 'Submit Complete Assessment'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionD;
