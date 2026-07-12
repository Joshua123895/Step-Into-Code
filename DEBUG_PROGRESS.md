# DEBUG PROGRESS

## Status: 32 failures → working through categories

## Category 1: YAML multiline concatenation (14 failures)
**Root cause:** YAML `sol` fields have missing `\n` between statements — two Python statements concatenated on one line.
**Files:** python1.yaml, python2.yaml

## Category 2: YAML `start` field corruption (10 failures)  
**Root cause:** YAML `start` fields have corrupted/duplicated content or indentation mismatches with `sol`.
**Files:** python1.yaml, python2.yaml

## Category 3: Solution logic bugs (5 failures)
**Root cause:** Solutions produce wrong output or use incompatible Python patterns.
**Files:** python1.yaml, python2.yaml

## Category 4: Test input mismatch (1 failure)
**Root cause:** Test provides string input but solution tries `int()` on it.
**Files:** python2.yaml
