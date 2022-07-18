export interface InitSelectedNodesAction {
    type: "INIT_SELECTED_NODES";
    initialState: Set<string>;
}

export const initSelectedNodes = (initialState: Set<string>): InitSelectedNodesAction => ({
    type: "INIT_SELECTED_NODES",
    initialState,
});

export interface ClickNodeAction {
    type: "CLICK_NODE";
    id: string;
}

export const clickNode = (id: string): ClickNodeAction => ({
    type: "CLICK_NODE",
    id,
});

export type NodesAction = InitSelectedNodesAction | ClickNodeAction;


export interface InitSelectedPathsAction {
    type: "INIT_SELECTED_PATHS";
    initialState: Set<string>;
}

export const initSelectedPaths = (initialState: Set<string>): InitSelectedPathsAction => ({
    type: "INIT_SELECTED_PATHS",
    initialState,
});

export interface ClickPathAction {
    type: "CLICK_PATH";
    id: string;
}

export const clickPath = (id: string): ClickPathAction => ({
    type: "CLICK_PATH",
    id,
});

export type PathsAction = InitSelectedPathsAction | ClickPathAction;


export interface InitSubMapAction {
    type: "INIT_SUB_MAP_NP";
    initialState: Array<[Set<string>, Set<string>]>;
}

export const initSubMap = (initialState: Array<[Set<string>, Set<string>]>): InitSubMapAction => ({
    type: "INIT_SUB_MAP_NP",
    initialState,
});

export type SubMapAction = InitSubMapAction;


export interface SetNowIndexAction {
    type: "SET_NOW_ID",
    index: number
}


export interface SetTimeIndexAction {
    type: "SET_NOW_TIME",
    index: number
}

export interface SetZoomAction {
    type: "SET_ZOOM",
    index: [number, number]
}

export const setNowIndex = (index: number): SetNowIndexAction => ({
    type: "SET_NOW_ID",
    index,
});


export const setTimeIndex = (index: number): SetTimeIndexAction => ({
    type: "SET_NOW_TIME",
    index,
});

export const changeZoom = (index: [number, number]): SetZoomAction => ({
    type: "SET_ZOOM",
    index,
});


