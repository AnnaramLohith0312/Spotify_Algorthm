from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.repository.data_loader import data_loader, AUDIO_FEATURES
from app.schemas.api_schemas import PlaylistSchema

router = APIRouter(prefix="/playlists", tags=["Playlists"])

@router.get("")
def get_playlists():
    df = data_loader.df
    playlists_grouped = df.groupby("playlist_name")
    
    results = []
    for name, group in playlists_grouped:
        genre = group["playlist_genre"].iloc[0] if not group["playlist_genre"].empty else "Unknown"
        subgenre = group["playlist_subgenre"].iloc[0] if not group["playlist_subgenre"].empty else "Unknown"
        
        results.append({
            "playlist_name": name,
            "track_count": len(group),
            "playlist_genre": genre,
            "playlist_subgenre": subgenre,
            "avg_popularity": float(group["track_popularity"].mean())
        })
        
    # Sort by track count descending
    results = sorted(results, key=lambda x: x["track_count"], reverse=True)
    return results

@router.get("/search", response_model=List[PlaylistSchema])
def search_playlists(q: str = Query(..., min_length=1)):
    try:
        results = data_loader.search(q, limit=50)
        return results["playlists"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{playlist_name}")
def get_playlist_details(playlist_name: str):
    playlist_tracks = data_loader.get_tracks_by_playlist(playlist_name)
    if not playlist_tracks:
        raise HTTPException(status_code=404, detail=f"Playlist '{playlist_name}' not found.")
        
    df_playlist = data_loader.df[data_loader.df["playlist_name"] == playlist_tracks[0]["playlist_name"]]
    
    genre = df_playlist["playlist_genre"].iloc[0] if not df_playlist["playlist_genre"].empty else "Unknown"
    subgenre = df_playlist["playlist_subgenre"].iloc[0] if not df_playlist["playlist_subgenre"].empty else "Unknown"
    
    # Calculate audio feature averages
    avg_profile = {}
    for feat in AUDIO_FEATURES:
        avg_profile[feat] = float(df_playlist[feat].mean())
        
    return {
        "playlist_name": df_playlist["playlist_name"].iloc[0],
        "track_count": len(df_playlist),
        "playlist_genre": genre,
        "playlist_subgenre": subgenre,
        "avg_popularity": float(df_playlist["track_popularity"].mean()),
        "audio_profile": avg_profile,
        "tracks": playlist_tracks[:30] # Top 30 tracks for preview
    }
