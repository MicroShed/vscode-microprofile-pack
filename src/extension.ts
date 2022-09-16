/**
 * (C) Copyright IBM Corporation 2020.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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