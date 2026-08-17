import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../shared/components'
import { authErrorKey, signIn } from '../../backend/auth'
import { useI18n } from '../../shared/i18n'
import { useAuth } from './AuthProvider'
import AuthLayout from './AuthLayout'
import styles from './AuthLayout.module.css'

export default function SignInPage() {
  const { session, loading } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/app" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('auth.enterBoth'))
      return
    }
    setSubmitting(true)
    const { error: authError } = await signIn(email, password)
    setSubmitting(false)
    if (authError) {
      const key = authErrorKey(authError.message)
      setError(key ? t(key) : authError.message)
      return
    }
    navigate('/app')
  }

  return (
    <AuthLayout
      title={t('auth.signIn')}
      footer={
        <>
          {t('auth.noAccount')} <Link to="/signup">{t('auth.createOne')}</Link>
        </>
      }
    >
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
          autoComplete="current-password"
        />
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button variant="accent" type="submit" disabled={submitting}>
          {submitting ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
    </AuthLayout>
  )
}
