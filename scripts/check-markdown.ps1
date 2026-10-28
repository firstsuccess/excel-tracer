$ErrorActionPreference='Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$files=Get-ChildItem -LiteralPath . -Recurse -File -Filter '*.md'
$forbidden='(?i)\bTODO\b|SKILL\.md|AGENTS\.md|npm (?:install|run|test)|dotnet build|msbuild|開発環境|内部アーキテクチャ|ビルド手順|テスト実行手順|今後対応|追加予定|公開予定|登録予定|審査状況|Codexへの指示'
$matches=@($files | Select-String -Pattern $forbidden)
if($matches.Count -gt 0){$matches | ForEach-Object {Write-Error ($_.Path+':'+$_.LineNumber)};throw 'Markdown audit failed'}
@{status='passed';files=@($files | ForEach-Object {$_.FullName});contentRule='user information only; no developer instructions or publication plans';checkedAt=(Get-Date).ToString('o')} | ConvertTo-Json -Depth 4 | Set-Content dist\verification\markdown-audit.json -Encoding utf8
Write-Host ('Markdown audit passed: '+$files.Count+' files')
