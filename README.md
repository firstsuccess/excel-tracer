# もんじゃExcel参照トレーサー

**Monja Excel Reference Tracer** は、セルの変更影響を調べるための参照調査ツールです。参照元から参照先への関係を一覧表示し、直接参照・間接参照、確定・推定・判定不能を区別します。Excelファイル、数式、VBAコードを外部へ送信しません。

- Office.js版：インストール不要のファイル解析Webサイト、またはマニフェストのインストールが必要なWeb版Excelで、現在のブックの数式、利用者が選んだ保存済み.xlsx/.xlsmの数式・グラフ系列・ピボットソースを調査します。
- 日本語／英語切替、絞り込み、並べ替え、結果からの移動、場所のコピー、UTF-8 BOM付きCSV出力に対応します。
- Office.js版ではVBAを調査できません。ライブ解析だけではグラフ・ピボットを取得しません。保存ファイルを追加してください。
- VSTO版：Windows版Excelで、同じExcelインスタンスの複数ブックの数式・VBA・グラフ・ピボットを調査します。[Windows版の配布ZIP](dist/monja-vsto-1.0.2.zip)を展開してSetup.exeを起動してください。Node.jsは不要です。自己署名版のためOfficeの信頼確認が必要です。

[インストール方法](docs/installation-ja.md)、[操作説明](docs/user-guide-ja.md)、[困ったとき](docs/troubleshooting.md)をご確認ください。ブラウザーでの保存ファイル解析は、Node.jsやユーザー証明書の追加なしで利用できます。Excelと組織の設定によっては、カスタムアドインを追加できません。

Workbook contents stay local. Dynamic references and external data may be incomplete. Read the [installation guide](docs/installation-en.md) and [user guide](docs/user-guide-en.md) for supported features and limits. The Windows VSTO package includes a per-user installer. It is self-signed and requires an Office trust decision.

