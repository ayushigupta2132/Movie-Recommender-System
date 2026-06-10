#Streamlit UI only (cleaned)
"""
app.py
------
Streamlit UI for the Movie Recommender System.

This file ONLY handles what the user sees and interacts with.
It does NOT contain any ML logic or API calls — those live in:
    - recommender.py  (similarity computation)
    - tmdb.py         (poster fetching)

WHY THIS SEPARATION MATTERS:
    When we add a FastAPI backend in Milestone 1, recommender.py plugs
    in directly with zero changes. app.py is thrown away and replaced
    with a React frontend — and nothing in recommender.py cares.
"""

import streamlit as st
from recommender import recommend, get_all_titles
from tmdb import fetch_poster


# ---------------------------------------------------------------------------
# Page configuration
# Must be the first Streamlit call in the file.
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Movie Recommender",
    page_icon="🎬",
    layout="wide",
)


# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
st.title("🎬 Movie Recommender System")
st.caption("Select a movie you like and we'll find 5 similar ones.")


# ---------------------------------------------------------------------------
# Movie selection dropdown
#
# get_all_titles() is imported from recommender.py.
# app.py doesn't know or care HOW the titles are stored — it just gets a list.
# ---------------------------------------------------------------------------
all_titles = get_all_titles()

selected_movie = st.selectbox(
    "Select a movie",
    options=all_titles,
)


# ---------------------------------------------------------------------------
# Recommend button
# ---------------------------------------------------------------------------
if st.button("Recommend", type="primary"):

    # --- Call the recommender ---
    # recommend() returns a list of dicts: [{'movie_id': ..., 'title': ...}]
    # We wrap it in try/except because recommend() raises ValueError if the
    # movie isn't found. This shouldn't happen via the dropdown, but it's
    # good practice — and a great interview talking point.
    try:
        recommendations = recommend(selected_movie)
    except ValueError as e:
        st.error(str(e))
        st.stop()  # Halt execution — don't try to render cards below.

    # --- Fetch posters ---
    # We build a list of poster URLs before rendering anything.
    # fetch_poster() always returns a URL (real or fallback) — it never crashes.
    posters = [fetch_poster(movie['movie_id']) for movie in recommendations]

    # --- Render recommendation cards ---
    # st.columns(5) creates 5 equal-width columns side by side.
    # zip() pairs each column with its corresponding movie + poster.
    cols = st.columns(5)

    for col, movie, poster_url in zip(cols, recommendations, posters):
        with col:
            st.image(poster_url, use_container_width=True)
            st.caption(movie['title'])
