import React from 'react';

function PlayerStatistics({ player }) {
  if (!player) {
    return <div className="empty-state">Enter a player tag to view statistics</div>;
  }

  const roleDisplay = {
    leader: 'Leader',
    coLeader: 'Co-Leader',
    elder: 'Elder',
    member: 'Member'
  }[player.role] || player.role;

  const currentDeck = player.currentDeck || [];
  const cards = player.cards || [];
  const topCards = [...cards].sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 8);

  return (
    <div className="player-statistics">
      <div className="stats-header">
        <h2>{player.name}</h2>
        <span className="tag">{player.tag}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-section">
          <h3>Overview</h3>
          <div className="stat-row">
            <span className="label">Experience Level:</span>
            <span className="value">{player.expLevel || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Trophies:</span>
            <span className="value">{player.trophies?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Best Trophies:</span>
            <span className="value">{player.bestTrophies?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Arena:</span>
            <span className="value">{player.arena?.name || 'N/A'}</span>
          </div>
        </div>

        <div className="stat-section">
          <h3>Clan Info</h3>
          {player.clan ? (
            <>
              <div className="stat-row">
                <span className="label">Clan:</span>
                <span className="value">{player.clan.name}</span>
              </div>
              <div className="stat-row">
                <span className="label">Clan Tag:</span>
                <span className="value">{player.clan.tag}</span>
              </div>
              <div className="stat-row">
                <span className="label">Role:</span>
                <span className="value">{roleDisplay}</span>
              </div>
            </>
          ) : (
            <div className="stat-row">
              <span className="value">Not in a clan</span>
            </div>
          )}
        </div>

        <div className="stat-section">
          <h3>Battle Statistics</h3>
          <div className="stat-row">
            <span className="label">Wins:</span>
            <span className="value">{player.wins?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Losses:</span>
            <span className="value">{player.losses?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Three Crown Wins:</span>
            <span className="value">{player.threeCrownWins?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Total Battles:</span>
            <span className="value">{player.battleCount?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="stat-section">
          <h3>Challenge Statistics</h3>
          <div className="stat-row">
            <span className="label">Cards Won:</span>
            <span className="value">{player.challengeCardsWon?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Max Wins:</span>
            <span className="value">{player.challengeMaxWins || 0}</span>
          </div>
        </div>

        <div className="stat-section">
          <h3>Donations</h3>
          <div className="stat-row">
            <span className="label">Donations:</span>
            <span className="value">{player.donations?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Received:</span>
            <span className="value">{player.donationsReceived?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Total:</span>
            <span className="value">{player.totalDonations?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="stat-section">
          <h3>Cards ({cards.length} found)</h3>
        </div>

        <div className="stat-section">
          <h3>Current Deck</h3>
          <div className="card-list">
            {currentDeck.map((card, i) => (
              <span key={i} className="card-name">{card.name}</span>
            ))}
          </div>
        </div>

        <div className="stat-section">
          <h3>Highest Level Cards</h3>
          <div className="card-list">
            {topCards.map((card, i) => (
              <span key={i} className="card-name">
                {card.name} (Lvl {card.level})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerStatistics;
