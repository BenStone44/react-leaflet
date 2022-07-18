import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {LatLngExpression, LatLngBoundsExpression} from "leaflet";
import * as d3 from 'd3'

import "./Map.css";
import {MapParse} from "../../store/models";


import {Pagination, Input} from "antd";
import 'antd/lib/pagination/style/css';
import 'antd/lib/input/style/css';

import {Checkbox} from 'antd';
import 'antd/lib/checkbox/style/css';


import {
    ClickNodeAction,
    ClickPathAction,
    clickNode,
    clickPath,
    initSubMap,
    InitSubMapAction,
    SetNowIndexAction,
    SetTimeIndexAction,
    InitSelectedPathsAction,
    InitSelectedNodesAction,
    setNowIndex,
    setTimeIndex,
    initSelectedPaths,
    initSelectedNodes
} from "../../store/actions";
import {getAngle} from "../../utils";


interface props {
    state: any;
    clickNode: (id: string) => ClickNodeAction;
    clickPath: (id: string) => ClickPathAction;
    initSubMap: (initialState: Array<[Set<string>, Set<string>]>) => InitSubMapAction;
    setNowIndex: (index: number) => SetNowIndexAction;
    setTimeIndex: (index: number) => SetTimeIndexAction;
    maps: MapParse[];
    exgMap: MapParse;
    initSelectedPaths: (initialState: Set<string>) => InitSelectedPathsAction;
    initSelectedNodes: (initialState: Set<string>) => InitSelectedNodesAction;
}

interface state {
    lat: number,
    lng: number,
    current: number,
    zoom: Map<number, number>,
    Position: Map<number, LatLngExpression>,
    selectedG: Set<number>,
    co: boolean,
    co_zoom: number,
}


const map_url = 'https://api.mapbox.com/styles/v1/zikunrain/cl09ejle0003v14mglm1p9x13/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiemlrdW5yYWluIiwiYSI6ImNqeWE2dXJ1djBibmIzY21mMWl5MDljc2wifQ.NMe8T_yYFKIsraDJV4tIPw'
const center: LatLngExpression = [40.767540210841204, -73.97153650778925];

const data: number[][] =
    [[5, 1, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0],
        [6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0],
        [4, 2, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0],
        [6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0],
        [6, 0, 0, 4, 0, 2, 5, 0, 1, 6, 0, 0],
        [6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0],
        [6, 0, 0, 6, 0, 0, 5, 1, 0, 6, 0, 0],
        [2, 4, 0, 3, 3, 0, 4, 2, 0, 5, 1, 0],
        [5, 1, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0],
        [6, 0, 0, 4, 0, 2, 5, 1, 0, 4, 2, 0]]

const ns: number[][] =
    [[11, 1, 0, 12, 0, 0],
        [12, 0, 0, 12, 0, 0],
        [10, 2, 0, 12, 0, 0],
        [12, 0, 0, 12, 0, 0],
        [11, 0, 1, 10, 0, 2],
        [12, 0, 0, 12, 0, 0],
        [11, 1, 0, 12, 0, 0],
        [6, 6, 0, 8, 4, 0],
        [11, 1, 0, 12, 0, 0],
        [11, 1, 0, 8, 2, 2]]


const O = {
    'total': {
        'avg': [72.5, 65, 191.6666667, 56.66666667, 64.54545455, 11.91666667, 43, 69, 36.33333333, 42.66666667],
        'stdevpa': [48.84072754, 41.53311931, 72.89642576, 28.67441756, 32.50556214, 11.84946084, 27.69175569, 27.93146374, 20.35654413, 24.66891882]
    },
    // 'zhengzhou': {//zhengzhou
    //     'avg': [7, 8, 21.66666667, 4.666666667, 62.5, 8.833333333, 31.83333333, 66.33333333, 33.83333333, 44.5],
    //     'stdevpa': [4.041451884, 5.477225575, 7.951240295, 0.745355992, 30.78825534, 3.435921355, 9.441339359, 12.86683938, 7.312470323, 13.17510278]
    // },
    // 'hefei': {//hefei
    //     'avg': [7.5, 5, 16.66666667, 6.666666667, 67, 15, 54.16666667, 71.66666667, 38.83333333, 40.83333333],
    //     'stdevpa': [5.590169944, 0, 5.527707984, 3.726779962, 34.2928564, 15.8113883, 34.57078085, 37.15582802, 27.61893473, 32.19946514]
    // }
}

const C = {
    'total': {
        'avg': [63.33333333, 47.5, 170.8333333, 60.83333333, 114.1, 26.75, 19.16666667, 66.83333333, 43.91666667, 144.4],
        'stdevpa': [23.57022604, 5.95119036, 87.60311385, 19.34697794, 64.24491982, 24.1009163, 11.42244379, 30.45990078, 14.60854963, 82.23374544]
    },
    // 'zhengzhou': {//zhengzhou
    //     'avg': [7.166666667, 4.833333333, 17.83333333, 6.666666667, 113.5, 17.33333333, 18.33333333, 57.83333333, 38.5, 176],
    //     'stdevpa': [2.266911751, 0.372677996, 11.55301788, 2.357022604, 68.60919925, 11.72840806, 15.45603083, 33.51823716, 10.87428159, 112.3189902]
    // },
    // 'hefei': {//heifei
    //     'avg': [5.5, 4.666666667, 16.33333333, 5.5, 114.5, 36.16666667, 20, 75.83333333, 49.33333333, 123.3333333],
    //     'stdevpa': [2.140872096, 0.745355992, 4.346134937, 1.118033989, 52.85435964, 29.09992363, 4.546060566, 23.8775813, 15.80787427, 29.85334524]
    // }
}


const qn = [
    [6.25, 6.416666667, 5.916666667, 6.083333333, 6.75],
    [0.595119036, 0.953793595, 0.953793595, 1.114924013, 0.433012702]
]

const wx = 25 * 3
const wy = 9 * 3
const right = '#0071bc'
const wrong = '#ff931e'
const bright = '#657c9e'
const b_in = 2 * 3
const b_out = 24 * 3
const gw = 2 * 3
const g_width = 15
const scale = 2

const wrong1 = '#00aa9e'
const wrong2 = 'white'
const wrong3 = '#4d4d4d'

const sw = 2.5
const sw1 = 2 / 1.02


const btw = 19 * 2
const width = 138 * 2
const height = 26 * 2

class D3MAP extends Component<props, state> {
    state = {
        lat: 40.767540210841204,
        lng: -73.97153650778925,
        current: 1,
        zoom: new Map<number, number>(),
        Position: new Map<number, LatLngExpression>(),
        selectedG: new Set<number>(),
        co: false,
        co_zoom: 12,
    };


    // componentDidMount() {
    //     //传入props与sate
    //     const {maps, exgMap} = this.props
    //     // const {lat, Position, zoom, co, co_center, co_zoom, current, lng, selectedG} = this.state
    //
    //
    //     //总图
    //     const map = L.map("exg", {center: center, zoom: 14})
    //         .addLayer(new L.TileLayer(map_url));
    //
    //     const svg = d3.select(map.getPanes().overlayPane)
    //         .append("svg")
    //         .attr('width', '100vw')
    //         .attr('height', '200vh')
    //     const g = svg.append("g").attr("class", "leaflet-zoom-hide");
    //
    //
    //     exgMap.pathsParse.map((path) => {
    //         const {start, end} = path
    //         const x1 = map.latLngToLayerPoint(start).x
    //         const y1 = map.latLngToLayerPoint(start).y
    //         const x2 = map.latLngToLayerPoint(end).x
    //         const y2 = map.latLngToLayerPoint(end).y
    //
    //         const angle = getAngle(0, 1, 1, 0)
    //         console.log(angle)
    //         g.append('path')
    //             .attr('id', path.ids)
    //             .attr('d', `M ${x1} ${y1} L ${x2} ${y2}`)
    //             .attr('stroke', 'grey')
    //             .attr('stroke-width', path.weight / 3200)
    //
    //         let parse = ""
    //         path.pathOption.arrow.map((l: LatLngExpression) => {
    //             const {x, y} = map.latLngToLayerPoint(l)
    //             parse = parse + `${x} ${y} `
    //             return 0
    //         })
    //         console.log(parse)
    //         g.append('polygon')
    //             .attr('id', path.ids + 'aw')
    //             .attr('points', parse)
    //             .attr('stroke', 'blue')
    //             .attr('fill', 'white')
    //             .attr('stroke-width', 1)
    //             .attr('transform', `rotate(${angle},${(x1 + x2) / 2},${(y1 + y2) / 2})`)
    //
    //         parse = ""
    //         path.pathOption.arrow2.map((l: LatLngExpression) => {
    //             const {x, y} = map.latLngToLayerPoint(l)
    //             parse = parse + `${x} ${y} `
    //             return 0
    //         })
    //
    //         g.append('polygon')
    //             .attr('id', path.ids + 'aw1')
    //             .attr('points', parse)
    //             .attr('stroke', 'blue')
    //             .attr('fill', 'white')
    //             .attr('stroke-width', 1)
    //             .attr('transform', `rotate(${angle},${(x1 + x2) / 2},${(y1 + y2) / 2})`)
    //         return 0
    //     })
    //     exgMap.nodesParse.map((node) => {
    //         const c: LatLngExpression = node.center
    //         const {x, y} = map.latLngToLayerPoint(c)
    //         g.append('circle')
    //             .attr('cx', x)
    //             .attr('cy', y)
    //             .attr('r', node.radius / 6400)
    //             .attr('stroke', '#999999')
    //             .attr('fill', 'white')
    //             .attr('stroke-width', 1)
    //         return 0;
    //     })
    //
    // }


    render() {
        return (
            <div className='background' id='background'>
                {/*<div className='exg' id='exg'>*/}
                {/*    /!*<div className="exg_above" id='exg_above'/>*!/*/}
                {/*    /!*<div className='exg_map' id='exg_map'/>*!/*/}
                {/*</div>*/}
                {/*<div className='sub'/>*/}
                <svg width='100%' height='100%'>
                    {
                        qn[0].map((avg, index) => (
                            <>
                                <rect
                                    x={index * (width + 2 * btw)}
                                    y={0}
                                    width={width + 8}
                                    height={height}
                                    stroke={wrong1}
                                    fill={wrong1}
                                />
                                <rect
                                    x={index * (width + 2 * btw) + avg * 40}
                                    y={4}
                                    width={(7 - avg) * 40}
                                    height={height - 8}
                                    stroke={wrong2}
                                    fill='white'
                                />
                                <line
                                    x1={index * (width + 2 * btw) + avg * 40 - qn[1][index] * 40}
                                    y1={height / 2 - 1}
                                    x2={index * (width + 2 * btw) + avg * 40 + qn[1][index] * 40}
                                    y2={height / 2 - 1}
                                    stroke={wrong3}
                                    strokeWidth={3}
                                />
                                <line
                                    x1={index * (width + 2 * btw) + avg * 40 - qn[1][index] * 40}
                                    y1={height / 2 + 7}
                                    x2={index * (width + 2 * btw) + avg * 40 - qn[1][index] * 40}
                                    y2={height / 2 - 10}
                                    stroke={wrong3}
                                    strokeWidth={3}
                                />
                                <line
                                    x1={index * (width + 2 * btw) + avg * 40 + qn[1][index] * 40}
                                    y1={height / 2 - 10}
                                    x2={index * (width + 2 * btw) + avg * 40 + qn[1][index] * 40}
                                    y2={height / 2 + 7}
                                    stroke={wrong3}
                                    strokeWidth={3}
                                />
                            </>
                        ))
                    }
                </svg>
            </div>
        );
    }
}

const mapStateToProps = (state: any): { state: any } => {
    return {
        state: state
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        clickNode: bindActionCreators(clickNode, dispatch),
        clickPath: bindActionCreators(clickPath, dispatch),
        initSubMap: bindActionCreators(initSubMap, dispatch),
        setNowIndex: bindActionCreators(setNowIndex, dispatch),
        setTimeIndex: bindActionCreators(setTimeIndex, dispatch),
        initSelectedPaths: bindActionCreators(initSelectedPaths, dispatch),
        initSelectedNodes: bindActionCreators(initSelectedNodes, dispatch)

    };
};

const D3MapCon = connect(mapStateToProps, mapDispatchToProps)(D3MAP);

export default D3MapCon;
