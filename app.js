// ======================================================
// XIAOMI WEBBASE
// APP.JS
// СТРОГИЙ АНАЛИЗАТОР ВЫГРУЗКИ 1С
// ======================================================


// ======================================================
// VERSION
// ======================================================

const APP_DATA_VERSION = "2026-08-27-v4";

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";

const PRODUCTS_VERSION_KEY =
    "xiaomiWebBaseProductsVersion";


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
// НАСТРОЙКИ 1С
// ======================================================
//
// ВАЖНО:
//
// A = Номенклатура
// E = Склад ТЦ Европолис
// G = Склад ТЦ Европолис ОВ
// H = Итого
//
// Индексы JavaScript:
//
// A = 0
// E = 4
// G = 6
// H = 7
//
// В НАШЕЙ БАЗЕ:
//
// E = СКЛАД
// G = ВИТРИНА
//
// ======================================================

const IMPORT_CONFIG = {

    headerRow: 5,

    nameColumn: 0,

    warehouseColumn: 4,

    displayColumn: 6,

    totalColumn: 7

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
        text.replace(/[^\d.-]/g, "");

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
// ACCESSORIES
// ======================================================
//
// Проверяем аксессуары ПЕРВЫМИ.
//
// Например:
//
// Чехол для Redmi Note 15
// → Аксессуары
//
// Защитное стекло Xiaomi 17
// → Аксессуары
//
// Даже если внутри есть Xiaomi / Redmi / Pad,
// это всё равно аксессуар.
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

        // Стекла
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "защитное покрытие",
        "стекло для",
        "пленка для",
        "плёнка для",
        "tempered glass",

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
        "сумка",
        "сумка для",

        // Блоки питания
        "блок питания",
        "power adapter",
        "power supply",

        // Док-станции
        "док-станция",
        "док станция",
        "dock station",
        "dock",

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
// СЛУЖЕБНЫЕ СЛОВА
// ======================================================

function isObviouslyServiceName(name) {

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
        "товары",
        "старые",
        "звук",
        "колонки",
        "сертификаты",
        "sim карты",
        "sim-карты",
        "сим карты",
        "сим-карты",
        "карты лояльности",
        "карты лояльности и пакеты",
        "подарочные сертификаты",
        "пакет подарочный",
        "пакеты",
        "товары на ответственном хранении"

    ];


    if (
        exact.includes(text)
    ) {
        return true;
    }


    // --------------------------------------------------
    // Отдельные служебные конструкции
    // --------------------------------------------------

    const servicePatterns = [

        /^карты лояльности/,
        /^sim\b/,
        /^сим\b/,
        /^подарочный сертификат/,
        /^сертификат/,
        /^пакет подарочный/,
        /^товары на ответственном/,
        /^ответственное хранение/,
        /^старые$/,
        /^звук$/,
        /^колонки$/

    ];


    if (
        servicePatterns.some(
            pattern =>
                pattern.test(text)
        )
    ) {

        return true;

    }


    return false;

}


// ======================================================
// SECTION
// ======================================================
//
// Разделы 1С.
//
// Они НИКОГДА не становятся товарами.
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


    // --------------------------------------------------
    // Смартфоны
    // --------------------------------------------------

    if (
        /^смартфоны?$/.test(text)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // Планшеты
    // --------------------------------------------------

    if (
        /^планшеты?$/.test(text)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // Часы
    // --------------------------------------------------

    if (
        /^умные часы$/.test(text) ||
        /^смарт часы$/.test(text) ||
        /^смарт-часы$/.test(text)
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // Браслеты
    // --------------------------------------------------

    if (
        /^фитнес браслеты?$/.test(text) ||
        /^фитнес-браслеты?$/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // Наушники
    // --------------------------------------------------

    if (
        /^наушники$/.test(text)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // Телевизоры
    // --------------------------------------------------

    if (
        /^телевизоры?$/.test(text)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // Камеры
    // --------------------------------------------------

    if (
        /^камеры?$/.test(text)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // Пылесосы
    // --------------------------------------------------

    if (
        /^пылесосы?$/.test(text)
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // Аксессуары
    // --------------------------------------------------

    if (
        /^аксессуары$/.test(text)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // Конструкции 1С
    //
    // Например:
    //
    // 01 Смартфоны 71
    // 17 Планшеты 32
    //
    // --------------------------------------------------

    const sectionWithNumbers =
        text.match(
            /^\d+\s+(.+?)\s+\d+$/
        );


    if (
        sectionWithNumbers
    ) {

        const middle =
            sectionWithNumbers[1]
                .trim();


        const detected =
            detectSection(
                middle
            );


        if (detected) {
            return detected;
        }

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

        /^стекло\s+для\s+/,

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
// ГЛАВНАЯ ЛОГИКА.
//
// Здесь мы НЕ смотрим на остаток.
//
// Смотрим именно на НАЗВАНИЕ.
//
// ======================================================

function detectProductType(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // ==================================================
    // АКСЕССУАР
    // ==================================================

    if (
        isAccessory(text)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // СМАРТФОН
    // ==================================================
    //
    // Примеры:
    //
    // Смартфон Xiaomi 17T 12GB+256GB Black
    // Смартфон REDMI Note 15 Pro ...
    //
    // ==================================================

    if (
        /\bсмартфон\b/.test(text)
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // ПЛАНШЕТ
    // ==================================================
    //
    // Примеры:
    //
    // Планшет REDMI Pad 2
    // Планшет Xiaomi Pad 8
    //
    // ==================================================

    if (
        /\bпланшет\b/.test(text)
    ) {

        return "Планшеты";

    }


    // ==================================================
    // ФИТНЕС-БРАСЛЕТ
    // ==================================================

    if (
        /\bфитнес[- ]браслет\b/.test(text) ||
        /\bфитнес[- ]браслеты\b/.test(text)
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
        /\bумные часы\b/.test(text) ||
        /\bсмарт часы\b/.test(text) ||
        /\bсмарт-часы\b/.test(text) ||
        /\bsmart watch\b/.test(text) ||
        /\bsmartwatch\b/.test(text)
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
    // НАУШНИКИ
    // ==================================================

    if (
        /\bнаушник\b/.test(text) ||
        /\bнаушники\b/.test(text) ||
        /\bearbuds\b/.test(text) ||
        /\bheadphones\b/.test(text) ||
        /\bheadset\b/.test(text)
    ) {

        return "Наушники";

    }


    // Xiaomi / Redmi Buds

    if (
        /\bredmi buds\b/.test(text) ||
        /\bxiaomi buds\b/.test(text)
    ) {

        return "Наушники";

    }


    // ==================================================
    // ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        /\bтелевизор\b/.test(text) ||
        /\bтелевизоры\b/.test(text)
    ) {

        return "Телевизоры";

    }


    if (
        /\bmi tv\b/.test(text) ||
        /\bxiaomi tv\b/.test(text) ||
        /\bredmi tv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // КАМЕРЫ
    // ==================================================

    if (
        /\bкамера\b/.test(text) ||
        /\bкамеры\b/.test(text) ||
        /\bcamera\b/.test(text)
    ) {

        return "Камеры";

    }


    // ==================================================
    // ПЫЛЕСОСЫ
    // ==================================================

    if (
        /\bпылесос\b/.test(text) ||
        /\bпылесосы\b/.test(text) ||
        /\bробот[- ]пылесос\b/.test(text)
    ) {

        return "Пылесосы";

    }


    if (
        /\brobot vacuum\b/.test(text) ||
        /\bvacuum\b/.test(text)
    ) {

        return "Пылесосы";

    }


    // ==================================================
    // МОДЕЛИ СМАРТФОНОВ
    // ==================================================
    //
    // Используем только если в названии НЕТ слова
    // "смартфон".
    //
    // ==================================================

    if (
        /\bredmi\s+note\b/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bredmi\s+(?:\d+|a\d+|c\d+|k\d+|turbo)\b/.test(text)
    ) {

        return "Смартфоны";

    }


    // Xiaomi 17
    // Xiaomi 17 Pro
    // Xiaomi 17 Ultra
    // Xiaomi 17T

    if (
        /\bxiaomi\s+\d{1,3}(?:\s|$)/.test(text)
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // МОДЕЛИ ПЛАНШЕТОВ
    // ==================================================

    if (
        /\bredmi\s+pad\b/.test(text) ||
        /\bxiaomi\s+pad\b/.test(text)
    ) {

        return "Планшеты";

    }


    if (
        /\bpad\s+\d+\b/.test(text) ||
        /\bpad\s+pro\b/.test(text) ||
        /\bpad\s+se\b/.test(text)
    ) {

        return "Планшеты";

    }


    return null;

}


// ======================================================
// CLASSIFY PRODUCT
// ======================================================

function classifyProduct(name, section) {

    const cleaned =
        cleanProductName(name);


    // --------------------------------------------------
    // Сначала аксессуар
    // --------------------------------------------------

    if (
        isAccessory(cleaned)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // Потом название
    // --------------------------------------------------

    const detected =
        detectProductType(cleaned);


    if (detected) {

        return detected;

    }


    // --------------------------------------------------
    // ВАЖНО:
    //
    // Если название не распознано,
    // НЕ превращаем его автоматически в товар.
    //
    // Раздел 1С используем только если название
    // явно похоже на конкретную модель.
    //
    // --------------------------------------------------

    if (section) {

        const text =
            normalizeText(cleaned);


        // Внутри раздела допускаем известные
        // модельные слова.

        if (
            section === "Смартфоны" &&
            (
                /\bredmi\b/.test(text) ||
                /\bxiaomi\b/.test(text)
            )
        ) {

            return section;

        }


        if (
            section === "Планшеты" &&
            (
                /\bpad\b/.test(text) ||
                /\bredmi\b/.test(text) ||
                /\bxiaomi\b/.test(text)
            )
        ) {

            return section;

        }


        if (
            section === "Смарт-часы" &&
            (
                /\bwatch\b/.test(text) ||
                /\bxiaomi\b/.test(text) ||
                /\bredmi\b/.test(text)
            )
        ) {

            return section;

        }


        if (
            section === "Фитнес-браслеты" &&
            (
                /\bband\b/.test(text) ||
                /\bmi band\b/.test(text) ||
                /\bxiaomi\b/.test(text)
            )
        ) {

            return section;

        }


        if (
            section === "Наушники" &&
            (
                /\bbuds\b/.test(text) ||
                /\bearbuds\b/.test(text) ||
                /\bredmi\b/.test(text) ||
                /\bxiaomi\b/.test(text)
            )
        ) {

            return section;

        }

    }


    return null;

}


// ======================================================
// REAL PRODUCT ROW
// ======================================================
//
// Здесь теперь самое главное.
//
// НЕТ:
//
// "строка длиннее 4 символов = товар"
//
// Только реальное распознавание.
//
// ======================================================

function isRealProductRow(
    row,
    name,
    currentSection
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
        isObviouslyServiceName(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Разделы
    // --------------------------------------------------

    if (
        detectSection(text)
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
    // Чистое число
    // --------------------------------------------------

    if (
        looksLikeNumber(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Пытаемся определить товар
    // --------------------------------------------------

    const type =
        detectProductType(text);


    if (type) {

        return true;

    }


    // --------------------------------------------------
    // Аксессуар
    // --------------------------------------------------

    if (
        isAccessory(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Если тип не определён,
    // используем строгий fallback
    // --------------------------------------------------

    const category =
        classifyProduct(
            text,
            currentSection
        );


    if (category) {

        return true;

    }


    // --------------------------------------------------
    // НИКАКОГО:
    //
    // text.length >= 4
    //
    // --------------------------------------------------

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

    // E = СКЛАД
    const warehouse =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG.warehouseColumn
                ]
            )
        );


    // G = ВИТРИНА
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
// ANALYZE 1C
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


    let currentSection =
        null;

    let productId =
        1;


    const startRow =
        IMPORT_CONFIG.headerRow + 1;


    // ==================================================
    // ОБХОД СТРОК
    // ==================================================

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
        // ТОВАР?
        // ==================================================

        if (
            !isRealProductRow(
                row,
                rawName,
                currentSection
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
                `[ИГНОР] ${rawName} → тип не определён`
            );

            continue;

        }


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
            `[ТОВАР] ${product.name} → ${category} | склад=${product.warehouse} | витрина=${product.display}`
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
                                    "A / индекс 0",

                                склад:
                                    "E / индекс 4",

                                витрина:
                                    "G / индекс 6",

                                итого:
                                    "H / индекс 7"

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
                                "Строгий анализатор не нашёл реальные товары."
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
                            PRODUCTS_STORAGE_KEY,
                            JSON.stringify(
                                products
                            )
                        );


                        localStorage.setItem(
                            PRODUCTS_VERSION_KEY,
                            APP_DATA_VERSION
                        );


                        // ==================================================
                        // ОТОБРАЖЕНИЕ
                        // ==================================================

                        renderProducts(
                            products
                        );


                        // ==================================================
                        // ПРОВЕРКА
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
                        // ОТДЕЛЬНО ПРОВЕРЯЕМ СКЛАД И ВИТРИНУ
                        // ==================================================

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
                            "Общее количество на складе:",
                            totalWarehouse
                        );


                        console.log(
                            "Общее количество на витрине:",
                            totalDisplay
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
// STOCK STATS
// ======================================================

function printStockStats() {

    let warehouse = 0;

    let display = 0;

    let total = 0;


    products.forEach(
        product => {

            warehouse +=
                number(
                    product.warehouse
                );

            display +=
                number(
                    product.display
                );

        }
    );


    total =
        warehouse +
        display;


    console.log("");

    console.log(
        "========== ОСТАТКИ =========="
    );

    console.log(
        "Склад:",
        warehouse
    );

    console.log(
        "Витрина:",
        display
    );

    console.log(
        "Всего:",
        total
    );

    console.log(
        "============================="
    );

}


// ======================================================
// RESET OLD DATABASE
// ======================================================
//
// При первом запуске этой версии удаляем старую
// базу 381 товара.
//
// После нового импорта данные сохраняются нормально.
//
// ======================================================

function checkDataVersion() {

    try {

        const savedVersion =
            localStorage.getItem(
                PRODUCTS_VERSION_KEY
            );


        if (
            savedVersion !==
            APP_DATA_VERSION
        ) {

            console.log(
                "Обновление анализатора 1С."
            );


            console.log(
                "Старая база будет очищена."
            );


            localStorage.removeItem(
                PRODUCTS_STORAGE_KEY
            );


            localStorage.setItem(
                PRODUCTS_VERSION_KEY,
                APP_DATA_VERSION
            );


            if (
                Array.isArray(products)
            ) {

                products.length = 0;

            }

        }

    } catch (error) {

        console.error(
            "Ошибка проверки версии:",
            error
        );

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
            "ОШИБКА: products не найден."
        );

        return;

    }


    // --------------------------------------------------
    // Сначала проверяем версию
    // --------------------------------------------------

    checkDataVersion();


    // --------------------------------------------------
    // Загружаем сохранённые товары
    // --------------------------------------------------

    loadSavedProducts();


    normalizeProducts();


    // ==================================================
    // HEADER
    // ==================================================

    console.log("");

    console.log(
        "=========================================="
    );

    console.log(
        "XIAOMI WEBBASE"
    );

    console.log(
        "СТРОГИЙ АНАЛИЗАТОР 1С"
    );

    console.log(
        "Версия:",
        APP_DATA_VERSION
    );

    console.log(
        "Товаров:",
        products.length
    );

    console.log(
        "=========================================="
    );


    // ==================================================
    // СТАТИСТИКА
    // ==================================================

    printCategoryStats();

    printStockStats();


    // ==================================================
    // RENDER
    // ==================================================

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