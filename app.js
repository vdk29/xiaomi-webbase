// ======================================================
// XIAOMI WEBBASE
// APP.JS
// Версия с загрузкой базы из 1С
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
// НАСТРОЙКИ
// ======================================================

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";

const PRODUCTS_IMPORT_VERSION =
    "1";


// ======================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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
            .replace(/\s/g, "")
            .replace(",", ".");


    const result =
        Number(text);


    return Number.isFinite(result)
        ? result
        : 0;

}


// ======================================================
// ЭКРАНИРОВАНИЕ HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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

        display,

        warehouse,

        total:
            display + warehouse

    };

}


// ======================================================
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            PRODUCTS_STORAGE_KEY,
            JSON.stringify(products)
        );

        localStorage.setItem(
            "xiaomiWebBaseProductsVersion",
            PRODUCTS_IMPORT_VERSION
        );

        console.log(
            "База товаров сохранена:",
            products.length
        );

    } catch (error) {

        console.error(
            "Ошибка сохранения базы:",
            error
        );

    }

}


// ======================================================
// ЗАГРУЗКА СОХРАНЁННОЙ БАЗЫ
// ======================================================

function loadSavedProducts() {

    try {

        const saved =
            localStorage.getItem(
                PRODUCTS_STORAGE_KEY
            );


        if (!saved) {

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (
            !Array.isArray(parsed)
        ) {

            return;

        }


        /*
         * Не загружаем пустую базу.
         */

        if (
            parsed.length === 0
        ) {

            return;

        }


        /*
         * Заменяем содержимое
         * массива products.
         */

        products.length = 0;


        products.push(
            ...parsed
        );


        console.log(
            "Сохранённая база загружена:",
            products.length,
            "товаров"
        );


    } catch (error) {

        console.error(
            "Ошибка загрузки сохранённой базы:",
            error
        );

    }

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
                    Товаров нет
                </strong>

                <p>
                    Загрузите таблицу из 1С
                    или добавьте товары в базу.
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
                            product.category || ""
                        )}

                    </div>


                    <div class="product-name">

                        ${escapeHTML(
                            product.name ||
                            "Без названия"
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
        searchInput.value
            .trim()
            .toLowerCase();


    if (!query) {

        renderProducts(
            products
        );

        return;

    }


    const result =
        products.filter(
            product => {

                const text = `

                    ${product.id || ""}

                    ${product.name || ""}

                    ${product.category || ""}

                    ${product.memory || ""}

                    ${product.color || ""}

                    ${product.description || ""}

                    ${product.tip || ""}

                `.toLowerCase();


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


                renderProducts(
                    filtered
                );

            }
        );

    }
);


// ======================================================
// ОБРАБОТКА ФАЙЛА 1С
// ======================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        handleFileImport
    );

}


// ======================================================
// HANDLE FILE IMPORT
// ======================================================

async function handleFileImport(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    if (fileName) {

        fileName.textContent =
            file.name;

    }


    setImportStatus(
        "Читаем файл...",
        "loading"
    );


    try {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        let rows = [];


        // ------------------------------------------
        // EXCEL
        // ------------------------------------------

        if (
            extension === "xlsx" ||
            extension === "xls"
        ) {

            if (
                typeof XLSX === "undefined"
            ) {

                throw new Error(
                    "Библиотека Excel не загрузилась."
                );

            }


            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    {
                        type: "array"
                    }
                );


            const firstSheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            rows =
                XLSX.utils.sheet_to_json(
                    firstSheet,
                    {
                        defval: ""
                    }
                );

        }


        // ------------------------------------------
        // CSV
        // ------------------------------------------

        else if (
            extension === "csv"
        ) {

            const text =
                await file.text();


            rows =
                parseCSV(
                    text
                );

        }


        else {

            throw new Error(
                "Поддерживаются только XLSX, XLS и CSV."
            );

        }


        console.log(
            "Строк в исходной таблице:",
            rows.length
        );


        if (
            rows.length === 0
        ) {

            throw new Error(
                "В таблице нет данных."
            );

        }


        // ------------------------------------------
        // ПРЕОБРАЗУЕМ ТАБЛИЦУ
        // ------------------------------------------

        const importedProducts =
            convertRowsToProducts(
                rows
            );


        if (
            importedProducts.length === 0
        ) {

            throw new Error(
                "Не удалось найти товары в таблице."
            );

        }


        // ------------------------------------------
        // ЗАМЕНЯЕМ БАЗУ
        // ------------------------------------------

        products.length = 0;


        products.push(
            ...importedProducts
        );


        saveProducts();


        // ------------------------------------------
        // ПОКАЗЫВАЕМ
        // ------------------------------------------

        renderProducts(
            products
        );


        setImportStatus(
            `Готово. Загружено товаров: ${products.length}`,
            "success"
        );


        console.log(
            "Импорт завершён:",
            products
        );


    } catch (error) {

        console.error(
            "Ошибка импорта:",
            error
        );


        setImportStatus(
            "Ошибка: " +
            error.message,
            "error"
        );

    }


    /*
     * Позволяет повторно выбрать тот же файл.
     */

    fileInput.value = "";

}


// ======================================================
// СТАТУС ИМПОРТА
// ======================================================

function setImportStatus(
    text,
    type
) {

    if (!importStatus) {

        return;

    }


    importStatus.textContent =
        text;


    importStatus.className =
        "import-status";


    if (type) {

        importStatus.classList.add(
            type
        );

    }

}


// ======================================================
// CSV PARSER
// ======================================================

function parseCSV(text) {

    const lines =
        text
            .replace(/\r/g, "")
            .split("\n")
            .filter(
                line =>
                    line.trim() !== ""
            );


    if (
        lines.length === 0
    ) {

        return [];

    }


    const delimiter =
        lines[0].includes(";")
            ? ";"
            : ",";


    const headers =
        parseCSVLine(
            lines[0],
            delimiter
        );


    const result = [];


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const values =
            parseCSVLine(
                lines[i],
                delimiter
            );


        const row = {};


        headers.forEach(
            (header, index) => {

                row[header] =
                    values[index] || "";

            }
        );


        result.push(
            row
        );

    }


    return result;

}


// ======================================================
// CSV LINE
// ======================================================

function parseCSVLine(
    line,
    delimiter
) {

    const result = [];

    let current = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char =
            line[i];


        if (
            char === '"'
        ) {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;

            }

        }

        else if (
            char === delimiter &&
            !insideQuotes
        ) {

            result.push(
                current.trim()
            );

            current = "";

        }

        else {

            current += char;

        }

    }


    result.push(
        current.trim()
    );


    return result;

}


// ======================================================
// НОРМАЛИЗАЦИЯ НАЗВАНИЯ КОЛОНКИ
// ======================================================

function normalizeColumnName(
    value
) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/ё/g, "е");

}


// ======================================================
// ПОИСК КОЛОНКИ
// ======================================================

function findColumn(
    row,
    variants
) {

    const keys =
        Object.keys(row);


    for (
        const key of keys
    ) {

        const normalized =
            normalizeColumnName(
                key
            );


        for (
            const variant of variants
        ) {

            if (
                normalized ===
                normalizeColumnName(
                    variant
                )
            ) {

                return key;

            }

        }

    }


    return null;

}


// ======================================================
// ПОЛУЧЕНИЕ ЗНАЧЕНИЯ КОЛОНКИ
// ======================================================

function getColumnValue(
    row,
    variants
) {

    const column =
        findColumn(
            row,
            variants
        );


    if (!column) {

        return "";

    }


    return row[column];

}


// ======================================================
// ПРЕОБРАЗОВАНИЕ СТРОК 1С В ТОВАРЫ
// ======================================================

function convertRowsToProducts(
    rows
) {

    const result = [];


    rows.forEach(
        (row, index) => {

            /*
             * ----------------------------------------
             * НАЗВАНИЕ
             * ----------------------------------------
             */

            const name =
                getColumnValue(
                    row,
                    [
                        "Номенклатура",
                        "Товар",
                        "Наименование",
                        "Название",
                        "Наименование товара"
                    ]
                );


            /*
             * Если строки без названия —
             * пропускаем.
             */

            if (
                !String(name).trim()
            ) {

                return;

            }


            /*
             * ----------------------------------------
             * КАТЕГОРИЯ
             * ----------------------------------------
             */

            let category =
                getColumnValue(
                    row,
                    [
                        "Категория",
                        "Группа",
                        "Группа товаров",
                        "Вид номенклатуры",
                        "Тип номенклатуры"
                    ]
                );


            category =
                normalizeCategory(
                    category,
                    name
                );


            /*
             * ----------------------------------------
             * АРТИКУЛ
             * ----------------------------------------
             */

            const article =
                getColumnValue(
                    row,
                    [
                        "Артикул",
                        "Код",
                        "Код товара",
                        "Номенклатурный номер"
                    ]
                );


            /*
             * ----------------------------------------
             * ЦВЕТ
             * ----------------------------------------
             */

            const color =
                getColumnValue(
                    row,
                    [
                        "Цвет",
                        "Цвет товара",
                        "Цвет изделия"
                    ]
                );


            /*
             * ----------------------------------------
             * ПАМЯТЬ
             * ----------------------------------------
             */

            const memory =
                getColumnValue(
                    row,
                    [
                        "Память",
                        "Объем памяти",
                        "Память/объем",
                        "Характеристика"
                    ]
                );


            /*
             * ----------------------------------------
             * ОБЩИЙ ОСТАТОК
             * ----------------------------------------
             */

            const quantity =
                number(
                    getColumnValue(
                        row,
                        [
                            "Количество",
                            "Остаток",
                            "Остаток товара",
                            "Количество остаток",
                            "Кол-во"
                        ]
                    )
                );


            /*
             * ----------------------------------------
             * ВИТРИНА
             * ----------------------------------------
             *
             * Если в таблице есть отдельная колонка
             * витрины — используем её.
             */

            let display =
                number(
                    getColumnValue(
                        row,
                        [
                            "Витрина",
                            "На витрине",
                            "Витринный остаток",
                            "Количество на витрине"
                        ]
                    )
                );


            /*
             * ----------------------------------------
             * СКЛАД
             * ----------------------------------------
             */

            let warehouse =
                number(
                    getColumnValue(
                        row,
                        [
                            "Склад",
                            "На складе",
                            "Остаток на складе",
                            "Количество на складе"
                        ]
                    )
                );


            /*
             * Если отдельных колонок витрина/склад
             * нет, считаем весь остаток складом.
             */

            const hasDisplayColumn =
                findColumn(
                    row,
                    [
                        "Витрина",
                        "На витрине",
                        "Витринный остаток",
                        "Количество на витрине"
                    ]
                );


            const hasWarehouseColumn =
                findColumn(
                    row,
                    [
                        "Склад",
                        "На складе",
                        "Остаток на складе",
                        "Количество на складе"
                    ]
                );


            if (
                !hasDisplayColumn &&
                !hasWarehouseColumn
            ) {

                warehouse =
                    quantity;

            }


            /*
             * ----------------------------------------
             * LDU
             * ----------------------------------------
             */

            const ldu =
                number(
                    getColumnValue(
                        row,
                        [
                            "LDU",
                            "ЛДУ",
                            "Демо",
                            "Демонстрационный",
                            "Демонстрация"
                        ]
                    )
                );


            /*
             * ----------------------------------------
             * DESCRIPTION
             * ----------------------------------------
             */

            const description =
                getColumnValue(
                    row,
                    [
                        "Описание",
                        "Описание товара",
                        "Комментарий"
                    ]
                );


            /*
             * ----------------------------------------
             * ID
             * ----------------------------------------
             */

            const id =
                article
                    ? String(article)
                    : String(
                        100000 + index
                    );


            /*
             * ----------------------------------------
             * СОЗДАЁМ ТОВАР
             * ----------------------------------------
             */

            const product = {

                id,

                name:
                    String(name).trim(),

                category,

                memory:
                    String(memory || "").trim(),

                color:
                    String(color || "").trim(),

                quantity:
                    display + warehouse,

                ldu,

                display,

                warehouse,

                description:
                    String(
                        description || ""
                    ).trim(),

                specs: {},

                tip:
                    ""

            };


            /*
             * Добавляем дополнительные данные
             * из таблицы в характеристики.
             */

            if (article) {

                product.specs["Артикул"] =
                    String(article);

            }


            if (memory) {

                product.specs["Память"] =
                    String(memory);

            }


            if (color) {

                product.specs["Цвет"] =
                    String(color);

            }


            if (ldu > 0) {

                product.specs["LDU"] =
                    ldu + " шт.";

            }


            result.push(
                product
            );

        }
    );


    return result;

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function normalizeCategory(
    category,
    name
) {

    const text =
        (
            String(category || "") +
            " " +
            String(name || "")
        )
        .toLowerCase();


    if (
        text.includes("смартфон") ||
        text.includes("iphone") ||
        text.includes("redmi") ||
        text.includes("xiaomi 17")
    ) {

        return "Смартфоны";

    }


    if (
        text.includes("планшет") ||
        text.includes("pad")
    ) {

        return "Планшеты";

    }


    if (
        text.includes("watch") ||
        text.includes("часы")
    ) {

        return "Смарт-часы";

    }


    if (
        text.includes("band") ||
        text.includes("браслет")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        category &&
        String(category).trim()
    ) {

        return String(
            category
        ).trim();

    }


    return "Другое";

}


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

function renderSpecs(
    product
) {

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

function renderProduct(
    product
) {

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
                        product.category || ""
                    )}

                </div>


                <h1>

                    ${escapeHTML(
                        product.name ||
                        "Без названия"
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


                <!-- ==================================
                     НАЛИЧИЕ
                ================================== -->

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


                <!-- ==================================
                     ОПИСАНИЕ
                ================================== -->

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


                <!-- ==================================
                     ХАРАКТЕРИСТИКИ
                ================================== -->

                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <!-- ==================================
                     ПОДСКАЗКА
                ================================== -->

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

function setupQuantityButtons(
    product
) {

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


                    saveProducts();


                    renderProduct(
                        product
                    );

                }
            );

        }
    );

}


// ======================================================
// КНОПКА НАЗАД
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
// START
// ======================================================

function initApp() {

    /*
     * Проверяем products-data.js
     */

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "Ошибка: products-data.js не подключен."
        );


        if (productsList) {

            productsList.innerHTML = `

                <div class="empty-result">

                    <strong>
                        Ошибка загрузки базы
                    </strong>

                    <p>
                        Файл products-data.js
                        не подключён или содержит ошибку.
                    </p>

                </div>

            `;

        }


        return;

    }


    /*
     * Сначала загружаем сохранённую базу.
     */

    loadSavedProducts();


    console.log(
        "Xiaomi WebBase:",
        products.length,
        "товаров"
    );


    /*
     * Главная страница.
     */

    if (productsList) {

        renderProducts(
            products
        );

    }


    /*
     * Страница товара.
     */

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