import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'yoruba-chatbot-theme'

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

function applyTheme(theme: Theme | null) {
  const root = document.documentElement
  if (theme) {
    root.setAttribute('data-theme', theme)
  } else {
    // No explicit choice: let the tokens.css prefers-color-scheme rules
    // decide, so the app follows system changes live.
    root.removeAttribute('data-theme')
  }
}

/**
 * Provides the resolved (never "system") theme value for UI display (e.g.
 * choosing which toggle icon to show), while letting an unset preference
 * follow the OS theme automatically via CSS alone.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => getStoredTheme() ?? getSystemTheme(),
  )

  useEffect(() => {
    const stored = getStoredTheme()
    applyTheme(stored)

    if (stored) return

    // No explicit user choice yet: track the OS theme live.
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setThemeState(getSystemTheme())
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
