"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Clock, ArrowRight, Loader2 } from "lucide-react"
import { useMysteries } from "@/lib/mysteries"
import ProtectedRoute from "@/components/protected-route"

export default function MysteriesPage() {
  const { mysteries, isLoading, error, fetchMysteries } = useMysteries()
  const [activeTab, setActiveTab] = useState("all")
  const [filteredMysteries, setFilteredMysteries] = useState([])

  useEffect(() => {
    console.log("Mysteries page mounted, fetching mysteries...")
    fetchMysteries()
  }, [fetchMysteries])

  useEffect(() => {
    if (mysteries.length > 0) {
      console.log(`Filtering mysteries by tab: ${activeTab}`)
      if (activeTab === "all") {
        setFilteredMysteries(mysteries)
      } else {
        setFilteredMysteries(mysteries.filter((mystery) => mystery.category === activeTab))
      }
    }
  }, [mysteries, activeTab])

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Mystery Challenges</h1>
          <p className="text-slate-400 mt-2">
            Solve technical mysteries to showcase your skills and earn points to boost your profile.
          </p>
        </div>

        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="devops">DevOps</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Error loading mysteries: {error}</p>
                <Button onClick={() => fetchMysteries()}>Try Again</Button>
              </div>
            ) : filteredMysteries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No mysteries found in this category.</p>
                <Button onClick={() => setActiveTab("all")}>View All Mysteries</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMysteries.map((mystery) => (
                  <Card
                    key={mystery.id}
                    className="border-slate-800 bg-slate-900/50 overflow-hidden transition-all hover:border-slate-700"
                  >
                    <div
                      className="h-3"
                      style={{
                        background: mystery.gradient || "linear-gradient(to right, #6366f1, #8b5cf6)",
                      }}
                    />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge className={mystery.badge_color || mystery.badgeColor || "bg-purple-600"}>
                          {mystery.category.charAt(0).toUpperCase() + mystery.category.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{mystery.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="mt-2">{mystery.title}</CardTitle>
                      <CardDescription>{mystery.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {mystery.skills?.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-slate-800/50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{mystery.duration}</span>
                      </div>
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <Link href={`/mysteries/${mystery.id}`}>
                          Start Challenge
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
