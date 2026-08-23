// ======================================================
// XIAOMI WEBBASE
// PRODUCT DATA
// ТЕСТОВАЯ ВЕРСИЯ
// ======================================================

const PRODUCTS_DATABASE_VERSION = "2026-08-23-test-1";

const PRODUCTS_STORAGE_KEY = "xiaomiWebBaseProducts";
const PRODUCTS_VERSION_KEY = "xiaomiWebBaseProductsVersion";


// ======================================================
// ТЕСТОВЫЙ ТОВАР
// ======================================================

const products = [

    {
        id: 1001,

        name: "Xiaomi 17 Ultra",

        category: "Смартфоны",

        memory: "16 / 512 GB",

        color: "Black",

        quantity: 3,

        ldu: 1,

        display: 1,

        warehouse: 2,

        description:
            "Флагманский смартфон Xiaomi 17 Ultra.",

        specs: {

            "Память": "16 / 512 GB",

            "Цвет": "Black",

            "LDU": "1 шт."

        },

        tip:
            "Один экземпляр находится на витрине, два — на складе."

    }

];


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
            "Ошибка сохранения базы:",
            error
        );

    }

}


function loadProducts() {

    try {

        const savedVersion =
            localStorage.getItem(
                PRODUCTS_VERSION_KEY
            );


        // Если версия изменилась —
        // очищаем старую локальную базу.

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
            "Ошибка загрузки базы:",
            error
        );

        localStorage.removeItem(
            PRODUCTS_STORAGE_KEY
        );

    }

}


// ======================================================
// ELEMENTS
// ======================================================

const productsList =
    document.getElementById(
        "productsList"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


const productDetails =
    document.getElementById(
        "productDetails"
    );


const categoryButtons =
    document.querySelectorAll(
        ".category-button"
    );


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(
    productsToRender
) {

    if (!productsList) {

        return;

    }


    productsList.innerHTML = "";


    if (
        !productsToRender ||
        productsToRender.length === 0
    ) {

        productsList.innerHTML = `

            <div class="empty-result">

                <strong>
                    Ничего не найдено
                </strong>

                <p>
                    Попробуйте изменить запрос
                </p>

            </div>

        `;

        return;

    }


    productsToRender.forEach(
        product => {

            const display =
                Number(
                    product.display || 0
                );


            const warehouse =
                Number(
                    product.warehouse || 0
                );


            const total =
                display +
                warehouse;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            card.innerHTML = `

                <div class="product-image">

                    Фото товара

                </div>


                <div class="product-name">

                    ${product.name}

                </div>


                <div class="product-info">

                    ${
                        product.memory
                            ? product.memory
                            : ""
                    }

                    ${
                        product.memory &&
                        product.color
                            ? " · "
                            : ""
                    }

                    ${
                        product.color
                            ? product.color
                            : ""
                    }

                </div>


                <div class="stock">

                    <div class="stock-row">

                        <span>
                            Витрина
                        </span>

                        <span>
                            ${display}
                        </span>

                    </div>


                    <div class="stock-row">

                        <span>
                            Склад
                        </span>

                        <span>
                            ${warehouse}
                        </span>

                    </div>


                    <div class="stock-row stock-total">

                        <span>
                            Всего
                        </span>

                        <span>
                            ${total}
                        </span>

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `product.html?id=${product.id}`;

                }
            );


            productsList.appendChild(
                card
            );

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
        searchInput.value
            .trim()
            .toLowerCase();


    if (query === "") {

        renderProducts(
            products
        );

        return;

    }


    const results =
        products.filter(
            product => {

                const searchText = `

                    ${product.name}

                    ${product.category}

                    ${product.memory || ""}

                    ${product.color || ""}

                `.toLowerCase();


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
// LIVE SEARCH
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ======================================================
// CATEGORIES
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
                        product => {

                            return (
                                product.category ===
                                category
                            );

                        }
                    );


                renderProducts(
                    filteredProducts
                );

            }
        );

    }
);


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


    const productId =
        Number(
            params.get("id")
        );


    const product =
        products.find(
            item =>
                item.id === productId
        );


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <h1>
                    Товар не найден
                </h1>

                <p>
                    Возможно, товар был удалён.
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
// RENDER SINGLE PRODUCT
// ======================================================

function renderProduct(
    product
) {

    const display =
        Number(
            product.display || 0
        );


    const warehouse =
        Number(
            product.warehouse || 0
        );


    const total =
        display +
        warehouse;


    let specsHTML = "";


    if (
        product.specs &&
        Object.keys(
            product.specs
        ).length > 0
    ) {

        specsHTML =
            Object.entries(
                product.specs
            )

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

    } else {

        specsHTML = `

            <p>
                Характеристики пока не добавлены.
            </p>

        `;

    }


    productDetails.innerHTML = `

        <div class="product-page">


            <div class="product-page-image">

                Фото товара

            </div>


            <div class="product-page-content">


                <div class="product-category">

                    ${product.category}

                </div>


                <h1>

                    ${product.name}

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


                <!-- НАЛИЧИЕ -->

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
                                class="quantity-button"
                                data-type="display"
                                data-action="minus"
                            >
                                −
                            </button>


                            <strong
                                id="displayQuantity"
                            >
                                ${display}
                            </strong>


                            <button
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
                                class="quantity-button"
                                data-type="warehouse"
                                data-action="minus"
                            >
                                −
                            </button>


                            <strong
                                id="warehouseQuantity"
                            >
                                ${warehouse}
                            </strong>


                            <button
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

                        <strong
                            id="totalQuantity"
                        >
                            ${total}
                        </strong>

                    </div>

                </div>


                <!-- ОПИСАНИЕ -->

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


                <!-- ХАРАКТЕРИСТИКИ -->

                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <!-- ПОДСКАЗКА -->

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
// QUANTITY BUTTONS
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
                        action === "plus"
                    ) {

                        product[type] =
                            Number(
                                product[type] || 0
                            ) + 1;

                    }


                    if (
                        action === "minus"
                    ) {

                        if (
                            Number(
                                product[type] || 0
                            ) > 0
                        ) {

                            product[type] =
                                Number(
                                    product[type]
                                ) - 1;

                        }

                    }


                    product.quantity =
                        Number(
                            product.display || 0
                        ) +
                        Number(
                            product.warehouse || 0
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
// START
// ======================================================

loadProducts();


if (productsList) {

    renderProducts(
        products
    );

}


if (productDetails) {

    renderProductPage();

}