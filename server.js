const express = require('express');
const path = require('path');
require('dotenv').config();

// Import the Spotify API backend as a router
const spotifyApiRouter = require('./spotify-api-backend');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve 11ty static files
app.use(express.static(path.join(__dirname, 'build')));

// Mount the Spotify API backend under /api/spotify
app.use('/', spotifyApiRouter);


app.listen(PORT, () => {
  console.log(`Unified server running at http://localhost:${PORT}`);
  console.log(`- 11ty blog served from /`);
  console.log(`- Spotify API served from /api/spotify`);
});
