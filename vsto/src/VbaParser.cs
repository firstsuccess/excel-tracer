using System;
using System.Collections.Generic;
using System.Threading;
using System.Text.RegularExpressions;
namespace Monja {
 public static class VbaParser {
  public static List<Edge> Parse(string code,string book,string module,string sheetContext,CancellationToken cancel=default(CancellationToken)){var output=new List<Edge>();string procedure="";string[] lines=code.Replace("\r","").Split('\n');for(int i=0;i<lines.Length;i++){
   if((i&255)==0)cancel.ThrowIfCancellationRequested();string line=lines[i];var proc=Regex.Match(line,@"^\s*(?:(?:Public|Private|Friend|Static)\s+)?(?:Sub|Function|Property\s+(?:Get|Let|Set))\s+(\w+)",RegexOptions.IgnoreCase);if(proc.Success)procedure=proc.Groups[1].Value;
   if(Regex.IsMatch(line,@"^\s*(?:'|Rem\s)",RegexOptions.IgnoreCase))continue;
   // Exclude quoted code and comments; only tokens outside literals can start a reference.
   string masked=Regex.Replace(line,"\"(?:[^\"]|\"\")*\"",m=>new string(' ',m.Length));int comment=masked.IndexOf('\'');if(comment>=0){line=line.Substring(0,comment);masked=masked.Substring(0,comment);}
   foreach(Match m in Regex.Matches(line,@"(?:(?:Worksheets|Sheets)\(\s*""([^""]+)""\s*\)\s*\.\s*)?(Range|Cells)\s*\(([^)]*)\)",RegexOptions.IgnoreCase)){
    int token=m.Index+m.Value.LastIndexOf(m.Groups[2].Value,StringComparison.OrdinalIgnoreCase);if(token<masked.Length&&masked[token]==' ')continue;
    string sheet=m.Groups[1].Success?m.Groups[1].Value:sheetContext,address=null;var literal=Regex.Match(m.Groups[3].Value,"^\\s*\"(\\$?[A-Z]{1,3}\\$?[1-9]\\d*(?::\\$?[A-Z]{1,3}\\$?[1-9]\\d*)?)\"\\s*$",RegexOptions.IgnoreCase);
    if(m.Groups[2].Value.Equals("Range",StringComparison.OrdinalIgnoreCase)&&literal.Success)address=literal.Groups[1].Value.Replace("$","");
    var cells=Regex.Match(m.Groups[3].Value,@"^\s*([1-9]\d*)\s*,\s*([1-9]\d*)\s*$");if(m.Groups[2].Value.Equals("Cells",StringComparison.OrdinalIgnoreCase)&&cells.Success){int r,c;if(Int32.TryParse(cells.Groups[1].Value,out r)&&Int32.TryParse(cells.Groups[2].Value,out c)&&r<=1048576&&c<=16384)address=Graph.Letters(c)+r;}
    string prefix=masked.Substring(0,m.Index);int statement=prefix.LastIndexOf(':');if(statement>=0)prefix=prefix.Substring(statement+1);string suffix=line.Substring(m.Index+m.Length);bool lhs=Regex.IsMatch(prefix,@"^\s*(?:(?:Let|Set)\s+)?(?:(?:Me|[A-Za-z_]\w*)\s*\.)?\s*$",RegexOptions.IgnoreCase);bool write=lhs&&Regex.IsMatch(suffix,@"^\s*(?:\.(?:Value2?|Formula2?|Text))?\s*=",RegexOptions.IgnoreCase);bool operation=Regex.IsMatch(suffix,@"^\s*\.(?:Clear\w*|Delete|Insert|Copy|Cut)\b",RegexOptions.IgnoreCase);
    // Variables, With blocks, aliases and cross-workbook qualifiers are never promoted to confirmed.
    bool me=sheetContext!=null&&Regex.IsMatch(prefix,@"^\s*Me\s*\.\s*$",RegexOptions.IgnoreCase);bool qualifiedBefore=!me&&m.Index>0&&Regex.IsMatch(line.Substring(0,m.Index),@"(?:\.|!|With\s+)\s*$",RegexOptions.IgnoreCase);string certainty=address!=null&&Graph.Bounds(address)!=null&&!String.IsNullOrEmpty(sheet)&&!qualifiedBefore?"estimated":"unknown";
    var cellLocation=new Location{Book=book,Sheet=sheet??"",Address=address,Kind=address==null?"external":"range"};var codeLocation=new Location{Book=book,Sheet=sheet??"",Kind="vba",Module=module,Procedure=procedure,Line=i+1};
    output.Add(new Edge{Id=Guid.NewGuid().ToString("N"),Kind=write?"vbaWrite":operation?"vbaRange":"vbaRead",Source=write||operation?codeLocation:cellLocation,Target=write||operation?cellLocation:codeLocation,Certainty=certainty,Method="vba-static",Content=lines[i]});
   }
   if(Regex.IsMatch(masked,@"\b(ActiveCell|Selection|Evaluate)\b",RegexOptions.IgnoreCase))output.Add(new Edge{Id=Guid.NewGuid().ToString("N"),Kind="vbaRange",Source=new Location{Book=book,Sheet=sheetContext??"",Kind="external",Name="dynamic VBA"},Target=new Location{Book=book,Sheet=sheetContext??"",Kind="vba",Module=module,Procedure=procedure,Line=i+1},Certainty="unknown",Method="vba-static",Content=lines[i]});
  }return output;}
 }
}
