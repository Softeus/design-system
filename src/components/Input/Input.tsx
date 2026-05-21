import React, { useState, forwardRef } from 'react';
import styles from './Input.module.css';

export type InputSize = 'l' | 'm';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: boolean;
  clearable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'm',
      label,
      helperText,
      error = false,
      clearable = false,
      value,
      onChange,
      disabled,
      className = '',
      ...restProps
    },
    ref
  ) => {
    const [hasValue, setHasValue] = useState(Boolean(value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const handleClear = () => {
      // Эмуляция очистки
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      setHasValue(false);
      // @ts-ignore
      onChange?.(syntheticEvent);
    };

    const shouldShowClear = clearable && hasValue && !disabled;

    return (
      <div className={`${styles.container} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            {...restProps}
            className={`${styles.input} ${styles[size]} ${error ? styles.error : ''} ${shouldShowClear ? styles.hasClear : ''}`}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={error}
            aria-describedby={helperText ? `${restProps.id}-helper` : undefined}
          />
          
          {shouldShowClear && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear input"
            >
              {/* SVG иконка крестика */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {(helperText || error) && (
          <span 
            id={`${restProps.id}-helper`} 
            className={`${styles.helper} ${error ? styles.error : ''}`}
          >
            {error ? 'Error message' : helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';