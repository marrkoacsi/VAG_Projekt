import "../styles/home.css";
import Hero from "../components/common/Hero.jsx";
// kivetteam a kártyákat, mert nem volt rájuk szükség, és a design is egyszerubb lett

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <Hero />

        {/*itt voltak a kartyak*/}
      </div>
    </div>
  );
}
