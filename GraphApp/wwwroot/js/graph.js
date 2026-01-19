function renderD3Graph(containerId, nodes, links, dotNetObject) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform)
        }))
        .append("g");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g");

    const circles = node.append("circle")
        .attr("r", 10)
        .attr("fill", "green");

    const labels = node.append("text")
        .text(d => d.id)
        .attr('x', 12)
        .attr('y', 3)
        .on("click", (event, d) => {
            dotNetObject.invokeMethodAsync('OnLabelClicked', d.id);
        });

    node.append("title")
        .text(d => d.id);

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }
}