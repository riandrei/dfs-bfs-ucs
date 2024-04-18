let graph = {
  S: [
    { node: "A", weight: 4 },
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
  thirdInputElement.value = element[1].map((el) => el.weight).join(",");

  inputRow.appendChild(inputElement);
  inputRow.appendChild(secondInputElement);
  inputRow.appendChild(thirdInputElement);
  inputRow.appendChild(deleteButton);

  inputElements.appendChild(inputRow);
});

const inputRow = document.createElement("div");
const startingNodeLabel = document.createElement("p");
const inputStartingNode = document.createElement("p");
const goalNodeLabel = document.createElement("p");
const inputGoalNode = document.createElement("p");

startingNodeLabel.textContent = "Starting Node: ";
inputStartingNode.textContent = Object.keys(graph)[0];
goalNodeLabel.textContent = "Goal Node: ";
inputGoalNode.textContent = Object.keys(graph)[Object.keys(graph).length - 1];

inputRow.style.justifyContent = "center";
inputRow.id = "startingNode";
inputGoalNode.id = "goalNode";
inputGoalNode.style.width = "50px";
inputGoalNode.style.height = "20px";

inputRow.appendChild(startingNodeLabel);
inputRow.appendChild(inputStartingNode);
inputRow.appendChild(goalNodeLabel);
inputRow.appendChild(inputGoalNode);
inputElements.appendChild(inputRow);

addNodeButton.addEventListener("click", () => {
  const inputRow = document.createElement("div");
  const inputElement = document.createElement("input");
  const secondInputElement = document.createElement("input");
  const thirdInputElement = document.createElement("input");
  const deleteButton = document.createElement("button");
  const startingNode = document.querySelector("#startingNode");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";

  deleteButton.addEventListener("click", () => {
    inputElements.removeChild(inputRow);
  });

  inputRow.appendChild(inputElement);
  inputRow.appendChild(secondInputElement);
  inputRow.appendChild(thirdInputElement);
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
    const [node, adjacentsInput, weightInput] = inputRow.children;

    if (
      node.value === undefined ||
      adjacentsInput.value === undefined ||
      node.value === ""
    ) {
      continue;
    }

    if (adjacentsInput.value === "") {
      newGraphValue[node.value] = [];
      continue;
    }

    const adjacents = adjacentsInput.value.split(",");
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

    newGraphValue[node.value] = adjacents.map((adjacent, i) => {
      const weight = weightInput.value.split(",")[i];

      return {
        node: adjacent,
        weight: Number(weight),
      };
    });
  }

  const inputGoalNode = document.querySelector("#goalNode");
  inputGoalNode.textContent =
    Object.keys(newGraphValue)[Object.keys(newGraphValue).length - 1];

  graph = newGraphValue;
  console.log(graph, newGraphValue);
  drawGraph(graph);
});

const bfsButton = document.querySelector("#bfsButton");
const dfsButton = document.querySelector("#dfsButton");
const ucsButton = document.querySelector("#ucsButton");

bfsButton.addEventListener("click", async () => {
  await bfs(Object.keys(graph)[0], graph);

  drawGraph(graph);
});
dfsButton.addEventListener("click", async () => {
  await dfs(Object.keys(graph)[0], graph);

  drawGraph(graph);
});
ucsButton.addEventListener("click", async () => {
  const inputGoalNode = document.querySelector("#goalNode");
  await ucs(Object.keys(graph)[0], graph, inputGoalNode.textContent);

  await new Promise((resolve) => setTimeout(resolve, 1000));

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
// bfs(Object.keys(graph)[0], graph);

async function dfs(startNode, graph) {
  const visited = new Set();
  const nodeText = startNode.node === undefined ? startNode : startNode.node;
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

async function bfs(startNode, graph) {
  const visited = new Set();
  const queue = [startNode];
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

async function ucs(startNode, graph, goalNode) {
  const visited = new Set();

  async function visit(node, cost) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (node === goalNode) {
      console.log(node, goalNode);
      visited.add(node);

      const { x, y } = nodePositions[node];
      drawVisitedNode(node, x, y, "yellow");

      console.log("end");

      return `Goal reached! Total cost: ${cost}`;
    }

    visited.add(node);
    const { x, y } = nodePositions[node];
    drawVisitedNode(node, x, y, "yellow");

    const neighbors = graph[node].filter(
      (neighbor) => !visited.has(neighbor.node)
    );

    if (neighbors.length === 0) {
      return "No path found";
    }

    neighbors.sort((a, b) => a.weight - b.weight);
    const lowestCostAdjacentNode = neighbors[0];

    console.log(visited);

    return visit(
      lowestCostAdjacentNode.node,
      cost + lowestCostAdjacentNode.weight
    );
  }

  return visit(startNode, 0);
}

function drawVisitedNode(node, x, y, color) {
  // Clear the area around the node
  ctx.clearRect(x - nodeRadius, y - nodeRadius, 2 * nodeRadius, 2 * nodeRadius);

  // Redraw the node with the new color
  drawNode(node, x, y, color);
}
