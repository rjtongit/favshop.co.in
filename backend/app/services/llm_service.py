import json

from huggingface_hub import InferenceClient

from app.config import settings


client = InferenceClient(
    api_key=settings.huggingface_api_key
)


async def understand_question(
    question: str,
    columns: list[str]
) -> dict:

    prompt = f"""
    You are an Excel sales analysis assistant.

    Available Excel columns:
    {columns}

    User question:
    {question}

    Choose exactly one operation from:

    sum
    average
    max
    min
    top
    count

    Return ONLY valid JSON.

    Examples:

    Question:
    "What is the total revenue?"

    JSON:
    {{
        "operation": "sum",
        "column": "Revenue"
    }}

    Question:
    "Which product generated the highest revenue?"

    JSON:
    {{
        "operation": "max",
        "column": "Revenue"
    }}

    Question:
    "Show top 5 products by revenue."

    JSON:
    {{
        "operation": "top",
        "column": "Revenue",
        "group_by": "Product",
        "limit": 5
    }}

    Question:
    "How many sales records are there?"

    JSON:
    {{
        "operation": "count"
    }}
    """

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You convert natural language "
                    "questions into safe JSON analysis instructions."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=300,
        temperature=0
    )

    content = response.choices[0].message.content

    return json.loads(content)