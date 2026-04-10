# OCR Test Cases

Use these cases during logic changes.

1. Input text: "TR34APP081"
Expected parse: "34 APP 081"
Expected verdict: SUSPICIOUS or VALID_TR depending on visual features.

2. Input text: "34 A 1234"
Expected parse: "34 A 1234"
Expected verdict: depends on visual signals.

3. Input text: "34AB123"
Expected parse: "34 AB 123"
Expected verdict: depends on confidence and visual checks.

4. Input text: "MODEL X 34 ABC 123"
Expected parse: "34 ABC 123"
Expected behavior: ignore unrelated tokens.

5. Input text: "NO PLATE HERE"
Expected parse: null
Expected verdict: NOT_PLATE
