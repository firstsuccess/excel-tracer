param([string]$Package=(Join-Path $PSScriptRoot '..\..\dist\vsto\Setup.exe'))
$ErrorActionPreference='Stop'
if(-not(Test-Path -LiteralPath $Package)){throw 'Windows版ZIPをすべて展開してSetup.exeを起動してください / Extract the complete Windows ZIP and run Setup.exe.'}
$process=Start-Process -FilePath ([IO.Path]::GetFullPath($Package)) -Wait -PassThru -WindowStyle Hidden
if($process.ExitCode -ne 0){throw ('Setup failed: '+$process.ExitCode)}