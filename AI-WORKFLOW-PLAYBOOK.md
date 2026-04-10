# AI Workflow Playbook (app-plaka-main)

## What Is Already Installed
This project now includes a Claude workflow layer:
- Project rules: CLAUDE.md
- Reusable commands: .claude/commands/
- Specialist agent: .claude/agents/plate-logic-reviewer.md
- Reusable skill pack: .claude/skills/plaka-analysis/

## Daily Use Flow
1. Start with a plan request.
2. Apply a minimal patch.
3. Validate with scenario checklist.
4. Ship only when verdict behavior is still explainable.

## Standard Task Recipes

### 1) Logic Audit (OCR + scoring)
Use command intent from:
- .claude/commands/analyze-plate-logic.md

Expected result:
- Severity-ranked risk findings
- Minimal patch recommendations
- Test matrix

### 2) Safe UI Improvement
Use command intent from:
- .claude/commands/safe-ui-tweak.md

Expected result:
- Only index.html/style.css changes
- No decision logic side-effects

### 3) Pre-release Check
Use command intent from:
- .claude/commands/release-check.md

Expected result:
- PASS/FAIL by flow
- Root cause + smallest safe fix for failures

## Manual Validation Pack
Always test at least these 5 cases:
1. Clean frontal plate
2. Slight angle + reflections
3. Dark/low contrast image
4. No plate visible
5. Extra text mixed with plate

## Decision Communication Policy
- Use probability language.
- Never claim legal certainty.
- Show confidence and suspicion transparently.

## Fast Prompt Templates

Template: logic improvement
"Review app.js with the plate-logic-reviewer profile. Focus on parsePlate false positives and blue-band detection robustness. Propose minimal changes and include 5 manual test cases with expected verdicts."

Template: UI-only change
"Apply a safe-ui-tweak. Improve readability in result and disclaimer areas for mobile, without touching app.js logic."

Template: release gate
"Run release-check and return PASS/FAIL with root causes and smallest fixes."

## Team Convention
- One logical concern per change.
- Include before/after behavior note.
- Keep verdict categories stable unless product decision changes.
