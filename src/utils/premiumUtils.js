/**
 * Premium ellenörzési segédfüggvények
 */

export const getPremiumStatus = () => {
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
        return { isPremium: false, plan: null, expiresAt: null };
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
        return { isPremium: true, plan: planName, expiresAt: syncedPremium.expiresAt };
      } else {
        localStorage.removeItem("premiumStatus");
        return { isPremium: false, plan: null, expiresAt: null };
      }
    } else {
      return { 
        isPremium: true, 
        plan: storedPremium.plan, 
        expiresAt: storedPremium.expiresAt 
      };
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
    return { isPremium: true, plan: planName, expiresAt: newPremium.expiresAt };
  } else {
    return { isPremium: false, plan: null, expiresAt: null };
  }
};

export const isUserPremium = () => {
  const status = getPremiumStatus();
  return status.isPremium;
};

export const canAccessTuning = () => {
  const status = getPremiumStatus();
  return status.isPremium && (status.plan === "Lifetime" || status.plan === "Pro Tag");
};

export const syncPremiumStatus = (user) => {
  const premiumType = Number(user?.premium_type || 0);
  
  if (premiumType > 0) {
    const planName = premiumType === 1 ? "Pro Tag" : "Lifetime";
    const premiumData = {
      plan: planName,
      price: premiumType === 1 ? 1990 : 50000,
      activatedAt: new Date().toISOString(),
      expiresAt: premiumType === 1 ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    };
    localStorage.setItem("premiumStatus", JSON.stringify(premiumData));
    return premiumData;
  } else {
    localStorage.removeItem("premiumStatus");
    return null;
  }
};
