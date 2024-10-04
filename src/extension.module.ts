import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposables = [];

  /**
   * This command is included in package.json contributes.commands list, so it
   * will show up in the command palette.
   */
  disposables.push(
    vscode.commands.registerCommand('a-vscode-extension.Test', () => {
      vscode.window.showInformationMessage('This is a test.');
    }),
  );

  /**
   * This command is NOT included in package.json contributes.commands list, so
   * it will NOT show up in the command palette.
   */
  disposables.push(
    vscode.commands.registerCommand('a-vscode-extension.Noop', () => {
      vscode.window.showInformationMessage('This is a noop.');
    }),
  );

  context.subscriptions.push(...disposables);
}

export function deactivate() {}
