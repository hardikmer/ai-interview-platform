import { create } from "zustand"
import { getDbClient } from "./db"

export type InterviewMode =
  | "mystery-points"
  | "custom-mysteries"
  | "ai-interview"
  | "mystery_challenge"
  | "standard"
  | "ai_interview"
export type ApplicationStatus = "applied" | "screening" | "interview" | "offer" | "rejected"

export interface Job {
  id: number
  company_id: number
  company_name: string
  title: string
  description: string
  location: string
  category: string
  salary_min: number
  salary_max: number
  interview_mode: InterviewMode
  min_iq_score: number
  min_domain_score: number
  created_at: Date
  active: boolean
  skills: string[]
}

export interface Application {
  id: number
  job_id: number
  user_id: number
  status: ApplicationStatus
  applied_at: Date
  screening_passed: boolean
  revealed: boolean
}

export interface SalaryRange {
  min: number
  max: number
}

export interface JobPosting {
  id: number
  company_id: number
  company_name: string
  title: string
  description: string
  location: string
  category: string
  salary_min: number
  salary_max: number
  interview_mode: InterviewMode
  custom_mystery_ids?: number[]
  min_iq_score: number
  min_domain_score: number
  created_at: Date
  active: boolean
  skills: string[]
}

export interface JobApplication {
  id: number
  job_id: number
  user_id: number
  status: ApplicationStatus
  applied_at: Date
  interview_score?: number
  interview_feedback?: string
  screening_passed: boolean
  revealed: boolean
}

interface JobsState {
  jobs: JobPosting[]
  applications: JobApplication[]
  currentJob: JobPosting | null
  isLoading: boolean
  error: string | null
  fetchJobs: () => Promise<void>
  fetchJobById: (id: number) => Promise<JobPosting | null>
  addJob: (job: Omit<JobPosting, "id" | "created_at">) => Promise<number | null>
  updateJob: (id: number, job: Partial<JobPosting>) => Promise<void>
  deleteJob: (id: number) => Promise<void>
  getJobById: (id: number) => JobPosting | undefined
  getJobsByCompany: (companyId: number) => JobPosting[]
  applyToJob: (jobId: number, userId: number) => Promise<string | null>
  updateApplicationStatus: (id: number, status: ApplicationStatus) => Promise<void>
  getApplicationById: (id: number) => JobApplication | undefined
  getApplicationsByJob: (jobId: number) => JobApplication[]
  getApplicationsByCandidate: (userId: number) => JobApplication[]
  hasApplied: (jobId: number, userId: number) => boolean
  getCandidateApplicationHistory: (candidateId: number, companyId: number) => JobApplication[]
}

export const useJobs = create<JobsState>((set, get) => ({
  jobs: [],
  applications: [],
  currentJob: null,
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true, error: null })
    try {
      console.log("Fetching jobs from database...")

      const sql = getDbClient()
      if (!sql) {
        throw new Error("No database connection available")
      }

      // Check if job_postings table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'job_postings'
        );
      `

      const tableExists = tableCheck[0]?.exists || false

      if (!tableExists) {
        console.log("Creating job_postings table...")
        await sql`
          CREATE TABLE job_postings (
            id SERIAL PRIMARY KEY,
            company_id INTEGER,
            company_name VARCHAR(255),
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            location VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            salary_min INTEGER NOT NULL,
            salary_max INTEGER NOT NULL,
            interview_mode VARCHAR(50) NOT NULL,
            min_iq_score INTEGER NOT NULL DEFAULT 0,
            min_domain_score INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN NOT NULL DEFAULT TRUE,
            skills TEXT
          )
        `
        console.log("job_postings table created successfully")
      }

      // Check if job_applications table exists
      const appTableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'job_applications'
        );
      `

      const appTableExists = appTableCheck[0]?.exists || false

      if (!appTableExists) {
        console.log("Creating job_applications table...")
        await sql`
          CREATE TABLE job_applications (
            id SERIAL PRIMARY KEY,
            job_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'applied',
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            interview_score INTEGER,
            interview_feedback TEXT,
            screening_passed BOOLEAN NOT NULL DEFAULT FALSE,
            revealed BOOLEAN NOT NULL DEFAULT FALSE,
            UNIQUE(job_id, user_id)
          )
        `
        console.log("job_applications table created successfully")
      }

      // Fetch jobs from database
      const dbJobs = await sql`
        SELECT * FROM job_postings ORDER BY created_at DESC
      `

      console.log(`Retrieved ${dbJobs.length} jobs from database`)

      // Fetch applications from database
      const dbApplications = await sql`
        SELECT * FROM job_applications ORDER BY applied_at DESC
      `

      console.log(`Retrieved ${dbApplications.length} applications from database`)

      // Process jobs data
      const processedJobs = dbJobs.map((job) => {
        // Parse skills if it's stored as JSON
        let skills = job.skills || []
        if (typeof skills === "string") {
          try {
            skills = JSON.parse(skills)
          } catch (e) {
            console.warn(`Failed to parse skills for job ${job.id}:`, e)
            skills = []
          }
        }

        return {
          id: job.id,
          company_id: job.company_id,
          company_name: job.company_name || "Unknown Company",
          title: job.title,
          description: job.description,
          location: job.location,
          category: job.category,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          interview_mode: job.interview_mode,
          min_iq_score: job.min_iq_score,
          min_domain_score: job.min_domain_score,
          created_at: new Date(job.created_at),
          active: job.active,
          skills: skills,
        }
      })

      // Process applications data
      const processedApplications = dbApplications.map((app) => ({
        id: app.id,
        job_id: app.job_id,
        user_id: app.user_id,
        status: app.status,
        applied_at: new Date(app.applied_at),
        interview_score: app.interview_score,
        interview_feedback: app.interview_feedback,
        screening_passed: app.screening_passed,
        revealed: app.revealed,
      }))

      set({
        jobs: processedJobs,
        applications: processedApplications,
        isLoading: false,
      })
    } catch (error) {
      console.error("Error fetching jobs:", error)
      set({ error: "An unexpected error occurred", isLoading: false })
    }
  },

  fetchJobById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const sql = getDbClient()
      if (!sql) {
        throw new Error("No database connection available")
      }

      const result = await sql`
        SELECT * FROM job_postings WHERE id = ${id} LIMIT 1
      `

      if (result.length === 0) {
        set({ error: "Job not found", isLoading: false })
        return null
      }

      const job = result[0]

      // Parse skills if it's stored as JSON
      let skills = job.skills || []
      if (typeof skills === "string") {
        try {
          skills = JSON.parse(skills)
        } catch (e) {
          console.warn(`Failed to parse skills for job ${job.id}:`, e)
          skills = []
        }
      }

      const processedJob = {
        id: job.id,
        company_id: job.company_id,
        company_name: job.company_name || "Unknown Company",
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        interview_mode: job.interview_mode,
        min_iq_score: job.min_iq_score,
        min_domain_score: job.min_domain_score,
        created_at: new Date(job.created_at),
        active: job.active,
        skills: skills,
      }

      set({ currentJob: processedJob, isLoading: false })
      return processedJob
    } catch (error) {
      console.error("Error fetching job by ID:", error)
      set({ error: "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  addJob: async (job) => {
    set({ isLoading: true, error: null })
    try {
      console.log("Adding new job to database:", job)

      const sql = getDbClient()
      if (!sql) {
        throw new Error("No database connection available")
      }

      // Check if job_postings table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'job_postings'
        );
      `

      const tableExists = tableCheck[0]?.exists || false
      if (!tableExists) {
        throw new Error("job_postings table does not exist in the database")
      }

      // Get the table structure to adapt our insert
      const tableColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'job_postings'
        ORDER BY ordinal_position;
      `

      console.log("Table structure:", tableColumns)

      // Check if skills column exists and its data type
      const skillsColumn = tableColumns.find((col) => col.column_name === "skills")
      const hasSkillsColumn = !!skillsColumn
      const skillsType = skillsColumn?.data_type || null

      // Ensure all required fields are present
      if (!job.title || !job.location || !job.category || !job.description) {
        throw new Error("Missing required job fields")
      }

      // Ensure numeric fields are numbers
      const salary_min =
        typeof job.salary_min === "number" ? job.salary_min : Number.parseInt(job.salary_min as any, 10) || 0
      const salary_max =
        typeof job.salary_max === "number" ? job.salary_max : Number.parseInt(job.salary_max as any, 10) || 0
      const min_iq_score =
        typeof job.min_iq_score === "number" ? job.min_iq_score : Number.parseInt(job.min_iq_score as any, 10) || 0
      const min_domain_score =
        typeof job.min_domain_score === "number"
          ? job.min_domain_score
          : Number.parseInt(job.min_domain_score as any, 10) || 0
      const company_id =
        typeof job.company_id === "number" ? job.company_id : Number.parseInt(job.company_id as any, 10) || 1

      // Prepare skills based on column type
      const skills = Array.isArray(job.skills) ? job.skills : []
      let skillsValue = null

      if (hasSkillsColumn) {
        if (skillsType === "jsonb" || skillsType === "json") {
          skillsValue = JSON.stringify(skills)
        } else if (skillsType === "text" || skillsType.includes("char")) {
          skillsValue = JSON.stringify(skills)
        } else if (skillsType === "array") {
          skillsValue = skills
        }
      }

      console.log("Processed job data:", {
        company_id,
        company_name: job.company_name,
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        salary_min,
        salary_max,
        interview_mode: job.interview_mode,
        min_iq_score,
        min_domain_score,
        skills: skillsValue,
      })

      // Use a simpler approach with direct SQL
      const result = await sql`
        INSERT INTO job_postings (
          company_id, company_name, title, description, location, category, 
          salary_min, salary_max, interview_mode, min_iq_score, min_domain_score, 
          active, skills
        ) VALUES (
          ${company_id}, ${job.company_name}, ${job.title}, ${job.description}, 
          ${job.location}, ${job.category}, ${salary_min}, ${salary_max}, 
          ${job.interview_mode}, ${min_iq_score}, ${min_domain_score}, 
          ${true}, ${skillsValue}
        ) RETURNING id
      `

      console.log("Database insert result:", result)

      if (!result || result.length === 0) {
        throw new Error("Failed to add job - no rows returned from database")
      }

      const newJobId = result[0]?.id
      if (newJobId === undefined) {
        throw new Error("Failed to add job - no ID returned from database")
      }

      console.log(`Job added successfully with ID: ${newJobId}`)

      // Add the new job to the state
      const newJob = {
        ...job,
        id: newJobId,
        created_at: new Date(),
      }

      set((state) => ({
        jobs: [newJob, ...state.jobs],
        isLoading: false,
      }))

      // Refresh jobs list
      await get().fetchJobs()

      return newJobId
    } catch (error) {
      console.error("Error adding job:", error)
      set({ error: `Error adding job: ${error instanceof Error ? error.message : "Unknown error"}`, isLoading: false })
      return null
    }
  },

  updateJob: async (id, jobUpdates) => {
    // Implementation for updating a job
  },

  deleteJob: async (id) => {
    // Implementation for deleting a job
  },

  getJobById: (id) => {
    return get().jobs.find((job) => job.id === id)
  },

  getJobsByCompany: (companyId) => {
    return get().jobs.filter((job) => job.company_id === companyId)
  },

  applyToJob: async (jobId, userId) => {
    try {
      const sql = getDbClient()
      if (!sql) {
        throw new Error("No database connection available")
      }

      // Check if already applied
      const existingApplication = await sql`
        SELECT id FROM job_applications 
        WHERE job_id = ${jobId} AND user_id = ${userId}
        LIMIT 1
      `

      if (existingApplication.length > 0) {
        return existingApplication[0].id
      }

      // Insert application into database
      const result = await sql`
        INSERT INTO job_applications (job_id, user_id, status, screening_passed, revealed)
        VALUES (${jobId}, ${userId}, 'applied', false, false)
        RETURNING id
      `

      if (result.length === 0) {
        throw new Error("Failed to apply for job")
      }

      const applicationId = result[0].id

      // Refresh applications
      await get().fetchJobs()

      return applicationId
    } catch (error) {
      console.error("Error applying for job:", error)
      set({ error: "An unexpected error occurred" })
      return null
    }
  },

  updateApplicationStatus: async (id, status) => {
    // Implementation for updating application status
  },

  getApplicationById: (id) => {
    return get().applications.find((app) => app.id === id)
  },

  getApplicationsByJob: (jobId) => {
    return get().applications.filter((app) => app.job_id === jobId)
  },

  getApplicationsByCandidate: (userId) => {
    return get().applications.filter((app) => app.user_id === userId)
  },

  hasApplied: (jobId, userId) => {
    return get().applications.some((app) => app.job_id === jobId && app.user_id === userId)
  },

  getCandidateApplicationHistory: (candidateId, companyId) => {
    const companyJobs = get()
      .jobs.filter((job) => job.company_id === companyId)
      .map((job) => job.id)
    return get().applications.filter((app) => app.user_id === candidateId && companyJobs.includes(app.job_id))
  },
}))
