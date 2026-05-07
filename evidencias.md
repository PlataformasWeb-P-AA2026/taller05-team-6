
# Documentación del Proyecto: Integración de Datos Mundial 2026

Este proyecto realiza la extracción, transformación y carga (ETL) de datos de jugadores desde fuentes heterogéneas (HTML, CSV, PDF) hacia una base de datos **CouchDB**, con una interfaz visual desarrollada en **Vite**.

## 1. Requisitos Previos
* **Python 3.12+**
* **CouchDB** instalado y en ejecución.
* **Node.js** y **npm** (para el frontend).

## 2. Configuración del Entorno (Replicabilidad)
Para replicar este proyecto en una nueva computadora, sigue estos pasos:

### Paso 1: Clonar y crear Entorno Virtual
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd taller05-team-6

# Instalar el módulo de venv (Solo en Ubuntu/Debian si no existe)
sudo apt update && sudo apt install python3.12-venv -y

# Crear y activar el entorno virtual
python3 -m venv venv
source venv/bin/activate
```

### Paso 2: Instalar Dependencias
```bash
# Dependencias de Python (Procesamiento de datos)
pip install pandas lxml pdfplumber requests

# Dependencias de Frontend (Vite)
cd frontend
npm install
```

## 3. Procesamiento de Datos (ETL)
El script `data/run.py` unifica las fuentes en un archivo `mundial_2026.json` compatible con CouchDB.

### Fuentes integradas:
* **Europa:** Extraído de `fuente_html_europa.html`.
* **Sudamérica:** Extraído de `fuente_csv_sudamerica.csv` (manejo de encoding UTF-8/Latin-1).
* **Norteamérica/Asia:** Extraído de `fuente_pdf_norteamerica_asia.pdf`.

### Ejecución:
```bash
python data/run.py
```

## 4. Configuración de CouchDB
### Carga de Datos
Utiliza el script de carga masiva para subir el JSON a la base de datos `jugadores`:
```bash
python data/couche_inyection.py
```

### Creación de Vistas (Map Functions)
En la interfaz de Fauxton, crea un **Design Document** llamado `losjugadores` con las siguientes vistas:

* **Vista `por_club`:**
    ```javascript
    function(doc) { if (doc.Club) { emit(doc.Club, doc); } }
    ```
* **Vista `por_partidos`:**
    ```javascript
    function(doc) { if (doc.Partidos !== undefined) { emit(doc.Partidos, doc); } }
    ```
* **Vista `por_goles`:**
    ```javascript
    function(doc) { if (doc.Goles !== undefined) { emit(doc.Goles, doc); } }
    ```

## 5. Frontend (Vite + DataTables)
La aplicación consume las vistas de CouchDB en tiempo real.

* **Colores Institucionales (UTPL):** Azul (`#003366`) y Amarillo (`#FDB813`).
* **Funcionalidad:** Permite cambiar entre las tres vistas definidas y aplicar filtros por llave exacta.

### Ejecución del servidor de desarrollo:
```bash
cd frontend
npm run dev
```

---

## 6. Solución de Problemas Comunes
* **Error de Módulo no encontrado:** Asegúrate de que el entorno virtual esté activo `(venv)`.
* **Caracteres especiales (ñ, á):** El sistema utiliza `encoding='utf-8'` y `ensure_ascii=False` en el procesamiento para garantizar la integridad de los nombres.
* **CORS:** Si el frontend no recibe datos, habilita CORS en CouchDB:
    `Fauxton > Settings > CORS > Enable CORS > Allow all origins`.

---
**Autor:** Sebastian - Alex
**Institución:** Universidad Técnica Particular de Loja (UTPL)
**Fecha:** Mayo 2026
