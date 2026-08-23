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
//
// ВАЖНО:
//
// Мы больше не полагаемся только на category
// из файла 1С.
//
// Если 1С написала:
//
// "04 Планшеты"
// "REDMI Pad 2"
// "Планшет Xiaomi..."
//
// всё равно определяем товар как Планшеты.
//
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
        text.includes("smartphone") ||
        text.includes("смартфоны") ||
        category.includes("смартфон")
    ) {

        return "Смартфоны";

    }


    // --------------------------------------------------
    // ПЛАНШЕТЫ
    // --------------------------------------------------

    if (
        text.includes("планшет") ||
        text.includes("pad ") ||
        text.startsWith("pad") ||
        text.includes("redmi pad") ||
        text.includes("xiaomi pad")
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
        text.includes("watch ")
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
        text.includes("band ")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // ЕСЛИ 1С УЖЕ ДАЛА НОРМАЛЬНОЕ НАЗВАНИЕ
    // --------------------------------------------------

    if (
        category.includes("смартфон")
    ) {

        return "Смартфоны";

    }

    if (
        category.includes("планшет")
    ) {

        return "Планшеты";

    }

    if (
        category.includes("часы")
    ) {

        return "Смарт-часы";

    }

    if (
        category.includes("браслет")
    ) {

        return "Фитнес-браслеты";

    }


    // --------------------------------------------------
    // ОСТАЛЬНЫЕ
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


                // --------------------------------------
                // Активная кнопка
                // --------------------------------------

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


                // --------------------------------------
                // Очищаем поиск
                // --------------------------------------

                if (searchInput) {

                    searchInput.value = "";

                }


                // --------------------------------------
                // Все
                // --------------------------------------

                if (
                    category === "Все"
                ) {

                    renderProducts(
                        products
                    );

                    return;

                }


                // --------------------------------------
                // Фильтр
                // --------------------------------------

                const filtered =
                    products.filter(
                        product => {

                            const detected =
                                detectCategory(
                                    product
                                );


                            return (
                                detected ===
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


                    // ----------------------------------
                    // Сохраняем изменения
                    // ----------------------------------

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
                            "Импортировано:",
                            products.length
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


    // --------------------------------------------------
    // Ищем строки, где встречаются реальные товары.
    //
    // В выгрузке 1С структура примерно такая:
    //
    // Номенклатура | Склад | Склад ОВ | Итого
    //
    // Но XLSX может прочитать заголовки криво,
    // поэтому не используем номера колонок жёстко.
    // --------------------------------------------------


    let productId = 1;


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


        const cells =
            row.map(
                cell =>
                    String(
                        cell === undefined ||
                        cell === null
                            ? ""
                            : cell
                    ).trim()
            );


        const nonEmpty =
            cells.filter(
                value =>
                    value !== ""
            );


        if (
            nonEmpty.length < 2
        ) {

            continue;

        }


        // ------------------------------------------------
        // Ищем название товара
        // ------------------------------------------------

        let nameIndex = -1;


        for (
            let j = 0;
            j < cells.length;
            j++
        ) {

            const value =
                cells[j];


            const text =
                value.toLowerCase();


            if (
                text.startsWith("смартфон ") ||
                text.startsWith("планшет ") ||
                text.startsWith("смарт-часы ") ||
                text.startsWith("смарт часы ") ||
                text.startsWith("фитнес-браслет ") ||
                text.startsWith("фитнес браслет ") ||
                text.startsWith("беспроводные наушники") ||
                text.startsWith("наушники ") ||
                text.startsWith("камера ") ||
                text.startsWith("телевизор ") ||
                text.startsWith("пылесос ") ||
                text.startsWith("робот-пылесос ") ||
                text.startsWith("внешний аккумулятор") ||
                text.startsWith("зарядное устройство") ||
                text.startsWith("умный ") ||
                text.startsWith("умные ") ||
                text.startsWith("стилус ") ||
                text.startsWith("чехол ") ||
                text.startsWith("чехол-") ||
                text.startsWith("кабель ") ||
                text.startsWith("дата-кабель ") ||
                text.startsWith("дата-кабель") ||
                text.startsWith("ремешок ") ||
                text.startsWith("аэрогриль ") ||
                text.startsWith("фен ") ||
                text.startsWith("массажер ") ||
                text.startsWith("электробритва ") ||
                text.startsWith("электронные весы ") ||
                text.startsWith("очиститель ") ||
                text.startsWith("монитор ") ||
                text.startsWith("мышь ") ||
                text.startsWith("маршрутизатор ") ||
                text.startsWith("ретранслятор ") ||
                text.startsWith("лампа ") ||
                text.startsWith("батарейки ") ||
                text.startsWith("автомобильный держатель") ||
                text.startsWith("адаптер-") ||
                text.startsWith("защитное стекло") ||
                text.startsWith("стекло защитное") ||
                text.startsWith("подарочный сертификат")
            ) {

                nameIndex =
                    j;

                break;

            }

        }


        // ------------------------------------------------
        // Если название не нашли — пропускаем строку.
        //
        // Это защищает от категорий:
        //
        // "17T 34,000"
        // "Наушники 50,000"
        // "Планшеты 13,000"
        //
        // Они НЕ являются товарами.
        // ------------------------------------------------

        if (
            nameIndex === -1
        ) {

            continue;

        }


        const name =
            cells[nameIndex];


        // ------------------------------------------------
        // Собираем числовые значения после названия
        // ------------------------------------------------

        const numbers = [];


        for (
            let j = nameIndex + 1;
            j < cells.length;
            j++
        ) {

            const value =
                cells[j];


            if (
                value === ""
            ) {

                continue;

            }


            const parsed =
                number(value);


            if (
                parsed !== 0 ||
                /^[0-9]+([,.][0-9]+)?$/.test(
                    value
                )
            ) {

                numbers.push(
                    parsed
                );

            }

        }


        // ------------------------------------------------
        // Для выгрузки 1С:
        //
        // после товара могут идти:
        //
        // склад
        // склад ОВ
        // итого
        //
        // Берём первые два значения.
        // ------------------------------------------------

        let display = 0;
        let warehouse = 0;


        if (
            numbers.length >= 2
        ) {

            display =
                numbers[0];

            warehouse =
                numbers[1];

        } else if (
            numbers.length === 1
        ) {

            display =
                numbers[0];

            warehouse =
                0;

        }


        // ------------------------------------------------
        // Защита от отрицательных значений
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
        // Определяем категорию
        // ------------------------------------------------

        product.category =
            detectCategory(
                product
            );


        // ------------------------------------------------
        // Пропускаем только нормальные товары
        // ------------------------------------------------

        if (
            product.name &&
            product.name.length > 2
        ) {

            result.push(
                product
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

    // --------------------------------------------------
    // Проверяем product-data.js
    // --------------------------------------------------

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
    // Сначала пытаемся загрузить сохранённую базу
    // --------------------------------------------------

    loadSavedProducts();


    // --------------------------------------------------
    // Нормализуем товары
    // --------------------------------------------------

    normalizeProducts();


    // --------------------------------------------------
    // Информация в консоль
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


    // --------------------------------------------------
    // Главная
    // --------------------------------------------------

    if (productsList) {

        renderProducts(
            products
        );

    }


    // --------------------------------------------------
    // Страница товара
    // --------------------------------------------------

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