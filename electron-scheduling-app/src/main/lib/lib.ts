async function fetchLLMResponse(input: string, apiUrl: string) {
  const requestBody = {
    model: 'lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF',
    messages: [
      {
        role: 'system',
        content:
          "generate SAT-style constraints in a json format based on user's natural language description. Respond in only json"
      },
      { role: 'user', content: input }
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  }

  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error('Error fetching response from LLM')
  }

  const data = await response.json()

  // Extract the JSON content directly from the response
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('No content found in LLM response')
  }

  try {
    // Now parse the content as JSON directly
    const extractedJson = JSON.parse(content)
    return extractedJson
  } catch (err) {
    console.error('Failed to parse JSON from response content:', err)
    throw new Error('Invalid JSON format in LLM response')
  }
}

export default fetchLLMResponse
