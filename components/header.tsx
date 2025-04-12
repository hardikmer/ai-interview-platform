"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/auth-provider"

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout, hasRole } = useAuthContext()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold">
            MystHire
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/mysteries"
              className={`text-sm ${isActive("/mysteries") ? "text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              Mysteries
            </Link>
            <Link
              href="/jobs"
              className={`text-sm ${isActive("/jobs") ? "text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              Jobs
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm ${isActive("/how-it-works") ? "text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              How It Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {hasRole("employer") ? (
                <Link href="/employers/dashboard">
                  <Button variant="ghost" size="sm">
                    Employer Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
