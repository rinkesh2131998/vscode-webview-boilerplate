import * as vscode from "vscode";
import { ViewProvider } from "./provider/ViewProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-webview-boilerplate" is now active!'
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-webview-boilerplate.openWebview",
      () => {
        ViewProvider.createOrShow(context.extensionUri);
      }
    )
  );
}

export function deactivate() {}
