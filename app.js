// ======================================================
// XIAOMI WEBBASE
// APP
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

const categoryButtons =
    document.querySelectorAll(".category-button");

const productDetails =
    document.getElementById("productDetails");

const addProductButton =
    document.getElementById("addProductButton");

const productModal =
    document.getElementById("productModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");

const modalTitle =
    document.getElementById("modalTitle");

const productImage =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");


// ======================================================
// STATE
// ======================================================

let editingProductId = null;

let selectedImage = "";


// ======================================================
// MODAL
// ======================================================

function openProductModal(product = null) {

    if (!productModal) {
        return;
    }


    productModal.classList.add("active");

    document.body.classList.add("modal-open");


    if (product) {

        editingProductId =
            product.id;

        modalTitle.textContent =
            "Редактировать товар";

        fillProductForm(product);

    } else {

        editingProductId =
            null;

        modalTitle.textContent =
            "Добавить товар";

        resetProductForm();

    }

}


// ======================================================
// CLOSE MODAL
// ======================================================

function closeProductModal() {

    if (!productModal) {
        return;
    }


    productModal.classList.remove("active");

    document.body.classList.remove("modal-open");


    editingProductId =
        null;

}


// ======================================================
// RESET FORM
// ======================================================

function resetProductForm() {

    if (!productForm) {
        return;
    }


    productForm.reset();


    document.getElementById(
        "productDisplay"
    ).value = 0;


    document.getElementById(
        "productWarehouse"
    ).value = 0;


    document.getElementById(
        "productLdu"
    ).value = 0;


    selectedImage = "";


    if (imagePreview) {

        imagePreview.innerHTML = "";

    }

}


// ======================================================
// FILL FORM
// ======================================================

function fillProductForm(product) {


    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productMemory"
    ).value =
        product.memory || "";


    document.getElementById(
        "productColor"
    ).value =
        product.color || "";


    document.getElementById(
        "productDisplay"
    ).value =
        Number(
            product.display || 0
        );


    document.getElementById(
        "productWarehouse"
    ).value =
        Number(
            product.warehouse || 0
        );


    document.getElementById(
        "productLdu"
    ).value =
        Number(
            product.ldu || 0
        );


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productTip"
    ).value =
        product.tip || "";


    // ================================================
    // CHARACTERISTICS
    // ================================================

    const specs =
        product.specs || {};


    document.getElementById(
        "specStorage"
    ).value =
        specs["Встроенная память"] || "";


    document.getElementById(
        "specDisplay"
    ).value =
        specs["Дисплей"] || "";


    document.getElementById(
        "specProcessor"
    ).value =
        specs["Процессор"] || "";


    document.getElementById(
        "specCamera"
    ).value =
        specs["Фотокамера"] || "";


    document.getElementById(
        "specBattery"
    ).value =
        specs["Ёмкость аккумулятора"] || "";


    document.getElementById(
        "specRam"
    ).value =
        specs["Оперативная память"] || "";


    // ================================================
    // IMAGE
    // ================================================

    selectedImage =
        product.image || "";


    if (
        selectedImage &&
        imagePreview
    ) {

        imagePreview.innerHTML = `

            <img
                src="${selectedImage}"
                alt="Фото товара"
            >

        `;

    } else if (imagePreview) {

        imagePreview.innerHTML = "";

    }

}


// ======================================================
// IMAGE UPLOAD
// ======================================================

if (productImage) {

    productImage.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    selectedImage =
                        reader.result;


                    if (imagePreview) {

                        imagePreview.innerHTML = `

                            <img
                                src="${selectedImage}"
                                alt="Фото товара"
                            >

                        `;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// ======================================================
// SAVE PRODUCT
// ======================================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const category =
                document.getElementById(
                    "productCategory"
                ).value;


            const name =
                document.getElementById(
                    "productName"
                ).value.trim();


            if (!category || !name) {

                alert(
                    "Укажите категорию и название товара."
                );

                return;

            }


            const memory =
                document.getElementById(
                    "productMemory"
                ).value.trim();


            const color =
                document.getElementById(
                    "productColor"
                ).value.trim();


            const display =
                Number(
                    document.getElementById(
                        "productDisplay"
                    ).value
                ) || 0;


            const warehouse =
                Number(
                    document.getElementById(
                        "productWarehouse"
                    ).value
                ) || 0;


            const ldu =
                Number(
                    document.getElementById(
                        "productLdu"
                    ).value
                ) || 0;


            const description =
                document.getElementById(
                    "productDescription"
                ).value.trim();


            const tip =
                document.getElementById(
                    "productTip"
                ).value.trim();


            // ==========================================
            // FIXED SPECS
            // ==========================================

            const specs = {

                "Встроенная память":
                    document.getElementById(
                        "specStorage"
                    ).value.trim(),

                "Дисплей":
                    document.getElementById(
                        "specDisplay"
                    ).value.trim(),

                "Процессор":
                    document.getElementById(
                        "specProcessor"
                    ).value.trim(),

                "Фотокамера":
                    document.getElementById(
                        "specCamera"
                    ).value.trim(),

                "Ёмкость аккумулятора":
                    document.getElementById(
                        "specBattery"
                    ).value.trim(),

                "Оперативная память":
                    document.getElementById(
                        "specRam"
                    ).value.trim()

            };


            // Убираем пустые характеристики

            Object.keys(specs).forEach(
                key => {

                    if (
                        !specs[key]
                    ) {

                        delete specs[key];

                    }

                }
            );


            // ==========================================
            // DATA
            // ==========================================

            const productData = {

                name:
                    name,

                category:
                    category,

                memory:
                    memory,

                color:
                    color,

                quantity:
                    display + warehouse,

                ldu:
                    ldu,

                display:
                    display,

                warehouse:
                    warehouse,

                description:
                    description,

                specs:
                    specs,

                tip:
                    tip,

                image:
                    selectedImage

            };


            // ==========================================
            // EDIT
            // ==========================================

            if (
                editingProductId !== null
            ) {

                const index =
                    products.findIndex(
                        product =>
                            product.id ===
                            editingProductId
                    );


                if (index !== -1) {

                    products[index] = {

                        ...products[index],

                        ...productData

                    };

                }

            }


            // ==========================================
            // NEW
            // ==========================================

            else {

                products.push({

                    id:
                        Date.now(),

                    ...productData

                });

            }


            // ==========================================
            // SAVE
            // ==========================================

            saveProducts();


            // ==========================================
            // CLOSE
            // ==========================================

            closeProductModal();


            // ==========================================
            // RENDER
            // ==========================================

            renderProducts(
                products
            );

        }
    );

}


// ======================================================
// ADD BUTTON
// ======================================================

if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openProductModal();

        }
    );

}


// ======================================================
// CLOSE BUTTON
// ======================================================

if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeProductModal();

        }
    );

}


// ======================================================
// CANCEL
// ======================================================

if (cancelProductButton) {

    cancelProductButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeProductModal();

        }
    );

}


// ======================================================
// OVERLAY
// ======================================================

if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeProductModal
    );

}


// ======================================================
// ESC
// ======================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            productModal &&
            productModal.classList.contains("active")
        ) {

            closeProductModal();

        }

    }
);


// ======================================================
// PRODUCT LIST
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


            const imageHTML =
                product.image

                    ? `

                        <img
                            src="${product.image}"
                            alt="${escapeHTML(product.name)}"
                        >

                    `

                    : `

                        <span>
                            Фото товара
                        </span>

                    `;


            card.innerHTML = `

                <div class="product-image">

                    ${imageHTML}

                </div>


                <div class="product-name">

                    ${escapeHTML(product.name)}

                </div>


                <div class="product-info">

                    ${
                        product.memory
                            ? escapeHTML(
                                product.memory
                            )
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
                            ? escapeHTML(
                                product.color
                            )
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


            // ==========================================
            // CLICK
            // ==========================================

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


    if (!query) {

        renderProducts(
            products
        );

        return;

    }


    const results =
        products.filter(
            product => {

                const text = `

                    ${product.name}

                    ${product.category}

                    ${product.memory || ""}

                    ${product.color || ""}

                    ${product.description || ""}

                `.toLowerCase();


                return text.includes(
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
// LIVE SEARCH
// ======================================================

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
                item.id ===
                productId
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
// RENDER PRODUCT PAGE
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
        ).length
    ) {

        specsHTML =
            Object.entries(
                product.specs
            )
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

    } else {

        specsHTML = `

            <p>
                Характеристики пока не добавлены.
            </p>

        `;

    }


    const imageHTML =
        product.image

            ? `

                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}"
                >

            `

            : `

                Фото товара

            `;


    productDetails.innerHTML = `

        <div class="product-page">


            <div class="product-page-image">

                ${imageHTML}

            </div>


            <div class="product-page-content">


                <div class="product-category">

                    ${escapeHTML(
                        product.category
                    )}

                </div>


                <h1>

                    ${escapeHTML(
                        product.name
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

                        <strong id="totalQuantity">
                            ${total}
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


                    ${specsHTML}

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
// QUANTITY
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
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
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