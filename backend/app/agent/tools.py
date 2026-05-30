from __future__ import annotations

import json
from typing import Any

from langchain_core.tools import tool

from app.documents.ingestion import retrieve_chunks as _retrieve_chunks, get_all_chunks


def make_retrieve_tool(document_id: str):
    @tool
    def retrieve_chunks(query: str) -> str:
        """Retrieve relevant chunks from the study document for a given query.
        Always call this before answering any question about the document content."""
        chunks = _retrieve_chunks(document_id, query, n_results=5)
        if not chunks:
            return "No relevant content found in the document."

        formatted = []
        for chunk in chunks:
            idx = chunk.get("chunk_index", 0)
            formatted.append(f"[Chunk {idx}]\n{chunk['text']}")
        return "\n\n---\n\n".join(formatted)

    return retrieve_chunks


def make_quiz_tool(document_id: str, llm: Any):
    @tool
    def generate_quiz(topic: str) -> str:
        """Generate 5 multiple-choice quiz questions about a specific topic from the study material.
        Returns a JSON array of question objects."""
        from app.agent.prompts import QUIZ_GENERATION_PROMPT

        chunks = _retrieve_chunks(document_id, topic, n_results=8)
        if not chunks:
            return json.dumps([])

        context = "\n\n".join(c["text"] for c in chunks)
        prompt = QUIZ_GENERATION_PROMPT.format(topic=topic, context=context[:6000])

        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)

        # Strip any markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

        return content

    return generate_quiz


def make_concepts_tool(document_id: str, llm: Any):
    @tool
    def extract_concepts(document_id_param: str = "") -> str:
        """Extract key concepts and their relationships from the study material as a graph.
        Returns JSON with nodes and edges."""
        from app.agent.prompts import CONCEPT_EXTRACTION_PROMPT

        all_chunks = get_all_chunks(document_id)
        if not all_chunks:
            return json.dumps({"nodes": [], "edges": []})

        # Limit context to avoid token limits
        combined = "\n\n".join(all_chunks)[:8000]
        prompt = CONCEPT_EXTRACTION_PROMPT.format(context=combined)

        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)

        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

        return content

    return extract_concepts
