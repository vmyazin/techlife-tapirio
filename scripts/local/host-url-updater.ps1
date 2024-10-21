# host-url-updater.ps1
# Updated podcast-feed with new hosting and file names, based on config file and the list of new file names.
# Run "Get-ChildItem -Path . -Filter *.mp3 -Name > list-of-episodes.txt" to create the list in the folder with all the mp3 files 

# Read the config file
$config = Get-Content -Raw -Path "host-url-updater-config.json" | ConvertFrom-Json

# Convert relative paths to absolute paths
$scriptDir = $PSScriptRoot
$episodeListFile = Join-Path $scriptDir $config.episodeListFile
$xmlFile = Join-Path $scriptDir $config.xmlFile
$outputFile = Join-Path $scriptDir $config.outputFile

# Read the episode list file
$episodeList = Get-Content -Path $episodeListFile

# Read the XML file
[xml]$xml = Get-Content -Path $xmlFile -Encoding UTF8

# Create a hashtable to store episode numbers and filenames
$episodeMap = @{}
foreach ($episode in $episodeList) {
    if ($episode -match "techlife-(\d+)-.*\.mp3") {
        $episodeNumber = [int]$Matches[1]
        $episodeMap[$episodeNumber] = $episode
    }
}

# Update the enclosure URLs in the XML
foreach ($item in $xml.rss.channel.item) {
    $enclosure = $item.enclosure
    $url = $enclosure.url

    if ($url -like "*$($config.oldHost)*") {
        # Extract episode number from the title
        if ($item.title -match "#(\d+):") {
            $episodeNumber = [int]$Matches[1]
            
            if ($episodeMap.ContainsKey($episodeNumber)) {
                $newFileName = $episodeMap[$episodeNumber]
                $newUrl = "$($config.newBaseUrl)$newFileName"
                $enclosure.SetAttribute("url", $newUrl)
            }
        }
    }
}

# Ensure the output directory exists
$outputDir = Split-Path -Parent $outputFile
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Save the updated XML
$xmlSettings = New-Object System.Xml.XmlWriterSettings
$xmlSettings.Indent = $true
$xmlSettings.IndentChars = "  "
$xmlSettings.Encoding = [System.Text.Encoding]::UTF8

try {
    $xmlWriter = [System.Xml.XmlWriter]::Create($outputFile, $xmlSettings)
    $xml.Save($xmlWriter)
}
catch {
    Write-Error "An error occurred while saving the XML file: $_"
}
finally {
    if ($xmlWriter) {
        $xmlWriter.Dispose()
    }
}

Write-Host "Podcast feed XML has been updated and saved to $outputFile"