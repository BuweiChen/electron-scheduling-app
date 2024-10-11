import React, { useState } from 'react'

export const InputForm: React.FC = () => {
  const [inputText, setInputText] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jsonOutput, setJsonOutput] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await window.electronAPI.sendText(inputText)
      setJsonOutput(response)
    } catch (error) {
      console.error('Error processing text:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 bg-white shadow-lg rounded-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Enter Natural Language Input</h2>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          className="text-slate-400 w-full p-4 border border-gray-300 rounded-md resize-none mb-4"
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

      {jsonOutput && (
        <div className="mt-8 w-full max-w-lg bg-white p-4 shadow-lg rounded-md">
          <h3 className="text-xl font-semibold mb-4">Generated JSON:</h3>
          <pre
            className="text-slate-200 bg-gray-500 p-4 rounded-md overflow-auto max-h-64" // Added scrollable container with max height
            style={{ maxHeight: '256px' }} // Optional inline style for more precise control
          >
            {JSON.stringify(jsonOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
