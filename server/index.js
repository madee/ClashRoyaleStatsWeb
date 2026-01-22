const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const { WarDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = new WarDatabase();

// Clash Royale API base URL
const CR_API_BASE = 'https://api.clashroyale.com/v1';

// Helper to make API requests
async function crApiRequest(endpoint) {
  const apiKey = process.env.CLASH_ROYALE_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const response = await axios.get(`${CR_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
}

// API Routes

// Get clan info
app.get('/api/clan/:tag', async (req, res) => {
  try {
    const tag = encodeURIComponent(req.params.tag);
    const clan = await crApiRequest(`/clans/${tag}`);
    res.json(clan);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Get clan members
app.get('/api/clan/:tag/members', async (req, res) => {
  try {
    const tag = encodeURIComponent(req.params.tag);
    const members = await crApiRequest(`/clans/${tag}/members`);
    res.json(members);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Get current river race
app.get('/api/clan/:tag/currentriverrace', async (req, res) => {
  try {
    const tag = encodeURIComponent(req.params.tag);
    const race = await crApiRequest(`/clans/${tag}/currentriverrace`);
    res.json(race);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Get river race log
app.get('/api/clan/:tag/riverracelog', async (req, res) => {
  try {
    const tag = encodeURIComponent(req.params.tag);
    const clanTag = req.params.tag.startsWith('#') ? req.params.tag : `#${req.params.tag}`;

    const log = await crApiRequest(`/clans/${tag}/riverracelog`);

    // Check if database needs update and populate
    if (db.needsUpdate(clanTag)) {
      db.populateFromApiData(clanTag, log.items || []);
    }

    res.json(log);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Get player info
app.get('/api/player/:tag', async (req, res) => {
  try {
    const tag = encodeURIComponent(req.params.tag);
    const player = await crApiRequest(`/players/${tag}`);
    res.json(player);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Get player battle log
app.get('/api/player/:tag/battlelog', async (req, res) => {
  try {
    const tag = encodeURIComponent(req.params.tag);
    const battles = await crApiRequest(`/players/${tag}/battlelog`);
    res.json(battles);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Get war history from database
app.get('/api/db/clan/:tag/wars', (req, res) => {
  try {
    const clanTag = req.params.tag.startsWith('#') ? req.params.tag : `#${req.params.tag}`;
    const wars = db.getWarHistory(clanTag);
    res.json(wars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all members with war data (including former members)
app.get('/api/db/clan/:tag/members', (req, res) => {
  try {
    const clanTag = req.params.tag.startsWith('#') ? req.params.tag : `#${req.params.tag}`;
    const members = db.getAllMembersForClan(clanTag);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
