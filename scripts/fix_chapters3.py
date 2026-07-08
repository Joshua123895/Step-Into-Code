import yaml

with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fix_start = 834
fix_end = 2397

# Strategy: For each level (- name:):
# 1. Determine the level's name indent (8 or 9)
# 2. Check the first property indent to distinguish puzzle vs regular
# 3. Fix: level name to 8, properties to 10, adjusting child indent accordingly

fixes = 0
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if not l:
        i += 1
        continue
    leading = len(l) - len(l.lstrip())
    content = l.lstrip()

    if not content.startswith('- name:'):
        i += 1
        continue

    # Detect level type by looking at the FIRST non-empty, non-name line
    name_indent = leading
    j = i + 1
    first_prop_indent = None
    first_prop_is_puzzle = False
    while j < fix_end:
        nxt = lines[j].rstrip()
        if not nxt:
            j += 1
            continue
        nxt_lead = len(nxt) - len(nxt.lstrip())
        nxt_content = nxt.lstrip()
        if nxt_lead <= name_indent and nxt_content.startswith('- name:'):
            break
        # Found first property
        first_prop_indent = nxt_lead
        first_prop_is_puzzle = nxt_content in ('example:', 'tests:')
        break

    if first_prop_indent is None:
        i += 1
        continue

    # Determine correction
    # Target: name at 8 spaces, properties at 10 spaces
    target_name_indent = 8
    target_prop_indent = 10

    # Calculate name correction
    name_correction = target_name_indent - name_indent  # -1 if 9->8, 0 if 8->8

    # Property correction depends on level type
    if first_prop_is_puzzle:
        # Puzzle: first prop at same indent as name, needs +2 from target name
        prop_correction = target_prop_indent - first_prop_indent  # +1 if from 9, +2 if from 8
    else:
        # Regular: first prop at name+2
        # If name is 9, prop is 11, we need name=8, prop=10 -> correction = -1
        # If name is 8, prop is 10, we need name=8, prop=10 -> correction = 0
        prop_correction = target_prop_indent - first_prop_indent  # -1 or 0

    # Apply fixes
    # Fix name line
    if name_correction != 0:
        lines[i] = ' ' * target_name_indent + content + '\n'
        fixes += 1

    i += 1

    # Fix all property/child lines until next level
    while i < fix_end:
        cur = lines[i].rstrip()
        if not cur:
            i += 1
            continue
        cur_lead = len(cur) - len(cur.lstrip())
        cur_content = cur.lstrip()

        # Stop at next level
        if cur_lead <= 8 and cur_content.startswith('- name:'):
            break

        # Apply property correction to ALL child lines
        if cur_lead > 0:
            new_lead = cur_lead + prop_correction
            if new_lead < 0:
                new_lead = 0
            lines[i] = ' ' * new_lead + cur_content + '\n'
            fixes += 1
        i += 1
    continue

print(f'Fixed {fixes} lines')

# Write and verify
with open('src/data/track2_fixed6.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

with open('src/data/track2_fixed6.yaml') as f:
    data = yaml.safe_load(f)
print('Parsed OK')
track = data[0]
print('Track:', track['name'])
chs = track['chapters']
for ci, c in enumerate(chs):
    ls = c['levels']
    print(f'Ch{ci+1}: {c["name"]} - {len(ls)} levels')
