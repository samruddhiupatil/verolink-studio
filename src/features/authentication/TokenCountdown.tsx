import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { OAuth2Session } from '../../domain/auth.types'
import styles from './AuthenticationPage.module.css'

interface TokenCountdownProps {
  session?: OAuth2Session
  onFetchToken: () => void
  onClearToken: () => void
}

/** Ticks once a second while a session token is present, purely for the countdown display. */
export function TokenCountdown({ session, onFetchToken, onClearToken }: TokenCountdownProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [session])

  if (!session) {
    return (
      <div className={styles.tokenRow}>
        <Button variant="secondary" onClick={onFetchToken}>
          Fetch Token
        </Button>
        <span className={styles.hint}>Simulated — no live OAuth server is available in this environment.</span>
      </div>
    )
  }

  const remainingMs = Math.max(0, new Date(session.expiresAt).getTime() - now)
  const expired = remainingMs <= 0
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')

  return (
    <div className={styles.tokenRow}>
      <Badge tone={expired ? 'danger' : 'success'}>{expired ? 'Token expired' : `Expires in ${minutes}:${seconds}`}</Badge>
      <span className={styles.hint}>Simulated token — no live OAuth server available.</span>
      <Button variant="ghost" size="sm" onClick={expired ? onFetchToken : onClearToken}>
        {expired ? 'Fetch new token' : 'Clear'}
      </Button>
    </div>
  )
}
