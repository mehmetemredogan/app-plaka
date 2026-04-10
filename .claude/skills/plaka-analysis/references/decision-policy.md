# Decision Policy Reference

## Purpose
Standardize how verdict decisions are explained.

## Verdict Mapping
- VALID_TR: strong OCR parse + adequate authenticity and low suspicion.
- SUSPICIOUS: parse exists but visual/authenticity confidence is mixed.
- NOT_PLATE: parse missing or visual evidence too weak.

## Communication Rules
- Use uncertainty-aware language.
- Expose metrics whenever possible.
- Recommend better capture when confidence is low.

## Legal Safety
Do not present outputs as official legal decisions.
