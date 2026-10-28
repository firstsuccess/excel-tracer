# Installation and removal

## Browser-based saved-file analysis

No Node.js, local server or additional user certificate is required. Open [the analysis page](https://excel.mnoda1979.chatgpt.site/trace/app/) in a supported browser with internet access.

1. Choose Open file analysis on the product page.
2. Use Add target workbooks to select saved .xlsx/.xlsm files.
3. Review dependencies and filter by type or keyword. For impact analysis, choose a workbook and worksheet, enter a cell/range and click Investigate this cell or range.
4. Export CSV if needed. Close the tab to finish.

Files are parsed inside the browser, without uploading their contents. Network access is needed to load the application and Office.js. Unsaved changes, VBA, encrypted files, xls and xlsb are unsupported.

The ZIP contains user guides, the public HTTPS manifest and a shortcut to the application. No software or certificate installation is required for browser analysis.

## Adding the Office add-in to Excel

Requires Excel for the web, Excel JavaScript API 1.4 or later and permission to add custom add-ins. Application files load from the public HTTPS site. Users do not need Node.js.

1. Download the manifest XML from the product page.
2. Select it in Excel’s custom add-in interface.
3. Open the Monja ribbon tab and task pane.
4. Remove it through Excel’s add-in manager.

Availability depends on Excel and organizational policy. Contact your administrator when individual upload is unavailable. Installation and navigation inside Excel remain unverified; browser-based saved-file analysis is separate.

## VSTO edition

Requires Windows desktop Excel, .NET Framework 4.8 or later and VSTO Runtime. Node.js is not required. 64-bit Excel has been verified; 32-bit Excel remains unverified.

Extract the entire Windows ZIP, save and close Excel, run Setup.exe and choose Install. No elevation is requested. Review the native Office trust prompt. This package is self-signed; its publisher identity has not been independently verified. No certificate is imported as a trusted root. SmartScreen or organizational restrictions may prevent installation. Contact your administrator rather than bypassing restrictions. Installing prerequisite software may require administrator assistance.

Start Excel and open the Monja ribbon. Remove the product using Windows Installed Apps or the setup's Uninstall button with Excel closed. Language preferences are retained. A small setup executable remains in the user folder.

## Previous local-server installations

Stop the previous local server and use the removal script from that distribution. The new browser-based option does not need that server or its dedicated user certificate. Workbooks do not need to be removed.


