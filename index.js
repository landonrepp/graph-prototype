const data = {
    nodes: [
        { id: "Root" },
        { id: "L1-A" },
        { id: "L1-B" },
        { id: "very long label test" },
        { id: "L2-B" },
        { id: "L2-C" },
        { id: "L2-D long label" },
        { id: "L3-A" },
        { id: "L3-B" },
    ],
    links: [
        { source: "Root", target: "L1-A", label: "rel" },
        { source: "Root", target: "L1-B", label: "rel" },
        { source: "L1-A", target: "very long label test", label: "rel" },
        { source: "L1-A", target: "L2-B", label: "rel" },
        { source: "L1-B", target: "L2-C", label: "rel" },
        { source: "L1-B", target: "L2-D long label", label: "rel" },
        { source: "very long label test", target: "L3-A", label: "rel" },
        { source: "L2-D long label", target: "L3-B", label: "rel" },
    ]
};

const width = window.innerWidth;
const height = window.innerHeight;

const links = data.links.map(d => ({ ...d }));
const nodes = data.nodes.map(d => ({ ...d }));

// --- Layout Calculation ---

// 1. Calculate node levels (y-position)
const nodeLevels = {};
function setLevels(nodeId, level) {
    const existingLevel = nodeLevels[nodeId];
    if (existingLevel === undefined || existingLevel < level) {
        nodeLevels[nodeId] = level;
        data.links.filter(l => l.source === nodeId).forEach(link => {
            setLevels(link.target, level + 1);
        });
    }
}
const allTargetIds = new Set(data.links.map(l => l.target));
const rootNodeIds = data.nodes.filter(n => !allTargetIds.has(n.id)).map(n => n.id);
rootNodeIds.forEach(nodeId => setLevels(nodeId, 0));
nodes.forEach(node => {
    node.level = nodeLevels[node.id];
    if (node.level === undefined) {
        node.level = Math.max(...Object.values(nodeLevels)) + 1;
    }
});

// 2. Identify subtrees for x-positioning
const subtree = {};
function assignSubtree(nodeId, tree) {
    if (!subtree[nodeId]) {
        subtree[nodeId] = tree;
        data.links.filter(l => l.source === nodeId).forEach(link => {
            assignSubtree(link.target, tree);
        });
    }
}
const rootChildren = data.links.filter(l => l.source === 'Root');
rootChildren.forEach((link, i) => {
    assignSubtree(link.target, i);
});
nodes.forEach(node => {
    node.subtree = subtree[node.id];
});
const numSubtrees = rootChildren.length;


// --- Simulation Setup ---

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-350))
    .force("y", d3.forceY(d => d.level * 180 + 100).strength(1))
    .force("x", d3.forceX(d => {
        if (d.id === 'Root') {
            return width / 2;
        }
        const separation = 400; // pixels between subtrees
        const totalWidth = (numSubtrees - 1) * separation;
        const xStart = (width - totalWidth) / 2;
        return xStart + d.subtree * separation;
    }).strength(0.8))
    .force("collide", d3.forceCollide().radius(d => (d.id.length * 4) + 25));


// --- SVG Rendering ---

const svg = d3.select("#app")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

svg.append("defs").selectAll("marker")
    .data(["end"])
    .join("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
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
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => d.label);

const node = container.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .join("g");

node.append("circle")
    .attr("r", 10)
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
