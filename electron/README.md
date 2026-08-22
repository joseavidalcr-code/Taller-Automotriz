# Empaquetado Windows autónomo

La versión final de escritorio se empaquetará como una aplicación Electron para que el usuario no tenga que instalar Docker, PostgreSQL ni Node.

Arquitectura objetivo:

- React/Vite como interfaz.
- API local embebida en el proceso de escritorio.
- SQLite como almacenamiento local.
- Datos en una carpeta de usuario, separada de los binarios.
- Instalador NSIS generado con electron-builder.

**Estado:** preparación. El servidor actual todavía utiliza PostgreSQL (`pg`), por lo que no se debe presentar este directorio como un instalador terminado. La conversión de la capa `server/db.js` y de las migraciones a SQLite debe completarse antes del primer `.exe` de producción.
