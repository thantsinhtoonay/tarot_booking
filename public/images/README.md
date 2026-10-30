# Image assets — place your local files in these folders with these exact names

| Asset | Target path | Used for |
|-------|-------------|----------|
| **Site logo** | `public/images/brand/logo.png` | Header / footer / favicon source |
| **Astrologer photo** (Bhone Thaw) | `public/images/astrologer/bhone-thaw.png` | About section, admin avatar |
| **Your photo** (developer) | `public/images/developer/developer.png` | About → Developer section |
| Full tarot deck | `public/images/tarot/*.jpg` | 78 RWS cards (Major + 4 suits) — picker |
| Optional: favicon | `public/favicon.ico` | Browser tab |

## How to rename from your PC (Windows)

1. Copy your files into the matching folder above.
2. Rename them exactly as shown (keep or change extension to match, e.g. `.jpg` → then use `logo.jpg` in code).
3. Or PowerShell example:

```powershell
# Adjust source paths to where your files are
Copy-Item "C:\Users\YOU\Pictures\my-logo.png"  "D:\assignment\tarot_booking\public\images\brand\logo.png"
Copy-Item "C:\Users\YOU\Pictures\bhone.jpg"     "D:\assignment\tarot_booking\public\images\astrologer\bhone-thaw.png"
Copy-Item "C:\Users\YOU\Pictures\me.jpg"        "D:\assignment\tarot_booking\public\images\developer\developer.png"
```

## Recommended sizes

| Asset | Size | Notes |
|-------|------|-------|
| `logo.png` | ≥ 512×512 | Transparent background preferred |
| `bhone-thaw.png` | ≥ 800×1000 (portrait) | Clear face shot |
| `developer.png` | ≥ 400×400 (square) | Headshot |

`.jpg` / `.jpeg` / `.webp` also work — just keep the filename extension in sync with the `src` paths in code.
