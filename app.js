const products = [
    {
        id: 1,
        name: "Redmi Note 15",
        category: "Смартфоны",
        memory: "8 / 256 GB",
        color: "Чёрный",

        display: 1,
        warehouse: 2,

        description:
            "Смартфон с AMOLED-дисплеем, высокой частотой обновления и большой батареей.",

        specs: {
            "Экран": "6.77 AMOLED, 120 Гц",
            "Процессор": "MediaTek",
            "Камера": "108 Мп",
            "Аккумулятор": "6000 мА·ч",
            "NFC": "Есть"
        },

        tip:
            "Хороший вариант для покупателя, которому важны большой экран и автономность."
    },

    {
        id: 2,
        name: "Xiaomi 15",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Белый",

        display: 1,
        warehouse: 0,

        description:
            "Компактный флагман Xiaomi с производительным процессором и качественной камерой.",

        specs: {
            "Экран": "6.36 AMOLED, 120 Гц",
            "Процессор": "Snapdragon",
            "Камера": "50 Мп",
            "Аккумулятор": "5240 мА·ч",
            "NFC": "Есть"
        },

        tip:
            "Подходит покупателям, которым нужен компактный и производительный флагман."
    },

    {
        id: 3,
        name: "Redmi Pad 2",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Серый",

        display: 0,
        warehouse: 3,

        description:
            "Планшет для работы, просмотра видео, учёбы и повседневных задач.",

        specs: {
            "Экран": "11 дюймов",
            "Процессор": "MediaTek",
            "Память": "8 / 256 GB",
            "Аккумулятор": "Большая ёмкость",
            "NFC": "Нет"
        },

        tip:
            "Хороший вариант для просмотра контента, учёбы и повседневного использования."
    }
];


// ========================================
// ELEMENTS
// ========================================

const productsList =
    document.getElementById("productsList");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const productDetails =
    document.getElementById("productDetails");


// ========================================
// LOCAL STORAGE
// ========================================

function saveProducts() {

    localStorage.setItem(
        "xiaomiWebBaseProducts",
        JSON.stringify(products)
    );

}


function loadProducts() {

    const savedProducts =
        localStorage.getItem(
            "xiaomiWebBaseProducts"
        );


    if (!savedProducts) {
        return;
    }


    try {

        const parsedProducts =
            JSON.parse(savedProducts);


        if (Array.isArray(parsedProducts)) {

            products.length = 0;

            products.push(...parsedProducts);

        }

    } catch (error) {

        console.error(
            "Ошибка загрузки товаров:",
            error
        );

    }

}


// ========================================
// PRODUCT LIST
// ========================================

function renderProducts(productsToRender) {

    if (!productsList) {
        return;
    }


    productsList.innerHTML = "";


    if (productsToRender.length === 0) {

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

        const total =
            Number(product.display || 0) +
            Number(product.warehouse || 0);


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
                ${product.memory}
                ·
                ${product.color}
            </div>


            <div class="stock">

                <div class="stock-row">

                    <span>
                        Витрина
                    </span>

                    <span>
                        ${product.display}
                    </span>

                </div>


                <div class="stock-row">

                    <span>
                        Склад
                    </span>

                    <span>
                        ${product.warehouse}
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


// ========================================
// SEARCH
// ========================================

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

                ${product.memory}

                ${product.color}

            `.toLowerCase();


            return searchText.includes(query);

        });


    renderProducts(results);

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


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


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ========================================
// PRODUCT PAGE
// ========================================

function renderProductPage() {

    if (!productDetails) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        Number(params.get("id"));


    const product =
        products.find(
            item => item.id === productId
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


    renderProduct(product);

}


// ========================================
// RENDER PRODUCT
// ========================================

function renderProduct(product) {

    const total =
        Number(product.display || 0) +
        Number(product.warehouse || 0);


    let specsHTML = "";


    if (
        product.specs &&
        Object.keys(product.specs).length > 0
    ) {

        specsHTML =
            Object.entries(product.specs)

                .map(([key, value]) => `

                    <div class="spec-row">

                        <span>
                            ${key}
                        </span>

                        <strong>
                            ${value}
                        </strong>

                    </div>

                `)

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


                <div class="product-memory">
                    ${product.memory}
                </div>


                <div class="product-color">

                    Цвет:
                    <strong>
                        ${product.color}
                    </strong>

                </div>


                <!-- STOCK -->

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
                                ${product.display}
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
                                ${product.warehouse}
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

                        <strong id="totalQuantity">
                            ${total}
                        </strong>

                    </div>

                </div>


                <!-- DESCRIPTION -->

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


                <!-- SPECS -->

                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <!-- TIP -->

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


    setupQuantityButtons(product);

}


// ========================================
// QUANTITY BUTTONS
// ========================================

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


                if (action === "plus") {

                    product[type] =
                        Number(product[type]) + 1;

                }


                if (action === "minus") {

                    if (
                        Number(product[type]) > 0
                    ) {

                        product[type] =
                            Number(product[type]) - 1;

                    }

                }


                saveProducts();

                renderProduct(product);

            }
        );

    });

}


// ========================================
// START
// ========================================

loadProducts();


if (productsList) {

    renderProducts(products);

}


if (productDetails) {

    renderProductPage();

}