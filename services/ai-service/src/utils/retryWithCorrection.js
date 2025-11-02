/**
 * Retry Gemini API call with correction based on validation errors
 * This utility helps fix invalid AI responses by asking Gemini to correct them
 */

const { generateJSON } = require('../config/gemini');

/**
 * Create a correction prompt based on validation errors
 * @param {string} originalPrompt - Original prompt sent to Gemini
 * @param {Object} invalidResponse - The invalid response from Gemini
 * @param {Array} validationErrors - Array of validation errors
 * @param {Array} validationWarnings - Array of validation warnings
 * @returns {string} Correction prompt
 */
const createCorrectionPrompt = (originalPrompt, invalidResponse, validationErrors, validationWarnings) => {
  return `You previously provided a response that had validation errors. Please correct it.

ORIGINAL REQUEST:
${originalPrompt}

YOUR PREVIOUS RESPONSE HAD THESE ERRORS:
${validationErrors.map((err, idx) => `${idx + 1}. ${err}`).join('\n')}

${validationWarnings.length > 0 ? `
WARNINGS (optional to fix):
${validationWarnings.map((warn, idx) => `${idx + 1}. ${warn}`).join('\n')}
` : ''}

PREVIOUS RESPONSE (with errors):
${JSON.stringify(invalidResponse, null, 2)}

Please provide a CORRECTED response that:
1. Fixes all the validation errors listed above
2. Includes all missing required fields
3. Ensures all scores are numbers between 0 and 5
4. Maintains all other data from your previous response
5. Returns ONLY valid JSON without markdown formatting

Return the corrected JSON now:`;
};

/**
 * Retry Gemini call with correction
 * @param {string} originalPrompt - Original prompt
 * @param {Object} invalidResponse - Invalid response from first attempt
 * @param {Object} validation - Validation result with errors and warnings
 * @param {Function} validateFn - Validation function to check corrected response
 * @param {Function} sanitizeFn - Sanitization function
 * @returns {Promise<Object>} Corrected response or throws error
 */
const retryWithCorrection = async (originalPrompt, invalidResponse, validation, validateFn, sanitizeFn) => {
  try {
    console.log('🔄 Attempting to correct invalid AI response...');
    console.log('Validation errors:', validation.errors);
    console.log('Validation warnings:', validation.warnings);

    // Create correction prompt
    const correctionPrompt = createCorrectionPrompt(
      originalPrompt,
      invalidResponse,
      validation.errors,
      validation.warnings
    );

    // Call Gemini again with correction request
    let correctedResponse = await generateJSON(correctionPrompt);

    // Sanitize the corrected response
    if (sanitizeFn) {
      correctedResponse = sanitizeFn(correctedResponse);
    }

    // Validate the corrected response
    const correctedValidation = validateFn(correctedResponse);

    if (correctedValidation.valid) {
      console.log('✅ Correction successful! Response is now valid.');
      if (correctedValidation.warnings.length > 0) {
        console.warn('⚠️ Correction warnings:', correctedValidation.warnings);
      }
      return {
        success: true,
        data: correctedResponse,
        corrected: true,
        attempts: 2
      };
    } else {
      console.error('❌ Correction failed. Still has errors:', correctedValidation.errors);
      return {
        success: false,
        error: 'AI correction failed',
        validationErrors: correctedValidation.errors,
        attempts: 2
      };
    }
  } catch (error) {
    console.error('❌ Retry with correction failed:', error);
    return {
      success: false,
      error: 'Correction attempt failed',
      message: error.message,
      attempts: 2
    };
  }
};

/**
 * Generate with automatic retry on validation failure
 * @param {string} prompt - Prompt for Gemini
 * @param {Function} validateFn - Validation function
 * @param {Function} sanitizeFn - Sanitization function
 * @param {number} maxAttempts - Maximum retry attempts (default: 2)
 * @returns {Promise<Object>} Valid response or error
 */
const generateWithRetry = async (prompt, validateFn, sanitizeFn, maxAttempts = 2) => {
  let attempts = 0;
  let lastResponse = null;
  let lastValidation = null;

  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      console.log(`🎯 Attempt ${attempts}/${maxAttempts}: Calling Gemini API...`);

      // Generate response
      let response;
      if (attempts === 1) {
        response = await generateJSON(prompt);
      } else {
        // Retry with correction prompt only if we have validation errors from previous attempt
        if (lastValidation && lastValidation.errors && lastValidation.errors.length > 0) {
          response = await generateJSON(
            createCorrectionPrompt(prompt, lastResponse, lastValidation.errors, lastValidation.warnings || [])
          );
        } else {
          // If no validation errors but still failed (e.g., JSON parse error), retry with original prompt but emphasize JSON format
          const retryPrompt = `${prompt}

IMPORTANT: Your previous response was incomplete or invalid JSON. Please ensure:
1. The JSON is complete and well-formed
2. All fields are included
3. The response is not truncated
4. Return ONLY valid JSON without any markdown formatting`;
          response = await generateJSON(retryPrompt);
        }
      }

      // Sanitize
      if (sanitizeFn) {
        response = sanitizeFn(response);
      }

      // Validate
      const validation = validateFn(response);

      if (validation.valid) {
        console.log(`✅ Success on attempt ${attempts}`);
        if (validation.warnings.length > 0) {
          console.warn('⚠️ Warnings:', validation.warnings);
        }
        return {
          success: true,
          data: response,
          attempts,
          warnings: validation.warnings
        };
      }

      // Store for potential retry
      lastResponse = response;
      lastValidation = validation;

      console.warn(`⚠️ Attempt ${attempts} failed validation:`, validation.errors);

      if (attempts >= maxAttempts) {
        // Final attempt failed
        return {
          success: false,
          error: 'Failed to generate valid response after retries',
          validationErrors: validation.errors,
          attempts
        };
      }

      // Continue to retry
      console.log(`🔄 Retrying with correction (attempt ${attempts + 1}/${maxAttempts})...`);

    } catch (error) {
      console.error(`❌ Attempt ${attempts} error:`, error.message);
      
      // Store error info for retry if we don't have validation errors yet
      if (!lastValidation) {
        lastResponse = null;
        lastValidation = {
          valid: false,
          errors: [`JSON parsing failed: ${error.message}`],
          warnings: []
        };
      }
      
      if (attempts >= maxAttempts) {
        return {
          success: false,
          error: 'Gemini API error',
          message: error.message,
          attempts
        };
      }
    }
  }

  return {
    success: false,
    error: 'Max attempts reached',
    attempts
  };
};

module.exports = {
  retryWithCorrection,
  generateWithRetry,
  createCorrectionPrompt
};
