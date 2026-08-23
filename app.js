// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// Основная логика сайта.
//
// Сейчас:
// 1. Показывает товары из products-data.js
// 2. Поиск
// 3. Категории
// 4. Карточки товаров
// 5. Изменение остатков
// 6. Импорт XLSX / XLS / CSV из 1С
//
// ВАЖНО:
// products-data.js должен подключаться ПЕРЕД app.js.
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
    document.querySelectorAll(
        ".category-button"
    );


// Импорт

const fileInput =
    document.getElementById("fileInput");

const fileName =
    document.getElementById("fileName");

const importStatus =
    document.getElementById("importStatus");


// ======================================================
// ПРОВЕРКА PRODUCTS
// ======================================================

if (
    typeof products === "undefined"
) {

    console.error(
        "ОШИБКА: products-data.js не загружен."
    );

}


// ======================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ЧИСЛА
// ======================================================

function number(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    // Убираем пробелы и запятую

    const cleaned =
        String(value)
            .replace(/\s/g, "")
            .replace(",", ".");


    const result =
        Number(cleaned);


    return Number.isFinite(result)
        ? result
        : 0;

}


// ======================================================
// СТРОКА
// ======================================================

function text(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .trim();

}


// ======================================================
// НОРМАЛИЗАЦИЯ НАЗВАНИЯ КОЛОНКИ
// ======================================================

function normalizeColumnName(value) {

    return text(value)

        .toLowerCase()

        .replace(/ё/g, "е")

        .replace(/[^a-zа-я0-9]+/gi, "");

}


// ======================================================
// ПОИСК КОЛОНКИ
// ======================================================

function findColumn(
    headers,
    variants
) {

    const normalizedHeaders =
        headers.map(
            header => ({
                original: header,
                normalized:
                    normalizeColumnName(
                        header
                    )
            })
        );


    for (
        const variant of variants
    ) {

        const normalizedVariant =
            normalizeColumnName(
                variant
            );


        const found =
            normalizedHeaders.find(
                item =>
                    item.normalized ===
                    normalizedVariant
            );


        if (found) {

            return found.original;

        }

    }


    // Частичное совпадение

    for (
        const variant of variants
    ) {

        const normalizedVariant =
            normalizeColumnName(
                variant
            );


        const found =
            normalizedHeaders.find(
                item =>
                    item.normalized.includes(
                        normalizedVariant
                    ) ||
                    normalizedVariant.includes(
                        item.normalized
                    )
            );


        if (found) {

            return found.original;

        }

    }


    return null;

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КОЛОНОК 1С
// ======================================================
//
// Мы специально предусматриваем разные варианты
// названий, потому что выгрузки 1С могут немного
// отличаться.
// ======================================================

function detectColumns(headers) {

    const columns = {

        id:
            findColumn(
                headers,
                [
                    "ID",
                    "Код",
                    "Артикул",
                    "Код товара",
                    "Номенклатура.Код"
                ]
            ),


        name:
            findColumn(
                headers,
                [
                    "Наименование",
                    "Название",
                    "Наименование товара",
                    "Товар",
                    "Номенклатура"
                ]
            ),


        category:
            findColumn(
                headers,
                [
                    "Категория",
                    "Группа",
                    "Группа номенклатуры",
                    "Вид номенклатуры",
                    "Раздел"
                ]
            ),


        memory:
            findColumn(
                headers,
                [
                    "Память",
                    "Объем памяти",
                    "Объем"
                ]
            ),


        color:
            findColumn(
                headers,
                [
                    "Цвет",
                    "Цвет товара"
                ]
            ),


        quantity:
            findColumn(
                headers,
                [
                    "Количество",
                    "Остаток",
                    "Остаток товара",
                    "Количество товара",
                    "Остаток на складе"
                ]
            ),


        display:
            findColumn(
                headers,
                [
                    "Витрина",
                    "На витрине",
                    "Витринный остаток",
                    "Витрина количество"
                ]
            ),


        warehouse:
            findColumn(
                headers,
                [
                    "Склад",
                    "На складе",
                    "Складской остаток",
                    "Остаток склад"
                ]
            ),


        ldu:
            findColumn(
                headers,
                [
                    "LDU",
                    "ЛДУ",
                    "Демо",
                    "Демонстрационный"
                ]
            ),


        description:
            findColumn(
                headers,
                [
                    "Описание",
                    "Описание товара"
                ]
            )

    };


    return columns;

}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(
    value,
    productName
) {

    const category =
        text(value).toLowerCase();


    const name =
        text(productName).toLowerCase();


    // Если категория явно указана

    if (
        category.includes("смартфон") ||
        category.includes("телефон")
    ) {

        return "Смартфоны";

    }


    if (
        category.includes("планшет")
    ) {

        return "Планшеты";

    }


    if (
        category.includes("часы") ||
        category.includes("watch")
    ) {

        return "Смарт-часы";

    }


    if (
        category.includes("браслет") ||
        category.includes("band")
    ) {

        return "Фитнес-браслеты";

    }


    // Если категория отсутствует,
    // пытаемся определить её по названию.

    if (
        name.includes("watch") ||
        name.includes("часы")
    ) {

        return "Смарт-часы";

    }


    if (
        name.includes("band") ||
        name.includes("браслет")
    ) {

        return "Фитнес-браслеты";

    }


    if (
        name.includes("pad") ||
        name.includes("планшет")
    ) {

        return "Планшеты";

    }


    if (
        name.includes("iphone") ||
        name.includes("xiaomi") ||
        name.includes("redmi")
    ) {

        return "Смартфоны";

    }


    return (
        text(value) ||
        "Другое"
    );

}


// ======================================================
// ПОЛУЧЕНИЕ ЗНАЧЕНИЯ ИЗ СТРОКИ
// ======================================================

function getCell(
    row,
    column
) {

    if (!column) {

        return "";

    }


    return row[column];

}


// ======================================================
// ПРЕОБРАЗОВАНИЕ СТРОКИ 1С В ТОВАР
// ======================================================

function convertRowToProduct(
    row,
    columns,
    index
) {

    const name =
        text(
            getCell(
                row,
                columns.name
            )
        );


    // Строки без названия товара
    // нам не нужны.

    if (!name) {

        return null;

    }


    const category =
        detectCategory(

            getCell(
                row,
                columns.category
            ),

            name

        );


    let display =
        number(
            getCell(
                row,
                columns.display
            )
        );


    let warehouse =
        number(
            getCell(
                row,
                columns.warehouse
            )
        );


    const quantity =
        number(
            getCell(
                row,
                columns.quantity
            )
        );


    // Если отдельных колонок
    // "Витрина" и "Склад" нет,
    // используем общий остаток как склад.

    if (
        !columns.display &&
        !columns.warehouse
    ) {

        warehouse =
            quantity;

    }


    const total =
        display +
        warehouse;


    const idFromFile =
        text(
            getCell(
                row,
                columns.id
            )
        );


    const id =
        idFromFile
            ? idFromFile
            : Date.now() + index;


    const memory =
        text(
            getCell(
                row,
                columns.memory
            )
        );


    const color =
        text(
            getCell(
                row,
                columns.color
            )
        );


    const ldu =
        number(
            getCell(
                row,
                columns.ldu
            )
        );


    const description =
        text(
            getCell(
                row,
                columns.description
            )
        );


    const specs = {};


    if (memory) {

        specs["Память"] =
            memory;

    }


    if (color) {

        specs["Цвет"] =
            color;

    }


    specs["Витрина"] =
        `${display} шт.`;

    specs["Склад"] =
        `${warehouse} шт.`;

    specs["Всего"] =
        `${total} шт.`;


    if (ldu > 0) {

        specs["LDU"] =
            `${ldu} шт.`;

    }


    return {

        id: id,

        name: name,

        category: category,

        memory: memory,

        color: color,

        quantity: total,

        display: display,

        warehouse: warehouse,

        ldu: ldu,

        description:
            description ||
            `Товар ${name}.`,

        specs: specs,

        tip:
            ldu > 0
                ? "Есть демонстрационный экземпляр."
                : "Товар находится на складе."

    };

}


// ======================================================
// ОБРАБОТКА EXCEL
// ======================================================

function processExcelFile(
    file
) {

    if (
        typeof XLSX === "undefined"
    ) {

        showImportError(
            "Библиотека Excel не загрузилась."
        );

        return;

    }


    showImportStatus(
        "Читаем файл..."
    );


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

                    showImportError(
                        "В файле не найдено ни одного листа."
                    );

                    return;

                }


                // Берём первый лист

                const firstSheetName =
                    workbook.SheetNames[0];


                const worksheet =
                    workbook.Sheets[
                        firstSheetName
                    ];


                // Превращаем Excel
                // в массив объектов

                const rows =
                    XLSX.utils.sheet_to_json(
                        worksheet,
                        {
                            defval: ""
                        }
                    );


                if (
                    !rows ||
                    rows.length === 0
                ) {

                    showImportError(
                        "В таблице нет данных."
                    );

                    return;

                }


                const headers =
                    Object.keys(
                        rows[0]
                    );


                console.log(
                    "Колонки файла:",
                    headers
                );


                const columns =
                    detectColumns(
                        headers
                    );


                console.log(
                    "Определённые колонки:",
                    columns
                );


                if (
                    !columns.name
                ) {

                    showImportError(

                        "Не удалось определить колонку с названием товара. " +
                        "Проверьте первую строку таблицы."

                    );

                    return;

                }


                const importedProducts =
                    rows

                        .map(
                            (
                                row,
                                index
                            ) => {

                                return convertRowToProduct(
                                    row,
                                    columns,
                                    index
                                );

                            }
                        )

                        .filter(
                            product =>
                                product !== null
                        );


                if (
                    importedProducts.length === 0
                ) {

                    showImportError(
                        "Не удалось создать ни одного товара из таблицы."
                    );

                    return;

                }


                // ==================================================
                // ЗАМЕНЯЕМ ТЕКУЩУЮ БАЗУ
                // ==================================================

                if (
                    typeof replaceProducts ===
                    "function"
                ) {

                    replaceProducts(
                        importedProducts
                    );

                } else {

                    products.length =
                        0;

                    products.push(
                        ...importedProducts
                    );

                }


                // ==================================================
                // Сохраняем импорт
                // ==================================================

                try {

                    localStorage.setItem(

                        "xiaomiWebBaseProducts",

                        JSON.stringify(
                            products
                        )

                    );

                } catch (error) {

                    console.warn(
                        "Не удалось сохранить базу:",
                        error
                    );

                }


                // ==================================================
                // Результат
                // ==================================================

                showImportSuccess(

                    `Загружено товаров: ${products.length}`

                );


                // Показываем товары

                resetCategoryButtons();


                if (searchInput) {

                    searchInput.value =
                        "";

                }


                renderProducts(
                    products
                );


                console.log(
                    "Импорт завершён.",
                    products
                );

            } catch (error) {

                console.error(
                    "Ошибка обработки Excel:",
                    error
                );


                showImportError(
                    "Не удалось обработать файл. Проверьте формат таблицы."
                );

            }

        };


    reader.onerror =
        function () {

            showImportError(
                "Не удалось прочитать файл."
            );

        };


    reader.readAsArrayBuffer(
        file
    );

}


// ======================================================
// СТАТУС ИМПОРТА
// ======================================================

function showImportStatus(
    message
) {

    if (!importStatus) {

        return;

    }


    importStatus.textContent =
        message;


    importStatus.className =
        "import-status";

}


// ======================================================
// УСПЕШНЫЙ ИМПОРТ
// ======================================================

function showImportSuccess(
    message
) {

    if (!importStatus) {

        return;

    }


    importStatus.textContent =
        message;


    importStatus.className =
        "import-status import-success";

}


// ======================================================
// ОШИБКА ИМПОРТА
// ======================================================

function showImportError(
    message
) {

    if (!importStatus) {

        return;

    }


    importStatus.textContent =
        message;


    importStatus.className =
        "import-status import-error";

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


            processExcelFile(
                file
            );

        }

    );

}


// ======================================================
// ОСТАТКИ
// ======================================================

function getStock(
    product
) {

    const display =
        number(
            product.display
        );


    const warehouse =
        number(
            product.warehouse
        );


    return {

        display: display,

        warehouse: warehouse,

        total:
            display +
            warehouse

    };

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


    productsList.innerHTML =
        "";


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
                    Загрузите таблицу из 1С.
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

                                    ${product.memory || ""}

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${product.color || ""}

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

                const searchText = `

                    ${product.id || ""}

                    ${product.name || ""}

                    ${product.category || ""}

                    ${product.memory || ""}

                    ${product.color || ""}

                    ${product.description || ""}

                `.toLowerCase();


                return searchText.includes(
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

                    searchInput.value =
                        "";

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
// СБРОС КАТЕГОРИИ
// ======================================================

function resetCategoryButtons() {

    categoryButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    const allButton =
        document.querySelector(
            '.category-button[data-category="Все"]'
        );


    if (allButton) {

        allButton.classList.add(
            "active"
        );

    }

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
        typeof product.specs !==
            "object"
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
// РЕНДЕР КАРТОЧКИ
// ======================================================

function renderProduct(
    product
) {

    if (!productDetails) {

        return;

    }


    const stock =
        getStock(
            product
        );


    const specsHTML =
        renderSpecs(
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

                        ${
                            product.description ||
                            "Описание пока не добавлено."
                        }

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
// ИЗМЕНЕНИЕ ОСТАТКА
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
                        number(
                            product.display
                        ) +
                        number(
                            product.warehouse
                        );


                    // Обновляем характеристики

                    if (
                        product.specs
                    ) {

                        product.specs["Витрина"] =
                            `${product.display} шт.`;

                        product.specs["Склад"] =
                            `${product.warehouse} шт.`;

                        product.specs["Всего"] =
                            `${product.quantity} шт.`;

                    }


                    // Сохраняем

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

    // Проверяем базу

    if (
        typeof products ===
        "undefined"
    ) {

        console.error(
            "products-data.js не подключён."
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


    console.log(
        "================================="
    );


    console.log(
        "Xiaomi WebBase запущен"
    );


    console.log(
        "Товаров:",
        products.length
    );


    console.log(
        "================================="
    );


    // Главная

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
// ЗАПУСК
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();

}