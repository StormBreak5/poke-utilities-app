import type React from "react"
export function PokeballIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="none" />
      <path d="M5,50 h90" />
      <circle cx="50" cy="50" r="15" fill="none" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  )
}

