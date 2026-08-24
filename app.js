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

    const result = Number(text);

    return Number.isFinite(result)
        ? result
        : 0;

}


// ======================================================
// NORMALIZE TEXT
// ======================================================

function normalizeText(value) {

    return String(value || "")
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
// УДАЛЕНИЕ СЛУЖЕБНОГО НОМЕРА В НАЧАЛЕ СТРОКИ
// ======================================================
//
// Например:
//
// 01 Смартфоны 70
// 17 Планшеты
// 03 Умные часы 50
//
// После обработки:
//
// смартфоны 70
// планшеты
// умные часы 50
//
// ======================================================

function removeLeadingGroupNumber(text) {

    return String(text || "")
        .trim()
        .replace(
            /^\d+(?:[.,]\d+)?\s+/,
            ""
        )
        .trim();

}


// ======================================================
// ЯВЛЯЕТСЯ ЛИ СТРОКА АКСЕССУАРОМ
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(
            removeLeadingGroupNumber(name)
        );


    const words = [

        "чехол",
        "чехлы",
        "case",

        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло защитное",
        "стекло",
        "пленка",
        "плёнка",
        "glass",

        "клавиатура",
        "клавиатуры",
        "keyboard",

        "зарядное устройство",
        "зарядка",
        "зарядный блок",
        "charger",
        "адаптер питания",

        "кабель",
        "кабели",
        "cable",

        "ремешок",
        "ремешки",
        "strap",

        "переходник",
        "переходники",
        "adapter",

        "держатель",
        "держатели",
        "holder",

        "стилус",
        "stylus",

        "наушник",
        "наушники",
        "earbuds",
        "headphones",
        "buds",

        "автомобильный держатель",
        "автодержатель",

        "пауэрбанк",
        "powerbank",
        "power bank",

        "аккумулятор",

        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// СТРОКА ЯВЛЯЕТСЯ ЗАГОЛОВКОМ АКСЕССУАРОВ
// ======================================================
//
// Например:
//
// Аксессуары для планшетов
// Для Redmi Pad 2
// Для Redmi Note 15
//
// Это НЕ товар.
//
// ======================================================

function isAccessoryGroupRow(name) {

    const text =
        normalizeText(
            removeLeadingGroupNumber(name)
        );


    if (!text) {
        return true;
    }


    const patterns = [

        /^аксессуары$/,
        /^аксессуары для /,
        /^для планшетов$/,
        /^для планшета$/,
        /^для смартфонов$/,
        /^для смартфона$/,
        /^для redmi /,
        /^для xiaomi /,
        /^для mi /,
        /^для poco /,
        /^совместимые с /,
        /^для часов$/,
        /^для смарт.?часов$/,
        /^для браслетов$/

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}


// ======================================================
// ГРУППА С КОЛИЧЕСТВОМ
// ======================================================
//
// Ловит:
//
// Фитнес-браслеты - 34
// Планшеты - 13
// Умные часы 50
// 01 Смартфоны 70
// 17 Планшеты
//
// ======================================================

function isQuantityGroupRow(name) {

    let text =
        normalizeText(name);


    text =
        removeLeadingGroupNumber(text);


    // -----------------------------------------------
    // Любая строка, заканчивающаяся количеством
    // -----------------------------------------------

    if (
        /[-–—]\s*\d+\s*$/.test(text)
    ) {

        return true;

    }


    // -----------------------------------------------
    // Категория + число
    // -----------------------------------------------

    if (
        /^(смартфоны|планшеты|умные часы|смарт-часы|смарт часы|часы|фитнес-браслеты|фитнес браслеты|наушники|телевизоры|камеры|пылесосы|аксессуары)(?:\s+\d+)?\s*$/.test(text)
    ) {

        return true;

    }


    // -----------------------------------------------
    // "01 смартфоны 70"
    // уже очищено от 01
    // -----------------------------------------------

    if (
        /^(смартфоны|планшеты|умные часы|смарт-часы|смарт часы|часы|фитнес-браслеты|фитнес браслеты|наушники|телевизоры|камеры|пылесосы|аксессуары)\s+\d+\s*$/.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ОБЩИЕ ГРУППЫ
// ======================================================

function isGeneralGroupRow(name) {

    let text =
        normalizeText(name);


    text =
        removeLeadingGroupNumber(text);


    const groups = [

        "итого",
        "всего",

        "смартфоны",
        "планшеты",

        "умные часы",
        "смарт часы",
        "смарт-часы",
        "часы",

        "фитнес браслеты",
        "фитнес-браслеты",

        "наушники",
        "телевизоры",
        "камеры",
        "пылесосы",

        "аксессуары",

        "аксессуары для планшетов",
        "аксессуары для планшета",

        "аксессуары для смартфонов",
        "аксессуары для смартфона"

    ];


    return groups.includes(text);

}


// ======================================================
// СТРОКА ЯВЛЯЕТСЯ ГРУППОЙ
// ======================================================

function isGroupRow(name) {

    const original =
        String(name || "").trim();


    if (!original) {
        return true;
    }


    if (
        isGeneralGroupRow(original)
    ) {

        return true;

    }


    if (
        isQuantityGroupRow(original)
    ) {

        return true;

    }


    if (
        isAccessoryGroupRow(original)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ПРОВЕРКА НА ПОДОЗРИТЕЛЬНУЮ МОДЕЛЬНУЮ ГРУППУ
// ======================================================
//
// Важный момент:
//
// Mi Band 10 Pro
// 17T
// Redmi Note 15
// Redmi Pad 2
//
// сами по себе могут быть моделью-группой.
//
// Но если следующими строками идут реальные SKU,
// заголовок не импортируем.
//
// ======================================================

function isModelGroupRow(
    name,
    rows,
    rowIndex,
    nameColumn
) {

    const text =
        normalizeText(
            removeLeadingGroupNumber(name)
        );


    if (!text) {
        return true;
    }


    // -----------------------------------------------
    // Группы "Для Redmi..."
    // -----------------------------------------------

    if (
        /^для\s+/i.test(text)
    ) {

        return true;

    }


    // -----------------------------------------------
    // "Mi Band 10 Pro" как заголовок
    // -----------------------------------------------

    const modelGroupPatterns = [

        /^mi band \d+/,
        /^redmi pad \d+/,
        /^xiaomi pad \d+/,
        /^redmi note \d+/,
        /^xiaomi \d+\s*$/,
        /^\d{1,3}t(?: pro|max|ultra)?$/

    ];


    const looksLikeModel =
        modelGroupPatterns.some(
            pattern =>
                pattern.test(text)
        );


    if (!looksLikeModel) {
        return false;
    }


    // -----------------------------------------------
    // Ищем следующие строки
    // -----------------------------------------------

    const maxLookAhead =
        Math.min(
            rows.length,
            rowIndex + 8
        );


    let foundChild = false;


    for (
        let i = rowIndex + 1;
        i < maxLookAhead;
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


        // -------------------------------------------
        // Если следующая строка — группа,
        // прекращаем проверку.
        // -------------------------------------------

        if (
            isGroupRow(nextName)
        ) {

            break;

        }


        // -------------------------------------------
        // Если начинается с названия модели
        // и длиннее заголовка —
        // скорее всего это SKU.
        // -------------------------------------------

        if (
            nextName.includes(text) &&
            nextName.length > text.length + 3
        ) {

            foundChild = true;
            break;

        }

    }


    return foundChild;

}


// ======================================================
// РЕАЛЬНЫЙ ТОВАР
// ======================================================

function looksLikeRealProduct(name) {

    let text =
        normalizeText(name);


    text =
        removeLeadingGroupNumber(text);


    if (!text) {
        return false;
    }


    // -----------------------------------------------
    // Сначала исключаем служебные строки
    // -----------------------------------------------

    if (
        isGroupRow(text)
    ) {

        return false;

    }


    if (
        isAccessoryGroupRow(text)
    ) {

        return false;

    }


    // -----------------------------------------------
    // Явные товарные признаки
    // -----------------------------------------------

    const productWords = [

        "смартфон",
        "smartphone",

        "redmi note",
        "redmi ",
        "xiaomi ",

        "планшет",
        "redmi pad",
        "xiaomi pad",

        "чехол",
        "case",

        "стекло",
        "пленка",
        "плёнка",

        "клавиатур",
        "keyboard",

        "наушник",
        "buds",
        "earbuds",
        "headphones",

        "камера",
        "camera",

        "телевизор",
        "xiaomi tv",
        "tv",

        "пылесос",
        "vacuum",

        "зарядн",
        "charger",

        "кабель",
        "cable",

        "ремешок",
        "strap",

        "браслет",
        "band",

        "часы",
        "watch",

        "стилус",
        "stylus",

        "очиститель",
        "увлажнитель",

        "фен",

        "бритв",

        "весы",

        "лампа",

        "держатель",

        "адаптер",

        "мышь",

        "монитор",

        "маршрутизатор",

        "роутер"

    ];


    if (
        productWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return true;

    }


    // -----------------------------------------------
    // Модельные обозначения
    // -----------------------------------------------

    if (
        /\b\d{1,2}t\b/i.test(text) ||
        /\b\d{2,3}\s*pro\b/i.test(text) ||
        /\b\d{2,3}gb\b/i.test(text) ||
        /\b\d{2,3}g\b/i.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// КАТЕГОРИЯ
// ======================================================

function detectCategory(product) {

    const category =
        normalizeText(
            product.category
        );

    const name =
        normalizeText(
            product.name
        );

    const text =
        category +
        " " +
        name;


    // ==================================================
    // АКСЕССУАРЫ — ПЕРВЫМИ
    // ==================================================

    if (
        isAccessoryName(name)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // СМАРТФОНЫ
    // ==================================================

    if (
        text.includes("смартфон") ||
        text.includes("smartphone") ||
        text.includes("redmi note") ||
        text.includes("redmi k") ||
        text.includes("xiaomi 1") ||
        text.includes("xiaomi 2") ||
        text.includes("xiaomi 3") ||
        text.includes("xiaomi 4") ||
        text.includes("xiaomi 5") ||
        text.includes("xiaomi 6") ||
        text.includes("xiaomi 7") ||
        text.includes("xiaomi 8") ||
        text.includes("xiaomi 9") ||
        text.includes("xiaomi 10") ||
        text.includes("xiaomi 11") ||
        text.includes("xiaomi 12") ||
        text.includes("xiaomi 13") ||
        text.includes("xiaomi 14") ||
        text.includes("xiaomi 15") ||
        text.includes("xiaomi 16") ||
        text.includes("xiaomi 17")
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // ПЛАНШЕТЫ
    // ==================================================

    if (
        text.includes("планшет") ||
        text.includes("redmi pad") ||
        text.includes("xiaomi pad")
    ) {

        return "Планшеты";

    }


    // ==================================================
    // СМАРТ-ЧАСЫ
    // ==================================================

    if (
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("умные часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch") ||
        /\bwatch\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("mi band") ||
        text.includes("mi-band") ||
        text.includes("smart band")
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // НАУШНИКИ
    // ==================================================

    if (
        text.includes("наушник") ||
        text.includes("buds") ||
        text.includes("earbuds") ||
        text.includes("headphones")
    ) {

        return "Наушники";

    }


    // ==================================================
    // ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        text.includes("телевизор") ||
        text.includes("xiaomi tv") ||
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // КАМЕРЫ
    // ==================================================

    if (
        text.includes("камера") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // ==================================================
    // ПЫЛЕСОСЫ
    // ==================================================

    if (
        text.includes("пылесос") ||
        text.includes("vacuum")
    ) {

        return "Пылесосы";

    }


    // ==================================================
    // ДРУГОЕ
    // ==================================================

    return "Другое";

}


// ======================================================
// STOCK
// ======================================================

function getStock(product) {

    const display =
        number(
            product.display
        );

    const warehouse =
        number(
            product.warehouse
        );


    return {

        display,

        warehouse,

        total:
            display +
            warehouse

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
        detectCategory(
            prepared
        );


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
        product =>
            products.push(product)
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

                        ${escapeHTML(product.category)}

                    </div>


                    <div class="product-name">

                        ${escapeHTML(product.name)}

                    </div>


                    ${
                        product.memory ||
                        product.color
                            ? `

                                <div class="product-info">

                                    ${escapeHTML(product.memory || "")}

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${escapeHTML(product.color || "")}

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

}


if (searchInput) {

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

                    ${escapeHTML(product.category)}

                </div>


                <h1>

                    ${escapeHTML(product.name)}

                </h1>


                ${
                    product.memory
                        ? `
                            <div class="product-memory">

                                ${escapeHTML(product.memory)}

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
                                    ${escapeHTML(product.color)}
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

                        ${
                            escapeHTML(
                                product.description ||
                                "Описание пока не добавлено."
                            )
                        }

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

                        ${
                            escapeHTML(
                                product.tip ||
                                "Подсказка пока не добавлена."
                            )
                        }

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
                        number(
                            product.display
                        ) +
                        number(
                            product.warehouse
                        );


                    try {

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(products)
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
// ПОИСК КОЛОНОК 1С
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
        "Не удалось найти все заголовки. Использую A/E/G/H."
    );


    return {

        headerRow:
            headerRow !== -1
                ? headerRow
                : 0,

        nameColumn: 0,

        displayColumn: 4,

        warehouseColumn: 6,

        totalColumn: 7

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
        // NAME
        // ==================================================

        let name =
            String(
                row[
                    columns.nameColumn
                ] ?? ""
            ).trim();


        if (!name) {
            continue;
        }


        const cleanName =
            removeLeadingGroupNumber(
                name
            );


        // ==================================================
        // ЖЁСТКО УБИРАЕМ ГРУППЫ
        // ==================================================

        if (
            isGroupRow(cleanName)
        ) {

            console.log(
                "Пропущена группа:",
                name
            );

            continue;

        }


        // ==================================================
        // УБИРАЕМ "ДЛЯ REDMI..."
        // ==================================================

        if (
            isAccessoryGroupRow(cleanName)
        ) {

            console.log(
                "Пропущена группа аксессуаров:",
                name
            );

            continue;

        }


        // ==================================================
        // МОДЕЛЬНЫЕ ГРУППЫ
        // ==================================================

        if (
            isModelGroupRow(
                cleanName,
                rows,
                i,
                columns.nameColumn
            )
        ) {

            console.log(
                "Пропущена модельная группа:",
                name
            );

            continue;

        }


        // ==================================================
        // НЕ ТОВАР
        // ==================================================

        if (
            !looksLikeRealProduct(
                cleanName
            )
        ) {

            console.log(
                "Пропущена подозрительная строка:",
                name
            );

            continue;

        }


        // ==================================================
        // STOCK
        // ==================================================

        let warehouse =
            number(
                row[
                    columns.displayColumn
                ]
            );


        let display =
            number(
                row[
                    columns.warehouseColumn
                ]
            );


        warehouse =
            Math.max(
                0,
                warehouse
            );


        display =
            Math.max(
                0,
                display
            );


        // ==================================================
        // PRODUCT
        // ==================================================

        const product = {

            id:
                productId++,

            name:
                cleanName,

            category:
                "",

            memory:
                "",

            color:
                "",

            display:
                display,

            warehouse:
                warehouse,

            quantity:
                display +
                warehouse,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        // ==================================================
        // CATEGORY
        // ==================================================

        product.category =
            detectCategory(
                product
            );


        result.push(
            product
        );

    }


    // ==================================================
    // STATS
    // ==================================================

    const stats = {};


    result.forEach(
        product => {

            stats[
                product.category
            ] =
                (
                    stats[
                        product.category
                    ] || 0
                ) + 1;

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
                        // PARSE
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
                        // REPLACE DATABASE
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
                        // SAVE
                        // ==================================================

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(
                                products
                            )
                        );


                        // ==================================================
                        // RENDER
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
// BACK
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
// LOAD SAVED DATABASE
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
            product =>
                products.push(product)
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
// START
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


    // Загружаем сохранённую базу
    loadSavedProducts();


    // Нормализуем
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
        "Смартфоны:",
        products.filter(
            p =>
                p.category ===
                "Смартфоны"
        ).length
    );


    console.log(
        "Планшеты:",
        products.filter(
            p =>
                p.category ===
                "Планшеты"
        ).length
    );


    console.log(
        "Смарт-часы:",
        products.filter(
            p =>
                p.category ===
                "Смарт-часы"
        ).length
    );


    console.log(
        "Фитнес-браслеты:",
        products.filter(
            p =>
                p.category ===
                "Фитнес-браслеты"
        ).length
    );


    console.log(
        "Аксессуары:",
        products.filter(
            p =>
                p.category ===
                "Аксессуары"
        ).length
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
// RUN
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