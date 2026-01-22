import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ClanStatistics({ clan, warLog }) {
  if (!clan) {
    return <div className="empty-state">Enter a clan tag to view statistics</div>;
  }

  // Process war log data for chart
  const chartData = [];
  if (warLog?.items) {
    warLog.items.slice(0, 10).forEach((race, index) => {
      const standings = race.standings || [];
      let clanTotal = 0;
      let position = 0;

      for (const standing of standings) {
        if (standing.clan?.tag === clan.tag) {
          const participants = standing.clan.participants || [];
          clanTotal = participants.reduce((sum, p) => sum + (p.fame || 0), 0);
          position = standing.rank || 0;
          break;
        }
      }

      chartData.push({
        week: `W${index + 1}`,
        fame: clanTotal,
        position
      });
    });
  }

  const getPositionColor = (pos) => {
    if (pos === 1) return '#28A745';
    if (pos === 2) return '#FFC107';
    if (pos === 3) return '#17A2B8';
    return '#DC3545';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p>Fame: {data.fame.toLocaleString()}</p>
          <p style={{ color: getPositionColor(data.position) }}>
            Position: #{data.position}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clan-statistics">
      <div className="stats-header">
        <h2>{clan.name}</h2>
        <span className="tag">{clan.tag}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-section">
          <h3>Overview</h3>
          <div className="stat-row">
            <span className="label">Description:</span>
            <span className="value">{clan.description || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="label">Type:</span>
            <span className="value">{clan.type?.replace('inviteOnly', 'Invite Only') || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="label">Location:</span>
            <span className="value">{clan.location?.name || 'N/A'}</span>
          </div>
        </div>

        <div className="stat-section">
          <h3>Statistics</h3>
          <div className="stat-row">
            <span className="label">Clan Score:</span>
            <span className="value">{clan.clanScore?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">War Trophies:</span>
            <span className="value">{clan.clanWarTrophies?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Members:</span>
            <span className="value">{clan.members || 0}/50</span>
          </div>
          <div className="stat-row">
            <span className="label">Required Trophies:</span>
            <span className="value">{clan.requiredTrophies?.toLocaleString() || 0}</span>
          </div>
          <div className="stat-row">
            <span className="label">Donations/Week:</span>
            <span className="value">{clan.donationsPerWeek?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="stat-section">
          <h3>Clan War</h3>
          <div className="stat-row">
            <span className="label">War League:</span>
            <span className="value">{clan.clanWarLeague?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-section">
          <h3>River Race Performance</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B6B8C" />
                <XAxis
                  dataKey="week"
                  stroke="#E0E0E0"
                  tick={{ fill: '#E0E0E0' }}
                />
                <YAxis
                  stroke="#E0E0E0"
                  tick={{ fill: '#E0E0E0' }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="fame"
                  stroke="#D4A84B"
                  strokeWidth={3}
                  dot={{ fill: '#E8C252', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClanStatistics;
