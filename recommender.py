import pickle
import os
import pandas as pd

# Absolute path — works regardless of which directory the server starts from.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

movies = pickle.load(open(os.path.join(BASE_DIR, 'data', 'movies.pkl'), 'rb'))
similarity = pickle.load(open(os.path.join(BASE_DIR, 'data', 'similarity.pkl'), 'rb'))


def get_all_titles():
    return sorted(movies['title'].values.tolist())


def recommend(movie_title, n=5):
    match = movies[movies['title'] == movie_title]

    if match.empty:
        raise ValueError(f"Movie '{movie_title}' not found in the dataset.")

    movie_index = match.index[0]
    distances = similarity[movie_index]

    movies_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:n + 1]

    results = []
    for row_index, score in movies_list:
        row = movies.iloc[row_index]
        results.append({
            'movie_id': int(row['movie_id']),
            'title': row['title'],
            'score': round(float(score), 3),
        })

    return results
