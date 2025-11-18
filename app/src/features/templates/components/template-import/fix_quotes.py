#!/usr/bin/env python3

with open('template-import-dialog.tsx', 'r') as f:
    lines = f.readlines()

# Fix line 339 to include proper HTML entities for quotes
lines[338] = '                                    Переименовать новый шаблон (добавить "(импорт)")\n'

with open('template-import-dialog.tsx', 'w') as f:
    f.writelines(lines)

print("Fixed quotes in template-import-dialog.tsx")