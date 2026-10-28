using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Monja;
public class EmptyExcel { public EmptyBooks Workbooks{get{return new EmptyBooks();}} }
public class EmptyBooks { public int Count{get{return 0;}} }
class LayoutTests {
 static FieldInfo Field(string name){return typeof(TracePane).GetField(name,BindingFlags.Instance|BindingFlags.NonPublic);}
 static void Check(bool ok,string label){if(!ok)throw new Exception(label);Console.WriteLine("PASS "+label);}
 [STAThread]static int Main(){try{Application.EnableVisualStyles();using(var window=new Form{StartPosition=FormStartPosition.Manual,Location=new Point(-2500,-2500),ShowInTaskbar=false})using(var pane=new TracePane(new EmptyExcel())){window.Controls.Add(pane);window.Show();
  var grid=(DataGridView)Field("grid").GetValue(pane);var empty=(Label)Field("emptyState").GetValue(pane);Check(empty.Visible&&empty.Text.Contains("再解析"),"initial state is an explicit visible message");
  var source=new Location{Book="Fixture.xlsx",Sheet="Input",Address="B5",Kind="cell"};var target=new Location{Book="Fixture.xlsx",Sheet="Summary",Address="D10",Kind="cell"};
  Field("cache").SetValue(pane,new List<Edge>{new Edge{Id="layout-fixture",Kind="formula",Source=source,Target=target,Certainty="confirmed",Content="=Input!B5",Method="test-fixture"}});Field("valid").SetValue(pane,true);if(Field("hasSnapshot")!=null)Field("hasSnapshot").SetValue(pane,true);
  typeof(TracePane).GetMethod("Apply",BindingFlags.Instance|BindingFlags.NonPublic).Invoke(pane,null);
  foreach(var size in new[]{new Size(680,240),new Size(680,200),new Size(400,300),new Size(680,600)}){window.ClientSize=size;window.PerformLayout();pane.PerformLayout();Application.DoEvents();var bounds=grid.RectangleToScreen(grid.ClientRectangle);var visible=Rectangle.Intersect(bounds,pane.RectangleToScreen(pane.ClientRectangle));Console.WriteLine("LAYOUT "+size+" grid="+grid.Bounds+" visible="+visible.Size);Check(grid.Visible&&visible.Height>=70&&visible.Width>=300,"result table remains visible at "+size);Check(grid.RowCount==1&&Convert.ToString(grid.Rows[0].Cells[1].FormattedValue).Contains("Input"),"virtual row displays source at "+size);using(var bitmap=new Bitmap(pane.Width,pane.Height)){pane.DrawToBitmap(bitmap,pane.ClientRectangle);bitmap.Save(Path.GetFullPath("dist/verification/vsto/layout-"+size.Width+"x"+size.Height+".png"));}}
  pane.SetLanguage(true);Application.DoEvents();Check(grid.Columns[0].HeaderText=="Type"&&grid.RowCount==1,"English layout retains visible results");pane.SetLanguage(false);Field("rows").SetValue(pane,new List<Edge>());grid.RowCount=0;Field("lastErrorDetails").SetValue(pane,"System.NotImplementedException / injected regression failure");typeof(TracePane).GetMethod("UpdateEmptyState",BindingFlags.Instance|BindingFlags.NonPublic).Invoke(pane,null);Application.DoEvents();Check(empty.Visible&&empty.Text.Contains("完了できません"),"failed analysis is shown explicitly, never as no results");window.Close();}return 0;}catch(Exception ex){Console.Error.WriteLine(ex);return 1;}}
}
