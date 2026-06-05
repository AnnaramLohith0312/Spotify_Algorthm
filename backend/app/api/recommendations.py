from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from app.schemas.api_schemas import (
    SongRecommendationsResponse, 
    ArtistRecommendationsResponse,
    MoodRecommendationRequest,
    TrackSchema,
    BookmarkItem,
    BookmarkResponse
)
from app.services.recommendation_service import recommendation_service
from app.database.saved_store import saved_store

router = APIRouter(prefix="", tags=["Recommendations"])

@router.get("/recommend/song/{track_id}", response_model=SongRecommendationsResponse)
def recommend_by_song(track_id: str, top_n: int = Query(10, ge=1, le=50)):
    try:
        results = recommendation_service.recommend_by_song(track_id, top_n)
        return results
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@router.get("/recommend/artist/{artist_name}", response_model=ArtistRecommendationsResponse)
def recommend_by_artist(artist_name: str, top_n: int = Query(10, ge=1, le=50)):
    try:
        results = recommendation_service.recommend_by_artist(artist_name, top_n)
        return results
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@router.post("/recommend/mood")
def recommend_by_mood(request: MoodRecommendationRequest):
    try:
        mood_feats = {
            "danceability": request.danceability,
            "energy": request.energy,
            "speechiness": request.speechiness,
            "acousticness": request.acousticness,
            "instrumentalness": request.instrumentalness,
            "liveness": request.liveness,
            "valence": request.valence,
            "tempo": request.tempo,
            "loudness": request.loudness
        }
        
        results = recommendation_service.recommend_by_mood(
            mood_features=mood_feats,
            genre_filter=request.genre_filter,
            top_n=request.top_n
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mood recommendation failed: {str(e)}")

@router.get("/bookmarks", response_model=List[BookmarkItem])
def get_bookmarks():
    return saved_store.load_bookmarks()

@router.post("/bookmarks", response_model=BookmarkResponse)
def add_bookmark(request: BookmarkItem):
    bookmark_dict = request.dict(exclude_none=True)
    success = saved_store.add_bookmark(bookmark_dict)
    if not success:
        raise HTTPException(status_code=400, detail="Item already bookmarked or missing identifiers.")
    return {"status": "success", "message": "Item bookmarked."}

@router.delete("/bookmarks/{item_id}", response_model=BookmarkResponse)
def remove_bookmark(item_id: str):
    success = saved_store.remove_bookmark(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found.")
    return {"status": "success", "message": "Bookmark removed."}
