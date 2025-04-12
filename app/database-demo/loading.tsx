import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">MystHire Database Demo</h1>
        <p className="text-xl text-gray-600">Loading data from our Neon PostgreSQL database...</p>
      </div>

      {/* Users section skeleton */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Users in Database</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Mysteries section skeleton */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Mysteries in Database</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="h-2 w-full bg-gray-200" />
                <div className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex flex-wrap gap-2">
                    {Array(3)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-6 w-16" />
                      ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Jobs section skeleton */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Job Postings in Database</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-16 w-full" />
                <div className="flex flex-wrap gap-2">
                  {Array(4)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array(4)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                </div>
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
