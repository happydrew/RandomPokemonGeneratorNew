export {
	addToHistory, displayPrevious, displayNext, toggleHistoryVisibility, displayHistoryAtIndex,
	toggleShinyDisplay, updateShinyToggler, clearShinies, saveShinies, loadShinies
};
import { Pokemon, DisplayPokemon, displayPokemon } from "./pokemon.js";

const HISTORY_SIZE = 64;
const STORAGE_SHINIES_KEY = "shinies";

/** The last HISTORY_SIZE sets of Pokémon to be generated, newest first. */
const latestPokemon: DisplayPokemon[][] = [];

var shiniesCahce: DisplayPokemon[];
var shinyMapCache: Map<string, DisplayPokemon>;
// 保存的shiny数量
const max_shinies = 100;

let displayedIndex: number = -1; // Nothing displayed on first load

function addToHistory(displayPokemons: DisplayPokemon[]) {
	latestPokemon.unshift(displayPokemons);
	while (latestPokemon.length > HISTORY_SIZE) {
		latestPokemon.pop();
	}

	// const shinies = getShinies();
	// shinies.unshift(pokemon.filter(p => p.shiny));
	// window.localStorage.setItem(STORAGE_SHINIES_KEY, JSON.stringify(shinies));

	displayedIndex = 0;
	toggleHistoryVisibility();
}

function toggleHistoryVisibility() {
	// 这里因为latestPokemon是一个栈的结构，最早生成的在数组的最后面，而数组的头部是最新生成的
	document.getElementById("previous").classList.toggle("hidden", displayedIndex >= latestPokemon.length - 1);
	document.getElementById("next").classList.toggle("hidden", displayedIndex <= 0);

	// 暂不处理shiny, 后续设计让用户选择展示哪种风格的图片，官方原始，还是officail-art, 还是home等，或者随机生成
	// shinies = shinies ?? getShinies();
}

function displayPrevious() {
	displayHistoryAtIndex(displayedIndex + 1); // One older
}

function displayNext() {
	displayHistoryAtIndex(displayedIndex - 1); // One newer
}

function displayHistoryAtIndex(index: number) {
	index = Math.max(0, Math.min(index, latestPokemon.length - 1));
	displayedIndex = index;
	displayPokemon(latestPokemon[index], document.getElementById("results"));
	toggleHistoryVisibility();
}

/** All encountered shiny Pokémon, newest first. */
// function getShinies(): GeneratedPokemon[] {
// 	const shinies = JSON.parse(window.localStorage.getItem(STORAGE_SHINIES_KEY));
// 	if (!Array.isArray(shinies)) {
// 		return [];
// 	}
// 	return shinies.map(shiny => GeneratedPokemon.fromJson(shiny));
// }

function toggleShinyDisplay(forceInvisible?: boolean) {
	const isInvisible = document.getElementById("shiny-container").classList.toggle("invisible",forceInvisible);
	updateShinyToggler(!isInvisible);
	if (!isInvisible) {
		displayShinys();
	} else {
		document.getElementById("shinies").innerHTML = "";
	}
}

function displayShinys() {
	displayPokemon(shiniesCahce, document.getElementById("shinies"));
}

function saveShinies(displayPokemons: DisplayPokemon[]): number {
	const newShinies = displayPokemons.filter(dp => dp.shiny);
	if (newShinies && newShinies.length > 0) {
		// 放到缓存里
		newShinies.forEach(ns => {
			shiniesCahce.unshift(ns);
			shinyMapCache.set(getShinyId(ns), ns);
			while (shiniesCahce.length > max_shinies) {
				const poped = shiniesCahce.pop();
				shinyMapCache.delete(getShinyId(poped));
			}
		});
		window.localStorage.setItem(STORAGE_SHINIES_KEY, JSON.stringify(shiniesCahce));
	}
	updateShinyCountHTML();
	return newShinies.length;
}

/**
 * 从缓存中加载shiny
 */
function loadShinies() {
	const shiniesCache = window.localStorage.getItem(STORAGE_SHINIES_KEY);
	if (shiniesCache) {
		shiniesCahce = JSON.parse(shiniesCache).map((s: DisplayPokemon) => new DisplayPokemon(s, null, null, null));
		shinyMapCache = new Map<string, DisplayPokemon>();
		shiniesCahce.forEach(s => shinyMapCache.set(getShinyId(s), s));
	} else {
		shiniesCahce = [];
		shinyMapCache = new Map<string, DisplayPokemon>();
	}
	updateShinyCountHTML();
}

function getShinyId(displaPokemon: DisplayPokemon): string {
	return `${displaPokemon.id.toString()}_${displaPokemon.generateTime.toString()}`;
}

function updateShinyToggler(shiniesVisible: boolean) {
	const button = document.getElementById("shiny-toggler");
	button.classList.toggle("is-hiding", !shiniesVisible);
	button.classList.toggle("is-showing", shiniesVisible);
}

function clearShinies() {
	if (window.confirm("Are you sure you want to clear your shiny Pokémon?")) {
		toggleShinyDisplay();
		shiniesCahce = [];
		shinyMapCache = new Map<string, DisplayPokemon>();
		window.localStorage.removeItem(STORAGE_SHINIES_KEY);
		updateShinyCountHTML();
	}
}

function updateShinyCountHTML() {
	document.getElementById("shiny-count").innerText = shiniesCahce.length.toString() + "/" + max_shinies.toString();
}