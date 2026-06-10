"""
recommender.py
--------------
Handles all recommendation logic.

This file has no knowledge of Streamlit, FastAPI, or any UI.
It only knows: given a movie title, return similar movies.

That separation means this same file will work in Milestone 1
(FastAPI) without any changes.
"""

import pickle
import pandas as pd


# ---------------------------------------------------------------------------
# Load data once when the module is imported.
#
# WHY: Loading pkl files is slow (relative to a function call). If we loaded
# inside the recommend() function, we'd re-read the file from disk on every
# single request. Loading at module level means it happens once at startup.
#
# HOW IT WORKS: When Python imports this file, these two lines run immediately.
# After that, `movies` and `similarity` live in memory for the lifetime of
# the process.
# ---------------------------------------------------------------------------

movies = pickle.load(open('data/movies.pkl', 'rb'))
similarity = pickle.load(open('data/similarity.pkl', 'rb'))


def get_all_titles():
    """
    Return a sorted list of all movie titles in the dataset.

    Used by the Streamlit dropdown (and later by the /search API).
    Keeping this here means app.py doesn't need to import pandas or
    touch the dataframe directly.
    """
    return sorted(movies['title'].values.tolist())


def recommend(movie_title, n=5):
    """
    Return the top-n most similar movies for a given title.

    Parameters
    ----------
    movie_title : str
        The exact title of the seed movie (must exist in the dataset).
    n : int
        How many recommendations to return. Default is 5.

    Returns
    -------
    list of dict
        Each dict has:
            - 'movie_id' : int    (TMDB ID, used to fetch posters)
            - 'title'    : str
            - 'score'    : float  (cosine similarity, 0.0–1.0, 3 decimal places)

    Raises
    ------
    ValueError
        If the movie_title is not found in the dataset.
        We raise an explicit error instead of silently returning []
        so the caller (app.py or the API) can decide how to handle it.

    WHY ValueError and not a silent return?
        In your notebook you used `print("Movie not found")` and returned
        None. That works for exploration but breaks in a UI — Streamlit
        would crash trying to iterate over None. An explicit exception
        lets every caller handle it in the right way for their context.
    """

    # --- Step 1: Find the row index for this movie ---
    # We match on title. .index[0] gets the integer position in the DataFrame.
    match = movies[movies['title'] == movie_title]

    if match.empty:
        raise ValueError(f"Movie '{movie_title}' not found in the dataset.")

    movie_index = match.index[0]

    # --- Step 2: Get similarity scores for this movie vs all others ---
    # similarity[movie_index] is a 1D array of floats (one per movie).
    # Value of 1.0 = identical, 0.0 = completely different.
    distances = similarity[movie_index]

    # --- Step 3: Sort by similarity score, descending ---
    # enumerate() pairs each score with its row index: [(0, 0.91), (1, 0.43), ...]
    # We sort by the score (x[1]), highest first.
    # [1:n+1] skips index 0 — that's the movie itself (similarity = 1.0).
    movies_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:n + 1]

    # --- Step 4: Build results ---
    # We return movie_id so the caller can fetch a poster without needing
    # to import pandas or know the DataFrame structure.
    results = []
    for row_index, score in movies_list:
        row = movies.iloc[row_index]
        results.append({
            'movie_id': int(row['movie_id']),    # int() because numpy int64
            'title': row['title'],               # isn't JSON-serialisable later
            'score': round(float(score), 3),     # float() because numpy float32
        })

    return results
