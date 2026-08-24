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

    const result =
        Number(text);

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
// ACCESSORIES
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const accessoryWords = [

        "чехол",
        "чехлы",
        "case",

        "стекло",
        "стекла",
        "защитное стекло",

        "пленка",
        "пленки",
        "плёнка",
        "плёнки",

        "защитная пленка",
        "защитная плёнка",

        "glass",

        "клавиатура",
        "keyboard",

        "зарядное устройство",
        "зарядка",
        "зарядный",
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

        "наушник",
        "наушники",
        "earbuds",
        "headphones",

        "акустика",
        "колонка",
        "колонки",

        "аксессуар",
        "аксессуары"

    ];


    return accessoryWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// ACCESSORY GROUP
// ======================================================

function isAccessoryGroupName(name) {

    const text =
        normalizeText(name);


    if (
        text === "аксессуары"
    ) {

        return true;

    }


    if (
        text.startsWith("аксессуары ")
    ) {

        return true;

    }


    if (
        text.includes("аксессуары -")
    ) {

        return true;

    }


    return false;

}


// ======================================================
// EXPLICIT PRODUCT CATEGORY
// ======================================================

function detectExplicitProductCategory(name) {

    const text =
        normalizeText(name);


    // --------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------

    if (
        isAccessoryName(text)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // FITNESS BAND
    // --------------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("фитнес браслеты")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // SMART WATCH
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
    // SMARTPHONE
    // --------------------------------------------------

    if (
        text.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // TABLET
    // --------------------------------------------------

    if (
        text.includes("планшет")
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // HEADPHONES
    // --------------------------------------------------

    if (
        text.includes("наушник") ||
        text.includes("earbuds") ||
        text.includes("headphones")
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // TV
    // --------------------------------------------------

    if (
        text.includes("телевизор") ||
        text.includes("tv ")
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // CAMERA
    // --------------------------------------------------

    if (
        text.includes("камера")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // VACUUM
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
// Очень важно:
//
// "01 Смартфоны 70"
// "17 Планшеты 13"
// "Умные часы 50"
// "Фитнес-браслеты 30"
//
// это разделы 1С.
//
// Но:
// "Смартфон Xiaomi Redmi Note 15"
// "Фитнес-браслет Xiaomi Smart Band"
// "Планшет Redmi Pad 2"
//
// это товары.
//
// Поэтому заголовком считаем только строку,
// которая похожа именно на строку раздела:
// название категории + количество.
// ======================================================

function detectCategoryHeader(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // --------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------

    if (
        /^(\d+\s+)?аксессуары(\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // SMARTPHONES
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?смартфоны(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // TABLETS
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?планшеты(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // SMART WATCH
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?умные часы(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Смарт-часы";

    }


    if (
        /^(?:\d+\s+)?смарт[- ]часы(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // FITNESS BANDS
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?фитнес[- ]браслеты(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // HEADPHONES
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?наушники(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // TV
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?телевизоры(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // CAMERAS
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?камеры(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // VACUUMS
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?пылесосы(?:\s*[-–—:]?\s*\d+)?$/
            .test(text)
    ) {

        return "Пылесосы";

    }


    return null;

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


    const serviceWords = [

        "пф",
        "итого",
        "всего",
        "остаток",
        "остатки",
        "всего товаров",
        "количество",
        "номенклатура",
        "наименование",
        "артикул"

    ];


    if (
        serviceWords.includes(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// SUBGROUP
// ======================================================
//
// Только настоящие служебные подгруппы.
//
// ВАЖНО:
//
// "Redmi Note 15"
// "Redmi Pad 2"
// "Mi Band 11"
//
// сюда НЕ попадают.
// ======================================================

function isSubGroupRow(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    if (
        /^для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^аксессуары\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^чехлы\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^стекла\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^пленки\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^плёнки\s+для\s+/.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// CATEGORY
// ======================================================

function detectCategory(
    name,
    currentCategory
) {

    const explicit =
        detectExplicitProductCategory(
            name
        );


    // Явный тип товара имеет приоритет.
    if (explicit) {

        return explicit;

    }


    // Если товар находится внутри раздела 1С.
    if (currentCategory) {

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
                document.createElement(
                    "div"
                );


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


            // ------------------------------------------
            // НОМЕНКЛАТУРА
            // ------------------------------------------

            if (
                text === "номенклатура" ||
                text.includes("номенклатура")
            ) {

                nameColumn = j;

                headerRow = i;

            }


            // ------------------------------------------
            // ВИТРИНА
            // ------------------------------------------

            if (
                text.includes(
                    "склад тц европолис"
                ) &&
                !text.includes("ов")
            ) {

                displayColumn = j;

            }


            // ------------------------------------------
            // СКЛАД
            // ------------------------------------------

            if (
                text.includes(
                    "склад тц европолис ов"
                )
            ) {

                warehouseColumn = j;

            }


            // ------------------------------------------
            // ИТОГО
            // ------------------------------------------

            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = j;

            }

        }

    }


    console.log(
        "НАЙДЕНАЯ СТРУКТУРА 1С:",
        {
            headerRow,
            nameColumn,
            displayColumn,
            warehouseColumn,
            totalColumn
        }
    );


    // --------------------------------------------------
    // Если нашли основные колонки
    // --------------------------------------------------

    if (
        nameColumn !== -1 &&
        displayColumn !== -1 &&
        warehouseColumn !== -1
    ) {

        return {

            headerRow,

            nameColumn,

            displayColumn,

            warehouseColumn,

            totalColumn

        };

    }


    // --------------------------------------------------
    // Резервный вариант
    // --------------------------------------------------

    console.warn(
        "Не удалось определить все колонки автоматически."
    );


    console.warn(
        "Используется резервная структура A/E/G/H."
    );


    return {

        headerRow:
            headerRow !== -1
                ? headerRow
                : 0,

        nameColumn:
            nameColumn !== -1
                ? nameColumn
                : 0,

        displayColumn:
            displayColumn !== -1
                ? displayColumn
                : 4,

        warehouseColumn:
            warehouseColumn !== -1
                ? warehouseColumn
                : 6,

        totalColumn:
            totalColumn !== -1
                ? totalColumn
                : 7

    };

}


// ======================================================
// PARSE 1C DATA
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


    // Текущий раздел 1С.
    let currentCategory =
        null;


    const start =
        Math.max(
            columns.headerRow + 1,
            0
        );


    console.log(
        "НАЧАЛО ОБРАБОТКИ:",
        start
    );


    // ==================================================
    // ОСНОВНОЙ ЦИКЛ
    // ==================================================

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
            normalizeText(
                name
            );


        // ==================================================
        // 1. ОПРЕДЕЛЯЕМ ЗАГОЛОВОК РАЗДЕЛА
        // ==================================================

        const categoryHeader =
            detectCategoryHeader(
                name
            );


        if (categoryHeader) {

            currentCategory =
                categoryHeader;


            console.log(
                "================================="
            );


            console.log(
                "РАЗДЕЛ:",
                name,
                "→",
                currentCategory
            );


            console.log(
                "================================="
            );


            continue;

        }


        // ==================================================
        // 2. СЛУЖЕБНЫЕ СТРОКИ
        // ==================================================

        if (
            isServiceRow(
                name
            )
        ) {

            console.log(
                "СЛУЖЕБНАЯ СТРОКА:",
                name
            );


            continue;

        }


        // ==================================================
        // 3. ПОДГРУППЫ
        // ==================================================

        if (
            isSubGroupRow(
                name
            )
        ) {

            console.log(
                "ПОДГРУППА:",
                name
            );


            continue;

        }


        // ==================================================
        // 4. ОПРЕДЕЛЯЕМ КАТЕГОРИЮ ТОВАРА
        // ==================================================

        const category =
            detectCategory(
                name,
                currentCategory
            );


        // ==================================================
        // 5. ОСТАТКИ
        // ==================================================

        const display =
            Math.max(
                0,
                number(
                    row[
                        columns.displayColumn
                    ]
                )
            );


        const warehouse =
            Math.max(
                0,
                number(
                    row[
                        columns.warehouseColumn
                    ]
                )
            );


        // ==================================================
        // 6. СОЗДАЁМ ТОВАР
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

            display,

            warehouse,

            quantity:
                display + warehouse,

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
            "| Витрина:",
            display,
            "| Склад:",
            warehouse
        );

    }


    // ==================================================
    // СТАТИСТИКА
    // ==================================================

    const stats = {};


    result.forEach(
        product => {

            if (
                !stats[product.category]
            ) {

                stats[product.category] =
                    0;

            }


            stats[product.category]++;

        }
    );


    console.log(
        "================================="
    );


    console.log(
        "РЕЗУЛЬТАТ ИМПОРТА 1С"
    );


    console.log(
        "Всего:",
        result.length
    );


    console.log(
        "Категории:",
        stats
    );


    console.log(
        "================================="
    );


    return result;

}


// ======================================================
// IMPORT FILE
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
                            "================================="
                        );


                        console.log(
                            "ФАЙЛ 1С:",
                            file.name
                        );


                        console.log(
                            "ЛИСТ:",
                            sheetName
                        );


                        console.log(
                            "СТРОК:",
                            rows.length
                        );


                        console.log(
                            "ПЕРВЫЕ 30 СТРОК:",
                            rows.slice(
                                0,
                                30
                            )
                        );


                        console.log(
                            "================================="
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
                        // ЗАМЕНЯЕМ СТАРУЮ БАЗУ
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
                        // ОТОБРАЖЕНИЕ
                        // ==================================================

                        renderProducts(
                            products
                        );


                        // ==================================================
                        // СТАТИСТИКА
                        // ==================================================

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


                        console.log(
                            "================================="
                        );


                        console.log(
                            "ИТОГ:"
                        );


                        console.log(
                            "Всего товаров:",
                            products.length
                        );


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


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

                        }

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
            "Ошибка загрузки сохранённой базы:",
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
