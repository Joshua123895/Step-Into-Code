with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fix_start = 834
fix_end = 2397

# Find all levels at 8 spaces and check their first property
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if not l:
        i += 1
        continue
    leading = len(l) - len(l.lstrip())
    content = l.lstrip()
    
    if content.startswith('- name:') and leading == 8:
        # Check next non-empty line
        j = i + 1
        while j < fix_end:
            nxt = lines[j].rstrip()
            if not nxt:
                j += 1
                continue
            nxt_lead = len(nxt) - len(nxt.lstrip())
            nxt_content = nxt.lstrip()
            if nxt_lead <= 8 and nxt_content.startswith('- name:'):
                break
            if nxt_lead == 9 and not nxt_content.startswith('- '):
                print(f'CaseB: line {i+1} ({content[:50]}...) -> first prop line {j+1} ({nxt_content[:50]}...) at lead=9')
                # Show context around this
                for k in range(i-1, min(i+3, fix_end)):
                    l_k = lines[k].rstrip('\n')
                    l_lead = len(l_k) - len(l_k.lstrip())
                    m = '>>>' if k == i or k == j else '   '
                    print(f'  {m} {k+1}: lead={l_lead} {l_k[:80]}')
                print()
                # Also check if the inner loop would break before fixing
                k = j
                while k < min(j+10, fix_end):
                    c = lines[k].rstrip()
                    if not c:
                        k += 1
                        continue
                    c_lead = len(c) - len(c.lstrip())
                    c_content = c.lstrip()
                    cond = (c_lead <= 8 and c_content.startswith('- name:'))
                    if cond:
                        print(f'  Would BREAK at line {k+1}: {c[:60]}')
                    k += 1
                print()
            break  # Move to next level
    i += 1

print('---')
print('Checking Case A targets too:')
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if not l:
        i += 1
        continue
    leading = len(l) - len(l.lstrip())
    content = l.lstrip()
    if content.startswith('- name:') and leading == 9:
        print(f'CaseA: line {i+1} ({content[:60]}...) at lead=9')
    i += 1
