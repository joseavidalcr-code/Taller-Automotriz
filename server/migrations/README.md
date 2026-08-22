# Migraciones locales

Las migraciones se ejecutan en orden sobre PostgreSQL local. No ejecutar scripts destructivos automáticamente.

`001_local_first_core.sql` contiene el núcleo inicial. Las siguientes migraciones ampliarán el modelo del taller sin borrar datos existentes.

Antes de pasar a producción se validará el esquema contra Supabase y se añadirá una migración por cada bloque funcional.
