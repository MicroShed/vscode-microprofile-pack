import * as vscode from "vscode";
import * as util from "util";
import { readFile as fsReadFile } from "fs";
import { INSTALL_EXT_COMMAND, MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION, SET_SHOW_ON_STARTUP_COMMAND, SYNC_CHECKBOX_VALUE, SYNC_EXT_VISIBILITY } from "../util/constants";

export class OverviewPage {

  public static currentPanel: OverviewPage | undefined;

  private _context: vscode.ExtensionContext;
  private _panelView: vscode.WebviewPanel;
  private static readFile = util.promisify(fsReadFile);

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
    const resourceUri = this._context.asAbsolutePath("./out/assets/overview/index.html");
    this._panelView.webview.html = await OverviewPage.loadTextFromFile(resourceUri);

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
    vscode.extensions.onDidChange(e => {
      syncExtensionVisibility(this._panelView);
    });

    // monitor workspace configuration for alwaysShowOverview setting
    vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration(MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION)) {
        syncCheckboxValue(this._panelView);
      }
    });

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

  private static async loadTextFromFile(resourceUri: string) {
    let buffer = await this.readFile(resourceUri);
    return buffer.toString();
  }

}

