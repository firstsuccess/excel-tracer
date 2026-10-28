$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '..')
New-Item -ItemType Directory -Force dist\vsto,dist\verification | Out-Null
$compiler=Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
& $compiler /nologo /target:library /out:dist\vsto\Monja.Core.dll /r:System.Core.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:Microsoft.CSharp.dll vsto\src\Model.cs vsto\src\FormulaParser.cs vsto\src\VbaParser.cs vsto\src\ExcelScanner.cs vsto\src\TracePane.cs
if($LASTEXITCODE -ne 0){throw 'Core compilation failed'}
Copy-Item dist\vsto\Monja.Core.dll dist\verification\Monja.Core.dll -Force
foreach($name in @('EngineTests','ExcelIntegration')){& $compiler /nologo ('/out:dist\verification\'+$name+'.exe') /r:dist\vsto\Monja.Core.dll /r:System.Core.dll /r:System.Windows.Forms.dll /r:Microsoft.CSharp.dll ('vsto\tests\'+$name+'.cs');if($LASTEXITCODE -ne 0){throw ($name+' compilation failed')}}
& .\dist\verification\EngineTests.exe
if($LASTEXITCODE -ne 0){throw 'Engine tests failed'}
