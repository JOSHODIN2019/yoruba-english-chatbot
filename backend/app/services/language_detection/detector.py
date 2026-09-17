"""
Rule-based language identification, extracted from
notebooks/yoruba_english_chatbot_ml_pipeline.ipynb (Stage 9.1).

Deliberately NOT a machine learning model (see PROJECT_RULES.md Section
5.2 and docs/ARCHITECTURE.md): Yoruba is reliably identifiable through its
own diacritics and a small set of common words, so a transparent rule-based
check is used instead of training a second model. This runs independently
of intent classification and should always be called on the ORIGINAL
message, not the preprocessed one, since preprocessing strips punctuation
and some casing cues that help distinguish languages.
"""
import re

from nltk.corpus import stopwords

from app.core import nltk_setup  # noqa: F401 - import triggers data download

_ENGLISH_STOPWORDS = set(stopwords.words("english"))

YORUBA_MARK_CHARS = set("ẹọṣẹ́ẹ̀ọ́ọ̀ṣáàéèíìóòúùńǹ")
YORUBA_COMMON_WORDS = {
    "bawo", "báwo", "pele", "pẹ̀lẹ́", "jare", "jẹ́", "se", "ṣé", "ni", "wa", "wá",
    "mo", "won", "wọn", "nipa", "nípa", "oruko", "orúkọ", "dara", "dáa", "ekaaro",
    "káàárọ̀", "ekaasan", "káàsán", "ekurole", "kúùrọ̀lẹ́", "odabo", "ódàbọ̀", "jowo", "jọ̀ọ́",
}
ENGLISH_COMMON_WORDS = _ENGLISH_STOPWORDS | {
    "help", "thanks", "please", "want", "need", "like", "tell", "talk", "hello",
    "hi", "hey", "name", "sorry", "good", "morning", "night", "yes", "no",
}


def _contains_yoruba_diacritics(text: str) -> bool:
    return any(ch in YORUBA_MARK_CHARS for ch in text.lower())


def detect_language(text: str) -> str:
    """Returns one of "English", "Yoruba", or "Mixed"."""
    has_diacritics = _contains_yoruba_diacritics(text)
    words = set(re.findall(r"[a-zà-ǿẹọṣ]+", text.lower()))
    yoruba_hits = len(words & YORUBA_COMMON_WORDS)
    english_hits = len(words & ENGLISH_COMMON_WORDS)

    has_yoruba_signal = has_diacritics or yoruba_hits > 0
    has_english_signal = english_hits >= 2

    if has_yoruba_signal and has_english_signal:
        return "Mixed"
    if has_yoruba_signal:
        return "Yoruba"
    return "English"
