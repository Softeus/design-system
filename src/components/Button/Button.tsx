import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'filled' | 'secondary' | 'outlined' | 'ghost' | 'link';
export type ButtonSize = 'xl' | 'l' | 'm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'm',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled = false,
  ...restProps
}) => {
  // Определяем, кнопка только с иконкой
  const isIconOnly = icon && !children;
  
  // Собираем классы
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isIconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...restProps}
    >
      {icon && iconPosition === 'left' && (
        <span className={styles.icon}>{icon}</span>
      )}
      {children && <span className={styles.text}>{children}</span>}
      {icon && iconPosition === 'right' && (
        <span className={styles.icon}>{icon}</span>
      )}
    </button>
  );
};

Button.displayName = 'Button';