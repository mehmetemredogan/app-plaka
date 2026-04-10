# Plaka Analysis Skill

## When To Use
Use this skill when requests involve:
- OCR quality improvements
- plate parsing accuracy
- APP suspicion scoring
- reducing false positives/false negatives

## Project Truths
- This app is a simulation assistant, not an official authority.
- Decisions are confidence-scored heuristics.
- Final categories are: VALID_TR, SUSPICIOUS, NOT_PLATE.

## Decision Policy
- Prefer transparent checks with explicit metrics.
- If evidence is weak, increase suspicion and recommend recapture.
- Avoid hard legal statements.

## Implementation Guidance
1. Keep preprocess + multi-pass OCR approach.
2. Tune thresholds gradually; avoid large jumps.
3. Validate changes against mixed-quality scenarios.
4. Preserve user readability of checks.

## Gotchas
- OCR may merge surrounding text with plate.
- Blue band detection can fail under color cast or glare.
- Character density can over-flag custom fonts.
- Perspective distortion can break ratio checks.

## Required Validation Before Merge
- 5+ manual image scenarios.
- At least one sample per verdict path.
- No UI regression in result rendering.

## Related Files
- app.js
- index.html
- style.css

## Extra Material
- examples/ocr-test-cases.md
- references/decision-policy.md
