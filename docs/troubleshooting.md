# 困ったとき / Troubleshooting

## アドインを追加できない / Cannot add the add-in

Excelの互換性と組織のカスタムアドイン許可を確認してください。画面は公開HTTPSサイトから読み込みます。Node.js、ローカルサーバー、ユーザー証明書の追加は不要です。追加画面を利用できない場合は管理担当者へお問い合わせください。Excel内での追加・移動操作は未確認です。保存ファイルの解析は製品ページの「ファイル解析を開く」からブラウザーだけで利用できます。

Check Excel compatibility, custom add-in policy and access to the public HTTPS site. No Node.js, local server or extra user certificate is needed. Installation and navigation inside Excel remain unverified. Saved-file analysis is available directly in a browser.
## VSTOを追加できない / Cannot install VSTO

Windows版ZIP全体を展開してSetup.exeを起動してください。.NET Framework 4.8以降とVSTO Runtimeが必要です。自己署名のためOfficeの信頼確認が必要です。組織の制限で許可できない場合は管理担当者へお問い合わせください。証明書を信頼されたルートに自動追加しません。Node.jsは不要です。

Extract the entire Windows ZIP and run Setup.exe. Requires .NET Framework 4.8 or later and VSTO Runtime. The self-signed package requires an Office trust decision; organizational restrictions may block it. No trusted-root certificate is added. Node.js is not required.

## 結果が不足する / Missing results

対象、種類、キーワード、方向を確認し、編集後は再解析してください。下部の注意事項で動的参照や外部データの制限を確認できます。Office.jsのライブ解析は数式のみです。グラフ・ピボットには保存ファイルを追加します。VBAはOffice.js版では利用できません。

Check targets, types, keywords and direction. Reanalyze after edits. Review notices for unresolved references. Add saved files for Office.js chart/pivot analysis. VBA is unavailable in Office.js.

## VBAにアクセスできない / VBA access denied

VSTO拡張モードには、Excelの「VBAプロジェクトオブジェクトモデルへのアクセスを信頼する」が必要です。組織で許可されている場合のみExcelの設定画面で変更してください。再起動が必要な場合があります。アドインはこの設定を変更しません。保護されたプロジェクトは読み取りません。

Extended VSTO mode requires trusted VBA object-model access. Change Excel's setting only if permitted by your organization; restart may be required. The add-in does not change it. Protected projects are skipped.

## 移動できない / Navigation unavailable

ブックが開いているか、シートやグラフの名前が変わっていないか確認し再解析してください。Office.jsでは対象ブックをアクティブにしてアドインを開きます。取得できない位置は「場所をコピー」で確認できます。

Confirm the workbook is open and object names are unchanged, then reanalyze. Office.js requires the target workbook to be active. Copy locations when navigation is unavailable.

## 処理に時間がかかる / Slow analysis

対象ブックと種類を減らしてください。中止後に対象を絞って再解析できます。上限に達した入力は注意事項に表示されます。大きな参照範囲を個別セルへ展開することはありません。

Reduce target workbooks and types. Cancel and retry with fewer targets. Notices identify skipped or limited inputs. Large ranges are retained without expansion into individual cells.

