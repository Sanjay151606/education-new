import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Sparkles, 
  Layers, 
  Bell, 
  Save, 
  RotateCcw,
  CheckCircle2,
  User,
  Sliders
} from 'lucide-react';

export const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [focusSpanMinutes, setFocusSpanMinutes] = useState(user?.focus_span_minutes || 25);
  const [preferredContentStyle, setPreferredContentStyle] = useState(user?.preferred_content_style || 'bullet_points');
  const [difficultyLevel, setDifficultyLevel] = useState(user?.difficulty_level || 'adaptive');
  const [remindersEnabled, setRemindersEnabled] = useState(user?.reminders_enabled ?? true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setFocusSpanMinutes(user.focus_span_minutes || 25);
      setPreferredContentStyle(user.preferred_content_style || 'bullet_points');
      setDifficultyLevel(user.difficulty_level || 'adaptive');
      setRemindersEnabled(user.reminders_enabled ?? true);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        focus_span_minutes: parseInt(focusSpanMinutes, 10),
        preferred_content_style: preferredContentStyle,
        difficulty_level: difficultyLevel,
        reminders_enabled: remindersEnabled,
      });
      addToast('ADHD Learning Profile successfully updated!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast(err.response?.data?.detail || 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFocusSpanMinutes(25);
    setPreferredContentStyle('bullet_points');
    setDifficultyLevel('adaptive');
    setRemindersEnabled(true);
    addToast('Reset to recommended defaults.', 'info');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-brain-500/20 text-brain-400 border border-brain-500/30">
            <Sliders className="w-7 h-7" />
          </span>
          ADHD Profile & Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Calibrate BrainGraph's AI micro-breakdowns and timer intervals to your individual dopamine and focus rhythms.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Identity Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-brain-400" />
            Account Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex River"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-brain-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Focus Sprint Calibration */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-focus-400" />
              Focus Sprint Duration
            </h2>
            <span className="text-xs font-bold font-mono text-focus-400 bg-focus-950/60 border border-focus-500/30 px-3 py-1 rounded-full">
              {focusSpanMinutes} Minutes
            </span>
          </div>

          <p className="text-xs text-slate-400">
            For ADHD minds, shorter intervals (15–25 mins) prevent task resistance and hyperfocus exhaustion.
          </p>

          <div className="pt-2">
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={focusSpanMinutes}
              onChange={(e) => setFocusSpanMinutes(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-focus-500"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
              <span>5m (Micro-burst)</span>
              <span>15m (Low friction)</span>
              <span>25m (Standard)</span>
              <span>45m (Deep flow)</span>
              <span>90m</span>
            </div>
          </div>
        </div>

        {/* Content & Simplification Style */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brain-400" />
            Preferred Learning Format
          </h2>
          <p className="text-xs text-slate-400">
            Select how AI will structure your study materials and task steps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'bullet_points',
                title: '⚡ Bullet Points',
                desc: 'Scannable bullet takeaways with high-contrast emojis.'
              },
              {
                id: 'visual',
                title: '🎨 Visual & Metaphors',
                desc: 'Concrete real-world analogies and visual structures.'
              },
              {
                id: 'detailed',
                title: '📖 Step-by-Step',
                desc: 'Numbered chronological pathways for logical clarity.'
              }
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setPreferredContentStyle(style.id)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  preferredContentStyle === style.id
                    ? 'bg-brain-600/20 border-brain-500/60 shadow-lg shadow-brain-950/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1">{style.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Calibration & Gentle Reminders */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            AI Breakdown Depth & Reminders
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Task Breakdown Granularity
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-brain-500"
              >
                <option value="beginner">Beginner (Bite-sized 5m micro-steps)</option>
                <option value="adaptive">Adaptive (Dynamic based on task size)</option>
                <option value="intermediate">Intermediate (Standard 10-15m steps)</option>
                <option value="advanced">Advanced (Larger chunking)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brain-400" />
                  Gentle Dopamine Nudges
                </div>
                <div className="text-xs text-slate-400">
                  Encouraging break prompts and non-shaming streak notices.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemindersEnabled(!remindersEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  remindersEnabled ? 'bg-focus-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    remindersEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 p-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Recommended Defaults</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brain-600 hover:bg-brain-500 text-white font-bold shadow-lg shadow-brain-900/40 hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
