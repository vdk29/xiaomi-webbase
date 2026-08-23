// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// Главная логика Xiaomi WebBase
//
// Поддерживает:
// - products-data.js
// - XLSX / XLS / CSV из 1С
// - поиск
// - категории
// - карточки товаров
// - остатки витрина / склад
// - импорт базы 1С
// - сохранение импортированной базы
//
// ВАЖНО:
// products-data.js подключается ДО app.js
// ======================================================


// ======================================================
// НАСТРОЙКИ
// ======================================================

const STORAGE_KEY = "xiaomiWebBaseProducts";


// ======================================================
// ЭЛЕМЕНТЫ
// ======================================================

const productsList = document.getElementById("productsList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productDetails = document.getElementById("productDetails");

const categoryButtons =
    document.querySelectorAll(".category-button");

const fileInput =
    document.getElementById("fileInput");

const fileName =
    document.getElementById("fileName");

const importStatus =
    document.getElementById("importStatus");


// ======================================================
// БЕЗОПАСНОЕ ЧИСЛО
// ======================================================

function toNumber(value) {

    if (value === null || value === undefined) {
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

    const result = parseFloat(text);

    return Number.isFinite(result)
        ? result
        : 0;
}


// ======================================================
// НОРМАЛИЗАЦИЯ ТЕКСТА
// ======================================================

function normalizeText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

}


// ======================================================
// ПОЛУЧЕНИЕ ОСТАТКОВ
// ======================================================

function getStock(product) {

    const display =
        toNumber(product.display);

    const warehouse =
        toNumber(product.warehouse);

    return {

        display,

        warehouse,

        total:
            display + warehouse

    };

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(name) {

    const text =
        normalizeText(name);


    if (
        text.includes("смартфон") ||
        text.includes("iphone") ||
        text.includes("redmi") ||
        text.includes("xiaomi 1") ||
        text.includes("xiaomi 1") ||
        /^mi\s?\d/.test(text)
    ) {

        return "Смартфоны";

    }


    if (
        text.includes("планшет") ||
        text.includes("pad") ||
        text.includes("tablet")
    ) {

        return "Планшеты";

    }


    if (
        text.includes("watch") ||
        text.includes("часы") ||
        text.includes("watch s") ||
        text.includes("watch 2") ||
        text.includes("watch 3") ||
        text.includes("watch 4") ||
        text.includes("watch 5")
    ) {

        return "Смарт-часы";

    }


    if (
        text.includes("mi band") ||
        text.includes("smart band") ||
        text.includes("браслет") ||
        text.includes("band 7") ||
        text.includes("band 8") ||
        text.includes("band 9") ||
        text.includes("band 10")
    ) {

        return "Фитнес-браслеты";

    }


    return "Другое";

}


// ======================================================
// ПРОВЕРКА: ЯВЛЯЕТСЯ ЛИ СТРОКА ТОВАРОМ
// ======================================================

function isRealProduct(row, name) {

    const text =
        normalizeText(name);


    if (!text) {
        return false;
    }


    // Полностью игнорируем ПФ
    if (
        text === "пф" ||
        text.includes(" пф ") ||
        text.startsWith("пф ") ||
        text.endsWith(" пф")
    ) {

        return false;

    }


    // Групповые строки 1С
    // Например:
    // 17
    // 17 Ultra
    // 17T
    // Xiaomi 17
    //
    // Если строка является просто группой
    // и в ней нет конкретного товара,
    // не создаём карточку.

    if (
        row.__isGroup === true
    ) {

        return false;

    }


    // Строки без остатков и без явного товара
    // не пропускаем, если они выглядят как служебные.

    const first =
        String(name).trim();


    if (
        /^[0-9]+$/.test(first)
    ) {

        return false;

    }


    return true;

}


// ======================================================
// ПОИСК КОЛОНКИ
// ======================================================

function findColumn(headers, variants) {

    const normalizedHeaders =
        headers.map(
            header => normalizeText(header)
        );


    // Сначала точное совпадение
    for (
        const variant of variants
    ) {

        const normalizedVariant =
            normalizeText(variant);


        const index =
            normalizedHeaders.indexOf(
                normalizedVariant
            );


        if (index !== -1) {
            return headers[index];
        }

    }


    // Потом частичное совпадение
    for (
        const variant of variants
    ) {

        const normalizedVariant =
            normalizeText(variant);


        const index =
            normalizedHeaders.findIndex(
                header =>
                    header.includes(
                        normalizedVariant
                    )
            );


        if (index !== -1) {
            return headers[index];
        }

    }


    return null;

}


// ======================================================
// ПОИСК КОЛОНКИ НОМЕНКЛАТУРЫ
// ======================================================

function findNameColumn(headers) {

    return findColumn(
        headers,
        [
            "Номенклатура",
            "Номенклатура товара",
            "Наименование",
            "Наименование товара",
            "Товар",
            "Название",
            "Название товара",
            "Модель"
        ]
    );

}


// ======================================================
// ПОИСК КОЛОНКИ ВИТРИНЫ
// ======================================================

function findDisplayColumn(headers) {

    // В твоей выгрузке 1С:
    // Склад ТЦ Европолис ОВ
    //
    // ОВ = открытая выкладка

    const exact =
        findColumn(
            headers,
            [
                "Склад ТЦ Европолис ОВ",
                "ТЦ Европолис ОВ",
                "Европолис ОВ"
            ]
        );


    if (exact) {
        return exact;
    }


    // Более общий поиск
    const normalized =
        headers.map(
            header =>
                normalizeText(header)
        );


    const index =
        normalized.findIndex(
            header =>
                header.includes("европолис") &&
                header.includes("ов")
        );


    if (index !== -1) {
        return headers[index];
    }


    return null;

}


// ======================================================
// ПОИСК КОЛОНКИ СКЛАДА
// ======================================================

function findWarehouseColumn(headers) {

    const exact =
        findColumn(
            headers,
            [
                "Склад ТЦ Европолис",
                "ТЦ Европолис",
                "Европолис"
            ]
        );


    if (exact) {
        return exact;
    }


    const normalized =
        headers.map(
            header =>
                normalizeText(header)
        );


    const index =
        normalized.findIndex(
            header =>
                header.includes("европолис") &&
                !header.includes("ов")
        );


    if (index !== -1) {
        return headers[index];
    }


    return null;

}


// ======================================================
// ПОИСК КОЛОНКИ ИТОГО
// ======================================================

function findTotalColumn(headers) {

    return findColumn(
        headers,
        [
            "Итого",
            "Всего",
            "Количество",
            "Остаток",
            "Остаток всего"
        ]
    );

}


// ======================================================
// ПОЛУЧЕНИЕ ЗНАЧЕНИЯ КОЛОНКИ
// ======================================================

function getRowValue(row, column) {

    if (!column) {
        return "";
    }

    return row[column];

}


// ======================================================
// СОЗДАНИЕ ID
// ======================================================

function makeProductId(
    name,
    index
) {

    const base =
        String(name)
            .trim()
            .toLowerCase()
            .replace(/[^a-zа-я0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "");


    return (
        base ||
        "product-" + index
    );

}


// ======================================================
// ОБРАБОТКА ОДНОЙ СТРОКИ 1С
// ======================================================

function convertRow(
    row,
    index,
    columns
) {

    const name =
        String(
            getRowValue(
                row,
                columns.name
            ) || ""
        ).trim();


    if (
        !isRealProduct(
            row,
            name
        )
    ) {

        return null;

    }


    const display =
        toNumber(
            getRowValue(
                row,
                columns.display
            )
        );


    const warehouse =
        toNumber(
            getRowValue(
                row,
                columns.warehouse
            )
        );


    const totalFromFile =
        toNumber(
            getRowValue(
                row,
                columns.total
            )
        );


    let total =
        display + warehouse;


    // Если отдельных колонок нет,
    // используем Итого.

    if (
        total === 0 &&
        totalFromFile > 0
    ) {

        total =
            totalFromFile;

    }


    const category =
        detectCategory(name);


    return {

        id:
            makeProductId(
                name,
                index
            ),

        name,

        category,

        memory: "",

        color: "",

        display,

        warehouse,

        quantity:
            total,

        description:
            "",

        tip:
            "",

        specs: {},

        source:
            "1C"

    };

}


// ======================================================
// ЧТЕНИЕ EXCEL
// ======================================================

function parseExcelFile(file) {

    return new Promise(
        (resolve, reject) => {

            if (
                typeof XLSX === "undefined"
            ) {

                reject(
                    new Error(
                        "Библиотека XLSX не загружена."
                    )
                );

                return;

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
                                    cellDates: true
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


                        // Берём первый лист.
                        const sheet =
                            workbook.Sheets[
                                workbook.SheetNames[0]
                            ];


                        const rows =
                            XLSX.utils.sheet_to_json(
                                sheet,
                                {
                                    defval: "",
                                    raw: false
                                }
                            );


                        resolve(rows);

                    } catch (error) {

                        reject(error);

                    }

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Не удалось прочитать файл."
                        )
                    );

                };


            reader.readAsArrayBuffer(file);

        }
    );

}


// ======================================================
// ИМПОРТ 1С
// ======================================================

async function import1CFile(file) {

    if (!file) {
        return;
    }


    if (fileName) {

        fileName.textContent =
            file.name;

    }


    if (importStatus) {

        importStatus.textContent =
            "Обработка файла...";

        importStatus.className =
            "import-status";

    }


    try {

        const rows =
            await parseExcelFile(
                file
            );


        if (
            !rows ||
            rows.length === 0
        ) {

            throw new Error(
                "Таблица пустая."
            );

        }


        const headers =
            Object.keys(
                rows[0]
            );


        console.log(
            "Колонки 1С:",
            headers
        );


        // ----------------------------------------------
        // Ищем необходимые колонки
        // ----------------------------------------------

        const nameColumn =
            findNameColumn(
                headers
            );


        if (!nameColumn) {

            throw new Error(
                "Не удалось определить колонку с названием товара.\n\n" +
                "Найденные колонки:\n" +
                headers.join(", ")
            );

        }


        const displayColumn =
            findDisplayColumn(
                headers
            );


        const warehouseColumn =
            findWarehouseColumn(
                headers
            );


        const totalColumn =
            findTotalColumn(
                headers
            );


        console.log(
            "Номенклатура:",
            nameColumn
        );


        console.log(
            "Витрина:",
            displayColumn
        );


        console.log(
            "Склад:",
            warehouseColumn
        );


        console.log(
            "Итого:",
            totalColumn
        );


        const columns = {

            name:
                nameColumn,

            display:
                displayColumn,

            warehouse:
                warehouseColumn,

            total:
                totalColumn

        };


        // ----------------------------------------------
        // Конвертируем строки
        // ----------------------------------------------

        const importedProducts = [];


        rows.forEach(
            (row, index) => {

                const product =
                    convertRow(
                        row,
                        index,
                        columns
                    );


                if (product) {

                    importedProducts.push(
                        product
                    );

                }

            }
        );


        if (
            importedProducts.length === 0
        ) {

            throw new Error(
                "Не удалось найти товары в таблице."
            );

        }


        // ----------------------------------------------
        // Убираем дубли
        // ----------------------------------------------

        const unique =
            new Map();


        importedProducts.forEach(
            product => {

                const key =
                    normalizeText(
                        product.name
                    );


                if (
                    !unique.has(key)
                ) {

                    unique.set(
                        key,
                        product
                    );

                }

            }
        );


        const finalProducts =
            Array.from(
                unique.values()
            );


        // ----------------------------------------------
        // Заменяем текущую базу
        // ----------------------------------------------

        products.length = 0;


        finalProducts.forEach(
            product => {

                products.push(
                    product
                );

            }
        );


        // ----------------------------------------------
        // Сохраняем
        // ----------------------------------------------

        saveProducts();


        // ----------------------------------------------
        // Обновляем интерфейс
        // ----------------------------------------------

        renderProducts(
            products
        );


        if (importStatus) {

            importStatus.textContent =
                `Готово. Загружено товаров: ${products.length}`;

            importStatus.className =
                "import-status success";

        }


        console.log(
            "Импорт завершён:",
            products.length,
            "товаров"
        );


    } catch (error) {

        console.error(
            "Ошибка импорта:",
            error
        );


        if (importStatus) {

            importStatus.textContent =
                error.message ||
                "Ошибка загрузки файла.";

            importStatus.className =
                "import-status error";

        }

    }

}


// ======================================================
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );


        console.log(
            "База сохранена."
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
                STORAGE_KEY
            );


        if (!saved) {
            return;
        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            !Array.isArray(parsed) ||
            parsed.length === 0
        ) {

            return;

        }


        // Если в localStorage уже есть
        // импортированная база — используем её.

        products.length = 0;


        parsed.forEach(
            product => {

                products.push(
                    product
                );

            }
        );


        console.log(
            "Из localStorage загружено:",
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
                    Загрузите выгрузку из 1С
                    или проверьте базу товаров.
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
                            product.category ||
                            "Товар"
                        }

                    </div>


                    <div class="product-name">

                        ${
                            product.name ||
                            "Без названия"
                        }

                    </div>


                    ${
                        product.memory ||
                        product.color
                            ? `

                                <div class="product-info">

                                    ${
                                        product.memory ||
                                        ""
                                    }

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${
                                        product.color ||
                                        ""
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

                const text = [

                    product.id,

                    product.name,

                    product.category,

                    product.memory,

                    product.color,

                    product.description,

                    product.tip

                ]
                    .filter(Boolean)
                    .join(" ");


                return normalizeText(
                    text
                ).includes(
                    query
                );

            }
        );


    renderProducts(
        result
    );

}


// ======================================================
// КНОПКА ПОИСКА
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// ПОИСК ENTER
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

                    ${
                        product.category ||
                        "Товар"
                    }

                </div>


                <h1>

                    ${
                        product.name ||
                        "Без названия"
                    }

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
        `${
            product.name ||
            "Товар"
        } — Xiaomi WebBase`;


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
                        toNumber(
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
                        toNumber(
                            product.display
                        ) +
                        toNumber(
                            product.warehouse
                        );


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
// ЗАГРУЗКА ФАЙЛА
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


            import1CFile(
                file
            );

        }
    );

}


// ======================================================
// ЗАПУСК
// ======================================================

function initApp() {

    // Проверяем products-data.js

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "ОШИБКА: products-data.js не загрузился."
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


    console.log(
        "Xiaomi WebBase:",
        products.length,
        "товаров в исходной базе"
    );


    // Загружаем ранее импортированную базу,
    // если она есть.

    loadSavedProducts();


    // Главная страница

    if (productsList) {

        renderProducts(
            products
        );

    }


    // Страница товара

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
