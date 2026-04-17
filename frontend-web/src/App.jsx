import { useEffect, useState } from 'react'
import './App.css'
import { pb } from './lib/pocketbase'

function App() {
  const [authRecord, setAuthRecord] = useState(pb.authStore.record)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setAuthRecord(model)
      setError('')
    })

    return unsubscribe
  }, [])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      await pb.collection('users').authWithOAuth2({ provider: 'google' })
      setAuthRecord(pb.authStore.record)
    } catch (oauthError) {
      if (!String(oauthError).includes('cancelled')) {
        setError('Google sign-in failed. Verify PocketBase OAuth config and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    pb.authStore.clear()
    setAuthRecord(null)
  }

  return (
    <main className="oauth-page">
      <section className="oauth-card">
        <p className="eyebrow">PocketBase OAuth</p>
        <h1>Sign in with Google</h1>
        <p className="subtitle">
          Authenticate users via your PocketBase <code>users</code> collection.
        </p>

        {authRecord ? (
          <div className="user-panel">
            <p className="status success">You are signed in.</p>
            <p><strong>Name:</strong> {authRecord.name || 'Not set'}</p>
            <p><strong>Email:</strong> {authRecord.email || 'Not set'}</p>
            <p><strong>User ID:</strong> {authRecord.id}</p>
            <button type="button" className="secondary-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="auth-actions">
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            <p className="hint">
              Set <code>VITE_POCKETBASE_URL</code> if your backend is not on
              <code>http://127.0.0.1:8090</code>.
            </p>
          </div>
        )}

        {error ? <p className="status error">{error}</p> : null}
      </section>
    </main>
  )
}

export default App
