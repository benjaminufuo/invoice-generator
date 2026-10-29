import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-700 mb-1.5 select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full h-9.5 min-h-[38px] px-3 py-1.5 text-sm text-zinc-900 bg-white border rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all placeholder:text-zinc-400 shadow-2xs ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
              : "border-zinc-200 hover:border-zinc-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
