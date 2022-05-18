import {
  Disposable,
  TextDocument,
  Uri,
  ViewColumn,
  Webview,
  WebviewPanel,
  window,
  workspace,
} from "vscode";
import { getNonce } from "../util/getNonce";
import { getUri } from "../util/getUri";

export class ViewProvider {
  public static currentPanel?: ViewProvider | undefined;
  public static readonly viewType = "zsegment";
  private readonly _panel: WebviewPanel;
  private readonly _extensionUri: Uri;
  private _disposables: Disposable[];

  public static createOrShow(extensionUri: Uri) {
    const column = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : undefined;

    //check if panel already exists
    if (ViewProvider.currentPanel) {
      ViewProvider.currentPanel._panel.reveal(column);
      return;
    }
    //create a panel
    const panel = window.createWebviewPanel(
      "viewProvider",
      "Extension Name",
      column || ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    ViewProvider.currentPanel = new ViewProvider(panel, extensionUri);
  }

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._disposables = [];

    const webview = this._panel.webview;
    //set html content
    this._panel.webview.html = this._getHtmlForWebview(webview);
    //set message listener from webview
    this._onReceiveMessage(webview);
    //dispose method for panel
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _onReceiveMessage(webview: Webview) {
    webview.onDidReceiveMessage(async (data: any) => {
      console.log(`logging message: ${data}`);
    });
  }

  public dispose() {
    ViewProvider.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: Webview): string {
    const styleResetUri = getUri(webview, this._extensionUri, [
      "media",
      "reset.css",
    ]);
    const styleMainUri = getUri(webview, this._extensionUri, [
      "media",
      "main.css",
    ]);
    const styleVscodeUri = getUri(webview, this._extensionUri, [
      "media",
      "vscode.css",
    ]);

    //script uri's
    const reactAppUri = getUri(webview, this._extensionUri, [
      "out",
      "app",
      "index.js",
    ]);

    const nonce = getNonce();

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta http-equiv="Content-Security-Policy"
            content="style-src 'unsafe-inline' ${webview.cspSource};
            script-src 'nonce-${nonce}';
                    font-src * data: blob: 'unsafe-inline' vscode-webview-resource:;
                   ">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- css resources -->
      <link rel="stylesheet" href="${styleMainUri}">
      <link rel="stylesheet" href="${styleVscodeUri}">
      <link rel="stylesheet" href="${styleResetUri}">
  
      <title>Extension Name</title>
    </head>
    <body>
      <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          console.log(vscode)
        </script>
        <h1>hello</h1>
    </body>
    </html>
    `;
  }
}
