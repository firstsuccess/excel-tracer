import {unzipSync,strFromU8} from 'fflate';
import {XMLParser} from 'fast-xml-parser';
import {parseFormula,translateShared} from '../../shared/formula';
import {type Context,type Snapshot,type Location,MAX_EDGES} from '../../shared/model';
const parser=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'',removeNSPrefix:true,parseTagValue:false,processEntities:true});
const list=(v:any):any[]=>v===undefined?[]:Array.isArray(v)?v:[v];
function path(base:string,target:string):string {const parts=(target.startsWith('/')?target.slice(1):base.slice(0,base.lastIndexOf('/')+1)+target).split('/');const out:string[]=[];for(const p of parts){if(p==='..')out.pop();else if(p!=='.'&&p)out.push(p);}return out.join('/');}
export async function readFile(file:File,signal:AbortSignal,progress:(s:string)=>void):Promise<Snapshot>{
 if(file.size>100*1024*1024)throw Error('File exceeds 100 MiB limit');
 // Worker boundary keeps zip/XML parsing away from the task-pane UI thread.
 const worker=new Worker(new URL('./file-worker.ts',import.meta.url),{type:'module'});
 return new Promise((resolve,reject)=>{const abort=()=>{worker.terminate();reject(new DOMException('Cancelled','AbortError'));};signal.addEventListener('abort',abort,{once:true});worker.onmessage=e=>{if(e.data.progress){progress(e.data.progress);return;}signal.removeEventListener('abort',abort);worker.terminate();if(e.data.error)reject(Error(e.data.error));else resolve(e.data.result);};worker.onerror=e=>{worker.terminate();reject(Error(e.message));};file.arrayBuffer().then(buffer=>{if(signal.aborted)abort();else worker.postMessage({buffer,name:file.name},[buffer]);},reject);});
}
export function parsePackage(buffer:ArrayBuffer,name:string,progress:(s:string)=>void):Snapshot {
 let total=0;
 const files=unzipSync(new Uint8Array(buffer),{filter:f=>{total+=f.originalSize;if(f.originalSize>64*1024*1024||total>256*1024*1024)throw Error('Expanded workbook exceeds safety limit');return /\.xml$|\.rels$/i.test(f.name);}});
 const xml=(p:string)=>{if(!files[p])return {};const text=strFromU8(files[p]);if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('DTD/entity declarations are not accepted in workbook XML');return parser.parse(text);};
 const rels=(p:string)=>{const rp=p.slice(0,p.lastIndexOf('/')+1)+'_rels/'+p.slice(p.lastIndexOf('/')+1)+'.rels';return new Map<string,string>(list(xml(rp).Relationships?.Relationship).filter(r=>r.TargetMode!=='External').map(r=>[r.Id,path(p,r.Target)]));};
 const wb=xml('xl/workbook.xml').workbook;if(!wb)throw Error('Only unencrypted .xlsx/.xlsm packages are supported');
 const out:Snapshot={edges:[],diagnostics:[],books:[{id:name,name,live:false,sheets:[]}]};const wr=rels('xl/workbook.xml');const sheets=list(wb.sheets?.sheet);const names:Record<string,string>={};
 for(const n of list(wb.definedNames?.definedName)){const key=n.localSheetId!==undefined?sheets[+n.localSheetId]?.name+'!'+n.name:n.name;names[key]=String(n['#text']??'');}
 const ctx:Context={book:name,sheet:'',sheets:sheets.map(s=>s.name),names,tables:{}};
 const add=(formula:string,target:Location,kind:'formula'|'chart'|'pivot')=>{out.edges.push(...parseFormula(formula,target,ctx,kind));if(out.edges.length>MAX_EDGES)throw Error('Reference limit reached (500000)');};
 // Resolve table definitions across every sheet before parsing any formula.
 for(const s of sheets){const p=wr.get(s.id);if(!p)continue;for(const tp of rels(p).values()){if(!/\/tables\//.test(tp))continue;const t=xml(tp).table;if(t)ctx.tables[t.name]={sheet:s.name,address:t.ref,columns:list(t.tableColumns?.tableColumn).map(c=>c.name)};}}
 for(const s of sheets){ctx.sheet=s.name;progress(s.name);const p=wr.get(s.id);if(!p)continue;const doc=xml(p);if(!Object.hasOwn(doc,'worksheet')&&!Object.hasOwn(doc,'chartsheet'))continue;const isWorksheet=Object.hasOwn(doc,'worksheet'),sheet=(isWorksheet?doc.worksheet:doc.chartsheet)||{};if(isWorksheet)out.books[0].sheets!.push(s.name);const sr=rels(p);
  const shared=new Map<string,{formula:string;address:string}>();
  for(const row of list(sheet.sheetData?.row))for(const c of list(row.c)){
   if(c.f===undefined)continue;const f=typeof c.f==='object'?c.f['#text']:c.f;
   if(c.f?.t==='shared'&&f)shared.set(String(c.f.si),{formula:String(f),address:c.r});
   if(f)add('='+f,{book:name,sheet:s.name,address:c.r,kind:'cell'},'formula');
   else if(c.f?.t==='shared'&&shared.has(String(c.f.si))){const origin=shared.get(String(c.f.si))!;add('='+translateShared(origin.formula,origin.address,c.r),{book:name,sheet:s.name,address:c.r,kind:'cell'},'formula');}
   else out.diagnostics.push({book:name,sheet:s.name,message:`${c.r}: shared/array follower formula unavailable`});
  }
  for(const dp of sr.values()){
   if(/\/drawings\/[^/]+\.xml$/.test(dp)){const dr=rels(dp),drawing=xml(dp).wsDr;const handled=new Set<string>();for(const a of [...list(drawing?.twoCellAnchor),...list(drawing?.oneCellAnchor),...list(drawing?.absoluteAnchor)]){const frame=a.graphicFrame,rel=frame?.graphic?.graphicData?.chart?.id,cp=dr.get(rel);if(!cp)continue;handled.add(cp);chart(cp,s.name,frame?.nvGraphicFramePr?.cNvPr?.name,a.from?String.fromCharCode(65)+String(+a.from.row+1):undefined,a.from?+a.from.col:undefined);}for(const cp of dr.values())if(/\/charts\//.test(cp)&&!handled.has(cp))chart(cp,s.name);}
   if(/\/charts\/chart\d+\.xml$/.test(dp))chart(dp,s.name,s.name);
   if(/\/pivotTables\//.test(dp)){
    const pt=xml(dp).pivotTableDefinition;if(!pt)continue;const cache=list(wb.pivotCaches?.pivotCache).find(c=>String(c.cacheId)===String(pt.cacheId));const cachePath=cache?wr.get(cache.id):undefined;
    const cs=cachePath?xml(cachePath).pivotCacheDefinition?.cacheSource:undefined;
    const target:Location={book:name,sheet:s.name,address:pt.location?.ref?.split(':')[0],kind:'pivot',name:pt.name};
    const ws=cs?.worksheetSource;if(ws?.id)out.diagnostics.push({book:name,sheet:s.name,message:`${pt.name}: external workbook pivot source unavailable`});
    else if(ws?.ref&&ws?.sheet)add("'"+ws.sheet.replace(/'/g,"''")+"'!"+ws.ref,target,'pivot');
    else if(ws?.name)add(ws.name,target,'pivot');
    else out.diagnostics.push({book:name,sheet:s.name,message:`${pt.name}: external/model pivot source unavailable`});
   }
  }
 }
 function chart(p:string,sheet:string,chartName?:string,anchor?:string,anchorColumn?:number){const data=xml(p);let count=0;const visit=(node:any)=>{if(!node||typeof node!=='object')return;for(const [key,value]of Object.entries(node)){if(key==='f'){for(const f of list(value)){ctx.sheet=sheet;add(String(f),{book:name,sheet,kind:'chart',name:chartName,address:anchorColumn===undefined?undefined:columnLabel(anchorColumn)+anchor?.slice(1)},'chart');count++;}}else if(typeof value==='object'){for(const v of list(value))visit(v);}}};visit(data);if(!count)out.diagnostics.push({book:name,sheet,message:`${p}: no cell series references`});if(!chartName)out.diagnostics.push({book:name,sheet,message:`${p}: chart object name unavailable; navigation can activate only the sheet`});}
 function columnLabel(n:number):string {let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;}
 if(Object.keys(files).some(p=>p.includes('externalLink')))out.diagnostics.push({book:name,message:'External-link indices may not resolve to workbook names; inspect displayed references.'});
 if(/\.xlsm$/i.test(name))out.diagnostics.push({book:name,message:'VBA is unavailable in this edition. No VBA code was inspected.'});
 return out;
}
