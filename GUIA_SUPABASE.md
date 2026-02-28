# Guía de Configuración de Supabase 🚀

Para que tu aplicación funcione con datos reales, sigue estos pasos:

### 1. Crear el Proyecto
1. Ve a [Supabase](https://supabase.com/) e inicia sesión.
2. Haz clic en **"New Project"**.
3. Elige un nombre (ej. "Gymmart Asistencia") y una contraseña para la base de datos.
4. Selecciona la región más cercana (ej. Brazil).

### 2. Obtener las Llaves de Conexión
1. Una vez creado el proyecto, ve a la sección **Project Settings** (el icono de engranaje ⚙️ abajo a la izquierda).
2. Haz clic en **API**.
3. Copia la **Project URL**.
4. Copia la **API Key** (la que dice `anon` y `public`).

### 3. Configurar la App
1. Abre el archivo `app.js` en VS Code (o en Antigravity).
2. En las líneas 2 y 3, reemplaza los valores:
   ```javascript
   const SUPABASE_URL = 'TU_URL_AQUÍ';
   const SUPABASE_KEY = 'TU_LLAVE_ANON_AQUÍ';
   ```

### 4. Crear las Tablas (SQL Editor)
Ve a la sección **SQL Editor** (icono `>_` a la izquierda) y pega este código:

```sql
create table if not exists cursos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  seccion text,
  grado integer,
  ciclo text,
  turno text default 'Mañana'
);

-- 2. Tabla de Alumnos
create table if not exists alumnos (
  id uuid primary key default uuid_generate_v4(),
  curso_id uuid references cursos(id),
  nombre text not null,
  apellido text not null,
  documento text unique
);

-- 3. Tabla de Asistencias
create table if not exists asistencias (
  id uuid primary key default uuid_generate_v4(),
  alumno_id uuid references alumnos(id),
  fecha date default current_date,
  estado text check (estado in ('P', 'A', 'J')),
  motivo text
);


### 5. Crear tu Usuario de Director
Para poder entrar a la app, necesitas un usuario:
1. En Supabase, ve a la sección **Authentication** (icono de candado 🔐).
2. Haz clic en **"Add User"** -> **"Create new user"**.
3. Ingresa un correo y una contraseña (destilda la opción "Send invite email" para que sea instantáneo).
4. ¡Listo! Ya puedes usar ese correo y contraseña en tu app Gymmart.

### 6. IMPORTANTE: Desactivar Confirmación de Email 📧
Si las invitaciones no llegan o no puedes entrar, es porque Supabase está esperando que confirmes el correo. Haz esto para que sea instantáneo:
1. En tu panel de Supabase, ve a **Authentication** (icono de candado 🔐).
2. Entra en la pestaña **Providers**.
3. Haz clic en **Email**.
4. **DESACTIVA** la opción que dice **"Confirm email"**.
5. Haz clic en **Save** (Guardar).

¡Ahora ya podrás entrar a la app con cualquier usuario que crees sin necesidad de revisar el correo!
