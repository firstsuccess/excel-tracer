param([switch]$Excel)
$ErrorActionPreference='Stop'
Set-Location (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
$vs=(& $vswhere -products '*' -format json -utf8|ConvertFrom-Json)|Where-Object {Test-Path (Join-Path $_.installationPath 'MSBuild/Current/Bin/Roslyn/csc.exe')}|Select-Object -First 1
$csc=Join-Path $vs.installationPath 'MSBuild/Current/Bin/Roslyn/csc.exe'
$out=Join-Path $PWD 'dist/verification/vsto';New-Item $out -ItemType Directory -Force|Out-Null
Copy-Item vsto/src/bin/Release/Monja.dll "$out/Monja.dll" -Force
$cases=@(
 @{Name='EngineTests';Refs=@()},
 @{Name='LayoutTests';Refs=@('System.Windows.Forms.dll','System.Drawing.dll')},
 @{Name='UnsupportedApiTests';Refs=@('System.Windows.Forms.dll','System.Drawing.dll')},
 @{Name='SavedVbaTests';Refs=@('System.IO.Compression.dll','System.IO.Compression.FileSystem.dll')}
)
if($Excel){$cases+=@(
 @{Name='ExcelIntegration';Refs=@('Microsoft.CSharp.dll','System.Windows.Forms.dll')},
 @{Name='LiveStress';Refs=@('Microsoft.CSharp.dll','System.Windows.Forms.dll','System.IO.Compression.dll','System.IO.Compression.FileSystem.dll','System.Xml.Linq.dll')},
 @{Name='HostSmoke';Refs=@('Microsoft.CSharp.dll')}
)}
$results=@()
foreach($case in $cases){
 $name=$case.Name;$arguments=@('/nologo',"/out:$out/$name.exe","/r:$out/Monja.dll")+@($case.Refs|ForEach-Object{"/r:$_"})+"vsto/tests/$name.cs"
 & $csc @arguments
 if($LASTEXITCODE -ne 0){throw "Test compile failed: $name"}
 $watch=[Diagnostics.Stopwatch]::StartNew()
 & "$out/$name.exe" 2>&1|Tee-Object -FilePath "$out/$name.txt"
 $code=$LASTEXITCODE
 $results+=@{test=$name;exitCode=$code;elapsedMs=$watch.ElapsedMilliseconds;utc=[DateTime]::UtcNow.ToString('o')}
 $results|ConvertTo-Json|Set-Content "$out/results.json" -Encoding utf8
 if($code -ne 0){throw "Test failed: $name"}
}
