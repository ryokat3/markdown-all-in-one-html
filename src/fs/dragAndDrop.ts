import { WorkerInvoke } from "../utils/WorkerInvoke"
import { FileWorkerMessageMap } from "../fileWorker/FileWorkerInvoke"
// import { TopDispatcherType } from "../renderer/TopDispatcher"

/*
function readBlob(dispatcher:TopDispatcherType, blob: Blob): void {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {        
        if ((e.target !== null) && (e.target.result !== null) && (typeof e.target.result == 'string')) {
            dispatcher.currentPageUpdate({
                fileName: blob.name,
                markdown: e.target.result
            })            
        }
    }
    reader.readAsText(blob, "utf-8")
}
*/

async function ondropped(fileWorker:WorkerInvoke<FileWorkerMessageMap>, ev: Event) {    
    if (!(ev instanceof DragEvent)) {
        return
    }

    const items = ev.dataTransfer?.items
    if (items === undefined) {
        alert("No dropped item found")
        return
    }
    if (items.length > 1) {
        alert("Multiple items were dropped")
        return
    }
    
    const item = items[0]
    if (!('kind' in item)) {        
        console.log("item doesn't have kind property")        
    }
    else if (item.kind === 'file') {
        const handle = await item.getAsFileSystemHandle()

        if (handle === null) {
            console.log("handle is null")
        }
        else if (!('kind' in handle)) {
            console.log("handle doesn't have kind property")
        }
        else if (handle.kind === 'file') {
            fileWorker.request("openFile", { handle: handle as FileSystemFileHandle })                       
        }
        else if (handle.kind === 'directory') {            
            const rootHandle = handle as FileSystemDirectoryHandle
            fileWorker.request("openDirectory", { handle: rootHandle})
            /*
            const hf = await findFSHandle(rootHandle, (name: string) => name.split('.').pop() === 'md')
            readBlob(dispatcher, await (hf[0][1] as FileSystemFileHandle).getFile())
            */
        }
    }
    else if (item.kind === 'string') {        
        item.getAsString((msg:string)=> {
            console.log(`string "${msg}" was dropped`)
            alert(`"${msg}" was dropped as string. Try again.`)
        })        
    }
    else {
        console.log("unknown object was dropped")
    }
}

export function setupDragAndDrop(fileWorker:WorkerInvoke<FileWorkerMessageMap>) {
    window.addEventListener('dragenter', function (e: Event) {
        e.stopPropagation()
        e.preventDefault()
    }, false)
    window.addEventListener('dragleave', function (e: Event) {
        e.stopPropagation()
        e.preventDefault()
    }, false)
    window.addEventListener('dragover', function (e: Event) {
        e.stopPropagation()
        e.preventDefault()
    }, false)
    window.addEventListener("drop", (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
        ondropped(fileWorker, e)
    }, false)   
}