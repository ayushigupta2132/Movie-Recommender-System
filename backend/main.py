"""
backend/main.py
---------------
FastAPI backend for the Movie Recommender System.

This file has three jobs:
    1. Define what the API endpoints are (the routes)
    2. Define what the responses look like (Pydantic models)
    3. Handle errors cleanly so callers always get useful JSON

It does NOT contain any ML logic or TMDB logic.
It delegates entirely to recommender.py and tmdb.py.

HOW TO RUN:
    From the project root (movie-recommender/):
        uvicorn backend.main:app --reload

    Then open: http://127.0.0.1:8000/docs
    The /docs page is free with FastAPI — it's a fully interactive
    API explorer. You can test every endpoint right in the browser.
"""

import sys
import os

# ---------------------------------------------------------------------------
# Path fix — why this is needed
#
# When you run `uvicorn backend.main:app` from the project root, Python's
# module search path starts at the project root. That means `import recommender`
# works fine.
#
# But if someone runs `python main.py` from inside the backend/ folder,
# Python's path starts at backend/ and `import recommender` fails because
# recommender.py is one level up.
#
# This two-liner adds the project root to the path regardless of where the
# file is invoked from.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from recommender import recommend, get_all_titles
from tmdb import fetch_poster


# ---------------------------------------------------------------------------
# App initialisation
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Movie Recommender API",
    description="Content-based movie recommendation engine using cosine similarity on TMDB metadata.",
    version="1.0.0",
    # docs_url="/docs" is the default — the interactive Swagger UI
    # redoc_url="/redoc" is also available — a cleaner read-only view
)


# ---------------------------------------------------------------------------
# CORS middleware
#
# WHAT IS CORS?
#   When your React frontend (running on localhost:5173) calls this API
#   (running on localhost:8000), the browser blocks the request by default.
#   This is the browser's Same-Origin Policy — a security feature.
#
#   CORS middleware tells the browser: "these origins are allowed to call me."
#
# WHY allow_origins=["*"] for now?
#   During local development, wildcard is fine and avoids friction.
#   In Milestone 4 (deployment) we'll tighten this to the actual Vercel URL.
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Tightened in Milestone 4 to your Vercel URL
    allow_methods=["GET"],     # This API is read-only — no POST/PUT/DELETE
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic response models
#
# WHAT ARE THESE?
#   These classes define the exact shape of every API response.
#   FastAPI uses them to:
#       1. Validate the data before sending (no accidental None fields)
#       2. Auto-generate the /docs schema so consumers know what to expect
#       3. Serialize Python objects to JSON automatically
#
# INTERVIEW ANSWER:
#   "I used Pydantic models as contracts between the backend and frontend.
#    Any response that doesn't match the model is caught at the API layer,
#    not in the React code."
# ---------------------------------------------------------------------------

class MovieResult(BaseModel):
    """A single recommended movie."""
    movie_id: int
    title: str
    score: float        # Cosine similarity score, 0.0 to 1.0
    poster_url: str     # Full TMDB poster URL, or fallback placeholder


class RecommendResponse(BaseModel):
    """Response for GET /recommend/{movie_title}"""
    seed_movie: str                     # The movie the user searched for
    recommendations: List[MovieResult]  # List of similar movies


class SearchResult(BaseModel):
    """A single search result (title only — no poster needed for autocomplete)."""
    title: str


class HealthResponse(BaseModel):
    """Response for GET /health"""
    status: str
    movie_count: int   # Tells you the model loaded successfully


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """
    Confirms the API is running and the model data is loaded.

    WHY A HEALTH ENDPOINT?
        In production, platforms like Render ping /health to check if your
        server is alive. If it returns 200, the server stays up. If it
        returns 500, the platform restarts it.

        For an interview: "I added a health endpoint so the deployment
        platform can verify the model loaded before routing traffic."
    """
    all_titles = get_all_titles()
    return HealthResponse(
        status="ok",
        movie_count=len(all_titles)
    )


@app.get("/search", response_model=List[SearchResult], tags=["Movies"])
def search_movies(
    q: str = Query(..., min_length=1, description="Search query string")
):
    """
    Return movies whose titles contain the query string (case-insensitive).

    Used by the React frontend's autocomplete search bar.

    Parameters
    ----------
    q : str
        The search string. Minimum 1 character (enforced by FastAPI/Pydantic).
        Example: /search?q=batman

    Returns
    -------
    List of up to 10 matching titles.

    WHY LIMIT TO 10?
        An autocomplete dropdown showing 200 results is unusable.
        10 is enough to find what you're looking for.

    WHY Query(...) ?
        The `...` means the parameter is required (no default).
        `min_length=1` means FastAPI rejects empty strings with a 422 error
        automatically — we don't write that validation ourselves.
    """
    all_titles = get_all_titles()

    # Case-insensitive substring match
    # e.g. q="bat" matches "Batman Begins", "Batman v Superman", etc.
    q_lower = q.lower()
    matches = [t for t in all_titles if q_lower in t.lower()]

    # Limit results to 10 for autocomplete usability
    return [SearchResult(title=t) for t in matches[:10]]


@app.get(
    "/recommend/{movie_title}",
    response_model=RecommendResponse,
    tags=["Movies"]
)
@app.get(
    "/recommend",
    response_model=RecommendResponse,
    tags=["Movies"]
)
def get_recommendations(
    title: str = Query(..., min_length=1, description="Exact movie title"),
    n: int = Query(default=5, ge=1, le=20, description="Number of recommendations")
):
    """
    Return the top-n most similar movies for a given title, with posters.
    Example: /recommend?title=Batman+Begins
    """
    try:
        results = recommend(title, n=n)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    recommendations = []
    for movie in results:
        recommendations.append(
            MovieResult(
                movie_id=movie['movie_id'],
                title=movie['title'],
                score=movie['score'],
                poster_url=fetch_poster(movie['movie_id']),
            )
        )

    return RecommendResponse(
        seed_movie=title,
        recommendations=recommendations
    )
    """
    Return the top-n most similar movies for a given title, with posters.

    Parameters
    ----------
    movie_title : str
        Exact movie title (URL-encoded). Example: /recommend/Batman%20Begins
    n : int
        How many recommendations to return. Default 5, max 20.
        `ge=1` means greater-or-equal to 1 (FastAPI validates this).
        `le=20` means less-or-equal to 20.

    Returns
    -------
    RecommendResponse with seed_movie and a list of MovieResult objects.

    Raises
    ------
    404  if the movie title is not in the dataset.
    500  if something unexpected breaks in the recommendation logic.

    WHY 404 AND NOT 400?
        400 = "your request was malformed."
        404 = "the thing you asked for doesn't exist."
        A valid title that's just not in our dataset is a 404, not a 400.
    """

    # --- Call the recommender ---
    # recommend() raises ValueError if movie_title isn't in the dataset.
    # We catch it here and convert it to an HTTP 404.
    # The frontend will receive: {"detail": "Movie 'X' not found in the dataset."}
    try:
        results = recommend(movie_title, n=n)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # --- Enrich each result with a poster URL ---
    # fetch_poster() never raises — it returns a fallback URL on any failure.
    # So this loop is safe to run without a try/except.
    recommendations = []
    for movie in results:
        recommendations.append(
            MovieResult(
                movie_id=movie['movie_id'],
                title=movie['title'],
                score=movie['score'],
                poster_url=fetch_poster(movie['movie_id']),
            )
        )

    return RecommendResponse(
        seed_movie=movie_title,
        recommendations=recommendations
    )
