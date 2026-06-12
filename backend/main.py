import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

from recommender import recommend, get_all_titles
from tmdb import fetch_poster

app = FastAPI(
    title="Movie Recommender API",
    description="Content-based movie recommendation engine using cosine similarity on TMDB metadata.",
    version="1.0.0",
)

# In production ALLOWED_ORIGINS is set to the Vercel URL via Render env vars.
# Locally it falls back to wildcard so dev still works without configuration.
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


class MovieResult(BaseModel):
    movie_id: int
    title: str
    score: float
    poster_url: str


class RecommendResponse(BaseModel):
    seed_movie: str
    recommendations: List[MovieResult]


class SearchResult(BaseModel):
    title: str


class HealthResponse(BaseModel):
    status: str
    movie_count: int


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    all_titles = get_all_titles()
    return HealthResponse(status="ok", movie_count=len(all_titles))


@app.get("/search", response_model=List[SearchResult], tags=["Movies"])
def search_movies(q: str = Query(..., min_length=1)):
    all_titles = get_all_titles()
    q_lower = q.lower()
    matches = [t for t in all_titles if q_lower in t.lower()]
    return [SearchResult(title=t) for t in matches[:10]]


@app.get("/recommend", response_model=RecommendResponse, tags=["Movies"])
def get_recommendations(
    title: str = Query(..., min_length=1),
    n: int = Query(default=5, ge=1, le=20)
):
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

    return RecommendResponse(seed_movie=title, recommendations=recommendations)
