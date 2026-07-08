"""Fix indentation inconsistencies in tracks.yaml.

Strategy: for each chapter's levels section, normalize all level list items
to 8 spaces and their properties to 10 spaces (2-space increments).
"""
import re
import sys

with open('src/data/tracks.yaml', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# Find all "levels:" sections and the indent of their first "- name:" entry
# Then normalize to: levels list item at 8, properties at 10, content at 12+

sections = []  # list of (start_line, end_line, level_indent)
in_levels = False
levels_start = None
first_level_indent = None

for i, line in enumerate(lines):
    stripped = line.rstrip()
    if not in_levels:
        m = re.match(r'^(\s*)levels:\s*$', stripped)
        if m:
            in_levels = True
            levels_start = i
            first_level_indent = None
            # Look ahead for first "- name:"
            for j in range(i+1, min(i+5, len(lines))):
                m2 = re.match(r'^(\s*)- name:', lines[j])
                if m2:
                    first_level_indent = len(m2.group(1))
                    break
    else:
        # Check if we've left the levels section
        # A line with same or less indentation than the "levels:" key indicates end
        if i > levels_start + 1:
            # Find the indent of "levels:" line
            levels_indent_match = re.match(r'^(\s*)levels:\s*$', lines[levels_start])
            if levels_indent_match:
                base_indent = len(levels_indent_match.group(1))
                # A non-blank, non-comment line with indentation <= base_indent means end
                if stripped and not stripped.startswith('#'):
                    leading = len(stripped) - len(stripped.lstrip())
                    if leading <= base_indent:
                        # End of levels section
                        sections.append((levels_start, i-1, first_level_indent))
                        in_levels = False
                        continue

        # Check for start of another levels section (nested? shouldn't happen)
        m3 = re.match(r'^(\s*)levels:\s*$', stripped)
        if m3 and i > levels_start + 1:
            sections.append((levels_start, i-1, first_level_indent))
            levels_start = i
            first_level_indent = None
            for j in range(i+1, min(i+5, len(lines))):
                m2 = re.match(r'^(\s*)- name:', lines[j])
                if m2:
                    first_level_indent = len(m2.group(1))
                    break

# End of file is also end of last section
if in_levels and levels_start is not None:
    sections.append((levels_start, len(lines)-1, first_level_indent))

print(f"Found {len(sections)} levels sections")
for s in sections:
    print(f"  Lines {s[0]+1}-{s[1]+1}: level indent = {s[2]}")

# Now reconstruct the file, normalizing each section
output = []
in_section = False
current_section = None
section_processed = False

for i, line in enumerate(lines):
    stripped = line.rstrip()
    
    # Check if this line starts a section
    section_match = None
    for s in sections:
        if i == s[0]:
            section_match = s
            break
    
    if section_match:
        # We're entering a levels section
        current_section = section_match
        in_section = True
        section_processed = False
        output.append(line + '\n')
        continue
    
    if in_section and not section_processed:
        # Process all lines in this section
        start, end, level_indent = current_section
        if level_indent is None:
            level_indent = 8  # default
        
        # Determine shift: we want level list items at 8 spaces
        shift = 8 - level_indent if level_indent else 0
        
        # Process each line in the section (skip the "levels:" line itself)
        for j in range(start+1, end+1):
            l = lines[j]
            s = l.rstrip()
            
            if not s:
                output.append('\n')
                continue
            
            leading = len(s) - len(s.lstrip())
            new_leading = leading + shift
            if new_leading < 0:
                new_leading = 0
            
            output.append(' ' * new_leading + s.lstrip() + '\n')
        
        section_processed = True
        in_section = False
        continue
    
    if not in_section:
        output.append(line + '\n')

# Write the fixed content
fixed_content = ''.join(output)
with open('src/data/tracks.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.write(fixed_content)

print('\nFile re-written. Testing parse...')

# Test parse
import yaml
try:
    with open('src/data/tracks.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    print('YAML parses OK!')
    
    # Basic validation
    for i, track in enumerate(data):
        total = sum(len(c['levels']) for c in track['chapters'])
        print(f"Track {i+1}: {track['name']} - {len(track['chapters'])} chapters, {total} levels, multiple of 10: {total % 10 == 0}")
        for ci, chapter in enumerate(track['chapters']):
            levels = chapter['levels']
            last_is_example = 'example' in levels[-1] and 'obj' not in levels[-1]
            print(f"  Ch{ci+1}: {chapter['name']} - {len(levels)} levels, last has example: {'yes' if last_is_example else 'no'}")
except Exception as e:
    print(f'Parse error: {e}')
    # Show the problem area
    with open('src/data/tracks.yaml', 'r', encoding='utf-8') as f:
        c = f.read()
    lines_c = c.split('\n')
    err_match = re.search(r'line (\d+)', str(e))
    if err_match:
        err_line = int(err_match.group(1))
        for j in range(max(0, err_line-3), min(len(lines_c), err_line+3)):
            mark = '>>>' if j == err_line-1 else '   '
            print(f'{mark} {j+1}: {lines_c[j][:100]}')
