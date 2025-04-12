import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  company: string
  avatarUrl?: string
}

export default function TestimonialCard({ quote, name, role, company, avatarUrl }: TestimonialCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="border-slate-800 bg-slate-900/50 transition-all hover:border-purple-900/50 hover:bg-slate-900">
      <CardContent className="p-6">
        <Quote className="mb-4 h-8 w-8 text-purple-400 opacity-50" />
        <p className="mb-6 text-slate-300">{quote}</p>
        <div className="flex items-center gap-4">
          <Avatar>
            {avatarUrl ? (
              <img src={avatarUrl || "/placeholder.svg"} alt={name} />
            ) : (
              <AvatarFallback className="bg-purple-900 text-purple-100">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-slate-400">
              {role}, {company}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
