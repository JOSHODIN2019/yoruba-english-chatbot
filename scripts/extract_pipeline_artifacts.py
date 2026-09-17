"""
Stage 9-15 support script: runs the verified notebook pipeline
(notebooks/yoruba_english_chatbot_ml_pipeline.ipynb) once, end to end, and
persists the resulting trained artifacts and static data to disk so the
FastAPI backend can load them without depending on a running Jupyter
kernel or retraining on every startup.

Run from the project root:
    python3 scripts/extract_pipeline_artifacts.py

Produces:
    models/tfidf_vectorizer.joblib
    models/intent_classifier.joblib
    data/intents.json              (150 intents: category, description, responses)
    data/preprocessing_config.json (stopwords, frequent words, rare words)
    data/dataset_metadata.json     (dataset counts, for the dataset-info service)
    data/model_metadata.json       (model config + real evaluation metrics)
"""
import json
import os

import joblib
import matplotlib
import nbformat

# Must be set before any pyplot import happens inside the executed notebook
# cells, otherwise plt.show() tries to open a blocking interactive GUI
# window with no event loop servicing it, and the script hangs forever.
matplotlib.use("Agg")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTEBOOK_DIR = os.path.join(PROJECT_ROOT, "notebooks")
NOTEBOOK_PATH = os.path.join(NOTEBOOK_DIR, "yoruba_english_chatbot_ml_pipeline.ipynb")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Read the pipeline directly from the notebook every run, so this script can
# never silently drift out of sync with it. Only the interactive input()
# cell and the final display cell (which depends on that input) are
# excluded, since this script has no user to prompt.
nb = nbformat.read(NOTEBOOK_PATH, as_version=4)
code_cells = [c["source"] for c in nb["cells"] if c["cell_type"] == "code"]
pipeline_cells = [c for c in code_cells if "input(" not in c and "user_message" not in c]
pipeline_source = "\n\n".join(pipeline_cells)

# The notebook's own code uses a relative path ("../data/RAPH dataset.csv")
# that assumes it is running from notebooks/, so replicate that here.
os.chdir(NOTEBOOK_DIR)

namespace = {}
print(f"Running {len(pipeline_cells)} pipeline cells read live from the notebook...")
exec(compile(pipeline_source, NOTEBOOK_PATH, "exec"), namespace)
print("Pipeline finished. Persisting artifacts...")

# ---- Trained model artifacts ----
joblib.dump(namespace["tfidf"], os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib"))
joblib.dump(namespace["intent_model"], os.path.join(MODELS_DIR, "intent_classifier.joblib"))

# ---- Intent catalogue + predefined responses (Section 6: JSON for static data) ----
bespoke = namespace["BESPOKE"]
intents_json = {
    intent: {
        "category": spec["category"],
        "description": spec["description"],
        "response_english": spec["resp_en"],
        "response_yoruba": spec["resp_yo"],
        "response_mixed": spec.get("resp_mixed", spec["resp_en"]),
    }
    for intent, spec in bespoke.items()
}
with open(os.path.join(DATA_DIR, "intents.json"), "w", encoding="utf-8") as f:
    json.dump(intents_json, f, ensure_ascii=False, indent=2)

# ---- Preprocessing config (fitted on training data, must be reused as-is) ----
preprocessing_config = {
    "stopwords": sorted(namespace["ALL_STOPWORDS"]),
    "frequent_words": sorted(namespace["FREQUENT_WORDS"]),
    "rare_words": sorted(namespace["RARE_WORDS"]),
}
with open(os.path.join(DATA_DIR, "preprocessing_config.json"), "w", encoding="utf-8") as f:
    json.dump(preprocessing_config, f, ensure_ascii=False, indent=2)

# ---- Dataset metadata (for the dataset-information service/endpoint) ----
df_chatbot = namespace["df_chatbot"]
lang_counts = df_chatbot["language"].value_counts().to_dict()
per_intent = df_chatbot.groupby("intent").size()
dataset_metadata = {
    "total_messages": int(len(df_chatbot)),
    "language_distribution": {k: int(v) for k, v in lang_counts.items()},
    "unique_intents": int(df_chatbot["intent"].nunique()),
    "examples_per_intent": {
        "min": int(per_intent.min()),
        "max": int(per_intent.max()),
        "mean": round(float(per_intent.mean()), 2),
        "median": float(per_intent.median()),
        "std": round(float(per_intent.std()), 2),
    },
    "train_test_split": {
        "training_messages": int(len(namespace["X_train_text"])),
        "testing_messages": int(len(namespace["X_test_text"])),
        "test_size": 0.2,
        "stratified": True,
        "random_state": 42,
    },
    "source_dataset": {
        "raw_sentence_pairs": int(len(namespace["df"])),
        "mined_real_examples": int(len(namespace["mined_examples"])),
    },
}
with open(os.path.join(DATA_DIR, "dataset_metadata.json"), "w", encoding="utf-8") as f:
    json.dump(dataset_metadata, f, ensure_ascii=False, indent=2)

# ---- Model metadata (for the model-information service/endpoint) ----
intent_model = namespace["intent_model"]
metrics_table = namespace["metrics_table"]
model_metadata = {
    "algorithm": "Logistic Regression (multinomial)",
    "solver": intent_model.solver,
    "penalty": intent_model.penalty,
    "C": intent_model.C,
    "max_iter": intent_model.max_iter,
    "iterations_to_converge": int(intent_model.n_iter_[0]),
    "num_classes": int(len(intent_model.classes_)),
    "num_features": int(namespace["X_train_tfidf"].shape[1]),
    "feature_extraction": "TF-IDF (TfidfVectorizer, fit on training text only)",
    "evaluation_metrics": dict(
        zip(metrics_table["Metric"], metrics_table["Score"].astype(float))
    ),
}
with open(os.path.join(DATA_DIR, "model_metadata.json"), "w", encoding="utf-8") as f:
    json.dump(model_metadata, f, ensure_ascii=False, indent=2)

print("Done. Artifacts written to models/ and data/.")
print(json.dumps(dataset_metadata, indent=2, ensure_ascii=False))
print(json.dumps(model_metadata, indent=2, ensure_ascii=False))
