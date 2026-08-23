// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================

console.log("Xiaomi WebBase app.js запущен");


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
            .replace(/\s/g, "")
            .replace(",", ".");

    const result =
        parseFloat(text);

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
// SAVE
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            "xiaomiWebBaseProducts",
            JSON.stringify(products)
        );

        console.log(
            "Сохранено товаров:",
            products.length
        );

    } catch (error) {

        console.error(
            "Ошибка сохранения:",
            error
        );

    }

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
                    Товаров нет
                </strong>

                <p>
                    Загрузите выгрузку из 1С.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(product => {

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

                    ${escapeHTML(product.category || "")}

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
            () => {

                window.location.href =
                    "product.html?id=" +
                    encodeURIComponent(
                        product.id
                    );

            }
        );


        productsList.appendChild(card);

    });

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// SEARCH
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

        renderProducts(products);

        return;

    }


    const result =
        products.filter(product => {

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
                .join(" ")
                .toLowerCase();


            return text.includes(query);

        });


    renderProducts(result);

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
// SEARCH INPUT
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchProducts();

            }

        }
    );

}


// ======================================================
// CATEGORIES
// ======================================================

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const category =
                button.dataset.category;


            categoryButtons.forEach(item => {

                item.classList.remove("active");

            });


            button.classList.add("active");


            if (searchInput) {

                searchInput.value = "";

            }


            if (category === "Все") {

                renderProducts(products);

                return;

            }


            const filtered =
                products.filter(product => {

                    return product.category === category;

                });


            renderProducts(filtered);

        }
    );

});


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
                String(item.id) === String(id)
        );


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <strong>
                    Товар не найден
                </strong>

                <p>
                    Вернитесь назад.
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
        .map(([key, value]) => `

            <div class="spec-row">

                <span>
                    ${escapeHTML(key)}
                </span>

                <strong>
                    ${escapeHTML(value)}
                </strong>

            </div>

        `)
        .join("");

}


// ======================================================
// PRODUCT CARD PAGE
// ======================================================

function renderProduct(product) {

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
        `${product.name || "Товар"} — Xiaomi WebBase`;


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


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

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
                    number(product[type]);


                if (action === "plus") {

                    value++;

                }


                if (action === "minus") {

                    value =
                        Math.max(
                            0,
                            value - 1
                        );

                }


                product[type] =
                    value;


                saveProducts();


                renderProduct(product);

            }
        );

    });

}


// ======================================================
// BACK
// ======================================================

document.addEventListener(
    "click",
    event => {

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
// ИМПОРТ EXCEL
// ======================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        handleFileImport
    );

}


// ======================================================
// IMPORT FILE
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


    if (importStatus) {

        importStatus.textContent =
            "Обработка файла...";

        importStatus.className =
            "import-status";

    }


    try {

        if (
            typeof XLSX === "undefined"
        ) {

            throw new Error(
                "Библиотека XLSX не загрузилась."
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


        console.log(
            "Листы Excel:",
            workbook.SheetNames
        );


        let importedProducts = [];


        for (
            const sheetName of workbook.SheetNames
        ) {

            const sheet =
                workbook.Sheets[sheetName];


            const rows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );


            console.log(
                "Лист:",
                sheetName,
                "строк:",
                rows.length
            );


            const result =
                parseOneCReport(rows);


            if (
                result.length >
                importedProducts.length
            ) {

                importedProducts =
                    result;

            }

        }


        if (
            importedProducts.length === 0
        ) {

            throw new Error(
                "Не удалось найти товары в выгрузке 1С."
            );

        }


        products =
            importedProducts;


        saveProducts();


        renderProducts(products);


        if (importStatus) {

            importStatus.textContent =
                `Загружено товаров: ${products.length}`;

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
                "Ошибка: " +
                error.message;

            importStatus.className =
                "import-status error";

        }


        // ВАЖНО:
        // старые товары не удаляем,
        // если импорт не удался.

        renderProducts(products);

    }

}


// ======================================================
// РАЗБОР ОТЧЁТА 1С
// ======================================================

function parseOneCReport(rows) {

    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        return [];

    }


    console.log(
        "Пытаемся разобрать отчёт 1С"
    );


    // --------------------------------------------------
    // Ищем строку с Номенклатура
    // --------------------------------------------------

    let headerIndex = -1;


    for (
        let i = 0;
        i < Math.min(rows.length, 30);
        i++
    ) {

        const row =
            rows[i]
                .map(cell =>
                    String(cell)
                        .trim()
                        .toLowerCase()
                );


        if (
            row.some(
                cell =>
                    cell === "номенклатура" ||
                    cell.includes("номенклатура")
            )
        ) {

            headerIndex = i;

            break;

        }

    }


    console.log(
        "Строка заголовка:",
        headerIndex
    );


    // --------------------------------------------------
    // Если заголовок не найден,
    // пробуем искать товары напрямую.
    // --------------------------------------------------

    const result = [];


    let currentCategory =
        "Другое";


    for (
        let i = Math.max(0, headerIndex + 1);
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];


        if (!row) {

            continue;

        }


        const cells =
            row.map(
                value =>
                    String(value ?? "").trim()
            );


        const text =
            cells.join(" ").trim();


        if (!text) {

            continue;

        }


        // ------------------------------------------------
        // Полностью игнорируем ПФ
        // ------------------------------------------------

        if (
            /\(ПФ\)/i.test(text)
        ) {

            continue;

        }


        // ------------------------------------------------
        // Находим название товара
        // ------------------------------------------------

        let name =
            findProductName(cells);


        if (!name) {

            continue;

        }


        name =
            cleanProductName(name);


        if (!name) {

            continue;

        }


        // ------------------------------------------------
        // Не берём строки категорий
        // ------------------------------------------------

        if (
            isCategoryRow(name)
        ) {

            currentCategory =
                normalizeCategory(name);

            continue;

        }


        // ------------------------------------------------
        // Определяем категорию по названию
        // ------------------------------------------------

        const category =
            detectCategory(
                name,
                currentCategory
            );


        // ------------------------------------------------
        // Количества
        // ------------------------------------------------

        const quantities =
            extractQuantities(cells);


        // ------------------------------------------------
        // Если количества нет —
        // скорее всего это служебная строка
        // ------------------------------------------------

        if (
            quantities.display === 0 &&
            quantities.warehouse === 0 &&
            !looksLikeProduct(name)
        ) {

            continue;

        }


        const product = {

            id:
                createProductId(
                    name,
                    i
                ),

            name,

            category,

            memory:
                extractMemory(name),

            color:
                extractColor(name),

            display:
                quantities.display,

            warehouse:
                quantities.warehouse,

            quantity:
                quantities.display +
                quantities.warehouse,

            description:
                "",

            tip:
                "",

            specs: {}

        };


        result.push(product);

    }


    // --------------------------------------------------
    // Удаляем дубликаты
    // --------------------------------------------------

    const unique =
        new Map();


    result.forEach(product => {

        const key =
            product.name
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();


        if (!unique.has(key)) {

            unique.set(
                key,
                product
            );

        } else {

            const existing =
                unique.get(key);


            existing.display +=
                number(product.display);


            existing.warehouse +=
                number(product.warehouse);


            existing.quantity =
                existing.display +
                existing.warehouse;

        }

    });


    return Array.from(
        unique.values()
    );

}


// ======================================================
// FIND PRODUCT NAME
// ======================================================

function findProductName(cells) {

    // Обычно название находится
    // в первой текстовой ячейке.

    for (
        const cell of cells
    ) {

        const value =
            String(cell).trim();


        if (!value) {

            continue;

        }


        if (
            value.toLowerCase()
                .includes("остатки на складах")
        ) {

            continue;

        }


        if (
            value.toLowerCase()
                .includes("параметры:")
        ) {

            continue;

        }


        if (
            value.toLowerCase()
                .includes("период:")
        ) {

            continue;

        }


        if (
            value.toLowerCase()
                .includes("отбор:")
        ) {

            continue;

        }


        if (
            value.toLowerCase() ===
            "номенклатура"
        ) {

            continue;

        }


        // Не берём просто числа

        if (
            /^[\d\s.,]+$/.test(value)
        ) {

            continue;

        }


        // Не берём строки "Итого"

        if (
            /^итого$/i.test(value)
        ) {

            continue;

        }


        // Реальный товар

        if (
            looksLikeProduct(value)
        ) {

            return value;

        }

    }


    return "";

}


// ======================================================
// LOOKS LIKE PRODUCT
// ======================================================

function looksLikeProduct(name) {

    const text =
        String(name)
            .trim();


    if (!text) {

        return false;

    }


    if (
        text.length < 5
    ) {

        return false;

    }


    // Служебные строки

    const forbidden = [

        "остатки на складах",
        "номенклатура",
        "итого",
        "параметры",
        "период",
        "отбор",
        "количество",
        "склад"

    ];


    const lower =
        text.toLowerCase();


    if (
        forbidden.some(
            word =>
                lower === word
        )
    ) {

        return false;

    }


    // Категории

    if (
        isCategoryRow(text)
    ) {

        return false;

    }


    return true;

}


// ======================================================
// CATEGORY ROW
// ======================================================

function isCategoryRow(name) {

    const text =
        String(name)
            .trim()
            .toLowerCase();


    const categories = [

        "смартфоны",
        "экосистема xiaomi",
        "аксессуары",
        "аксессуары для планшетов",
        "аксессуары эко",
        "зарядные устройства",
        "кабели",
        "видео",
        "ip-камеры",
        "тв-приставки",
        "красота и здоровье",
        "мелкая бытовая техника",
        "наушники",
        "очистители",
        "портативные аккумуляторы",
        "пылесосы",
        "рюкзаки и чемоданы",
        "свет",
        "телевизоры",
        "товары diy",
        "товары для детей",
        "товары для животных",
        "товары для компьютера",
        "увлажнители",
        "умные часы",
        "умный дом",
        "фитнес-браслеты",
        "подарки",
        "сертификаты",
        "планшеты"

    ];


    return categories.includes(text);

}


// ======================================================
// NORMALIZE CATEGORY
// ======================================================

function normalizeCategory(name) {

    const lower =
        String(name)
            .toLowerCase();


    if (
        lower.includes("смартф")
    ) {

        return "Смартфоны";

    }


    if (
        lower.includes("планш")
    ) {

        return "Планшеты";

    }


    if (
        lower.includes("умные часы") ||
        lower.includes("смарт-часы")
    ) {

        return "Смарт-часы";

    }


    if (
        lower.includes("фитнес-брасл")
    ) {

        return "Фитнес-браслеты";

    }


    return "Другое";

}


// ======================================================
// DETECT CATEGORY
// ======================================================

function detectCategory(
    name,
    currentCategory
) {

    const text =
        name.toLowerCase();


    if (
        text.includes("смартфон") ||
        text.includes("xiaomi 17") ||
        text.includes("xiaomi 15") ||
        text.includes("redmi 17") ||
        text.includes("redmi note")
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
        text.includes("watch ")
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


    return normalizeCategory(
        currentCategory
    );

}


// ======================================================
// EXTRACT QUANTITIES
// ======================================================

function extractQuantities(cells) {

    const numbers = [];


    cells.forEach(cell => {

        const value =
            String(cell)
                .trim();


        if (!value) {

            return;

        }


        // Пропускаем текст

        if (
            !/^-?\d+(?:[.,]\d+)?$/.test(
                value.replace(/\s/g, "")
            )
        ) {

            return;

        }


        const n =
            number(value);


        if (
            Number.isFinite(n)
        ) {

            numbers.push(n);

        }

    });


    // Для строки товара в нормальной
    // выгрузке 1С у нас две основные
    // колонки склада:
    //
    // Склад ТЦ Европолис
    // Склад ТЦ Европолис ОВ
    //
    // Поэтому берём первые два
    // значения количества после названия.

    if (
        numbers.length >= 2
    ) {

        return {

            warehouse:
                numbers[0],

            display:
                numbers[1]

        };

    }


    if (
        numbers.length === 1
    ) {

        return {

            warehouse:
                numbers[0],

            display:
                0

        };

    }


    return {

        warehouse: 0,
        display: 0

    };

}


// ======================================================
// CLEAN PRODUCT NAME
// ======================================================

function cleanProductName(name) {

    return String(name)
        .replace(/^\(LDU\)\s*/i, "")
        .replace(/^\(ПФ\)\s*/i, "")
        .replace(/\s+/g, " ")
        .trim();

}


// ======================================================
// MEMORY
// ======================================================

function extractMemory(name) {

    const match =
        String(name).match(
            /\b\d+(?:GB|TB)\s*\+\s*\d+(?:GB|TB)\b/i
        );


    return match
        ? match[0]
        : "";

}


// ======================================================
// COLOR
// ======================================================

function extractColor(name) {

    const colors = [

        "Black",
        "White",
        "Blue",
        "Green",
        "Purple",
        "Violet",
        "Deep Blue",
        "Deep Violet",
        "Graphite Gray",
        "Silver",
        "Silver Gray",
        "Titan Gray",
        "Midnight Black",
        "Dark Black",
        "Jungle Green",
        "Sunset Orange",
        "Pearl White",
        "Pink"

    ];


    const lower =
        String(name)
            .toLowerCase();


    for (
        const color of colors
    ) {

        if (
            lower.includes(
                color.toLowerCase()
            )
        ) {

            return color;

        }

    }


    return "";

}


// ======================================================
// PRODUCT ID
// ======================================================

function createProductId(
    name,
    index
) {

    const text =
        String(name)
            .toLowerCase()
            .replace(/[^a-zа-я0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80);


    return (
        text +
        "-" +
        index
    );

}


// ======================================================
// START
// ======================================================

function initApp() {

    console.log(
        "Товаров в базе:",
        products.length
    );


    if (productsList) {

        renderProducts(products);

    }


    if (productDetails) {

        renderProductPage();

    }

}


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