# Analyze Plate Logic

Review the plate decision pipeline in app.js.

## Scope
- normalizeOCRText
- parsePlate and candidate extraction
- detectPlateFeatures
- evaluatePlate

## Required Output
1. Risk findings ordered by severity.
2. Potential false-positive and false-negative cases.
3. Suggested minimal patches.
4. Manual test matrix with expected verdicts.

## Constraints
- Do not rewrite full architecture.
- Keep output categories: VALID_TR / SUSPICIOUS / NOT_PLATE.
- Keep user-facing language probabilistic, not absolute.
