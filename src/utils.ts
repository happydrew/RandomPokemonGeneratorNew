export { getRandomElement, removeRandomElement, shuffle, randomInteger, markLoading, setDropdownIfValid, parseBoolean, deepClone, toggleMoreOptions, collapseMoreOptions, imgOnerror };

function getRandomElement<T>(arr: T[]): T {
    return arr[randomInteger(arr.length)];
}

function removeRandomElement<T>(arr: T[]): T {
    return arr.splice(randomInteger(arr.length), 1)[0];
}

/** Modern Fisher-Yates shuffle. */
function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInteger(i + 1);
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function randomInteger(maxExclusive: number): number {
    return Math.floor(Math.random() * maxExclusive);
}

function markLoading(isLoading: boolean) {
    document.getElementById("controls").classList.toggle("loading", isLoading);
}

function setDropdownIfValid(select: HTMLSelectElement, value: string | number) {
    const option: HTMLOptionElement = select.querySelector("[value='" + value + "']");
    if (option) {
        select.value = option.value;
    }
}

function parseBoolean(boolean: string): boolean {
    return boolean.toLowerCase() == "true";
}

function deepClone<T>(obj: T): T {
    // Handle null or undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle primitive types (string, number, boolean, etc.)
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    // Handle Array
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }

    // Handle Object
    const clonedObj = Object.create(Object.getPrototypeOf(obj));
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone((obj as any)[key]);
        }
    }

    return clonedObj;
}

function toggleMoreOptions(event: Event) {
    document.getElementById("more-button").style.display = "none";
    document.getElementById("more-options").style.display = "block";
    document.getElementById("collapse-more-button").style.display = "block";
}

function collapseMoreOptions(event: Event) {
    document.getElementById("more-options").style.display = "none";
    document.getElementById("collapse-more-button").style.display = "none";
    document.getElementById("more-button").style.display = "block";
}

function imgOnerror(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = "favicon-192.png";
}