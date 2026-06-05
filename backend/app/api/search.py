from fastapi import APIRouter, Query, HTTPException
from app.schemas.api_schemas import SearchResponse
from app.repository.data_loader import data_loader

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1)):
    try:
        results = data_loader.search(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
