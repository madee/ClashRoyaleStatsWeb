import React from 'react';

function BattleLog({ battles, playerName }) {
  if (!battles || battles.length === 0) {
    return <div className="empty-state">No battle log available</div>;
  }

  return (
    <div className="battle-log">
      <h2>Recent Battles{playerName && ` - ${playerName}`}</h2>

      <div className="battles-list">
        {battles.slice(0, 25).map((battle, index) => {
          const team = battle.team?.[0] || {};
          const opponent = battle.opponent?.[0] || {};
          const teamCrowns = team.crowns || 0;
          const opponentCrowns = opponent.crowns || 0;

          let result, resultClass;
          if (teamCrowns > opponentCrowns) {
            result = 'WIN';
            resultClass = 'win';
          } else if (teamCrowns < opponentCrowns) {
            result = 'LOSS';
            resultClass = 'loss';
          } else {
            result = 'DRAW';
            resultClass = 'draw';
          }

          return (
            <div key={index} className="battle-card">
              <div className="battle-header">
                <span className="battle-number">Battle #{index + 1}</span>
                <span className={`battle-result ${resultClass}`}>{result}</span>
              </div>
              <div className="battle-details">
                <div className="battle-row">
                  <span className="label">Type:</span>
                  <span className="value">{battle.type || 'Unknown'}</span>
                </div>
                <div className="battle-row">
                  <span className="label">Score:</span>
                  <span className="value">{teamCrowns} - {opponentCrowns}</span>
                </div>
                <div className="battle-row">
                  <span className="label">Opponent:</span>
                  <span className="value">
                    {opponent.name || 'Unknown'} ({opponent.trophies?.toLocaleString() || 0} trophies)
                  </span>
                </div>
                <div className="battle-row">
                  <span className="label">Arena:</span>
                  <span className="value">{battle.arena?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BattleLog;
