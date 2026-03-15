import { useState, useEffect, useCallback } from 'react';
import './App.css';

const ENTITIES = {
  0: { type: 'grass', passable: true, className: 'grass' },
  1: { type: 'wall', passable: false, className: 'wall' },
  2: { type: 'npc', name: 'Village Elder', passable: false, className: 'npc elder', dialogue: "Welcome to our village! The forest to the right is dangerous. We need you to defeat 3 slimes.", quest: "Defeat 3 Slimes" },
  3: { type: 'door', passable: true, className: 'door', targetMap: 'forest', targetPos: { x: 1, y: 5 } },
  4: { type: 'door', passable: true, className: 'door', targetMap: 'village', targetPos: { x: 13, y: 5 } },
  5: { type: 'npc', name: 'Guard', passable: false, className: 'npc guard', dialogue: "Stay safe out there. The slimes are getting aggressive." },
  6: { type: 'enemy', name: 'Slime', passable: false, className: 'npc slime', maxHp: 20, attack: 5, defense: 2, expReward: 20, loot: { name: 'Slime Goo' } },
  7: { type: 'door', passable: true, className: 'door', targetMap: 'cave', targetPos: { x: 1, y: 1 } },
  8: { type: 'door', passable: true, className: 'door', targetMap: 'forest', targetPos: { x: 8, y: 8 } },
  9: { type: 'wall', passable: false, className: 'cave-wall' },
  10: { type: 'item', name: 'Treasure Chest', passable: false, className: 'npc chest', dialogue: "You found a Rusty Sword!", loot: { name: 'Rusty Sword', type: 'weapon', attack: 5 } },
  11: { type: 'enemy', name: 'Goblin', passable: false, className: 'npc goblin', maxHp: 40, attack: 12, defense: 5, expReward: 40, loot: { name: 'Leather Armor', type: 'body', defense: 4 } },
  12: { type: 'enemy', name: 'Orc', passable: false, className: 'npc orc', maxHp: 80, attack: 18, defense: 10, expReward: 80, loot: { name: 'Iron Helmet', type: 'head', defense: 6 } },
  13: { type: 'enemy', name: 'Dragon Boss', passable: false, className: 'npc boss', maxHp: 300, attack: 35, defense: 20, expReward: 500, loot: { name: 'Dragon Sword', type: 'weapon', attack: 30 } },
  14: { type: 'item', name: 'Health Potion', passable: false, className: 'npc potion', dialogue: "You found a potion!", loot: { name: 'Health Potion', type: 'consumable', heal: 50 } }
};

const MAPS = {
  village: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 5, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  forest: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 6, 0, 11, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 1, 0, 6, 0, 0, 0, 1, 0, 1],
    [4, 0, 0, 1, 1, 0, 11, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 12, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 7, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  cave: [
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [8, 0, 0, 9, 0, 0, 14, 0, 0, 9],
    [9, 9, 0, 9, 0, 9, 9, 9, 0, 9],
    [9, 0, 0, 0, 0, 0, 0, 9, 0, 9],
    [9, 0, 9, 9, 9, 9, 0, 9, 0, 9],
    [9, 0, 0, 12, 0, 9, 0, 0, 0, 9],
    [9, 9, 9, 9, 0, 9, 9, 9, 9, 9],
    [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
    [9, 0, 9, 9, 9, 9, 9, 13, 10, 9],
    [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  ]
};

export default function App() {
  const [currentMap, setCurrentMap] = useState('village');
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [playerStats, setPlayerStats] = useState({
    name: 'Marco',
    level: 1,
    hp: 100,
    maxHp: 100,
    exp: 0,
    expToNext: 50,
    attack: 10,
    defense: 5
  });
  const [equipment, setEquipment] = useState({ head: null, body: null, weapon: null });
  const [inventory, setInventory] = useState([]);
  const [quests, setQuests] = useState(['Find the Village Elder']);
  const [dialogue, setDialogue] = useState('Welcome to the RPG Dungeon Game!');
  const [mapsData, setMapsData] = useState(MAPS);
  const [enemyHp, setEnemyHp] = useState({}); // { "map-x-y": hp }

  // Handle Movement
  const handleKeyDown = useCallback((e) => {
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    if (e.key === 'ArrowUp') newY -= 1;
    if (e.key === 'ArrowDown') newY += 1;
    if (e.key === 'ArrowLeft') newX -= 1;
    if (e.key === 'ArrowRight') newX += 1;

    if (newX === playerPosition.x && newY === playerPosition.y) return;

    const mapData = mapsData[currentMap];

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

        if (entity.type === 'item') {
          setDialogue(`${entity.name}: "${entity.dialogue}"`);
          if (entity.loot) {
             setInventory(inv => [...inv, entity.loot]);
          }

          // Remove item from map
          const updatedMapData = [...mapsData[currentMap]];
          updatedMapData[newY] = [...updatedMapData[newY]];
          updatedMapData[newY][newX] = 0; // Turn to grass
          setMapsData({ ...mapsData, [currentMap]: updatedMapData });
        }

        if (entity.type === 'enemy') {
          const enemyId = `${currentMap}-${newX}-${newY}`;
          const currentEnemyHp = enemyHp[enemyId] !== undefined ? enemyHp[enemyId] : entity.maxHp;

          // Player attacks
          const playerTotalAttack = playerStats.attack + (equipment.weapon ? equipment.weapon.attack : 0);
          const damageToEnemy = Math.max(1, playerTotalAttack - entity.defense);
          const newEnemyHp = currentEnemyHp - damageToEnemy;

          let logMessage = `You hit ${entity.name} for ${damageToEnemy} damage!`;

          if (newEnemyHp <= 0) {
            logMessage += ` You defeated ${entity.name}! Gained ${entity.expReward} EXP.`;
            if (entity.loot) {
               logMessage += ` Found ${entity.loot.name}!`;
               setInventory(inv => [...inv, entity.loot]);
            }

            // Remove enemy from map
            const updatedMapData = [...mapsData[currentMap]];
            updatedMapData[newY] = [...updatedMapData[newY]];
            updatedMapData[newY][newX] = 0; // Turn to grass
            setMapsData({ ...mapsData, [currentMap]: updatedMapData });

            // Award EXP
            setPlayerStats(prev => {
              const newExp = prev.exp + entity.expReward;
              return { ...prev, exp: newExp };
            });

            // Clear enemy HP state
            setEnemyHp(prev => {
              const updated = { ...prev };
              delete updated[enemyId];
              return updated;
            });

          } else {
            // Enemy attacks back
            const playerTotalDefense = playerStats.defense + (equipment.head ? equipment.head.defense : 0) + (equipment.body ? equipment.body.defense : 0);
            const damageToPlayer = Math.max(1, entity.attack - playerTotalDefense);

            logMessage += ` ${entity.name} hit you for ${damageToPlayer} damage!`;

            setEnemyHp(prev => ({ ...prev, [enemyId]: newEnemyHp }));
            setPlayerStats(prev => ({ ...prev, hp: Math.max(0, prev.hp - damageToPlayer) }));
          }
          setDialogue(logMessage);
        }

        if (entity.passable) {
          setPlayerPosition({ x: newX, y: newY });
        }
      } else {
         // fallback if entity not defined
         setPlayerPosition({ x: newX, y: newY });
      }
    }
  }, [playerPosition, currentMap, quests, mapsData, enemyHp, playerStats, equipment]);

  // Leveling System
  useEffect(() => {
    if (playerStats.exp >= playerStats.expToNext) {
      setPlayerStats(prev => ({
        ...prev,
        level: prev.level + 1,
        exp: prev.exp - prev.expToNext,
        expToNext: Math.floor(prev.expToNext * 1.5),
        maxHp: prev.maxHp + 20,
        hp: prev.maxHp + 20, // Heal on level up
        attack: prev.attack + 3,
        defense: prev.defense + 2
      }));
      setDialogue(`Level Up! You are now level ${playerStats.level + 1}! Stats increased.`);
    }
  }, [playerStats.exp, playerStats.expToNext, playerStats.level]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="game-container">
      {/* Map Section */}
      <div className="map-view">
        {mapsData[currentMap].map((row, rowIndex) => (
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
        <div className="stats-container">
          <h2>Character Info</h2>
          <p><strong>Name:</strong> {playerStats.name}</p>
          <p><strong>Level:</strong> {playerStats.level}</p>
          <p><strong>HP:</strong> {playerStats.hp} / {playerStats.maxHp}</p>
          <p><strong>EXP:</strong> {playerStats.exp} / {playerStats.expToNext}</p>
          <p><strong>Attack:</strong> {playerStats.attack} (+{equipment.weapon ? equipment.weapon.attack : 0})</p>
          <p><strong>Defense:</strong> {playerStats.defense} (+{(equipment.head ? equipment.head.defense : 0) + (equipment.body ? equipment.body.defense : 0)})</p>
        </div>

        <hr />

        <div className="equipment-container">
          <h2>Equipment</h2>
          <p><strong>Head:</strong> {equipment.head ? equipment.head.name : 'None'}</p>
          <p><strong>Body:</strong> {equipment.body ? equipment.body.name : 'None'}</p>
          <p><strong>Weapon:</strong> {equipment.weapon ? equipment.weapon.name : 'None'}</p>
        </div>

        <hr />

        <div className="inventory-container">
          <h2>Inventory</h2>
          <ul>
            {inventory.length > 0 ? inventory.map((item, index) => (
              <li key={index}>
                {item.name}
                {item.type && (
                  <button onClick={() => {
                    if (item.type === 'consumable') {
                       setPlayerStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + item.heal) }));
                       setDialogue(`You used ${item.name} and healed ${item.heal} HP!`);
                       setInventory(inv => inv.filter((_, i) => i !== index));
                    } else if (item.type === 'weapon') {
                       setEquipment(prev => ({ ...prev, weapon: item }));
                       setDialogue(`Equipped ${item.name}!`);
                    } else if (item.type === 'head') {
                       setEquipment(prev => ({ ...prev, head: item }));
                       setDialogue(`Equipped ${item.name}!`);
                    } else if (item.type === 'body') {
                       setEquipment(prev => ({ ...prev, body: item }));
                       setDialogue(`Equipped ${item.name}!`);
                    }
                  }}>Use / Equip</button>
                )}
              </li>
            )) : <li>Empty</li>}
          </ul>
        </div>
        
        <hr />
        
        <h2>Active Quests</h2>
        <ul>
          {quests.map((quest, index) => (
            <li key={index}>{quest}</li>
          ))}
        </ul>

        <hr />

        <h2>Action Log</h2>
        <div className="dialogue-box">
          <p>{dialogue}</p>
        </div>
      </div>
    </div>
  );
}
