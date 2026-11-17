
// ======================================
// TASKFLOW - PRODUCTIVITY TASK MANAGER
// ======================================

// DOM ELEMENTS
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const dueDateInput = document.getElementById("dueDate");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const themeToggle = document.getElementById("themeToggle");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTaskInput = document.getElementById("editTaskInput");
const editCategory = document.getElementById("editCategory");
const editDueDate = document.getElementById("editDueDate");
const closeModal = document.getElementById("closeModal");

// ======================================
// APPLICATION STATE
// ======================================

let tasks = loadFromLocalStorage();

let currentFilter = "all";
let currentCategory = null;
let editingTaskId = null;
let draggedTaskId = null;

// ======================================
// LOCAL STORAGE
// ======================================

function saveToLocalStorage() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

function loadFromLocalStorage() {
    try {
        const savedTasks = localStorage.getItem("taskflow_tasks");

        if (!savedTasks) return [];

        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks)
            ? parsedTasks.filter(task =>
                task &&
                typeof task.id === "string" &&
                typeof task.title === "string" &&
                typeof task.completed === "boolean" &&
                ["Work", "Personal", "Study"].includes(task.category)
            )
            : [];
    } catch (error) {
        console.error("Unable to load tasks:", error);
        return [];
    }
}

// ======================================
// CREATE TASK
// ======================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        alert("Please enter a task name!");
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        title: title,
        category: categorySelect.value,
        dueDate: dueDateInput.value,
        completed: false,
        createdAt: Date.now()
    };

    tasks.unshift(newTask);

    saveToLocalStorage();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
});

// ======================================
// READ AND DISPLAY TASKS
// ======================================

function renderTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesCategory =
            !currentCategory ||
            task.category === currentCategory;

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        return matchesFilter && matchesCategory && matchesSearch;
    });

    filteredTasks.forEach(task => {
        const card = document.createElement("article");

        card.className = "task-card";
        card.dataset.id = task.id;
        card.draggable = true;

        if (task.completed) {
            card.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task complete");

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Task information
        const info = document.createElement("div");
        info.className = "task-info";

        const heading = document.createElement("h3");
        heading.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const category = document.createElement("span");
        category.className = `task-category ${task.category}`;
        category.textContent = task.category;

        meta.appendChild(category);

        if (task.dueDate) {
            const date = document.createElement("span");
            date.className = "task-date";
            date.textContent = "📅 " + formatDate(task.dueDate);

            meta.appendChild(date);
        }

        info.appendChild(heading);
        info.appendChild(meta);

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "task-action";
        editButton.type = "button";
        editButton.textContent = "✏️";
        editButton.title = "Edit task";
        editButton.setAttribute("aria-label", "Edit task");

        editButton.addEventListener("click", () => {
            openEditModal(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "task-action delete";
        deleteButton.type = "button";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        card.appendChild(checkbox);
        card.appendChild(info);
        card.appendChild(actions);

        // Drag and drop
        card.addEventListener("dragstart", () => {
            draggedTaskId = task.id;
            card.style.opacity = "0.4";
        });

        card.addEventListener("dragend", () => {
            draggedTaskId = null;
            card.style.opacity = "1";
        });

        card.addEventListener("dragover", event => {
            event.preventDefault();
        });

        card.addEventListener("drop", event => {
            event.preventDefault();
            reorderTasks(task.id);
        });

        taskList.appendChild(card);
    });

    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    if (filteredTasks.length === 0) {
        const heading = emptyState.querySelector("h3");
        const message = emptyState.querySelector("p");

        if (tasks.length === 0) {
            heading.textContent = "No tasks yet!";
            message.textContent =
                "Add your first task and start being productive.";
        } else {
            heading.textContent = "No matching tasks!";
            message.textContent =
                "Try changing your filters or search.";
        }
    }

    updateStatistics();
}

// ======================================
// DATE FORMATTING
// ======================================

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// ======================================
// UPDATE TASK
// ======================================

function openEditModal(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    editingTaskId = id;

    editTaskInput.value = task.title;
    editCategory.value = task.category;
    editDueDate.value = task.dueDate || "";

    editModal.classList.remove("hidden");
    editTaskInput.focus();
}

editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const task = tasks.find(item => item.id === editingTaskId);

    if (!task) return;

    const newTitle = editTaskInput.value.trim();

    if (!newTitle) {
        alert("Task name cannot be empty!");
        return;
    }

    task.title = newTitle;
    task.category = editCategory.value;
    task.dueDate = editDueDate.value;

    saveToLocalStorage();
    renderTasks();
    closeEditModal();
});

// ======================================
// CLOSE EDIT MODAL
// ======================================

function closeEditModal() {
    editModal.classList.add("hidden");
    editingTaskId = null;
}

closeModal.addEventListener("click", closeEditModal);

editModal.addEventListener("click", function (event) {
    if (event.target === editModal) {
        closeEditModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeEditModal();
    }
});

// ======================================
// DELETE TASK
// ======================================

function deleteTask(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveToLocalStorage();
    renderTasks();
}

// ======================================
// COMPLETE TASK
// ======================================

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveToLocalStorage();
    renderTasks();
}

// ======================================
// FILTER TASKS
// ======================================

function setFilter(filter) {
    currentFilter = filter;
    currentCategory = null;

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    document.querySelectorAll(".category-item").forEach(button => {
        button.classList.remove("active");
    });

    renderTasks();
}

// Sidebar filters
document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        setFilter(button.dataset.filter);
    });
});

// Main filter tabs
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        setFilter(button.dataset.filter);
    });
});

// Category filters
document.querySelectorAll(".category-item").forEach(button => {
    button.addEventListener("click", () => {

        currentCategory = button.dataset.category;

        document.querySelectorAll(".category-item").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        document.querySelectorAll(".nav-item, .filter-btn").forEach(item => {
            item.classList.remove("active");
        });

        renderTasks();
    });
});

// ======================================
// SEARCH TASKS
// ======================================

searchInput.addEventListener("input", renderTasks);

// ======================================
// TASK STATISTICS
// ======================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// ======================================
// DRAG AND DROP REORDERING
// ======================================

function reorderTasks(targetId) {
    if (!draggedTaskId || draggedTaskId === targetId) return;

    // Reorder only when viewing the complete unsearched task list.
    if (
        currentFilter !== "all" ||
        currentCategory ||
        searchInput.value.trim()
    ) {
        return;
    }

    const oldIndex = tasks.findIndex(
        task => task.id === draggedTaskId
    );

    const newIndex = tasks.findIndex(
        task => task.id === targetId
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const [movedTask] = tasks.splice(oldIndex, 1);

    tasks.splice(newIndex, 0, movedTask);

    saveToLocalStorage();
    renderTasks();
}

// ======================================
// DARK AND LIGHT THEME
// ======================================

function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");

    themeToggle.textContent =
        theme === "dark" ? "🌙" : "☀️";

    localStorage.setItem("taskflow_theme", theme);
}

themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark");

    applyTheme(isDark ? "light" : "dark");
});

// Load saved theme
const savedTheme = localStorage.getItem("taskflow_theme") || "light";

applyTheme(savedTheme);

// ======================================
// CURRENT YEAR
// ======================================

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

// ======================================
// INITIALIZE APPLICATION
// ======================================

renderTasks();

console.log("TaskFlow application loaded successfully!");
