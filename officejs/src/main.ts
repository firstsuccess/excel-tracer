import './style.css';
import {scan,readSelection,navigate} from './excel';
import {readFile} from './file';
import {csv,query,type Edge,type Snapshot,type WorkbookInfo} from '../../shared/model';
import {SelectionModel,workbookChoices} from './selection';
const strings={ja:{title:'もんじゃExcel参照トレーサー',impact:'選択セルの影響調査',all:'全体の依存関係一覧',scan:'再解析',files:'検索対象ブックを追加',stop:'中止',export:'CSV出力',direction:'方向',dependents:'このセルを参照している場所',precedents:'このセルが参照している場所',indirect:'間接参照も展開',search:'キーワード検索',help:'ヘルプ',scope:'検索対象',current:'現在のブック',every:'対象ブックすべて',formula:'数式',chart:'グラフ',pivot:'ピボットテーブル',vba:'VBA（この版では利用不可）',go:'移動',copy:'場所をコピー',empty:'該当する参照はありません。未取得の情報は下の注意事項をご確認ください。',ready:'再解析、または保存済みファイルの追加で開始します。',settings:'設定',before:'前へ',next:'次へ',source:'参照元',target:'参照先',certainty:'確実性',kind:'種類',content:'参照内容',direct:'直接／間接'},en:{title:'Monja Excel Reference Tracer',impact:'Selected cell impact',all:'All dependencies',scan:'Reanalyze',files:'Add target workbooks',stop:'Cancel',export:'Export CSV',direction:'Direction',dependents:'Places using this cell',precedents:'Places used by this cell',indirect:'Expand indirect references',search:'Keyword filter',help:'Help',scope:'Scope',current:'Current workbook',every:'All target workbooks',formula:'Formulas',chart:'Charts',pivot:'Pivot tables',vba:'VBA (unavailable in this edition)',go:'Go',copy:'Copy location',empty:'No matching references. Review notices below for information that was not scanned.',ready:'Start with Reanalyze or add saved files.',settings:'Settings',before:'Previous',next:'Next',source:'Source',target:'Consumer',certainty:'Certainty',kind:'Type',content:'Reference',direct:'Direct / indirect'}};
const targetStrings={
 ja:{targetTitle:'調査するセル・範囲',book:'ブック',sheet:'シート',address:'セル・範囲（A1形式）',placeholder:'例: B5 または A1:C10',apply:'このセル・範囲を調査',fromExcel:'Excelの選択セルを取得',hint:'ブックとシートは自動表示します。ブラウザーではセル・範囲を入力してください。Excel内では選択範囲をこの欄に自動反映します。',manual:'手動指定',excel:'Excelの選択範囲を反映',needBook:'「検索対象ブックを追加」でファイルを読み込んでください。',needSheet:'調査するワークシートを選択してください。',needAddress:'A1、A1:C10、A:A、1:10など、有効なセル・範囲を入力してください。',noBooks:'ブックがありません',noSheets:'ワークシートがありません',current:'指定ブック',modeLabel:'調査モード'},
 en:{targetTitle:'Cell or range to investigate',book:'Workbook',sheet:'Worksheet',address:'Cell or range (A1 notation)',placeholder:'Example: B5 or A1:C10',apply:'Investigate this cell or range',fromExcel:'Use selection from Excel',hint:'Workbook and worksheet names are populated automatically. Enter a cell or range in the browser. Inside Excel, the selected range updates these same fields.',manual:'Manual target',excel:'Updated from Excel selection',needBook:'Use Add target workbooks to load a saved file.',needSheet:'Choose a worksheet to investigate.',needAddress:'Enter a valid cell or range, such as A1, A1:C10, A:A or 1:10.',noBooks:'No workbooks',noSheets:'No worksheets',current:'Specified workbook',modeLabel:'Analysis mode'}
};
let lang:keyof typeof strings=localStorage.getItem('monja-language')==='en'?'en':'ja';
let snapshots:Snapshot[]=[],rows:Edge[]=[],page=0,sort='source',ascending=true;
let controller:AbortController|null=null,live=false,mode='all',direction:'dependents'|'precedents'='dependents',scope='all',keyword='';
let activeBook:WorkbookInfo|undefined,excelSyncSequence=0,addressTimer:ReturnType<typeof setTimeout>|undefined;
const target=new SelectionModel(),kinds:Record<string,boolean>={formula:true,chart:true,pivot:true,vba:false,indirect:false};
const root=document.querySelector<HTMLElement>('#app')!;
const el=(tag:string,text?:string)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
const words=()=>({...strings[lang],...targetStrings[lang]});
const choices=()=>workbookChoices(snapshots,activeBook);
const control=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
function option(value:string,label:string){const o=el('option',label) as HTMLOptionElement;o.value=value;return o;}
function labelled(label:string,input:HTMLElement){const wrapper=el('label');wrapper.className='target-field';wrapper.append(el('span',label),input);input.setAttribute('aria-label',label);return wrapper;}
function button(label:string,fn:()=>void,parent:HTMLElement){const b=el('button',label) as HTMLButtonElement;b.onclick=fn;parent.append(b);return b;}
function status(text:string){const node=document.getElementById('status');if(node)node.textContent=text;}
function targetError():string{const error=target.resolve(choices()).error,t=words();return error==='book'?t.needBook:error==='sheet'?t.needSheet:error==='address'?t.needAddress:'';}
function render(){
 const t=words();document.documentElement.lang=lang;root.replaceChildren();root.append(el('h1',t.title));
 const toolbar=el('div');toolbar.className='toolbar';
 const language=el('select') as HTMLSelectElement;language.append(option('ja','日本語'),option('en','English'));language.value=lang;language.disabled=!!controller;
 language.onchange=()=>{lang=language.value as typeof lang;localStorage.setItem('monja-language',lang);render();};language.setAttribute('aria-label',t.settings);toolbar.append(language);
 const re=button(t.scan,()=>void run(),toolbar);re.id='reanalyze';re.disabled=!live||!!controller;
 const files=el('input') as HTMLInputElement;files.type='file';files.accept='.xlsx,.xlsm';files.multiple=true;files.hidden=true;
 files.onchange=()=>void importFiles(Array.from(files.files??[]));const add=button(t.files,()=>files.click(),toolbar);add.id='add-files';add.disabled=!!controller;toolbar.append(files);
 button(t.export,exportCsv,toolbar);button(t.help,showHelp,toolbar);root.append(toolbar);
 const options=el('section'),modes=el('select') as HTMLSelectElement;modes.id='mode';modes.setAttribute('aria-label',t.modeLabel);modes.append(option('impact',t.impact),option('all',t.all));modes.value=mode;modes.onchange=()=>{mode=modes.value;refresh();};options.append(modes);
 const dir=el('select') as HTMLSelectElement;dir.id='direction';dir.setAttribute('aria-label',t.direction);dir.append(option('dependents',t.dependents),option('precedents',t.precedents));dir.value=direction;dir.onchange=()=>{direction=dir.value as typeof direction;refresh();};options.append(dir);
 const range=el('select') as HTMLSelectElement;range.id='scope';range.setAttribute('aria-label',t.scope);range.append(option('all',t.every),option('current',t.current));range.value=scope;range.onchange=()=>{scope=range.value;refresh();};options.append(range);
 for(const [key,label]of [['formula',t.formula],['chart',t.chart],['pivot',t.pivot],['vba',t.vba],['indirect',t.indirect]]){const l=el('label'),i=el('input') as HTMLInputElement;i.type='checkbox';i.id=key;i.checked=kinds[key];i.disabled=key==='vba';i.onchange=()=>{kinds[key]=i.checked;refresh();};l.append(i,document.createTextNode(label));options.append(l);}
 const filter=el('input') as HTMLInputElement;filter.id='filter';filter.placeholder=t.search;filter.setAttribute('aria-label',t.search);filter.value=keyword;filter.oninput=()=>{keyword=filter.value;refresh();};options.append(filter);root.append(options);
 const picker=el('fieldset');picker.id='target-picker';picker.append(el('legend',t.targetTitle));const grid=el('div');grid.className='target-grid';
 const book=el('select') as HTMLSelectElement;book.id='target-book';book.onchange=()=>{++excelSyncSequence;target.setBook(book.value,choices());refresh();};grid.append(labelled(t.book,book));
 const sheet=el('select') as HTMLSelectElement;sheet.id='target-sheet';sheet.onchange=()=>{++excelSyncSequence;target.setSheet(sheet.value);refresh();};grid.append(labelled(t.sheet,sheet));
 const address=el('input') as HTMLInputElement;address.id='target-address';address.type='text';address.placeholder=t.placeholder;address.autocomplete='off';address.spellcheck=false;address.setAttribute('aria-describedby','target-hint target-error');
 address.oninput=()=>{++excelSyncSequence;target.setAddress(address.value);clearTimeout(addressTimer);addressTimer=setTimeout(refresh,180);};address.onchange=()=>{clearTimeout(addressTimer);refresh();};address.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();investigate();}};grid.append(labelled(t.address,address));picker.append(grid);
 const actions=el('div');actions.className='toolbar';const apply=button(t.apply,investigate,actions);apply.id='investigate-target';
 if(live){const sync=button(t.fromExcel,()=>void syncExcelSelection(),actions);sync.id='sync-excel-selection';}
 const origin=el('span');origin.id='target-origin';actions.append(origin);picker.append(actions);const hint=el('p',t.hint);hint.id='target-hint';picker.append(hint);
 const error=el('p');error.id='target-error';error.setAttribute('role','alert');picker.append(error);root.append(picker);
 const books=el('div');books.id='books';root.append(books);const progress=el('p',snapshots.length?snapshots.reduce((n,s)=>n+s.edges.length,0)+' references':t.ready);progress.id='status';progress.setAttribute('role','status');root.append(progress);
 const cancel=button(t.stop,()=>controller?.abort(),root);cancel.id='cancel';cancel.disabled=!controller;
 const container=el('div');container.className='table-wrap';const table=el('table'),thead=el('thead'),tr=el('tr');
 for(const [key,label]of [['kind',t.kind],['source',t.source],['target',t.target],['certainty',t.certainty],['indirect',t.direct],['content',t.content],['action','']]){const th=el('th',label);th.style.resize='horizontal';th.onclick=()=>{ascending=sort===key?!ascending:true;sort=key;draw();};tr.append(th);}thead.append(tr);table.append(thead);const tbody=el('tbody');tbody.id='results';table.append(tbody);container.append(table);root.append(container);
 const pager=el('div');pager.className='toolbar';button(t.before,()=>{page=Math.max(0,page-1);draw();},pager);const count=el('span');count.id='count';pager.append(count);button(t.next,()=>{if((page+1)*100<rows.length)page++;draw();},pager);root.append(pager);const diagnostics=el('ul');diagnostics.id='diagnostics';root.append(diagnostics);refresh();
}
function updateTargetControls(){
 const t=words(),books=choices();target.reconcile(books);
 const book=control<HTMLSelectElement>('target-book');book.replaceChildren(...(books.length?books.map(b=>option(b.id,b.name+(b.live?' [Excel]':' [file]'))):[option('',t.noBooks)]));book.value=target.draft.book;book.disabled=!books.length;
 const sheets=books.find(b=>b.id===target.draft.book)?.sheets??[],sheet=control<HTMLSelectElement>('target-sheet');sheet.replaceChildren(...(sheets.length?sheets.map(s=>option(s,s)):[option('',t.noSheets)]));sheet.value=target.draft.sheet;sheet.disabled=!sheets.length;
 const address=control<HTMLInputElement>('target-address');address.value=target.draft.address;address.disabled=!sheets.length;address.setAttribute('aria-invalid',String(mode==='impact'&&target.resolve(books).error==='address'));control<HTMLButtonElement>('investigate-target').disabled=!sheets.length;
 control('target-origin').textContent=target.origin==='excel'?t.excel:t.manual;const error=control('target-error');error.textContent=mode==='impact'?targetError():'';error.hidden=!error.textContent;
}
function investigate(){clearTimeout(addressTimer);mode='impact';control<HTMLSelectElement>('mode').value=mode;refresh();}
function textLocation(location:Edge['source']){return [location.book,location.sheet,location.address,location.name,location.module,location.line].filter(Boolean).join(' / ');}
function draw(){
 const body=control('results');body.replaceChildren();const t=words(),labels:Record<string,string>=lang==='ja'?{formula:'数式',chart:'グラフ',pivot:'ピボット',confirmed:'確定',estimated:'推定',unknown:'判定不能',direct:'直接',indirect:'間接'}:{};
 const field=(e:Edge)=>sort==='source'?textLocation(e.source):sort==='target'?textLocation(e.target):String(e[sort as keyof Edge]??'');rows.sort((a,b)=>field(a).localeCompare(field(b),lang)*(ascending?1:-1));
 for(const edge of rows.slice(page*100,page*100+100)){const tr=el('tr');for(const value of [labels[edge.kind]??edge.kind,textLocation(edge.source),textLocation(edge.target),labels[edge.certainty]??edge.certainty,labels[edge.indirect?'indirect':'direct']??(edge.indirect?'indirect':'direct'),edge.content])tr.append(el('td',value));
 const actions=el('td');for(const location of [edge.source,edge.target]){const go=button(t.go+(location===edge.source?' ←':' →'),()=>void navigate(location).catch(error=>status(String(error))),actions);go.disabled=!live||location.kind==='external';go.setAttribute('aria-label',t.go+' '+textLocation(location));}
 button(t.copy,()=>void navigator.clipboard.writeText(textLocation(edge.source)+' → '+textLocation(edge.target)).catch(error=>status(String(error))),actions);tr.append(actions);body.append(tr);}
 if(!rows.length){const tr=el('tr'),td=el('td',mode==='impact'&&targetError()?targetError():t.empty);td.setAttribute('colspan','7');tr.append(td);body.append(tr);}control('count').textContent=rows.length+' · '+(page+1)+'/'+Math.max(1,Math.ceil(rows.length/100));
}
function refresh(){
 updateTargetControls();let edges=snapshots.flatMap(s=>s.edges);if(mode==='impact'){const resolved=target.resolve(choices());edges=resolved.location?query(edges,resolved.location,direction,kinds.indirect):[];}
 const key=keyword.toLowerCase();rows=edges.filter(edge=>kinds[edge.kind]&&(scope!=='current'||edge.target.book===target.draft.book)&&(!key||[edge.content,textLocation(edge.source),textLocation(edge.target)].join(' ').toLowerCase().includes(key)));page=0;draw();
 control('books').replaceChildren(...snapshots.map((snapshot,index)=>{const span=el('span',snapshot.books.map(b=>b.name+(b.live?' [Excel]':' [file]')).join(', '));const remove=button('×',()=>{snapshots.splice(index,1);refresh();},span);remove.disabled=!!controller;remove.setAttribute('aria-label',snapshot.books.map(b=>b.name).join(', ')+' ×');return span;}));
 control('diagnostics').replaceChildren(...snapshots.flatMap(s=>s.diagnostics).slice(0,200).map(d=>el('li',[d.book,d.sheet,d.message].filter(Boolean).join(' / '))));
}
async function syncExcelSelection(){
 if(!live)return;const sequence=++excelSyncSequence;try{const result=await readSelection();if(sequence!==excelSyncSequence)return;activeBook=result.book;target.useExcel(result.location);refresh();}catch(error){if(sequence===excelSyncSequence)status(String(error));}
}
async function busy(fn:(signal:AbortSignal,progress:(text:string)=>void)=>Promise<void>){
 if(controller)return;controller=new AbortController();const start=performance.now();control<HTMLButtonElement>('cancel').disabled=false;control<HTMLButtonElement>('reanalyze').disabled=true;control<HTMLButtonElement>('add-files').disabled=true;
 const progress=(text:string)=>status(text+' · '+((performance.now()-start)/1000).toFixed(1)+'s');
 try{await fn(controller.signal,progress);progress(snapshots.reduce((n,s)=>n+s.edges.length,0)+' references');}catch(error){status(String(error));}finally{controller=null;control<HTMLButtonElement>('cancel').disabled=true;control<HTMLButtonElement>('reanalyze').disabled=!live;control<HTMLButtonElement>('add-files').disabled=false;refresh();}
}
async function run(){await busy(async(signal,progress)=>{const snapshot=await scan(signal,progress);snapshots=snapshots.filter(s=>!s.books.some(b=>b.live));snapshots.unshift(snapshot);await syncExcelSelection();});}
async function importFiles(files:File[]){await busy(async(signal,progress)=>{for(const file of files){if(signal.aborted)break;if(snapshots.some(s=>s.books.some(b=>b.id===file.name&&!b.live)))throw Error('Duplicate filename: '+file.name);snapshots.push(await readFile(file,signal,progress));}});}
function exportCsv(){const url=URL.createObjectURL(new Blob([csv(rows)],{type:'text/csv;charset=utf-8'}));const link=el('a') as HTMLAnchorElement;link.href=url;link.download='monja-references.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function showHelp(){const dialog=el('dialog') as HTMLDialogElement;dialog.append(el('p',lang==='ja'?'ブラウザーではファイルを追加し、ブック・シート・セル範囲を指定して影響を調査します。Excel内では選択範囲を同じ欄に反映します。方向やフィルターの変更だけではファイル全体を再解析しません。ファイルや数式は外部送信しません。VBA、暗号化ファイル、xls/xlsbは対象外です。推定参照には過大・過小検出の可能性があります。':'In the browser, add saved files and specify a workbook, worksheet and cell/range. Inside Excel, the selection updates these same fields. Changing direction or filters reuses parsed data. Workbook contents stay local. VBA, encrypted files, xls and xlsb are unavailable. Estimated references may over- or under-match.'));button('OK',()=>dialog.remove(),dialog);root.append(dialog);dialog.showModal();}
const command=new URLSearchParams(location.search).get('command');if(command==='impact')mode='impact';render();
if(typeof Office!=='undefined')Office.onReady(info=>{
 live=info.host===Office.HostType.Excel;if(!live)return;render();void syncExcelSelection();
 Excel.run(async context=>{context.workbook.onSelectionChanged.add(async()=>{await syncExcelSelection();});await context.sync();}).catch(error=>status(String(error)));
 if(command==='scan')void run();else if(command==='settings')(document.querySelector('select') as HTMLSelectElement).focus();else if(command==='help')showHelp();else if(command==='books')status(lang==='ja'?'「検索対象ブックを追加」で保存済みファイルを選択してください。':'Use Add target workbooks to select saved files.');else if(command==='export')status(lang==='ja'?'解析後に「CSV出力」を押してください。':'Analyze a workbook, then choose Export CSV.');
});



