import {bounds,type Location,type Snapshot,type WorkbookInfo} from '../../shared/model';

export interface WorkbookChoice extends WorkbookInfo {sheets:string[]}
export type SelectionError='book'|'sheet'|'address'|null;

export function workbookChoices(snapshots:Snapshot[],active?:WorkbookInfo):WorkbookChoice[]{
 const choices=new Map<string,WorkbookChoice>();
 for(const book of [...snapshots.flatMap(s=>s.books),...(active?[active]:[])]){
  const sheets=book.sheets??snapshots.flatMap(s=>s.edges.flatMap(e=>[e.source,e.target]))
   .filter(l=>l.book===book.id&&l.sheet&&l.kind!=='chart'&&l.kind!=='external').map(l=>l.sheet);
  const previous=choices.get(book.id);
  choices.set(book.id,{...book,live:book.live||!!previous?.live,sheets:[...new Set([...(previous?.sheets??[]),...sheets])]});
 }
 return [...choices.values()];
}

export function normalizeAddress(raw:string):string|null{
 const address=raw.trim().replace(/\$/g,'').toUpperCase();
 if(!/^(?:[A-Z]{1,3}[1-9]\d*(?::[A-Z]{1,3}[1-9]\d*)?|[A-Z]{1,3}:[A-Z]{1,3}|[1-9]\d*:[1-9]\d*)$/.test(address))return null;
 return bounds(address)?address:null;
}

// Both manual entry and Excel selection write into this one target model.
export class SelectionModel {
 draft={book:'',sheet:'',address:''};
 origin:'manual'|'excel'='manual';
 reconcile(books:WorkbookChoice[]):void{
  let book=books.find(b=>b.id===this.draft.book);
  if(!book){book=books[0];this.draft.book=book?.id??'';this.draft.sheet='';this.origin='manual';}
  if(!book?.sheets.includes(this.draft.sheet))this.draft.sheet=book?.sheets[0]??'';
 }
 setBook(id:string,books:WorkbookChoice[]):void{this.draft.book=id;this.draft.sheet='';this.origin='manual';this.reconcile(books);}
 setSheet(name:string):void{this.draft.sheet=name;this.origin='manual';}
 setAddress(address:string):void{this.draft.address=address;this.origin='manual';}
 useExcel(location:Location):void{this.draft={book:location.book,sheet:location.sheet,address:location.address??''};this.origin='excel';}
 resolve(books:WorkbookChoice[]):{location:Location|null;error:SelectionError}{
  const book=books.find(b=>b.id===this.draft.book);if(!book)return {location:null,error:'book'};
  if(!book.sheets.includes(this.draft.sheet))return {location:null,error:'sheet'};
  const address=normalizeAddress(this.draft.address);if(!address)return {location:null,error:'address'};
  return {location:{book:book.id,sheet:this.draft.sheet,address,kind:address.includes(':')?'range':'cell'},error:null};
 }
}
