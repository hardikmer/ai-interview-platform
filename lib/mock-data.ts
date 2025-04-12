import type { MysteryCategory, MysteryDifficulty } from "./mysteries"
import type { ApplicationStatus, InterviewMode } from "./jobs"

// Mock Users
export const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "candidate@example.com",
    password: "password123",
    role: "candidate",
    overallScore: 85,
    iqScore: 92,
    domainScore: 84,
    completedMysteries: ["cyber-heist", "corporate-espionage"],
    inProgressMysteries: ["missing-patterns"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "employer@example.com",
    password: "password123",
    role: "employer",
    overallScore: 0,
    iqScore: 0,
    domainScore: 0,
    completedMysteries: [],
    inProgressMysteries: [],
  },
]

// Mock Mysteries
export const mockMysteries = [
  {
    id: 1,
    slug: "cyber-heist",
    title: "The Cyber Heist",
    description:
      "Debug a compromised codebase, optimize a slow API, and solve algorithmic puzzles to track down a cyber criminal.",
    category: "development" as MysteryCategory,
    difficulty: "medium" as MysteryDifficulty,
    duration: "60-90 min",
    rating: 4.8,
    skills: ["JavaScript", "API", "Algorithms"],
    gradient: "from-purple-900 to-indigo-900",
    badge_color: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: 2,
    slug: "corporate-espionage",
    title: "Corporate Espionage",
    description:
      "Identify how confidential market strategies were leaked using analytical thinking and marketing expertise.",
    category: "marketing" as MysteryCategory,
    difficulty: "medium" as MysteryDifficulty,
    duration: "45-60 min",
    rating: 4.6,
    skills: ["Analytics", "Strategy", "Market Research"],
    gradient: "from-pink-900 to-red-900",
    badge_color: "bg-pink-600 hover:bg-pink-700",
  },
  {
    id: 3,
    slug: "missing-patterns",
    title: "The Missing Patterns",
    description:
      "Analyze complex datasets to uncover hidden patterns and predict future outcomes in a race against time.",
    category: "data" as MysteryCategory,
    difficulty: "hard" as MysteryDifficulty,
    duration: "60-90 min",
    rating: 4.9,
    skills: ["Python", "ML", "Statistics"],
    gradient: "from-blue-900 to-cyan-900",
    badge_color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: 4,
    slug: "usability-enigma",
    title: "The Usability Enigma",
    description: "Solve a series of design challenges to improve a problematic interface and enhance user experience.",
    category: "design" as MysteryCategory,
    difficulty: "easy" as MysteryDifficulty,
    duration: "45-60 min",
    rating: 4.7,
    skills: ["UI/UX", "Figma", "Prototyping"],
    gradient: "from-green-900 to-emerald-900",
    badge_color: "bg-green-600 hover:bg-green-700",
  },
  {
    id: 5,
    slug: "product-puzzle",
    title: "The Product Puzzle",
    description:
      "Navigate complex stakeholder requirements and market constraints to develop a winning product strategy.",
    category: "product" as MysteryCategory,
    difficulty: "medium" as MysteryDifficulty,
    duration: "60-75 min",
    rating: 4.5,
    skills: ["Strategy", "Roadmapping", "Prioritization"],
    gradient: "from-amber-900 to-yellow-900",
    badge_color: "bg-amber-600 hover:bg-amber-700",
  },
  {
    id: 6,
    slug: "infrastructure-crisis",
    title: "Infrastructure Crisis",
    description:
      "Diagnose and fix a failing infrastructure setup while implementing robust CI/CD pipelines under pressure.",
    category: "devops" as MysteryCategory,
    difficulty: "hard" as MysteryDifficulty,
    duration: "75-90 min",
    rating: 4.8,
    skills: ["Docker", "Kubernetes", "CI/CD"],
    gradient: "from-violet-900 to-fuchsia-900",
    badge_color: "bg-violet-600 hover:bg-violet-700",
  },
]

// Mock Challenges
export const mockChallenges = [
  {
    id: 1,
    mystery_id: 1,
    title: "Security Breach Analysis",
    description: "Analyze the server logs to identify the entry point of the security breach.",
    type: "multiple-choice",
    content: {
      question: "Based on the server logs, which vulnerability was exploited to gain access to the system?",
      options: [
        "SQL Injection in the login form",
        "Cross-Site Scripting (XSS) in the comment section",
        "Outdated dependency with known vulnerability",
        "Weak password on admin account",
      ],
      correctAnswer: 2,
      serverLogs: `2023-04-11 08:15:22 INFO [system] Server started successfully
2023-04-11 08:20:15 INFO [auth.service] User login: john.doe@company.com
2023-04-11 08:22:30 WARN [security.service] Package audit found 3 vulnerabilities (1 low, 1 moderate, 1 high)
2023-04-11 08:22:31 WARN [security.service] High severity vulnerability found in dependency: auth-validator@1.2.3
2023-04-11 08:23:15 ERROR [auth.service] Failed login attempt for admin@company.com
2023-04-11 08:23:45 ERROR [auth.service] Unexpected token in authentication flow
2023-04-11 08:24:10 WARN [security.service] Unusual request pattern detected from IP 192.168.1.105
2023-04-11 08:25:30 ERROR [database.service] Unexpected query executed with elevated privileges
2023-04-11 08:26:12 CRITICAL [security.service] Unauthorized access to admin dashboard detected
2023-04-11 08:26:45 CRITICAL [system] Multiple file system operations detected in restricted directories
2023-04-11 08:27:30 ALERT [security.service] Possible exploit of CVE-2023-28771 in auth-validator package
2023-04-11 08:28:15 CRITICAL [system] Unauthorized user created with admin privileges`,
      context: `You are a security analyst at TechCorp, a leading financial technology company. The security team has detected unusual activity on one of the company's web servers. Your task is to analyze the server logs to determine how the attacker gained access to the system.

The server runs a Node.js application with several dependencies, including:
- express@4.18.2
- mongoose@6.9.1
- auth-validator@1.2.3
- react@18.2.0
- axios@1.3.4

The application has a login form, a comment section on the blog, and an admin dashboard that should only be accessible to authorized users.`,
    },
    points: 10,
    order_index: 0,
  },
  {
    id: 2,
    mystery_id: 1,
    title: "API Optimization",
    description: "The API endpoint is running slow. Optimize the code to improve performance.",
    type: "coding",
    content: {
      initialCode: `// This API endpoint is slow and needs optimization
function fetchUserData(userId) {
// Fetch user profile
const userProfile = database.query(\`SELECT * FROM users WHERE id = \${userId}\`);

// Fetch user posts one by one
const posts = [];
const postIds = database.query(\`SELECT id FROM posts WHERE user_id = \${userId}\`);

for (let i = 0; i < postIds.length; i++) {
  const post = database.query(\`SELECT * FROM posts WHERE id = \${postIds[i]}\`);
  posts.push(post);
}

// Fetch user friends one by one
const friends = [];
const friendIds = database.query(\`SELECT friend_id FROM friendships WHERE user_id = \${userId}\`);

for (let i = 0; i < friendIds.length; i++) {
  const friend = database.query(\`SELECT * FROM users WHERE id = \${friendIds[i]}\`);
  friends.push(friend);
}

return {
  profile: userProfile,
  posts: posts,
  friends: friends
};
}`,
      hints: [
        "Consider using batch queries instead of individual queries",
        "SQL JOIN operations can reduce the number of queries",
        "Watch out for potential SQL injection vulnerabilities",
      ],
    },
    points: 25,
    order_index: 1,
  },
  {
    id: 3,
    mystery_id: 1,
    title: "Decryption Challenge",
    description: "Decrypt the message left by the cyber criminal to find their next target.",
    type: "puzzle",
    content: {
      encryptedMessage: "Ymfhp yt ymj sjcy gfsp: Knwxy Sfyntsf Gfsp tk Yjhmstqtld",
      hint: "The message is encrypted with a simple Caesar cipher with a shift of 5.",
      solution: "Going to the next bank: First National Bank of Technology",
    },
    points: 15,
    order_index: 2,
  },
]

// Mock Jobs
export const mockJobs = [
  {
    id: 1,
    company_id: 1,
    company_name: "TechCorp",
    title: "Senior Software Engineer",
    description: "We're looking for an experienced software engineer to join our team...",
    location: "Remote",
    category: "development",
    salary_min: 120000,
    salary_max: 160000,
    interview_mode: "mystery-points" as InterviewMode,
    min_iq_score: 80,
    min_domain_score: 85,
    created_at: new Date("2023-04-01"),
    active: true,
    skills: ["JavaScript", "React", "Node.js"],
  },
  {
    id: 2,
    company_id: 2,
    company_name: "DesignStudio",
    title: "UX/UI Designer",
    description: "Join our creative team to design beautiful and functional interfaces...",
    location: "San Francisco, CA",
    category: "design",
    salary_min: 90000,
    salary_max: 130000,
    interview_mode: "custom-mysteries" as InterviewMode,
    min_iq_score: 75,
    min_domain_score: 90,
    created_at: new Date("2023-04-05"),
    active: true,
    skills: ["Figma", "UI Design", "User Research"],
  },
  {
    id: 3,
    company_id: 1,
    company_name: "TechCorp",
    title: "Data Scientist",
    description: "Help us analyze complex data and build machine learning models...",
    location: "New York, NY",
    category: "data",
    salary_min: 130000,
    salary_max: 170000,
    interview_mode: "ai-interview" as InterviewMode,
    min_iq_score: 85,
    min_domain_score: 85,
    created_at: new Date("2023-04-10"),
    active: true,
    skills: ["Python", "Machine Learning", "SQL"],
  },
]

// Mock Applications
export const mockApplications = [
  {
    id: 1,
    job_id: 1,
    user_id: 1,
    status: "applied" as ApplicationStatus,
    applied_at: new Date("2023-04-15"),
    screening_passed: true,
    revealed: false,
  },
]

// Mock Companies
export const mockCompanies = [
  {
    id: 1,
    name: "TechCorp",
    description: "A leading technology company",
    website: "https://techcorp.example.com",
  },
  {
    id: 2,
    name: "DesignStudio",
    description: "Creative design agency",
    website: "https://designstudio.example.com",
  },
]
