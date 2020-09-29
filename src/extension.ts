import * as vscode from "vscode";
import { OverviewPage } from "./overview/OverviewPage";
import { createMicroProfileStarterProjectCmdHandler, generateMicroProfileRESTClient, installExtension, openUrl } from "./util/commands";
import { MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION } from "./util/constants";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("microprofile.overview", (async () => {
      OverviewPage.showOverview(context);
    }))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("microprofile.helper.createMicroProfileStarterProject", (async () => {
      createMicroProfileStarterProjectCmdHandler(context);
    }))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("microprofile.helper.generateMicroProfileRESTClient", (async () => {
      generateMicroProfileRESTClient(context);
    }))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("microprofile.helper.openUrl", (async (url) => {
      openUrl(context, url);
    }))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("microprofile.helper.installExtension", (async (extensionName) => {
      installExtension(context, extensionName);
    }))
  );

  let showOverviewPage = vscode.workspace.getConfiguration().get<boolean>(MICROPROFILE_SHOW_OVERVIEW_CONFIGURATION);
  if (showOverviewPage) {
    vscode.commands.executeCommand("microprofile.overview");
  }
}

// this method is called when the extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void { }