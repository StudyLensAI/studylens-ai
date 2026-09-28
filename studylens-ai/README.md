# StudyLens AI

AI-powered Chrome extension for question solving and explanation.

## Features
- Solve a question using AI
- Explain the answer
- Highlight any text on a webpage and open it in the StudyLens side panel
- Chrome Side Panel UI
- Node.js/Express backend
- API key kept on the backend

## Requirements
- Node.js 18+
- Google Chrome
- An AI API key compatible with the OpenAI Chat Completions API format

## 1. Configure the backend

Open `backend/.env.example`, copy it to `backend/.env`, and set:

AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=your_model_name
PORT=5000

If you use another provider with an OpenAI-compatible API, change `AI_BASE_URL` and `AI_MODEL`.

## 2. Install and run backend

Open a terminal in `backend`:

    npm install
    npm run dev

The API runs on http://localhost:5000

## 3. Build the extension

Open another terminal in `extension`:

    npm install
    npm run build

This creates `extension/dist`.

## 4. Load in Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. Pin StudyLens AI
6. Open the extension side panel

## 5. Use it

- Type/paste a question in the extension and click Solve & Explain.
- Select text on any webpage, right-click, and choose "Explain with StudyLens".
- The selected text is sent to the side panel.

## Project structure

extension/  -> Chrome extension
backend/    -> AI API server

## Note

For a college demonstration, localhost is sufficient. Do not put your AI API key inside the extension.
