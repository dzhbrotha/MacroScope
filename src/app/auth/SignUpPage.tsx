import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../shared/components'
import { authErrorKey, signUp } from '../../backend/auth'
import { useI18n } from '../../shared/i18n'
import { useAuth } from './AuthProvider'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'

export default function SignUpPage() {
  const { session, loading } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/app" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!email || !password || !confirm) {
      setError(t('auth.fillAll'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.shortPassword'))
      return
    }
    if (password !== confirm) {
      setError(t('auth.mismatch'))
      return
    }
    setSubmitting(true)
    const { data, error: authError } = await signUp(email, password)
    setSubmitting(false)
    if (authError) {
      const key = authErrorKey(authError.message)
      setError(key ? t(key) : authError.message)
      return
    }
    if (data.session) {
      navigate('/app')
      return
    }
    setNotice(t('auth.confirmEmail'))
  }

  return (
    <AuthLayout
      title={t('auth.signUp')}
      footer={
        <>
          {t('auth.registered')} <Link to="/signin">{t('auth.signIn')}</Link>
        </>
      }
    >
      {notice ? (
        <p className={styles.notice}>{notice}</p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
          />
          {error ? <p className={styles.formError}>{error}</p> : null}
          <Button variant="accent" type="submit" disabled={submitting}>
            {submitting ? t('auth.creating') : t('auth.signUp')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
