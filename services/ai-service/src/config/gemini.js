const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
const modelConfig = {
  temperature: 0.7,  // Balanced creativity and accuracy
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,  // Increased for Gemini 2.5 Flash to handle longer JSON responses
};

/**
 * Get Gemini model instance
 * @param {string} modelName - Model name (default: gemini-2.5-flash)
 * @returns {Object} Gemini model instance
 */
const getModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: modelConfig
  });
};

/**
 * Generate content with Gemini
 * @param {string} prompt - The prompt to send to Gemini
 * @param {string} modelName - Model name (default: gemini-2.5-flash)
 * @returns {Promise<string>} Generated text
 */
const generateContent = async (prompt, modelName = "gemini-2.5-flash") => {
  try {
    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

/**
 * Generate structured JSON content with Gemini
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} schema - Optional JSON schema for validation
 * @returns {Promise<Object>} Parsed JSON response
 */
const generateJSON = async (prompt, schema = null) => {
  try {
    // Enhanced prompt with explicit JSON formatting instructions
    const fullPrompt = `${prompt}

CRITICAL INSTRUCTIONS FOR JSON OUTPUT:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Start directly with { and end with }
3. Use double quotes for all keys and string values
4. Ensure all numbers are valid (no NaN or Infinity)
5. Use null for missing values, not undefined
6. Include all required fields from the schema
7. Validate that the JSON is parseable before returning

Do not wrap the JSON in markdown code blocks or add any text before or after the JSON.`;
    
    const text = await generateContent(fullPrompt);
    
    // Aggressive cleanup of the response
    let cleanedText = text.trim();
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/^```json\n?/i, '');
    cleanedText = cleanedText.replace(/^```\n?/, '');
    cleanedText = cleanedText.replace(/\n?```$/,' ');
    cleanedText = cleanedText.trim();
    
    // Find the first { and last }
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON object found in response');
    }
    
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    
    // Parse JSON
    let jsonData;
    try {
      jsonData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error. Raw response:', cleanedText.substring(0, 500));
      throw new Error(`Invalid JSON from Gemini: ${parseError.message}`);
    }
    
    // Optional: Validate against schema if provided
    if (schema && typeof schema.validate === 'function') {
      const validation = schema.validate(jsonData);
      if (!validation.valid) {
        console.warn('AI response validation warnings:', validation.errors);
        // Don't throw error, just warn - AI might have valid data in different format
      }
    }
    
    return jsonData;
  } catch (error) {
    console.error('Failed to parse JSON from Gemini:', error);
    throw new Error(`Failed to generate valid JSON: ${error.message}`);
  }
};

module.exports = {
  getModel,
  generateContent,
  generateJSON
};
