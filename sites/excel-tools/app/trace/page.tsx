import type {Metadata} from 'next';import Site from '../site';
export const metadata:Metadata={title:'もんじゃExcel参照トレーサー | Monja Excel Reference Tracer',description:'数式・グラフ・ピボットの参照関係を端末内で調査。Office.js版の保存ファイル解析、VSTO版との機能差、配布状況と利用方法をご案内します。',alternates:{canonical:'/trace/'},openGraph:{title:'もんじゃExcel参照トレーサー',description:'Excelの変更影響を、参照関係から見渡す。対応範囲と配布状況をご確認ください。',url:'https://excel.mnoda1979.chatgpt.site/trace/',type:'website',locale:'ja_JP'}};
export default function Product(){return <Site product/>;}
