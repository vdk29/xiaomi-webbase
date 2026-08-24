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
        .replace(/–/g, "-")
        .replace(/—/g, "-")
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
//
// ВАЖНО:
//
// Проверяем аксессуары ДО основной категории.
//
// Например:
//
// "Чехол для Redmi Pad 2"
//
// не должен стать планшетом.
//
// ======================================================

function isAccessoryName(name) {

    const text =
        normalizeText(name);


    const words = [

        // Чехлы
        "чехол",
        "case",

        // Стекла
        "защитное стекло",
        "защитная пленка",
        "защитная плёнка",
        "стекло защитное",
        "защитная защита",
        "стекло",

        // Пленки
        "пленка",
        "плёнка",

        // Клавиатуры
        "клавиатура",
        "keyboard",

        // Зарядки
        "зарядное устройство",
        "зарядка",
        "зарядный блок",
        "зарядное",
        "charger",
        "адаптер питания",

        // Кабели
        "кабель",
        "cable",

        // Переходники
        "переходник",
        "adapter",

        // Ремешки
        "ремешок",
        "ремешки",
        "strap",

        // Держатели
        "держатель",
        "holder",

        // Стилусы
        "стилус",
        "stylus",

        // Наушники
        "наушник",
        "наушники",
        "earbuds",
        "headphones",
        "buds",

        // Аксессуары
        "аксессуар",
        "аксессуары"

    ];


    return words.some(
        word => text.includes(word)
    );

}


// ======================================================
// СЛУЖЕБНАЯ СТРОКА 1С
// ======================================================
//
// Эти строки НЕ являются товарами.
//
// Примеры:
//
// 01 Смартфоны 70
// 02 Планшеты 17
// Фитнес-браслеты - 34
// Умные часы 50
// Для Redmi Note 15
// Для Redmi Pad 2
//
// ======================================================

function isServiceRow(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return true;

    }


    // --------------------------------------------------
    // Строки "Для ..."
    // --------------------------------------------------

    if (
        text.startsWith("для ")
    ) {

        return true;

    }


    // --------------------------------------------------
    // Общие категории с количеством
    //
    // Например:
    //
    // смартфоны 70
    // планшеты 17
    // умные часы 50
    //
    // 01 смартфоны 70
    // --------------------------------------------------

    if (
        /^(?:\d+\s+)?(смартфон|смартфоны|планшет|планшеты|умные часы|смарт часы|смарт-часы|часы|фитнес браслеты|фитнес-браслеты|наушники|телевизоры|камеры|пылесосы|аксессуары)(?:\s*[-]?\s*\d+)?\s*$/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // Любая строка вида:
    //
    // "Фитнес-браслеты - 34"
    // "Планшеты - 17"
    // --------------------------------------------------

    if (
        /^(смартфоны|планшеты|фитнес[- ]браслеты|умные часы|смарт[- ]часы|часы|наушники|аксессуары).*-\s*\d+\s*$/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // "Итого", "Всего"
    // --------------------------------------------------

    if (
        text === "итого" ||
        text === "всего"
    ) {

        return true;

    }


    // --------------------------------------------------
    // Заголовки категорий
    // --------------------------------------------------

    const groupNames = [

        "смартфоны",
        "планшеты",
        "умные часы",
        "смарт часы",
        "смарт-часы",
        "часы",

        "фитнес браслеты",
        "фитнес-браслеты",

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
        "аксессуары для смарт-часов"

    ];


    if (
        groupNames.includes(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ПРОВЕРКА НА РЕАЛЬНЫЙ ТОВАР
// ======================================================
//
// ВАЖНО:
//
// Теперь мы НЕ считаем товаром просто:
//
// "Mi Band 10"
// "Redmi Pad 2"
// "Xiaomi Watch"
//
// если это отдельная строка-группа.
//
//
//
// Реальный товар должен начинаться с понятного
// типа товара.
//
// Например:
//
// "Фитнес-браслет Xiaomi Smart Band 11"
// "Смарт-часы Xiaomi Watch 5"
// "Планшет Redmi Pad 2"
// "Смартфон Xiaomi 17"
//
// ======================================================

function looksLikeRealProduct(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return false;

    }


    // --------------------------------------------------
    // Сначала исключаем служебные строки
    // --------------------------------------------------

    if (
        isServiceRow(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Аксессуары
    //
    // Здесь достаточно названия товара.
    // --------------------------------------------------

    if (
        isAccessoryName(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // СМАРТФОН
    // --------------------------------------------------

    if (
        /^(?:смартфон|смартфоны)\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // ПЛАНШЕТ
    // --------------------------------------------------

    if (
        /^(?:планшет|планшеты)\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТ
    // --------------------------------------------------

    if (
        /^фитнес[- ]браслет\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        /^смарт[- ]часы\b/.test(text) ||
        /^умные часы\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        /^(?:наушник|наушники)\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОРЫ
    // --------------------------------------------------

    if (
        /^(?:телевизор|телевизоры)\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        /^(?:камера|камеры)\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        /^(?:пылесос|пылесосы)\b/.test(text)
    ) {

        return true;

    }


    // --------------------------------------------------
    // ДРУГИЕ ТОВАРЫ
    //
    // Можно постепенно расширять.
    // --------------------------------------------------

    const otherProductPrefixes = [

        "очиститель воздуха",
        "увлажнитель воздуха",
        "увлажнитель",
        "фен",
        "бритва",
        "электробритва",
        "весы",
        "лампа",
        "монитор",
        "мышь",
        "маршрутизатор",
        "роутер"

    ];


    if (
        otherProductPrefixes.some(
            prefix =>
                text.startsWith(prefix)
        )
    ) {

        return true;

    }


    // --------------------------------------------------
    // ВСЕ ОСТАЛЬНОЕ НЕ СЧИТАЕМ ТОВАРОМ
    // --------------------------------------------------

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
        category + " " + name;


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
        /^смартфон\b/.test(name) ||
        /^смартфоны\b/.test(name) ||
        category.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // ==================================================
    // 3. ПЛАНШЕТЫ
    // ==================================================

    if (
        /^планшет\b/.test(name) ||
        /^планшеты\b/.test(name) ||
        category.includes("планшет")
    ) {

        return "Планшеты";

    }


    // ==================================================
    // 4. ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

    if (
        /^фитнес[- ]браслет\b/.test(name) ||
        category.includes("фитнес") &&
        category.includes("браслет")
    ) {

        return "Фитнес-браслеты";

    }


    // ==================================================
    // 5. СМАРТ-ЧАСЫ
    // ==================================================

    if (
        /^смарт[- ]часы\b/.test(name) ||
        /^умные часы\b/.test(name) ||
        category.includes("смарт") &&
        category.includes("час")
    ) {

        return "Смарт-часы";

    }


    // ==================================================
    // 6. НАУШНИКИ
    // ==================================================

    if (
        /^наушник/.test(name) ||
        category.includes("наушник")
    ) {

        return "Наушники";

    }


    // ==================================================
    // 7. ТЕЛЕВИЗОРЫ
    // ==================================================

    if (
        /^телевизор/.test(name) ||
        category.includes("телевизор")
    ) {

        return "Телевизоры";

    }


    // ==================================================
    // 8. КАМЕРЫ
    // ==================================================

    if (
        /^камера/.test(name) ||
        category.includes("камер")
    ) {

        return "Камеры";

    }


    // ==================================================
    // 9. ПЫЛЕСОСЫ
    // ==================================================

    if (
        /^пылесос/.test(name) ||
        category.includes("пылесос")
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
// НОРМАЛИЗАЦИЯ БАЗЫ
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

                nameColumn =
                    j;

                headerRow =
                    i;

            }


            // Витрина / ОВ

            if (
                text.includes(
                    "склад тц европолис ов"
                )
            ) {

                warehouseColumn =
                    j;

            }


            // Склад

            if (
                text.includes(
                    "склад тц европолис"
                ) &&
                !text.includes("ов")
            ) {

                displayColumn =
                    j;

            }


            // Итого

            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn =
                    j;

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


    // ==================================================
    // РЕЗЕРВНАЯ СТРУКТУРА
    //
    // A = Номенклатура
    // E = Склад
    // G = Витрина
    // H = Итого
    // ==================================================

    console.warn(
        "Не удалось определить все колонки. Использую A/E/G/H."
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


        // ==================================================
        // ГЛАВНАЯ ПРОВЕРКА
        // ==================================================
        //
        // Здесь отсекаются:
        //
        // 01 Смартфоны 70
        // Фитнес-браслеты - 34
        // Умные часы 50
        // Для Redmi Note 15
        // Для Redmi Pad 2
        // Mi Band 10 Pro
        //
        // и другие строки-группы.
        // ==================================================

        if (
            !looksLikeRealProduct(name)
        ) {

            console.log(
                "Пропущена строка 1С:",
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
        // СОЗДАЁМ ТОВАР
        // ==================================================

        const product = {

            id:
                productId++,

            name,

            category:
                "",

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


        // ==================================================
        // КАТЕГОРИЯ
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


    // ==================================================
    // СТАТИСТИКА
    // ==================================================

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
                                "Не удалось найти реальные товары в выгрузке 1С."
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
    // Загружаем сохранённую базу
    // --------------------------------------------------

    loadSavedProducts();


    // --------------------------------------------------
    // Нормализуем
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