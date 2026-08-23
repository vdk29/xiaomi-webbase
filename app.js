// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================
// Основная логика сайта
// Данные товаров находятся в products-data.js
// ======================================================


// ======================================================
// ЗАПУСК ПОСЛЕ ЗАГРУЗКИ HTML
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Xiaomi WebBase: app.js запущен");


    // ==================================================
    // ELEMENTS
    // ==================================================

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


    // ==================================================
    // ПРОВЕРКА PRODUCTS
    // ==================================================

    if (
        typeof products === "undefined"
    ) {

        console.error(
            "products-data.js не загрузился"
        );

        if (productsList) {

            productsList.innerHTML = `
                <div class="empty-result">

                    <strong>
                        Ошибка загрузки базы
                    </strong>

                    <p>
                        Файл products-data.js
                        не найден или содержит ошибку.
                    </p>

                </div>
            `;

        }

        return;
    }


    console.log(
        "Загружено товаров:",
        products.length
    );


    // ==================================================
    // ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
    // ==================================================

    function num(value) {

        const result = Number(value);

        if (Number.isFinite(result)) {

            return result;

        }

        return 0;

    }


    // ==================================================
    // ОСТАТКИ
    // ==================================================

    function getStock(product) {

        const display =
            num(product.display);

        const warehouse =
            num(product.warehouse);

        return {

            display: display,

            warehouse: warehouse,

            total:
                display + warehouse

        };

    }


    // ==================================================
    // ГЛАВНАЯ — ОТОБРАЖЕНИЕ ТОВАРОВ
    // ==================================================

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
                        Ничего не найдено
                    </strong>

                    <p>
                        Попробуйте изменить запрос.
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


            // ==================================================
            // ОТКРЫТИЕ ТОВАРА
            // ==================================================

            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `product.html?id=${encodeURIComponent(product.id)}`;

                }
            );


            productsList.appendChild(card);

        });

    }


    // ==================================================
    // ПОИСК
    // ==================================================

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

                const text = `

                    ${product.id || ""}

                    ${product.name || ""}

                    ${product.category || ""}

                    ${product.memory || ""}

                    ${product.color || ""}

                    ${product.description || ""}

                `.toLowerCase();


                return text.includes(query);

            });


        renderProducts(result);

    }


    // ==================================================
    // КНОПКА ПОИСКА
    // ==================================================

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchProducts
        );

    }


    // ==================================================
    // ENTER В ПОИСКЕ
    // ==================================================

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    searchProducts();

                }

            }
        );


        // Живой поиск

        searchInput.addEventListener(
            "input",
            searchProducts
        );

    }


    // ==================================================
    // КАТЕГОРИИ
    // ==================================================

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                // Убираем active

                categoryButtons.forEach(item => {

                    item.classList.remove("active");

                });


                // Добавляем active

                button.classList.add("active");


                // Очищаем поиск

                if (searchInput) {

                    searchInput.value = "";

                }


                // Все товары

                if (category === "Все") {

                    renderProducts(products);

                    return;

                }


                // Фильтр категории

                const filtered =
                    products.filter(product => {

                        return (
                            product.category === category
                        );

                    });


                renderProducts(filtered);

            }
        );

    });


    // ==================================================
    // СТРАНИЦА ТОВАРА
    // ==================================================

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
            products.find(item => {

                return String(item.id) === String(id);

            });


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


    // ==================================================
    // ХАРАКТЕРИСТИКИ
    // ==================================================

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


        return entries.map(
            ([key, value]) => {

                return `

                    <div class="spec-row">

                        <span>
                            ${key}
                        </span>

                        <strong>
                            ${value}
                        </strong>

                    </div>

                `;

            }
        ).join("");

    }


    // ==================================================
    // КАРТОЧКА ТОВАРА
    // ==================================================

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


                    <!-- ==============================
                         НАЛИЧИЕ
                    =============================== -->

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


                    <!-- ==============================
                         ОПИСАНИЕ
                    =============================== -->

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


                    <!-- ==============================
                         ХАРАКТЕРИСТИКИ
                    =============================== -->

                    <div class="product-specs">

                        <h2>
                            Характеристики
                        </h2>


                        ${specsHTML}

                    </div>


                    <!-- ==============================
                         ПОДСКАЗКА
                    =============================== -->

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


        setupQuantityButtons(product);

    }


    // ==================================================
    // КНОПКИ + / -
    // ==================================================

    function setupQuantityButtons(product) {

        const buttons =
            document.querySelectorAll(
                ".quantity-button"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


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
                        num(product[type]);


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


                    product.quantity =
                        num(product.display) +
                        num(product.warehouse);


                    // ==================================================
                    // СОХРАНЕНИЕ
                    // ==================================================

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


                    // ==================================================
                    // ПЕРЕРИСОВЫВАЕМ КАРТОЧКУ
                    // ==================================================

                    renderProduct(product);

                }
            );

        });

    }


    // ==================================================
    // КНОПКА НАЗАД
    // ==================================================

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


            event.preventDefault();


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


    // ==================================================
    // ЗАПУСК
    // ==================================================

    if (productsList) {

        renderProducts(products);

    }


    if (productDetails) {

        renderProductPage();

    }


    console.log(
        "Xiaomi WebBase успешно запущен"
    );

});
