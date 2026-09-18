import { useId, type InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function TextField({ label, hint, className, ...props }: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input {...props} id={id} className={styles.input} aria-describedby={hint ? hintId : undefined} />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}
