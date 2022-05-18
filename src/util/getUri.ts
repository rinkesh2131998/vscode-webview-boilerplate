import { Webview, Uri } from "vscode";

/**
 *
 * @param webview used to get local resources as
 * vscode.Uri to use inside webview.
 * @param extensionUri Uri of directory with extension
 * @param pathList list representing path to resource
 * @returns vscode.Uri pointing to the resource location to use inside webview
 */
export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
): Uri {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
