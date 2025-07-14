# docker-demo

Proyecto de aprendizaje Docker con arquitectura multi-container.
- Código comentado como referencia futura. `Dockerfile`, `docker-compose.yml`
- Se agregan ejemplos útiles para comprender cada parte del flujo. `examples/`
- Un solo comando levanta toda la aplicación.

**Servicios del proyecto:**
- **backend**: API REST (FastAPI, SQLAlchemy, SQLite)
- **frontend**: Web App simple de notas adhesivas (HTML/CSS/JS, Bootstrap + Animate)
- **database**: SQLite embebido (persistencia local en archivo `.db`)


## 🚀 Inicio Rápido
```
# Clonar el proyecto
git clone https://github.com/josebarbozaDUOC/docker-demo.git
cd docker-demo

# Levantar la aplicación
docker-compose up

# Acceder a:
# - Frontend: http://localhost:3000
# - API Docs: http://localhost:8000/docs
```

## Capturas

- Frontend
![image](https://github.com/user-attachments/assets/1c065d93-0603-41d3-b4cb-22af576d983b)

- docker-compose up
![image](https://github.com/user-attachments/assets/8245b5bb-86a8-4d2f-8a3f-07dc621fe587)


## Estructura:
```
docker-demo/
├── docker-compose.yml          # Gestor multi container (back + front + db)
├── .gitignore
├── README.md
│ 
├── backend/
│   ├── Dockerfile              # Contenedor Backend en multicapas
│   ├── requirements.txt        # Dependencias
│   ├── .env                    # Variables entorno
│   └── app/
│       ├── __init__.py
│       ├── main.py             # FastAPI, model, routes
│       ├── config.py           # Define DB
│       └── database.py         # SQLAlchemy
│ 
├── frontend/
│   ├── Dockerfile              # Contenedor Frontend nginx
│   └── static/
│       ├── index.html
│       ├── style.css
│       └── script.js
│ 
├── database/
│   └── sticky_notes.db
│ 
└── examples/
    ├── Docker-Compose.txt
    ├── Dockerfile-Backend.txt
    └── Dockerfile-Frontend.txt
```

## Decisiones arquitectónicas

### ¿Por qué separar frontend y backend?
- **Escalabilidad**: Cada servicio puede escalar independientemente
- **Mantenibilidad**: Equipos pueden trabajar en paralelo sin conflictos
- **Flexibilidad**: Puedes cambiar tecnologías sin afectar otros servicios
- **Despliegue**: Actualizar el frontend no requiere tocar el backend

### ¿Por qué Docker Compose?
- **Simplicidad**: Un comando levanta toda la aplicación
- **Consistencia**: El mismo ambiente en desarrollo y producción
- **Networking**: Los contenedores se comunican automáticamente
- **Orden**: Define dependencias entre servicios

## Docker

## Requisitos
- Docker Desktop instalado
- Puertos 3000 y 8000 disponibles

### Consideraciones:
- Puertos para: 
    - Backend/APIs: `8000, 8080, 5000`
    - Frontend: `3000, 3001, 80`
    - Nota: Puerto 80 es el estándar web, pero requiere permisos admin
- Usar el sistema de multi capas eficientemente:
    - Usar COPY para las dependencias, instalarlas
    - Luego otro COPY para el proyecto
    - Así, si se modifica el proyecto, docker no vuelve a reconstruir las dependecias


## Ejecutar Docker Compose
```
# En la raíz del proyecto (donde está docker-compose.yml)

# Construir y levantar todo
docker-compose up

# En segundo plano
docker-compose up -d

# Ver logs
docker-compose logs

# Detener todo
docker-compose down

# Reconstruir (al modificar proyecto)
docker-compose up --build
```

## Ejecutar Dockerfile (docker por módulo independientemente)
### Ejecutar backend:
```
# 1. Navegar a la carpeta del backend (donde está el Dockerfile)
cd docker-demo/backend/

# 2. Construir la imagen
docker build -t docker-demo-backend .
# -t: tag/nombre de la imagen
# . : contexto de build (carpeta actual)

# 3. Ejecutar el contenedor
docker run -p 8000:8000 docker-demo-backend
# -p 8000:8000: mapea puerto_host:puerto_contenedor
```

### Ejecutar frontend:
```
# Navegar a la carpeta frontend
cd docker-demo/frontend/

# Construir imagen
docker build -t docker-demo-frontend .

# Ejecutar contenedor
docker run -p 3000:80 docker-demo-frontend
```

### Otros comandos docker:
```
# Ejecutar en modo detached (segundo plano)
docker run -d -p 8000:8000 docker-demo-backend

# Ver logs
docker logs <container_id>

# Listar contenedores activos
docker ps

# Detener contenedor
docker stop <container_id>

# Ejecutar con auto-reload (desarrollo)
docker run -p 8000:8000 -v $(pwd)/app:/app/app docker-demo-backend
# -v: monta tu código local para ver cambios en tiempo real
```

## Acceder a la aplicación:
- **Frontend (UI)**: http://localhost:3000
- **Backend (API)**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## Próximos pasos
- ✔ Dockerizar servicios individuales
- ✔ Implementar Docker Compose
- ✔ Agregar examples
- ✔ Migrar modelo Task → StickyNote
- ✔ Rediseñar frontend con grid de notas adhesivas
- ✔ Agregar persistencia con SQLite
- ✔ Implementar variables de entorno con .env
- ✔ Deploy (acceso por IP desde otro dispositivo en la misma red)
- X PostgreSQL (docker-compose)
- X Redis (cache/sessions)
