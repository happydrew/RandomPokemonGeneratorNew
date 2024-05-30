const apiHost = "http://localhost:8081/random-pokemon/api";
/** Called when the Generate button is clicked. */
async function generateRandom() {
	markLoading(true);

	const options = getOptionsFromForm();
	persistOptions(options);

	try {
		const eligiblePokemon = await getEligiblePokemon(options);
		const generatedPokemon = chooseRandom(eligiblePokemon, options);
		addToHistory(generatedPokemon);
		displayPokemon(generatedPokemon);
	} catch (error) {
		console.error(error);
		displayPokemon(null);
	}
	markLoading(false);
}

function onPageLoad() {
	loadOptions();
	toggleHistoryVisibility();
	addFormChangeListeners();
}
document.addEventListener("DOMContentLoaded", onPageLoad);

function displayPokemon(pokemon: Pokemon[]) {
	const resultsContainer = document.getElementById("results");
	if (!pokemon) {
		resultsContainer.innerHTML = "An error occurred while generating Pok&eacute;mon.";
	} else {
		resultsContainer.innerHTML = toHtml(pokemon);
	}
}

// Cache the results of getEligiblePokemon by options.
let cachedOptionsJson: string;
// 存储的是原型类，不是json对象
let cachedEligiblePokemon: Pokemon[];

/**
 * 
 * @param options 
 * @returns 返回的是已转化为原型类型，不是json对象
 */
async function getEligiblePokemon(options: Options): Promise<Pokemon[]> {
	const optionsJson = JSON.stringify(options);

	if (cachedOptionsJson == optionsJson) {
		return Promise.resolve(cachedEligiblePokemon);
	} else {
		const url = apiHost + '/pokemon/queryConditions?' + convertOptionsToUrlParams(options);
		console.log("Fetching eligible Pokémon from: " + url);
		const response = await fetch(url);
		if (!response.ok) {
			console.error(response);
			throw Error("Failed to get eligible Pokémon.");
		}
		const json = await response.json();
		const eligiblePokemon: Pokemon[] = json.data;
		// 转换成原型类
		// 这里要改，单独创建一个类型用作原型类，Pokemon类型只用来存数据
		const eligiblePokemonProtos: Pokemon[] = eligiblePokemon.map(p => new Pokemon(p))
		cachedOptionsJson = optionsJson;
		cachedEligiblePokemon = eligiblePokemonProtos;
		return eligiblePokemonProtos;
	}
}

// function filterByOptions<P extends Pokemon | Form>(pokemonInRegion: P[], options: Options): P[] {
// 	return pokemonInRegion.filter((pokemon: Pokemon | Form) => {
// 		// Legendary, NFE, and Stadium status are independent of form, so check these before
// 		// checking forms.
// 		if (options.stadiumRentals && "isStadiumRental" in pokemon && !pokemon.isStadiumRental) {
// 			return false;
// 		}
// 		if (!options.legendaries && "isLegendary" in pokemon && pokemon.isLegendary) {
// 			return false;
// 		}
// 		if (!options.nfes && "isNfe" in pokemon && pokemon.isNfe) {
// 			return false;
// 		}

// 		if (options.forms && "forms" in pokemon) {
// 			// If we are generating with forms and this Pokémon has forms,
// 			// filter on them instead of the top-level Pokémon.
// 			pokemon.forms = filterByOptions(pokemon.forms, options);
// 			return pokemon.forms.length > 0;
// 		}

// 		if (options.type != "all" && pokemon.types.indexOf(options.type) < 0) {
// 			return false;
// 		}

// 		return true;
// 	});
// }

/** Chooses N random Pokémon from the array of eligibles without replacement. */
function chooseRandom(eligiblePokemon: Pokemon[], options: Options): Pokemon[] {
	const generated = [];

	// Deep copy so that we can modify the array as needed.
	const eligiblePokemonDeepCopy: Pokemon[]= deepClone(eligiblePokemon)
	// const eligiblePokemonDeepCopy: Pokemon[] = JSON.parse(JSON.stringify(eligiblePokemon));

	while (eligiblePokemonDeepCopy.length > 0 && generated.length < options.n) {
		// 随机取出一个pokemon
		const pokemon: Pokemon = removeRandomElement(eligiblePokemonDeepCopy);
		generated.push(pokemon);
	}

	// Megas are more likely to appear at the start of the array,
	// so we shuffle for good measure.
	return shuffle(generated);
}

/** Filters megas from the array. Doesn't mutate the original array. */
function removeMegas(pokemonArray: Pokemon[]): Pokemon[] {
	return pokemonArray.filter((pokemon: Pokemon) => {
		if (pokemon.forms) {
			pokemon.forms = pokemon.forms.filter(form => !form.isMega);
			return pokemon.forms.length > 0;
		} else {
			return true; // always keep if no forms
		}
	});
}

/** Filters Gigantamax forms from the array. Doesn't mutate the original array. */
function removeGigantamaxes(pokemonArray: Pokemon[]): Pokemon[] {
	return pokemonArray.filter((pokemon: Pokemon) => {
		if (pokemon.forms) {
			pokemon.forms = pokemon.forms.filter(form => !form.isGigantamax);
			return pokemon.forms.length > 0;
		} else {
			return true; // always keep if no forms
		}
	});
}

/** Converts a JSON array of Pokémon into an HTML ordered list. */
function toHtml(pokemon: Pokemon[]) {
	//const includeSprites = spritesCheckbox.checked;
	return `<ol>${pokemon.map(p => p.toHtml(true)).join("")}</ol>`;
}