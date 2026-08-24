// ======================================================
// XIAOMI WEBBASE
// APP.JS
// НОВЫЙ АНАЛИЗАТОР ВЫГРУЗКИ 1С
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
// CONSTANTS
// ======================================================

const CATEGORY_NAMES = [

    "Смартфоны",
    "Планшеты",
    "Смарт-часы",
    "Фитнес-браслеты",
    "Наушники",
    "Телевизоры",
    "Камеры",
    "Пылесосы",
    "Аксессуары"

];


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

    /*
     * Иногда Excel может дать значение
     * вроде 1 712 517.
     */

    text =
        text.replace(/[^\d.-]/g, "");

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
        .replace(/\u00A0/g, " ")
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
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
// ACCESSORY DETECTOR
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);

    const words = [

        "чехол",
        "case",

        "стекло",
        "защитное стекло",

        "пленка",
        "плёнка",

        "защитная пленка",
        "защитная плёнка",

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
// NORMALIZE CATEGORY
// ======================================================

function normalizeCategory(value) {

    const text =
        normalizeText(value);

    if (!text) {
        return null;
    }


    if (
        text.includes("смартфон")
    ) {
        return "Смартфоны";
    }


    if (
        text.includes("планшет")
    ) {
        return "Планшеты";
    }


    if (
        text.includes("фитнес") &&
        text.includes("браслет")
    ) {
        return "Фитнес-браслеты";
    }


    if (
        text.includes("смарт") &&
        text.includes("час")
    ) {
        return "Смарт-часы";
    }


    if (
        text.includes("умные часы")
    ) {
        return "Смарт-часы";
    }


    if (
        text.includes("науш")
    ) {
        return "Наушники";
    }


    if (
        text.includes("телевизор")
    ) {
        return "Телевизоры";
    }


    if (
        text.includes("камер")
    ) {
        return "Камеры";
    }


    if (
        text.includes("пылесос")
    ) {
        return "Пылесосы";
    }


    if (
        text.includes("аксессуар")
    ) {
        return "Аксессуары";
    }


    return null;

}


// ======================================================
// SECTION HEADER DETECTOR
// ======================================================
//
// КРИТИЧЕСКИ ВАЖНО:
//
// "01 смартфоны 71"
// "17 планшеты 32"
// "смартфоны - 76"
// "умные часы 50"
//
// являются РАЗДЕЛАМИ.
//
// Но:
//
// "Xiaomi Redmi Note 15 смартфон..."
//
// товаром.
//
// Поэтому здесь используются строгие правила.
// ======================================================

function detectSectionHeader(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return null;
    }


    // -----------------------------------------------
    // Чистые названия разделов
    // -----------------------------------------------

    const exact = {

        "смартфоны":
            "Смартфоны",

        "планшеты":
            "Планшеты",

        "смарт-часы":
            "Смарт-часы",

        "смарт часы":
            "Смарт-часы",

        "умные часы":
            "Смарт-часы",

        "фитнес-браслеты":
            "Фитнес-браслеты",

        "фитнес браслеты":
            "Фитнес-браслеты",

        "наушники":
            "Наушники",

        "телевизоры":
            "Телевизоры",

        "камеры":
            "Камеры",

        "пылесосы":
            "Пылесосы",

        "аксессуары":
            "Аксессуары"

    };


    if (
        exact[text]
    ) {

        return exact[text];

    }


    // -----------------------------------------------
    // Сначала определяем наличие числа
    // в конце строки.
    //
    // 01 смартфоны 71
    // 17 планшеты 32
    // умные часы 50
    // -----------------------------------------------

    const endNumber =
        /\d+\s*$/.test(text);


    if (!endNumber) {

        return null;

    }


    /*
     * Убираем:
     *
     * 01
     * 17
     *
     * и число в конце.
     */

    const withoutNumbers =
        text
            .replace(/^\d+\s*/, "")
            .replace(/\s*\d+\s*$/, "")
            .trim();


    const category =
        normalizeCategory(
            withoutNumbers
        );


    if (!category) {
        return null;
    }


    /*
     * Теперь строка должна быть
     * практически только названием раздела.
     *
     * Это НЕ позволит случайному товару
     * попасть сюда.
     */

    const allowed = [

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
        allowed.includes(
            withoutNumbers
        )
    ) {

        return category;

    }


    return null;

}


// ======================================================
// SUBGROUP DETECTOR
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
        "количество",
        "номенклатура",

        "склад тц европолис",
        "склад тц европолис ов",

        "склад европолис"

    ];


    if (
        exact.includes(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// PRODUCT-LIKE NAME
// ======================================================
//
// Здесь НЕТ определения категории.
//
// Эта функция отвечает только:
//
// "Похоже ли это вообще на товар?"
//
// ======================================================

function looksLikeProduct(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return false;
    }


    if (
        isServiceRow(text)
    ) {

        return false;

    }


    if (
        isSubGroupRow(text)
    ) {

        return false;

    }


    if (
        detectSectionHeader(text)
    ) {

        return false;

    }


    return true;

}


// ======================================================
// FIND HEADER ROW
// ======================================================

function findHeaderRow(rows) {

    let bestRow = -1;
    let bestScore = -1;


    const limit =
        Math.min(
            rows.length,
            20
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


        let score = 0;


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
                text.includes("номенклатура")
            ) {

                score += 10;

            }


            if (
                text.includes("склад")
            ) {

                score += 3;

            }


            if (
                text.includes("количество")
            ) {

                score += 2;

            }


            if (
                text === "итого"
            ) {

                score += 2;

            }

        }


        if (
            score > bestScore
        ) {

            bestScore = score;
            bestRow = i;

        }

    }


    return bestRow;

}


// ======================================================
// FIND NAME COLUMN
// ======================================================

function findNameColumn(rows, headerRow) {

    if (
        headerRow >= 0 &&
        Array.isArray(rows[headerRow])
    ) {

        const row =
            rows[headerRow];


        for (
            let i = 0;
            i < row.length;
            i++
        ) {

            const text =
                normalizeText(
                    row[i]
                );


            if (
                text.includes(
                    "номенклатура"
                )
            ) {

                return i;

            }

        }

    }


    /*
     * В нашей выгрузке это ожидаемо 0.
     */

    return 0;

}


// ======================================================
// ANALYZE STOCK COLUMNS
// ======================================================
//
// Здесь мы больше НЕ предполагаем:
//
// "витрина = E"
// "склад = G"
//
// Анализатор сначала ищет названия колонок.
// ======================================================

function findStockColumns(rows, headerRow, nameColumn) {

    let warehouseColumn = -1;
    let displayColumn = -1;
    let totalColumn = -1;


    /*
     * Смотрим несколько строк вокруг
     * заголовка, потому что в Excel
     * используются объединённые ячейки.
     */

    const start =
        Math.max(
            0,
            headerRow - 2
        );


    const end =
        Math.min(
            rows.length,
            headerRow + 4
        );


    const columnTexts = {};


    for (
        let i = start;
        i < end;
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


            if (!text) {
                continue;
            }


            if (!columnTexts[j]) {
                columnTexts[j] = [];
            }


            columnTexts[j].push(
                text
            );

        }

    }


    /*
     * Анализируем каждую колонку.
     */

    Object.keys(columnTexts)
        .forEach(
            key => {

                const column =
                    Number(key);


                const text =
                    columnTexts[column]
                        .join(" ");


                if (
                    text.includes(
                        "склад тц европолис ов"
                    )
                ) {

                    warehouseColumn =
                        column;

                }


                if (
                    text.includes(
                        "склад тц европолис"
                    ) &&
                    !text.includes(
                        "склад тц европолис ов"
                    )
                ) {

                    displayColumn =
                        column;

                }


                if (
                    text === "итого" ||
                    text.includes(" итого ")
                ) {

                    totalColumn =
                        column;

                }

            }
        );


    /*
     * Если заголовок "Склад ТЦ Европолис"
     * оказался объединённой ячейкой,
     * ищем ближайшую числовую колонку.
     */

    if (
        displayColumn === -1
    ) {

        const candidates = [];


        for (
            let c = nameColumn + 1;
            c < 15;
            c++
        ) {

            if (
                c === warehouseColumn
            ) {
                continue;
            }


            candidates.push(c);

        }


        /*
         * Для текущей структуры 1С
         * обычно первая колонка остатков
         * находится перед ОВ.
         */

        if (
            warehouseColumn > nameColumn
        ) {

            const before =
                warehouseColumn - 1;


            if (
                before > nameColumn
            ) {

                displayColumn =
                    before;

            }

        }


        if (
            displayColumn === -1 &&
            candidates.length
        ) {

            displayColumn =
                candidates[0];

        }

    }


    /*
     * Если ОВ не нашли,
     * ищем следующий числовой столбец.
     */

    if (
        warehouseColumn === -1
    ) {

        if (
            displayColumn !== -1
        ) {

            warehouseColumn =
                displayColumn + 1;

        }

    }


    /*
     * Последний запасной вариант
     * для известной структуры:
     *
     * 0 = номенклатура
     * 3 = Европолис
     * 4 = Европолис ОВ
     */

    if (
        displayColumn === -1 &&
        warehouseColumn === -1
    ) {

        displayColumn = 3;
        warehouseColumn = 4;

    }


    console.log(
        "АНАЛИЗ КОЛОНОК:",
        {
            headerRow,
            nameColumn,
            displayColumn,
            warehouseColumn,
            totalColumn
        }
    );


    return {

        headerRow,

        nameColumn,

        displayColumn,

        warehouseColumn,

        totalColumn

    };

}


// ======================================================
// GET PRODUCT CATEGORY
// ======================================================
//
// ВАЖНО:
//
// 1. Если это явный аксессуар,
//    аксессуар имеет приоритет.
//
// 2. Если название прямо говорит
//    "фитнес-браслет",
//    используем это.
//
// 3. Иначе используем раздел 1С.
//
// То есть:
//
// 01 смартфоны 71
// Redmi Note 15
//
// Redmi Note 15 получает:
// Смартфоны
//
// но не потому что "Note = смартфон",
// а потому что он находится внутри
// раздела Смартфоны.
// ======================================================

function getProductCategory(
    name,
    currentCategory
) {

    const text =
        normalizeText(name);


    /*
     * Явные аксессуары.
     */

    if (
        isAccessoryName(text)
    ) {

        /*
         * Исключение:
         * если это настоящий товар
         * с явным названием фитнес-браслета,
         * он не должен стать аксессуаром
         * только из-за слова strap.
         */

        if (
            text.includes("фитнес") &&
            text.includes("браслет")
        ) {

            return "Фитнес-браслеты";

        }


        return "Аксессуары";

    }


    /*
     * Явный тип товара.
     */

    if (
        text.includes("фитнес") &&
        text.includes("браслет")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        text.includes("умные часы") ||
        text.includes("смарт-часы") ||
        text.includes("смарт часы")
    ) {

        return "Смарт-часы";

    }


    /*
     * Если название товара само содержит
     * тип устройства.
     */

    if (
        /\bсмартфон\b/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /\bпланшет\b/.test(text)
    ) {

        return "Планшеты";

    }


    if (
        /\bтелевизор\b/.test(text)
    ) {

        return "Телевизоры";

    }


    if (
        /\bкамера\b/.test(text)
    ) {

        return "Камеры";

    }


    if (
        /\bпылесос\b/.test(text)
    ) {

        return "Пылесосы";

    }


    /*
     * ГЛАВНОЕ ПРАВИЛО:
     *
     * если товар находится внутри
     * раздела 1С — берём раздел.
     */

    if (
        currentCategory
    ) {

        return currentCategory;

    }


    return "Другое";

}


// ======================================================
// READ STOCK
// ======================================================

function readStock(
    row,
    columns
) {

    let display = 0;
    let warehouse = 0;


    if (
        columns.displayColumn >= 0
    ) {

        display =
            Math.max(
                0,
                number(
                    row[
                        columns.displayColumn
                    ]
                )
            );

    }


    if (
        columns.warehouseColumn >= 0
    ) {

        warehouse =
            Math.max(
                0,
                number(
                    row[
                        columns.warehouseColumn
                    ]
                )
            );

    }


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

    const prepared = {
        ...product
    };


    prepared.id =
        prepared.id ??
        index + 1;


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

            if (!product) {
                return;
            }


            normalized.push(
                prepareProduct(
                    product,
                    index
                )
            );

        }
    );


    products.length = 0;


    normalized.forEach(
        product =>
            products.push(
                product
            )
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
                    item =>
                        item.classList.remove(
                            "active"
                        )
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
                    "КАТЕГОРИЯ:",
                    category,
                    "НАЙДЕНО:",
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
                        number(
                            product.display
                        ) +
                        number(
                            product.warehouse
                        );


                    localStorage.setItem(
                        "xiaomiWebBaseProducts",
                        JSON.stringify(
                            products
                        )
                    );


                    renderProduct(
                        product
                    );

                }
            );

        }
    );

}


// ======================================================
// NEW 1C ANALYZER
// ======================================================

function analyze1C(rows) {

    console.log(
        "========================================"
    );

    console.log(
        "XIAOMI WEBBASE — АНАЛИЗАТОР 1С"
    );

    console.log(
        "========================================"
    );


    const report = {

        totalRows:
            rows.length,

        headerRow:
            -1,

        nameColumn:
            -1,

        displayColumn:
            -1,

        warehouseColumn:
            -1,

        totalColumn:
            -1,

        sections: [],

        products: [],

        ignored: []

    };


    // --------------------------------------------------
    // HEADER
    // --------------------------------------------------

    report.headerRow =
        findHeaderRow(
            rows
        );


    report.nameColumn =
        findNameColumn(
            rows,
            report.headerRow
        );


    const columns =
        findStockColumns(
            rows,
            report.headerRow,
            report.nameColumn
        );


    report.displayColumn =
        columns.displayColumn;

    report.warehouseColumn =
        columns.warehouseColumn;

    report.totalColumn =
        columns.totalColumn;


    console.log(
        "СТРУКТУРА:",
        report
    );


    // --------------------------------------------------
    // START
    // --------------------------------------------------

    const start =
        Math.max(
            report.headerRow + 1,
            0
        );


    let currentCategory =
        null;


    let productId =
        1;


    // --------------------------------------------------
    // ROW ANALYSIS
    // --------------------------------------------------

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
                    report.nameColumn
                ] ?? ""
            ).trim();


        const text =
            normalizeText(name);


        // ---------------------------------------------
        // EMPTY
        // ---------------------------------------------

        if (!text) {

            report.ignored.push({

                row: i + 1,

                name: "",

                reason:
                    "Пустая строка"

            });

            continue;

        }


        // ---------------------------------------------
        // SECTION
        // ---------------------------------------------

        const section =
            detectSectionHeader(
                name
            );


        if (section) {

            currentCategory =
                section;


            report.sections.push({

                row:
                    i + 1,

                name,

                category:
                    section

            });


            console.log(
                `РАЗДЕЛ ${i + 1}:`,
                name,
                "→",
                section
            );


            continue;

        }


        // ---------------------------------------------
        // SERVICE
        // ---------------------------------------------

        if (
            isServiceRow(
                name
            )
        ) {

            report.ignored.push({

                row:
                    i + 1,

                name,

                reason:
                    "Служебная строка"

            });

            continue;

        }


        // ---------------------------------------------
        // SUBGROUP
        // ---------------------------------------------

        if (
            isSubGroupRow(
                name
            )
        ) {

            report.ignored.push({

                row:
                    i + 1,

                name,

                reason:
                    "Подгруппа"

            });


            console.log(
                `ПОДГРУППА ${i + 1}:`,
                name
            );


            continue;

        }


        // ---------------------------------------------
        // PRODUCT
        // ---------------------------------------------

        if (
            !looksLikeProduct(
                name
            )
        ) {

            report.ignored.push({

                row:
                    i + 1,

                name,

                reason:
                    "Не товар"

            });

            continue;

        }


        const stock =
            readStock(
                row,
                report
            );


        const category =
            getProductCategory(
                name,
                currentCategory
            );


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
                stock.display,

            warehouse:
                stock.warehouse,

            quantity:
                stock.total,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        report.products.push(
            product
        );


        console.log(
            `ТОВАР ${i + 1}:`,
            name,
            "→",
            category,
            "|",
            "витрина:",
            stock.display,
            "|",
            "склад:",
            stock.warehouse
        );

    }


    // ==================================================
    // FINAL REPORT
    // ==================================================

    const statistics = {};


    CATEGORY_NAMES.forEach(
        category => {

            statistics[category] =
                report.products.filter(
                    product =>
                        product.category ===
                        category
                ).length;

        }
    );


    statistics["Другое"] =
        report.products.filter(
            product =>
                product.category ===
                "Другое"
        ).length;


    report.statistics =
        statistics;


    console.log(
        "========================================"
    );

    console.log(
        "РЕЗУЛЬТАТ АНАЛИЗА"
    );

    console.log(
        "Всего строк:",
        report.totalRows
    );

    console.log(
        "Строка заголовков:",
        report.headerRow + 1
    );

    console.log(
        "Колонка Номенклатура:",
        report.nameColumn
    );

    console.log(
        "Колонка Витрина:",
        report.displayColumn
    );

    console.log(
        "Колонка Склад:",
        report.warehouseColumn
    );

    console.log(
        "Колонка Итого:",
        report.totalColumn
    );

    console.log(
        "Разделов:",
        report.sections.length
    );

    console.log(
        "Игнорировано:",
        report.ignored.length
    );

    console.log(
        "РЕАЛЬНЫХ ТОВАРОВ:",
        report.products.length
    );

    console.log(
        "КАТЕГОРИИ:",
        statistics
    );

    console.log(
        "========================================"
    );


    /*
     * Очень важная проверка.
     */

    const categoryTotal =
        Object.values(
            statistics
        )
        .reduce(
            (sum, value) =>
                sum + value,
            0
        );


    console.log(
        "ПРОВЕРКА:",
        categoryTotal,
        "категорий =",
        report.products.length,
        "товаров"
    );


    if (
        categoryTotal !==
        report.products.length
    ) {

        console.error(
            "ОШИБКА: категории не сходятся!"
        );

    }


    return report;

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
                    "Анализирую структуру выгрузки 1С...";

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
                            "ЛИСТ:",
                            sheetName
                        );


                        console.log(
                            "ВСЕГО СТРОК:",
                            rows.length
                        );


                        console.log(
                            "ПЕРВЫЕ 10 СТРОК:",
                            rows.slice(
                                0,
                                10
                            )
                        );


                        // ---------------------------------
                        // НОВЫЙ АНАЛИЗАТОР
                        // ---------------------------------

                        const analysis =
                            analyze1C(
                                rows
                            );


                        const imported =
                            analysis.products;


                        if (
                            !Array.isArray(imported) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Анализатор не нашёл ни одного товара."
                            );

                        }


                        // ---------------------------------
                        // ЗАМЕНЯЕМ БАЗУ
                        // ---------------------------------

                        products.length = 0;


                        imported.forEach(
                            product => {

                                products.push(
                                    product
                                );

                            }
                        );


                        normalizeProducts();


                        // ---------------------------------
                        // СОХРАНЕНИЕ
                        // ---------------------------------

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(
                                products
                            )
                        );


                        // ---------------------------------
                        // РЕНДЕР
                        // ---------------------------------

                        renderProducts(
                            products
                        );


                        // ---------------------------------
                        // STATUS
                        // ---------------------------------

                        if (importStatus) {

                            importStatus.innerHTML = `

                                Готово.
                                Загружено товаров:
                                <strong>
                                    ${products.length}
                                </strong>

                            `;

                        }


                        console.log(
                            "========================================"
                        );

                        console.log(
                            "ИМПОРТ ЗАВЕРШЁН"
                        );

                        console.log(
                            "ТОВАРОВ:",
                            products.length
                        );

                        console.log(
                            "СТАТИСТИКА:",
                            analysis.statistics
                        );

                        console.log(
                            "========================================"
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
            product =>
                products.push(
                    product
                )
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


    console.log(
        "========================================"
    );

    console.log(
        "XIAOMI WEBBASE"
    );

    console.log(
        "Текущих товаров:",
        products.length
    );

    console.log(
        "========================================"
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