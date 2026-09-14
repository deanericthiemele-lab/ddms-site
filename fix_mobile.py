import os
import glob

mobile_css = """
@media (max-width: 600px) {
  .portal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .portal-logo-sub { font-size: 18px; }
  .portal-header > div:last-child {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .badge-year { font-size: 10px; padding: 4px 10px; }
  body { padding: 1rem 0.75rem; }
  table { font-size: 12px; }
  th, td { padding: 6px 8px !important; }
}
"""

folder = r"C:\Users\MBKZ6901\Documents\GitHub\ddms-site"
files = glob.glob(os.path.join(folder, "*.html"))

fixed = 0
skipped = 0

for path in files:
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        changed = False

        # Ajouter viewport si absent
        if 'name="viewport"' not in content:
            content = content.replace(
                '<meta charset="utf-8"/>',
                '<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            )
            # fallback si charset différent
            if 'name="viewport"' not in content:
                content = content.replace(
                    '<head>',
                    '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">'
                )
            changed = True

        # Ajouter CSS mobile si absent
        if '@media (max-width: 600px)' not in content and '</style>' in content:
            content = content.replace('</style>', mobile_css + '</style>', 1)
            changed = True

        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed += 1
            print(f"✅ {os.path.basename(path)}")
        else:
            skipped += 1

    except Exception as e:
        print(f"❌ {os.path.basename(path)}: {e}")

print(f"\n{fixed} fichiers corrigés, {skipped} déjà OK")
