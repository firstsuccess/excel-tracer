param()
$ErrorActionPreference='Stop'
$setup=Join-Path $env:LOCALAPPDATA 'Monja\ReferenceTracer\Setup.exe'
if(-not(Test-Path -LiteralPath $setup)){throw 'このユーザーのインストールが見つかりません / No installation for this user was found.'}
$process=Start-Process -FilePath $setup -ArgumentList '/uninstall' -Wait -PassThru -WindowStyle Hidden
if($process.ExitCode -ne 0){throw ('Uninstall failed: '+$process.ExitCode)}