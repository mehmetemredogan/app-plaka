# Optimization Plan (app-plaka-main)

## Current Status
Completed now:
- Claude workflow layer installed.
- OCR ranking improved with multi-pass consensus scoring in app.js.

Why this helps:
- Reduces false positives from one-off noisy OCR reads.
- Prefers plate candidates repeated across OCR passes.

## Phase 1 - Baseline and Measurement (Today)
Goal:
- Establish repeatable quality checks before more logic changes.

Tasks:
1. Prepare 15-30 real sample images across mixed quality.
2. Label each sample with expected verdict path:
   - VALID_TR
   - SUSPICIOUS
   - NOT_PLATE
3. Run all samples and capture:
   - parsed plate text
   - confidence
   - final verdict
   - notable checks shown in UI
4. Record false-positive and false-negative cases.

Exit criteria:
- Baseline table exists with at least 15 samples.

## Phase 2 - Parsing Robustness (Next)
Goal:
- Lower parsePlate false positives from mixed scene text.

Tasks:
1. Tighten candidate extraction constraints gradually.
2. Add safeguards for overly synthetic OCR substitutions.
3. Keep changes small and compare against baseline after each patch.

Exit criteria:
- False-positive rate reduced versus baseline.
- No drop in clear plate recognition beyond agreed tolerance.

## Phase 3 - Visual Signal Stability (Next)
Goal:
- Improve reliability in low light and angled shots.

Tasks:
1. Tune blue-band threshold using baseline edge images.
2. Re-check ratio and char-density interactions.
3. Prevent bold-font heuristic from over-triggering suspicion.

Exit criteria:
- Better consistency in dark/angled scenarios.

## Phase 4 - UX and Decision Clarity
Goal:
- Keep users informed with transparent uncertainty.

Tasks:
1. Improve wording for low-confidence guidance.
2. Keep legal disclaimer always visible and unchanged in meaning.
3. Ensure result checks remain understandable on mobile.

Exit criteria:
- Users can understand why a verdict was given.

## Validation Pack (Required per logic change)
Use at least these five scenarios every time:
1. Clean frontal plate image.
2. Slight angle + mild reflection.
3. Dark low-contrast image.
4. No plate in frame.
5. Mixed text in frame.

Also include:
- One example that ends in each verdict path.

## Change Rules
- One logical concern per patch.
- Preserve verdict labels: VALID_TR / SUSPICIOUS / NOT_PLATE.
- Keep probability-based language, not legal certainty.
- If regression appears, rollback the last small patch only.

## Weekly Operating Rhythm
1. Monday: run baseline pack and prioritize top 2 risks.
2. Mid-week: ship one logic patch + one UI clarity patch.
3. Friday: run release-check and summarize trend.

## Quick Prompts To Use
Logic:
"Run analyze-plate-logic, focus on false positives from mixed text, propose minimal patch and expected impact."

UI:
"Run safe-ui-tweak to improve result readability on mobile without touching app.js logic."

Release:
"Run release-check and return PASS/FAIL with smallest safe fixes."
