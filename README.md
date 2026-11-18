# Flash Chatbot

## Run locally

1. Install Node.js 18 or newer.
2. From this folder, install dependencies:

   ```powershell
   npm install
   ```

3. Create a `.env` file in this folder and add your Gemini API key:

   ```text
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the server and open `http://localhost:3000`:

   ```powershell
   npm start
   ```

The API key stays on the server and must not be added to source control. The chatbot uses the `gemini-3.1-flash-lite` model.