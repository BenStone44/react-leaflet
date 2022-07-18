import {LatLngExpression} from "leaflet";


export interface NodeR {
    'id': string,
    'center': LatLngExpression
}


export interface Graph{
    'index': number,
    'nid': number,
    'nodeR': { [key: string]: number },
    'paths': { [key: string]: number }
}

export interface Node {
    "nid": string,
    "lat": number,
    "lng": number,
    "namechn": string,
    "nameeng": string
}

export interface Network {
    "g": any,
    "w": number,
    "id": string
}

export interface NodeParse {
    id: string,
    center: LatLngExpression,
    nodeOptions: any,
    radius: number
}


export interface PathParse {
    ids: string,
    weight: number,
    start: LatLngExpression,
    end: LatLngExpression,
    pathOption: any
}


export interface MapParse {
    id: number,
    nodesParse: NodeParse[],
    pathsParse: PathParse[]
}

