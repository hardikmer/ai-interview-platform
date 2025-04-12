"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "candidate" | "employer"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push("/unauthorized") // Or any other unauthorized page
      }
    }
  }, [isAuthenticated, isLoading, router, requiredRole, user])

  if (isLoading) {
    return <div>Loading...</div> // Or a loading spinner
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null // Or a specific unauthorized component
  }

  return children
}
