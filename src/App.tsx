import React from "react";
import "./App.css";

import MapCon from "./components/Map/Map";

import D3MapCon from "./components/D3Version/D3map";
// import store from "./store";
// import {initSubMap} from "./store/actions";

import {MapParse, NodeParse, PathParse} from "./store/models";


import trans1 from "./store/data/data1/subs_arrow.json";
import tran1 from "./store/data/data1/exg_arrow.json";
import trans2 from "./store/data/data2/subs_arrow.json";
import tran2 from "./store/data/data2/exg_arrow.json";

import {compareGraph} from "./utils";

let dataIndex = 1

function App() {
    const trans = dataIndex === 1 ? trans1 : trans2
    const tran = dataIndex === 1 ? tran1 : tran2

    let sub_map: MapParse[] = []
    let T = trans
    for (let i = 0; i < T.length; i++) {
        let nodeP: NodeParse[] = []
        let pathP: PathParse[] = []
        for (let j = 0; j < T[i].nodesParse.length; j++) {
            let now = T[i].nodesParse[j]
            nodeP.push({
                id: now.id,
                center: [now.center[0], now.center[1]],
                nodeOptions: now.nodeOptions,
                radius: now.radius
            })
        }
        for (let j = 0; j < T[i].pathsParse.length; j++) {
            let now = T[i].pathsParse[j]
            pathP.push({
                ids: now.ids,
                weight: now.weight,
                start: [now.start[0], now.start[1]],
                end: [now.end[0], now.end[1]],
                pathOption: now.pathOption
            })
        }
        sub_map.push({
            id: parseInt(T[i].id),
            nodesParse: nodeP,
            pathsParse: pathP
        })
    }

    let Ti = tran
    let nodeP: NodeParse[] = []
    let pathP: PathParse[] = []
    for (let j = 0; j < Ti.nodesParse.length; j++) {
        let now = Ti.nodesParse[j]
        nodeP.push({
            id: now.id,
            center: [now.center[0], now.center[1]],
            nodeOptions: {},
            radius: now.radius
        })
    }
    for (let j = 0; j < Ti.pathsParse.length; j++) {
        let now = Ti.pathsParse[j]
        pathP.push({
            ids: now.ids,
            weight: now.weight,
            start: [now.start[0], now.start[1]],
            end: [now.end[0], now.end[1]],
            pathOption: now.pathOption
        })
    }
    let exg_map: MapParse = {
        id: 1,
        nodesParse: nodeP,
        pathsParse: pathP
    }

    sub_map.sort(compareGraph());


    return (
        <div>
            <div className='header'>
                <span className='indicator' style={
                    {
                        right: 0
                    }
                }>
                    <svg width={'40px'} height={'100%'}>
                        <rect x='15px' y='15px' height='20px' width='20px' fill={'#eb4d4b'}/>
                    </svg>
                    <div className='tag-text'>node(s)-selected</div>
                </span>
                <span className='indicator' style={
                    {
                        right: '200px'
                    }
                }>
                    <svg width={'40px'} height={'100%'}>
                        <rect x='15px' y='15px' height='20px' width='20px' fill={'#1890FF'}/>
                    </svg>
                    <div className='tag-text'>graph(s)-selected</div>
                </span>
                <span className='indicator' style={
                    {
                        right: '400px'
                    }
                }>
                    <svg width={'40px'} height={'100%'}>
                        <rect x='15px' y='15px' height='20px' width='20px' fill={'#7ed6df'}/>
                    </svg>
                    <div className='tag-text'>path(s)-selected</div>
                </span>

            </div>
            <MapCon
                exgMap={exg_map}
                maps={sub_map}
                dataIndex={dataIndex}
            />
            {/* <D3MapCon
                exgMap={exg_map}
                maps={sub_map}/> */}
        </div>
    );
}

export default App;
