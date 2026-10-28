using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
namespace Monja {
 public static class FormulaParser {
  static readonly Regex Token=new Regex(@"(?:(?:'((?:[^']|'')+)'|((?:\[[^\]]+\])?[\p{L}_][\p{L}\p{N}_.]*(?::[\p{L}_][\p{L}\p{N}_.]*)?))!)?(\$?[A-Z]{1,3}\$?[1-9]\d*(?::\$?[A-Z]{1,3}\$?[1-9]\d*)?|\$?[A-Z]{1,3}:\$?[A-Z]{1,3}|\$?[1-9]\d*:\$?[1-9]\d*)(#?)",RegexOptions.IgnoreCase|RegexOptions.Compiled);
  public static List<Edge> Parse(FormulaInput input,Context ctx,HashSet<string> stack=null){
   var result=new List<Edge>();string formula=input.Text??"";string text=Regex.Replace(formula,"\"(?:[^\"]|\"\")*\"",m=>new string(' ',m.Length));bool dynamic=Regex.IsMatch(text,@"\b(INDIRECT|OFFSET|ADDRESS)\s*\(",RegexOptions.IgnoreCase);
   Action<Location,string,string> add=(source,certainty,method)=>result.Add(new Edge{Id=Guid.NewGuid().ToString("N"),Kind=input.Kind,Source=source,Target=input.Target,Certainty=certainty,Method=method,Content=formula});
   if(dynamic)add(new Location{Book=ctx.Book,Sheet=ctx.Sheet,Kind="external",Name="runtime reference"},"unknown","dynamic-formula");
   text=Token.Replace(text,m=>{if((m.Index>0&&Regex.IsMatch(text[m.Index-1].ToString(),@"[\p{L}\p{N}_.\[]"))||(m.Index+m.Length<text.Length&&Regex.IsMatch(text[m.Index+m.Length].ToString(),@"[\p{L}\p{N}_\][(]")))return m.Value;
    string address=m.Groups[3].Value.Replace("$","").ToUpperInvariant();if(Graph.Bounds(address)==null)return m.Value;
    string sheet=m.Groups[1].Success?m.Groups[1].Value.Replace("''","'"):m.Groups[2].Success?m.Groups[2].Value:ctx.Sheet;string book=ctx.Book;var ex=Regex.Match(sheet,@"^(.*?)\[([^\]]+)\](.*)$");if(ex.Success){book=ex.Groups[1].Value+ex.Groups[2].Value;sheet=ex.Groups[3].Value;}
    var sheets=new List<string>{sheet};if(sheet.Contains(":")){var names=sheet.Split(':');int a=ctx.Sheets.IndexOf(names[0]),b=ctx.Sheets.IndexOf(names[1]);if(a>=0&&b>=a)sheets=ctx.Sheets.Skip(a).Take(b-a+1).ToList();else{add(new Location{Book=book,Sheet=sheet,Address=address,Kind="range"},"unknown","unresolved-3d");sheets.Clear();}}
    foreach(string s in sheets)add(new Location{Book=book,Sheet=s,Address=address,Kind=address.Contains(":")?"range":"cell"},dynamic||m.Groups[4].Value=="#"?"estimated":"confirmed",m.Groups[4].Value=="#"?"spill-anchor":"formula-static");return new string(' ',m.Length);
   });
   text=Regex.Replace(text,@"\b([\p{L}_][\p{L}\p{N}_.]*)\[((?:[^\[\]]|\[[^\]]*\])*)\]",m=>{TableInfo table;if(!ctx.Tables.TryGetValue(m.Groups[1].Value,out table)){add(new Location{Book=ctx.Book,Sheet=ctx.Sheet,Kind="external",Name=m.Value},"unknown","unresolved-table");return " ";}string spec=m.Groups[2].Value;int col=Array.IndexOf(table.Columns,Regex.Replace(spec,@"[\[\]@]",""));string addr=table.Address;int[] bounds=Graph.Bounds(addr);if(col>=0&&bounds!=null)addr=Graph.Letters(bounds[1]+col)+(bounds[0]+1)+":"+Graph.Letters(bounds[1]+col)+bounds[2];add(new Location{Book=ctx.Book,Sheet=table.Sheet,Address=addr,Kind="range"},"estimated","table-static");return " ";});
   stack=stack??new HashSet<string>(StringComparer.OrdinalIgnoreCase);foreach(Match m in Regex.Matches(text,@"[\p{L}_\\][\p{L}\p{N}_.\\]*")){TableInfo namedTable;if(ctx.Tables.TryGetValue(m.Value,out namedTable)){string tableAddress=namedTable.Address;int[] tableBounds=Graph.Bounds(tableAddress);if(input.Kind!="pivot"&&tableBounds!=null&&tableBounds[2]>tableBounds[0])tableAddress=Graph.Letters(tableBounds[1])+(tableBounds[0]+1)+":"+Graph.Letters(tableBounds[3])+tableBounds[2];add(new Location{Book=ctx.Book,Sheet=namedTable.Sheet,Address=tableAddress,Kind="range"},"estimated","table-name-static");continue;}string definition;if(!ctx.Names.TryGetValue(ctx.Sheet+"!"+m.Value,out definition)&&!ctx.Names.TryGetValue(m.Value,out definition))continue;if(stack.Contains(m.Value))continue;var next=new HashSet<string>(stack,StringComparer.OrdinalIgnoreCase);next.Add(m.Value);foreach(var e in Parse(new FormulaInput{Text=definition,Target=input.Target,Kind=input.Kind},ctx,next)){e.Content=formula;e.Method="defined-name/"+e.Method;result.Add(e);}}
   return result;
  }
 }
}


