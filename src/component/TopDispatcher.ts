import { Dispatcher, DispatcherType } from "../utils/FdtFlux"
import { TopFdt } from "./TopFdt"


export const topDispatcher = new Dispatcher<TopFdt>()
    .addParameterAction("updateMarkdownFile")    
    .addParameterAction("updateDataFile")
    .addParameterAction("updateCurrentPage")
    .addAction("resetRootFolder")

export type TopDispatcherType = DispatcherType<typeof topDispatcher>
