import os
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler

AUDIO_FEATURES = [
    "danceability",
    "energy",
    "loudness",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo"
]

CLUSTER_NAMES = {
    0: "Acoustic & Mellow",
    1: "Danceable Pop / Latin",
    2: "High-Energy Electronic",
    3: "Upbeat R&B / Funk",
    4: "Intense EDM",
    5: "Dark Energetic"
}

class DataLoader:
    def __init__(self):
        self.df = None
        self.scaler = StandardScaler()
        self.X_scaled = None
        self.model_metadata = {
            "model_version": "1.0.0",
            "k": 6,
            "trained_at": "2026-06-01T00:00:00Z"
        }
        self.load_data()

    def load_data(self):
        # Resolve path to spotify_with_clusters.csv
        # Try multiple standard locations
        current_dir = Path(__file__).resolve().parent
        possible_paths = [
            current_dir.parent.parent / "Spotify_Algorthm" / "output" / "spotify_with_clusters.csv",
            current_dir.parent.parent.parent / "Spotify_Algorthm" / "output" / "spotify_with_clusters.csv",
            Path("/home/annaramlohith/Desktop/Spotify/Spotify_Algorthm/output/spotify_with_clusters.csv"),
            Path("Spotify_Algorthm/output/spotify_with_clusters.csv")
        ]

        loaded = False
        for path in possible_paths:
            if path.exists():
                print(f"[DataLoader] Loading dataset from: {path}")
                self.df = pd.read_csv(path)
                loaded = True
                break
        
        if not loaded:
            # Fall back to cleaned file
            fallback_paths = [
                current_dir.parent.parent / "Spotify_Algorthm" / "output" / "spotify_cleaned.csv",
                current_dir.parent.parent / "Spotify_Algorthm" / "spotify-dataset.csv"
            ]
            for path in fallback_paths:
                if path.exists():
                    print(f"[DataLoader] Loading fallback dataset from: {path}")
                    self.df = pd.read_csv(path)
                    # If it doesn't have clusters, assign default cluster 0 to all (though it should have it)
                    if "cluster" not in self.df.columns:
                        self.df["cluster"] = 0
                    loaded = True
                    break
        
        if self.df is None:
            raise FileNotFoundError("Could not find spotify_with_clusters.csv or raw dataset in any known paths.")

        # Clean duplicates or nulls if present (should already be clean, but just in case)
        self.df.drop_duplicates(subset="track_id", keep="first", inplace=True)
        self.df.dropna(subset=["track_name", "track_artist", "track_album_name"], inplace=True)
        self.df.reset_index(drop=True, inplace=True)

        if "duration_min" not in self.df.columns and "duration_ms" in self.df.columns:
            self.df["duration_min"] = self.df["duration_ms"] / 60000

        # Fit scaler on AUDIO_FEATURES
        self.X_scaled = self.scaler.fit_transform(self.df[AUDIO_FEATURES])

    def get_track_by_id(self, track_id: str):
        matches = self.df[self.df["track_id"] == track_id]
        if matches.empty:
            return None
        return matches.iloc[0].to_dict()

    def get_tracks_by_ids(self, track_ids: list):
        matches = self.df[self.df["track_id"].isin(track_ids)]
        return matches.to_dict(orient="records")

    def get_tracks_by_artist(self, artist_name: str):
        # Case insensitive substring search
        matches = self.df[self.df["track_artist"].str.lower() == artist_name.lower()]
        if matches.empty:
            # Substring match fallback
            matches = self.df[self.df["track_artist"].str.lower().str.contains(artist_name.lower(), na=False)]
        return matches.to_dict(orient="records")

    def get_tracks_by_playlist(self, playlist_name: str):
        matches = self.df[self.df["playlist_name"].str.lower() == playlist_name.lower()]
        if matches.empty:
            matches = self.df[self.df["playlist_name"].str.lower().str.contains(playlist_name.lower(), na=False)]
        return matches.to_dict(orient="records")

    def get_tracks_by_genre(self, genre_name: str):
        matches = self.df[self.df["playlist_genre"].str.lower() == genre_name.lower()]
        return matches.to_dict(orient="records")

    def get_tracks_by_cluster(self, cluster_id: int):
        matches = self.df[self.df["cluster"] == cluster_id]
        return matches.to_dict(orient="records")

    def search(self, query: str, limit: int = 50):
        if not query:
            return {"songs": [], "artists": [], "playlists": []}

        q_lower = query.lower()

        # Song search (by track_name or album_name)
        song_matches = self.df[
            self.df["track_name"].str.lower().str.contains(q_lower, na=False) |
            self.df["track_album_name"].str.lower().str.contains(q_lower, na=False)
        ].drop_duplicates(subset=["track_name", "track_artist"]).head(limit)

        # Artist search
        artist_matches = self.df[
            self.df["track_artist"].str.lower().str.contains(q_lower, na=False)
        ].drop_duplicates(subset=["track_artist"]).head(limit)

        # Playlist search
        playlist_matches = self.df[
            self.df["playlist_name"].str.lower().str.contains(q_lower, na=False)
        ].drop_duplicates(subset=["playlist_name"]).head(limit)

        # Process results
        songs = []
        for _, row in song_matches.iterrows():
            songs.append(row.to_dict())

        artists = []
        for _, row in artist_matches.iterrows():
            # Get track count and dominant genre/cluster for the artist
            artist_name = row["track_artist"]
            artist_songs = self.df[self.df["track_artist"] == artist_name]
            track_count = len(artist_songs)
            
            dominant_genre = "Unknown"
            if not artist_songs["playlist_genre"].empty:
                dominant_genre = artist_songs["playlist_genre"].mode()[0]
                
            dominant_cluster = -1
            if not artist_songs["cluster"].empty:
                dominant_cluster = int(artist_songs["cluster"].mode()[0])

            artists.append({
                "artist_name": artist_name,
                "track_count": track_count,
                "dominant_genre": dominant_genre,
                "dominant_cluster": dominant_cluster,
                "dominant_cluster_name": CLUSTER_NAMES.get(dominant_cluster, "Unknown")
            })

        playlists = []
        for _, row in playlist_matches.iterrows():
            p_name = row["playlist_name"]
            p_songs = self.df[self.df["playlist_name"] == p_name]
            track_count = len(p_songs)
            genre = p_songs["playlist_genre"].iloc[0] if not p_songs["playlist_genre"].empty else "Unknown"
            subgenre = p_songs["playlist_subgenre"].iloc[0] if not p_songs["playlist_subgenre"].empty else "Unknown"
            
            playlists.append({
                "playlist_name": p_name,
                "track_count": track_count,
                "playlist_genre": genre,
                "playlist_subgenre": subgenre
            })

        return {
            "songs": songs,
            "artists": artists,
            "playlists": playlists
        }

# Singleton instance
data_loader = DataLoader()
