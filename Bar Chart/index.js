// const data = [
//     { width: 200, height: 100, fill: 'purple' },
//     { width: 100, height: 60, fill: 'pink' },
//     { width: 50, height: 30, fill: 'red' }
// ]

// const svg = d3.select('svg')

// // Join data to rects
// const rects = svg.selectAll('rect')
//     .data(data)

// // add attrs to rects
// rects.attr('width', (d, i, n) => d.width)
//     .attr('height', d => d.height)
//     .attr('fill', d => d.fill)

// // append the enter selection to DOM
// rects.enter()
//     .append('rect')
//     .attr('width', (d, i, n) => d.width)
//     .attr('height', d => d.height)
//     .attr('fill', d => d.fill)

// console.log(rects)


// Select svg container first
// const svg = d3.select('svg')

// d3.json('planets.json').then(data => {
//     const circs = svg.selectAll('circle')
//         .data(data)

//     // add attrs to circs already in DOM
//     circs.attr('cy', 200)
//         .attr('cx', d => d.distance)
//         .attr('r', d => d.radius)
//         .attr('fill', d => d.fill)

//     // append the enter selection to the DOM
//     circs.enter()
//         .append('circle')
//         .attr('cy', 200)
//         .attr('cx', d => d.distance)
//         .attr('r', d => d.radius)
//         .attr('fill', d => d.fill)
// })

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600)

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 }
const graphWidth = 600 - margin.left - margin.right
const graphHeight = 600 - margin.top - margin.bottom

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

// graph.append('rect')
// graph.append('rect')
// graph.append('rect')
// graph.append('rect')
// graph.append('rect')
// graph.append('rect')
// graph.append('rect')

const xAxisGroup = graph.append('g')
    .attr('transform', `translate(0, ${graphHeight})`)
const yAxisGroup = graph.append('g')

// scales
const y = d3.scaleLinear()
    .range([graphHeight, 0])

const x = d3.scaleBand()
    .range([0, 500])
    .paddingInner(0.2)
    .paddingOuter(0.2)

// create the axes
const xAxis = d3.axisBottom(x)
const yAxis = d3.axisLeft(y)
    .ticks(4)
    .tickFormat(d => d + ' orders')

// update x axis text
xAxisGroup.selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end')
    .attr('fill', 'chocolate')

const t = d3.transition().duration(500);

// update function
const update = (data) => {

    // updating scale domains
    y.domain([0, d3.max(data, d => d.orders)])
    x.domain(data.map(item => item.name))

    // join the data to rects
    const rects = graph.selectAll('rect')
        .data(data)

    // remove exit selection
    rects.exit().remove()

    // update current shapes in dom
    rects.attr('width', x.bandwidth)
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        .transition(t)
        .attr('height', d => graphHeight - y(d.orders))
        .attr('y', d => y(d.orders));

    // append the enter selection to the DOM
    rects.enter()
        .append('rect')
        // .attr('width', 0)
        .attr('height', 0)
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        .attr('y', graphHeight)
        // .merge(rects)
        .transition(t)
        .attrTween('width', widthTween)
        .attr('y', d => y(d.orders))
        .attr('height', d => graphHeight - y(d.orders))


    // call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
};

let data = []

// get data from firestore
db.collection('dishes').onSnapshot(res => {
    res.docChanges().forEach(change => {

        const doc = {...change.doc.data(), id: change.doc.id }

        switch (change.type) {
            case 'added':
                data.push(doc)
                break
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id)
                data[index] = doc
                break
            case 'removed':
                data = data.filter(item => item.id !== doc.id)
                break
            default:
                break
        }
    })

    update(data)


})