// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// АКТУАЛЬНЫЙ АНАЛИЗАТОР ВЫГРУЗКИ 1С
//
// СТРУКТУРА ТАБЛИЦЫ 1С:
//
// 1 колонка = Номенклатура       = индекс 0
// 6 колонка = Склад              = индекс 5
// 7 колонка = Витрина            = индекс 6
// 8 колонка = Всего              = индекс 7
//
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
// Excel:
// 1 = Номенклатура
// 6 = Склад
// 7 = Витрина
// 8 = Всего
//
// В JavaScript индексация начинается с 0.
//
// Поэтому:
//
// Номенклатура = 0
// Склад        = 5
// Витрина      = 6
// Всего        = 7
//
// ======================================================

const IMPORT_CONFIG = {

    // 6-я строка Excel
    headerRow: 5,

    // Номенклатура
    nameColumn: 0,

    // 6-я колонка
    warehouseColumn: 5,

    // 7-я колонка
    displayColumn: 6,

    // 8-я колонка
    totalColumn: 7

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


    // Убираем всё кроме цифр,
    // точки и минуса
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
// LOOKS LIKE NUMBER
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
// Проверяем именно название.
//
// Например:
//
// Чехол для Redmi Note
// → Аксессуары
//
// Защитное стекло для Redmi Pad
// → Аксессуары
//
// ======================================================

function isAccessory(name) {

    const text =
        normalizeText(name);


    const words = [

        "чехол",
        "чехлы",
        "case",

        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло для",
        "пленка для",
        "плёнка для",
        "glass",

        "зарядное устройство",
        "зарядное",
        "зарядка",
        "зарядный",
        "зарядная",
        "charger",

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

        "клавиатура",
        "keyboard",

        "наушник",
        "наушники",
        "earbuds",
        "headphones",
        "headset",

        "сумка",
        "сумка для",
        "чехол-сумка",

        "блок питания",
        "power adapter",
        "power supply",

        "док-станция",
        "док станция",
        "dock station",
        "dock",

        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word =>
            text.includes(word)
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
// SECTION / CATEGORY ROW
// ======================================================
//
// ВАЖНО:
//
// Такие строки не являются товарами.
//
// Например:
//
// Redmi Pad 2
// Xiaomi 17
// Redmi Note 15
//
// НЕ должны автоматически становиться товарами.
//
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


    // ----------------------------------------------
    // Смартфоны
    // ----------------------------------------------

    if (
        /^смартфоны?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Смартфоны";

    }


    // ----------------------------------------------
    // Планшеты
    // ----------------------------------------------

    if (
        /^планшеты?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Планшеты";

    }


    // ----------------------------------------------
    // Умные часы
    // ----------------------------------------------

    if (
        /^умные часы(?:\s+\d+)?$/.test(compact) ||
        /^смарт часы(?:\s+\d+)?$/.test(compact) ||
        /^смарт-часы(?:\s+\d+)?$/.test(compact)
    ) {

        return "Смарт-часы";

    }


    // ----------------------------------------------
    // Фитнес-браслеты
    // ----------------------------------------------

    if (
        /^фитнес браслеты?(?:\s+\d+)?$/.test(compact) ||
        /^фитнес-браслеты?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Фитнес-браслеты";

    }


    // ----------------------------------------------
    // Наушники
    // ----------------------------------------------

    if (
        /^наушники(?:\s+\d+)?$/.test(compact)
    ) {

        return "Наушники";

    }


    // ----------------------------------------------
    // Телевизоры
    // ----------------------------------------------

    if (
        /^телевизоры?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Телевизоры";

    }


    // ----------------------------------------------
    // Камеры
    // ----------------------------------------------

    if (
        /^камеры?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Камеры";

    }


    // ----------------------------------------------
    // Пылесосы
    // ----------------------------------------------

    if (
        /^пылесосы?(?:\s+\d+)?$/.test(compact)
    ) {

        return "Пылесосы";

    }


    // ----------------------------------------------
    // Аксессуары
    // ----------------------------------------------

    if (
        /^аксессуары(?:\s+\d+)?$/.test(compact)
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

        /^чехол\s+для\s+/,

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
// PRODUCT PREFIX
// ======================================================
//
// ВОТ ЗДЕСЬ ГЛАВНАЯ ЛОГИКА.
//
// Товар должен иметь явный тип в начале названия.
//
// Например:
//
// Смартфон Xiaomi 17...
// Планшет Redmi Pad 2...
// Смарт-часы Xiaomi Watch...
// Фитнес-браслет Xiaomi Smart Band...
//
// А вот:
//
// Redmi Pad 2
// Xiaomi 17
// Redmi Note 15
//
// сами по себе НЕ считаются товаром.
//
// ======================================================

function getExplicitProductType(name) {

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
    // СМАРТФОН
    // ==================================================

    if (
        /^смартфон(?:\s|$)/.test(text) ||
        /^смартфоны(?:\s|$)/.test(text)
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // ПЛАНШЕТ
    // ==================================================

    if (
        /^планшет(?:\s|$)/.test(text) ||
        /^планшеты(?:\s|$)/.test(text)
    ) {

        return "Планшеты";

    }


    // ==================================================
    // СМАРТ-ЧАСЫ
    // ==================================================

    if (
        /^умные часы(?:\s|$)/.test(text) ||
        /^смарт часы(?:\s|$)/.test(text) ||
        /^смарт-часы(?:\s|$)/.test(text)
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // ФИТНЕС-БРАСЛЕТ
    // ==================================================

    if (
        /^фитнес браслет(?:\s|$)/.test(text) ||
        /^фитнес-браслет(?:\s|$)/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // НАУШНИКИ
    // ==================================================

    if (
        /^наушник(?:\s|$)/.test(text) ||
        /^наушники(?:\s|$)/.test(text)
    ) {

        return "Наушники";

    }


    // ==================================================
    // ТЕЛЕВИЗОР
    // ==================================================

    if (
        /^телевизор(?:\s|$)/.test(text) ||
        /^телевизоры(?:\s|$)/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // КАМЕРА
    // ==================================================

    if (
        /^камера(?:\s|$)/.test(text) ||
        /^камеры(?:\s|$)/.test(text)
    ) {

        return "Камеры";

    }


    // ==================================================
    // ПЫЛЕСОС
    // ==================================================

    if (
        /^пылесос(?:\s|$)/.test(text) ||
        /^пылесосы(?:\s|$)/.test(text) ||
        /^робот-пылесос(?:\s|$)/.test(text) ||
        /^робот пылесос(?:\s|$)/.test(text)
    ) {

        return "Пылесосы";

    }


    // ==================================================
    // НИЧЕГО НЕ НАШЛИ
    // ==================================================

    return null;

}


// ======================================================
// PRODUCT TYPE
// ======================================================
//
// В отличие от старой версии здесь НЕТ логики:
//
// Redmi Note → смартфон
// Xiaomi 17 → смартфон
// Redmi Pad → планшет
//
// Потому что эти слова могут быть категориями.
//
// Товаром считается только строка с явным
// префиксом типа.
//
// ======================================================

function detectProductType(name) {

    return getExplicitProductType(name);

}


// ======================================================
// CLASSIFY PRODUCT
// ======================================================

function classifyProduct(name, section) {

    const cleaned =
        cleanProductName(name);


    // ----------------------------------------------
    // 1. Сначала аксессуар
    // ----------------------------------------------

    if (
        isAccessory(cleaned)
    ) {

        return "Аксессуары";

    }


    // ----------------------------------------------
    // 2. Явный тип товара
    // ----------------------------------------------

    const detected =
        detectProductType(cleaned);


    if (detected) {

        return detected;

    }


    // ----------------------------------------------
    // 3. FALLBACK ПО РАЗДЕЛУ НЕ ИСПОЛЬЗУЕМ
    //
    // Это очень важно.
    //
    // Если строка:
    //
    // Redmi Pad 2
    //
    // находится внутри раздела Планшеты,
    // она НЕ становится товаром.
    //
    // ----------------------------------------------

    return null;

}


// ======================================================
// REAL PRODUCT ROW
// ======================================================
//
// Здесь главное изменение.
//
// Мы больше НЕ принимаем любую строку длиной > 4.
//
// Иначе 1С превращает категории и служебные строки
// в товары.
//
// ======================================================

function isRealProductRow(row, name) {

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


    // Служебные строки
    if (
        isServiceRow(text)
    ) {

        return false;

    }


    // Разделы
    if (
        detectSection(text)
    ) {

        return false;

    }


    // Подгруппы
    if (
        isSubGroup(text)
    ) {

        return false;

    }


    // Число
    if (
        looksLikeNumber(text)
    ) {

        return false;

    }


    // ==================================================
    // ГЛАВНОЕ:
    //
    // Проверяем наличие ЯВНОГО типа товара.
    // ==================================================

    const type =
        detectProductType(text);


    if (!type) {

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

    // ==================================================
    // 6 КОЛОНКА = СКЛАД
    // ==================================================

    const warehouse =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG
                        .warehouseColumn
                ]
            )
        );


    // ==================================================
    // 7 КОЛОНКА = ВИТРИНА
    // ==================================================

    const display =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG
                        .displayColumn
                ]
            )
        );


    // ==================================================
    // 8 КОЛОНКА = ВСЕГО
    // ==================================================

    const total =
        Math.max(
            0,
            number(
                row[
                    IMPORT_CONFIG
                        .totalColumn
                ]
            )
        );


    return {

        id,

        name:
            cleanProductName(name),

        category,

        memory: "",

        color: "",

        // Витрина = 7 колонка
        display,

        // Склад = 6 колонка
        warehouse,

        // Всего = 8 колонка
        quantity: total,

        total,

        description: "",

        tip: "",

        specs: {}

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


    // Начинаем после строки заголовков

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
        // ПРОВЕРЯЕМ ТОВАР
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


        // Если категория не определилась,
        // товар не добавляем.

        if (!category) {

            stats.ignored++;


            console.log(
                `[ИГНОР] ${rawName} → категория не определена`
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

            `[ТОВАР] ${product.name}` +
            ` → ${category}` +
            ` | витрина=${product.display}` +
            ` | склад=${product.warehouse}` +
            ` | всего=${product.total}`

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


    // Если total есть,
    // используем его.
    //
    // Если старый товар его не имеет,
    // рассчитываем.

    if (
        prepared.total !== undefined &&
        prepared.total !== null
    ) {

        prepared.total =
            number(
                prepared.total
            );

    } else {

        prepared.total =
            prepared.display +
            prepared.warehouse;

    }


    prepared.quantity =
        prepared.total;


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


    const total =
        number(
            product.total
        );


    return {

        display,

        warehouse,

        total

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


                    // Всего пересчитываем
                    // из склада + витрина

                    product.total =
                        number(
                            product.display
                        ) +
                        number(
                            product.warehouse
                        );


                    product.quantity =
                        product.total;


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
                                    IMPORT_CONFIG.nameColumn,

                                склад:
                                    IMPORT_CONFIG.warehouseColumn,

                                витрина:
                                    IMPORT_CONFIG.displayColumn,

                                всего:
                                    IMPORT_CONFIG.totalColumn

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
                        // ПОЛНОСТЬЮ ЗАМЕНЯЕМ БАЗУ
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


                        // ==================================================
                        // ПРОВЕРКА ПЕРВЫХ ТОВАРОВ
                        // ==================================================

                        console.log("");

                        console.log(
                            "========== ПЕРВЫЕ ТОВАРЫ =========="
                        );


                        products
                            .slice(0, 20)
                            .forEach(
                                product => {

                                    console.log(

                                        product.name,

                                        "| категория:",
                                        product.category,

                                        "| склад:",
                                        product.warehouse,

                                        "| витрина:",
                                        product.display,

                                        "| всего:",
                                        product.total

                                    );

                                }
                            );


                        console.log(
                            "===================================="
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
// STOCK DEBUG
// ======================================================
//
// Показывает первые 20 товаров с исходными
// значениями склада / витрины / всего.
//
// Это поможет сразу увидеть,
// правильно ли читаются колонки.
//
// ======================================================

function printStockDebug() {

    console.log("");

    console.log(
        "========== ПРОВЕРКА ОСТАТКОВ =========="
    );


    products
        .slice(0, 20)
        .forEach(
            product => {

                console.log(

                    `[ОСТАТКИ] ${product.name}` +

                    ` | склад=${product.warehouse}` +

                    ` | витрина=${product.display}` +

                    ` | всего=${product.total}`

                );

            }
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


    // Загружаем сохранённую базу

    loadSavedProducts();


    // Нормализуем

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
        "Новый анализатор данных 1С"
    );

    console.log(
        "Товаров:",
        products.length
    );

    console.log(
        "=========================================="
    );


    // ==================================================
    // CATEGORIES
    // ==================================================

    printCategoryStats();


    // ==================================================
    // STOCK
    // ==================================================

    printStockDebug();


    // ==================================================
    // RENDER
    // ==================================================

    if (productsList) {

        renderProducts(
            products
        );

    }


    // ==================================================
    // PRODUCT PAGE
    // ==================================================

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