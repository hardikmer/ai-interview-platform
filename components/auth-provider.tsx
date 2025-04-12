"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { loginUser, registerUser } from "@/lib/actions"

export type UserRole = "candidate" | "employer" | "admin"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  overallScore: number
  iqScore: number
  domainScore: number
  completedMysteries: string[]
  inProgressMysteries: string[]
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: UserProfile }>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  updateUserScores: (
    mysteryId: string,
    scores: { overallScore?: number; iqScore?: number; domainScore?: number },
  ) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await loginUser(email, password)

      if (result.success && result.user) {
        setUser(result.user as UserProfile)
        localStorage.setItem("user", JSON.stringify(result.user))

        // Redirect based on role
        if (result.user.role === "employer") {
          router.push("/employers/dashboard")
        } else {
          router.push("/dashboard")
        }

        return { success: true, user: result.user as UserProfile }
      } else {
        return { success: false, message: result.message || "Invalid email or password" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      const result = await registerUser(name, email, password, role)

      if (result.success && result.user) {
        setUser(result.user as UserProfile)
        localStorage.setItem("user", JSON.stringify(result.user))

        // Redirect based on role
        if (role === "employer") {
          router.push("/employers/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        throw new Error(result.message || "Registration failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  // Check if user has a specific role
  const hasRole = (role: UserRole) => {
    return user?.role === role
  }

  const updateUserScores = useCallback(
    (
      mysteryId: string,
      scores: {
        overallScore?: number
        iqScore?: number
        domainScore?: number
      },
    ) => {
      setUser((prevUser) => {
        if (!prevUser) return null

        // Update the user with new scores
        const updatedUser = {
          ...prevUser,
          overallScore: (prevUser.overallScore || 0) + (scores.overallScore || 0),
          iqScore: (prevUser.iqScore || 0) + (scores.iqScore || 0),
          domainScore: (prevUser.domainScore || 0) + (scores.domainScore || 0),
          completedMysteries: [...(prevUser.completedMysteries || []), mysteryId],
        }

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser))

        return updatedUser
      })
    },
    [],
  )

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    hasRole,
    updateUserScores,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Create a hook to use the AuthContext
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

// For backward compatibility - this is the key export that was missing
export const useAuth = useAuthContext
