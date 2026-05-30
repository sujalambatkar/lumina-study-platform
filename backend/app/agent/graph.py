from __future__ import annotations

from typing import AsyncIterator

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import settings
from app.documents.ingestion import retrieve_chunks

_llm: ChatGroq | None = None


def get_llm() -> ChatGroq:
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=settings.groq_api_key,
            temperature=0.2,
            streaming=True,
        )
    return _llm


async def stream_agent_response(document_id: str, message: str) -> AsyncIterator[str]:
    # Step 1: retrieve relevant chunks
    chunks = retrieve_chunks(document_id, message, n_results=6)

    if chunks:
        context_parts = []
        for c in chunks:
            idx = c.get("chunk_index", 0)
            context_parts.append(f"[Chunk {idx}]\n{c['text']}")
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = "No relevant content found in the document."

    # Step 2: build prompt
    system = SystemMessage(content=(
        "You are Lumina, a precise study assistant. "
        "Answer questions using ONLY the document chunks provided. "
        "Always cite sources inline as [Chunk X]. "
        "Use markdown: headers, bullets, bold text. "
        "If the answer is not in the chunks, say so clearly."
    ))

    human = HumanMessage(content=(
        f"Document content:\n{context}\n\n"
        f"Question: {message}"
    ))

    # Step 3: stream response
    llm = get_llm()
    async for chunk in llm.astream([system, human]):
        if chunk.content:
            yield str(chunk.content)
