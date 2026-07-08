"""Fix indentation issues in tracks.yaml.bak and extract Track 2."""
import re
import sys

with open('src/data/tracks.yaml.bak', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# Known issues:
# 1. Some "max:" lines have 11 spaces instead of 10 
# 2. My edited levels have wrong indentation

# Fix 1: reduce max: from 11 to 10 spaces where tests: is at 10
fixed = 0
for i, line in enumerate(lines):
    stripped = line.rstrip()
    m = re.match(r'^(\s+)(max:.*)', stripped)
    if m:
        indent = len(m.group(1))
        if indent == 11:
            # Check if previous content line ends at tests: at 10
            for j in range(i-1, -1, -1):
                prev = lines[j].rstrip()
                if not prev:
                    continue
                pm = re.match(r'^(\s+)(tests:.*)', prev)
                if pm and len(pm.group(1)) == 10:
                    lines[i] = '          ' + m.group(2)
                    fixed += 1
                    break
                # Skip content lines
                pspaces = len(prev) - len(prev.lstrip())
                if pspaces >= 12:
                    continue
                break
print(f'Fixed {fixed} max: lines')

# Fix 2: find level list items with wrong indentation
# Iterate through all chapters' levels sections and ensure consistency
# Strategy: Within each levels section, find the indentation of the
# first - name: and make all subsequent - name: match

in_levels = False
levels_start = None
first_level_indent = None
section_contents = []  # list of (start, end, correct_indent)

for i, line in enumerate(lines):
    stripped = line.rstrip()
    
    if not in_levels:
        if re.match(r'^(\s*)levels:\s*$', stripped):
            in_levels = True
            levels_start = i
            first_level_indent = None
            # Look ahead for first - name:
            for j in range(i+1, min(i+5, len(lines))):
                m = re.match(r'^(\s*)- name:', lines[j].rstrip())
                if m:
                    first_level_indent = len(m.group(1))
                    break
    else:
        # Check if still in levels section
        level_line_match = re.match(r'^(\s*)levels:\s*$', stripped)
        if level_line_match:
            if i > levels_start + 1:
                section_contents.append((levels_start, i-1, first_level_indent or 8))
                levels_start = i
                first_level_indent = None
                for j in range(i+1, min(i+5, len(lines))):
                    m = re.match(r'^(\s*)- name:', lines[j].rstrip())
                    if m:
                        first_level_indent = len(m.group(1))
                        break
                continue
        
        # End of levels? A line at or before the levels: indent
        m = re.match(r'^(\s*)\S', stripped)
        if m and i > levels_start + 1:
            indent = len(m.group(1))
            base = None
            for j in range(0, levels_start+1):
                bm = re.match(r'^(\s*)levels:\s*$', lines[j].rstrip())
                if bm:
                    base = len(bm.group(1))
                    break
            if base is not None and indent <= base:
                section_contents.append((levels_start, i-1, first_level_indent or 8))
                in_levels = False
                continue

# End of file
if in_levels:
    section_contents.append((levels_start, len(lines)-1, first_level_indent or 8))

print(f'Found {len(section_contents)} levels sections')

# Fix indentation within each section
for start, end, target_indent in section_contents:
    # target_indent is what the first - name: uses
    # We want all - name: to use target_indent
    # Properties should be at target_indent + 2
    # Scalar content should be at target_indent + 4
    
    for i in range(start+1, end+1):
        line = lines[i]
        stripped = line.rstrip()
        if not stripped:
            continue
        
        # Determine if this is a level list item, property, or content
        m = re.match(r'^(\s+)- name:', stripped)
        if m:
            indent = len(m.group(1))
            if indent != target_indent:
                # Adjust
                rest = stripped[indent:]
                lines[i] = ' ' * target_indent + rest
            continue
        
        m = re.match(r'^(\s+)(\w+):', stripped)
        if m:
            indent = len(m.group(1))
            expected = target_indent + 2
            if indent != expected:
                rest = stripped[indent:]
                lines[i] = ' ' * expected + rest
            continue
        
        # Content lines
        leading = len(stripped) - len(stripped.lstrip())
        if leading > 0:
            # Compute expected indent based on parent
            # Content should be at target_indent + 4
            expected = target_indent + 4
            if leading != expected and leading > target_indent + 2:
                # Only fix if clearly wrong
                if leading > expected:
                    rest = stripped[leading:]
                    lines[i] = ' ' * expected + rest

# Write fixed version
fixed_content = '\n'.join(lines)
with open('src/data/tracks.yaml.bak.fixed', 'w', encoding='utf-8', newline='\n') as f:
    f.write(fixed_content)
print('Written fixed backup')

# Now parse with PyYAML and extract Track 2
import yaml
try:
    with open('src/data/tracks.yaml.bak.fixed', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    print(f'Parsed OK: {len(data)} tracks')
    for t in data:
        total = sum(len(c['levels']) for c in t['chapters'])
        print(f'  {t["name"]}: {total} levels')
    
    if len(data) >= 2:
        track2 = data[1]
        
        # Remove id fields
        def clean_ids(obj):
            if isinstance(obj, dict):
                obj.pop('id', None)
                for v in obj.values():
                    clean_ids(v)
            elif isinstance(obj, list):
                for item in obj:
                    clean_ids(item)
        clean_ids(track2)
        
        # Write track2 as standalone YAML
        t2_yaml = yaml.dump([track2], default_flow_style=False, allow_unicode=True, sort_keys=False, indent=2, width=float('inf'))
        with open('src/data/track2.yaml', 'w', encoding='utf-8', newline='\n') as f:
            f.write(t2_yaml)
        print(f'\nTrack 2 ({track2["name"]}) extracted to track2.yaml')
except Exception as e:
    print(f'Parse error: {e}')
    import traceback
    traceback.print_exc()
    # Show lines around first error
    with open('src/data/tracks.yaml.bak.fixed', 'r', encoding='utf-8') as f:
        c = f.read()
    cl = c.split('\n')
    err_m = re.search(r'line (\d+)', str(e))
    if err_m:
        el = int(err_m.group(1))
        for j in range(max(0, el-2), min(len(cl), el+3)):
            spaces = len(cl[j]) - len(cl[j].lstrip())
            print(f'  {j+1}: ({spaces:2d}) {cl[j][:100]}')
