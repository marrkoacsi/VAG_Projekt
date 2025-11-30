function VerifyForm({
  email,
  verificationCode,
  setVerificationCode,
  onSubmit,
  message,
  error,
}) {
  return (
    <>
      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form className="form" onSubmit={onSubmit}>
        <p className="info-text">
          Megerősítő kódot küldtünk a(z) <strong>{email || "…"}</strong> címre.
        </p>
        <div className="form-row">
          <label>Hitelesítő kód</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary-button">
          Email hitelesítése
        </button>
      </form>
    </>
  );
}

export default VerifyForm;