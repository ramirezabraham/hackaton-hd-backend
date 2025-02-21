This project is a full-stack application consisting of a backend built with FastAPI and a frontend built with React and Vite. The backend provides an AI assistant service using Azure OpenAI, while the frontend offers a user interface to interact with the assistant.

### Backend

-   **Framework**: FastAPI
-   **Dependencies**: Includes packages like `fastapi`, `uvicorn`, `requests`, `openai`, and more.
-   **Functionality**: Handles user queries, interacts with Azure OpenAI for generating responses, and provides endpoints for the frontend to communicate with.
-   **Environment Variables**: Uses `.env` files to manage sensitive information like API keys.

### Frontend

-   **Framework**: React with TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Dependencies**: Includes packages like `react`, `react-dom`, `lucide-react`, `marked`, and more.
-   **Functionality**: Provides a chat interface for users to interact with the AI assistant, displays messages, and handles user input.

### Key Files

-   **Backend**:

    -   `main.py`: Defines the FastAPI application and endpoints.
    -   `agents.py`: Contains functions to interact with Azure OpenAI and other APIs.
    -   `requirements.txt`: Lists the Python dependencies.
    -   `.env`: Stores environment variables (not included in version control).
-   **Frontend**:

    -   `vite.config.ts`: Configuration for Vite.
    -   `tsconfig.json`: TypeScript configuration.
    -   `tailwind.config.js`: Configuration for Tailwind CSS.
    -   `src/main.tsx`: Entry point for the React application.
    -   `src/App.tsx`: Main component for the chat interface.
    -   `package.json`: Lists the JavaScript dependencies and scripts.