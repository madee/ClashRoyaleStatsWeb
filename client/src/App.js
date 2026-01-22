import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TabBar from './components/TabBar';
import ClanStatistics from './components/ClanStatistics';
import ClanMembers from './components/ClanMembers';
import PlayerStatistics from './components/PlayerStatistics';
import BattleLog from './components/BattleLog';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [clanTag, setClanTag] = useState(localStorage.getItem('lastClanTag') || '');
  const [playerTag, setPlayerTag] = useState('');
  const [clanData, setClanData] = useState(null);
  const [membersData, setMembersData] = useState(null);
  const [warData, setWarData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [battlesData, setBattlesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ['Clan Statistics', 'Clan Members', 'Player Statistics', 'Battle Log'];

  const fetchClan = async (tag) => {
    if (!tag) return;

    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    setLoading(true);
    setError(null);

    try {
      // Save to localStorage
      localStorage.setItem('lastClanTag', normalizedTag);
      setClanTag(normalizedTag);

      // Fetch clan info
      const clanRes = await fetch(`/api/clan/${encodeURIComponent(normalizedTag)}`);
      if (!clanRes.ok) throw new Error((await clanRes.json()).error);
      const clan = await clanRes.json();
      setClanData(clan);

      // Fetch members
      const membersRes = await fetch(`/api/clan/${encodeURIComponent(normalizedTag)}/members`);
      if (membersRes.ok) {
        setMembersData(await membersRes.json());
      }

      // Fetch river race log (also updates database)
      const logRes = await fetch(`/api/clan/${encodeURIComponent(normalizedTag)}/riverracelog`);
      if (logRes.ok) {
        setWarData(await logRes.json());
      }

      // Fetch current war
      const warRes = await fetch(`/api/clan/${encodeURIComponent(normalizedTag)}/currentriverrace`);
      if (warRes.ok) {
        const currentWar = await warRes.json();
        setClanData(prev => ({ ...prev, currentWar }));
      }

      setActiveTab(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayer = async (tag) => {
    if (!tag) return;

    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    setLoading(true);
    setError(null);

    try {
      setPlayerTag(normalizedTag);

      // Fetch player info
      const playerRes = await fetch(`/api/player/${encodeURIComponent(normalizedTag)}`);
      if (!playerRes.ok) throw new Error((await playerRes.json()).error);
      setPlayerData(await playerRes.json());

      // Fetch battle log
      const battlesRes = await fetch(`/api/player/${encodeURIComponent(normalizedTag)}/battlelog`);
      if (battlesRes.ok) {
        setBattlesData(await battlesRes.json());
      }

      setActiveTab(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberTag) => {
    fetchPlayer(memberTag);
  };

  // Load saved clan on mount
  useEffect(() => {
    const savedTag = localStorage.getItem('lastClanTag');
    if (savedTag) {
      fetchClan(savedTag);
    }
  }, []);

  return (
    <div className="app">
      <Header />
      <SearchBar
        clanTag={clanTag}
        playerTag={playerTag}
        onClanSearch={fetchClan}
        onPlayerSearch={fetchPlayer}
        loading={loading}
      />

      {error && <div className="error-message">{error}</div>}

      <div className="content-container">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === 0 && (
            <ClanStatistics clan={clanData} warLog={warData} />
          )}
          {activeTab === 1 && (
            <ClanMembers
              members={membersData}
              warLog={warData}
              currentWar={clanData?.currentWar}
              clanTag={clanTag}
              onMemberClick={handleMemberClick}
            />
          )}
          {activeTab === 2 && (
            <PlayerStatistics player={playerData} />
          )}
          {activeTab === 3 && (
            <BattleLog battles={battlesData} playerName={playerData?.name} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
