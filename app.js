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
    // Чехлы / клавиатуры для планшетов тоже
    // попадут сюда.
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
        text.includes("tv ")
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
    // АКСЕССУАРЫ ДЛЯ ПЛАНШЕТОВ
    // --------------------------------------------------

    if (
        text.includes("чехол для планшета") ||
        text.includes("чехол для redmi pad") ||
        text.includes("чехол для xiaomi pad") ||
        text.includes("клавиатура для планшета") ||
        text.includes("keyboard") &&
        text.includes("pad")
    ) {

        return "Планшеты";

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
    // СТЕКЛА
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
// ОПРЕДЕЛЕНИЕ ОСТАТКОВ
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
// ПОИСК ЗАГОЛОВКА 1С
// ======================================================

function find1CColumns(rows) {

    let headerRow = -1;

    let nameColumn = -1;

    let totalColumn = -1;


    const limit =
        Math.min(
            rows.length,
            40
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
                text.includes("номенклатура")
            ) {

                nameColumn = j;

                headerRow = i;

            }


            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = j;

            }

        }


        if (
            nameColumn !== -1 &&
            totalColumn !== -1
        ) {

            break;

        }

    }


    // --------------------------------------------------
    // В твоей выгрузке:
    //
    // Номенклатура
    // Склад ТЦ Европа
    // Склад ТЦ Европа ОВ
    // Итого
    //
    // Поэтому две колонки непосредственно перед
    // Итого — это два реальных остатка.
    // --------------------------------------------------

    if (
        nameColumn !== -1 &&
        totalColumn >= nameColumn + 2
    ) {

        return {

            headerRow:
                headerRow,

            nameColumn:
                nameColumn,

            displayColumn:
                totalColumn - 2,

            warehouseColumn:
                totalColumn - 1,

            totalColumn:
                totalColumn

        };

    }


    return null;

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


    // Например:
    //
    // 01 Смартфоны Xiaomi
    // 02 АКСЕССУАРЫ
    //
    if (
        /^\d{1,3}\s+/.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// ПОХОЖЕ ЛИ НАЗВАНИЕ НА СТРОКУ-ГРУППУ
// ======================================================
//
// В выгрузке 1С встречаются:
//
// 17T
// 17T Pro
// Redmi 6A
// Redmi Note 15 Pro
//
// А ниже идут реальные SKU:
//
// Смартфон Xiaomi 17T ...
//
// Такие строки являются промежуточными группами,
// а не отдельными товарами.
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

        return false;

    }


    // Слишком длинные строки почти всегда
    // являются полноценным товаром.
    if (
        cleanName.length > 35
    ) {

        return false;

    }


    // Если уже есть явное описание типа товара,
    // это настоящий товар.
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
    // Если ниже есть длинное название, которое
    // содержит имя текущей строки — текущая строка
    // является группой.
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


        if (
            !nextName
        ) {

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


    // --------------------------------------------------
    // Находим реальные колонки выгрузки.
    // --------------------------------------------------

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
            "Не удалось определить колонки выгрузки 1С."
        );


        return result;

    }


    let productId = 1;


    // --------------------------------------------------
    // Начинаем после строки заголовков.
    // --------------------------------------------------

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


        // ------------------------------------------------
        // Название берём ТОЛЬКО из колонки Номенклатура.
        //
        // Больше никаких "первых чисел после названия".
        // ------------------------------------------------

        let name =
            row[
                columns.nameColumn
            ];


        if (
            name === undefined ||
            name === null ||
            String(name).trim() === ""
        ) {

            // На случай merged cells:
            // ищем первое текстовое значение
            // до колонки Итого.
            for (
                let j = columns.nameColumn;
                j < columns.displayColumn;
                j++
            ) {

                const value =
                    String(
                        row[j] ?? ""
                    ).trim();


                if (
                    value &&
                    isNaN(
                        Number(
                            value.replace(",", ".")
                        )
                    )
                ) {

                    name =
                        value;

                    break;

                }

            }

        }


        name =
            String(
                name ?? ""
            ).trim();


        if (!name) {

            continue;

        }


        // ------------------------------------------------
        // Убираем строки-разделы.
        // ------------------------------------------------

        if (
            isSectionRow(name)
        ) {

            continue;

        }


        // ------------------------------------------------
        // Убираем промежуточные модельные группы.
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
                "Пропущена группа:",
                name
            );

            continue;

        }


        // ------------------------------------------------
        // ЧИТАЕМ ОСТАТКИ.
        //
        // ВАЖНО:
        //
        // displayColumn =
        // Склад ТЦ Европа
        //
        // warehouseColumn =
        // Склад ТЦ Европа ОВ
        //
        // totalColumn =
        // Итого
        //
        // Мы НЕ используем Итого для расчёта двух
        // остатков.
        // ------------------------------------------------

        let display =
            number(
                row[
                    columns.displayColumn
                ]
            );


        let warehouse =
            number(
                row[
                    columns.warehouseColumn
                ]
            );


        const totalFromFile =
            number(
                row[
                    columns.totalColumn
                ]
            );


        // ------------------------------------------------
        // Если оба склада пустые, но Итого есть,
        // считаем остаток складским.
        //
        // Это защита для строк, где 1С оставляет
        // только итоговое количество.
        // ------------------------------------------------

        if (
            display === 0 &&
            warehouse === 0 &&
            totalFromFile > 0
        ) {

            warehouse =
                totalFromFile;

        }


        // ------------------------------------------------
        // Отрицательных остатков быть не должно.
        // ------------------------------------------------

        display =
            Math.max(
                0,
                display
            );


        warehouse =
            Math.max(
                0,
                warehouse
            );


        // ------------------------------------------------
        // Создаём товар.
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


        // ------------------------------------------------
        // Категория.
        // ------------------------------------------------

        product.category =
            detectCategory(
                product
            );


        // ------------------------------------------------
        // Добавляем.
        // ------------------------------------------------

        result.push(
            product
        );

    }


    console.log(
        "Реально импортировано:",
        result.length
    );


    // --------------------------------------------------
    // Статистика для проверки.
    // --------------------------------------------------

    const stats = {};


    result.forEach(
        product => {

            const category =
                product.category;


            if (!stats[category]) {

                stats[category] = 0;

            }


            stats[category]++;

        }
    );


    console.log(
        "Категории:",
        stats
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


                        // Для диагностики показываем первые
                        // 15 строк в консоли.
                        console.log(
                            "Первые строки:",
                            rows.slice(0, 15)
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
                                "Не удалось найти товары в выгрузке 1С. Проверьте структуру файла."
                            );

                        }


                        // ------------------------------------------------
                        // ВАЖНО:
                        //
                        // Старую базу заменяем ТОЛЬКО после того,
                        // как новый файл успешно разобран.
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
                        // Сохраняем новую базу.
                        // ------------------------------------------------

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


                        // ------------------------------------------------
                        // Показываем товары.
                        // ------------------------------------------------

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
                            "Товаров:",
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