/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * Some functions adapted from the VS Code Java pack
 * @see https://github.com/microsoft/vscode-java-pack/blob/master/src/overview/assets/index.ts
 */
import * as vscode from "vscode";
import { INSTALL_EXT_COMMAND, MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION, SET_SHOW_ON_STARTUP_COMMAND, SYNC_CHECKBOX_VALUE, SYNC_EXT_VISIBILITY } from "../util/constants";

export class OverviewPage {

  public static currentPanel: OverviewPage | undefined;

  private _context: vscode.ExtensionContext;
  private _panelView: vscode.WebviewPanel;

  public static showOverview(context: vscode.ExtensionContext) {
    
    // show overview view if it already exists
    if (OverviewPage.currentPanel) {
      OverviewPage.currentPanel._panelView.reveal();
      return;
    }

    // create a new overview page if it does not already exist
    OverviewPage.currentPanel = new OverviewPage(context);
  }

  private constructor (context: vscode.ExtensionContext) {
    this._context = context;
    this._panelView = this.createOverviewPage();
    this.initializeOverview();
  }

  public createOverviewPage(): vscode.WebviewPanel {
    // create overview view
    const panel = vscode.window.createWebviewPanel(
      "microprofile.overview",
      "MicroProfile Overview",
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: true
      },
      {
        enableScripts: true,
        enableCommandUris: true,
        retainContextWhenHidden: true
      }
    );
    panel.onDidDispose(() => {
      OverviewPage.currentPanel = undefined;
    });

    return panel;
  }

  private async initializeOverview() {
    this._panelView.webview.html = getHtmlForWebview(this._context.asAbsolutePath("./out/assets/overview/index.js"));

    // ensures checkbox value matches the corresponding alwaysShowOverview setting
    function syncCheckboxValue(webviewPanel: vscode.WebviewPanel) {
      let checkboxValue = vscode.workspace.getConfiguration().get<boolean>(MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION);
      if (checkboxValue !== undefined) {
        webviewPanel.webview.postMessage({
          command: SYNC_CHECKBOX_VALUE,
          checkboxValue: checkboxValue
        })
      }
    }

    // ensures prompt to install extensions displayed in overview page are only shown
    // if they are not installed
    function syncExtensionVisibility(webviewPanel: vscode.WebviewPanel) {
      const installedExtensions = vscode.extensions.all.map(ext => ext.id.toLowerCase());
      webviewPanel.webview.postMessage({
        command: SYNC_EXT_VISIBILITY,
        installedExtensions: installedExtensions
      });
    }

    syncCheckboxValue(this._panelView);
    syncExtensionVisibility(this._panelView);

    // monitor extensions installed
    this._context.subscriptions.push(vscode.extensions.onDidChange(e => {
      syncExtensionVisibility(this._panelView);
    }));

    // monitor workspace configuration for alwaysShowOverview setting
    this._context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration(MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION)) {
        syncCheckboxValue(this._panelView);
      }
    }));

    this._context.subscriptions.push(this._panelView.webview.onDidReceiveMessage(async (e) => {
      if (e.command === SET_SHOW_ON_STARTUP_COMMAND) {
        // set configuration value
        vscode.workspace.getConfiguration().update(MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION, e.visibility, vscode.ConfigurationTarget.Global);
      }
      if (e.command === INSTALL_EXT_COMMAND) {
        await vscode.commands.executeCommand("microprofile.helper.installExtension", e.extName);
      }
    }));
  }
}

/**
 * Adapted from VS Code Java pack
 * @see https://github.com/microsoft/vscode-java-pack/blob/776278f96b29643d630ddf81a64867794032ec1c/src/utils/index.ts#L81
 */
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Adapted from VS Code Java pack
 * @see https://github.com/microsoft/vscode-java-pack/blob/776278f96b29643d630ddf81a64867794032ec1c/src/overview/index.ts#L111
 */
function getHtmlForWebview(scriptPath: string) {
  const scriptPathOnDisk = vscode.Uri.file(scriptPath);
  const scriptUri = (scriptPathOnDisk).with({ scheme: "vscode-resource" });
  // Use a nonce to whitelist which scripts can be run
  const nonce = getNonce();
  
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <title>MicroProfile Overview</title>
  </head>
  <body>
    <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
    <div class="container mb-5">
      <div class="row mb-3">
        <div class="col">
          <h1>MicroProfile Overview</h1>
        </div>
      </div>
      <div class="row">
      <div class="col">
        <div class="row mb-3">
          <div class="col">
            <h3 class="font-weight-light">Start</h3>
            <div>
              <a href="command:microprofile.helper.createMicroProfileStarterProject"
                title="Create a project with MicroProfile Starter">Create a MicroProfile project...</a>
            </div>
            <div>
              <a href="command:microprofile.helper.generateMicroProfileRESTClient"
                title="Generate a MicroProfile REST Client with Generater for MicroProfile Rest Client">Generate a
                MicroProfile REST Client interface template...</a>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col">
            <h3 class="font-weight-light">Documentation</h3>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fmicroprofile.io%22"
                title="Learn about MicroProfile, landing page">Landing Page</a>
            </div>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fwiki.eclipse.org%2FMicroProfile%2FLearning%5FResources%22"
                title="Learning Resources">Learning Resources</a>
            </div>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fmicroprofile.io%2Ffaq%22"
                title="Frequently Asked Questions">FAQ</a>
            </div>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fmicroprofile.io%2Fblog%22"
                title="MicroProfile blog">MicroProfile blog</a>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col">
            <h3 class="font-weight-light">Extensions</h3>
            <div ext="redhat.vscode-microprofile" displayName="Tools for MicroProfile by Red Hat">
              <a href="#" title="Install Tools for MicroProfile extension...">Install Tools for MicroProfile</a>
            </div>
            <div ext="MicroProfile-Community.mp-starter-vscode-ext"
              displayName="MicroProfile Starter by MicroProfile Community">
              <a href="#" title="Install MicroProfile Starter extension...">Install MicroProfile Starter</a>
            </div>
            <div ext="MicroProfile-Community.mp-rest-client-generator-vscode-ext"
              displayName="Generator for MicroProfile Rest Client by MicroProfile Community">
              <a href="#" title="Install Generator for MicroProfile Rest Client extension...">Install Generator for MicroProfile Rest Client</a>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col">
            <h3 class="font-weight-light">MicroProfile Runtimes</h3>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dopen-liberty.liberty-dev-vscode-ext%26ssr%3Dfalse%23overview%22"
                title="Open Liberty Tools marketplace link">View Open Liberty Tools on the Marketplace</a>
            </div>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dredhat.vscode-quarkus%26ssr%3Dfalse%23overview%22"
              title="Quarkus Tools marketplace Link">View Quarkus Tools on the Marketplace</a>
            </div>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Dpayara.payara-vscode%26ssr%3Dfalse%23overview%22"
              title="Payara Tools marketplace link">View Payara Tools on the Marketplace</a>
            </div>
            <div ext="Open-Liberty.liberty-dev-vscode-ext" displayName="Open Liberty Tools">
              <a href="#" title="Install Open Liberty Tools extension...">Install Open Liberty Tools</a>
            </div>
            <div ext="redhat.vscode-quarkus" displayName="Quarkus Tools">
              <a href="#" title="Install Quarkus Tools extension...">Install Quarkus Tools</a>
            </div>
            <div ext="Payara.payara-vscode" displayName="Payara Tools">
              <a href="#" title="Install Payara Tools extension...">Install Payara Tools</a>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col">
            <h3 class="font-weight-light">Help</h3>
            <div>
              <a href="command:microprofile.helper.openUrl?%22https%3A%2F%2Fgithub.com%2FMicroShed%2Fvscode-microprofile-pack%2Fissues%22"
                title="Questions & Issues">Questions & Issues</a>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="section-div">
              <input type="checkbox" class="form-check-input" id="showOnStartup" checked>
              <label for="showOnStartup">Show overview page on startup.</label>
            </div>
          </div>
        </div>
    </div>
  </body>
  
  </html>`;
}