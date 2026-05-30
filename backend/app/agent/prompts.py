SYSTEM_PROMPT = """You are Lumina, a precise and helpful study assistant.

RULES — follow these strictly:
1. ALWAYS call retrieve_chunks first before answering any question. Never answer from memory.
2. After retrieving, answer the user's question clearly in markdown — use bullet points, headers, bold text.
3. Cite sources inline like [Page 12] or [02:34] after each key fact.
4. If the content doesn't contain the answer, say "I couldn't find that in this document."
5. Keep answers focused and well-structured. Students need clarity, not walls of text.
6. NEVER return raw JSON to the user. NEVER call extract_concepts or generate_quiz in response to a chat message.
7. extract_concepts and generate_quiz are backend-only tools — do NOT use them in chat responses."""

QUIZ_GENERATION_PROMPT = """Based on the following study material about "{topic}", generate exactly {count} multiple-choice questions.

Material:
{context}

Return a JSON array with exactly {count} items in this structure (no markdown, pure JSON):
[
  {{
    "question": "Question text here",
    "options": ["A) Option", "B) Option", "C) Option", "D) Option"],
    "correct": "A",
    "explanation": "Brief explanation of why this is correct"
  }}
]"""

CONCEPT_EXTRACTION_PROMPT = """Analyze the following study material and extract the top 15 most important concepts and their relationships.

Material:
{context}

Return a JSON object with exactly this structure (no markdown, pure JSON):
{{
  "nodes": [
    {{"id": "concept_id", "label": "Concept Name", "description": "One sentence definition"}}
  ],
  "edges": [
    {{"source": "concept_id_1", "target": "concept_id_2", "label": "relationship verb"}}
  ]
}}

Focus on meaningful relationships: "causes", "enables", "is part of", "leads to", "contrasts with", etc."""
