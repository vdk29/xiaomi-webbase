// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// Работа с товарами + импорт выгрузки 1С
// ======================================================


// ======================================================
// ЭЛЕМЕНТЫ
// ======================================================

const productsList = document.getElementById("productsList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const importStatus = document.getElementById("importStatus");

const productDetails = document.getElementById("productDetails");

const categoryButtons =
    document.querySelectorAll(".category-button");


// ======================================================
// ГЛОБАЛЬНАЯ БАЗА
// ======================================================

let currentProducts = [];


// ======================================================
// ЧИСЛО
// ======================================================

function toNumber(value) {

    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    let text = String(value)
        .replace(/\s/g, "")
        .replace(",", ".");

    const result = parseFloat(text);

    return Number.isFinite(result) ? result : 0;
}


// ======================================================
// ОЧИСТКА НАЗВАНИЯ
// ======================================================

function cleanProductName(name) {

    if (!name) {
        return "";
    }

    let result = String(name).trim();

    // Игнорируем отметку ПФ
    result = result.replace(/^\(ПФ\)\s*/i, "");

    // Убираем LDU только как служебную пометку
    result = result.replace(/^\(LDU\)\s*/i, "");

    return result.trim();
}


// ======================================================
// ПРОВЕРКА: ПОХОЖЕ ЛИ НА ТОВАР
// ======================================================

function looksLikeProduct(name) {

    if (!name) {
        return false;
    }

    const text = String(name).trim();

    if (!text) {
        return false;
    }


    // --------------------------------------------------
    // Служебные строки
    // --------------------------------------------------

    const forbidden = [
        "итого",
        "остатки на складах",
        "номенклатура",
        "параметры",
        "отбор",
        "период"
    ];


    const lower = text.toLowerCase();

    for (const word of forbidden) {

        if (lower === word) {
            return false;
        }

    }


    // --------------------------------------------------
    // Строки категорий
    // --------------------------------------------------

    if (/^\d{2}\s/.test(text)) {
        return false;
    }

    if (/^\d{2}\s/.test(text.replace(/^\(LDU\)\s*/i, ""))) {
        return false;
    }


    // --------------------------------------------------
    // Группы вида:
    //
    // Наушники 50,000
    // Пылесосы 15,000
    // Mi Band 10 5,000
    //
    // --------------------------------------------------

    if (
        /\s\d+[,.]\d{3}\s*$/.test(text) &&
        !/(смартфон|планшет|часы|браслет|наушники|камера|пылесос|кабель|чехол|заряд|мышь|монитор|телевизор|телефон|колонка|фен|щетка|датчик|ремешок|стилус|аккумулятор|кормушка|поилка|очиститель|увлажнитель|чайник|аэрогриль|бритва|лампа|держатель|батарейк|сертификат|пакет|стекло|пленка)/i.test(text)
    ) {
        return false;
    }


    // --------------------------------------------------
    // Категории без количества
    // --------------------------------------------------

    const categoryWords = [
        "старые",
        "старые чехлы",
        "подарки",
        "другое",
        "видео",
        "красота и здоровье",
        "мелкая бытовая техника",
        "наушники",
        "очистители",
        "пылесосы",
        "свет",
        "телевизоры",
        "товары diy",
        "товары для детей",
        "товары для животных",
        "товары для компьютера",
        "умные часы",
        "умный дом",
        "фитнес-браслеты",
        "планшеты",
        "аксессуары",
        "зарядные устройства",
        "кабели",
        "чехлы",
        "защитные пленки и стекла",
        "колонки",
        "сертификаты"
    ];


    if (
        categoryWords.includes(
            lower
        )
    ) {
        return false;
    }


    // --------------------------------------------------
    // Остальные строки считаем товаром
    // --------------------------------------------------

    return true;
}


// ======================================================
// ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
// ======================================================

function detectCategory(name) {

    const text = name.toLowerCase();


    if (
        /смартфон|iphone|redmi note|redmi 1[567]|xiaomi 1[567]/i.test(text)
    ) {
        return "Смартфоны";
    }


    if (
        /планшет|pad \d|redmi pad|xiaomi pad/i.test(text)
    ) {
        return "Планшеты";
    }


    if (
        /смарт-часы|смарт часы|smart watch|watch \d|watch s|watch 5|watch 6/i.test(text)
    ) {
        return "Смарт-часы";
    }


    if (
        /фитнес-браслет|smart band|mi band/i.test(text)
    ) {
        return "Фитнес-браслеты";
    }


    if (
        /наушник|buds|headphones|openwear/i.test(text)
    ) {
        return "Наушники";
    }


    if (
        /пылесос|robot vacuum/i.test(text)
    ) {
        return "Пылесосы";
    }


    if (
        /телевизор|xiaomi tv|tv a |tv s /i.test(text)
    ) {
        return "Телевизоры";
    }


    if (
        /камера|ip-камер|видеонаблюдени/i.test(text)
    ) {
        return "Камеры";
    }


    if (
        /зарядн|зарядка|charger|сзу|азу/i.test(text)
    ) {
        return "Зарядные устройства";
    }


    if (
        /кабель|дата-кабель|data cable/i.test(text)
    ) {
        return "Кабели";
    }


    if (
        /чехол|стекло защитное|пленк/i.test(text)
    ) {
        return "Аксессуары";
    }


    if (
        /ремешок/i.test(text)
    ) {
        return "Аксессуары";
    }


    if (
        /аккумулятор|power bank|внешний аккумулятор/i.test(text)
    ) {
        return "Портативные аккумуляторы";
    }


    if (
        /мышь|клавиатур|монитор|роутер|маршрутизатор|ретранслятор/i.test(text)
    ) {
        return "Компьютерная техника";
    }


    if (
        /колонка|speaker/i.test(text)
    ) {
        return "Аудио";
    }


    return "Другое";
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
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            "xiaomiWebBaseProducts",
            JSON.stringify(currentProducts)
        );

    } catch (error) {

        console.error(
            "Ошибка сохранения базы:",
            error
        );

    }

}


// ======================================================
// ЗАГРУЗКА БАЗЫ ИЗ LOCALSTORAGE
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
            JSON.parse(saved);


        if (
            Array.isArray(parsed) &&
            parsed.length
        ) {

            return parsed;

        }

    } catch (error) {

        console.error(
            "Ошибка загрузки сохранённой базы:",
            error
        );

    }


    return null;

}


// ======================================================
// РЕНДЕР ТОВАРОВ
// ======================================================

function renderProducts(list) {

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
                        Xiaomi
                    </span>

                </div>


                <div class="product-card-content">

                    <div class="product-category">

                        ${product.category || "Другое"}

                    </div>


                    <div class="product-name">

                        ${product.name || "Без названия"}

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
                () => {

                    window.location.href =
                        "product.html?id=" +
                        encodeURIComponent(product.id);

                }
            );


            productsList.appendChild(card);

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
            currentProducts
        );

        return;

    }


    const result =
        currentProducts.filter(
            product => {

                const text = `

                    ${product.name || ""}

                    ${product.category || ""}

                    ${product.id || ""}

                `.toLowerCase();


                return text.includes(query);

            }
        );


    renderProducts(result);

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
        event => {

            if (event.key === "Enter") {

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
            () => {

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


                if (category === "Все") {

                    renderProducts(
                        currentProducts
                    );

                    return;

                }


                const filtered =
                    currentProducts.filter(
                        product =>
                            product.category === category
                    );


                renderProducts(filtered);

            }
        );

    }
);


// ======================================================
// ======================================================
// ИМПОРТ EXCEL ИЗ 1С
// ======================================================
// ======================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        async event => {

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
                    "Обработка выгрузки 1С...";

            }


            try {

                const importedProducts =
                    await import1CFile(file);


                if (
                    !importedProducts.length
                ) {

                    throw new Error(
                        "Не удалось найти товары в выгрузке."
                    );

                }


                currentProducts =
                    importedProducts;


                saveProducts();


                renderProducts(
                    currentProducts
                );


                if (importStatus) {

                    importStatus.textContent =
                        `Готово. Загружено товаров: ${currentProducts.length}`;

                }


                console.log(
                    "Импорт 1С завершён:",
                    currentProducts
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

                }

            }

        }
    );

}


// ======================================================
// ЧТЕНИЕ EXCEL
// ======================================================

async function import1CFile(file) {

    if (
        typeof XLSX === "undefined"
    ) {

        throw new Error(
            "Не загрузилась библиотека XLSX."
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


    const sheetName =
        workbook.SheetNames[0];


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


    if (
        !Array.isArray(rows) ||
        !rows.length
    ) {

        throw new Error(
            "Excel-файл пустой."
        );

    }


    console.log(
        "Строк в Excel:",
        rows.length
    );


    // --------------------------------------------------
    // Ищем строку с Номенклатура
    // --------------------------------------------------

    let headerRowIndex = -1;


    for (
        let i = 0;
        i < Math.min(rows.length, 100);
        i++
    ) {

        const row =
            rows[i]
                .map(value =>
                    String(value)
                        .trim()
                        .toLowerCase()
                );


        if (
            row.some(
                value =>
                    value.includes("номенклатура")
            )
        ) {

            headerRowIndex = i;

            break;

        }

    }


    console.log(
        "Строка заголовков:",
        headerRowIndex
    );


    // --------------------------------------------------
    // ВАЖНО:
    //
    // В некоторых выгрузках 1С XLSX
    // заголовки могут отсутствовать как
    // нормальная таблица.
    //
    // Поэтому ниже есть универсальный
    // разбор строк.
    // --------------------------------------------------

    const result = [];

    let id = 1;


    for (
        let i = headerRowIndex >= 0
            ? headerRowIndex + 1
            : 0;

        i < rows.length;

        i++
    ) {

        const row =
            rows[i];


        if (!row || !row.length) {
            continue;
        }


        // ----------------------------------------------
        // Название обычно находится в первой колонке
        // ----------------------------------------------

        let rawName =
            row[0];


        if (
            rawName === undefined ||
            rawName === null ||
            String(rawName).trim() === ""
        ) {

            continue;

        }


        let name =
            cleanProductName(rawName);


        if (!name) {
            continue;
        }


        // ----------------------------------------------
        // Пропускаем категории и служебные строки
        // ----------------------------------------------

        if (
            !looksLikeProduct(name)
        ) {

            continue;

        }


        // ----------------------------------------------
        // Собираем все числовые значения строки
        // ----------------------------------------------

        const numbers = [];


        for (
            let j = 1;

            j < row.length;

            j++
        ) {

            const value =
                toNumber(row[j]);


            if (
                value !== 0 ||
                String(row[j]).trim() === "0"
            ) {

                numbers.push(value);

            }

        }


        // ----------------------------------------------
        // Определяем остаток
        //
        // В твоей выгрузке:
        //
        // Склад ТЦ Европолис
        // Склад ТЦ Европолис ОВ
        // Итого
        //
        // Для начала:
        //
        // первый остаток = склад
        // второй остаток = витрина
        //
        // Если присутствует только один —
        // он считается складом.
        // ----------------------------------------------

        let warehouse = 0;
        let display = 0;


        if (numbers.length >= 2) {

            warehouse =
                numbers[0];

            display =
                numbers[1];

        } else if (numbers.length === 1) {

            warehouse =
                numbers[0];

        }


        // ----------------------------------------------
        // Создаём товар
        // ----------------------------------------------

        const product = {

            id: id++,

            name: name,

            category:
                detectCategory(name),

            display:
                display,

            warehouse:
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

            specs: {}

        };


        result.push(product);

    }


    return result;

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
        Number(
            params.get("id")
        );


    const product =
        currentProducts.find(
            item =>
                Number(item.id) === id
        );


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <strong>
                    Товар не найден
                </strong>

                <p>
                    Вернитесь в базу товаров.
                </p>

            </div>

        `;

        return;

    }


    renderProduct(product);

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
        Object.entries(product.specs);


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


    productDetails.innerHTML = `

        <div class="product-page">

            <div class="product-page-image">

                <span>
                    Xiaomi
                </span>

            </div>


            <div class="product-page-content">

                <div class="product-category">

                    ${product.category || "Другое"}

                </div>


                <h1>

                    ${product.name}

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
                        ${product.description || "Описание пока не добавлено."}
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
                        ${product.tip || "Подсказка пока не добавлена."}
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
                () => {

                    const type =
                        button.dataset.type;


                    const action =
                        button.dataset.action;


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
                        toNumber(product.display) +
                        toNumber(product.warehouse);


                    saveProducts();


                    renderProduct(product);

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
// ЗАПУСК
// ======================================================

function initApp() {

    // --------------------------------------------------
    // Сначала пытаемся загрузить сохранённую базу
    // --------------------------------------------------

    const saved =
        loadSavedProducts();


    if (saved) {

        currentProducts =
            saved;

    } else if (
        typeof products !== "undefined" &&
        Array.isArray(products)
    ) {

        currentProducts =
            products;

    } else {

        currentProducts = [];

    }


    console.log(
        "Xiaomi WebBase:",
        currentProducts.length,
        "товаров"
    );


    // --------------------------------------------------
    // Главная
    // --------------------------------------------------

    if (productsList) {

        renderProducts(
            currentProducts
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