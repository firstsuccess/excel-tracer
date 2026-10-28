param([switch]$ExcelIntegration)
$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '..')
New-Item -ItemType Directory -Force dist\verification | Out-Null
& node node_modules\typescript\bin\tsc --noEmit
if($LASTEXITCODE -ne 0){throw 'Type checking failed'}
& node node_modules\tsx\dist\cli.mjs --test officejs\tests\*.test.ts 2>&1 | Tee-Object dist\verification\typescript-tests.txt
if($LASTEXITCODE -ne 0){throw 'TypeScript tests failed'}
& node scripts\icons.mjs
& node scripts\manifests.mjs
& node node_modules\vite\bin\vite.js build --config officejs\vite.config.ts 2>&1 | Tee-Object dist\verification\officejs-build.txt
if($LASTEXITCODE -ne 0){throw 'Web build failed'}
& .\scripts\build-vsto-core.ps1 2>&1 | Tee-Object dist\verification\csharp-tests.txt
if($ExcelIntegration){& .\dist\verification\ExcelIntegration.exe 2>&1 | Tee-Object dist\verification\excel-integration.txt;if($LASTEXITCODE -ne 0){throw 'Excel integration failed'}}
