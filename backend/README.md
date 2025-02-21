# hackaton-hd-backend

## Requirements

- Python 3.9 or higher
- pip (Python package installer)

## Setup

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd hackaton-hd-backend
    ```

2. Create and activate a virtual environment:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Create a `.env` file by copying the example file and filling in the required values:
    ```sh
    cp azure.env.example azure.env
    ```

5. Run the FastAPI application:
    ```sh
    uvicorn main:app --reload
    ```

6. Open your browser and navigate to `http://localhost:8000` to see the application running.

## Endpoints

- `GET /`: Returns a "Hello World!" message.
- `POST /sendquery/`: Sends a query to the assistant.

## Environment Variables

Make sure to set the following environment variables in your [azure.env](http://_vscodecontentref_/1) file:

- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_VERSION`
- `HERE_API_KEY`