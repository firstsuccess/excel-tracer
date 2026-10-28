using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using STATSTG=System.Runtime.InteropServices.ComTypes.STATSTG;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace Monja {
 public sealed class VbaModuleSource {public string Name,Code,StreamName;public int SourceOffset;}
 public static class SavedVbaReader {
  const int Limit=64*1024*1024;
  [DllImport("ole32.dll",CharSet=CharSet.Unicode)]internal static extern int StgOpenStorage(string name,IStorage priority,int mode,IntPtr exclude,int reserved,out IStorage storage);
  [ComImport,Guid("0000000B-0000-0000-C000-000000000046"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]internal interface IStorage {
   void CreateStream([MarshalAs(UnmanagedType.LPWStr)]string n,int m,int r1,int r2,out IStream s);
   void OpenStream([MarshalAs(UnmanagedType.LPWStr)]string n,IntPtr r1,int m,int r2,out IStream s);
   void CreateStorage([MarshalAs(UnmanagedType.LPWStr)]string n,int m,int r1,int r2,out IStorage s);
   void OpenStorage([MarshalAs(UnmanagedType.LPWStr)]string n,IStorage p,int m,IntPtr e,int r,out IStorage s);
   void CopyTo(int c,IntPtr i,IntPtr e,IStorage d);void MoveElementTo(string n,IStorage d,string x,int f);void Commit(int f);void Revert();void EnumElements(int a,IntPtr b,int c,out object e);void DestroyElement(string n);void RenameElement(string a,string b);void SetElementTimes(string n,IntPtr c,IntPtr a,IntPtr m);void SetClass(ref Guid g);void SetStateBits(int b,int m);void Stat(out STATSTG s,int f);
  }
  static byte[] Stream(IStorage storage,string name){IStream stream=null;try{storage.OpenStream(name,IntPtr.Zero,0x10,0,out stream);STATSTG stat;stream.Stat(out stat,1);if(stat.cbSize<0||stat.cbSize>Limit)throw new InvalidDataException("VBA stream exceeds limit");byte[] bytes=new byte[(int)stat.cbSize];IntPtr read=Marshal.AllocHGlobal(4);try{int offset=0;while(offset<bytes.Length){byte[] block=new byte[Math.Min(1048576,bytes.Length-offset)];stream.Read(block,block.Length,read);int size=Marshal.ReadInt32(read);if(size<=0)throw new InvalidDataException("Truncated VBA stream");Buffer.BlockCopy(block,0,bytes,offset,size);offset+=size;}}finally{Marshal.FreeHGlobal(read);}return bytes;}finally{if(stream!=null)Marshal.ReleaseComObject(stream);}}
  public static List<VbaModuleSource> Read(string filename,CancellationToken token){
   if(!new[]{".xlsm",".xlam",".xlsb"}.Contains(Path.GetExtension(filename).ToLowerInvariant()))throw new NotSupportedException("Saved VBA mode supports .xlsm, .xlam and .xlsb only.");
   byte[] project;
   using(var file=new FileStream(filename,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete))using(var zip=new ZipArchive(file,ZipArchiveMode.Read)){
    var entry=zip.GetEntry("xl/vbaProject.bin");if(entry==null)return new List<VbaModuleSource>();if(entry.Length>32*1024*1024)throw new InvalidDataException("VBA project exceeds 32 MiB limit");using(var input=entry.Open())using(var output=new MemoryStream()){byte[] block=new byte[65536];int read;while((read=input.Read(block,0,block.Length))>0){token.ThrowIfCancellationRequested();if(output.Length+read>32*1024*1024)throw new InvalidDataException("VBA project exceeds limit");output.Write(block,0,read);}project=output.ToArray();}
   }
   string temp=Path.Combine(Path.GetTempPath(),"MonjaVba-"+Guid.NewGuid().ToString("N")+".bin");IStorage root=null,vba=null;
   try{File.WriteAllBytes(temp,project);Marshal.ThrowExceptionForHR(StgOpenStorage(temp,null,0x20,IntPtr.Zero,0,out root));
    // Only the protection-state field is decoded. Password material is never read or changed.
    string settings=Encoding.GetEncoding(1252).GetString(Stream(root,"PROJECT"));var cmg=Regex.Match(settings,"(?m)^CMG=\"([0-9A-Fa-f]+)\"");if(!cmg.Success)throw new InvalidDataException("Cannot establish VBA project protection state; code was not read");byte[] state=DecodeState(cmg.Groups[1].Value);if(state.Length!=4)throw new InvalidDataException("Invalid VBA protection state");if((BitConverter.ToUInt32(state,0)&7)!=0)throw new UnauthorizedAccessException("VBA project is protected; code was not read");
    root.OpenStorage("VBA",null,0x10,IntPtr.Zero,0,out vba);byte[] directory=Decompress(Stream(vba,"dir"),0,token);int codepage=1252;for(int i=0;i+8<=Math.Min(directory.Length,100);i++)if(U16(directory,i)==3&&U32(directory,i+2)==2){codepage=U16(directory,i+6);break;}
    Encoding encoding=Encoding.GetEncoding(codepage);var modules=ModuleDirectory(directory,encoding);var result=new List<VbaModuleSource>();long total=0;
    foreach(var module in modules){token.ThrowIfCancellationRequested();byte[] source=Decompress(Stream(vba,module.StreamName),module.Offset,token);total+=source.Length;if(total>Limit)throw new InvalidDataException("VBA source exceeds total limit");string code=encoding.GetString(source);code=String.Join("\n",code.Replace("\r","").Split('\n').Where(line=>!Regex.IsMatch(line,@"^\s*Attribute\s+",RegexOptions.IgnoreCase)));result.Add(new VbaModuleSource{Name=module.Name,Code=code,StreamName=module.StreamName,SourceOffset=module.Offset});}return result;
   }finally{if(vba!=null)Marshal.ReleaseComObject(vba);if(root!=null)Marshal.ReleaseComObject(root);if(File.Exists(temp))File.Delete(temp);}
  }
  sealed class Module {public string Name,StreamName;public int Offset=-1;}
  static List<Module> ModuleDirectory(byte[] bytes,Encoding encoding){int start=-1,count=0;for(int i=0;i+22<bytes.Length;i++)if(U16(bytes,i)==15&&U32(bytes,i+2)==2&&U16(bytes,i+8)==19&&U32(bytes,i+10)==2&&U16(bytes,i+16)==25){count=U16(bytes,i+6);start=i+16;break;}if(start<0||count>10000)throw new InvalidDataException("Unsupported VBA module directory");int p=start;var result=new List<Module>();for(int i=0;i<count;i++){var module=new Module();bool end=false;while(p+6<=bytes.Length){int id=U16(bytes,p),size=checked((int)U32(bytes,p+2));p+=6;if(size<0||p+size>bytes.Length)throw new InvalidDataException("Truncated module directory");if(id==25)module.Name=encoding.GetString(bytes,p,size);else if(id==71)module.Name=Encoding.Unicode.GetString(bytes,p,size);else if(id==26)module.StreamName=encoding.GetString(bytes,p,size);else if(id==50)module.StreamName=Encoding.Unicode.GetString(bytes,p,size);else if(id==49&&size==4)module.Offset=checked((int)U32(bytes,p));p+=size;if(id==43){end=true;break;}}if(!end||module.Offset<0||String.IsNullOrEmpty(module.StreamName))throw new InvalidDataException("Incomplete VBA module directory");result.Add(module);}return result;}
  static int U16(byte[] b,int p){return b[p]|b[p+1]<<8;}static uint U32(byte[] b,int p){return BitConverter.ToUInt32(b,p);}
  public static byte[] DecodeState(string hex){if(hex.Length%2!=0)throw new InvalidDataException("Invalid protected-state encoding");var b=Enumerable.Range(0,hex.Length/2).Select(i=>Convert.ToByte(hex.Substring(i*2,2),16)).ToArray();if(b.Length<7||(b[0]^b[1])!=2)throw new InvalidDataException("Invalid protected-state version");int lastPlain=b[0]^b[2],last=b[2],previous=b[1],p=3;Func<byte> next=()=>{if(p>=b.Length)throw new InvalidDataException("Truncated protected state");int encrypted=b[p++],plain=encrypted^((previous+lastPlain)&255);previous=last;last=encrypted;lastPlain=plain;return (byte)plain;};for(int i=0;i<((b[0]&6)/2);i++)next();var length=new byte[4];for(int i=0;i<4;i++)length[i]=next();uint size=BitConverter.ToUInt32(length,0);if(size>16||size!=b.Length-p)throw new InvalidDataException("Invalid protected-state length");var result=new byte[size];for(int i=0;i<size;i++)result[i]=next();return result;}
  public static byte[] Decompress(byte[] source,int offset,CancellationToken token){if(offset<0||offset>=source.Length||source[offset++]!=1)throw new InvalidDataException("Invalid VBA compression signature");var output=new List<byte>();while(offset<source.Length){token.ThrowIfCancellationRequested();int start=offset;if(offset+2>source.Length)throw new InvalidDataException("Truncated compressed chunk");int header=U16(source,offset);offset+=2;int end=start+(header&4095)+3;if(end>source.Length||((header>>12)&7)!=3)throw new InvalidDataException("Invalid compressed chunk");int origin=output.Count;if((header&32768)==0){if(end-offset!=4096)throw new InvalidDataException("Invalid raw VBA chunk");output.AddRange(source.Skip(offset).Take(4096));offset=end;}else while(offset<end){int flags=source[offset++];for(int bit=0;bit<8&&offset<end;bit++){if((flags&(1<<bit))==0)output.Add(source[offset++]);else{if(offset+2>end)throw new InvalidDataException("Truncated copy token");int value=U16(source,offset);offset+=2;int bits=4;while((1<<bits)<output.Count-origin)bits++;int mask=65535>>bits,length=(value&mask)+3,distance=(value>>(16-bits))+1;if(distance>output.Count-origin)throw new InvalidDataException("Invalid VBA copy offset");for(int j=0;j<length;j++)output.Add(output[output.Count-distance]);}if(output.Count-origin>4096)throw new InvalidDataException("VBA chunk exceeds limit");}}if(output.Count>Limit)throw new InvalidDataException("Decompressed VBA exceeds limit");}return output.ToArray();}
 }
}

