import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import store from '../../store'
import {MapParse, PathParse, NodeParse} from "../../store/models";
import {PushpinTwoTone} from '@ant-design/icons';


import {LatLngExpression, LatLngBoundsExpression, LatLngBounds} from "leaflet";
import {MapContainer, TileLayer, Circle, useMapEvents, Polyline, useMap, SVGOverlay} from "react-leaflet";

import * as d3 from 'd3'

import "./Map.scss";

import {element_is_contained, generateArrowParse, getAngle, globalScale, reverseIDs} from "../../utils"

import {Pagination, Checkbox} from "antd";

import 'antd/lib/pagination/style/css';
import 'antd/lib/checkbox/style/css';

import {
    ClickNodeAction,
    ClickPathAction,
    InitSubMapAction,
    SetNowIndexAction,
    SetTimeIndexAction,
    InitSelectedPathsAction,
    InitSelectedNodesAction,

    clickNode,
    clickPath,
    initSubMap,
    setNowIndex,
    setTimeIndex,
    initSelectedPaths,
    initSelectedNodes
} from "../../store/actions";


interface props {
    state: any;
    clickNode: (id: string) => ClickNodeAction;
    clickPath: (id: string) => ClickPathAction;

    setNowIndex: (index: number) => SetNowIndexAction;
    setTimeIndex: (index: number) => SetTimeIndexAction;

    initSelectedPaths: (initialState: Set<string>) => InitSelectedPathsAction;
    initSelectedNodes: (initialState: Set<string>) => InitSelectedNodesAction;
    initSubMap: (initialState: Array<[Set<string>, Set<string>]>) => InitSubMapAction;


    maps: MapParse[];
    exgMap: MapParse;
    dataIndex: number;

}

interface state {
    current_page: number,

    zoom: Map<number, number>,
    Position: Map<number, LatLngExpression>,

    selectedG: Set<number>,

    co: boolean,
    co_zoom: number,
    co_center: LatLngExpression
}


function MouseAction(props: any) {
    const {getZoom, index, setIndex, gIndex} = props;

    const map = useMapEvents({
        zoomend(n) {
            const ll = [map.getCenter().lat, map.getCenter().lng]
            getZoom(map.getZoom(), ll, index)
        },
        dragend() {
            const ll = [map.getCenter().lat, map.getCenter().lng]
            getZoom(map.getZoom(), ll, index)
        },
        mouseover() {
            setIndex(gIndex)
        },
        mouseout() {
            setIndex(-1)
        }
    })
    return null
}


function ChangeView(props: any) {
    const map = useMap();
    map.setView(props.center, props.zoom);
    return null;
}


function Arrow(props: any) {
    const map = useMap();
    const {exg, scale, idx, selectedPs, clickPath, setstate} = props

    const svg = d3.select(map.getPanes().overlayPane).select("svg")
    // svg.select('g').attr('id', 'g1')
    svg.select('#g2').remove()

    const g2 = d3.select(map.getPanes().overlayPane).select("svg")
        .append('g').attr('id', 'g2')

    const arrow_parse: [[string, string], string, string][] = []
    exg.pathsParse.map((path: PathParse, index: number) => {
        const {start, end} = path
        const x1 = map.latLngToLayerPoint(start).x
        const y1 = map.latLngToLayerPoint(start).y
        const x2 = map.latLngToLayerPoint(end).x
        const y2 = map.latLngToLayerPoint(end).y

        // console.log(path.ids, '!!!!!!!!!!!!!!!!!!!!!!!!!!', x1, y1, x1, y2, map.getCenter())
        const weight = globalScale(path.weight, map.getZoom()) * scale

        const w1 = path.pathOption.w[0], w2 = path.pathOption.w[1]

        const parse = generateArrowParse(x1, y1, x2, y2, w1, w2, weight)

        const angle = getAngle(x2 - x1, y2 - y1, 1, 0)

        arrow_parse.push([[parse[0], parse[1]], path.ids, `rotate(${angle},${(x1 + x2) / 2},${(y1 + y2) / 2})`])
        g2.append('polygon')
            .attr('class', idx === -1 ? 'exg_polygon' : 'sub_polygon')
            .attr('key', idx + path.ids + 'aw0')
            .attr('points', parse[0])
            .attr('stroke', selectedPs.has(path.ids) ? '#7ED6DF' : 'white')
            .attr('fill', selectedPs.has(path.ids) ? '#7ED6DF' : 'white')
            .attr('stroke-width', 1)
            .attr('transform', `rotate(${angle},${(x1 + x2) / 2},${(y1 + y2) / 2})`)
            .on('click', (e: MouseEvent) => {
                clickPath(path.ids)
                setstate()
            })

        g2.append('polygon')
            .attr('class', idx === -1 ? 'exg_polygon' : 'sub_polygon')
            .attr('key', idx + path.ids + 'aw1')
            .attr('points', parse[1])
            .attr('stroke', selectedPs.has(reverseIDs(path.ids)) ? '#7ED6DF' : 'white')
            .attr('fill', selectedPs.has(reverseIDs(path.ids)) ? '#7ED6DF' : 'white')
            .attr('stroke-width', 1)
            .attr('transform', `rotate(${angle},${(x1 + x2) / 2},${(y1 + y2) / 2})`)
            .on('click', (e: MouseEvent) => {
                clickPath(reverseIDs(path.ids))
                setstate()
            })
        return null
    })

    // exg.nodesParse.map((node: NodeParse, index: number) => {
    //     const {center} = node
    //     const x = map.latLngToLayerPoint(center).x
    //     const y = map.latLngToLayerPoint(center).y
    //     g2.append('text')
    //         .attr('key', 'node_id' + node.id)
    //         .attr('x', x - 8)
    //         .attr('y', y + 2)
    //         .text(node.id)
    //         .style('font-size', node.nodeOptions.empty ? 0 : idx === -1 ? 20 : 15)
    //     return null
    // })
    // console.log(arrow_parse[0])
    return (
        // <SVGOverlay
        //     className='arrow_svg'
        //     attributes={{stroke: 'red'}} bounds={map.getBounds()} key={idx + 'aw'}>
        //     {
        //         arrow_parse.map((p) => (
        //             <g key={idx + 'g_aw' + p[1]}>
        //                 <polygon points={p[0][0]}
        //                          key={idx + p[1] + 'aw0'}
        //                          className={idx === -1 ? 'exg_polygon' : 'sub_polygon'}
        //                          stroke={selectedPs.has(p[1]) ? '#7ED6DF' : 'white'}
        //                          fill={selectedPs.has(p[1]) ? '#7ED6DF' : 'white'}
        //                          transform={p[2]}
        //                          onClick={() => {
        //                              clickPath(p[1])
        //                              setstate()
        //                          }}
        //                 />
        //                 <polygon points={p[0][1]}
        //                          key={idx + p[1] + 'aw1'}
        //                          className={idx === -1 ? 'exg_polygon' : 'sub_polygon'}
        //                          stroke={selectedPs.has(reverseIDs(p[1])) ? '#7ED6DF' : 'white'}
        //                          fill={selectedPs.has(reverseIDs(p[1])) ? '#7ED6DF' : 'white'}
        //                          transform={p[2]}
        //                          onClick={() => {
        //                              clickPath(reverseIDs(p[1]))
        //                              setstate()
        //                          }}
        //                 />
        //             </g>
        //         ))
        //     }
        // </SVGOverlay>
        <></>
    )
}


const default_center1: LatLngExpression = [34.74954124826429, 113.68053497619827];
const default_center2: LatLngExpression = [31.858095137189462, 117.26596355438234];
const arrow_bounds: LatLngBoundsExpression = [[31.563617517887963, 117.40230560302736], [31.733715247602944, 117.58426666259767]]

const default_zoom: number = 12


const Number = (el: undefined | number) => {
    if (el === undefined) return 0
    else return el
}

const List = (el: any) => {
    if (el === undefined) return []
    else return el
}

const Set2 = (el: any) => {
    if (el === undefined) return [new Set<string>(), new Set<string>()]
    else return el
}

class MAP extends Component<props, state> {
    state = {
        current_page: 1,

        zoom: new Map<number, number>(),
        Position: new Map<number, LatLngExpression>(),
        selectedG: new Set<number>(),

        co: false,
        co_zoom: default_zoom,
        co_center: this.props.dataIndex === 1 ? default_center1 : default_center2,

        default_center: this.props.dataIndex === 1 ? default_center1 : default_center2
    };

    componentDidMount() {
        store.subscribe(() => this.setState({}))

        this.initialPosition(this.state.default_center, this.props.maps)
        this.initialZoom(default_zoom, this.props.maps)
    }


    initialPosition(p: LatLngExpression, maps: MapParse[]) {
        let Position = new Map<number, LatLngExpression>()

        maps.map((l, index) => (
            Position.set(l.id, p)
        ))

        Position.set(-1, p)

        this.setState({Position: Position})
    }

    initialZoom(Zoom: number, maps: MapParse[]) {
        let zoom = new Map<number, number>()

        maps.map((l, index) => (
            zoom.set(l.id, Zoom)
        ))

        zoom.set(-1, Zoom + 1)
        this.setState({zoom: zoom})
    }

    getChildZoom = (new_zoom: number, new_position: LatLngExpression, index: number) => {
        if (index === -2) {
            this.setState({
                co_zoom: new_zoom,
                co_center: new_position
            })
        }

        if (index === -3) {
            this.setState({
                co_zoom: new_zoom - 1,
                co_center: new_position
            })
        }

        let {zoom, Position} = this.state

        zoom.set(index, new_zoom)
        Position.set(index, new_position)

        this.setState({zoom: zoom, Position: Position})
    };

    handleReset() {

        this.props.initSelectedNodes(new Set<string>())
        this.props.initSelectedPaths(new Set<string>())

        this.initialPosition(this.state.default_center, this.props.maps)
        this.initialZoom(default_zoom, this.props.maps)

        this.setState({
            current_page: 1,
            co: false,
            co_zoom: default_zoom,
            co_center: this.state.default_center,
            selectedG: new Set<number>()
        })
    }

    handleCheckBox(isChecked: boolean, index: number) {
        let checked = this.state.selectedG

        if (isChecked) {
            checked.add(index)
        } else {
            checked.delete(index)
        }

        this.setState({selectedG: checked})
    }

    handleArrowClick() {
        this.setState({current_page: 1})
    }

    render() {
        const {current_page, zoom, Position, selectedG, co, co_center, co_zoom, default_center} = this.state

        const map_url = 'https://api.mapbox.com/styles/v1/zikunrain/cl09ejle0003v14mglm1p9x13/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiemlrdW5yYWluIiwiYSI6ImNqeWE2dXJ1djBibmIzY21mMWl5MDljc2wifQ.NMe8T_yYFKIsraDJV4tIPw'


        const {clickNode, clickPath, setNowIndex, maps, exgMap} = this.props
        const {NowIndex, SelectedPaths, SelectedNodes} = this.props.state


        const SubMapNP: Map<number, [Set<string>, Set<string>]> = new Map<number, [Set<string>, Set<string>]>()

        for (let i = 0; i < maps.length; i++) {
            let pSet: Set<string> = new Set()
            let mSet: Set<string> = new Set()
            for (let j = 0; j < maps[i].nodesParse.length; j++) {
                if (!maps[i].nodesParse[j].nodeOptions.empty) pSet.add(maps[i].nodesParse[j].id)
            }
            for (let j = 0; j < maps[i].pathsParse.length; j++) {
                mSet.add(maps[i].pathsParse[j].ids)
            }
            SubMapNP.set(maps[i].id, [pSet, mSet])
        }


        let filteredMaps = maps.filter((subMap, index) =>
            element_is_contained(SubMapNP.get(subMap.id), [SelectedNodes, SelectedPaths]) || selectedG.has(subMap.id))


        let exg: [Set<string>, Set<string>] = (NowIndex === -2 || NowIndex === -1) ?
            [new Set<string>(), new Set<string>()] : Set2(SubMapNP.get(filteredMaps[NowIndex + 6 * (current_page - 1)].id))

        selectedG.forEach((index) => {
            let ns = List(SubMapNP.get(index))[0]
            let ps = List(SubMapNP.get(index))[1]
            exg[0] = new Set<string>(Array.from(exg[0]).concat(Array.from(ns)))
            exg[1] = new Set<string>(Array.from(exg[1]).concat(Array.from(ps)))
        })


        return (
            <div className='total'>
                <div className="exg_above">
                    <div className='synchronize'>
                        <div className='text_checkbox'>
                            <Checkbox key='exgCb'
                                      onChange={(e) => this.setState({co: e.target.checked})}
                                      checked={this.state.co}/>
                        </div>
                        <div className='split_line'/>
                        <div className='text_head'>Synchronized pan and zoom</div>
                    </div>
                    <button
                        className='reset_button'
                        onClick={() => this.handleReset()}
                    >Reset viewports
                    </button>
                </div>
                <div className='background'>
                    <div className='exg' key='exg'>
                        <MapContainer
                            className="exg_map"
                            center={default_center}
                            zoom={default_zoom}
                            scrollWheelZoom={true}
                            zoomControl={false}
                            doubleClickZoom={false}
                            style={{
                                height: "95vh",
                                width: "36vw",
                            }}
                        >
                            <TileLayer key='exg_tile'
                                       url={map_url}/>
                            <MouseAction key='exg_mouse_action'
                                         getZoom={this.getChildZoom}
                                         index={co ? -3 : -1}
                                         gIndex={-2}
                                         setIndex={setNowIndex}
                            />
                            <ChangeView center={co ? co_center : Position.get(-1)}
                                        zoom={co ? co_zoom + 1 : zoom.get(-1)}
                                        key='exg_change_view'
                            />
                            {
                                exgMap.pathsParse.map((l, index) => (
                                    <Polyline
                                        className="exg_ploy"
                                        key={"expMap-path" + l.ids + 'exg'}
                                        pathOptions={{
                                            weight: globalScale(l.weight, Number(co ? co_zoom + 1 : zoom.get(-1))),
                                            color: exg[1].has(l.ids) || exg[1].has(reverseIDs(l.ids)) ? "#1890FF" : "#999999",
                                            opacity: 1
                                        }}
                                        positions={[l.start, l.end]}/>

                                ))
                            }
                            {
                                exgMap.nodesParse.map((l, index) => (
                                    <Circle
                                        key={"expMap-node" + l.id}
                                        eventHandlers={{
                                            click: () => {
                                                clickNode(l.id)
                                                this.setState({current_page: 1})
                                            },
                                        }}
                                        center={l.center}
                                        pathOptions={
                                            {
                                                weight: Number(zoom.get(-1)) / 7,
                                                stroke: true,
                                                fillColor: SelectedNodes.has(l.id) ? "#eb4d4b" : "white",
                                                color: exg[0].has(l.id) ? "#1890FF" : "#999999",
                                                fillOpacity: 1,
                                            }
                                        }
                                        radius={l.radius / 1.5}/>
                                ))
                            }

                            <Arrow exg={exgMap} scale={1} idx={-1} key='exg_arrow'
                                   clickPath={clickPath} setstate={this.handleArrowClick.bind(this)}
                                   selectedPs={SelectedPaths}
                                   center={co_center}
                            />
                        </MapContainer>
                    </div>
                    <div className='sub'>
                        {
                            filteredMaps
                                .filter((subMap, index) =>
                                    (current_page === (Math.floor(index / 6) + 1)))
                                .map((subMap, gIndex) => (
                                    <div className='sub1' key={"sub_t" + gIndex}>
                                        <div className="sub_above" key={"sub_above" + gIndex}
                                             onMouseOver={() => setNowIndex(gIndex)}
                                             onMouseOut={() => setNowIndex(-1)}>
                                            <PushpinTwoTone
                                                className="lock-unlock"
                                                onClick={() => this.handleCheckBox(!selectedG.has(subMap.id), subMap.id)}
                                                twoToneColor={selectedG.has(subMap.id) ? "#1890FF" : "#999999"}/>
                                            {/*<svg*/}
                                            {/*    onClick={(e) => this.handleCheckBox(!selectedG.has(subMap.id), subMap.id)}*/}
                                            {/*    width="24" height="24"*/}
                                            {/*    viewBox="0 0 24 24" fill="none"*/}
                                            {/*    stroke={selectedG.has(subMap.id) ? "#30336b" : "#999999"}*/}
                                            {/*    strokeWidth="2"*/}
                                            {/*    strokeLinecap="round" strokeLinejoin="round"*/}
                                            {/*    className="lock-unlock">*/}
                                            {/*    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>*/}
                                            {/*    {*/}
                                            {/*        selectedG.has(subMap.id) ?*/}
                                            {/*            <path d="M7 11V7a5 5 0 0 1 10 0v4"/> :*/}
                                            {/*            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>*/}
                                            {/*    }*/}
                                            {/*</svg>*/}
                                        </div>
                                        <div className="sub_map"
                                             key={"subMap" + gIndex}
                                        >
                                            <MapContainer
                                                center={default_center}
                                                zoom={default_zoom}
                                                scrollWheelZoom={true}
                                                style={{
                                                    height: "100%",
                                                    width: "100%",
                                                }}
                                                zoomControl={false}
                                                doubleClickZoom={false}
                                            >
                                                <MouseAction key={"mouse_action" + gIndex}
                                                             getZoom={this.getChildZoom}
                                                             index={co ? -2 : subMap.id}
                                                             gIndex={gIndex}
                                                             setIndex={setNowIndex}
                                                />
                                                <ChangeView
                                                    key={"change_view" + gIndex}
                                                    center={co ? co_center : Position.get(subMap.id)}
                                                    zoom={co ? co_zoom : zoom.get(subMap.id)}
                                                />
                                                <TileLayer key={"tile_layer" + gIndex}
                                                           url={map_url}/>
                                                {
                                                    subMap.pathsParse.map((l, index) => (
                                                        <Polyline
                                                            className="sub_ploy"
                                                            key={"subMap-path" + l.ids + subMap.id}
                                                            pathOptions={{
                                                                weight: 4 * globalScale(l.weight, Number(co ? co_zoom : zoom.get(subMap.id))),
                                                                color: "#999999",
                                                                opacity: 1
                                                            }}
                                                            positions={[l.start, l.end]}/>
                                                    ))
                                                }
                                                {
                                                    subMap.nodesParse.map((l, index) => (
                                                        <Circle
                                                            className="sub_circle"
                                                            key={"subMap-node" + l.id + subMap.id}
                                                            center={l.center}
                                                            pathOptions={{
                                                                stroke: true,
                                                                weight: 1,
                                                                fillColor: l.nodeOptions.empty > 0 ? '#666666' : SelectedNodes.has(l.id) ? '#eb4d4b' : 'white',
                                                                color: 'grey',
                                                                fillOpacity: 1,
                                                            }}
                                                            radius={l.nodeOptions.empty ? l.radius / 0.6 : l.radius / 0.3}/>
                                                    ))
                                                }
                                                <Arrow exg={subMap} scale={4} idx={gIndex}
                                                       clickPath={clickPath}
                                                       selectedPs={SelectedPaths}
                                                       setstate={this.handleArrowClick.bind(this)}
                                                       key={"arrow" + gIndex}
                                                       center={co_center}
                                                />
                                            </MapContainer>
                                        </div>
                                    </div>
                                ))
                        }
                        <div className='pagination_down'>
                            <Pagination current={this.state.current_page}
                                        onChange={(page) => {
                                            this.setState({current_page: page})
                                        }}
                                        total={filteredMaps.length} pageSizeOptions={[6]}
                                        defaultPageSize={6}/>
                        </div>
                    </div>
                </div>
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

const MapCon = connect(mapStateToProps, mapDispatchToProps)(MAP);

export default MapCon;
