with open('template-import-dialog.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    line = lines[338]
    print('Line 339 contains &quot:', '"' in line)
    print('Line 339 repr:', repr(line))