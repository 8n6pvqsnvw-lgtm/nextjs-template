"use client";
import { useEffect, useState } from 'react';
import { init, useTelegram } from '@telegram-apps/sdk';

init();

export default function Home() {
  const tg = useTelegram();
  const [energy, setEnergy] = useState(100);
  const [money, setMoney] = useState(0);
  const [screen, setScreen] = useState('room'); // room, corridor, battle
  const [enemyHp, setEnemyHp] = useState(0);
  const [message, setMessage] = useState('Ты в палате психушки...');

  useEffect(() => {
    tg.ready();
    tg.expand();
    // Сохранение в localStorage (позже — БД)
    const saved = localStorage.getItem('gameData');
    if (saved) {
      const data = JSON.parse(saved);
      setEnergy(data.energy || 100);
      setMoney(data.money || 0);
    }
  }, []);

  const saveGame = () => {
    localStorage.setItem('gameData', JSON.stringify({ energy, money }));
    tg.sendData(JSON.stringify({ energy, money })); // Боту
  };

  const goCorridor = () => {
    if (energy < 10) return setMessage('Нет энергии!');
    setEnergy(energy - 10);
    setScreen('corridor');
    setMessage('Коридор: заначка или бой?');
    saveGame();
  };

  const findMoney = () => {
    setMoney(money + 50);
    setMessage('Заначка! +50 монет');
    setEnergy(energy - 5);
    saveGame();
  };

  const startBattle = () => {
    setEnemyHp(30 + Math.random() * 20);
    setScreen('battle');
    setMessage('Бой с пациентом!');
  };

  const attack = () => {
    const dmg = 10 + Math.random() * 10;
    setEnemyHp(Math.max(0, enemyHp - dmg));
    setEnergy(energy - 5);
    if (enemyHp <= dmg) {
      setMoney(money + 100);
      setMessage('Победа! +100 монет');
      setScreen('corridor');
    } else {
      setMessage(`Удар! Осталось ${enemyHp - dmg} HP врага`);
    }
    saveGame();
    tg.HapticFeedback.impactOccurred('light');
  };

  const backToRoom = () => {
    setScreen('room');
    setMessage('Вернулся в палату');
  };

  if (screen === 'room') {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>🛏️ Палата</h1>
        <p>Энергия: {energy}/100 | Монеты: {money}</p>
        <p>{message}</p>
        <button onClick={goCorridor} disabled={energy < 10} style={{ padding: 10, margin: 5, background: '#007AFF', color: 'white', border: 'none', borderRadius: 10 }}>
          🚪 В коридор (-10 энергии)
        </button>
      </div>
    );
  }

  if (screen === 'corridor') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>🚶 Коридор</h1>
        <p>Энергия: {energy} | Монеты: {money}</p>
        <button onClick={findMoney} style={{ padding: 10, margin: 5, background: '#34C759', color: 'white', border: 'none', borderRadius: 10 }}>
          💰 Заначка (-5 энергии)
        </button>
        <br />
        <button onClick={startBattle} style={{ padding: 10, margin: 5, background: '#FF3B30', color: 'white', border: 'none', borderRadius: 10 }}>
          ⚔️ Бой!
        </button>
        <br />
        <button onClick={backToRoom} style={{ padding: 10, margin: 5, background: '#8E8E93', color: 'white', border: 'none', borderRadius: 10 }}>
          ← Назад
        </button>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>⚔️ Бой</h1>
      <p>Враг HP: {enemyHp}</p>
      <button onClick={attack} style={{ padding: 15, background: '#FF9500', color: 'white', border: 'none', borderRadius: 10, fontSize: 18 }}>
        👊 Удар!
      </button>
      <p>{message}</p>
    </div>
  );
}
