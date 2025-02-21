import openai
import os
import json
import time
import requests
import random

from dotenv import load_dotenv
from pathlib import Path
from openai import AzureOpenAI
from typing import Optional

load_dotenv("./azure.env")

openai.api_type: str = "azure"
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_ENDPOINT = os.getenv("AZURE_OPENAI_API_ENDPOINT")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")

client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_API_ENDPOINT,
)

api_key = os.getenv("OPENWEATHER_API")
here_api_key = os.getenv("HERE_API_KEY")


def get_weather(location):
    base_url = "https://weather.hereapi.com/v3/report?"

    complete_url = f"""{base_url}location={location}&apiKey={here_api_key}&units=metric&products=forecast7daysSimple"""

    print(f"Complete URL Weather: {complete_url}")

    response = requests.get(complete_url)
    weather_condition = response.json()["places"][0]["dailyForecasts"][0]["forecasts"][
        0
    ]

    return f"""Here is some information about the weather in {location}:\n
        - The weather is: {weather_condition}.\n
    """


def get_current_location():
    locations = [
        "43.21222,-8.6913",
        "26.84491,-102.17886",
        "38.447245731949316,-123.06096099143787",
        "38.01836,-84.411",
        "34.124308,-118.255763",
    ]
    location = random.choice(locations)
    print(f"Current Location: {location}")
    return location


def get_places(places, location):
    base_url = "https://discover.search.hereapi.com/v1/discover?"

    complete_url = (
        f"""{base_url}at={location}&q={places}&apiKey={here_api_key}&limit=5"""
    )

    print(f"Complete URL Places: {complete_url}")

    response = requests.get(complete_url)
    places = response.json()["items"]

    return f"""Here is a list of places found in {location}:\n
        - {places}.\n
    """


def poll_run_till_completion(
    client: AzureOpenAI,
    thread_id: str,
    run_id: str,
    available_functions: dict,
    verbose: bool,
    max_steps: int = 20,
    wait: int = 3,
) -> None:
    """
    Poll a run until it is completed or failed or exceeds a certain number of iterations (MAX_STEPS)
    with a preset wait in between polls

     client: Azure OpenAI client
     thread_id: Thread ID
     run_id: Run ID
     assistant_id: Assistant ID
     verbose: Print verbose output
     max_steps: Maximum number of steps to poll
     wait: Wait time in seconds between polls

    """

    if (client is None and thread_id is None) or run_id is None:
        print("Client, Thread ID and Run ID are required.")
        return
    try:
        cnt = 0
        while cnt < max_steps:
            run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
            if verbose:
                print("Poll {}: {}".format(cnt, run.status))
            cnt += 1
            if run.status == "requires_action":
                tool_responses = []
                if (
                    run.required_action.type == "submit_tool_outputs"
                    and run.required_action.submit_tool_outputs.tool_calls is not None
                ):
                    tool_calls = run.required_action.submit_tool_outputs.tool_calls

                    print(f"Calls {tool_calls}")

                    for call in tool_calls:
                        print(f"Call {call}")
                        if call.type == "function":
                            if call.function.name not in available_functions:
                                raise Exception(
                                    "Function requested by the model does not exist"
                                )
                            function_to_call = available_functions[call.function.name]
                            tool_response = function_to_call(
                                **json.loads(call.function.arguments)
                            )
                            tool_responses.append(
                                {"tool_call_id": call.id, "output": tool_response}
                            )

                run = client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread_id, run_id=run.id, tool_outputs=tool_responses
                )
            if run.status == "failed":
                print("Run failed.")
                break
            if run.status == "completed":
                break
            time.sleep(wait)

    except Exception as e:
        print(e)


def create_message(
    client: AzureOpenAI,
    thread_id: str,
    role: str = "",
    content: str = "",
    file_ids: Optional[list] = None,
    metadata: Optional[dict] = None,
    message_id: Optional[str] = None,
) -> any:
    """
    Create a message in a thread using the client.

     client: OpenAI client
     thread_id: Thread ID
     role: Message role (user or assistant)
     content: Message content
     file_ids: Message file IDs
     metadata: Message metadata
     message_id: Message ID
    @return: Message object

    """
    if metadata is None:
        metadata = {}
    if file_ids is None:
        file_ids = []

    if client is None:
        print("Client parameter is required.")
        return None

    if thread_id is None:
        print("Thread ID is required.")
        return None

    try:
        if message_id is not None:
            return client.beta.threads.messages.retrieve(
                thread_id=thread_id, message_id=message_id
            )

        if (
            file_ids is not None
            and len(file_ids) > 0
            and metadata is not None
            and len(metadata) > 0
        ):
            return client.beta.threads.messages.create(
                thread_id=thread_id,
                role=role,
                content=content,
                file_ids=file_ids,
                metadata=metadata,
            )

        if file_ids is not None and len(file_ids) > 0:
            return client.beta.threads.messages.create(
                thread_id=thread_id, role=role, content=content, file_ids=file_ids
            )

        if metadata is not None and len(metadata) > 0:
            return client.beta.threads.messages.create(
                thread_id=thread_id, role=role, content=content, metadata=metadata
            )

        return client.beta.threads.messages.create(
            thread_id=thread_id, role=role, content=content
        )

    except Exception as e:
        print(e)
        return None


def retrieve_and_print_messages(
    client: AzureOpenAI, thread_id: str, verbose: bool, out_dir: Optional[str] = None
) -> any:
    """
    Retrieve a list of messages in a thread and print it out with the query and response

     client: OpenAI client
     thread_id: Thread ID
     verbose: Print verbose output
     out_dir: Output directory to save images
    @return: Messages object

    """

    if client is None and thread_id is None:
        print("Client and Thread ID are required.")
        return None
    try:
        system_meesage = """
        #Overview\n
        You are the ultimate personal assistant. Your job is to send the user's query to the correct tool. 
        You should never be ask for information like location, or other data, you just need to call the correct tool.\n\n
        ## Tools\n
        - get_weather Function: Use this tool to get the current weather\n
        - get_places Function: Use this tool to fetch places based on location and kind of places\n
        - get_current_location Function: Use this tool to get the current location of the user\n

        ## Rules\n- Some functions require you to look up current location first. 
        For the following functions, you must get the current location and send that to the function who needs it:\n  
        - get_places\n\n
        ## Examples\n1) \n
        - Input: I'm starving, could you help me find a good place to eat? I'm in the mood for some pasta. Find places already open and closest possible.\n  
        - Action: Use get_current_location to get the current location of the user.\n  
        - Action: Use get_places to fetch places. You will pass the tool a query like \"I'm in the mood for some pasta: [pasta]"\n
        - Output: Here is a list of open places. Anything else I can help you with?\n\n\n"""
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        display_role = {
            "user": "User query",
            "assistant": "Assistant response",
            "system": system_meesage,
        }

        prev_role = None

        if verbose:
            print("\n\nCONVERSATION:")
        for md in reversed(messages.data):
            if prev_role == "assistant" and md.role == "user" and verbose:
                print("------ \n")

            for mc in md.content:
                # Check if valid text field is present in the mc object
                if mc.type == "text":
                    txt_val = mc.text.value
                # Check if valid image field is present in the mc object
                elif mc.type == "image_file":
                    image_data = client.files.content(mc.image_file.file_id)
                    if out_dir is not None:
                        out_dir_path = Path(out_dir)
                        if out_dir_path.exists():
                            image_path = out_dir_path / (mc.image_file.file_id + ".png")
                            with image_path.open("wb") as f:
                                f.write(image_data.read())

                if verbose:
                    if prev_role == md.role:
                        print(txt_val)
                    else:
                        print("{}:\n{}".format(display_role[md.role], txt_val))
            prev_role = md.role
        return messages
    except Exception as e:
        print(e)
        return None


def get_response(user_message: str, thread_id: str) -> any:
    """
    Get a response from the assistant

     user_message: User message
     thread_id: Thread ID
    @return: Assistant response

    """
    try:

        available_functions = {
            "get_weather": get_weather,
            "get_places": get_places,
            "get_current_location": get_current_location,
        }
        verbose_output = True

        # Declare the Assistant's ID
        assistant_id = "asst_h2dXW5l8ylNrlqGENAjC0Kpt"

        # Fetch the assistant
        assistant = client.beta.assistants.retrieve(assistant_id=assistant_id)
        assistant

        # Create a thread

        if bool(thread_id and not thread_id.isspace()):
            print(f"Updating chat: {thread_id}")
            thread = client.beta.threads.retrieve(thread_id=thread_id)
        else:
            print(f"creating new thread")
            thread = client.beta.threads.create()
        thread

        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant.id,
            instructions=user_message,
        )

        poll_run_till_completion(
            client=client,
            thread_id=thread.id,
            run_id=run.id,
            available_functions=available_functions,
            verbose=verbose_output,
        )
        messages = retrieve_and_print_messages(
            client=client, thread_id=thread.id, verbose=verbose_output
        )
        return messages
    except Exception as e:
        print(e)
        return None
