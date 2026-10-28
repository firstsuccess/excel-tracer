import test from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {parseFormula,translateShared} from '../../shared/formula';
import {bounds,csv,query,type Context,type Location} from '../../shared/model';
import {parsePackage} from '../src/file';
import {zipSync,strToU8} from 'fflate';
const ctx:Context={book:'Book.xlsx',sheet:'入力',sheets:['入力','集計','Data Sheet'],names:{Amount:"='入力'!$B$5",Dyn:'=OFFSET(入力!A1,1,0)'},tables:{Sales:{sheet:'入力',address:'A1:C100',columns:['ID','Price','Qty']}}};
const target:Location={book:ctx.book,sheet:ctx.sheet,address:'D10',kind:'cell'};
const parse=(f:string)=>parseFormula(f,target,ctx);
test('relative absolute mixed and range references',()=>{assert.deepEqual(parse('=SUM(A1,$B$5,C$2,$D3,A1:C100)').map(e=>e.source.address),['A1','B5','C2','D3','A1:C100']);});
test('quoted sheets, escaped quotes and external book',()=>{const p=parse("='Data Sheet'!A1+[Other.xlsx]Sheet1!B2+'O''Brien'!C3");assert.equal(p[0].source.sheet,'Data Sheet');assert.equal(p[1].source.book,'Other.xlsx');assert.equal(p[2].source.sheet,"O'Brien");});
test('string literals, function identifiers and named identifiers are not cells',()=>{assert.equal(parse('="A1"&"B5"').length,0);assert.deepEqual(parse('=LOG10(A1)+ATAN2(B2,C3)').map(e=>e.source.address),['A1','B2','C3']);});
test('names and tables',()=>{assert.equal(parse('=Amount')[0].source.address,'B5');assert.equal(parse('=SUM(Sales[Price])')[0].source.address,'B2:B100');});
test('dynamic formulas are not confirmed',()=>{assert.ok(parse('=INDIRECT("A1")').every(e=>e.certainty!=='confirmed'));assert.ok(parse('=OFFSET(A1,1,0)').every(e=>e.certainty!=='confirmed'));assert.ok(parse('=Dyn').every(e=>e.certainty!=='confirmed'));});
test('3D references and spill anchors',()=>{assert.equal(parse('=SUM(入力:集計!A1)').length,2);assert.equal(parse('=A1#')[0].certainty,'estimated');});
test('large ranges are compact and row/column ranges overlap',()=>{const p=parse('=SUM(A1:A1000000)');assert.equal(p.length,1);assert.equal(query(p,{...target,address:'A999999'},'dependents',false).length,1);assert.deepEqual(bounds('A:A'),[1,1,1048576,1]);});
test('cycle terminates and traverses both directions',()=>{const a=parseFormula('=B1',{...target,address:'A1'},ctx),b=parseFormula('=A1',{...target,address:'B1'},ctx);assert.equal(query([...a,...b],{...target,address:'A1'},'dependents',true).length,2);assert.equal(query([...a,...b],{...target,address:'A1'},'precedents',false).length,1);});
test('CSV escapes formulas, commas, quotes, line breaks and includes BOM',()=>{const p=parse('=A1');p[0].content='=HYPERLINK("evil")\n,"';const text=csv(p);assert.equal(text.charCodeAt(0),0xfeff);assert.ok(text.includes('"\'=HYPERLINK'));assert.ok(text.includes('""evil""'));});
test('OOXML formulas, chart series, pivot cache and local definitions',()=>{const f:Record<string,string>={
 'xl/workbook.xml':'<workbook xmlns:r="r"><sheets><sheet name="入力" r:id="r1"/></sheets><definedNames><definedName name="Amount">入力!B5</definedName></definedNames><pivotCaches><pivotCache cacheId="1" r:id="pc"/></pivotCaches></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships><Relationship Id="r1" Target="worksheets/sheet1.xml"/><Relationship Id="pc" Target="pivotCache/pivotCacheDefinition1.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':'<worksheet><sheetData><row><c r="D10"><f>Amount+A1</f></c></row></sheetData></worksheet>',
 'xl/worksheets/_rels/sheet1.xml.rels':'<Relationships><Relationship Id="d1" Target="../drawings/drawing1.xml"/><Relationship Id="p1" Target="../pivotTables/pivotTable1.xml"/></Relationships>',
 'xl/drawings/_rels/drawing1.xml.rels':'<Relationships><Relationship Id="ch1" Target="../charts/chart1.xml"/></Relationships>',
 'xl/charts/chart1.xml':'<c:chartSpace xmlns:c="c"><c:chart><c:ser><c:val><c:numRef><c:f>入力!B2:B100</c:f></c:numRef></c:val></c:ser></c:chart></c:chartSpace>',
 'xl/pivotTables/pivotTable1.xml':'<pivotTableDefinition name="売上" cacheId="1"><location ref="H5:K30"/></pivotTableDefinition>',
 'xl/pivotCache/pivotCacheDefinition1.xml':'<pivotCacheDefinition><cacheSource><worksheetSource ref="A1:F100" sheet="入力"/></cacheSource></pivotCacheDefinition>'};
 const zipped=zipSync(Object.fromEntries(Object.entries(f).map(([p,s])=>[p,strToU8(s)])));const out=parsePackage(zipped.buffer as ArrayBuffer,'Book.xlsx',()=>{});assert.equal(out.edges.filter(e=>e.kind==='formula').length,2);assert.equal(out.edges.filter(e=>e.kind==='chart').length,1);assert.equal(out.edges.find(e=>e.kind==='pivot')?.target.address,'H5');
});
test('10000 and 100000 formula performance',()=>{for(const n of [10000,100000]){const start=performance.now(),before=process.memoryUsage().heapUsed;let count=0;for(let i=1;i<=n;i++)count+=parseFormula('=A'+i,{...target,address:'B'+i},ctx).length;assert.equal(count,n);console.log(JSON.stringify({formulas:n,elapsedMs:performance.now()-start,heapDelta:process.memoryUsage().heapUsed-before}));}});
test('shared formulas preserve absolute anchors and quoted text',()=>{assert.equal(translateShared('A1+$B$1+C$2+$D3+"A1"+\'A1\'!E1+[Book1.xlsx]Sheet1!F1','B2','C3'),'B2+$B$1+D$2+$D4+"A1"+\'A1\'!F2+[Book1.xlsx]Sheet1!G2');});
test('unresolved external indices are unknown',()=>{assert.equal(parse('=[1]Sheet1!A1')[0].certainty,'unknown');});
test('100000-edge transitive chain uses compact interval lookup',()=>{const n=100000;const edges=Array.from({length:n},(_,i)=>({id:'edge'+i,kind:'formula' as const,source:{...target,address:'A'+(i+1)},target:{...target,address:'A'+(i+2)},certainty:'confirmed' as const,method:'fixture',content:'=A'+(i+1)}));const start=performance.now();assert.equal(query(edges,{...target,address:'A1'},'dependents',true).length,n);console.log(JSON.stringify({graphEdges:n,queryMs:performance.now()-start,heapUsed:process.memoryUsage().heapUsed}));});
