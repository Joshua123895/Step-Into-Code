"""Iteratively fix YAML parse errors using PyYAML error messages."""
import re
import yaml
import sys

with open('src/data/tracks.yaml.bak', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

max_iterations = 50
for iteration in range(max_iterations):
    try:
        data = yaml.safe_load('\n'.join(lines))
        print(f'Parsed OK after {iteration} fixes')
        
        # Verify tracks
        print(f'Tracks: {len(data)}')
        for t in data:
            total = sum(len(c['levels']) for c in t['chapters'])
            print(f'  {t["name"]}: {total} levels')
        
        # Remove id fields
        def clean_ids(obj):
            if isinstance(obj, dict):
                obj.pop('id', None)
                for v in obj.values():
                    clean_ids(v)
            elif isinstance(obj, list):
                for item in obj:
                    clean_ids(item)
        clean_ids(data)
        
        # Write track2 separately
        track2 = data[1]
        t2_yaml = yaml.dump([track2], default_flow_style=False, allow_unicode=True, sort_keys=False, indent=2, width=float('inf'))
        with open('src/data/track2.yaml', 'w', encoding='utf-8', newline='\n') as f:
            f.write(t2_yaml)
        print(f'Track 2 ({track2["name"]}) saved to track2.yaml')
        sys.exit(0)
        
    except yaml.YAMLError as e:
        # Extract line number from error
        err_str = str(e)
        # PyYAML shows: 'line 5362, column 10'
        line_match = re.search(r'line (\d+)', err_str)
        col_match = re.search(r'column (\d+)', err_str)
        
        if not line_match:
            print(f'Could not extract line from error: {err_str}')
            # Show context
            for m in re.finditer(r'line \d+', err_str):
                print(f'  Found: {m.group()}')
            sys.exit(1)
        
        err_line = int(line_match.group(1))
        err_col = int(col_match.group(1)) if col_match else 0
        
        idx = err_line - 1  # 0-indexed
        if idx >= len(lines):
            print(f'Line {err_line} out of range')
            sys.exit(1)
        
        line = lines[idx]
        stripped = line.rstrip()
        leading = len(stripped) - len(stripped.lstrip())
        
        print(f'  Fix {iteration+1}: Line {err_line}, col {err_col}, indent={leading}: {stripped[:80]}')
        
        # Determine the fix based on context
        # Common errors:
        # 1. "- name:" at wrong indent (column should match other level items)
        # 2. "max:" at same indent as "tests:" content
        
        if '- name:' in stripped:
            # Level list item at wrong indent
            # Look backwards for the previous - name: in same section
            prev_level = None
            for j in range(idx-1, -1, -1):
                if '- name:' in lines[j]:
                    prev_level = j
                    break
            if prev_level is not None:
                prev_line = lines[prev_level].rstrip()
                prev_leading = len(prev_line) - len(prev_line.lstrip())
                # Fix current to match previous
                rest = stripped[leading:]
                lines[idx] = ' ' * prev_leading + rest
                print(f'    Fixed indent: {leading} -> {prev_leading}')
            else:
                # No previous found, try to use 8 spaces
                rest = stripped[leading:]
                lines[idx] = '        ' + rest
                print(f'    Fixed indent (default): {leading} -> 8')
        elif leading >= 12 and re.match(r'^\s*max:', stripped) and err_col <= leading + 5:
            # max: at wrong indent (it's at block content level instead of property level)
            # Find tests: in same level and match its indent
            for j in range(idx-1, -1, -1):
                pm = re.match(r'^(\s*)tests:', lines[j].rstrip())
                if pm:
                    target = len(pm.group(1))
                    rest = stripped[leading:]
                    lines[idx] = ' ' * target + rest
                    print(f'    Fixed max indent: {leading} -> {target}')
                    break
                pm2 = re.match(r'^(\s*)\w+:', lines[j].rstrip())
                if pm2:
                    target = len(pm2.group(1))
                    rest = stripped[leading:]
                    lines[idx] = ' ' * target + rest
                    print(f'    Fixed max indent (fallback): {leading} -> {target}')
                    break
        else:
            # Generic fix: reduce indent by 2
            if leading >= 2:
                rest = stripped[leading:]
                lines[idx] = ' ' * (leading - 2) + rest
                print(f'    Generic fix: {leading} -> {leading - 2}')
            else:
                print(f'    Cannot fix: leading={leading}')
                sys.exit(1)

print('Max iterations reached')
sys.exit(1)
