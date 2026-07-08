import re

with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    content = f.read()

# Find pattern: property lines within a level where indent doesn't match
# Fixed typos detected from parsing errors:
# 1. Line 1766: expl: at 12 spaces instead of 11 (in raw file where other props at 11)
# Actually, after correction, props go from 11 -> 10. expl: goes from 12 -> 11. Needs to go to 10.
# So the fix is: move expl: from 12 to 11 in the raw file (so after -1 correction, it goes to 10)

# Strategy: find all levels in chapters 4-7, check if any property has non-standard indent
import yaml

lines = content.split('\n')

fix_start = 834  # 0-indexed
fix_end = 2397

# Find level boundaries
level_starts = []
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if l.lstrip().startswith('- name:'):
        level_starts.append(i)
    i += 1

fixes = 0
for idx, start in enumerate(level_starts):
    end = level_starts[idx+1] if idx+1 < len(level_starts) else fix_end
    
    # Collect indent of each property line
    prop_lines = []
    for j in range(start+1, end):
        l = lines[j].rstrip()
        if not l:
            continue
        # Check if this is a property line (starts with a word and colon, at proper level indent)
        leading = len(l) - len(l.lstrip())
        stripped = l.lstrip()
        # A property is a non-content line (no leading spaces beyond the base)
        if ':' in stripped and not stripped.startswith('- '):
            # Get the part before colon
            maybe_key = stripped.split(':')[0]
            if ' ' not in maybe_key:
                prop_lines.append((j, leading, stripped[:60]))

    if not prop_lines:
        continue
    
    # Find most common indent
    from collections import Counter
    indent_counts = Counter(p[1] for p in prop_lines)
    most_common = indent_counts.most_common(1)[0][0]
    
    # Fix outliers
    for j, lead, stripped in prop_lines:
        if lead != most_common:
            print(f'  Line {j+1}: indent {lead} instead of {most_common}: {stripped}')
            # We can't fix here without knowing the correction direction
            # Instead, just note them

print(f'Total levels in fix range: {len(level_starts)}')
print(f'Done checking')
