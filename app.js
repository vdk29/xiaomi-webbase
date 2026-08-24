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
// SETTINGS
// ======================================================

const STORAGE_KEY =
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
            .replace(/\s/g, "")
            .replace(",", ".");

    if (!text) {
        return 0;
    }

    // Иногда Excel может передать числа
    // с лишними символами.
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
// ACCESSORIES
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const words = [

        "чехол",
        "case",

        "стекло",
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "пленка",
        "плёнка",
        "glass",

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
        "колонка",
        "колонки",
        "speaker",

        "power bank",
        "powerbank",
        "пауэрбанк",

        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// CATEGORY FROM TEXT
// ======================================================

function categoryFromText(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // -----------------------------------------------
    // Смартфоны
    // -----------------------------------------------

    if (
        text.includes("смартфон") ||
        text.includes("смартфоны")
    ) {

        return "Смартфоны";

    }


    // -----------------------------------------------
    // Планшеты
    // -----------------------------------------------

    if (
        text.includes("планшет") ||
        text.includes("планшеты")
    ) {

        if (
            text.includes("чехол") ||
            text.includes("стекло") ||
            text.includes("пленка") ||
            text.includes("пленки") ||
            text.includes("для планшета")
        ) {

            return null;

        }

        return "Планшеты";

    }


    // -----------------------------------------------
    // Часы
    // -----------------------------------------------

    if (
        text.includes("умные часы") ||
        text.includes("смарт часы") ||
        text.includes("смарт-часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    // -----------------------------------------------
    // Браслеты
    // -----------------------------------------------

    if (
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслеты") ||
        text.includes("фитнес-браслеты") ||
        text.includes("smart band")
    ) {

        return "Фитнес-браслеты";

    }


    // -----------------------------------------------
    // Наушники
    // -----------------------------------------------

    if (
        text.includes("наушник") ||
        text.includes("earbuds") ||
        text.includes("headphones")
    ) {

        return "Наушники";

    }


    // -----------------------------------------------
    // Телевизоры
    // -----------------------------------------------

    if (
        text.includes("телевизор") ||
        text.includes("телевизоры")
    ) {

        return "Телевизоры";

    }


    // -----------------------------------------------
    // Камеры
    // -----------------------------------------------

    if (
        text.includes("камера") ||
        text.includes("камеры")
    ) {

        return "Камеры";

    }


    // -----------------------------------------------
    // Пылесосы
    // -----------------------------------------------

    if (
        text.includes("пылесос") ||
        text.includes("пылесосы")
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// CATEGORY HEADER
// ======================================================
//
// Очень важная функция.
//
// Она ловит:
//
// 01 Смартфоны 71
// 02 Планшеты 17
// 03 Умные часы 50
// Фитнес-браслеты 12
//
// Но НЕ ловит:
//
// Redmi Note 15
// Redmi Pad 2
// Xiaomi Smart Band 11
//
// ======================================================

function detectSectionHeader(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return null;
    }


    // Сначала исключаем аксессуары.
    if (
        isAccessoryName(text)
    ) {

        return null;

    }


    const category =
        categoryFromText(text);


    if (!category) {
        return null;
    }


    // -----------------------------------------------
    // Явный номер раздела
    //
    // 01 смартфоны 71
    // 17 планшеты 13
    // -----------------------------------------------

    if (
        /^\d+\s+/.test(text)
    ) {

        return category;

    }


    // -----------------------------------------------
    // Название + количество
    //
    // Смартфоны 71
    // Планшеты 17
    // Умные часы 50
    // -----------------------------------------------

    if (
        /\s+\d+\s*$/.test(text)
    ) {

        return category;

    }


    // -----------------------------------------------
    // Чистое название
    // -----------------------------------------------

    const exact = [

        "смартфоны",
        "смартфон",

        "планшеты",
        "планшет",

        "умные часы",
        "смарт часы",
        "смарт-часы",

        "фитнес браслеты",
        "фитнес-браслеты",
        "фитнес браслет",
        "фитнес-браслет",

        "наушники",

        "телевизоры",
        "телевизор",

        "камеры",
        "камера",

        "пылесосы",
        "пылесос",

        "аксессуары"

    ];


    if (
        exact.includes(text)
    ) {

        return category;

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


    const service = [

        "итого",
        "всего",
        "остаток",
        "остатки",

        "количество",

        "пф",

        "служебная",
        "служебные"

    ];


    if (
        service.includes(text)
    ) {

        return true;

    }


    // Строки "Итого ..." тоже пропускаем.

    if (
        text.startsWith("итого ")
    ) {

        return true;

    }


    if (
        text.startsWith("всего ")
    ) {

        return true;

    }


    return false;

}


// ======================================================
// SUBGROUP
// ======================================================
//
// Не товар:
//
// Для Redmi Note 15
// Для Redmi Pad 2
// Для Xiaomi Smart Band
//
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

        /^аксессуары\s+для\s+/,

        /^аксессуары\s+к\s+/,

        /^чехлы\s+для\s+/,

        /^стекла\s+для\s+/,

        /^стекло\s+для\s+/,

        /^пленки\s+для\s+/,

        /^плёнки\s+для\s+/,

        /^ремешки\s+для\s+/

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}


// ======================================================
// ROW HAS STOCK DATA
// ======================================================

function rowHasStockData(
    row,
    columns
) {

    const values = [

        row[columns.stock1],
        row[columns.stock2],
        row[columns.total]

    ];


    return values.some(
        value => {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return false;

            }

            const text =
                String(value).trim();


            if (!text) {
                return false;
            }


            // Если это число — данные есть.

            const parsed =
                number(value);


            return Number.isFinite(
                parsed
            );

        }
    );

}


// ======================================================
// FIND HEADER
// ======================================================
//
// Мы НЕ ищем "Витрина".
//
// Ищем именно:
// Номенклатура
// Склад ТЦ Европолис
// Склад ТЦ Европолис ОВ
// Итого
//
// ======================================================

function find1CStructure(rows) {

    let headerRow = -1;

    let nameColumn = -1;

    let stock1 = -1;

    let stock2 = -1;

    let total = -1;


    const limit =
        Math.min(
            rows.length,
            30
        );


    // ==================================================
    // ШАГ 1
    // Ищем "Номенклатура"
    // ==================================================

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

                headerRow =
                    i;

                nameColumn =
                    j;

                break;

            }

        }


        if (
            headerRow !== -1
        ) {

            break;

        }

    }


    // ==================================================
    // Если нашли строку 5 / индекс 4,
    // ищем остальные колонки
    // ==================================================

    if (
        headerRow !== -1
    ) {

        const row =
            rows[headerRow];


        for (
            let j = 0;
            j < row.length;
            j++
        ) {

            const text =
                normalizeText(
                    row[j]
                );


            // ------------------------------------------
            // Первый склад
            // ------------------------------------------

            if (
                text.includes(
                    "склад тц европолис"
                ) &&
                !text.includes("ов")
            ) {

                stock1 = j;

            }


            // ------------------------------------------
            // Второй склад ОВ
            // ------------------------------------------

            if (
                text.includes(
                    "склад тц европолис ов"
                )
            ) {

                stock2 = j;

            }


            // ------------------------------------------
            // Итого
            // ------------------------------------------

            if (
                text === "итого" ||
                text.startsWith("итого")
            ) {

                total = j;

            }

        }

    }


    // ==================================================
    // В твоей выгрузке структура:
    //
    // A = Номенклатура
    // B = Склад ТЦ Европолис
    // C = Склад ТЦ Европолис ОВ
    // D = Итого
    //
    // Но fallback используется ТОЛЬКО если
    // заголовки реально не нашли.
    // ==================================================

    if (
        nameColumn === -1
    ) {

        throw new Error(
            "Не найдена колонка «Номенклатура»."
        );

    }


    if (
        stock1 === -1 ||
        stock2 === -1
    ) {

        throw new Error(
            "Не удалось найти два склада: «Склад ТЦ Европолис» и «Склад ТЦ Европолис ОВ»."
        );

    }


    // Если Итого не нашли,
    // его можно вычислить самостоятельно.

    return {

        headerRow,

        nameColumn,

        stock1,

        stock2,

        total

    };

}


// ======================================================
// ANALYZE ROW
// ======================================================

function analyzeRow(
    row,
    index,
    structure,
    currentCategory
) {

    const name =
        String(
            row[
                structure.nameColumn
            ] ?? ""
        ).trim();


    if (!name) {

        return {

            type: "empty",

            category:
                currentCategory

        };

    }


    // ==================================================
    // SECTION
    // ==================================================

    const section =
        detectSectionHeader(
            name
        );


    if (section) {

        return {

            type: "section",

            category: section,

            name

        };

    }


    // ==================================================
    // SERVICE
    // ==================================================

    if (
        isServiceRow(name)
    ) {

        return {

            type: "service",

            category:
                currentCategory,

            name

        };

    }


    // ==================================================
    // SUBGROUP
    // ==================================================

    if (
        isSubGroup(name)
    ) {

        return {

            type: "subgroup",

            category:
                currentCategory,

            name

        };

    }


    // ==================================================
    // ACCESSORY
    // ==================================================

    if (
        isAccessoryName(name)
    ) {

        return {

            type: "product",

            category:
                "Аксессуары",

            name

        };

    }


    // ==================================================
    // EXPLICIT PRODUCT CATEGORY
    // ==================================================

    const explicitCategory =
        categoryFromText(name);


    // ВАЖНО:
    //
    // Если в названии есть "смартфон",
    // это товар смартфон.
    //
    // Но если название просто "Redmi Note 15",
    // категория берётся из текущего раздела.
    //

    if (explicitCategory) {

        return {

            type: "product",

            category:
                explicitCategory,

            name

        };

    }


    // ==================================================
    // STOCK DATA
    // ==================================================

    const hasStock =
        rowHasStockData(
            row,
            structure
        );


    // ==================================================
    // НЕТ ОСТАТКОВ
    //
    // Очень важная защита от:
    //
    // Redmi Note 15
    // Redmi Pad 2
    // Mi Band 11
    //
    // Если строка сама не содержит
    // остатков B/C/D — считаем её
    // заголовком/группой.
    // ==================================================

    if (
        !hasStock
    ) {

        return {

            type: "group",

            category:
                currentCategory,

            name

        };

    }


    // ==================================================
    // РЕАЛЬНЫЙ ТОВАР
    // ==================================================

    return {

        type: "product",

        category:
            currentCategory ||
            "Другое",

        name

    };

}


// ======================================================
// PARSE 1C
// ======================================================

function parse1CData(rows) {

    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        throw new Error(
            "Выгрузка пустая."
        );

    }


    const structure =
        find1CStructure(
            rows
        );


    console.log(
        "========================================"
    );

    console.log(
        "АНАЛИЗАТОР 1С"
    );

    console.log(
        "========================================"
    );

    console.log(
        "Строк всего:",
        rows.length
    );

    console.log(
        "Строка заголовков:",
        structure.headerRow + 1
    );

    console.log(
        "Номенклатура:",
        structure.nameColumn
    );

    console.log(
        "Склад 1:",
        structure.stock1
    );

    console.log(
        "Склад 2:",
        structure.stock2
    );

    console.log(
        "Итого:",
        structure.total
    );


    const result = [];


    let currentCategory =
        null;


    let productId =
        1;


    const stats = {

        sections: 0,

        groups: 0,

        subgroups: 0,

        services: 0,

        products: 0

    };


    const categoryStats = {};


    // ==================================================
    // ПРОХОДИМ ПО СТРОКАМ
    // ==================================================

    for (
        let i =
            structure.headerRow + 1;

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


        const analyzed =
            analyzeRow(
                row,
                i,
                structure,
                currentCategory
            );


        // ==================================================
        // SECTION
        // ==================================================

        if (
            analyzed.type ===
            "section"
        ) {

            currentCategory =
                analyzed.category;


            stats.sections++;


            console.log(
                `РАЗДЕЛ [${i + 1}]`,
                analyzed.name,
                "→",
                currentCategory
            );


            continue;

        }


        // ==================================================
        // EVERYTHING THAT IS NOT PRODUCT
        // ==================================================

        if (
            analyzed.type !==
            "product"
        ) {

            if (
                analyzed.type ===
                "group"
            ) {

                stats.groups++;


                console.log(
                    `ГРУППА [${i + 1}]`,
                    analyzed.name,
                    "→",
                    currentCategory
                );

            }


            if (
                analyzed.type ===
                "subgroup"
            ) {

                stats.subgroups++;

            }


            if (
                analyzed.type ===
                "service"
            ) {

                stats.services++;

            }


            continue;

        }


        // ==================================================
        // REAL PRODUCT
        // ==================================================

        let warehouse =
            Math.max(
                0,
                number(
                    row[
                        structure.stock1
                    ]
                )
            );


        let display =
            Math.max(
                0,
                number(
                    row[
                        structure.stock2
                    ]
                )
            );


        // ==================================================
        // ИТОГО
        // ==================================================

        let total;


        if (
            structure.total !== -1
        ) {

            const rawTotal =
                row[
                    structure.total
                ];


            if (
                rawTotal !== "" &&
                rawTotal !== null &&
                rawTotal !== undefined
            ) {

                total =
                    Math.max(
                        0,
                        number(
                            rawTotal
                        )
                    );

            }

        }


        // Если D отсутствует —
        // считаем самостоятельно.

        if (
            total === undefined
        ) {

            total =
                warehouse +
                display;

        }


        // ==================================================
        // КАТЕГОРИЯ
        // ==================================================

        let category =
            analyzed.category;


        if (
            !category
        ) {

            category =
                "Другое";

        }


        // ==================================================
        // PRODUCT
        // ==================================================

        const product = {

            id:
                productId++,

            name:
                analyzed.name,

            category,

            memory:
                "",

            color:
                "",

            // B = склад
            warehouse,

            // C = склад ОВ / витрина
            display,

            // D = Итого
            quantity:
                total,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        result.push(
            product
        );


        stats.products++;


        if (
            !categoryStats[category]
        ) {

            categoryStats[category] =
                0;

        }


        categoryStats[category]++;


        console.log(
            `ТОВАР [${i + 1}]`,
            analyzed.name,
            "→",
            category,
            "| B:",
            warehouse,
            "| C:",
            display,
            "| D:",
            total
        );

    }


    // ==================================================
    // ОТЧЁТ
    // ==================================================

    console.log(
        "========================================"
    );

    console.log(
        "РЕЗУЛЬТАТ АНАЛИЗА"
    );

    console.log(
        "========================================"
    );

    console.log(
        "Разделов:",
        stats.sections
    );

    console.log(
        "Групп:",
        stats.groups
    );

    console.log(
        "Подгрупп:",
        stats.subgroups
    );

    console.log(
        "Служебных строк:",
        stats.services
    );

    console.log(
        "РЕАЛЬНЫХ ТОВАРОВ:",
        stats.products
    );

    console.log(
        "Категории:",
        categoryStats
    );

    console.log(
        "========================================"
    );


    return result;

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
        number(
            prepared.quantity
        );


    if (
        !prepared.category
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
// ESCAPE PRODUCT
// ======================================================

function renderProducts(
    list = products
) {

    if (
        !productsList
    ) {

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

    if (
        !searchInput
    ) {

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


                if (
                    searchInput
                ) {

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

    if (
        !productDetails
    ) {

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


    if (
        !product
    ) {

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

    if (
        !productDetails
    ) {

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
                            STORAGE_KEY,
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


            if (
                fileName
            ) {

                fileName.textContent =
                    file.name;

            }


            if (
                typeof XLSX ===
                "undefined"
            ) {

                if (
                    importStatus
                ) {

                    importStatus.textContent =
                        "Ошибка: XLSX не загрузился.";

                }

                return;

            }


            if (
                importStatus
            ) {

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
                            "========================================"
                        );

                        console.log(
                            "ФАЙЛ 1С"
                        );

                        console.log(
                            "Лист:",
                            sheetName
                        );

                        console.log(
                            "Всего строк:",
                            rows.length
                        );

                        console.log(
                            "========================================"
                        );


                        // ==================================================
                        // АНАЛИЗ
                        // ==================================================

                        const imported =
                            parse1CData(
                                rows
                            );


                        if (
                            !Array.isArray(
                                imported
                            ) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Анализатор не нашёл ни одного реального товара."
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
                        // СТАТИСТИКА
                        // ==================================================

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


                        const stats = {};


                        categories.forEach(
                            category => {

                                stats[category] =
                                    products.filter(
                                        product =>
                                            product.category ===
                                            category
                                    ).length;

                            }
                        );


                        console.log(
                            "========================================"
                        );

                        console.log(
                            "ИМПОРТ ЗАВЕРШЁН"
                        );

                        console.log(
                            "Всего реальных товаров:",
                            products.length
                        );

                        console.table(
                            stats
                        );

                        console.log(
                            "========================================"
                        );


                        if (
                            importStatus
                        ) {

                            importStatus.innerHTML = `

                                Готово.

                                <strong>
                                    Загружено товаров:
                                    ${products.length}
                                </strong>

                            `;

                        }

                    } catch (error) {

                        console.error(
                            "========================================"
                        );

                        console.error(
                            "ОШИБКА АНАЛИЗАТОРА 1С:",
                            error
                        );

                        console.error(
                            "========================================"
                        );


                        if (
                            importStatus
                        ) {

                            importStatus.textContent =
                                "Ошибка загрузки: " +
                                error.message;

                        }

                    }

                };


            reader.onerror =
                function () {

                    if (
                        importStatus
                    ) {

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


    normalizeProducts();


    console.log(
        "========================================"
    );

    console.log(
        "XIAOMI WEBBASE"
    );

    console.log(
        "Товаров:",
        products.length
    );

    console.log(
        "========================================"
    );


    if (
        productsList
    ) {

        renderProducts(
            products
        );

    }


    if (
        productDetails
    ) {

        renderProductPage();

    }

}


// ======================================================
// START
// ======================================================

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