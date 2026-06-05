from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.repository.data_loader import data_loader, AUDIO_FEATURES

router = APIRouter(prefix="/genres", tags=["Genres"])

@router.get("")
def get_genres():
    df = data_loader.df
    genres_grouped = df.groupby("playlist_genre")
    
    results = []
    for name, group in genres_grouped:
        results.append({
            "genre_name": name,
            "track_count": len(group),
            "avg_popularity": float(group["track_popularity"].mean()),
            "avg_energy": float(group["energy"].mean()),
            "avg_danceability": float(group["danceability"].mean())
        })
        
    return results

@router.get("/{genre_name}")
def get_genre_details(genre_name: str):
    genre_tracks = data_loader.get_tracks_by_genre(genre_name)
    if not genre_tracks:
        raise HTTPException(status_code=404, detail=f"Genre '{genre_name}' not found.")
        
    df_genre = data_loader.df[data_loader.df["playlist_genre"].str.lower() == genre_name.lower()]
    
    # Calculate subgenre breakdown
    subgenres = df_genre["playlist_subgenre"].value_counts()
    subgenre_breakdown = []
    for sub, count in subgenres.items():
        sub_df = df_genre[df_genre["playlist_subgenre"] == sub]
        subgenre_breakdown.append({
            "subgenre": sub,
            "track_count": int(count),
            "avg_popularity": float(sub_df["track_popularity"].mean()),
            "avg_danceability": float(sub_df["danceability"].mean()),
            "avg_energy": float(sub_df["energy"].mean())
        })
        
    # Get top 20 tracks in this genre
    top_tracks = df_genre.nlargest(20, "track_popularity").to_dict(orient="records")
    
    # Feature averages
    avg_profile = {}
    for feat in AUDIO_FEATURES:
        avg_profile[feat] = float(df_genre[feat].mean())

    return {
        "genre_name": df_genre["playlist_genre"].iloc[0],
        "track_count": len(df_genre),
        "avg_popularity": float(df_genre["track_popularity"].mean()),
        "audio_profile": avg_profile,
        "subgenre_breakdown": subgenre_breakdown,
        "top_tracks": top_tracks
    }
