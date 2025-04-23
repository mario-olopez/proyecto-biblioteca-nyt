const urlAPI = "https://api.nytimes.com/svc/books/lists/names.json?api-key=AxAIDguQa4ASm7ICC6g7eMqm1XG0WPLx";
const listasLibros = document.getElementById("listas-libros");
const detallesLibros = document.getElementById("tarjeta-libros");
const botonVolver = document.getElementById("boton-volver");


botonVolver.addEventListener("click", () => { //Función para volver a hacer visibles las categorías de libros tras darle al botón volver
    detallesLibros.style.display = "none";
    listasLibros.style.display = "block";
});

// Cargar las listas
async function cargarListas() {
    listasLibros.innerHTML += `<div class="loader">Cargando listas...</div>`; // "Espiner"

    try { //Llamada a la API
        const respuesta = await fetch(urlAPI);
        const datos = await respuesta.json();
        console.log(datos);

        if (datos && datos.body && datos.body.results) { //Condicional para asegurarnos de que la Api devuelve los datos esperados
            renderizarListas(datos.body.results);
        } else { //Manejo de errores
            listasLibros.innerHTML = `<p>Error al cargar los libros.</p>`;
            console.log("La respuesta no tiene los datos esperados: ", datos);
        }
    } catch (error) {
        listasLibros.innerHTML = `<p>Error al cargar las listas.</p>`;
        console.log("Error al obtener las listas:", error);
    }
}

function renderizarListas(listas) {
    const contenedor = document.createElement("div"); //Manipulación DOM para pintar categorías
    contenedor.classList.add("contenedor-listas");

    const filtro = document.createElement("div"); //DOM para pintar los filtros
    filtro.classList.add("filtro");
    filtro.innerHTML = `
        <label for="filtro-actualizacion">Filtrar por frecuencia de actualización: </label>
        <select id="filtro-actualizacion">
            <option value="all">Todas</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
        </select>
        <label for="filtro-orden-oldest">Ordenar por publicación más antigua: </label>
        <select id="filtro-orden-oldest">
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
        </select>
        <label for="filtro-orden-newest">Ordenar por publicación más reciente: </label>
        <select id="filtro-orden-newest">
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
        </select>
        <label for="filtro-orden-categoria">Ordenar por categoría A-Z / Z-A: </label>
        <select id="filtro-orden-categoria">
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
        </select>
    `;
    listasLibros.innerHTML = "<h1>Los libros más vendidos</h1>";
    listasLibros.appendChild(filtro);
    listasLibros.appendChild(contenedor);

    let listasOriginales = [...listas];  //Utilizamos spread para hacer una "copia" del array de objetos listas para que al aplicar
    mostrarListasFiltradas(listasOriginales);// los filtros no modifiquemos la versión "original" de las listas

    //Función para filtro de frecuencia de actualización
    const selectFiltro = document.getElementById("filtro-actualizacion");
    selectFiltro.addEventListener("change", () => {
        const valorActualizacion = selectFiltro.value;
        if (valorActualizacion === "all") {
            mostrarListasFiltradas(listasOriginales);
        } else {
            const listasFiltradas = listasOriginales.filter(lista => {
                const listaActualizada = lista.updated.toLowerCase();//Pasamos todo a minúsculas para evitar fallos con mayúsculas en las comparaciones
                return listaActualizada === valorActualizacion.toLowerCase(); 
            });
            mostrarListasFiltradas(listasFiltradas);
        }
    });

    //Función para filtrar por publicación más antigua
    const selectOldest = document.getElementById("filtro-orden-oldest");
    selectOldest.addEventListener("change", () => {
        const valorSelect = selectOldest.value;
        const listasOrdenadas = [...listasOriginales].sort((a, b) => { 
            const fechaA = new Date(a.oldest_published_date); //Utilizamos new Date para convertir el string oldest_published_date en un objeto
            const fechaB = new Date(b.oldest_published_date); //y poder compararlos como fechas
            return valorSelect === "asc" ? fechaA - fechaB : fechaB - fechaA;
        });
        mostrarListasFiltradas(listasOrdenadas);
    })

    //Filtrar por publicación más reciente
    const selectNewest = document.getElementById("filtro-orden-newest");
    selectNewest.addEventListener("change", () => {
        const valorSelect = selectNewest.value;
        const listasOrdenadas = [...listasOriginales].sort((a, b) => {
            const fechaA = new Date(a.newest_published_date);
            const fechaB = new Date(b.newest_published_date);
            return valorSelect === "asc" ? fechaA - fechaB : fechaB - fechaA;
        });
        mostrarListasFiltradas(listasOrdenadas)
    })

    //Filtrar por categoría A-Z
    const selectCategoria = document.getElementById("filtro-orden-categoria");
    selectCategoria.addEventListener("change", () => {
        const valorSelect = selectCategoria.value;
        const listasOrdenadas = [...listasOriginales].sort((a, b) => {
            const nombreA = a.display_name.toLowerCase();
            const nombreB = b.display_name.toLowerCase();
            if (valorSelect === "asc"){
                return nombreA.localeCompare(nombreB) //localeCompare compara strings teniendo en cuenta caracteres especiales
            } else {
                return nombreB.localeCompare(nombreA)
            }
        });
        mostrarListasFiltradas(listasOrdenadas)
    })

    //Función para pintar las listras con los filtros
    function mostrarListasFiltradas(filtradas) {
        contenedor.innerHTML = "";
        if (filtradas.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron listas con ese filtro.</p>";
        }
        filtradas.forEach(lista => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-lista");

            //Template para pintar la tarjeta
            tarjeta.innerHTML = ` 
                <h2>${lista.display_name}</h2>
                <p><strong>Fecha más antigua:</strong> ${lista.oldest_published_date}</p>
                <p><strong>Última fecha:</strong> ${lista.newest_published_date}</p>
                <p><strong>Frecuencia:</strong> ${lista.updated}</p>
                <a href="#" class="link-lista" data-nombre="${lista.list_name_encoded}">Ver libros</a>
            `;

            contenedor.appendChild(tarjeta);
        });

        document.querySelectorAll(".link-lista").forEach(link => { //función para que al clicar en Ver libros se muestren los libros 
            link.addEventListener("click", evento => {             // de esa categoría
                evento.preventDefault();
                const nombreLista = link.getAttribute("data-nombre");
                cargarLibrosDeLista(nombreLista);
            });
        });
    }
}

async function cargarLibrosDeLista(nombreLista) { //Función de llamada a la api para cargar los libros
    listasLibros.style.display = "none";
    detallesLibros.style.display = "block";

    const urlDetalle = `https://api.nytimes.com/svc/books/v3/lists/current/${nombreLista}.json?api-key=AxAIDguQa4ASm7ICC6g7eMqm1XG0WPLx`;
    const contenedorDetalles = document.getElementById("detalles-libro");
    contenedorDetalles.innerHTML = `<div class="loader">Cargando libros...</div>`;

    try {
        const respuesta = await fetch(urlDetalle);
        const datos = await respuesta.json();
        renderizarLibros(datos.results.books);
    } catch (error) {
        contenedorDetalles.innerHTML = `<p>Error al cargar libros.</p>`;
        console.log("Error al obtener libros: ", error);
    }
}

function renderizarLibros(libros) {
    const contenedorLibro = document.getElementById("detalles-libro");
    contenedorLibro.innerHTML = "";

    libros.forEach((libro, index) => {
        const divLibro = document.createElement("div");
        divLibro.classList.add("libro-detalle");

        divLibro.innerHTML = `
            <h3>#${index + 1} - ${libro.title}</h3>
            <img src="${libro.book_image}" alt="Carátula de ${libro.title}" width="150">
            <p><strong>Autor:</strong> ${libro.author}</p>
            <p><strong>Descripción:</strong> ${libro.description}</p>
            <p><strong>Semanas en lista:</strong> ${libro.weeks_on_list}</p>
            <a href="${libro.amazon_product_url}" target="_blank">Comprar en Amazon</a>
        `;

        contenedorLibro.appendChild(divLibro);
    });
}

cargarListas();