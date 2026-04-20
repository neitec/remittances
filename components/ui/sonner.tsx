"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Loader2Icon } from "lucide-react"

const SuccessIcon = () => (
  <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(0,62,199,0.12)" }}>
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#003ec7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
)

const ErrorIcon = () => (
  <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(188,72,0,0.12)" }}>
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="#bc4800" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
)

const InfoIcon = () => (
  <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(0,62,199,0.08)" }}>
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="#003ec7" strokeWidth="1.5" />
      <path d="M6 5.5v3M6 3.5v.5" stroke="#003ec7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      gap={8}
      icons={{
        success: <SuccessIcon />,
        info: <InfoIcon />,
        error: <ErrorIcon />,
        loading: <Loader2Icon className="size-4 animate-spin" style={{ color: "#003ec7" }} />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1a1a2e",
          "--normal-border": "rgba(0,0,0,0.07)",
          "--border-radius": "14px",
          "--width": "320px",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.07)",
          backdropFilter: "blur(12px)",
          gap: "10px",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
