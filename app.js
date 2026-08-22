// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================

(function () {

    "use strict";

    // ==================================================
    // START
    // ==================================================

    function startApp() {

        if (typeof products === "undefined") {

            console.error(
                "products-data.js не найден."
            );

            return;
        }

        initApp();
    }


    // ==================================================
    // MAIN APP
    // ==================================================

    function initApp() {

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

        const modal =
            document.getElementById("productModal");

        const productForm =
            document.getElementById("productForm");

        const openAddProductButton =
            document.getElementById("openAddProductButton");

        const closeProductModalButton =
            document.getElementById("closeProductModal");

        const cancelProductButton =
            document.getElementById("cancelProductButton");

        const productPhoto =
            document.getElementById("productPhoto");

        const photoPreview =
            document.getElementById("photoPreview");

        const categoryButtons =
            document.querySelectorAll(".category-button");


        // ==================================================
        // STORAGE
        // ==================================================

        const STORAGE_KEY =
            typeof PRODUCTS_STORAGE_KEY !== "undefined"
                ? PRODUCTS_STORAGE_KEY
                : "xiaomiWebBaseProducts";


        // ==================================================
        // STATE
        // ==================================================

        let editingProductId = null;

        let currentPhoto = "";


        // ==================================================
        // SAVE PRODUCTS
        // ==================================================

        function saveProducts() {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(products)
            );

        }


        // ==================================================
        // OPEN MODAL
        // ==================================================

        function openProductModal(product = null) {

            if (!modal) {

                console.error(
                    "Не найдено окно #productModal"
                );

                return;
            }


            editingProductId =
                product
                    ? product.id
                    : null;


            currentPhoto =
                product && product.image
                    ? product.image
                    : "";


            // ------------------------------------------
            // TITLE
            // ------------------------------------------

            const modalTitle =
                document.getElementById("modalTitle");

            if (modalTitle) {

                modalTitle.textContent =
                    product
                        ? "Редактировать товар"
                        : "Добавить товар";

            }


            // ------------------------------------------
            // NAME
            // ------------------------------------------

            setValue(
                "productName",
                product
                    ? product.name || ""
                    : ""
            );


            // ------------------------------------------
            // CATEGORY
            // ------------------------------------------

            setValue(
                "productCategory",
                product
                    ? product.category || "Смартфоны"
                    : "Смартфоны"
            );


            // ------------------------------------------
            // COLOR
            // ------------------------------------------

            setValue(
                "productColor",
                product
                    ? product.color || ""
                    : ""
            );


            // ==================================================
            // CHARACTERISTICS
            // ==================================================

            const specs =
                product && product.specs
                    ? product.specs
                    : {};


            setValue(
                "specStorage",
                specs["Встроенная память"] ||
                product?.memory ||
                ""
            );


            setValue(
                "specDisplay",
                specs["Дисплей"] ||
                ""
            );


            setValue(
                "specProcessor",
                specs["Процессор"] ||
                ""
            );


            setValue(
                "specCamera",
                specs["Фотокамера"] ||
                ""
            );


            setValue(
                "specBattery",
                specs["Емкость аккумулятора"] ||
                specs["Ёмкость аккумулятора"] ||
                ""
            );


            setValue(
                "specRam",
                specs["Оперативная память"] ||
                ""
            );


            // ==================================================
            // STOCK
            // ==================================================

            setValue(
                "productDisplay",
                product
                    ? Number(product.display || 0)
                    : 0
            );


            setValue(
                "productWarehouse",
                product
                    ? Number(product.warehouse || 0)
                    : 0
            );


            // ==================================================
            // LDU
            // ==================================================

            const ldu =
                document.getElementById("productLdu");

            if (ldu) {

                if (ldu.type === "checkbox") {

                    ldu.checked =
                        product
                            ? Number(product.ldu || 0) > 0
                            : false;

                } else {

                    ldu.value =
                        product
                            ? Number(product.ldu || 0)
                            : 0;

                }

            }


            // ==================================================
            // DESCRIPTION
            // ==================================================

            setValue(
                "productDescription",
                product
                    ? product.description || ""
                    : ""
            );


            // ==================================================
            // SELLER TIP
            // ==================================================

            setValue(
                "productTip",
                product
                    ? product.tip || ""
                    : ""
            );


            // ==================================================
            // PHOTO
            // ==================================================

            if (productPhoto) {

                productPhoto.value = "";

            }


            if (
                photoPreview &&
                currentPhoto
            ) {

                photoPreview.innerHTML = `

                    <img
                        src="${escapeHTML(currentPhoto)}"
                        alt="Фото товара"
                    >

                `;

                photoPreview.classList.add("active");

            } else if (photoPreview) {

                photoPreview.innerHTML = "";

                photoPreview.classList.remove("active");

            }


            // ==================================================
            // OPEN
            // ==================================================

            modal.classList.add("active");

            document.body.classList.add(
                "modal-open"
            );


            // На всякий случай принудительно задаём
            // правильное отображение

            modal.style.display = "flex";

            modal.style.pointerEvents = "auto";


            setTimeout(
                () => {

                    const nameInput =
                        document.getElementById(
                            "productName"
                        );

                    if (nameInput) {

                        nameInput.focus();

                    }

                },
                100
            );

        }


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        function closeProductModal() {

            if (!modal) {
                return;
            }


            modal.classList.remove("active");

            document.body.classList.remove(
                "modal-open"
            );


            modal.style.display = "";


            editingProductId =
                null;


            currentPhoto =
                "";


            if (productForm) {

                productForm.reset();

            }


            if (photoPreview) {

                photoPreview.innerHTML = "";

                photoPreview.classList.remove(
                    "active"
                );

            }

        }


        // ==================================================
        // HELPER SET VALUE
        // ==================================================

        function setValue(
            id,
            value
        ) {

            const element =
                document.getElementById(id);


            if (!element) {
                return;
            }


            element.value =
                value ?? "";

        }


        // ==================================================
        // PHOTO UPLOAD
        // ==================================================

        if (productPhoto) {

            productPhoto.addEventListener(
                "change",
                function (event) {

                    const file =
                        event.target.files &&
                        event.target.files[0];


                    if (!file) {
                        return;
                    }


                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        alert(
                            "Можно загрузить только изображение."
                        );

                        productPhoto.value = "";

                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function (e) {

                            currentPhoto =
                                e.target.result;


                            if (photoPreview) {

                                photoPreview.innerHTML = `

                                    <img
                                        src="${escapeHTML(currentPhoto)}"
                                        alt="Фото товара"
                                    >

                                `;

                                photoPreview.classList.add(
                                    "active"
                                );

                            }

                        };


                    reader.readAsDataURL(file);

                }
            );

        }


        // ==================================================
        // OPEN BUTTON
        // ==================================================

        if (openAddProductButton) {

            openAddProductButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    openProductModal();

                }
            );

        } else {

            console.warn(
                "Кнопка #openAddProductButton не найдена."
            );

        }


        // ==================================================
        // CLOSE BUTTON
        // ==================================================

        if (closeProductModalButton) {

            closeProductModalButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    closeProductModal();

                }
            );

        }


        // ==================================================
        // CANCEL BUTTON
        // ==================================================

        if (cancelProductButton) {

            cancelProductButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    closeProductModal();

                }
            );

        }


        // ==================================================
        // CLICK OUTSIDE
        // ==================================================

        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closeProductModal();

                    }

                }
            );

        }


        // ==================================================
        // ESC
        // ==================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    modal &&
                    modal.classList.contains("active")
                ) {

                    closeProductModal();

                }

            }
        );


        // ==================================================
        // SAVE FORM
        // ==================================================

        if (productForm) {

            productForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    saveProduct();

                }
            );

        }


        // ==================================================
        // SAVE PRODUCT
        // ==================================================

        function saveProduct() {

            const name =
                getValue("productName").trim();


            const category =
                getValue("productCategory").trim();


            if (!name) {

                alert(
                    "Введите название товара."
                );

                return;

            }


            if (!category) {

                alert(
                    "Выберите категорию."
                );

                return;

            }


            // ------------------------------------------
            // BASIC
            // ------------------------------------------

            const color =
                getValue("productColor").trim();


            // ------------------------------------------
            // SPECS
            // ------------------------------------------

            const storage =
                getValue("specStorage").trim();


            const displaySpec =
                getValue("specDisplay").trim();


            const processor =
                getValue("specProcessor").trim();


            const camera =
                getValue("specCamera").trim();


            const battery =
                getValue("specBattery").trim();


            const ram =
                getValue("specRam").trim();


            // ------------------------------------------
            // STOCK
            // ------------------------------------------

            const display =
                Math.max(
                    0,
                    Number(
                        getValue("productDisplay")
                    ) || 0
                );


            const warehouse =
                Math.max(
                    0,
                    Number(
                        getValue("productWarehouse")
                    ) || 0
                );


            const quantity =
                display +
                warehouse;


            // ------------------------------------------
            // LDU
            // ------------------------------------------

            let ldu = 0;


            const lduElement =
                document.getElementById(
                    "productLdu"
                );


            if (lduElement) {

                if (
                    lduElement.type ===
                    "checkbox"
                ) {

                    ldu =
                        lduElement.checked
                            ? 1
                            : 0;

                } else {

                    ldu =
                        Math.max(
                            0,
                            Number(
                                lduElement.value
                            ) || 0
                        );

                }

            }


            // ------------------------------------------
            // DESCRIPTION
            // ------------------------------------------

            const description =
                getValue(
                    "productDescription"
                ).trim();


            // ------------------------------------------
            // TIP
            // ------------------------------------------

            const tip =
                getValue(
                    "productTip"
                ).trim();


            // ==================================================
            // SPECS OBJECT
            // ==================================================

            const specs = {};


            if (storage) {

                specs[
                    "Встроенная память"
                ] =
                    storage;

            }


            if (displaySpec) {

                specs[
                    "Дисплей"
                ] =
                    displaySpec;

            }


            if (processor) {

                specs[
                    "Процессор"
                ] =
                    processor;

            }


            if (camera) {

                specs[
                    "Фотокамера"
                ] =
                    camera;

            }


            if (battery) {

                specs[
                    "Емкость аккумулятора"
                ] =
                    battery;

            }


            if (ram) {

                specs[
                    "Оперативная память"
                ] =
                    ram;

            }


            if (color) {

                specs[
                    "Цвет"
                ] =
                    color;

            }


            if (ldu > 0) {

                specs["LDU"] =
                    `${ldu} шт.`;

            }


            // ==================================================
            // MEMORY
            // ==================================================

            let memory = "";


            if (
                ram &&
                storage
            ) {

                memory =
                    `${ram} / ${storage}`;

            } else if (storage) {

                memory =
                    storage;

            } else if (ram) {

                memory =
                    ram;

            }


            // ==================================================
            // EDIT
            // ==================================================

            if (
                editingProductId !== null
            ) {

                const product =
                    products.find(
                        item =>
                            item.id ===
                            editingProductId
                    );


                if (!product) {

                    alert(
                        "Товар не найден."
                    );

                    return;

                }


                product.name =
                    name;

                product.category =
                    category;

                product.memory =
                    memory;

                product.color =
                    color;

                product.quantity =
                    quantity;

                product.display =
                    display;

                product.warehouse =
                    warehouse;

                product.ldu =
                    ldu;

                product.description =
                    description;

                product.tip =
                    tip;

                product.specs =
                    specs;


                if (currentPhoto) {

                    product.image =
                        currentPhoto;

                }

            }


            // ==================================================
            // NEW
            // ==================================================

            else {

                const newProduct = {

                    id:
                        generateProductId(),

                    name:
                        name,

                    category:
                        category,

                    memory:
                        memory,

                    color:
                        color,

                    quantity:
                        quantity,

                    display:
                        display,

                    warehouse:
                        warehouse,

                    ldu:
                        ldu,

                    description:
                        description,

                    tip:
                        tip,

                    specs:
                        specs

                };


                if (currentPhoto) {

                    newProduct.image =
                        currentPhoto;

                }


                products.push(
                    newProduct
                );

            }


            // ==================================================
            // SAVE
            // ==================================================

            saveProducts();


            const wasEditing =
                editingProductId !== null;


            closeProductModal();


            // ==================================================
            // REFRESH
            // ==================================================

            if (productsList) {

                renderProducts(
                    products
                );

            }


            if (productDetails) {

                renderProductPage();

            }


            alert(
                wasEditing
                    ? "Товар обновлён."
                    : "Товар добавлен."
            );

        }


        // ==================================================
        // GET VALUE
        // ==================================================

        function getValue(id) {

            const element =
                document.getElementById(id);


            if (!element) {
                return "";
            }


            return element.value || "";

        }


        // ==================================================
        // GENERATE ID
        // ==================================================

        function generateProductId() {

            let maxId = 0;


            products.forEach(
                product => {

                    const id =
                        Number(
                            product.id
                        ) || 0;


                    if (id > maxId) {

                        maxId = id;

                    }

                }
            );


            return maxId + 1;

        }


        // ==================================================
        // DELETE PRODUCT
        // ==================================================

        function deleteProduct(
            productId
        ) {

            const product =
                products.find(
                    item =>
                        item.id ===
                        productId
                );


            if (!product) {

                return;

            }


            const confirmed =
                confirm(
                    `Удалить товар "${product.name}"?\n\nЭто действие нельзя отменить.`
                );


            if (!confirmed) {

                return;

            }


            const index =
                products.findIndex(
                    item =>
                        item.id ===
                        productId
                );


            if (index !== -1) {

                products.splice(
                    index,
                    1
                );

            }


            saveProducts();


            window.location.href =
                "index.html";

        }


        // ==================================================
        // RENDER PRODUCTS
        // ==================================================

        function renderProducts(
            productsToRender
        ) {

            if (!productsList) {

                return;

            }


            productsList.innerHTML =
                "";


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

                                <div
                                    class="product-image"
                                >

                                    <img
                                        src="${escapeHTML(product.image)}"
                                        alt="${escapeHTML(product.name)}"
                                    >

                                </div>

                            `

                            : `

                                <div
                                    class="product-image"
                                >
                                    Фото товара
                                </div>

                            `;


                    card.innerHTML = `

                        ${imageHTML}


                        <div class="product-name">

                            ${escapeHTML(
                                product.name
                            )}

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


                    card.addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                `product.html?id=${encodeURIComponent(product.id)}`;

                        }
                    );


                    productsList.appendChild(
                        card
                    );

                }
            );

        }


        // ==================================================
        // SEARCH
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

                renderProducts(
                    products
                );

                return;

            }


            const results =
                products.filter(
                    product => {

                        const specsText =
                            product.specs
                                ? Object.values(
                                    product.specs
                                ).join(" ")
                                : "";


                        const text = `

                            ${product.name || ""}

                            ${product.category || ""}

                            ${product.memory || ""}

                            ${product.color || ""}

                            ${product.description || ""}

                            ${product.tip || ""}

                            ${specsText}

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


        // ==================================================
        // SEARCH BUTTON
        // ==================================================

        if (searchButton) {

            searchButton.addEventListener(
                "click",
                searchProducts
            );

        }


        // ==================================================
        // SEARCH ENTER
        // ==================================================

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


            searchInput.addEventListener(
                "input",
                searchProducts
            );

        }


        // ==================================================
        // CATEGORIES
        // ==================================================

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

                            searchInput.value =
                                "";

                        }


                        if (
                            category ===
                            "Все"
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


        // ==================================================
        // PRODUCT PAGE
        // ==================================================

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
                        Number(item.id) ===
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


        // ==================================================
        // RENDER PRODUCT
        // ==================================================

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
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                        >

                    `

                    : "Фото товара";


            productDetails.innerHTML = `

                <div class="product-page">


                    <div>

                        <div class="product-page-image">

                            ${imageHTML}

                        </div>


                        <div
                            style="
                                display:flex;
                                gap:10px;
                                margin-top:12px;
                            "
                        >

                            <button
                                type="button"
                                class="add-product-button"
                                id="editProductButton"
                                style="flex:1;"
                            >
                                Редактировать
                            </button>


                            <button
                                type="button"
                                class="delete-product-button"
                                id="deleteProductButton"
                                style="flex:1;"
                            >
                                Удалить
                            </button>

                        </div>

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
                                        ${display}
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
                                        ${warehouse}
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
                                    product.description
                                        ? escapeHTML(
                                            product.description
                                        )
                                        : "Описание пока не добавлено."
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
                                    product.tip
                                        ? escapeHTML(
                                            product.tip
                                        )
                                        : "Подсказка пока не добавлена."
                                }

                            </p>

                        </div>

                    </div>

                </div>

            `;


            // ==================================================
            // EDIT
            // ==================================================

            const editButton =
                document.getElementById(
                    "editProductButton"
                );


            if (editButton) {

                editButton.addEventListener(
                    "click",
                    function () {

                        openProductModal(
                            product
                        );

                    }
                );

            }


            // ==================================================
            // DELETE
            // ==================================================

            const deleteButton =
                document.getElementById(
                    "deleteProductButton"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteProduct(
                            product.id
                        );

                    }
                );

            }


            // ==================================================
            // QUANTITY
            // ==================================================

            const quantityButtons =
                document.querySelectorAll(
                    ".quantity-button"
                );


            quantityButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const type =
                                button.dataset.type;


                            const action =
                                button.dataset.action;


                            let value =
                                Number(
                                    product[type] || 0
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


        // ==================================================
        // ESCAPE
        // ==================================================

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


        // ==================================================
        // INITIAL RENDER
        // ==================================================

        if (productsList) {

            renderProducts(
                products
            );

        }


        if (productDetails) {

            renderProductPage();

        }


        console.log(
            "Xiaomi WebBase запущен."
        );

    }


    // ==================================================
    // START
    // ==================================================

    if (
        typeof products === "undefined"
    ) {

        const dataScript =
            document.createElement(
                "script"
            );


        dataScript.src =
            "products-data.js";


        dataScript.onload =
            startApp;


        dataScript.onerror =
            function () {

                console.error(
                    "Не удалось загрузить products-data.js"
                );

            };


        document.head.appendChild(
            dataScript
        );

    } else {

        startApp();

    }

})();