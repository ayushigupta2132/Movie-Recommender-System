#All TMDB/poster logic
import os
import requests
from dotenv import load_dotenv

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"
FALLBACK_POSTER = "https://via.placeholder.com/500x750?text=No+Poster"


def fetch_poster(movie_id):

    if not TMDB_API_KEY:
        print("Warning: TMDB_API_KEY is not set in .env")
        return FALLBACK_POSTER

    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        data = response.json()

        print("TMDB RESPONSE:", data)

        poster_path = data.get("poster_path")

        if poster_path:
            return POSTER_BASE_URL + poster_path
        else:
            print(f"No poster_path found for movie_id {movie_id}")
            return FALLBACK_POSTER

    except requests.exceptions.RequestException as e:
        print(f"Warning: Could not fetch poster for movie_id {movie_id}: {e}")
        return FALLBACK_POSTER