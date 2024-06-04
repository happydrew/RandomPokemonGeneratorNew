export { Pokemon, displayPokemon };

import { getRandomElement } from './utils.js';

class Pokemon {
	/** National Pokédex number. */
	id: number;
	/** The display name of this Pokémon. */
	name: string;
	height: number;
	speciesGeneration: string;
	speciesGrowthRate: string;
	speciesIsBaby: number;
	speciesIsLegendary: number;
	speciesIsMythical: number;
	speciesShape: string;
	weight: number;
	abilities: any;
	speciesHabitat: any;
	stats: any;
	types: any;
	region: any;
	nfe: number;
	nature: string = generateNature();

	constructor(p?: Pokemon) {
		if (p) {
			Object.assign(this, p);
		}
	}

	toHtml(includeSprite: boolean): string {
		let classes = "";
		// 暂不处理shiny
		// if (this.shiny) {
		// 	classes += "shiny ";
		// }
		if (!includeSprite) {
			classes += "imageless ";
		}
		return `<li class="${classes}">
			${includeSprite ? this.toImage() : ""}
			${this.toText()}
		</li>`;
	}

	toText(): string {
		return `
			${this.nature ? `<span class="nature">${this.nature}</span>` : ""}
			${this.name}
		`;
	}

	toImage(): string {
		// 后续支持用户选择展示哪种图片
		//const altText = (this.shiny ? "Shiny " : "") + this.name;
		return `<img src="${this.getSpritePath()}" alt="${this.name}" title="${this.name}" onerror="this.src='favicon.ico'" />`;
	}

	private getSpritePath(): string {
		// 暂时默认使用PokeApi提供的home_front_default, 如果图片访问比较忙，看看别的paokemon数据库，比如Bulbapedia的图片
		return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/' + this.id + '.png';
		//return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + this.id + '.png';
		//return '/sprites/normal/' + this.name.toLowerCase() + '.png';
	}

}

function generateNature(): string {
	return getRandomElement(NATURES);
}

function displayPokemon(pokemon: Pokemon[]) {
	const resultsContainer = document.getElementById("results");
	if (!pokemon) {
		resultsContainer.innerHTML = "An error occurred while generating Pok&eacute;mon.";
	} else {
		resultsContainer.innerHTML = toHtml(pokemon);
	}
}

/** Converts a JSON array of Pokémon into an HTML ordered list. */
function toHtml(pokemon: Pokemon[]) {
	//const includeSprites = spritesCheckbox.checked;
	return `<ol>${pokemon.map(p => p.toHtml(true)).join("")}</ol>`;
}

const NATURES = ["Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Na&iuml;ve", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"];
