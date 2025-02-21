from typing import Any, Optional
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from requests.exceptions import RequestException
from agents import get_response
from pydantic import BaseModel, Field
import requests

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserMessage(BaseModel):
    message: str
    thread_id: str


@app.get("/")
def root_hello():
    return {"response": "Hello World!"}

@app.post("/sendquery/")
def get_rides(message: UserMessage):
    try:
        print(f"Message: {message}")
        response = get_response(message.message, message.thread_id)
        return response
    except RequestException as ReqError:
        return {"status": 400, "error": f"Exception: {ReqError.strerror}"}
