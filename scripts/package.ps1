$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$destination=[IO.Path]::GetFullPath('dist\package')
$expected=[IO.Path]::GetFullPath('dist')+[IO.Path]::DirectorySeparatorChar
if(-not $destination.StartsWith($expected,[StringComparison]::OrdinalIgnoreCase)){throw 'Unexpected package path'}
if(Test-Path -LiteralPath $destination){Remove-Item -LiteralPath $destination -Recurse -Force}
New-Item -ItemType Directory -Force -Path $destination,(Join-Path $destination 'docs') | Out-Null
Copy-Item README.md -Destination $destination
Copy-Item docs\*.md -Destination (Join-Path $destination 'docs')
Copy-Item officejs\manifests\manifest-production.xml -Destination (Join-Path $destination 'monja-office-manifest.xml')
@"
[InternetShortcut]
URL=https://excel.mnoda1979.chatgpt.site/trace/app/
"@ | Set-Content -LiteralPath (Join-Path $destination 'Open-Monja.url') -Encoding ASCII
@"
[InternetShortcut]
URL=https://excel.mnoda1979.chatgpt.site/trace/#install
"@ | Set-Content -LiteralPath (Join-Path $destination 'Installation-guide.url') -Encoding ASCII
Compress-Archive -Path (Join-Path $destination '*') -DestinationPath dist\Monja-user-package.zip -Force
Copy-Item -LiteralPath dist\Monja-user-package.zip -Destination dist\Monja-local-package.zip -Force

