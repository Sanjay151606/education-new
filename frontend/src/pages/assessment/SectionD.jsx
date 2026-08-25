import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useOneTimeSpeech } from '../../hooks/useOneTimeSpeech';
import {
  Headphones,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Sparkles,
  BookOpen,
  Send
} from 'lucide-react';

export default function SectionD() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId =
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id');

  const [rawItems, setRawItems] = useState([]);
  const [passages, setPassages] = useState([]);
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);

  const { isPlaying, hasPlayed, speak, resetForNewItem } = useOneTimeSpeech();
  const questionStartTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) {
      navigate('/assessment');
    }
  }, [sessionId, navigate]);

  // Load Section D items from API and structure into Passages + Questions
  useEffect(() => {
    const fetchSectionD = async () => {
      setIsLoading(true);
      try {
        const res = await assessmentApi.getSection(sessionId, 'D');
        const items = res.data || [];
        setRawItems(items);

        // Group into passages and sub-questions
        // Passages are items without options; questions are items with options grouped by passage_group_id
        const passageGroups = {};
        items.forEach((it) => {
          const gId = it.passage_group_id || 'default';
          if (!passageGroups[gId]) {
            passageGroups[gId] = { passageItem: null, questions: [] };
          }
          if (it.options && it.options.length > 0) {
            passageGroups[gId].questions.push(it);
          } else {
            passageGroups[gId].passageItem = it;
          }
        });

        const formatted = Object.values(passageGroups).filter((g) => g.passageItem && g.questions.length > 0);
        setPassages(formatted);
      } catch (err) {
        console.error('Error fetching Section D items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSectionD();
    }
  }, [sessionId]);

  const currentPassageGroup = passages[currentPassageIdx] || null;
  const currentPassage = currentPassageGroup?.passageItem || null;
  const currentQ = currentPassageGroup?.questions[currentQuestionIdx] || null;

  // Reset playback and question unlock on passage change
  useEffect(() => {
    if (!currentPassage) return;

    resetForNewItem();
    setShowQuestions(false);
    setCurrentQuestionIdx(0);
  }, [currentPassageIdx, currentPassage, resetForNewItem]);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setSaveStatus(answers[currentQ?.id] ? 'Saved' : '');
  }, [currentQuestionIdx, currentQ]);

  const handlePlayPassageAudio = () => {
    if (!currentPassage || isPlaying || hasPlayed) return;

    speak(currentPassage.prompt_text, { rate: 0.95 }, () => {
      setShowQuestions(true);
    });
  };

  const handleSelectOption = async (option) => {
    if (!currentQ) return;

    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    setSaveStatus('Saving...');
    try {
      await assessmentApi.respond(sessionId, {
        item_id: currentQ.id,
        mcq_choice: option,
        response_time_ms: responseTimeMs,
      });
      setSaveStatus('Saved ✓');
    } catch (err) {
      console.error('Error saving listening answer:', err);
      setSaveStatus('Failed to save');
    }
  };

  const handleNextQuestion = async () => {
    if (!currentPassageGroup) return;

    if (currentQuestionIdx < currentPassageGroup.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else if (currentPassageIdx < passages.length - 1) {
      setCurrentPassageIdx((prev) => prev + 1);
    } else {
      // Completed all passages & questions! Conclude assessment
      await handleCompleteAssessment();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleCompleteAssessment = async () => {
    setIsSubmittingFinal(true);
    try {
      await assessmentApi.complete(sessionId);
      navigate('/assessment/results', { state: { sessionId } });
    } catch (err) {
      console.error('Error completing assessment:', err);
      // Navigate anyway so results page can attempt retrieval
      navigate('/assessment/results', { state: { sessionId } });
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium text-sm">Loading Section D Listening Passages...</p>
        </div>
      </div>
    );
  }

  if (!currentPassageGroup || !currentPassage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-2xl border border-slate-200">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-slate-700 font-semibold">No passages found for Section D.</p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold"
          >
            Return to Assessment Intro
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = passages.reduce((acc, p) => acc + p.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const globalQNum =
    passages.slice(0, currentPassageIdx).reduce((acc, p) => acc + p.questions.length, 0) +
    currentQuestionIdx +
    1;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg">
                🅳 Section D
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Passage {currentPassageIdx + 1} of {passages.length}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Listening Comprehension
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Question {globalQNum} of {totalQuestions} • {answeredCount} Answered
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 font-bold text-xs flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-purple-600" />
              <span>{Math.round((answeredCount / totalQuestions) * 100)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Audio Listening Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Headphones className="w-4 h-4 text-purple-600" />
              <span>Passage Audio Player (Single-Play Only)</span>
            </div>

            {hasPlayed && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Passage Audio Completed
              </span>
            )}
          </div>

          <div className="p-6 bg-purple-50/60 border border-purple-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Passage {currentPassageIdx + 1}: {currentPassage.prompt_text.split('\n\n')[0]}
              </h3>
              <p className="text-xs text-slate-600">
                {isPlaying
                  ? 'Listening in progress... Please listen carefully. Questions will reveal when finished.'
                  : hasPlayed
                  ? 'Audio finished. Questions for this passage are now unlocked below.'
                  : 'Click the button to listen to the audio passage once. No pause or replay is permitted.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayPassageAudio}
              disabled={isPlaying || hasPlayed}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
              <span>{isPlaying ? 'Playing Passage...' : hasPlayed ? 'Played (Locked)' : 'Play Passage Audio'}</span>
            </button>
          </div>
        </div>

        {/* Questions Section - Revealed after playback */}
        {showQuestions || hasPlayed ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6 animate-fadeIn">
            
            {/* Question Progress inside Passage */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Passage Question {currentQuestionIdx + 1} of {currentPassageGroup.questions.length}
              </span>
              {saveStatus && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {saveStatus}
                </span>
              )}
            </div>

            {/* Question Prompt */}
            {currentQ && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {currentQ.prompt_text}
                </h2>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(currentQ.options || []).map((option, idx) => {
                    const isSelected = answers[currentQ.id] === option;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-slate-500 border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIdx === 0}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isSubmittingFinal}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmittingFinal ? (
                  <span>Submitting Test...</span>
                ) : globalQNum < totalQuestions ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Complete & View Results</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Questions are locked</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please play and listen to the passage audio clip above. Comprehension questions will automatically unlock once the playback concludes.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
