from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from app.repository.data_loader import data_loader, AUDIO_FEATURES
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import pandas as pd
import numpy as np

router = APIRouter(prefix="/model", tags=["Model Administration"])

def perform_retraining(k: int):
    try:
        print(f"[Model Admin] Starting KMeans retraining background task with k={k}...")
        df = data_loader.df.copy()
        
        # Train KMeans
        kmeans = KMeans(
            n_clusters=k,
            init="k-means++",
            n_init=10,
            max_iter=300,
            random_state=42
        )
        # Scale & fit
        X_scaled = data_loader.scaler.transform(df[AUDIO_FEATURES])
        df["cluster"] = kmeans.fit_predict(X_scaled)
        
        # Fit PCA
        pca = PCA(n_components=2, random_state=42)
        X_pca = pca.fit_transform(X_scaled)
        df["pc1"] = X_pca[:, 0]
        df["pc2"] = X_pca[:, 1]
        
        # Safely replace DataLoader data
        data_loader.df = df
        data_loader.X_scaled = X_scaled
        
        # Update model metadata
        import datetime
        data_loader.model_metadata = {
            "model_version": f"1.{k}.{int(datetime.datetime.utcnow().timestamp())}",
            "k": k,
            "trained_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
        # Re-precompute in analytics service if imported
        from app.services.analytics_service import analytics_service
        analytics_service.pca = pca
        analytics_service.X_pca = X_pca
        
        print(f"[Model Admin] Retraining complete. In-memory data structures refreshed.")
    except Exception as e:
        print(f"[Model Admin] Error during retraining background task: {e}")

@router.post("/retrain")
def retrain_model(
    background_tasks: BackgroundTasks,
    k: int = Query(6, ge=2, le=12, description="Number of KMeans clusters")
):
    # Execute retraining in background to avoid blocking API
    background_tasks.add_task(perform_retraining, k)
    return {
        "status": "pending",
        "message": f"KMeans retraining with k={k} has been dispatched to background tasks. Check server logs for details."
    }
