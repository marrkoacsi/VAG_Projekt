import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/tuning.css";

export default function Tuning() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const userData = userStr ? JSON.parse(userStr) : null;
    
    if (!userData) {
      navigate("/auth");
      return;
    }

    const premiumType = Number(userData?.premium_type || 0);
    setUser(userData);
    setIsPremium(premiumType > 0);

    if (premiumType <= 0) {
      navigate("/premium");
    }
  }, [navigate]);

  const services = [
    {
      id: 1,
      title: "Stage 1 Chiptuning",
      description: "Optimalizált motorvezérlés a nagyobb teljesítményért és jobb fogyasztásért.",
      fileName: "stage1_chiptuning_vag.zip"
    },
    {
      id: 2,
      title: "Sport Kipufogó",
      description: "Egyedi gyártású rendszerek a tökéletes hangzásért és gázáramlásért.",
      fileName: "sport_exhaust_vag.zip"
    },
    {
      id: 3,
      title: "Ültetés & Futómû",
      description: "Állítható futómûvek és rugók a sportos megjelenéshez és stabilitáshoz.",
      fileName: "suspension_tuning_vag.zip"
    }
  ];

  const handleDownload = async (service) => {
    if (!isPremium) {
      navigate("/premium");
      return;
    }

    setDownloadingFiles(prev => new Set(prev).add(service.id));

    try {
      // Szimulált letöltés - valós környezetben itt lenne a fájl letöltése
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Letöltés indítása
      const link = document.createElement('a');
      link.href = `/tuning-files/${service.fileName}`;
      link.download = service.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`A(z) "${service.title}" fájl letöltése elkezdõdött!`);
    } catch (error) {
      console.error("Letöltési hiba:", error);
      alert("Hiba történt a letöltés során. Kérlek, próbáld újra!");
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(service.id);
        return newSet;
      });
    }
  };

  if (!user || !isPremium) {
    return (
      <div className="tuning-container">
        <div className="tuning-locked">
          <h2>Prémium szolgáltatás</h2>
          <p>A tuning fájlok letöltéséhez prémium csomagra van szükség.</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate("/premium")}
          >
            Prémium csomag választása
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tuning-container">
      <div className="tuning-header">
        <h1>Prémium Tuning Szolgáltatások</h1>
        <p>Hozd ki a maximumot VAG csoportos autódból!</p>
        <div className="premium-badge">
          Prémium felhasználó: {user.username}
        </div>
      </div>

      <div className="tuning-grid">
        {services.map((service) => (
          <div key={service.id} className="tuning-card">
            <div className="tuning-card-image">
              <div className="tuning-icon">{'\u26a1'}</div>
            </div>
            <div className="tuning-card-content">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button 
                className={`btn-primary ${downloadingFiles.has(service.id) ? 'downloading' : ''}`}
                onClick={() => handleDownload(service)}
                disabled={downloadingFiles.has(service.id)}
              >
                {downloadingFiles.has(service.id) ? 'Letöltés...' : 'Letöltés'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}