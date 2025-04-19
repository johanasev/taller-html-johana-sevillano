// Variables para paginación de la PokéAPI
let offset = 0;
const limit = 10;

// Elementos del modal
const modal = document.getElementById("pokemon-modal");
const modalDetails = document.getElementById("modal-details");

// Función para buscar un Pokémon por nombre
async function buscarPokemon() {
    const input = document.getElementById("pokemon-input").value.toLowerCase().trim();
    const list = document.getElementById("pokemon-list");
    list.innerHTML = "";

    // Si el input está vacío, muestra una alerta
    if (!input) return alert("Por favor escribe un nombre de Pokémon");

    // Reinicio de la paginación
    offset = 0;

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
        if (!res.ok) throw new Error("Pokémon no encontrado");
        const data = await res.json();

        // Muestra el Pokémon encontrado
        mostrarPokemon(data);

        // Limpia el input después de buscar
        document.getElementById("pokemon-input").value = "";

    } catch (error) {
        // Muestra mensaje si hay error al buscar
        list.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// Cuando se carga el DOM, ejecuta estas acciones
document.addEventListener("DOMContentLoaded", async () => {
    // Carga los primeros 10 Pokémon al abrir la app
    await cargarPokemonIniciales();

    // Evento para buscar con botón
    document.getElementById("buscar-btn").addEventListener("click", buscarPokemon);

    // Evento para buscar con la tecla Enter
    document.getElementById("pokemon-input").addEventListener("keypress", e => {
        if (e.key === "Enter") buscarPokemon();
    });

    // Reinicia el listado al hacer clic en “Inicio”
    document.getElementById("volver-inicio-btn").addEventListener("click", () => {
        document.getElementById("pokemon-input").value = "";
        document.getElementById("pokemon-list").innerHTML = "";
        offset = 0;
        cargarPokemonIniciales();
    });

    // Carga más Pokémon al hacer clic en el botón correspondiente
    document.getElementById("cargar-mas-btn").addEventListener("click", cargarPokemonIniciales);

    // Cierra el modal al hacer clic en la "X"
    document.querySelector(".close-btn").addEventListener("click", () => modal.classList.add("hidden"));
});

// Función para cargar los Pokémon iniciales (por defecto o con “cargar más”)
async function cargarPokemonIniciales() {
    const list = document.getElementById("pokemon-list");
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await res.json();

        // Por cada Pokémon, obtenemos detalles y lo mostramos en tarjeta
        for (const poke of data.results) {
            const detalle = await (await fetch(poke.url)).json();
            mostrarPokemon(detalle);
        }

        // Aumenta el offset para la próxima carga
        offset += limit;

    } catch (error) {
        list.innerHTML = `<p class="error">Error cargando los Pokémon.</p>`;
    }
}

// Función que crea una tarjeta HTML con la información del Pokémon
function mostrarPokemon(pokemon) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name.toUpperCase()}</h3>
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
        <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>
    `;

    // Al hacer clic en la tarjeta, se abre el modal con sus evoluciones
    card.addEventListener("click", () => abrirModal(pokemon));

    document.getElementById("pokemon-list").appendChild(card);
}

// Abre el modal y muestra la cadena de evolución del Pokémon
async function abrirModal(pokemon) {
    modal.classList.remove("hidden");

    // Obtenemos las evoluciones del Pokémon
    const evoluciones = await obtenerEvoluciones(pokemon.id);

    // Renderizamos el contenido dentro del modal
    modalDetails.innerHTML = `
        <div class="evolutions">
            <h3>Evoluciones</h3>
            ${evoluciones || '<p>No tiene evoluciones disponibles.</p>'}
        </div>
    `;
}

// Obtiene las evoluciones del Pokémon a partir de su ID
async function obtenerEvoluciones(pokemonId) {
    try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const speciesData = await speciesRes.json();

        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        const nombres = [];
        let actual = evoData.chain;

        // Recorre la cadena evolutiva para sacar los nombres
        while (actual) {
            nombres.push(actual.species.name);
            actual = actual.evolves_to[0];
        }

        // Para cada nombre, carga su imagen
        const imagenes = await Promise.all(nombres.map(async name => {
            const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.json());
            return `<div><img src="${data.sprites.front_default}" alt="${name}"><span>${name}</span></div>`;
        }));

        return imagenes.join("");

    } catch (e) {
        return null;
    }
}
