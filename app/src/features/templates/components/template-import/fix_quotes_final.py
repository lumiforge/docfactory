#!/usr/bin/env python3

with open('template-import-dialog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific problematic text
content = content.replace(
    'Переименовать новый шаблон (добавить "(импорт)")',
    'Переименовать новый шаблон (добавить "(импорт)")'
)

with open('template-import-dialog.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed quotes in template-import-dialog.tsx")