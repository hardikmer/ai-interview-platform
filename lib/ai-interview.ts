import { create } from "zustand"
import { useJobs } from "./jobs" // Import useJobs

export type InterviewQuestion = {
  id: string
  question: string
  category: "technical" | "behavioral" | "domain-specific" | "general"
  expectedKeywords?: string[]
}

export type InterviewAnswer = {
  questionId: string
  answer: string
  score: number
  feedback: string
}

export type InterviewSession = {
  id: string
  jobId: string
  candidateId: string
  questions: InterviewQuestion[]
  answers: InterviewAnswer[]
  currentQuestionIndex: number
  completed: boolean
  overallScore: number
  overallFeedback: string
  startTime: Date
  endTime?: Date
}

interface AIInterviewState {
  sessions: InterviewSession[]
  currentSession: InterviewSession | null
  startInterview: (jobId: string, candidateId: string) => string
  answerQuestion: (sessionId: string, answer: string) => void
  completeInterview: (sessionId: string) => void
  getSessionById: (id: string) => InterviewSession | undefined
  getSessionsByCandidate: (candidateId: string) => InterviewSession[]
  generateQuestionsForJob: (jobId: string, jobDescription: string, skills: string[]) => InterviewQuestion[]
  evaluateAnswer: (question: InterviewQuestion, answer: string) => { score: number; feedback: string }
}

// Common interview questions that work for most job types
const commonInterviewQuestions: InterviewQuestion[] = [
  {
    id: "common_1",
    question: "Tell me about yourself and your professional background.",
    category: "general",
  },
  {
    id: "common_2",
    question: "What are your greatest professional strengths?",
    category: "general",
  },
  {
    id: "common_3",
    question: "What do you consider to be your weaknesses?",
    category: "general",
  },
  {
    id: "common_4",
    question: "Why are you interested in this position?",
    category: "general",
  },
  {
    id: "common_5",
    question: "Where do you see yourself professionally in five years?",
    category: "general",
  },
  {
    id: "common_6",
    question: "Describe a challenging work situation and how you overcame it.",
    category: "behavioral",
  },
  {
    id: "common_7",
    question: "How do you handle stress and pressure in the workplace?",
    category: "behavioral",
  },
  {
    id: "common_8",
    question: "Tell me about a time you demonstrated leadership skills.",
    category: "behavioral",
  },
  {
    id: "common_9",
    question: "How do you prioritize your work when handling multiple projects?",
    category: "behavioral",
  },
  {
    id: "common_10",
    question: "Describe your ideal work environment.",
    category: "general",
  },
  {
    id: "common_11",
    question: "How do you stay updated with the latest trends and developments in your field?",
    category: "general",
  },
  {
    id: "common_12",
    question: "Tell me about a time when you had to learn something new in a short period.",
    category: "behavioral",
  },
  {
    id: "common_13",
    question: "How do you handle feedback and criticism?",
    category: "behavioral",
  },
  {
    id: "common_14",
    question: "What achievement are you most proud of in your career so far?",
    category: "general",
  },
  {
    id: "common_15",
    question: "How would your colleagues describe your work style?",
    category: "general",
  },
]

// Mock AI interview questions generator
const generateQuestionsForJobImpl = (jobId: string, jobDescription: string, skills: string[]): InterviewQuestion[] => {
  // In a real implementation, this would use AI to generate relevant questions
  // based on the job description and required skills

  // Start with common questions that work for any job
  const selectedCommonQuestions = commonInterviewQuestions.slice(0, 5)

  // Add job-specific technical questions
  const technicalQuestions: InterviewQuestion[] = [
    {
      id: `q1_${jobId}`,
      question: "Explain the concept of closures in JavaScript and provide an example.",
      category: "technical",
      expectedKeywords: ["scope", "function", "variable", "lexical", "environment"],
    },
    {
      id: `q2_${jobId}`,
      question: "How would you optimize the performance of a React application?",
      category: "technical",
      expectedKeywords: ["memo", "useMemo", "useCallback", "virtualization", "code splitting"],
    },
    {
      id: `q3_${jobId}`,
      question: "Describe your experience with state management in frontend applications.",
      category: "technical",
      expectedKeywords: ["redux", "context", "zustand", "recoil", "state"],
    },
  ]

  const behavioralQuestions: InterviewQuestion[] = [
    {
      id: `q4_${jobId}`,
      question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
      category: "behavioral",
    },
    {
      id: `q5_${jobId}`,
      question: "How do you handle disagreements with team members about technical decisions?",
      category: "behavioral",
    },
    {
      id: `q6_${jobId}`,
      question: "Describe a situation where you had to meet a tight deadline. How did you manage it?",
      category: "behavioral",
    },
    {
      id: `q7_${jobId}`,
      question: "How do you approach learning new technologies or frameworks?",
      category: "behavioral",
    },
  ]

  // Generate domain-specific questions based on skills
  const domainQuestions: InterviewQuestion[] = skills.map((skill, index) => ({
    id: `q${8 + index}_${jobId}`,
    question: `Describe your experience with ${skill} and how you've used it in previous projects.`,
    category: "domain-specific",
    expectedKeywords: [skill.toLowerCase()],
  }))

  // Combine all questions and select a subset for the interview
  // We'll include more questions now to support a longer demo
  return [...selectedCommonQuestions, ...technicalQuestions, ...behavioralQuestions, ...domainQuestions].slice(0, 12)
}

// Mock answer evaluation
const evaluateAnswerImpl = (question: InterviewQuestion, answer: string): { score: number; feedback: string } => {
  // In a real implementation, this would use AI to evaluate the answer
  // based on relevance, completeness, accuracy, etc.

  // For now, we'll use a simple keyword-based evaluation
  if (!answer || answer.trim().length < 20) {
    return {
      score: 0,
      feedback: "The answer was too short or empty.",
    }
  }

  const answerLower = answer.toLowerCase()
  let score = 50 // Base score

  // Check for expected keywords
  if (question.expectedKeywords) {
    const keywordsFound = question.expectedKeywords.filter((keyword) => answerLower.includes(keyword.toLowerCase()))
    score += (keywordsFound.length / question.expectedKeywords.length) * 30
  }

  // Add some randomness to simulate AI evaluation
  score += Math.floor(Math.random() * 20)
  score = Math.min(100, Math.max(0, score)) // Clamp between 0-100

  let feedback = ""
  if (score >= 90) {
    feedback = "Excellent answer! Very comprehensive and well-articulated."
  } else if (score >= 75) {
    feedback = "Good answer with solid understanding of the topic."
  } else if (score >= 60) {
    feedback = "Acceptable answer, but could be more detailed or precise."
  } else if (score >= 40) {
    feedback = "Basic answer that addresses the question partially."
  } else {
    feedback = "The answer needs improvement and lacks key information."
  }

  return { score, feedback }
}

export const useAIInterview = create<AIInterviewState>((set, get) => ({
  sessions: [],
  currentSession: null,

  startInterview: (jobId, candidateId) => {
    const job = useJobs.getState().getJobById(jobId)
    if (!job) throw new Error("Job not found")

    const id = `interview_${Date.now()}`
    const questions = get().generateQuestionsForJob(jobId, job.description, job.skills)

    const newSession: InterviewSession = {
      id,
      jobId,
      candidateId,
      questions,
      answers: [],
      currentQuestionIndex: 0,
      completed: false,
      overallScore: 0,
      overallFeedback: "",
      startTime: new Date(),
    }

    set((state) => ({
      sessions: [...state.sessions, newSession],
      currentSession: newSession,
    }))

    return id
  },

  answerQuestion: (sessionId, answer) => {
    const session = get().getSessionById(sessionId)
    if (!session) throw new Error("Session not found")
    if (session.completed) throw new Error("Interview already completed")

    const currentQuestion = session.questions[session.currentQuestionIndex]
    const evaluation = get().evaluateAnswer(currentQuestion, answer)

    const newAnswer: InterviewAnswer = {
      questionId: currentQuestion.id,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    }

    const newAnswers = [...session.answers, newAnswer]
    const nextQuestionIndex = session.currentQuestionIndex + 1
    const isCompleted = nextQuestionIndex >= session.questions.length

    let overallScore = 0
    let overallFeedback = ""

    if (isCompleted) {
      // Calculate overall score
      overallScore = Math.round(newAnswers.reduce((sum, a) => sum + a.score, 0) / newAnswers.length)

      // Generate overall feedback
      if (overallScore >= 90) {
        overallFeedback =
          "Outstanding interview performance! The candidate demonstrated exceptional knowledge and communication skills."
      } else if (overallScore >= 80) {
        overallFeedback = "Very strong interview performance with good technical knowledge and communication."
      } else if (overallScore >= 70) {
        overallFeedback = "Good interview performance with solid understanding of most topics."
      } else if (overallScore >= 60) {
        overallFeedback = "Satisfactory interview performance with adequate knowledge of the required skills."
      } else {
        overallFeedback =
          "The interview performance suggests the candidate may not have the required expertise for this role."
      }
    }

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              answers: newAnswers,
              currentQuestionIndex: nextQuestionIndex,
              completed: isCompleted,
              overallScore: isCompleted ? overallScore : s.overallScore,
              overallFeedback: isCompleted ? overallFeedback : s.overallFeedback,
              endTime: isCompleted ? new Date() : s.endTime,
            }
          : s,
      ),
      currentSession:
        state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              answers: newAnswers,
              currentQuestionIndex: nextQuestionIndex,
              completed: isCompleted,
              overallScore: isCompleted ? overallScore : state.currentSession.overallScore,
              overallFeedback: isCompleted ? overallFeedback : state.currentSession.overallFeedback,
              endTime: isCompleted ? new Date() : state.currentSession.endTime,
            }
          : state.currentSession,
    }))
  },

  completeInterview: (sessionId) => {
    const session = get().getSessionById(sessionId)
    if (!session) throw new Error("Session not found")

    // Calculate overall score from existing answers
    const overallScore = Math.round(
      session.answers.reduce((sum, answer) => sum + answer.score, 0) / Math.max(1, session.answers.length),
    )

    // Generate overall feedback
    let overallFeedback = ""
    if (overallScore >= 90) {
      overallFeedback =
        "Outstanding interview performance! The candidate demonstrated exceptional knowledge and communication skills."
    } else if (overallScore >= 80) {
      overallFeedback = "Very strong interview performance with good technical knowledge and communication."
    } else if (overallScore >= 70) {
      overallFeedback = "Good interview performance with solid understanding of most topics."
    } else if (overallScore >= 60) {
      overallFeedback = "Satisfactory interview performance with adequate knowledge of the required skills."
    } else {
      overallFeedback =
        "The interview performance suggests the candidate may not have the required expertise for this role."
    }

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              completed: true,
              overallScore,
              overallFeedback,
              endTime: new Date(),
            }
          : s,
      ),
      currentSession:
        state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              completed: true,
              overallScore,
              overallFeedback,
              endTime: new Date(),
            }
          : state.currentSession,
    }))

    // Update the application with the interview results
    const currentSession = get().getSessionById(sessionId)
    if (currentSession) {
      const applications = useJobs.getState().getApplicationsByJob(currentSession.jobId)
      const application = applications.find((app) => app.candidateId === currentSession.candidateId)

      if (application) {
        useJobs.getState().updateApplication(application.id, {
          status: "interviewed",
          interviewScore: currentSession.overallScore,
          interviewFeedback: currentSession.overallFeedback,
          aiInterviewTranscript: JSON.stringify(currentSession),
          screeningPassed: currentSession.overallScore >= 70, // Pass if score is 70 or above
        })
      }
    }
  },

  getSessionById: (id) => {
    return get().sessions.find((session) => session.id === id)
  },

  getSessionsByCandidate: (candidateId) => {
    return get().sessions.filter((session) => session.candidateId === candidateId)
  },

  generateQuestionsForJob: generateQuestionsForJobImpl,

  evaluateAnswer: evaluateAnswerImpl,
}))
