"""
Ensures the NLTK corpora/models the preprocessing and language-detection
services need are present before anything tries to use them.

This matters for deployment specifically: this repo's local dev machine
already had these downloaded from earlier work, which silently hid the
fact that nothing in the app actually guaranteed their presence. A fresh
environment (e.g. a new Render instance) starts with none of them
downloaded, and `stopwords.words("english")` (called at import time in
language_detection/detector.py) would crash immediately on startup
without this.

nltk.download() checks its local cache first and returns quickly if a
package is already present, so calling this from multiple modules (both
preprocessing/pipeline.py and language_detection/detector.py import it)
is safe and cheap after the first call.
"""
import nltk

_REQUIRED_PACKAGES = [
    ("corpora/stopwords", "stopwords"),
    ("corpora/wordnet", "wordnet"),
    ("taggers/averaged_perceptron_tagger_eng", "averaged_perceptron_tagger_eng"),
]


def ensure_nltk_data() -> None:
    for path, package_name in _REQUIRED_PACKAGES:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(package_name, quiet=True)


ensure_nltk_data()
