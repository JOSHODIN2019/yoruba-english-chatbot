"""
Loads the trained TF-IDF vectorizer and Logistic Regression model once,
at import time, from the artifacts produced by
scripts/extract_pipeline_artifacts.py.

The vectorizer must NEVER be refitted here - it was fit on the training
split only (see notebooks/yoruba_english_chatbot_ml_pipeline.ipynb Stage
7), and refitting on new text at prediction time would silently change
its vocabulary and invalidate the trained model's coefficients.
"""
from pathlib import Path

import joblib

_MODELS_DIR = Path(__file__).resolve().parents[3] / "models"

tfidf_vectorizer = joblib.load(_MODELS_DIR / "tfidf_vectorizer.joblib")
intent_classifier = joblib.load(_MODELS_DIR / "intent_classifier.joblib")
