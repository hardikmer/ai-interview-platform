import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Briefcase, Star, Code, MessageSquare, Shield, Users, Zap, Github, Linkedin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(120,50,255,0.15),transparent_50%)]"></div>
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 border-purple-500 text-purple-400">
            AI-Powered Hiring Platform
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Showcase Your Skills,
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {" "}
              Not Just Your Resume
            </span>
          </h1>
          <p className="mb-10 text-xl text-slate-300">
            MystHire helps candidates demonstrate their abilities through interactive mystery challenges and connects
            them with employers who value verified skills over traditional credentials.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/mysteries">Explore Mysteries</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
          <p className="mx-auto max-w-2xl text-slate-300">
            Our platform transforms the hiring process by focusing on verified skills and aptitude.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-purple-900/20 p-3">
              <Brain className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Solve Mysteries</h3>
            <p className="text-slate-300">
              Complete interactive challenges that test your problem-solving abilities, technical skills, and domain
              knowledge.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-purple-900/20 p-3">
              <Star className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Build Your Profile</h3>
            <p className="text-slate-300">
              Earn scores and badges that objectively demonstrate your abilities to potential employers.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-purple-900/20 p-3">
              <Briefcase className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Get Hired</h3>
            <p className="text-slate-300">
              Connect with employers who value your verified skills and are looking for candidates like you.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Key Features</h2>
          <p className="mx-auto max-w-2xl text-slate-300">
            Discover what makes MystHire the future of skill-based hiring.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex gap-4">
            <div className="rounded-full bg-purple-900/20 p-2 h-10 w-10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold">Mystery Challenges</h3>
              <p className="text-slate-300">
                Engage with interactive puzzles and challenges that test real-world skills and problem-solving
                abilities.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-full bg-purple-900/20 p-2 h-10 w-10 flex items-center justify-center">
              <Code className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold">Custom Challenges</h3>
              <p className="text-slate-300">
                Employers can create job-specific challenges to test candidates on skills relevant to the position.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-full bg-purple-900/20 p-2 h-10 w-10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold">AI Interviews</h3>
              <p className="text-slate-300">
                Experience AI-powered interviews that adapt to your responses and provide objective evaluations.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-full bg-purple-900/20 p-2 h-10 w-10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold">Anonymous Applications</h3>
              <p className="text-slate-300">
                Apply anonymously and let your skills speak for themselves, reducing bias in the hiring process.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-full bg-purple-900/20 p-2 h-10 w-10 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold">Two-Stage Reveal</h3>
              <p className="text-slate-300">
                Employers can first see your skills and qualifications before revealing personal information.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-full bg-purple-900/20 p-2 h-10 w-10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold">Skill Verification</h3>
              <p className="text-slate-300">
                Earn verified skill badges that showcase your abilities to potential employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="mx-auto max-w-6xl py-12 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-purple-500">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-small-OaYYCNCgjGDtvne4ZQ3YR1g1CLI8lg.png"
              alt="Hardik Mer"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Developed by Hardik Mer</h2>
            <p className="text-slate-300 mb-4">
              This project was created for a hackathon to demonstrate innovative approaches to the hiring process.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                <a href="https://github.com/hardikmer" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                <a href="https://www.linkedin.com/in/hardikmer/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(120,50,255,0.15),transparent_50%)]"></div>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Transform Your Hiring Process?</h2>
          <p className="mb-8 text-xl text-slate-300">
            Join thousands of candidates and employers who are revolutionizing how talent is discovered and hired.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/signup?role=candidate">Join as Candidate</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup?role=employer">Join as Employer</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
