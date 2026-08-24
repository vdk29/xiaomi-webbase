// ======================================================
// XIAOMI WEBBASE
// APP.JS
// УНИВЕРСАЛЬНЫЙ ПАРСЕР ВЫГРУЗКИ 1С
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
// NORMALIZE TEXT
// ======================================================

function normalizeText(value) {

    return String(value || "")
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
// АКСЕССУАРЫ
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const words = [

        "чехол",
        "case",

        "защитное стекло",
        "стекло защитное",
        "стекло",
        "защитная пленка",
        "защитная плёнка",
        "пленка",
        "плёнка",

        "клавиатура",
        "keyboard",

        "зарядное устройство",
        "зарядка",
        "зарядный блок",
        "charger",
        "адаптер питания",

        "кабель",
        "cable",

        "ремешок",
        "ремешки",
        "strap",

        "переходник",
        "adapter",

        "держатель",
        "holder",

        "стилус",
        "stylus",

        "наушники",
        "наушник",
        "earbuds",
        "headphones",

        "мышь",
        "mouse",

        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word => text.includes(word)
    );

}


// ======================================================
// СЛУЖЕБНАЯ СТРОКА
// ======================================================

function isServiceRow(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    // ПФ
    if (
        /^пф(?:\s|$)/.test(text)
    ) {
        return true;
    }


    // Итого / всего
    if (
        text === "итого" ||
        text === "всего" ||
        text.startsWith("итого ") ||
        text.startsWith("всего ")
    ) {
        return true;
    }


    // --------------------------------------------------
    // Нумерованные разделы
    //
    // 01 Смартфоны 70
    // 02 Планшеты 17
    // 03 Умные часы 50
    //
    // --------------------------------------------------

    if (
        /^\d{1,3}[\s.)_-]+/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Категория + количество
    //
    // Смартфоны 70
    // Планшеты 17
    // Фитнес-браслеты - 34
    //
    // --------------------------------------------------

    const groupWithNumber =
        /^(смартфон|смартфоны|планшет|планшеты|часы|умные часы|смарт-часы|смарт часы|фитнес-браслет|фитнес браслет|фитнес-браслеты|наушники|телевизоры|камеры|пылесосы|аксессуары)(?:.*?)[-–—]?\s*\d+\s*$/i;

    if (
        groupWithNumber.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Чистые заголовки
    // --------------------------------------------------

    const groups = [

        "смартфон",
        "смартфоны",

        "планшет",
        "планшеты",

        "часы",
        "умные часы",
        "смарт-часы",
        "смарт часы",

        "фитнес-браслет",
        "фитнес браслет",
        "фитнес-браслеты",
        "фитнес браслеты",

        "наушники",
        "телевизоры",
        "камеры",
        "пылесосы",

        "аксессуары",

        "аксессуары для планшета",
        "аксессуары для планшетов",

        "аксессуары для смартфона",
        "аксессуары для смартфонов",

        "для планшета",
        "для планшетов",

        "для смартфона",
        "для смартфонов",

        "для часов",
        "для смарт-часов",

        "карточка товара"

    ];


    if (
        groups.includes(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Заголовки "Для Redmi..."
    //
    // Но НЕ настоящий товар.
    // --------------------------------------------------

    if (
        /^для\s+/i.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // "Карточка для Redmi..."
    // --------------------------------------------------

    if (
        /^карточка\s+для\s+/i.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ЯВНЫЙ ТИП ТОВАРА
// ======================================================
//
// В твоей выгрузке настоящий товар начинается
// с типа:
//
// Фитнес-браслет Xiaomi ...
// Смартфон Xiaomi ...
// Планшет Xiaomi ...
// Смарт-часы Xiaomi ...
//
// Поэтому именно это используем как главный
// признак реального товара.
//
// ======================================================

function getProductType(name) {

    const text =
        normalizeText(name);


    // --------------------------------------------------
    // АКСЕССУАР
    // --------------------------------------------------

    if (
        isAccessoryName(text)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // СМАРТФОН
    // --------------------------------------------------

    if (
        /^(смартфон)\b/.test(text)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТ
    // --------------------------------------------------

    if (
        /^(планшет)\b/.test(text)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТ
    // --------------------------------------------------

    if (
        /^(фитнес[\s-]*браслет)\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        /^(смарт[\s-]*часы)\b/.test(text) ||
        /^(умные\s+часы)\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        /^(наушники|наушник)\b/.test(text)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОРЫ
    // --------------------------------------------------

    if (
        /^(телевизор|телевизоры)\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        /^(камера|камеры)\b/.test(text)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        /^(пылесос|пылесосы)\b/.test(text)
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// РЕАЛЬНЫЙ ТОВАР
// ======================================================
//
// Очень важная функция.
//
// Мы НЕ считаем товаром:
//
// Redmi Pad 2
// Mi Band 10 Pro
// 17T Pro
//
// если перед ними нет типа товара.
//
// ======================================================

function looksLikeRealProduct(name) {

    if (
        isServiceRow(name)
    ) {

        return false;

    }


    const type =
        getProductType(name);


    return type !== null;

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(product) {

    const name =
        normalizeText(product.name);

    const originalCategory =
        normalizeText(product.category);


    // --------------------------------------------------
    // Аксессуары всегда проверяем первыми.
    // --------------------------------------------------

    if (
        isAccessoryName(name)
    ) {

        return "Аксессуары";

    }


    const type =
        getProductType(name);


    if (type) {

        return type;

    }


    // --------------------------------------------------
    // Если 1С сама передала категорию
    // --------------------------------------------------

    if (
        originalCategory.includes("смартф")
    ) {

        return "Смартфоны";

    }


    if (
        originalCategory.includes("планш")
    ) {

        return "Планшеты";

    }


    if (
        originalCategory.includes("брасл")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        originalCategory.includes("час")
    ) {

        return "Смарт-часы";

    }


    if (
        originalCategory.includes("науш")
    ) {

        return "Наушники";

    }


    if (
        originalCategory.includes("акс")
    ) {

        return "Аксессуары";

    }


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
            ""
        ).trim();


    if (!prepared.name) {
        return null;
    }


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
        function (event) {

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


                    ${specsHTML}

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
                        number(product.display) +
                        number(product.warehouse);


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
// ПОИСК КОЛОНОК 1С
// ======================================================

function find1CColumns(rows) {

    let headerRow = -1;

    let nameColumn = -1;

    let displayColumn = -1;

    let warehouseColumn = -1;

    let totalColumn = -1;


    const limit =
        Math.min(
            rows.length,
            80
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

                nameColumn = j;

                headerRow = i;

            }


            if (
                text.includes(
                    "склад тц европолис ов"
                )
            ) {

                warehouseColumn = j;

            }


            if (
                text.includes(
                    "склад тц европолис"
                ) &&
                !text.includes(" ов")
            ) {

                displayColumn = j;

            }


            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = j;

            }

        }

    }


    console.log(
        "Найденные колонки:",
        {
            nameColumn,
            displayColumn,
            warehouseColumn,
            totalColumn,
            headerRow
        }
    );


    // --------------------------------------------------
    // Универсальный вариант
    // --------------------------------------------------

    if (
        nameColumn !== -1 &&
        displayColumn !== -1 &&
        warehouseColumn !== -1
    ) {

        return {

            headerRow,

            nameColumn,

            displayColumn,

            warehouseColumn,

            totalColumn

        };

    }


    // --------------------------------------------------
    // Запасной вариант твоего формата
    //
    // A = Номенклатура
    // E = склад
    // G = витрина
    // H = итого
    // --------------------------------------------------

    console.warn(
        "Заголовки не определены полностью. Использую A/E/G/H."
    );


    return {

        headerRow:
            headerRow >= 0
                ? headerRow
                : 0,

        nameColumn: 0,

        displayColumn: 4,

        warehouseColumn: 6,

        totalColumn: 7

    };

}


// ======================================================
// ПОИСК НАСТОЯЩЕГО ТОВАРА
// ======================================================
//
// Главный принцип:
//
// 1. Сначала отбрасываем служебные строки.
// 2. Потом отбрасываем заголовки.
// 3. Потом смотрим на начало названия.
//
// Это позволяет не привязываться к сегодняшнему
// количеству товаров.
//
// ======================================================

function getProductCategoryFromName(name) {

    const text =
        normalizeText(name);


    // --------------------------------------------------
    // Аксессуары
    // --------------------------------------------------

    if (
        isAccessoryName(text)
    ) {

        return "Аксессуары";

    }


    // --------------------------------------------------
    // Типовые начала настоящих товаров
    // --------------------------------------------------

    if (
        /^(смартфон)\b/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        /^(планшет)\b/.test(text)
    ) {

        return "Планшеты";

    }


    if (
        /^(фитнес[\s-]*браслет)\b/.test(text)
    ) {

        return "Фитнес-браслеты";

    }


    if (
        /^(смарт[\s-]*часы)\b/.test(text) ||
        /^(умные\s+часы)\b/.test(text)
    ) {

        return "Смарт-часы";

    }


    if (
        /^(наушники|наушник)\b/.test(text)
    ) {

        return "Наушники";

    }


    if (
        /^(телевизор|телевизоры)\b/.test(text)
    ) {

        return "Телевизоры";

    }


    if (
        /^(камера|камеры)\b/.test(text)
    ) {

        return "Камеры";

    }


    if (
        /^(пылесос|пылесосы)\b/.test(text)
    ) {

        return "Пылесосы";

    }


    return null;

}


// ======================================================
// ПРОВЕРКА РЕАЛЬНОГО ТОВАРА
// ======================================================

function isRealProductRow(name) {

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


    // Явные группы
    if (
        /^для\s+/i.test(text)
    ) {

        return false;

    }


    if (
        /^карточка\s+для\s+/i.test(text)
    ) {

        return false;

    }


    if (
        /^аксессуары\s+для\s+/i.test(text)
    ) {

        return false;

    }


    // Если название начинается с реального
    // типа товара — это настоящий товар.
    const category =
        getProductCategoryFromName(text);


    if (category) {

        return true;

    }


    return false;

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


    if (!columns) {

        return result;

    }


    let productId = 1;


    const start =
        Math.max(
            columns.headerRow + 1,
            0
        );


    console.log(
        "Начинаем обработку строк:",
        start,
        "из",
        rows.length
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


        // ==================================================
        // НАЗВАНИЕ
        // ==================================================

        const rawName =
            row[
                columns.nameColumn
            ];


        const name =
            String(
                rawName ?? ""
            ).trim();


        if (!name) {

            continue;

        }


        // ==================================================
        // ПРОВЕРКА НА НАСТОЯЩИЙ ТОВАР
        // ==================================================

        if (
            !isRealProductRow(name)
        ) {

            console.log(
                "Пропущена служебная/групповая строка:",
                name
            );

            continue;

        }


        // ==================================================
        // КАТЕГОРИЯ
        // ==================================================

        const category =
            getProductCategoryFromName(
                name
            );


        if (!category) {

            console.log(
                "Не удалось определить категорию:",
                name
            );

            continue;

        }


        // ==================================================
        // ОСТАТКИ
        // ==================================================

        const warehouse =
            Math.max(
                0,
                number(
                    row[
                        columns.displayColumn
                    ]
                )
            );


        const display =
            Math.max(
                0,
                number(
                    row[
                        columns.warehouseColumn
                    ]
                )
            );


        // ==================================================
        // СОЗДАНИЕ ТОВАРА
        // ==================================================

        const product = {

            id:
                productId++,

            name:

                name,

            category:

                category,

            memory:

                "",

            color:

                "",

            display:

                display,

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


        result.push(
            product
        );

    }


    // ======================================================
    // СТАТИСТИКА
    // ======================================================

    const stats = {};


    result.forEach(
        product => {

            stats[
                product.category
            ] =
                (
                    stats[
                        product.category
                    ] || 0
                ) + 1;

        }
    );


    console.log(
        "================================="
    );


    console.log(
        "ИМПОРТ 1С"
    );


    console.log(
        "Строк в файле:",
        rows.length
    );


    console.log(
        "Реальных товаров:",
        result.length
    );


    console.log(
        "Категории:",
        stats
    );


    console.log(
        "================================="
    );


    return result;

}


// ======================================================
// ИМПОРТ ФАЙЛА
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
                            "Лист:",
                            sheetName
                        );


                        console.log(
                            "Строк:",
                            rows.length
                        );


                        // ==================================================
                        // ПАРСИНГ
                        // ==================================================

                        const imported =
                            parse1CData(
                                rows
                            );


                        if (
                            !Array.isArray(imported) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Не удалось найти реальные товары в выгрузке 1С."
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
                            "xiaomiWebBaseProducts",
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


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

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
// LOAD SAVED DATABASE
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
// INIT
// ======================================================

function initApp() {

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "ОШИБКА: массив products не найден."
        );

        return;

    }


    // Загружаем сохранённую базу
    loadSavedProducts();


    // Нормализуем
    normalizeProducts();


    console.log(
        "================================="
    );


    console.log(
        "XIAOMI WEBBASE"
    );


    console.log(
        "Всего:",
        products.length
    );


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


    categories.forEach(
        category => {

            console.log(
                category + ":",
                products.filter(
                    p =>
                        p.category ===
                        category
                ).length
            );

        }
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