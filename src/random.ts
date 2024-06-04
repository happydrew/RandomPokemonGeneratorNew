import { addToHistory, toggleHistoryVisibility, displayPrevious, displayNext, toggleShinyDisplay, clearShinies } from "./history.js";
import { convertSearchParamsToOptions, Options, convertOptionsToUrlParams } from "./options.js";
import { Pokemon, displayPokemon } from "./pokemon.js";
import { markLoading, deepClone, removeRandomElement, shuffle, toggleMoreOptions, collapseMoreOptions, setDropdownIfValid } from "./utils.js";

(window as any).generateRandom = generateRandom;
(window as any).toggleMoreOptions = toggleMoreOptions;
(window as any).collapseMoreOptions = collapseMoreOptions;
(window as any).displayPrevious = displayPrevious;
(window as any).displayNext = displayNext;
(window as any).toggleShinyDisplay = toggleShinyDisplay;
(window as any).clearShinies = clearShinies;

/** html页面表单的选项控件 */
const regionDropdown = document.getElementById("region") as HTMLSelectElement;
const typeDropdown = document.getElementById("type") as HTMLSelectElement;
const colorDropdown = document.getElementById("color") as HTMLSelectElement;
const growthRateDropdown = document.getElementById("growthRate") as HTMLSelectElement;
const habitatDropdown = document.getElementById("habitat") as HTMLSelectElement;

const legendariesCheckbox = document.getElementById("legendaries") as HTMLInputElement;
const mythicalCheckbox = document.getElementById("mythical") as HTMLInputElement;
const nfesCheckbox = document.getElementById("nfes") as HTMLInputElement;
const allowVarietiesCheckbox = document.getElementById("allowVarieties") as HTMLInputElement;
const babyCheckbox = document.getElementById("baby") as HTMLInputElement;

const heightMinInput = document.getElementById("height_min") as HTMLInputElement;
const heightMaxInput = document.getElementById("height_max") as HTMLInputElement;
const weightMinInput = document.getElementById("weight_min") as HTMLInputElement;
const weightMaxInput = document.getElementById("weight_max") as HTMLInputElement;
const baseHappinessMinInput = document.getElementById("baseHappiness_min") as HTMLInputElement;
const baseHappinessMaxInput = document.getElementById("baseHappiness_max") as HTMLInputElement;
const captureRateMinInput = document.getElementById("captureRate_min") as HTMLInputElement;
const captureRateMaxInput = document.getElementById("captureRate_max") as HTMLInputElement;
const hatchCounterMinInput = document.getElementById("hatchCounter_min") as HTMLInputElement;
const hatchCounterMaxInput = document.getElementById("hatchCounter_max") as HTMLInputElement;

const numberDropdown = document.getElementById("n") as HTMLSelectElement;
/** html页面表单的选项控件 */

const STORAGE_OPTIONS_KEY = "options";
const STORAGE_PARAMS_KEY = "params";
const STORAGE_POKEMONS_KEY = "pokemons";
//const queryUrl = "http://localhost:8081/random-pokemon/api/pokemon/queryConditions";
const queryUrl = "http://localhost:3000/api/queryConditions";
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

/** Stores the current options in local storage and in the URL. */
function persistOptions(options: Options) {
    const optionsJson = JSON.stringify(options);
    window.localStorage.setItem(STORAGE_OPTIONS_KEY, optionsJson);

    // 这行代码的作用是使用 window.history.replaceState() 方法来更新浏览器的历史记录，以便在不刷新页面的情况下更改 URL 地址。
    // 通常，这种技术用于实现单页面应用程序（SPA）中的路由管理。在这种情况下，当用户执行某些操作时（例如选择不同的选项或进行搜索），
    // 页面的状态会发生变化，但是页面本身不会重新加载。相反，开发人员可以使用 JavaScript 更新 URL，以便将当前页面状态反映在 URL 中，
    // 并将新的状态添加到浏览器历史记录中。
    window.history.replaceState({}, "", "?" + convertOptionsToUrlParams(options));
}

function getOptionsFromForm(): Options {
    return {
        requestParams: {
            region: regionDropdown.value,
            type: typeDropdown.value,
            color: colorDropdown.value,
            growthRate: growthRateDropdown.value,
            habitat: habitatDropdown.value,
            legendaries: legendariesCheckbox.checked,
            mythical: mythicalCheckbox.checked,
            nfes: nfesCheckbox.checked,
            allowVarieties: allowVarietiesCheckbox.checked,
            baby: babyCheckbox.checked,
            height_min: parseFloat(heightMinInput.value),
            height_max: parseFloat(heightMaxInput.value),
            weight_min: parseFloat(weightMinInput.value),
            weight_max: parseFloat(weightMaxInput.value),
            baseHappiness_min: parseFloat(baseHappinessMinInput.value),
            baseHappiness_max: parseFloat(baseHappinessMaxInput.value),
            captureRate_min: parseFloat(captureRateMinInput.value),
            captureRate_max: parseFloat(captureRateMaxInput.value),
            hatchCounter_min: parseFloat(hatchCounterMinInput.value),
            hatchCounter_max: parseFloat(hatchCounterMaxInput.value)
        },
        n: parseInt(numberDropdown.value),
        // todo，暂时设为true, 后续再修改
        natures: true
    };
}

/** Loads options from either the URL or local storage. */
function loadOptions() {
    if (urlHasOptions()) {
        setOptions(convertUrlParamsToOptions());
    } else {
        const optionsJson = window.localStorage.getItem(STORAGE_OPTIONS_KEY);
        if (optionsJson) {
            setOptions(JSON.parse(optionsJson));
        }
    }
}

function setOptions(options: Partial<Options>) {
    if (options.n != null) {
        setDropdownIfValid(numberDropdown, options.n);
    }
    if (options.requestParams.region != undefined) {
        setDropdownIfValid(regionDropdown, options.requestParams.region);
    }
    if (options.requestParams.type != undefined) {
        setDropdownIfValid(typeDropdown, options.requestParams.type);
    }
    if (options.requestParams.color != undefined) {
        setDropdownIfValid(colorDropdown, options.requestParams.color);
    }
    if (options.requestParams.growthRate != undefined) {
        setDropdownIfValid(growthRateDropdown, options.requestParams.growthRate);
    }
    if (options.requestParams.habitat != undefined) {
        setDropdownIfValid(habitatDropdown, options.requestParams.habitat);
    }
    if (options.requestParams.legendaries != undefined) {
        legendariesCheckbox.checked = options.requestParams.legendaries;
    }
    if (options.requestParams.mythical != undefined) {
        mythicalCheckbox.checked = options.requestParams.mythical;
    }
    if (options.requestParams.nfes != undefined) {
        nfesCheckbox.checked = options.requestParams.nfes;
    }
    if (options.requestParams.allowVarieties != undefined) {
        allowVarietiesCheckbox.checked = options.requestParams.allowVarieties;
    }
    if (options.requestParams.baby != undefined) {
        babyCheckbox.checked = options.requestParams.baby;
    }
    if (options.requestParams.height_min != undefined) {
        heightMinInput.value = options.requestParams.height_min.toString();
    }
    if (options.requestParams.height_max != undefined) {
        heightMaxInput.value = options.requestParams.height_max.toString();
    }
    if (options.requestParams.height_min != undefined) {
        heightMinInput.value = options.requestParams.height_min.toString();
    }
    if (options.requestParams.height_max != undefined) {
        heightMaxInput.value = options.requestParams.height_max.toString();
    }
    if (options.requestParams.weight_min != undefined) {
        weightMinInput.value = options.requestParams.weight_min.toString();
    }
    if (options.requestParams.weight_max != undefined) {
        weightMaxInput.value = options.requestParams.weight_max.toString();
    }
    if (options.requestParams.baseHappiness_min != undefined) {
        baseHappinessMinInput.value = options.requestParams.baseHappiness_min.toString();
    }
    if (options.requestParams.baseHappiness_max != undefined) {
        baseHappinessMaxInput.value = options.requestParams.baseHappiness_max.toString();
    }
    if (options.requestParams.captureRate_min != undefined) {
        captureRateMinInput.value = options.requestParams.captureRate_min.toString();
    }
    if (options.requestParams.captureRate_max != undefined) {
        captureRateMaxInput.value = options.requestParams.captureRate_max.toString();
    }
    if (options.requestParams.hatchCounter_min != undefined) {
        hatchCounterMinInput.value = options.requestParams.hatchCounter_min.toString();
    }
    if (options.requestParams.hatchCounter_max != undefined) {
        hatchCounterMaxInput.value = options.requestParams.hatchCounter_max.toString();
    }

    // if (options.generate !== undefined) {
    // 	generateRandom();
    // }
}

/** Returns whether or not the URL specifies any options as parameters. */
function urlHasOptions(): boolean {
    const queryString = window.location.href.split("?")[1];
    return queryString && queryString.length > 0;
}

/** Parses options from the URL parameters. */
function convertUrlParamsToOptions(): Partial<Options> {
    const params = new URL(window.location.href).searchParams;
    return convertSearchParamsToOptions(params);
}

function onPageLoad() {
    loadOptions();
    toggleHistoryVisibility();
    addFormChangeListeners();
}
document.addEventListener("DOMContentLoaded", onPageLoad);

// Cache the results of getEligiblePokemon by options.
let cachedParmasJson: string;
// 存储的是原型类，不是json对象
let cachedEligiblePokemon: Pokemon[];

/**
 * 
 * @param options 
 * @returns 返回的是已转化为原型类型，不是json对象
 */
async function getEligiblePokemon(options: Options): Promise<Pokemon[]> {
    var pokemonsJson: Pokemon[];
    // 与缓存比较，如果有缓存，且请求参数没变，则直接从缓存中取数据
    const paramsStr = JSON.stringify(options.requestParams);
    if (getParamsCache() != null && getParamsCache() == paramsStr) {
        pokemonsJson = await getPokemonsCache();
        // 可能混存丢失，或被清楚，一般不可能出现（只要params有缓存，pokemons肯定有缓存），
        // 为了防止意外，再拉取一遍
        if (pokemonsJson.length == 0) {
            pokemonsJson = await fetchPokemons(options);
            setPokemonsCache(pokemonsJson);
        }
    } else { // 请求参数变化，或者之前没有缓存过
        pokemonsJson = await fetchPokemons(options);
        setPokemonsCache(pokemonsJson);
        setParamsCache(paramsStr);
    }
    // 转换成原型类
    // TODO, 这里要改，单独创建一个类型用作原型类，Pokemon类型只用来存数据
    return pokemonsJson.map(p => new Pokemon(p))
}

async function fetchPokemons(options: Options): Promise<Pokemon[]> {
    const url = queryUrl + '?' + convertOptionsToUrlParams(options);
    console.log("Fetching eligible Pokémon from: " + url);
    const response = await fetch(url);
    if (!response.ok) {
        console.error(response);
        throw Error("Failed to get eligible Pokémon.");
    }
    const text: string = await response.text();
    console.log("Received eligible Pokémon: " + text);
    return JSON.parse(text);
}

function getParamsCache(): string | null {
    return window.localStorage.getItem(STORAGE_PARAMS_KEY);
}

function setParamsCache(params: string): void {
    window.localStorage.setItem(STORAGE_PARAMS_KEY, params);
}

function getPokemonsCache(): Promise<Pokemon[]> {
    const pokemonsCache = window.localStorage.getItem(STORAGE_POKEMONS_KEY);
    if (pokemonsCache != null) {
        return Promise.resolve(JSON.parse(pokemonsCache));
    } else {
        return Promise.resolve([]);
    }
}

function setPokemonsCache(pokemons: Pokemon[]): void {
    window.localStorage.setItem(STORAGE_POKEMONS_KEY, JSON.stringify(pokemons))
}

function addFormChangeListeners() {
	regionDropdown.addEventListener("change", toggleStadiumRentalsCheckbox);
	toggleStadiumRentalsCheckbox();
	regionDropdown.addEventListener("change", toggleFormsCheckbox);
	toggleFormsCheckbox();
}

function toggleStadiumRentalsCheckbox() {
	const regionOption = regionDropdown.options[regionDropdown.selectedIndex];
	const shouldShow = regionOption?.dataset?.stadium == "true";
	//stadiumRentalsCheckbox.parentElement.classList.toggle("invisible", !shouldShow);
}

function toggleFormsCheckbox() {
	const regionOption = regionDropdown.options[regionDropdown.selectedIndex];
	const shouldShow = regionOption?.dataset?.forms != "false";
	//formsCheckbox.parentElement.classList.toggle("invisible", !shouldShow);
}

/** Chooses N random Pokémon from the array of eligibles without replacement. */
function chooseRandom(eligiblePokemon: Pokemon[], options: Options): Pokemon[] {
    const generated = [];

    // Deep copy so that we can modify the array as needed.
    const eligiblePokemonDeepCopy: Pokemon[] = deepClone(eligiblePokemon)
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