"""
Stage 16: End-to-end ML pipeline test.

Runs real messages through the extracted services (preprocessing ->
language detection + intent classification -> response selection) and
checks the results against the exact worked examples already verified in
notebooks/yoruba_english_chatbot_ml_pipeline.ipynb Stage 10, so the
extraction is confirmed behaviourally identical to the notebook, not just
"looks right."
"""
import pytest

from app.services.intent_classification.classifier import predict_intent
from app.services.language_detection.detector import detect_language
from app.services.preprocessing.pipeline import preprocess_for_model
from app.services.response_selection.selector import select_response


def run_pipeline(message: str) -> dict:
    processed = preprocess_for_model(message)
    intent = predict_intent(processed)
    language = detect_language(message)
    response = select_response(intent, language)
    return {
        "processed_text": processed,
        "detected_language": language,
        "predicted_intent": intent,
        "response": response,
    }


@pytest.mark.parametrize(
    "message,expected_language,expected_intent,expected_response",
    [
        ("Hello", "English", "greeting", "Hello! How can I help you?"),
        (
            "Kí ni orúkọ rẹ?",
            "Yoruba",
            "ask_bot_name",
            "Orúkọ mi ni Raph, olùrànlọ́wọ́ rẹ.",
        ),
        (
            "Please jọ̀ọ́ help me",
            "Mixed",
            "asking_for_help",
            "Sure! Màá ràn ẹ́ lọ́wọ́.",
        ),
        (
            "What can you help me with?",
            "English",
            "asking_for_help",
            "Sure, I'll be happy to help you.",
        ),
        (
            "Thank you so much",
            "English",
            "thanks",
            "You're welcome! I'm happy I could help.",
        ),
    ],
)
def test_matches_notebook_worked_examples(
    message, expected_language, expected_intent, expected_response
):
    result = run_pipeline(message)
    assert result["detected_language"] == expected_language
    assert result["predicted_intent"] == expected_intent
    assert result["response"] == expected_response


def test_yoruba_diacritics_survive_preprocessing():
    """Regression test for the Stage 5 combining-mark bug: tone marks must
    never be silently stripped during preprocessing."""
    processed = preprocess_for_model("Ẹ káàárọ̀, báwo ni oorun.")
    assert "káàárọ̀" in processed
    assert "sọ rọ" not in processed  # the corrupted form the old bug produced


def test_vectorizer_is_never_refit():
    """The fitted vocabulary size must stay constant across calls -
    proves transform() is used, not fit_transform()."""
    from app.ml.model_loader import tfidf_vectorizer

    vocab_size_before = len(tfidf_vectorizer.vocabulary_)
    predict_intent(preprocess_for_model("some completely novel unseen message"))
    vocab_size_after = len(tfidf_vectorizer.vocabulary_)
    assert vocab_size_before == vocab_size_after
