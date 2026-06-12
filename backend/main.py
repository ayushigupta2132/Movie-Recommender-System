import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from recommender import recommend, get_all_titles
from tmdb import fetch_poster

app = FastAPI(
    title="Movie Recommender API",
    description="Content-based movie recommendation engine using cosine similarity on TMDB metadata.",
    version="1.0.0",
    # docs_url="/docs" is the default — the interactive Swagger UI
    # redoc_url="/redoc" is also available — a cleaner read-only view
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       
    allow_methods=["GET"],     
    allow_headers=["*"],
)

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

#Routes

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    
    all_titles = get_all_titles()
    return HealthResponse(
        status="ok",
        movie_count=len(all_titles)
    )


@app.get("/search", response_model=List[SearchResult], tags=["Movies"])
def search_movies(
    q: str = Query(..., min_length=1, description="Search query string")
):
    
    all_titles = get_all_titles()

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
    