// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ИМПОРТ ВЫГРУЗКИ 1С
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const productsList = document.getElementById("productsList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productDetails = document.getElementById("productDetails");

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
// ТВОЯ ТАБЛИЦА 1С:
//
// Номенклатура = колонка 0
// Витрина      = колонка 4
// Склад        = колонка 6
//
// Заголовок находится на строке 6.
// Индекс строки = 5.
//

const IMPORT_CONFIG = {

    headerRow: 5,

    nameColumn: 0,

    displayColumn: 4,

    warehouseColumn: 6

};


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

    let text = String(value)
        .trim()
        .replace(/\u00A0/g, "")
        .replace(/\s/g, "")
        .replace(",", ".");

    if (!text) {
        return 0;
    }

    text = text.replace(/[^\d.-]/g, "");

    const result = Number(text);

    return Number.isFinite(result)
        ? result
        : 0;

}


// ======================================================
// TEXT
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

    const text = normalizeText(value);

    if (!text) {
        return false;
    }

    return /^[-+]?\d+(?:[.,]\d+)?$/.test(text);

}


// ======================================================
// СЛУЖЕБНЫЕ / НЕТОВАРНЫЕ ГРУППЫ 1С
// ======================================================
//
// Эти названия в твоей выгрузке являются группами,
// а НЕ реальными товарами.
//
// Например:
//
// элементы питания
// автомобильный держатель
// внешние аккумуляторы
// аксессуары для пылесосов
// защитные стекла
// старые
// SIM карты
// сертификаты
// колонки
//
// Несмотря на наличие количества, их нельзя добавлять
// в products.
//

const GROUP_NAMES = [

    "элементы питания",
    "автомобильный держатель",
    "автомобильные держатели",

    "внешние аккумуляторы",
    "внешний аккумулятор",

    "аксессуары для пылесосов",

    "для планшетов",
    "защитные стекла",
    "защитные стекла",

    "старые",
    "старые чехлы",

    "карты лояльности и пакеты",

    "hitbuy",
    "аксессуары для hitbuy",

    "звук",
    "колонки",
    "колонка",

    "sim карты",
    "sim-карты",
    "sim",

    "сертификаты",

    "товары на ответственном хранении 002",

    "пластиковая карта (халва)",

    "пакет подарочный, бумажный"

];


// ======================================================
// ЯВНЫЕ РАЗДЕЛЫ 1С
// ======================================================

function detectSection(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return null;
    }


    const compact =
        text
            .replace(/^\d+\s*/, "")
            .trim();


    // --------------------------------------------------
    // Смартфоны
    // --------------------------------------------------

    if (
        /^смартфоны?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // Планшеты
    // --------------------------------------------------

    if (
        /^планшеты?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // Смарт-часы
    // --------------------------------------------------

    if (
        /^умные часы(?:\s+\d+)?$/.test(compact) ||
        /^смарт часы(?:\s+\d+)?$/.test(compact) ||
        /^смарт-часы(?:\s+\d+)?$/.test(compact)
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // Фитнес-браслеты
    // --------------------------------------------------

    if (
        /^фитнес браслеты?(?:\s+\d+)?$/.test(compact) ||
        /^фитнес-браслеты?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // Наушники
    // --------------------------------------------------

    if (
        /^наушники(?:\s+\d+)?$/.test(compact)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // Телевизоры
    // --------------------------------------------------

    if (
        /^телевизоры?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // Камеры
    // --------------------------------------------------

    if (
        /^камеры?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // Пылесосы
    // --------------------------------------------------

    if (
        /^пылесосы?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // Аксессуары
    // --------------------------------------------------

    if (
        /^аксессуары(?:\s+\d+)?$/.test(compact)
    ) {

        return "Аксессуары";

    }


    return null;

}


// ======================================================
// СЛУЖЕБНЫЕ СТРОКИ
// ======================================================

function isServiceRow(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return true;
    }


    const exact = [

        "итого",
        "всего",
        "номенклатура",
        "количество",
        "остаток",
        "остатки",
        "товары"

    ];


    if (
        exact.includes(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ЯВНАЯ ГРУППА 1С
// ======================================================

function isKnownGroup(name) {

    const text =
        normalizeText(name);

    return GROUP_NAMES.includes(text);

}


// ======================================================
// ПОДГРУППА
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

        /^стекло\s+для\s+/,

        /^защитные стекла\s+для\s+/,

        /^пленки\s+для\s+/,

        /^пленка\s+для\s+/,

        /^пленки\s+/,

        /^плёнки\s+/,

        /^плёнка\s+для\s+/,

        /^плёнки\s+для\s+/

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}


// ======================================================
// ACCESSORY
// ======================================================

function isAccessory(name) {

    const text =
        normalizeText(name);


    const accessoryWords = [

        // Чехлы
        "чехол",
        "чехлы",
        "case",

        // Стекла
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло для",
        "стекло защитное",
        "пленка для",
        "плёнка для",
        "glass",

        // Зарядки
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
        "адаптер-переходник",
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

        // Сумки
        "сумка для",
        "сумка",
        "чехол-сумка",

        // Питание
        "блок питания",
        "power adapter",
        "power supply",

        // Док-станции
        "док-станция",
        "док станция",
        "dock station",
        "dock",

        // Переходы / мелкие аксессуары
        "аксессуар",
        "аксессуары"

    ];


    return accessoryWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// ТИП ТОВАРА
// ======================================================

function detectProductType(name) {

    const text =
        normalizeText(name);


    // ==================================================
    // 1. Сначала аксессуары
    // ==================================================

    if (
        isAccessory(text)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // 2. Фитнес-браслеты
    // ==================================================

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        /\bmi band\b/.test(text) ||
        /\bxiaomi smart band\b/.test(text) ||
        /\bredmi band\b/.test(text) ||
        /\bsmart band\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // 3. Смарт-часы
    // ==================================================

    if (
        text.includes("умные часы") ||
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    if (
        /\bxiaomi watch\b/.test(text) ||
        /\bredmi watch\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // 4. Планшеты
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
    // 5. Смартфоны
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
        /\bredmi\s+(?:\d|a\d|c\d|k\d|turbo)/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bxiaomi\s+\d+/.test(text)
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // 6. Наушники
    // ==================================================

    if (
        text.includes("наушник") ||
        text.includes("earbuds") ||
        text.includes("headphones") ||
        text.includes("headset")
    ) {

        return "Наушники";

    }


    // ==================================================
    // 7. Внешние аккумуляторы
    // ==================================================
    //
    // Не Наушники.
    // Не отдельная категория.
    // В текущей базе относятся к Аксессуарам.
    //

    if (
        text.includes("внешний аккумулятор") ||
        text.includes("power bank") ||
        text.includes("powerbank")
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // 8. Телевизоры
    // ==================================================

    if (
        text.includes("телевизор")
    ) {

        return "Телевизоры";

    }


    if (
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // 9. Камеры
    // ==================================================

    if (
        text.includes("камера") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // ==================================================
    // 10. Пылесосы
    // ==================================================

    if (
        text.includes("пылесос")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// НЕТОВАРНЫЕ ПОЗИЦИИ
// ======================================================

function isNonProductByName(name) {

    const text =
        normalizeText(name);


    if (
        isServiceRow(text)
    ) {

        return true;

    }


    if (
        isKnownGroup(text)
    ) {

        return true;

    }


    // SIM-карты
    if (
        /\bsim\b/.test(text) &&
        (
            text.includes("карта") ||
            text.includes("book") ||
            text.includes("интернет")
        )
    ) {

        return true;

    }


    // Сертификаты
    if (
        text.includes("сертификат")
    ) {

        return true;

    }


    // Пластиковые карты
    if (
        text.includes("пластиковая карта")
    ) {

        return true;

    }


    // Подарочные пакеты
    if (
        text.includes("пакет подарочный")
    ) {

        return true;

    }


    // Ответственное хранение
    if (
        text.includes("ответственном хранении")
    ) {

        return true;

    }


    return false;

}


// ======================================================
// CLASSIFY PRODUCT
// ======================================================

function classifyProduct(
    name,
    section
) {

    const cleaned =
        cleanProductName(name);


    // --------------------------------------------------
    // Явные группы НЕ являются товарами.
    // --------------------------------------------------

    if (
        isNonProductByName(cleaned)
    ) {

        return null;

    }


    // --------------------------------------------------
    // Сначала определяем реальный тип
    // по названию.
    // --------------------------------------------------

    const detected =
        detectProductType(cleaned);


    if (detected) {

        return detected;

    }


    // --------------------------------------------------
    // Если название не определило тип,
    // используем раздел 1С.
    // --------------------------------------------------

    if (section) {

        return section;

    }


    return "Другое";

}


// ======================================================
// IS REAL PRODUCT
// ======================================================

function isRealProductRow(
    row,
    name
) {

    if (
        !Array.isArray(row)
    ) {

        return false;

    }


    const text =
        normalizeText(name);


    if (!text) {

        return false;

    }


    // --------------------------------------------------
    // Служебные строки
    // --------------------------------------------------

    if (
        isServiceRow(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Известные группы
    // --------------------------------------------------

    if (
        isKnownGroup(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Подгруппы
    // --------------------------------------------------

    if (
        isSubGroup(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Только число
    // --------------------------------------------------

    if (
        looksLikeNumber(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Прочие известные не-товары
    // --------------------------------------------------

    if (
        isNonProductByName(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Если название само определяет товар
    // — принимаем.
    // --------------------------------------------------

    if (
        detectProductType(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Если текущий раздел существует,
    // строка может быть товаром этого раздела.
    //
    // Но короткие названия групп дополнительно
    // отсеиваем.
    // --------------------------------------------------

    if (text.length < 4) {

        return false;

    }


    return true;

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

    const display =
        Math.max(
            0,
            number(
                row[IMPORT_CONFIG.displayColumn]
            )
        );


    const warehouse =
        Math.max(
            0,
            number(
                row[IMPORT_CONFIG.warehouseColumn]
            )
        );


    return {

        id,

        name:
            cleanProductName(name),

        category:
            category || "Другое",

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


    let currentSection = null;

    let productId = 1;


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
                row[IMPORT_CONFIG.nameColumn] ?? ""
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

            currentSection =
                section;

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
        // ИЗВЕСТНАЯ ГРУППА
        // ==================================================

        if (
            isKnownGroup(normalized)
        ) {

            stats.ignored++;

            console.log(
                `[ГРУППА] ${rawName} → пропуск`
            );

            continue;

        }


        // ==================================================
        // РЕАЛЬНЫЙ ТОВАР?
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
            classifyProduct(
                rawName,
                currentSection
            );


        if (!category) {

            stats.ignored++;

            console.log(
                `[ИГНОР] ${rawName}`
            );

            continue;

        }


        // ==================================================
        // ТОВАР
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

            stats.categories[category] = 0;

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
// QUANTITY
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

                                витрина:
                                    IMPORT_CONFIG.displayColumn,

                                склад:
                                    IMPORT_CONFIG.warehouseColumn
                            }
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
                                "Анализатор не нашёл реальные товары."
                            );

                        }


                        // ==================================================
                        // ЗАМЕНА БАЗЫ
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


                        printCategoryStats();


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
// CATEGORY STATS
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
        "Анализатор выгрузки 1С"
    );

    console.log(
        "Товаров:",
        products.length
    );

    console.log(
        "=========================================="
    );


    printCategoryStats();


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