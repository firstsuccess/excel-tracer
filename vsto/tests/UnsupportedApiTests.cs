using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Monja;
public sealed class StubIndex<T>{readonly T value;public StubIndex(T value){this.value=value;}public T this[int index]{get{return value;}}}
public sealed class StubOne<T>{public int Count{get{return 1;}}public StubIndex<T> Item{get;private set;}public StubOne(T value){Item=new StubIndex<T>(value);}}
public sealed class StubNone {public int Count{get{return 0;}}}
public sealed class StubUnsupported {public int Count{get{throw new NotImplementedException();}}}
public sealed class StubDimension {public int Count{get;set;}}
public sealed class StubRange {
 public bool Fallback;public int Row{get{return 1;}}public int Column{get{return 1;}}public StubDimension Rows{get{return new StubDimension{Count=2};}}public StubDimension Columns{get{return new StubDimension{Count=2};}}
 public object HasFormula{get{return null;}}public StubOne<StubRange> Areas{get{return new StubOne<StubRange>(this);}}
 public object Formula{get{var data=Array.CreateInstance(typeof(object),new[]{2,2},new[]{1,1});data.SetValue(4,1,1);data.SetValue("=A1",1,2);data.SetValue(7,2,1);data.SetValue("=A2",2,2);return data;}}
 public StubRange SpecialCells(int type,object missing){if(Fallback)throw new NotImplementedException();return this;}
}
public sealed class StubRangeIndex{readonly StubRange range;public StubRangeIndex(StubRange range){this.range=range;}public StubRange this[string address]{get{return range;}}}
public sealed class StubSheet {
 public bool Unsupported;public StubRange UsedRange{get;private set;}public StubRangeIndex Range{get;private set;}
 public StubSheet(bool optional,bool fallback){Unsupported=optional;UsedRange=new StubRange{Fallback=fallback};Range=new StubRangeIndex(UsedRange);}
 public string Name{get{return "Input";}}public string CodeName{get{if(Unsupported)throw new NotImplementedException();return "Sheet1";}}
 public object ListObjects{get{if(Unsupported)throw new NotImplementedException();return new StubNone();}}
 public object ChartObjects(){if(Unsupported)throw new NotImplementedException();return new StubNone();}public object PivotTables(){if(Unsupported)throw new NotImplementedException();return new StubNone();}
}
public sealed class StubBook {
 public bool Unsupported;public StubOne<StubSheet> Worksheets{get;private set;}public StubBook(bool optional,bool fallback){Unsupported=optional;Worksheets=new StubOne<StubSheet>(new StubSheet(optional,fallback));}
 public string FullName{get{return "Regression.xlsx";}}public string Name{get{return FullName;}}public object Names{get{return Unsupported?(object)new StubUnsupported():new StubNone();}}public object Charts{get{return Unsupported?(object)new StubUnsupported():new StubNone();}}
 public bool HasVBProject{get{throw new NotImplementedException("HasVBProject must not be queried for saved-file xlsx analysis.");}}public bool Saved{get{throw new NotImplementedException("VBA state must not be queried for xlsx.");}}
}
public sealed class StubExcel {public StubOne<StubBook> Workbooks{get;private set;}public StubExcel(bool optional,bool fallback){Workbooks=new StubOne<StubBook>(new StubBook(optional,fallback));}}
public sealed class UnsupportedContext:SynchronizationContext {public override void Post(SendOrPostCallback callback,object state){throw new NotImplementedException("Unsupported host synchronization context");}}
class UnsupportedApiTests {
 static int exit=1;static void Check(bool condition,string label){if(!condition)throw new Exception(label);Console.WriteLine("PASS "+label);}
 [STAThread]static int Main(){SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());var timer=new System.Windows.Forms.Timer{Interval=10};timer.Tick+=async(s,e)=>{timer.Stop();try{await Run();exit=0;}catch(Exception ex){Console.Error.WriteLine(ex);}finally{Application.ExitThread();}};timer.Start();Application.Run();return exit;}
 static async Task Run(){string baseline=System.IO.Path.GetFullPath("dist/vsto/Application Files/Monja_1_0_1_0/Monja.dll.deploy");if(System.IO.File.Exists(baseline)){var old=System.Reflection.Assembly.LoadFile(baseline);var type=old.GetType("Monja.ExcelScanner");object scanner=Activator.CreateInstance(type,new object[]{new StubExcel(true,false)});bool reproduced=false;try{await (Task)type.GetMethod("Scan").Invoke(scanner,new object[]{new HashSet<string>{"Regression.xlsx"},false,CancellationToken.None,new Progress<string>(),true});}catch(NotImplementedException){reproduced=true;}Check(reproduced,"1.0.1 reproduces NotImplementedException on optional Office API");}foreach(bool fallback in new[]{false,true}){var result=await new ExcelScanner(new StubExcel(!fallback,fallback)).Scan(new HashSet<string>{"Regression.xlsx"},false,CancellationToken.None,new Progress<string>());Check(result.Edges.Count==2,"xlsx formula results survive "+(fallback?"SpecialCells unavailable":"unsupported optional APIs"));Check(result.FormulaCellsScanned==2&&result.WorkbooksScanned==1,"formula and workbook counters");Check(result.Diagnostics.Any(d=>d.Contains(fallback?"SpecialCells":"CodeName")),"failed API identified in diagnostics");Check(result.Edges.All(e=>e.Certainty=="confirmed"),"retained edges are real parsed references");}
 using(var form=new Form{ShowInTaskbar=false,Left=-2500,Top=-2500})using(var pane=new TracePane(new StubExcel(true,false))){form.Controls.Add(pane);form.Show();var previous=SynchronizationContext.Current;Task analysis;try{SynchronizationContext.SetSynchronizationContext(new UnsupportedContext());analysis=pane.Analyze();}finally{SynchronizationContext.SetSynchronizationContext(previous);}await analysis;Check(pane.ResultCount==2&&String.IsNullOrEmpty(pane.LastErrorDetails),"ribbon analysis replaces unsupported host synchronization context");form.Close();}
 }
}
