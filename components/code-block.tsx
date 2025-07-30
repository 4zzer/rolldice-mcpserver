"use client"

import { CopyButton } from "./copy-button"

interface CodeBlockProps {
  children: string
  language?: string
  title?: string
}

export function CodeBlock({ children, language = "bash", title }: CodeBlockProps) {
  return (
    <div className="relative">
      {title && (
        <div className="flex items-center justify-between bg-muted px-4 py-2 text-sm font-mono border rounded-t-lg border-b-0">
          <span className="text-muted-foreground">{title}</span>
        </div>
      )}
      <div className="relative">
        <pre className={`p-4 bg-muted rounded-lg overflow-x-auto text-sm ${title ? 'rounded-t-none' : ''}`}>
          <code className={`language-${language}`}>{children}</code>
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={children} />
        </div>
      </div>
    </div>
  )
}
