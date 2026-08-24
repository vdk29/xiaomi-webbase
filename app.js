// ======================================================
// XIAOMI WEBBASE
// APP.JS
// НОВЫЙ АНАЛИЗАТОР ВЫГРУЗКИ 1С
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
// НАСТРОЙКИ ИМПОРТА 1С
// ======================================================
//
// ТВОЯ РЕАЛЬНАЯ ТАБЛИЦА:
//
// Номенклатура             = 0
// Витрина                  = 4
// Склад ТЦ Европолис ОВ    = 6
//
// Заголовок находится на 6-й строке,
// значит индекс строки = 5.
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

    // Иногда Excel может отдавать числа
    // с дополнительными символами.
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
// УДАЛЕНИЕ СЛУЖЕБНЫХ ПРЕФИКСОВ
// ======================================================

function cleanProductName(name) {

    return String(name ?? "")
        .trim()
        .replace(/^\d+\s+/, "")
        .trim();

}


// ======================================================
// ПРОВЕРКА НА ЧИСЛОВУЮ СТРОКУ
// ======================================================

function looksLikeNumber(value) {

    const text = normalizeText(value);

    if (!text) {
        return false;
    }

    return /^[-+]?\d+(?:[.,]\d+)?$/.test(text);

}


// ======================================================
// АКСЕССУАРЫ
// ======================================================
//
// ВАЖНО:
// аксессуар определяется ПО НАЗВАНИЮ.
//
// Поэтому:
// "Чехол для Redmi Note 15"
// → Аксессуары
//
// "Защитное стекло для Redmi Pad 2"
// → Аксессуары
//
// Даже если внутри есть "Redmi Note",
// он НЕ станет смартфоном.
//

function isAccessory(name) {

    const text = normalizeText(name);

    const accessoryWords = [

        // Чехлы
        "чехол",
        "чехлы",
        "case",

        // Стекла / пленки
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло для",
        "пленка для",
        "плёнка для",
        "glass",

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
        "сумка для",
        "сумка",
        "чехол-сумка",

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

    return accessoryWords.some(word =>
        text.includes(word)
    );

}


// ======================================================
// ЯВНЫЕ ЗАГОЛОВКИ 1С
// ======================================================
//
// Такие строки НИКОГДА не становятся товарами:
//
// 01 Смартфоны 71
// 17 Планшеты 32
// Умные часы 50
// Фитнес-браслеты 53
//
// ======================================================

function detectSection(name) {

    const text = normalizeText(name);

    if (!text) {
        return null;
    }


    // --------------------------------------------------
    // Сначала проверяем типичные служебные конструкции
    // --------------------------------------------------

    const compact = text
        .replace(/^\d+\s*/, "")
        .trim();


    // --------------------------------------------------
    // Смартфоны
    // --------------------------------------------------

    if (
        /\bсмартфоны?\b/.test(compact)
    ) {

        // Но реальные товары вида:
        // "Смартфон Xiaomi Redmi Note 15"
        // не должны становиться разделом.

        if (
            /\bсмартфон\b/.test(compact) &&
            compact.length > 25
        ) {

            return null;

        }

        return "Смартфоны";

    }


    // --------------------------------------------------
    // Планшеты
    // --------------------------------------------------

    if (
        /\bпланшеты?\b/.test(compact)
    ) {

        if (
            compact.length > 25 &&
            !/^\d*\s*планшеты?$/.test(compact)
        ) {

            return null;

        }

        return "Планшеты";

    }


    // --------------------------------------------------
    // Часы
    // --------------------------------------------------

    if (
        compact.includes("умные часы") ||
        compact.includes("смарт часы") ||
        compact.includes("смарт-часы")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // Браслеты
    // --------------------------------------------------

    if (
        compact.includes("фитнес браслет") ||
        compact.includes("фитнес-браслет") ||
        compact.includes("фитнес браслеты") ||
        compact.includes("фитнес-браслеты")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // Наушники
    // --------------------------------------------------

    if (
        compact === "наушники" ||
        /^наушники\s+\d+/.test(compact)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // Телевизоры
    // --------------------------------------------------

    if (
        compact === "телевизоры" ||
        /^телевизоры\s+\d+/.test(compact)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // Камеры
    // --------------------------------------------------

    if (
        compact === "камеры" ||
        /^камеры\s+\d+/.test(compact)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // Пылесосы
    // --------------------------------------------------

    if (
        compact === "пылесосы" ||
        /^пылесосы\s+\d+/.test(compact)
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // Аксессуары
    // --------------------------------------------------

    if (
        compact === "аксессуары" ||
        /^аксессуары\s+\d+/.test(compact)
    ) {

        return "Аксессуары";

    }


    return null;

}


// ======================================================
// СЛУЖЕБНАЯ СТРОКА
// ======================================================

function isServiceRow(name) {

    const text = normalizeText(name);

    if (!text) {
        return true;
    }


    // Чистые служебные строки

    const exact = [

        "итого",
        "всего",
        "номенклатура",
        "количество",
        "остаток",
        "остатки",
        "товары"

    ];

    if (exact.includes(text)) {
        return true;
    }


    // Разделы

    if (detectSection(text)) {
        return true;
    }


    // Строки вида:
    //
    // 01 смартфоны 71
    // 17 планшеты 32
    // 05 телевизоры 20
    //
    if (
        /^\d+\s+.+\s+\d+$/.test(text)
    ) {

        if (
            detectSection(text)
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// ПОДГРУППЫ
// ======================================================

function isSubGroup(name) {

    const text = normalizeText(name);

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
        pattern => pattern.test(text)
    );

}


// ======================================================
// ЯВНЫЙ ТИП ТОВАРА
// ======================================================
//
// Это ОСНОВНОЙ анализатор.
//
// Он не зависит от того,
// где находится строка в таблице.
//

function detectProductType(name) {

    const text = normalizeText(name);


    // --------------------------------------------------
    // 1. Аксессуары
    // --------------------------------------------------

    if (isAccessory(text)) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // 2. Фитнес-браслеты
    // --------------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("фитнес браслеты")
    ) {

        return "Фитнес-браслеты";

    }


    // Xiaomi Smart Band
    // Mi Band
    // Redmi Band

    if (
        /\bmi band\b/.test(text) ||
        /\bxiaomi smart band\b/.test(text) ||
        /\bredmi band\b/.test(text) ||
        /\bsmart band\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // 3. Смарт-часы
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


    // Xiaomi Watch / Redmi Watch
    if (
        /\bxiaomi watch\b/.test(text) ||
        /\bredmi watch\b/.test(text) ||
        /\bwatch s\d+\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // 4. Планшеты
    // --------------------------------------------------

    if (
        text.includes("планшет") ||
        text.includes("планшеты")
    ) {

        return "Планшеты";

    }


    // Xiaomi Pad
    // Redmi Pad

    if (
        /\bxiaomi pad\b/.test(text) ||
        /\bredmi pad\b/.test(text) ||
        /\bpad \d/.test(text) ||
        /\bpad pro\b/.test(text) ||
        /\bpad se\b/.test(text)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // 5. Смартфоны
    // --------------------------------------------------

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


    // Redmi / Xiaomi модели
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


    if (
        /\bxiaomi\s+\d+\s+(?:pro|max|ultra|lite|t)/.test(text)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // 6. Телевизоры
    // --------------------------------------------------

    if (
        text.includes("телевизор") ||
        text.includes("телевизоры") ||
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // 7. Камеры
    // --------------------------------------------------

    if (
        text.includes("камера") ||
        text.includes("камеры") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // 8. Пылесосы
    // --------------------------------------------------

    if (
        text.includes("пылесос") ||
        text.includes("робот-пылесос") ||
        text.includes("робот пылесос")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// РАЗДЕЛ → КАТЕГОРИЯ
// ======================================================

function sectionToCategory(section) {

    if (!section) {
        return null;
    }

    return section;

}


// ======================================================
// ФИНАЛЬНАЯ КЛАССИФИКАЦИЯ
// ======================================================
//
// Порядок очень важен:
//
// 1. аксессуар
// 2. явный тип товара
// 3. модель
// 4. раздел 1С
// 5. другое
//
// Но раздел 1С НИКОГДА не перебивает
// явное название товара.
//

function classifyProduct(name, section) {

    const cleaned =
        cleanProductName(name);


    // --------------------------------------------------
    // Аксессуар
    // --------------------------------------------------

    if (
        isAccessory(cleaned)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // Анализ самого названия
    // --------------------------------------------------

    const detected =
        detectProductType(cleaned);


    if (detected) {

        return detected;

    }


    // --------------------------------------------------
    // Если название не дало результата,
    // используем текущий раздел 1С
    // как СЛАБЫЙ fallback.
    // --------------------------------------------------

    if (section) {

        return sectionToCategory(section);

    }


    return "Другое";

}


// ======================================================
// ПРОВЕРКА РЕАЛЬНОГО ТОВАРА
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


    // Служебная строка
    if (isServiceRow(text)) {
        return false;
    }


    // Подгруппа
    if (isSubGroup(text)) {
        return false;
    }


    // Только число — не товар
    if (looksLikeNumber(text)) {
        return false;
    }


    // -----------------------------------------------
    // Проверяем наличие числовых остатков.
    //
    // Это очень важная защита от заголовков.
    // -----------------------------------------------

    const display =
        number(row[IMPORT_CONFIG.displayColumn]);

    const warehouse =
        number(row[IMPORT_CONFIG.warehouseColumn]);


    // Если есть остаток — почти наверняка товар.
    if (
        display !== 0 ||
        warehouse !== 0
    ) {

        return true;

    }


    // -----------------------------------------------
    // Товар может иметь 0/0.
    //
    // Поэтому смотрим на остальные признаки.
    // -----------------------------------------------

    const productType =
        detectProductType(text);


    if (productType) {

        return true;

    }


    // Если строка похожа на обычное название,
    // допускаем её.
    //
    // Но служебные разделы выше уже отфильтрованы.

    if (
        text.length >= 4
    ) {

        return true;

    }


    return false;

}


// ======================================================
// СОЗДАНИЕ ТОВАРА
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
// ГЛАВНЫЙ АНАЛИЗАТОР 1С
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


    // --------------------------------------------------
    // Текущий раздел используется ТОЛЬКО как fallback.
    // --------------------------------------------------

    let currentSection = null;

    let productId = 1;


    // --------------------------------------------------
    // НАЧИНАЕМ ПОСЛЕ ЗАГОЛОВКА
    // --------------------------------------------------

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
        // РАЗДЕЛ 1С
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
    // ИТОГОВАЯ ПРОВЕРКА
    // ==================================================

    console.log("");
    console.log("==========================================");
    console.log("       АНАЛИЗ ВЫГРУЗКИ 1С");
    console.log("==========================================");

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

    console.log("==========================================");


    return {

        products:
            result,

        stats

    };

}


// ======================================================
// PREPARE PRODUCT
// ======================================================

function prepareProduct(product, index) {

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


                        // --------------------------------------------------
                        // ПОКАЗЫВАЕМ ПЕРВЫЕ СТРОКИ
                        // --------------------------------------------------

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