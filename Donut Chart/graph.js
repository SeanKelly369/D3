const dims = { height: 300, width: 300, radius: 150 }
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) }

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150)

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`)

const pie = d3.pie()
    .sort(null)
    .value(d => d.cost)

const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2)

const colour = d3.scaleOrdinal(d3['schemePastel1'])

// legend setup
const legendGroup = svg.append('g')
    .attr('transform', `translate(${dims.width + 40}, 10)`)

const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(colour)

const tip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        let content = `<div class="name">${d.data.name}</div>`
        content += `<div class="cost">${d.data.cost}</div>`
        content += `<div class="delete">Click slice to delete</div>`
        return content
    })

graph.call(tip)

// update function
const update = (data) => {

    // update colour scale domain
    colour.domain(data.map(d => d.name))

    // update colour scale domain
    colour.domain(data.map(d => d.name))

    // update and call legend
    legendGroup.call(legend)
    legendGroup.selectAll('text').attr('fill', 'white')

    // join enhanced (pie) data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data))

    // handle the exit selection
    paths.exit()
        .transition().duration(750)
        .attrTween('d', arcTweenExit)
        .remove()

    // handle the current DOM path updates
    paths.attr('d', arcPath)
        .transition().duration(750)
        .attrTween('d', arcTweenUpdate)


    // append the enter selection to the DOM
    paths.enter()
        .append('path')
        .attr('class', 'arc')
        // .attr('d', arcPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', d => colour(d.data.name))
        .each(function(d) { this._current = d })
        .transition().duration(750)
        .attrTween('d', arcTweenEnter)

    // Add events
    graph.selectAll('path')
        .on('mouseover', (d, i, n) => {
            tip.show(d, n[i])
            handleMouseOver(d, i, n)
        })
        .on('mouseout', (d, i, n) => {
            tip.hide(d, n[i])
            handleMouseOut(d, i, n)
        })
        .on('click', handleClick)
}

// data array and firestore
let data = []

db.collection('expenses').onSnapshot(res => {
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

const arcTweenEnter = (d) => {
    let i = d3.interpolate(d.endAngle, d.startAngle)

    return function(t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}

const arcTweenExit = (d) => {
    let i = d3.interpolate(d.startAngle, d.endAngle)

    return function(t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}

// Use function keyword to allow use of 'this'
function arcTweenUpdate(d) {

    // Interpolate between the two objects
    let i = d3.interpolate(this._current, d)

    // Update the current prop with new updated data
    this._current = d

    return function(t) {
        return arcPath(i(t))
    }
}

// Event handlers
const handleMouseOver = (d, i, n) => {
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', '#fff')
}

const handleMouseOut = (d, i, n) => {
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', colour(d.data.name))
}

const handleClick = (d) => {
    const id = d.data.id
    db.collection('expenses').doc(id).delete()
}