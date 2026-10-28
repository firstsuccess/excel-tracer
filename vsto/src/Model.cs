using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
namespace Monja {
 public sealed class Location {
  public string Book {get;set;} public string Sheet {get;set;} public string Address {get;set;} public string Kind {get;set;} public string Name {get;set;} public string Module {get;set;} public string Procedure {get;set;} public int Line {get;set;}
  public override string ToString(){return String.Join(" / ",new[]{Book,Sheet,Address,Name,Module,Line==0?null:Line.ToString()}.Where(s=>!String.IsNullOrEmpty(s)));}
 }
 public sealed class Edge {
  public string Id {get;set;} public string Kind {get;set;} public Location Source {get;set;} public Location Target {get;set;} public string Certainty {get;set;} public string Method {get;set;} public string Content {get;set;} public bool Indirect {get;set;}
 }
 public sealed class FormulaInput { public string Text;public Location Target; public string Kind="formula"; }
 public sealed class Context {public string Book,Sheet;public List<string> Sheets=new List<string>();public Dictionary<string,string> Names=new Dictionary<string,string>(StringComparer.OrdinalIgnoreCase);public Dictionary<string,TableInfo> Tables=new Dictionary<string,TableInfo>(StringComparer.OrdinalIgnoreCase);}
 public sealed class TableInfo {public string Sheet,Address;public string[] Columns;}
 public static class Graph {
  public static int Column(string s){int n=0;foreach(char c in s.ToUpperInvariant())n=n*26+c-'A'+1;return n;}
  public static string Letters(int n){string s="";while(n>0){n--;s=(char)('A'+n%26)+s;n/=26;}return s;}
  public static int[] Bounds(string s){if(String.IsNullOrEmpty(s))return null;string[] p=s.Replace("$","").Split(':');int[] a=Point(p[0],false),b=Point(p.Length>1?p[1]:p[0],true);return a==null||b==null?null:new[]{Math.Min(a[0],b[0]),Math.Min(a[1],b[1]),Math.Max(a[0],b[0]),Math.Max(a[1],b[1])};}
  static int[] Point(string s,bool end){Match m=Regex.Match(s,@"^([A-Z]{1,3})([1-9]\d*)$",RegexOptions.IgnoreCase);if(m.Success){int row;if(!Int32.TryParse(m.Groups[2].Value,out row)||row>1048576||Column(m.Groups[1].Value)>16384)return null;return new[]{row,Column(m.Groups[1].Value)};}if(Regex.IsMatch(s,@"^[A-Z]{1,3}$",RegexOptions.IgnoreCase))return Column(s)<=16384?new[]{end?1048576:1,Column(s)}:null;int r;if(Int32.TryParse(s,out r)&&r>0&&r<=1048576)return new[]{r,end?16384:1};return null;}
  public static bool Overlap(Location a,Location b){if(a.Book!=b.Book||a.Sheet!=b.Sheet)return false;int[] x=Bounds(a.Address),y=Bounds(b.Address);return x!=null&&y!=null&&x[0]<=y[2]&&y[0]<=x[2]&&x[1]<=y[3]&&y[1]<=x[3];}
  sealed class Interval {public Edge Edge;public int[] Box;public int Max;public Interval Left,Right;}
  static Interval Build(List<Interval> values,int lo,int hi){if(lo>=hi)return null;int mid=(lo+hi)/2;var n=values[mid];n.Left=Build(values,lo,mid);n.Right=Build(values,mid+1,hi);n.Max=Math.Max(n.Box[2],Math.Max(n.Left==null?0:n.Left.Max,n.Right==null?0:n.Right.Max));return n;}
  static void Find(Interval n,int[] box,List<Edge> result){if(n==null||n.Max<box[0])return;Find(n.Left,box,result);if(n.Box[0]>box[2])return;if(n.Box[2]>=box[0]&&n.Box[1]<=box[3]&&box[1]<=n.Box[3])result.Add(n.Edge);Find(n.Right,box,result);}
  static string Key(Location l){return (l.Book??"").ToLowerInvariant()+"\0"+(l.Sheet??"").ToLowerInvariant();}
  public static List<Edge> Query(List<Edge> edges,Location selected,bool dependents,bool transitive){var groups=new Dictionary<string,List<Interval>>();foreach(var e in edges){var location=dependents?e.Source:e.Target;int[] box=Bounds(location.Address);if(box==null)continue;string key=Key(location);List<Interval> group;if(!groups.TryGetValue(key,out group)){group=new List<Interval>();groups[key]=group;}group.Add(new Interval{Edge=e,Box=box});}var index=new Dictionary<string,Interval>();foreach(var pair in groups){pair.Value.Sort((a,b)=>a.Box[0].CompareTo(b.Box[0]));index[pair.Key]=Build(pair.Value,0,pair.Value.Count);}var output=new List<Edge>();var seen=new HashSet<string>();var queue=new Queue<Location>();queue.Enqueue(selected);int depth=0;while(queue.Count>0&&output.Count<100000){Location p=queue.Dequeue();var candidates=new List<Edge>();Interval root;int[] box=Bounds(p.Address);if(box!=null&&index.TryGetValue(Key(p),out root))Find(root,box,candidates);foreach(var e in candidates){if(seen.Contains(e.Id)||e.Certainty=="unknown")continue;seen.Add(e.Id);output.Add(new Edge{Id=e.Id,Kind=e.Kind,Source=e.Source,Target=e.Target,Certainty=e.Certainty,Method=e.Method,Content=e.Content,Indirect=depth>0});if(transitive)queue.Enqueue(dependents?e.Target:e.Source);if(output.Count>=100000)break;}depth++;if(!transitive)break;}return output;}
  static string Quote(object value){string s=Convert.ToString(value)??"";if(Regex.IsMatch(s,@"^[\s\x00-\x1f]*[=+@-]")||Regex.IsMatch(s,@"^[\t\r\n]"))s="'"+s;return "\""+s.Replace("\"","\"\"")+"\"";}
  public static string Csv(IEnumerable<Edge> edges){var b=new StringBuilder();b.AppendLine(String.Join(",",new[]{"種類","参照元ブック","参照元シート","参照元セルまたは範囲","参照先ブック","参照先シート","参照先セルまたは開始セル","グラフ名","ピボットテーブル名","VBAモジュール","VBAプロシージャ","VBA行番号","参照内容","直接／間接","確実性","検出方法"}.Select(Quote)));foreach(var e in edges)b.AppendLine(String.Join(",",new object[]{e.Kind,e.Source.Book,e.Source.Sheet,e.Source.Address,e.Target.Book,e.Target.Sheet,e.Target.Address,e.Target.Kind=="chart"?e.Target.Name:"",e.Target.Kind=="pivot"?e.Target.Name:"",e.Target.Module??e.Source.Module,e.Target.Procedure??e.Source.Procedure,e.Target.Line==0?(e.Source.Line==0?"":e.Source.Line.ToString()):e.Target.Line.ToString(),e.Content,e.Indirect?"indirect":"direct",e.Certainty,e.Method}.Select(Quote)));return b.ToString();}
 }
}


