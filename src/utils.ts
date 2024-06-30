export {
    toggleDropdownsOnButtonClick, displayYearsInFooter, getRandomElement, removeRandomElement,
    shuffle, randomInteger, markLoading, setDropdownIfValid, parseBoolean, deepClone, expandMoreOptions,
    collapseMoreOptions, imgOnerror, getDropdownOptions, setSelectIfValid, getNumrangeOptions,
    setNumrangeIfValid, getTrueByProbability, getCheckboxValueById, setCheckbox,
    expandMoreShowOptions, collapseMoreShowOptions
};

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
    document.querySelector(".n_generator").classList.toggle("loading", isLoading);
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

function expandMoreOptions(event: Event) {
    document.getElementById("more-button").style.display = "none";
    document.getElementById("more-options").style.display = "flex";
    document.getElementById("collapse-more-button").style.display = "block";
    document.getElementById("option-panel-hr").style.display = "block";
}

function collapseMoreOptions(event: Event) {
    document.getElementById("more-options").style.display = "none";
    document.getElementById("collapse-more-button").style.display = "none";
    document.getElementById("more-button").style.display = "block";
    document.getElementById("option-panel-hr").style.display = "none";
}

function expandMoreShowOptions(event: Event) {
    document.getElementById("more-show-button").style.display = "none";
    document.getElementById("more-show-options").style.display = "flex";
    document.getElementById("collapse-more-show-button").style.display = "block";
    document.getElementById("show-option-panel-hr").style.display = "block";
}

function collapseMoreShowOptions(event: Event) {
    document.getElementById("more-show-options").style.display = "none";
    document.getElementById("collapse-more-show-button").style.display = "none";
    document.getElementById("more-show-button").style.display = "block";
    document.getElementById("show-option-panel-hr").style.display = "none";
}

function imgOnerror(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = "favicon-192.png";
}

function displayYearsInFooter() {
        document.querySelectorAll("span[data-since]").forEach((span: HTMLSpanElement) => {
        span.innerText = span.dataset.since + "-" + new Date().getFullYear();
    });
}

function isInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
    );
}

function adjustPositionToViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    let newTop = rect.top;
    let newLeft = rect.left;

    if (rect.bottom > windowHeight) {
        newTop -= rect.bottom - windowHeight;
    }
    if (rect.top < 0) {
        newTop = 0;
    }
    if (rect.right > windowWidth) {
        newLeft -= rect.right - windowWidth;
    }
    if (rect.left < 0) {
        newLeft = 0;
    }

    element.style.top = `${newTop}px`;
    element.style.left = `${newLeft}px`;
}

function toggleDropdownsOnButtonClick() {
    // Toggle a dropdown by clicking its button. Also close with the Escape key or
    // by clicking outside of it.

    document.querySelectorAll(".dropdown").forEach(dropdownWrapper => {
        const button = dropdownWrapper.querySelector("button");
        const popup = dropdownWrapper.querySelector(".popup") as HTMLElement;
        if (popup) {
            button.addEventListener("click", e => {
                popup.classList.toggle("visible");
                popup.style.left = (dropdownWrapper.clientWidth - popup.clientWidth) / 2 + "px";
                // if (!isInViewport(popup)) {
                //     adjustPositionToViewport(popup);
                // }
            });
            document.addEventListener("keydown", event => {
                if (event.keyCode == 27) {
                    popup.classList.remove("visible");
                }
            });
            document.addEventListener("click", event => {
                if (event.target instanceof HTMLElement && event.target != button
                    && !popup.contains(event?.target)) {
                    popup.classList.remove("visible");
                }
            });
        }
    });
}

function getDropdownOptions(dropdownId: string): string | undefined {
    try {
        const dropdown = document.getElementById(dropdownId) as HTMLElement;
        const selectAllCheckbox: HTMLInputElement = dropdown.querySelector("input[type='checkbox'][data-select-all]");
        const allCheckBoxes: HTMLInputElement[] = Array.from(dropdown.querySelectorAll("input[type='checkbox']:not([data-select-all])"));
        const selectedCheckboxes = allCheckBoxes.filter(checkbox => checkbox.checked);
        if (selectAllCheckbox.checked) {
            // 全选是默认状态，用undefined表示
            return undefined;
        } else if (selectedCheckboxes.length == 0) {
            // 未选择任何选项，用none表示
            return "none";
        } else {
            return selectedCheckboxes.map(checkbox => checkbox.value).join(",");
        }
    } catch (e) {
        console.error("getDropdownOptions error, dropdown id: " + dropdownId, e);
    }
}

/**
 * 获取指定checkbox组件的选中状态
 * @param checkboxId 
 * @returns 
 */
function getCheckboxValueById(checkboxId: string): boolean {
    return (document.getElementById(checkboxId) as HTMLInputElement).checked;
}
/**
 * 获取范围选择器的选项
 * 
 * @param numrangeId 
 * @returns 
 */
function getNumrangeOptions(numrangeId: string): string {
    const numrange = document.getElementById(numrangeId) as HTMLElement;
    const minInput = numrange.querySelector("input[type='number'][range-min]") as HTMLInputElement;
    const maxInput = numrange.querySelector("input[type='number'][range-max]") as HTMLInputElement;
    const minValue = parseFloat(minInput.getAttribute("min"));
    const maxValue = parseFloat(maxInput.getAttribute("max"));
    if (parseFloat(minInput.value) <= minValue && parseFloat(maxInput.value) >= maxValue) {
        return undefined;
    } else {
        return minInput.value + "-" + maxInput.value;
    }
}

/**
 * 将从url中或缓存中读到的参数设置到dropdown元素中
 * 
 * @param dropdownId 
 * @param values 
 */
function setDropdownIfValid(dropdownId: string, values: string) {
    const dropdown = document.getElementById(dropdownId);
    const selectAllCheckbox: HTMLInputElement = dropdown.querySelector("input[type='checkbox'][data-select-all]");
    const allCheckBoxes: HTMLInputElement[] = Array.from(dropdown.querySelectorAll("input[type='checkbox']:not([data-select-all])"));
    if (values == "default") {
        selectAllCheckbox.checked = true;
    }
    else if (values == "none") {
        selectAllCheckbox.checked = false;
        allCheckBoxes.forEach(checkbox => checkbox.checked = false);
    } else {
        selectAllCheckbox.checked = false;
        allCheckBoxes.forEach(checkbox => checkbox.checked = false);
        values.split(",").forEach(value => {
            const checkbox: HTMLInputElement = dropdown.querySelector("input[type='checkbox'][value='" + value + "']");
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

function setSelectIfValid(selectId: string, value: any) {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    if (select) {
        select.value = value.toString();
    }
}

/**
 * 范围组件的反显
 * 
 * @param numrangeId 
 * @param value 
 */
function setNumrangeIfValid(numrangeId: string, value: string) {
    const numrange = document.getElementById(numrangeId) as HTMLElement;
    const minInput = numrange.querySelector("input[type='number'][range-min]") as HTMLInputElement;
    const maxInput = numrange.querySelector("input[type='number'][range-max]") as HTMLInputElement;
    const minValue = parseFloat(minInput.getAttribute("min"));
    const maxValue = parseFloat(maxInput.getAttribute("max"));
    if (value == "default") {
        minInput.value = minValue.toString();
        maxInput.value = maxValue.toString();
    } else {
        const [min, max] = value.split("-").map(v => parseFloat(v));
        minInput.value = min > minValue ? min.toString() : minValue.toString();
        maxInput.value = max < maxValue ? max.toString() : maxValue.toString();
    }
}

/**
 * 反显checkbox组件
 * @param checkboxId 
 * @param value 
 */
function setCheckbox(checkboxId: string, value: boolean) {
    const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
    if (checkbox) {
        checkbox.checked = value;
    }
}

function getTrueByProbability(probability: number): boolean {
    return Math.random() < probability;
}

// 生成正态分布随机数的函数
function getRandomNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // 避免 log(0)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
}