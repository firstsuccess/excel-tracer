import {type Context,type Edge,type Location,column,letters,bounds} from './model';
function lookup<T>(values:Record<string,T>,name:string):T|undefined {const key=Object.keys(values).find(k=>k.toLowerCase()===name.toLowerCase());return key===undefined?undefined:values[key];}
export function translateShared(formula:string,from:string,to:string):string {
 const cell=/^([A-Z]+)(\d+)$/i,origin=cell.exec(from),dest=cell.exec(to);if(!origin||!dest)throw Error('Invalid shared formula location');
 const dx=column(dest[1])-column(origin[1]),dy=+dest[2]-+origin[2];
 return formula.split(/("(?:[^"]|"")*"|'(?:[^']|'')*'|\[[^\]]*\])/g).map((part,i)=>i%2?part:part.replace(/(?<![\p{L}\p{N}_.])(?<colabs>\$?)(?<col>[A-Z]{1,3})(?<rowabs>\$?)(?<row>[1-9]\d*)(?![\p{L}\p{N}_!(])/giu,(all,...args)=>{const groups=args.at(-1) as Record<string,string>;const c=column(groups.col)+(groups.colabs?0:dx),r=+groups.row+(groups.rowabs?0:dy);return c<1||c>16384||r<1||r>1048576?'#REF!':groups.colabs+letters(c)+groups.rowabs+r;})).join('');
}
export function parseFormula(formula:string,target:Location,ctx:Context,kind:Edge['kind']='formula',stack:string[]=[]):Edge[]{
 const result:Edge[]=[];let seq=0;
 const add=(source:Location,certainty:Edge['certainty']='confirmed',method='formula-static')=>result.push({id:JSON.stringify([target,kind,formula,seq++]),kind,source,target,certainty,method,content:formula});
 // Mask string literals before lexical reference recognition. Never evaluate formulas.
 let text=formula.replace(/"(?:[^"]|"")*"/g,m=>' '.repeat(m.length));
 const dynamic=/\b(INDIRECT|OFFSET|ADDRESS)\s*\(/i.test(text);
 if(dynamic)add({book:ctx.book,sheet:ctx.sheet,kind:'external',name:'runtime reference'},'unknown','dynamic-formula');
 const token=/(?:(?:'((?:[^']|'')+)'|((?:\[[^\]]+\])?[\p{L}_][\p{L}\p{N}_.]*(?::[\p{L}_][\p{L}\p{N}_.]*)?))!)?(\$?[A-Z]{1,3}\$?[1-9]\d*(?::\$?[A-Z]{1,3}\$?[1-9]\d*)?|\$?[A-Z]{1,3}:\$?[A-Z]{1,3}|\$?[1-9]\d*:\$?[1-9]\d*)(#?)/giu;
 text=text.replace(token,(all:string,quoted:string,plain:string,address:string,spill:string,offset:number)=>{
  const before=text[offset-1]??'',after=text[offset+all.length]??'';
  if(/[\p{L}\p{N}_.\[]/u.test(before)||/[\p{L}\p{N}_\][(]/u.test(after))return all;
  const clean=address.replace(/\$/g,'').toUpperCase();if(!bounds(clean))return all;
  let qualifier=(quoted??plain??ctx.sheet).replace(/''/g,"'");let book=ctx.book;
  let unresolved=false;const external=/^(.*?)\[([^\]]+)\](.*)$/.exec(qualifier);if(external){book=ctx.externalBooks?.[external[2]]??external[2];unresolved=/^\d+$/.test(book);qualifier=external[3];}
  let sheets=[qualifier];if(qualifier.includes(':')){const [a,b]=qualifier.split(':');const ai=ctx.sheets.indexOf(a),bi=ctx.sheets.indexOf(b);sheets=ai>=0&&bi>=ai?ctx.sheets.slice(ai,bi+1):[];if(!sheets.length)add({book,sheet:qualifier,address:clean,kind:'range'},'unknown','unresolved-3d');}
  for(const sheet of sheets)add({book,sheet,address:clean,kind:clean.includes(':')?'range':'cell'},unresolved?'unknown':spill||dynamic?'estimated':'confirmed',unresolved?'unresolved-external-index':spill?'spill-anchor':'formula-static');
  return ' '.repeat(all.length);
 });
 // Structured references are resolved to table bounds; row-context references remain estimated.
 text=text.replace(/\b([\p{L}_][\p{L}\p{N}_.]*)\[((?:[^\[\]]|\[[^\]]*\])*)\]/gu,(all:string,name:string,spec:string)=>{
  const t=lookup(ctx.tables,name);if(!t){add({book:ctx.book,sheet:ctx.sheet,kind:'external',name:all},'unknown','unresolved-table');return ' ';}
  const match=/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i.exec(t.address.replace(/\$/g,''));let address=t.address;
  const col=spec.replace(/[\[\]@]/g,'');const i=t.columns.findIndex(c=>c.toLowerCase()===col.toLowerCase());
  if(match&&i>=0){const c=letters(column(match[1])+i);address=c+(+match[2]+1)+':'+c+match[4];}
  add({book:ctx.book,sheet:t.sheet,address,kind:'range'},'estimated','table-static');return ' ';
 });
 for(const m of text.matchAll(/[\p{L}_\\][\p{L}\p{N}_.\\]*/gu)){
  const name=m[0],scoped=lookup(ctx.names,ctx.sheet+'!'+name),definition=scoped??lookup(ctx.names,name);
  if(!definition)continue;if(stack.some(s=>s.toLowerCase()===name.toLowerCase())){add({book:ctx.book,sheet:ctx.sheet,kind:'external',name},'unknown','cyclic-defined-name');continue;}
  const nested=parseFormula(definition,target,ctx,kind,[...stack,name]);for(const edge of nested)result.push({...edge,id:JSON.stringify([target,kind,formula,seq++]),content:formula,method:'defined-name/'+edge.method});
 }
 return result;
}

