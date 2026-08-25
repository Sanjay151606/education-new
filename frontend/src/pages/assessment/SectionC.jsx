import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Clock,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Questions (34)', range: [1, 34] },
  { id: 'verbs', label: 'Verb Forms (1-7)', range: [1, 7] },
  { id: 'tenses', label: 'Tenses (8-14)', range: [8, 14] },
  { id: 'articles', label: 'Articles (15-20)', range: [15, 20] },
  { id: 'voice', label: 'Voice Change (21-27)', range: [21, 27] },
  { id: 'mixed', label: 'Prepositions & Agreement (28-34)', range: [28, 34] },
];

export const SectionC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [sessionId, setSessionId] = useState(
    location.state?.sessionId || sessionStorage.getItem('bg_assessment_session_id') || ''
  );
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // 1. Fetch Section C items
  useEffect(() => {
    const fetchItems = async () => {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        navigate('/assessment');
        return;
      }

      try {
        const res = await assessmentApi.getSection(activeSessionId, 'C');
        setItems(res.data);
      } catch (err) {
        console.error('Failed to load Section C:', err);
        addToast('Error loading Section C items.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [sessionId, navigate, addToast]);

  // 2. Proctoring Tab-switch tracking
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && sessionId) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarning(true);
        try {
          await assessmentApi.recordTabSwitch(sessionId, {
            warning_message: `Tab switch during Section C on item ${currentIndex + 1}`,
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

  // 3. Handle Option Selection & Real-time Auto-save
  const handleSelectOption = async (option) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    setSelectedAnswers((prev) => ({ ...prev, [currentItem.id]: option }));
    setSavedStatus((prev) => ({ ...prev, [currentItem.id]: 'saving' }));

    try {
      await assessmentApi.respond(sessionId, {
        item_id: currentItem.id,
        mcq_choice: option,
        response_time_ms: 0,
      });
      setSavedStatus((prev) => ({ ...prev, [currentItem.id]: 'saved' }));
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
      setSavedStatus((prev) => ({ ...prev, [currentItem.id]: 'error' }));
    }
  };

  // Filter items by selected category
  const filteredItems = items.filter((it) => {
    if (activeCategory === 'all') return true;
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    if (!cat) return true;
    return it.sequence_index >= cat.range[0] && it.sequence_index <= cat.range[1];
  });

  const currentItem = items[currentIndex] || null;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = items.length > 0 ? (answeredCount / items.length) * 100 : 0;

  const handleNextSection = () => {
    if (answeredCount < items.length) {
      const unanswered = items.length - answeredCount;
      const confirmProceed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Proceed to Section D?`
      );
      if (!confirmProceed) return;
    }

    addToast('Section C saved! Proceeding to Section D (Listening Comprehension).', 'success');
    navigate('/assessment/section-d', { state: { sessionId } });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Section C (Grammar)...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Tab Switch Warning */}
      {showWarning && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Proctoring Notice:</span> Tab switch detected ({tabSwitchCount} times).
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
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Section C
            </span>
            <span className="text-xs text-slate-400 font-medium">Untimed Multiple-Choice</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Grammar & Syntax Mastery</h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
          <span>
            Answered <strong className="text-emerald-300">{answeredCount}</strong> of {items.length}
          </span>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Layout: Main Question Card + Question Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {currentItem && (
            <div className="p-6 sm:p-8 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-2xl space-y-6">
              {/* Question Header & Auto-Save Badge */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <span className="text-xs font-bold text-slate-400">
                  Question <strong className="text-emerald-300">{currentItem.sequence_index}</strong> of{' '}
                  {items.length}
                </span>

                <div className="flex items-center gap-2">
                  {savedStatus[currentItem.id] === 'saving' && (
                    <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                      <Save className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {savedStatus[currentItem.id] === 'saved' && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      Answer Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {currentItem.prompt_text}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {currentItem.options?.map((option, idx) => {
                  const isSelected = selectedAnswers[currentItem.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Question Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))}
                  disabled={currentIndex === items.length - 1}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-2"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Question Selector Sidebar (1 Col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-calm-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Question Drawer</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">
                {answeredCount}/{items.length} Done
              </span>
            </div>

            {/* Grid of numbers */}
            <div className="grid grid-cols-6 gap-2">
              {items.map((it, idx) => {
                const isAnswered = !!selectedAnswers[it.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={it.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-emerald-400 bg-emerald-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" /> Pending
              </span>
            </div>
          </div>

          {/* Proceed Button Card */}
          <button
            onClick={handleNextSection}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Section D (Listening)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionC;
