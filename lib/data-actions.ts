"use server"

import { executeQuery } from "./db"

// Fetch all users with their roles
export async function getUsers() {
  try {
    const query = `
      SELECT id, name, email, role, overall_score, iq_score, domain_score
      FROM users
      ORDER BY name
    `
    const users = await executeQuery(query)
    return { success: true, users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

// Fetch all mysteries with their skills
export async function getMysteries() {
  try {
    const query = `
      SELECT m.*, 
             array_agg(ms.skill) as skills
      FROM mysteries m
      LEFT JOIN mystery_skills ms ON m.id = ms.mystery_id
      GROUP BY m.id
      ORDER BY m.title
    `
    const mysteries = await executeQuery(query)
    return { success: true, mysteries }
  } catch (error) {
    console.error("Error fetching mysteries:", error)
    return { success: false, error: "Failed to fetch mysteries" }
  }
}

// Fetch all job postings with company and skills
export async function getJobPostings() {
  try {
    const query = `
      SELECT j.*, 
             c.name as company_name,
             array_agg(js.skill) as skills
      FROM job_postings j
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      GROUP BY j.id, c.name
      ORDER BY j.created_at DESC
    `
    const jobs = await executeQuery(query)
    return { success: true, jobs }
  } catch (error) {
    console.error("Error fetching job postings:", error)
    return { success: false, error: "Failed to fetch job postings" }
  }
}

// Fetch user progress on mysteries
export async function getUserProgress(userId: number) {
  try {
    const query = `
      SELECT um.*, m.title, m.category, m.difficulty
      FROM user_mysteries um
      JOIN mysteries m ON um.mystery_id = m.id
      WHERE um.user_id = $1
      ORDER BY um.started_at DESC
    `
    const progress = await executeQuery(query, [userId])
    return { success: true, progress }
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return { success: false, error: "Failed to fetch user progress" }
  }
}

// Fetch job applications for a specific job
export async function getJobApplications(jobId: number) {
  try {
    const query = `
      SELECT ja.*, u.name as candidate_name, u.email as candidate_email,
             u.overall_score, u.iq_score, u.domain_score
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      WHERE ja.job_id = $1
      ORDER BY ja.applied_at DESC
    `
    const applications = await executeQuery(query, [jobId])
    return { success: true, applications }
  } catch (error) {
    console.error("Error fetching job applications:", error)
    return { success: false, error: "Failed to fetch job applications" }
  }
}
