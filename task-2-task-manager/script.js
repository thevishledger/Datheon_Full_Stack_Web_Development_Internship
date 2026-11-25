"use strict";

/* ============================================================
   Task Manager — full CRUD with localStorage persistence.
   A task looks like:
   { id, title, category: "Work"|"Personal"|"Study",
     dueDate: "2026-11-30" | "", completed: true|false }
   ============================================================ */

const STORAGE_KEY = "task-manager-tasks";

/* ---------- State ---------- */
let tasks = loadTasks();
let statusFilter = "All";    // All | Active | Completed
let categoryFilter = "All";  // All | Work | Personal | Study
let editingId = null;        // id of the task being edited, or null when adding

/* ---------- DOM references ---------- */
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const categoryInput = document.getElementById("taskCategory");
const dueDateInput = document.getElementById("taskDueDate");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyText = document.getElementById("emptyText");
const taskCount = document.getElementById("taskCount");
const categoryFilterSelect = document.getElementById("categoryFilter");

/* ---------- Storage helpers ---------- */
function loadTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Only trust the saved data if it really is an array of tasks.
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // corrupted data should never break the app
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage full/blocked — the app still works until the page closes.
  }
}

/* ---------- Date helpers ---------- */
// Today's date as "YYYY-MM-DD" in local time, for overdue checks.
function todayString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// "2026-11-30" -> "30 Nov 2026" for display.
function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(task) {
  return !task.completed && task.dueDate && task.dueDate < todayString();
}

/* ---------- CRUD operations ---------- */
function addTask(title, category, dueDate) {
  tasks.unshift({
    // Timestamp + random suffix: two tasks added in the same
    // millisecond can never share an id.
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    category,
    dueDate,
    completed: false,
  });
  saveTasks();
  render();
}

function updateTask(id, title, category, dueDate) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.title = title;
  task.category = category;
  task.dueDate = dueDate;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  if (editingId === id) cancelEdit();
  saveTasks();
  render();
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

/* ---------- Edit mode ---------- */
function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingId = id;
  titleInput.value = task.title;
  categoryInput.value = task.category;
  dueDateInput.value = task.dueDate;
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.hidden = false;
  formError.hidden = true;
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingId = null;
  form.reset();
  submitBtn.textContent = "Add Task";
  cancelEditBtn.hidden = true;
  formError.hidden = true;
}

cancelEditBtn.addEventListener("click", cancelEdit);

/* ---------- Form submit (add or update) ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    formError.textContent = "Please enter a task title.";
    formError.hidden = false;
    titleInput.focus();
    return;
  }
  formError.hidden = true;

  if (editingId) {
    updateTask(editingId, title, categoryInput.value, dueDateInput.value);
    cancelEdit();
  } else {
    addTask(title, categoryInput.value, dueDateInput.value);
    form.reset();
    titleInput.focus();
  }
});

/* ---------- Filters ---------- */
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    statusFilter = btn.dataset.status;
    render();
  });
});

categoryFilterSelect.addEventListener("change", () => {
  categoryFilter = categoryFilterSelect.value;
  render();
});

function getVisibleTasks() {
  return tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && !task.completed) ||
      (statusFilter === "Completed" && task.completed);
    const matchesCategory = categoryFilter === "All" || task.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });
}

/* ---------- Rendering ---------- */
// Escape user text before putting it into HTML (basic safety habit).
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  const visible = getVisibleTasks();

  taskList.innerHTML = visible
    .map((task) => {
      const classes = [
        "task-item",
        `cat-${task.category}`,
        task.completed ? "completed" : "",
        isOverdue(task) ? "overdue" : "",
      ].join(" ");

      const dueHtml = task.dueDate
        ? `<span class="due-date">📅 ${formatDate(task.dueDate)}${isOverdue(task) ? " • Overdue!" : ""}</span>`
        : `<span class="due-date">📅 No due date</span>`;

      return `
      <li class="${classes}">
        <input type="checkbox" class="task-check" data-action="toggle" data-id="${task.id}"
               ${task.completed ? "checked" : ""} aria-label="Mark task complete" />
        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="badge">${task.category}</span>
            ${dueHtml}
          </div>
        </div>
        <div class="task-actions">
          <button type="button" class="icon-action" data-action="edit" data-id="${task.id}" title="Edit task" aria-label="Edit task">✏️</button>
          <button type="button" class="icon-action delete" data-action="delete" data-id="${task.id}" title="Delete task" aria-label="Delete task">🗑️</button>
        </div>
      </li>`;
    })
    .join("");

  // Empty state: different message when filters hide everything vs. no tasks at all.
  if (visible.length === 0) {
    emptyState.hidden = false;
    emptyText.textContent =
      tasks.length === 0
        ? "No tasks here yet. Add your first task above!"
        : "No tasks match the current filters. Try a different filter!";
  } else {
    emptyState.hidden = true;
  }

  const activeCount = tasks.filter((t) => !t.completed).length;
  taskCount.textContent =
    tasks.length === 0
      ? ""
      : `${visible.length} shown • ${activeCount} active • ${tasks.length - activeCount} completed`;
}

/* One delegated listener handles checkbox + edit + delete for every task row. */
taskList.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const { action, id } = el.dataset;
  if (action === "edit") startEdit(id);
  if (action === "delete") deleteTask(id);
});

taskList.addEventListener("change", (e) => {
  const el = e.target.closest('[data-action="toggle"]');
  if (el) toggleComplete(el.dataset.id);
});

/* ---------- First paint ---------- */
render();
