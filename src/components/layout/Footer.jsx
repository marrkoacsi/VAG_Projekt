import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/footer.css";

export default function Footer() {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-left">
            <p>© {new Date().getFullYear()} VAG Fórum  Minden jog fenntartva.</p>
          </div>
          <div className="footer-right">
            <button className="footer-link" onClick={() => setFaqOpen(true)}>GYIK</button>
            <Link to="/aszf" className="footer-link">ÁSZF</Link>
          </div>
        </div>
      </footer>

      {faqOpen && (
        <div className="faq-modal" role="dialog" aria-modal="true">
          <div className="faq-content">
            <header className="faq-header">
              <h3>Gyakran Ismételt Kérdések</h3>
              <button className="faq-close" onClick={() => setFaqOpen(false)} aria-label="Bezár">✕</button>
            </header>
            <div className="faq-body">
              <details>
                <summary>Hogyan regisztrálok?</summary>
                <p>Nyomj a Bejelentkezés gombra, majd kövesd az utasításokat a regisztrációhoz.</p>
              </details>
              <details>
                <summary>Biztonságosak a tuning file-ok?</summary>
                <p>Igen a tuning file-ok 100% biztonságosak, szakértők által lettek átnézve. (premium funkció).</p>
              </details>
              <details>
                <summary>Mennyire biztonságos a fórum?</summary>
                <p>A fórumot mindig fejlesztik, és biztonsági szempontból is.</p>
              </details>
            </div>
          </div>
          <div className="faq-backdrop" onClick={() => setFaqOpen(false)} />
        </div>
      )}
    </>
  );
}
