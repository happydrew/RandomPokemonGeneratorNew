export { convertOptionsToUrlParams, convertSearchParamsToOptions };
export type { FilterParams, Options, ShowParams };
import { parseBoolean } from "./utils.js";

type FilterParams = {
	regions?: string;
	types?: string;
	forms?: string;
	rarity?: string;
	generations?: string;
	colors?: string;
	envolves?: string;
	baby?: string;
	growthRate?: string;
	habitats?: string;
	eggGroups?: string;
	genderRate?: string;
	shape?: string;
	defaultForm?: string;
	formSwitchable?: string;
	hasGenderDiff?: string;
	// height:0-100
	height?: string;
	// weight:0-1000
	weight?: string;
	// baseHappiness:0-255
	baseHappiness?: string;
	// captureRate:0-255
	captureRate?: string;
	// hatchCounter:0-120
	hatchCounter?: string;
	// palParkEncounterRate:0-100
	// palParkEncounterRate?: string;
	hp_range?: string;
	attack_range?: string;
	defense_range?: string;
	spAttack_range?: string;
	spDefense_range?: string;
	speed_range?: string;
	hp_effort?: string;
	attack_effort?: string;
	defense_effort?: string;
	spAttack_effort?: string;
	spDefense_effort?: string;
	speed_effort?: string;
}

type ShowParams = {
	n?: string;
	//generate: boolean;
	/** 是否展示pokemon图片 */
	sprites?: boolean,
	/** 是否展示pokemon的背景图,取决于type */
	background_image?: boolean,
	/** 是否展示背景色，即pokemon的颜色 */
	background_color?: boolean,
	/** 是否展示pokemon的世代 */
	showGeneration?: boolean,
	/** 是否展示pokemon的region */
	showRegion?: boolean,
	/** 是否展示pokemon的稀有度 */
	showRarity?: boolean,
	/** 是否展示pokemon的属性 */
	showTypes?: boolean,
	/** 是否为每个pokemon随机生成一个性格 */
	natures?: boolean,
	/** 是否展示pokemon的base stats */
	showStats?: boolean,
	/** 是否展示pokemon的努力值Effort Values, EVs */
	evs?: boolean,
	/** 是否为每个pokemon随机生成个体值iv */
	ivs?: boolean,
	/** 是否展示pokemon的能力值 */
	showAblilites?: boolean,
	/** 是否展示pokemon的叫声 */
	cries?: boolean,
	// 获取shiny的概率，百分数，默认是1，即1%的概率
	shinyProb?: number,
	/** 是否展示pokemon的性别 */
	shinyTip?: boolean
	//genders?: boolean
}

type Options = {
	/* 过滤选项 */
	filterParams?: FilterParams;
	/* 展示选项 */
	showParams?: ShowParams;
}

function convertSearchParamsToOptions(params: URLSearchParams): Partial<Options> {
	const options: Partial<Options> = { filterParams: {}, showParams: {} };

	if (params.has("regions")) {
		options.filterParams.regions = params.get("regions");
	}
	if (params.has("types")) {
		options.filterParams.types = params.get("types");
	}
	if (params.has("forms")) {
		options.filterParams.forms = params.get("forms");
	}
	if (params.has("rarity")) {
		options.filterParams.rarity = params.get("rarity");
	}
	if (params.has("colors")) {
		options.filterParams.colors = params.get("colors");
	}
	if (params.has("generations")) {
		options.filterParams.generations = params.get("generations");
	}
	if (params.has("envolves")) {
		options.filterParams.envolves = params.get("envolves");
	}
	if (params.has("baby")) {
		options.filterParams.baby = params.get("baby");
	}
	if (params.has("growthRate")) {
		options.filterParams.growthRate = params.get("growthRate");
	}
	if (params.has("habitats")) {
		options.filterParams.habitats = params.get("habitats");
	}
	if (params.has("eggGroups")) {
		options.filterParams.eggGroups = params.get("eggGroups");
	}
	if (params.has("genderRate")) {
		options.filterParams.genderRate = params.get("genderRate");
	}
	if (params.has("shape")) {
		options.filterParams.shape = params.get("shape");
	}
	if (params.has("defaultForm")) {
		options.filterParams.defaultForm = params.get("defaultForm");
	}
	if (params.has("formSwitchable")) {
		options.filterParams.formSwitchable = params.get("formSwitchable");
	}
	if (params.has("hasGenderDiff")) {
		options.filterParams.hasGenderDiff = params.get("hasGenderDiff");
	}
	if (params.has("height")) {
		options.filterParams.height = params.get("height");
	}
	if (params.has("weight")) {
		options.filterParams.weight = params.get("weight");
	}
	if (params.has("baseHappiness")) {
		options.filterParams.baseHappiness = params.get("baseHappiness");
	}
	if (params.has("captureRate")) {
		options.filterParams.captureRate = params.get("captureRate");
	}
	if (params.has("hatchCounter")) {
		options.filterParams.hatchCounter = params.get("hatchCounter");
	}
	if (params.has("hp_range")) {
		options.filterParams.hp_range = params.get("hp_range");
	}
	if (params.has("attack_range")) {
		options.filterParams.attack_range = params.get("attack_range");
	}
	if (params.has("defense_range")) {
		options.filterParams.defense_range = params.get("defense_range");
	}
	if (params.has("spAttack_range")) {
		options.filterParams.spAttack_range = params.get("spAttack_range");
	}
	if (params.has("spDefense_range")) {
		options.filterParams.spDefense_range = params.get("spDefense_range");
	}
	if (params.has("speed_range")) {
		options.filterParams.speed_range = params.get("speed_range");
	}
	if (params.has("hp_effort")) {
		options.filterParams.hp_effort = params.get("hp_effort");
	}
	if (params.has("attack_effort")) {
		options.filterParams.attack_effort = params.get("attack_effort");
	}
	if (params.has("defense_effort")) {
		options.filterParams.defense_effort = params.get("defense_effort");
	}
	if (params.has("spAttack_effort")) {
		options.filterParams.spAttack_effort = params.get("spAttack_effort");
	}
	if (params.has("spDefense_effort")) {
		options.filterParams.spDefense_effort = params.get("spDefense_effort");
	}
	if (params.has("speed_effort")) {
		options.filterParams.speed_effort = params.get("speed_effort");
	}

	// showParams
	if (params.has("n")) {
		options.showParams.n = params.get("n")!;
	}
	if (params.has("natures")) {
		options.showParams.natures = parseBoolean(params.get("natures")!);
	}
	if (params.has("sprites")) {
		options.showParams.sprites = parseBoolean(params.get("sprites")!);
	}
	if (params.has("background_image")) {
		options.showParams.background_image = parseBoolean(params.get("background_image")!);
	}
	if (params.has("background_color")) {
		options.showParams.background_color = parseBoolean(params.get("background_color")!);
	}
	if (params.has("showGeneration")) {
		options.showParams.showGeneration = parseBoolean(params.get("showGeneration")!);
	}
	if (params.has("showRegion")) {
		options.showParams.showRegion = parseBoolean(params.get("showRegion")!);
	}
	if (params.has("showRarity")) {
		options.showParams.showRarity = parseBoolean(params.get("showRarity")!);
	}
	if (params.has("showTypes")) {
		options.showParams.showTypes = parseBoolean(params.get("showTypes")!);
	}
	if (params.has("showStats")) {
		options.showParams.showStats = parseBoolean(params.get("showStats")!);
	}
	if (params.has("evs")) {
		options.showParams.evs = parseBoolean(params.get("evs")!);
	}
	if (params.has("ivs")) {
		options.showParams.ivs = parseBoolean(params.get("ivs")!);
	}
	if (params.has("showAblilites")) {
		options.showParams.showAblilites = parseBoolean(params.get("showAblilites")!);
	}
	if (params.has("cries")) {
		options.showParams.cries = parseBoolean(params.get("cries")!);
	}
	if (params.has("shinyProb")) {
		options.showParams.shinyProb = parseFloat(params.get("shinyProb")!);
	}
	return options;
}

/** Returns URL parameters for the given settings, excluding the leading "?". */
function convertOptionsToUrlParams(options: Partial<Options>): string {
	return Object.entries<any>(options.filterParams).concat(Object.entries<any>(options.showParams))
		.filter(([k, v]) => { return v != undefined && v != null; })
		.map(function ([key, value]) {
			return encodeURIComponent(key) + "=" + encodeURIComponent(value);
		}).join("&");
}
