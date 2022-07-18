import {
    NodesAction,
    PathsAction,
    SubMapAction,
    SetNowIndexAction,
    SetTimeIndexAction,
    SetZoomAction
} from "../actions";
import {combineReducers} from "redux";

// record the ids of nodes those are selected
const SelectedNodes = (state: Set<string> = new Set(), action: NodesAction) => {
    switch (action.type) {
        case "INIT_SELECTED_NODES":
            return action.initialState;
        case "CLICK_NODE": {
            let newState = state;
            if (newState.has(action.id))
                newState.delete(action.id)
            else
                newState.add(action.id)
            return newState;
        }
        default:
            return state;
    }
};

// record the ids of paths those are selected
const SelectedPaths = (state: Set<string> = new Set(), action: PathsAction) => {
    switch (action.type) {
        case "INIT_SELECTED_PATHS":
            return action.initialState;
        case "CLICK_PATH": {
            let newState = state;
            if (newState.has(action.id))
                newState.delete(action.id)
            else
                newState.add(action.id)
            return newState;
        }
        default:
            return state;
    }
};

// record the ids of nodes and paths of each sub map
const SubMapNP = (state: Array<[Set<string>, Set<string>]> = [], action: SubMapAction) => {
    switch (action.type) {
        case "INIT_SUB_MAP_NP":
            return action.initialState;
        default:
            return state;
    }
}

// record the sub map's index that the mouse is hovering over
const NowIndex = (state: number = -1, action: SetNowIndexAction) => {
    switch (action.type) {
        case "SET_NOW_ID":
            return action.index;
        default:
            return state;
    }
}

// record the time index that the mouse is hovering over
const TimeIndex = (state: number = 5, action: SetTimeIndexAction) => {
    switch (action.type) {
        case "SET_NOW_TIME":
            return action.index;
        default:
            return state;
    }
}

const Zoom = (state: number[] = [12, 12, 12, 12, 12], action: SetZoomAction) => {
    switch (action.type) {
        case "SET_ZOOM":
            let newState = state;
            newState[action.index[0]] = action.index[1];
            return newState;
        default:
            return state;
    }
}

export default combineReducers({SelectedNodes, SelectedPaths, SubMapNP, NowIndex, TimeIndex, Zoom});