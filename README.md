# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Browser extension CSP warnings

While testing in a regular browser session you may notice console warnings about blocked requests to `infragrid.v.network` or attempts to compile WebAssembly via injected scripts. These messages come from browser extensions and are intentionally blocked by the app's Content Security Policy. They do not indicate an issue with the Nexus Support Hub application itself.
