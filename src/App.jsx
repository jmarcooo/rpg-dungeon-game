import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// 0 = Grass, 1 = Wall/Tree, 2 = NPC/Quest Giver
const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 2, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 2, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export default function App() {
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [playerStats, setPlayerStats] = useState({ name: 'Marco', level: 1, hp: 100 });

  // Handle Movement
  const handleKeyDown = useCallback((e) => {
    setPlayerPosition((prev) => {
      let newX = prev.x;
      let newY = prev.y;

      if (e.key === 'ArrowUp') newY -= 1;
      if (e.key === 'ArrowDown') newY += 1;
      if (e.key === 'ArrowLeft') newX -= 1;
      if (e.key === 'ArrowRight') newX += 1;

      // Keep player inside the grid bounds
      if (newX >= 0 && newX < INITIAL_MAP[0].length && newY >= 0 && newY < INITIAL_MAP.length) {
        return { x: newX, y: newY };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="game-container">
      {/* Map Section */}
      <div className="map-view">
        {INITIAL_MAP.map((row, rowIndex) => (
          <div key={rowIndex} className="map-row">
            {row.map((cell, colIndex) => {
              const isPlayerHere = playerPosition.x === colIndex && playerPosition.y === rowIndex;
              let cellClass = 'cell grass';
              if (cell === 1) cellClass = 'cell wall';
              if (cell === 2) cellClass = 'cell npc';

              return (
                <div key={`${rowIndex}-${colIndex}`} className={cellClass}>
                  {isPlayerHere && <div className="player">P</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* UI Section */}
      <div className="ui-panel">
        <h2>Character Info</h2>
        <p><strong>Name:</strong> {playerStats.name}</p>
        <p><strong>Level:</strong> {playerStats.level}</p>
        <p><strong>HP:</strong> {playerStats.hp} / 100</p>
        
        <hr />
        
        <h2>Active Quests</h2>
        <ul>
          <li>Find the Village Elder</li>
          <li>Defeat 3 Slimes (0/3)</li>
        </ul>
      </div>
    </div>
  );
}
