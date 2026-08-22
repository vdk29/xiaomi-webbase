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


// ======================================================
// HELPERS
// ======================================================

function getDisplay(product) {

    return Number(product.display || 0);

}


function getWarehouse(product) {

    return Number(product.warehouse || 0);

}


function getTotal(product) {

    return (
        getDisplay(product) +
        getWarehouse(product)
    );

}


// ======================================================
// PRODUCT LIST
// ======================================================

function renderProducts(productsToRender) {

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


    productsToRender.forEach(product => {

        const display =
            getDisplay(product);

        const warehouse =
            getWarehouse(product);

        const total =
            getTotal(product);


        const card =
            document.createElement("div");


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


        productsList.appendChild(card);

    });

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

        renderProducts(products);

        return;
    }


    const results =
        products.filter(product => {

            const searchText = `

                ${product.name}

                ${product.category}

                ${product.memory || ""}

                ${product.color || ""}

                ${product.description || ""}

                ${
                    product.specs
                        ? Object.values(product.specs).join(" ")
                        : ""
                }

            `.toLowerCase();


            return searchText.includes(query);

        });


    renderProducts(results);

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

            if (event.key === "Enter") {

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


            const filteredProducts =
                products.filter(product => {

                    return (
                        product.category ===
                        category
                    );

                });


            renderProducts(
                filteredProducts
            );

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


    const productId =
        Number(
            params.get("id")
        );


    const product =
        products.find(item => {

            return item.id === productId;

        });


    if (!product) {

        productDetails.innerHTML = `

            <div class="empty-result">

                <h1>
                    Товар не найден
                </h1>

                <p>
                    Возможно, товар был удалён
                    или ссылка неверная.
                </p>

            </div>

        `;

        return;
    }


    renderProduct(product);

}


// ======================================================
// RENDER PRODUCT
// ======================================================

function renderProduct(product) {

    const display =
        getDisplay(product);


    const warehouse =
        getWarehouse(product);


    const total =
        getTotal(product);


    // ==================================================
    // SPECS
    // ==================================================

    let specsHTML = "";


    if (
        product.specs &&
        Object.keys(product.specs).length > 0
    ) {

        specsHTML =
            Object.entries(product.specs)

                .map(([key, value]) => {

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

                })

                .join("");

    } else {

        specsHTML = `

            <p>
                Характеристики пока не добавлены.
            </p>

        `;

    }


    // ==================================================
    // PRODUCT HTML
    // ==================================================

    productDetails.innerHTML = `

        <div class="product-page">


            <!-- IMAGE -->

            <div class="product-page-image">

                Фото товара

            </div>


            <!-- CONTENT -->

            <div class="product-page-content">


                <!-- CATEGORY -->

                <div class="product-category">

                    ${product.category}

                </div>


                <!-- NAME -->

                <h1>

                    ${product.name}

                </h1>


                <!-- MEMORY -->

                ${
                    product.memory
                        ? `

                            <div class="product-memory">

                                ${product.memory}

                            </div>

                        `
                        : ""
                }


                <!-- COLOR -->

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


                <!-- =================================
                     STOCK
                ================================== -->

                <div class="product-stock">

                    <h2>
                        Наличие
                    </h2>


                    <!-- DISPLAY -->

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


                    <!-- WAREHOUSE -->

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


                    <!-- TOTAL -->

                    <div class="stock-big-row total">

                        <span>
                            Всего
                        </span>


                        <strong id="totalQuantity">

                            ${total}

                        </strong>

                    </div>

                </div>


                <!-- =================================
                     DESCRIPTION
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


                <!-- =================================
                     SPECS
                ================================== -->

                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <!-- =================================
                     TIP
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


    // ==================================================
    // PAGE TITLE
    // ==================================================

    document.title =
        `${product.name} — Xiaomi WebBase`;


    // ==================================================
    // BUTTONS
    // ==================================================

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


                // ======================================
                // PLUS
                // ======================================

                if (action === "plus") {

                    product[type] =
                        Number(
                            product[type] || 0
                        ) + 1;

                }


                // ======================================
                // MINUS
                // ======================================

                if (action === "minus") {

                    const current =
                        Number(
                            product[type] || 0
                        );


                    if (current > 0) {

                        product[type] =
                            current - 1;

                    }

                }


                // ======================================
                // TOTAL
                // ======================================

                product.quantity =
                    getTotal(product);


                // ======================================
                // SAVE
                // ======================================

                saveProducts();


                // ======================================
                // RENDER AGAIN
                // ======================================

                renderProduct(product);

            }
        );

    });

}


// ======================================================
// INITIALIZATION
// ======================================================

function init() {

    // ================================================
    // MAIN PAGE
    // ================================================

    if (productsList) {

        renderProducts(products);

    }


    // ================================================
    // PRODUCT PAGE
    // ================================================

    if (productDetails) {

        renderProductPage();

    }

}


// ======================================================
// START
// ======================================================

init();