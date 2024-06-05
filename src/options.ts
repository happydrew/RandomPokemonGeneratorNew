export { convertOptionsToMongoQuery, convertOptionsToUrlParams, convertSearchParamsToOptions };
export type { RequestParams, Options };
import { parseBoolean } from "./utils.js";

type RequestParams = {
	region?: string;
	type?: string;
	color?: string;
	growthRate?: string;
	habitat?: string;
	legendaries?: boolean;
	mythical?: boolean;
	nfes?: boolean;
	allowVarieties?: boolean;
	baby?: boolean;
	height_min?: number;
	height_max?: number;
	weight_min?: number;
	weight_max?: number;
	baseHappiness_min?: number;
	baseHappiness_max?: number;
	captureRate_min?: number;
	captureRate_max?: number;
	hatchCounter_min?: number;
	hatchCounter_max?: number;
}

type Options = {
	requestParams: RequestParams;
	n: number;
	//generate: boolean;
	/** 是否为每个pokemon随机生成一个性格 */
	natures: boolean,
	/** 是否展示pokemon图片 */
	sprites: boolean
}

function convertSearchParamsToOptions(params: URLSearchParams) {
	const options: Partial<Options> = {};

	if (params.has("region")) {
		options.requestParams.region = params.get("region");
	}
	if (params.has("type")) {
		options.requestParams.type = params.get("type");
	}
	if (params.has("color")) {
		options.requestParams.color = params.get("color");
	}
	if (params.has("growthRate")) {
		options.requestParams.growthRate = params.get("growthRate");
	}
	if (params.has("habitat")) {
		options.requestParams.habitat = params.get("habitat");
	}
	if (params.has("legendaries")) {
		options.requestParams.legendaries = parseBoolean(params.get("legendaries"));
	}
	if (params.has("mythical")) {
		options.requestParams.mythical = parseBoolean(params.get("mythical"));
	}
	if (params.has("nfes")) {
		options.requestParams.nfes = parseBoolean(params.get("nfes"));
	}
	if (params.has("allowVarieties")) {
		options.requestParams.allowVarieties = parseBoolean(params.get("allowVarieties"));
	}
	if (params.has("baby")) {
		options.requestParams.baby = parseBoolean(params.get("baby"));
	}
	if (params.has("height_min")) {
		options.requestParams.height_min = parseFloat(params.get("height_min"));
	}
	if (params.has("height_max")) {
		options.requestParams.height_max = parseFloat(params.get("height_max"));
	}
	if (params.has("weight_min")) {
		options.requestParams.weight_min = parseFloat(params.get("weight_min"));
	}
	if (params.has("weight_max")) {
		options.requestParams.weight_max = parseFloat(params.get("weight_max"));
	}
	if (params.has("baseHappiness_min")) {
		options.requestParams.baseHappiness_min = parseFloat(params.get("baseHappiness_min"));
	}
	if (params.has("baseHappiness_max")) {
		options.requestParams.baseHappiness_max = parseFloat(params.get("baseHappiness_max"));
	}
	if (params.has("captureRate_min")) {
		options.requestParams.captureRate_min = parseFloat(params.get("captureRate_min"));
	}
	if (params.has("captureRate_max")) {
		options.requestParams.captureRate_max = parseFloat(params.get("captureRate_max"));
	}
	if (params.has("hatchCounter_min")) {
		options.requestParams.hatchCounter_min = parseFloat(params.get("hatchCounter_min"));
	}
	if (params.has("hatchCounter_max")) {
		options.requestParams.hatchCounter_max = parseFloat(params.get("hatchCounter_max"));
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
	return Object.entries(options.requestParams)
		.map(function ([key, value]) {
			return encodeURIComponent(key) + "=" + encodeURIComponent(value);
		})
		.join("&");
}
/**
 * 
 * @param options 
 * @returns 
 */
function convertOptionsToMongoQuery(options: Partial<Options>): { [key: string]: any } {
	const query: { [key: string]: any } = {};
	query.id = {
		$nin: [10061, 10080, 10081, 10082, 10083, 10084, 10085, 10144, 10151, 10158, 10159, 10182, 10183, 10187, 10192, 10264, 10265, 10266, 10267, 10268, 10269, 10270, 10271]
	};
	if (options.requestParams.region && options.requestParams.region != "all") {
		query.region = options.requestParams.region;
	};
	if (options.requestParams.type && options.requestParams.type != "all") {
		query[`types.${options.requestParams.type}`] = {
			$exists: true
		};
	};
	if (options.requestParams.color && options.requestParams.color != "all") {
		query.speciesColor = options.requestParams.color;
	};

	if (options.requestParams.growthRate && options.requestParams.growthRate != "all") {
		query.speciesGrowthRate = options.requestParams.growthRate;
	};

	if (options.requestParams.habitat && options.requestParams.habitat != "all") {
		query.speciesHabitat = options.requestParams.habitat;
	};

	if (options.requestParams.legendaries) {
		query.speciesIsLegendary = {
			$eq: 1
		}
	};
	if (options.requestParams.mythical) {
		query.speciesIsMythical = {
			$eq: 1
		}
	};
	if (options.requestParams.nfes) {
		query.nfe = {
			$eq: 1
		}
	};

	if (options.requestParams.allowVarieties != undefined && !options.requestParams.allowVarieties) {
		query.id = {
			$lt: 10000
		}
	};
	if (options.requestParams.baby) {
		query.speciesIsBaby = {
			$eq: 1
		}
	};


	if (options.requestParams.height_min != undefined) {
		query.height = {
			$gte: options.requestParams.height_min
		}
	};

	if (options.requestParams.height_max != undefined) {
		query.height = {
			$lte: options.requestParams.height_max
		}
	};

	if (options.requestParams.weight_min != undefined) {
		query.weight = {
			$gte: options.requestParams.weight_min
		}
	};

	if (options.requestParams.weight_max != undefined) {
		query.weight = {
			$lte: options.requestParams.weight_max
		}
	};

	if (options.requestParams.baseHappiness_min != undefined) {
		query.speciesBaseHappiness = {
			$gte: options.requestParams.baseHappiness_min
		}
	};

	if (options.requestParams.baseHappiness_max != undefined) {
		query.speciesBaseHappiness = {
			$lte: options.requestParams.baseHappiness_max
		}
	};

	if (options.requestParams.captureRate_min != undefined) {

		query.speciesCaptureRate = {
			$gte: options.requestParams.captureRate_min
		}
	};

	if (options.requestParams.captureRate_max != undefined) {
		query.speciesCaptureRate = {
			$lte: options.requestParams.captureRate_max
		}
	};

	if (options.requestParams.hatchCounter_min != undefined) {
		query.speciesHatchCounter = {
			$gte: options.requestParams.hatchCounter_min
		}
	};

	if (options.requestParams.hatchCounter_max != undefined) {
		query.speciesHatchCounter = {
			$lte: options.requestParams.hatchCounter_max
		}
	};
	return query;
}