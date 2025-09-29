# Brutal.AI

A local-first, Brutalist-style web UI for Ollama that focuses on creating and managing custom AI characters for chat.

[cloudflarebutton]

## Description

Brutal.AI is a visually striking, local-first web interface for Ollama, designed with a raw, Brutalist aesthetic. It empowers users to craft, manage, and chat with custom AI 'Characters', each defined by a unique name, system prompt, and a specific local Ollama model. The application runs entirely in the browser, communicating directly with the user's local Ollama instance, and persists all characters and settings using localStorage. The UI is intentionally stark, featuring large typography, high-contrast colors, hard-edged shadows, and blocky, functional components, creating a powerful and unapologetic user experience for AI experimentation.

## Key Features

-   **Local-First:** Connects directly to your local Ollama instance. No cloud dependencies, no data leaves your machine.
-   **Brutalist Design:** A stark, high-contrast, and functional UI that prioritizes content and interaction over ornamentation.
-   **Character Management:** Create, edit, and delete custom AI characters with unique personalities, system prompts, and models.
-   **Model Flexibility:** Use any model available in your local Ollama library for your characters.
-   **Persistent State:** All your characters and settings are saved directly in your browser's `localStorage`.
-   **Streaming Chat:** Get real-time, streamed responses from your local models for a fluid conversation experience.
-   **Zero Configuration Deployment:** Deployable as a static site on any platform, including Cloudflare Pages.

## Technology Stack

-   **Framework:** React (with Vite)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui
-   **State Management:** Zustand
-   **Icons:** Lucide React
-   **Animations:** Framer Motion

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

1.  **Bun:** This project uses Bun as the package manager and runtime. [Installation Guide](https://bun.sh/docs/installation).
2.  **Ollama:** You must have a running instance of Ollama on your local machine. [Download Ollama](https://ollama.com/).
3.  **Ollama Models:** Pull at least one model to use with the application (e.g., `ollama pull llama3`).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/brutal-ai.git
    cd brutal-ai
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Ollama for CORS:**
    For the web application to communicate with your local Ollama instance, you need to configure Ollama's CORS policy. Set the `OLLAMA_ORIGINS` environment variable to allow requests from the development server's origin.

    For macOS:
    ```sh
    launchctl setenv OLLAMA_ORIGINS "http://localhost:3000"
    # Restart Ollama after setting the variable
    ```
    For Linux:
    ```sh
    # Add this to your shell profile (e.g., ~/.bashrc, ~/.zshrc)
    export OLLAMA_ORIGINS="http://localhost:3000"
    # Restart your terminal and the Ollama service
    ```
    For Windows, set the environment variable in your system settings and restart Ollama.

4.  **Run the development server:**
    ```sh
    bun dev
    ```
    The application should now be running at `http://localhost:3000`.

## Usage

1.  **Set API Endpoint:** On first launch, a settings dialog will appear. Enter your local Ollama API endpoint (e.g., `http://localhost:11434`) and click "Save".
2.  **Create a Character:** Click the "Create Character" button. Fill in the character's name, a system prompt defining its personality, and select an available Ollama model from the dropdown.
3.  **Select a Character:** Your created characters will appear in the list on the left sidebar. Click on a character to start a chat session.
4.  **Chat:** Type your message in the input box at the bottom of the right panel and press Enter to chat with your selected AI character.

## Development

The core application logic is contained within the `src` directory.

-   `src/pages/HomePage.tsx`: The main component that orchestrates the entire UI.
-   `src/stores/appStore.ts`: The central Zustand store for managing all application state.
-   `src/components/`: Contains all the React components used in the application.
-   `src/lib/ollama.ts`: Handles all API communication with the Ollama instance.
-   `tailwind.config.js`: Defines the custom Brutalist theme, including colors and box shadows.

## Deployment

This project is a static web application and can be deployed to any static hosting provider.

### Deploying to Cloudflare Pages

You can deploy this application to Cloudflare Pages with a single click.

[cloudflarebutton]

**Manual Deployment Steps:**

1.  Fork this repository to your GitHub account.
2.  Log in to your Cloudflare dashboard and navigate to **Workers & Pages**.
3.  Click **Create application** > **Pages** > **Connect to Git**.
4.  Select your forked repository.
5.  In the build settings, configure the following:
    -   **Framework preset:** `Vite`
    -   **Build command:** `bun run build`
    -   **Build output directory:** `dist`
6.  Click **Save and Deploy**.

**Important:** After deploying, you must configure your local Ollama `OLLAMA_ORIGINS` environment variable to include your Cloudflare Pages URL (e.g., `https://your-project.pages.dev`) to allow API requests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.