# ==============================================================
# SPOTIFY GENRE GROUPING — COMPLETE ML ALGORITHM
# Beginner Friendly | Final Corrected Version
# ==============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import skew
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score,
    davies_bouldin_score,
    calinski_harabasz_score
)
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
import warnings

warnings.filterwarnings("ignore")

print("=" * 60)
print(" SPOTIFY GENRE GROUPING — ML ALGORITHM")
print("=" * 60)

SPOTIFY_DARK = "#191414"
SPOTIFY_GREEN = "#1DB954"
PALETTE = ["#1DB954", "#4A90D9", "#E74C3C", "#F39C12", "#9B59B6", "#1ABC9C"]
CLUSTER_COLORS = PALETTE

plt.rcParams.update({
    "figure.facecolor": SPOTIFY_DARK,
    "axes.facecolor": "#282828",
    "axes.edgecolor": "#404040",
    "text.color": "white",
    "axes.labelcolor": "white",
    "xtick.color": "white",
    "ytick.color": "white",
    "grid.color": "#404040",
    "grid.alpha": 0.4,
})

# ==============================================================
# STEP 1 — LOAD DATASET
# ==============================================================

print("\n[STEP 1] Loading dataset...")

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

df_raw = pd.read_csv(BASE_DIR / "spotify-dataset.csv")

print(f"Total rows   : {df_raw.shape[0]:,}")
print(f"Total columns: {df_raw.shape[1]}")
print("\nMissing values:")
print(df_raw.isnull().sum())

# ==============================================================
# STEP 2 — DATA PREPROCESSING
# ==============================================================

print("\n[STEP 2] Preprocessing data...")
df = df_raw.copy()

before_rows = len(df)

df.drop_duplicates(subset="track_id", keep="first", inplace=True)
after_duplicates = len(df)

df.dropna(subset=["track_name", "track_artist", "track_album_name"], inplace=True)
after_nulls = len(df)

df.reset_index(drop=True, inplace=True)
df["duration_min"] = df["duration_ms"] / 60000

print(f"Rows before preprocessing : {before_rows:,}")
print(f"After duplicate removal   : {after_duplicates:,}")
print(f"After null-value removal  : {after_nulls:,}")
print(f"Total rows removed        : {before_rows - after_nulls:,}")

AUDIO_FEATURES = [
    "danceability",
    "energy",
    "loudness",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo"
]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[AUDIO_FEATURES])

df.to_csv(OUTPUT_DIR / "spotify_cleaned.csv", index=False)
print("Saved → output/spotify_cleaned.csv")

# ==============================================================
# STEP 3 — EDA VISUALIZATIONS
# ==============================================================

print("\n[STEP 3] Drawing EDA charts...")
GENRES = df["playlist_genre"].dropna().unique().tolist()

# Plot 1: Feature distributions
ALL_FEATS = AUDIO_FEATURES + ["track_popularity"]
fig, axes = plt.subplots(2, 5, figsize=(22, 8))
fig.suptitle("Audio Feature Distributions", color="white", fontsize=18, fontweight="bold", y=1.01)

for ax, feat in zip(axes.flatten(), ALL_FEATS):
    ax.hist(df[feat].dropna(), bins=40, color=SPOTIFY_GREEN, alpha=0.85, edgecolor="none")
    sk = skew(df[feat].dropna())
    ax.set_title(feat.replace("_", " ").title(), color="white", fontsize=10)
    ax.text(
        0.97, 0.95, f"skew={sk:.2f}",
        transform=ax.transAxes,
        ha="right", va="top",
        fontsize=8, color="#AAAAAA"
    )
    ax.yaxis.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "01_feature_distributions.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Plot 2: Genre distribution
genre_counts = df["playlist_genre"].value_counts()
fig, ax = plt.subplots(figsize=(10, 5))
bars = ax.bar(genre_counts.index, genre_counts.values, color=PALETTE[:len(genre_counts)], edgecolor="none")
ax.set_title("Track Count per Playlist Genre", color="white", fontsize=15, fontweight="bold")
ax.set_xlabel("Genre")
ax.set_ylabel("Number of Tracks")

for bar in bars:
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 50,
        f"{int(bar.get_height()):,}",
        ha="center", va="bottom",
        color="white", fontsize=10
    )

ax.yaxis.grid(True, color="#404040", alpha=0.5)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "02_genre_distribution.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Plot 3: Popularity by genre
fig, ax = plt.subplots(figsize=(12, 6))
parts = ax.violinplot(
    [df[df["playlist_genre"] == g]["track_popularity"].values for g in GENRES],
    positions=range(len(GENRES)),
    showmedians=True
)

for i, pc in enumerate(parts["bodies"]):
    pc.set_facecolor(PALETTE[i % len(PALETTE)])
    pc.set_alpha(0.8)

parts["cmedians"].set_color("white")
for part in ["cbars", "cmins", "cmaxes"]:
    parts[part].set_color("#AAAAAA")

ax.set_xticks(range(len(GENRES)))
ax.set_xticklabels(GENRES, rotation=30, fontsize=11)
ax.set_title("Track Popularity Distribution by Genre", color="white", fontsize=14, fontweight="bold")
ax.set_ylabel("Popularity Score")
ax.yaxis.grid(True, color="#404040", alpha=0.4)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "03_popularity_by_genre.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Plot 4: Mean audio features by genre
RADAR_FEATS = ["danceability", "energy", "speechiness", "acousticness", "valence", "liveness"]
genre_means = df.groupby("playlist_genre")[RADAR_FEATS].mean()

x = np.arange(len(RADAR_FEATS))
width = 0.13

fig, ax = plt.subplots(figsize=(14, 6))
for i, (genre, color) in enumerate(zip(genre_means.index, PALETTE)):
    ax.bar(x + i * width, genre_means.loc[genre], width, label=genre, color=color, alpha=0.9)

ax.set_xticks(x + width * 2.5)
ax.set_xticklabels([f.replace("_", " ").title() for f in RADAR_FEATS], fontsize=11)
ax.legend(loc="upper right", fontsize=9, labelcolor="white", facecolor="#333333", edgecolor="none")
ax.set_title("Mean Audio Features by Genre", color="white", fontsize=14, fontweight="bold")
ax.set_ylabel("Mean Value")
ax.yaxis.grid(True, color="#404040", alpha=0.5)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "04_genre_features_bar.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Plot 5 and 6: Scatter plots
fig, axes = plt.subplots(1, 2, figsize=(18, 7))

for genre, color in zip(GENRES, PALETTE):
    sub = df[df["playlist_genre"] == genre]
    axes[0].scatter(sub["energy"], sub["danceability"], c=color, s=8, alpha=0.4, label=genre)

axes[0].set_xlabel("Energy")
axes[0].set_ylabel("Danceability")
axes[0].set_title("Energy vs Danceability", color="white", fontsize=13, fontweight="bold")
axes[0].legend(fontsize=9, labelcolor="white", facecolor="#333333", edgecolor="none", markerscale=2)

for genre, color in zip(GENRES, PALETTE):
    sub = df[df["playlist_genre"] == genre]
    axes[1].scatter(sub["valence"], sub["energy"], c=color, s=8, alpha=0.4, label=genre)

axes[1].set_xlabel("Valence")
axes[1].set_ylabel("Energy")
axes[1].set_title("Valence vs Energy", color="white", fontsize=13, fontweight="bold")
axes[1].legend(fontsize=9, labelcolor="white", facecolor="#333333", edgecolor="none", markerscale=2)

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "05_06_scatter_plots.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Plot 7: Top playlists
top_playlists = df["playlist_name"].value_counts().head(15)

fig, ax = plt.subplots(figsize=(12, 6))
bars = ax.barh(top_playlists.index[::-1], top_playlists.values[::-1], color=SPOTIFY_GREEN, edgecolor="none")

for bar in bars:
    ax.text(
        bar.get_width() + 2,
        bar.get_y() + bar.get_height() / 2,
        str(int(bar.get_width())),
        va="center", color="white", fontsize=8
    )

ax.set_title("Top 15 Playlists by Track Count", color="white", fontsize=13, fontweight="bold")
ax.set_xlabel("Number of Tracks")
ax.xaxis.grid(True, color="#404040", alpha=0.4)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "07_top_playlists.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# ==============================================================
# STEP 4 — CORRELATION MATRIX
# ==============================================================

print("\n[STEP 4] Building correlation matrix...")

NUM_COLS = [
    "track_popularity", "danceability", "energy", "key",
    "loudness", "mode", "speechiness", "acousticness",
    "instrumentalness", "liveness", "valence", "tempo", "duration_ms"
]

corr = df[NUM_COLS].corr()

fig, ax = plt.subplots(figsize=(13, 10))
mask = np.triu(np.ones_like(corr, dtype=bool))
cmap = sns.diverging_palette(10, 150, as_cmap=True)

sns.heatmap(
    corr,
    mask=mask,
    cmap=cmap,
    center=0,
    vmin=-1,
    vmax=1,
    annot=True,
    fmt=".2f",
    linewidths=0.5,
    linecolor="#333333",
    annot_kws={"size": 8, "color": "white"},
    ax=ax,
    cbar_kws={"shrink": 0.8}
)

ax.set_title("Feature Correlation Matrix", color="white", fontsize=16, fontweight="bold", pad=15)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "08_correlation_matrix.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# ==============================================================
# STEP 5 — FIND BEST k
# ==============================================================

print("\n[STEP 5] Finding best k...")

pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_scaled)

inertia = []
sil_scores = []
k_range = range(2, 11)

for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    inertia.append(km.inertia_)
    sil_scores.append(
        silhouette_score(X_scaled, labels, sample_size=3000, random_state=42)
    )

best_k = list(k_range)[np.argmax(sil_scores)]

print(f"Best k by silhouette            : {best_k}")
print("Chosen k for final project      : 6")
print("Reason                          : 6 clusters give better interpretability")
print("                                  and align with the 6 major playlist genres.")

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].plot(list(k_range), inertia, "o-", color=SPOTIFY_GREEN, linewidth=2.5, markersize=8)
axes[0].axvline(x=6, color="#E74C3C", linestyle="--", alpha=0.8, label="k=6 chosen")
axes[0].set_title("Elbow Method — Inertia vs k", color="white", fontsize=13, fontweight="bold")
axes[0].set_xlabel("k")
axes[0].set_ylabel("Inertia")
axes[0].legend()

axes[1].plot(list(k_range), sil_scores, "s-", color="#4A90D9", linewidth=2.5, markersize=8)
axes[1].axvline(x=best_k, color="#E74C3C", linestyle="--", alpha=0.8, label=f"Best k={best_k}")
axes[1].set_title("Silhouette Score vs k", color="white", fontsize=13, fontweight="bold")
axes[1].set_xlabel("k")
axes[1].set_ylabel("Silhouette Score")
axes[1].legend()

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "09_elbow_silhouette.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# ==============================================================
# STEP 6 — TRAIN FINAL KMEANS MODEL
# ==============================================================

print("\n[STEP 6] Training KMeans model...")

K = 6
kmeans = KMeans(
    n_clusters=K,
    init="k-means++",
    n_init=20,
    max_iter=300,
    random_state=42
)
df["cluster"] = kmeans.fit_predict(X_scaled)

CLUSTER_NAMES = {
    0: "Acoustic & Mellow",
    1: "Danceable Pop / Latin",
    2: "High-Energy Electronic",
    3: "Upbeat R&B / Funk",
    4: "Intense EDM",
    5: "Dark Energetic"
}

summary = df.groupby("cluster")[[
    "danceability", "energy", "valence",
    "acousticness", "speechiness", "tempo"
]].mean().round(3)

summary["Cluster Name"] = [CLUSTER_NAMES[i] for i in summary.index]

print("\nCluster Summary:")
print(summary)

final_sil = silhouette_score(X_scaled, df["cluster"], sample_size=3000, random_state=42)
dbi = davies_bouldin_score(X_scaled, df["cluster"])
chi = calinski_harabasz_score(X_scaled, df["cluster"])

print("\nCluster Evaluation Metrics")
print("-" * 40)
print(f"Silhouette Score         : {final_sil:.4f}")
print(f"Davies-Bouldin Index     : {dbi:.4f}")
print(f"Calinski-Harabasz Score  : {chi:.2f}")

df.to_csv(OUTPUT_DIR / "spotify_with_clusters.csv", index=False)
print("Saved → output/spotify_with_clusters.csv")

# ==============================================================
# STEP 7 — CLUSTER VISUALIZATIONS
# ==============================================================

print("\n[STEP 7] Generating cluster visualizations...")

# PCA cluster vs genre
fig, axes = plt.subplots(1, 2, figsize=(18, 7))

for c in range(K):
    mask = df["cluster"] == c
    axes[0].scatter(X_pca[mask, 0], X_pca[mask, 1], c=CLUSTER_COLORS[c], s=6, alpha=0.5, label=f"C{c}")

axes[0].set_title("KMeans Clusters (PCA 2D)", color="white", fontsize=13, fontweight="bold")
axes[0].set_xlabel("PC1")
axes[0].set_ylabel("PC2")
axes[0].legend()

for genre, color in zip(GENRES, PALETTE):
    mask = df["playlist_genre"] == genre
    axes[1].scatter(X_pca[mask, 0], X_pca[mask, 1], c=color, s=6, alpha=0.5, label=genre)

axes[1].set_title("Actual Genres (PCA 2D)", color="white", fontsize=13, fontweight="bold")
axes[1].set_xlabel("PC1")
axes[1].set_ylabel("PC2")
axes[1].legend()

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "10_pca_cluster_vs_genre.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Centroids heatmap
centroids_df = pd.DataFrame(
    kmeans.cluster_centers_,
    columns=AUDIO_FEATURES,
    index=[f"Cluster {i}" for i in range(K)]
)

fig, ax = plt.subplots(figsize=(13, 5))
sns.heatmap(
    centroids_df,
    annot=True,
    fmt=".2f",
    cmap="RdYlGn",
    center=0,
    linewidths=0.5,
    linecolor="#333333",
    ax=ax,
    annot_kws={"size": 9, "color": "black"}
)
ax.set_title("KMeans Cluster Centroids", color="white", fontsize=13, fontweight="bold")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "11_cluster_centroids.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Genre-cluster composition
genre_cluster = pd.crosstab(df["playlist_genre"], df["cluster"])
genre_cluster_pct = genre_cluster.div(genre_cluster.sum(axis=1), axis=0)

fig, ax = plt.subplots(figsize=(11, 6))
genre_cluster_pct.plot(kind="bar", stacked=True, ax=ax, color=CLUSTER_COLORS, edgecolor="none", width=0.7)
ax.set_title("Cluster Composition per Genre", color="white", fontsize=13, fontweight="bold")
ax.set_xlabel("Genre")
ax.set_ylabel("Proportion")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "12_genre_cluster_composition.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# Radar charts
mm = MinMaxScaler()
cluster_radar = df.groupby("cluster")[RADAR_FEATS].mean()
cluster_norm = pd.DataFrame(
    mm.fit_transform(cluster_radar),
    columns=RADAR_FEATS,
    index=cluster_radar.index
)

N = len(RADAR_FEATS)
angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
angles += angles[:1]

fig, axes = plt.subplots(2, 3, figsize=(16, 10), subplot_kw=dict(polar=True))
fig.suptitle("Cluster Audio Profiles (Radar Charts)", color="white", fontsize=16, fontweight="bold", y=1.01)

for ax, c in zip(axes.flatten(), range(K)):
    values = cluster_norm.loc[c].tolist()
    values += values[:1]
    ax.set_facecolor("#1e1e1e")
    ax.plot(angles, values, "o-", color=CLUSTER_COLORS[c], linewidth=2, markersize=5)
    ax.fill(angles, values, color=CLUSTER_COLORS[c], alpha=0.25)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels([f.replace("_", " ").title() for f in RADAR_FEATS], color="white", fontsize=9)
    ax.set_title(f"Cluster {c}: {CLUSTER_NAMES[c]}", color=CLUSTER_COLORS[c], fontsize=10, fontweight="bold", pad=14)

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "13_radar_cluster_profiles.png", dpi=150, bbox_inches="tight", facecolor=SPOTIFY_DARK)
plt.show()

# ==============================================================
# STEP 8 — SONG + ARTIST RECOMMENDATION SYSTEM
# ==============================================================

print("\n[STEP 8] Building Recommendation System...")

centroids_df.to_csv(OUTPUT_DIR / "cluster_centroids.csv")
summary.to_csv(OUTPUT_DIR / "cluster_summary.csv")


def get_ranked_candidates(candidates: pd.DataFrame) -> pd.DataFrame:
    candidates = candidates.copy()

    pop_min = candidates["track_popularity"].min()
    pop_max = candidates["track_popularity"].max()

    candidates["popularity_norm"] = (
        candidates["track_popularity"] - pop_min
    ) / (pop_max - pop_min + 1e-9)

    candidates["final_score"] = (
        0.85 * candidates["similarity"] +
        0.15 * candidates["popularity_norm"]
    )

    return candidates


def recommend_by_song(song_name: str, top_n: int = 10) -> pd.DataFrame:
    matches = df[
        df["track_name"].str.lower().str.contains(song_name.lower(), na=False)
    ].copy()

    if matches.empty:
        print(f"Song '{song_name}' not found in dataset.")
        return pd.DataFrame()

    preview = matches[[
        "track_name", "track_artist", "playlist_genre",
        "track_popularity", "cluster"
    ]].drop_duplicates().reset_index(drop=True)

    if len(preview) > 1:
        print("\nMultiple matching songs found:")
        print(preview.head(10).to_string())

        try:
            choice_idx = int(input("\nEnter the row number of the song you want: ").strip())
            selected = preview.iloc[choice_idx]
        except:
            print("Invalid selection.")
            return pd.DataFrame()
    else:
        selected = preview.iloc[0]

    query_song = df[
        (df["track_name"] == selected["track_name"]) &
        (df["track_artist"] == selected["track_artist"])
    ].iloc[0]

    cluster_id = int(query_song["cluster"])

    print(f"\nSong found            : {query_song['track_name']}")
    print(f"Artist                : {query_song['track_artist']}")
    print(f"Genre                 : {query_song['playlist_genre']}")
    print(f"Cluster               : {cluster_id}")
    print(f"Cluster Name          : {CLUSTER_NAMES[cluster_id]}")

    candidates = df[
        (df["cluster"] == cluster_id) &
        ~(
            (df["track_name"] == query_song["track_name"]) &
            (df["track_artist"] == query_song["track_artist"])
        )
    ].copy()

    if candidates.empty:
        print("No candidate songs found in the same cluster.")
        return pd.DataFrame()

    print(f"Candidate songs found : {len(candidates):,}")

    X_candidates = scaler.transform(candidates[AUDIO_FEATURES])
    X_query = scaler.transform(query_song[AUDIO_FEATURES].values.reshape(1, -1))
    candidates["similarity"] = cosine_similarity(X_query, X_candidates)[0]

    candidates = get_ranked_candidates(candidates)

    top_songs = candidates.nlargest(top_n, "final_score")[[
        "track_name", "track_artist", "playlist_genre",
        "cluster", "similarity", "track_popularity", "final_score"
    ]].reset_index(drop=True)

    top_songs.index += 1
    return top_songs


def recommend_by_artist(artist_name: str, top_n: int = 10) -> pd.DataFrame:
    artist_songs = df[
        df["track_artist"].str.lower().str.contains(artist_name.lower(), na=False)
    ].copy()

    if artist_songs.empty:
        print(f"Artist '{artist_name}' not found in dataset.")
        return pd.DataFrame()

    print(f"\nArtist found          : {artist_name}")
    print(f"Songs found           : {len(artist_songs)}")

    artist_vector = artist_songs[AUDIO_FEATURES].mean().values.reshape(1, -1)
    artist_vector_scaled = scaler.transform(artist_vector)

    artist_cluster = int(artist_songs["cluster"].mode()[0])

    print(f"Dominant Cluster      : {artist_cluster}")
    print(f"Cluster Name          : {CLUSTER_NAMES[artist_cluster]}")

    candidates = df[
        (df["cluster"] == artist_cluster) &
        (~df["track_artist"].str.lower().str.contains(artist_name.lower(), na=False))
    ].copy()

    if candidates.empty:
        print("No candidate songs found in the same cluster.")
        return pd.DataFrame()

    print(f"Candidate songs found : {len(candidates):,}")

    X_candidates = scaler.transform(candidates[AUDIO_FEATURES])
    candidates["similarity"] = cosine_similarity(artist_vector_scaled, X_candidates)[0]

    candidates = get_ranked_candidates(candidates)

    top_songs = candidates.nlargest(top_n, "final_score")[[
        "track_name", "track_artist", "playlist_genre",
        "cluster", "similarity", "track_popularity", "final_score"
    ]].reset_index(drop=True)

    top_songs.index += 1
    return top_songs


while True:
    print("\n" + "=" * 60)
    print("Choose Recommendation Type")
    print("=" * 60)
    print("1. Recommend by Song Name")
    print("2. Recommend by Artist Name")
    print("3. Exit")

    choice = input("\nEnter your choice (1/2/3): ").strip()

    if choice == "1":
        song_input = input("\nEnter song name: ").strip()

        if song_input == "":
            print("Please enter a valid song name.")
            continue

        print("\n" + "=" * 60)
        print(f"RECOMMENDATIONS FOR SONG: '{song_input}'")
        print("=" * 60)

        results = recommend_by_song(song_input, top_n=10)

        if not results.empty:
            print("\nTop 10 Recommended Songs:")
            print(results.to_string())

            safe_name = song_input.lower().replace(" ", "_").replace("'", "")
            results.to_csv(OUTPUT_DIR / f"recommendations_song_{safe_name}.csv", index=False)
            print(f"Saved → output/recommendations_song_{safe_name}.csv")
        else:
            print("No recommendations generated.")

    elif choice == "2":
        artist_input = input("\nEnter artist name: ").strip()

        if artist_input == "":
            print("Please enter a valid artist name.")
            continue

        print("\n" + "=" * 60)
        print(f"RECOMMENDATIONS FOR ARTIST: '{artist_input}'")
        print("=" * 60)

        results = recommend_by_artist(artist_input, top_n=10)

        if not results.empty:
            print("\nTop 10 Recommended Songs:")
            print(results.to_string())

            safe_name = artist_input.lower().replace(" ", "_").replace("'", "")
            results.to_csv(OUTPUT_DIR / f"recommendations_artist_{safe_name}.csv", index=False)
            print(f"Saved → output/recommendations_artist_{safe_name}.csv")
        else:
            print("No recommendations generated.")

    elif choice == "3":
        print("\nExiting recommendation system...")
        break

    else:
        print("Invalid choice. Please enter 1, 2, or 3.")

print("\nAlgorithm complete.")
print("Check the output folder for plots, cleaned data, clusters, and recommendations.")