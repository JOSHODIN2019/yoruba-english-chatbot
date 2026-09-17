"""
Intent classification service. Transforms already-preprocessed text with
the fitted TF-IDF vectorizer and predicts one of the 150 intents using the
trained Logistic Regression model. Never retrains or refits anything.
"""
from app.ml.model_loader import intent_classifier, tfidf_vectorizer


def predict_intent(processed_text: str) -> str:
    """`processed_text` must already have gone through
    preprocessing.pipeline.preprocess_for_model - this function only
    transforms and predicts, it does not preprocess."""
    vector = tfidf_vectorizer.transform([processed_text])
    return intent_classifier.predict(vector)[0]
