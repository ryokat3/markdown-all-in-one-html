import React from "react"
import { topDispatcher, TopDispatcherType } from "./TopDispatcher"
import { createContext, useEffect } from "react"
import { topReducer, TopStateType } from "./TopReducer"
import { MarkdownView } from "./MarkdownView"
import { SearchAppBar } from "./SearchAppBar"
import { setupDragAndDrop } from "../fs/dragAndDrop"
import { WorkerInvoke } from "../utils/WorkerInvoke"
import { FileWorkerMessageMap } from "../fileWorker/FileWorkerInvoke"
import { getFile, makeMarkdownFileRegexChecker } from "../markdown/FileTree"
import { ConfigType } from "../config"
import { saveThisDocument } from "../fs/localFileFS"


export interface TopContextType {
    dispatcher: TopDispatcherType,
    fileWorker: WorkerInvoke<FileWorkerMessageMap>       
}

export const TopContext = createContext<TopContextType>(Object.create(null))

export interface TopProps {
    fileWorker: WorkerInvoke<FileWorkerMessageMap>
    config: ConfigType,
    initialState: TopStateType
}

export const Top: React.FunctionComponent<TopProps> = (props:TopProps) => {

    const [state, dispatch] = React.useReducer(topReducer, props.initialState)
    const dispatcher = topDispatcher.build(dispatch)    
    const context = {
        dispatcher: dispatcher,
        fileWorker: props.fileWorker      
    }

    // Call once
    useEffect(() => {
        props.fileWorker.addEventHandler("updateMarkdownFile", (payload)=>dispatcher.updateMarkdownFile(payload))
        props.fileWorker.addEventHandler("updateDataFile", (payload)=>dispatcher.updateDataFile(payload))
        setupDragAndDrop(props.fileWorker, dispatcher, props.config)
        _open_markdown = function(name:string) {
            dispatcher.updateCurrentPage({ name:name })
        }
    }, [])

    const currentFile = getFile(state.rootFolder, state.currentPage)
    const [title, markdown] = ((currentFile !== undefined) && (currentFile.type === "markdown")) ? [ state.currentPage, currentFile.markdown] : [ "ERROR", `${state.currentPage} not found`]
            
    return <TopContext.Provider value={context}>
        <SearchAppBar
            title={title}            
            saveDocument={async ()=> saveThisDocument(state)}
        ></SearchAppBar>
        <MarkdownView
            markdownData={markdown}
            rootFolder={state.rootFolder}
            filePath={state.currentPage}
            isMarkdown={makeMarkdownFileRegexChecker(state.config.markdownFileRegex)}      
        ></MarkdownView>
    </TopContext.Provider>
}