# app-plaka-main - Claude Working Guide

## Project Purpose
This app analyzes a vehicle plate image and returns a probability-based result:
- VALID_TR
- SUSPICIOUS
- NOT_PLATE

The app is an informational simulation and must not claim official legal judgment.

## Setup
- Open index.html in a browser.
- Allow camera access for live capture.
- For OCR and CV, the app uses CDN scripts in index.html.

## Core Files
- app.js: OCR, preprocessing, plate parsing, feature extraction, scoring and verdict.
- index.html: user flow, legal disclaimer, UI structure.
- style.css: UI style and status visual states.

## Non-Negotiable Rules
1. Keep verdicts probability-based. Never present legal certainty.
2. Preserve the disclaimer language in UI.
3. Prefer transparent scoring over hidden binary checks.
4. Any logic change in app.js must include at least 5 manual test scenarios.
5. Keep final labels limited to VALID_TR, SUSPICIOUS, NOT_PLATE unless explicitly approved.

## Change Workflow
1. Plan: define goal, risk, and expected behavior.
2. Small patch: update one concern at a time.
3. Validate: run manual scenarios and compare old/new behavior.
4. Explain: summarize what changed and why.

## Regression Watchlist
- parsePlate false positives from noisy OCR text.
- blue band detection sensitivity on low light.
- bold font heuristic over-triggering APP suspicion.
- camera flow fallback when permission is denied.

## Manual Test Baseline
1. Clean plate image, frontal view.
2. Slight angle + mild reflection.
3. Dark image with low contrast.
4. No plate in frame.
5. Mixed text in frame (brand text + plate).

## Output Tone Policy
Use wording such as:
- "high probability"
- "suspicious"
- "repeat capture recommended"

Avoid wording such as:
- "definitely illegal"
- "officially invalid"

## Done Criteria for Logic Changes
- No runtime error in browser console.
- Result section still shows checks and metrics.
- Disclaimer remains visible and accessible.
- At least one example from each verdict path is tested.
