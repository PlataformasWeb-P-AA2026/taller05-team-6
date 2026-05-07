import './style.css';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

// Ajustado al Design Document: losjugadores
const BASE_URL = "http://localhost:5984/jugadores/_design/losjugadores/_view/";

let tabla = null;

function parsearValor(valor) {
  if (valor === "") return null;
  const numero = Number(valor);
  // Si es un número (como goles o partidos), lo devuelve como tal
  if (!isNaN(numero)) return numero;
  return valor;
}

async function cargarDatos(vista = "por_club", filtro = "") {
  try {
    let url = `${BASE_URL}${vista}`;

    // Lógica para filtrar por llave (exacta en CouchDB)
    if (filtro !== "") {
      const v = parsearValor(filtro);
      url += `?key=${encodeURIComponent(JSON.stringify(v))}`;
    }

    const respuesta = await fetch(url, {
      // Si tienes problemas de CORS, asegúrate de configurar CouchDB o usar un proxy
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!respuesta.ok) throw new Error("Error al consumir la API de CouchDB");

    const json = await respuesta.json();

    // Mapeo ajustado a los campos de tu JSON: Nombre, Seleccion, Posicion, Edad
    const datos = json.rows.map(row => {
      const doc = row.value || {};

      return {
        criterio: row.key,
        // Usamos los nombres exactos del JSON generado (Mayúsculas)
        nombre: doc.Nombre || doc.nombre || "N/A",
        seleccion: doc.Seleccion || doc.seleccion || "N/A",
        posicion: doc.Posicion || doc.posicion || "N/A",
        edad: doc.Edad || doc.edad || "N/A"
      };
    });

    if (tabla) {
      tabla.destroy();
      const contenedor = document.querySelector("#tabla-posts");
      contenedor.innerHTML = ""; // Limpiar el DOM
    }

    tabla = new DataTable("#tabla-posts", {
      data: datos,
      columns: [
        { data: "criterio", title: "Criterio (Vista)" },
        { data: "nombre", title: "Nombre Jugador" },
        { data: "seleccion", title: "País" },
        { data: "posicion", title: "Posición" },
        { data: "edad", title: "Edad" }
      ],
      pageLength: 10,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' // Idioma español oficial
      }
    });

  } catch (error) {
    console.error("Error en la carga:", error);
  }
}

// Eventos para Select y Input de Filtro
document.getElementById("vista").addEventListener("change", function () {
  const vista = this.value;
  document.getElementById("filtro").value = "";
  cargarDatos(vista);
});

// El filtro por 'key' en CouchDB requiere coincidencia exacta.
// Si buscas "Real Madrid", debe escribirse completo.
document.getElementById("filtro").addEventListener("change", function () {
  const filtro = this.value.trim();
  const vista = document.getElementById("vista").value;
  cargarDatos(vista, filtro);
});

// Carga inicial
cargarDatos();