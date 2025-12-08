'use client'

import React, { useState, useEffect } from 'react'

// Types matching API
interface ContextResponse {
  manifest_a: any[]
  manifest_b: any
}

interface ReadabilityMetrics {
  flesch_score: number
  grade_level: string
  target_range: number[]
  in_range: boolean
}

interface TestResponse {
  output: string
  cost_cents: number
  latency_ms: number
  error?: string
  readability?: ReadabilityMetrics
}

interface PromptTemplate {
  id?: string
  name: string
  description?: string
  system_prompt: string
  user_template: string
}

interface TestLaneConfig {
  id: string
  model: string
  systemPrompt: string
  userPrompt: string
  promptName?: string
  result?: TestResponse
  isLoading: boolean
}

interface Scenario {
  id: string
  name: string
  description?: string
  lead_id: string
  run_id: string
  context_json: string
  lanes: TestLaneConfig[]
  created_at: string
}

const DEFAULT_SYSTEM_PROMPT = 'You are an expert web analyst.'
const DEFAULT_USER_PROMPT = 'Analyze this context: {{INPUT_DATA}}'

export default function PromptLabPage() {
  // Context State
  const [leadId, setLeadId] = useState<string>('')
  const [runId, setRunId] = useState<string>('')
  const [availableRuns, setAvailableRuns] = useState<string[]>([])
  const [context, setContext] = useState<ContextResponse | null>(null)
  const [contextJson, setContextJson] = useState<string>('')
  const [isLoadingContext, setIsLoadingContext] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])

  // Lanes State
  const [lanes, setLanes] = useState<TestLaneConfig[]>([
    {
      id: 'lane-1',
      model: 'gpt-4o',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userPrompt: DEFAULT_USER_PROMPT,
      isLoading: false,
    },
  ])

  // Library State
  const [savedPrompts, setSavedPrompts] = useState<PromptTemplate[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [promptToSave, setPromptToSave] = useState<{
    name: string
    description: string
    system: string
    user: string
  } | null>(null)

  // Scenario State
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [showScenarioSaveDialog, setShowScenarioSaveDialog] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('')

  // Fetch prompts & scenarios on mount
  useEffect(() => {
    fetchPrompts()
    fetchScenarios()
  }, [])

  // Fetch runs and models when leadId changes
  useEffect(() => {
    if (leadId) {
      fetchRuns()
    } else {
      setAvailableRuns([])
    }
    fetchModels()
  }, [leadId])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/prompt-lab/models')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setAvailableModels([])
    }
  }

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompt-lab/prompts')
      if (res.ok) {
        const data = await res.json()
        setSavedPrompts(data)
      }
    } catch (e) {
      console.error('Failed to fetch prompts', e)
    }
  }

  const fetchRuns = async () => {
    console.log('Fetching runs for lead:', leadId)
    try {
      const res = await fetch(`/api/prompt-lab/runs/${leadId}`)
      console.log('Fetch response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched runs data:', data)
        setAvailableRuns(data)
        if (data.length > 0 && !runId) {
          setRunId(data[0])
        }
      } else {
        console.error('Fetch runs failed:', res.statusText)
      }
    } catch (e) {
      console.error('Failed to fetch runs', e)
    }
  }

  const loadContext = async () => {
    if (!leadId || !runId) return
    setIsLoadingContext(true)
    setContextError(null)
    try {
      const res = await fetch(`/api/prompt-lab/context/${leadId}/${runId}`)
      if (!res.ok) throw new Error('Failed to load context')
      const data = await res.json()
      setContext(data)
      setContextJson(JSON.stringify(data.manifest_b, null, 2))
    } catch (e: any) {
      setContextError(e.message)
    } finally {
      setIsLoadingContext(false)
    }
  }

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/prompt-lab/scenarios')
      if (response.ok) {
        const data = await response.json()
        setScenarios(data)
      }
    } catch (error) {
      console.error('Failed to fetch scenarios:', error)
    }
  }

  const handleSaveScenario = async () => {
    if (!scenarioName) return

    const scenarioData = {
      name: scenarioName,
      lead_id: leadId,
      run_id: runId,
      context_json: contextJson,
      lanes: lanes.map((lane) => ({
        id: lane.id,
        model: lane.model,
        systemPrompt: lane.systemPrompt,
        userPrompt: lane.userPrompt,
        promptName: lane.promptName,
      })),
    }

    try {
      const response = await fetch('/api/prompt-lab/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData),
      })

      if (response.ok) {
        setShowScenarioSaveDialog(false)
        setScenarioName('')
        fetchScenarios()
        alert('Scenario saved successfully!')
      } else {
        alert('Failed to save scenario')
      }
    } catch (error) {
      console.error('Failed to save scenario:', error)
      alert('Error saving scenario')
    }
  }

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return

    setLeadId(scenario.lead_id)
    setRunId(scenario.run_id)
    setContextJson(scenario.context_json)

    // Restore lanes
    setLanes(
      scenario.lanes.map((lane) => ({
        ...lane,
        isLoading: false,
        result: undefined,
      }))
    )

    setSelectedScenarioId(scenarioId)
  }

  const updateLane = (id: string, updates: Partial<TestLaneConfig>) => {
    setLanes((prev) =>
      prev.map((lane) => (lane.id === id ? { ...lane, ...updates } : lane))
    )
  }

  const runTest = async (laneId: string) => {
    const lane = lanes.find((l) => l.id === laneId)
    if (!lane) return

    // Parse context from JSON
    let contextData
    try {
      contextData = JSON.parse(contextJson || '{}')
    } catch (e) {
      alert('Invalid JSON in Context field')
      return
    }

    updateLane(laneId, { isLoading: true, result: undefined })

    try {
      const res = await fetch('/api/prompt-lab/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: parseInt(leadId) || 0,
          run_id: runId || 'manual',
          model: lane.model,
          system_prompt: lane.systemPrompt,
          user_prompt: lane.userPrompt,
          context: contextData,
        }),
      })

      const data = await res.json()
      updateLane(laneId, { isLoading: false, result: data })
    } catch (e: any) {
      updateLane(laneId, {
        isLoading: false,
        result: {
          output: '',
          cost_cents: 0,
          latency_ms: 0,
          error: e.message,
        },
      })
    }
  }

  const runAllTests = async () => {
    try {
      try {
        JSON.parse(contextJson || '{}')
      } catch (e) {
        alert('Invalid JSON in Context field')
        return
      }
      await Promise.all(lanes.map((lane) => runTest(lane.id)))
    } catch (e) {
      console.error('Failed to run all tests', e)
    }
  }

  const extractNarrativeSegments = (raw: string | null | undefined) => {
    if (!raw) return null

    let text = raw.trim()

    if (text.startsWith('```')) {
      const fenceMatch = text.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)```$/)
      if (fenceMatch) {
        text = fenceMatch[1]
      }
    }

    try {
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null
      }

      const segments: Record<
        string,
        { text: string; character_count: number }
      > = {}

      const walk = (value: any, path: string) => {
        if (typeof value === 'string') {
          segments[path] = {
            text: value,
            character_count: value.length,
          }
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            walk(item, `${path}[${index}]`)
          })
        } else if (value && typeof value === 'object') {
          Object.entries(value as Record<string, any>).forEach(
            ([key, child]) => {
              const childPath = path ? `${path}.${key}` : key
              walk(child, childPath)
            }
          )
        }
      }

      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        walk(value, key)
      })

      return segments
    } catch {
      return null
    }
  }

  const copyAllResults = () => {
    const payload = lanes.map((lane, index) => {
      const result = lane.result
      const promptName = lane.promptName || 'Custom Prompt'

      if (!result) {
        return {
          index: index + 1,
          model: lane.model,
          prompt: promptName,
          narrative: null,
          error: 'No result',
          readability: null,
          character_count: null,
          segments: null,
        }
      }

      const narrative = result.output || ''
      const segments = extractNarrativeSegments(narrative)

      return {
        index: index + 1,
        model: lane.model,
        prompt: promptName,
        narrative: narrative || null,
        error: result.error || null,
        readability: result.readability || null,
        character_count: narrative.length,
        segments,
      }
    })

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
  }

  const addLane = () => {
    setLanes((prev) => [
      ...prev,
      {
        id: `lane-${Date.now()}`,
        model: 'gpt-4o',
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        userPrompt: DEFAULT_USER_PROMPT,
        isLoading: false,
      },
    ])
  }

  const removeLane = (id: string) => {
    setLanes((prev) => prev.filter((l) => l.id !== id))
  }

  const handleSavePrompt = async () => {
    if (!promptToSave) return
    try {
      const res = await fetch('/api/prompt-lab/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: promptToSave.name,
          description: promptToSave.description,
          system_prompt: promptToSave.system,
          user_template: promptToSave.user,
        }),
      })
      if (res.ok) {
        setShowSaveDialog(false)
        setPromptToSave(null)
        fetchPrompts()
      }
    } catch (e) {
      console.error('Failed to save prompt', e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar - Sticky action bar */}
      <div className="flex-shrink-0 overflow-x-auto border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-max px-4 py-3">
          {/* Lead ID */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Lead ID:
            </label>
            <input
              type="text"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="border rounded px-2 py-1 w-24 text-gray-900 bg-white"
              placeholder="e.g. 3093"
            />
          </div>

          {/* Run ID */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Run ID:</label>
            <select
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              className="border rounded px-2 py-1 w-64 text-gray-900 bg-white"
              disabled={availableRuns.length === 0}
            >
              <option value="">Select Run...</option>
              {availableRuns.map((run) => (
                <option key={run} value={run}>
                  {run}
                </option>
              ))}
            </select>
            <button
              onClick={fetchRuns}
              className="text-gray-500 hover:text-blue-600"
              title="Refresh Runs"
            >
              ↻
            </button>
          </div>

          {/* Load Context */}
          <button
            onClick={loadContext}
            disabled={isLoadingContext || !runId}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoadingContext ? 'Loading...' : 'Load Context'}
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* Run All Tests */}
          <button
            onClick={runAllTests}
            disabled={lanes.some((l) => l.isLoading)}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Run All Tests
          </button>

          {/* Right-side controls: scenario + copy */}
          <div className="flex items-center gap-4 ml-auto">
            <select
              className="border rounded p-2 text-gray-900"
              value={selectedScenarioId}
              onChange={(e) => handleLoadScenario(e.target.value)}
            >
              <option value="">Load Scenario...</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({new Date(s.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowScenarioSaveDialog(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Scenario
            </button>
            <button
              onClick={copyAllResults}
              disabled={lanes.every((l) => !l.result)}
              className="bg-gray-100 text-gray-700 px-4 py-1 rounded hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
            >
              Copy All Results
            </button>
          </div>

          {contextError && (
            <span className="text-red-500 text-sm ml-4">{contextError}</span>
          )}
        </div>
      </div>

      {/* Main Content: Lanes */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-4 flex gap-4">
        {/* Context Viewer (Always Visible & Editable) */}
        <div className="w-80 flex-shrink-0 bg-white border rounded-lg shadow-sm flex flex-col h-full">
          <div className="flex-shrink-0 p-3 border-b bg-gray-50 font-medium text-sm flex justify-between items-center">
            <span>Context Data (JSON)</span>
            <button
              onClick={() => setContextJson('')}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <textarea
              value={contextJson}
              onChange={(e) => setContextJson(e.target.value)}
              className="w-full h-full p-2 text-xs font-mono bg-gray-50 text-gray-900 resize-none outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="Paste JSON context here..."
            />
          </div>
        </div>

        {/* Test Lanes */}
        {lanes.map((lane) => (
          <div
            key={lane.id}
            className="w-[500px] flex-shrink-0 bg-white border rounded-lg shadow-sm flex flex-col h-full overflow-hidden"
          >
            {/* Lane Header */}
            <div className="flex-shrink-0 p-3 border-b bg-gray-50 flex justify-between items-center pr-14">
              <div className="flex items-center gap-2">
                <select
                  value={lane.model}
                  onChange={(e) =>
                    updateLane(lane.id, { model: e.target.value })
                  }
                  className="border rounded px-2 py-1 text-sm text-gray-900 bg-white"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm max-w-[150px] text-gray-900 bg-white"
                  onChange={(e) => {
                    const template = savedPrompts.find(
                      (p) => p.id === e.target.value
                    )
                    if (template) {
                      updateLane(lane.id, {
                        systemPrompt: template.system_prompt,
                        userPrompt: template.user_template,
                        promptName: template.name,
                      })
                    }
                  }}
                >
                  <option value="">Load Prompt...</option>
                  {savedPrompts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    setPromptToSave({
                      name: '',
                      description: '',
                      system: lane.systemPrompt,
                      user: lane.userPrompt,
                    })
                    setShowSaveDialog(true)
                  }}
                  className="text-gray-500 hover:text-blue-600 p-1"
                  title="Save Prompt"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </button>
                <button
                  onClick={() => removeLane(lane.id)}
                  className="text-gray-400 hover:text-red-500 p-1 ml-2"
                  title="Remove Lane"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto border-b min-h-0">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  System Prompt
                </label>
                <textarea
                  value={lane.systemPrompt}
                  onChange={(e) =>
                    updateLane(lane.id, { systemPrompt: e.target.value })
                  }
                  className="w-full h-24 border rounded p-2 text-sm font-mono resize-none focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-gray-500 uppercase">
                  User Prompt
                </label>
                <textarea
                  value={lane.userPrompt}
                  onChange={(e) =>
                    updateLane(lane.id, { userPrompt: e.target.value })
                  }
                  className="w-full flex-1 min-h-[150px] border rounded p-2 text-sm font-mono resize-none focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Actions & Results */}
            <div className="flex-shrink-0 p-3 bg-gray-50 max-h-64 overflow-y-auto">
              {/* Individual Run Button Removed per User Request */}

              {lane.result && (
                <div className="bg-white border rounded p-3 relative group">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(lane.result?.output || '')
                    }
                    className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Copy to clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Latency: {lane.result.latency_ms}ms</span>
                    <span>Chars: {(lane.result.output || '').length}</span>
                  </div>
                  {lane.result.readability && (
                    <div className="text-xs text-gray-600 mb-2">
                      <span>
                        Readability: {lane.result.readability.flesch_score} (
                        {lane.result.readability.grade_level})
                      </span>
                      <span className="ml-2">
                        Target {lane.result.readability.target_range[0]}–
                        {lane.result.readability.target_range[1]}{' '}
                        {lane.result.readability.in_range
                          ? '(in range)'
                          : '(out of range)'}
                      </span>
                    </div>
                  )}
                  {lane.result.error ? (
                    <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded">
                      ERROR: {lane.result.error}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                      {lane.result.output || 'No output returned (check logs)'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Lane Button */}
        <button
          onClick={addLane}
          className="w-12 h-full flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          +
        </button>
      </div>

      {/* Save Prompt Dialog */}
      {showSaveDialog && promptToSave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Save Prompt Template
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={promptToSave.name}
                  onChange={(e) =>
                    setPromptToSave({ ...promptToSave, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                  placeholder="e.g. V1 - Aggressive Tone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={promptToSave.description}
                  onChange={(e) =>
                    setPromptToSave({
                      ...promptToSave,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrompt}
                  disabled={!promptToSave.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
