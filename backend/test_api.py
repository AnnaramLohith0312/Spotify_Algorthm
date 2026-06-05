import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    print(f"Testing {method} {url} ...", end="")
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header("Content-Type", "application/json")
            json_data = json.dumps(data).encode("utf-8")
        else:
            json_data = None
            
        with urllib.request.urlopen(req, data=json_data) as response:
            status = response.status
            body = response.read().decode("utf-8")
            data = json.loads(body)
            print(f" [OK] (Status: {status})")
            return data
    except Exception as e:
        print(f" [FAILED] - {e}")
        return None

def run_tests():
    print("=" * 60)
    print(" SPOTIFYIQ FULL-STACK BACKEND SYSTEM INTEGRATION TESTS")
    print("=" * 60)

    # 1. Health check
    # The health check is at the root / (no /api prefix)
    print("Testing health check...", end="")
    try:
        with urllib.request.urlopen("http://localhost:8000/") as response:
            status = response.status
            body = response.read().decode("utf-8")
            print(f" [OK] (Status: {status})")
    except Exception as e:
        print(f" [FAILED] - {e}")
        sys.exit(1)

    # 2. Search
    search_data = test_endpoint("/search?q=lights")
    if not search_data or "songs" not in search_data or len(search_data["songs"]) == 0:
        print("Search test failed: no songs found in response.")
        sys.exit(1)

    # Get a confirmed track ID dynamically from dataset search
    confirmed_track = search_data["songs"][0]
    track_id = confirmed_track["track_id"]
    track_name = confirmed_track["track_name"]
    track_artist = confirmed_track["track_artist"]
    print(f"Dynamic track chosen for verification: '{track_name}' by '{track_artist}' (ID: {track_id})")

    # 3. Song Details
    song_details = test_endpoint(f"/songs/{track_id}")
    if not song_details or song_details["track_id"] != track_id:
        print("Song details retrieval failed.")
        sys.exit(1)

    # 4. Recommender Song
    recs = test_endpoint(f"/recommend/song/{track_id}")
    if not recs or "recommendations" not in recs or len(recs["recommendations"]) == 0:
        print("Song recommendation test failed.")
        sys.exit(1)

    # 5. Recommender Artist
    artist_recs = test_endpoint(f"/recommend/artist/{urllib.parse.quote(track_artist)}")
    if not artist_recs:
        print("Artist recommendation test failed.")
        sys.exit(1)

    # 6. Mood Recommendations
    mood_payload = {
        "danceability": 0.7,
        "energy": 0.7,
        "valence": 0.75,
        "tempo": 120.0
    }
    mood_recs = test_endpoint("/recommend/mood", method="POST", data=mood_payload)
    if not mood_recs or len(mood_recs) == 0:
        print("Mood recommendation test failed.")
        sys.exit(1)

    # 7. Analytics Overview
    overview = test_endpoint("/analytics/overview")
    if not overview or "total_tracks" not in overview:
        print("Analytics overview retrieval failed.")
        sys.exit(1)

    # 8. Analytics Correlations
    corrs = test_endpoint("/analytics/correlations")
    if not corrs or "matrix" not in corrs:
        print("Analytics correlations matrix failed.")
        sys.exit(1)

    # 9. Analytics PCA Coordinates
    pca = test_endpoint("/analytics/clusters/pca")
    if not pca or len(pca) == 0:
        print("PCA coordinates retrieval failed.")
        sys.exit(1)

    # 10. Playlists list
    playlists = test_endpoint("/playlists")
    if not playlists or len(playlists) == 0:
        print("Playlists listing failed.")
        sys.exit(1)

    # 11. Clusters list
    clusters = test_endpoint("/clusters")
    if not clusters or len(clusters) == 0:
        print("Clusters listing failed.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print(" ALL 11 API INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
