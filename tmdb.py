#All TMDB/poster logic
"""
tmdb.py
-------
Handles all communication with the TMDB (The Movie Database) API.

WHY A SEPARATE FILE?
    Network calls are unreliable. TMDB can be slow or temporarily down.
    By isolating this here, the rest of the app can import it and handle
    failures gracefully — recommendations still work, just without posters.

    Also, if you ever switch from TMDB to another poster source, you only
    change this one file. Nothing else needs to know.
"""

import os
import requests
from dotenv import load_dotenv


# Load variables from the .env file into os.environ.
# This must happen before we try to read the API key.
# If .env doesn't exist (e.g. on a server with env vars set directly),
# load_dotenv() does nothing — which is the correct behaviour.
load_dotenv()


# Read the API key from the environment.
# We read it once at module level, same reason as the pkl files in
# recommender.py: no point reading it on every single function call.
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

# Base URL for TMDB poster images.
# w500 = 500px wide. Other options: w185, w342, w780, original.
# w500 is a good balance between quality and load speed.
POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"

# Fallback image shown when a poster can't be fetched.
# This is a neutral grey placeholder from a public CDN.
# WHY NOT JUST RETURN None?
#   If we return None, the Streamlit UI needs an if/else check every time
#   it displays a poster. Returning a real URL means the UI code stays simple.
FALLBACK_POSTER = "https://via.placeholder.com/500x750?text=No+Poster"


def fetch_poster(movie_id):
    """
    Fetch the poster URL for a given TMDB movie ID.

    Parameters
    ----------
    movie_id : int
        The TMDB numeric ID for the movie (stored in your dataset).

    Returns
    -------
    str
        A full URL to the poster image, e.g.:
        "https://image.tmdb.org/t/p/w500/somepath.jpg"

        Returns FALLBACK_POSTER if:
            - The API key is missing
            - The network request fails
            - TMDB returns a response without a poster_path

    WHY RETURN A FALLBACK INSTEAD OF RAISING?
        Poster fetching is non-critical. If 1 out of 5 posters fails to load,
        we still want the other 4 to display. A fallback lets the UI carry on
        without special error handling for each movie card.
    """

    # Guard: if no API key is configured, don't even attempt the request.
    if not TMDB_API_KEY:
        print("Warning: TMDB_API_KEY is not set in .env")
        return FALLBACK_POSTER

    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"

    try:
        # timeout=5: don't wait more than 5 seconds.
        # Without a timeout, a slow TMDB response would freeze the entire app.
        response = requests.get(url, timeout=5)

        # raise_for_status() throws an exception if the HTTP status is 4xx/5xx.
        # Without this, a 404 response would silently return {"success": false}
        # and we'd crash on data['poster_path'] below.
        response.raise_for_status()

        data = response.json()

        # poster_path can be None even in a valid response (some movies have
        # no poster on TMDB). .get() safely returns None if the key is missing.
        poster_path = data.get('poster_path')

        if poster_path:
            return POSTER_BASE_URL + poster_path
        else:
            return FALLBACK_POSTER

    except requests.exceptions.RequestException as e:
        # This catches: timeouts, connection errors, HTTP errors (from
        # raise_for_status), and any other requests-related failure.
        # We print a warning so it shows up in your terminal, but we don't
        # crash the app.
        print(f"Warning: Could not fetch poster for movie_id {movie_id}: {e}")
        return FALLBACK_POSTER
