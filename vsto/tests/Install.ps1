param([switch]$AllowLocalDevelopmentTrust)
$ErrorActionPreference='Stop'
if(-not $AllowLocalDevelopmentTrust){throw 'This integration test requires explicit permission to trust only this local test deployment with the Visual Studio build task.'}
Set-Location (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
$root=$PWD.Path;$out=Join-Path $root 'dist/verification/vsto';$setup=Join-Path $root 'dist/vsto/Setup.exe';$payload=Join-Path $root 'dist/vsto/payload'
$sign=Get-Content vsto/.signing/signing.json -Raw|ConvertFrom-Json
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$vs=(& $vswhere -products '*' -format json -utf8|ConvertFrom-Json)|Where-Object {Test-Path (Join-Path $_.installationPath ('MSBuild/Microsoft/VisualStudio/v'+$_.installationVersion.Split('.')[0]+'.0/OfficeTools/Microsoft.VisualStudio.Tools.Office.BuildTasks.dll'))}|Select-Object -First 1
$msbuild=Join-Path $vs.installationPath 'MSBuild/Current/Bin/MSBuild.exe'
$tasks=Join-Path $vs.installationPath ('MSBuild/Microsoft/VisualStudio/v'+$vs.installationVersion.Split('.')[0]+'.0/OfficeTools/Microsoft.VisualStudio.Tools.Office.BuildTasks.dll')
$hash=(Get-FileHash "$payload/Monja.vsto" -Algorithm SHA256).Hash.Substring(0,16)
$stage=Join-Path $env:LOCALAPPDATA "Monja/ReferenceTracer/Packages/$hash";$manifest=Join-Path $stage 'Monja.vsto'
$otherBefore=@(Get-ChildItem HKCU:\Software\Microsoft\Office\Excel\Addins -ErrorAction SilentlyContinue|Where-Object PSChildName -ne 'Monja'|ForEach-Object{Get-ItemProperty $_.PSPath|Select-Object PSChildName,Manifest,LoadBehavior}|ConvertTo-Json -Compress)
function TrustFixture {
 New-Item $stage -ItemType Directory -Force|Out-Null
 Copy-Item "$payload/*" $stage -Recurse -Force
 & $msbuild vsto/tests/InstallFixture.proj "/p:FixtureManifest=$manifest" "/p:CertificateThumbprint=$($sign.thumbprint)" "/p:OfficeBuildTasks=$tasks" /nologo /v:minimal
 if($LASTEXITCODE -ne 0){throw 'Fixture-specific development trust failed.'}
}
function RunSetup([string]$arguments){$p=Start-Process -FilePath $setup -ArgumentList $arguments -Wait -PassThru -WindowStyle Hidden -RedirectStandardError "$out/installer-stderr.txt";if($p.ExitCode -ne 0){throw "Setup exit: $($p.ExitCode)"};return $p.ExitCode}
$results=[ordered]@{trust='Visual Studio developer trust for exact local manifest only; no trusted-root import';firstUseTrustPrompt='not tested';utc=[DateTime]::UtcNow.ToString('o')}
TrustFixture
$results.installExit=RunSetup '/silent'
$registered=Get-ItemPropertyValue HKCU:\Software\Microsoft\Office\Excel\Addins\Monja -Name Manifest
if($registered -notlike '*AppData/Local/Monja/ReferenceTracer/Packages/*'){throw 'Installed deployment is not the packaged copy.'}
& "$out/HostSmoke.exe" 2>&1|Tee-Object "$out/InstalledHost.txt"
if($LASTEXITCODE -ne 0){throw 'Installed host test failed.'}
$results.installedHostExit=$LASTEXITCODE
$language=Get-ItemPropertyValue HKCU:\Software\Monja\ReferenceTracer -Name Language
$results.uninstallExit=RunSetup '/uninstall /silent'
if(Test-Path HKCU:\Software\Microsoft\Office\Excel\Addins\Monja){throw 'Monja registration remained after removal.'}
$results.preferenceRetained=$language -eq (Get-ItemPropertyValue HKCU:\Software\Monja\ReferenceTracer -Name Language)
if(-not $results.preferenceRetained){throw 'Language preference lost.'}
TrustFixture
$results.reinstallExit=RunSetup '/silent'
$otherAfter=@(Get-ChildItem HKCU:\Software\Microsoft\Office\Excel\Addins -ErrorAction SilentlyContinue|Where-Object PSChildName -ne 'Monja'|ForEach-Object{Get-ItemProperty $_.PSPath|Select-Object PSChildName,Manifest,LoadBehavior}|ConvertTo-Json -Compress)
$results.otherAddinsUnchanged=($otherBefore -join '') -eq ($otherAfter -join '')
if(-not $results.otherAddinsUnchanged){throw 'Other per-user add-in registrations changed.'}
$results|ConvertTo-Json|Tee-Object "$out/installer-results.json"
