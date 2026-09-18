import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : children}
    </button>
  )
}
