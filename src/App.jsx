import { useState, useEffect } from "react";
import "./App.css";
import { animals } from "./animals";

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const getSelectedAnimalsNames = () => {
    const selected = localStorage.getItem("selectedAnimalsHistory");
    return selected ? JSON.parse(selected) : [];
  };

  const getSelectedAnimals = () => {
    const selectedNames = getSelectedAnimalsNames();
    return animals.filter((animal) => selectedNames.includes(animal.name));
  };

  const addToSelectedHistory = (animalName) => {
    const history = getSelectedAnimalsNames();
    if (!history.includes(animalName)) {
      history.push(animalName);
      localStorage.setItem("selectedAnimalsHistory", JSON.stringify(history));
    }
  };

  useEffect(() => {
    const savedAnimal = localStorage.getItem("secretSantaAnimal");
    if (savedAnimal) {
      const animal = JSON.parse(savedAnimal);
      setSelectedAnimal(animal);
      setHasSelected(true);
      // Добавляем в историю при загрузке, если еще не добавлено
      addToSelectedHistory(animal.name);
    }
  }, []);

  const getRandomAnimal = () => {
    setIsAnimating(true);
    setImageError(false);
    setTimeout(() => {
      const selectedNames = getSelectedAnimalsNames();

      // Проверяем лимит в 3 подопечных
      if (selectedNames.length >= 3) {
        setIsAnimating(false);
        return;
      }

      const availableAnimals = animals.filter(
        (animal) =>
          animal.display !== false && !selectedNames.includes(animal.name)
      );

      if (availableAnimals.length === 0) {
        // Все животные уже выбраны
        setIsAnimating(false);
        alert(
          "🎄 Все животные уже были выбраны! Очистите историю, чтобы начать заново."
        );
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableAnimals.length);
      const animal = availableAnimals[randomIndex];
      setSelectedAnimal(animal);
      setHasSelected(true);
      localStorage.setItem("secretSantaAnimal", JSON.stringify(animal));
      addToSelectedHistory(animal.name);
      setIsAnimating(false);
    }, 300);
  };

  const selectAnother = () => {
    // Сохраняем текущее животное в истории, но позволяем выбрать еще одно
    localStorage.removeItem("secretSantaAnimal");
    setSelectedAnimal(null);
    setHasSelected(false);
    setImageError(false);
  };

  const showSelectedAnimal = (animal) => {
    setSelectedAnimal(animal);
    setHasSelected(true);
    setImageError(false);
    localStorage.setItem("secretSantaAnimal", JSON.stringify(animal));
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

              <div className="animal-content">
                <div className="story-section">
                  <p className="story-text">
                    🎁{" "}
                    {selectedAnimal.introText ||
                      `Вам попалась ${selectedAnimal.name}.`}
                  </p>
                  {selectedAnimal.story && (
                    <p className="story-text">{selectedAnimal.story}</p>
                  )}
                </div>

                {selectedAnimal.wishlist &&
                  selectedAnimal.wishlist.length > 0 && (
                    <div className="wishlist-section">
                      <p className="wishlist-title">
                        🐾 Что {selectedAnimal.name} хотел
                        {selectedAnimal.name.endsWith("а") ||
                        selectedAnimal.name.endsWith("я")
                          ? "а"
                          : ""}{" "}
                        бы получить от своего Санты:
                      </p>
                      <ul className="wishlist">
                        {selectedAnimal.wishlist.map((wish, index) => (
                          <li key={index} className="wish-item">
                            — {wish};
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedAnimal.closingMessage && (
                  <div className="closing-message">
                    ✨ {selectedAnimal.closingMessage}
                  </div>
                )}
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

            {getSelectedAnimals().length > 0 && (
              <div className="selected-animals-list">
                <h3 className="selected-animals-title">
                  🎄 Ваши выбранные подопечные ({getSelectedAnimals().length}):
                </h3>
                <div className="selected-animals-grid">
                  {getSelectedAnimals().map((animal, index) => (
                    <div
                      key={animal.name}
                      className={`selected-animal-item ${
                        selectedAnimal?.name === animal.name ? "current" : ""
                      }`}
                      onClick={() => showSelectedAnimal(animal)}
                    >
                      <div className="selected-animal-emoji">
                        {animal.emoji}
                      </div>
                      <div className="selected-animal-name">{animal.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getSelectedAnimals().length < 3 && (
              <button className="reset-button" onClick={selectAnother}>
                🎁 Выбрать еще одного
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
