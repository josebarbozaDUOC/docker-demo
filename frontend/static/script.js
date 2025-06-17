// URL base del backend
const API_URL = 'http://localhost:8000';

// Cargar tasks al iniciar
window.onload = () => {
    loadTasks();
};

// Cargar todas las tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <span>${task.title}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
            `;
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error cargando tasks:', error);
    }
}

// Agregar nueva task
async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    
    if (!title) {
        alert('Por favor ingresa una tarea');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (response.ok) {
            input.value = '';
            loadTasks();
        }
    } catch (error) {
        console.error('Error agregando task:', error);
    }
}

// Eliminar task
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error eliminando task:', error);
    }
}

// Permitir agregar con Enter
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});