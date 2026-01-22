import React, { useState } from 'react';

function SearchBar({ clanTag, playerTag, onClanSearch, onPlayerSearch, loading }) {
  const [clanInput, setClanInput] = useState(clanTag || '');
  const [playerInput, setPlayerInput] = useState(playerTag || '');

  const handleClanSubmit = (e) => {
    e.preventDefault();
    onClanSearch(clanInput);
  };

  const handlePlayerSubmit = (e) => {
    e.preventDefault();
    onPlayerSearch(playerInput);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleClanSubmit} className="search-form">
        <label>Clan Tag:</label>
        <input
          type="text"
          value={clanInput}
          onChange={(e) => setClanInput(e.target.value)}
          placeholder="#ABC123"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Clan Stats'}
        </button>
      </form>

      <form onSubmit={handlePlayerSubmit} className="search-form">
        <label>Player Tag:</label>
        <input
          type="text"
          value={playerInput}
          onChange={(e) => setPlayerInput(e.target.value)}
          placeholder="#XYZ789"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Player Stats'}
        </button>
      </form>

      <span className="hint">(Include #)</span>
    </div>
  );
}

export default SearchBar;
