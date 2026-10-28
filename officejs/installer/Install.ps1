param([string]$DataRoot=(Join-Path $env:LOCALAPPDATA 'Monja'))
$ErrorActionPreference='Stop'
$destination=Join-Path ([IO.Path]::GetFullPath($DataRoot)) 'OfficeJSHosted'
$manifest=Join-Path $PSScriptRoot '..\manifests\manifest-production.xml'
if(-not(Test-Path -LiteralPath $manifest)){throw 'Hosted manifest is missing.'}
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -LiteralPath $manifest -Destination (Join-Path $destination 'monja-office-manifest.xml') -Force
@"
[InternetShortcut]
URL=https://excel.mnoda1979.chatgpt.site/trace/app/
"@ | Set-Content -LiteralPath (Join-Path $destination 'Monja.url') -Encoding ASCII
Write-Host ('Prepared browser shortcut and Excel manifest: '+$destination)
Write-Host 'Open Monja.url for browser analysis. To use inside Excel, add the manifest through Excel. This script does not register an Excel add-in or change certificates.'

