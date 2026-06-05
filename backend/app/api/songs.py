from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.schemas.api_schemas import TrackSchema
from app.repository.data_loader import data_loader, AUDIO_FEATURES

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.get("/compare")
def compare_songs(
    id1: str = Query(..., description="First track ID"),
    id2: str = Query(..., description="Second track ID")
):
    song1 = data_loader.get_track_by_id(id1)
    song2 = data_loader.get_track_by_id(id2)
    
    if not song1 or not song2:
        raise HTTPException(status_code=404, detail="One or both tracks not found in dataset.")
        
    # Calculate differences
    deltas = {}
    for feat in AUDIO_FEATURES:
        val1 = song1.get(feat, 0)
        val2 = song2.get(feat, 0)
        deltas[feat] = {
            "val1": float(val1),
            "val2": float(val2),
            "difference": float(val2 - val1),
            "abs_difference": float(abs(val2 - val1))
        }
        
    return {
        "song1": song1,
        "song2": song2,
        "deltas": deltas
    }

@router.get("/search", response_model=List[TrackSchema])
def search_songs(q: str = Query(..., min_length=1)):
    try:
        results = data_loader.search(q, limit=50)
        return results["songs"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{track_id}", response_model=TrackSchema)
def get_song(track_id: str):
    song = data_loader.get_track_by_id(track_id)
    if not song:
        raise HTTPException(status_code=404, detail=f"Song with track_id {track_id} not found.")
    return song
