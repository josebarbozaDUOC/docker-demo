# docker-demo

Proyecto de aprendizaje Docker con arquitectura multi-container.

- **backend**: REST API (FastAPI)
- **frontend**: Web simple
- **database**: SQLite


## Estructura:
```
docker-demo/
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       └── main.py
├── frontend/
│   ├── Dockerfile
│   └── static/
│       ├── index.html
│       ├── style.css
│       └── script.js
└── database/
```

## Requisitos
- Docker Desktop instalado
- Puertos 3000 y 8000 disponibles

## Docker

### Consideraciones:
- Puertos para: 
    - Backend/APIs: `8000, 8080, 5000`
    - Frontend: `3000, 3001, 80`
- Usar el sistema de multi capas eficientemente:
    - Usar COPY para las dependencias, instalarlas
    - Luego otro COPY para el proyecto
    - Así, si se modifica el proyecto, docker no vuelve a reconstruir las dependecias

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