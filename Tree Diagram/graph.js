const dims = { height: 500, width: 1100 }

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 100)
    .attr('height', dims.height + 100)

const graph = svg.append('g')
    .attr('transform', 'translate(50, 50)')

// Data strat
const stratify = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent)

const tree = d3.tree()
    .size([dims.width, dims.height])

// Create ordinal scale
const colour = d3.scaleOrdinal(['#f4511e', '#e91e63', '#e53935', '#9c27b0'])

// Update function
const update = (data) => {

    // Remove current nodes
    graph.selectAll('.node').remove()
    graph.selectAll('.link').remove()

    // Update ordinal scale domain
    colour.domain(data.map(item => item.department))

    // Get updated root Node data
    const rootNode = stratify(data)
        // console.log(rootNode)

    const treeData = tree(rootNode)
        // console.log(treeData)

    // Get nodes selection and join data
    const nodes = graph.selectAll('.node') // .node, does the same as 'g'
        .data(treeData.descendants())

    // Get link selection and join data
    const links = graph.selectAll('.link')
        .data(treeData.links())

    // Enter new links
    links.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#aaa')
        .attr('stroke-width', 2)
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        )

    // Create enter node groups
    const enterNodes = nodes.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)

    // Append rects to enter nodes
    enterNodes.append('rect')
        .attr('fill', d => colour(d.data.department))
        .attr('stroke', '#555')
        .attr('stroke-width', 2)
        .attr('height', 50)
        .attr('width', d => d.data.name.length * 20)
        .attr('transform', d => {
            let x = d.data.name.length * 10
            return `translate(${-x}, -25)`
        })

    // Append name text
    enterNodes.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', 'red')
        .attr(d => d.data.name)

}

let data = []

db.collection('employees').onSnapshot(res => {

    res.docChanges().forEach(change => {

        const doc = {...change.doc.data(),
            id: change.doc.id
        }

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

// console.log(data)