from __future__ import annotations

import re

from claim_verification.domain.models import ClaimExtractionResult, ClaimRecord


class ClaimExtractionAgent:
    ISSUE_PATTERNS = {
        "scratch": ["scratch", "scrape", "scuff", "mark", "scratched"],
        "dent": ["dent", "dented", "deformation"],
        "crack": ["crack", "cracked", "shatter", "shattered"],
        "broken": ["broken", "break", "smashed"],
        "missing": ["missing", "lost"],
        "torn": ["torn", "tear", "ripped"],
        "crushed": ["crushed", "crush", "bent"],
        "water_damage": ["water", "liquid", "spill", "wet"],
        "stain": ["stain", "stained"],
    }
    PART_PATTERNS = {
        "rear_bumper": ["rear bumper", "back bumper", "back of the car"],
        "front_bumper": ["front bumper", "front side", "front"],
        "left_headlight": ["left headlight"],
        "right_headlight": ["right headlight"],
        "headlight": ["headlight", "light"],
        "door_panel": ["door panel", "door"],
        "windshield": ["windshield", "front glass", "glass"],
        "screen": ["screen", "display"],
        "keyboard": ["keyboard", "key"],
        "trackpad": ["trackpad", "touchpad"],
        "hinge": ["hinge"],
        "lid": ["lid"],
        "corner": ["corner"],
        "package_corner": ["package corner", "box corner", "corner"],
        "seal": ["seal", "tape"],
        "flap": ["flap"],
        "exterior": ["package", "box", "parcel"],
    }

    def extract(self, claim: ClaimRecord) -> ClaimExtractionResult:
        text = self._normalize(claim.user_claim)
        return ClaimExtractionResult(
            claim=claim,
            issue_type=self._match(text, self.ISSUE_PATTERNS, "unspecified"),
            object_part=self._match(text, self.PART_PATTERNS, "unspecified"),
        )

    @staticmethod
    def _normalize(value: str) -> str:
        return re.sub(r"\s+", " ", value.lower())

    @staticmethod
    def _match(text: str, patterns: dict[str, list[str]], fallback: str) -> str:
        for label, terms in patterns.items():
            if any(term in text for term in terms):
                return label
        return fallback

