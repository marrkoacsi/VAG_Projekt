import { useState, useEffect, useRef } from "react";
import "../../styles/hero.css";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("#");
  const images = [
    "/images/hero/hero1.jpg",
    "/images/hero/hero2.jpg",
    "/images/hero/hero3.jpg",
  ];
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % images.length);
      }, 5000);
    };
    start();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchQuery.trim().startsWith("#")) {
        window.location.href = `/forum?tag=${encodeURIComponent(searchQuery.trim())}`;
      } else {
        alert("A kereséshez kötelezó # karaktert használni!");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const goto = (i) => {
    setCurrent(i);
    // reset timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % images.length), 5000);
  };

  const prev = () => goto((current - 1 + images.length) % images.length);
  const next = () => goto((current + 1) % images.length);

  return (
    <section className="hero">
      {images.map((img, i) => (
        <div
          key={img}
          className={`hero-slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      <div className="hero-overlay"></div>

      <div className="hero-text">
        <h1>VAG</h1>
        <p>Magyarország egyetlen Német autós fórumja</p>

        <div className="hero-search">
          <input
            type="text"
            placeholder="#keresés..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>Keresés</button>
        </div>
      </div>

      <button className="hero-arrow left" onClick={prev} aria-label="Előző kép">◀</button>
      <button className="hero-arrow right" onClick={next} aria-label="Következő kép">▶</button>

      <div className="hero-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? "active" : ""}`}
            onClick={() => goto(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
