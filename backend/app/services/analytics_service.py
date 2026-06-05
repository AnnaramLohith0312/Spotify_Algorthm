import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from app.repository.data_loader import data_loader, AUDIO_FEATURES

class AnalyticsService:
    def __init__(self):
        self.dl = data_loader
        self._precompute_pca()

    def _precompute_pca(self):
        # Fit PCA on the full scaled dataset
        self.pca = PCA(n_components=2, random_state=42)
        self.X_pca = self.pca.fit_transform(self.dl.X_scaled)
        
        # Save PC1 and PC2 back to the dataframe for easy access
        self.dl.df["pc1"] = self.X_pca[:, 0]
        self.dl.df["pc2"] = self.X_pca[:, 1]

    def get_overview_stats(self):
        df = self.dl.df
        total_tracks = int(df["track_id"].nunique())
        total_artists = int(df["track_artist"].nunique())
        total_playlists = int(df["playlist_name"].nunique())
        total_genres = int(df["playlist_genre"].nunique())
        total_subgenres = int(df["playlist_subgenre"].nunique())
        total_clusters = int(df["cluster"].nunique())

        # Average popularity
        avg_popularity = float(df["track_popularity"].mean())
        
        # Genre counts
        genre_counts = df["playlist_genre"].value_counts().to_dict()
        genre_distribution = [{"genre": k, "count": int(v)} for k, v in genre_counts.items()]

        return {
            "total_tracks": total_tracks,
            "total_artists": total_artists,
            "total_playlists": total_playlists,
            "total_genres": total_genres,
            "total_subgenres": total_subgenres,
            "total_clusters": total_clusters,
            "average_popularity": avg_popularity,
            "genre_distribution": genre_distribution,
            "model_metadata": self.dl.model_metadata
        }

    def get_genre_analytics(self):
        df = self.dl.df
        # Mean features by genre
        genre_means = df.groupby("playlist_genre")[AUDIO_FEATURES + ["track_popularity"]].mean().reset_index()
        
        # Format for frontend consumption
        genre_profiles = []
        for idx, row in genre_means.iterrows():
            profile = row.to_dict()
            # Convert values to native floats
            for key, val in profile.items():
                if key != "playlist_genre":
                    profile[key] = float(val)
            genre_profiles.append(profile)
            
        return genre_profiles

    def get_correlation_matrix(self):
        # Select numeric fields for correlation (same as spotify.py NUM_COLS)
        num_cols = [
            "track_popularity", "danceability", "energy", "loudness", 
            "speechiness", "acousticness", "instrumentalness", "liveness", 
            "valence", "tempo", "duration_min"
        ]
        
        corr_df = self.dl.df[num_cols].corr()
        
        # Build a list of row dicts for easy rendering in frontend custom heatmap
        features = list(corr_df.index)
        matrix = []
        for feat1 in features:
            row_data = {"feature": feat1}
            for feat2 in features:
                row_data[feat2] = float(corr_df.loc[feat1, feat2])
            matrix.append(row_data)
            
        return {
            "features": features,
            "matrix": matrix
        }

    def get_cluster_scatter_data(self, sample_size: int = 1500):
        # We need to downsample for the frontend scatter plot. 
        # Stratify by cluster to make sure we represent all clusters equally.
        df = self.dl.df
        
        clusters = df["cluster"].unique()
        samples_per_cluster = sample_size // len(clusters)
        
        sampled_dfs = []
        for c in clusters:
            cluster_subset = df[df["cluster"] == c]
            if len(cluster_subset) > samples_per_cluster:
                sampled_dfs.append(cluster_subset.sample(n=samples_per_cluster, random_state=42))
            else:
                sampled_dfs.append(cluster_subset)
                
        sampled_df = pd.concat(sampled_dfs).reset_index(drop=True)
        
        # Build coordinates list
        scatter_points = []
        for idx, row in sampled_df.iterrows():
            scatter_points.append({
                "track_id": row["track_id"],
                "track_name": row["track_name"],
                "track_artist": row["track_artist"],
                "cluster": int(row["cluster"]),
                "playlist_genre": row["playlist_genre"],
                "pc1": float(row["pc1"]),
                "pc2": float(row["pc2"])
            })
            
        return scatter_points

    def get_cluster_centroids(self):
        # Calculate centroids of scale-normalized audio features
        df = self.dl.df
        centroids = df.groupby("cluster")[AUDIO_FEATURES].mean().reset_index()
        
        centroids_list = []
        for idx, row in centroids.iterrows():
            c_dict = row.to_dict()
            c_dict["cluster"] = int(c_dict["cluster"])
            for key, val in c_dict.items():
                if key != "cluster":
                    c_dict[key] = float(val)
            centroids_list.append(c_dict)
            
        return centroids_list

    def get_genre_cluster_composition(self):
        # Crosstab playlist_genre and cluster
        df = self.dl.df
        crosstab = pd.crosstab(df["playlist_genre"], df["cluster"])
        crosstab_pct = crosstab.div(crosstab.sum(axis=1), axis=0)
        
        composition = []
        for genre in crosstab_pct.index:
            genre_data = {"playlist_genre": genre}
            for cluster_id in crosstab_pct.columns:
                genre_data[f"cluster_{cluster_id}"] = float(crosstab_pct.loc[genre, cluster_id])
            composition.append(genre_data)
            
        return composition

    def get_playlist_analytics(self):
        df = self.dl.df
        playlists_df = df.drop_duplicates(subset=["playlist_name"])
        genre_counts = playlists_df["playlist_genre"].value_counts().to_dict()
        genre_distribution = [{"genre": k, "count": int(v)} for k, v in genre_counts.items()]
        
        playlists_grouped = df.groupby("playlist_name")
        top_playlists = []
        for name, group in playlists_grouped:
            top_playlists.append({
                "playlist_name": name,
                "track_count": len(group),
                "playlist_genre": group["playlist_genre"].iloc[0] if not group["playlist_genre"].empty else "Unknown",
                "avg_popularity": float(group["track_popularity"].mean())
            })
        top_playlists = sorted(top_playlists, key=lambda x: x["avg_popularity"], reverse=True)[:10]

        counts = [len(g) for _, g in playlists_grouped]
        avg_tracks = float(np.mean(counts)) if counts else 0.0

        return {
            "total_playlists": len(playlists_grouped),
            "avg_track_count": avg_tracks,
            "genre_distribution": genre_distribution,
            "top_playlists_by_popularity": top_playlists
        }

# Singleton instance
analytics_service = AnalyticsService()

