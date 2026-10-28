# Using Monja Excel Reference Tracer

Edges point from supplier to consumer. `Input!B5 → Summary!D10` means Summary!D10 uses Input!B5.

Reanalyze reads current-workbook formulas. Add target workbooks reads saved .xlsx/.xlsm files locally for formulas, chart series and pivot sources. Office.js does not enumerate other open workbooks. Remove a file snapshot with its × button. Duplicate selected filenames are rejected.

All dependencies lists direct edges. Selected cell impact uses the workbook, worksheet and cell/range in the target fields. In the browser, add a file, choose its worksheet, enter B5 or A1:C10 and click Investigate this cell or range. Empty worksheets are included. Choose Places using this cell or Places used by this cell. Enable indirect expansion for multi-step references. Cycles terminate. Inside Excel, selection changes and Use selection from Excel update those same target fields. Manual targets survive direction changes until the next Excel selection update.

Filter by type, specified/all workbooks and keyword. Click headings to sort; resize headings and scroll horizontally. Office.js shows 100 results per page. Progress includes elapsed seconds. Cancel stops scanning; completed previous results may remain. Successful reanalysis replaces the live snapshot.

Confirmed means statically identified. Estimated means uncertain, including runtime expressions, spill anchors and row-dependent table references. Unknown means the range cannot be established. Unknown locations are not matched as selected-cell impact; review the complete list and notices.

Go left opens the supplier; Go right opens the consumer. Office.js navigates within the active workbook only. For another workbook, open the add-in there or copy its location. An unnamed chart can be located only by worksheet. Chart-sheet navigation may be unavailable. Pivots use the top-left cell.

Export CSV saves currently filtered results as UTF-8 with BOM. Potential spreadsheet formulas are prefixed with an apostrophe. Choose 日本語 or English to change language.

Live Office.js scans formulas only. Add saved files for chart/pivot analysis; file snapshots exclude unsaved edits. VBA, encrypted workbooks, xls and xlsb are unavailable. External connections, data models and OLAP cannot be resolved to ordinary cell ranges. Dynamic references and complex names/table expressions may over- or under-match.

Reanalyze after edits. Selection changes reuse the snapshot. Limits: 100 MiB file, 256 MiB expanded package, 64 MiB XML part, 500,000 edges, 10 million live used-range cells per worksheet, 100,000 indirect results. Larger live worksheets are skipped.

In VSTO, choose Target workbooks to open the workbook selection dialog. Opening either analysis mode from the ribbon starts analysis when needed. The table explains when no results match. Choose Diagnostics to review unavailable information. Retrieved references remain visible if an optional Excel API is unavailable. Analysis failures are distinguished from zero matching references. Select a cell in Excel to investigate either direction. Formulas, embedded charts, chart sheets and ordinary pivot range/table sources are supported. Standard VBA mode reads saved .xlsm/.xlam/.xlsb files without VBProject access; unsaved code changes and legacy .xls are excluded. Extended mode reads an already permitted VBProject. Change or restore AccessVBOM only through Excel settings if permitted; the add-in never changes it automatically. Protected projects are skipped. Static VBA references are uncertain because runtime workbook/sheet context can change. VBA operation edges identify code operations rather than execution flow.

The add-in does not modify cells, formulas or code, and does not execute VBA. Workbook contents stay local. CSV and copied locations may contain sensitive workbook names or formulas; choose storage and sharing destinations accordingly.

