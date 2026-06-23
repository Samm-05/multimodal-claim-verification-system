from __future__ import annotations

from pathlib import Path
from typing import Any

from claim_verification.domain.ports import VisionProvider
from claim_verification.vision.gemini_vision import GeminiVisionClient


def test_gemini_vision_client_conforms_to_protocol() -> None:
    """Verify that GeminiVisionClient conforms to the VisionProvider Protocol."""
    # This assignment will fail static type checking (mypy/pyright) if
    # GeminiVisionClient does not implement the VisionProvider protocol.
    client: VisionProvider = GeminiVisionClient(api_key="test-key")
    assert client is not None

    # Check method existence at runtime
    assert hasattr(GeminiVisionClient, "analyze_damage")
    assert callable(GeminiVisionClient.analyze_damage)
