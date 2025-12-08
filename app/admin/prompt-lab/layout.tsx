import React from 'react'

export default function PromptLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Break out of admin layout's container (max-w-[1600px], px-6, pt-24, pb-20)
  // Use fixed positioning to fill viewport below the nav bar (h-16 = 64px)
  return (
    <div
      className="fixed top-16 left-0 right-0 bottom-0 flex flex-col bg-gray-50 z-40"
    >
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Prompt Lab</h1>
        <p className="text-sm text-gray-500">
          Test and tune LLM prompts with real LeadShop context.
        </p>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  )
}
