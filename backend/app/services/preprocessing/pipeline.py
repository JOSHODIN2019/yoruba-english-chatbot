"""
Text preprocessing pipeline, extracted from
notebooks/yoruba_english_chatbot_ml_pipeline.ipynb (Stages 5-6).

This must stay behaviourally identical to the notebook's pipeline: the
TF-IDF vectorizer and Logistic Regression model in models/ were fit on
text produced by exactly this sequence of steps. Changing the logic here
without retraining would silently break predictions.
"""
import json
import re
import unicodedata
from pathlib import Path

from nltk import pos_tag
from nltk.stem import PorterStemmer, WordNetLemmatizer

from app.core import nltk_setup  # noqa: F401 - import triggers data download

_DATA_DIR = Path(__file__).resolve().parents[4] / "data"

with open(_DATA_DIR / "preprocessing_config.json", encoding="utf-8") as f:
    _config = json.load(f)

ALL_STOPWORDS = set(_config["stopwords"])
FREQUENT_WORDS = set(_config["frequent_words"])
RARE_WORDS = set(_config["rare_words"])

# \w already matches precomposed Yoruba letters (ẹ ọ ṣ, ó ò é è, ...) since
# each is a single Unicode letter codepoint. It does NOT match standalone
# COMBINING marks (U+0300-U+036F) used to stack a tone on top of a letter,
# so that range is explicitly preserved too - see notebook Stage 5 for the
# original bug this guards against (silently deleting Yoruba tone marks).
_COMBINING_MARKS_RANGE = "̀-ͯ"

_CONTRACTIONS = {
    "can't": "cannot", "won't": "will not", "n't": " not",
    "i'm": "i am", "it's": "it is", "that's": "that is", "you're": "you are",
    "i've": "i have", "i'd": "i would", "let's": "let us", "who's": "who is",
    "what's": "what is", "there's": "there is", "we're": "we are",
    "they're": "they are", "i'll": "i will", "you'll": "you will",
}

_stemmer = PorterStemmer()
_lemmatizer = WordNetLemmatizer()


def _expand_contractions(text: str) -> str:
    for k, v in _CONTRACTIONS.items():
        text = re.sub(re.escape(k), v, text, flags=re.IGNORECASE)
    return text


def clean_text(text: str) -> str:
    text = str(text)
    text = unicodedata.normalize("NFC", text)
    text = _expand_contractions(text)
    text = re.sub(r"[^\w\s" + _COMBINING_MARKS_RANGE + "]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\d+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def lowercase_text(text: str) -> str:
    return text.lower()


def _remove_words_text(text: str, word_set: set[str]) -> str:
    # Guarded: if removing these words would wipe out a short message
    # entirely, keep the original text instead of losing all signal.
    kept = [w for w in text.split() if w not in word_set]
    return " ".join(kept) if kept else text


def tokenize(text: str) -> list[str]:
    return text.split()


def _is_ascii_alpha(token: str) -> bool:
    return bool(re.fullmatch(r"[a-z]+", token))


def stem_tokens(tokens: list[str]) -> list[str]:
    return [_stemmer.stem(t) if _is_ascii_alpha(t) else t for t in tokens]


def _wordnet_pos(tag: str) -> str:
    if tag.startswith("J"):
        return "a"
    if tag.startswith("V"):
        return "v"
    if tag.startswith("R"):
        return "r"
    return "n"


def lemmatize_tokens(tokens: list[str]) -> list[str]:
    ascii_tokens = [t for t in tokens if _is_ascii_alpha(t)]
    tagged = dict(pos_tag(ascii_tokens)) if ascii_tokens else {}
    out = []
    for t in tokens:
        if t in tagged:
            out.append(_lemmatizer.lemmatize(t, pos=_wordnet_pos(tagged[t])))
        else:
            out.append(t)
    return out


def preprocess_for_model(text: str) -> str:
    """Runs the full Stage 5-6 sequence and returns the final processed
    text, ready to be passed to the fitted TF-IDF vectorizer."""
    processed = clean_text(text)
    processed = lowercase_text(processed)
    processed = _remove_words_text(processed, ALL_STOPWORDS)
    processed = _remove_words_text(processed, FREQUENT_WORDS)
    processed = _remove_words_text(processed, RARE_WORDS)
    tokens = tokenize(processed)
    tokens = stem_tokens(tokens)
    tokens = lemmatize_tokens(tokens)
    return " ".join(tokens)
