// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// Вся логика приложения.
// Данные товаров находятся отдельно в product-data.js.
// ======================================================


// ======================================================
// НАСТРОЙКИ
// ======================================================

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";

const PRODUCTS_VERSION_KEY =
    "xiaomiWebBaseProductsVersion";


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


// ======================================================
// LOCAL STORAGE
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            PRODUCTS_STORAGE_KEY,
            JSON.stringify(products)
        );

        localStorage.setItem(
            PRODUCTS_VERSION_KEY,
            PRODUCTS_DATABASE_VERSION
        );

    } catch (error) {

        console.error(
            "Ошибка сохранения базы товаров:",
            error
        );

    }

}


// ======================================================
// ЗАГРУЗКА ТОВАРОВ
// ======================================================

function loadProducts() {

    const savedVersion =
        localStorage.getItem(
            PRODUCTS_VERSION_KEY
        );


    // --------------------------------------------------
    // Если версия базы изменилась —
    // удаляем старую локальную базу.
    // --------------------------------------------------

    if (
        savedVersion !==
        PRODUCTS_DATABASE_VERSION
    ) {

        localStorage.removeItem(
            PRODUCTS_STORAGE_KEY
        );

        localStorage.setItem(
            PRODUCTS_VERSION_KEY,
            PRODUCTS_DATABASE_VERSION
        );

        return;

    }


    const savedProducts =
        localStorage.getItem(
            PRODUCTS_STORAGE_KEY
        );


    if (!savedProducts) {

        return;

    }


    try {

        const parsedProducts =
            JSON.parse(savedProducts);


        if (
            Array.isArray(parsedProducts)
        ) {

            products.length = 0;

            products.push(
                ...parsedProducts
            );

        }

    } catch (error) {

        console.error(
            "Ошибка загрузки товаров:",
            error
        );

        localStorage.removeItem(
            PRODUCTS_STORAGE_KEY
        );

    }

}


// ======================================================
// СОХРАНЕНИЕ БАЗЫ ПРИ ПЕРВОМ ЗАПУСКЕ
// ======================================================

function initializeProductsDatabase() {

    const savedVersion =
        localStorage.getItem(
            PRODUCTS_VERSION_KEY
        );


    const savedProducts =
        localStorage.getItem(
            PRODUCTS_STORAGE_KEY
        );


    if (
        !savedVersion ||
        !savedProducts
    ) {

        saveProducts();

    }

}


// ======================================================
// БЕЗОПАСНОЕ ЗНАЧЕНИЕ
// ======================================================

function safeNumber(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return 0;

    }


    return number;

}


// ======================================================
// ОБНОВЛЕНИЕ TOTAL
// ======================================================

function updateProductTotal(product) {

    product.display =
        safeNumber(product.display);

    product.warehouse =
        safeNumber(product.warehouse);

    product.ldu =
        safeNumber(product.ldu);

    product.quantity =
        product.display +
        product.warehouse;

}


// ======================================================
// ПОЛУЧЕНИЕ ОСТАТКОВ
// ======================================================

function getProductStock(product) {

    const display =
        safeNumber(product.display);

    const warehouse =
        safeNumber(product.warehouse);

    const total =
        display +
        warehouse;


    return {
        display,
        warehouse,
        total
    };

}


// ======================================================
// ЭКРАН ПУСТОГО РЕЗУЛЬТАТА
// ======================================================

function renderEmptyResult(
    title = "Ничего не найдено",
    text = "Попробуйте изменить запрос"
) {

    if (!productsList) {

        return;

    }


    productsList.innerHTML = `

        <div class="empty-result">

            <strong>
                ${title}
            </strong>

            <p>
                ${text}
            </p>

        </div>

    `;

}


// ======================================================
// СОЗДАНИЕ КАРТОЧКИ
// ======================================================

function createProductCard(product) {

    const stock =
        getProductStock(product);


    const card =
        document.createElement("div");


    card.className =
        "product-card";


    card.dataset.productId =
        product.id;


    const memory =
        product.memory
            ? product.memory
            : "";


    const color =
        product.color
            ? product.color
            : "";


    let productInfo = "";


    if (
        memory &&
        color
    ) {

        productInfo =
            `${memory} · ${color}`;

    } else if (memory) {

        productInfo =
            memory;

    } else if (color) {

        productInfo =
            color;

    }


    // --------------------------------------------------
    // СТАТУС НАЛИЧИЯ
    // --------------------------------------------------

    let stockStatus =
        "Нет в наличии";


    if (
        stock.total > 0
    ) {

        if (
            stock.display > 0 &&
            stock.warehouse > 0
        ) {

            stockStatus =
                "Витрина + склад";

        } else if (
            stock.display > 0
        ) {

            stockStatus =
                "На витрине";

        } else if (
            stock.warehouse > 0
        ) {

            stockStatus =
                "На складе";

        }

    }


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
                productInfo
                    ? `
                        <div class="product-info">
                            ${productInfo}
                        </div>
                    `
                    : ""
            }


            <div class="stock-status">

                ${stockStatus}

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

            openProduct(
                product.id
            );

        }
    );


    return card;

}


// ======================================================
// ОТКРЫТИЕ ТОВАРА
// ======================================================

function openProduct(productId) {

    window.location.href =
        `product.html?id=${encodeURIComponent(productId)}`;

}


// ======================================================
// РЕНДЕР СПИСКА ТОВАРОВ
// ======================================================

function renderProducts(
    productsToRender = products
) {

    if (!productsList) {

        return;

    }


    productsList.innerHTML = "";


    if (
        !Array.isArray(productsToRender) ||
        productsToRender.length === 0
    ) {

        renderEmptyResult();

        return;

    }


    const fragment =
        document.createDocumentFragment();


    productsToRender.forEach(
        product => {

            updateProductTotal(
                product
            );


            const card =
                createProductCard(
                    product
                );


            fragment.appendChild(
                card
            );

        }
    );


    productsList.appendChild(
        fragment
    );

}


// ======================================================
// ПОИСКОВЫЙ ТЕКСТ
// ======================================================

function getProductSearchText(product) {

    const specsText =
        product.specs
            ? Object.entries(
                product.specs
            )
                .map(
                    ([key, value]) =>
                        `${key} ${value}`
                )
                .join(" ")
            : "";


    return `

        ${product.id || ""}

        ${product.name || ""}

        ${product.category || ""}

        ${product.memory || ""}

        ${product.color || ""}

        ${product.description || ""}

        ${product.tip || ""}

        ${specsText}

    `.toLowerCase();

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


    const results =
        products.filter(
            product => {

                const searchText =
                    getProductSearchText(
                        product
                    );


                return searchText.includes(
                    query
                );

            }
        );


    renderProducts(
        results
    );

}


// ======================================================
// ПОИСК ПО КНОПКЕ
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

function setActiveCategory(
    activeButton
) {

    categoryButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }

}


// ======================================================
// ФИЛЬТР КАТЕГОРИИ
// ======================================================

function filterByCategory(
    category
) {

    if (
        category === "Все"
    ) {

        renderProducts(
            products
        );

        return;

    }


    const filteredProducts =
        products.filter(
            product =>
                product.category === category
        );


    renderProducts(
        filteredProducts
    );

}


// ======================================================
// КНОПКИ КАТЕГОРИЙ
// ======================================================

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                setActiveCategory(
                    button
                );


                if (searchInput) {

                    searchInput.value = "";

                }


                filterByCategory(
                    category
                );

            }
        );

    }
);


// ======================================================
// ПОИСК ПО КАТЕГОРИИ + ЗАПРОСУ
// ======================================================

function filterProducts(
    category = "Все",
    query = ""
) {

    const normalizedQuery =
        query
            .trim()
            .toLowerCase();


    return products.filter(
        product => {

            const categoryMatch =
                category === "Все" ||
                product.category === category;


            if (!categoryMatch) {

                return false;

            }


            if (!normalizedQuery) {

                return true;

            }


            return getProductSearchText(
                product
            ).includes(
                normalizedQuery
            );

        }
    );

}


// ======================================================
// СБРОС ФИЛЬТРОВ
// ======================================================

function resetFilters() {

    if (searchInput) {

        searchInput.value = "";

    }


    categoryButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    const allButton =
        Array.from(
            categoryButtons
        ).find(
            button =>
                button.dataset.category === "Все"
        );


    if (allButton) {

        allButton.classList.add(
            "active"
        );

    }


    renderProducts(
        products
    );

}


// ======================================================
// PRODUCT PAGE
// ======================================================

function getProductFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        Number(
            params.get("id")
        );


    if (
        !id
    ) {

        return null;

    }


    return products.find(
        product =>
            Number(product.id) === id
    ) || null;

}


// ======================================================
// РЕНДЕР СТРАНИЦЫ ТОВАРА
// ======================================================

function renderProductPage() {

    if (!productDetails) {

        return;

    }


    const product =
        getProductFromURL();


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <h1>
                    Товар не найден
                </h1>

                <p>
                    Возможно, товар был удалён
                    или ссылка устарела.
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
// СТАТУС ТОВАРА
// ======================================================

function getProductStatus(
    product
) {

    const stock =
        getProductStock(
            product
        );


    if (
        stock.total === 0
    ) {

        return "Нет в наличии";

    }


    if (
        stock.display > 0 &&
        stock.warehouse > 0
    ) {

        return "Есть на витрине и складе";

    }


    if (
        stock.display > 0
    ) {

        return "Есть на витрине";

    }


    return "Есть на складе";

}


// ======================================================
// РЕНДЕР ТОВАРА
// ======================================================

function renderProduct(
    product
) {

    updateProductTotal(
        product
    );


    const stock =
        getProductStock(
            product
        );


    const status =
        getProductStatus(
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


                <div class="product-status">

                    ${status}

                </div>


                <!-- ================================= -->
                <!-- НАЛИЧИЕ -->
                <!-- ================================= -->

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


                            <strong
                                id="displayQuantity"
                            >
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


                            <strong
                                id="warehouseQuantity"
                            >
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

                        <strong id="totalQuantity">

                            ${stock.total}

                        </strong>

                    </div>

                </div>


                <!-- ================================= -->
                <!-- DESCRIPTION -->
                <!-- ================================= -->

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


                <!-- ================================= -->
                <!-- SPECS -->
                <!-- ================================= -->

                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <!-- ================================= -->
                <!-- TIP -->
                <!-- ================================= -->

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
        `${product.name || "Товар"} — Xiaomi WebBase`;


    setupQuantityButtons(
        product
    );

}


// ======================================================
// КНОПКИ КОЛИЧЕСТВА
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


                    const currentValue =
                        safeNumber(
                            product[type]
                        );


                    if (
                        action === "plus"
                    ) {

                        product[type] =
                            currentValue + 1;

                    }


                    if (
                        action === "minus"
                    ) {

                        product[type] =
                            Math.max(
                                0,
                                currentValue - 1
                            );

                    }


                    updateProductTotal(
                        product
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
// НАВИГАЦИЯ НАЗАД
// ======================================================

document.addEventListener(
    "click",
    event => {

        const backButton =
            event.target.closest(
                "[data-back]"
            );


        if (!backButton) {

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
// ESC — НАЗАД
// ======================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        if (
            productDetails &&
            productDetails.innerHTML.trim()
        ) {

            if (
                window.history.length > 1
            ) {

                window.history.back();

            }

        }

    }
);


// ======================================================
// ПРОВЕРКА ДАННЫХ
// ======================================================

function validateProducts() {

    if (
        !Array.isArray(products)
    ) {

        console.error(
            "PRODUCTS ERROR: products не является массивом."
        );

        return false;

    }


    const ids =
        new Set();


    products.forEach(
        product => {

            if (
                product.id === undefined ||
                product.id === null
            ) {

                console.warn(
                    "Товар без ID:",
                    product
                );

                return;

            }


            if (
                ids.has(
                    product.id
                )
            ) {

                console.warn(
                    "Обнаружен повторяющийся ID товара:",
                    product.id
                );

            }


            ids.add(
                product.id
            );


            updateProductTotal(
                product
            );

        }
    );


    return true;

}


// ======================================================
// ОБЩАЯ ИНИЦИАЛИЗАЦИЯ
// ======================================================

function initApp() {

    console.log(
        "Xiaomi WebBase запускается..."
    );


    if (
        !validateProducts()
    ) {

        return;

    }


    loadProducts();


    initializeProductsDatabase();


    // --------------------------------------------------
    // Главная страница
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


    console.log(
        `Xiaomi WebBase: загружено товаров — ${products.length}`
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

} else {

    initApp();

}