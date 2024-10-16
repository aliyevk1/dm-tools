// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {GoogleGenerativeAI} = require("@google/generative-ai");
// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
require('dotenv').config();

initializeApp();

// Google Generative AI configuration
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Make sure to set your Google API key in environment variables
const models = [
  genAI.getGenerativeModel({model: "gemini-1.5-pro-latest"}),
  genAI.getGenerativeModel({model: "gemini-1.5-flash"})
];

// List of valid types
const validTypes = ["tavern", "store", "npc", "name", "note"];

// System Prompts from environment variables
const systemPrompts = {
  tavern: process.env.TAVERN_PROMPT,
  store: process.env.STORE_PROMPT,
  npc: process.env.NPC_PROMPT,
  name: process.env.NAME_PROMPT,
  note: process.env.NOTE_PROMPT,
};

exports.generateContent = onRequest({cors: true}, async (req, res) => {
  try {
    const type = req.params[0]; // Extract the type from the URL

    // Validate the type parameter
    if (!validTypes.includes(type)) {
      return res.status(400).send({error: "Invalid type. Valid types are: tavern, store, npc, name, note."});
    }

    // Get the corresponding system prompt
    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) {
      return res.status(500).send({error: "System prompt for the specified type is not configured."});
    }

    // Validate the request body
    const {prompt} = req.body;
    if (!prompt) {
      return res.status(400).send({error: "Request body must contain a 'prompt' field."});
    }

    // Combine system prompt with user prompt and add instruction to return JSON
    const fullPrompt = `${systemPrompt}\nUser Prompt: ${prompt}\nPlease return the output in JSON format that matches the given interface.`;

    let generatedText = null;

    // Attempt to use each model in sequence if one fails
    for (const model of models) {
      try {
        const result = await model.generateContent(fullPrompt);
        generatedText = result.response.text();
        break; // Exit loop if successful
      } catch (modelError) {
        logger.warn(`Model failed: ${modelError}`);
        // Continue to try the next model
      }
    }

    // If no model succeeded, return an error
    if (!generatedText) {
      return res.status(500).send({error: "All models are currently under load. Please try again later."});
    }

    // Clean the generated text to remove non-JSON parts (e.g., leading/trailing backticks)
    generatedText = sanitizeGeneratedText(generatedText);

    // Try to parse the cleaned text as JSON
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(generatedText);
    } catch (parseError) {
      logger.error("Failed to parse generated text as JSON: ", parseError);
      return res.status(500).send({error: "Failed to parse generated response as JSON."});
    }

    // Send the response back to the user
    res.status(200).send(jsonResponse);
  } catch (error) {
    logger.error("Error generating content: ", error);
    res.status(500).send({error: "Internal Server Error."});
  }
});

/**
 * Sanitize the generated text to ensure it is valid JSON.
 * Removes any characters before and after the JSON content, such as backticks.
 *
 * @param {string} text - The text to sanitize.
 * @return {string} Sanitized JSON string.
 */
function sanitizeGeneratedText(text) {
  // Remove leading/trailing ``` or any language identifiers and whitespace
  let sanitized = text.replace(/^```[a-zA-Z]*|```$/g, "").trim();

  // Extract the first occurrence of valid JSON using a regex pattern
  const jsonMatch = sanitized.match(/\{.*\}|\[.*\]/s);
  if (jsonMatch) {
    sanitized = jsonMatch[0];
  }

  return sanitized;
}
