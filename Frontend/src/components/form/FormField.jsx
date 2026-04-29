import React from "react";

const FormField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = "text",
  placeholder,
  disabled,
  required,
  min,
  max,
  step,
  rows,
  options,
  className = "",
}) => {
  const hasError = touched && error && error !== "";
  const isValid = touched && !hasError;

  return (
    <div className="form-field-wrapper">
      <label className="form-field-label" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="form-field-input-wrapper">
        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            required={required}
            className={`form-field-input ${hasError ? "error" : isValid ? "valid" : ""} ${className}`}
            aria-invalid={hasError}
          />
        ) : type === "select" ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`form-field-input capitalize ${hasError ? "error" : isValid ? "valid" : ""} ${className}`}
            aria-invalid={hasError}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace("-", " ")}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            required={required}
            className={`form-field-input ${hasError ? "error" : isValid ? "valid" : ""} ${className}`}
            aria-invalid={hasError}
          />
        )}
        {/* Status Icons */}
        {isValid && type !== "select" && (
          <svg
            className="form-field-icon valid"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            />
          </svg>
        )}
        {hasError && type !== "select" && (
          <svg
            className="form-field-icon error"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="15"
              y1="9"
              x2="9"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="9"
              y1="9"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
      {hasError && (
        <p className="form-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
