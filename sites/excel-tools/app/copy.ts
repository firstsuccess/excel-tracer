export const copy={
  "ja": {
    "nav": [
      "ツール一覧",
      "もんじゃExcel参照トレーサー"
    ],
    "hero": [
      "Excel業務に、",
      "見通しを。"
    ],
    "intro": "ファーストサクセス合同会社が開発・公開するMicrosoft Excel向けツールの一覧です。Excelを利用した業務の効率化、データ分析、保守・運用を支援します。",
    "tools": "ツールを見る",
    "local": "ファイルを外部へ送信せず、手元で調査。",
    "facts": [
      [
        "端末内で解析",
        "ファイルの内容を外部送信しません"
      ],
      [
        "参照関係を可視化",
        "変更影響を把握する手がかりに"
      ],
      [
        "日本語・英語に対応",
        "ツールの表示言語を切り替え"
      ]
    ],
    "list": "Excelツール一覧",
    "listNote": "業務に寄り添う、小さな道具。",
    "product": "もんじゃExcel参照トレーサー",
    "description": "Excelの数式、VBAコード、グラフ、ピボットテーブルの参照関係を調査するツールです。選択したセルがどこから参照されているか、またどこを参照しているかを確認し、Excel業務システムの保守・改修時の影響調査を支援します。",
    "cardNote": "Office.js版は、インストール不要のブラウザーによるファイル解析と、マニフェストのインストールが必要なWeb版Excelに対応。VSTO版はWindowsのPC版Excel専用で、インストーラーによるインストールが必要です。",
    "details": "詳細を見る",
    "available": "Office.js / VSTO V1.0.2 を提供",
    "principleTitle": "安心して、業務のそばに。",
    "principles": [
      [
        "データは手元に",
        "Excelファイルや数式を外部サーバーへ送信せずに解析します。"
      ],
      [
        "対象を変更しない",
        "調査対象のセルやVBAを変更せず、VBAも実行しません。"
      ],
      [
        "確実性を区別",
        "静的に分かる参照と、動的で不確実な参照を分けて扱います。"
      ]
    ],
    "diagram": [
      "入力",
      "集計",
      "データを供給",
      "値を利用",
      "参照関係の例（説明用）"
    ],
    "overview": "Excelブック内の数式、VBAコード、グラフ、ピボットテーブルの参照関係を調査するためのアドインです。セルを選択することで、そのセルを利用している数式や関連オブジェクトを検索し、変更による影響範囲の把握を支援します。",
    "add": "導入方法・ダウンロード",
    "open": "ファイル解析を開く",
    "status": "利用環境と導入方法",
    "officeStatus": "ファイル解析Webサイト：インストール不要。Web版Excel：マニフェストのインストールが必要です。",
    "vstoStatus": "V1.0.2をダウンロードできます。WindowsのPC版Excel専用で、インストーラーによるインストールが必要です。",
    "anchors": [
      "主な機能",
      "対応版と機能差",
      "導入・使い方",
      "プライバシー"
    ],
    "features": [
      [
        "選択セルの影響調査",
        "読み込んだブック・シートを選び、セルや範囲を入力して、参照する側・参照される側の直接／間接関係を調査できます。Excel内では選択範囲を同じ欄へ反映する方式です。実Excelでの連携は未確認です。"
      ],
      [
        "全体の依存関係一覧",
        "保存ファイルの数式・グラフ・ピボットの関係を一覧にし、種類やキーワードで絞り込めます。"
      ],
      [
        "VBAコード検索",
        "VSTO版で、アクセスを許可されたVBAプロジェクトのコードを読み取り、参照関係を検索します。Office.js版では利用できません。"
      ],
      [
        "グラフの参照関係",
        "保存ファイルの系列式からデータ範囲を取得します。配置シートとグラフ名、取得できる場合は左上セルを示します。"
      ],
      [
        "ピボットのデータソース",
        "保存ファイルの通常範囲・テーブルの参照を調べます。表示位置はピボットの左上開始セルで代表します。"
      ],
      [
        "CSV出力と場所の確認",
        "絞り込み結果をUTF-8 BOM付きCSVで保存し、場所をコピーできます。Excel内への移動は未確認です。"
      ]
    ],
    "comparisonTitle": "用途に合わせて、対応範囲を確認。",
    "tableHead": [
      "項目",
      "Office.js版",
      "Windows向け VSTO版"
    ],
    "comparison": [
      [
        "利用環境",
        "ファイル解析Webサイト（インストール不要）、Web版Excel（マニフェストのインストールが必要）。",
        "WindowsのPC版Excel専用。VSTOインストーラーによるインストールが必要。"
      ],
      [
        "対象ブック",
        "現在のブック。別ブックは利用者がファイルを選んで追加。",
        "同じExcelインスタンスで開いた複数ブック。"
      ],
      [
        "数式",
        "保存ファイルの数式解析を確認。ライブ数式解析はExcel内で未確認。",
        "解析処理をExcelで確認。アドインとしての操作は未確認。"
      ],
      [
        "グラフ・ピボット",
        "保存済み.xlsx/.xlsmを追加して解析。ライブ取得には非対応。",
        "通常の参照元取得をExcelで確認。アドインとしての操作は未確認。"
      ],
      [
        "VBA",
        "利用できません。",
        "アクセスを許可されたVBProjectを読み取ります。保存ファイルからのVBA解析には非対応。"
      ],
      [
        "検索結果からの移動",
        "現在のブック内へ移動する機能はExcel内で未確認。場所のコピーは利用可。",
        "セル・グラフ・ピボット・VBAへの移動操作は未確認。"
      ]
    ],
    "limits": "動的参照、複雑な名前定義・構造化参照には、参照漏れや過大検出が起こりえます。確定・推定・判定不能を区別して確認してください。外部接続、データモデル、OLAPのセル範囲は特定できません。",
    "installTitle": "手元のExcelを、読み解く。",
    "officeIntro": "Office.js版は、ファイル解析WebサイトとWeb版Excelに対応しています。PC版ExcelではVSTO版をご利用ください。",
    "officeSteps": [
      "対応するブラウザーで「ファイル解析を開く」を選び、保存済み.xlsx/.xlsmを明示的に追加します。ファイルはアップロードされません。",
      "Web版Excelで使用する場合は、マニフェストXMLを保存し、カスタムアドイン追加画面からインストールします。追加の可否は組織の設定に依存します。",
      "Excel JavaScript API 1.4以降とMicrosoft配信のOffice.js読み込みが必要です。このサイトでのOfficeホストとの通信・移動操作は未確認です。",
      "削除する場合はExcelのアドイン管理から削除します。ブラウザーのファイル解析はタブを閉じるだけで終了できます。"
    ],
    "manifest": "マニフェストを取得",
    "vstoIntro": "VSTO V1.0.2はWindowsのPC版Excel専用です。インストーラーによるインストールが必要です。.NET Framework 4.8とVSTO Runtimeを使用します。64bit版Excelで動作確認済み、32bit版は未確認です。",
    "vstoSteps": [
      "ZIP全体を展開し、Excelを保存して終了してからSetup.exeを起動し「インストール」を押します。自己署名版のため、配布元を確認してOfficeの信頼確認を行ってください。",
      "VBAの拡張方式には「VBAプロジェクトオブジェクトモデルへのアクセスを信頼する」の許可が必要です。組織の規則に従ってください。",
      "AccessVBOM設定の自動変更・復元機能はありません。保護されたVBAプロジェクトは読み取りません。",
      "必要に応じてVBAプロジェクトへのアクセスを許可してください。インストール後はExcelの「もんじゃ参照トレーサー」タブを開きます。削除はSetup.exeの「削除」またはWindowsのアプリ管理から行います。"
    ],
    "vstoUnavailable": "VSTO V1.0.2 インストーラーをダウンロード（ZIP）",
    "usageTitle": "基本の操作",
    "usage": [
      [
        "対象を選ぶ",
        "保存ファイルを追加し、検索対象の種類を選択します。"
      ],
      [
        "関係を一覧に",
        "全体の依存関係一覧で参照元と参照先を確認します。"
      ],
      [
        "影響を調べる",
        "ブック・シート・セル範囲を指定し、調査方向と間接参照の有無を選びます。"
      ],
      [
        "結果を残す",
        "種類とキーワードで絞り込み、CSV出力か場所のコピーを使います。"
      ]
    ],
    "usageNote": "編集後は再解析してください。保存ファイルの結果には未保存の変更を含みません。暗号化ファイル、xls、xlsbは対象外です。上限はファイル100 MiB、展開後256 MiB、参照50万件です。",
    "privacyTitle": "ブックの情報は、利用者の環境内に。",
    "privacy": [
      "Excelファイル、数式、VBAコードを外部サーバーへ無断送信しません。",
      "解析のためにVBAコードを実行しません。",
      "調査対象のExcelファイルの内容を無断で変更しません。",
      "VBAプロジェクトの読み取りには追加の許可が必要な場合があります。",
      "解析できない参照や、実行時に決まる動的な参照があります。",
      "アクセス数は全利用者で共有します。カウンターはブック内容を受信せず、個人の識別情報も保存しません。"
    ],
    "trademark": "Microsoft、ExcelはMicrosoftグループの企業の商標です。本サイトのスプレッドシートアイコンは独自の図案であり、Microsoft公式ロゴではありません。",
    "back": "ツール一覧に戻る",
    "counter": "ACCESS / アクセス数",
    "countError": "取得できません",
    "sourceTitle": "ソースコードダウンロード",
    "sourceDescription": "もんじゃExcel参照トレーサーのソースコードはGitHubで公開しています。リポジトリの「Code」→「Download ZIP」からダウンロードできます。",
    "sourceLink": "GitHubでソースコードを開く"
  },
  "en": {
    "nav": [
      "All tools",
      "Reference Tracer"
    ],
    "hero": [
      "Clarity for your",
      "Excel work."
    ],
    "intro": "Excel tools developed and published by First Success G.K. Supporting everyday efficiency, data analysis, and the maintenance of Excel-based business systems.",
    "tools": "Explore the tools",
    "local": "Analyze on your device. Keep workbook contents local.",
    "facts": [
      [
        "Local analysis",
        "Workbook contents stay on your device"
      ],
      [
        "Reference relationships",
        "Understand the impact of changes"
      ],
      [
        "Japanese & English UI",
        "Switch languages inside the tool"
      ]
    ],
    "list": "Excel tools",
    "listNote": "Practical tools for everyday work.",
    "product": "Monja Excel Reference Tracer",
    "description": "Investigate references in Excel formulas, VBA code, charts and pivot tables. Explore what uses a selected cell and what it depends on, to help maintain and update Excel-based business systems.",
    "cardNote": "Office.js supports the installation-free file analysis website and Excel for the web (manifest installation required). VSTO supports Windows desktop Excel only and requires installer-based installation.",
    "details": "View details",
    "available": "Office.js / VSTO V1.0.2 available",
    "principleTitle": "Built to stay close to your work.",
    "principles": [
      [
        "Keep data local",
        "Analyze workbook files and formulas without sending their contents to an external server."
      ],
      [
        "Leave workbooks intact",
        "Inspected cells and VBA are not modified. VBA is never executed for analysis."
      ],
      [
        "Show uncertainty",
        "Distinguish static references from relationships that depend on runtime behavior."
      ]
    ],
    "diagram": [
      "Input",
      "Summary",
      "Supplies data",
      "Uses the value",
      "Illustrative reference example"
    ],
    "overview": "An add-in for investigating references in workbook formulas, VBA code, charts and pivot tables. Selection-based analysis helps identify consumers and dependencies when assessing the impact of changes.",
    "add": "Installation & downloads",
    "open": "Open file analysis",
    "status": "Environments & installation",
    "officeStatus": "File analysis website: no installation. Excel for the web: manifest installation required.",
    "vstoStatus": "V1.0.2 is available to download. Windows desktop Excel only; installer-based installation required.",
    "anchors": [
      "Features",
      "Editions & differences",
      "Installation & usage",
      "Privacy"
    ],
    "features": [
      [
        "Selected-cell impact",
        "Choose a loaded workbook and worksheet, enter a cell/range, and inspect direct or indirect relationships in either direction. Excel selection updates these same fields; real Excel-host integration remains unverified."
      ],
      [
        "Dependency overview",
        "List formulas, chart sources and pivot sources in a saved workbook. Filter results by type and keyword."
      ],
      [
        "VBA reference search",
        "VSTO reads permitted VBA projects to search code references. VBA analysis is unavailable in Office.js."
      ],
      [
        "Chart references",
        "Read source ranges from saved chart series. Show the sheet, chart name and top-left cell when available."
      ],
      [
        "Pivot data sources",
        "Inspect ordinary range and table sources in saved files. Use the pivot’s top-left cell to represent its location."
      ],
      [
        "CSV & locations",
        "Save filtered results as UTF-8 CSV with BOM and copy locations. Navigation inside Excel has not been verified."
      ]
    ],
    "comparisonTitle": "Choose with the limitations in view.",
    "tableHead": [
      "Capability",
      "Office.js edition",
      "VSTO edition for Windows"
    ],
    "comparison": [
      [
        "Environment",
        "File analysis website (no installation); Excel for the web (manifest installation required).",
        "Windows desktop Excel only. Installation using the VSTO installer is required."
      ],
      [
        "Workbooks",
        "Current workbook. Add other workbooks by explicitly selecting files.",
        "Multiple workbooks open in the same Excel instance."
      ],
      [
        "Formulas",
        "Saved-file parsing checked. Live formula scanning inside Excel is unverified.",
        "Collection checked through Excel. Installed add-in operation is unverified."
      ],
      [
        "Charts & pivots",
        "Add saved .xlsx/.xlsm files. Live source collection is unavailable.",
        "Ordinary source collection checked through Excel. Installed add-in operation is unverified."
      ],
      [
        "VBA",
        "Unavailable.",
        "Read permitted VBProject code. VBA parsing from saved files is unsupported."
      ],
      [
        "Navigation",
        "Inside-Excel navigation is unverified. Copying locations is available.",
        "Navigation to cells, charts, pivots and code is unverified."
      ]
    ],
    "limits": "Dynamic references and complex names or structured references may over- or under-match. Review confirmed, estimated and unknown results separately. External connections, data models and OLAP are not resolved to ordinary cell ranges.",
    "installTitle": "Understand the workbook in front of you.",
    "officeIntro": "Office.js supports the file analysis website and Excel for the web. Use VSTO for Windows desktop Excel.",
    "officeSteps": [
      "Open file analysis in a compatible browser and explicitly select saved .xlsx/.xlsm files. Files are processed locally, not uploaded.",
      "For Excel for the web, download the manifest XML and install it through the custom add-in interface. Availability depends on organizational policy.",
      "Excel JavaScript API 1.4 or later and the Microsoft-hosted Office.js library are required. Office-host communication and navigation on this site are unverified.",
      "Remove the add-in using Excel’s add-in manager. Browser-only file analysis ends when you close its tab."
    ],
    "manifest": "Download manifest",
    "vstoIntro": "VSTO V1.0.2 is for Windows desktop Excel only and requires installation using the installer, .NET Framework 4.8 and VSTO Runtime. Verified with 64-bit Excel; 32-bit Excel is unverified.",
    "vstoSteps": [
      "Extract the entire ZIP, save and close Excel, then run Setup.exe and choose Install. This package is self-signed; check the publisher before accepting the Office trust prompt.",
      "Extended VBA access requires the Trust access to the VBA project object model setting. Follow your organization’s rules.",
      "There is no automatic AccessVBOM setting change or restoration. Protected projects are skipped.",
      "Allow VBA project access if needed. After installation, open the Monja Reference Tracer tab in Excel. Uninstall through Setup.exe or Windows app settings."
    ],
    "vstoUnavailable": "Download VSTO V1.0.2 installer (ZIP)",
    "usageTitle": "Basic workflow",
    "usage": [
      [
        "Choose targets",
        "Add saved files and select the reference types to inspect."
      ],
      [
        "Review relationships",
        "Use the full dependency list to compare suppliers and consumers."
      ],
      [
        "Inspect impact",
        "Choose a workbook, worksheet and cell/range, then set direction and indirect expansion."
      ],
      [
        "Keep the findings",
        "Filter by type or keyword, then export CSV or copy locations."
      ]
    ],
    "usageNote": "Reanalyze after edits. Saved-file results exclude unsaved changes. Encrypted files, xls and xlsb are unsupported. Limits: 100 MiB file, 256 MiB expanded, 500,000 edges.",
    "privacyTitle": "Workbook information stays with you.",
    "privacy": [
      "No unauthorized upload of Excel files, formulas or VBA code to an external server.",
      "VBA is not executed for analysis.",
      "Inspected workbook contents are not modified without permission.",
      "Reading VBA projects may require additional permission.",
      "Some references cannot be resolved, including references decided at runtime.",
      "The shared access counter receives no workbook contents and stores no personal identifiers."
    ],
    "trademark": "Microsoft and Excel are trademarks of the Microsoft group of companies. Our spreadsheet icon is an original design, not an official Microsoft logo.",
    "back": "Back to all tools",
    "counter": "ACCESS / Total visits",
    "countError": "Unavailable",
    "sourceTitle": "Source code download",
    "sourceDescription": "The source code for Monja Excel Reference Tracer is available on GitHub. Select Code → Download ZIP in the repository to download it.",
    "sourceLink": "View source code on GitHub"
  },
  "zh": {
    "nav": [
      "工具列表",
      "Excel引用追踪器"
    ],
    "hero": [
      "让Excel工作，",
      "更加清晰。"
    ],
    "intro": "这里汇集了First Success G.K.开发并发布的Microsoft Excel工具，帮助提升工作效率、分析数据以及维护基于Excel的业务系统。",
    "tools": "查看工具",
    "local": "在您的设备上分析，不上传工作簿内容。",
    "facts": [
      [
        "本地分析",
        "工作簿内容保留在您的设备上"
      ],
      [
        "梳理引用关系",
        "了解修改可能产生的影响"
      ],
      [
        "日语与英语界面",
        "工具内可切换显示语言"
      ]
    ],
    "list": "Excel工具列表",
    "listNote": "为日常业务提供实用工具。",
    "product": "Monja Excel引用追踪器",
    "description": "调查Excel公式、VBA代码、图表及数据透视表的引用关系。查看哪些位置使用所选单元格，以及该单元格依赖哪些位置，帮助维护和修改基于Excel的业务系统。",
    "cardNote": "Office.js支持无需安装的文件分析网站，以及需要安装清单的Excel网页版。VSTO仅支持Windows电脑版Excel，必须通过安装程序安装。",
    "details": "查看详情",
    "available": "提供Office.js / VSTO V1.0.2",
    "principleTitle": "贴近业务，安心使用。",
    "principles": [
      [
        "数据留在本地",
        "分析Excel文件和公式，不将其内容发送到外部服务器。"
      ],
      [
        "保持工作簿原样",
        "不修改调查对象的单元格或VBA，也不执行VBA。"
      ],
      [
        "明确区分确定性",
        "将静态可确定的引用与依赖运行时的关系分开显示。"
      ]
    ],
    "diagram": [
      "输入",
      "汇总",
      "提供数据",
      "使用数值",
      "引用关系示例（仅供说明）"
    ],
    "overview": "用于调查Excel工作簿中公式、VBA代码、图表及数据透视表引用关系的加载项。通过所选单元格查找相关公式和对象，帮助了解修改影响。",
    "add": "安装与下载",
    "open": "打开文件分析",
    "status": "使用环境与安装方法",
    "officeStatus": "文件分析网站：无需安装。Excel网页版：需要安装清单。",
    "vstoStatus": "可下载V1.0.2。仅支持Windows电脑版Excel，必须通过安装程序安装。",
    "anchors": [
      "主要功能",
      "版本与差异",
      "安装与使用",
      "隐私"
    ],
    "features": [
      [
        "所选单元格影响分析",
        "选择已读取的工作簿与工作表，输入单元格或区域，按两个方向调查直接与间接引用。Excel选择范围使用同一输入栏，实际Excel联动尚未验证。"
      ],
      [
        "依赖关系总览",
        "列出已保存工作簿的公式、图表来源及透视表来源，支持按类型和关键词筛选。"
      ],
      [
        "VBA引用搜索",
        "VSTO读取已获许可的VBA项目并搜索代码引用。Office.js不支持VBA分析。"
      ],
      [
        "图表引用关系",
        "读取已保存图表系列的数据范围，显示所在工作表、图表名称及可获取的左上角单元格。"
      ],
      [
        "透视表数据源",
        "调查已保存文件中的普通区域与表格引用，以透视表左上角单元格表示其位置。"
      ],
      [
        "CSV与位置确认",
        "将筛选结果保存为带BOM的UTF-8 CSV并复制位置。尚未验证Excel内定位。"
      ]
    ],
    "comparisonTitle": "了解支持范围后再选择。",
    "tableHead": [
      "项目",
      "Office.js版",
      "Windows VSTO版"
    ],
    "comparison": [
      [
        "使用环境",
        "文件分析网站（无需安装）；Excel网页版（需要安装清单）。",
        "仅支持Windows电脑版Excel，需要通过VSTO安装程序安装。"
      ],
      [
        "目标工作簿",
        "当前工作簿；其他工作簿由用户明确选择文件添加。",
        "同一Excel实例中打开的多个工作簿。"
      ],
      [
        "公式",
        "已确认已保存文件解析。尚未验证Excel内实时公式分析。",
        "已通过Excel确认信息获取；未验证已安装加载项操作。"
      ],
      [
        "图表与透视表",
        "添加已保存的.xlsx/.xlsm分析；不支持实时来源获取。",
        "已通过Excel确认普通来源获取；未验证已安装加载项操作。"
      ],
      [
        "VBA",
        "不可使用。",
        "读取获许可的VBProject。不支持从已保存文件解析VBA。"
      ],
      [
        "结果定位",
        "Excel内定位尚未验证；可复制位置。",
        "单元格、图表、透视表及代码定位尚未验证。"
      ]
    ],
    "limits": "动态引用、复杂名称及结构化引用可能遗漏或多报。请分别查看确定、推定和无法判断的结果。无法将外部连接、数据模型或OLAP解析为普通单元格范围。",
    "installTitle": "读懂眼前的工作簿。",
    "officeIntro": "Office.js支持文件分析网站与Excel网页版。Windows电脑版Excel请使用VSTO版。",
    "officeSteps": [
      "在兼容浏览器中打开文件分析，明确选择已保存的.xlsx/.xlsm。文件在本地处理，不会上传。",
      "在Excel网页版使用时，请下载清单XML并通过自定义加载项界面安装。能否添加取决于组织设置。",
      "需要Excel JavaScript API 1.4以上，以及Microsoft提供的Office.js。本网站与Office宿主的通信及定位尚未验证。",
      "通过Excel加载项管理界面删除。仅使用浏览器文件分析时，关闭标签页即可结束。"
    ],
    "manifest": "下载清单",
    "vstoIntro": "VSTO V1.0.2仅适用于Windows电脑版Excel，必须通过安装程序安装，需要.NET Framework 4.8与VSTO Runtime。已确认64位Excel，32位尚未验证。",
    "vstoSteps": [
      "解压整个ZIP，保存并关闭Excel，然后运行Setup.exe并选择安装。此版本为自签名，请确认发布者后再接受Office信任提示。",
      "扩展VBA访问需要允许“信任对VBA工程对象模型的访问”。请遵守组织规定。",
      "不提供自动修改或还原AccessVBOM设置的功能。不会读取受保护的VBA工程。",
      "按需允许访问VBA项目。安装后打开Excel中的Monja引用追踪器选项卡。通过Setup.exe或Windows应用设置卸载。"
    ],
    "vstoUnavailable": "下载VSTO V1.0.2安装程序（ZIP）",
    "usageTitle": "基本操作",
    "usage": [
      [
        "选择对象",
        "添加已保存文件，选择要调查的引用类型。"
      ],
      [
        "查看关系",
        "在依赖关系总览中查看数据提供方与使用方。"
      ],
      [
        "调查影响",
        "指定工作簿、工作表和单元格区域，选择调查方向及是否展开间接引用。"
      ],
      [
        "保存结果",
        "按类型或关键词筛选，导出CSV或复制位置。"
      ]
    ],
    "usageNote": "修改后请重新分析。文件分析不包含尚未保存的修改。不支持加密文件、xls及xlsb。上限：文件100 MiB、解压后256 MiB、引用50万条。",
    "privacyTitle": "工作簿信息保留在用户环境内。",
    "privacy": [
      "不会未经许可向外部服务器发送Excel文件、公式或VBA代码。",
      "不会为了分析执行VBA。",
      "不会擅自修改调查对象工作簿。",
      "读取VBA工程可能需要额外许可。",
      "部分引用无法解析，动态引用可能由运行时决定。",
      "访问计数由所有用户共享，不接收工作簿内容，也不保存个人标识。"
    ],
    "trademark": "Microsoft和Excel是Microsoft集团公司的商标。本网站的电子表格图标为原创设计，并非Microsoft官方标志。",
    "back": "返回工具列表",
    "counter": "ACCESS / 访问次数",
    "countError": "暂不可用",
    "sourceTitle": "下载源代码",
    "sourceDescription": "Monja Excel引用追踪器的源代码已在GitHub公开。请在仓库中选择Code → Download ZIP下载。",
    "sourceLink": "在GitHub查看源代码"
  }
};
