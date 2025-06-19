# Dockerfile para backend FastAPI
# Dockerfile overview: https://docs.docker.com/build/concepts/dockerfile/
# Multi-stage builds:  https://docs.docker.com/build/building/multi-stage/

# FROM especifica la imagen base para construir nuestro contenedor
# Imagen base - Python 3.11 (versión lts, más estable)
# Opciones: python:3.11 (1GB~), python:3.11-slim (300MB~), python:3.11-alpine (100MB~)
# slim es buen balance entre tamaño y compatibilidad
FROM python:3.13-slim

# WORKDIR establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# COPY copia archivos desde tu máquina al contenedor
# Copiar requirements primero (mejor cache de Docker)
# Si requirements no cambia, esta capa se reutiliza
COPY requirements.txt .

# RUN ejecuta comandos durante la construcción de la imagen
# Instalar dependencias de Python
# --no-cache-dir: no guardar cache de pip (menor tamaño de imagen)
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
# Desde ./app/ (local) hacia /app/app/ (contenedor)
COPY ./app ./app

# EXPOSE documenta qué puerto usa la aplicación dentro del contenedor
# NO abre el puerto - eso se hace con -p al ejecutar docker run
EXPOSE 8000

# CMD define el comando por defecto al iniciar el contenedor
# Comando para ejecutar la aplicación
# uvicorn busca main:app en el módulo app.main (módulo.archivo:instancia)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]