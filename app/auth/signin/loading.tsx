import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading authentication...</p>
      </div>
    </div>
  )
}

