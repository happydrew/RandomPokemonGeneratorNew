import {
    addToHistory, toggleHistoryVisibility, displayPrevious, displayNext, toggleShinyDisplay,
    clearShinies, saveShinies, loadShinies
} from "./history.js";
import { convertSearchParamsToOptions, Options, convertOptionsToUrlParams, FilterParams, ShowParams } from "./options.js";
import { Pokemon, DisplayPokemon, PokemonDetail, displayPokemon } from "./pokemon.js";
import {
    toggleDropdownsOnButtonClick, markLoading, deepClone, removeRandomElement, shuffle, expandMoreOptions,
    collapseMoreOptions, setDropdownIfValid, displayYearsInFooter, getDropdownOptions,
    setSelectIfValid, getNumrangeOptions, setNumrangeIfValid, getCheckboxValueById, setCheckbox,
    expandMoreShowOptions, collapseMoreShowOptions
} from "./utils.js";

(window as any).generateRandom = generateRandom;
(window as any).expandMoreOptions = expandMoreOptions;
(window as any).collapseMoreOptions = collapseMoreOptions;
(window as any).expandMoreShowOptions = expandMoreShowOptions;
(window as any).collapseMoreShowOptions = collapseMoreShowOptions;
(window as any).displayPrevious = displayPrevious;
(window as any).displayNext = displayNext;
(window as any).toggleShinyDisplay = toggleShinyDisplay;
(window as any).clearShinies = clearShinies;
(window as any).processClickTipEvent = processClickTipEvent;
(window as any).processMouseEnterTipEvent = processMouseEnterTipEvent;
(window as any).processMouseLeaveTipEvent = processMouseLeaveTipEvent;
(window as any).playAudioOnClick = playAudioOnClick;

/** html页面表单的选项控件 */
const regionDropdown = document.getElementById("region") as HTMLSelectElement;
const naturesCheckbox = document.getElementById("natures") as HTMLInputElement;

const numberDropdown = document.getElementById("n") as HTMLSelectElement;
/** html页面表单的选项控件 */
const STORAGE_OPTIONS_KEY = "options";
const STORAGE_OPTIONS_KEY_V2 = "options_v2";
const STORAGE_PARAMS_KEY = "params";
const STORAGE_FILTER_PARAMS_KEY = "filterParams";
const STORAGE_POKEMONS_KEY = "pokemons";

// pokemon详情数据缓存
const POKEMON_DETAIL_STORAGE_KEY = "pokemon-details";
const pokemonDetailsCache: PokemonDetail[] = [];
const pokemonDetailsMapCache: { [key: string]: PokemonDetail } = {};
var pokemonDetailsLoaded: boolean = false;
// pokemon详情数据缓存

//const backEndDomain = "http://localhost:3000";
const backEndDomain = "https://randompokemonbackend-zhuges-projects-c7e0a445.vercel.app";

document.addEventListener("DOMContentLoaded", onPageLoad);

/**
 * 页面加载完成后，初始化页面元素
 */
function onPageLoad() {
    wakeUpBackend();
    loadOptions();
    toggleHistoryVisibility();
    addFormChangeListeners();
    addNumrangeValidateListeners();
    addClickTipListeners();
    loadPokemonDetailsFromCache();
    loadShinies();
    //displayYearsInFooter();
    clearOldCacheVersion();
    // 添加reset按钮的点击事件
    addResetButtonListener();
}

function addResetButtonListener() {
    // 设置filter options form的reset按钮点击事件
    // 标志位，防止reset事件被触发两次
    let preventFilterOptionResetEvent = false;
    document.getElementById("filter-options-form").addEventListener('reset', event => {
        if (preventFilterOptionResetEvent) {
            return;
        }
        event.preventDefault();
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <p>Are you sure you want to <strong>reset all filter options</strong>?<br>This will set all filter options to their default state.</p>
            <button id="confirmBtn">Yeah, i'm sure!</button>
            <button id="cancelBtn">No, thanks!</button>
        `;

        const filterFormHTML = event.currentTarget as HTMLFormElement;

        // 点击确定按钮的事件
        modal.querySelector('#confirmBtn').addEventListener('click', function (event: Event) {
            event.stopPropagation();
            preventFilterOptionResetEvent = true;
            filterFormHTML.reset();
            preventFilterOptionResetEvent = false;
            // 触发所有data-select-all checkbox的change事件
            filterFormHTML.querySelectorAll("input[type='checkbox'][data-select-all]").forEach(checkbox => {
                checkbox.dispatchEvent(new Event('change'));
            });
            removeModal();
        });

        // 点击取消按钮的事件
        modal.querySelector('#cancelBtn').addEventListener('click', function (event: Event) {
            event.stopPropagation();
            removeModal();
        });

        // 点击遮罩层的事件
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                removeModal();
            }
        });

        // 将弹窗添加到遮罩层
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function removeModal() {
            document.body.removeChild(overlay);
        }
    });

    // 设置show options form的reset按钮点击事件
    // 标志位，防止reset事件被触发两次
    let preventShowOptionResetEvent = false;
    document.getElementById("show-options-form").addEventListener('reset', event => {
        if (preventShowOptionResetEvent) {
            return;
        }
        event.preventDefault();
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <p>Are you sure you want to <strong>reset all show options</strong>?<br>This will set all show options to their default state.</p>
            <button id="confirmBtn">Yeah, i'm sure!</button>
            <button id="cancelBtn">No, thanks!</button>
        `;

        const showFormHTML = event.currentTarget as HTMLFormElement;

        // 点击确定按钮的事件
        modal.querySelector('#confirmBtn').addEventListener('click', function (event: Event) {
            event.stopPropagation();
            preventShowOptionResetEvent = true;
            showFormHTML.reset();
            preventShowOptionResetEvent = false;
            // 触发所有data-select-all checkbox的change事件
            showFormHTML.querySelectorAll("input[type='checkbox'][data-select-all]").forEach(checkbox => {
                checkbox.dispatchEvent(new Event('change'));
            });
            removeModal();
        });

        // 点击取消按钮的事件
        modal.querySelector('#cancelBtn').addEventListener('click', function (event: Event) {
            event.stopPropagation();
            removeModal();
        });

        // 点击遮罩层的事件
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                removeModal();
            }
        });

        // 将弹窗添加到遮罩层
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function removeModal() {
            document.body.removeChild(overlay);
        }
    });
}

async function wakeUpBackend() {
    const reponse = await fetch(backEndDomain + "/api/queryConditions?wakeup");
    if (reponse.ok) {
        console.log("backend queryConditions wakeup success")
    } else {
        console.error("backend queryConditions wakeup failed")
    }
    const reponse2 = await fetch(backEndDomain + "/api/pokemon-details?wakeup");
    if (reponse2.ok) {
        console.log("backend pokemon-details wakeup success")
    } else {
        console.error("backend pokemon-details wakeup failed")
    }
}

/** Called when the Generate button is clicked. */
async function generateRandom() {
    markLoading(true);
    const options = getOptionsFromForm();
    // 用于测试
    // options.showParams = {
    //     n: 6,
    //     //generate: boolean;
    //     /** 是否展示pokemon图片 */
    //     sprites: true,
    //     /** 是否展示pokemon的背景图,取决于type */
    //     background_image: true,
    //     /** 是否展示背景色，即pokemon的颜色 */
    //     background_color: true,
    //     /** 是否展示pokemon的世代 */
    //     showGeneration: true,
    //     /** 是否展示pokemon的region */
    //     showRegion: true,
    //     /** 是否展示pokemon的稀有度 */
    //     showRarity: true,
    //     /** 是否展示pokemon的属性 */
    //     showTypes: true,
    //     /** 是否为每个pokemon随机生成一个性格 */
    //     natures: true,
    //     /** 是否展示pokemon的base stats */
    //     showStats: true,
    //     /** 是否展示pokemon的努力值Effort Values, EVs */
    //     evs: true,
    //     /** 是否为每个pokemon随机生成个体值iv */
    //     ivs: true,
    //     /** 是否展示pokemon的能力值 */
    //     showAblilites: true,
    //     /** 是否展示pokemon的叫声 */
    //     cries: true,
    //     // 获取shiny的概率，默认是1/1000
    //     shinyProb: 0.5
    //     /** 是否展示pokemon的性别 */
    //     //genders?: boolean
    // }
    persistOptions(options);
    try {
        const eligiblePokemon = await getEligiblePokemon(options);
        const generatedPokemons = options.showParams.n == "all" ? eligiblePokemon : chooseRandom(eligiblePokemon, options);
        // 先发起详情数据请求
        const needFecthIds: number[] = generatedPokemons.filter(p => !(p.id.toString() in pokemonDetailsMapCache)).map(p => p.id);
        var response: Promise<Response> = null;
        if (needFecthIds.length > 0) {
            response = fetch(backEndDomain + "/api/pokemon-details?ids=" + needFecthIds.join(","));
        }
        // 先显示立即就能获取的内容，以及已有的详情数据
        const displayPokemons: DisplayPokemon[] = generatedPokemons.map(p => new DisplayPokemon(null, p, pokemonDetailsMapCache[p.id.toString()], options.showParams))
        const resultsHTML = displayPokemon(displayPokemons, document.getElementById("results"));
        const displayPokemonMap = new Map<string, DisplayPokemon>();
        displayPokemons.forEach(dp => displayPokemonMap.set(dp.id.toString(), dp));
        const existIds: number[] = generatedPokemons.filter(p => p.id.toString() in pokemonDetailsMapCache).map(p => p.id);
        // 异步加载详情数据
        if (null != response) {
            renderAndSavePokemons(response, resultsHTML, displayPokemonMap);
        }
        addToHistory(displayPokemons);
        // 保存已经有详情数据的shiny pokemons
        // 需要从服务器拉去详情数据的shiny pokemons会在renderAndSavePokemons方法中被保存
        saveShinies(existIds.map(id => displayPokemonMap.get(id.toString())));
        const shinyCount = displayPokemons.filter(dp => dp.shiny).length;
        if (shinyCount > 0) {
            displayShinyTip(shinyCount);
        }
    } catch (error) {
        console.error(error);
        displayPokemon(null, null);
    }
    markLoading(false);
}

function displayShinyTip(shinyCount: number) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // 创建弹窗
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <p><strong class="shiny-tip-highlight">Wow!</strong> You've encountered <strong class="shiny-tip-highlight">${shinyCount}</strong> shiny Pokémon${shinyCount > 1 ? "s" : ""}! Go take a look at it!</p>
        <button id="confirmBtn">Sure, let's go!</button>
        <button id="cancelBtn">Not now, thanks.</button>
    `;

    // 点击确定按钮的事件
    modal.querySelector('#confirmBtn').addEventListener('click', function (event: Event) {
        event.stopPropagation();
        removeModal();
        // 模拟点击shiny按钮，并将窗口滑动到shiny展示区域
        const shinyTogglerHTML = document.getElementById("shiny-toggler");
        toggleShinyDisplay(false);
        shinyTogglerHTML.scrollIntoView({ behavior: "smooth" });
    });

    // 点击取消按钮的事件
    modal.querySelector('#cancelBtn').addEventListener('click', function (event: Event) {
        event.stopPropagation();
        removeModal();
    });

    // 点击遮罩层的事件
    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            removeModal();
        }
    });

    // 将弹窗添加到遮罩层
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function removeModal() {
        document.body.removeChild(overlay);
    }
}


async function renderAndSavePokemons(fetchDetailResponse: Promise<Response>, resultsHTML: HTMLElement, displayPokemonsMap: Map<string, DisplayPokemon>) {
    fetchDetailResponse.then(response => {
        if (response.ok) {
            response.json().then((pokemonDetails: PokemonDetail[]) => {
                console.log("拉取详情数据成功，具体数据为：" + JSON.stringify(pokemonDetails));
                // 显示详情数据
                pokemonDetails.forEach(pd => displayPokemonsMap.get(pd.id.toString()).pokemonDetail = pd);
                // 有可能接口返回较慢，而用户点击很快，此时已经又点了一次gengerate，
                // 结果区域已经转到下一次的生成结果了，此时当前这次的显示结果的元素已经被移除，
                // 导致后续的详情数据渲染失败，因此这里需要捕获异常并做处理
                try {
                    const pokecardHTMLMap = new Map<string, HTMLElement>();
                    resultsHTML.querySelectorAll(".pokecard-containter").forEach((pokecardContainter: HTMLElement) => {
                        pokecardHTMLMap.set(pokecardContainter.id, pokecardContainter)
                    });
                    pokemonDetails.forEach(pokemonDetail => {
                        const displayPokemon = displayPokemonsMap.get(pokemonDetail.id.toString());
                        const pokecardContainter = pokecardHTMLMap.get(pokemonDetail.id.toString());
                        // 设置背景色
                        pokecardContainter.style.cssText = `${displayPokemon.showParams.background_color ? `background-color:${displayPokemon.getBackgroudColorHex()};` : `background-color:transparent;border:none`}`;
                        // 设置背景图
                        if (displayPokemon.showParams.background_image) {
                            const pokeImageBackHTML = pokecardContainter.querySelector(".pokecard-pokeimage-back") as HTMLImageElement;
                            pokeImageBackHTML.src = displayPokemon.getBackgroundImage();
                            pokeImageBackHTML.alt = `back image of pokemon type ${displayPokemon.getTypesArray()[0]}`;
                        }
                        const pokeImageContainerHTML = pokecardContainter.querySelector(".pokecard-pokeimage-container");
                        // 显示稀有度
                        if (displayPokemon.showParams.showRarity && (displayPokemon.getRarity() === "Mythical" || displayPokemon.getRarity() === "Legendary")) {
                            const rarityHTML = document.createElement("div");
                            rarityHTML.classList.add("pokecard-header-rarity");
                            rarityHTML.style.cssText = `background-color: ${displayPokemon.getRarityColor()}`;
                            rarityHTML.innerText = displayPokemon.getRarity();
                            pokeImageContainerHTML.appendChild(rarityHTML);
                        }
                        // 显示type信息
                        if (displayPokemon.showParams.showTypes) {
                            const typeHTML = document.createElement("div");
                            typeHTML.classList.add("pokecard-types-container");
                            typeHTML.style.cssText = `background: ${displayPokemon.getTypesArray().length > 1 ? `linear-gradient(105deg, ${displayPokemon.getTypeBackColor(displayPokemon.getTypesArray()[0])} 48%, ${displayPokemon.getTypeBackColor(displayPokemon.getTypesArray()[1])} calc(48% + 1px))` : displayPokemon.getTypeBackColor(displayPokemon.getTypesArray()[0])}`;
                            typeHTML.innerHTML = `<div class="pokecard-type click-tip" data-click-tip="${displayPokemon.getTypesArray()[0]}" onclick="processClickTipEvent(this,event)" onmouseenter="processMouseEnterTipEvent(this,event)" onmouseleave="processMouseLeaveTipEvent(this,event)" tool-tip-style="color:${displayPokemon.getTypeBackColor(displayPokemon.getTypesArray()[0])}">
									<img src="./img/type-icons/40px-${displayPokemon.getTypesArray()[0]}_icon.png"
										alt="icon of type ${displayPokemon.getTypesArray()[0]}">
								</div>
							${displayPokemon.getTypesArray().length > 1 ? `
							    <div class="pokecard-type click-tip" data-click-tip="${displayPokemon.getTypesArray()[1]}" onclick="processClickTipEvent(this,event)" onmouseenter="processMouseEnterTipEvent(this,event)" onmouseleave="processMouseLeaveTipEvent(this,event)" tool-tip-style="color:${displayPokemon.getTypeBackColor(displayPokemon.getTypesArray()[1])}">
									<img src="./img/type-icons/40px-${displayPokemon.getTypesArray()[1]}_icon.png"
										alt="icon of type ${displayPokemon.getTypesArray()[1]}">
								</div>`: ""}`;
                            pokeImageContainerHTML.appendChild(typeHTML);
                        }
                        // 显示世代信息
                        if (displayPokemon.showParams.showGeneration) {
                            (pokecardContainter.querySelector("span.pokecard-generation-arabic") as HTMLElement).innerText = displayPokemon.getGenerationArabic();
                        }
                        // 显示region信息
                        if (displayPokemon.showParams.showRegion) {
                            pokecardContainter.querySelector(".pokecard-infobar-container-region").querySelector(".pokecard-infobar.light-scrollbar").innerHTML = displayPokemon.getRegionText();
                        }
                        // 显示ablilites信息
                        if (displayPokemon.showParams.showAblilites) {
                            pokecardContainter.querySelector(".pokecard-infobar-container-abilities").querySelector(".pokecard-abilities").innerHTML = displayPokemon.pokemonDetail.abilities.join(", ");
                        }
                        // 显示evs信息
                        if (displayPokemon.showParams.evs) {
                            const evsHTML = pokecardContainter.querySelector(".pokecard-stats .tr-evs");
                            evsHTML.querySelector(".col-hp").innerHTML = displayPokemon.pokemonDetail.stats.hp.effort.toString();
                            evsHTML.querySelector(".col-atk").innerHTML = displayPokemon.pokemonDetail.stats.attack.effort.toString();
                            evsHTML.querySelector(".col-def").innerHTML = displayPokemon.pokemonDetail.stats.defense.effort.toString();
                            evsHTML.querySelector(".col-spa").innerHTML = displayPokemon.pokemonDetail.stats["special-attack"].effort.toString();
                            evsHTML.querySelector(".col-spd").innerHTML = displayPokemon.pokemonDetail.stats["special-defense"].effort.toString();
                            evsHTML.querySelector(".col-spe").innerHTML = displayPokemon.pokemonDetail.stats.speed.effort.toString();
                            evsHTML.querySelector(".col-totle:last-child").innerHTML = (displayPokemon.pokemonDetail.stats.hp.effort +
                                displayPokemon.pokemonDetail.stats.attack.effort +
                                displayPokemon.pokemonDetail.stats.defense.effort +
                                displayPokemon.pokemonDetail.stats["special-attack"].effort +
                                displayPokemon.pokemonDetail.stats["special-defense"].effort +
                                displayPokemon.pokemonDetail.stats.speed.effort).toString();
                        }
                        // 显示stats信息
                        if (displayPokemon.showParams.showStats) {
                            const statsHTML = pokecardContainter.querySelector(".pokecard-stats .tr-stats");
                            statsHTML.querySelector(".col-hp").innerHTML = displayPokemon.pokemonDetail.stats.hp.base_stat.toString();
                            statsHTML.querySelector(".col-atk").innerHTML = displayPokemon.pokemonDetail.stats.attack.base_stat.toString();
                            statsHTML.querySelector(".col-def").innerHTML = displayPokemon.pokemonDetail.stats.defense.base_stat.toString();
                            statsHTML.querySelector(".col-spa").innerHTML = displayPokemon.pokemonDetail.stats["special-attack"].base_stat.toString();
                            statsHTML.querySelector(".col-spd").innerHTML = displayPokemon.pokemonDetail.stats["special-defense"].base_stat.toString();
                            statsHTML.querySelector(".col-spe").innerHTML = displayPokemon.pokemonDetail.stats.speed.base_stat.toString();
                            statsHTML.querySelector(".col-totle:last-child").innerHTML = (displayPokemon.pokemonDetail.stats.hp.base_stat +
                                displayPokemon.pokemonDetail.stats.attack.base_stat +
                                displayPokemon.pokemonDetail.stats.defense.base_stat +
                                displayPokemon.pokemonDetail.stats["special-attack"].base_stat +
                                displayPokemon.pokemonDetail.stats["special-defense"].base_stat +
                                displayPokemon.pokemonDetail.stats.speed.base_stat).toString();
                        }
                    });
                } catch (error) {
                    console.warn("本次渲染失败", error);
                }
                pokemonDetailsCache.push(...pokemonDetails)
                pokemonDetails.forEach(p => pokemonDetailsMapCache[p.id.toString()] = p)
                window.localStorage.setItem(POKEMON_DETAIL_STORAGE_KEY, JSON.stringify(pokemonDetailsCache));
                // 保存本次请求数据的shiny pokemon
                saveShinies(pokemonDetails.map(pd => displayPokemonsMap.get(pd.id.toString())));
            });
        }
    })
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
    const filterParams: FilterParams = {};
    // regions
    const regions = getDropdownOptions("regions");
    if (regions) {
        filterParams.regions = regions;
    }
    // types
    const types = getDropdownOptions("types");
    if (types) {
        filterParams.types = types;
    }
    // forms
    const forms = getDropdownOptions("forms");
    if (forms) {
        filterParams.forms = forms;
    }
    // rarity
    const rarity = getDropdownOptions("rarity");
    if (rarity) {
        filterParams.rarity = rarity;
    }
    // generations
    const generations = getDropdownOptions("generations");
    if (generations) {
        filterParams.generations = generations;
    }
    // colors
    const colors = getDropdownOptions("colors");
    if (colors) {
        filterParams.colors = colors;
    }
    // envolves
    const envolves = getDropdownOptions("envolves");
    if (envolves) {
        filterParams.envolves = envolves;
    }
    // baby
    const baby = getDropdownOptions("baby");
    if (baby) {
        filterParams.baby = baby;
    }
    // growthRate
    const growthRate = getDropdownOptions("growthRate");
    if (growthRate) {
        filterParams.growthRate = growthRate;
    }
    // habitats
    const habitats = getDropdownOptions("habitats");
    if (habitats) {
        filterParams.habitats = habitats;
    }
    // eggGroups
    const eggGroups = getDropdownOptions("eggGroups");
    if (eggGroups) {
        filterParams.eggGroups = eggGroups;
    }
    // genderRate
    const genderRate = getDropdownOptions("genderRate");
    if (genderRate) {
        filterParams.genderRate = genderRate;
    }
    // shape
    const shape = getDropdownOptions("shape");
    if (shape) {
        filterParams.shape = shape;
    }
    // defaultForm
    const defaultForm = getDropdownOptions("defaultForm");
    if (defaultForm) {
        filterParams.defaultForm = defaultForm;
    }
    // formSwitchable
    const formSwitchable = getDropdownOptions("formSwitchable");
    if (formSwitchable) {
        filterParams.formSwitchable = formSwitchable;
    }
    // hasGenderDiff
    const hasGenderDiff = getDropdownOptions("hasGenderDiff");
    if (hasGenderDiff) {
        filterParams.hasGenderDiff = hasGenderDiff;
    }
    // height
    const height = getNumrangeOptions("height");
    if (height) {
        filterParams.height = height;
    }
    // weight
    const weight = getNumrangeOptions("weight");
    if (weight) {
        filterParams.weight = weight;
    }
    // baseHappiness
    const baseHappiness = getNumrangeOptions("baseHappiness");
    if (baseHappiness) {
        filterParams.baseHappiness = baseHappiness;
    }
    // captureRate
    const captureRate = getNumrangeOptions("captureRate");
    if (captureRate) {
        filterParams.captureRate = captureRate;
    }
    // hatchCounter
    const hatchCounter = getNumrangeOptions("hatchCounter");
    if (hatchCounter) {
        filterParams.hatchCounter = hatchCounter;
    }
    // hp_range
    const hp_range = getNumrangeOptions("hp_range");
    if (hp_range) {
        filterParams.hp_range = hp_range;
    }
    // attack_range
    const attack_range = getNumrangeOptions("attack_range");
    if (attack_range) {
        filterParams.attack_range = attack_range;
    }
    // defense_range
    const defense_range = getNumrangeOptions("defense_range");
    if (defense_range) {
        filterParams.defense_range = defense_range;
    }
    // spAttack_range
    const spAttack_range = getNumrangeOptions("spAttack_range");
    if (spAttack_range) {
        filterParams.spAttack_range = spAttack_range;
    }
    // spDefense_range
    const spDefense_range = getNumrangeOptions("spDefense_range");
    if (spDefense_range) {
        filterParams.spDefense_range = spDefense_range;
    }
    // speed_range
    const speed_range = getNumrangeOptions("speed_range");
    if (speed_range) {
        filterParams.speed_range = speed_range;
    }
    // hp_effort
    const hp_effort = getDropdownOptions("hp_effort");
    if (hp_effort) {
        filterParams.hp_effort = hp_effort;
    }
    // attack_effort
    const attack_effort = getDropdownOptions("attack_effort");
    if (attack_effort) {
        filterParams.attack_effort = attack_effort;
    }
    // defense_effort
    const defense_effort = getDropdownOptions("defense_effort");
    if (defense_effort) {
        filterParams.defense_effort = defense_effort;
    }
    // spAttack_effort
    const spAttack_effort = getDropdownOptions("spAttack_effort");
    if (spAttack_effort) {
        filterParams.spAttack_effort = spAttack_effort;
    }
    // spDefense_effort
    const spDefense_effort = getDropdownOptions("spDefense_effort");
    if (spDefense_effort) {
        filterParams.spDefense_effort = spDefense_effort;
    }
    // speed_effort
    const speed_effort = getDropdownOptions("speed_effort");
    if (speed_effort) {
        filterParams.speed_effort = speed_effort;
    }

    // showParams
    const showParams: ShowParams = {};
    showParams.n = numberDropdown.value;
    showParams.sprites = getCheckboxValueById("sprites");
    showParams.background_image = getCheckboxValueById("backImg");
    showParams.background_color = getCheckboxValueById("backColor");
    showParams.showGeneration = getCheckboxValueById("showGeneration");
    showParams.showRegion = getCheckboxValueById("showRegion");
    showParams.showRarity = getCheckboxValueById("showRarity");
    showParams.showTypes = getCheckboxValueById("showTypes");
    showParams.natures = getCheckboxValueById("natures");
    showParams.showStats = getCheckboxValueById("showStats");
    showParams.evs = getCheckboxValueById("evs");
    showParams.ivs = getCheckboxValueById("ivs");
    showParams.showAblilites = getCheckboxValueById("showAblilites");
    showParams.cries = getCheckboxValueById("cries");
    showParams.shinyProb = parseFloat((document.getElementById("shinyProb") as HTMLInputElement).value);

    return {
        filterParams: filterParams,
        showParams: showParams
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

    // showParams
    if (options.showParams.n != null) {
        setSelectIfValid("n", options.showParams.n);
    }
    if (options.showParams.sprites != undefined) {
        setCheckbox("sprites", options.showParams.sprites)
    }
    if (options.showParams.natures != undefined) {
        setCheckbox("natures", options.showParams.natures)
    }
    if (options.showParams.background_image != undefined) {
        setCheckbox("backImg", options.showParams.background_image)
    }
    if (options.showParams.background_color != undefined) {
        setCheckbox("backColor", options.showParams.background_color)
    }
    if (options.showParams.showGeneration != undefined) {
        setCheckbox("showGeneration", options.showParams.showGeneration)
    }
    if (options.showParams.showRegion != undefined) {
        setCheckbox("showRegion", options.showParams.showRegion)
    }
    if (options.showParams.showRarity != undefined) {
        setCheckbox("showRarity", options.showParams.showRarity)
    }
    if (options.showParams.showTypes != undefined) {
        setCheckbox("showTypes", options.showParams.showTypes)
    }
    if (options.showParams.showStats != undefined) {
        setCheckbox("showStats", options.showParams.showStats)
    }
    if (options.showParams.evs != undefined) {
        setCheckbox("evs", options.showParams.evs)
    }
    if (options.showParams.ivs != undefined) {
        setCheckbox("ivs", options.showParams.ivs)
    }
    if (options.showParams.showAblilites != undefined) {
        setCheckbox("showAblilites", options.showParams.showAblilites)
    }
    if (options.showParams.cries != undefined) {
        setCheckbox("cries", options.showParams.cries)
    }
    if (options.showParams.shinyProb != undefined) {
        (document.getElementById("shinyProb") as HTMLInputElement).value = options.showParams.shinyProb.toString();
    }
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

/**
 * Loads the Pokémon details from the cache, if available.
 */
async function loadPokemonDetailsFromCache() {
    const cacheData = window.localStorage.getItem(POKEMON_DETAIL_STORAGE_KEY);
    if (cacheData) {
        const cachePokemons: PokemonDetail[] = JSON.parse(cacheData);
        pokemonDetailsCache.push(...cachePokemons)
        for (const p of pokemonDetailsCache) {
            pokemonDetailsMapCache[p.id.toString()] = p;
        }
    }
    pokemonDetailsLoaded = true;
}

/**
 *  Fetches details for not cached Pokémons.
 * @param pokemons Pokémon to display.
 */
async function fetchPokemonDetails(pokemons: Pokemon[]) {
    // 首先从本地缓存中获取数据
    const needFecthIds: number[] = pokemons.filter(p => !(p.id.toString() in pokemonDetailsMapCache)).map(p => p.id)
    if (needFecthIds.length > 0) {
        const response = await fetch(backEndDomain + "/api/pokemon-details?ids=" + needFecthIds.join(","));
        if (response.ok) {
            const pokemonDetails: PokemonDetail[] = await response.json();
            pokemonDetailsCache.push(...pokemonDetails)
            pokemonDetails.forEach(p => pokemonDetailsMapCache[p.id.toString()] = p)
            window.localStorage.setItem(POKEMON_DETAIL_STORAGE_KEY, JSON.stringify(pokemonDetailsCache));
        } else {
            console.error("Failed to fetch pokemon details from server.");
            throw new Error("Opps, something went wrong, please try again later.");
        }
    }
}

// 清除旧版本缓存
async function clearOldCacheVersion() {
    window.localStorage.removeItem(STORAGE_OPTIONS_KEY);
    window.localStorage.removeItem(STORAGE_PARAMS_KEY);
}

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
    return pokemonsJson;
}

async function fetchPokemons(options: Options): Promise<Pokemon[]> {
    //return Promise.resolve([]);
    const url = backEndDomain + "/api/queryConditions?" + convertOptionsToUrlParams(options);
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

/**
 * 添加数字范围校验监听器， 自动更正超出范围的值
 */
function addNumrangeValidateListeners() {
    document.querySelectorAll("input[type='number']").forEach((numberInput: HTMLInputElement) => {
        numberInput.addEventListener("blur", () => {
            const curValue = parseFloat(numberInput.value)
            if (Number.isNaN(curValue)) {
                numberInput.value = numberInput.getAttribute("value");
                return;
            }
            // 校验最小值
            const minValStr = numberInput.getAttribute("min")
            if (minValStr) {
                const minValue = parseFloat(minValStr);
                if (curValue < minValue) {
                    numberInput.value = minValStr
                }
            }
            // 校验最大值
            const maxValStr = numberInput.getAttribute("max")
            if (maxValStr) {
                const maxValue = parseFloat(maxValStr);
                if (curValue > maxValue) {
                    numberInput.value = maxValStr
                }
            }
        })
    })
}

// 全局变量，记录当前显示的提示框和点击提示框
var currentClickTooltip: HTMLElement = null;
var currentClickTipElement: HTMLElement = null;
var currentHoverToolTip: HTMLElement = null;
var currentHoverTipElement: HTMLElement = null;

function addClickTipListeners() {
    document.querySelectorAll('.click-tip').forEach(clickTip => {
        clickTip.addEventListener('click', getClickTipListener(clickTip as HTMLElement));
    });

    // 点击提示框以外的地方时隐藏提示框
    document.addEventListener('click', (event) => {
        if (currentClickTooltip && !currentClickTooltip.contains(event.target as HTMLElement)
            && !currentClickTipElement.contains(event.target as HTMLElement)) {
            currentClickTooltip.remove();
            currentClickTooltip = null;
            currentClickTipElement = null;
        }
    });
}

/**
 * 获取点击提示的事件监听函数
 * @param clickElement 
 * @param event 
 * @returns 
 */
function getClickTipListener(clickElement: HTMLElement): (event: Event) => void {
    return (event: Event) => processClickTipEvent(clickElement, event);
}

/**
 * 点击提示tip的事件监听函数
 * @param clickElement 
 * @param event 
 * @returns 
 */
function processClickTipEvent(clickElement: HTMLElement, event: Event) {
    const content = clickElement.getAttribute('data-click-tip');
    // 如果该元素的悬浮提示框正在显示，则隐藏它
    if (currentHoverToolTip && currentHoverTipElement == event.currentTarget) {
        currentHoverToolTip.remove();
        currentHoverToolTip = null;
        currentHoverTipElement = null;
    }
    // 如果该元素的点击提示框正在显示，则这次事件负责隐藏它
    if (currentClickTipElement && currentClickTipElement == event.currentTarget) {
        currentClickTooltip.remove();
        currentClickTooltip = null;
        currentClickTipElement = null;
        return;
    }
    // 如果已经有一个提示框在显示，先隐藏它
    if (currentClickTooltip) {
        currentClickTooltip.remove();
        currentClickTooltip = null;
    }

    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.className = 'click-tip-tooltip';
    if (clickElement.hasAttribute("tool-tip-style")) {
        tooltip.style.cssText = clickElement.getAttribute("tool-tip-style");
    }
    tooltip.textContent = content || '';
    tooltip.style.maxWidth = window.innerWidth + "px";
    tooltip.style.display = 'block';
    tooltip.style.visibility = 'hidden';
    document.body.appendChild(tooltip);

    // 设置提示框位置
    const clickRect = clickElement.getBoundingClientRect();

    // 首先决定提示框的横向位置，即左边缘的位置
    let tooltipLeft = Math.min(clickRect.right - 0.5 * clickElement.offsetWidth, window.innerWidth - tooltip.offsetWidth) + window.scrollX;
    tooltip.style.left = tooltipLeft + "px";
    // 决定提示框的纵向位置，即上边缘的位置
    // 主元素上下两边，哪边空间更大，就往哪边放
    let clickUpDistance = clickRect.top;
    let clickDownDistance = window.innerHeight - clickRect.bottom;
    if (clickDownDistance > clickUpDistance) {
        // 下边空间大，往下边放
        let tooltipTop = Math.min(clickRect.bottom, window.innerHeight - tooltip.offsetHeight) + window.scrollY;
        tooltip.style.top = tooltipTop + "px";
    } else {
        // 上边空间大，往上边放
        let tooltipTop = Math.max(clickRect.top, tooltip.offsetHeight) + window.scrollY - tooltip.offsetHeight;
        tooltip.style.top = tooltipTop + "px";
    }
    // 显示提示框
    tooltip.style.visibility = "visible";
    currentClickTooltip = tooltip;
    currentClickTipElement = clickElement;
}

/**
 * 悬浮提示tip的事件监听函数
 * @param hoverElement 
 * @param event 
 * @returns 
 */
function processMouseEnterTipEvent(hoverElement: HTMLElement, event: Event) {
    const content = hoverElement.getAttribute('data-click-tip');
    // 如果该元素的点击提示框,或悬浮提示框正在显示，则不做任何操作
    if ((currentClickTooltip && currentClickTipElement == event.currentTarget) ||
        (currentHoverToolTip && currentHoverTipElement == event.currentTarget)) {
        return;
    }

    // 如果有其他元素的悬浮提示框正在显示，先隐藏它（这里做个保护，正常情况下不会出现这种情况）
    if (currentHoverToolTip) {
        currentHoverToolTip.remove();
        currentHoverToolTip = null;
    }

    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.className = 'click-tip-tooltip';
    if (hoverElement.hasAttribute("tool-tip-style")) {
        tooltip.style.cssText = hoverElement.getAttribute("tool-tip-style");
    }
    tooltip.textContent = content || '';
    tooltip.style.maxWidth = window.innerWidth + "px";
    tooltip.style.display = 'block';
    tooltip.style.visibility = 'hidden';
    document.body.appendChild(tooltip);

    // 设置提示框位置
    const hoverEleRect = hoverElement.getBoundingClientRect();

    // 首先决定提示框的横向位置，即左边缘的位置
    let tooltipLeft = Math.min(hoverEleRect.right - 0.5 * hoverElement.offsetWidth, window.innerWidth - tooltip.offsetWidth) + window.scrollX;
    tooltip.style.left = tooltipLeft + "px";
    // 决定提示框的纵向位置，即上边缘的位置
    // 主元素上下两边，哪边空间更大，就往哪边放
    let hoverUpDistance = hoverEleRect.top;
    let hoverDownDistance = window.innerHeight - hoverEleRect.bottom;
    if (hoverDownDistance > hoverUpDistance) {
        // 下边空间大，往下边放
        let tooltipTop = Math.min(hoverEleRect.bottom, window.innerHeight - tooltip.offsetHeight) + window.scrollY;
        tooltip.style.top = tooltipTop + "px";
    } else {
        // 上边空间大，往上边放
        let tooltipTop = Math.max(hoverEleRect.top, tooltip.offsetHeight) + window.scrollY - tooltip.offsetHeight;
        tooltip.style.top = tooltipTop + "px";
    }
    // 显示提示框
    tooltip.style.visibility = "visible";
    currentHoverToolTip = tooltip;
    currentHoverTipElement = hoverElement;
}

/**
 * 悬浮提示tip的mouseleave事件监听函数
 * @param hoverElement 
 * @param event 
 * @returns 
 */
function processMouseLeaveTipEvent(hoverElement: HTMLElement, event: Event) {
    if (currentHoverToolTip && currentHoverTipElement == event.currentTarget) {
        currentHoverToolTip.remove();
        currentHoverToolTip = null;
        currentHoverTipElement = null;
    }
}

/**
 * 音频播放按钮的点击事件监听函数
 * @param clickElement 音频播放元素
 * @param event 
 */
function playAudioOnClick(clickElement: HTMLElement, event: Event) {
    const audioSrc = clickElement.getAttribute("data-audio-src");
    if (audioSrc) {
        new Audio(audioSrc).play();
    }
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

    while (eligiblePokemonDeepCopy.length > 0 && generated.length < parseInt(options.showParams.n)) {
        // 随机取出一个pokemon
        const pokemon: Pokemon = removeRandomElement(eligiblePokemonDeepCopy);
        generated.push(pokemon);
    }

    // Megas are more likely to appear at the start of the array,
    // so we shuffle for good measure.
    return shuffle(generated);
}