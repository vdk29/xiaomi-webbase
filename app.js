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
            .replace(/\u00A0/g, " ")
            .replace(/\s/g, "");

    if (!text) {
        return 0;
    }

    /*
     * 1С / Excel может отдавать:
     *
     * 1
     * 1,000
     * 1.000
     * 1,5
     *
     * Для остатков нам нужны целые количества.
     */

    if (
        text.includes(",") &&
        text.includes(".")
    ) {

        /*
         * Если есть и точка и запятая,
         * определяем последний разделитель
         * как десятичный.
         */

        const lastComma =
            text.lastIndexOf(",");

        const lastDot =
            text.lastIndexOf(".");

        if (lastComma > lastDot) {

            text =
                text
                    .replace(/\./g, "")
                    .replace(",", ".");

        } else {

            text =
                text
                    .replace(/,/g, "");

        }

    } else if (text.includes(",")) {

        /*
         * В выгрузке количества обычно целые.
         * 1,000 в Excel может быть отображением
         * числа 1 с тремя знаками после запятой.
         *
         * Поэтому:
         *
         * 1,000 -> 1
         * 2,000 -> 2
         * 1,500 -> 1.5
         */

        const parts =
            text.split(",");

        if (
            parts.length === 2 &&
            parts[1].length === 3
        ) {

            text =
                parts[0];

        } else {

            text =
                text.replace(",", ".");

        }

    } else if (text.includes(".")) {

        const parts =
            text.split(".");

        if (
            parts.length === 2 &&
            parts[1].length === 3
        ) {

            text =
                parts[0];

        }

    }

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

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ");

}


// ======================================================
// CATEGORY
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
        text.includes("smartphone") ||
        category.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
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
        text.includes("earbuds") ||
        text.includes("buds")
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ЧЕХЛЫ
    // --------------------------------------------------

    if (
        text.includes("чехол")
    ) {

        return "Чехлы";

    }


    // --------------------------------------------------
    // ЗАРЯДНЫЕ УСТРОЙСТВА
    // --------------------------------------------------

    if (
        text.includes("зарядное устройство") ||
        text.includes("зарядное") ||
        text.includes("зарядка")
    ) {

        return "Зарядные устройства";

    }


    // --------------------------------------------------
    // КАБЕЛИ
    // --------------------------------------------------

    if (
        text.includes("кабель") ||
        text.includes("дата-кабель")
    ) {

        return "Кабели";

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        text.includes("камера")
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ТВ
    // --------------------------------------------------

    if (
        text.includes("телевизор") ||
        text.includes("tv ")
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        text.includes("пылесос")
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // УМНЫЙ ДОМ
    // --------------------------------------------------

    if (
        text.includes("умный") ||
        text.includes("умные")
    ) {

        return "Умный дом";

    }


    // --------------------------------------------------
    // АКСЕССУАРЫ
    // --------------------------------------------------

    if (
        text.includes("ремешок") ||
        text.includes("стекло") ||
        text.includes("защитное") ||
        text.includes("адаптер") ||
        text.includes("держатель")
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // ДРУГОЕ
    // --------------------------------------------------

    return "Другое";

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

        display: display,

        warehouse: warehouse,

        total:
            display +
            warehouse

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


    // ID

    if (
        prepared.id === undefined ||
        prepared.id === null ||
        prepared.id === ""
    ) {

        prepared.id =
            index + 1;

    }


    // NAME

    prepared.name =
        String(
            prepared.name ||
            "Без названия"
        ).trim();


    // CATEGORY

    prepared.category =
        detectCategory(
            prepared
        );


    // STOCK

    prepared.display =
        Math.max(
            0,
            number(
                prepared.display
            )
        );

    prepared.warehouse =
        Math.max(
            0,
            number(
                prepared.warehouse
            )
        );


    prepared.quantity =
        prepared.display +
        prepared.warehouse;


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

    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        const prepared =
            prepareProduct(
                products[i],
                i
            );

        if (prepared) {

            products[i] =
                prepared;

        }

    }

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

                        ${product.category || ""}

                    </div>


                    <div class="product-name">

                        ${product.name || "Без названия"}

                    </div>


                    ${
                        product.memory ||
                        product.color
                            ? `

                                <div class="product-info">

                                    ${
                                        product.memory || ""
                                    }

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${
                                        product.color || ""
                                    }

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

                const text = [

                    product.id,
                    product.name,
                    product.category,
                    product.memory,
                    product.color,
                    product.description,
                    product.tip

                ]
                    .map(normalizeText)
                    .join(" ");


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
// SEARCH BUTTON
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// SEARCH ENTER
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
// LIVE SEARCH
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ======================================================
// CATEGORIES
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
                            detectCategory(product) ===
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
                        ${key}
                    </span>

                    <strong>
                        ${value}
                    </strong>

                </div>

            `
        )
        .join("");

}


// ======================================================
// PRODUCT CARD
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

                    ${product.category || ""}

                </div>


                <h1>

                    ${product.name || "Без названия"}

                </h1>


                ${
                    product.memory
                        ? `

                            <div class="product-memory">

                                ${product.memory}

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
                                    ${product.color}
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
                            product.description ||
                            "Описание пока не добавлено."
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
                            product.tip ||
                            "Подсказка пока не добавлена."
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
                        number(product.display) +
                        number(product.warehouse);


                    try {

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(products)
                        );

                    } catch (error) {

                        console.error(
                            "Не удалось сохранить изменения:",
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
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ 1С
// ======================================================

function cellText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/\u00A0/g, " ")
        .trim();

}


// ------------------------------------------------------
// ИЩЕМ ЗАГОЛОВКИ КОЛОНОК
// ------------------------------------------------------

function find1CColumns(rows) {

    let result = {

        headerRow: -1,

        nameColumn: 0,

        displayColumn: -1,

        warehouseColumn: -1,

        totalColumn: -1

    };


    for (
        let i = 0;
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


        const texts =
            row.map(
                cell =>
                    normalizeText(
                        cell
                    )
            );


        let hasNomenclature = false;
        let hasQuantity = false;


        for (
            let j = 0;
            j < texts.length;
            j++
        ) {

            const text =
                texts[j];


            if (
                text.includes("номенклатур")
            ) {

                hasNomenclature = true;

                result.nameColumn = j;

            }


            if (
                text.includes("количество")
            ) {

                hasQuantity = true;

            }

        }


        /*
         * В нашей выгрузке строка заголовков
         * содержит Номенклатура и Количество.
         */

        if (
            hasNomenclature &&
            hasQuantity
        ) {

            result.headerRow = i;

            break;

        }

    }


    if (
        result.headerRow === -1
    ) {

        console.warn(
            "Заголовок 1С не найден."
        );

        return result;

    }


    /*
     * В большинстве случаев структура:
     *
     * 0 Номенклатура
     * 1 Склад ТЦ Европейские
     * 2 Склад ТЦ Европейские ОВ
     * 3 Итого
     *
     * Но мы всё равно определяем по заголовкам.
     */

    const header =
        rows[result.headerRow];


    for (
        let i = 0;
        i < header.length;
        i++
    ) {

        const text =
            normalizeText(
                header[i]
            );


        if (
            text.includes("номенклатур")
        ) {

            result.nameColumn =
                i;

        }

    }


    /*
     * Ищем строки ниже/рядом с заголовком,
     * потому что Excel может иметь двухуровневый
     * заголовок.
     */

    const scanStart =
        result.headerRow;

    const scanEnd =
        Math.min(
            rows.length,
            result.headerRow + 4
        );


    for (
        let r = scanStart;
        r < scanEnd;
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


            if (
                text.includes("номенклатур")
            ) {

                result.nameColumn =
                    c;

            }


            if (
                text.includes("итого")
            ) {

                result.totalColumn =
                    c;

            }


            /*
             * Вторая колонка склада —
             * обычный склад.
             *
             * Слово "европейские" здесь
             * намеренно не привязываем жёстко
             * к названию магазина.
             */

            if (
                text.includes("склад") &&
                text.includes("европейские") &&
                !text.includes("ов") &&
                !text.includes("итого")
            ) {

                result.displayColumn =
                    c;

            }


            if (
                text.includes("склад") &&
                text.includes("европейские") &&
                text.includes("ов")
            ) {

                result.warehouseColumn =
                    c;

            }

        }

    }


    /*
     * Если по названию колонок определить не получилось,
     * используем структуру конкретной выгрузки 1С:
     *
     * Номенклатура | Витрина | Склад | Итого
     */

    if (
        result.displayColumn === -1
    ) {

        result.displayColumn =
            result.nameColumn + 1;

    }


    if (
        result.warehouseColumn === -1
    ) {

        result.warehouseColumn =
            result.nameColumn + 2;

    }


    if (
        result.totalColumn === -1
    ) {

        result.totalColumn =
            result.nameColumn + 3;

    }


    console.log(
        "Колонки 1С:",
        result
    );


    return result;

}


// ======================================================
// ПРОВЕРКА: ЯВЛЯЕТСЯ ЛИ СТРОКА ГРУППОЙ
// ======================================================

function is1CGroupRow(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    /*
     * В выгрузке есть строки типа:
     *
     * 01 Смартфоны Xiaomi
     * 02 АКСУАРЫ
     *
     * Это НЕ товар.
     */

    if (
        /^\d{1,3}\s/.test(text)
    ) {

        return true;

    }


    /*
     * Группы/разделы.
     */

    const groups = [

        "смартфоны",
        "смартфоны xiaomi",
        "аксессуары",
        "аксессуары для планшетов",
        "аксессуары для смартфонов",
        "аксессуары для часов",
        "планшеты",
        "смарт-часы",
        "смарт часы",
        "фитнес-браслеты",
        "наушники",
        "тв-приставки",
        "тв приставки",
        "красота и здоровье",
        "бытовая техника"

    ];


    if (
        groups.includes(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ПРОВЕРКА РЕАЛЬНОГО ТОВАРА
// ======================================================

function isReal1CProduct(name) {

    const text =
        normalizeText(name);


    if (
        !text ||
        text.length < 2
    ) {

        return false;

    }


    if (
        is1CGroupRow(text)
    ) {

        return false;

    }


    /*
     * Отбрасываем технические строки.
     */

    const technical = [

        "остатки на складах",
        "номенклатура",
        "итого",
        "количество",
        "склад тц европейские",
        "склад тц европейские ов"

    ];


    if (
        technical.includes(text)
    ) {

        return false;

    }


    return true;

}


// ======================================================
// PARSE 1C
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
        "Начинаем разбор 1С.",
        columns
    );


    if (
        columns.headerRow === -1
    ) {

        console.error(
            "Не удалось найти строку заголовков 1С."
        );

        return result;

    }


    let productId = 1;


    /*
     * Читаем только строки ПОСЛЕ заголовка.
     */

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
            cellText(
                row[
                    columns.nameColumn
                ]
            );


        if (
            !isReal1CProduct(name)
        ) {

            continue;

        }


        /*
         * ВАЖНО:
         *
         * Никаких поисков "первых двух чисел"
         * во всей строке.
         *
         * Берём СТРОГО нужные колонки.
         */

        const displayRaw =
            row[
                columns.displayColumn
            ];


        const warehouseRaw =
            row[
                columns.warehouseColumn
            ];


        const totalRaw =
            row[
                columns.totalColumn
            ];


        const display =
            Math.max(
                0,
                number(
                    displayRaw
                )
            );


        const warehouse =
            Math.max(
                0,
                number(
                    warehouseRaw
                )
            );


        const total =
            display +
            warehouse;


        /*
         * Пропускаем пустые технические строки.
         *
         * Если у реального товара нулевой остаток,
         * всё равно сохраняем его.
         */

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

            display:
                display,

            warehouse:
                warehouse,

            quantity:
                total,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        product.category =
            detectCategory(
                product
            );


        result.push(
            product
        );


        console.log(
            "1С товар:",
            name,
            "| витрина:",
            display,
            "| склад:",
            warehouse,
            "| всего:",
            total,
            "| исходный итог:",
            totalRaw
        );

    }


    console.log(
        "================================="
    );

    console.log(
        "Результат разбора 1С:",
        result.length,
        "товаров"
    );

    console.log(
        "================================="
    );


    return result;

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

                console.error(
                    "XLSX не найден."
                );

                return;

            }


            if (importStatus) {

                importStatus.textContent =
                    "Загрузка файла...";

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
                                    type: "array",
                                    cellDates: false
                                }
                            );


                        if (
                            !workbook.SheetNames.length
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
                                    defval: "",
                                    raw: true
                                }
                            );


                        console.log(
                            "================================="
                        );

                        console.log(
                            "ФАЙЛ 1С",
                            file.name
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
                            "================================="
                        );


                        const imported =
                            parse1CData(
                                rows
                            );


                        if (
                            !imported.length
                        ) {

                            throw new Error(
                                "Не удалось найти товары в выгрузке 1С."
                            );

                        }


                        /*
                         * Полностью заменяем старую базу.
                         *
                         * Это важно:
                         * тестовый товар больше не должен
                         * оставаться после импорта.
                         */

                        products.length = 0;


                        imported.forEach(
                            product => {

                                products.push(
                                    product
                                );

                            }
                        );


                        normalizeProducts();


                        /*
                         * Сохраняем новую базу.
                         */

                        try {

                            localStorage.setItem(
                                "xiaomiWebBaseProducts",
                                JSON.stringify(
                                    products
                                )
                            );

                        } catch (error) {

                            console.error(
                                "Ошибка сохранения базы:",
                                error
                            );

                        }


                        /*
                         * Показываем товары.
                         */

                        renderProducts(
                            products
                        );


                        /*
                         * Сбрасываем активную категорию.
                         */

                        categoryButtons.forEach(
                            button => {

                                button.classList.remove(
                                    "active"
                                );

                            }
                        );


                        if (categoryButtons.length) {

                            const allButton =
                                Array.from(
                                    categoryButtons
                                ).find(
                                    button =>
                                        button.dataset.category ===
                                        "Все"
                                );


                            if (allButton) {

                                allButton.classList.add(
                                    "active"
                                );

                            }

                        }


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

                        }


                        console.log(
                            "Импортировано товаров:",
                            products.length
                        );


                    } catch (error) {

                        console.error(
                            "Ошибка импорта:",
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
                            "Ошибка чтения файла.";

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
// DEBUG STOCK
// ======================================================

function debugStock() {

    console.log(
        "================================="
    );

    console.log(
        "ПРОВЕРКА ОСТАТКОВ"
    );

    console.log(
        "================================="
    );


    products
        .slice(0, 20)
        .forEach(
            product => {

                console.log(
                    product.name,
                    "=>",
                    "витрина:",
                    product.display,
                    "| склад:",
                    product.warehouse,
                    "| всего:",
                    product.quantity
                );

            }
        );


    console.log(
        "================================="
    );

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


    /*
     * Загружаем сохранённую базу.
     */

    loadSavedProducts();


    /*
     * Нормализуем.
     */

    normalizeProducts();


    console.log(
        "================================="
    );

    console.log(
        "Xiaomi WebBase"
    );

    console.log(
        "Всего товаров:",
        products.length
    );


    console.log(
        "Смартфоны:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Смартфоны"
        ).length
    );


    console.log(
        "Планшеты:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Планшеты"
        ).length
    );


    console.log(
        "Смарт-часы:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Смарт-часы"
        ).length
    );


    console.log(
        "Фитнес-браслеты:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Фитнес-браслеты"
        ).length
    );


    console.log(
        "Наушники:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Наушники"
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


    debugStock();

}


// ======================================================
// RUN
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