`
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Setup
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`;

let graph = {
  S: [
    { node: "A", cost: 4 },
    { node: "B", cost: 2 },
    { node: "C", cost: 3 },
  ],
  A: [{ node: "D", cost: 5 }],
  B: [],
  C: [{ node: "D", cost: 3 }],
  D: [],
};

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const nodeRadius = 20;
const nodeSpacing = 100;
let nodePositions;

populateGraphUI(graph);
drawGraph(graph);

`
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Event Listeners
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`;

const addNodeButton = document.querySelector("#addNodeButton");
const submitButton = document.querySelector("#submitButton");
const bfsButton = document.querySelector("#bfsButton");
const dfsButton = document.querySelector("#dfsButton");
const ucsButton = document.querySelector("#ucsButton");

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
    const [node, adjacentsInput, costInput] = inputRow.children;

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
    const costs = costInput.value.split(",");

    if (adjacents.length !== costs.length) {
      alert("The number of adjacents must be the same as the number of costs.");
      return;
    }

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
      const cost = costs[i];

      return {
        node: adjacent,
        cost: Number(cost),
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

`
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Canvas Related Functions
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`;

function drawNode(label, x, y, color = "#ccc") {
  ctx.beginPath();
  ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();

  ctx.font = "16px Arial";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

function drawEdge(fromX, fromY, toX, toY, cost = 1) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  lineToWithArrow(ctx, fromX, fromY, toX, toY, 25);
  ctx.stroke();

  const midX = (fromX + toX) / 2 - 12;
  const midY = (fromY + toY) / 2 - 12;

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(cost.toString(), midX, midY);
}

function lineToWithArrow(ctx, fromX, fromY, toX, toY, offset = 10) {
  const arrowSize = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  const endX = toX - offset * Math.cos(angle);
  const endY = toY - offset * Math.sin(angle);

  ctx.lineTo(endX, endY);

  const arrowX1 = endX - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowY1 = endY - arrowSize * Math.sin(angle + Math.PI / 6);
  const arrowX2 = endX - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowY2 = endY - arrowSize * Math.sin(angle - Math.PI / 6);

  ctx.moveTo(endX, endY);
  ctx.lineTo(arrowX1, arrowY1);
  ctx.lineTo(arrowX2, arrowY2);
  ctx.fill();
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

function drawGraph(graph) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  nodePositions = layoutNodes(graph);

  for (const node in nodePositions) {
    const { x, y } = nodePositions[node];

    for (const child of graph[node]) {
      const childText = child.node;
      const childPos = nodePositions[childText];
      drawEdge(x, y, childPos.x, childPos.y, child.cost);
    }

    drawNode(node, x, y);
  }
}

function drawVisitedNode(node, x, y, color) {
  ctx.clearRect(x - nodeRadius, y - nodeRadius, 2 * nodeRadius, 2 * nodeRadius);

  drawNode(node, x, y, color);
}

`
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Algorithms
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`;

async function dfs(startNode, graph) {
  const visited = new Set();
  const stack = [];

  stack.push(startNode);

  while (stack.length > 0) {
    const currentNode = stack.pop();
    const nodeText =
      currentNode.node === undefined ? currentNode : currentNode.node;

    if (visited.has(nodeText)) {
      continue;
    }

    visited.add(nodeText);

    const { x, y } = nodePositions[nodeText];
    drawVisitedNode(nodeText, x, y, "yellow");

    const neighbors = graph[nodeText];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
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
  const priorityQueue = [{ node: startNode, cost: 0, path: [startNode] }];
  const visited = new Set();
  let lowestCostToGoal = Infinity;

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.cost - b.cost);

    const { node, cost, path } = priorityQueue.shift();
    const { x, y } = nodePositions[node];
    drawVisitedNode(node, x, y, "yellow");

    visited.add(node);

    if (node === goalNode) {
      lowestCostToGoal = cost;
      console.log("Goal reached! Lowest cost:", lowestCostToGoal, path);
      return path;
    }

    for (const neighbor of graph[node] || []) {
      const newCost = cost + neighbor.cost;
      const newPath = path.concat(neighbor.node);

      if (!visited.has(neighbor.node)) {
        const existingNode = priorityQueue.find(
          (item) => item.node === neighbor.node
        );
        if (existingNode) {
          if (newCost < existingNode.cost) {
            existingNode.cost = newCost;
            existingNode.path = newPath;
          }
        } else {
          priorityQueue.push({
            node: neighbor.node,
            cost: newCost,
            path: newPath,
          });
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return null;
}

`
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Others
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`;

function populateGraphUI(graph) {
  const inputElements = document.querySelector("#inputElements");
  const inputRow = document.createElement("div");
  const startingNodeLabel = document.createElement("p");
  const inputStartingNode = document.createElement("p");
  const goalNodeLabel = document.createElement("p");
  const inputGoalNode = document.createElement("p");

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
    thirdInputElement.value = element[1].map((el) => el.cost).join(",");

    inputRow.appendChild(inputElement);
    inputRow.appendChild(secondInputElement);
    inputRow.appendChild(thirdInputElement);
    inputRow.appendChild(deleteButton);

    inputElements.appendChild(inputRow);
  });

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
}
