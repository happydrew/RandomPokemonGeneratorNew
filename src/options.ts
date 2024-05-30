const STORAGE_OPTIONS_KEY = "options";

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

type Options = {
	region: string;
	type: string;
	color: string;
	growthRate: string;
	habitat: string;
	legendaries: boolean;
	mythical: boolean;
	nfes: boolean;
	allowVarieties: boolean;
	baby: boolean;
	height_min: number;
	height_max: number;
	weight_min: number;
	weight_max: number;
	baseHappiness_min: number;
	baseHappiness_max: number;
	captureRate_min: number;
	captureRate_max: number;
	hatchCounter_min: number;
	hatchCounter_max: number;
	n: number;
	//generate: boolean;
	natures: boolean
}

function getOptionsFromForm(): Options {
	return {
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
		hatchCounter_max: parseFloat(hatchCounterMaxInput.value),
		n: parseInt(numberDropdown.value),
		// todo，暂时设为true, 后续再修改
		natures: true
	};
}

function setOptions(options: Partial<Options>) {
	if (options.n != null) {
		setDropdownIfValid(numberDropdown, options.n);
	}
	if (options.region != null) {
		setDropdownIfValid(regionDropdown, options.region);
	}
	if (options.type != null) {
		setDropdownIfValid(typeDropdown, options.type);
	}
	if (options.color != null) {
		setDropdownIfValid(colorDropdown, options.color);
	}
	if (options.growthRate != null) {
		setDropdownIfValid(growthRateDropdown, options.growthRate);
	}
	if (options.habitat != null) {
		setDropdownIfValid(habitatDropdown, options.habitat);
	}
	if (options.legendaries != null) {
		legendariesCheckbox.checked = options.legendaries;
	}
	if (options.mythical != null) {
		mythicalCheckbox.checked = options.mythical;
	}
	if (options.nfes != null) {
		nfesCheckbox.checked = options.nfes;
	}
	if (options.allowVarieties != null) {
		allowVarietiesCheckbox.checked = options.allowVarieties;
	}
	if (options.baby != null) {
		babyCheckbox.checked = options.baby;
	}
	if (options.height_min != null) {
		heightMinInput.value = options.height_min.toString();
	}
	if (options.height_max != null) {
		heightMaxInput.value = options.height_max.toString();
	}
	if (options.height_min != null) {
		heightMinInput.value = options.height_min.toString();
	}
	if (options.height_max != null) {
		heightMaxInput.value = options.height_max.toString();
	}
	if (options.weight_min != null) {
		weightMinInput.value = options.weight_min.toString();
	}
	if (options.weight_max != null) {
		weightMaxInput.value = options.weight_max.toString();
	}
	if (options.baseHappiness_min != null) {
		baseHappinessMinInput.value = options.baseHappiness_min.toString();
	}
	if (options.baseHappiness_max != null) {
		baseHappinessMaxInput.value = options.baseHappiness_max.toString();
	}
	if (options.captureRate_min != null) {
		captureRateMinInput.value = options.captureRate_min.toString();
	}
	if (options.captureRate_max != null) {
		captureRateMaxInput.value = options.captureRate_max.toString();
	}
	if (options.hatchCounter_min != null) {
		hatchCounterMinInput.value = options.hatchCounter_min.toString();
	}
	if (options.hatchCounter_max != null) {
		hatchCounterMaxInput.value = options.hatchCounter_max.toString();
	}

	if (options.generate !== undefined) {
		generateRandom();
	}
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

/** Returns whether or not the URL specifies any options as parameters. */
function urlHasOptions(): boolean {
	const queryString = window.location.href.split("?")[1];
	return queryString && queryString.length > 0;
}

/** Parses options from the URL parameters. */
function convertUrlParamsToOptions(): Partial<Options> {
	const options: Partial<Options> = {};
	const params = new URL(window.location.href).searchParams;

	if (params.has("region")) {
		options.region = params.get("region");
	}
	if (params.has("type")) {
		options.type = params.get("type");
	}
	if (params.has("color")) {
		options.color = params.get("color");
	}
	if (params.has("growthRate")) {
		options.growthRate = params.get("growthRate");
	}
	if (params.has("habitat")) {
		options.habitat = params.get("habitat");
	}
	if (params.has("legendaries")) {
		options.legendaries = parseBoolean(params.get("legendaries"));
	}
	if (params.has("mythical")) {
		options.mythical = parseBoolean(params.get("mythical"));
	}
	if (params.has("nfes")) {
		options.nfes = parseBoolean(params.get("nfes"));
	}
	if (params.has("allowVarieties")) {
		options.allowVarieties = parseBoolean(params.get("allowVarieties"));
	}
	if (params.has("baby")) {
		options.baby = parseBoolean(params.get("baby"));
	}
	if (params.has("height_min")) {
		options.height_min = parseFloat(params.get("height_min"));
	}
	if (params.has("height_max")) {
		options.height_max = parseFloat(params.get("height_max"));
	}
	if (params.has("weight_min")) {
		options.weight_min = parseFloat(params.get("weight_min"));
	}
	if (params.has("weight_max")) {
		options.weight_max = parseFloat(params.get("weight_max"));
	}
	if (params.has("baseHappiness_min")) {
		options.baseHappiness_min = parseFloat(params.get("baseHappiness_min"));
	}
	if (params.has("baseHappiness_max")) {
		options.baseHappiness_max = parseFloat(params.get("baseHappiness_max"));
	}
	if (params.has("captureRate_min")) {
		options.captureRate_min = parseFloat(params.get("captureRate_min"));
	}
	if (params.has("captureRate_max")) {
		options.captureRate_max = parseFloat(params.get("captureRate_max"));
	}
	if (params.has("hatchCounter_min")) {
		options.hatchCounter_min = parseFloat(params.get("hatchCounter_min"));
	}
	if (params.has("hatchCounter_max")) {
		options.hatchCounter_max = parseFloat(params.get("hatchCounter_max"));
	}
	if (params.has("n")) {
		options.n = parseInt(params.get("n"));
	}
	// if (params.has("generate")) {
	// 	options.generate = true;
	// }
	return options;
}

/** Returns URL parameters for the given settings, excluding the leading "?". */
function convertOptionsToUrlParams(options: Partial<Options>): string {
	return Object.entries(options)
		.map(function ([key, value]) {
			return encodeURIComponent(key) + "=" + encodeURIComponent(value);
		})
		.join("&");
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
	stadiumRentalsCheckbox.parentElement.classList.toggle("invisible", !shouldShow);
}

function toggleFormsCheckbox() {
	const regionOption = regionDropdown.options[regionDropdown.selectedIndex];
	const shouldShow = regionOption?.dataset?.forms != "false";
	formsCheckbox.parentElement.classList.toggle("invisible", !shouldShow);
}