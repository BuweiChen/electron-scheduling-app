import React, { useState } from 'react'

export const InputForm: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [jsonOutput, setJsonOutput] = useState<string | null>(null) // Keep JSON as a string for editing
  const [loading, setLoading] = useState(false)
  const [dbLoading, setDbLoading] = useState(false) // For database operations

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await window.electronAPI.sendText(inputText, jsonOutput)
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

  const handleSave = async () => {
    if (!jsonOutput) {
      alert('No JSON data to save!')
      return
    }
    setDbLoading(true)
    try {
      await window.electronAPI.resetDB() // Clear the collection
      await window.electronAPI.saveDB(jsonOutput) // Save new JSON
      alert('JSON saved to MongoDB!')
    } catch (error) {
      console.error('Error saving to MongoDB:', error)
    } finally {
      setDbLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the MongoDB collection?')) return
    setDbLoading(true)
    try {
      await window.electronAPI.resetDB()
      alert('MongoDB collection reset successfully!')
    } catch (error) {
      console.error('Error resetting MongoDB:', error)
    } finally {
      setJsonOutput(null)
      setDbLoading(false)
    }
  }

  const handleLoad = async () => {
    setDbLoading(true)
    try {
      const data = await window.electronAPI.fetchDB() // Assuming fetchDB is implemented
      if (data) {
        setJsonOutput(JSON.stringify(data, null, 2)) // Format JSON for readability
        alert('Data loaded from MongoDB!')
      } else {
        alert('No data found in MongoDB.')
      }
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error)
    } finally {
      setDbLoading(false)
    }
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
          rows={16}
          placeholder="JSON output will appear here..."
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleSave}
            className={`py-2 px-4 text-white rounded-md ${
              dbLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={dbLoading}
          >
            {'Save'}
          </button>
          <button
            onClick={handleReset}
            className={`py-2 px-4 text-white rounded-md ${
              dbLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
            disabled={dbLoading}
          >
            {'Reset'}
          </button>
          <button
            onClick={handleLoad}
            className={`py-2 px-4 text-white rounded-md ${
              dbLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
            disabled={dbLoading}
          >
            {'Load'}
          </button>
        </div>
      </div>
    </div>
  )
}
