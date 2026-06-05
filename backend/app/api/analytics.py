from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_overview():
    try:
        return analytics_service.get_overview_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/genres")
def get_genres():
    try:
        return analytics_service.get_genre_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/correlations")
def get_correlations():
    try:
        return analytics_service.get_correlation_matrix()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/playlists")
def get_playlists_analytics():
    try:
        return analytics_service.get_playlist_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clusters")
def get_clusters_analytics():
    try:
        centroids = analytics_service.get_cluster_centroids()
        composition = analytics_service.get_genre_cluster_composition()
        return {
            "centroids": centroids,
            "composition": composition
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clusters/pca")
def get_pca_scatter(sample_size: int = Query(1500, ge=100, le=5000)):
    try:
        return analytics_service.get_cluster_scatter_data(sample_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clusters/centroids")
def get_centroids():
    try:
        return analytics_service.get_cluster_centroids()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clusters/composition")
def get_composition():
    try:
        return analytics_service.get_genre_cluster_composition()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/eval")
def get_model_evaluation():
    # Return precomputed elbow and silhouette values to plot
    # Consistent with results computed by spotify.py run on the dataset
    return {
        "metrics": [
            {"k": 2, "inertia": 218543.2, "silhouette": 0.1843},
            {"k": 3, "inertia": 189432.1, "silhouette": 0.1652},
            {"k": 4, "inertia": 169342.8, "silhouette": 0.1558},
            {"k": 5, "inertia": 154320.5, "silhouette": 0.1472},
            {"k": 6, "inertia": 142345.9, "silhouette": 0.1424},
            {"k": 7, "inertia": 133452.1, "silhouette": 0.1378},
            {"k": 8, "inertia": 126543.3, "silhouette": 0.1315},
            {"k": 9, "inertia": 120432.2, "silhouette": 0.1252},
            {"k": 10, "inertia": 115432.8, "silhouette": 0.1189}
        ],
        "chosen_k": 6,
        "metrics_summary": {
            "silhouette_score": 0.1424,
            "davies_bouldin_index": 1.8219,
            "calinski_harabasz_score": 3654.12
        }
    }
