let projectData = JSON.parse(localStorage.getItem('myProjectLists')) || { "Project 1": [] };
let activeProject = localStorage.getItem('activeProjectKey') || "Project 1";
let sortAscending = true;
let editingId = null;

window.onload = () => { renderTabs(); renderTasks(); };

function createNewProject() {
    const name = prompt("Enter project name:");
    if (name && !projectData[name]) {
        projectData[name] = []; activeProject = name; saveAndRefresh();
    }
}

function renameProject() {
    const newName = prompt("Rename to:", activeProject);
    if (newName && newName !== activeProject && !projectData[newName]) {
        projectData[newName] = projectData[activeProject];
        delete projectData[activeProject];
        activeProject = newName; saveAndRefresh();
    }
}

function renderTabs() {
    const container = document.getElementById('projectTabs');
    const projectSearchInput = document.getElementById('projectSearch');
    const projectQuery = projectSearchInput ? projectSearchInput.value.toLowerCase() : "";

    container.innerHTML = '';

    Object.keys(projectData).forEach(name => {
        if (projectQuery && !name.toLowerCase().includes(projectQuery)) return;
        const btn = document.createElement('button');
        btn.className = `tab-btn ${name === activeProject ? 'active' : ''}`;
        btn.innerHTML = `${name} <span class="count-badge">${projectData[name].length}</span>`;
        btn.onclick = () => {
            activeProject = name;
            localStorage.setItem('activeProjectKey', name);
            editingId = null; // Reset editing when switching tabs
            renderTabs();
            renderTasks();
        };
        container.appendChild(btn);
    });
    document.getElementById('activeProjectTitle').innerText = activeProject;
}

function addTask() {
    const name = document.getElementById('taskInput').value;
    const prio = document.getElementById('priorityInput').value;
    const date = document.getElementById('dateInput').value;
    const category = document.getElementById('categoryInput').value;

    if (!name || !prio) return alert("Fill in Name and Priority!");

    projectData[activeProject].push({
        id: Date.now(),
        name,
        category: category,
        priority: parseInt(prio),
        date: date || "No Date",
        completed: false
    });
    document.getElementById('taskInput').value = '';
    saveAndRefresh();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    const catFilt = document.getElementById('catFilter').value;
    const dateFilt = document.getElementById('dateFilter').value;
    const statusFilt = document.getElementById('statusFilter').value;
    const taskQuery = document.getElementById('taskSearch').value.toLowerCase();
    list.innerHTML = '';

    let tasks = projectData[activeProject] || [];
    tasks.sort((a, b) => sortAscending ? a.priority - b.priority : b.priority - a.priority);

    let visibleCount = 0;
    tasks.forEach(task => {
        const matchesCat = (catFilt === 'all' || task.category === catFilt);
        const matchesSearch = (task.name.toLowerCase().includes(taskQuery));
        const matchesDate = (!dateFilt || task.date === dateFilt);
        const matchesStatus = (statusFilt === 'all' ||
            (statusFilt === 'completed' && task.completed) ||
            (statusFilt === 'pending' && !task.completed));

        if (matchesCat && matchesSearch && matchesDate && matchesStatus) {
            visibleCount++;
            const row = document.createElement('tr');
            if (task.completed) row.classList.add('completed');

            if (editingId === task.id) {
                row.innerHTML = `
                    <td>-</td>
                    <td><input type="text" id="editName-${task.id}" value="${task.name}" class="edit-mode-input"></td>
                    <td><select id="editCat-${task.id}" class="edit-mode-input">
                        <option value="Urgent" ${task.category === 'Urgent' ? 'selected' : ''}>Urgent</option>
                        <option value="Monthly" ${task.category === 'Monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="Coding" ${task.category === 'Coding' ? 'selected' : ''}>Coding</option>
                        <option value="Long Term" ${task.category === 'Long Term' ? 'selected' : ''}>Long Term</option>
                        <option value="Daily Schedule" ${task.category === 'Daily Schedule' ? 'selected' : ''}>Daily Schedule</option>
                    </select></td>
                    <td><input type="date" id="editDate-${task.id}" value="${task.date}" class="edit-mode-input"></td>
                    <td><input type="number" id="editPrio-${task.id}" value="${task.priority}" class="edit-mode-input"></td>
                    <td><button onclick="saveEdit(${task.id})" class="save-btn">Save</button></td>
                `;
            } else {
                row.innerHTML = `
                    <td><input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})"></td>
                    <td>${task.name}</td>
                    <td>${task.category}</td>
                    <td class="date-text">${task.date}</td>
                    <td><span class="priority-badge">${task.priority}</span></td>
                    <td><div class="action-btns">
                        <button onclick="editingId=${task.id}; renderTasks();" class="edit-btn">Edit</button>
                        <button onclick="deleteTask(${task.id})" class="del-btn">Delete</button>
                    </div></td>
                `;
            }
            list.appendChild(row);
        }
    });
    if (visibleCount === 0) list.innerHTML = '<tr><td colspan="6" class="empty-msg">No matching tasks found.</td></tr>';
}

function saveEdit(id) {
    const task = projectData[activeProject].find(t => t.id === id);
    task.name = document.getElementById(`editName-${id}`).value;
    task.category = document.getElementById(`editCat-${id}`).value;
    task.date = document.getElementById(`editDate-${id}`).value;
    task.priority = parseInt(document.getElementById(`editPrio-${id}`).value);
    editingId = null;
    saveAndRefresh();
}

function toggleTask(id) {
    const task = projectData[activeProject].find(t => t.id === id);
    task.completed = !task.completed;
    saveAndRefresh();
}

function deleteTask(id) {
    if (confirm("Delete this task?")) {
        projectData[activeProject] = projectData[activeProject].filter(t => t.id !== id);
        saveAndRefresh();
    }
}

function toggleSort() {
    sortAscending = !sortAscending;
    const icon = document.getElementById('sortIcon');
    if (icon) icon.innerText = sortAscending ? '↑' : '↓';
    renderTasks();
}

function clearCompleted() {
    if (confirm("Clear all completed tasks?")) {
        projectData[activeProject] = projectData[activeProject].filter(t => !t.completed);
        saveAndRefresh();
    }
}

function deleteProject() {
    if (confirm(`Delete entire project "${activeProject}"?`)) {
        delete projectData[activeProject];
        activeProject = Object.keys(projectData)[0] || "Project 1";
        if (!projectData[activeProject]) projectData["Project 1"] = [];
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('myProjectLists', JSON.stringify(projectData));
    localStorage.setItem('activeProjectKey', activeProject);
    renderTabs();
    renderTasks();
}