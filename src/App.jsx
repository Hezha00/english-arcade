import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './index.css' // ✅ Use global gradient theme
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
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
        color: '#fff',
        backdropFilter: 'blur(8px)' // 💫 Match blurred visual aesthetic
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🎮 English Arcade</h1>
      {user ? (
        <p>✅ وارد شده با: {user.email}</p>
      ) : (
        <p>🚫 وارد نشده‌اید</p>
      )}
    </div>
  )
}

export default App
