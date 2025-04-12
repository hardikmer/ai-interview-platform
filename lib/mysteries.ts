"use client"

import { create } from "zustand"
import { getMysteryBySlug, getChallengesByMysterySlug, getMysteries, updateMysteryProgress } from "./actions"

export type MysteryDifficulty = "easy" | "medium" | "hard" | "expert"
export type MysteryCategory =
  | "development"
  | "design"
  | "marketing"
  | "data"
  | "product"
  | "devops"
  | "security"
  | "ai"
  | "blockchain"
  | "mobile"
  | "cloud"
  | "iot"
  | "finance"
  | "healthcare"
  | "education"
  | "retail"
  | "manufacturing"
  | "energy"
  | "legal"
  | "media"
  | "gaming"
  | "transportation"

export interface Mystery {
  id: string | number
  slug: string
  title: string
  description: string
  category: string
  difficulty: MysteryDifficulty
  duration: string
  rating: number
  skills: string[]
  gradient?: string
  badge_color?: string
  badgeColor?: string
  completedBy?: any[]
  challenges?: MysteryChallenge[]
  code_snippet?: string
}

export interface MysteryChallenge {
  id: string | number
  mystery_id: string | number
  title: string
  description: string
  type: "multiple-choice" | "puzzle" | "coding" | string
  content: any
  points: number
  order_index?: number
  code_snippet?: string
}

interface MysteriesState {
  mysteries: Mystery[]
  currentMystery: Mystery | null
  challenges: Record<string, MysteryChallenge[]>
  isLoading: boolean
  error: string | null
  fetchMysteries: () => Promise<Mystery[]>
  fetchMysteryBySlug: (slug: string) => Promise<Mystery | null>
  fetchChallengesByMysterySlug: (slug: string) => Promise<MysteryChallenge[]>
  setCurrentMystery: (mysteryId: string) => Promise<void>
  getChallengesByMysteryId: (mysteryId: string | number) => MysteryChallenge[]
  updateProgress: (mysteryId: string | number, completed: boolean, score: number) => Promise<void>
}

// Create the store
export const useMysteries = create<MysteriesState>((set, get) => ({
  mysteries: [],
  currentMystery: null,
  challenges: {},
  isLoading: false,
  error: null,

  fetchMysteries: async () => {
    set({ isLoading: true, error: null })
    try {
      console.log("Fetching mysteries...")
      const result = await getMysteries()
      if (result.success) {
        // Log each mystery ID and title for debugging
        result.mysteries.forEach((mystery: any) => {
          console.log(`Mystery: ID=${mystery.id}, Title=${mystery.title}, Slug=${mystery.slug}`)
        })

        set({ mysteries: result.mysteries, isLoading: false })
        console.log(`Fetched ${result.mysteries.length} mysteries`)
        return result.mysteries
      } else {
        set({ error: result.message || "Failed to fetch mysteries", isLoading: false })
        console.error("Error fetching mysteries:", result.message)
        return []
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      set({ error: errorMessage, isLoading: false })
      console.error("Error in fetchMysteries:", error)
      return []
    }
  },

  fetchMysteryBySlug: async (slug: string) => {
    set({ isLoading: true, error: null })
    try {
      console.log(`Fetching mystery with slug: ${slug}`)
      const result = await getMysteryBySlug(slug)
      if (result.success && result.mystery) {
        console.log(`Fetched mystery: ${result.mystery.title}`)
        return result.mystery
      } else {
        set({ error: result.message || "Mystery not found", isLoading: false })
        console.error("Error fetching mystery:", result.message)
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      set({ error: errorMessage, isLoading: false })
      console.error("Error in fetchMysteryBySlug:", error)
      return null
    }
  },

  fetchChallengesByMysterySlug: async (slug: string) => {
    set({ isLoading: true, error: null })
    try {
      console.log(`Fetching challenges for mystery slug: ${slug}`)
      const result = await getChallengesByMysterySlug(slug)
      if (result.success) {
        const challenges = result.challenges || []
        console.log(`Fetched ${challenges.length} challenges for mystery ${slug}:`, challenges)
        return challenges
      } else {
        set({ error: result.message || "Failed to fetch challenges", isLoading: false })
        console.error("Error fetching challenges:", result.message)
        return []
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      set({ error: errorMessage, isLoading: false })
      console.error("Error in fetchChallengesByMysterySlug:", error)
      return []
    }
  },

  setCurrentMystery: async (mysteryId: string) => {
    set({ isLoading: true, error: null })
    try {
      console.log(`Setting current mystery with ID: ${mysteryId}`)

      // Find the mystery in the existing mysteries array
      const { mysteries } = get()
      const mystery = mysteries.find((m) => String(m.id) === String(mysteryId))

      if (!mystery) {
        console.error(`Mystery with ID ${mysteryId} not found in store`)
        set({ isLoading: false, error: `Mystery with ID ${mysteryId} not found` })
        return
      }

      console.log(`Found mystery: ${mystery.title}, slug: ${mystery.slug}`)
      set({ currentMystery: mystery })

      // Check if we already have challenges for this mystery
      const { challenges } = get()
      if (challenges[mysteryId] && challenges[mysteryId].length > 0) {
        console.log(`Using cached challenges for mystery ID ${mysteryId}`)
        set({ isLoading: false })
        return
      }

      // Fetch challenges for this mystery
      if (mystery.slug) {
        const fetchedChallenges = await get().fetchChallengesByMysterySlug(mystery.slug)

        // Store the challenges in the challenges object
        set((state) => ({
          challenges: {
            ...state.challenges,
            [mysteryId]: fetchedChallenges,
          },
          isLoading: false,
        }))

        console.log(`Set current mystery: ${mystery.title} with ${fetchedChallenges.length} challenges`)
      } else {
        console.warn(`Mystery with ID ${mysteryId} has no slug, cannot fetch challenges`)
        set({ isLoading: false })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      set({ error: errorMessage, isLoading: false })
      console.error("Error in setCurrentMystery:", error)
    }
  },

  getChallengesByMysteryId: (mysteryId: string | number) => {
    const mysteryIdStr = String(mysteryId)
    const { challenges } = get()

    // Return challenges from the store if they exist
    if (challenges[mysteryIdStr] && challenges[mysteryIdStr].length > 0) {
      console.log(`Found ${challenges[mysteryIdStr].length} challenges for mystery ID ${mysteryIdStr} in store`)
      return challenges[mysteryIdStr]
    }

    console.log(`No challenges found for mystery ID ${mysteryIdStr} in store`)

    // If no challenges found, trigger a fetch but return empty array for now
    const { mysteries, isLoading } = get()
    const mystery = mysteries.find((m) => String(m.id) === mysteryIdStr)

    if (mystery && !isLoading) {
      console.log(`Triggering fetch for mystery ID ${mysteryIdStr}`)
      get().setCurrentMystery(mysteryIdStr)
    }

    return []
  },

  updateProgress: async (mysteryId: string | number, completed: boolean, score: number) => {
    try {
      console.log(`Updating progress for mystery ${mysteryId}: completed=${completed}, score=${score}`)

      // Get the user ID from auth context or localStorage
      let userId = 1 // Default fallback

      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          userId = user.id || 1
        }
      }

      // Call the server action to update progress
      const result = await updateMysteryProgress(
        Number(mysteryId),
        userId,
        completed ? "completed" : "in-progress",
        score,
      )

      if (result.success) {
        console.log("Successfully updated mystery progress:", result)

        // Update the local state
        set((state) => {
          const updatedMysteries = state.mysteries.map((mystery) => {
            if (String(mystery.id) === String(mysteryId)) {
              return {
                ...mystery,
                completedBy: completed ? [...(mystery.completedBy || []), { id: userId, score }] : mystery.completedBy,
              }
            }
            return mystery
          })

          return { mysteries: updatedMysteries }
        })

        return result
      } else {
        set({ error: result.message || "Failed to update progress" })
        console.error("Error updating progress:", result.message)
        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      set({ error: errorMessage })
      console.error("Error in updateProgress:", error)
      return { success: false, message: errorMessage }
    }
  },
}))
