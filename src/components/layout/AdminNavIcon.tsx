interface Props {
  className?: string
}

/** User silhouette + gear — admin / settings persona */
export function AdminNavIcon({ className = 'w-5 h-5' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M5 20v-1a5 5 0 0 1 5-5h0" />
      <circle cx="17.5" cy="16.5" r="2.5" />
      <path d="M17.5 13.8v.7M17.5 18.5v.7M20.2 16.5h.7M14.8 16.5h.7M19.4 14.6l.5-.5M15.1 18.4l.5-.5M19.4 18.4l-.5-.5M15.1 14.6l-.5-.5" />
    </svg>
  )
}
