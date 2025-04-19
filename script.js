async function buscarPokemon() {
    const input = document.getElementById("pokemon-input").value.toLowerCase();
    const list = document.getElementById("pokemon-list");
    list.innerHTML = ""; // Limpiar resultados anteriores

    if (!input) return alert("Por favor ingresa un nombre o número");

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
        if (!response.ok) throw new Error("Pokémon no encontrado");

        const data = await response.json();
        mostrarPokemon(data);
    } catch (error) {
        list.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

function mostrarPokemon(pokemon) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h3>${pokemon.name.toUpperCase()}</h3>
    <p>Tipo: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
  `;
    document.getElementById("pokemon-list").appendChild(card);
}
