import * as vscode from "vscode";

/**
 * Check if MicroProfile Starter has been installed, if it has
 * execute the MicroProfile Starter command. If it is not installed,
 * prompt user to install.
 * 
 * @param context vscode extension context
 */
export async function createMicroProfileStarterProjectCmdHandler(context: vscode.ExtensionContext) {
    if (!await validateAndRecommendExtension("microProfile-community.mp-starter-vscode-ext", "MicroProfile Starter for Visual Studio Code is recommended to generate starter projects for Eclipse MicroProfile.", true)) {
        return;
    }
    await vscode.commands.executeCommand("extension.microProfileStarter");
}

/**
 * Check if MicroProfile REST Client Generator has been installed, if it has
 * execute the Generate a REST Client command. If it is not installed,
 * prompt user to install.
 * 
 * @param context vscode extension context
 */
export async function generateMicroProfileRESTClient(context: vscode.ExtensionContext) {
    if (!await validateAndRecommendExtension("microProfile-community.mp-rest-client-generator-vscode-ext", "MicroProfile REST Client Generator for Visual Studio Code is recommended to generate MicroProfile REST Client Interface template.", true)) {
        return;
    }
    await vscode.commands.executeCommand("microprofile.restclient.generate");
}

export async function installExtension(context: vscode.ExtensionContext, extensionName: string) {
    return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Installing ${extensionName}...` }, progress => {
        return vscode.commands.executeCommand("workbench.extensions.installExtension", extensionName);
    }).then(() => {
        vscode.window.showInformationMessage(`Successfully installed ${extensionName}.`);
    });
}

export async function openUrl(context: vscode.ExtensionContext, url: string) {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
}

async function validateAndRecommendExtension(extName: string, message: string, isForce: boolean = false) {
    if (isExtensionInstalled(extName)) {
        return true;
    }

    await recommendExtension(extName, message);
    return false;
}

function isExtensionInstalled(extName: string) {
    return !!vscode.extensions.getExtension(extName);
}

async function recommendExtension(extName: string, message: string): Promise<void> {
    const action = "Install";
    const answer = await vscode.window.showInformationMessage(message, action);
    if (answer === action) {
        await vscode.commands.executeCommand("microprofile.helper.installExtension", extName, extName);
    }
}