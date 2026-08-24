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

const STORAGE_KEY =
    "xiaomiWebBaseProducts";


const CATEGORY_NAMES = [

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
            .replace(/\u00A0/g, " ")
            .replace(/\s/g, "")
            .replace(",", ".");


    if (!text) {
        return 0;
    }


    // Убираем нечисловые символы,
    // кроме точки и минуса.

    text =
        text.replace(
            /[^0-9.-]/g,
            ""
        );


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
        .trim()
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ");

}


// ======================================================
// CLEAN NAME
// ======================================================

function cleanName(value) {

    return String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

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
// LOG
// ======================================================

function analyzerLog(...args) {

    console.log(
        "[1C ANALYZER]",
        ...args
    );

}


// ======================================================
// CATEGORY FROM WORDS
// ======================================================
//
// ВАЖНО:
//
// Здесь НЕТ Redmi.
// Нет Xiaomi.
// Нет Mi Band.
// Нет названий моделей.
//
// Только реальные названия типов товара.
//
// ======================================================

function categoryFromExplicitName(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // --------------------------------------------------
    // АКСЕССУАРЫ
    // --------------------------------------------------

    const accessoryWords = [

        "чехол",
        "стекло",
        "пленка",
        "плёнка",

        "защитная пленка",
        "защитная плёнка",
        "защитное стекло",

        "зарядное устройство",
        "зарядка",
        "зарядный",

        "кабель",

        "ремешок",

        "переходник",

        "держатель",

        "клавиатура",

        "стилус",

        "силиконовый чехол",

        "аксессуар",
        "аксессуары"

    ];


    if (
        accessoryWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        text.includes("наушник") ||
        text.includes("гарнитур")
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТ
    // --------------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("фитнес браслеты")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        text.includes("умные часы") ||
        text.includes("умные час") ||
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("смарт-час")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // СМАРТФОН
    // --------------------------------------------------

    if (
        text.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТ
    // --------------------------------------------------

    if (
        text.includes("планшет")
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОР
    // --------------------------------------------------

    if (
        text.includes("телевизор")
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРА
    // --------------------------------------------------

    if (
        text.includes("камера")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОС
    // --------------------------------------------------

    if (
        text.includes("пылесос")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// SECTION HEADER DETECTOR
// ======================================================
//
// Примеры:
//
// 01 смартфоны Xiaomi 71
// 17 планшеты 23
// Умные часы 50
// Фитнес-браслеты 20
//
// Такие строки НЕ являются товарами.
//
// ======================================================

function detectSectionHeader(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // --------------------------------------------------
    // Удаляем начальный номер
    // --------------------------------------------------

    let clean =
        text.replace(
            /^\d+\s*/,
            ""
        );


    // --------------------------------------------------
    // Удаляем конечное количество
    // --------------------------------------------------

    clean =
        clean.replace(
            /\s+\d+\s*$/,
            ""
        );


    clean =
        clean
            .replace(
                /\s*[-–—:]\s*$/,
                ""
            )
            .trim();


    // --------------------------------------------------
    // СМАРТФОНЫ
    // --------------------------------------------------

    if (
        /\bсмартфон(ы)?\b/.test(clean)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
    // --------------------------------------------------

    if (
        /\bпланшет(ы)?\b/.test(clean)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // ЧАСЫ
    // --------------------------------------------------

    if (
        clean.includes("умные часы") ||
        clean.includes("смарт часы") ||
        clean.includes("смарт-часы")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // БРАСЛЕТЫ
    // --------------------------------------------------

    if (
        clean.includes("фитнес браслет") ||
        clean.includes("фитнес-браслет")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        /^наушник/.test(clean)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ТВ
    // --------------------------------------------------

    if (
        /^телевизор/.test(clean)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        /^камер/.test(clean)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        /^пылесос/.test(clean)
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // АКСЕССУАРЫ
    // --------------------------------------------------

    if (
        /^аксессуар/.test(clean)
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
        "остаток",
        "остатки",
        "номенклатура",
        "товары",
        "товар"

    ];


    if (
        exact.includes(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// SUBGROUP
// ======================================================
//
// НЕ товар:
//
// Для Redmi Note 15
// Для Redmi Pad 2
// Аксессуары для Redmi
//
// ======================================================

function isSubgroup(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    if (
        /^для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^аксессуары\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^чехлы\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^стекла\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^пленки\s+для\s+/.test(text)
    ) {

        return true;

    }


    if (
        /^плёнки\s+для\s+/.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// STRUCTURAL ROW
// ======================================================
//
// Дополнительная защита.
//
// Строка вида:
//
// 01 смартфоны Xiaomi 71
//
// должна быть отброшена даже если предыдущий
// анализатор ошибся.
//
// ======================================================

function looksLikeStructuralRow(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    // Номер + слова + количество

    if (
        /^\d+\s+.+\s+\d+\s*$/.test(text)
    ) {

        if (
            detectSectionHeader(text)
        ) {

            return true;

        }

    }


    // Категория + количество

    if (
        /\s+\d+\s*$/.test(text)
    ) {

        if (
            detectSectionHeader(text)
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// FIND COLUMNS
// ======================================================
//
// Мы НЕ привязываемся жёстко к A/E/G/H.
//
// Сначала ищем названия колонок.
//
// ======================================================

function findColumns(rows) {

    let headerRow = -1;

    let nameColumn = -1;

    let displayColumn = -1;

    let warehouseColumn = -1;

    let totalColumn = -1;


    const maxRows =
        Math.min(
            rows.length,
            80
        );


    analyzerLog(
        "Ищу структуру колонок..."
    );


    for (
        let r = 0;
        r < maxRows;
        r++
    ) {

        const row =
            rows[r];


        if (
            !Array.isArray(row)
        ) {

            continue;

        }


        for (
            let c = 0;
            c < row.length;
            c++
        ) {

            const text =
                normalizeText(
                    row[c]
                );


            if (!text) {
                continue;
            }


            // ------------------------------------------
            // НОМЕНКЛАТУРА
            // ------------------------------------------

            if (
                text === "номенклатура" ||
                text.includes("номенклатура")
            ) {

                nameColumn = c;
                headerRow = r;

            }


            // ------------------------------------------
            // ВИТРИНА
            // ------------------------------------------

            if (
                text.includes("витрина")
            ) {

                displayColumn = c;
                headerRow = r;

            }


            // ------------------------------------------
            // СКЛАД
            // ------------------------------------------

            if (
                text.includes("склад")
            ) {

                // Если уже нашли первый склад,
                // следующий склад оставляем отдельным.

                if (
                    warehouseColumn === -1
                ) {

                    warehouseColumn = c;

                }

            }


            // ------------------------------------------
            // ИТОГО
            // ------------------------------------------

            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = c;

            }

        }

    }


    // ==================================================
    // Если по названиям не нашли склад,
    // пробуем определить числовые колонки.
    // ==================================================

    if (
        displayColumn === -1 ||
        warehouseColumn === -1
    ) {

        analyzerLog(
            "Точные названия остатков не найдены."
        );

        analyzerLog(
            "Запускаю структурный анализ числовых колонок."
        );


        if (
            headerRow >= 0 &&
            Array.isArray(rows[headerRow])
        ) {

            const header =
                rows[headerRow];


            const candidates = [];


            for (
                let c = 0;
                c < header.length;
                c++
            ) {

                let numericCount = 0;


                for (
                    let r = headerRow + 1;
                    r < Math.min(
                        rows.length,
                        headerRow + 100
                    );
                    r++
                ) {

                    const value =
                        rows[r]?.[c];


                    if (
                        value !== "" &&
                        value !== null &&
                        value !== undefined &&
                        Number.isFinite(
                            Number(value)
                        )
                    ) {

                        numericCount++;

                    }

                }


                if (
                    numericCount > 3
                ) {

                    candidates.push({
                        column: c,
                        numericCount
                    });

                }

            }


            analyzerLog(
                "Числовые колонки:",
                candidates
            );


            if (
                displayColumn === -1 &&
                candidates.length >= 1
            ) {

                displayColumn =
                    candidates[0].column;

            }


            if (
                warehouseColumn === -1 &&
                candidates.length >= 2
            ) {

                warehouseColumn =
                    candidates[1].column;

            }

        }

    }


    // ==================================================
    // РЕЗЕРВНАЯ СХЕМА
    // ==================================================

    if (
        nameColumn === -1
    ) {

        nameColumn = 0;

    }


    if (
        displayColumn === -1
    ) {

        displayColumn = 4;

    }


    if (
        warehouseColumn === -1
    ) {

        warehouseColumn = 6;

    }


    if (
        headerRow === -1
    ) {

        headerRow = 0;

    }


    const result = {

        headerRow,
        nameColumn,
        displayColumn,
        warehouseColumn,
        totalColumn

    };


    analyzerLog(
        "СТРУКТУРА КОЛОНОК:",
        result
    );


    return result;

}


// ======================================================
// DETECT PRODUCT ROW
// ======================================================
//
// Здесь самое важное.
//
// Мы НЕ спрашиваем:
// "похоже ли название на Xiaomi?"
//
// Мы спрашиваем:
//
// "похожа ли строка на реальную строку товара?"
//
// ======================================================

function isRealProductRow(
    name,
    row,
    columns
) {

    const text =
        normalizeText(name);


    if (!text) {
        return false;
    }


    // -----------------------------------------------
    // Явные служебные строки
    // -----------------------------------------------

    if (
        isServiceRow(name)
    ) {

        return false;

    }


    // -----------------------------------------------
    // Подгруппа
    // -----------------------------------------------

    if (
        isSubgroup(name)
    ) {

        return false;

    }


    // -----------------------------------------------
    // Раздел
    // -----------------------------------------------

    if (
        detectSectionHeader(name)
    ) {

        return false;

    }


    // -----------------------------------------------
    // Структурная строка
    // -----------------------------------------------

    if (
        looksLikeStructuralRow(name)
    ) {

        return false;

    }


    // -----------------------------------------------
    // Проверяем наличие остатков.
    //
    // НО:
    // товар может иметь 0.
    //
    // Поэтому нулевой остаток НЕ означает,
    // что это не товар.
    // -----------------------------------------------

    const display =
        number(
            row[
                columns.displayColumn
            ]
        );


    const warehouse =
        number(
            row[
                columns.warehouseColumn
            ]
        );


    const hasStock =
        display !== 0 ||
        warehouse !== 0;


    // -----------------------------------------------
    // Явный тип товара
    // -----------------------------------------------

    const explicit =
        categoryFromExplicitName(name);


    if (
        explicit &&
        explicit !== "Аксессуары"
    ) {

        return true;

    }


    // -----------------------------------------------
    // Аксессуары.
    //
    // Если есть остаток — почти наверняка товар.
    // -----------------------------------------------

    if (
        explicit === "Аксессуары" &&
        hasStock
    ) {

        return true;

    }


    // -----------------------------------------------
    // Если строка содержит типичный SKU/модель,
    // но не является разделом.
    // -----------------------------------------------

    if (
        text.length > 5 &&
        !looksLikeStructuralRow(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// DETECT CATEGORY
// ======================================================
//
// Приоритет:
//
// 1. Явный тип товара
// 2. Текущий раздел 1С
// 3. Аксессуары
// 4. Другое
//
// ======================================================

function detectProductCategory(
    name,
    currentSection
) {

    const explicit =
        categoryFromExplicitName(
            name
        );


    // -----------------------------------------------
    // Если в самом названии написано
    // "смартфон", "планшет" и т.д.
    // -----------------------------------------------

    if (
        explicit &&
        explicit !== "Аксессуары"
    ) {

        return explicit;

    }


    // -----------------------------------------------
    // Аксессуары
    // -----------------------------------------------

    if (
        explicit === "Аксессуары"
    ) {

        return "Аксессуары";

    }


    // -----------------------------------------------
    // Главное:
    // наследуем раздел 1С
    // -----------------------------------------------

    if (
        currentSection
    ) {

        return currentSection;

    }


    return "Другое";

}


// ======================================================
// CREATE PRODUCT
// ======================================================

function createProduct(
    name,
    category,
    display,
    warehouse,
    id
) {

    return {

        id,

        name:
            cleanName(name),

        category,

        memory:
            "",

        color:
            "",

        display:
            Math.max(
                0,
                display
            ),

        warehouse:
            Math.max(
                0,
                warehouse
            ),

        quantity:
            Math.max(
                0,
                display
            ) +
            Math.max(
                0,
                warehouse
            ),

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

function analyze1C(rows) {

    const result = [];

    const columns =
        findColumns(rows);


    let currentSection =
        null;


    let productId =
        1;


    const analysis = {

        sections: [],

        skipped: [],

        products: []

    };


    analyzerLog(
        "===================================="
    );


    analyzerLog(
        "НАЧАЛО АНАЛИЗА ВЫГРУЗКИ"
    );


    analyzerLog(
        "Строк в Excel:",
        rows.length
    );


    analyzerLog(
        "===================================="
    );


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


        const rawName =
            row[
                columns.nameColumn
            ];


        const name =
            cleanName(
                rawName
            );


        if (!name) {

            continue;

        }


        // ==================================================
        // 1. ПРОБУЕМ НАЙТИ НОВЫЙ РАЗДЕЛ
        // ==================================================

        const section =
            detectSectionHeader(
                name
            );


        if (
            section
        ) {

            currentSection =
                section;


            analysis.sections.push({

                row: i + 1,

                sourceName: name,

                category: section

            });


            analyzerLog(
                `РАЗДЕЛ [${i + 1}]:`,
                name,
                "→",
                section
            );


            continue;

        }


        // ==================================================
        // 2. СЛУЖЕБНАЯ СТРОКА
        // ==================================================

        if (
            isServiceRow(name)
        ) {

            analysis.skipped.push({

                row: i + 1,

                name,

                reason:
                    "служебная строка"

            });


            continue;

        }


        // ==================================================
        // 3. ПОДГРУППА
        // ==================================================

        if (
            isSubgroup(name)
        ) {

            analysis.skipped.push({

                row: i + 1,

                name,

                reason:
                    "подгруппа"

            });


            analyzerLog(
                "ПОДГРУППА:",
                name
            );


            continue;

        }


        // ==================================================
        // 4. ПРОВЕРКА ТОВАРА
        // ==================================================

        const realProduct =
            isRealProductRow(
                name,
                row,
                columns
            );


        if (!realProduct) {

            analysis.skipped.push({

                row: i + 1,

                name,

                reason:
                    "не похожа на товар"

            });


            analyzerLog(
                "ПРОПУСК:",
                name
            );


            continue;

        }


        // ==================================================
        // 5. ОСТАТКИ
        // ==================================================

        const display =
            number(
                row[
                    columns.displayColumn
                ]
            );


        const warehouse =
            number(
                row[
                    columns.warehouseColumn
                ]
            );


        // ==================================================
        // 6. КАТЕГОРИЯ
        // ==================================================

        const category =
            detectProductCategory(
                name,
                currentSection
            );


        // ==================================================
        // 7. СОЗДАЁМ
        // ==================================================

        const product =
            createProduct(
                name,
                category,
                display,
                warehouse,
                productId++
            );


        result.push(
            product
        );


        analysis.products.push({

            row: i + 1,

            name,

            category,

            display,

            warehouse

        });


        analyzerLog(
            "ТОВАР:",
            name,
            "→",
            category
        );

    }


    // ==================================================
    // СТАТИСТИКА
    // ==================================================

    const stats = {};


    CATEGORY_NAMES.forEach(
        category => {

            stats[category] =
                result.filter(
                    product =>
                        product.category ===
                        category
                ).length;

        }
    );


    analysis.stats =
        stats;


    analyzerLog(
        "===================================="
    );


    analyzerLog(
        "РЕЗУЛЬТАТ АНАЛИЗА"
    );


    analyzerLog(
        "Всего товаров:",
        result.length
    );


    analyzerLog(
        "Категории:",
        stats
    );


    analyzerLog(
        "Разделов найдено:",
        analysis.sections.length
    );


    analyzerLog(
        "Строк пропущено:",
        analysis.skipped.length
    );


    analyzerLog(
        "===================================="
    );


    console.table(
        analysis.sections
    );


    console.table(
        analysis.products
    );


    return {

        products:
            result,

        analysis,

        columns

    };

}


// ======================================================
// PREPARE EXISTING PRODUCT
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
        cleanName(
            prepared.name ||
            "Без названия"
        );


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


    if (
        !CATEGORY_NAMES.includes(
            prepared.category
        )
    ) {

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
        typeof products === "undefined" ||
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


            if (
                prepared
            ) {

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
            display +
            warehouse

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
                    normalizeText(

                        `${product.id || ""}
                         ${product.name || ""}
                         ${product.category || ""}
                         ${product.memory || ""}
                         ${product.color || ""}
                         ${product.description || ""}
                         ${product.tip || ""}`

                    );


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
                        ${escapeHTML(
                            key
                        )}
                    </span>

                    <strong>
                        ${escapeHTML(
                            value
                        )}
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
                        STORAGE_KEY,
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
// IMPORT STATUS
// ======================================================

function showImportStatus(
    text
) {

    if (
        importStatus
    ) {

        importStatus.textContent =
            text;

    }

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

                showImportStatus(
                    "Ошибка: библиотека XLSX не загрузилась."
                );

                return;

            }


            showImportStatus(
                "Анализирую выгрузку 1С..."
            );


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


                        // ==================================================
                        // ИЩЕМ ЛИСТ
                        // ==================================================

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


                        analyzerLog(
                            "Лист:",
                            sheetName
                        );


                        analyzerLog(
                            "Строк:",
                            rows.length
                        );


                        // ==================================================
                        // АНАЛИЗ
                        // ==================================================

                        const analyzed =
                            analyze1C(
                                rows
                            );


                        const imported =
                            analyzed.products;


                        if (
                            !Array.isArray(
                                imported
                            ) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Анализатор не нашёл ни одного товара."
                            );

                        }


                        // ==================================================
                        // ПОЛНОСТЬЮ ЗАМЕНЯЕМ БАЗУ
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
                        // СОХРАНЕНИЕ
                        // ==================================================

                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify(
                                products
                            )
                        );


                        // ==================================================
                        // ВЫВОД
                        // ==================================================

                        renderProducts(
                            products
                        );


                        // ==================================================
                        // СТАТИСТИКА
                        // ==================================================

                        const stats =
                            analyzed.analysis.stats;


                        const summary =
                            CATEGORY_NAMES
                                .map(
                                    category =>
                                        `${category}: ${stats[category]}`
                                )
                                .join(
                                    " | "
                                );


                        showImportStatus(

                            `Готово. Загружено товаров: ${products.length}. ${summary}`

                        );


                        console.log(
                            "===================================="
                        );


                        console.log(
                            "ИМПОРТ ЗАВЕРШЁН"
                        );


                        console.log(
                            "Всего:",
                            products.length
                        );


                        console.table(
                            stats
                        );


                        console.log(
                            "===================================="
                        );

                    } catch (error) {

                        console.error(
                            "ОШИБКА АНАЛИЗАТОРА:",
                            error
                        );


                        showImportStatus(

                            "Ошибка загрузки: " +
                            error.message

                        );

                    }

                };


            reader.onerror =
                function () {

                    showImportStatus(
                        "Не удалось прочитать файл."
                    );

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
            "Сохранённая база:",
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
        "===================================="
    );


    console.log(
        "XIAOMI WEBBASE"
    );


    console.log(
        "Товаров:",
        products.length
    );


    CATEGORY_NAMES.forEach(
        category => {

            console.log(
                category + ":",
                products.filter(
                    product =>
                        product.category ===
                        category
                ).length
            );

        }
    );


    console.log(
        "===================================="
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