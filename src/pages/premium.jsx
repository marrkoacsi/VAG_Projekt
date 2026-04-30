import { useState, useEffect } from "react";
import "../styles/premium.css";
import PaymentModal from "../components/user/PaymentModal";

export default function Premium() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Betöltöm az aktuális prémium státuszt és szinkronizálom
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const premiumType = Number(user?.premium_type || 0);
    
    const stored = localStorage.getItem("premiumStatus");
    let storedPremium = null;
    
    if (stored) {
      try {
        storedPremium = JSON.parse(stored);
      } catch (e) {
        // Nem valid JSON - töröljük
        localStorage.removeItem("premiumStatus");
      }
    }

    // Ellenörizzük, hogy a stored premium még érvényes-e
    if (storedPremium) {
      if (storedPremium.expiresAt) {
        const expirationDate = new Date(storedPremium.expiresAt);
        if (expirationDate < new Date()) {
          // Lejárt - töröljük
          localStorage.removeItem("premiumStatus");
          setPremiumStatus(null);
          return;
        }
      }
      
      // Ellenörizzük, hogy a premium_type egyezik-e
      const expectedType = storedPremium.plan === "Pro Tag" ? 1 : 
                          storedPremium.plan === "Lifetime" ? 2 : 0;
      
      if (premiumType !== expectedType) {
        // Nem egyezik - szinkronizáljuk a backend adattal
        if (premiumType > 0) {
          const planName = premiumType === 1 ? "Pro Tag" : "Lifetime";
          const syncedPremium = {
            plan: planName,
            price: premiumType === 1 ? 1990 : 50000,
            activatedAt: new Date().toISOString(),
            expiresAt: premiumType === 1 ? 
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
          };
          localStorage.setItem("premiumStatus", JSON.stringify(syncedPremium));
          setPremiumStatus(syncedPremium);
        } else {
          localStorage.removeItem("premiumStatus");
          setPremiumStatus(null);
        }
      } else {
        setPremiumStatus(storedPremium);
      }
    } else if (premiumType > 0) {
      // Van premium_type de nincs premiumStatus - létrehozzuk
      const planName = premiumType === 1 ? "Pro Tag" : "Lifetime";
      const newPremium = {
        plan: planName,
        price: premiumType === 1 ? 1990 : 50000,
        activatedAt: new Date().toISOString(),
        expiresAt: premiumType === 1 ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      };
      localStorage.setItem("premiumStatus", JSON.stringify(newPremium));
      setPremiumStatus(newPremium);
    } else {
      setPremiumStatus(null);
    }
  }, []);

  const plans = [
    {
      name: "Kezdő",
      price: 0,
      features: ["Böngészés a fórumban", "Hozzászólás írása"],
      isDefault: true,
    },
    {
      name: "Pro Tag",
      price: 1990,
      type: "monthly",
      features: ["Gyorsabb support", "Reklámmentes élmény", "Animált profilkép feltöltése"],
      isPopular: true,
    },
    {
      name: "Lifetime",
      price: 50000,
      type: "onetime",
      features: ["Tuning fájl feltöltés", "Egyedi rang és jelvény", "Költség hatékonyabb"],
    },
  ];

  const openPayment = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (premiumData) => {
    setPremiumStatus(premiumData);
    localStorage.setItem("premiumStatus", JSON.stringify(premiumData));

    setSuccessMessage(
      `? Gratulálunk! Sikeresen aktiváltad a ${premiumData.plan} csomagot!`
    );
    setTimeout(() => setSuccessMessage(""), 4000);
    
    // Oldal újratöltése a prémium státusz megjelenítéséhez
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="premium-container">
      {successMessage && <div className="success-message">{successMessage}</div>}

      {premiumStatus && (
        <div className="premium-status-banner">
          <p>
            ✓ <strong>{premiumStatus.plan}</strong> csomag aktív
            {premiumStatus.expiresAt && (
              <span> - Lejár: {new Date(premiumStatus.expiresAt).toLocaleDateString("hu-HU")}</span>
            )}
          </p>
        </div>
      )}

      <div className="premium-header">
        <h1>Válassz csomagot</h1>
        <p>Hozd ki a legtöbbet a VAG Fórum élményből</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card ${plan.isPopular ? "popular" : ""}`}
          >
            {plan.isPopular && <div className="popular-badge">Legnépszerűbb</div>}
            <h3>{plan.name}</h3>
            <div className="price">
              {plan.price === 0 ? (
                "Ingyenes"
              ) : (
                <>
                  {plan.price.toLocaleString("hu-HU")} Ft
                  <span>{plan.type === "monthly" ? "/hó" : " Egyszeri fizetés"}</span>
                </>
              )}
            </div>
            <ul className="features">
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button
              className={`btn-plan ${plan.isPopular ? "primary" : ""}`}
              onClick={() => { 
                if (plan.price > 0) {
                  openPayment(plan);
                }
              }}
              disabled={plan.isDefault}
            >
              {plan.isDefault ? "Jelenlegi csomag" : "Választás"}
            </button>
          </div>
        ))}
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        plan={selectedPlan}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
