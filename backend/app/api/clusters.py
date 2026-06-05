from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.repository.data_loader import data_loader, AUDIO_FEATURES, CLUSTER_NAMES

router = APIRouter(prefix="/clusters", tags=["Clusters"])

CLUSTER_DESCRIPTIONS = {
    0: "Focuses on soft, acoustic, and low-tempo songs. High acousticness, low energy, and low loudness.",
    1: "Highly danceable pop, latin, and rap songs. High danceability, moderate-to-high energy, and clean loudness.",
    2: "Electronic and upbeat music with high energy and moderate danceability.",
    3: "Upbeat R&B, funk, and soul tracks with a high balance of groove and performance features.",
    4: "Intense, club-ready EDM, house, and electronic tracks. High energy, high loudness, and faster tempos.",
    5: "Dark, moody, high-energy electronic and indie tracks. Lower valence (happier tone) but very high energy."
}

@router.get("")
def get_clusters():
    df = data_loader.df
    results = []
    
    for c_id, name in CLUSTER_NAMES.items():
        c_df = df[df["cluster"] == c_id]
        
        # Audio averages
        avg_profile = {}
        for feat in AUDIO_FEATURES:
            avg_profile[feat] = float(c_df[feat].mean())
            
        results.append({
            "cluster_id": c_id,
            "cluster_name": name,
            "description": CLUSTER_DESCRIPTIONS.get(c_id, ""),
            "track_count": len(c_df),
            "avg_popularity": float(c_df["track_popularity"].mean()),
            "audio_profile": avg_profile
        })
        
    return results

@router.get("/{cluster_id}")
def get_cluster_details(cluster_id: int):
    if cluster_id not in CLUSTER_NAMES:
        raise HTTPException(status_code=404, detail=f"Cluster {cluster_id} does not exist (must be 0-5).")
        
    df_cluster = data_loader.df[data_loader.df["cluster"] == cluster_id]
    
    # Genres contained in cluster
    genres = df_cluster["playlist_genre"].value_counts()
    genres_contained = []
    for g, count in genres.items():
        genres_contained.append({
            "genre": g,
            "count": int(count),
            "percentage": float(count / len(df_cluster))
        })
        
    # Top artists in this cluster
    artists = df_cluster["track_artist"].value_counts().head(10)
    top_artists = []
    for a, count in artists.items():
        top_artists.append({
            "artist_name": a,
            "track_count": int(count)
        })
        
    # Top tracks in cluster sorted by popularity
    top_tracks = df_cluster.nlargest(15, "track_popularity").to_dict(orient="records")
    
    # Audio profile
    avg_profile = {}
    for feat in AUDIO_FEATURES:
        avg_profile[feat] = float(df_cluster[feat].mean())
        
    return {
        "cluster_id": cluster_id,
        "cluster_name": CLUSTER_NAMES[cluster_id],
        "description": CLUSTER_DESCRIPTIONS.get(cluster_id, ""),
        "track_count": len(df_cluster),
        "avg_popularity": float(df_cluster["track_popularity"].mean()),
        "audio_profile": avg_profile,
        "genres_contained": genres_contained,
        "top_artists": top_artists,
        "top_tracks": top_tracks
    }
