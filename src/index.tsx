import React from "react"
import { createRoot } from "react-dom/client"
import { Top } from "./gui/Top"
import { WorkerInvoke } from "./utils/WorkerMessage"
import { WorkerMessageType } from "./worker/WorkerMessageType"
import { WorkerAgent } from "./worker/WorkerAgent"
import { readConfig } from "./config"
import { TopStateType } from "./gui/TopReducer"
import { FileType } from "./fileTree/FileTreeType"
import { createRootFolder, updateFile } from "./fileTree/FileTree"
import { injectAllMarkdownFileFromElement, injectAllCssFileFromElement, injectAllDataFileFromElement } from "./dataElement/dataFromElement"
import { TOP_COMPONENT_ID } from "./constant"
import { makeFileRegexChecker } from "./utils/appUtils"
import { collectCssFiles } from "./dataElement/styleElement"

import workerJS from "./tmp/worker.bundle.js.asdata"
import defaultMarkdown from "./defaultMarkdown.md"
import templateHtml from "./template.html"


window.onload = async function () {

    const workerBlob = new Blob([workerJS], { type: 'application/javascript'})
    const worker = new WorkerInvoke<WorkerMessageType>(new Worker(URL.createObjectURL(workerBlob)))    
    const config = readConfig()
    const container = document.getElementById(TOP_COMPONENT_ID)
    const searchState = new WorkerAgent(worker, config)
    const isMarkdownFile = makeFileRegexChecker(config.markdownFileRegex)

    const rootFolder = createRootFolder<FileType>()
    await injectAllMarkdownFileFromElement(rootFolder, isMarkdownFile)
    await injectAllCssFileFromElement(rootFolder)
    await injectAllDataFileFromElement(rootFolder)

    if (config.initialConfig) {
        updateFile(rootFolder, config.topPage, {
            type: "markdown",
            markdown: defaultMarkdown,
            timestamp: 0,
            imageList: [],
            linkList: []
        })
    }

    const initialState:TopStateType = {
        config: config,
        rootFolder: rootFolder,
        currentPage: config.topPage,
        currentCss: Object.fromEntries(collectCssFiles(rootFolder, config.topPage).map((name)=>[name, 0])),
        packFileName: "wikipack",
        seq: 0        
    }

    if (container !== null) {     
        const root = createRoot(container)
        root.render(<Top worker={worker} config={config} templateHtml={templateHtml} initialState={initialState} searchState={searchState}/>)
    }
    else {
        // TODO: do something like : body.innerHTML = ...
    }
}