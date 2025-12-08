import React from 'react'

export default function PromptLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Prompt Lab</h1>
        <p className="text-sm text-gray-500">
          Test and tune LLM prompts with real LeadShop context.
        </p>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
