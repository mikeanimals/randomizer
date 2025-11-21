import { useState, useEffect } from "react";
import "./App.css";
import { animals } from "./animals";

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    const savedAnimal = localStorage.getItem("secretSantaAnimal");
    if (savedAnimal) {
      const animal = JSON.parse(savedAnimal);
      setSelectedAnimal(animal);
      setHasSelected(true);
    }
  }, []);

  const getRandomAnimal = () => {
    setIsAnimating(true);
    setImageError(false);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * animals.length);
      const animal = animals[randomIndex];
      setSelectedAnimal(animal);
      setHasSelected(true);
      localStorage.setItem("secretSantaAnimal", JSON.stringify(animal));
      setIsAnimating(false);
    }, 300);
  };

  const resetSelection = () => {
    localStorage.removeItem("secretSantaAnimal");
    setSelectedAnimal(null);
    setHasSelected(false);
    setImageError(false);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🎅 Тайный Санта 🎄</h1>

        <div className="result-container">
          {selectedAnimal ? (
            <div className={`animal-card ${isAnimating ? "animating" : ""}`}>
              <div className="santa-badge">🎁 Ваш подопечный</div>
              <div className="animal-image">
                {!imageError ? (
                  <img
                    src={selectedAnimal.image}
                    alt={selectedAnimal.name}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="animal-emoji">{selectedAnimal.emoji}</div>
                )}
              </div>
              <h2 className="animal-name">{selectedAnimal.name}</h2>
              <p className="animal-description">{selectedAnimal.description}</p>
              <div className="gift-message">
                🎁 Подарите этому животному подарок на Новый год!
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <div className="placeholder-icon">🎅</div>
              <p>
                Нажмите кнопку, чтобы узнать, какому животному вы будете Тайным
                Сантой!
              </p>
            </div>
          )}
        </div>

        {!hasSelected && (
          <button
            className="randomize-button"
            onClick={getRandomAnimal}
            disabled={isAnimating}
          >
            {isAnimating
              ? "🎄 Выбираю животное..."
              : "🎁 Узнать своего подопечного"}
          </button>
        )}
        {hasSelected && (
          <div className="selected-actions">
            <div className="already-selected-message">
              🎁 Вы уже выбрали своего подопечного!
            </div>
            <button className="reset-button" onClick={resetSelection}>
              🔄 Отменить выбор
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
