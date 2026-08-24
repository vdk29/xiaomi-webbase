// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const productsList =
    document.getElementById("productsList");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const productDetails =
    document.getElementById("productDetails");

const categoryButtons =
    document.querySelectorAll(".category-button");

const fileInput =
    document.getElementById("fileInput");

const fileName =
    document.getElementById("fileName");

const importStatus =
    document.getElementById("importStatus");


// ======================================================
// NUMBER
// ======================================================

function number(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {

        return Number.isFinite(value)
            ? value
            : 0;

    }

    let text =
        String(value)
            .trim()
            .replace(/\s/g, "")
            .replace(",", ".");

    if (!text) {
        return 0;
    }

    const result = Number(text);

    return Number.isFinite(result)
        ? result
        : 0;

}


// ======================================================
// NORMALIZE TEXT
// ======================================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ");

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// PF / ПФ
// ======================================================

function isPFRow(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return false;
    }

    if (
        text === "пф" ||
        text === "pf"
    ) {
        return true;
    }

    if (
        text.startsWith("пф ") ||
        text.startsWith("pf ")
    ) {
        return true;
    }

    return false;

}


// ======================================================
// ACCESSORIES
// ======================================================
//
// ВАЖНО:
// "наушники" здесь НЕ считаются аксессуаром,
// потому что у нас есть отдельная категория Наушники.
//
// Также "фитнес-браслет" и "умные часы"
// НЕ считаются аксессуарами.
//
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return false;
    }


    const accessoryWords = [

        "чехол",
        "case",

        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",

        "стекло для",
        "пленка для",
        "плёнка для",

        "клавиатура",
        "keyboard",

        "зарядное устройство",
        "зарядка",
        "зарядный блок",
        "зарядный адаптер",
        "charger",

        "кабель",
        "cable",

        "ремешок",
        "strap",

        "переходник",
        "adapter",

        "держатель",
        "holder",

        "стилус",
        "stylus",

        "аксессуар",
        "аксессуары",

        "подставка",

        "power bank",
        "powerbank",

        "внешний аккумулятор",

        "сетевой адаптер",

        "зарядная станция",

        "док-станция",
        "dock station"

    ];


    return accessoryWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// EXPLICIT PRODUCT TYPE
// ======================================================

function detectExplicitProductCategory(name) {

    const text =
        normalizeText(name);


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТ
    // --------------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("fitness band") ||
        text.includes("smart band")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        text.includes("умные часы") ||
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // СМАРТФОН
    // --------------------------------------------------

    if (
        text.includes("смартфон") ||
        text.includes("smartphone")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТ
    // --------------------------------------------------

    if (
        text.includes("планшет")
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        text.includes("наушник") ||
        text.includes("earbuds") ||
        text.includes("headphones") ||
        text.includes("headset")
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОР
    // --------------------------------------------------

    if (
        text.includes("телевизор") ||
        text.includes("телевизоры") ||
        text.includes("tv ")
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРА
    // --------------------------------------------------

    if (
        text.includes("камера") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОС
    // --------------------------------------------------

    if (
        text.includes("пылесос")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// CATEGORY HEADER
// ======================================================
//
// Ключевая функция.
//
// Она распознаёт:
// 01 смартфоны Xiaomi 71
// 17 планшеты 20
// 50 умные часы
// фитнес-браслеты 30
//
// Но НЕ распознаёт:
// Redmi Note 15
// Redmi Pad 2
// Xiaomi Smart Band 11
//
// ======================================================

function detectSectionHeader(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return null;
    }


    // ==================================================
    // ЯВНЫЕ СЛУЖЕБНЫЕ РАЗДЕЛЫ
    // ==================================================

    if (
        text === "смартфоны" ||
        text === "смартфоны xiaomi" ||
        text === "xiaomi смартфоны"
    ) {

        return "Смартфоны";

    }


    if (
        text === "планшеты" ||
        text === "планшеты xiaomi" ||
        text === "xiaomi планшеты"
    ) {

        return "Планшеты";

    }


    if (
        text === "умные часы" ||
        text === "смарт часы" ||
        text === "смарт-часы"
    ) {

        return "Смарт-часы";

    }


    if (
        text === "фитнес-браслеты" ||
        text === "фитнес браслеты"
    ) {

        return "Фитнес-браслеты";

    }


    if (
        text === "наушники"
    ) {

        return "Наушники";

    }


    if (
        text === "телевизоры"
    ) {

        return "Телевизоры";

    }


    if (
        text === "камеры"
    ) {

        return "Камеры";

    }


    if (
        text === "пылесосы"
    ) {

        return "Пылесосы";

    }


    if (
        text === "аксессуары"
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // СТРОКИ ТИПА:
    //
    // 01 смартфоны Xiaomi 71
    // 02 планшеты 17
    // 05 умные часы 50
    //
    // ==================================================

    const categoryPatterns = [

        {
            category: "Смартфоны",
            regex: /\bсмартфон(?:ы)?\b/
        },

        {
            category: "Планшеты",
            regex: /\bпланшет(?:ы)?\b/
        },

        {
            category: "Смарт-часы",
            regex: /\b(?:умные\s+часы|смарт[\s-]+часы)\b/
        },

        {
            category: "Фитнес-браслеты",
            regex: /\bфитнес[\s-]+браслет(?:ы)?\b/
        },

        {
            category: "Наушники",
            regex: /\bнаушник(?:и)?\b/
        },

        {
            category: "Телевизоры",
            regex: /\bтелевизор(?:ы)?\b/
        },

        {
            category: "Камеры",
            regex: /\bкамер(?:а|ы)\b/
        },

        {
            category: "Пылесосы",
            regex: /\bпылесос(?:ы)?\b/
        },

        {
            category: "Аксессуары",
            regex: /\bаксессуар(?:ы)?\b/
        }

    ];


    // ==================================================
    // ТОЛЬКО ЕСЛИ СТРОКА ПОХОЖА НА РАЗДЕЛ
    // ==================================================
    //
    // Важный момент:
    // слово "смартфон" само по себе недостаточно.
    //
    // Строка должна выглядеть как служебная:
    //
    // 01 смартфоны Xiaomi 71
    // 17 планшеты 20
    //
    // ==================================================

    const beginsWithNumber =
        /^\d+\s+/.test(text);

    const endsWithNumber =
        /\s+\d+(?:[.,]\d+)?$/.test(text);

    const hasDash =
        /[-–—]\s*\d+\s*$/.test(text);


    if (
        beginsWithNumber &&
        endsWithNumber
    ) {

        for (const item of categoryPatterns) {

            if (
                item.regex.test(text)
            ) {

                return item.category;

            }

        }

    }


    if (hasDash) {

        for (const item of categoryPatterns) {

            if (
                item.regex.test(text)
            ) {

                return item.category;

            }

        }

    }


    return null;

}


// ======================================================
// SUBGROUP
// ======================================================

function isSubGroupRow(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return true;
    }


    const patterns = [

        /^для\s+/,

        /^карточка\s+для\s+/,

        /^аксессуары\s+для\s+/,

        /^чехлы\s+для\s+/,

        /^стекла\s+для\s+/,

        /^пленки\s+для\s+/,

        /^пленки\s+для\s+/,

        /^плёнки\s+для\s+/

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}


// ======================================================
// SERVICE ROW
// ======================================================

function isServiceRow(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return true;
    }


    if (
        isPFRow(text)
    ) {

        return true;

    }


    if (
        text === "итого" ||
        text === "всего" ||
        text === "остаток" ||
        text === "остатки"
    ) {

        return true;

    }


    return false;

}


// ======================================================
// DETECT PRODUCT CATEGORY
// ======================================================

function detectCategory(
    name,
    currentCategory,
    rowCategory
) {

    const text =
        normalizeText(name);


    // ==================================================
    // 1. ЯВНЫЙ ТИП ТОВАРА
    // ==================================================

    const explicit =
        detectExplicitProductCategory(
            name
        );


    if (explicit) {

        return explicit;

    }


    // ==================================================
    // 2. АКСЕССУАР
    // ==================================================

    if (
        isAccessoryName(name)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // 3. КАТЕГОРИЯ ИЗ СТРОКИ
    // ==================================================

    if (
        rowCategory
    ) {

        return rowCategory;

    }


    // ==================================================
    // 4. ТЕКУЩИЙ РАЗДЕЛ 1С
    // ==================================================

    if (
        currentCategory
    ) {

        return currentCategory;

    }


    return "Другое";

}


// ======================================================
// STOCK
// ======================================================

function getStock(product) {

    const display =
        number(product.display);

    const warehouse =
        number(product.warehouse);

    return {

        display,

        warehouse,

        total:
            display + warehouse

    };

}


// ======================================================
// PREPARE PRODUCT
// ======================================================

function prepareProduct(
    product,
    index
) {

    if (!product) {
        return null;
    }


    const prepared = {
        ...product
    };


    if (
        prepared.id === undefined ||
        prepared.id === null ||
        prepared.id === ""
    ) {

        prepared.id =
            index + 1;

    }


    prepared.name =
        String(
            prepared.name ||
            "Без названия"
        ).trim();


    prepared.display =
        number(
            prepared.display
        );


    prepared.warehouse =
        number(
            prepared.warehouse
        );


    prepared.quantity =
        prepared.display +
        prepared.warehouse;


    prepared.category =
        prepared.category ||
        "Другое";


    prepared.memory =
        prepared.memory || "";


    prepared.color =
        prepared.color || "";


    prepared.description =
        prepared.description || "";


    prepared.tip =
        prepared.tip || "";


    if (
        !prepared.specs ||
        typeof prepared.specs !== "object"
    ) {

        prepared.specs = {};

    }


    return prepared;

}


// ======================================================
// NORMALIZE PRODUCTS
// ======================================================

function normalizeProducts() {

    if (
        !Array.isArray(products)
    ) {

        return;

    }


    const normalized = [];


    products.forEach(
        (product, index) => {

            const prepared =
                prepareProduct(
                    product,
                    index
                );


            if (prepared) {

                normalized.push(
                    prepared
                );

            }

        }
    );


    products.length = 0;


    normalized.forEach(
        product => {

            products.push(
                product
            );

        }
    );

}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(
    list = products
) {

    if (!productsList) {
        return;
    }


    productsList.innerHTML = "";


    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {

        productsList.innerHTML = `

            <div class="empty-result">

                <strong>
                    Ничего не найдено
                </strong>

                <p>
                    Попробуйте изменить поиск
                    или выбрать другую категорию.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(
        product => {

            const stock =
                getStock(product);


            const card =
                document.createElement("div");


            card.className =
                "product-card";


            card.dataset.id =
                product.id;


            card.innerHTML = `

                <div class="product-image">

                    <span>
                        Фото товара
                    </span>

                </div>


                <div class="product-card-content">

                    <div class="product-category">

                        ${escapeHTML(
                            product.category
                        )}

                    </div>


                    <div class="product-name">

                        ${escapeHTML(
                            product.name
                        )}

                    </div>


                    ${
                        product.memory ||
                        product.color
                            ? `

                                <div class="product-info">

                                    ${escapeHTML(
                                        product.memory || ""
                                    )}

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${escapeHTML(
                                        product.color || ""
                                    )}

                                </div>

                            `
                            : ""
                    }


                    <div class="stock">

                        <div class="stock-row">

                            <span>
                                Витрина
                            </span>

                            <strong>
                                ${stock.display}
                            </strong>

                        </div>


                        <div class="stock-row">

                            <span>
                                Склад
                            </span>

                            <strong>
                                ${stock.warehouse}
                            </strong>

                        </div>


                        <div class="stock-row stock-total">

                            <span>
                                Всего
                            </span>

                            <strong>
                                ${stock.total}
                            </strong>

                        </div>

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "product.html?id=" +
                        encodeURIComponent(
                            product.id
                        );

                }
            );


            productsList.appendChild(
                card
            );

        }
    );

}


// ======================================================
// SEARCH
// ======================================================

function searchProducts() {

    if (!searchInput) {
        return;
    }


    const query =
        normalizeText(
            searchInput.value
        );


    if (!query) {

        renderProducts(
            products
        );

        return;

    }


    const result =
        products.filter(
            product => {

                const text =
                    normalizeText(`

                        ${product.id || ""}

                        ${product.name || ""}

                        ${product.category || ""}

                        ${product.memory || ""}

                        ${product.color || ""}

                        ${product.description || ""}

                        ${product.tip || ""}

                    `);


                return text.includes(
                    query
                );

            }
        );


    renderProducts(
        result
    );

}


// ======================================================
// SEARCH EVENTS
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                searchProducts();

            }

        }
    );


    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ======================================================
// CATEGORY BUTTONS
// ======================================================

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const category =
                    button.dataset.category;


                categoryButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                if (searchInput) {

                    searchInput.value = "";

                }


                if (
                    category === "Все"
                ) {

                    renderProducts(
                        products
                    );

                    return;

                }


                const filtered =
                    products.filter(
                        product =>
                            product.category ===
                            category
                    );


                console.log(
                    "Категория:",
                    category,
                    "Найдено:",
                    filtered.length
                );


                renderProducts(
                    filtered
                );

            }
        );

    }
);


// ======================================================
// PRODUCT PAGE
// ======================================================

function renderProductPage() {

    if (!productDetails) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <strong>
                    Товар не найден
                </strong>

                <p>
                    Проверьте ссылку на товар.
                </p>

            </div>

        `;

        return;

    }


    renderProduct(
        product
    );

}


// ======================================================
// SPECS
// ======================================================

function renderSpecs(product) {

    if (
        !product.specs ||
        typeof product.specs !== "object"
    ) {

        return `
            <p>
                Характеристики пока не добавлены.
            </p>
        `;

    }


    const entries =
        Object.entries(
            product.specs
        );


    if (
        entries.length === 0
    ) {

        return `
            <p>
                Характеристики пока не добавлены.
            </p>
        `;

    }


    return entries
        .map(
            ([key, value]) => `

                <div class="spec-row">

                    <span>
                        ${escapeHTML(key)}
                    </span>

                    <strong>
                        ${escapeHTML(value)}
                    </strong>

                </div>

            `
        )
        .join("");

}


// ======================================================
// PRODUCT
// ======================================================

function renderProduct(product) {

    if (!productDetails) {
        return;
    }


    const stock =
        getStock(product);


    productDetails.innerHTML = `

        <div class="product-page">

            <div class="product-page-image">

                <span>
                    Фото товара
                </span>

            </div>


            <div class="product-page-content">

                <div class="product-category">

                    ${escapeHTML(
                        product.category
                    )}

                </div>


                <h1>

                    ${escapeHTML(
                        product.name
                    )}

                </h1>


                ${
                    product.memory
                        ? `

                            <div class="product-memory">

                                ${escapeHTML(
                                    product.memory
                                )}

                            </div>

                        `
                        : ""
                }


                ${
                    product.color
                        ? `

                            <div class="product-color">

                                Цвет:

                                <strong>
                                    ${escapeHTML(
                                        product.color
                                    )}
                                </strong>

                            </div>

                        `
                        : ""
                }


                <div class="product-stock">

                    <h2>
                        Наличие
                    </h2>


                    <div class="stock-control">

                        <span>
                            Витрина
                        </span>


                        <div class="quantity-control">

                            <button
                                type="button"
                                class="quantity-button"
                                data-type="display"
                                data-action="minus"
                            >
                                −
                            </button>


                            <strong>
                                ${stock.display}
                            </strong>


                            <button
                                type="button"
                                class="quantity-button"
                                data-type="display"
                                data-action="plus"
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <div class="stock-control">

                        <span>
                            Склад
                        </span>


                        <div class="quantity-control">

                            <button
                                type="button"
                                class="quantity-button"
                                data-type="warehouse"
                                data-action="minus"
                            >
                                −
                            </button>


                            <strong>
                                ${stock.warehouse}
                            </strong>


                            <button
                                type="button"
                                class="quantity-button"
                                data-type="warehouse"
                                data-action="plus"
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <div class="stock-big-row total">

                        <span>
                            Всего
                        </span>

                        <strong>
                            ${stock.total}
                        </strong>

                    </div>

                </div>


                <div class="product-description">

                    <h2>
                        Кратко
                    </h2>


                    <p>

                        ${escapeHTML(
                            product.description ||
                            "Описание пока не добавлено."
                        )}

                    </p>

                </div>


                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${renderSpecs(product)}

                </div>


                <div class="product-tip">

                    <h2>
                        Подсказка продавцу
                    </h2>


                    <p>

                        ${escapeHTML(
                            product.tip ||
                            "Подсказка пока не добавлена."
                        )}

                    </p>

                </div>

            </div>

        </div>

    `;


    document.title =
        `${product.name} — Xiaomi WebBase`;


    setupQuantityButtons(
        product
    );

}


// ======================================================
// QUANTITY BUTTONS
// ======================================================

function setupQuantityButtons(product) {

    const buttons =
        document.querySelectorAll(
            ".quantity-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const type =
                        button.dataset.type;


                    const action =
                        button.dataset.action;


                    if (
                        type !== "display" &&
                        type !== "warehouse"
                    ) {

                        return;

                    }


                    let value =
                        number(
                            product[type]
                        );


                    if (
                        action === "plus"
                    ) {

                        value++;

                    }


                    if (
                        action === "minus"
                    ) {

                        value =
                            Math.max(
                                0,
                                value - 1
                            );

                    }


                    product[type] =
                        value;


                    product.quantity =
                        number(product.display) +
                        number(product.warehouse);


                    try {

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(
                                products
                            )
                        );

                    } catch (error) {

                        console.error(
                            "Ошибка сохранения:",
                            error
                        );

                    }


                    renderProduct(
                        product
                    );

                }
            );

        }
    );

}


// ======================================================
// FIND 1C COLUMNS
// ======================================================

function find1CColumns(rows) {

    let headerRow = -1;

    let nameColumn = -1;

    let displayColumn = -1;

    let warehouseColumn = -1;

    let totalColumn = -1;


    const limit =
        Math.min(
            rows.length,
            80
        );


    // ==================================================
    // ИЩЕМ ШАПКУ
    // ==================================================

    for (
        let i = 0;
        i < limit;
        i++
    ) {

        const row =
            rows[i];


        if (
            !Array.isArray(row)
        ) {
            continue;
        }


        for (
            let j = 0;
            j < row.length;
            j++
        ) {

            const text =
                normalizeText(
                    row[j]
                );


            if (
                text === "номенклатура" ||
                text.includes("номенклатура")
            ) {

                nameColumn = j;

                headerRow = i;

            }

        }

    }


    // ==================================================
    // ЕСЛИ НАШЛИ НОМЕНКЛАТУРУ,
    // ИЩЕМ ОСТАЛЬНЫЕ КОЛОНКИ
    // В ТОЙ ЖЕ СТРОКЕ
    // ==================================================

    if (
        headerRow !== -1
    ) {

        const header =
            rows[headerRow];


        for (
            let j = 0;
            j < header.length;
            j++
        ) {

            const text =
                normalizeText(
                    header[j]
                );


            // ------------------------------
            // ВИТРИНА
            // ------------------------------

            if (
                text.includes("европолис") &&
                !text.includes("ов")
            ) {

                displayColumn = j;

            }


            // ------------------------------
            // СКЛАД
            // ------------------------------

            if (
                text.includes("европолис") &&
                text.includes("ов")
            ) {

                warehouseColumn = j;

            }


            // ------------------------------
            // ИТОГО
            // ------------------------------

            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = j;

            }

        }

    }


    console.log(
        "================================="
    );

    console.log(
        "СТРУКТУРА 1С"
    );

    console.log({
        headerRow,
        nameColumn,
        displayColumn,
        warehouseColumn,
        totalColumn
    });

    console.log(
        "================================="
    );


    // ==================================================
    // FALLBACK
    // ==================================================

    if (
        nameColumn === -1
    ) {

        nameColumn = 0;

    }


    if (
        displayColumn === -1
    ) {

        displayColumn = 4;

    }


    if (
        warehouseColumn === -1
    ) {

        warehouseColumn = 6;

    }


    if (
        totalColumn === -1
    ) {

        totalColumn = 7;

    }


    if (
        headerRow === -1
    ) {

        headerRow = 0;

    }


    return {

        headerRow,

        nameColumn,

        displayColumn,

        warehouseColumn,

        totalColumn

    };

}


// ======================================================
// PARSE 1C DATA
// ======================================================
//
// НОВАЯ ЛОГИКА:
//
// 1. Ищем раздел.
// 2. Запоминаем currentCategory.
// 3. Следующие строки считаем товарами.
// 4. Не угадываем модель как отдельный раздел.
// 5. Служебные строки пропускаем.
// 6. Аксессуары не останавливают импорт.
//
// ======================================================

function parse1CData(rows) {

    const result = [];


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        return result;

    }


    const columns =
        find1CColumns(
            rows
        );


    let productId = 1;

    let currentCategory = null;


    const start =
        Math.max(
            columns.headerRow + 1,
            0
        );


    for (
        let i = start;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];


        if (
            !Array.isArray(row)
        ) {

            continue;

        }


        // ==================================================
        // НАЗВАНИЕ
        // ==================================================

        const name =
            String(
                row[
                    columns.nameColumn
                ] ?? ""
            ).trim();


        if (!name) {
            continue;
        }


        const normalizedName =
            normalizeText(name);


        // ==================================================
        // PF / ПФ
        // ==================================================

        if (
            isPFRow(name)
        ) {

            console.log(
                "ПФ ИГНОРИРУЕМ:",
                name
            );

            continue;

        }


        // ==================================================
        // РАЗДЕЛ 1С
        // ==================================================

        const section =
            detectSectionHeader(
                name
            );


        if (section) {

            currentCategory =
                section;


            console.log(
                "РАЗДЕЛ:",
                name,
                "→",
                currentCategory
            );


            continue;

        }


        // ==================================================
        // ПОДГРУППА
        // ==================================================

        if (
            isSubGroupRow(name)
        ) {

            console.log(
                "ПОДГРУППА:",
                name
            );

            continue;

        }


        // ==================================================
        // СЛУЖЕБНАЯ СТРОКА
        // ==================================================

        if (
            isServiceRow(name)
        ) {

            continue;

        }


        // ==================================================
        // СТРОКИ, КОТОРЫЕ ЯВНО НЕ ТОВАР
        // ==================================================

        if (
            normalizedName.startsWith(
                "для "
            )
        ) {

            continue;

        }


        if (
            normalizedName.startsWith(
                "аксессуары для "
            )
        ) {

            continue;

        }


        // ==================================================
        // ОСТАТКИ
        // ==================================================

        const firstStock =
            Math.max(
                0,
                number(
                    row[
                        columns.displayColumn
                    ]
                )
            );


        const secondStock =
            Math.max(
                0,
                number(
                    row[
                        columns.warehouseColumn
                    ]
                )
            );


        // ==================================================
        // КАТЕГОРИЯ
        // ==================================================

        const category =
            detectCategory(
                name,
                currentCategory,
                null
            );


        // ==================================================
        // СОЗДАЁМ ТОВАР
        // ==================================================

        const product = {

            id:
                productId++,

            name,

            category,

            memory:
                "",

            color:
                "",

            display:
                firstStock,

            warehouse:
                secondStock,

            quantity:
                firstStock +
                secondStock,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        result.push(
            product
        );


        console.log(
            "ТОВАР:",
            name,
            "→",
            category,
            "|",
            firstStock,
            "|",
            secondStock
        );

    }


    // ==================================================
    // СТАТИСТИКА
    // ==================================================

    const stats = {};


    result.forEach(
        product => {

            stats[product.category] =
                (stats[product.category] || 0) + 1;

        }
    );


    console.log(
        "================================="
    );

    console.log(
        "ИМПОРТ ЗАВЕРШЁН"
    );

    console.log(
        "Всего:",
        result.length
    );

    console.log(
        "Статистика:",
        stats
    );

    console.log(
        "================================="
    );


    return result;

}


// ======================================================
// IMPORT 1C FILE
// ======================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files[0];


            if (!file) {
                return;
            }


            if (fileName) {

                fileName.textContent =
                    file.name;

            }


            if (
                typeof XLSX === "undefined"
            ) {

                if (importStatus) {

                    importStatus.textContent =
                        "Ошибка: библиотека XLSX не загрузилась.";

                }

                return;

            }


            if (importStatus) {

                importStatus.textContent =
                    "Читаю выгрузку 1С...";

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    try {

                        const data =
                            new Uint8Array(
                                event.target.result
                            );


                        const workbook =
                            XLSX.read(
                                data,
                                {
                                    type: "array"
                                }
                            );


                        if (
                            !workbook.SheetNames ||
                            workbook.SheetNames.length === 0
                        ) {

                            throw new Error(
                                "В файле нет листов."
                            );

                        }


                        const sheetName =
                            workbook.SheetNames[0];


                        const worksheet =
                            workbook.Sheets[
                                sheetName
                            ];


                        const rows =
                            XLSX.utils.sheet_to_json(
                                worksheet,
                                {
                                    header: 1,
                                    defval: ""
                                }
                            );


                        console.log(
                            "Лист:",
                            sheetName
                        );


                        console.log(
                            "Количество строк:",
                            rows.length
                        );


                        // ==================================================
                        // ПАРСИНГ
                        // ==================================================

                        const imported =
                            parse1CData(
                                rows
                            );


                        if (
                            !Array.isArray(imported) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Не удалось найти товары в выгрузке 1С."
                            );

                        }


                        // ==================================================
                        // ЗАМЕНЯЕМ БАЗУ
                        // ==================================================

                        products.length = 0;


                        imported.forEach(
                            product => {

                                products.push(
                                    product
                                );

                            }
                        );


                        normalizeProducts();


                        // ==================================================
                        // СОХРАНЕНИЕ
                        // ==================================================

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(
                                products
                            )
                        );


                        // ==================================================
                        // ПОКАЗ
                        // ==================================================

                        renderProducts(
                            products
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

                        }


                        console.log(
                            "================================="
                        );

                        console.log(
                            "ФИНАЛЬНАЯ БАЗА"
                        );

                        console.log(
                            "Всего товаров:",
                            products.length
                        );


                        const categories = [

                            "Смартфоны",
                            "Планшеты",
                            "Смарт-часы",
                            "Фитнес-браслеты",
                            "Наушники",
                            "Телевизоры",
                            "Камеры",
                            "Пылесосы",
                            "Аксессуары",
                            "Другое"

                        ];


                        categories.forEach(
                            category => {

                                console.log(
                                    category + ":",
                                    products.filter(
                                        p =>
                                            p.category ===
                                            category
                                    ).length
                                );

                            }
                        );


                        console.log(
                            "================================="
                        );

                    } catch (error) {

                        console.error(
                            "ОШИБКА ИМПОРТА:",
                            error
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                "Ошибка загрузки: " +
                                error.message;

                        }

                    }

                };


            reader.onerror =
                function () {

                    if (importStatus) {

                        importStatus.textContent =
                            "Не удалось прочитать файл.";

                    }

                };


            reader.readAsArrayBuffer(
                file
            );

        }
    );

}


// ======================================================
// BACK BUTTON
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-back]"
            );


        if (!button) {
            return;
        }


        if (
            window.history.length > 1
        ) {

            window.history.back();

        } else {

            window.location.href =
                "index.html";

        }

    }
);


// ======================================================
// LOAD SAVED PRODUCTS
// ======================================================

function loadSavedProducts() {

    try {

        const saved =
            localStorage.getItem(
                "xiaomiWebBaseProducts"
            );


        if (!saved) {
            return false;
        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            !Array.isArray(parsed) ||
            parsed.length === 0
        ) {

            return false;

        }


        products.length = 0;


        parsed.forEach(
            product => {

                products.push(
                    product
                );

            }
        );


        normalizeProducts();


        console.log(
            "Из localStorage загружено:",
            products.length,
            "товаров"
        );


        return true;

    } catch (error) {

        console.error(
            "Ошибка загрузки базы:",
            error
        );


        return false;

    }

}


// ======================================================
// INIT
// ======================================================

function initApp() {

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "ОШИБКА: массив products не найден."
        );

        return;

    }


    loadSavedProducts();


    normalizeProducts();


    console.log(
        "================================="
    );

    console.log(
        "XIAOMI WEBBASE"
    );

    console.log(
        "Всего товаров:",
        products.length
    );


    const categories = [

        "Смартфоны",
        "Планшеты",
        "Смарт-часы",
        "Фитнес-браслеты",
        "Наушники",
        "Телевизоры",
        "Камеры",
        "Пылесосы",
        "Аксессуары",
        "Другое"

    ];


    categories.forEach(
        category => {

            console.log(
                category + ":",
                products.filter(
                    p =>
                        p.category ===
                        category
                ).length
            );

        }
    );


    console.log(
        "================================="
    );


    if (productsList) {

        renderProducts(
            products
        );

    }


    if (productDetails) {

        renderProductPage();

    }

}


// ======================================================
// START
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();

}