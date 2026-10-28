using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Monja;
class DiagnoseOpenBooks {
 [DllImport("ole32.dll")]static extern int GetRunningObjectTable(int r,out IRunningObjectTable t);
 [DllImport("ole32.dll")]static extern int CreateBindCtx(int r,out IBindCtx c);
 static int exit=1;
 [STAThread]static int Main(){SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());var timer=new System.Windows.Forms.Timer{Interval=20};timer.Tick+=async(s,e)=>{timer.Stop();try{await Run();exit=0;}catch(Exception ex){Console.Error.WriteLine(ex);}finally{Application.ExitThread();}};timer.Start();Application.Run();return exit;}
 static async Task Run(){IRunningObjectTable table;IBindCtx context;GetRunningObjectTable(0,out table);CreateBindCtx(0,out context);IEnumMoniker list;table.EnumRunning(out list);var values=new IMoniker[1];var applications=new HashSet<int>();try{while(list.Next(1,values,IntPtr.Zero)==0){object value=null;try{string name;values[0].GetDisplayName(context,null,out name);if(!name.EndsWith(".xlsx",StringComparison.OrdinalIgnoreCase))continue;table.GetObject(values[0],out value);dynamic workbook=value,app=workbook.Application;int hwnd=app.Hwnd;if(!applications.Add(hwnd))continue;dynamic books=app.Workbooks;for(int i=1;i<=books.Count;i++){dynamic book=books.Item[i];string id=ExcelScanner.Identity(book);if(System.IO.Path.GetFileName(id).Equals("integration.xlsx",StringComparison.OrdinalIgnoreCase))continue;Console.WriteLine("BEGIN workbook="+i+" hwnd="+hwnd+" sheets="+book.Worksheets.Count);try{var result=await new ExcelScanner((object)app).Scan(new HashSet<string>{id},false,CancellationToken.None,new Progress<string>());Console.WriteLine("RESULT references="+result.Edges.Count+" diagnostics="+result.Diagnostics.Count);foreach(string diagnostic in result.Diagnostics)Console.WriteLine("DIAGNOSTIC "+diagnostic);}catch(Exception ex){Console.WriteLine("EXCEPTION "+ex);}finally{ExcelScanner.Release((object)book);}}}catch(Exception ex){Console.WriteLine("READ "+ex);}finally{if(value!=null&&Marshal.IsComObject(value))Marshal.ReleaseComObject(value);Marshal.ReleaseComObject(values[0]);}}}finally{Marshal.ReleaseComObject(list);Marshal.ReleaseComObject(context);Marshal.ReleaseComObject(table);}}
}
