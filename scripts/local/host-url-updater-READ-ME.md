# Podcast Feed Host URL Updater

This script (host-url-updater.ps1) updates the host URLs in a podcast feed XML file, replacing URLs from one host (e.g., SoundCloud) with URLs from another host.

## Prerequisites

- PowerShell (Windows) or PowerShell Core (macOS/Linux)
  - On macOS: `brew install powershell`
  - On Windows: PowerShell is installed by default

## Files Required

1. `host-url-updater.ps1` - The main script
2. `host-url-updater-config.json` - Configuration file
3. `list-of-episodes.txt` - List of episode MP3 filenames

### Configuration File Structure

```json
{
    "episodeListFile": "list-of-episodes.txt",
    "newBaseUrl": "https://media.techlifepodcast.com/e/",
    "xmlFile": "../../public/podcast-feed.xml",
    "oldHost": "soundcloud.com",
    "outputFile": "../../public/updated-podcast-feed.xml"
}
```

## Preparing the Episode List

### On macOS/Linux:

Navigate to the directory containing your MP3 files

```bash
cd /path/to/mp3/files
```

Create a list of all MP3 files

```bash
ls *.mp3 > /path/to/script/directory/list-of-episodes.txt
```

### On Windows:

Navigate to the directory containing your MP3 files

```powershell
cd C:\path\to\mp3\files
```

Create a list of all MP3 files

```powershell
dir *.mp3 /b > C:\path\to\script\directory\list-of-episodes.txt
```

## Running the Script

1. Place all required files in the script directory
2. Open PowerShell/Terminal
3. Navigate to the script directory
4. Run the script:

Windows
```powershell
.\host-url-updater.ps1
```

macOS/Linux
```powershell
pwsh ./host-url-updater.ps1
```

## File Organization

scripts/
└── local/
    ├── host-url-updater.ps1
    ├── host-url-updater-config.json
    └── list-of-episodes.txt
public/
├── podcast-feed.xml
└── updated-podcast-feed.xml (will be created)

## Notes

- The script preserves Unicode characters and emojis in the XML file
- Episodes are matched by their number in the title (e.g., "#42:")
- The script will create the output directory if it doesn't exist
- Existing output files will be overwritten