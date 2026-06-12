import os
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

HF_BASE = "https://huggingface.co/ayushigupta6279/movie-recommender/resolve/main"

ARTIFACTS = [
    ("movies.pkl",     f"{HF_BASE}/movies.pkl"),
    ("similarity.pkl", f"{HF_BASE}/similarity.pkl"),
]


def download_artifacts():
    os.makedirs(DATA_DIR, exist_ok=True)

    for filename, url in ARTIFACTS:
        dest = os.path.join(DATA_DIR, filename)
        if os.path.exists(dest):
            print(f"[startup] {filename} already present, skipping download.")
            continue

        print(f"[startup] Downloading {filename} from Hugging Face...")
        try:
            urllib.request.urlretrieve(url, dest)
            size_mb = os.path.getsize(dest) / (1024 * 1024)
            print(f"[startup] {filename} downloaded ({size_mb:.1f} MB)")
        except Exception as e:
            print(f"[startup] ERROR downloading {filename}: {e}")
            raise


if __name__ == "__main__":
    download_artifacts()
    print("[startup] All artifacts ready.")
