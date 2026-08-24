// ======================================================
// XIAOMI WEBBASE
// APP.JS
// АНАЛИЗАТОР ВЫГРУЗКИ 1С
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
// НАСТРОЙКИ ИМПОРТА 1С
// ======================================================
//
// Реальная таблица:
//
// Номенклатура = колонка 0
// Витрина      = колонка 4
// Склад        = колонка 6
//
// Заголовок находится на 6-й строке.
// Индекс заголовка = 5.
// Товары начинаются с индекса 6.
// ======================================================

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


    if (
        typeof value === "number"
    ) {

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
        text.replace(
            /[^\d.-]/g,
            ""
        );


    const result =
        Number(text);


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
// HTML ESCAPE
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


    return /^[-+]?\d+(?:[.,]\d+)?$/.test(
        text
    );

}


// ======================================================
// ACCESSORIES
// ======================================================
//
// Аксессуар определяется ПО НАЗВАНИЮ.
//
// Это выполняется ДО определения смартфона,
// планшета, часов и т.д.
//
// Поэтому:
//
// "Чехол для Redmi Note 15"
// -> Аксессуары
//
// "Стекло для Redmi Pad 2"
// -> Аксессуары
//
// "Ремешок Redmi Watch"
// -> Аксессуары
//
// "Power Bank Xiaomi"
// -> Аксессуары
// ======================================================

function isAccessory(name) {

    const text =
        normalizeText(name);


    const accessoryWords = [

        // ------------------------------------------
        // ЧЕХЛЫ
        // ------------------------------------------

        "чехол",
        "чехлы",
        "case",
        "cases",


        // ------------------------------------------
        // СТЕКЛА / ПЛЕНКИ
        // ------------------------------------------

        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло для",
        "пленка для",
        "плёнка для",
        "защитное покрытие",
        "tempered glass",
        "protective glass",
        "glass protector",


        // ------------------------------------------
        // ЗАРЯДКИ
        // ------------------------------------------

        "зарядное устройство",
        "зарядное",
        "зарядка",
        "зарядный",
        "зарядная",
        "charger",
        "charging",


        // ------------------------------------------
        // КАБЕЛИ
        // ------------------------------------------

        "кабель",
        "кабели",
        "cable",
        "кабель usb",
        "usb кабель",
        "type-c кабель",
        "lightning кабель",


        // ------------------------------------------
        // РЕМЕШКИ
        // ------------------------------------------

        "ремешок",
        "ремешки",
        "strap",
        "watch strap",


        // ------------------------------------------
        // ПЕРЕХОДНИКИ
        // ------------------------------------------

        "переходник",
        "переходники",
        "адаптер",
        "адаптеры",
        "adapter",
        "converter",


        // ------------------------------------------
        // ДЕРЖАТЕЛИ
        // ------------------------------------------

        "держатель",
        "держатели",
        "holder",
        "автомобильный держатель",
        "автовизитка",


        // ------------------------------------------
        // СТИЛУСЫ
        // ------------------------------------------

        "стилус",
        "стилусы",
        "stylus",


        // ------------------------------------------
        // КЛАВИАТУРЫ
        // ------------------------------------------

        "клавиатура",
        "клавиатуры",
        "keyboard",


        // ------------------------------------------
        // НАУШНИКИ
        // ------------------------------------------

        "наушник",
        "наушники",
        "earbuds",
        "headphones",
        "headset",
        "гарнитура",


        // ------------------------------------------
        // СУМКИ
        // ------------------------------------------

        "сумка",
        "сумки",
        "сумка для",
        "чехол-сумка",
        "рюкзак",


        // ------------------------------------------
        // БЛОКИ ПИТАНИЯ
        // ------------------------------------------

        "блок питания",
        "power adapter",
        "power supply",


        // ------------------------------------------
        // ДОК-СТАНЦИИ
        // ------------------------------------------

        "док-станция",
        "док станция",
        "dock station",
        "dock",


        // ------------------------------------------
        // POWER BANK
        // ------------------------------------------

        "внешний аккумулятор",
        "внешние аккумуляторы",
        "power bank",
        "powerbank",
        "портативный аккумулятор",


        // ------------------------------------------
        // БАТАРЕЙКИ
        // ------------------------------------------

        "батарейка",
        "батарейки",
        "элемент питания",
        "элементы питания",
        "аккумуляторная батарея",


        // ------------------------------------------
        // КОЛОНКИ
        // ------------------------------------------

        "колонка",
        "колонки",
        "акустика",
        "bluetooth speaker",
        "speaker",


        // ------------------------------------------
        // SIM
        // ------------------------------------------

        "sim карта",
        "sim карты",
        "sim-карта",
        "sim-карты",
        "sim в book",
        "сим карта",
        "сим карты",


        // ------------------------------------------
        // СЕРТИФИКАТЫ
        // ------------------------------------------

        "сертификат",
        "сертификаты",
        "подарочный сертификат",


        // ------------------------------------------
        // ПАКЕТЫ
        // ------------------------------------------

        "пакет подарочный",
        "подарочный пакет",
        "пакеты",
        "пакет",


        // ------------------------------------------
        // КАРТЫ
        // ------------------------------------------

        "карта лояльности",
        "карты лояльности",
        "пластиковая карта",
        "халва",


        // ------------------------------------------
        // АКСЕССУАРЫ ДЛЯ ПЫЛЕСОСОВ
        // ------------------------------------------

        "аксессуары для пылесосов",
        "тряпка сменная",
        "микрофибра",
        "щетка основная",
        "щетки боковые",
        "щетка боковая",
        "боковая щетка",
        "основная щетка",
        "фильтр для пылесоса",
        "мешок для пылесоса",


        // ------------------------------------------
        // ОБЩИЕ АКСЕССУАРЫ
        // ------------------------------------------

        "аксессуар",
        "аксессуары"

    ];


    return accessoryWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// SECTION DETECTION
// ======================================================
//
// Определяем именно раздел 1С.
//
// ВАЖНО:
//
// "Смартфон Xiaomi Redmi Note 15"
// НЕ раздел.
//
// "17 Смартфоны 71"
// раздел.
//
// "Планшеты"
// раздел.
//
// "10 наушники"
// раздел.
// ======================================================

function detectSection(name) {

    const original =
        normalizeText(name);


    if (!original) {

        return null;

    }


    const compact =
        original
            .replace(/^\d+\s*/, "")
            .trim();


    // ==================================================
    // СМАРТФОНЫ
    // ==================================================

    if (
        /^смартфоны?(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // ПЛАНШЕТЫ
    // ==================================================

    if (
        /^планшеты?(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Планшеты";

    }


    // ==================================================
    // СМАРТ-ЧАСЫ
    // ==================================================

    if (
        /^(?:умные часы|смарт часы|смарт-часы)(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

    if (
        /^(?:фитнес браслеты|фитнес-браслеты|фитнес браслет|фитнес-браслет)(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // НАУШНИКИ
    // ==================================================

    if (
        /^наушники(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Наушники";

    }


    // ==================================================
    // ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        /^телевизоры?(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // КАМЕРЫ
    // ==================================================

    if (
        /^камеры?(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Камеры";

    }


    // ==================================================
    // ПЫЛЕСОСЫ
    // ==================================================

    if (
        /^пылесосы?(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Пылесосы";

    }


    // ==================================================
    // АКСЕССУАРЫ
    // ==================================================

    if (
        /^аксессуары?(?:\s+\d+)?$/.test(
            compact
        )
    ) {

        return "Аксессуары";

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


    if (
        detectSection(text)
    ) {

        return true;

    }


    return false;

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
// PRODUCT TYPE
// ======================================================
//
// Здесь определяется ТОВАР по названию.
//
// Приоритет:
//
// 1. Аксессуар
// 2. Браслет
// 3. Часы
// 4. Планшет
// 5. Смартфон
// 6. Телевизор
// 7. Камера
// 8. Пылесос
// ======================================================

function detectProductType(name) {

    const text =
        normalizeText(name);


    // ==================================================
    // АКСЕССУАРЫ
    // ==================================================

    if (
        isAccessory(text)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // ФИТНЕС-БРАСЛЕТЫ
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
        /\bxiaomi smart band\b/.test(text) ||
        /\bredmi band\b/.test(text) ||
        /\bsmart band\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // СМАРТ-ЧАСЫ
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


    if (
        /\bwatch\s+(?:s|2|3|4|5|6|7|8|9|10|11|12)\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // ПЛАНШЕТЫ
    // ==================================================

    if (
        text.includes("планшет") ||
        text.includes("планшеты")
    ) {

        return "Планшеты";

    }


    if (
        /\bxiaomi pad\b/.test(text) ||
        /\bredmi pad\b/.test(text)
    ) {

        return "Планшеты";

    }


    if (
        /\bpad\s+\d/.test(text) ||
        /\bpad\s+pro\b/.test(text) ||
        /\bpad\s+se\b/.test(text)
    ) {

        return "Планшеты";

    }


    if (
        /\bpoco pad\b/.test(text)
    ) {

        return "Планшеты";

    }


    // ==================================================
    // СМАРТФОНЫ
    // ==================================================

    if (
        text.includes("смартфон") ||
        text.includes("смартфоны")
    ) {

        return "Смартфоны";

    }


    // Redmi Note
    if (
        /\bredmi note\b/.test(text)
    ) {

        return "Смартфоны";

    }


    // Redmi модели
    if (
        /\bredmi\s+(?:\d|a\d|c\d|k\d|turbo|13|14|15)/.test(text)
    ) {

        return "Смартфоны";

    }


    // Xiaomi модели
    if (
        /\bxiaomi\s+\d+/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bxiaomi\s+\d+\s+(?:pro|max|ultra|lite|t)\b/.test(text)
    ) {

        return "Смартфоны";

    }


    // POCO смартфоны
    if (
        /\bpoco\s+(?:f|x|m|c)\d+/i.test(text)
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        text.includes("телевизор") ||
        text.includes("телевизоры")
    ) {

        return "Телевизоры";

    }


    if (
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // КАМЕРЫ
    // ==================================================

    if (
        text.includes("камера") ||
        text.includes("камеры") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // ==================================================
    // ПЫЛЕСОСЫ
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
        /robot vacuum/.test(text)
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// SECTION → CATEGORY
// ======================================================

function sectionToCategory(section) {

    if (!section) {

        return null;

    }


    return section;

}


// ======================================================
// CLASSIFY PRODUCT
// ======================================================
//
// Ключевой момент:
//
// НАЗВАНИЕ имеет приоритет над разделом 1С.
//
// Раздел 1С используется только тогда,
// когда название само по себе не определилось.
//
// ======================================================

function classifyProduct(
    name,
    section
) {

    const cleaned =
        cleanProductName(name);


    // ==================================================
    // 1. АКСЕССУАР
    // ==================================================

    if (
        isAccessory(cleaned)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // 2. ТИП ПО НАЗВАНИЮ
    // ==================================================

    const detected =
        detectProductType(cleaned);


    if (detected) {

        return detected;

    }


    // ==================================================
    // 3. FALLBACK ПО РАЗДЕЛУ
    // ==================================================
    //
    // Только если название не дало результата.
    //
    // Например:
    //
    // раздел 1С = Смартфоны
    // товар = "Новый телефон"
    //
    // Тогда можно использовать раздел.
    //
    // Но для служебных/сомнительных названий
    // ниже есть дополнительные исключения.
    // ==================================================

    if (section) {

        const text =
            normalizeText(cleaned);


        // ------------------------------------------------
        // Эти названия НЕЛЬЗЯ автоматически считать
        // товаром категории раздела.
        // ------------------------------------------------

        if (
            text === "внешние аккумуляторы" ||
            text === "внешний аккумулятор" ||
            text === "элементы питания" ||
            text === "элемент питания" ||
            text === "автомобильный держатель" ||
            text === "защитные стекла" ||
            text === "защитные пленки" ||
            text === "защитные пленки" ||
            text === "старые" ||
            text === "старое" ||
            text === "карты лояльности и пакеты" ||
            text === "sim карты" ||
            text === "сертификаты" ||
            text === "товары на ответственном хранении 002" ||
            text === "звук" ||
            text === "колонки"
        ) {

            return "Аксессуары";

        }


        return sectionToCategory(
            section
        );

    }


    // ==================================================
    // 4. ДРУГОЕ
    // ==================================================

    return "Другое";

}


// ======================================================
// REAL PRODUCT ROW
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


    // Служебная строка
    if (
        isServiceRow(text)
    ) {

        return false;

    }


    // Подгруппа
    if (
        isSubGroup(text)
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
    // ОСТАТКИ
    // ==================================================

    const display =
        number(
            row[
                IMPORT_CONFIG.displayColumn
            ]
        );


    const warehouse =
        number(
            row[
                IMPORT_CONFIG.warehouseColumn
            ]
        );


    // Есть остаток
    if (
        display !== 0 ||
        warehouse !== 0
    ) {

        return true;

    }


    // ==================================================
    // ТОВАР С НУЛЕВЫМ ОСТАТКОМ
    // ==================================================

    const productType =
        detectProductType(text);


    if (productType) {

        return true;

    }


    // ==================================================
    // НОРМАЛЬНОЕ НАЗВАНИЕ
    // ==================================================

    if (
        text.length >= 4
    ) {

        return true;

    }


    return false;

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
                row[
                    IMPORT_CONFIG.displayColumn
                ]
            )
        );


    const warehouse =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG.warehouseColumn
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
// MAIN 1C ANALYZER
// ======================================================

function analyze1CTable(rows) {

    const result = [];


    const stats = {

        totalRows:
            Array.isArray(rows)
                ? rows.length
                : 0,

        sections:
            0,

        subGroups:
            0,

        ignored:
            0,

        realProducts:
            0,

        categories:
            {}

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


    // ==================================================
    // ТЕКУЩИЙ РАЗДЕЛ
    // ==================================================

    let currentSection =
        null;


    let productId =
        1;


    // ==================================================
    // СТАРТ ПОСЛЕ ЗАГОЛОВКА
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
            detectSection(
                normalized
            );


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
        // РЕАЛЬНЫЙ ТОВАР
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


        result.push(
            product
        );


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
        prepared.memory ||
        "";


    prepared.color =
        prepared.color ||
        "";


    prepared.description =
        prepared.description ||
        "";


    prepared.tip =
        prepared.tip ||
        "";


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
        (
            product,
            index
        ) => {

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


    productsList.innerHTML =
        "";


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
                getStock(
                    product
                );


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

                    searchInput.value =
                        "";

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
// PRODUCT PAGE RENDER
// ======================================================

function renderProduct(product) {

    if (!productDetails) {

        return;

    }


    const stock =
        getStock(
            product
        );


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

                    ${renderSpecs(
                        product
                    )}

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

function setupQuantityButtons(
    product
) {

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


                        // ==================================================
                        // ИНФОРМАЦИЯ О ФАЙЛЕ
                        // ==================================================

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
                        // ЗАМЕНЯЕМ БАЗУ
                        // ==================================================

                        products.length =
                            0;


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


                        // ==================================================
                        // ПЕЧАТЬ КАТЕГОРИЙ
                        // ==================================================

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


        products.length =
            0;


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
// CATEGORY COUNTER
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
// DETAILED CATEGORY DEBUG
// ======================================================
//
// Показывает товары из "Другое".
// Это понадобится, если после импорта
// там ещё что-то останется.
// ======================================================

function printOtherProducts() {

    const other =
        products.filter(
            product =>
                product.category ===
                "Другое"
        );


    console.log("");

    console.log(
        "========== ДРУГОЕ =========="
    );


    if (
        other.length === 0
    ) {

        console.log(
            "Товаров в категории Другое нет."
        );

    } else {

        other.forEach(
            product => {

                console.log(
                    `[ДРУГОЕ] ${product.name} | витрина=${product.display} | склад=${product.warehouse}`
                );

            }
        );

    }


    console.log(
        "============================"
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
        "Новый анализатор данных"
    );

    console.log(
        "Товаров:",
        products.length
    );

    console.log(
        "=========================================="
    );


    printCategoryStats();


    printOtherProducts();


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