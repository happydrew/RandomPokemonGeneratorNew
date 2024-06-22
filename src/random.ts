import { addToHistory, toggleHistoryVisibility, displayPrevious, displayNext, toggleShinyDisplay, clearShinies } from "./history.js";
import { convertSearchParamsToOptions, Options, convertOptionsToUrlParams, RequestParams } from "./options.js";
import { Pokemon, displayPokemon } from "./pokemon.js";
import {
    toggleDropdownsOnButtonClick, markLoading, deepClone, removeRandomElement, shuffle, expandMoreOptions,
    collapseMoreOptions, setDropdownIfValid, displayYearsInFooter, getDropdownOptions,
    parseBoolean, setSelectIfValid, getNumrangeOptions, setNumrangeIfValid
} from "./utils.js";

(window as any).generateRandom = generateRandom;
(window as any).expandMoreOptions = expandMoreOptions;
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
const palParkEncounterMinInput = document.getElementById("palParkEncounterRate_min") as HTMLInputElement;
const palParkEncounterMaxInput = document.getElementById("palParkEncounterRate_max") as HTMLInputElement;
const spritesCheckbox = document.getElementById("sprites") as HTMLInputElement;
const naturesCheckbox = document.getElementById("natures") as HTMLInputElement;

const numberDropdown = document.getElementById("n") as HTMLSelectElement;
/** html页面表单的选项控件 */
const STORAGE_OPTIONS_KEY = "options";
const STORAGE_OPTIONS_KEY_V2 = "options_v2";
const STORAGE_PARAMS_KEY = "params";
const STORAGE_FILTER_PARAMS_KEY = "filterParams";
const STORAGE_POKEMONS_KEY = "pokemons";
const queryUrl = "http://localhost:3000/api/queryConditions";
//const queryUrl = "https://randompokemonbackend-zhuges-projects-c7e0a445.vercel.app/api/queryConditions";
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
    window.localStorage.setItem(STORAGE_OPTIONS_KEY_V2, optionsJson);

    // 这行代码的作用是使用 window.history.replaceState() 方法来更新浏览器的历史记录，以便在不刷新页面的情况下更改 URL 地址。
    // 通常，这种技术用于实现单页面应用程序（SPA）中的路由管理。在这种情况下，当用户执行某些操作时（例如选择不同的选项或进行搜索），
    // 页面的状态会发生变化，但是页面本身不会重新加载。相反，开发人员可以使用 JavaScript 更新 URL，以便将当前页面状态反映在 URL 中，
    // 并将新的状态添加到浏览器历史记录中。
    window.history.replaceState({}, "", "?" + convertOptionsToUrlParams(options));
}

function getOptionsFromForm(): Options {
    const requestParams: RequestParams = {};
    // regions
    const regions = getDropdownOptions("regions");
    if (regions) {
        requestParams.regions = regions;
    }
    // types
    const types = getDropdownOptions("types");
    if (types) {
        requestParams.types = types;
    }
    // forms
    const forms = getDropdownOptions("forms");
    if (forms) {
        requestParams.forms = forms;
    }
    // rarity
    const rarity = getDropdownOptions("rarity");
    if (rarity) {
        requestParams.rarity = rarity;
    }
    // generations
    const generations = getDropdownOptions("generations");
    if (generations) {
        requestParams.generations = generations;
    }
    // colors
    const colors = getDropdownOptions("colors");
    if (colors) {
        requestParams.colors = colors;
    }
    // envolves
    const envolves = getDropdownOptions("envolves");
    if (envolves) {
        requestParams.envolves = envolves;
    }
    // baby
    const baby = getDropdownOptions("baby");
    if (baby) {
        requestParams.baby = baby;
    }
    // growthRate
    const growthRate = getDropdownOptions("growthRate");
    if (growthRate) {
        requestParams.growthRate = growthRate;
    }
    // habitats
    const habitats = getDropdownOptions("habitats");
    if (habitats) {
        requestParams.habitats = habitats;
    }
    // eggGroups
    const eggGroups = getDropdownOptions("eggGroups");
    if (eggGroups) {
        requestParams.eggGroups = eggGroups;
    }
    // genderRate
    const genderRate = getDropdownOptions("genderRate");
    if (genderRate) {
        requestParams.genderRate = genderRate;
    }
    // shape
    const shape = getDropdownOptions("shape");
    if (shape) {
        requestParams.shape = shape;
    }
    // defaultForm
    const defaultForm = getDropdownOptions("defaultForm");
    if (defaultForm) {
        requestParams.defaultForm = defaultForm;
    }
    // formSwitchable
    const formSwitchable = getDropdownOptions("formSwitchable");
    if (formSwitchable) {
        requestParams.formSwitchable = formSwitchable;
    }
    // hasGenderDiff
    const hasGenderDiff = getDropdownOptions("hasGenderDiff");
    if (hasGenderDiff) {
        requestParams.hasGenderDiff = hasGenderDiff;
    }
    // height
    const height = getNumrangeOptions("height");
    if (height) {
        requestParams.height = height;
    }
    // weight
    const weight = getNumrangeOptions("weight");
    if (weight) {
        requestParams.weight = weight;
    }
    // baseHappiness
    const baseHappiness = getNumrangeOptions("baseHappiness");
    if (baseHappiness) {
        requestParams.baseHappiness = baseHappiness;
    }
    // captureRate
    const captureRate = getNumrangeOptions("captureRate");
    if (captureRate) {
        requestParams.captureRate = captureRate;
    }
    // hatchCounter
    const hatchCounter = getNumrangeOptions("hatchCounter");
    if (hatchCounter) {
        requestParams.hatchCounter = hatchCounter;
    }
    // hp_range
    const hp_range = getNumrangeOptions("hp_range");
    if (hp_range) {
        requestParams.hp_range = hp_range;
    }
    // attack_range
    const attack_range = getNumrangeOptions("attack_range");
    if (attack_range) {
        requestParams.attack_range = attack_range;
    }
    // defense_range
    const defense_range = getNumrangeOptions("defense_range");
    if (defense_range) {
        requestParams.defense_range = defense_range;
    }
    // spAttack_range
    const spAttack_range = getNumrangeOptions("spAttack_range");
    if (spAttack_range) {
        requestParams.spAttack_range = spAttack_range;
    }
    // spDefense_range
    const spDefense_range = getNumrangeOptions("spDefense_range");
    if (spDefense_range) {
        requestParams.spDefense_range = spDefense_range;
    }
    // speed_range
    const speed_range = getNumrangeOptions("speed_range");
    if (speed_range) {
        requestParams.speed_range = speed_range;
    }
    // hp_effort
    const hp_effort = getDropdownOptions("hp_effort");
    if (hp_effort) {
        requestParams.hp_effort = hp_effort;
    }
    // attack_effort
    const attack_effort = getDropdownOptions("attack_effort");
    if (attack_effort) {
        requestParams.attack_effort = attack_effort;
    }
    // defense_effort
    const defense_effort = getDropdownOptions("defense_effort");
    if (defense_effort) {
        requestParams.defense_effort = defense_effort;
    }
    // spAttack_effort
    const spAttack_effort = getDropdownOptions("spAttack_effort");
    if (spAttack_effort) {
        requestParams.spAttack_effort = spAttack_effort;
    }
    // spDefense_effort
    const spDefense_effort = getDropdownOptions("spDefense_effort");
    if (spDefense_effort) {
        requestParams.spDefense_effort = spDefense_effort;
    }
    // speed_effort
    const speed_effort = getDropdownOptions("speed_effort");
    if (speed_effort) {
        requestParams.speed_effort = speed_effort;
    }

    return {
        filterParams: requestParams,
        showParams: {
            n: parseInt(numberDropdown.value),
            // todo，暂时设为true, 后续再修改
            natures: naturesCheckbox.checked,
            sprites: spritesCheckbox.checked
        }
    };
}

/** Loads options from either the URL or local storage. */
function loadOptions() {
    if (urlHasOptions()) {
        try {
            setOptions(convertUrlParamsToOptions());
        } catch (error) {
            // 抛出异常，说明url参数有问题，转而从缓存中获取
            console.error(error);
            loadOptionsFromCache();
        }
    } else {
        loadOptionsFromCache();
    }
}

function loadOptionsFromCache() {
    const optionsJson = window.localStorage.getItem(STORAGE_OPTIONS_KEY_V2);
    if (optionsJson) {
        setOptions(JSON.parse(optionsJson));
    }
}

function setOptions(options: Partial<Options>) {
    if (options.filterParams.regions != undefined) {
        setDropdownIfValid("regions", options.filterParams.regions);
    }
    if (options.filterParams.types != undefined) {
        setDropdownIfValid("types", options.filterParams.types);
    }
    if (options.filterParams.forms != undefined) {
        setDropdownIfValid("forms", options.filterParams.forms);
    }
    if (options.filterParams.rarity != undefined) {
        setDropdownIfValid("rarity", options.filterParams.rarity);
    }
    if (options.filterParams.generations != undefined) {
        setDropdownIfValid("generations", options.filterParams.generations);
    }
    if (options.filterParams.colors != undefined) {
        setDropdownIfValid("colors", options.filterParams.colors);
    }
    if (options.filterParams.envolves != undefined) {
        setDropdownIfValid("envolves", options.filterParams.envolves);
    }
    if (options.filterParams.baby != undefined) {
        setDropdownIfValid("baby", options.filterParams.baby);
    }
    if (options.filterParams.growthRate != undefined) {
        setDropdownIfValid("growthRate", options.filterParams.growthRate);
    }
    if (options.filterParams.habitats != undefined) {
        setDropdownIfValid("habitats", options.filterParams.habitats);
    }
    if (options.filterParams.eggGroups != undefined) {
        setDropdownIfValid("eggGroups", options.filterParams.eggGroups);
    }
    if (options.filterParams.genderRate != undefined) {
        setDropdownIfValid("genderRate", options.filterParams.genderRate);
    }
    if (options.filterParams.shape != undefined) {
        setDropdownIfValid("shape", options.filterParams.shape);
    }
    if (options.filterParams.defaultForm != undefined) {
        setDropdownIfValid("defaultForm", options.filterParams.defaultForm);
    }
    if (options.filterParams.formSwitchable != undefined) {
        setDropdownIfValid("formSwitchable", options.filterParams.formSwitchable);
    }
    if (options.filterParams.hasGenderDiff != undefined) {
        setDropdownIfValid("hasGenderDiff", options.filterParams.hasGenderDiff);
    }

    if (options.filterParams.height != undefined) {
        setNumrangeIfValid("height", options.filterParams.height);
    }
    if (options.filterParams.weight != undefined) {
        setNumrangeIfValid("weight", options.filterParams.weight);
    }
    if (options.filterParams.baseHappiness != undefined) {
        setNumrangeIfValid("baseHappiness", options.filterParams.baseHappiness);
    }
    if (options.filterParams.captureRate != undefined) {
        setNumrangeIfValid("captureRate", options.filterParams.captureRate);
    }
    if (options.filterParams.hatchCounter != undefined) {
        setNumrangeIfValid("hatchCounter", options.filterParams.hatchCounter);
    }
    // if (options.filterParams.palParkEncounterRate != undefined) {
    //     setNumrangeIfValid("palParkEncounterRate", options.filterParams.palParkEncounterRate);
    // }
    if (options.filterParams.hp_range != undefined) {
        setNumrangeIfValid("hp_range", options.filterParams.hp_range);
    }
    if (options.filterParams.attack_range != undefined) {
        setNumrangeIfValid("attack_range", options.filterParams.attack_range);
    }
    if (options.filterParams.defense_range != undefined) {
        setNumrangeIfValid("defense_range", options.filterParams.defense_range);
    }
    if (options.filterParams.spAttack_range != undefined) {
        setNumrangeIfValid("spAttack_range", options.filterParams.spAttack_range);
    }
    if (options.filterParams.spDefense_range != undefined) {
        setNumrangeIfValid("spDefense_range", options.filterParams.spDefense_range);
    }
    if (options.filterParams.speed_range != undefined) {
        setNumrangeIfValid("speed_range", options.filterParams.speed_range);
    }
    if (options.filterParams.hp_effort != undefined) {
        setDropdownIfValid("hp_effort", options.filterParams.hp_effort);
    }
    if (options.filterParams.attack_effort != undefined) {
        setDropdownIfValid("attack_effort", options.filterParams.attack_effort);
    }
    if (options.filterParams.defense_effort != undefined) {
        setDropdownIfValid("defense_effort", options.filterParams.defense_effort);
    }
    if (options.filterParams.spAttack_effort != undefined) {
        setDropdownIfValid("spAttack_effort", options.filterParams.spAttack_effort);
    }
    if (options.filterParams.spDefense_effort != undefined) {
        setDropdownIfValid("spDefense_effort", options.filterParams.spDefense_effort);
    }
    if (options.filterParams.speed_effort != undefined) {
        setDropdownIfValid("speed_effort", options.filterParams.speed_effort);
    }

    if (options.showParams.natures != undefined) {
        naturesCheckbox.checked = options.showParams.natures;
    }
    if (options.showParams.sprites != undefined) {
        spritesCheckbox.checked = options.showParams.sprites;
    }
    if (options.showParams.n != null) {
        setSelectIfValid("n", options.showParams.n);
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
    displayYearsInFooter();
    clearOldCacheVersion();
}

// 清除旧版本缓存
async function clearOldCacheVersion() {
    window.localStorage.removeItem(STORAGE_OPTIONS_KEY);
    window.localStorage.removeItem(STORAGE_PARAMS_KEY);
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
    const filterParamsStr = JSON.stringify(options.filterParams);
    const filterParamsCache = getFilterParamsCache();
    if (filterParamsCache != null && filterParamsCache == filterParamsStr) {
        pokemonsJson = await getPokemonsCache();
        // 可能混存丢失，或被清除，一般不可能出现（只要params有缓存，pokemons肯定有缓存），
        // 为了防止意外，再拉取一遍
        // TODO, 多数情况下这次调用接口是多余的，有没有更好的办法？
        // if (pokemonsJson.length == 0) {
        //     pokemonsJson = await fetchPokemons(options);
        //     setPokemonsCache(pokemonsJson);
        // }
    } else { // 请求参数变化，或者之前没有缓存过
        pokemonsJson = await fetchPokemons(options);
        setPokemonsCache(pokemonsJson);
        setFilterParamsCache(filterParamsStr);
    }
    // 转换成原型类
    // TODO, 这里要改，单独创建一个类型用作原型类，Pokemon类型只用来存数据
    return pokemonsJson.map(p => new Pokemon(p))
}

async function fetchPokemons(options: Options): Promise<Pokemon[]> {
    //return Promise.resolve([]);
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

function getFilterParamsCache(): string | null {
    return window.localStorage.getItem(STORAGE_FILTER_PARAMS_KEY);
}

function setFilterParamsCache(params: string): void {
    window.localStorage.setItem(STORAGE_FILTER_PARAMS_KEY, params);
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
    // regionDropdown.addEventListener("change", toggleStadiumRentalsCheckbox);
    // toggleStadiumRentalsCheckbox();
    // regionDropdown.addEventListener("change", toggleFormsCheckbox);
    // toggleFormsCheckbox();

    toggleDropdownsOnButtonClick();

    document.querySelectorAll("input[type='checkbox'][data-select-all='true']").forEach(checkbox => {
        checkbox.addEventListener("change", selectAll);
    });

    document.querySelectorAll(".dropdown").forEach((dropdown: HTMLElement) => {
        updateDropdownTitle(dropdown);
        dropdown.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.addEventListener("change", () => updateDropdownTitle(dropdown));
        });
    });

}

function updateDropdownTitle(dropdownContainer: HTMLElement) {
    const button = dropdownContainer.querySelector("button");
    const selectAllCheckbox: HTMLInputElement = dropdownContainer.querySelector("input[type='checkbox'][data-select-all='true']");
    const allCheckboxes: HTMLInputElement[] = Array.from(dropdownContainer.querySelectorAll("input[type='checkbox']:not([data-select-all])"));
    const selectedCheckboxes: HTMLInputElement[] = allCheckboxes.filter(checkbox => checkbox.checked && !checkbox.disabled);
    const allAreSelected = selectedCheckboxes.length == allCheckboxes.length;
    const allowNoSelection = !!button.dataset.allowNone;
    const pluralName = button.dataset.pluralName;

    // Update the "select all" checkbox if one exists.
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selectedCheckboxes.length == allCheckboxes.length;
        selectAllCheckbox.indeterminate = selectedCheckboxes.length > 0 && selectedCheckboxes.length < allCheckboxes.length;
    }

    // Update the text on the title button.
    let displayText;
    if (allowNoSelection && selectedCheckboxes.length == 0) {
        displayText = "No " + pluralName;
    } else if (allAreSelected || selectedCheckboxes.length == 0) {
        displayText = button.dataset.allName ?? ("All " + pluralName);
    } else if (selectedCheckboxes.length == 1) {
        displayText = getNameForCheckbox(selectedCheckboxes[0]);
    } else if (button.dataset.allowShowingTwo && selectedCheckboxes.length == 2) {
        displayText = getNameForCheckbox(selectedCheckboxes[0]) + ", " + getNameForCheckbox(selectedCheckboxes[1]);
    } else {
        const nameForCount = button.dataset.nameForCount ?? pluralName;
        displayText = selectedCheckboxes.length + " " + nameForCount;
    }
    button.innerText = displayText;
}

function getNameForCheckbox(checkbox: HTMLInputElement) {
    if (checkbox.dataset.shortName) {
        return checkbox.dataset.shortName;
    } else {
        return checkbox.parentElement.innerText;
    }
}

function selectAll(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
        return;
    }
    const selectAll = event.target.checked;
    const container = event.target.closest(".popup");
    container.querySelectorAll("input[type='checkbox']:not([data-select-all])")
        .forEach((checkbox: HTMLInputElement) => checkbox.checked = selectAll);
}

// function toggleDropdownsOnButtonClick() {
// 	// Toggle a dropdown by clicking its button. Also close with the Escape key or
// 	// by clicking outside of it.

// 	document.querySelectorAll(".dropdown").forEach(dropdownWrapper => {
// 		const button = dropdownWrapper.querySelector("button");
// 		const popup = dropdownWrapper.querySelector(".popup");
// 		if (popup) {
// 			button.addEventListener("click", e => {
// 				popup.classList.toggle("visible");
// 			});
//             if (!isInViewport(popup)) {
//                 adjustPositionToViewport(popup);
//             }
// 			document.addEventListener("keydown", event => {
// 				if (event.keyCode == 27) {
// 					popup.classList.remove("visible");
// 				}
// 			});
// 			document.addEventListener("click", event => {
// 				if (event.target instanceof HTMLElement && event.target != button
// 						&& !popup.contains(event?.target)) {
// 					popup.classList.remove("visible");
// 				}
// 			});
// 		}
// 	});
// }

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

    while (eligiblePokemonDeepCopy.length > 0 && generated.length < options.showParams.n) {
        // 随机取出一个pokemon
        const pokemon: Pokemon = removeRandomElement(eligiblePokemonDeepCopy);
        generated.push(pokemon);
    }

    // Megas are more likely to appear at the start of the array,
    // so we shuffle for good measure.
    return shuffle(generated);
}