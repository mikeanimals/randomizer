import { useState, useEffect } from "react";
import "./App.css";
import { animals } from "./animals";

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [viewedAnimals, setViewedAnimals] = useState([]); // Животные, просмотренные по ссылке

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
    // Проверяем query параметры в URL
    const urlParams = new URLSearchParams(window.location.search);
    const animalsParam = urlParams.get("animals");

    if (animalsParam) {
      // Восстанавливаем выбранных животных из URL по slug
      const animalSlugs = animalsParam.split(",").filter((slug) => slug.trim());
      const validAnimals = animals.filter(
        (animal) =>
          animal.slug &&
          animalSlugs.includes(animal.slug) &&
          animal.display !== false
      );

      if (validAnimals.length > 0) {
        // Это просмотр по ссылке - НЕ сохраняем в историю выбора
        // Только показываем для просмотра
        setViewedAnimals(validAnimals);

        // Если есть свои выбранные, не меняем текущее отображение
        // Если своих нет, показываем первое из просмотренных
        const savedAnimal = localStorage.getItem("secretSantaAnimal");
        if (!savedAnimal) {
          const firstAnimal = validAnimals[0];
          setSelectedAnimal(firstAnimal);
          setHasSelected(true);
        }

        // Очищаем URL от параметров
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        // НЕ делаем return, чтобы загрузить свои выбранные, если они есть
      }
    }

    // Если нет query параметров, загружаем из localStorage
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

      // Прокручиваем вверх после выбора
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const selectAnother = () => {
    // Сохраняем текущее животное в истории, но позволяем выбрать еще одно
    // НЕ очищаем просмотренных животных - они должны оставаться
    localStorage.removeItem("secretSantaAnimal");
    setSelectedAnimal(null);
    setHasSelected(false);
    setImageError(false);
    // НЕ очищаем viewedAnimals - они должны оставаться для просмотра

    // Сразу выбираем новое животное и прокручиваем вверх
    setTimeout(() => {
      getRandomAnimal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const showSelectedAnimal = (animal) => {
    setSelectedAnimal(animal);
    setHasSelected(true);
    setImageError(false);
    localStorage.setItem("secretSantaAnimal", JSON.stringify(animal));
    // Прокручиваем страницу вверх
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLink = async () => {
    const selectedNames = getSelectedAnimalsNames();
    if (selectedNames.length === 0) {
      alert("Сначала выберите хотя бы одного подопечного!");
      return;
    }

    // Получаем slug для выбранных животных
    const selectedAnimals = animals.filter(
      (animal) => selectedNames.includes(animal.name) && animal.slug
    );
    const animalSlugs = selectedAnimals.map((animal) => animal.slug);

    const baseUrl = window.location.origin + window.location.pathname;
    const animalsParam = animalSlugs.join(",");
    const shareUrl = `${baseUrl}?animals=${animalsParam}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(
        "✅ Ссылка скопирована, теперь вы можете поделиться своим выбором!"
      );
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        alert(
          "✅ Ссылка скопирована, теперь вы можете поделиться своим выбором!"
        );
      } catch (err) {
        alert(
          "Не удалось скопировать ссылку. Попробуйте скопировать вручную:\n" +
            shareUrl
        );
      }
      document.body.removeChild(textArea);
    }
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

        {!hasSelected && getSelectedAnimals().length < 3 && (
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

        {/* Просмотр по ссылке - показываем всегда, если есть */}
        {viewedAnimals.length > 0 && (
          <div className="selected-actions">
            <div className="viewed-message">
              👀 Просматриваемые подопечные, которыми поделились с вами
            </div>
            <div className="selected-animals-list">
              <h3 className="selected-animals-title">
                🎄 Просматриваемые подопечные ({viewedAnimals.length}):
              </h3>
              <div className="selected-animals-grid">
                {viewedAnimals.map((animal, index) => (
                  <div
                    key={`viewed-${animal.name}`}
                    className={`selected-animal-item ${
                      selectedAnimal?.name === animal.name &&
                      getSelectedAnimals().find(
                        (a) => a.name === animal.name
                      ) === undefined
                        ? "current"
                        : ""
                    }`}
                    onClick={() => showSelectedAnimal(animal)}
                  >
                    <div className="selected-animal-emoji">{animal.emoji}</div>
                    <div className="selected-animal-name">{animal.name}</div>
                  </div>
                ))}
              </div>
            </div>
            {getSelectedAnimals().length === 0 && (
              <button className="reset-button" onClick={selectAnother}>
                🎁 Выбрать своих подопечных
              </button>
            )}
          </div>
        )}

        {/* Свой выбор */}
        {getSelectedAnimals().length > 0 && (
          <div className="selected-actions">
            <div className="already-selected-message">
              🎁 Вы уже выбрали своего подопечного!
            </div>

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
                    <div className="selected-animal-emoji">{animal.emoji}</div>
                    <div className="selected-animal-name">{animal.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons-group">
              {getSelectedAnimals().length > 0 && (
                <button className="copy-link-button" onClick={copyLink}>
                  📋 Скопировать ссылку
                </button>
              )}
              {getSelectedAnimals().length < 3 && (
                <button className="reset-button" onClick={selectAnother}>
                  🎁 Выбрать еще одного
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
