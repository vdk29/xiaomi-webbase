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

    let text =
        String(value)
            .trim()
            .replace(/\s/g, "")
            .replace(",", ".");

    if (text === "") {
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
// ЭКРАНИРОВАНИЕ HTML
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
// ПОЛУЧЕНИЕ ОСТАТКОВ
// ======================================================

function getStock(product) {

    const display =
        number(product.display);

    const warehouse =
        number(product.warehouse);

    return {

        display:
            display,

        warehouse:
            warehouse,

        total:
            display + warehouse

    };

}


// ======================================================
// АКСЕССУАРЫ
// ======================================================
//
// ВАЖНО:
//
// Проверяем аксессуары ДО планшетов.
//
// Поэтому:
//
// Чехол для Redmi Pad 2
// Защитное стекло Redmi Pad 2
// Клавиатура для Redmi Pad
//
// НЕ станут планшетами.
//
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const accessoryPatterns = [

        // Чехлы
        "чехол",
        "чехлы",
        "case",
        "cover",

        // Стекло
        "защитное стекло",
        "защитная стекло",
        "стекло защитное",
        "защит. стекло",
        "стекло для",

        // Плёнки
        "защитная пленка",
        "защитная плёнка",
        "защитную пленку",
        "защитную плёнку",
        "пленка защитная",
        "плёнка защитная",
        "пленка для",
        "плёнка для",

        // Клавиатуры
        "клавиатура",
        "клавиатуры",
        "keyboard",

        // Кабели
        "кабель",
        "кабели",
        "cable",

        // Зарядки
        "зарядное устройство",
        "зарядное",
        "зарядка",
        "зарядки",
        "charger",
        "power adapter",

        // Блоки питания
        "блок питания",
        "адаптер питания",
        "сетевой адаптер",

        // Ремешки
        "ремешок",
        "ремешки",
        "strap",
        "band strap",

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
        "стилусы",
        "stylus",

        // Наушники как отдельный товар
        // НЕ добавляем сюда.
        // Они должны идти в "Наушники".

        // Карты памяти
        "карта памяти",
        "micro sd",
        "microsd",

        // Док-станции
        "док-станция",
        "док станция",
        "dock station",

        // Пульты
        "пульт",

        // Автомобильные аксессуары
        "автомобильный держатель",
        "автодержатель",

        // Универсальные аксессуары
        "аксессуар",
        "аксессуары"

    ];


    return accessoryPatterns.some(
        pattern =>
            text.includes(pattern)
    );

}


// ======================================================
// СЛУЖЕБНАЯ СТРОКА 1С
// ======================================================
//
// Сюда попадают:
//
// Фитнес-браслеты - 34
// Планшеты - 13
// Аксессуары для планшетов
// Для планшетов
// Карточка для Redmi 2
// Итого
// Всего
//
// ======================================================

function isServiceRow(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return true;

    }


    // --------------------------------------------------
    // Общее количество
    // --------------------------------------------------

    if (
        /[-–—]\s*\d+\s*$/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Число после названия группы
    //
    // Планшеты 13
    // Фитнес-браслеты 34
    // --------------------------------------------------

    if (
        /^(смартфоны|планшеты|часы|смарт-часы|смарт часы|фитнес-браслеты|фитнес браслеты|наушники|телевизоры|камеры|пылесосы|аксессуары)(\s+для.*)?\s+\d+\s*$/
            .test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Чистые названия групп
    // --------------------------------------------------

    const exactGroups = [

        "смартфоны",
        "планшеты",

        "часы",
        "смарт-часы",
        "смарт часы",

        "фитнес-браслеты",
        "фитнес браслеты",

        "наушники",

        "телевизоры",

        "камеры",

        "пылесосы",

        "аксессуары",

        "аксессуары для планшетов",
        "аксессуары для планшета",

        "аксессуары для смартфонов",
        "аксессуары для смартфона",

        "аксессуары для часов",
        "аксессуары для смарт-часов",

        "для планшетов",
        "для планшета",

        "для смартфонов",
        "для смартфона",

        "для часов",
        "для смарт-часов",

        "итого",
        "всего",

        "остаток",
        "остатки",

        "товары",

        "номенклатура"

    ];


    if (
        exactGroups.includes(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Группы "для ..."
    //
    // Но НЕ блокируем реальные товары,
    // например:
    //
    // Чехол для Redmi Pad 2
    //
    // потому что аксессуары проверяются отдельно.
    // --------------------------------------------------

    if (
        /^для\s+(планшетов?|смартфонов?|смартфона|часов|телефонов?)$/
            .test(text)
    ) {

        return true;

    }


    if (
        /^аксессуары\s+для\s+(планшетов?|смартфонов?|часов)$/
            .test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // "Карточка для Redmi 2"
    // --------------------------------------------------
    //
    // Служебные названия карточек 1С.
    // --------------------------------------------------

    if (
        text.startsWith("карточка для ")
    ) {

        return true;

    }


    if (
        text.startsWith("карточка ")
    ) {

        return true;

    }


    // --------------------------------------------------
    // "Группа ..."
    // --------------------------------------------------

    if (
        text.startsWith("группа ")
    ) {

        return true;

    }


    // --------------------------------------------------
    // "Раздел ..."
    // --------------------------------------------------

    if (
        text.startsWith("раздел ")
    ) {

        return true;

    }


    return false;

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
        `${category} ${name}`;


    // ==================================================
    // 1. АКСЕССУАРЫ
    // ==================================================

    if (
        isAccessoryName(name)
    ) {

        return "Аксессуары";

    }


    // ==================================================
    // 2. СМАРТФОНЫ
    // ==================================================

    if (
        text.includes("смартфон") ||
        text.includes("smartphone")
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // 3. ПЛАНШЕТЫ
    // ==================================================

    if (
        text.includes("планшет") ||
        text.includes("redmi pad") ||
        text.includes("xiaomi pad") ||
        /\bpad\b/.test(text)
    ) {

        return "Планшеты";

    }


    // ==================================================
    // 4. СМАРТ-ЧАСЫ
    // ==================================================

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


    // ==================================================
    // 5. ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

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


    // ==================================================
    // 6. НАУШНИКИ
    // ==================================================

    if (
        text.includes("наушник") ||
        text.includes("buds") ||
        text.includes("earbuds") ||
        text.includes("headphones") ||
        text.includes("headset")
    ) {

        return "Наушники";

    }


    // ==================================================
    // 7. ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        text.includes("телевизор") ||
        text.includes("телевиз") ||
        /\btv\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // 8. КАМЕРЫ
    // ==================================================

    if (
        text.includes("камера") ||
        text.includes("camera")
    ) {

        return "Камеры";

    }


    // ==================================================
    // 9. ПЫЛЕСОСЫ
    // ==================================================

    if (
        text.includes("пылесос") ||
        text.includes("vacuum")
    ) {

        return "Пылесосы";

    }


    // ==================================================
    // 10. ДРУГОЕ
    // ==================================================

    return "Другое";

}


// ======================================================
// ПРОВЕРКА РЕАЛЬНОГО ТОВАРА
// ======================================================
//
// ВАЖНО:
//
// Здесь мы НЕ пытаемся определить весь ассортимент.
//
// Задача этой функции:
//
// защитить импорт от случайных строк,
// но не выкинуть реальные Xiaomi товары.
//
// ======================================================

function looksLikeRealProduct(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return false;

    }


    // --------------------------------------------------
    // Явные товарные слова
    // --------------------------------------------------

    const productWords = [

        "смартфон",
        "smartphone",

        "redmi",
        "xiaomi",
        "poco",

        "планшет",
        "pad",

        "чехол",
        "case",
        "cover",

        "стекло",
        "пленка",
        "плёнка",

        "клавиатур",
        "keyboard",

        "наушник",
        "buds",
        "earbuds",
        "headphones",
        "headset",

        "камера",
        "camera",

        "телевизор",
        "tv",

        "пылесос",
        "vacuum",

        "зарядн",
        "charger",

        "кабель",
        "cable",

        "ремешок",
        "strap",

        "браслет",

        "часы",
        "watch",

        "стилус",
        "stylus",

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

        "роутер",

        "колонка",

        "speaker"

    ];


    return productWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// ПРОВЕРКА МОДЕЛЬНОЙ ГРУППЫ
// ======================================================
//
// Например:
//
// 17T
// 17T Pro
// Redmi Note 15 Pro
//
// Если дальше идут реальные SKU,
// такая строка может быть заголовком.
//
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

        return true;

    }


    // Явный товар — оставляем.
    if (
        looksLikeRealProduct(cleanName)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Очень короткие строки
    // --------------------------------------------------

    if (
        cleanName.length <= 25
    ) {

        const end =
            Math.min(
                rows.length,
                rowIndex + 8
            );


        for (
            let i = rowIndex + 1;
            i < end;
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

    }


    return false;

}


// ======================================================
// ПОДГОТОВКА ТОВАРА
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
        prepared.display +
        prepared.warehouse;


    prepared.category =
        detectCategory(
            prepared
        );


    if (!prepared.memory) {

        prepared.memory = "";

    }


    if (!prepared.color) {

        prepared.color = "";

    }


    if (!prepared.description) {

        prepared.description = "";

    }


    if (!prepared.tip) {

        prepared.tip = "";

    }


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
                                detectCategory(product) ===
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


            // Номенклатура

            if (
                text === "номенклатура" ||
                text.includes("номенклатура")
            ) {

                nameColumn = j;

                headerRow = i;

            }


            // Витрина / ОВ

            if (
                text.includes(
                    "склад тц европолис ов"
                )
            ) {

                warehouseColumn = j;

            }


            // Основной склад

            if (
                text.includes(
                    "склад тц европолис"
                ) &&
                !text.includes("ов")
            ) {

                displayColumn = j;

            }


            // Итого

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


    if (
        nameColumn !== -1 &&
        displayColumn !== -1 &&
        warehouseColumn !== -1
    ) {

        return {

            headerRow:
                headerRow,

            nameColumn:
                nameColumn,

            displayColumn:
                displayColumn,

            warehouseColumn:
                warehouseColumn,

            totalColumn:
                totalColumn

        };

    }


    console.warn(
        "Не удалось найти все заголовки. Использую A/E/G/H."
    );


    return {

        headerRow:
            headerRow !== -1
                ? headerRow
                : 0,

        nameColumn:
            0,

        displayColumn:
            4,

        warehouseColumn:
            6,

        totalColumn:
            7

    };

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
        "Колонки 1С:",
        columns
    );


    if (!columns) {

        console.error(
            "Не удалось определить структуру 1С."
        );

        return result;

    }


    let productId = 1;


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


        // ==================================================
        // НАЗВАНИЕ
        // ==================================================

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


        // ==================================================
        // СНАЧАЛА ОТСЕКАЕМ СЛУЖЕБНЫЕ СТРОКИ
        // ==================================================

        if (
            isServiceRow(name)
        ) {

            console.log(
                "Пропущена служебная строка:",
                name
            );

            continue;

        }


        // ==================================================
        // МОДЕЛЬНЫЕ ГРУППЫ
        // ==================================================

        if (
            isModelGroupRow(
                name,
                rows,
                i,
                columns.nameColumn
            )
        ) {

            console.log(
                "Пропущена модельная группа:",
                name
            );

            continue;

        }


        // ==================================================
        // ОСТАТКИ
        // ==================================================

        let warehouse =
            number(
                row[
                    columns.displayColumn
                ]
            );


        let display =
            number(
                row[
                    columns.warehouseColumn
                ]
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


        // ==================================================
        // ДОПОЛНИТЕЛЬНАЯ ЗАЩИТА
        // ==================================================
        //
        // Если строка вообще не похожа на товар,
        // пропускаем только явно подозрительные
        // короткие строки.
        //
        // Это важно, чтобы не потерять реальные SKU.
        // ==================================================

        if (
            !looksLikeRealProduct(name)
        ) {

            const normalized =
                normalizeText(name);


            // Короткая непонятная строка
            // обычно является группой 1С.

            if (
                normalized.length < 30
            ) {

                console.log(
                    "Пропущена подозрительная строка:",
                    name
                );

                continue;

            }

        }


        // ==================================================
        // СОЗДАЁМ ТОВАР
        // ==================================================

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
                display + warehouse,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        // ==================================================
        // ОПРЕДЕЛЯЕМ КАТЕГОРИЮ
        // ==================================================

        product.category =
            detectCategory(
                product
            );


        // ==================================================
        // ДОБАВЛЯЕМ
        // ==================================================

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

            if (
                !stats[product.category]
            ) {

                stats[product.category] = 0;

            }


            stats[product.category]++;

        }
    );


    console.log(
        "================================="
    );


    console.log(
        "ИМПОРТ 1С"
    );


    console.log(
        "Реально импортировано:",
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
                            "Лист:",
                            sheetName
                        );


                        console.log(
                            "Строк:",
                            rows.length
                        );


                        console.log(
                            "Первые строки:",
                            rows.slice(
                                0,
                                20
                            )
                        );


                        // ==================================================
                        // ПАРСИМ
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
                                "Не удалось найти товары в выгрузке 1С."
                            );

                        }


                        // ==================================================
                        // ЗАМЕНЯЕМ СТАРУЮ БАЗУ
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


                        // ==================================================
                        // РЕНДЕР
                        // ==================================================

                        renderProducts(
                            products
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

                        }


                        // ==================================================
                        // СТАТИСТИКА
                        // ==================================================

                        console.log(
                            "================================="
                        );


                        console.log(
                            "ИМПОРТ ЗАВЕРШЁН"
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


    // --------------------------------------------------
    // ЛОГ
    // --------------------------------------------------

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
        "Наушники:",
        products.filter(
            p =>
                p.category ===
                "Наушники"
        ).length
    );


    console.log(
        "Аксессуары:",
        products.filter(
            p =>
                p.category ===
                "Аксессуары"
        ).length
    );


    console.log(
        "================================="
    );


    // --------------------------------------------------
    // РЕНДЕР
    // --------------------------------------------------

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