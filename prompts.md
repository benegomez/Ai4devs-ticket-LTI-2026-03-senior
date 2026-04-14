# Prompts — AddNewCandidate Feature

Registro de los prompts utilizados para desarrollar la funcionalidad **Add New Candidate** del ATS, desde la definición de comandos reutilizables hasta la corrección de bugs en producción.

---

## 1. Creación de Comandos Reutilizables

Estos prompts generaron los archivos en `.augment/commands/` que automatizan el flujo de desarrollo.

### `enrich-us`
```
create a command called enrich-us that acts as a product expert,
reads a user story from UserStories/, evaluates its completeness,
and produces an enriched implementation-ready version appended
to the same file under an [enhanced] section.
```
> Resultado: `.augment/commands/enrich-us.md`

### `create-tickets`
```
create a command called create-tickets that splits an enriched user story
into three standalone implementation tickets (database, backend, frontend)
and saves each as ticket.md inside UserStories/<story>/Tickets/<layer>/.
```
> Resultado: `.augment/commands/create-tickets.md`

### `create-plan`
```
create a command called create-plan that reads a ticket.md and generates
a detailed checkable development plan (plan.md) with phases and - [ ] tasks.
It must accept an optional layer filter: database | backend | frontend.
```
> Resultado: `.augment/commands/create-plan.md`

### `develop-plan`
```
create a new command develop-plan.md. As a developer it will use the plan.md
file and develop it based on the corresponding rules (backend, frontend, etc).
The command will receive the user story and the layer (backend, frontend, database)
and it will develop and follow the corresponding plan.md.
```
> Resultado: `.augment/commands/develop-plan.md`

---

## 2. Preparación de la Historia de Usuario

### Enriquecer la historia
```
/enrich-us AddNewCandidate
```
> Añadió la sección `[enhanced]` en `UserStories/AddNewCandidate/` con campos,
> endpoint, validaciones y criterios de aceptación detallados.

### Crear los tickets por capa
```
/create-tickets AddNewCandidate
```
> Generó `ticket.md` en `Tickets/DataBase/`, `Tickets/BackEnd/` y `Tickets/FrontEnd/`.

### Crear los planes de desarrollo
```
/create-plan AddNewCandidate
```
> Generó `plan.md` con fases y tareas `- [ ]` para cada capa.

---

## 3. Implementación por Capas

### Capa de Base de Datos
```
/develop-plan AddNewCandidate database
Do not create the new git branch, work in the current branch.
```
> Añadió los modelos `Candidate`, `Education` y `WorkExperience` en
> `backend/prisma/schema.prisma` y completó los 23 tasks del plan.

### Capa de Backend
```
/develop-plan AddNewCandidate backend
Do not create a new branch, work on the current branch.
```
> Implementó la arquitectura DDD completa: entidades de dominio, repositorio,
> servicio `addCandidate()`, validador, middleware multer, controlador y ruta
> `POST /candidates`. 12/12 tests pasando.

### Capa de Frontend
```
/develop-plan AddNewCandidate frontend
Do not create the new branch, work on the current branch.
```
> Creó `candidateService.ts`, `AddCandidateForm.tsx` con validación y campos
> dinámicos, routing en `App.tsx` con react-router-dom v7, y configuración
> de Jest para el entorno jsdom. 13/13 tests pasando.

---

## 4. Corrección de Bugs Post-Implementación

### Estilos no cargaban / Error al agregar candidato
```
Please review the frontend, the style is not loading.
And when trying to add a candidate, I see the following error.
[screenshot adjunto]
```
> Diagnóstico: 4 bugs simultáneos —
> (1) puerto incorrecto en `candidateService.ts` (4010 → 3010),
> (2) estructura del objeto de error mal leída (`err` vs `err.error`),
> (3) middleware CORS faltante en el backend,
> (4) componente sin hoja de estilos CSS.

### Error persistente tras los fixes
```
Still can not add the new candidate.
[screenshot adjunto]
```
> Diagnóstico: directorio `uploads/cvs` inexistente causaba crash en multer.
> Fix: `fs.mkdirSync(UPLOAD_DIR, { recursive: true })` al iniciar el módulo.

### Error persistente tras reinicio del servidor
```
Seguimos igual, ¿podrías revisar bien?
[screenshot adjunto]
```
> Causa raíz encontrada: archivo `frontend/.env` tenía
> `REACT_APP_API_BASE_URL=http://localhost:4010` que sobreescribía
> el default en el código. Fix: cambiar el valor a `http://localhost:3010`
> y reiniciar el servidor de desarrollo.
