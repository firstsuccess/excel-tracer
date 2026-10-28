param([string]$DataRoot=(Join-Path $env:LOCALAPPDATA 'Monja'))
$ErrorActionPreference='Stop'
$base=[IO.Path]::GetFullPath($DataRoot)
$destination=[IO.Path]::GetFullPath((Join-Path $base 'OfficeJSHosted'))
if((Split-Path $destination -Leaf) -ne 'OfficeJSHosted' -or (Split-Path $destination -Parent) -ne $base.TrimEnd('\')){throw 'Unexpected installation path'}
if(Test-Path -LiteralPath $destination){Remove-Item -LiteralPath $destination -Recurse -Force}
Write-Host 'Removed the prepared browser shortcut and manifest. If added to Excel, remove the add-in from Excel separately. Workbooks and certificates were not changed.'

