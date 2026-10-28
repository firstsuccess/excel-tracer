param([string]$CertificateThumbprint,[switch]$CreateDevelopmentCertificate)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
Set-Location $root
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
if(-not(Test-Path $vswhere)){throw 'Visual Studio Installer is required.'}
$instance=(& $vswhere -products '*' -format json -utf8|ConvertFrom-Json)|Where-Object {Test-Path (Join-Path $_.installationPath ('MSBuild\Microsoft\VisualStudio\v'+$_.installationVersion.Split('.')[0]+'.0\OfficeTools\Microsoft.VisualStudio.Tools.Office.targets'))}|Select-Object -First 1
if(-not $instance){throw 'Visual Studio Office development tools are required.'}
$vs=$instance.installationPath
$msbuild=Join-Path $vs 'MSBuild\Current\Bin\MSBuild.exe'
$csc=Join-Path $vs 'MSBuild\Current\Bin\Roslyn\csc.exe'
$version=$instance.installationVersion.Split('.')[0]+'.0'
$targets=Join-Path $vs "MSBuild\Microsoft\VisualStudio\v$version\OfficeTools\Microsoft.VisualStudio.Tools.Office.targets"
if(-not(Test-Path $targets)){throw 'Visual Studio Office development tools are required.'}
$signing=Join-Path $PSScriptRoot '.signing'
if(-not $CertificateThumbprint -and (Test-Path "$signing/signing.json")){$CertificateThumbprint=(Get-Content "$signing/signing.json" -Raw|ConvertFrom-Json).thumbprint}
if(-not $CertificateThumbprint -and $CreateDevelopmentCertificate){
 New-Item $signing -ItemType Directory -Force|Out-Null
 $cert=New-SelfSignedCertificate -Subject 'CN=Monja Local Distribution' -Type CodeSigningCert -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(2) -HashAlgorithm SHA256
 $CertificateThumbprint=$cert.Thumbprint
 @{thumbprint=$cert.Thumbprint;selfSigned=$true;subject=$cert.Subject}|ConvertTo-Json|Set-Content "$signing/signing.json" -Encoding utf8
 Export-Certificate -Cert $cert -FilePath "$signing/Monja.cer"|Out-Null
}
if(-not $CertificateThumbprint){throw 'Specify a code-signing certificate thumbprint or -CreateDevelopmentCertificate.'}
New-Item $signing -ItemType Directory -Force|Out-Null
if($CertificateThumbprint -notmatch '^[A-Fa-f0-9]{40}$'){throw 'Invalid signing certificate thumbprint.'}
@"
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003"><PropertyGroup><ManifestCertificateThumbprint Condition="'`$(ManifestCertificateThumbprint)'==''">$CertificateThumbprint</ManifestCertificateThumbprint></PropertyGroup></Project>
"@ | Set-Content "$signing/Signing.props" -Encoding utf8
$out=Join-Path $root 'dist/vsto';$verification=Join-Path $root 'dist/verification/vsto'
New-Item $out,$verification -ItemType Directory -Force|Out-Null
& $msbuild vsto/src/Monja.csproj /t:Publish /p:Configuration=Release "/p:VisualStudioVersion=$version" "/p:ManifestCertificateThumbprint=$CertificateThumbprint" "/p:PublishDir=$out\" /v:minimal /nologo "/bl:$verification/build.binlog"
if($LASTEXITCODE -ne 0){throw 'VSTO publish failed.'}
$payload=Join-Path $out 'payload'
if(Test-Path -LiteralPath $payload){
 if([IO.Path]::GetFullPath($payload) -ne (Join-Path $root 'dist/vsto/payload') -or ((Get-Item -LiteralPath $payload).Attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'Unexpected payload path.'}
 Remove-Item -LiteralPath $payload -Recurse -Force
}
New-Item $payload -ItemType Directory -Force|Out-Null
Copy-Item "$out/Monja.vsto" "$payload/Monja.vsto" -Force
[xml]$deployment=Get-Content "$out/Monja.vsto" -Raw
$codebase=$deployment.SelectSingleNode("/*[local-name()='assembly']/*[local-name()='dependency']/*[local-name()='dependentAssembly']/@codebase").Value
$applicationFolder=Split-Path (Join-Path $out $codebase) -Parent
New-Item "$payload/Application Files" -ItemType Directory -Force|Out-Null
Copy-Item -LiteralPath $applicationFolder -Destination "$payload/Application Files" -Recurse -Force
& $csc /nologo /target:winexe "/out:$out/Setup.exe" /win32manifest:vsto/installer/Setup.manifest /r:System.Windows.Forms.dll /r:System.Drawing.dll vsto/installer/Setup.cs
if($LASTEXITCODE -ne 0){throw 'Setup compilation failed.'}
Copy-Item vsto/installer/user-guide.txt "$out/利用ガイド.txt" -Force
$cert=Get-Item "Cert:/CurrentUser/My/$CertificateThumbprint"
$signature=Set-AuthenticodeSignature -FilePath "$out/Setup.exe" -Certificate $cert -HashAlgorithm SHA256
if(-not $signature.SignerCertificate -or $signature.SignerCertificate.Thumbprint -ne $CertificateThumbprint){throw 'Setup signing failed.'}
@{thumbprint=$CertificateThumbprint;status=$signature.Status.ToString();statusMessage=$signature.StatusMessage;trustedRootImported=$false}|ConvertTo-Json|Set-Content "$verification/installer-signature.json" -Encoding utf8
Export-Certificate -Cert $cert -FilePath "$out/Publisher.cer"|Out-Null
Compress-Archive -LiteralPath "$out/Setup.exe",$payload,"$out/利用ガイド.txt","$out/Publisher.cer" -DestinationPath dist/monja-vsto-1.0.2.zip -Force
Get-FileHash "$out/Setup.exe","$out/Monja.vsto",dist/monja-vsto-1.0.2.zip -Algorithm SHA256 | Select-Object Path,Hash | ConvertTo-Json | Set-Content "$verification/package-hashes.json" -Encoding utf8
Write-Output 'VSTO package: dist/monja-vsto-1.0.2.zip'
