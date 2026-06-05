from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.repository.data_loader import data_loader, AUDIO_FEATURES, CLUSTER_NAMES
from app.schemas.api_schemas import TrackSchema, ArtistSchema

router = APIRouter(prefix="/artists", tags=["Artists"])

@router.get("/compare")
def compare_artists(
    name1: str = Query(..., description="First artist name"),
    name2: str = Query(..., description="Second artist name")
):
    artist1_tracks = data_loader.get_tracks_by_artist(name1)
    artist2_tracks = data_loader.get_tracks_by_artist(name2)
    
    if not artist1_tracks or not artist2_tracks:
        raise HTTPException(status_code=404, detail="One or both artists not found in dataset.")
        
    name1_actual = artist1_tracks[0]["track_artist"]
    name2_actual = artist2_tracks[0]["track_artist"]
    
    df_art1 = data_loader.df[data_loader.df["track_artist"] == name1_actual]
    df_art2 = data_loader.df[data_loader.df["track_artist"] == name2_actual]
    
    # Calculate fingerprints and deltas
    fingerprint1 = {}
    fingerprint2 = {}
    deltas = {}
    
    for feat in AUDIO_FEATURES:
        val1 = float(df_art1[feat].mean())
        val2 = float(df_art2[feat].mean())
        fingerprint1[feat] = val1
        fingerprint2[feat] = val2
        deltas[feat] = {
            "val1": val1,
            "val2": val2,
            "difference": val2 - val1,
            "abs_difference": abs(val2 - val1)
        }
        
    return {
        "artist1": {
            "artist_name": name1_actual,
            "track_count": len(artist1_tracks),
            "dominant_cluster": int(df_art1["cluster"].mode()[0]) if not df_art1["cluster"].empty else -1,
            "fingerprint": fingerprint1
        },
        "artist2": {
            "artist_name": name2_actual,
            "track_count": len(artist2_tracks),
            "dominant_cluster": int(df_art2["cluster"].mode()[0]) if not df_art2["cluster"].empty else -1,
            "fingerprint": fingerprint2
        },
        "deltas": deltas
    }

@router.get("/search", response_model=List[ArtistSchema])
def search_artists(q: str = Query(..., min_length=1)):
    try:
        results = data_loader.search(q, limit=50)
        return results["artists"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{artist_name}")
def get_artist(artist_name: str):
    artist_tracks = data_loader.get_tracks_by_artist(artist_name)
    if not artist_tracks:
        raise HTTPException(status_code=404, detail=f"Artist '{artist_name}' not found.")

    actual_artist_name = artist_tracks[0]["track_artist"]
    track_count = len(artist_tracks)
    df_artist = data_loader.df[data_loader.df["track_artist"] == actual_artist_name]
    
    dominant_genre = "Unknown"
    if not df_artist["playlist_genre"].empty:
        dominant_genre = df_artist["playlist_genre"].mode()[0]
        
    dominant_cluster = -1
    if not df_artist["cluster"].empty:
        dominant_cluster = int(df_artist["cluster"].mode()[0])

    top_tracks = sorted(artist_tracks, key=lambda x: x.get("track_popularity", 0), reverse=True)[:10]

    avg_profile = {}
    for feat in AUDIO_FEATURES:
        avg_profile[feat] = float(df_artist[feat].mean())

    return {
        "artist_name": actual_artist_name,
        "track_count": track_count,
        "dominant_genre": dominant_genre,
        "dominant_cluster": dominant_cluster,
        "dominant_cluster_name": CLUSTER_NAMES.get(dominant_cluster, "Unknown"),
        "audio_profile": avg_profile,
        "top_tracks": top_tracks
    }
