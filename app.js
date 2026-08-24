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

    const text =
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
// ACCESSORY
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const words = [

        "чехол",
        "case",

        "стекло",
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "пленка",
        "плёнка",
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
        "buds",

        "акустика",

        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// ЯВНЫЙ ЗАГОЛОВОК КАТЕГОРИИ
// ======================================================
//
// Примеры:
//
// 01 смартфоны 70
// смартфоны - 70
// планшеты - 13
// фитнес-браслеты - 34
// умные часы 50
//
// Это НЕ товары.
//
// ======================================================

function detectGroupCategory(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // --------------------------------------------------
    // СМАРТФОНЫ
    // --------------------------------------------------

    if (
        text.includes("смартфоны") ||
        text.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
    // --------------------------------------------------

    if (
        text.includes("планшеты") ||
        text.includes("планшет")
    ) {

        // Но "чехол для планшета" не раздел.
        if (
            isAccessoryName(text)
        ) {

            return null;

        }

        if (
            text.includes("для планшета") ||
            text.includes("для планшетов")
        ) {

            return null;

        }

        return "Планшеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        text.includes("умные часы") ||
        text.includes("смарт часы") ||
        text.includes("смарт-часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТЫ
    // --------------------------------------------------

    if (
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("smart band")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        text === "наушники" ||
        text.startsWith("наушники ") ||
        text.includes("наушники -")
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОРЫ
    // --------------------------------------------------

    if (
        text === "телевизоры" ||
        text.startsWith("телевизоры ")
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        text === "камеры" ||
        text.startsWith("камеры ")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        text === "пылесосы" ||
        text.startsWith("пылесосы ")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// СТРОКА ЯВНО ЯВЛЯЕТСЯ ЗАГОЛОВКОМ
// ======================================================

function isCategoryGroupRow(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    // -----------------------------------------------
    // Общие количества
    // -----------------------------------------------

    if (
        /[-–—]\s*\d+\s*$/.test(text)
    ) {

        const category =
            detectGroupCategory(text);

        if (category) {
            return true;
        }

    }


    // -----------------------------------------------
    // "01 смартфоны 70"
    // "17 планшеты 13"
    // "умные часы 50"
    // -----------------------------------------------

    if (
        /^\d+\s+.*\d+\s*$/.test(text)
    ) {

        if (
            detectGroupCategory(text)
        ) {

            return true;

        }

    }


    // -----------------------------------------------
    // Чистые названия разделов
    // -----------------------------------------------

    const exactGroups = [

        "смартфоны",
        "планшеты",

        "смарт-часы",
        "смарт часы",
        "умные часы",

        "фитнес-браслеты",
        "фитнес браслеты",

        "наушники",
        "телевизоры",
        "камеры",
        "пылесосы",

        "аксессуары"

    ];


    if (
        exactGroups.includes(text)
    ) {

        return true;

    }


    // -----------------------------------------------
    // Служебные строки
    // -----------------------------------------------

    if (
        text === "итого" ||
        text === "всего"
    ) {

        return true;

    }


    return false;

}


// ======================================================
// СТРОКА ПОДГРУППЫ
// ======================================================
//
// Вот эти строки нельзя делать карточками:
//
// Для Redmi Note 15
// Для Redmi Pad 2
// Карточка для Redmi 2
// Аксессуары для планшетов
//
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

        /^плёнки\s+для\s+/

    ];


    for (const pattern of patterns) {

        if (
            pattern.test(text)
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// MODEL GROUP
// ======================================================
//
// Например:
//
// 17T
// 17T Pro
// Redmi Note 15
//
// Если ниже идут реальные SKU,
// такая строка может быть заголовком.
//
// Но теперь мы НЕ будем бездумно выкидывать
// короткие названия.
//
// ======================================================

function isModelGroupRow(
    name,
    rows,
    rowIndex,
    nameColumn
) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    // Явно товарные строки не трогаем.
    if (
        isAccessoryName(text)
    ) {

        return false;

    }


    // Если название содержит явный тип товара —
    // это скорее всего настоящий товар.

    const productTypeWords = [

        "смартфон",
        "планшет",

        "фитнес-браслет",
        "фитнес браслет",

        "смарт-часы",
        "смарт часы",
        "умные часы",

        "наушник",
        "наушники",

        "телевизор",
        "камера",
        "пылесос"

    ];


    if (
        productTypeWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return false;

    }


    // -----------------------------------------------
    // Если строка короткая и следующая строка
    // явно начинается с неё — считаем группой.
    // -----------------------------------------------

    if (
        text.length <= 25
    ) {

        const end =
            Math.min(
                rows.length,
                rowIndex + 5
            );


        for (
            let i = rowIndex + 1;
            i < end;
            i++
        ) {

            const nextRow =
                rows[i];


            if (
                !Array.isArray(nextRow)
            ) {
                continue;
            }


            const nextName =
                normalizeText(
                    nextRow[nameColumn]
                );


            if (!nextName) {
                continue;
            }


            if (
                nextName.includes(text) &&
                nextName.length >
                text.length + 4
            ) {

                return true;

            }

        }

    }


    return false;

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ ТОВАРА
// ======================================================

function detectCategory(
    product,
    currentCategory = null
) {

    const name =
        normalizeText(product.name);

    const category =
        normalizeText(product.category);


    // ==================================================
    // АКСЕССУАРЫ ВСЕГДА ПЕРВЫЕ
    // ==================================================

    if (
        isAccessoryName(name)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // ЯВНОЕ НАЗВАНИЕ ТОВАРА
    // ==================================================

    if (
        name.includes("фитнес-браслет") ||
        name.includes("фитнес браслет")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        name.includes("смарт-часы") ||
        name.includes("смарт часы") ||
        name.includes("умные часы")
    ) {

        return "Смарт-часы";

    }


    if (
        name.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    if (
        name.includes("планшет")
    ) {

        return "Планшеты";

    }


    // ==================================================
    // КАТЕГОРИЯ ИЗ САМОЙ СТРОКИ
    // ==================================================

    if (
        category.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    if (
        category.includes("планшет")
    ) {

        return "Планшеты";

    }


    if (
        category.includes("фитнес")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        category.includes("час")
    ) {

        return "Смарт-часы";

    }


    if (
        category.includes("науш")
    ) {

        return "Наушники";

    }


    // ==================================================
    // ГЛАВНОЕ:
    // ЕСЛИ МЫ НАХОДИМСЯ ВНУТРИ РАЗДЕЛА 1С
    // ==================================================

    if (
        currentCategory
    ) {

        return currentCategory;

    }


    // ==================================================
    // ЕСЛИ НИЧЕГО НЕ УЗНАЛИ
    // ==================================================

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


    if (!prepared.category) {

        prepared.category =
            "Другое";

    }


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
            50
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


            if (
                text === "номенклатура" ||
                text.includes("номенклатура")
            ) {

                nameColumn = j;

                headerRow = i;

            }


            if (
                text.includes(
                    "склад тц европолис ов"
                )
            ) {

                warehouseColumn = j;

            }


            if (
                text.includes(
                    "склад тц европолис"
                ) &&
                !text.includes("ов")
            ) {

                displayColumn = j;

            }


            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = j;

            }

        }

    }


    console.log(
        "Найденные колонки:",
        {
            nameColumn,
            displayColumn,
            warehouseColumn,
            totalColumn,
            headerRow
        }
    );


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


    console.warn(
        "Используется запасная структура A/E/G/H."
    );


    return {

        headerRow:
            headerRow !== -1
                ? headerRow
                : 0,

        nameColumn:
            0,

        displayColumn:
            4,

        warehouseColumn:
            6,

        totalColumn:
            7

    };

}


// ======================================================
// PARSE 1C
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


    if (!columns) {

        return result;

    }


    let productId = 1;


    let currentCategory =
        null;


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
        // 1. ЗАГОЛОВОК РАЗДЕЛА
        // ==================================================
        //
        // Например:
        //
        // 01 смартфоны 70
        // 17 планшеты 13
        // Умные часы 50
        // Фитнес-браслеты -34
        //
        // Сохраняем категорию,
        // но саму строку НЕ создаём как товар.
        // ==================================================

        const groupCategory =
            detectGroupCategory(
                name
            );


        if (
            groupCategory &&
            isCategoryGroupRow(name)
        ) {

            currentCategory =
                groupCategory;


            console.log(
                "РАЗДЕЛ 1С:",
                name,
                "→",
                currentCategory
            );


            continue;

        }


        // ==================================================
        // 2. ПОДГРУППЫ
        // ==================================================
        //
        // Для Redmi Note 15
        // Для Redmi Pad 2
        // Карточка для Redmi 2
        //
        // Никогда не создаём карточку.
        // ==================================================

        if (
            isSubGroupRow(name)
        ) {

            console.log(
                "ПОДГРУППА 1С:",
                name
            );


            continue;

        }


        // ==================================================
        // 3. СЛУЖЕБНЫЕ СТРОКИ
        // ==================================================

        if (
            isCategoryGroupRow(name)
        ) {

            console.log(
                "СЛУЖЕБНАЯ СТРОКА:",
                name
            );


            continue;

        }


        // ==================================================
        // 4. МОДЕЛЬНАЯ ГРУППА
        // ==================================================

        if (
            isModelGroupRow(
                name,
                rows,
                i,
                columns.nameColumn
            )
        ) {

            console.log(
                "МОДЕЛЬНАЯ ГРУППА:",
                name
            );


            continue;

        }


        // ==================================================
        // 5. ОСТАТКИ
        // ==================================================

        const warehouse =
            Math.max(
                0,
                number(
                    row[
                        columns.displayColumn
                    ]
                )
            );


        const display =
            Math.max(
                0,
                number(
                    row[
                        columns.warehouseColumn
                    ]
                )
            );


        // ==================================================
        // 6. НЕ ДОПУСКАЕМ ПОДГРУППЫ
        // ==================================================

        if (
            normalizedName.startsWith(
                "для "
            )
        ) {

            continue;

        }


        // ==================================================
        // 7. НЕ ДОПУСКАЕМ СТРОКИ
        // "Аксессуары для..."
        // ==================================================

        if (
            normalizedName.startsWith(
                "аксессуары для "
            )
        ) {

            continue;

        }


        // ==================================================
        // 8. КАТЕГОРИЯ
        // ==================================================

        const category =
            detectCategory(
                {
                    name,
                    category:
                        currentCategory || ""
                },
                currentCategory
            );


        // ==================================================
        // 9. СОЗДАЁМ ТОВАР
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
            "Витрина:",
            display,
            "Склад:",
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
        "ИМПОРТ 1С"
    );


    console.log(
        "Реально импортировано:",
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
                            "Строк:",
                            rows.length
                        );


                        console.log(
                            "Первые строки:",
                            rows.slice(
                                0,
                                20
                            )
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
                        // СОХРАНЯЕМ
                        // ==================================================

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(
                                products
                            )
                        );


                        // ==================================================
                        // ПОКАЗЫВАЕМ
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
                            "ИМПОРТ ЗАВЕРШЁН"
                        );


                        console.log(
                            "Всего:",
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


    console.log(
        "Категории:"
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