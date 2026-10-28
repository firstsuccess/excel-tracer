export type Kind='formula'|'vbaRead'|'vbaWrite'|'vbaRange'|'chart'|'pivot';
export interface Location {book:string;sheet:string;address?:string;kind:'cell'|'range'|'vba'|'chart'|'pivot'|'external';name?:string;module?:string;procedure?:string;line?:number}
export interface Edge {id:string;kind:Kind;source:Location;target:Location;certainty:'confirmed'|'estimated'|'unknown';method:string;content:string;indirect?:boolean}
export interface Diagnostic {book:string;sheet?:string;message:string}
export interface WorkbookInfo {id:string;name:string;live:boolean;sheets?:string[]}
export interface Snapshot {edges:Edge[];diagnostics:Diagnostic[];books:WorkbookInfo[]}
export interface Context {book:string;sheet:string;sheets:string[];names:Record<string,string>;tables:Record<string,{sheet:string;address:string;columns:string[]}>;externalBooks?:Record<string,string>}
export const MAX_EDGES=500000;
export function column(s:string):number {let n=0;for(const c of s.toUpperCase()) n=n*26+c.charCodeAt(0)-64;return n;}
export function letters(n:number):string {let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
export function bounds(address:string):[number,number,number,number]|null {
 const a=address.replace(/\$/g,'').split(':');
 const parse=(s:string,end:boolean):[number,number]|null=>{let m=/^([A-Z]{1,3})([1-9]\d*)$/i.exec(s);if(m){const c=column(m[1]),r=+m[2];return c<=16384&&r<=1048576?[r,c]:null;}if(/^[A-Z]{1,3}$/i.test(s)&&column(s)<=16384)return [end?1048576:1,column(s)];if(/^[1-9]\d*$/.test(s)&&+s<=1048576)return [+s,end?16384:1];return null;};
 const x=parse(a[0],false),y=parse(a[1]??a[0],true);return x&&y?[Math.min(x[0],y[0]),Math.min(x[1],y[1]),Math.max(x[0],y[0]),Math.max(x[1],y[1])]:null;
}
export function overlaps(a:Location,b:Location):boolean {if(a.book!==b.book||a.sheet!==b.sheet||!a.address||!b.address)return false;const x=bounds(a.address),y=bounds(b.address);return !!x&&!!y&&x[0]<=y[2]&&y[0]<=x[2]&&x[1]<=y[3]&&y[1]<=x[3];}
interface Interval {edge:Edge;box:[number,number,number,number];max:number;left?:Interval;right?:Interval}
function index(edges:Edge[],direction:'dependents'|'precedents'){
 const groups=new Map<string,{edge:Edge;box:[number,number,number,number]}[]>();const key=(l:Location)=>l.book.toLowerCase()+'\0'+l.sheet.toLowerCase();
 for(const edge of edges){const l=direction==='dependents'?edge.source:edge.target,box=l.address?bounds(l.address):null;if(!box)continue;const k=key(l),a=groups.get(k)??[];a.push({edge,box});groups.set(k,a);}
 const roots=new Map<string,Interval|undefined>();
 for(const [k,a]of groups){a.sort((x,y)=>x.box[0]-y.box[0]);const build=(lo:number,hi:number):Interval|undefined=>{if(lo>=hi)return;const mid=(lo+hi)>>1,n:Interval={...a[mid],max:a[mid].box[2],left:build(lo,mid),right:build(mid+1,hi)};n.max=Math.max(n.max,n.left?.max??0,n.right?.max??0);return n;};roots.set(k,build(0,a.length));}
 return (location:Location)=>{const found:Edge[]=[],box=location.address?bounds(location.address):null;if(!box)return found;const visit=(n?:Interval)=>{if(!n||n.max<box[0])return;if(n.left)visit(n.left);if(n.box[0]>box[2])return;if(n.box[2]>=box[0]&&n.box[1]<=box[3]&&box[1]<=n.box[3])found.push(n.edge);visit(n.right);};visit(roots.get(key(location)));return found;};
}
export function query(edges:Edge[],selected:Location,direction:'dependents'|'precedents',transitive:boolean,limit=100000):Edge[]{
 const candidates=index(edges,direction);
 const result:Edge[]=[],seen=new Set<string>(),frontier:Location[]=[selected];let cursor=0;
 while(cursor<frontier.length&&result.length<limit){const p=frontier[cursor++];for(const e of candidates(p)){if(seen.has(e.id)||e.certainty==='unknown')continue;seen.add(e.id);result.push({...e,indirect:cursor>1});if(transitive)frontier.push(direction==='dependents'?e.target:e.source);if(result.length>=limit)break;}if(!transitive)break;}
 return result;
}
const headers=['種類','参照元ブック','参照元シート','参照元セルまたは範囲','参照先ブック','参照先シート','参照先セルまたは開始セル','グラフ名','ピボットテーブル名','VBAモジュール','VBAプロシージャ','VBA行番号','参照内容','直接／間接','確実性','検出方法'];
export function csv(edges:Edge[]):string {const quote=(v:unknown)=>{let s=String(v??'');if(/^[\s\u0000-\u001f]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return '\ufeff'+[headers,...edges.map(e=>[e.kind,e.source.book,e.source.sheet,e.source.address,e.target.book,e.target.sheet,e.target.address,e.target.kind==='chart'?e.target.name:'',e.target.kind==='pivot'?e.target.name:'',e.target.module,e.target.procedure,e.target.line,e.content,e.indirect?'indirect':'direct',e.certainty,e.method])].map(r=>r.map(quote).join(',')).join('\r\n');}
