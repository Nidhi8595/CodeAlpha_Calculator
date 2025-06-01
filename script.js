const display = document.getElementById("display");
const realtimeResult = document.getElementById("realtime-result");
const historyPanel = document.getElementById("historyPanel");
const radDegToggle = document.getElementById("radDegToggle");

let isDegree = false; // Default in radians
let history = [];
let lastResult = null;
let justCalculated = false;

// Append characters to display
function appendToDisplay(char) {
  if (justCalculated) {
    // Clear if new input after result (except operators)
    if ("+-*/^".includes(char)) {
      display.value += char;
    } else {
      display.value = "";
      display.value += char;
    }
    justCalculated = false;
  } else {
    display.value += char;
  }
  updateRealtimeResult();
}

// Clear display
function clearDisplay() {
  display.value = "";
  realtimeResult.textContent = "";
  justCalculated = false;
}

// Toggle history visibility
function toggleHistory() {
  if (historyPanel.classList.contains("visible")) {
    historyPanel.classList.remove("visible");
  } else {
    renderHistory();
    historyPanel.classList.add("visible");
  }
}

// Toggle Dark Mode with smooth transition
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Toggle between radians and degrees
function toggleRadDeg() {
  isDegree = !isDegree;
  radDegToggle.textContent = isDegree ? "DEG" : "RAD";
  updateRealtimeResult();
}

// Evaluate the expression safely with mathjs, converting trig inputs if needed
function evaluateExpression(expr) {
  try {
    // Replace π and e with Math constants
    expr = expr.replace(/π/g, "pi").replace(/e/g, "e");

    // mathjs syntax requires '^' for power
    // No changes needed here, mathjs handles ^

    // For trig functions, convert degree inputs to radians if isDegree is true
    if (isDegree) {
      expr = expr.replace(/(sin|cos|tan|asin|acos|atan)\(([^)]+)\)/g, (match, fn, val) => {
        return `${fn}((${val}) * pi / 180)`;
      });
    }
    expr = expr.replace(/√/g, "sqrt");


    return math.evaluate(expr);
  } catch {
    return null;
  }
}

let isResultShown = false;

// Calculate on "="
function calculate() {
  const expr = display.value;
  const result = evaluateExpression(expr);
  if (result !== null) {
    display.value = result;
    lastResult = result;
        isResultShown = true;

    justCalculated = true;
    realtimeResult.textContent = "";
    addToHistory(expr, result);
  } else {
    realtimeResult.textContent = "Invalid Expression";
  }
}


// Real-time result update on input
function updateRealtimeResult() {
  const expr = display.value;
  if (!expr) {
    realtimeResult.textContent = "";
    return;
  }
  const result = evaluateExpression(expr);
  realtimeResult.textContent = result !== null ? `= ${result}` : "";
}


// Clear result on typing new number
display.addEventListener("input", () => {
  if (isResultShown) {
    display.value = display.value.slice(-1); // keep only last character
    isResultShown = false;
  }
});


// Add expression + result to history
function addToHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 10) history.pop();
  renderHistory();
}

// Render history panel
function renderHistory() {
  if (!history.length) {
    historyPanel.innerHTML = "<em>No history yet.</em>";
    return;
  }
  historyPanel.innerHTML = history
    .map(
      (h, i) =>
        `<div class="history-entry" onclick="loadHistory(${i})">${h.expr} = ${h.result}</div>`
    )
    .join("");
}

// Load clicked history item back to display
function loadHistory(index) {
  const item = history[index];
  if (item) {
    display.value = item.expr;
    updateRealtimeResult();
    justCalculated = false;
  }
}

display.addEventListener("input", () => {
  if (justCalculated) {
    display.value = display.value.slice(-1); // Keep only last typed char
    justCalculated = false;
  }
  updateRealtimeResult();
});


// Initialize
updateRealtimeResult();


const toggle = document.getElementById("keyboardToggle");
const toast = document.getElementById("toast");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    display.removeAttribute("readonly");
    showToast("Typing enabled");
  } else {
    display.setAttribute("readonly", true);
    showToast("Typing disabled");
    display.blur();
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2000);
}

const backspaceBtn = document.getElementById("backspaceBtn");

// Backspace button click
backspaceBtn.addEventListener("click", () => {
  display.value = display.value.slice(0, -1);
});

// Enable keyboard events if toggle is on
document.addEventListener("keydown", (e) => {
  if (toggle.checked) {
    if (e.key === "Backspace") {
      display.value = display.value.slice(0, -1);
      e.preventDefault();
    } else if (e.key === "Enter") {
      calculate();
      e.preventDefault();
    }
  }
});
