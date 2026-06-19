from __future__ import annotations

import re

from claim_verification.domain.enums import IssueType, ObjectPart
from claim_verification.domain.models import ClaimExtractionResult, ClaimRecord


class ClaimExtractionAgent:
    ISSUE_PATTERNS = {
        IssueType.DENT.value: ["dent", "dented", "deformation", "hail"],
        IssueType.SCRATCH.value: ["scratch", "scrape", "scuff", "mark", "scratched"],
        IssueType.CRACK.value: ["crack", "cracked"],
        IssueType.GLASS_SHATTER.value: ["shatter", "shattered"],
        IssueType.BROKEN_PART.value: ["broken", "break", "smashed", "damaged"],
        IssueType.MISSING_PART.value: ["missing", "lost"],
        IssueType.TORN_PACKAGING.value: ["torn", "tear", "ripped", "opened", "torn-open"],
        IssueType.CRUSHED_PACKAGING.value: ["crushed", "crush", "creased"],
        IssueType.WATER_DAMAGE.value: ["water", "liquid", "spill", "wet"],
        IssueType.STAIN.value: ["stain", "stained", "coffee"],
    }
    PART_PATTERNS = {
        ObjectPart.WINDSHIELD.value: ["windshield", "front glass"],
        ObjectPart.REAR_BUMPER.value: ["rear bumper", "back bumper", "back of the car"],
        ObjectPart.FRONT_BUMPER.value: ["front bumper", "front side", "hood"],
        ObjectPart.LEFT_HEADLIGHT.value: ["left headlight"],
        ObjectPart.RIGHT_HEADLIGHT.value: ["right headlight"],
        ObjectPart.HEADLIGHT.value: ["headlight", "taillight"],
        ObjectPart.SIDE_MIRROR.value: ["side mirror", "mirror"],
        ObjectPart.DOOR.value: ["door panel", "door"],
        ObjectPart.HINGE.value: ["hinge area", "hinge"],
        ObjectPart.SCREEN.value: ["screen", "display", "pantalla"],
        ObjectPart.PACKAGE_CORNER.value: ["package corner", "box corner", "corner"],
        ObjectPart.SEAL.value: ["seal", "tape", "seal area", "torn-open"],
        ObjectPart.CORNER.value: ["laptop corner", "outer corner"],
        ObjectPart.KEYBOARD.value: ["keyboard", "key", "keys"],
        ObjectPart.TRACKPAD.value: ["trackpad", "touchpad"],
        ObjectPart.PACKAGE_SIDE.value: ["package surface", "package side", "wet-looking stain"],
        ObjectPart.CONTENTS.value: ["contents", "inside", "item inside", "product inside", "missing"],
        ObjectPart.EXTERIOR.value: ["shipping box", "delivery box", "outside box"],
    }

    PART_PRIORITY = {
        "laptop": ["hinge area", "hinge", "keyboard", "trackpad", "screen", "laptop corner", "outer corner", "corner"],
        "package": ["seal area", "seal", "package corner", "box corner", "contents", "package side", "shipping box", "delivery box"],
    }

    def extract(self, claim: ClaimRecord) -> ClaimExtractionResult:
        text = self._normalize(self._customer_text(claim.user_claim))
        issue_type = self._match(text, self.ISSUE_PATTERNS, IssueType.UNSPECIFIED.value)
        object_part = self._match_priority(text, str(claim.claim_object), self.PART_PATTERNS, ObjectPart.UNSPECIFIED.value)
        return ClaimExtractionResult(
            claim=claim,
            issue_type=issue_type,
            object_part=object_part,
            extracted_terms=self._extract_terms(text),
        )

    @staticmethod
    def _customer_text(value: str) -> str:
        segments = []
        for part in re.split(r"\||\n", value):
            cleaned = part.strip()
            if cleaned.lower().startswith("customer:"):
                segments.append(cleaned.split(":", 1)[1].strip())
        return " ".join(segments) if segments else value

    @staticmethod
    def _normalize(value: str) -> str:
        return re.sub(r"\s+", " ", value.lower())

    @classmethod
    def _match_priority(cls, text: str, claim_object: str, patterns: dict[str, list[str]], fallback: str) -> str:
        priority_terms = cls.PART_PRIORITY.get(claim_object, [])
        for term in priority_terms:
            if term in text:
                for label, terms in patterns.items():
                    if term in terms:
                        return label
        return cls._match(text, patterns, fallback)

    @staticmethod
    def _match(text: str, patterns: dict[str, list[str]], fallback: str) -> str:
        best_label = fallback
        best_position = -1
        best_length = -1
        for label, terms in patterns.items():
            for term in terms:
                position = text.rfind(term)
                if position > best_position or (position == best_position and len(term) > best_length):
                    best_label = label
                    best_position = position
                    best_length = len(term)
        return best_label

    @staticmethod
    def _extract_terms(text: str) -> list[str]:
        terms = []
        for token in re.findall(r"[a-z_]{3,}", text):
            if token not in terms:
                terms.append(token)
        return terms[:12]
