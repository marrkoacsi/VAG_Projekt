import "./Loading.css";

export function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Betöltés...</p>
    </div>
  );
}

export function ErrorAlert({ message, onClose }) {
  return (
    <div className="error-alert">
      <span>{message}</span>
      {onClose && <button onClick={onClose}>✕</button>}
    </div>
  );
}
