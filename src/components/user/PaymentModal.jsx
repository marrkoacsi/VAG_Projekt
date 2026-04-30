import { useState } from "react";
import { api } from "../../utils/api";
import "../../styles/payment-modal.css";


export default function PaymentModal({ isOpen, plan, onClose, onSuccess }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 2) {
      const formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
      setExpiryDate(formatted);
    } else {
      setExpiryDate(value);
    }
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(value);
  };

  const validateForm = () => {
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("A kártyaszám 16 számjegyű kell legyen.");
      return false;
    }
    if (expiryDate.length !== 5) {
      setError("Helytelen lejárati dátum formátum (MM/YY).");
      return false;
    }
    if (cvv.length !== 3) {
      setError("A CVV 3 számjegyű kell legyen.");
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // kamu feldolgozas
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) {
        throw new Error("Nincs bejelentkezett felhasználó.");
      }

      const result = await api.updatePremium(user.id, plan.name);
      if (!result?.ok) {
        throw new Error(result?.message || result?.error || "Sikertelen premium frissítés.");
      }

      const premiumType = Number(result.premium_type || 0);
      
      // adat tarolas - szinkronizált adatokkal
      const premiumData = {
        plan: plan.name,
        price: plan.price,
        activatedAt: new Date().toISOString(),
        expiresAt:
          plan.type === "monthly"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null, // egyszeri fizetes
      };

      // User frissítése a backend által visszaadott adattal
      const updatedUser = {
        ...user,
        premium_type: premiumType,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Premium status frissítése
      localStorage.setItem("premiumStatus", JSON.stringify(premiumData));

      // Callback 
      if (onSuccess) {
        onSuccess(premiumData);
      }

      // Modal 
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(err?.message || "Hiba történt a fizetés feldolgozása során. Próbáld késöbb.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Fizetés - {plan?.name}</h2>
          <button
            className="payment-modal-close"
            onClick={onClose}
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-summary">
            <p>
              <strong>Csomag:</strong> {plan?.name}
            </p>
            <p>
              <strong>Ár:</strong> {plan?.price} Ft
            </p>
          </div>

          <form onSubmit={handlePayment}>
            {error && <div className="payment-error">{error}</div>}

            <div className="payment-form-group">
              <label>Kártyaszám</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                disabled={loading}
                maxLength="19"
              />
            </div>

            <div className="payment-form-row">
              <div className="payment-form-group">
                <label>Lejárati dátum</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  disabled={loading}
                />
              </div>
              <div className="payment-form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCVVChange}
                  disabled={loading}
                  maxLength="3"
                />
              </div>
            </div>

            <button
              type="submit"
              className="payment-submit"
              disabled={loading}
            >
              {loading ? "Feldolgozás..." : `Fizetés ${plan?.price} Ft-tal`}
            </button>

            <p className="payment-disclaimer">
              ⚠️ Ez egy teszt rendszer. Valódi pénz nem kerül felszámításra.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
