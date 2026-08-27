// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// НОВЫЙ АЛГОРИТМ:
//
// 1. Определяем товар ПО НАЗВАНИЮ
// 2. Не используем остатки как главный признак товара
// 3. Заголовки 1С игнорируем
// 4. Склад и витрина берём из правильных колонок
//
// РЕАЛЬНАЯ ТАБЛИЦА 1С:
//
// A = Номенклатура       index 0
// E = Склад ТЦ Европолис index 4
// G = Склад ТЦ Европолис ОВ index 6
//
// E = СКЛАД
// G = ВИТРИНА
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
// IMPORT CONFIG
// ======================================================
//
// ВАЖНО:
//
// Номенклатура = A = 0
// Склад        = E = 4
// Витрина      = G = 6
//
// ======================================================

const IMPORT_CONFIG = {

    headerRow: 5,

    nameColumn: 0,

    warehouseColumn: 4,

    displayColumn: 6

};


// ======================================================
// STORAGE
// ======================================================

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";


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
            .replace(/\u00A0/g, "")
            .replace(/\s/g, "")
            .replace(",", ".");

    if (!text) {
        return 0;
    }

    text =
        text.replace(/[^\d.+-]/g, "");

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
        .replace(/–/g, "-")
        .replace(/—/g, "-")
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
// CLEAN PRODUCT NAME
// ======================================================

function cleanProductName(name) {

    return String(name ?? "")
        .trim()
        .replace(/^\d+\s+/, "")
        .trim();

}


// ======================================================
// NUMBER STRING
// ======================================================

function looksLikeNumber(value) {

    const text =
        normalizeText(value);

    if (!text) {
        return false;
    }

    return /^[-+]?\d+(?:[.,]\d+)?$/.test(text);

}


// ======================================================
// СЛУЖЕБНЫЕ СЛОВА
// ======================================================

function isServiceRow(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return true;
    }


    const exactWords = [

        "итого",
        "всего",
        "номенклатура",
        "количество",
        "остаток",
        "остатки",
        "товары",
        "товар",
        "старые",
        "старое",
        "старый",
        "прочее",
        "прочие",
        "прочее оборудование",
        "карты лояльности и пакеты",
        "карты лояльности",
        "сертификаты",
        "товары на ответственном хранении 002",
        "пластиковая карта (халва)"

    ];


    if (
        exactWords.includes(text)
    ) {

        return true;

    }


    // Только число

    if (
        looksLikeNumber(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ACCESSORIES
// ======================================================
//
// АКСЕССУАРЫ ПРОВЕРЯЕМ ПЕРВЫМИ.
//
// Например:
//
// "Чехол для Redmi Note 15"
// → Аксессуары
//
// несмотря на Redmi Note.
//
// ======================================================

function isAccessory(name) {

    const text =
        normalizeText(name);


    const words = [

        // Чехлы
        "чехол",
        "чехлы",
        "case",

        // Стекло
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло для",
        "пленка для",
        "плёнка для",
        "tempered glass",

        // Зарядка
        "зарядное устройство",
        "зарядное",
        "зарядка",
        "зарядный",
        "зарядная",
        "charger",

        // Кабели
        "кабель",
        "кабели",
        "cable",

        // Ремешки
        "ремешок",
        "ремешки",
        "strap",

        // Переходники
        "переходник",
        "переходники",
        "adapter",

        // Держатели
        "держатель",
        "держатели",
        "holder",

        // Стилусы
        "стилус",
        "stylus",

        // Клавиатуры
        "клавиатура",
        "keyboard",

        // Наушники
        "наушник",
        "наушники",
        "earbuds",
        "headphones",
        "headset",

        // Сумки
        "сумка",
        "сумка для",
        "чехол-сумка",

        // Блоки питания
        "блок питания",
        "power adapter",
        "power supply",

        // Док-станции
        "док-станция",
        "док станция",
        "dock station",

        // Аксессуары
        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// PRODUCT TYPE
// ======================================================
//
// ГЛАВНЫЙ АЛГОРИТМ.
//
// ТОВАР ОПРЕДЕЛЯЕТСЯ ПО НАЗВАНИЮ.
//
// ======================================================

function detectProductType(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // ==================================================
    // 1. АКСЕССУАРЫ
    // ==================================================

    if (
        isAccessory(text)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // 2. ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("фитнес браслеты")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        /\bmi band\b/.test(text) ||
        /\bmi smart band\b/.test(text) ||
        /\bxiaomi smart band\b/.test(text) ||
        /\bredmi band\b/.test(text) ||
        /\bsmart band\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // 3. СМАРТ-ЧАСЫ
    // ==================================================

    if (
        text.includes("умные часы") ||
        text.includes("умные час") ||
        text.includes("смарт часы") ||
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    if (
        /\bxiaomi watch\b/.test(text) ||
        /\bredmi watch\b/.test(text) ||
        /\bwatch s\d+\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // 4. ПЛАНШЕТЫ
    // ==================================================

    if (
        text.includes("планшет")
    ) {

        return "Планшеты";

    }


    if (
        /\bxiaomi pad\b/.test(text) ||
        /\bredmi pad\b/.test(text) ||
        /\bpad \d/.test(text) ||
        /\bpad pro\b/.test(text) ||
        /\bpad se\b/.test(text)
    ) {

        return "Планшеты";

    }


    // ==================================================
    // 5. СМАРТФОНЫ
    // ==================================================

    if (
        text.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi note\b/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi\s+\d/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi\s+a\d+/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi\s+c\d+/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi\s+k\d+/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi\s+turbo/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bxiaomi\s+\d+/.test(text)
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // 6. ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        text.includes("телевизор") ||
        text.includes("телевизоры")
    ) {

        return "Телевизоры";

    }


    if (
        /\bxiaomi tv\b/.test(text) ||
        /\bredmi tv\b/.test(text) ||
        /\bmi tv\b/.test(text) ||
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // 7. КАМЕРЫ
    // ==================================================

    if (
        text.includes("камера") ||
        text.includes("камеры") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // ==================================================
    // 8. ПЫЛЕСОСЫ
    // ==================================================

    if (
        text.includes("пылесос") ||
        text.includes("пылесосы") ||
        text.includes("робот-пылесос") ||
        text.includes("робот пылесос")
    ) {

        return "Пылесосы";

    }


    if (
        text.includes("robot vacuum")
    ) {

        return "Пылесосы";

    }


    // ==================================================
    // НИЧЕГО НЕ НАШЛИ
    // ==================================================

    return null;

}


// ======================================================
// SECTION
// ======================================================
//
// Разделы нужны только для статистики.
//
// Они НЕ определяют товар.
//
// ======================================================

function detectSection(name) {

    const text =
        normalizeText(name)
            .replace(/^\d+\s*/, "")
            .trim();


    if (!text) {
        return null;
    }


    // Смартфоны

    if (
        /^смартфоны?(?:\s+\d+)?$/.test(text)
    ) {

        return "Смартфоны";

    }


    // Планшеты

    if (
        /^планшеты?(?:\s+\d+)?$/.test(text)
    ) {

        return "Планшеты";

    }


    // Часы

    if (
        /^умные часы(?:\s+\d+)?$/.test(text) ||
        /^смарт часы(?:\s+\d+)?$/.test(text) ||
        /^смарт-часы(?:\s+\d+)?$/.test(text)
    ) {

        return "Смарт-часы";

    }


    // Браслеты

    if (
        /^фитнес браслеты?(?:\s+\d+)?$/.test(text) ||
        /^фитнес-браслеты?(?:\s+\d+)?$/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // Наушники

    if (
        /^наушники(?:\s+\d+)?$/.test(text)
    ) {

        return "Наушники";

    }


    // Телевизоры

    if (
        /^телевизоры(?:\s+\d+)?$/.test(text)
    ) {

        return "Телевизоры";

    }


    // Камеры

    if (
        /^камеры(?:\s+\d+)?$/.test(text)
    ) {

        return "Камеры";

    }


    // Пылесосы

    if (
        /^пылесосы(?:\s+\d+)?$/.test(text)
    ) {

        return "Пылесосы";

    }


    // Аксессуары

    if (
        /^аксессуары(?:\s+\d+)?$/.test(text)
    ) {

        return "Аксессуары";

    }


    return null;

}


// ======================================================
// SUBGROUP
// ======================================================

function isSubGroup(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    const patterns = [

        /^для\s+/,

        /^карточка\s+для\s+/,

        /^товары\s+для\s+/,

        /^аксессуары\s+для\s+/,

        /^чехлы\s+для\s+/,

        /^стекла\s+для\s+/,

        /^пленки\s+для\s+/,

        /^пленка\s+для\s+/,

        /^плёнки\s+для\s+/,

        /^плёнка\s+для\s+/

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}


// ======================================================
// REAL PRODUCT
// ======================================================
//
// ВАЖНО:
//
// Здесь больше НЕТ логики:
//
// "если есть остаток → это товар"
//
// Теперь:
//
// "если название похоже на товар → это товар"
//
// ======================================================

function isRealProductRow(row, name) {

    if (!Array.isArray(row)) {
        return false;
    }


    const text =
        normalizeText(name);


    if (!text) {
        return false;
    }


    // Служебные строки

    if (
        isServiceRow(text)
    ) {

        return false;

    }


    // Подгруппы

    if (
        isSubGroup(text)
    ) {

        return false;

    }


    // Заголовки

    if (
        detectSection(text)
    ) {

        return false;

    }


    // Только число

    if (
        looksLikeNumber(text)
    ) {

        return false;

    }


    // ==================================================
    // ГЛАВНОЕ
    // ==================================================
    //
    // Если название явно соответствует товару,
    // создаём карточку.
    //
    // Остаток вообще не важен.
    //
    // Даже если:
    //
    // склад = 0
    // витрина = 0
    //
    // товар всё равно будет создан.
    //

    const productType =
        detectProductType(text);


    if (productType) {

        return true;

    }


    // ==================================================
    // НЕИЗВЕСТНЫЕ СТРОКИ
    // ==================================================
    //
    // ВАЖНО:
    //
    // Больше НЕ принимаем любую строку длиной > 4.
    //
    // Именно это раньше создавало:
    //
    // "Старые"
    // "HITBUY"
    // "звук"
    // "колонки"
    // "SIM карты"
    // и т.д.
    //
    // ==================================================

    return false;

}


// ======================================================
// CLASSIFY PRODUCT
// ======================================================

function classifyProduct(name) {

    const cleaned =
        cleanProductName(name);


    const detected =
        detectProductType(cleaned);


    if (detected) {

        return detected;

    }


    return "Другое";

}


// ======================================================
// CREATE PRODUCT
// ======================================================

function createProduct(
    row,
    name,
    category,
    id
) {

    // ==================================================
    // ПРАВИЛЬНЫЕ КОЛОНКИ
    // ==================================================

    const warehouse =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG.warehouseColumn
                ]
            )
        );


    const display =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG.displayColumn
                ]
            )
        );


    return {

        id,

        name:
            cleanProductName(name),

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

}


// ======================================================
// ANALYZE 1C TABLE
// ======================================================

function analyze1CTable(rows) {

    const result = [];


    const stats = {

        totalRows:
            Array.isArray(rows)
                ? rows.length
                : 0,

        sections: 0,

        subGroups: 0,

        ignored: 0,

        realProducts: 0,

        categories: {}

    };


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        return {
            products: [],
            stats
        };

    }


    let productId = 1;


    // ==================================================
    // ВАЖНО
    // ==================================================
    //
    // Начинаем после строки заголовков.
    //
    // ==================================================

    const startRow =
        IMPORT_CONFIG.headerRow + 1;


    for (
        let rowIndex = startRow;
        rowIndex < rows.length;
        rowIndex++
    ) {

        const row =
            rows[rowIndex];


        if (
            !Array.isArray(row)
        ) {

            stats.ignored++;

            continue;

        }


        const rawName =
            String(
                row[
                    IMPORT_CONFIG.nameColumn
                ] ?? ""
            ).trim();


        if (!rawName) {

            stats.ignored++;

            continue;

        }


        const normalized =
            normalizeText(rawName);


        // ==================================================
        // РАЗДЕЛ
        // ==================================================

        const section =
            detectSection(normalized);


        if (section) {

            stats.sections++;

            console.log(
                `[РАЗДЕЛ] ${rawName} → ${section}`
            );

            continue;

        }


        // ==================================================
        // ПОДГРУППА
        // ==================================================

        if (
            isSubGroup(normalized)
        ) {

            stats.subGroups++;

            console.log(
                `[ПОДГРУППА] ${rawName}`
            );

            continue;

        }


        // ==================================================
        // ПРОВЕРКА ТОВАРА
        // ==================================================

        if (
            !isRealProductRow(
                row,
                rawName
            )
        ) {

            stats.ignored++;

            console.log(
                `[ИГНОР] ${rawName}`
            );

            continue;

        }


        // ==================================================
        // КАТЕГОРИЯ
        // ==================================================

        const category =
            classifyProduct(rawName);


        // ==================================================
        // СОЗДАЁМ ТОВАР
        // ==================================================

        const product =
            createProduct(
                row,
                rawName,
                category,
                productId++
            );


        result.push(product);


        stats.realProducts++;


        if (
            !stats.categories[category]
        ) {

            stats.categories[category] =
                0;

        }


        stats.categories[category]++;


        console.log(
            `[ТОВАР] ${product.name} → ${category} | витрина=${product.display} | склад=${product.warehouse}`
        );

    }


    // ==================================================
    // ИТОГ
    // ==================================================

    console.log("");

    console.log(
        "=========================================="
    );

    console.log(
        "       АНАЛИЗ ВЫГРУЗКИ 1С"
    );

    console.log(
        "=========================================="
    );

    console.log(
        "Всего строк:",
        stats.totalRows
    );

    console.log(
        "Разделов:",
        stats.sections
    );

    console.log(
        "Подгрупп:",
        stats.subGroups
    );

    console.log(
        "Игнорировано:",
        stats.ignored
    );

    console.log(
        "Реальных товаров:",
        stats.realProducts
    );

    console.log(
        "Категории:",
        stats.categories
    );

    console.log(
        "=========================================="
    );


    return {

        products:
            result,

        stats

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


    prepared.category =
        prepared.category ||
        "Другое";


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
            display + warehouse

    };

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


    renderProduct(product);

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
// PRODUCT PAGE RENDER
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
                        number(
                            product.display
                        ) +
                        number(
                            product.warehouse
                        );


                    try {

                        localStorage.setItem(
                            PRODUCTS_STORAGE_KEY,
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
                    "Анализирую выгрузку 1С...";

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


                        console.log("");

                        console.log(
                            "=========================================="
                        );

                        console.log(
                            "ФАЙЛ 1С"
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
                            "=========================================="
                        );


                        console.log(
                            "Заголовок:",
                            rows[
                                IMPORT_CONFIG.headerRow
                            ]
                        );


                        console.log(
                            "Используемые колонки:",
                            {

                                номенклатура:
                                    IMPORT_CONFIG.nameColumn,

                                склад:
                                    IMPORT_CONFIG.warehouseColumn,

                                витрина:
                                    IMPORT_CONFIG.displayColumn

                            }
                        );


                        // ==================================================
                        // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА КОЛОНОК
                        // ==================================================

                        console.log(
                            "ПРОВЕРКА КОЛОНОК:"
                        );

                        console.log(
                            "E / Склад:",
                            rows[
                                IMPORT_CONFIG.headerRow
                            ][
                                IMPORT_CONFIG.warehouseColumn
                            ]
                        );

                        console.log(
                            "G / Витрина:",
                            rows[
                                IMPORT_CONFIG.headerRow
                            ][
                                IMPORT_CONFIG.displayColumn
                            ]
                        );


                        // ==================================================
                        // АНАЛИЗ
                        // ==================================================

                        const analysis =
                            analyze1CTable(
                                rows
                            );


                        const imported =
                            analysis.products;


                        // ==================================================
                        // ПРОВЕРКА
                        // ==================================================

                        if (
                            !Array.isArray(imported) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Анализатор не нашёл товары по названиям."
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
                            PRODUCTS_STORAGE_KEY,
                            JSON.stringify(
                                products
                            )
                        );


                        // ==================================================
                        // ОТОБРАЖАЕМ
                        // ==================================================

                        renderProducts(
                            products
                        );


                        // ==================================================
                        // СТАТИСТИКА
                        // ==================================================

                        console.log("");

                        console.log(
                            "=========================================="
                        );

                        console.log(
                            "ПРОВЕРКА ИМПОРТА"
                        );

                        console.log(
                            "=========================================="
                        );

                        console.log(
                            "Всего строк:",
                            rows.length
                        );

                        console.log(
                            "Разделов:",
                            analysis.stats.sections
                        );

                        console.log(
                            "Подгрупп:",
                            analysis.stats.subGroups
                        );

                        console.log(
                            "Игнорировано:",
                            analysis.stats.ignored
                        );

                        console.log(
                            "Реальных товаров:",
                            products.length
                        );

                        console.log(
                            "Категории:",
                            analysis.stats.categories
                        );

                        console.log(
                            "=========================================="
                        );


                        if (importStatus) {

                            importStatus.innerHTML =
                                `Готово. Загружено товаров: <strong>${products.length}</strong>`;

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
                PRODUCTS_STORAGE_KEY
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
            products.length
        );


        return true;

    } catch (error) {

        console.error(
            "Ошибка localStorage:",
            error
        );


        return false;

    }

}


// ======================================================
// DEBUG CATEGORY COUNTER
// ======================================================

function printCategoryStats() {

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


    console.log("");

    console.log(
        "========== КАТЕГОРИИ =========="
    );


    categories.forEach(
        category => {

            const count =
                products.filter(
                    product =>
                        product.category ===
                        category
                ).length;


            console.log(
                `${category}: ${count}`
            );

        }
    );


    console.log(
        "==============================="
    );

}


// ======================================================
// DEBUG STOCK
// ======================================================

function printStockStats() {

    console.log("");

    console.log(
        "========== ПРОВЕРКА ОСТАТКОВ =========="
    );


    let totalWarehouse = 0;
    let totalDisplay = 0;


    products.forEach(
        product => {

            totalWarehouse +=
                number(
                    product.warehouse
                );

            totalDisplay +=
                number(
                    product.display
                );

        }
    );


    console.log(
        "Всего на складе:",
        totalWarehouse
    );


    console.log(
        "Всего на витрине:",
        totalDisplay
    );


    console.log(
        "Всего:",
        totalWarehouse +
        totalDisplay
    );


    console.log(
        "======================================="
    );

}


// ======================================================
// INIT
// ======================================================

function initApp() {

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "ОШИБКА: products не найден."
        );

        return;

    }


    loadSavedProducts();


    normalizeProducts();


    console.log("");

    console.log(
        "=========================================="
    );

    console.log(
        "XIAOMI WEBBASE"
    );

    console.log(
        "Анализатор товаров по названию"
    );

    console.log(
        "Товаров:",
        products.length
    );

    console.log(
        "=========================================="
    );


    printCategoryStats();


    printStockStats();


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