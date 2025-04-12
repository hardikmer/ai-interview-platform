import { create } from "zustand"
import type { Mystery, MysteryChallenge } from "@/lib/mysteries"

export type GeneratedMystery = {
  id: string
  jobId: string
  mystery: Mystery
  challenges: MysteryChallenge[]
}

interface MysteryGeneratorState {
  generatedMysteries: GeneratedMystery[]
  generateMysteryForJob: (jobId: string, jobTitle: string, jobDescription: string, skills: string[]) => string
  getMysteryById: (id: string) => GeneratedMystery | undefined
  getMysteryByJobId: (jobId: string) => GeneratedMystery | undefined
}

export const useMysteryGenerator = create<MysteryGeneratorState>((set, get) => ({
  generatedMysteries: [],

  generateMysteryForJob: (jobId, jobTitle, jobDescription, skills) => {
    // Check if we already have a mystery for this job
    const existingMystery = get().getMysteryByJobId(jobId)
    if (existingMystery) return existingMystery.id

    // In a real implementation, this would use AI to generate a custom mystery
    // based on the job description and required skills

    // For now, we'll create a mock mystery
    const mysteryId = `generated_${Date.now()}`
    const category = determineCategory(jobTitle, skills)

    const newMystery: Mystery = {
      id: mysteryId,
      title: `The ${jobTitle} Challenge`,
      description: `A custom mystery designed to test your skills as a ${jobTitle}. ${jobDescription.slice(0, 100)}...`,
      category,
      difficulty: "medium",
      duration: "45-60 min",
      rating: 4.7,
      skills: skills.slice(0, 3),
      image: "",
      gradient: getGradientForCategory(category),
      badgeColor: getBadgeColorForCategory(category),
    }

    // Generate challenges
    const challenges: MysteryChallenge[] = [
      {
        id: `${mysteryId}_ch1`,
        mysteryId,
        title: `${skills[0]} Assessment`,
        description: `Demonstrate your knowledge of ${skills[0]}.`,
        type: "multiple-choice",
        content: {
          question: `Which of the following best describes ${skills[0]}?`,
          options: [
            `A framework for building user interfaces`,
            `A programming language for web development`,
            `A database management system`,
            `A design pattern for application architecture`,
          ],
          correctAnswer: 0, // This would be dynamically determined in a real implementation
        },
        points: 10,
      },
      {
        id: `${mysteryId}_ch2`,
        mysteryId,
        title: `Problem Solving`,
        description: `Solve a typical problem related to ${jobTitle}.`,
        type: "coding",
        content: {
          initialCode: `// Write a function that solves the following problem:
// ${jobDescription.slice(0, 100)}...

function solveProblem(input) {
  // Your solution here
  
  return result;
}`,
          hints: [
            "Think about the core requirements of the job",
            "Consider how you would approach this in a real work scenario",
            "Focus on demonstrating your problem-solving approach",
          ],
        },
        points: 25,
      },
      {
        id: `${mysteryId}_ch3`,
        mysteryId,
        title: `Technical Knowledge`,
        description: `Demonstrate your technical knowledge in ${skills[1] || skills[0]}.`,
        type: "puzzle",
        content: {
          encryptedMessage: `This is a technical puzzle related to ${skills[1] || skills[0]}.`,
          hint: `Think about how ${skills[1] || skills[0]} is typically used in a ${jobTitle} role.`,
          solution: `The solution demonstrates understanding of ${skills[1] || skills[0]}.`,
        },
        points: 15,
      },
    ]

    const generatedMystery: GeneratedMystery = {
      id: mysteryId,
      jobId,
      mystery: newMystery,
      challenges,
    }

    set((state) => ({
      generatedMysteries: [...state.generatedMysteries, generatedMystery],
    }))

    return mysteryId
  },

  getMysteryById: (id) => {
    return get().generatedMysteries.find((gm) => gm.id === id)
  },

  getMysteryByJobId: (jobId) => {
    return get().generatedMysteries.find((gm) => gm.jobId === jobId)
  },
}))

// Helper functions
function determineCategory(
  jobTitle: string,
  skills: string[],
): "development" | "design" | "marketing" | "data" | "product" | "devops" {
  const title = jobTitle.toLowerCase()
  const skillsStr = skills.join(" ").toLowerCase()

  if (
    title.includes("develop") ||
    title.includes("engineer") ||
    skillsStr.includes("javascript") ||
    skillsStr.includes("react")
  ) {
    return "development"
  } else if (title.includes("design") || skillsStr.includes("figma") || skillsStr.includes("ui")) {
    return "design"
  } else if (title.includes("market") || skillsStr.includes("seo") || skillsStr.includes("content")) {
    return "marketing"
  } else if (title.includes("data") || skillsStr.includes("python") || skillsStr.includes("ml")) {
    return "data"
  } else if (title.includes("product") || skillsStr.includes("product")) {
    return "product"
  } else if (title.includes("devops") || skillsStr.includes("docker") || skillsStr.includes("kubernetes")) {
    return "devops"
  }

  return "development" // Default
}

function getGradientForCategory(category: string): string {
  switch (category) {
    case "development":
      return "from-purple-900 to-indigo-900"
    case "design":
      return "from-green-900 to-emerald-900"
    case "marketing":
      return "from-pink-900 to-red-900"
    case "data":
      return "from-blue-900 to-cyan-900"
    case "product":
      return "from-amber-900 to-yellow-900"
    case "devops":
      return "from-violet-900 to-fuchsia-900"
    default:
      return "from-purple-900 to-indigo-900"
  }
}

function getBadgeColorForCategory(category: string): string {
  switch (category) {
    case "development":
      return "bg-purple-600 hover:bg-purple-700"
    case "design":
      return "bg-green-600 hover:bg-green-700"
    case "marketing":
      return "bg-pink-600 hover:bg-pink-700"
    case "data":
      return "bg-blue-600 hover:bg-blue-700"
    case "product":
      return "bg-amber-600 hover:bg-amber-700"
    case "devops":
      return "bg-violet-600 hover:bg-violet-700"
    default:
      return "bg-purple-600 hover:bg-purple-700"
  }
}
