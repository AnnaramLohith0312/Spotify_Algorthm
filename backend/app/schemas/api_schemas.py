from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TrackSchema(BaseModel):
    track_id: str
    track_name: str
    track_artist: str
    track_popularity: int
    track_album_id: str
    track_album_name: str
    track_album_release_date: Optional[str] = None
    playlist_name: str
    playlist_id: str
    playlist_genre: str
    playlist_subgenre: str
    danceability: float
    energy: float
    key: int
    loudness: float
    mode: int
    speechiness: float
    acousticness: float
    instrumentalness: float
    liveness: float
    valence: float
    tempo: float
    duration_ms: int
    duration_min: float
    cluster: int
    pc1: Optional[float] = None
    pc2: Optional[float] = None

class ArtistSchema(BaseModel):
    artist_name: str
    track_count: int
    dominant_genre: str
    dominant_cluster: int
    dominant_cluster_name: str

class PlaylistSchema(BaseModel):
    playlist_name: str
    track_count: int
    playlist_genre: str
    playlist_subgenre: str

class SearchResponse(BaseModel):
    songs: List[TrackSchema]
    artists: List[ArtistSchema]
    playlists: List[PlaylistSchema]

class SongRecommendationResult(TrackSchema):
    similarity: float
    popularity_norm: float
    final_score: float

class SongRecommendationsResponse(BaseModel):
    query_song: TrackSchema
    recommendations: List[SongRecommendationResult]

class ArtistRecommendationsResponse(BaseModel):
    artist_name: str
    dominant_cluster: int
    dominant_cluster_name: str
    artist_fingerprint: Dict[str, float]
    recommendations: List[SongRecommendationResult]

class MoodRecommendationRequest(BaseModel):
    danceability: float = Field(default=0.5, ge=0.0, le=1.0)
    energy: float = Field(default=0.5, ge=0.0, le=1.0)
    speechiness: float = Field(default=0.1, ge=0.0, le=1.0)
    acousticness: float = Field(default=0.2, ge=0.0, le=1.0)
    instrumentalness: float = Field(default=0.1, ge=0.0, le=1.0)
    liveness: float = Field(default=0.2, ge=0.0, le=1.0)
    valence: float = Field(default=0.5, ge=0.0, le=1.0)
    tempo: float = Field(default=120.0, ge=50.0, le=220.0)
    loudness: float = Field(default=-8.0, ge=-60.0, le=0.0)
    genre_filter: Optional[str] = None
    top_n: Optional[int] = 15

class BookmarkResponse(BaseModel):
    status: str
    message: str

class BookmarkItem(BaseModel):
    type: str = Field(..., description="'song' or 'artist'")
    track_id: Optional[str] = None
    artist_name: Optional[str] = None
    track_name: Optional[str] = None
    track_artist: Optional[str] = None
    playlist_genre: Optional[str] = None
    track_popularity: Optional[int] = None
    cluster: Optional[int] = None

class ClusterDetailResponse(BaseModel):
    cluster_id: int
    cluster_name: str
    description: str
    avg_danceability: float
    avg_energy: float
    avg_valence: float
    avg_acousticness: float
    avg_speechiness: float
    avg_tempo: float
    track_count: int
    top_tracks: List[TrackSchema]
    top_artists: List[Dict[str, Any]]
    genres_contained: List[Dict[str, Any]]

class GenreDetailResponse(BaseModel):
    genre_name: str
    track_count: int
    avg_popularity: float
    avg_energy: float
    avg_danceability: float
    subgenre_breakdown: List[Dict[str, Any]]
    top_tracks: List[TrackSchema]

class PlaylistDetailResponse(BaseModel):
    playlist_name: str
    track_count: int
    playlist_genre: str
    playlist_subgenre: str
    avg_popularity: float
    avg_danceability: float
    avg_energy: float
    top_tracks: List[TrackSchema]
