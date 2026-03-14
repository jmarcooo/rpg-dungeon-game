import { useState, useEffect, useCallback } from 'react';
import './App.css';

const ENTITIES = {
  0: { type: 'grass', passable: true, className: 'grass' },
  1: { type: 'wall', passable: false, className: 'wall' },
  2: { type: 'npc', name: 'Village Elder', passable: false, className: 'npc elder', dialogue: "Welcome to our village! The forest to the right is dangerous. We need you to defeat 3 slimes.", quest: "Defeat 3 Slimes" },
  3: { type: 'door', passable: true, className: 'door', targetMap: 'forest', targetPos: { x: 1, y: 5 } },
  4: { type: 'door', passable: true, className: 'door', targetMap: 'village', targetPos: { x: 8, y: 5 } },
  5: { type: 'npc', name: 'Guard', passable: false, className: 'npc guard', dialogue: "Stay safe out there. The slimes are getting aggressive." },
  6: { type: 'npc', name: 'Slime', passable: false, className: 'npc slime', dialogue: "*The slime jiggles aggressively!*", questProgress: "Defeat 3 Slimes" },
  7: { type: 'door', passable: true, className: 'door', targetMap: 'cave', targetPos: { x: 1, y: 1 } },
  8: { type: 'door', passable: true, className: 'door', targetMap: 'forest', targetPos: { x: 8, y: 8 } },
  9: { type: 'wall', passable: false, className: 'cave-wall' },
  10: { type: 'npc', name: 'Treasure Chest', passable: false, className: 'npc chest', dialogue: "You found a Rusty Sword!", quest: "Find a Weapon" }
};

const MAPS = {
  village: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 5, 0, 0, 1, 1, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  forest: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 6, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 1, 0, 6, 0, 0, 0, 1, 0, 1],
    [4, 0, 0, 1, 1, 0, 6, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 7, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  cave: [
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [8, 0, 0, 9, 0, 0, 0, 0, 0, 9],
    [9, 9, 0, 9, 0, 9, 9, 9, 0, 9],
    [9, 0, 0, 0, 0, 0, 0, 9, 0, 9],
    [9, 0, 9, 9, 9, 9, 0, 9, 0, 9],
    [9, 0, 0, 0, 0, 9, 0, 0, 0, 9],
    [9, 9, 9, 9, 0, 9, 9, 9, 9, 9],
    [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
    [9, 0, 9, 9, 9, 9, 9, 0, 10, 9],
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  ]
};

export default function App() {
  const [currentMap, setCurrentMap] = useState('village');
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [playerStats] = useState({ name: 'Marco', level: 1, hp: 100 });
  const [quests, setQuests] = useState(['Find the Village Elder']);
  const [dialogue, setDialogue] = useState('Welcome to the RPG Dungeon Game!');

  // Handle Movement
  const handleKeyDown = useCallback((e) => {
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    if (e.key === 'ArrowUp') newY -= 1;
    if (e.key === 'ArrowDown') newY += 1;
    if (e.key === 'ArrowLeft') newX -= 1;
    if (e.key === 'ArrowRight') newX += 1;

    if (newX === playerPosition.x && newY === playerPosition.y) return;

    const mapData = MAPS[currentMap];

    // Keep player inside the grid bounds
    if (newX >= 0 && newX < mapData[0].length && newY >= 0 && newY < mapData.length) {
      const cellValue = mapData[newY][newX];
      const entity = ENTITIES[cellValue];

      if (entity) {
        if (entity.dialogue) {
           setDialogue(`${entity.name}: "${entity.dialogue}"`);
        }
        if (entity.quest && !quests.includes(entity.quest)) {
           setQuests(q => [...q, entity.quest]);
        }

        if (entity.type === 'door') {
           setCurrentMap(entity.targetMap);
           setPlayerPosition(entity.targetPos);
           return;
        }

        if (entity.passable) {
          setPlayerPosition({ x: newX, y: newY });
        }
      } else {
         // fallback if entity not defined
         setPlayerPosition({ x: newX, y: newY });
      }
    }
  }, [playerPosition, currentMap, quests]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="game-container">
      {/* Map Section */}
      <div className="map-view">
        {MAPS[currentMap].map((row, rowIndex) => (
          <div key={rowIndex} className="map-row">
            {row.map((cell, colIndex) => {
              const isPlayerHere = playerPosition.x === colIndex && playerPosition.y === rowIndex;
              const entity = ENTITIES[cell];
              const cellClass = `cell ${entity ? entity.className : 'grass'}`;

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
          {quests.map((quest, index) => (
            <li key={index}>{quest}</li>
          ))}
        </ul>

        <hr />

        <h2>Dialogue</h2>
        <div className="dialogue-box">
          <p>{dialogue}</p>
        </div>
      </div>
    </div>
  );
}
