'use strict';

var vscode = require('vscode');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var vscode__namespace = /*#__PURE__*/_interopNamespaceDefault(vscode);

// src/extension.module.ts
function activate(context) {
  const disposables = [];
  disposables.push(vscode__namespace.commands.registerCommand("a-vscode-extension.Test", () => {
    vscode__namespace.window.showInformationMessage("This is a test.");
  }));
  disposables.push(vscode__namespace.commands.registerCommand("a-vscode-extension.Noop", () => {
    vscode__namespace.window.showInformationMessage("This is a noop.");
  }));
  context.subscriptions.push(...disposables);
}
function deactivate() {
}

exports.activate = activate;
exports.deactivate = deactivate;
