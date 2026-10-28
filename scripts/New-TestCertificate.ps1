$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$dir=New-Item -ItemType Directory -Force .certs
$rsa=[Security.Cryptography.RSA]::Create(2048)
$request=[Security.Cryptography.X509Certificates.CertificateRequest]::new('CN=localhost',$rsa,[Security.Cryptography.HashAlgorithmName]::SHA256,[Security.Cryptography.RSASignaturePadding]::Pkcs1)
$san=[Security.Cryptography.X509Certificates.SubjectAlternativeNameBuilder]::new()
$san.AddDnsName('localhost')
$request.CertificateExtensions.Add($san.Build())
$cert=$request.CreateSelfSigned([DateTimeOffset]::Now.AddMinutes(-1),[DateTimeOffset]::Now.AddDays(1))
try{
 $password=[guid]::NewGuid().ToString('N')
 [IO.File]::WriteAllBytes((Join-Path $dir.FullName 'test.pfx'),$cert.Export([Security.Cryptography.X509Certificates.X509ContentType]::Pfx,$password))
 [IO.File]::WriteAllBytes((Join-Path $dir.FullName 'test.cer'),$cert.Export([Security.Cryptography.X509Certificates.X509ContentType]::Cert))
 @{pfx=(Join-Path $dir.FullName 'test.pfx');password=$password;port=3009}|ConvertTo-Json|Set-Content .certs\server.json
}finally{$cert.Dispose();$rsa.Dispose()}
