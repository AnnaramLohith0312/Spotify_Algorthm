import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from app.repository.data_loader import data_loader, AUDIO_FEATURES, CLUSTER_NAMES

class RecommendationService:
    def __init__(self):
        self.dl = data_loader

    def _get_ranked_candidates(self, candidates_df: pd.DataFrame) -> pd.DataFrame:
        if candidates_df.empty:
            return candidates_df
            
        candidates = candidates_df.copy()
        pop_min = candidates["track_popularity"].min()
        pop_max = candidates["track_popularity"].max()

        if pop_max - pop_min > 0:
            candidates["popularity_norm"] = (
                candidates["track_popularity"] - pop_min
            ) / (pop_max - pop_min)
        else:
            candidates["popularity_norm"] = 1.0

        candidates["final_score"] = (
            0.85 * candidates["similarity"] +
            0.15 * candidates["popularity_norm"]
        )

        return candidates

    def recommend_by_song(self, track_id_or_name: str, top_n: int = 10):
        # 1. Fetch query song (by ID first, fallback to name search)
        query_song_dict = self.dl.get_track_by_id(track_id_or_name)
        if not query_song_dict:
            matches = self.dl.df[self.dl.df["track_name"].str.lower() == track_id_or_name.lower()]
            if matches.empty:
                matches = self.dl.df[self.dl.df["track_name"].str.lower().str.contains(track_id_or_name.lower(), na=False)]
            if matches.empty:
                raise ValueError(f"Track '{track_id_or_name}' not found in dataset.")
            query_song_dict = matches.iloc[0].to_dict()

        track_id = query_song_dict["track_id"]

        # Convert query song dict back to Series/DataFrame for processing
        query_song = pd.Series(query_song_dict)
        cluster_id = int(query_song["cluster"])

        # 2. Get candidates from same cluster (exclude the query song itself)
        candidates = self.dl.df[
            (self.dl.df["cluster"] == cluster_id) &
            (self.dl.df["track_id"] != track_id)
        ].copy()

        if candidates.empty:
            return {
                "query_song": query_song_dict,
                "recommendations": []
            }

        # 3. Compute cosine similarity
        X_candidates = self.dl.scaler.transform(candidates[AUDIO_FEATURES])
        X_query = self.dl.scaler.transform(query_song[AUDIO_FEATURES].values.reshape(1, -1))
        
        candidates["similarity"] = cosine_similarity(X_query, X_candidates)[0]
        
        # 4. Rank candidates (similarity + popularity norm)
        candidates = self._get_ranked_candidates(candidates)
        top_songs = candidates.nlargest(top_n, "final_score")

        # Convert back to list of dicts for API response
        recommendations = []
        for idx, row in top_songs.iterrows():
            rec_dict = row.to_dict()
            # Clean numeric types for JSON
            rec_dict["similarity"] = float(rec_dict["similarity"])
            rec_dict["popularity_norm"] = float(rec_dict["popularity_norm"])
            rec_dict["final_score"] = float(rec_dict["final_score"])
            recommendations.append(rec_dict)

        return {
            "query_song": query_song_dict,
            "recommendations": recommendations
        }

    def recommend_by_artist(self, artist_name: str, top_n: int = 10):
        # 1. Fetch artist tracks
        artist_songs = self.dl.df[
            self.dl.df["track_artist"].str.lower() == artist_name.lower()
        ].copy()

        if artist_songs.empty:
            # Fallback substring
            artist_songs = self.dl.df[
                self.dl.df["track_artist"].str.lower().str.contains(artist_name.lower(), na=False)
            ].copy()

        if artist_songs.empty:
            raise ValueError(f"Artist '{artist_name}' not found in dataset.")

        actual_artist_name = artist_songs["track_artist"].iloc[0]

        # 2. Compute average fingerprint vector
        artist_vector = artist_songs[AUDIO_FEATURES].mean().values.reshape(1, -1)
        artist_vector_scaled = self.dl.scaler.transform(artist_vector)

        # 3. Determine dominant cluster
        dominant_cluster = int(artist_songs["cluster"].mode()[0])

        # 4. Candidates are songs in dominant cluster not by this artist
        candidates = self.dl.df[
            (self.dl.df["cluster"] == dominant_cluster) &
            (self.dl.df["track_artist"].str.lower() != actual_artist_name.lower())
        ].copy()

        if candidates.empty:
            return {
                "artist_name": actual_artist_name,
                "dominant_cluster": dominant_cluster,
                "dominant_cluster_name": CLUSTER_NAMES.get(dominant_cluster, "Unknown"),
                "artist_fingerprint": artist_songs[AUDIO_FEATURES].mean().to_dict(),
                "recommendations": []
            }

        # 5. Compute cosine similarity
        X_candidates = self.dl.scaler.transform(candidates[AUDIO_FEATURES])
        candidates["similarity"] = cosine_similarity(artist_vector_scaled, X_candidates)[0]

        # 6. Rank candidates
        candidates = self._get_ranked_candidates(candidates)
        top_songs = candidates.nlargest(top_n, "final_score")

        recommendations = []
        for idx, row in top_songs.iterrows():
            rec_dict = row.to_dict()
            rec_dict["similarity"] = float(rec_dict["similarity"])
            rec_dict["popularity_norm"] = float(rec_dict["popularity_norm"])
            rec_dict["final_score"] = float(rec_dict["final_score"])
            recommendations.append(rec_dict)

        return {
            "artist_name": actual_artist_name,
            "dominant_cluster": dominant_cluster,
            "dominant_cluster_name": CLUSTER_NAMES.get(dominant_cluster, "Unknown"),
            "artist_fingerprint": artist_songs[AUDIO_FEATURES].mean().to_dict(),
            "recommendations": recommendations
        }

    def recommend_by_mood(self, mood_features: dict, genre_filter: str = None, top_n: int = 15):
        # Extract features from input
        query_vector = np.array([mood_features.get(f, 0.5) for f in AUDIO_FEATURES]).reshape(1, -1)
        query_vector_scaled = self.dl.scaler.transform(query_vector)

        # Apply filtering first
        candidates = self.dl.df.copy()
        if genre_filter:
            candidates = candidates[candidates["playlist_genre"].str.lower() == genre_filter.lower()].copy()

        if candidates.empty:
            return []

        # Calculate similarity
        X_candidates = self.dl.scaler.transform(candidates[AUDIO_FEATURES])
        candidates["similarity"] = cosine_similarity(query_vector_scaled, X_candidates)[0]

        # Rank candidates
        candidates = self._get_ranked_candidates(candidates)
        top_songs = candidates.nlargest(top_n, "final_score")

        recommendations = []
        for idx, row in top_songs.iterrows():
            rec_dict = row.to_dict()
            rec_dict["similarity"] = float(rec_dict["similarity"])
            rec_dict["popularity_norm"] = float(rec_dict["popularity_norm"])
            rec_dict["final_score"] = float(rec_dict["final_score"])
            recommendations.append(rec_dict)

        return recommendations

# Singleton instance
recommendation_service = RecommendationService()
