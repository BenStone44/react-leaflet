import {MapParse} from "./store/models";

export function splitString(s: string) {
    return s.split('#')
}


export function element_is_contained(rule: [Set<string>, Set<string>] | undefined, fact: [Set<string>, Set<string>]) {
    if (rule === undefined) return false
    let union0 = new Set([...Array.from(rule[0]), ...Array.from(fact[0])])
    let union1 = new Set([...Array.from(rule[1]), ...Array.from(fact[1])])
    return (union0.size === rule[0].size) && (union1.size === rule[1].size);
}


type GlobalScaleFunction = (v: number, zoom: number) => number

export const globalScale: GlobalScaleFunction = (v: number, zoom: number) => Math.pow(2, zoom) * v / 6000 / zoom


export function getAngle(x1: number, y1: number, x2: number, y2: number) {

    const angle: number = Math.atan2((y2 - y1), (x2 - x1))  //弧度  0.6435011087932844
    const theta: number = angle * (180 / Math.PI);  //角度  36.86989764584402
    return theta + 90
}

export function rotate(x: number, y: number, rx: number, ry: number, a: number) {
    const cos = Math.cos(a)
    const sin = Math.sin(a)
    const xm = (x - rx) * cos - (y - ry) * sin + rx;
    const ym = (x - rx) * sin + (y - ry) * cos + ry;
    return [xm, ym]
}

export function generateArrowParse(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number, weight: number) {
    const x = (x1 + x2) / 2
    let y = (y1 + y2) / 2

    const w = weight


    let t1 = 0.4 * w
    let t2 = 0.4 * w / Math.sqrt(3)

    let p1 = "", p2 = ""
    // let ps1: number[][]
    // let ps2: number[][]
    if (w1 > w2) {
        if (w2 > 0) {
            p1 =
                `${x - t1}, ${y}  
                ${x - t1}, ${y + 0.5 * t2} 
                ${x}, ${y + 1.5 * t2} 
                ${x + t1}, ${y + 0.5 * t2} 
                ${x + t1} ${y} 
                ${x}, ${y + t2}`
            // ps1 = [[x - t1, y], [x - t1, y + 0.5 * t2], [x, y + 1.5 * t2], [x + t1, y + 0.5 * t2], [x + t1, y], [x, y + t2]]
        } else {
            p1 =
                `${x - t1}, ${y - 0.5 * t2}  
                ${x - t1}, ${y} 
                ${x},${y + t2} 
                ${x + t1},${y} 
                ${x + t1}  ${y - 0.5 * t2}
                ${x}, ${y + 0.5 * t2}`
            // ps1 = [[x - t1, y - 0.5 * t2], [x - t1, y], [x, y + t2], [x + t1, y], [x + t1, y - 0.5 * t2], [x, y + 0.5 * t2]]
        }
        t1 = t1 * w2 / w1
        t2 = t2 * w2 / w1

        y = y - (2 - w2 / w1) * t2

        p2 =
            `${x - t1}, ${y}  
                ${x - t1}, ${y - 0.5 * t2} 
                ${x}, ${y - 1.5 * t2} 
                ${x + t1}, ${y - 0.5 * t2} 
                ${x + t1} ${y} 
                ${x}, ${y - t2}`
        // ps2 = [[x - t1, y], [x - t1, y - 0.5 * t2], [x, y - 1.5 * t2], [x + t1, y - 0.5 * t2], [x + t1, y], [x, y - t2]]
    } else {
        if (w1 > 0) {
            p2 =
                `${x - t1}, ${y}  
                ${x - t1}, ${y - 0.5 * t2} 
                ${x}, ${y - 1.5 * t2} 
                ${x + t1}, ${y - 0.5 * t2} 
                ${x + t1} ${y} 
                ${x}, ${y - t2}`
            // ps2 = [[x - t1, y], [x - t1, y - 0.5 * t2], [x, y - 1.5 * t2], [x + t1, y - 0.5 * t2], [x + t1, y], [x, y - t2]]
        } else {
            p2 =
                `${x - t1}, ${y + 0.5 * t2}  
                ${x - t1}, ${y} 
                ${x}, ${y - t2} 
                ${x + t1}, ${y} 
                ${x + t1} ${y + 0.5 * t2} 
                ${x}, ${y - 0.5 * t2}`
            // ps2 = [[x - t1, y + 0.5 * t2], [x - t1, y], [x, y - t2], [x + t1, y], [x + t1, y + 0.5 * t2], [x, y - -0.5 * t2]]
        }

        t1 = t1 * w1 / w2
        t2 = t2 * w1 / w2
        y = y + (2 - w1 / w2) * t2
        p1 =
            `${x - t1}, ${y} 
            ${x - t1}, ${y + 0.5 * t2} 
            ${x}, ${y + 1.5 * t2} 
            ${x + t1}, ${y + 0.5 * t2} 
            ${x + t1} ${y} 
            ${x}, ${y + t2}`
        // ps1 = [[x - t1, y], [x - t1, y + 0.5 * t2], [x, y + 1.5 * t2], [x + t1, y + 0.5 * t2], [x + t1, y], [x, y + t2]]
    }

    // const angle = getAngle(x2 - x1, y2 - y1, 1, 0)
    // let parse1 = ''
    // let parse2 = ''
    // ps1.forEach((p: number[]) => {
    //     const newP = rotate(p[0], p[1], x, y, angle)
    //     parse1 = parse1 + `${newP[0]}, ${newP[1]} `
    //     console.log(parse1)
    // })
    // ps2.forEach((p: number[]) => {
    //     const newP = rotate(p[0], p[1], x, y, angle)
    //     parse2 = parse2 + `${newP[0]}, ${newP[1]} `
    // })
    return [p1, p2]
}

export function compareGraph() {
    return function (m: MapParse, n: MapParse) {
        let a = m.pathsParse[0].weight;
        let b = n.pathsParse[0].weight;
        return b - a;
    }
}

export function reverseIDs(ids: string) {
    let rid: string[] = splitString(ids)
    return rid[1] + '#' + rid[0]
}