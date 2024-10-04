// src/extension.module.ts
import * as vscode from "vscode";
function activate(context) {
  const disposables = [];
  disposables.push(vscode.commands.registerCommand("a-vscode-extension.Test", () => {
    vscode.window.showInformationMessage("This is a test.");
  }));
  disposables.push(vscode.commands.registerCommand("a-vscode-extension.Noop", () => {
    vscode.window.showInformationMessage("This is a noop.");
  }));
  context.subscriptions.push(...disposables);
}
function deactivate() {
}
export {
  deactivate,
  activate
};
