import React from 'react';

function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-bar">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={`tab-button ${activeTab === index ? 'active' : ''}`}
          onClick={() => onTabChange(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default TabBar;
