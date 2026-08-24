// ======================================================
// XIAOMI WEBBASE
// APP.JS
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
// ЧИСЛО
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

    const text =
        String(value)
            .trim()
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
// НОРМАЛИЗАЦИЯ ТЕКСТА
// ======================================================

function normalizeText(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/ё/g, "е")
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
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(product) {

    const category =
        normalizeText(product.category);

    const name =
        normalizeText(product.name);

    const text =
        category + " " + name;


    // --------------------------------------------------
    // СМАРТФОНЫ
    // --------------------------------------------------

    if (
        text.includes("смартфон") ||
        text.includes("smartphone")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
    //
    // Всё, где явно встречается планшет,
    // Redmi Pad или Xiaomi Pad,
    // отправляем сюда.
    //
    // Поэтому:
    //
    // Чехол для планшета
    // Клавиатура для планшета
    // Чехол Redmi Pad
    //
    // тоже попадут в Планшеты.
    // --------------------------------------------------

    if (
        text.includes("планшет") ||
        text.includes("redmi pad") ||
        text.includes("xiaomi pad") ||
        /\bpad\b/.test(text)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("умные часы") ||
        text.includes("смартчас") ||
        text.includes("smart watch") ||
        text.includes("smartwatch") ||
        /\bwatch\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТЫ
    // --------------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("smart band") ||
        text.includes("mi band") ||
        text.includes("mi-band") ||
        /\bband\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        text.includes("наушник") ||
        text.includes("buds") ||
        text.includes("earbuds") ||
        text.includes("headphones")
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОРЫ
    // --------------------------------------------------

    if (
        text.includes("телевизор") ||
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        text.includes("камера") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        text.includes("пылесос") ||
        text.includes("vacuum")
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // ЗАРЯДКИ
    // --------------------------------------------------

    if (
        text.includes("зарядное устройство") ||
        text.includes("зарядка") ||
        text.includes("charger")
    ) {

        return "Зарядки";

    }


    // --------------------------------------------------
    // КАБЕЛИ
    // --------------------------------------------------

    if (
        text.includes("кабель") ||
        text.includes("cable")
    ) {

        return "Кабели";

    }


    // --------------------------------------------------
    // РЕМЕШКИ
    // --------------------------------------------------

    if (
        text.includes("ремешок") ||
        text.includes("strap")
    ) {

        return "Ремешки";

    }


    // --------------------------------------------------
    // ЧЕХЛЫ
    // --------------------------------------------------

    if (
        text.includes("чехол") ||
        text.includes("case")
    ) {

        return "Чехлы";

    }


    // --------------------------------------------------
    // ЗАЩИТНЫЕ СТЕКЛА
    // --------------------------------------------------

    if (
        text.includes("защитное стекло") ||
        text.includes("стекло защитное")
    ) {

        return "Защитные стекла";

    }


    // --------------------------------------------------
    // ОСТАЛЬНОЕ
    // --------------------------------------------------

    return "Другое";

}


// ======================================================
// ОСТАТКИ
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
// ПОДГОТОВКА ТОВАРА
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


    prepared.display =
        Math.max(
            0,
            number(prepared.display)
        );


    prepared.warehouse =
        Math.max(
            0,
            number(prepared.warehouse)
        );


    prepared.quantity =
        prepared.display +
        prepared.warehouse;


    prepared.category =
        detectCategory(
            prepared
        );


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
// НОРМАЛИЗАЦИЯ БАЗЫ
// ======================================================

function normalizeProducts() {

    if (!Array.isArray(products)) {

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
// РЕНДЕР ТОВАРОВ
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

                        ${escapeHTML(product.category)}

                    </div>


                    <div class="product-name">

                        ${escapeHTML(product.name)}

                    </div>


                    ${
                        product.memory ||
                        product.color
                            ? `

                                <div class="product-info">

                                    ${escapeHTML(product.memory || "")}

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${escapeHTML(product.color || "")}

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
// ПОИСК
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
// ПОИСК — КНОПКА
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// ENTER
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                searchProducts();

            }

        }
    );

}


// ======================================================
// ЖИВОЙ ПОИСК
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ======================================================
// КАТЕГОРИИ
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
                        product => {

                            return (
                                product.category ===
                                category
                            );

                        }
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
// СТРАНИЦА ТОВАРА
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
// ХАРАКТЕРИСТИКИ
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
// КАРТОЧКА ТОВАРА
// ======================================================

function renderProduct(product) {

    if (!productDetails) {

        return;

    }


    const stock =
        getStock(product);


    const specsHTML =
        renderSpecs(product);


    productDetails.innerHTML = `

        <div class="product-page">


            <div class="product-page-image">

                <span>
                    Фото товара
                </span>

            </div>


            <div class="product-page-content">


                <div class="product-category">

                    ${escapeHTML(product.category)}

                </div>


                <h1>

                    ${escapeHTML(product.name)}

                </h1>


                ${
                    product.memory
                        ? `

                            <div class="product-memory">

                                ${escapeHTML(product.memory)}

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
                                    ${escapeHTML(product.color)}
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

                        ${
                            escapeHTML(
                                product.description ||
                                "Описание пока не добавлено."
                            )
                        }

                    </p>

                </div>


                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <div class="product-tip">

                    <h2>
                        Подсказка продавцу
                    </h2>


                    <p>

                        ${
                            escapeHTML(
                                product.tip ||
                                "Подсказка пока не добавлена."
                            )
                        }

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
// ИЗМЕНЕНИЕ ОСТАТКА
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
// ПОИСК ЗАГОЛОВКА 1С
// ======================================================
//
// ВАЖНО:
//
// Структура твоей выгрузки:
//
// A = Номенклатура
// B = ...
// C = ...
// D = ...
// E = Склад ТЦ Европолис
// F = ...
// G = Склад ТЦ Европолис ОВ
// H = Итого
//
// Поэтому НЕ вычисляем остатки относительно H.
//
// Берём строго:
//
// E = warehouse
// G = display
// H = НЕ ИСПОЛЬЗУЕМ
//
// ======================================================

function find1CColumns(rows) {

    let headerRow = -1;

    let nameColumn = -1;


    const limit =
        Math.min(
            rows.length,
            50
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

                headerRow = i;

                nameColumn = j;

                break;

            }

        }


        if (
            headerRow !== -1
        ) {

            break;

        }

    }


    if (
        headerRow === -1
    ) {

        console.error(
            "Не найден заголовок Номенклатура."
        );

        return null;

    }


    // --------------------------------------------------
    // Фиксированная структура файла 1С.
    //
    // A = 0
    // E = 4
    // G = 6
    // H = 7
    // --------------------------------------------------

    return {

        headerRow,

        nameColumn,

        warehouseColumn: 4,

        displayColumn: 6,

        totalColumn: 7

    };

}


// ======================================================
// ЯВЛЯЕТСЯ ЛИ СТРОКА РАЗДЕЛОМ
// ======================================================

function isSectionRow(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return true;

    }


    // --------------------------------------------------
    // Разделы вида:
    //
    // 01 Смартфоны
    // 02 Аксессуары
    // --------------------------------------------------

    if (
        /^\d{1,3}\s+/.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ЯВЛЯЕТСЯ ЛИ СТРОКА ГРУППОЙ
// ======================================================

function isModelGroupRow(
    name,
    rows,
    rowIndex,
    nameColumn
) {

    const cleanName =
        normalizeText(name);


    if (!cleanName) {

        return false;

    }


    // --------------------------------------------------
    // Если название длинное — скорее всего это SKU.
    // --------------------------------------------------

    if (
        cleanName.length > 35
    ) {

        return false;

    }


    // --------------------------------------------------
    // Если в названии есть явный тип товара,
    // считаем строку товаром.
    // --------------------------------------------------

    const productWords = [

        "смартфон",
        "планшет",
        "чехол",
        "клавиатур",
        "наушник",
        "камера",
        "телевизор",
        "пылесос",
        "зарядн",
        "кабель",
        "ремешок",
        "браслет",
        "часы",
        "стилус",
        "очиститель",
        "увлажнитель",
        "фен",
        "бритв",
        "весы",
        "лампа",
        "держатель",
        "адаптер",
        "мышь",
        "монитор",
        "маршрутизатор"

    ];


    for (
        const word of productWords
    ) {

        if (
            cleanName.includes(word)
        ) {

            return false;

        }

    }


    // --------------------------------------------------
    // Проверяем следующие строки.
    //
    // Если следующая строка содержит название
    // текущей группы и заметно длиннее —
    // текущая строка является группой.
    // --------------------------------------------------

    const maxLookAhead =
        Math.min(
            rows.length,
            rowIndex + 8
        );


    for (
        let i = rowIndex + 1;
        i < maxLookAhead;
        i++
    ) {

        const nextRow =
            rows[i];


        if (
            !Array.isArray(nextRow)
        ) {

            continue;

        }


        const nextName =
            normalizeText(
                nextRow[nameColumn]
            );


        if (!nextName) {

            continue;

        }


        if (
            nextName.includes(cleanName) &&
            nextName.length >
            cleanName.length + 5
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// ПРОВЕРКА — ПОХОЖЕ ЛИ НА НАСТОЯЩИЙ ТОВАР
// ======================================================

function looksLikeProduct(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return false;

    }


    const productWords = [

        "смартфон",
        "планшет",
        "чехол",
        "клавиатур",
        "наушник",
        "buds",
        "камера",
        "телевизор",
        "пылесос",
        "зарядн",
        "зарядка",
        "кабель",
        "ремешок",
        "браслет",
        "часы",
        "watch",
        "band",
        "стилус",
        "очиститель",
        "увлажнитель",
        "фен",
        "бритв",
        "весы",
        "лампа",
        "держатель",
        "адаптер",
        "мышь",
        "монитор",
        "маршрутизатор",
        "клавиатура",
        "колонка",
        "роутер"

    ];


    return productWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// ПАРСЕР 1С
// ======================================================

function parse1CData(rows) {

    const result = [];


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        return result;

    }


    const columns =
        find1CColumns(
            rows
        );


    console.log(
        "================================="
    );

    console.log(
        "СТРУКТУРА 1С"
    );

    console.log(
        "Строка заголовка:",
        columns?.headerRow
    );

    console.log(
        "Название:",
        columns?.nameColumn
    );

    console.log(
        "Склад E:",
        columns?.warehouseColumn
    );

    console.log(
        "Витрина G:",
        columns?.displayColumn
    );

    console.log(
        "Итого H:",
        columns?.totalColumn,
        "(ИГНОРИРУЕТСЯ)"
    );

    console.log(
        "================================="
    );


    if (!columns) {

        return result;

    }


    let productId = 1;


    const start =
        columns.headerRow + 1;


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


        // ------------------------------------------------
        // Название берём только из A / Номенклатура.
        // ------------------------------------------------

        let name =
            row[
                columns.nameColumn
            ];


        name =
            String(
                name ?? ""
            ).trim();


        if (!name) {

            continue;

        }


        // ------------------------------------------------
        // Разделы не являются товарами.
        // ------------------------------------------------

        if (
            isSectionRow(name)
        ) {

            continue;

        }


        // ------------------------------------------------
        // Промежуточные группы 1С:
        //
        // 17T
        // 17T Pro
        // Redmi Note 15 Pro
        //
        // не являются товарами.
        // ------------------------------------------------

        if (
            isModelGroupRow(
                name,
                rows,
                i,
                columns.nameColumn
            )
        ) {

            console.log(
                "Группа пропущена:",
                name
            );

            continue;

        }


        // ------------------------------------------------
        // Если строка вообще не похожа на товар,
        // дополнительно проверяем наличие остатков.
        //
        // Это позволяет не тащить служебные строки.
        // ------------------------------------------------

        const rawWarehouse =
            row[
                columns.warehouseColumn
            ];

        const rawDisplay =
            row[
                columns.displayColumn
            ];


        let warehouse =
            number(
                rawWarehouse
            );


        let display =
            number(
                rawDisplay
            );


        warehouse =
            Math.max(
                0,
                warehouse
            );


        display =
            Math.max(
                0,
                display
            );


        // ------------------------------------------------
        // Служебные строки без признаков товара
        // и без остатков пропускаем.
        //
        // Но строки с названием товара всегда сохраняем,
        // даже если остаток 0/0.
        // ------------------------------------------------

        if (
            !looksLikeProduct(name) &&
            warehouse === 0 &&
            display === 0
        ) {

            console.log(
                "Служебная строка пропущена:",
                name
            );

            continue;

        }


        // ------------------------------------------------
        // СОЗДАЁМ ТОВАР
        // ------------------------------------------------

        const product = {

            id:
                productId++,

            name:
                name,

            category:
                "",

            memory:
                "",

            color:
                "",

            // G — ВИТРИНА
            display:
                display,

            // E — СКЛАД
            warehouse:
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


        // ------------------------------------------------
        // Определяем категорию.
        // ------------------------------------------------

        product.category =
            detectCategory(
                product
            );


        result.push(
            product
        );

    }


    console.log(
        "================================="
    );

    console.log(
        "ИМПОРТ 1С"
    );

    console.log(
        "Конечных товаров:",
        result.length
    );


    // --------------------------------------------------
    // Статистика.
    // --------------------------------------------------

    const stats = {};


    result.forEach(
        product => {

            if (
                !stats[product.category]
            ) {

                stats[
                    product.category
                ] = 0;

            }


            stats[
                product.category
            ]++;

        }
    );


    console.log(
        "Категории:",
        stats
    );


    // --------------------------------------------------
    // Показываем несколько первых товаров.
    // --------------------------------------------------

    console.log(
        "Первые товары:"
    );


    result
        .slice(0, 10)
        .forEach(
            product => {

                console.log({

                    name:
                        product.name,

                    warehouse:
                        product.warehouse,

                    display:
                        product.display,

                    total:
                        product.quantity,

                    category:
                        product.category

                });

            }
        );


    console.log(
        "================================="
    );


    return result;

}


// ======================================================
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            "xiaomiWebBaseProducts",
            JSON.stringify(
                products
            )
        );


        console.log(
            "База сохранена:",
            products.length
        );


        return true;

    } catch (error) {

        console.error(
            "Ошибка сохранения базы:",
            error
        );


        return false;

    }

}


// ======================================================
// ИМПОРТ ФАЙЛА 1С
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

                console.error(
                    "XLSX не найден."
                );

                return;

            }


            if (importStatus) {

                importStatus.textContent =
                    "Читаю выгрузку 1С...";

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
                            "Лист 1С:",
                            sheetName
                        );


                        console.log(
                            "Количество строк:",
                            rows.length
                        );


                        console.log(
                            "Первые строки:",
                            rows.slice(0, 15)
                        );


                        // ------------------------------------------------
                        // ПАРСИМ ФАЙЛ
                        // ------------------------------------------------

                        const imported =
                            parse1CData(
                                rows
                            );


                        // ------------------------------------------------
                        // Если ничего не найдено,
                        // старую базу НЕ трогаем.
                        // ------------------------------------------------

                        if (
                            !Array.isArray(imported) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Не удалось найти товары в выгрузке 1С."
                            );

                        }


                        // ------------------------------------------------
                        // ТОЛЬКО ПОСЛЕ УСПЕШНОГО ИМПОРТА
                        // заменяем старую базу.
                        // ------------------------------------------------

                        products.length = 0;


                        imported.forEach(
                            product => {

                                products.push(
                                    product
                                );

                            }
                        );


                        normalizeProducts();


                        // ------------------------------------------------
                        // СОХРАНЯЕМ
                        // ------------------------------------------------

                        const saved =
                            saveProducts();


                        // ------------------------------------------------
                        // ПОКАЗЫВАЕМ
                        // ------------------------------------------------

                        renderProducts(
                            products
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

                            if (!saved) {

                                importStatus.textContent +=
                                    " Но сохранить базу не удалось.";

                            }

                        }


                        console.log(
                            "================================="
                        );

                        console.log(
                            "ИМПОРТ ЗАВЕРШЁН"
                        );

                        console.log(
                            "Товаров:",
                            products.length
                        );

                        console.log(
                            "Смартфонов:",
                            products.filter(
                                p =>
                                    p.category ===
                                    "Смартфоны"
                            ).length
                        );

                        console.log(
                            "Планшетов:",
                            products.filter(
                                p =>
                                    p.category ===
                                    "Планшеты"
                            ).length
                        );

                        console.log(
                            "Смарт-часов:",
                            products.filter(
                                p =>
                                    p.category ===
                                    "Смарт-часы"
                            ).length
                        );

                        console.log(
                            "Фитнес-браслетов:",
                            products.filter(
                                p =>
                                    p.category ===
                                    "Фитнес-браслеты"
                            ).length
                        );

                        console.log(
                            "================================="
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
// НАЗАД
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
// ЗАГРУЗКА СОХРАНЁННОЙ БАЗЫ
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
            products.length,
            "товаров"
        );


        return true;

    } catch (error) {

        console.error(
            "Ошибка загрузки сохранённой базы:",
            error
        );


        return false;

    }

}


// ======================================================
// ОЧИСТКА LOCALSTORAGE
// ======================================================
//
// Вызов:
// clearSavedProducts()
//
// Нужен только для полной очистки старой базы,
// если она вдруг мешает первому тесту.
// ======================================================

function clearSavedProducts() {

    try {

        localStorage.removeItem(
            "xiaomiWebBaseProducts"
        );


        console.log(
            "Сохранённая база очищена."
        );


        return true;

    } catch (error) {

        console.error(
            "Ошибка очистки:",
            error
        );


        return false;

    }

}


// ======================================================
// START
// ======================================================

function initApp() {

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "ОШИБКА: массив products не найден."
        );


        if (productsList) {

            productsList.innerHTML = `

                <div class="empty-result">

                    <strong>
                        Ошибка загрузки базы
                    </strong>

                    <p>
                        Проверьте файл products-data.js
                    </p>

                </div>

            `;

        }

        return;

    }


    // --------------------------------------------------
    // Загружаем сохранённую базу.
    // --------------------------------------------------

    loadSavedProducts();


    // --------------------------------------------------
    // Нормализуем.
    // --------------------------------------------------

    normalizeProducts();


    console.log(
        "================================="
    );

    console.log(
        "XIAOMI WEBBASE"
    );

    console.log(
        "Всего товаров:",
        products.length
    );

    console.log(
        "Смартфоны:",
        products.filter(
            p =>
                p.category ===
                "Смартфоны"
        ).length
    );

    console.log(
        "Планшеты:",
        products.filter(
            p =>
                p.category ===
                "Планшеты"
        ).length
    );

    console.log(
        "Смарт-часы:",
        products.filter(
            p =>
                p.category ===
                "Смарт-часы"
        ).length
    );

    console.log(
        "Фитнес-браслеты:",
        products.filter(
            p =>
                p.category ===
                "Фитнес-браслеты"
        ).length
    );

    console.log(
        "================================="
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
// ЗАПУСК
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