import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE_URL = 'http://localhost:8000/api';

// Utility fetch helper
const fetchJson = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 1. Search Hook
export const useSearch = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchJson(`/search?q=${encodeURIComponent(query)}`),
    enabled: !!query && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Details Hooks
export const useSongDetails = (trackId) => {
  return useQuery({
    queryKey: ['song', trackId],
    queryFn: () => fetchJson(`/songs/${trackId}`),
    enabled: !!trackId,
  });
};

export const useArtistDetails = (artistName) => {
  return useQuery({
    queryKey: ['artist', artistName],
    queryFn: () => fetchJson(`/artists/${encodeURIComponent(artistName)}`),
    enabled: !!artistName,
  });
};

export const usePlaylists = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => fetchJson('/playlists'),
  });
};

export const usePlaylistDetails = (playlistName) => {
  return useQuery({
    queryKey: ['playlist', playlistName],
    queryFn: () => fetchJson(`/playlists/${encodeURIComponent(playlistName)}`),
    enabled: !!playlistName,
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => fetchJson('/genres'),
  });
};

export const useGenreDetails = (genreName) => {
  return useQuery({
    queryKey: ['genre', genreName],
    queryFn: () => fetchJson(`/genres/${encodeURIComponent(genreName)}`),
    enabled: !!genreName,
  });
};

export const useClusters = () => {
  return useQuery({
    queryKey: ['clusters'],
    queryFn: () => fetchJson('/clusters'),
  });
};

export const useClusterDetails = (clusterId) => {
  return useQuery({
    queryKey: ['cluster', clusterId],
    queryFn: () => fetchJson(`/clusters/${clusterId}`),
    enabled: clusterId !== undefined && clusterId !== null,
  });
};

// 3. Recommendation Hooks
export const useSongRecommendations = (trackId, topN = 10) => {
  return useQuery({
    queryKey: ['recommendations', 'song', trackId, topN],
    queryFn: () => fetchJson(`/recommend/song/${trackId}?top_n=${topN}`),
    enabled: !!trackId,
  });
};

export const useArtistRecommendations = (artistName, topN = 10) => {
  return useQuery({
    queryKey: ['recommendations', 'artist', artistName, topN],
    queryFn: () => fetchJson(`/recommend/artist/${encodeURIComponent(artistName)}?top_n=${topN}`),
    enabled: !!artistName,
  });
};

export const useMoodRecommendations = (moodFeatures, genreFilter = null, topN = 15) => {
  return useQuery({
    queryKey: ['recommendations', 'mood', moodFeatures, genreFilter, topN],
    queryFn: () => fetchJson('/recommend/mood', {
      method: 'POST',
      body: JSON.stringify({
        ...moodFeatures,
        genre_filter: genreFilter || undefined,
        top_n: topN
      })
    }),
    enabled: !!moodFeatures && Object.keys(moodFeatures).length > 0,
  });
};

// 4. Comparison Hooks (New in Phase 7)
export const useCompareSongs = (id1, id2) => {
  return useQuery({
    queryKey: ['compare', 'songs', id1, id2],
    queryFn: () => fetchJson(`/songs/compare?id1=${id1}&id2=${id2}`),
    enabled: !!id1 && !!id2,
  });
};

export const useCompareArtists = (name1, name2) => {
  return useQuery({
    queryKey: ['compare', 'artists', name1, name2],
    queryFn: () => fetchJson(`/artists/compare?name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}`),
    enabled: !!name1 && !!name2,
  });
};

// 5. Analytics & Model Hooks
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => fetchJson('/analytics/overview'),
  });
};

export const useGenreAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'genres'],
    queryFn: () => fetchJson('/analytics/genres'),
  });
};

export const useCorrelationMatrix = () => {
  return useQuery({
    queryKey: ['analytics', 'correlations'],
    queryFn: () => fetchJson('/analytics/correlations'),
  });
};

export const usePCAScatterData = (sampleSize = 1500) => {
  return useQuery({
    queryKey: ['analytics', 'pca', sampleSize],
    queryFn: () => fetchJson(`/analytics/clusters/pca?sample_size=${sampleSize}`),
  });
};

export const useClusterCentroids = () => {
  return useQuery({
    queryKey: ['analytics', 'centroids'],
    queryFn: () => fetchJson('/analytics/clusters/centroids'),
  });
};

export const useGenreClusterComposition = () => {
  return useQuery({
    queryKey: ['analytics', 'composition'],
    queryFn: () => fetchJson('/analytics/clusters/composition'),
  });
};

export const useModelEvaluation = () => {
  return useQuery({
    queryKey: ['analytics', 'model', 'eval'],
    queryFn: () => fetchJson('/analytics/model/eval'),
  });
};

export const useRetrainModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (k = 6) => fetchJson(`/model/retrain?k=${k}`, {
      method: 'POST'
    }),
    onSuccess: () => {
      // Invalidate all query metrics to trigger refetches once trained
      queryClient.invalidateQueries();
    }
  });
};

// 6. Bookmarks Hooks
export const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => fetchJson('/bookmarks'),
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item) => fetchJson('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    }
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => fetchJson(`/bookmarks/${itemId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    }
  });
};
