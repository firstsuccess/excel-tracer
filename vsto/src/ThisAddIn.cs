using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Office.Tools;
using Excel=Microsoft.Office.Interop.Excel;
using Office=Microsoft.Office.Core;
namespace Monja {
 [Microsoft.VisualStudio.Tools.Applications.Runtime.StartupObject(0)]
 [System.Security.Permissions.PermissionSet(System.Security.Permissions.SecurityAction.Demand,Name="FullTrust")]
 public sealed class ThisAddIn:AddInBase {
  public Excel.Application Application;TracePane view;CustomTaskPane pane;CustomTaskPaneCollection panes;readonly Microsoft.Office.Tools.Excel.ApplicationFactory factory;AutomationBridge automation;Ribbon ribbon;
  public ThisAddIn(Microsoft.Office.Tools.Excel.ApplicationFactory factory,IServiceProvider serviceProvider):base(factory,serviceProvider,"AddIn","ThisAddIn"){this.factory=factory;}
  protected override void Initialize(){base.Initialize();Application=GetHostItem<Excel.Application>(typeof(Excel.Application),"Application");System.Windows.Forms.Application.EnableVisualStyles();panes=factory.CreateCustomTaskPaneCollection(null,null,"CustomTaskPanes","CustomTaskPanes",this);}
  protected override void InitializeDataBindings(){BeginInit();panes.BeginInit();panes.EndInit();EndInit();}
  protected override void FinishInitialization(){Startup+=Start;Shutdown+=Stop;OnStartup();}
  void Start(object sender,EventArgs args){if(System.Threading.SynchronizationContext.Current==null)System.Threading.SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());view=new TracePane(Application);pane=panes.Add(view,"もんじゃExcel参照トレーサー");pane.DockPosition=Office.MsoCTPDockPosition.msoCTPDockPositionRight;pane.Width=680;view.LanguageChanged+=(s,e)=>{if(ribbon!=null)ribbon.Refresh();};Application.SheetChange+=Changed;Application.SheetSelectionChange+=Selected;Application.WorkbookOpen+=Opened;((Excel.AppEvents_Event)Application).NewWorkbook+=Opened;Application.WorkbookBeforeClose+=Closing;}
  void Stop(object sender,EventArgs args){Application.SheetChange-=Changed;Application.SheetSelectionChange-=Selected;Application.WorkbookOpen-=Opened;((Excel.AppEvents_Event)Application).NewWorkbook-=Opened;Application.WorkbookBeforeClose-=Closing;if(panes!=null)panes.Dispose();}
  void Changed(object sh,Excel.Range range){view.InvalidateCache();}void Selected(object sh,Excel.Range range){view.RefreshSelection();}void Opened(Excel.Workbook book){view.RefreshBooks();}void Closing(Excel.Workbook book,ref bool cancel){view.InvalidateCache();}
  protected override object RequestService(Guid serviceGuid){if(serviceGuid==typeof(Office.IRibbonExtensibility).GUID)return ribbon??(ribbon=new Ribbon(this));return base.RequestService(serviceGuid);}
  protected override object RequestComAddInAutomationService(){return automation??(automation=new AutomationBridge(this));}
  internal TracePane View{get{return view;}}
  internal bool PaneVisible{get{return pane!=null&&pane.Visible;}}
  public void Command(string id){if(view==null)return;if(view.InvokeRequired){view.BeginInvoke(new Action(()=>Command(id)));return;}var previous=System.Threading.SynchronizationContext.Current;try{if(!(previous is WindowsFormsSynchronizationContext))System.Threading.SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());ExecuteCommand(id);}finally{System.Threading.SynchronizationContext.SetSynchronizationContext(previous);}}
  async void ExecuteCommand(string id){if(pane==null)return;pane.Visible=true;if(id=="impact"||id=="all"){view.SetMode(id=="impact");if(!view.CacheValid)await view.Analyze();}else if(id=="scan")await view.Analyze();else if(id=="books"){if(view.ChooseBooks())await view.Analyze();}else if(id=="export")view.Export();else if(id=="settings"||id=="help")MessageBox.Show("日本語 / English: タスクペイン上部で切替できます。\nVBA標準: 保存済み.xlsm/.xlam/.xlsbを静的解析します。未保存の変更は含みません。拡張: 信頼設定で許可されている場合に利用できます。\nブックを選択して再解析し、選択セルの影響調査へ切り替えてください。行を右クリックして移動・コピー、CSV出力で保存できます。");}
 }
 [ComVisible(true),ClassInterface(ClassInterfaceType.AutoDual)]public sealed class AutomationBridge {
  readonly ThisAddIn owner;internal AutomationBridge(ThisAddIn owner){this.owner=owner;}
  T UI<T>(Func<T> action){var control=owner.View;if(control!=null&&control.InvokeRequired)return (T)control.Invoke(action);return action();}
  void UI(Action action){UI(()=>{action();return true;});}
  public string LastError{get{return UI(()=>owner.View==null?"":owner.View.LastErrorDetails);}}public string Version{get{return "1.0.2";}}public bool Ready{get{return UI(()=>owner.View!=null);}}public bool IsBusy{get{return UI(()=>owner.View!=null&&owner.View.IsAnalyzing);}}public int ResultCount{get{return UI(()=>owner.View==null?0:owner.View.ResultCount);}}public string Csv{get{return UI(()=>owner.View==null?"":owner.View.ResultCsv);}}public string Status{get{return UI(()=>owner.View==null?"Starting":owner.View.StatusText);}}public bool PaneVisible{get{return UI(()=>owner.PaneVisible);}}
  public void Show(){UI(()=>owner.Command("all"));}public void Analyze(){UI(()=>owner.Command("scan"));}public void Impact(bool dependents,bool indirect){UI(()=>owner.View.ConfigureImpact(dependents,indirect));}public void Language(bool english){UI(()=>owner.View.SetLanguage(english));}public void Go(int row,bool target){UI(()=>owner.View.NavigateResult(row,target));}
 }
 [ComVisible(true)] public sealed class Ribbon:Office.IRibbonExtensibility {
  Office.IRibbonUI ui;readonly ThisAddIn owner;public Ribbon(ThisAddIn addin){owner=addin;}
  public string GetCustomUI(string id){return "<customUI xmlns='http://schemas.microsoft.com/office/2009/07/customui' onLoad='Loaded'><ribbon><tabs><tab id='monja' getLabel='Label'><group id='trace' label='Monja'><button id='impact' getLabel='Label' onAction='Action'/><button id='all' getLabel='Label' onAction='Action'/><button id='books' getLabel='Label' onAction='Action'/><button id='scan' getLabel='Label' onAction='Action'/><button id='export' getLabel='Label' onAction='Action'/><button id='settings' getLabel='Label' onAction='Action'/><button id='help' getLabel='Label' onAction='Action'/></group></tab></tabs></ribbon></customUI>";}
  public void Loaded(Office.IRibbonUI value){ui=value;}public void Refresh(){if(ui!=null)ui.Invalidate();}
  public string Label(Office.IRibbonControl control){bool en=owner.View!=null&&owner.View.IsEnglish;switch(control.Id){case "monja":return en?"Monja Reference Tracer":"もんじゃ参照トレーサー";case "impact":return en?"Selected cell impact":"選択セルの影響調査";case "all":return en?"All dependencies":"全体の依存関係一覧";case "books":return en?"Target workbooks":"検索対象ブック";case "scan":return en?"Reanalyze":"再解析";case "export":return en?"Export CSV":"CSV出力";case "settings":return en?"Settings":"設定";default:return en?"Help":"ヘルプ";}}
  public void Action(Office.IRibbonControl control){owner.Command(control.Id);}
 }
}
