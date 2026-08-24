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

    const result = Number(text);

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
// АКСЕССУАРЫ
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const words = [

        // Чехлы
        "чехол",
        "чехлы",
        "case",

        // Стекла
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло защитное",
        "стекло",
        "пленка",
        "плёнка",
        "tempered glass",
        "glass",

        // Клавиатуры
        "клавиатура",
        "клавиатуры",
        "keyboard",

        // Зарядка
        "зарядное устройство",
        "зарядка",
        "зарядное",
        "charger",
        "адаптер питания",

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
        "стилусы",
        "stylus",

        // Наушники
        "наушник",
        "наушники",
        "earbuds",
        "headphones",
        "buds",

        // Чехлы-книжки
        "книжка",

        // Прочее
        "аксессуар",
        "аксессуары",

        "переходная рамка",

        "магнитный держатель",

        "автомобильный держатель",

        "подставка",

        "dock",
        "docking",

        "hub",

        "usb hub",

        "power bank",
        "powerbank",

        "внешний аккумулятор",

        "микрофон",

        "microphone",

        "накладка",

        "крышка",

        "бампер"

    ];


    return words.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// СЛУЖЕБНЫЕ / ГРУППОВЫЕ СТРОКИ
// ======================================================

function isGroupRow(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return true;

    }


    // --------------------------------------------------
    // Общие количества
    //
    // Фитнес-браслеты - 34
    // Планшеты - 17
    // Умные часы - 50
    // --------------------------------------------------

    if (
        /[-–—]\s*\d+(?:[.,]\d+)?\s*$/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Начало строки с числа:
    //
    // 0.1 Смартфоны Xiaomi - 70
    // 17 Планшетов
    // 13 Для планшетов
    // --------------------------------------------------

    if (
        /^\d+(?:[.,]\d+)?\s+/.test(text)
    ) {

        const afterNumber =
            text.replace(
                /^\d+(?:[.,]\d+)?\s+/,
                ""
            );


        const groupWords = [

            "смартфон",
            "смартфоны",
            "планшет",
            "планшеты",
            "планшетов",
            "часы",
            "умные часы",
            "смарт часы",
            "смарт-часы",
            "фитнес браслеты",
            "фитнес-браслеты",
            "аксессуары",
            "аксессуары для планшетов",
            "аксессуары для смартфонов",
            "для планшетов",
            "для смартфонов"

        ];


        if (
            groupWords.some(
                word =>
                    afterNumber === word ||
                    afterNumber.startsWith(word + " ")
            )
        ) {

            return true;

        }

    }


    // --------------------------------------------------
    // Заголовки групп
    // --------------------------------------------------

    const groupNames = [

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

        "смартфоны",

        "планшеты",

        "часы",

        "умные часы",

        "смарт часы",
        "смарт-часы",

        "фитнес браслеты",
        "фитнес-браслеты",

        "наушники",

        "телевизоры",

        "камеры",

        "пылесосы",

        "итого",
        "всего"

    ];


    if (
        groupNames.includes(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Строки:
    //
    // Фитнес-браслеты 34
    // Планшеты 13
    // Умные часы 50
    // --------------------------------------------------

    if (
        /^(смартфоны|планшеты|планшетов|часы|умные часы|смарт-часы|смарт часы|фитнес-браслеты|фитнес браслеты|наушники|аксессуары).*?\s+\d+(?:[.,]\d+)?\s*$/
            .test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Специальные строки из твоей 1С
    // --------------------------------------------------

    if (
        text.startsWith("карточка для ")
    ) {

        return true;

    }


    if (
        text.startsWith("для планшетов")
    ) {

        return true;

    }


    if (
        text.startsWith("для планшета")
    ) {

        return true;

    }


    if (
        text.startsWith("для смартфонов")
    ) {

        return true;

    }


    if (
        text.startsWith("для смартфона")
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ПРОВЕРКА НА РЕАЛЬНЫЙ ТОВАР
// ======================================================

function looksLikeRealProduct(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return false;

    }


    // --------------------------------------------------
    // Если это аксессуар — это реальный товар
    // --------------------------------------------------

    if (
        isAccessoryName(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Явные товарные слова
    // --------------------------------------------------

    const productWords = [

        "смартфон",
        "smartphone",

        "xiaomi",

        "redmi",

        "планшет",
        "tablet",

        "redmi pad",
        "xiaomi pad",

        "наушник",
        "buds",
        "earbuds",
        "headphones",

        "watch",

        "часы",

        "браслет",
        "band",

        "телевизор",
        "television",

        "tv",

        "камера",
        "camera",

        "пылесос",
        "vacuum",

        "очиститель",
        "увлажнитель",

        "фен",

        "бритв",

        "весы",

        "лампа",

        "мышь",
        "mouse",

        "монитор",
        "monitor",

        "маршрутизатор",
        "router",

        "робот",

        "колонка",
        "speaker"

    ];


    return productWords.some(
        word =>
            text.includes(word)
    );

}


// ======================================================
// МОДЕЛЬНАЯ ГРУППА
// ======================================================

function isModelGroupRow(
    name,
    rows,
    rowIndex,
    nameColumn
) {

    const text =
        normalizeText(name);


    if (!text) {

        return true;

    }


    // Если аксессуар — оставляем.
    if (
        isAccessoryName(text)
    ) {

        return false;

    }


    // Если явно товар — оставляем.
    if (
        looksLikeRealProduct(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Названия вроде:
    //
    // 17T
    // 17T Pro
    // Redmi Note 15
    //
    // Проверяем следующие строки.
    // --------------------------------------------------

    if (
        text.length <= 30
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

            const next =
                rows[i];


            if (
                !Array.isArray(next)
            ) {

                continue;

            }


            const nextName =
                normalizeText(
                    next[nameColumn]
                );


            if (!nextName) {

                continue;

            }


            if (
                nextName.includes(text) &&
                nextName.length >
                text.length + 5
            ) {

                return true;

            }

        }

    }


    return false;

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(product) {

    const category =
        normalizeText(
            product.category
        );

    const name =
        normalizeText(
            product.name
        );


    const text =
        category + " " + name;


    // ==================================================
    // 1. АКСЕССУАРЫ
    // ==================================================
    //
    // ОБЯЗАТЕЛЬНО ПЕРВЫМИ.
    //
    // Например:
    //
    // Чехол для Redmi Pad 2
    //
    // содержит Redmi Pad,
    // но это НЕ планшет.
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
        text.includes("smartphone") ||
        (
            (
                text.includes("xiaomi") ||
                text.includes("redmi")
            ) &&
            (
                text.includes("note") ||
                text.includes("iphone")
            )
        )
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // 3. ПЛАНШЕТЫ
    // ==================================================

    if (
        text.includes("планшет") ||
        text.includes("tablet") ||
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
        text.includes("headphones")
    ) {

        return "Наушники";

    }


    // ==================================================
    // 7. ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        text.includes("телевизор") ||
        text.includes("телевизоры") ||
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
// ОСТАТКИ
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
// НОРМАЛИЗАЦИЯ
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
// РЕНДЕР СПИСКА
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
// КНОПКИ ОСТАТКА
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


            // Склад

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

            headerRow,

            nameColumn,

            displayColumn,

            warehouseColumn,

            totalColumn

        };

    }


    // Резервная структура:
    //
    // A = Номенклатура
    // E = Склад
    // G = Витрина
    // H = Итого

    console.warn(
        "Используется резервная структура A/E/G/H."
    );


    return {

        headerRow:
            headerRow !== -1
                ? headerRow
                : 0,

        nameColumn: 0,

        displayColumn: 4,

        warehouseColumn: 6,

        totalColumn: 7

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


    if (!columns) {

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


        const normalizedName =
            normalizeText(name);


        // ==================================================
        // ГРУППЫ
        // ==================================================

        if (
            isGroupRow(name)
        ) {

            console.log(
                "Пропущена группа:",
                name
            );

            continue;

        }


        // ==================================================
        // АКСЕССУАРЫ
        // ==================================================

        const accessory =
            isAccessoryName(
                name
            );


        // ==================================================
        // МОДЕЛЬНЫЕ ГРУППЫ
        // ==================================================

        if (
            !accessory &&
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
        // ЗАЩИТА ОТ СЛУЖЕБНЫХ СТРОК
        // ==================================================

        if (
            !accessory &&
            !looksLikeRealProduct(name)
        ) {

            console.log(
                "Пропущена подозрительная строка:",
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
        // ТОВАР
        // ==================================================

        const product = {

            id:
                productId++,

            name,

            category: "",

            memory: "",

            color: "",

            display,

            warehouse,

            quantity:
                display +
                warehouse,

            description: "",

            tip: "",

            specs: {}

        };


        // ==================================================
        // КАТЕГОРИЯ
        // ==================================================

        product.category =
            detectCategory(
                product
            );


        result.push(
            product
        );

    }


    // ==================================================
    // СТАТИСТИКА
    // ==================================================

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


                        console.log(
                            "Первые строки:",
                            rows.slice(
                                0,
                                20
                            )
                        );


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
                        // НОВАЯ БАЗА
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
                        // РЕНДЕР
                        // ==================================================

                        renderProducts(
                            products
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                `Готово. Загружено товаров: ${products.length}`;

                        }


                        console.log(
                            "================================="
                        );


                        console.log(
                            "ИМПОРТ ЗАВЕРШЁН"
                        );


                        console.log(
                            "Всего товаров:",
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


    loadSavedProducts();


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