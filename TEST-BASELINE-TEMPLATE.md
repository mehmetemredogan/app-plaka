# Test Baseline Template

Use this sheet after each logic patch.

## Session Info
- Date:
- Tester:
- Build/Commit:
- Notes:

## Summary Metrics
- Total samples:
- Correct verdict count:
- False positives:
- False negatives:
- Recapture recommended count:

## Sample Table
| ID | Image/File | Scenario | Expected Verdict Path | Parsed Plate | OCR Confidence | Actual Verdict | Match (Y/N) | Key Observations |
|----|------------|----------|------------------------|--------------|----------------|----------------|-------------|------------------|
| 1  |            | Clean frontal plate | VALID_TR |              |                |                |             |                  |
| 2  |            | Slight angle + reflection | SUSPICIOUS or VALID_TR |              |                |                |             |                  |
| 3  |            | Dark low contrast | SUSPICIOUS or NOT_PLATE |              |                |                |             |                  |
| 4  |            | No plate in frame | NOT_PLATE |              |                |                |             |                  |
| 5  |            | Mixed text in frame | NOT_PLATE or SUSPICIOUS |              |                |                |             |                  |
| 6  |            |            |                        |              |                |                |             |                  |
| 7  |            |            |                        |              |                |                |             |                  |
| 8  |            |            |                        |              |                |                |             |                  |
| 9  |            |            |                        |              |                |                |             |                  |
| 10 |            |            |                        |              |                |                |             |                  |
| 11 |            |            |                        |              |                |                |             |                  |
| 12 |            |            |                        |              |                |                |             |                  |
| 13 |            |            |                        |              |                |                |             |                  |
| 14 |            |            |                        |              |                |                |             |                  |
| 15 |            |            |                        |              |                |                |             |                  |

## Failure Log
### False Positives
- ID:
- Why likely happened:
- Candidate fix idea:

### False Negatives
- ID:
- Why likely happened:
- Candidate fix idea:

## Decision Notes
- Promote to release? (Yes/No)
- If no, next minimal patch target:
- Retest required scenarios:
