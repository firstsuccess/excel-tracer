import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://excel.mnoda1979.chatgpt.site/'),title:'Monja Excel Tools / もんじゃExcelツール | ファーストサクセス合同会社',description:'ファーストサクセス合同会社のExcelツール一覧。数式やグラフ、ピボットの参照関係を端末内で調査し、Excel業務の保守・運用を支援します。',alternates:{canonical:'/'},openGraph:{title:'Monja Excel Tools / Excelツール',description:'Excel業務の効率化と保守・運用を支援するツール。',url:'https://excel.mnoda1979.chatgpt.site/',type:'website',locale:'ja_JP'},icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>;}

