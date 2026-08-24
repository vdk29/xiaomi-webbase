// ======================================================
// XIAOMI WEBBASE
// APP.JS — НОВЫЙ ПАРСЕР 1С
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const productsList = document.getElementById("productsList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productDetails = document.getElementById("productDetails");

const categoryButtons =
    document.querySelectorAll(".category-button");

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const importStatus = document.getElementById("importStatus");


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
        return Number.isFinite(value) ? value : 0;
    }

    let text = String(value)
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
// NORMALIZE TEXT
// ======================================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\u00a0/g, " ")
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
// ОПРЕДЕЛЕНИЕ РАЗДЕЛА
// ======================================================
//
// ВАЖНО:
//
// Эти функции определяют только ЗАГОЛОВОК РАЗДЕЛА.
// Они НЕ определяют категорию обычного товара.
//
// Поэтому:
//
// "01 смартфоны Xiaomi 71"
// "17 планшеты 20"
// "умные часы 50"
//
// становятся разделами.
//
// А:
//
// "Redmi Note 15"
// "Redmi Pad 2"
// "Xiaomi Smart Band ..."
//
// уже не будут автоматически удаляться.
// ======================================================

function detectSection(name) {

    const text = normalizeText(name);

    if (!text) {
        return null;
    }


    // --------------------------------------------------
    // СМАРТФОНЫ
    // --------------------------------------------------

    if (
        /\bсмартфон(?:ы)?\b/.test(text)
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
    // --------------------------------------------------

    if (
        /\bпланшет(?:ы)?\b/.test(text)
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТЫ
    // --------------------------------------------------

    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет") ||
        text.includes("фитнес-браслеты") ||
        text.includes("фитнес браслеты")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        text.includes("умные часы") ||
        text.includes("смарт часы") ||
        text.includes("смарт-часы") ||
        text.includes("smart watch") ||
        text.includes("smartwatch")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // НАУШНИКИ
    // --------------------------------------------------

    if (
        /\bнаушник(?:и)?\b/.test(text)
    ) {

        return "Наушники";

    }


    // --------------------------------------------------
    // ТЕЛЕВИЗОРЫ
    // --------------------------------------------------

    if (
        /\bтелевизор(?:ы)?\b/.test(text)
    ) {

        return "Телевизоры";

    }


    // --------------------------------------------------
    // КАМЕРЫ
    // --------------------------------------------------

    if (
        /\bкамер(?:а|ы)\b/.test(text)
    ) {

        return "Камеры";

    }


    // --------------------------------------------------
    // ПЫЛЕСОСЫ
    // --------------------------------------------------

    if (
        /\bпылесос(?:ы)?\b/.test(text)
    ) {

        return "Пылесосы";

    }


    // --------------------------------------------------
    // АКСЕССУАРЫ
    // --------------------------------------------------

    if (
        /\bаксессуар(?:ы)?\b/.test(text)
    ) {

        return "Аксессуары";

    }


    return null;

}


// ======================================================
// ЯВНЫЙ ЗАГОЛОВОК РАЗДЕЛА
// ======================================================
//
// Здесь главное отличие.
//
// Строка:
//
// "01 смартфоны Xiaomi 71"
//
// должна быть заголовком.
//
// Но:
//
// "Смартфон Xiaomi Redmi Note 15"
//
// должна быть товаром.
//
// Поэтому проверяем не только наличие слова,
// но и форму строки.
// ======================================================

function isSectionRow(name) {

    const text = normalizeText(name);

    if (!text) {
        return false;
    }

    const section = detectSection(text);

    if (!section) {
        return false;
    }


    // --------------------------------------------------
    // Чистое название раздела
    // --------------------------------------------------

    const cleanNames = [

        "смартфоны",
        "планшеты",

        "фитнес-браслеты",
        "фитнес браслеты",

        "умные часы",
        "смарт часы",
        "смарт-часы",

        "наушники",
        "телевизоры",
        "камеры",
        "пылесосы",
        "аксессуары"

    ];

    if (cleanNames.includes(text)) {
        return true;
    }


    // --------------------------------------------------
    // Формат:
    //
    // 01 смартфоны 71
    // 17 планшеты 20
    // 05 аксессуары 180
    //
    // Цифры могут быть и в начале, и в конце.
    // --------------------------------------------------

    const startsWithNumber =
        /^\d+\s+/.test(text);

    const endsWithNumber =
        /\s+\d+(?:[.,]\d+)?$/.test(text);

    if (
        startsWithNumber &&
        endsWithNumber
    ) {

        return true;

    }


    // --------------------------------------------------
    // Формат:
    //
    // смартфоны - 71
    // планшеты 20
    // аксессуары - 180
    // --------------------------------------------------

    if (
        endsWithNumber &&
        text.length < 100
    ) {

        return true;

    }


    // --------------------------------------------------
    // Строка типа:
    //
    // "01 смартфоны Xiaomi 71"
    //
    // Даже если между словом категории и числом
    // есть название бренда.
    // --------------------------------------------------

    if (
        startsWithNumber &&
        endsWithNumber
    ) {

        return true;

    }


    return false;

}


// ======================================================
// СЛУЖЕБНАЯ СТРОКА
// ======================================================

function isServiceRow(name) {

    const text = normalizeText(name);

    if (!text) {
        return true;
    }

    if (
        text === "итого" ||
        text === "всего" ||
        text === "остаток" ||
        text === "остатки"
    ) {
        return true;
    }

    return false;

}


// ======================================================
// ПОДГРУППЫ
// ======================================================
//
// Они не являются товарами.
//
// "Для Redmi Note 15"
// "Для Redmi Pad 2"
// "Аксессуары для Redmi..."
//
// Но обычный товар:
//
// "Redmi Note 15"
//
// НЕ попадает сюда.
// ======================================================

function isSubGroupRow(name) {

    const text = normalizeText(name);

    if (!text) {
        return true;
    }


    if (/^для\s+/i.test(text)) {
        return true;
    }


    if (/^карточка\s+для\s+/i.test(text)) {
        return true;
    }


    if (/^аксессуары\s+для\s+/i.test(text)) {
        return true;
    }


    if (/^чехлы\s+для\s+/i.test(text)) {
        return true;
    }


    if (/^стекла\s+для\s+/i.test(text)) {
        return true;
    }


    if (/^пленки\s+для\s+/i.test(text)) {
        return true;
    }


    if (/^плёнки\s+для\s+/i.test(text)) {
        return true;
    }


    return false;

}


// ======================================================
// ОБЩАЯ СЛУЖЕБНАЯ ПРОВЕРКА
// ======================================================

function shouldSkipRow(name) {

    if (!name) {
        return true;
    }

    if (isServiceRow(name)) {
        return true;
    }

    if (isSubGroupRow(name)) {
        return true;
    }

    return false;

}


// ======================================================
// КАТЕГОРИЯ ТОВАРА
// ======================================================
//
// ПОРЯДОК:
//
// 1. Категория из раздела 1С.
// 2. Если раздел ещё не найден — пробуем категорию
//    из самого названия.
// 3. Если ничего не нашли — Другое.
//
// Это принципиально.
// ======================================================

function detectProductCategory(name, section) {

    // --------------------------------------------------
    // Если 1С уже сказала, в каком разделе товар
    // находится — доверяем 1С.
    // --------------------------------------------------

    if (section) {
        return section;
    }


    const text = normalizeText(name);


    // --------------------------------------------------
    // Явные категории в названии
    // --------------------------------------------------

    if (
        text.includes("смартфон")
    ) {
        return "Смартфоны";
    }


    if (
        text.includes("планшет")
    ) {
        return "Планшеты";
    }


    if (
        text.includes("фитнес-браслет") ||
        text.includes("фитнес браслет")
    ) {
        return "Фитнес-браслеты";
    }


    if (
        text.includes("умные часы") ||
        text.includes("смарт часы") ||
        text.includes("смарт-часы")
    ) {
        return "Смарт-часы";
    }


    if (
        text.includes("наушник")
    ) {
        return "Наушники";
    }


    if (
        text.includes("телевизор")
    ) {
        return "Телевизоры";
    }


    if (
        text.includes("камера")
    ) {
        return "Камеры";
    }


    if (
        text.includes("пылесос")
    ) {
        return "Пылесосы";
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

        prepared.id = index + 1;

    }


    prepared.name =
        String(
            prepared.name ||
            "Без названия"
        ).trim();


    prepared.display =
        number(prepared.display);


    prepared.warehouse =
        number(prepared.warehouse);


    prepared.quantity =
        prepared.display +
        prepared.warehouse;


    prepared.category =
        prepared.category ||
        "Другое";


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
                normalized.push(prepared);
            }

        }
    );


    products.length = 0;

    normalized.forEach(
        product => {
            products.push(product);
        }
    );

}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(list = products) {

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


            productsList.appendChild(card);

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

        renderProducts(products);

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


                return text.includes(query);

            }
        );


    renderProducts(result);

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
        event => {

            if (event.key === "Enter") {
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


                button.classList.add("active");


                if (searchInput) {
                    searchInput.value = "";
                }


                if (category === "Все") {

                    renderProducts(products);

                    return;

                }


                const filtered =
                    products.filter(
                        product =>
                            product.category === category
                    );


                console.log(
                    "Категория:",
                    category,
                    "Найдено:",
                    filtered.length
                );


                renderProducts(filtered);

            }
        );

    }
);


// ======================================================
// FIND 1C COLUMNS
// ======================================================
//
// Ищем колонки по названиям.
//
// Не привязываемся к конкретной выгрузке,
// кроме известных смысловых названий.
//
// ======================================================

function find1CColumns(rows) {

    let headerRow = -1;

    let nameColumn = -1;

    let displayColumn = -1;

    let warehouseColumn = -1;

    let totalColumn = -1;


    const limit =
        Math.min(rows.length, 100);


    for (
        let i = 0;
        i < limit;
        i++
    ) {

        const row = rows[i];


        if (!Array.isArray(row)) {
            continue;
        }


        for (
            let j = 0;
            j < row.length;
            j++
        ) {

            const text =
                normalizeText(row[j]);


            // ------------------------------------------
            // НОМЕНКЛАТУРА
            // ------------------------------------------

            if (
                text === "номенклатура" ||
                text.includes("номенклатура")
            ) {

                nameColumn = j;

                if (headerRow === -1) {
                    headerRow = i;
                }

            }


            // ------------------------------------------
            // ВИТРИНА
            // ------------------------------------------

            if (
                text.includes("витрина")
            ) {

                displayColumn = j;

                if (headerRow === -1) {
                    headerRow = i;
                }

            }


            // ------------------------------------------
            // СКЛАД
            // ------------------------------------------

            if (
                text.includes("склад")
            ) {

                // Если это отдельная колонка склада,
                // запоминаем её.
                //
                // Последняя подходящая колонка будет
                // заменять предыдущую, но ниже есть
                // дополнительная логика.
                warehouseColumn = j;

                if (headerRow === -1) {
                    headerRow = i;
                }

            }


            // ------------------------------------------
            // ИТОГО
            // ------------------------------------------

            if (
                text === "итого" ||
                text.includes("итого")
            ) {

                totalColumn = j;

            }

        }

    }


    // ==================================================
    // ПОИСК БОЛЕЕ ТОЧНОГО СКЛАДА
    // ==================================================

    if (headerRow !== -1) {

        const header = rows[headerRow];


        for (
            let j = 0;
            j < header.length;
            j++
        ) {

            const text =
                normalizeText(header[j]);


            if (
                text.includes("склад")
            ) {

                warehouseColumn = j;

            }

        }

    }


    console.log(
        "================================="
    );

    console.log(
        "СТРУКТУРА 1С"
    );

    console.log({
        headerRow,
        nameColumn,
        displayColumn,
        warehouseColumn,
        totalColumn
    });

    console.log(
        "================================="
    );


    // ==================================================
    // ЕСЛИ НАЗВАНИЕ НЕ НАШЛИ
    // ==================================================

    if (nameColumn === -1) {

        // В известной структуре 1С
        // номенклатура находится в A.

        nameColumn = 0;

    }


    // ==================================================
    // ЗАПАСНОЙ ВАРИАНТ
    // ==================================================

    if (displayColumn === -1) {
        displayColumn = 4;
    }


    if (warehouseColumn === -1) {
        warehouseColumn = 6;
    }


    if (headerRow === -1) {
        headerRow = 0;
    }


    return {

        headerRow,

        nameColumn,

        displayColumn,

        warehouseColumn,

        totalColumn

    };

}


// ======================================================
// PARSE 1C DATA
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
        find1CColumns(rows);


    let productId = 1;


    // ==================================================
    // ТЕКУЩИЙ РАЗДЕЛ
    // ==================================================
    //
    // Например:
    //
    // Смартфоны
    //     Redmi Note 15
    //     Xiaomi 15
    //
    // Планшеты
    //     Redmi Pad 2
    //
    // Фитнес-браслеты
    //     Xiaomi Smart Band...
    //
    // ==================================================

    let currentSection = null;


    const start =
        Math.max(
            columns.headerRow + 1,
            0
        );


    // ==================================================
    // ПРОХОД ПО ВСЕЙ ТАБЛИЦЕ
    // ==================================================

    for (
        let i = start;
        i < rows.length;
        i++
    ) {

        const row = rows[i];


        if (!Array.isArray(row)) {
            continue;
        }


        const name =
            String(
                row[columns.nameColumn] ?? ""
            ).trim();


        if (!name) {
            continue;
        }


        const normalizedName =
            normalizeText(name);


        // ==================================================
        // 1. ПРОВЕРЯЕМ НОВЫЙ РАЗДЕЛ
        // ==================================================

        if (
            isSectionRow(name)
        ) {

            const newSection =
                detectSection(name);


            if (newSection) {

                currentSection =
                    newSection;


                console.log(
                    "РАЗДЕЛ:",
                    name,
                    "→",
                    currentSection
                );

            }


            continue;

        }


        // ==================================================
        // 2. СЛУЖЕБНЫЕ СТРОКИ
        // ==================================================

        if (
            isServiceRow(name)
        ) {

            continue;

        }


        // ==================================================
        // 3. ПОДГРУППЫ
        // ==================================================

        if (
            isSubGroupRow(name)
        ) {

            console.log(
                "ПОДГРУППА:",
                name
            );

            continue;

        }


        // ==================================================
        // 4. ОСТАТКИ
        // ==================================================

        //
        // Здесь НЕ определяем товар по названию.
        //
        // Даже если:
        //
        // Redmi Note 15
        // Redmi Pad 2
        // Mi Band 11
        //
        // это короткие строки —
        // они всё равно могут быть товарами.
        //


        const firstStock =
            number(
                row[columns.displayColumn]
            );


        const secondStock =
            number(
                row[columns.warehouseColumn]
            );


        // ==================================================
        // 5. КАТЕГОРИЯ
        // ==================================================

        const category =
            detectProductCategory(
                name,
                currentSection
            );


        // ==================================================
        // 6. СОЗДАЁМ ТОВАР
        // ==================================================

        const product = {

            id:
                productId++,

            name,

            category,

            memory:
                "",

            color:
                "",

            display:
                Math.max(
                    0,
                    firstStock
                ),

            warehouse:
                Math.max(
                    0,
                    secondStock
                ),

            quantity:
                Math.max(
                    0,
                    firstStock
                ) +
                Math.max(
                    0,
                    secondStock
                ),

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        result.push(product);


        console.log(
            "ТОВАР:",
            name,
            "→",
            category,
            "Витрина:",
            product.display,
            "Склад:",
            product.warehouse
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
        "ИМПОРТ 1С ЗАВЕРШЁН"
    );

    console.log(
        "Всего:",
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
                            "Количество строк:",
                            rows.length
                        );


                        console.log(
                            "Первые строки:",
                            rows.slice(0, 20)
                        );


                        // ==================================================
                        // ПАРСИНГ
                        // ==================================================

                        const imported =
                            parse1CData(rows);


                        if (
                            !Array.isArray(imported) ||
                            imported.length === 0
                        ) {

                            throw new Error(
                                "Не удалось найти товары в выгрузке 1С."
                            );

                        }


                        // ==================================================
                        // ПОЛНОСТЬЮ ЗАМЕНЯЕМ СТАРУЮ БАЗУ
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

                        localStorage.setItem(
                            "xiaomiWebBaseProducts",
                            JSON.stringify(products)
                        );


                        // ==================================================
                        // ПОКАЗЫВАЕМ
                        // ==================================================

                        renderProducts(products);


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


                        console.log(
                            "================================="
                        );


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


            reader.readAsArrayBuffer(file);

        }
    );

}


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


    renderProduct(product);

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
        Object.entries(product.specs);


    if (entries.length === 0) {

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


    setupQuantityButtons(product);

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
                            "Ошибка сохранения:",
                            error
                        );

                    }


                    renderProduct(product);

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
            JSON.parse(saved);


        if (
            !Array.isArray(parsed) ||
            parsed.length === 0
        ) {

            return false;

        }


        products.length = 0;


        parsed.forEach(
            product => {

                products.push(product);

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
// DEBUG STATISTICS
// ======================================================

function printStatistics() {

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


    categories.forEach(
        category => {

            console.log(
                category + ":",
                products.filter(
                    product =>
                        product.category === category
                ).length
            );

        }
    );


    console.log(
        "================================="
    );

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


    loadSavedProducts();


    normalizeProducts();


    printStatistics();


    if (productsList) {

        renderProducts(products);

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