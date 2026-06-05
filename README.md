# 🎵 SpotifyIQ — Music Intelligence & Recommendation Dashboard

A full-stack music recommendation and analytics application powered by K-Means clustering and cosine similarity on a local Spotify dataset of **28,000+ tracks**.

---

## 🗂️ Project Structure

```
Spotify/
├── backend/                  # FastAPI backend (Python)
│   ├── app/
│   │   ├── api/              # Route handlers (songs, artists, recommendations…)
│   │   ├── services/         # Business logic (RecommendationService, AnalyticsService)
│   │   ├── repository/       # DataLoader — loads & processes dataset once at startup
│   │   ├── schemas/          # Pydantic response models
│   │   └── database/         # Bookmarks persistence (JSON file store)
│   ├── requirements.txt
│   └── test_api.py           # Integration test script
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Shared UI: Cards, Feedback, Visuals, Controls, Sidebar
│   │   ├── hooks/            # useSpotifyApi.js — all TanStack Query hooks
│   │   └── pages/            # 17 application pages
│   └── package.json
│
├── Spotify_Algorthm/         # Original ML notebooks & pre-processed outputs
│   └── output/
│       ├── spotify_with_clusters.csv   ← PRIMARY DATASET (required by backend)
│       └── cluster_centroids.csv
│
└── output/
    └── spotify dataset.csv   ← Raw Spotify dataset
```

---

## ⚡ Quick Start (Local Demo)

### Prerequisites

| Tool    | Required Version |
|---------|-----------------|
| Python  | 3.10+           |
| Node.js | 18+             |
| npm     | 9+              |

---

### 1. Start the Backend

```bash
cd /home/annaramlohith/Desktop/Spotify/backend

# First time only — create virtual environment and install deps
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Start the API server
PYTHONPATH=. .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend URL:** http://localhost:8000  
**API Docs (Swagger):** http://localhost:8000/docs

---

### 2. Start the Frontend

```bash
cd /home/annaramlohith/Desktop/Spotify/frontend

# First time only — install dependencies
npm install

# Start the dev server
npx vite --host 0.0.0.0 --port 5173
```

**Frontend URL:** http://localhost:5173

---

## 🔌 API Summary (25 Endpoints)

| Category         | Endpoints |
|-----------------|-----------|
| Root            | `GET /` |
| Search          | `GET /api/search?q=` |
| Songs           | `GET /api/songs/{id}`, `GET /api/songs/search?q=`, `GET /api/songs/compare?id1=&id2=` |
| Artists         | `GET /api/artists/{name}`, `GET /api/artists/search?q=`, `GET /api/artists/compare?name1=&name2=` |
| Recommendations | `GET /api/recommend/song/{id}`, `GET /api/recommend/artist/{name}`, `POST /api/recommend/mood` |
| Clusters        | `GET /api/clusters`, `GET /api/clusters/{id}` |
| Genres          | `GET /api/genres`, `GET /api/genres/{name}` |
| Playlists       | `GET /api/playlists`, `GET /api/playlists/search?q=` |
| Analytics       | `GET /api/analytics/overview`, `/genres`, `/correlations`, `/clusters/pca`, `/clusters/centroids`, `/clusters/composition`, `/model/eval` |
| Bookmarks       | `GET/POST /api/bookmarks`, `DELETE /api/bookmarks/{id}` |
| Model Admin     | `POST /api/model/retrain?k=` |

---

## 🖥️ Application Pages (17 Routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | KPI cards + search gateway |
| `/search?q=` | Search Results | Tabbed songs / artists / playlists |
| `/recommend/song/:id` | Song Recommendations | Content-based recs with explainability |
| `/recommend/artist/:name` | Artist Recommendations | Artist acoustic DNA + style-matched tracks |
| `/song/:id` | Song Details | Audio profile radar + full metadata |
| `/artist/:name` | Artist Details | Avg fingerprint + top tracks |
| `/explore/clusters` | Cluster Explorer | Genre composition + dominant artists per cluster |
| `/explore/genres` | Genre Explorer | Parent genre comparison |
| `/explore/mood` | Mood Discovery | Multi-slider audio vector matching |
| `/explore/playlists` | Playlist Insights | Per-playlist radar + track preview |
| `/compare/songs` | Song Comparison | Dual radar + feature delta bars |
| `/compare/artists` | Artist Comparison | Dual fingerprint radar |
| `/analytics` | Analytics Overview | Correlation heatmap + genre stats |
| `/analytics/clusters` | Cluster Analytics | PCA scatter + stacked bar composition |
| `/analytics/correlations` | Correlation Insights | Feature pair correlation matrix |
| `/about-model` | About Model | Elbow method + silhouette charts + model math |
| `/bookmarks` | Saved Bookmarks | Server-persisted saved tracks |

---

## 🧠 ML Architecture

```
Raw CSV (28K tracks)
    → Deduplicate on track_id
    → Drop nulls (track_name, track_artist, track_album_name)
    → StandardScaler (9 audio features: danceability, energy, loudness,
                       speechiness, acousticness, instrumentalness,
                       liveness, valence, tempo)
    → KMeans (k=6, k-means++ init, seed=42)
    → Cluster labels (0–5) stored in spotify_with_clusters.csv

Recommendation Formula:
    1. Find query song's cluster
    2. Filter candidates to same cluster
    3. Cosine Similarity(query_vector, candidate_vector)
    4. final_score = 0.85 × similarity + 0.15 × popularity_norm
    5. Return top-N sorted by final_score
```

**Cluster Names:**
| ID | Name |
|----|------|
| 0 | Acoustic & Mellow |
| 1 | Danceable Pop / Latin |
| 2 | High-Energy Electronic |
| 3 | Upbeat R&B / Funk |
| 4 | Intense EDM |
| 5 | Dark Energetic |

---

## ⚠️ Known Limitations

1. **Dataset-bound** — Recommendations only cover the ~28K tracks in `spotify_with_clusters.csv`. No live Spotify catalog access.
2. **Content-only** — No user history, collaborative filtering, lyric analysis, or release-date weighting.
3. **Acoustic-only clusters** — Tracks are grouped by sonic attributes, not genre. An energetic rock track and an energetic EDM track may share a cluster.
4. **No authentication** — Bookmarks are stored in a local JSON file, shared by all users. No user sessions.
5. **Single-process state** — Model retrain (`POST /api/model/retrain`) updates in-memory only; restarts revert to original clusters.
6. **No pagination** — Search results are capped at 50. Large datasets may need cursor-based pagination.
7. **Bundle size** — Production JS bundle is 814 KB (uncompressed). Needs code-splitting for production.
8. **CORS wide-open** — `allow_origins=["*"]` is fine for local demo; must be locked down before production.

---

## 🚀 Recommended Next Upgrades

### Priority 1 — User Experience
- [ ] **Auth / User Accounts** — Firebase Auth or Auth0 for per-user bookmark storage
- [ ] **Personalization** — Store listening history; weight recommendations toward previously played clusters
- [ ] **Pagination & Infinite Scroll** — Handle 50+ search results gracefully

### Priority 2 — Data & ML
- [ ] **Spotify Web API Integration** — Replace local dataset with live `search`, `audio-features`, and `recommendations` endpoints; add album art
- [ ] **Collaborative Filtering** — Add user-based or item-based CF as a second recommendation layer
- [ ] **Model Persistence** — Serialize trained KMeans + scaler with `joblib` so retrain survives restarts

### Priority 3 — Infrastructure
- [ ] **Deployment** — Dockerize backend + frontend; deploy to Railway / Render (backend) + Vercel / Netlify (frontend)
- [ ] **Database** — Replace JSON bookmark store with PostgreSQL or SQLite via SQLAlchemy
- [ ] **Code Splitting** — Add `React.lazy` + `Suspense` per-route to reduce initial bundle from 814 KB
- [ ] **Rate Limiting** — Add `slowapi` middleware to backend to prevent scraping

### Priority 4 — Polish
- [ ] **Real Album Art** — Integrate Spotify image CDN or MusicBrainz Cover Art Archive
- [ ] **Playlist Creation** — Allow users to export saved bookmarks as a Spotify playlist via OAuth
- [ ] **Shareable Links** — Deep-link to a specific song/artist comparison via URL state

---

## 🧪 Running Tests

```bash
# Backend integration tests
cd backend
PYTHONPATH=. .venv/bin/python test_api.py

# Frontend production build check
cd frontend
npm run build
```

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TanStack Query, Recharts, Lucide React, Tailwind CSS |
| Backend | FastAPI, Uvicorn, Pydantic v2 |
| ML | scikit-learn (KMeans, StandardScaler, PCA), pandas, numpy |
| Data | Spotify dataset CSV (~28K tracks) |
| Persistence | JSON file (bookmarks) |
