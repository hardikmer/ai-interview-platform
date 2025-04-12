import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 transition-all hover:border-purple-900/50 hover:bg-slate-900">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="mb-4 rounded-full bg-purple-900/20 p-3">{icon}</div>
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-slate-300">{description}</p>
      </CardContent>
    </Card>
  )
}
