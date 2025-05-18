# Project Update: Google Gemini Integration & Prompt Generation

This document outlines the tasks required to implement the new feature allowing users to generate AI starter prompts using Google's Gemini Developer API.

## Phase 1: Planning & Design

- [ ] **Define Core Feature Scope:**
    - [ ] User can input a topic or request for a starter prompt.
    - [ ] System sends request to Gemini API.
    - [ ] System displays the generated prompt from Gemini.
    - [ ] Standalone page for this feature.
- [ ] **Research Gemini Developer API:**
    - [ ] Understand API capabilities and limitations.
    - [ ] Review API documentation for request/response formats.
    - [ ] Identify authentication mechanisms (API keys).
    - [ ] Check rate limits and pricing.
- [ ] **UI/UX Design:**
    - [ ] Design the layout for the new standalone page (`/gemini-prompt-generator`).
    - [ ] Specify a prominent headline.
    - [ ] Design the text input area for user requests.
    - [ ] Design the display area for Gemini's response.
    - [ ] Design loading state indicators.
    - [ ] Design error message display.
    - [ ] Ensure responsive design.
- [ ] **Technical Planning:**
    - [ ] Decide on data flow (client-side direct to Gemini vs. backend proxy).
        - *Note: For simplicity and to avoid exposing API keys client-side, an Astro API route or serverless function is recommended.*
    - [ ] Plan error handling strategy (API errors, network issues, etc.).
    - [ ] Outline necessary Astro components.

## Phase 2: Backend/API Integration (if using a backend proxy)

- [ ] **Set up API Route/Serverless Function:**
    - [ ] Create an Astro API route (e.g., `src/pages/api/generate-prompt.ts`) to handle requests to Gemini.
    - [ ] Implement logic to receive user input from the frontend.
- [ ] **Secure API Key Management:**
    - [ ] Store Gemini API key securely using environment variables (e.g., in `.env` file, accessed via `import.meta.env`).
    - [ ] Ensure API key is not exposed to the client-side.
- [ ] **Gemini API Interaction:**
    - [ ] Install necessary SDK or use `fetch` to call the Gemini API.
    - [ ] Construct the request payload for the Gemini API based on user input.
    - [ ] Send the request to the Gemini API.
    - [ ] Process the response from the Gemini API.
    - [ ] Implement robust error handling for API calls.
- [ ] **Define API Response for Frontend:**
    - [ ] Structure the JSON response to be sent back to the frontend (e.g., `{ success: true, prompt: "...", error: null }`).

## Phase 3: Frontend Development (Astro)

- [ ] **Create New Page:**
    - [ ] Create `src/pages/gemini-prompt-generator.astro`.
    - [ ] Add a prominent headline.
- [ ] **Develop UI Components:**
    - [ ] **UserInputForm Component (`src/components/UserInputForm.astro` or similar):**
        - [ ] Text input area for the user's request.
        - [ ] Submit button.
        - [ ] Handle form submission and state (e.g., input value, loading).
    - [ ] **AIResponseDisplay Component (`src/components/AIResponseDisplay.astro` or similar):**
        - [ ] Area to display the AI's generated prompt.
        - [ ] Handle different states (e.g., waiting for response, displaying response, showing error).
- [ ] **Client-Side Logic (in `.astro` file or a linked `.ts` file):**
    - [ ] Capture user input from the form.
    - [ ] On form submission, send a request to the API route (or directly to Gemini if not using a proxy, though not recommended).
        - [ ] Use `fetch` API for making the request.
        - [ ] Implement `client:load` or `client:idle` for interactive components if necessary.
    - [ ] Handle loading states (e.g., disable button, show spinner).
    - [ ] Display the AI's response in the designated area.
    - [ ] Display any errors returned from the API or due to network issues.
- [ ] **Styling:**
    - [ ] Apply Tailwind CSS classes for styling the page and components.
    - [ ] Ensure styles are responsive and adhere to the project's design system.
    - [ ] Use `@apply` for repeated Tailwind classes within component `<style>` tags where appropriate.

## Phase 4: Content & SEO

- [ ] **Page Content:**
    - [ ] Write clear instructional text for the user on how to use the feature.
    - [ ] Add placeholder text for the input field.
- [ ] **SEO:**
    - [ ] Add appropriate `<title>` and meta description for the new page.
    - [ ] Consider using an SEO component if one exists in the project.

## Phase 5: Testing

- [ ] **API Route Testing (if applicable):**
    - [ ] Test API route with valid and invalid inputs.
    - [ ] Mock Gemini API responses to test different scenarios (success, error).
- [ ] **Component Testing:**
    - [ ] Unit tests for individual components if complex logic is involved.
- [ ] **End-to-End (E2E) Testing:**
    - [ ] Test the full user flow: entering a request, submitting, seeing loading state, receiving and displaying a prompt.
    - [ ] Test error states (e.g., API down, invalid input).
- [ ] **Cross-Browser Testing:**
    - [ ] Verify functionality and appearance in major browsers.

## Phase 6: Deployment & Documentation

- [ ] **Environment Variables:**
    - [ ] Ensure Gemini API key is correctly configured in the deployment environment.
- [ ] **Build & Deploy:**
    - [ ] Run Astro build command.
    - [ ] Deploy to hosting platform (Netlify, Vercel, etc.).
- [ ] **Project Documentation:**
    - [ ] Update any internal project documentation regarding the new feature.
    - [ ] (This checklist serves as initial feature documentation).

## Phase 7: Post-Launch

- [ ] **Monitoring:**
    - [ ] Monitor API usage and costs.
    - [ ] Check for any runtime errors.
- [ ] **Gather User Feedback:**
    - [ ] Collect feedback for future improvements.

---

This checklist should guide us through the development process. We can tick off items as we complete them. 