/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * Adapted from @see https://github.com/microsoft/vscode-java-pack/blob/master/src/overview/assets/index.ts
 */

import $ = require("jquery");
import "../../assets/vscode.scss";
import "bootstrap/js/src/tab";
import { INSTALL_EXT_COMMAND, SET_SHOW_ON_STARTUP_COMMAND, SYNC_CHECKBOX_VALUE, SYNC_EXT_VISIBILITY } from "../../util/constants";


window.addEventListener("message", event => {
  if (event.data.command === SYNC_EXT_VISIBILITY) {
    syncExtensionVisibility(event.data.installedExtensions);
    syncSectionVisibility();
  } else if (event.data.command === SET_SHOW_ON_STARTUP_COMMAND) {
    $("#showOnStartup").prop("checked", event.data.visibility);
  } else if (event.data.command === SYNC_CHECKBOX_VALUE) {
    syncCheckboxValue(event.data.checkboxValue);
  }
});

function syncCheckboxValue(checkboxValue: boolean) {
  $("#showOnStartup").prop("checked", checkboxValue);
}

function syncExtensionVisibility(extensions: any) {
  $("div[ext]").each((index, elem) => {
    const anchor = $(elem);
    const ext = (anchor.attr("ext") || "").toLowerCase();
    if (extensions.indexOf(ext) !== -1) {
      anchor.hide();
    } else {
      anchor.show();
    }
  });
}

function syncSectionVisibility() {
  $("div h3").parent().each((i, div) => {
    if (!$(div).children("h3 ~ div").is(":visible")) {
      $(div).hide();
    } else {
      $(div).show();
    }
  });
}

declare function acquireVsCodeApi(): any;
const vscode = acquireVsCodeApi();

function installExtension(extName: string, displayName: string) {
  vscode.postMessage({
    command: INSTALL_EXT_COMMAND,
    extName: extName,
    displayName: displayName
  });
}

$("#showOnStartup").change(function () {
  vscode.postMessage({
    command: SET_SHOW_ON_STARTUP_COMMAND,
    visibility: $(this).is(":checked")
  });
});

$("div[ext]").click(function () {
  installExtension($(this).attr("ext") || "", $(this).attr("displayName") || "");
});
