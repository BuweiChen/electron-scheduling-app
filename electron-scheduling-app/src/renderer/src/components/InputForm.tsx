import React, { useState } from 'react'

export const InputForm: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [jsonOutput, setJsonOutput] = useState<string | null>(null) // Keep JSON as a string for editing
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await window.electronAPI.sendText(inputText)
      setJsonOutput(JSON.stringify(response, null, 2)) // Store formatted JSON string
    } catch (error) {
      console.error('Error processing text:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonOutput(e.target.value)
  }

  return (
    <div className="flex flex-row items-start justify-center min-h-screen bg-gray-50 p-4">
      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-1/2 max-w-lg p-8 bg-white shadow-lg rounded-md mr-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Enter Natural Language Input</h2>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          className="text-slate-600 w-full p-4 border border-gray-300 rounded-md resize-none mb-4"
          rows={4}
          placeholder="Enter your text here..."
        ></textarea>
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white rounded-md ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {/* Editable JSON Output */}
      <div className="w-1/2 max-w-lg p-8 bg-white shadow-lg rounded-md">
        <h3 className="text-xl font-semibold mb-4">Generated JSON:</h3>
        <textarea
          value={jsonOutput || ''}
          onChange={handleJsonChange}
          className="text-slate-600 w-full p-4 border border-gray-300 rounded-md resize-none mb-4"
          rows={16} // Adjust for desired height
          placeholder="JSON output will appear here..."
        ></textarea>
      </div>
    </div>
  )
}
