# Loads .env.local then runs the daily OpusClip poster.
# Used by Windows Task Scheduler so the job always has OPUSCLIP_API_KEY.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$envFiles = @(
  (Join-Path $Root ".env.local"),
  (Join-Path $Root ".env")
)

foreach ($envFile in $envFiles) {
  if (-not (Test-Path $envFile)) { continue }
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $key = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim()
    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    if (-not [string]::IsNullOrWhiteSpace($key)) {
      [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
  }
}

if (-not $env:OPUSCLIP_API_KEY) {
  Write-Error "OPUSCLIP_API_KEY is missing. Add it to $Root\.env.local"
  exit 1
}

$logDir = Join-Path $Root "scripts\opusclip-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$logFile = Join-Path $logDir "run_$stamp.log"

Write-Host "Logging to $logFile"
node (Join-Path $Root "scripts\opusclip-daily-post.mjs") @args *>&1 |
  Tee-Object -FilePath $logFile

exit $LASTEXITCODE
