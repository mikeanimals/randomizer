import { useState, useEffect } from "react";
import "./App.css";
import { animals } from "./animals";

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [viewedAnimals, setViewedAnimals] = useState([]); // Tiere, die über den Link angesehen wurden

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
    // Query-Parameter in der URL prüfen
    const urlParams = new URLSearchParams(window.location.search);
    const animalsParam = urlParams.get("animals");

    if (animalsParam) {
      // Ausgewählte Tiere aus URL nach slug wiederherstellen
      const animalSlugs = animalsParam.split(",").filter((slug) => slug.trim());
      const validAnimals = animals.filter(
        (animal) =>
          animal.slug &&
          animalSlugs.includes(animal.slug) &&
          animal.display !== false
      );

      if (validAnimals.length > 0) {
        // Dies ist eine Ansicht über den Link - NICHT in die Auswahlhistorie speichern
        // Nur zur Ansicht anzeigen
        setViewedAnimals(validAnimals);

        // Wenn eigene Auswahl vorhanden ist, aktuelle Anzeige nicht ändern
        // Wenn keine eigene vorhanden ist, erstes aus den angesehenen anzeigen
        const savedAnimal = localStorage.getItem("secretSantaAnimal");
        if (!savedAnimal) {
          const firstAnimal = validAnimals[0];
          setSelectedAnimal(firstAnimal);
          setHasSelected(true);
        }

        // URL von Parametern bereinigen
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        // KEIN return, um eigene Auswahl zu laden, falls vorhanden
      }
    }

    // Wenn keine Query-Parameter vorhanden, aus localStorage laden
    const savedAnimal = localStorage.getItem("secretSantaAnimal");
    if (savedAnimal) {
      const animal = JSON.parse(savedAnimal);
      setSelectedAnimal(animal);
      setHasSelected(true);
      // Bei Laden zur Historie hinzufügen, falls noch nicht hinzugefügt
      addToSelectedHistory(animal.name);
    }
  }, []);

  const getRandomAnimal = () => {
    setIsAnimating(true);
    setImageError(false);
    setTimeout(() => {
      const selectedNames = getSelectedAnimalsNames();

      // Limit von 2 Tieren prüfen
      if (selectedNames.length >= 2) {
        setIsAnimating(false);
        return;
      }

      const availableAnimals = animals.filter(
        (animal) =>
          animal.display !== false && !selectedNames.includes(animal.name)
      );

      if (availableAnimals.length === 0) {
        // Alle Tiere wurden bereits ausgewählt
        setIsAnimating(false);
        alert(
          "🎄 Alle Tiere wurden bereits ausgewählt! Löschen Sie den Verlauf, um neu zu beginnen."
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

      // Nach Auswahl nach oben scrollen
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const selectAnother = () => {
    // Aktuelles Tier in Historie speichern, aber erlauben, noch eines auszuwählen
    // Angesehene Tiere NICHT löschen - sie sollen bleiben
    localStorage.removeItem("secretSantaAnimal");
    setSelectedAnimal(null);
    setHasSelected(false);
    setImageError(false);
    // viewedAnimals NICHT löschen - sie sollen für die Ansicht bleiben

    // Sofort neues Tier auswählen und nach oben scrollen
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
    // Seite nach oben scrollen
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLink = async () => {
    const selectedNames = getSelectedAnimalsNames();
    if (selectedNames.length === 0) {
      alert("Wählen Sie zuerst mindestens ein Tier aus!");
      return;
    }

    // Slug für ausgewählte Tiere erhalten
    const selectedAnimals = animals.filter(
      (animal) => selectedNames.includes(animal.name) && animal.slug
    );
    const animalSlugs = selectedAnimals.map((animal) => animal.slug);

    const baseUrl = window.location.origin + window.location.pathname;
    const animalsParam = animalSlugs.join(",");
    const shareUrl = `${baseUrl}?animals=${animalsParam}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("✅ Link kopiert, jetzt können Sie Ihre Auswahl teilen!");
    } catch (err) {
      // Fallback für alte Browser
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        alert("✅ Link kopiert, jetzt können Sie Ihre Auswahl teilen!");
      } catch (err) {
        alert(
          "Link konnte nicht kopiert werden. Versuchen Sie, manuell zu kopieren:\n" +
            shareUrl
        );
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🎅 Wichteln 🎄</h1>

        <div className="result-container">
          {selectedAnimal ? (
            <div className={`animal-card ${isAnimating ? "animating" : ""}`}>
              <div className="santa-badge">🎁 Ihr Tier</div>
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
                      `Sie haben ${selectedAnimal.name} bekommen.`}
                  </p>
                  {selectedAnimal.story && (
                    <p className="story-text">{selectedAnimal.story}</p>
                  )}
                </div>

                {selectedAnimal.wishlist &&
                  selectedAnimal.wishlist.length > 0 && (
                    <div className="wishlist-section">
                      <p className="wishlist-title">
                        🐾 Was {selectedAnimal.name} von seinem Weihnachtsmann
                        erhalten möchte:
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
                Klicken Sie auf die Schaltfläche, um herauszufinden, welches
                Tier Sie beim Wichteln betreuen werden!
              </p>
            </div>
          )}
        </div>

        {!hasSelected && getSelectedAnimals().length < 2 && (
          <button
            className="randomize-button"
            onClick={getRandomAnimal}
            disabled={isAnimating}
          >
            {isAnimating ? "🎄 Wähle ein Tier aus..." : "🎁 Mein Tier erfahren"}
          </button>
        )}

        {/* Ansicht über Link - immer anzeigen, falls vorhanden */}
        {viewedAnimals.length > 0 && (
          <div className="selected-actions">
            <div className="viewed-message">
              👀 Angesehene Tiere, die mit Ihnen geteilt wurden
            </div>
            <div className="selected-animals-list">
              <h3 className="selected-animals-title">
                🎄 Angesehene Tiere ({viewedAnimals.length}):
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
                🎁 Eigene Tiere auswählen
              </button>
            )}
          </div>
        )}

        {/* Eigene Auswahl */}
        {getSelectedAnimals().length > 0 && (
          <div className="selected-actions">
            <div className="already-selected-message">
              🎁 Sie haben bereits Ihr Tier ausgewählt!
            </div>

            <div className="selected-animals-list">
              <h3 className="selected-animals-title">
                🎄 Ihre ausgewählten Tiere ({getSelectedAnimals().length}):
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
                  📋 Link kopieren
                </button>
              )}
              {getSelectedAnimals().length < 2 && (
                <button className="reset-button" onClick={selectAnother}>
                  🎁 Noch eines auswählen
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
