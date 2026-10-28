using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml.Linq;
using Monja;
class LiveStress {
 static int exit=1;static void Check(bool ok,string name){if(!ok)throw new Exception(name);Console.WriteLine("PASS "+name);}
 [STAThread]static int Main(){SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());var timer=new System.Windows.Forms.Timer{Interval=10};timer.Tick+=async(s,e)=>{timer.Stop();try{await Run();exit=0;}catch(Exception ex){Console.Error.WriteLine(ex);}finally{System.Windows.Forms.Application.ExitThread();}};timer.Start();System.Windows.Forms.Application.Run();return exit;}
 static void WriteXml(ZipArchive zip,string name,XDocument value){var old=zip.GetEntry(name);if(old!=null)old.Delete();using(var stream=zip.CreateEntry(name).Open())value.Save(stream);}
 static XDocument ReadXml(ZipArchive zip,string name){using(var stream=zip.GetEntry(name).Open())return XDocument.Load(stream);}
 static async Task Run(){dynamic app=null,book=null,macro=null;try{app=Activator.CreateInstance(Type.GetTypeFromProgID("Excel.Application"));app.DisplayAlerts=false;app.AutomationSecurity=3;book=app.Workbooks.Add();dynamic sheet=book.Worksheets.Item[1];sheet.Name="Input";sheet.Range["A1"].Value2=1;var scanner=new ExcelScanner((object)app);var targets=new HashSet<string>{ExcelScanner.Identity(book)};
 foreach(int size in new[]{10000,100000}){sheet.Range["B1:B"+size].FormulaR1C1="=RC[-1]";var watch=Stopwatch.StartNew();long before=GC.GetTotalMemory(true);var result=await scanner.Scan(targets,false,CancellationToken.None,new Progress<string>(),false);Check(result.Edges.Count==size,"live "+size+" formulas");Console.WriteLine("PERF live="+size+" elapsedMs="+watch.ElapsedMilliseconds+" heapDelta="+(GC.GetTotalMemory(false)-before)+" workingSet="+Process.GetCurrentProcess().WorkingSet64);}
 using(var stop=new CancellationTokenSource()){bool requested=false,stopped=false;var progress=new Progress<string>(s=>{if(s.Contains("20000")){requested=true;stop.Cancel();}});try{await scanner.Scan(targets,false,stop.Token,progress,false);}catch(OperationCanceledException){stopped=true;}Check(requested&&stopped,"live cancellation during chunk collection");}
 string path=Path.GetFullPath("vsto/tests/fixtures/live-static-"+Guid.NewGuid().ToString("N")+".xlsm");macro=app.Workbooks.Add();macro.Worksheets.Item[1].Name="Input";macro.SaveAs(path,52);macro.Close(false);macro=null;
 using(var zip=ZipFile.Open(path,ZipArchiveMode.Update)){zip.CreateEntryFromFile("vsto/tests/fixtures/static-references-vbaProject.bin","xl/vbaProject.bin");XNamespace rel="http://schemas.openxmlformats.org/package/2006/relationships";var relationships=ReadXml(zip,"xl/_rels/workbook.xml.rels");relationships.Root.Add(new XElement(rel+"Relationship",new XAttribute("Id","rIdMonjaVba"),new XAttribute("Type","http://schemas.microsoft.com/office/2006/relationships/vbaProject"),new XAttribute("Target","vbaProject.bin")));WriteXml(zip,"xl/_rels/workbook.xml.rels",relationships);XNamespace ct="http://schemas.openxmlformats.org/package/2006/content-types";var types=ReadXml(zip,"[Content_Types].xml");types.Root.Add(new XElement(ct+"Override",new XAttribute("PartName","/xl/vbaProject.bin"),new XAttribute("ContentType","application/vnd.ms-office.vbaProject")));WriteXml(zip,"[Content_Types].xml",types);}
 macro=app.Workbooks.Open(path,0,true);Check((bool)macro.HasVBProject,"real macro workbook opened with macros disabled");var macroTargets=new HashSet<string>{ExcelScanner.Identity(macro)};var saved=await scanner.Scan(macroTargets,false,CancellationToken.None,new Progress<string>());Check(saved.Edges.Count(e=>e.Method=="vba-saved-file")==3,"live standard VBA mode without VBProject access");Check(saved.Edges.Any(e=>e.Kind=="vbaWrite"&&e.Target.Address=="B5"),"saved VBA write direction");Console.WriteLine("Saved VBA diagnostics="+String.Join(" | ",saved.Diagnostics));var extended=await scanner.Scan(macroTargets,true,CancellationToken.None,new Progress<string>());Check(extended.Edges.Any(e=>e.Kind.StartsWith("vba"))||extended.Diagnostics.Any(d=>d.Contains("access denied")),"extended VBA access or explicit denial diagnostic");Console.WriteLine("Extended VBA diagnostics="+String.Join(" | ",extended.Diagnostics));macro.Close(false);macro=null;
 // Closing only the test workbook from a progress callback exercises host disappearance.
 bool closed=false;var closeProgress=new Progress<string>(s=>{if(!closed&&s.Contains("20000")){closed=true;book.Close(false);book=null;}});var unavailable=await scanner.Scan(targets,false,CancellationToken.None,closeProgress,false);Check(closed&&unavailable.Diagnostics.Count>0,"workbook closed mid-scan produces diagnostic");
 }finally{if((object)macro!=null)macro.Close(false);if((object)book!=null)book.Close(false);if((object)app!=null)app.Quit();}}
}
