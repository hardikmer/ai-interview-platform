# MystHire - AI-Powered Hiring Platform

![MystHire Logo](/public/logo.png)

## About MystHire

MystHire is an innovative AI-powered hiring platform that transforms the traditional recruitment process by focusing on verified skills and aptitude rather than just resumes. The platform connects candidates with employers through interactive mystery challenges and AI interviews, creating a more objective and engaging hiring experience.

## Features

### For Candidates
- **Mystery Challenges**: Solve interactive puzzles that showcase your problem-solving abilities and technical skills
- **Skill Verification**: Earn badges and scores that objectively demonstrate your abilities
- **AI Interviews**: Practice with AI-powered interviews that adapt to your responses
- **Anonymous Applications**: Let your skills speak for themselves, reducing bias in the hiring process

### For Employers
- **Custom Challenges**: Create job-specific challenges to test candidates on relevant skills
- **Two-Stage Reveal**: First see candidates' skills and qualifications before revealing personal information
- **Candidate Ranking**: Objectively compare candidates based on verified skills and challenge performance
- **AI-Assisted Screening**: Save time with AI-powered initial candidate screening

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI Features**: Web Speech API, Speech Synthesis

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/hardikmer/ai-interview-platform
cd ai-interview-platform
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables
Create a `.env.local` file with the following variables:
\`\`\`
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
\`\`\`

4. Run database migrations
\`\`\`bash
npx prisma migrate dev
\`\`\`

5. Start the development server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
ai-interview-platform/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard pages
│   ├── employers/        # Employer-specific pages
│   ├── jobs/             # Job listings and applications
│   ├── mysteries/        # Mystery challenges
│   └── ...
├── components/           # Reusable React components
├── lib/                  # Utility functions and data handling
├── public/               # Static assets
└── ...
\`\`\`

## Key Features Explained

### Mystery Challenges
Interactive puzzles and challenges that test real-world skills and problem-solving abilities. Candidates can solve these to demonstrate their capabilities beyond what's listed on their resume.

### AI Interviews
AI-powered interviews that adapt to candidate responses and provide objective evaluations. This feature helps candidates practice for real interviews and gives employers initial screening data.

### Anonymous Applications
Candidates can apply anonymously, letting their skills speak for themselves. This reduces bias in the hiring process and focuses on what really matters - ability to do the job.

### Two-Stage Reveal
Employers first see candidates' skills and qualifications before revealing personal information, further reducing unconscious bias in hiring decisions.

## Hackathon Project

This project was developed for a hackathon by Hardik Mer.

## Developer

### Hardik Mer

![Hardik Mer]

- GitHub: [https://github.com/hardikmer](https://github.com/hardikmer)
- LinkedIn: [https://www.linkedin.com/in/hardikmer/](https://www.linkedin.com/in/hardikmer/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`


