const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

console.log('Starting Spotify API server...');
console.log('Environment variables loaded:');
console.log('- SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Missing');
console.log('- SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('- SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI || 'Using default');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for tokens (use database in production)
let accessToken = null;
let refreshToken = null;

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

// Helper function to get headers with auth
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
});

// Step 1: Redirect to Spotify authorization
app.get('/login', (req, res) => {
  console.log('🔐 Login request received');
  console.log('📍 Redirect URI being used:', process.env.SPOTIFY_REDIRECT_URI);
  console.log('🔑 Client ID:', process.env.SPOTIFY_CLIENT_ID);
  
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-top-read'
  ].join(' ');

  const authURL = `${SPOTIFY_ACCOUNTS_BASE}/authorize?` +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      state: 'some-state-value'
    });

  console.log('🔗 Full auth URL:', authURL);
  res.redirect(authURL);
});

// Step 2: Handle callback and exchange code for tokens
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  try {
    const tokenResponse = await axios.post(
      `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    accessToken = tokenResponse.data.access_token;
    refreshToken = tokenResponse.data.refresh_token;

    res.json({ 
      message: 'Authentication successful! You can now use the /spotify endpoint.',
      access_token: accessToken.substring(0, 10) + '...' // Don't expose full token
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange code for tokens' });
  }
});

// Helper function to refresh access token
const refreshAccessToken = async () => {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      refreshToken = response.data.refresh_token;
    }
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
};

// Main Spotify endpoint
app.get('/spotify', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ 
      error: 'Not authenticated. Please visit /login first.' 
    });
  }

  try {
    // Get top 10 tracks
    const topTracksResponse = await axios.get(
      `${SPOTIFY_API_BASE}/me/top/tracks?limit=10&time_range=medium_term`,
      { headers: getAuthHeaders() }
    );

    // Get currently playing track
    let currentlyPlaying = null;
    try {
      const currentResponse = await axios.get(
        `${SPOTIFY_API_BASE}/me/player/currently-playing`,
        { headers: getAuthHeaders() }
      );
      currentlyPlaying = currentResponse.data;
    } catch (error) {
      // No currently playing track or player not active
      currentlyPlaying = { is_playing: false };
    }

    // Format top tracks
    const topTracks = topTracksResponse.data.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      uri: track.uri,
      preview_url: track.preview_url,
      external_urls: track.external_urls
    }));

    // Format currently playing
    const nowPlaying = currentlyPlaying && currentlyPlaying.item ? {
      id: currentlyPlaying.item.id,
      name: currentlyPlaying.item.name,
      artist: currentlyPlaying.item.artists.map(artist => artist.name).join(', '),
      album: currentlyPlaying.item.album.name,
      is_playing: currentlyPlaying.is_playing,
      progress_ms: currentlyPlaying.progress_ms,
      duration_ms: currentlyPlaying.item.duration_ms,
      uri: currentlyPlaying.item.uri,
      external_urls: currentlyPlaying.item.external_urls
    } : null;

    res.json({
      top_tracks: topTracks,
      now_playing: nowPlaying,
      actions: {
        stop_playback: `${req.protocol}://${req.get('host')}/spotify/stop`,
        play_track: `${req.protocol}://${req.get('host')}/spotify/play/{track_uri}`
      }
    });

  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expired, try to refresh
      try {
        await refreshAccessToken();
        // Retry the request
        return app.get('/spotify')(req, res);
      } catch (refreshError) {
        return res.status(401).json({ 
          error: 'Token expired and refresh failed. Please re-authenticate at /login' 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch Spotify data',
      details: error.response?.data || error.message 
    });
  }
});

// Stop currently playing track
app.get('/spotify/stop', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    await axios.put(
      `${SPOTIFY_API_BASE}/me/player/pause`,
      {},
      { headers: getAuthHeaders() }
    );

    res.json({ message: 'Playback stopped successfully' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'No active device found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to stop playback',
        details: error.response?.data || error.message 
      });
    }
  }
});

// Play a specific track
app.get('/spotify/play/:trackUri', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let trackUri = req.params.trackUri;
  
  // Convert track ID to URI if needed
  if (!trackUri.startsWith('spotify:track:')) {
    // If it's just an ID (like "254bXAqt3zP6P50BdQvEsq"), convert to URI
    trackUri = `spotify:track:${trackUri}`;
  }
  
  console.log('🎵 Attempting to play track:', trackUri);
  
  try {
    await axios.put(
      `${SPOTIFY_API_BASE}/me/player/play`,
      {
        uris: [trackUri]
      },
      { headers: getAuthHeaders() }
    );

    res.json({ 
      message: `Started playing track: ${trackUri}`,
      original_input: req.params.trackUri
    });
  } catch (error) {
    console.error('❌ Play error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 404) {
      res.status(404).json({ 
        error: 'No active device found. Please open Spotify on a device and start playing something first.' 
      });
    } else if (error.response && error.response.status === 403) {
      res.status(403).json({ 
        error: 'Premium subscription required for playback control' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to start playback',
        details: error.response?.data || error.message,
        tried_uri: trackUri
      });
    }
  }
});

// Alternative endpoint that accepts track ID directly
app.get('/spotify/play-id/:trackId', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const trackId = req.params.trackId;
  const trackUri = `spotify:track:${trackId}`;
  
  console.log('🎵 Playing track by ID:', trackId, '→', trackUri);
  
  try {
    await axios.put(
      `${SPOTIFY_API_BASE}/me/player/play`,
      {
        uris: [trackUri]
      },
      { headers: getAuthHeaders() }
    );

    res.json({ 
      message: `Started playing track: ${trackUri}`,
      track_id: trackId
    });
  } catch (error) {
    console.error('❌ Play error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 404) {
      res.status(404).json({ 
        error: 'No active device found. Please open Spotify on a device and start playing something first.' 
      });
    } else if (error.response && error.response.status === 403) {
      res.status(403).json({ 
        error: 'Premium subscription required for playback control' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to start playback',
        details: error.response?.data || error.message,
        tried_uri: trackUri
      });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    authenticated: !!accessToken,
    timestamp: new Date().toISOString()
  });
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT}/login to authenticate with Spotify`);
  console.log(`🎵 Then visit http://localhost:${PORT}/spotify to see your data`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port by setting PORT environment variable.`);
  }
  process.exit(1);
});