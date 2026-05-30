import re
from typing import Optional
import httpx
from bs4 import BeautifulSoup


def parse_pdf_bytes(file_bytes: bytes) -> list[str]:
    import fitz
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages: list[str] = []
    for i in range(len(doc)):
        text = doc[i].get_text()
        if text.strip():
            pages.append(f"[Page {i + 1}]\n{text}")
    doc.close()
    return pages


def _extract_video_id(url: str) -> Optional[str]:
    for pattern in [
        r"(?:v=)([A-Za-z0-9_-]{11})",
        r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
        r"(?:embed/)([A-Za-z0-9_-]{11})",
        r"(?:shorts/)([A-Za-z0-9_-]{11})",
    ]:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    return None


def _entries_to_segments(data: list) -> list[str]:
    segments: list[str] = []
    for entry in data:
        if isinstance(entry, dict):
            start = float(entry.get("start", 0))
            text = str(entry.get("text", "")).strip()
        else:
            start = float(getattr(entry, "start", 0))
            text = str(getattr(entry, "text", "")).strip()
        if not text:
            continue
        m, s = int(start // 60), int(start % 60)
        segments.append(f"[{m:02d}:{s:02d}] {text}")
    return segments


def parse_youtube_transcript(url: str) -> tuple[list[str], str]:
    from youtube_transcript_api import YouTubeTranscriptApi

    video_id = _extract_video_id(url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from: {url}")

    langs = ["en", "en-US", "en-GB", "en-IN", "en-CA", "en-AU"]
    data: Optional[list] = None
    errors: list[str] = []

    # ── New API (≥0.7.x): instance-based ────────────────────────────────────
    try:
        api = YouTubeTranscriptApi()

        # Try fetch with preferred languages
        try:
            raw = api.fetch(video_id, languages=langs)
            data = list(raw)
        except Exception as e:
            errors.append(f"new-api/fetch-en: {e}")

        # Try fetch without language filter
        if not data:
            try:
                raw = api.fetch(video_id)
                data = list(raw)
            except Exception as e:
                errors.append(f"new-api/fetch-any: {e}")

        # Try listing and picking first
        if not data:
            try:
                for t in api.list(video_id):
                    try:
                        data = list(t.fetch())
                        if data:
                            break
                    except Exception as e:
                        errors.append(f"new-api/list-item: {e}")
            except Exception as e:
                errors.append(f"new-api/list: {e}")

    except AttributeError:
        # Instance-based API not available — old version installed
        pass
    except Exception as e:
        errors.append(f"new-api/init: {e}")

    # ── Old API (0.6.x): class-method-based ─────────────────────────────────
    if not data:
        try:
            data = list(YouTubeTranscriptApi.get_transcript(video_id, languages=langs))  # type: ignore[attr-defined]
        except AttributeError:
            pass
        except Exception as e:
            errors.append(f"old-api/get_transcript-en: {e}")

    if not data:
        try:
            data = list(YouTubeTranscriptApi.get_transcript(video_id))  # type: ignore[attr-defined]
        except AttributeError:
            pass
        except Exception as e:
            errors.append(f"old-api/get_transcript-any: {e}")

    if not data:
        try:
            for t in YouTubeTranscriptApi.list_transcripts(video_id):  # type: ignore[attr-defined]
                try:
                    data = list(t.fetch())
                    if data:
                        break
                except Exception as e:
                    errors.append(f"old-api/list-item: {e}")
        except AttributeError:
            pass
        except Exception as e:
            errors.append(f"old-api/list_transcripts: {e}")

    # ── Give up ──────────────────────────────────────────────────────────────
    if not data:
        # Detect YouTube IP block (common on cloud providers like Render)
        combined = " ".join(errors).lower()
        if "blocked" in combined or "cloud" in combined or "ip" in combined:
            raise ValueError(
                "YouTube has blocked transcript access from this server's IP address. "
                "This is a YouTube restriction on cloud hosting providers (Render, AWS, etc.). "
                "Please use a PDF upload or web URL instead."
            )
        raise ValueError(
            "Could not retrieve transcript. Make sure the video has English captions enabled."
        )

    segments = _entries_to_segments(data)
    if not segments:
        raise ValueError("Transcript returned no usable text.")

    return segments, video_id


async def parse_web_url(url: str) -> str:
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; LuminaBot/1.0)"}
        response = await client.get(url, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()

    target = soup.find("main") or soup.find("article") or soup.body or soup
    text = target.get_text(separator="\n", strip=True)
    lines = [ln for ln in text.splitlines() if len(ln.strip()) > 20]
    return "\n".join(lines)
