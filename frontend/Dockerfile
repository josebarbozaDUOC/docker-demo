# Usar nginx para servir archivos estáticos
FROM nginx:alpine

# Eliminar archivos default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar nuestros archivos estáticos
COPY static /usr/share/nginx/html

# Exponer puerto 80 (puerto default de nginx)
EXPOSE 80

# Nginx se ejecuta automáticamente