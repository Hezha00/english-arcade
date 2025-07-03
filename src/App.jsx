import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Vite + React</h1>
      {user ? (
        <p>✅ Logged in as: {user.email}</p>
      ) : (
        <p>🚫 Not logged in</p>
      )}
    </div>
  )
}
export default App
