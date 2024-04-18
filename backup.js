import { PriorityQueue } from "./backup.js";

let graph = {
  S: [
    { node: "A", weight: 1 },
    { node: "B", weight: 2 },
    { node: "C", weight: 3 },
  ],
  A: [{ node: "D", weight: 1 }],
  B: [{ node: "D", weight: 2 }],
  C: [{ node: "D", weight: 3 }],
  D: [],
};
// let graph = {
//   S: ["A", "B", "C"],
//   A: ["D"],
//   B: ["D"],
//   C: ["D"],
//   D: [],
// };

const addNodeButton = document.querySelector("#addNodeButton");
const inputElements = document.querySelector("#inputElements");
const submitButton = document.querySelector("#submitButton");

Object.entries(graph).map((element) => {
  const inputRow = document.createElement("div");
  const inputElement = document.createElement("input");
  const secondInputElement = document.createElement("input");
  const thirdInputElement = document.createElement("input");
  const deleteButton = document.createElement("button");

  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";

  deleteButton.addEventListener("click", () => {
    inputElements.removeChild(inputRow);
  });

  inputElement.value = element[0];
  secondInputElement.value = element[1].map((el) => el.node).join(",");
  thirdInputElement.value = inputRow.appendChild(inputElement);
  inputRow.appendChild(secondInputElement);
  inputRow.appendChild(deleteButton);

  inputElements.appendChild(inputRow);
});

const inputRow = document.createElement("div");
const startingNodeLabel = document.createElement("p");
const inputStartingNode = document.createElement("p");

startingNodeLabel.textContent = "Starting Node: ";
inputStartingNode.textContent = Object.keys(graph)[0];

inputRow.style.justifyContent = "center";
inputRow.id = "startingNode";

inputRow.appendChild(startingNodeLabel);
inputRow.appendChild(inputStartingNode);
inputElements.appendChild(inputRow);

addNodeButton.addEventListener("click", () => {
  const inputRow = document.createElement("div");
  const inputElement = document.createElement("input");
  const secondInputElement = document.createElement("input");
  const deleteButton = document.createElement("button");
  const startingNode = document.querySelector("#startingNode");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";

  deleteButton.addEventListener("click", () => {
    inputElements.removeChild(inputRow);
  });

  inputRow.appendChild(inputElement);
  inputRow.appendChild(secondInputElement);
  inputRow.appendChild(deleteButton);

  inputElements.insertBefore(inputRow, startingNode);
});

submitButton.addEventListener("click", () => {
  if (inputElements.children.length === 1) {
    alert("Please add some nodes");
    return;
  }

  const newGraphValue = {};
  const nodeNames = Array.from(inputElements.children).map(
    (inputRow) => inputRow.children[0].value
  );

  for (const inputRow of inputElements.children) {
    const [node, ...children] = inputRow.children;

    if (
      node.value === undefined ||
      children[0].value === undefined ||
      node.value === ""
    ) {
      continue;
    }

    if (children[0].value === "") {
      newGraphValue[node.value] = [];
      continue;
    }

    const adjacents = children[0].value.split(",");
    const undeclaredNodes = adjacents.filter(
      (adjacent) => !nodeNames.includes(adjacent)
    );

    if (undeclaredNodes.length > 0) {
      alert(
        `The following adjacent nodes are not declared as nodes: ${undeclaredNodes.join(
          ", "
        )}`
      );
      return;
    }

    newGraphValue[node.value] = adjacents;
  }

  graph = newGraphValue;
  console.log(graph, newGraphValue);
  drawGraph(graph);
});

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Define node size and spacing
const nodeRadius = 20;
const nodeSpacing = 100;

function drawNode(label, x, y, color = "#ccc") {
  ctx.beginPath();
  ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();

  // Draw label inside the node
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

function drawEdge(fromX, fromY, toX, toY, weight = 1) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  const midX = (fromX + toX) / 2 - 12;
  const midY = (fromY + toY) / 2 - 12;

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(weight.toString(), midX, midY);
}

function layoutNodes(graph) {
  const nodePositions = {};
  let level = 0;
  let currentLevelNodes = [`${Object.keys(graph)[0]}`];

  while (currentLevelNodes.length > 0) {
    const nextLevelNodes = [];
    let x = 100;

    for (const node of currentLevelNodes) {
      let nodeText = "";

      if (node.node === undefined) {
        nodeText = node;
      } else {
        nodeText = node.node;
      }

      nodePositions[nodeText] = { x, y: (level + 1) * nodeSpacing };
      for (const child of graph[nodeText]) {
        nextLevelNodes.push(child);
      }
      x += nodeSpacing * 2;
    }

    currentLevelNodes = nextLevelNodes;
    level++;
  }

  return nodePositions;
}

let nodePositions;

function drawGraph(graph) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  nodePositions = layoutNodes(graph);

  for (const node in nodePositions) {
    const { x, y } = nodePositions[node];

    for (const child of graph[node]) {
      const childText = child.node;
      const childPos = nodePositions[childText];
      drawEdge(x, y, childPos.x, childPos.y, child.weight);
    }

    drawNode(node, x, y);
  }
}

drawGraph(graph);
ucs(Object.keys(graph)[0], graph);

async function dfs(node, graph) {
  const visited = new Set();
  const nodeText = node.node === undefined ? node : node.node;
  // Mark the node as visited
  visited.add(nodeText);

  // Get the adjacent node
  const neighbors = graph[nodeText];

  // Draw the node with a new color
  const { x, y } = nodePositions[nodeText];
  drawVisitedNode(nodeText, x, y, "yellow");

  // For each adjacent node
  for (const neighbor of neighbors) {
    // Add delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If the neighbor hasn't been visited yet
    if (!visited.has(neighbor)) {
      await dfs(neighbor, graph, visited);
    }
  }

  return visited;
}

async function bfs(node, graph) {
  const visited = new Set();
  const queue = [node];
  while (queue.length > 0) {
    const node = queue.shift();
    const nodeText = node.node === undefined ? node : node.node;

    if (!visited.has(nodeText)) {
      visited.add(nodeText);

      const { x, y } = nodePositions[nodeText];
      drawVisitedNode(nodeText, x, y, "yellow");

      const neighbors = graph[nodeText];
      for (const neighbor of neighbors) {
        queue.push(neighbor);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return visited;
}

function drawVisitedNode(node, x, y, color) {
  // Clear the area around the node
  ctx.clearRect(x - nodeRadius, y - nodeRadius, 2 * nodeRadius, 2 * nodeRadius);

  // Redraw the node with the new color
  drawNode(node, x, y, color);
}
