import React from "react"
import { createRoot } from "react-dom/client"
import { Top } from "./renderer/Top"
import { WorkerInvoke } from "./utils/WorkerInvoke"
import { FileWorkerMessageMap } from "./fileWorker/FileWorkerInvoke"
import { readConfig } from "./config"

import fileWorkerJS from "./tmp/fileWorker.bundle.js.asdata"

window.onload = function () {

    const fileWorkerBlob = new Blob([fileWorkerJS], { type: 'application/javascript'})
    const fileWorker = new WorkerInvoke<FileWorkerMessageMap>(new Worker(URL.createObjectURL(fileWorkerBlob)))
    const config = readConfig()
    const container = document.getElementById('top')

    if (container !== null) {     
        const root = createRoot(container)
        root.render(<Top fileWorker={fileWorker} config={config} />)
    }
    else {
        // TODO: do something like : body.innerHTML = ...
    }
}