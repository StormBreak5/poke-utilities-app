import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-8 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading items...</span>
    </div>
  )
}

