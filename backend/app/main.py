import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    search,
    songs,
    artists,
    playlists,
    genres,
    clusters,
    recommendations,
    analytics,
    model
)

app = FastAPI(
    title="SpotifyIQ Backend API",
    description="Music Recommendation & Audio Feature Analytics Engine powered by KMeans & Cosine Similarity",
    version="1.0.0"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(search.router, prefix="/api")
app.include_router(songs.router, prefix="/api")
app.include_router(artists.router, prefix="/api")
app.include_router(playlists.router, prefix="/api")
app.include_router(genres.router, prefix="/api")
app.include_router(clusters.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(model.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "message": "Welcome to SpotifyIQ Music Analytics API. Go to /docs for Swagger documentation."
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
