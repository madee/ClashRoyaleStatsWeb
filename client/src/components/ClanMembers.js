import React, { useMemo } from 'react';

function ClanMembers({ members, warLog, currentWar, clanTag, onMemberClick }) {
  if (!members?.items) {
    return <div className="empty-state">Enter a clan tag to view members</div>;
  }

  // Process war data
  const processedMembers = useMemo(() => {
    const items = members.items || [];
    const pastWars = [];

    // Extract past war data
    if (warLog?.items) {
      warLog.items.slice(0, 6).forEach((race) => {
        const warData = {};
        const standings = race.standings || [];
        for (const standing of standings) {
          if (standing.clan?.tag === clanTag) {
            (standing.clan.participants || []).forEach((p) => {
              warData[p.tag] = p.fame || 0;
            });
            break;
          }
        }
        pastWars.push(warData);
      });
    }

    // Get current war participants
    const currentWarParticipants = {};
    if (currentWar?.clan?.participants) {
      currentWar.clan.participants.forEach((p) => {
        currentWarParticipants[p.tag] = p.fame || 0;
      });
    }

    // Process each member
    const memberData = items.map((member) => {
      const pastWarFames = [];
      const eligibleWars = [];

      for (let j = 0; j < 6; j++) {
        if (j < pastWars.length) {
          if (member.tag in pastWars[j]) {
            const fame = pastWars[j][member.tag];
            pastWarFames.push(fame);
            eligibleWars.push(fame);
          } else {
            pastWarFames.push(null);
          }
        } else {
          pastWarFames.push(null);
        }
      }

      const avgFame = eligibleWars.length > 0
        ? Math.floor(eligibleWars.reduce((a, b) => a + b, 0) / eligibleWars.length)
        : -1;

      const roleDisplay = {
        leader: 'Leader',
        coLeader: 'Co-Leader',
        elder: 'Elder',
        member: 'Member'
      }[member.role] || member.role;

      return {
        ...member,
        roleDisplay,
        currentFame: currentWarParticipants[member.tag] || 0,
        avgFame,
        pastWarFames,
        weeksCompleted: eligibleWars.length,
        lastSeen: parseLastSeen(member.lastSeen)
      };
    });

    // Sort: members with 3+ weeks first (by avg), then others
    memberData.sort((a, b) => {
      const aHasEnough = a.weeksCompleted >= 3;
      const bHasEnough = b.weeksCompleted >= 3;

      if (aHasEnough !== bHasEnough) {
        return bHasEnough - aHasEnough;
      }

      const aAvg = a.avgFame >= 0 ? a.avgFame : -1;
      const bAvg = b.avgFame >= 0 ? b.avgFame : -1;
      return bAvg - aAvg;
    });

    return memberData;
  }, [members, warLog, currentWar, clanTag]);

  function parseLastSeen(lastSeen) {
    if (!lastSeen) return 'Unknown';
    try {
      const dt = new Date(
        lastSeen.slice(0, 4) + '-' +
        lastSeen.slice(4, 6) + '-' +
        lastSeen.slice(6, 8) + 'T' +
        lastSeen.slice(9, 11) + ':' +
        lastSeen.slice(11, 13) + ':' +
        lastSeen.slice(13, 15) + 'Z'
      );
      const now = new Date();
      const diffMs = now - dt;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
      }
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } catch {
      return 'Unknown';
    }
  }

  const totalDonations = processedMembers.reduce((sum, m) => sum + (m.donations || 0), 0);
  const avgTrophies = Math.floor(
    processedMembers.reduce((sum, m) => sum + (m.trophies || 0), 0) / processedMembers.length
  );
  const totalWarFame = processedMembers.reduce((sum, m) => sum + m.currentFame, 0);

  return (
    <div className="clan-members">
      <div className="members-header">
        <h2>Clan Members ({processedMembers.length} total)</h2>
        <p className="hint">Double-click a row to view player stats</p>
      </div>

      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Current</th>
              <th>Avg</th>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i}>War-{i}</th>
              ))}
              <th>Role</th>
              <th>Trophies</th>
              <th>Donats</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {processedMembers.map((member, index) => (
              <tr
                key={member.tag}
                onDoubleClick={() => onMemberClick(member.tag)}
                className="member-row"
              >
                <td>{index + 1}</td>
                <td className="member-name">{member.name}</td>
                <td className="number">{member.currentFame.toLocaleString()}</td>
                <td className="number">
                  {member.avgFame >= 0 ? member.avgFame.toLocaleString() : '-'}
                </td>
                {member.pastWarFames.map((fame, i) => (
                  <td key={i} className="number">
                    {fame !== null ? fame.toLocaleString() : '-'}
                  </td>
                ))}
                <td>{member.roleDisplay}</td>
                <td className="number">{member.trophies?.toLocaleString()}</td>
                <td className="number">{member.donations?.toLocaleString()}</td>
                <td>{member.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="members-summary">
        <span>Total Donations: {totalDonations.toLocaleString()}</span>
        <span>Average Trophies: {avgTrophies.toLocaleString()}</span>
        <span>Total Current War Fame: {totalWarFame.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default ClanMembers;
