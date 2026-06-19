from __future__ import annotations

import re

from claim_verification.domain.enums import IssueType, ObjectPart
from claim_verification.domain.models import ClaimExtractionResult, ClaimRecord


class ClaimExtractionAgent:
    ISSUE_PATTERNS = {
        IssueType.SCRATCH.value: ["scratch", "scrape", "scuff", "mark", "scratched"],
        IssueType.DENT.value: ["dent", "dented", "deformation", "hail"],
        IssueType.CRACK.value: ["crack", "cracked"],
        IssueType.GLASS_SHATTER.value: ["shatter", "shattered"],
        IssueType.BROKEN_PART.value: ["broken", "break", "smashed"],
        IssueType.MISSING_PART.value: ["missing", "lost"],
        IssueType.TORN_PACKAGING.value: ["torn", "tear", "ripped", "opened", "torn-open"],
        IssueType.CRUSHED_PACKAGING.value: ["crushed", "crush", "creased"],
        IssueType.WATER_DAMAGE.value: ["water", "liquid", "spill", "wet"],
        IssueType.STAIN.value: ["stain", "stained", "coffee"],
    }
    PART_PATTERNS = {
        ObjectPart.WINDSHIELD.value: ["windshield", "front glass"],
        ObjectPart.REAR_BUMPER.value: ["rear bumper", "back bumper", "back of the car"],
        ObjectPart.FRONT_BUMPER.value: ["front bumper", "front side"],
        ObjectPart.LEFT_HEADLIGHT.value: ["left headlight"],
        ObjectPart.RIGHT_HEADLIGHT.value: ["right headlight"],
        ObjectPart.HEADLIGHT.value: ["headlight", "taillight", "light"],
        ObjectPart.SIDE_MIRROR.value: ["side mirror", "mirror"],
        ObjectPart.DOOR.value: ["door panel", "door"],
        ObjectPart.SCREEN.value: ["screen", "display", "pantalla"],
        ObjectPart.KEYBOARD.value: ["keyboard", "key", "keys"],
        ObjectPart.TRACKPAD.value: ["trackpad", "touchpad"],
        ObjectPart.HINGE.value: ["hinge"],
        ObjectPart.CORNER.value: ["corner"],
        ObjectPart.PACKAGE_CORNER.value: ["package corner", "box corner"],
        ObjectPart.SEAL.value: ["seal", "tape"],
        ObjectPart.PACKAGE_SIDE.value: ["package surface", "package side", "outside"],
        ObjectPart.CONTENTS.value: ["contents", "inside", "item inside", "product inside"],
        ObjectPart.EXTERIOR.value: ["shipping box", "delivery box", "box", "package"],
    }

    def extract(self, claim: ClaimRecord) -> ClaimExtractionResult:
        text = self._normalize(claim.user_claim)
        issue_type = self._match(text, self.ISSUE_PATTERNS, IssueType.UNSPECIFIED.value)
        object_part = self._match(text, self.PART_PATTERNS, ObjectPart.UNSPECIFIED.value)
        return ClaimExtractionResult(
            claim=claim,
            issue_type=issue_type,
            object_part=object_part,
            extracted_terms=self._extract_terms(text),
        )

    @staticmethod
    def _normalize(value: str) -> str:
        return re.sub(r"\s+", " ", value.lower())

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
