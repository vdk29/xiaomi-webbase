// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================

let products = [];


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

    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    let text =
        String(value)
            .replace(/\u00A0/g, " ")
            .trim();

    if (!text) {
        return 0;
    }

    text =
        text
            .replace(/\s/g, "")
            .replace(",", ".");

    const result = Number(text);

    return Number.isFinite(result)
        ? result
        : 0;
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
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(name) {

    const text =
        name.toLowerCase();


    if (
        /смартфон|iphone|redmi\s+\d|redmi\s+note|xiaomi\s+\d/.test(text)
    ) {
        return "Смартфоны";
    }


    if (
        /планшет|pad\s+\d|xiaomi pad|redmi pad/.test(text)
    ) {
        return "Планшеты";
    }


    if (
        /смарт-?часы|smart watch|watch\s+[0-9s]|redmi watch|xiaomi watch/.test(text)
    ) {
        return "Смарт-часы";
    }


    if (
        /фитнес-браслет|smart band|mi band/.test(text)
    ) {
        return "Фитнес-браслеты";
    }


    return "Другое";

}


// ======================================================
// СЛОВА, КОТОРЫЕ ЯВНО ОЗНАЧАЮТ ТОВАР
// ======================================================

const productKeywords = [

    "смартфон",
    "телефон",

    "планшет",

    "смарт-часы",
    "смарт часы",
    "smart watch",

    "фитнес-браслет",
    "фитнес браслет",
    "smart band",
    "mi band",

    "наушники",
    "колонка",
    "колонки",

    "камера",
    "ip-камера",
    "ip камеры",
    "видеокамера",

    "зарядное устройство",
    "зарядная станция",
    "зарядное",

    "кабель",
    "дата-кабель",

    "чехол",
    "чехол-книжка",

    "стекло",
    "пленка",
    "пленку",
    "защитный материал",

    "ремешок",

    "пылесос",
    "робот-пылесос",

    "аэрогриль",
    "чайник",
    "обогреватель",
    "отпариватель",
    "увлажнитель",
    "вентилятор",
    "диспенсер",

    "фен",
    "электробритва",
    "зубная щетка",
    "массажер",
    "весы",

    "очиститель воздуха",

    "внешний аккумулятор",
    "портативный аккумулятор",
    "power bank",

    "маршрутизатор",
    "роутер",
    "ретранслятор",
    "мышь",
    "монитор",

    "лампа",
    "лампу",
    "светодиодная лампа",

    "рюкзак",

    "датчик",

    "кормушка",
    "поилка",

    "дальномер",
    "компрессор",

    "автомобильный держатель",
    "автовизитка",

    "адаптер-переходник",

    "батарейки",

    "подарочный сертификат",

    "подарочный",

    "модель автомобиля",

    "пластиковая карта",

    "пакет подарочный",

    "колонка",

    "наушники проводные"

];


// ======================================================
// СЛОВА КАТЕГОРИЙ
// ======================================================

const categoryWords = [

    "смартфоны",
    "экосистема xiaomi",
    "аксессуары",
    "аксессуары для смартфонов",
    "защитные пленки и стекла",
    "чехлы",
    "дата кабели",
    "зарядные устройства",
    "автомобильные зарядные устройства",
    "аксессуары для mi band и часов",
    "адаптеры и переходники",
    "элементы питания",
    "автомобильный держатель",
    "наушники",
    "внешние аккумуляторы",
    "аксессуары для пылесосов",
    "для планшетов",
    "планшеты",
    "карты лояльности и пакеты",
    "звук",
    "колонки",
    "сим карты",
    "сертификаты",
    "товары на ответственном хранении",
    "подарки",
    "умные часы",
    "фитнес-браслеты",
    "умный дом",
    "красота и здоровье",
    "мелкая бытовая техника",
    "видео",
    "ip-камеры",
    "телевизоры",
    "товары diy",
    "товары для детей",
    "товары для животных",
    "товары для компьютера",
    "увлажнители",
    "очистители",
    "пылесосы",
    "рюкзаки и чемоданы",
    "свет",
    "старые",
    "mi band 10",
    "mi band 11",
    "mi band 9 active",
    "redmi",
    "redmi 17",
    "redmi note 15 pro",
    "xiaomi",
    "17t",
    "17t pro",
    "17 ultra",
    "pad 8",
    "redmi pad 2",
    "redmi pad 2 9.7",
    "redmi pad 2 pro",
    "01 смартфоны xiaomi",
    "02 экосистема xiaomi",
    "03 аксессуары",
    "04 планшеты",
    "06 карты лояльности и пакеты",
    "07 hitbuy",
    "18 аксессуары для hitbuy",
    "99 sim карты"

];


// ======================================================
// ПРОВЕРКА: ЯВЛЯЕТСЯ ЛИ СТРОКА ТОВАРОМ
// ======================================================

function isProductName(name) {

    if (!name) {
        return false;
    }

    let text =
        String(name)
            .replace(/\u00A0/g, " ")
            .trim();


    if (!text) {
        return false;
    }


    // ------------------------------------------
    // ПФ полностью игнорируем
    // ------------------------------------------

    if (
        /\(ПФ\)/i.test(text)
    ) {
        return false;
    }


    // ------------------------------------------
    // Служебные строки
    // ------------------------------------------

    if (
        /^итого$/i.test(text) ||
        /^номенклатура$/i.test(text) ||
        /^остатки на складах/i.test(text)
    ) {
        return false;
    }


    // ------------------------------------------
    // Строки, начинающиеся с номера категории
    // ------------------------------------------

    if (
        /^\d{2}\s/.test(text)
    ) {
        return false;
    }


    // ------------------------------------------
    // Явные категории
    // ------------------------------------------

    const lower =
        text.toLowerCase();


    if (
        categoryWords.includes(lower)
    ) {
        return false;
    }


    // ------------------------------------------
    // Слово LDU само по себе не товар
    // ------------------------------------------

    if (
        lower === "ldu" ||
        lower === "(ldu)"
    ) {
        return false;
    }


    // ------------------------------------------
    // Явные товарные слова
    // ------------------------------------------

    for (
        const keyword of productKeywords
    ) {

        if (
            lower.includes(keyword)
        ) {

            return true;

        }

    }


    // ------------------------------------------
    // Модели с кодом BHR...
    // ------------------------------------------

    if (
        /\bBHR[0-9A-Z]+\b/i.test(text)
    ) {

        return true;

    }


    // ------------------------------------------
    // DVB-коды
    // ------------------------------------------

    if (
        /\bDVB[0-9A-Z]+\b/i.test(text)
    ) {

        return true;

    }


    // ------------------------------------------
    // EU / GL товары с моделью
    // ------------------------------------------

    if (
        /\b(EU|GL)\b/i.test(text) &&
        /[A-Za-zА-Яа-я]/.test(text)
    ) {

        return true;

    }


    return false;

}


// ======================================================
// НОРМАЛИЗАЦИЯ НАЗВАНИЯ
// ======================================================

function cleanProductName(name) {

    let result =
        String(name ?? "")
            .replace(/\u00A0/g, " ")
            .trim();


    // Убираем LDU только из отображаемого названия

    result =
        result
            .replace(/^\(LDU\)\s*/i, "")
            .trim();


    return result;

}


// ======================================================
// СОЗДАНИЕ ТОВАРА
// ======================================================

function createProduct(
    name,
    warehouse,
    display,
    index
) {

    const cleanName =
        cleanProductName(name);


    const product = {

        id:
            Date.now().toString() +
            "_" +
            index,

        name:
            cleanName,

        category:
            detectCategory(cleanName),

        warehouse:
            number(warehouse),

        display:
            number(display),

        memory:
            "",

        color:
            "",

        description:
            "",

        tip:
            "",

        specs:
            {},

        ldu:
            /\(LDU\)/i.test(name)

    };


    product.quantity =
        product.warehouse +
        product.display;


    return product;

}


// ======================================================
// РАЗБОР EXCEL
// ======================================================

function parseExcelFile(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                function(event) {

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


                        const firstSheet =
                            workbook.Sheets[
                                workbook.SheetNames[0]
                            ];


                        const rows =
                            XLSX.utils.sheet_to_json(
                                firstSheet,
                                {
                                    header: 1,
                                    defval: ""
                                }
                            );


                        resolve(rows);

                    }
                    catch(error) {

                        reject(error);

                    }

                };


            reader.onerror =
                function() {

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
// ПОИСК СТРОКИ ЗАГОЛОВКА
// ======================================================

function findHeaderRow(rows) {

    for (
        let i = 0;
        i < Math.min(rows.length, 30);
        i++
    ) {

        const row =
            rows[i] || [];


        const text =
            row
                .map(
                    value =>
                        String(value)
                            .toLowerCase()
                            .trim()
                )
                .join(" | ");


        if (
            text.includes("номенклатура") &&
            (
                text.includes("склад") ||
                text.includes("количество")
            )
        ) {

            return i;

        }

    }


    return -1;

}


// ======================================================
// ПОИСК КОЛОНОК
// ======================================================

function findColumns(rows, headerRow) {

    const row =
        rows[headerRow] || [];


    let nameColumn = 0;

    let warehouseColumn = 1;

    let displayColumn = 2;


    for (
        let i = 0;
        i < row.length;
        i++
    ) {

        const value =
            String(row[i] ?? "")
                .toLowerCase()
                .trim();


        if (
            value.includes("номенклатура")
        ) {

            nameColumn = i;

        }


        if (
            value.includes("склад тц европолис ов")
        ) {

            displayColumn = i;

        }


        if (
            value.includes("склад тц европолис") &&
            !value.includes("ов")
        ) {

            warehouseColumn = i;

        }

    }


    return {

        nameColumn,

        warehouseColumn,

        displayColumn

    };

}


// ======================================================
// ИМПОРТ ТОВАРОВ
// ======================================================

function importProducts(rows) {

    const headerRow =
        findHeaderRow(rows);


    if (headerRow === -1) {

        throw new Error(
            "Не удалось найти строку с заголовками 1С."
        );

    }


    const columns =
        findColumns(
            rows,
            headerRow
        );


    const imported =
        [];


    let skippedPF =
        0;

    let skippedCategories =
        0;


    for (
        let i = headerRow + 1;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i] || [];


        const rawName =
            row[columns.nameColumn];


        if (
            rawName === undefined ||
            rawName === null
        ) {

            continue;

        }


        const name =
            String(rawName)
                .replace(/\u00A0/g, " ")
                .trim();


        if (!name) {
            continue;
        }


        // ------------------------------------------
        // ПФ
        // ------------------------------------------

        if (
            /\(ПФ\)/i.test(name)
        ) {

            skippedPF++;

            continue;

        }


        // ------------------------------------------
        // Проверяем реальный товар
        // ------------------------------------------

        if (
            !isProductName(name)
        ) {

            skippedCategories++;

            continue;

        }


        const warehouse =
            row[
                columns.warehouseColumn
            ];


        const display =
            row[
                columns.displayColumn
            ];


        const product =
            createProduct(
                name,
                warehouse,
                display,
                i
            );


        imported.push(
            product
        );

    }


    return {

        products:
            imported,

        skippedPF,

        skippedCategories,

        headerRow,

        columns

    };

}


// ======================================================
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            "xiaomiWebBaseProducts",
            JSON.stringify(products)
        );

    }
    catch(error) {

        console.error(
            "Ошибка сохранения:",
            error
        );

    }

}


// ======================================================
// ЗАГРУЗКА БАЗЫ
// ======================================================

function loadProducts() {

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
            !Array.isArray(parsed)
        ) {

            return false;

        }


        products =
            parsed;


        return true;

    }
    catch(error) {

        console.error(
            "Ошибка загрузки сохраненной базы:",
            error
        );


        return false;

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
                    Товары не найдены
                </strong>

                <p>
                    Загрузите базу из 1С
                    или измените поиск.
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
                        product.ldu
                            ? `

                                <div class="product-info">

                                    LDU

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
                function() {

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

                    ${product.description || ""}

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


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                searchProducts();

            }

        }
    );

}


// ======================================================
// КАТЕГОРИИ
// ======================================================

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

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
// ИМПОРТ 1С
// ======================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        async function() {

            const file =
                fileInput.files[0];


            if (!file) {
                return;
            }


            if (fileName) {

                fileName.textContent =
                    file.name;

            }


            if (importStatus) {

                importStatus.textContent =
                    "Обрабатываем выгрузку 1С...";

            }


            try {

                const rows =
                    await parseExcelFile(
                        file
                    );


                const result =
                    importProducts(
                        rows
                    );


                products =
                    result.products;


                saveProducts();


                renderProducts(
                    products
                );


                if (importStatus) {

                    importStatus.innerHTML = `

                        <strong>
                            База успешно загружена
                        </strong>

                        <br>

                        Найдено товаров:
                        ${products.length}

                    `;

                }


                console.log(
                    "Импорт завершен:",
                    products.length,
                    "товаров"
                );


                console.log(
                    "Пропущено ПФ:",
                    result.skippedPF
                );


                console.log(
                    "Пропущено категорий:",
                    result.skippedCategories
                );


                console.log(
                    "Колонки:",
                    result.columns
                );

            }
            catch(error) {

                console.error(
                    "Ошибка импорта:",
                    error
                );


                if (importStatus) {

                    importStatus.innerHTML = `

                        <strong>
                            Ошибка загрузки
                        </strong>

                        <br>

                        ${escapeHTML(
                            error.message
                        )}

                    `;

                }

            }

        }
    );

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


    if (!entries.length) {

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
                    product.ldu
                        ? `

                            <div class="product-memory">
                                LDU
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

                    ${renderSpecs(product)}

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
// КНОПКИ КОЛИЧЕСТВА
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
                function() {

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
// НАЗАД
// ======================================================

document.addEventListener(
    "click",
    function(event) {

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

        }
        else {

            window.location.href =
                "index.html";

        }

    }
);


// ======================================================
// START
// ======================================================

function initApp() {

    // ------------------------------------------
    // Сначала пробуем сохраненную базу
    // ------------------------------------------

    loadProducts();


    // ------------------------------------------
    // Если база пустая — берём products-data.js
    // ------------------------------------------

    if (
        !products.length &&
        typeof window.products !== "undefined" &&
        Array.isArray(window.products)
    ) {

        products =
            window.products;

    }


    // ------------------------------------------
    // Главная
    // ------------------------------------------

    if (productsList) {

        renderProducts(
            products
        );

    }


    // ------------------------------------------
    // Карточка
    // ------------------------------------------

    if (productDetails) {

        renderProductPage();

    }


    console.log(
        "Xiaomi WebBase:",
        products.length,
        "товаров"
    );

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

}
else {

    initApp();

}