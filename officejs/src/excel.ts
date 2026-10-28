import {parseFormula} from '../../shared/formula';
import {letters,type Context,type Snapshot,type Location,type WorkbookInfo,MAX_EDGES} from '../../shared/model';
export async function readSelection():Promise<{location:Location;book:WorkbookInfo}>{return Excel.run(async c=>{const r=c.workbook.getSelectedRange(),sheet=r.worksheet;r.load('address');sheet.load('name');c.workbook.load('name');c.workbook.worksheets.load('items/name');await c.sync();const address=r.address.slice(r.address.lastIndexOf('!')+1);return {location:{book:c.workbook.name,sheet:sheet.name,address,kind:address.includes(':')?'range':'cell'},book:{id:c.workbook.name,name:c.workbook.name,live:true,sheets:c.workbook.worksheets.items.map(s=>s.name)}};});}
export async function selected():Promise<Location>{return (await readSelection()).location;}
export async function scan(signal:AbortSignal,progress:(s:string)=>void):Promise<Snapshot>{
 return Excel.run(async c=>{
  const out:Snapshot={edges:[],diagnostics:[],books:[]};const wb=c.workbook;wb.load('name');wb.worksheets.load('items/name');wb.names.load('items/name,items/formula');await c.sync();
  out.books.push({id:wb.name,name:wb.name,live:true,sheets:wb.worksheets.items.map(s=>s.name)});const ctx:Context={book:wb.name,sheet:'',sheets:wb.worksheets.items.map(s=>s.name),names:{},tables:{}};
  for(const n of wb.names.items)ctx.names[n.name]=n.formula;
  for(const sheet of wb.worksheets.items){sheet.tables.load('items/name');await c.sync();for(const t of sheet.tables.items){const r=t.getRange();r.load('address');t.columns.load('items/name');await c.sync();ctx.tables[t.name]={sheet:sheet.name,address:r.address.slice(r.address.lastIndexOf('!')+1),columns:t.columns.items.map(col=>col.name)};}}
  for(const sheet of wb.worksheets.items){
   if(signal.aborted)throw new DOMException('Cancelled','AbortError');ctx.sheet=sheet.name;progress(sheet.name);
   const used=sheet.getUsedRangeOrNullObject(true);used.load('rowIndex,columnIndex,rowCount,columnCount');await c.sync();if(used.isNullObject)continue;
   if(used.columnCount*used.rowCount>10000000){out.diagnostics.push({book:wb.name,sheet:sheet.name,message:'Used range exceeds 10 million cells. Use a selected-file scan.'});continue;}
   const height=Math.max(1,Math.floor(20000/used.columnCount));
   for(let row=0;row<used.rowCount;row+=height){
    if(signal.aborted)throw new DOMException('Cancelled','AbortError');const r=sheet.getRangeByIndexes(used.rowIndex+row,used.columnIndex,Math.min(height,used.rowCount-row),used.columnCount);r.load('formulas');await c.sync();
    for(let y=0;y<r.formulas.length;y++)for(let x=0;x<r.formulas[y].length;x++){const f=r.formulas[y][x];if(typeof f==='string'&&f.startsWith('='))out.edges.push(...parseFormula(f,{book:wb.name,sheet:sheet.name,address:letters(used.columnIndex+x+1)+(used.rowIndex+row+y+1),kind:'cell'},ctx));}
    if(out.edges.length>MAX_EDGES)throw Error('Reference limit reached (500000)');progress(sheet.name+' '+Math.min(row+height,used.rowCount)+'/'+used.rowCount);await new Promise(r=>setTimeout(r,0));
   }
   out.diagnostics.push({book:wb.name,sheet:sheet.name,message:'Live chart series and pivot data sources are not scanned. Add a saved .xlsx/.xlsm file to inspect them. VBA unavailable.'});
  }return out;
 });
}
export async function navigate(loc:Location):Promise<void>{await Excel.run(async c=>{c.workbook.load('name');await c.sync();if(c.workbook.name!==loc.book)throw Error('This workbook is not active. Copy the location or open it first.');const sheet=c.workbook.worksheets.getItem(loc.sheet);sheet.activate();if(loc.kind==='chart'&&loc.name){sheet.charts.getItem(loc.name).activate();}else if(loc.address)sheet.getRange(loc.address).select();else throw Error('A cell location is unavailable. The worksheet was activated.');await c.sync();});}
