"""
Central AI service for BrainGraph.
Wraps calls to an LLM provider (OpenAI or Anthropic) for all ADHD-support features:
- text simplification
- summarization / flashcard generation
- task breakdown into micro-steps
- adaptive study recommendations

Swap the `_call_llm` internals to point at whichever provider you configure via .env.
"""
import json
from typing import List, Dict, Any
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


def _call_llm(system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
    if client is None:
        raise RuntimeError("No AI provider configured. Set OPENAI_API_KEY in .env")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"} if json_mode else None,
        temperature=0.4,
    )
    return response.choices[0].message.content


def simplify_study_material(text: str, reading_level: str = "simple") -> Dict[str, Any]:
    system = (
        "You are an assistant that rewrites study material for students with ADHD. "
        "Use short sentences, plain language, bullet points, and bold key terms. "
        "Also produce a 5-8 bullet summary and 5 flashcards (question/answer). "
        "Respond ONLY as JSON: {simplified_text, summary_bullets: [], flashcards: [{q,a}]}"
    )
    raw = _call_llm(system, f"Reading level: {reading_level}\n\nText:\n{text}")
    return json.loads(raw)


def break_down_task(title: str, description: str = "") -> Dict[str, Any]:
    system = (
        "You help ADHD students avoid task paralysis by breaking a task into 3-6 small, "
        "concrete, low-friction subtasks, each completable in under 20 minutes. "
        "Also estimate total minutes. Respond ONLY as JSON: "
        "{subtasks: [{step, estimated_minutes}], estimated_minutes_total}"
    )
    raw = _call_llm(system, f"Task: {title}\nDetails: {description}")
    return json.loads(raw)


def generate_recommendations(
    recent_scores: List[float],
    focus_span_minutes: int,
    preferred_style: str,
    subject: str = None,
) -> Dict[str, Any]:
    system = (
        "You are an adaptive learning coach for ADHD students. Based on recent quiz/task "
        "performance and the student's attention span, suggest: 3 short actionable study "
        "recommendations, an ideal focus session length, an ideal break length, and one "
        "brief encouraging note (max 20 words, no toxic positivity). "
        "Respond ONLY as JSON: {recommendations: [], suggested_focus_minutes, "
        "suggested_break_minutes, motivational_note}"
    )
    user = (
        f"Recent scores: {recent_scores}\n"
        f"Baseline focus span: {focus_span_minutes} minutes\n"
        f"Preferred content style: {preferred_style}\n"
        f"Subject focus: {subject or 'general'}"
    )
    raw = _call_llm(system, user)
    return json.loads(raw)


def detect_distraction_risk(distractions_logged: int, planned_minutes: int, actual_minutes: int) -> str:
    """Lightweight rule-based fallback (no LLM call needed) used by the focus-session endpoint
    to give instant feedback without waiting on an API round trip."""
    if actual_minutes == 0:
        return "low_effort"
    ratio = distractions_logged / max(actual_minutes, 1)
    if ratio > 0.3:
        return "high_distraction"
    if actual_minutes < planned_minutes * 0.5:
        return "session_cut_short"
    return "on_track"


def summarize_assessment_session(
    section_c_score: float,
    section_d_score: float,
    speaking_items_count: int,
    tab_switch_count: int,
    candidate_name: str = "Candidate"
) -> Dict[str, Any]:
    """
    Produces a constructive, non-diagnostic study pacing summary based on auto-graded sections
    and recorded speaking submissions. Never frames results as a medical or clinical diagnosis.
    """
    auto_graded_avg = round((section_c_score + section_d_score) / 2.0, 1)

    # Calculate recommended profile parameters based on performance
    if auto_graded_avg >= 80:
        focus_span = 30
        content_style = "mixed"
        difficulty = "adaptive"
    elif auto_graded_avg >= 60:
        focus_span = 25
        content_style = "visual"
        difficulty = "medium"
    else:
        focus_span = 20
        content_style = "visual"
        difficulty = "easy"

    fallback_summary = (
        f"{candidate_name} completed the 4-section English proficiency assessment. "
        f"Grammar accuracy reached {section_c_score}%, and listening comprehension achieved {section_d_score}%. "
        f"A total of {speaking_items_count} spoken audio responses were recorded and stored for review. "
        f"Based on pacing and response consistency, an initial study block of {focus_span} minutes with "
        f"{content_style} study aids is recommended."
    )

    if client is None or not settings.openai_api_key:
        return {
            "auto_graded_score": auto_graded_avg,
            "ai_summary": fallback_summary,
            "recommended_focus_span_minutes": focus_span,
            "recommended_content_style": content_style,
            "recommended_difficulty_level": difficulty
        }

    try:
        system = (
            "You are an educational learning coach analyzing an English proficiency assessment for a student. "
            "Write a concise, encouraging 2-3 sentence performance summary. "
            "CRITICAL: Never use medical, clinical, or diagnostic terminology. "
            "Focus purely on language mastery, study pacing, and recommended revision techniques. "
            "Respond ONLY as JSON: {summary: string, recommended_focus_span_minutes: int, "
            "recommended_content_style: string, recommended_difficulty_level: string}"
        )
        user_prompt = (
            f"Candidate Name: {candidate_name}\n"
            f"Section C (Grammar Accuracy): {section_c_score}%\n"
            f"Section D (Listening Comprehension): {section_d_score}%\n"
            f"Speaking Items Recorded: {speaking_items_count}\n"
            f"Tab Switch Proctoring Alerts: {tab_switch_count}\n"
        )
        raw = _call_llm(system, user_prompt)
        parsed = json.loads(raw)
        return {
            "auto_graded_score": auto_graded_avg,
            "ai_summary": parsed.get("summary", fallback_summary),
            "recommended_focus_span_minutes": parsed.get("recommended_focus_span_minutes", focus_span),
            "recommended_content_style": parsed.get("recommended_content_style", content_style),
            "recommended_difficulty_level": parsed.get("recommended_difficulty_level", difficulty)
        }
    except Exception:
        return {
            "auto_graded_score": auto_graded_avg,
            "ai_summary": fallback_summary,
            "recommended_focus_span_minutes": focus_span,
            "recommended_content_style": content_style,
            "recommended_difficulty_level": difficulty
        }


class AIService:
    simplify_study_material = staticmethod(simplify_study_material)
    break_down_task = staticmethod(break_down_task)
    generate_recommendations = staticmethod(generate_recommendations)
    detect_distraction_risk = staticmethod(detect_distraction_risk)
    summarize_assessment_session = staticmethod(summarize_assessment_session)


ai_service = AIService()

