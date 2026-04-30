export function FormInput({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder,
  error,
  required = false 
}) {
  return (
    <div className="form-group">
      <label htmlFor={label}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={error ? "input-error" : ""}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
