// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// Версия для выгрузки остатков из 1С
//
// ВАЖНО:
// products-data.js содержит исходный тестовый товар.
// После успешного импорта Excel новые товары сохраняются
// в localStorage.
//
// ПФ полностью игнорируется.
// Строки-группы 17T, 17T Pro, REDMI 17 и т.д.
// карточками товаров НЕ являются.
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
// DATA
// ======================================================

let currentProducts = [];


// ======================================================
// HELPERS
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
            .replace(/\u00A0/g, " ")
            .trim();

    if (!text) {
        return 0;
    }

    // 1С может отдавать:
    // 1,000
    // 1 000
    // 1.000
    // 1
    //
    // Для остатков 1С "1,000" фактически означает 1.

    text =
        text
            .replace(/\s/g, "")
            .replace(",", ".");

    const result =
        Number(text);

    if (!Number.isFinite(result)) {
        return 0;
    }

    return result;
}


function cleanNumber(value) {

    const result =
        number(value);

    if (
        Number.isInteger(result)
    ) {
        return result;
    }

    return Math.round(result * 1000) / 1000;
}


function normalizeText(value) {

    return String(
        value ?? ""
    )
        .replace(/\u00A0/g, " ")
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

}


function displayText(value) {

    return String(
        value ?? ""
    )
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


// ======================================================
// STOCK
// ======================================================

function getStock(product) {

    const display =
        cleanNumber(
            product.display
        );

    const warehouse =
        cleanNumber(
            product.warehouse
        );

    return {

        display,

        warehouse,

        total:
            display + warehouse

    };

}


// ======================================================
// PRODUCT CATEGORY
// ======================================================

function detectCategory(name) {

    const text =
        normalizeText(name);


    if (
        text.includes("смартфон") ||
        text.includes("redmi") ||
        text.includes("xiaomi 17") ||
        text.includes("xiaomi 15") ||
        text.includes("xiaomi 14")
    ) {

        return "Смартфоны";

    }


    if (
        text.includes("планшет") ||
        text.includes("pad ")
    ) {

        return "Планшеты";

    }


    if (
        text.includes("смарт-часы") ||
        text.includes("смарт часы") ||
        text.includes("watch")
    ) {

        return "Смарт-часы";

    }


    if (
        text.includes("фитнес-браслет") ||
        text.includes("smart band") ||
        text.includes("mi band")
    ) {

        return "Фитнес-браслеты";

    }


    return "Другое";

}


// ======================================================
// PRODUCT ROW DETECTION
// ======================================================
//
// В выгрузке 1С присутствуют:
// - категории
// - подкатегории
// - итоги
// - реальные товары
//
// Нам нужны только реальные товары.
//
// ======================================================

function isIgnoredName(name) {

    const text =
        normalizeText(name);


    if (!text) {
        return true;
    }


    // ПФ игнорируем полностью

    if (
        text.includes("(пф)")
    ) {

        return true;

    }


    // Итоговые строки

    const ignoredExact = [

        "итого",
        "номенклатура",
        "остатки на складах"

    ];


    if (
        ignoredExact.includes(text)
    ) {

        return true;

    }


    return false;

}


function looksLikeProduct(name) {

    const original =
        displayText(name);

    if (!original) {
        return false;
    }


    if (
        isIgnoredName(original)
    ) {
        return false;
    }


    const text =
        normalizeText(original);


    // ------------------------------------------
    // Явные товарные признаки
    // ------------------------------------------

    const productWords = [

        "смартфон",
        "планшет",
        "смарт-часы",
        "смарт часы",
        "фитнес-браслет",
        "фитнес браслет",
        "наушники",
        "колонка",
        "камера",
        "зарядное устройство",
        "зарядная станция",
        "кабель",
        "дата-кабель",
        "чехол",
        "стилус",
        "пылесос",
        "робот-пылесос",
        "очиститель",
        "увлажнитель",
        "внешний аккумулятор",
        "мышь",
        "монитор",
        "маршрутизатор",
        "ретранслятор",
        "батарейки",
        "ремешок",
        "телевизор",
        "аэрогриль",
        "фен",
        "массажер",
        "зубная щетка",
        "электробритва",
        "весы",
        "лампа",
        "кормушка",
        "поилка",
        "подарочный сертификат",
        "пакет подарочный",
        "держатель",
        "автовизитка",
        "адаптер",
        "дальномер",
        "компрессор",
        "подушка",
        "рюкзак"

    ];


    for (
        const word of productWords
    ) {

        if (
            text.includes(word)
        ) {

            return true;

        }

    }


    // ------------------------------------------
    // LDU
    // ------------------------------------------

    if (
        text.startsWith("(ldu)")
    ) {

        return true;

    }


    // ------------------------------------------
    // Некоторые товары не содержат очевидного
    // ключевого слова.
    //
    // Если есть модельный номер / артикул
    // в скобках — скорее всего это товар.
    // ------------------------------------------

    if (
        /\([a-z0-9]{5,}\)/i.test(original)
    ) {

        return true;

    }


    // ------------------------------------------
    // Явно групповые строки
    // ------------------------------------------

    const groupNames = [

        "17t",
        "17t pro",
        "redmi 17",
        "redmi note 15 pro",
        "старые",
        "аксессуары для планшетов",
        "аксессуары эко",
        "зарядные устройства",
        "кабели",
        "видео",
        "ip-камеры",
        "телевизоры",
        "товары diy",
        "товары для детей",
        "товары для животных",
        "товары для компьютера",
        "умные часы",
        "фитнес-браслеты",
        "mi band 10",
        "mi band 11",
        "mi band 9 active",
        "наушники",
        "очистители",
        "пылесосы",
        "xiaomi",
        "рюкзаки и чемоданы",
        "рюкзаки",
        "свет",
        "умный дом",
        "аксессуары",
        "сим карты",
        "сертификаты",
        "подарки"

    ];


    if (
        groupNames.includes(text)
    ) {

        return false;

    }


    return false;

}


// ======================================================
// HEADER DETECTION
// ======================================================

function findHeaderRow(rows) {

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


        const text =
            row
                .map(value =>
                    normalizeText(value)
                )
                .join(" | ");


        if (
            text.includes("номенклатура") &&
            (
                text.includes("склад") ||
                text.includes("итого")
            )
        ) {

            return i;

        }

    }


    return -1;

}


// ======================================================
// COLUMN DETECTION
// ======================================================

function findColumns(headerRow, rows) {

    let nameColumn = -1;

    let warehouseColumn = -1;

    let displayColumn = -1;

    let totalColumn = -1;


    // ------------------------------------------
    // Ищем по заголовку
    // ------------------------------------------

    headerRow.forEach(
        (value, index) => {

            const text =
                normalizeText(value);


            if (
                text.includes("номенклатура") &&
                nameColumn === -1
            ) {

                nameColumn =
                    index;

            }


            if (
                text.includes("склад тц европолис ов") &&
                displayColumn === -1
            ) {

                displayColumn =
                    index;

            }


            if (
                text === "склад тц европолис" &&
                warehouseColumn === -1
            ) {

                warehouseColumn =
                    index;

            }


            if (
                text.includes("итого") &&
                totalColumn === -1
            ) {

                totalColumn =
                    index;

            }

        }
    );


    // ------------------------------------------
    // Более свободный поиск
    // ------------------------------------------

    if (
        warehouseColumn === -1
    ) {

        headerRow.forEach(
            (value, index) => {

                const text =
                    normalizeText(value);


                if (
                    text.includes("склад") &&
                    !text.includes("ов") &&
                    warehouseColumn === -1
                ) {

                    warehouseColumn =
                        index;

                }

            }
        );

    }


    if (
        displayColumn === -1
    ) {

        headerRow.forEach(
            (value, index) => {

                const text =
                    normalizeText(value);


                if (
                    text.includes("ов") &&
                    text.includes("склад") &&
                    displayColumn === -1
                ) {

                    displayColumn =
                        index;

                }

            }
        );

    }


    // ------------------------------------------
    // Если Excel из-за объединённых ячеек
    // потерял заголовки, пытаемся найти
    // колонку Номенклатура по данным.
    // ------------------------------------------

    if (
        nameColumn === -1
    ) {

        for (
            let column = 0;
            column < headerRow.length;
            column++
        ) {

            let hits = 0;


            for (
                let rowIndex = 0;
                rowIndex < rows.length;
                rowIndex++
            ) {

                const value =
                    rows[rowIndex][column];


                if (
                    typeof value === "string" &&
                    looksLikeProduct(value)
                ) {

                    hits++;

                }


                if (
                    hits >= 3
                ) {

                    nameColumn =
                        column;

                    break;

                }

            }


            if (
                nameColumn !== -1
            ) {

                break;

            }

        }

    }


    return {

        nameColumn,

        warehouseColumn,

        displayColumn,

        totalColumn

    };

}


// ======================================================
// READ QUANTITY
// ======================================================

function readQuantity(
    row,
    column
) {

    if (
        column === -1 ||
        column === undefined
    ) {

        return 0;

    }


    return cleanNumber(
        row[column]
    );

}


// ======================================================
// PARSE EXCEL
// ======================================================

function parseExcelWorkbook(workbook) {

    if (
        !workbook ||
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
    ) {

        throw new Error(
            "В Excel не найдено ни одного листа."
        );

    }


    // Берём первый лист

    const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];


    const rows =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                header: 1,
                defval: ""
            }
        );


    if (
        !rows.length
    ) {

        throw new Error(
            "Таблица пустая."
        );

    }


    console.log(
        "Всего строк Excel:",
        rows.length
    );


    const headerIndex =
        findHeaderRow(rows);


    if (
        headerIndex === -1
    ) {

        console.error(
            "Не удалось найти строку заголовков."
        );

        console.log(
            "Первые строки:",
            rows.slice(0, 10)
        );

        throw new Error(
            "Не удалось найти строку с колонками Номенклатура и Склад."
        );

    }


    const headerRow =
        rows[headerIndex];


    const columns =
        findColumns(
            headerRow,
            rows.slice(headerIndex + 1)
        );


    console.log(
        "Найдена строка заголовков:",
        headerIndex
    );


    console.log(
        "Колонки:",
        columns
    );


    if (
        columns.nameColumn === -1
    ) {

        throw new Error(
            "Не удалось определить колонку с названием товара."
        );

    }


    // ------------------------------------------
    // Если обе колонки остатков не найдены,
    // не пытаемся угадывать.
    // ------------------------------------------

    if (
        columns.warehouseColumn === -1 ||
        columns.displayColumn === -1
    ) {

        console.warn(
            "Не удалось однозначно определить обе колонки остатков."
        );

        console.log(
            "Заголовок:",
            headerRow
        );

        throw new Error(
            "Не удалось определить колонки склада и витрины. Проверьте заголовок выгрузки 1С."
        );

    }


    const imported =
        [];


    let id =
        100000;


    // ------------------------------------------
    // Читаем строки после заголовка
    // ------------------------------------------

    for (
        let i = headerIndex + 1;
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
            displayText(
                rawName
            );


        if (
            !name
        ) {

            continue;

        }


        // ПФ полностью пропускаем

        if (
            normalizeText(name)
                .includes("(пф)")
        ) {

            continue;

        }


        // Только реальные товары

        if (
            !looksLikeProduct(name)
        ) {

            continue;

        }


        const warehouse =
            readQuantity(
                row,
                columns.warehouseColumn
            );


        const display =
            readQuantity(
                row,
                columns.displayColumn
            );


        // ------------------------------------------
        // Если в строке вообще нет остатков,
        // это не товар для нашей базы.
        // ------------------------------------------

        if (
            warehouse === 0 &&
            display === 0
        ) {

            // Оставляем товар только если это
            // действительно товарная строка.
            //
            // В данной базе пустые товары нам
            // не нужны.

            continue;

        }


        const category =
            detectCategory(
                name
            );


        const product = {

            id:
                id++,

            name,

            category,

            display,

            warehouse,

            quantity:
                display + warehouse,

            memory:
                "",

            color:
                "",

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        imported.push(
            product
        );

    }


    return imported;

}


// ======================================================
// SAVE PRODUCTS
// ======================================================

function saveImportedProducts(products) {

    try {

        localStorage.setItem(
            "xiaomiWebBaseProducts",
            JSON.stringify(products)
        );

        return true;

    } catch (error) {

        console.error(
            "Ошибка сохранения:",
            error
        );

        return false;

    }

}


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

            return null;

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            !Array.isArray(parsed)
        ) {

            return null;

        }


        return parsed;

    } catch (error) {

        console.error(
            "Ошибка загрузки сохранённой базы:",
            error
        );

        return null;

    }

}


// ======================================================
// IMPORT FILE
// ======================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            if (fileName) {

                fileName.textContent =
                    file.name;

            }


            if (importStatus) {

                importStatus.textContent =
                    "Читаем файл 1С...";

            }


            const reader =
                new FileReader();


            reader.onload =
                function (e) {

                    try {

                        if (
                            typeof XLSX === "undefined"
                        ) {

                            throw new Error(
                                "Библиотека XLSX не загрузилась."
                            );

                        }


                        const data =
                            new Uint8Array(
                                e.target.result
                            );


                        const workbook =
                            XLSX.read(
                                data,
                                {
                                    type: "array"
                                }
                            );


                        console.log(
                            "Листы Excel:",
                            workbook.SheetNames
                        );


                        const imported =
                            parseExcelWorkbook(
                                workbook
                            );


                        if (
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Не найдено ни одного товара. Проверьте структуру выгрузки."
                            );

                        }


                        // ----------------------------------
                        // Только после УСПЕШНОГО импорта
                        // заменяем текущую базу.
                        // ----------------------------------

                        currentProducts =
                            imported;


                        const saved =
                            saveImportedProducts(
                                currentProducts
                            );


                        renderProducts(
                            currentProducts
                        );


                        if (importStatus) {

                            importStatus.innerHTML = `

                                Загружено товаров:
                                <strong>
                                    ${currentProducts.length}
                                </strong>

                                ${
                                    saved
                                        ? " · База сохранена"
                                        : ""
                                }

                            `;

                        }


                        console.log(
                            "УСПЕШНЫЙ ИМПОРТ:",
                            currentProducts.length,
                            "товаров"
                        );


                    } catch (error) {

                        console.error(
                            "ОШИБКА ИМПОРТА:",
                            error
                        );


                        if (importStatus) {

                            importStatus.innerHTML = `

                                <strong>
                                    Ошибка загрузки
                                </strong>

                                <br>

                                ${error.message}

                            `;

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
// RENDER PRODUCTS
// ======================================================

function renderProducts(
    list = currentProducts
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
                    Товары не найдены
                </strong>

                <p>
                    Загрузите выгрузку из 1С.
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

                        ${
                            product.category || "Товар"
                        }

                    </div>


                    <div class="product-name">

                        ${
                            product.name ||
                            "Без названия"
                        }

                    </div>


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
            currentProducts
        );

        return;

    }


    const result =
        currentProducts.filter(
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
                    .join(" ")
                    .toLowerCase();


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

                    searchInput.value =
                        "";

                }


                if (
                    category === "Все"
                ) {

                    renderProducts(
                        currentProducts
                    );

                    return;

                }


                const filtered =
                    currentProducts.filter(
                        product =>
                            product.category ===
                            category
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
        String(
            params.get("id")
        );


    const product =
        currentProducts.find(
            item =>
                String(item.id) === id
        );


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <strong>
                    Товар не найден
                </strong>

                <p>
                    Вернитесь назад и выберите товар.
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
// PRODUCT CARD PAGE
// ======================================================

function renderProduct(product) {

    if (!productDetails) {

        return;

    }


    const stock =
        getStock(
            product
        );


    productDetails.innerHTML = `

        <div class="product-page">

            <div class="product-page-image">

                <span>
                    Фото товара
                </span>

            </div>


            <div class="product-page-content">

                <div class="product-category">

                    ${
                        product.category || "Товар"
                    }

                </div>


                <h1>

                    ${
                        product.name ||
                        "Без названия"
                    }

                </h1>


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

                    ${
                        renderSpecs(product)
                    }

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
        `${
            product.name ||
            "Товар"
        } — Xiaomi WebBase`;


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


                    currentProducts =
                        currentProducts.map(
                            item =>
                                String(item.id) ===
                                String(product.id)
                                    ? product
                                    : item
                        );


                    saveImportedProducts(
                        currentProducts
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
// INIT
// ======================================================

function initApp() {

    // ------------------------------------------
    // Загружаем сохранённую базу
    // ------------------------------------------

    const saved =
        loadSavedProducts();


    if (
        saved &&
        saved.length > 0
    ) {

        currentProducts =
            saved;

    } else if (
        typeof products !== "undefined" &&
        Array.isArray(products)
    ) {

        // Тестовый товар

        currentProducts =
            products;

    } else {

        currentProducts =
            [];

    }


    console.log(
        "Xiaomi WebBase:",
        currentProducts.length,
        "товаров"
    );


    // ------------------------------------------
    // Главная
    // ------------------------------------------

    if (productsList) {

        renderProducts(
            currentProducts
        );

    }


    // ------------------------------------------
    // Страница товара
    // ------------------------------------------

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