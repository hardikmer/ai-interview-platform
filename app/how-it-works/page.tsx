import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Code, Briefcase, Award, BarChart, Users, ArrowRight } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(120,50,255,0.15),transparent_50%)]"></div>
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 border-purple-500 text-purple-400">
            The Process
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            How
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {" "}
              MystHire{" "}
            </span>
            Works
          </h1>
          <p className="mb-10 text-xl text-slate-300">
            Discover how our innovative platform transforms the hiring process through immersive mystery challenges and
            objective skill assessment.
          </p>
        </div>
      </section>

      {/* For Candidates */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-12">
          <Badge className="mb-2 bg-purple-600 hover:bg-purple-700">For Candidates</Badge>
          <h2 className="mb-4 text-3xl font-bold">Your Journey as a Candidate</h2>
          <p className="max-w-3xl text-slate-300">
            MystHire transforms how you showcase your skills to potential employers. Instead of relying on resumes,
            you'll solve immersive challenges that demonstrate your actual abilities.
          </p>
        </div>

        <div className="relative space-y-12 pl-8 before:absolute before:left-4 before:top-0 before:h-full before:border-l-2 before:border-dashed before:border-slate-700">
          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
              1
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Create Your Profile</h3>
                  <p className="text-slate-300">
                    Sign up and create your MystHire profile. Unlike traditional platforms, we don't ask for a resume.
                    Instead, we'll build your profile based on your performance in our mystery challenges.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-900/50 to-indigo-900/50 md:w-1/3">
                  <Users className="h-16 w-16 text-purple-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
              2
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Solve Mystery Challenges</h3>
                  <p className="text-slate-300">
                    Engage with immersive, domain-specific challenges that test both your IQ and technical skills. Each
                    mystery is designed to simulate real-world scenarios you'd encounter in your desired role.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-900/50 to-cyan-900/50 md:w-1/3">
                  <Brain className="h-16 w-16 text-blue-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
              3
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Build Your Skill Profile</h3>
                  <p className="text-slate-300">
                    As you complete challenges, you'll earn IQ and Domain Skill scores that create an objective,
                    verifiable talent profile. Your Detective Dashboard will visualize your strengths and growth areas.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-pink-900/50 to-red-900/50 md:w-1/3">
                  <BarChart className="h-16 w-16 text-pink-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
              4
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Get Discovered by Employers</h3>
                  <p className="text-slate-300">
                    Companies discover you based on your proven abilities, not just your resume or experience. When
                    they're impressed by your skills, they'll reach out directly through the platform.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-green-900/50 to-emerald-900/50 md:w-1/3">
                  <Briefcase className="h-16 w-16 text-green-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-12">
          <Badge className="mb-2 bg-amber-600 hover:bg-amber-700">For Employers</Badge>
          <h2 className="mb-4 text-3xl font-bold">How Employers Use MystHire</h2>
          <p className="max-w-3xl text-slate-300">
            MystHire transforms your hiring process by focusing on verified skills and aptitude rather than traditional
            resumes and interviews.
          </p>
        </div>

        <div className="relative space-y-12 pl-8 before:absolute before:left-4 before:top-0 before:h-full before:border-l-2 before:border-dashed before:border-slate-700">
          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white">
              1
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Create Your Company Profile</h3>
                  <p className="text-slate-300">
                    Sign up as an employer and create your company profile. Showcase your culture, values, and the types
                    of roles you're looking to fill.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-amber-900/50 to-yellow-900/50 md:w-1/3">
                  <Briefcase className="h-16 w-16 text-amber-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white">
              2
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Post Jobs with Skill Requirements</h3>
                  <p className="text-slate-300">
                    Create job listings with specific IQ and domain skill thresholds. Instead of requiring years of
                    experience, focus on the actual abilities needed for success.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-orange-900/50 to-red-900/50 md:w-1/3">
                  <Code className="h-16 w-16 text-orange-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white">
              3
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Create Custom Mysteries</h3>
                  <p className="text-slate-300">
                    Use our pre-built challenges or create custom mysteries specific to your role. These immersive
                    scenarios will test candidates on the exact skills you need.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-900/50 to-purple-900/50 md:w-1/3">
                  <Brain className="h-16 w-16 text-violet-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white">
              4
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Find and Contact Qualified Candidates</h3>
                  <p className="text-slate-300">
                    Browse candidates who meet your skill criteria and review their detailed performance analytics. When
                    you find a good match, contact them directly through the platform.
                  </p>
                </div>
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-900/50 to-indigo-900/50 md:w-1/3">
                  <Users className="h-16 w-16 text-blue-400 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-12">
          <Badge className="mb-2 bg-green-600 hover:bg-green-700">Scoring System</Badge>
          <h2 className="mb-4 text-3xl font-bold">Understanding the MystHire Scoring System</h2>
          <p className="max-w-3xl text-slate-300">
            Our unique scoring system combines IQ and domain-specific skills to create a comprehensive assessment of a
            candidate's abilities.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-900/20 p-2">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">IQ Score (General Aptitude)</h3>
              </div>
              <p className="mb-4 text-slate-300">
                The IQ Score measures a candidate's general cognitive abilities, including:
              </p>
              <ul className="mb-4 space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>Analytical reasoning and problem-solving</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>Pattern recognition and logical thinking</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>Creative approaches to complex challenges</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>Adaptability and learning potential</span>
                </li>
              </ul>
              <p className="text-slate-300">
                This score is derived from how quickly and efficiently candidates solve logic puzzles, riddles, and
                hidden clues within the mystery challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-pink-900/20 p-2">
                  <Code className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold">Domain Skill Score</h3>
              </div>
              <p className="mb-4 text-slate-300">
                The Domain Skill Score measures a candidate's specific technical abilities, including:
              </p>
              <ul className="mb-4 space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-pink-400" />
                  <span>Technical proficiency in specific tools and languages</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-pink-400" />
                  <span>Applied knowledge in real-world scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-pink-400" />
                  <span>Problem-solving within domain constraints</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-pink-400" />
                  <span>Best practices and industry standards</span>
                </li>
              </ul>
              <p className="text-slate-300">
                This score is derived directly from the candidate's demonstrated proficiency in solving domain-specific
                puzzles within the mystery challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 md:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-purple-900/20 p-2">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Final Candidate Score</h3>
              </div>
              <p className="mb-4 text-slate-300">
                The Final Candidate Score is a weighted combination of the IQ and Domain Skill scores. By default, we
                use a 40% IQ + 60% Domain Skill weighting, but employers can adjust this based on their specific job
                requirements.
              </p>
              <p className="mb-4 text-slate-300">
                This comprehensive score provides a holistic view of a candidate's abilities, balancing general aptitude
                with specific technical skills. Employers can filter candidates based on minimum thresholds for each
                score component.
              </p>
              <div className="rounded-lg bg-slate-800/50 p-4">
                <h4 className="mb-2 font-medium">Example Scoring</h4>
                <p className="text-sm text-slate-300">
                  A software engineer candidate might have an IQ Score of 92 and a Domain Skill Score of 84. Using the
                  default weighting, their Final Candidate Score would be:
                </p>
                <p className="mt-2 font-mono text-sm text-purple-400">(92 × 0.4) + (84 × 0.6) = 36.8 + 50.4 = 87.2</p>
                <p className="mt-2 text-sm text-slate-300">
                  This places them in the top 15% of candidates on the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 p-10 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">Ready to Experience MystHire?</h2>
        <p className="mb-8 text-lg text-purple-100">
          Whether you're a job seeker looking to showcase your skills or an employer seeking top talent, MystHire offers
          a revolutionary approach to the hiring process.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-100">
            Start as a Candidate
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-purple-800/20">
            Register as an Employer
          </Button>
        </div>
      </section>
    </div>
  )
}
