import { arc, create, pie, range, scaleLinear, scaleOrdinal, sum } from 'd3'



export const colorPalette: string[] = ['red', 'blue']


export type Type =
  | 'PC'
  | 'CIP'

export const typesNames: Type[] = [
  'PC',
  'CIP'
]

export interface Datum {
  name: string
  value: number
}
export interface OverviewMapOptions {
  name?: (arg0: Datum) => string
  value?: (arg0: Datum) => number
  width?: number
  height?: number
  innerRadius?: number
  outerRadius?: number
  stroke?: number
  strokeWidth?: number
  strokeLinejoin?: string
  padAngle?: number
}

export function MarkerSVG(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 820" version="1.1" xml:space="preserve" style="fill-rule: evenodd; clip-rule: evenodd; stroke-linecap: round;"><g transform="matrix(19.5417,0,0,19.5417,-7889.1,-9807.44)"><path d="M416.544,503.612C409.971,503.612 404.5,509.303 404.5,515.478C404.5,518.256 406.064,521.786 407.194,524.224L416.5,542.096L425.762,524.224C426.892,521.786 428.5,518.433 428.5,515.478C428.5,509.303 423.117,503.612 416.544,503.612Z" stroke-width="1.1px" fill="${color}"/></g></svg>`
}

export const scaleRadius = scaleLinear().rangeRound([20, 180])

export const scaleColor = scaleOrdinal(typesNames, colorPalette)

export function PieChart(data: Datum[], options: OverviewMapOptions = {}): SVGSVGElement | null {
  const name: (arg0: Datum) => string =
    options.name ||
    function (arg) {
      return arg.name
    } // given d in data, returns the (ordinal) label
  const value: (arg0: Datum) => number =
    options.value ||
    function (arg) {
      return arg.value
    } // given d in data, returns the (quantitative) value

  const width: number = options.width || 640
  const height: number = options.height || 400
  const innerRadius: number = options.innerRadius || 0 // inner radius of pie, in pixels (non-zero for donut)
  const outerRadius: number = options.outerRadius || Math.min(width, height) / 2 // outer radius of pie, in pixels

  const stroke: number | string = options.stroke || innerRadius > 0 ? 'none' : 'white' // stroke separating widths
  const strokeWidth: number = options.strokeWidth || 1 // width of stroke separating wedges
  const strokeLinejoin: string = options.strokeLinejoin || 'round' // line join of stroke separating wedges
  const padAngle: number = options.padAngle || stroke === 'none' ? 1 / outerRadius : 0 // angular separation between wedges

  // Compute values.
  const N = data.map(name)
  const V = data.map(value)
  const I = range(N.length).filter((i) => !isNaN(V[i]))

  const title = (index: number) => V[index]
  // Construct arcs.
  const arcs = pie()
    .padAngle(padAngle)
    .sort(null)
    .value((d, i: number) => V[i])(I)
    .filter((d) => d.value > 0)

  const arcFn = arc().innerRadius(innerRadius).outerRadius(outerRadius)

  const svg = create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

  svg.append('g').append('circle').attr('fill', 'white').attr('r', outerRadius)

  svg
    .append('g')
    .attr('stroke', stroke)
    .attr('stroke-width', strokeWidth)
    .attr('stroke-linejoin', strokeLinejoin)
    .selectAll('path')
    .data(arcs)
    .join('path')
    .attr('fill', (d) => scaleColor(N[d.index] as Type))
    .attr('d', (d) => arcFn({ ...d, innerRadius, outerRadius }))
    .append('title')
    .text((d) => title(d.index))

  svg
    .append('g')
    .attr('transform', `translate(0 3.5)`)
    .append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .text(() => sum(V))

  return svg.node()
}