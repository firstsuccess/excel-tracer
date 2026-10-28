using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
class InspectRunning {
 [DllImport("ole32.dll")]static extern int GetRunningObjectTable(int r,out IRunningObjectTable t);
 [DllImport("ole32.dll")]static extern int CreateBindCtx(int r,out IBindCtx c);
 [STAThread]static int Main(){IRunningObjectTable table;IBindCtx context;GetRunningObjectTable(0,out table);CreateBindCtx(0,out context);IEnumMoniker list;table.EnumRunning(out list);var values=new IMoniker[1];var seen=new HashSet<int>();int found=0;try{while(list.Next(1,values,IntPtr.Zero)==0){object value=null;try{string name;values[0].GetDisplayName(context,null,out name);if(!name.EndsWith(".xlsx",StringComparison.OrdinalIgnoreCase)&&!name.EndsWith(".xlsm",StringComparison.OrdinalIgnoreCase))continue;table.GetObject(values[0],out value);dynamic workbook=value,app=workbook.Application;int hwnd=app.Hwnd;if(!seen.Add(hwnd))continue;found++;Console.WriteLine("EXCEL hwnd="+hwnd+" book="+workbook.Name);dynamic addin=app.COMAddIns.Item("Monja");Console.WriteLine("Connected="+addin.Connect);if(addin.Connect){dynamic bridge=addin.Object;Console.WriteLine("Version="+bridge.Version+" Ready="+bridge.Ready+" Busy="+bridge.IsBusy+" Count="+bridge.ResultCount+" Visible="+bridge.PaneVisible+" Status="+bridge.Status);}}catch(Exception ex){Console.WriteLine("INSPECT "+ex.GetType().Name+" "+ex.Message);}finally{if(value!=null&&Marshal.IsComObject(value))Marshal.ReleaseComObject(value);Marshal.ReleaseComObject(values[0]);}}Console.WriteLine("RUNNING_INSTANCES="+found);return 0;}finally{Marshal.ReleaseComObject(list);Marshal.ReleaseComObject(context);Marshal.ReleaseComObject(table);}}
}
