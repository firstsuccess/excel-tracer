$ErrorActionPreference='Stop'
$destination=[IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Monja\OfficeJS'))
$expected=[IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Monja'))+[IO.Path]::DirectorySeparatorChar
if (-not $destination.StartsWith($expected,[StringComparison]::OrdinalIgnoreCase)) {throw 'Unexpected installation path'}
$config=Join-Path $destination 'server.json'
if(Test-Path -LiteralPath $config){$state=Get-Content -LiteralPath $config -Raw | ConvertFrom-Json; $thumb=$state.thumbprint;if($thumb -notmatch '^[A-Fa-f0-9]{40}$'){throw 'Invalid certificate identifier'};foreach($store in @('My','Root')){$path='Cert:\CurrentUser\'+$store+'\'+$thumb;if(Test-Path -LiteralPath $path){Remove-Item -LiteralPath $path}}}
if(Test-Path -LiteralPath $destination){Remove-Item -LiteralPath $destination -Recurse -Force}
Write-Host 'Removed local files and the recorded Monja certificate. Remove the add-in from Excel as well. Close the local server before uninstalling.'
