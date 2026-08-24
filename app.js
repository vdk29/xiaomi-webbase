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
// КОЛОНКИ ВЫГРУЗКИ 1С
// ======================================================
//
// A = Номенклатура
// B = Склад ТЦ Европейский
// C = Склад ТЦ Европейский ОВ
// D = Итого
//
// В нашей базе:
//
// B -> Склад
// C -> Витрина
// D -> НЕ ИСПОЛЬЗУЕМ
//
// Индексы JavaScript начинаются с 0:
//
// A = 0
// B = 1
// C = 2
// D = 3
//
// ======================================================

const ONE_C_NAME_COLUMN = 0;
const ONE_C_WAREHOUSE_COLUMN = 1;
const ONE_C_DISPLAY_COLUMN = 2;


// ======================================================
// ОБЩИЕ ФУНКЦИИ
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
            .replace(/\s/g, "")
            .replace(",", ".");


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
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(product) {

    const category =
        normalizeText(product.category);

    const name =
        normalizeText(product.name);


    // --------------------------------------------------
    // Сначала проверяем категорию 1С
    // --------------------------------------------------

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
        category.includes("смарт-часы") ||
        category.includes("смарт часы") ||
        category.includes("умные часы") ||
        category === "часы" ||
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


    // --------------------------------------------------
    // СМАРТФОНЫ
    // --------------------------------------------------

    if (
        name.includes("смартфон") ||
        name.includes("телефон xiaomi") ||
        name.includes("телефон redmi") ||
        name.startsWith("xiaomi 17") ||
        name.startsWith("xiaomi 15") ||
        name.startsWith("xiaomi 14") ||
        name.startsWith("redmi note") ||
        name.startsWith("redmi 17") ||
        name.startsWith("redmi 16") ||
        name.startsWith("redmi 15") ||
        name.startsWith("redmi 14") ||
        name.startsWith("redmi a") ||
        name.startsWith("poco ")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
    // --------------------------------------------------

    if (
        name.includes("планшет") ||
        name.includes("redmi pad") ||
        name.includes("xiaomi pad") ||
        name.includes("pad 7") ||
        name.includes("pad 6") ||
        name.includes("pad 5")
    ) {

        return "Планшеты";

    }


    // --------------------------------------------------
    // СМАРТ-ЧАСЫ
    // --------------------------------------------------

    if (
        name.includes("смарт-часы") ||
        name.includes("смарт часы") ||
        name.includes("умные часы") ||
        name.includes("smart watch") ||
        name.includes("smartwatch") ||
        name.includes("watch s") ||
        name.includes("watch 5") ||
        name.includes("watch 4") ||
        name.includes("watch 2") ||
        name.includes("watch 1")
    ) {

        return "Смарт-часы";

    }


    // --------------------------------------------------
    // ФИТНЕС-БРАСЛЕТЫ
    // --------------------------------------------------

    if (
        name.includes("фитнес-браслет") ||
        name.includes("фитнес браслет") ||
        name.includes("mi band") ||
        name.includes("mi-band") ||
        name.includes("smart band") ||
        name.includes("band 9") ||
        name.includes("band 10")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // АКСЕССУАРЫ / ОСТАЛЬНОЕ
    // --------------------------------------------------

    return "Другое";

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

        display:
            display,

        warehouse:
            warehouse,

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


    // --------------------------------------------------
    // ID
    // --------------------------------------------------

    if (
        prepared.id === undefined ||
        prepared.id === null ||
        prepared.id === ""
    ) {

        prepared.id =
            index + 1;

    }


    // --------------------------------------------------
    // Название
    // --------------------------------------------------

    prepared.name =
        String(
            prepared.name ||
            "Без названия"
        ).trim();


    // --------------------------------------------------
    // Категория
    // --------------------------------------------------

    prepared.category =
        detectCategory(
            prepared
        );


    // --------------------------------------------------
    // Остатки
    // --------------------------------------------------

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


    return prepared;

}


// ======================================================
// НОРМАЛИЗАЦИЯ ВСЕЙ БАЗЫ
// ======================================================

function normalizeProducts() {

    if (
        !Array.isArray(products)
    ) {

        return;

    }


    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        const prepared =
            prepareProduct(
                products[i],
                i
            );


        if (prepared) {

            products[i] =
                prepared;

        }

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

                                    ${
                                        product.memory || ""
                                    }

                                    ${
                                        product.memory &&
                                        product.color
                                            ? " · "
                                            : ""
                                    }

                                    ${
                                        product.color || ""
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
// ПОИСК — КНОПКА
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// ПОИСК — ENTER
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
                            "Не удалось сохранить изменения:",
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
// ПОИСК НАЗВАНИЯ ТОВАРА
// ======================================================
//
// ВАЖНО:
// Название всегда берём из первой колонки.
// Нам больше не нужно угадывать товар по первым
// словам названия.
//
// Поэтому строки:
//
// "17T"
// "Redmi Note 15 Pro"
// "Планшеты"
// "02 АКСЕССУАРЫ ДЛЯ ПЛАНШЕТОВ"
//
// не будут случайно превращаться в товары только
// из-за наличия чисел.
//
// ======================================================

function isRealProductName(name) {

    const text =
        normalizeText(name);


    if (!text) {

        return false;

    }


    // --------------------------------------------------
    // Служебные строки
    // --------------------------------------------------

    const forbidden = [

        "номенклатура",

        "итого",

        "смартфоны xiaomi",

        "планшеты",

        "аксессуары для планшетов",

        "аксессуары для смартфонов",

        "02 устройства",

        "03 аксессуары",

        "04 аксессуары",

        "тв",

        "красота и здоровье"

    ];


    if (
        forbidden.includes(text)
    ) {

        return false;

    }


    // --------------------------------------------------
    // Строки, похожие на заголовки групп
    // --------------------------------------------------

    if (
        /^[0-9]{1,3}\s+[а-яa-z]+$/i.test(text)
    ) {

        return false;

    }


    if (
        text.length < 3
    ) {

        return false;

    }


    // --------------------------------------------------
    // Реальные товары обычно содержат название,
    // модель, артикул или описание.
    //
    // Не отбрасываем неизвестные товары:
    // 1С может добавить новую модель.
    // --------------------------------------------------

    return true;

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
                    "Загрузка файла...";

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
                            "Строк в файле:",
                            rows.length
                        );


                        const imported =
                            parse1CData(
                                rows
                            );


                        if (
                            !imported.length
                        ) {

                            throw new Error(
                                "Не удалось найти товары в выгрузке 1С."
                            );

                        }


                        products.length = 0;


                        imported.forEach(
                            product => {

                                products.push(
                                    product
                                );

                            }
                        );


                        normalizeProducts();


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
                            "ИМПОРТ 1С ЗАВЕРШЁН"
                        );

                        console.log(
                            "Товаров:",
                            products.length
                        );

                        console.log(
                            "================================="
                        );

                    } catch (error) {

                        console.error(
                            "Ошибка импорта:",
                            error
                        );


                        if (importStatus) {

                            importStatus.textContent =
                                "Ошибка загрузки: " +
                                error.message;

                        }

                    }

                };


            reader.readAsArrayBuffer(
                file
            );

        }
    );

}


// ======================================================
// ПАРСЕР ВЫГРУЗКИ 1С
// ======================================================

function parse1CData(rows) {

    const result = [];


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        return result;

    }


    let productId = 1;


    // --------------------------------------------------
    // Ищем строку заголовков.
    //
    // Нам важно убедиться, что это именно та таблица,
    // где есть:
    //
    // Номенклатура
    // Склад...
    // Склад... ОВ
    // Итого
    // --------------------------------------------------

    let headerRowIndex = -1;


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
                    cell =>
                        normalizeText(cell)
                )
                .join(" | ");


        if (
            text.includes("номенклатура") &&
            text.includes("итого")
        ) {

            headerRowIndex =
                i;

            break;

        }

    }


    console.log(
        "Строка заголовков 1С:",
        headerRowIndex
    );


    // --------------------------------------------------
    // Если заголовок найден — начинаем после него.
    // Если нет — пробуем со всей таблицы.
    // --------------------------------------------------

    const start =
        headerRowIndex >= 0
            ? headerRowIndex + 1
            : 0;


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
        // ВАЖНО:
        // НЕ удаляем пустые ячейки.
        //
        // Именно это раньше ломало остатки.
        //
        // Например:
        //
        // A = Redmi Note 15 Pro
        // B = пусто
        // C = 1
        // D = 1
        //
        // Мы должны сохранить это положение.
        // ------------------------------------------------

        const cells =
            row.map(
                cell => {

                    if (
                        cell === undefined ||
                        cell === null
                    ) {

                        return "";

                    }

                    return String(cell)
                        .trim();

                }
            );


        const name =
            cells[
                ONE_C_NAME_COLUMN
            ];


        // ------------------------------------------------
        // Проверяем название
        // ------------------------------------------------

        if (
            !isRealProductName(
                name
            )
        ) {

            continue;

        }


        // ------------------------------------------------
        // Читаем ТОЛЬКО фиксированные колонки
        //
        // B = склад
        // C = витрина
        //
        // D = Итого НЕ ЧИТАЕМ
        // ------------------------------------------------

        const warehouse =
            Math.max(
                0,
                number(
                    cells[
                        ONE_C_WAREHOUSE_COLUMN
                    ]
                )
            );


        const display =
            Math.max(
                0,
                number(
                    cells[
                        ONE_C_DISPLAY_COLUMN
                    ]
                )
            );


        // ------------------------------------------------
        // Создаём товар
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

            // ВАЖНО:
            // склад = колонка B
            warehouse:
                warehouse,

            // витрина = колонка C
            display:
                display,

            quantity:
                warehouse + display,

            description:
                "",

            tip:
                "",

            specs:
                {}

        };


        // ------------------------------------------------
        // Категория
        // ------------------------------------------------

        product.category =
            detectCategory(
                product
            );


        result.push(
            product
        );


        // ------------------------------------------------
        // Отладка первых товаров
        // ------------------------------------------------

        if (
            result.length <= 20
        ) {

            console.log(
                "1С товар:",
                product.name,
                "| Склад:",
                product.warehouse,
                "| Витрина:",
                product.display,
                "| Всего:",
                product.quantity,
                "| Категория:",
                product.category
            );

        }

    }


    return result;

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
    // Нормализация
    // --------------------------------------------------

    normalizeProducts();


    // --------------------------------------------------
    // Статистика
    // --------------------------------------------------

    console.log(
        "================================="
    );

    console.log(
        "Xiaomi WebBase"
    );

    console.log(
        "Всего товаров:",
        products.length
    );


    console.log(
        "Смартфоны:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Смартфоны"
        ).length
    );


    console.log(
        "Планшеты:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Планшеты"
        ).length
    );


    console.log(
        "Смарт-часы:",
        products.filter(
            p =>
                detectCategory(p) ===
                "Смарт-часы"
        ).length
    );


    console.log(
        "Фитнес-браслеты:",
        products.filter(
            p =>
                detectCategory(p) ===
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
