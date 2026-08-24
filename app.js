// ======================================================
// XIAOMI WEBBASE
// NEW 1C DATA ANALYZER
// APP.JS
// ======================================================
//
// Новый принцип:
//
// XLSX
//   ↓
// АНАЛИЗ СТРУКТУРЫ
//   ↓
// ПОИСК ЗАГОЛОВКОВ
//   ↓
// ОПРЕДЕЛЕНИЕ КОЛОНОК
//   ↓
// АНАЛИЗ КАЖДОЙ СТРОКИ
//   ↓
// SECTION / SUBSECTION / PRODUCT / SERVICE
//   ↓
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
//   ↓
// ПРОВЕРКА ОСТАТКОВ
//   ↓
// СОЗДАНИЕ БАЗЫ
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
// SETTINGS
// ======================================================

const STORAGE_KEY =
    "xiaomiWebBaseProducts";


// ======================================================
// NUMBER
// ======================================================

function toNumber(value) {

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
            .replace(/\u00A0/g, " ")
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
// TEXT
// ======================================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ");

}


function compactText(value) {

    return normalizeText(value)
        .replace(/[\s\-–—_./\\:;,()]+/g, "");

}


// ======================================================
// ESCAPE
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
// DEBUG
// ======================================================

function analyzerLog(...args) {

    console.log(
        "[XIAOMI ANALYZER]",
        ...args
    );

}


// ======================================================
// ACCESSORIES
// ======================================================

function isAccessory(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return false;
    }

    const strongAccessoryWords = [

        "чехол",
        "case",

        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",

        "стекло",
        "пленка",
        "плёнка",

        "кабель",
        "cable",

        "зарядное устройство",
        "зарядка",
        "зарядный",

        "charger",

        "ремешок",
        "strap",

        "переходник",
        "adapter",

        "держатель",
        "holder",

        "клавиатура",
        "keyboard",

        "стилус",
        "stylus",

        "чехол-книжка",

        "аксессуар",
        "аксессуары"

    ];

    return strongAccessoryWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// CATEGORY FROM PRODUCT NAME
// ======================================================

function categoryFromName(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return null;
    }


    // ------------------------------------------
    // АКСЕССУАРЫ
    // ------------------------------------------

    if (
        isAccessory(text)
    ) {

        return "Аксессуары";

    }


    // ------------------------------------------
    // ФИТНЕС-БРАСЛЕТ
    // ------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет")
    ) {

        return "Фитнес-браслеты";

    }


    // ------------------------------------------
    // ЧАСЫ
    // ------------------------------------------

    if (
        text.includes("умные часы") ||
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    // ------------------------------------------
    // ПЛАНШЕТЫ
    // ------------------------------------------

    if (
        text.includes("планшет")
    ) {

        return "Планшеты";

    }


    // ------------------------------------------
    // СМАРТФОНЫ
    // ------------------------------------------

    if (
        text.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // ------------------------------------------
    // НАУШНИКИ
    // ------------------------------------------

    if (
        text.includes("наушник") ||
        text.includes("earbuds") ||
        text.includes("headphones")
    ) {

        return "Наушники";

    }


    // ------------------------------------------
    // ТЕЛЕВИЗОРЫ
    // ------------------------------------------

    if (
        text.includes("телевизор") ||
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ------------------------------------------
    // КАМЕРЫ
    // ------------------------------------------

    if (
        text.includes("камера")
    ) {

        return "Камеры";

    }


    // ------------------------------------------
    // ПЫЛЕСОСЫ
    // ------------------------------------------

    if (
        text.includes("пылесос")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// CATEGORY FROM HEADER / CONTEXT
// ======================================================

function categoryFromContext(context) {

    const text =
        normalizeText(context);

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
        text.includes("умные часы") ||
        text.includes("смарт часы") ||
        text.includes("смарт-часы")
    ) {

        return "Смарт-часы";

    }


    if (
        text.includes("наушник")
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
// SECTION DETECTION
// ======================================================
//
// ВАЖНО:
//
// "01 смартфоны 71"
// "17 планшеты 20"
// "умные часы 50"
//
// не являются товарами.
//
// Мы НЕ просто ищем слово "смартфон".
// Мы анализируем форму строки.
//
// ======================================================

function detectSection(name) {

    const text =
        normalizeText(name);

    if (!text) {
        return null;
    }


    // -------------------------------
    // Чистые названия
    // -------------------------------

    const exact = {

        "смартфоны":
            "Смартфоны",

        "смартфон":
            "Смартфоны",

        "планшеты":
            "Планшеты",

        "планшет":
            "Планшеты",

        "умные часы":
            "Смарт-часы",

        "смарт часы":
            "Смарт-часы",

        "смарт-часы":
            "Смарт-часы",

        "фитнес браслеты":
            "Фитнес-браслеты",

        "фитнес-браслеты":
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


    // -------------------------------
    // Формат:
    //
    // 01 смартфоны 71
    // 17 планшеты 20
    // -------------------------------

    const numbered =
        text.match(
            /^\s*\d+\s+(.+?)\s+\d+\s*$/
        );


    if (
        numbered
    ) {

        const middle =
            numbered[1];

        const category =
            categoryFromContext(
                middle
            );

        if (category) {

            return category;

        }

    }


    // -------------------------------
    // Формат:
    //
    // смартфоны - 71
    // планшеты 20
    // -------------------------------

    const category =
        categoryFromContext(
            text
        );


    if (
        category
    ) {

        // Если строка похожа на счётчик,
        // это раздел.

        if (
            /\d+\s*$/.test(text)
        ) {

            return category;

        }

        if (
            /[-–—]\s*\d+/.test(text)
        ) {

            return category;

        }

    }


    return null;

}


// ======================================================
// SUBGROUP
// ======================================================

function isSubgroup(name) {

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

        /^плёнки\s+для\s+/

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


    const serviceWords = [

        "итого",
        "всего",
        "остаток",
        "остатки",
        "количество",
        "сумма",
        "служебная",
        "без категории"

    ];


    return serviceWords.some(
        word =>
            text === word ||
            text.startsWith(
                word + " "
            )
    );

}


// ======================================================
// PRODUCT-LIKE NAME
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
        detectSection(text)
    ) {
        return false;
    }


    if (
        isSubgroup(text)
    ) {
        return false;
    }


    if (
        isAccessory(text)
    ) {
        return true;
    }


    // Явные товарные типы

    const productWords = [

        "смартфон",
        "планшет",

        "фитнес-браслет",
        "фитнес браслет",

        "смарт-часы",
        "смарт часы",
        "умные часы",

        "наушник",
        "телевизор",
        "камера",
        "пылесос"

    ];


    if (
        productWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return true;

    }


    // Брендовые названия.
    //
    // Например:
    // Xiaomi 15
    // Redmi Note 15
    // Redmi Pad 2
    // Xiaomi Watch ...
    //
    // Но только если строка не похожа
    // на раздел.

    const brandWords = [

        "xiaomi",
        "redmi",
        "poco",
        "mi "

    ];


    if (
        brandWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return true;

    }


    return false;

}


// ======================================================
// HEADER SCORE
// ======================================================

function scoreHeaderRow(row) {

    if (
        !Array.isArray(row)
    ) {
        return 0;
    }


    let score = 0;


    row.forEach(
        value => {

            const text =
                normalizeText(value);


            if (!text) {
                return;
            }


            if (
                text.includes("номенклат")
            ) {

                score += 100;

            }


            if (
                text.includes("наименование")
            ) {

                score += 80;

            }


            if (
                text.includes("товар")
            ) {

                score += 30;

            }


            if (
                text.includes("склад")
            ) {

                score += 30;

            }


            if (
                text.includes("витрин")
            ) {

                score += 30;

            }


            if (
                text.includes("остат")
            ) {

                score += 25;

            }


            if (
                text.includes("количество")
            ) {

                score += 20;

            }

        }
    );


    return score;

}


// ======================================================
// FIND HEADER ROW
// ======================================================

function findHeaderRow(rows) {

    let bestRow = -1;

    let bestScore = 0;


    const limit =
        Math.min(
            rows.length,
            100
        );


    for (
        let i = 0;
        i < limit;
        i++
    ) {

        const score =
            scoreHeaderRow(
                rows[i]
            );


        if (
            score > bestScore
        ) {

            bestScore =
                score;

            bestRow =
                i;

        }

    }


    analyzerLog(
        "Строка заголовков:",
        bestRow,
        "score:",
        bestScore
    );


    return bestRow;

}


// ======================================================
// FIND COLUMN BY KEYWORD
// ======================================================

function findColumn(
    headers,
    keywords
) {

    let best = null;

    let bestScore = 0;


    headers.forEach(
        (value, index) => {

            const text =
                normalizeText(value);


            if (!text) {
                return;
            }


            let score = 0;


            keywords.forEach(
                keyword => {

                    if (
                        text === keyword
                    ) {

                        score += 100;

                    } else if (
                        text.includes(keyword)
                    ) {

                        score += 30;

                    }

                }
            );


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                best = {
                    index,
                    name: value,
                    score
                };

            }

        }
    );


    return best;

}


// ======================================================
// DETECT COLUMNS
// ======================================================

function detectColumns(
    rows,
    headerRow
) {

    if (
        headerRow < 0 ||
        !rows[headerRow]
    ) {

        return null;

    }


    const headers =
        rows[headerRow];


    analyzerLog(
        "Заголовки:",
        headers
    );


    // -----------------------------------------
    // НОМЕНКЛАТУРА
    // -----------------------------------------

    const nameColumn =
        findColumn(
            headers,
            [
                "номенклатура",
                "наименование",
                "товар",
                "название"
            ]
        );


    // -----------------------------------------
    // ВИТРИНА
    // -----------------------------------------

    const displayColumn =
        findColumn(
            headers,
            [
                "витрина",
                "магазин",
                "торговый зал"
            ]
        );


    // -----------------------------------------
    // СКЛАД
    // -----------------------------------------

    const warehouseColumn =
        findColumn(
            headers,
            [
                "склад",
                "остаток склад",
                "складской остаток"
            ]
        );


    // -----------------------------------------
    // ВСЕ ОСТАТКОВЫЕ КОЛОНКИ
    // -----------------------------------------

    const stockColumns = [];


    headers.forEach(
        (value, index) => {

            const text =
                normalizeText(value);


            if (!text) {
                return;
            }


            if (
                text.includes("склад") ||
                text.includes("остаток") ||
                text.includes("витрин") ||
                text.includes("магазин")
            ) {

                stockColumns.push({
                    index,
                    name: value
                });

            }

        }
    );


    const result = {

        headerRow,

        nameColumn:
            nameColumn
                ? nameColumn.index
                : -1,

        nameColumnName:
            nameColumn
                ? nameColumn.name
                : "",

        displayColumn:
            displayColumn
                ? displayColumn.index
                : -1,

        displayColumnName:
            displayColumn
                ? displayColumn.name
                : "",

        warehouseColumn:
            warehouseColumn
                ? warehouseColumn.index
                : -1,

        warehouseColumnName:
            warehouseColumn
                ? warehouseColumn.name
                : "",

        stockColumns

    };


    analyzerLog(
        "ОПРЕДЕЛЁННАЯ СТРУКТУРА:",
        result
    );


    return result;

}


// ======================================================
// COLUMN QUALITY
// ======================================================
//
// Проверяем не просто наличие названия колонки,
// а реальные значения ниже.
//
// ======================================================

function evaluateColumn(
    rows,
    headerRow,
    columnIndex
) {

    if (
        columnIndex < 0
    ) {

        return {
            numeric: 0,
            text: 0,
            empty: 0,
            samples: []
        };

    }


    let numeric = 0;
    let text = 0;
    let empty = 0;

    const samples = [];


    const end =
        Math.min(
            rows.length,
            headerRow + 101
        );


    for (
        let i = headerRow + 1;
        i < end;
        i++
    ) {

        const value =
            rows[i]?.[columnIndex];


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            empty++;

            continue;

        }


        if (
            Number.isFinite(
                value
            )
        ) {

            numeric++;

        } else {

            const parsed =
                toNumber(value);


            if (
                parsed !== 0 ||
                String(value).trim() === "0"
            ) {

                numeric++;

            } else {

                text++;

            }

        }


        if (
            samples.length < 5
        ) {

            samples.push(
                value
            );

        }

    }


    return {
        numeric,
        text,
        empty,
        samples
    };

}


// ======================================================
// VALIDATE STRUCTURE
// ======================================================

function validateColumns(
    rows,
    columns
) {

    const report = {

        valid: true,
        reasons: []

    };


    if (
        !columns ||
        columns.nameColumn < 0
    ) {

        report.valid = false;

        report.reasons.push(
            "Не найдена колонка номенклатуры."
        );

        return report;

    }


    const nameQuality =
        evaluateColumn(
            rows,
            columns.headerRow,
            columns.nameColumn
        );


    if (
        nameQuality.text +
        nameQuality.numeric === 0
    ) {

        report.valid = false;

        report.reasons.push(
            "Колонка номенклатуры пустая."
        );

    }


    if (
        columns.displayColumn >= 0
    ) {

        report.displayQuality =
            evaluateColumn(
                rows,
                columns.headerRow,
                columns.displayColumn
            );

    }


    if (
        columns.warehouseColumn >= 0
    ) {

        report.warehouseQuality =
            evaluateColumn(
                rows,
                columns.headerRow,
                columns.warehouseColumn
            );

    }


    analyzerLog(
        "ПРОВЕРКА СТРУКТУРЫ:",
        report
    );


    return report;

}


// ======================================================
// ROW TYPE
// ======================================================

function classifyRow(
    name,
    row,
    columns
) {

    const text =
        normalizeText(name);


    if (!text) {

        return {
            type: "EMPTY"
        };

    }


    const section =
        detectSection(
            text
        );


    if (
        section
    ) {

        return {

            type:
                "SECTION",

            category:
                section

        };

    }


    if (
        isSubgroup(text)
    ) {

        return {

            type:
                "SUBSECTION"

        };

    }


    if (
        isServiceRow(text)
    ) {

        return {

            type:
                "SERVICE"

        };

    }


    if (
        looksLikeProduct(text)
    ) {

        return {

            type:
                "PRODUCT"

        };

    }


    // ------------------------------------------
    // Если строка находится внутри известного
    // раздела, она потенциально товарная.
    // Решение будет принято позже.
    // ------------------------------------------

    return {

        type:
            "UNKNOWN"

    };

}


// ======================================================
// FIND NEXT PRODUCT DISTANCE
// ======================================================

function hasProductAround(
    rows,
    index,
    nameColumn
) {

    const start =
        Math.max(
            0,
            index - 2
        );


    const end =
        Math.min(
            rows.length,
            index + 4
        );


    for (
        let i = start;
        i < end;
        i++
    ) {

        if (
            i === index
        ) {
            continue;
        }


        const name =
            String(
                rows[i]?.[nameColumn] ??
                ""
            ).trim();


        if (
            looksLikeProduct(name)
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// GET STOCK
// ======================================================

function extractStock(
    row,
    columns
) {

    let display = 0;
    let warehouse = 0;


    // -----------------------------------------
    // Если есть конкретная колонка витрины
    // -----------------------------------------

    if (
        columns.displayColumn >= 0
    ) {

        display =
            Math.max(
                0,
                toNumber(
                    row[
                        columns.displayColumn
                    ]
                )
            );

    }


    // -----------------------------------------
    // Если есть конкретная колонка склада
    // -----------------------------------------

    if (
        columns.warehouseColumn >= 0
    ) {

        warehouse =
            Math.max(
                0,
                toNumber(
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
            display +
            warehouse

    };

}


// ======================================================
// CATEGORY DECISION
// ======================================================

function determineProductCategory(
    name,
    currentCategory
) {

    // Сначала название.
    //
    // Это важно:
    //
    // если мы находимся в разделе
    // "Смартфоны", но название явно
    // говорит "планшет", товар не должен
    // стать смартфоном.

    const direct =
        categoryFromName(
            name
        );


    if (
        direct
    ) {

        return direct;

    }


    // Затем контекст раздела.

    if (
        currentCategory
    ) {

        return currentCategory;

    }


    return "Другое";

}


// ======================================================
// ANALYZE ROWS
// ======================================================

function analyzeRows(
    rows,
    columns
) {

    const analysis = {

        rows: [],

        statistics: {

            EMPTY: 0,
            SECTION: 0,
            SUBSECTION: 0,
            PRODUCT: 0,
            SERVICE: 0,
            UNKNOWN: 0

        },

        categories: {},

        sections: []

    };


    let currentCategory =
        null;


    let productNumber =
        1;


    for (
        let i = columns.headerRow + 1;
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


        const classification =
            classifyRow(
                name,
                row,
                columns
            );


        analysis.statistics[
            classification.type
        ]++;


        // -----------------------------------------
        // SECTION
        // -----------------------------------------

        if (
            classification.type ===
            "SECTION"
        ) {

            currentCategory =
                classification.category;


            analysis.sections.push({

                row:
                    i,

                name,

                category:
                    currentCategory

            });


            analysis.rows.push({

                row:
                    i,

                name,

                type:
                    "SECTION",

                category:
                    currentCategory

            });


            continue;

        }


        // -----------------------------------------
        // SUBSECTION
        // -----------------------------------------

        if (
            classification.type ===
            "SUBSECTION"
        ) {

            analysis.rows.push({

                row:
                    i,

                name,

                type:
                    "SUBSECTION",

                category:
                    currentCategory

            });


            continue;

        }


        // -----------------------------------------
        // EMPTY / SERVICE
        // -----------------------------------------

        if (
            classification.type ===
                "EMPTY" ||
            classification.type ===
                "SERVICE"
        ) {

            analysis.rows.push({

                row:
                    i,

                name,

                type:
                    classification.type,

                category:
                    currentCategory

            });


            continue;

        }


        // -----------------------------------------
        // UNKNOWN
        // -----------------------------------------

        if (
            classification.type ===
            "UNKNOWN"
        ) {

            // Если рядом есть реальные товары,
            // а строка находится внутри раздела,
            // оставляем её как потенциальный товар.

            if (
                currentCategory &&
                hasProductAround(
                    rows,
                    i,
                    columns.nameColumn
                )
            ) {

                classification.type =
                    "PRODUCT";

                analysis.statistics.UNKNOWN--;

                analysis.statistics.PRODUCT++;

            } else {

                analysis.rows.push({

                    row:
                        i,

                    name,

                    type:
                        "UNKNOWN",

                    category:
                        currentCategory

                });


                continue;

            }

        }


        // -----------------------------------------
        // PRODUCT
        // -----------------------------------------

        if (
            classification.type ===
            "PRODUCT"
        ) {

            const category =
                determineProductCategory(
                    name,
                    currentCategory
                );


            const stock =
                extractStock(
                    row,
                    columns
                );


            const product = {

                id:
                    productNumber++,

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


            analysis.rows.push({

                row:
                    i,

                name,

                type:
                    "PRODUCT",

                category,

                product

            });


            if (
                !analysis.categories[
                    category
                ]
            ) {

                analysis.categories[
                    category
                ] = 0;

            }


            analysis.categories[
                category
            ]++;

        }

    }


    return analysis;

}


// ======================================================
// SANITY CHECK
// ======================================================

function sanityCheck(
    analysis
) {

    const result = {

        valid:
            true,

        warnings: [],

        errors: []

    };


    const totalProducts =
        analysis.statistics.PRODUCT;


    if (
        totalProducts === 0
    ) {

        result.valid = false;

        result.errors.push(
            "Анализатор не нашёл ни одного товара."
        );

    }


    // -----------------------------------------
    // Проверяем странные количества
    // -----------------------------------------

    let hugeStockCount = 0;


    analysis.rows.forEach(
        item => {

            if (
                item.type !==
                "PRODUCT"
            ) {
                return;
            }


            const product =
                item.product;


            if (
                product.warehouse >
                100000
            ) {

                hugeStockCount++;

            }


            if (
                product.display >
                100000
            ) {

                hugeStockCount++;

            }

        }
    );


    if (
        hugeStockCount > 0
    ) {

        result.valid = false;

        result.errors.push(
            `Обнаружено ${hugeStockCount} подозрительно больших остатков.`
        );

    }


    // -----------------------------------------
    // Слишком много UNKNOWN
    // -----------------------------------------

    const unknown =
        analysis.statistics.UNKNOWN;


    if (
        unknown >
        totalProducts * 0.3
    ) {

        result.warnings.push(
            `Много неопределённых строк: ${unknown}.`
        );

    }


    // -----------------------------------------
    // Проверяем категории
    // -----------------------------------------

    if (
        analysis.categories[
            "Телевизоры"
        ] > 0 &&
        analysis.categories[
            "Телевизоры"
        ] >
        totalProducts * 0.5
    ) {

        result.warnings.push(
            "Слишком большая доля телевизоров."
        );

    }


    if (
        analysis.categories[
            "Смартфоны"
        ] > 0 &&
        analysis.categories[
            "Смартфоны"
        ] >
        totalProducts * 0.8
    ) {

        result.warnings.push(
            "Слишком большая доля смартфонов."
        );

    }


    return result;

}


// ======================================================
// BUILD PRODUCTS
// ======================================================

function buildProducts(
    analysis,
    sanity
) {

    if (
        !sanity.valid
    ) {

        analyzerLog(
            "БАЗА НЕ СОЗДАЁТСЯ.",
            sanity.errors
        );


        return [];

    }


    const result = [];


    analysis.rows.forEach(
        item => {

            if (
                item.type !==
                "PRODUCT"
            ) {

                return;

            }


            if (
                !item.product
            ) {

                return;

            }


            result.push(
                item.product
            );

        }
    );


    return result;

}


// ======================================================
// ANALYSIS REPORT
// ======================================================

function printAnalysisReport(
    rows,
    columns,
    analysis,
    sanity
) {

    console.log(
        "================================================"
    );

    console.log(
        "XIAOMI WEBBASE — АНАЛИЗ ВЫГРУЗКИ 1С"
    );

    console.log(
        "================================================"
    );


    console.log(
        "Всего строк:",
        rows.length
    );


    console.log(
        "Строка заголовков:",
        columns.headerRow
    );


    console.log(
        "Номенклатура:",
        columns.nameColumn,
        columns.nameColumnName
    );


    console.log(
        "Витрина:",
        columns.displayColumn,
        columns.displayColumnName
    );


    console.log(
        "Склад:",
        columns.warehouseColumn,
        columns.warehouseColumnName
    );


    console.log(
        "------------------------------------------------"
    );


    console.log(
        "ТИПЫ СТРОК:"
    );


    console.table(
        analysis.statistics
    );


    console.log(
        "------------------------------------------------"
    );


    console.log(
        "КАТЕГОРИИ:"
    );


    console.table(
        analysis.categories
    );


    console.log(
        "------------------------------------------------"
    );


    console.log(
        "РАЗДЕЛЫ:"
    );


    console.table(
        analysis.sections
    );


    console.log(
        "------------------------------------------------"
    );


    console.log(
        "ПРОВЕРКА:"
    );


    console.log(
        sanity
    );


    console.log(
        "================================================"
    );

}


// ======================================================
// IMPORT FILE
// ======================================================

if (
    fileInput
) {

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
                typeof XLSX ===
                "undefined"
            ) {

                if (importStatus) {

                    importStatus.textContent =
                        "Ошибка: XLSX не загрузился.";

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
                                    type:
                                        "array"
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


                        // ==================================================
                        // ИЩЕМ ЛУЧШИЙ ЛИСТ
                        // ==================================================

                        let selectedSheet =
                            null;

                        let selectedScore =
                            -1;


                        workbook.SheetNames.forEach(
                            sheetName => {

                                const worksheet =
                                    workbook.Sheets[
                                        sheetName
                                    ];


                                const rows =
                                    XLSX.utils.sheet_to_json(
                                        worksheet,
                                        {
                                            header:
                                                1,

                                            defval:
                                                ""
                                        }
                                    );


                                const headerRow =
                                    findHeaderRow(
                                        rows
                                    );


                                if (
                                    headerRow < 0
                                ) {
                                    return;
                                }


                                const score =
                                    scoreHeaderRow(
                                        rows[
                                            headerRow
                                        ]
                                    );


                                if (
                                    score >
                                    selectedScore
                                ) {

                                    selectedScore =
                                        score;

                                    selectedSheet = {

                                        name:
                                            sheetName,

                                        rows,

                                        headerRow

                                    };

                                }

                            }
                        );


                        if (
                            !selectedSheet
                        ) {

                            throw new Error(
                                "Не удалось найти таблицу товаров."
                            );

                        }


                        analyzerLog(
                            "Выбран лист:",
                            selectedSheet.name
                        );


                        const rows =
                            selectedSheet.rows;


                        // ==================================================
                        // КОЛОНКИ
                        // ==================================================

                        const columns =
                            detectColumns(
                                rows,
                                selectedSheet.headerRow
                            );


                        if (
                            !columns
                        ) {

                            throw new Error(
                                "Не удалось определить структуру таблицы."
                            );

                        }


                        // ==================================================
                        // ПРОВЕРКА
                        // ==================================================

                        const columnValidation =
                            validateColumns(
                                rows,
                                columns
                            );


                        if (
                            !columnValidation.valid
                        ) {

                            throw new Error(
                                columnValidation
                                    .reasons
                                    .join(" ")
                            );

                        }


                        // ==================================================
                        // АНАЛИЗ СТРОК
                        // ==================================================

                        if (importStatus) {

                            importStatus.textContent =
                                "Анализирую товары и разделы...";

                        }


                        const analysis =
                            analyzeRows(
                                rows,
                                columns
                            );


                        // ==================================================
                        // SANITY CHECK
                        // ==================================================

                        const sanity =
                            sanityCheck(
                                analysis
                            );


                        // ==================================================
                        // REPORT
                        // ==================================================

                        printAnalysisReport(
                            rows,
                            columns,
                            analysis,
                            sanity
                        );


                        // ==================================================
                        // ПОКАЗЫВАЕМ ПОДРОБНОСТИ
                        // ==================================================

                        console.log(
                            "Первые 30 распознанных строк:"
                        );


                        console.table(
                            analysis.rows.slice(
                                0,
                                30
                            ).map(
                                item => ({

                                    row:
                                        item.row,

                                    type:
                                        item.type,

                                    category:
                                        item.category ||
                                        "",

                                    name:
                                        item.name

                                })
                            )
                        );


                        // ==================================================
                        // СОЗДАЁМ БАЗУ
                        // ==================================================

                        const imported =
                            buildProducts(
                                analysis,
                                sanity
                            );


                        if (
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Анализ завершён, но безопасных товаров не найдено. База не заменена."
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


                        // ==================================================
                        // СОХРАНЕНИЕ
                        // ==================================================

                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify(
                                products
                            )
                        );


                        // ==================================================
                        // РЕНДЕР
                        // ==================================================

                        renderProducts(
                            products
                        );


                        // ==================================================
                        // STATUS
                        // ==================================================

                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Анализировано строк: ${rows.length}. Товаров загружено: ${products.length}.`;

                        }


                        analyzerLog(
                            "ИМПОРТ УСПЕШНО ЗАВЕРШЁН.",
                            products.length
                        );

                    } catch (error) {

                        console.error(
                            "ОШИБКА АНАЛИЗАТОРА:",
                            error
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                "Импорт остановлен: " +
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
                    или категорию.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(
        product => {

            const display =
                toNumber(
                    product.display
                );


            const warehouse =
                toNumber(
                    product.warehouse
                );


            const total =
                display +
                warehouse;


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
                                ${display}
                            </strong>

                        </div>


                        <div class="stock-row">

                            <span>
                                Склад
                            </span>

                            <strong>
                                ${warehouse}
                            </strong>

                        </div>


                        <div class="stock-row stock-total">

                            <span>
                                Всего
                            </span>

                            <strong>
                                ${total}
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


if (
    searchButton
) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                searchProducts();

            }

        }
    );

}


// ======================================================
// CATEGORY FILTER
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


                if (
                    searchInput
                ) {

                    searchInput.value =
                        "";

                }


                if (
                    category ===
                    "Все"
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
                    "Фильтр:",
                    category,
                    filtered.length
                );


                renderProducts(
                    filtered
                );

            }
        );

    });


// ======================================================
// LOAD SAVED
// ======================================================

function loadSavedProducts() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
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


        analyzerLog(
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
// PRODUCT PAGE
// ======================================================

function renderProduct(product) {

    if (!productDetails) {
        return;
    }


    const display =
        toNumber(
            product.display
        );


    const warehouse =
        toNumber(
            product.warehouse
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


                <div class="product-stock">

                    <h2>
                        Наличие
                    </h2>


                    <div class="stock-big-row">

                        <span>
                            Витрина
                        </span>

                        <strong>
                            ${display}
                        </strong>

                    </div>


                    <div class="stock-big-row">

                        <span>
                            Склад
                        </span>

                        <strong>
                            ${warehouse}
                        </strong>

                    </div>


                    <div class="stock-big-row total">

                        <span>
                            Всего
                        </span>

                        <strong>
                            ${display + warehouse}
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

            </div>

        </div>

    `;

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
// INIT
// ======================================================

function initApp() {

    if (
        typeof products ===
        "undefined"
    ) {

        console.error(
            "Массив products не найден."
        );

        return;

    }


    loadSavedProducts();


    analyzerLog(
        "XIAOMI WEBBASE ЗАПУЩЕН"
    );


    analyzerLog(
        "Сохранённых товаров:",
        products.length
    );


    renderProducts(
        products
    );


    renderProductPage();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();

}