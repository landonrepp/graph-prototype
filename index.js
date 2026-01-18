const data = {
    nodes: [
        { id: "Root", level: 0 },
        { id: "L1-A", level: 1 },
        { id: "L1-B", level: 1 },
        { id: "L2-A", level: 2 },
        { id: "L2-B", level: 2 },
        { id: "L2-C", level: 2 },
        { id: "L2-D", level: 2 },
        { id: "L3-A", level: 3 },
        { id: "L3-B", level: 3 },
    ],
    links: [
        { source: "Root", target: "L1-A", label: "rel" },
        { source: "Root", target: "L1-B", label: "rel" },
        { source: "L1-A", target: "L2-A", label: "rel" },
        { source: "L1-A", target: "L2-B", label: "rel" },
        { source: "L1-B", target: "L2-C", label: "rel" },
        { source: "L1-B", target: "L2-D", label: "rel" },
        { source: "L2-A", target: "L3-A", label: "rel" },
        { source: "L2-D", target: "L3-B", label: "rel" },
    ]
};

const width = window.innerWidth;
const height = window.innerHeight;

const links = data.links.map(d => ({ ...d }));
const nodes = data.nodes.map(d => ({ ...d }));

const levelHeight = 100;

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(d => 50 + d.level * levelHeight).strength(1));

const svg = d3.select("#app")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

// Define arrow marker
svg.append("defs").selectAll("marker")
    .data(["end"])
    .join("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -0.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#999");

const container = svg.append("g");

const link = container.append("g")
    .selectAll("g")
    .data(links)
    .join("g");

link.append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5)
    .attr("marker-end", "url(#arrow)");

link.append("text")
    .attr("font-size", 10)
    .attr("fill", "#000")
    .text(d => d.label);

const node = container.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .join("g");

node.append("circle")
    .attr("r", 5)
    .attr("fill", "black");

node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(d => d.id)
    .attr("font-size", 12)
    .attr("fill", "#000");
simulation.on("tick", () => {
    link.select("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    link.select("text")
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
});

const zoom = d3.zoom()
    .scaleExtent([0.1, 8])
    .on("zoom", (event) => {
        container.attr("transform", event.transform);
    });

svg.call(zoom);