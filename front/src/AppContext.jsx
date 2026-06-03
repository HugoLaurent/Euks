/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { AUTH_USER_STORAGE_KEY } from '@/lib'

const AppContext = createContext()

export function useAppContext() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr')
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const setAuthUserAndStore = (user) => {
    setAuthUser(user)
    if (user) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }
  }

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        authUser,
        setAuthUser: setAuthUserAndStore,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
