// script.js - Ajustado para Bootstrap

// Configuración de la API
const API_URL = `http://${window.location.hostname}:8000`;

// Estado de la aplicación
let notes = [];
let currentFilter = 'all';

// Elementos del DOM
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const notesBoard = document.getElementById('notes-board');
const emptyState = document.getElementById('empty-state');
const noteCount = document.getElementById('note-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
const noteTemplate = document.getElementById('note-template');

// Event Listeners principales
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
});

function setupEventListeners() {
    // Botón agregar nota
    addNoteBtn.addEventListener('click', createNote);
    
    // Enter en el textarea
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createNote();
        }
    });
    
    // Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos
            filterButtons.forEach(b => b.classList.remove('active', 'btn-primary'));
            filterButtons.forEach(b => b.classList.add('btn-outline-secondary'));
            
            // Agregar active al actual
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('active', 'btn-primary');
            
            currentFilter = btn.dataset.filter;
            renderNotes();
        });
    });
}

// Funciones principales (sin cambios hasta createNote)
async function loadNotes() {
    try {
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) throw new Error('Error al cargar notas');
        
        notes = await response.json();
        renderNotes();
        updateNoteCount();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar las notas', 'error');
    }
}

async function createNote() {
    const content = noteInput.value.trim();
    if (!content) {
        shakeElement(noteInput);
        return;
    }
    
    const selectedColor = document.querySelector('input[name="color"]:checked').value;
    
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                color: selectedColor,
                position: getRandomPosition()
            })
        });
        
        if (!response.ok) throw new Error('Error al crear nota');
        
        const newNote = await response.json();
        notes.unshift(newNote);
        
        // Limpiar input y reset color
        noteInput.value = '';
        document.getElementById('yellow').checked = true;
        
        renderNotes();
        updateNoteCount();
        showNotification('Nota creada ✓', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al crear la nota', 'error');
    }
}

async function updateNote(noteId, updates) {
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) throw new Error('Error al actualizar nota');
        
        const updatedNote = await response.json();
        
        // Actualizar en el array local
        const index = notes.findIndex(n => n.id === noteId);
        if (index !== -1) {
            notes[index] = updatedNote;
        }
        
        return updatedNote;
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al actualizar la nota', 'error');
    }
}

async function deleteNote(noteId) {
    // Animar antes de eliminar
    const noteElement = document.querySelector(`[data-id="${noteId}"]`);
    if (noteElement) {
        noteElement.classList.add('animate__animated', 'animate__zoomOut');
        
        // Esperar a que termine la animación
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar nota');
        
        notes = notes.filter(note => note.id !== noteId);
        renderNotes();
        updateNoteCount();
        showNotification('Nota eliminada', 'info');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar la nota', 'error');
    }
}

// Renderizado
function renderNotes() {
    // Filtrar notas
    const filteredNotes = currentFilter === 'all' 
        ? notes 
        : notes.filter(note => note.color === currentFilter);
    
    // Limpiar tablero
    notesBoard.innerHTML = '';
    
    // Mostrar estado vacío o notas
    if (filteredNotes.length === 0) {
        emptyState.classList.remove('d-none');
        notesBoard.classList.add('d-none');
    } else {
        emptyState.classList.add('d-none');
        notesBoard.classList.remove('d-none');
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesBoard.appendChild(noteElement);
        });
    }
}

function createNoteElement(note) {
    // Clonar template
    const noteClone = noteTemplate.content.cloneNode(true);
    const noteDiv = noteClone.querySelector('.sticky-note');
    
    // Configurar nota
    noteDiv.dataset.id = note.id;
    noteDiv.classList.add(note.color, 'card', 'border-0', 'shadow-sm', 'animate__animated', 'animate__fadeIn');
    
    // Contenido
    const content = noteDiv.querySelector('.note-content');
    content.textContent = note.content;
    
    // Fecha
    const dateElement = noteDiv.querySelector('.note-date');
    dateElement.textContent = formatDate(note.created_at);
    
    // Botón eliminar
    const deleteBtn = noteDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => showDeleteModal(note.id));
    
    // Edición inline
    content.addEventListener('blur', async () => {
        const newContent = content.textContent.trim();
        if (newContent !== note.content && newContent !== '') {
            await updateNote(note.id, { content: newContent });
        } else if (newContent === '') {
            content.textContent = note.content; // Restaurar si está vacío
        }
    });
    
    // Cambio de color - Adaptado para dropdown de Bootstrap
    const colorOptions = noteDiv.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', async (e) => {
            e.preventDefault();
            const newColor = option.dataset.color;
            
            // Cambiar color visualmente
            noteDiv.classList.remove('yellow', 'pink', 'blue', 'green', 'orange');
            noteDiv.classList.add(newColor);
            
            // Actualizar en backend
            await updateNote(note.id, { color: newColor });
            
            // Cerrar dropdown
            bootstrap.Dropdown.getInstance(noteDiv.querySelector('[data-bs-toggle="dropdown"]')).hide();
        });
    });
    
    return noteDiv;
}

// Utilidades
function updateNoteCount() {
    const count = notes.length;
    noteCount.textContent = `${count} ${count === 1 ? 'nota' : 'notas'}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Hace un momento';
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
        const days = Math.floor(diffInHours / 24);
        return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
}

function getRandomPosition() {
    // Para futura implementación de drag & drop
    return {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100)
    };
}

function showDeleteModal(noteId) {
    deleteModal.show();
    
    const confirmBtn = document.querySelector('.btn-confirm');
    confirmBtn.onclick = () => {
        deleteNote(noteId);
        deleteModal.hide();
    };
}

// Efectos UI
function shakeElement(element) {
    element.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => element.classList.remove('animate__animated', 'animate__shakeX'), 1000);
}

// Usar Toast de Bootstrap en lugar de custom
function showNotification(message, type = 'info') {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // Crear container si no existe
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Agregar toast
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remover del DOM después de ocultarse
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}