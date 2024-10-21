# host-url-updater.ps1
# Updated podcast-feed with new hosting and file names, based on config file and the list of new file names.
# Run "Get-ChildItem -Path . -Filter *.mp3 -Name > list-of-episodes.txt" to create the list in the folder with all the mp3 files 

# Load the configuration file
$configFile = "host-url-updater-config.json"
$config = Get-Content $configFile | ConvertFrom-Json

# Resolve relative paths to absolute paths
$episodeListFile = Resolve-Path $config.episodeListFile
$newBaseUrl = $config.newBaseUrl
$xmlFile = Resolve-Path $config.xmlFile

# Handle output file path
$outputFile = $config.outputFile
$outputFileFullPath = Join-Path (Get-Location) $outputFile

# Ensure the directory for the output file exists
$outputDir = Split-Path $outputFileFullPath
if (-not (Test-Path $outputDir)) {
    Write-Host "Creating directory: $outputDir"
    New-Item -Path $outputDir -ItemType Directory | Out-Null
}

# Load XML file with UTF-8 encoding
[xml]$xmlDoc = [xml](Get-Content $xmlFile -Encoding UTF8)

# Load the episode list and build the episode mapping
$episodeMap = @{}
Get-Content $episodeListFile | ForEach-Object {
    if ($_ -match 'techlife-\d+-.*\.mp3') {
        $fileName = $_.Trim()
        $episodeNumber = ($fileName -split '-')[1].TrimStart('0')  # Remove leading zeros
        Write-Host "Loaded episode number: $episodeNumber from file: $fileName"
        $episodeMap[$episodeNumber] = $fileName
    }
}

# Update the XML with new URLs
$xmlDoc.rss.channel.item | ForEach-Object {
    $title = $_.title.InnerText

    # Extract the episode number using a specific pattern #XXX:
    if ($title -match '#(\d+):') {
        $episodeNumber = $matches[1].TrimStart('0')  # Remove leading zeros
        Write-Host "Parsed episode number from title: $episodeNumber"

        if ($episodeMap.ContainsKey($episodeNumber)) {
            $newFileName = $episodeMap[$episodeNumber]
            $newUrl = "$newBaseUrl$newFileName"
            
            $enclosure = $_.enclosure
            if ($enclosure.url -match $config.oldHost) {
                Write-Host "Updating episode ${episodeNumber}: $($enclosure.url) -> $newUrl"
                $enclosure.url = $newUrl
            } else {
                Write-Host "Skipping episode ${episodeNumber}: No $($config.oldHost) URL found."
            }
        } else {
            Write-Host "No matching episode found for episode number ${episodeNumber}"
        }
    } else {
        Write-Host "Could not extract episode number from title: $title"
    }
}

# Save the updated XML file with UTF-8 encoding
$xmlDoc.Save([System.IO.StreamWriter]::new($outputFileFullPath, $false, [System.Text.Encoding]::UTF8))
Write-Host "Updated podcast feed saved to $outputFileFullPath"
