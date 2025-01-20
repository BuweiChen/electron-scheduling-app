import fs from 'fs/promises'

async function fetchLLMResponse(input: string, apiUrl: string) {
  // Read the schema from schema.txt
  let schemaContent: string
  try {
    schemaContent = await fs.readFile('schema.txt', 'utf-8')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Error reading schema file: ' + error.message)
    } else {
      throw new Error('Unknown error reading schema file')
    }
  }

  // System prompt with schema dynamically included
  const systemPrompt = `
    You are an AI that generates SAT-style constraints in a JSON format based on the user's natural language description.
    Use the following schema as a guide for your JSON responses:
    ${schemaContent}
    Strictly following the schema. Infer unfilled fields. Output must be valid JSON. Output only the JSON and nothing else.
  `

  const requestBody = {
    model: 'lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      { role: 'user', content: input }
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  }

  const response = await fetch(apiUrl, {
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
    // Parse the content as JSON directly
    const extractedJson = JSON.parse(content)
    return extractedJson
  } catch (err) {
    console.error('Failed to parse JSON from response content:', err)
    throw new Error('Invalid JSON format in LLM response')
  }
}

export default fetchLLMResponse
