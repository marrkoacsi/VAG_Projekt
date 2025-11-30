export function parseError(err, setError) {
  if (!err) {
    setError("Ismeretlen hiba történt.");
    return;
  }
  if (typeof err === "string") {
    setError(err);
    return;
  }
  if (err.detail) {
    setError(err.detail);
    return;
  }
  const parts = [];
  for (const key in err) {
    if (Array.isArray(err[key])) {
      parts.push(`${key}: ${err[key].join(", ")}`);
    }
  }
  setError(parts.join(" | ") || "Ismeretlen hiba történt.");
}