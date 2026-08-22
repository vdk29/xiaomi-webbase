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
    // INIT
    // ==================================================

    function initApp() {

        // ----------------------------------------------
        // ELEMENTS
        // ----------------------------------------------

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


        // ----------------------------------------------
        // STORAGE
        // ----------------------------------------------

        const STORAGE_KEY =
            typeof PRODUCTS_STORAGE_KEY !== "undefined"
                ? PRODUCTS_STORAGE_KEY
                : "xiaomiWebBaseProducts";


        // ==================================================
        // LOAD SAVED PRODUCTS
        // ==================================================

        loadSavedProducts();


        function loadSavedProducts() {

            try {

                const saved =
                    localStorage.getItem(STORAGE_KEY);

                if (!saved) {
                    return;
                }

                const parsed =
                    JSON.parse(saved);

                if (Array.isArray(parsed)) {

                    products.length = 0;

                    parsed.forEach(product => {
                        products.push(product);
                    });

                }

            } catch (error) {

                console.error(
                    "Ошибка загрузки товаров:",
                    error
                );

            }

        }


        // ==================================================
        // SAVE PRODUCTS
        // ==================================================

        function saveProducts() {

            try {

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(products)
                );

            } catch (error) {

                console.error(
                    "Ошибка сохранения товаров:",
                    error
                );

                alert(
                    "Не удалось сохранить товар. Возможно, фотография слишком большая."
                );

            }

        }


        // ==================================================
        // MODAL
        // ==================================================

        const modal =
            document.getElementById("productModal");

        const closeButton =
            document.getElementById("closeProductModal");

        const cancelButton =
            document.getElementById("cancelProductButton");

        const productForm =
            document.getElementById("productForm");


        let editingProductId = null;

        let currentPhoto = "";


        // ==================================================
        // OPEN MODAL
        // ==================================================

        function openProductModal(product = null) {

            if (!modal) {

                console.error(
                    "productModal не найден в HTML."
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


            const title =
                document.getElementById("modalTitle");


            if (title) {

                title.textContent =
                    product
                        ? "Редактировать товар"
                        : "Добавить товар";

            }


            // ------------------------------------------
            // MAIN
            // ------------------------------------------

            setValue(
                "productName",
                product?.name || ""
            );


            setValue(
                "productCategory",
                product?.category || "Смартфоны"
            );


            setValue(
                "productColor",
                product?.color || ""
            );


            // ------------------------------------------
            // SPECS
            // ------------------------------------------

            const specs =
                product?.specs || {};


            setValue(
                "specStorage",
                specs["Встроенная память"] ||
                product?.memory ||
                ""
            );


            setValue(
                "specDisplay",
                specs["Дисплей"] || ""
            );


            setValue(
                "specProcessor",
                specs["Процессор"] || ""
            );


            setValue(
                "specCamera",
                specs["Фотокамера"] || ""
            );


            setValue(
                "specBattery",
                specs["Емкость аккумулятора"] ||
                specs["Ёмкость аккумулятора"] ||
                ""
            );


            setValue(
                "specRam",
                specs["Оперативная память"] || ""
            );


            // ------------------------------------------
            // STOCK
            // ------------------------------------------

            setValue(
                "productDisplay",
                Number(product?.display || 0)
            );


            setValue(
                "productWarehouse",
                Number(product?.warehouse || 0)
            );


            // LDU теперь checkbox
            const lduCheckbox =
                document.getElementById("productLdu");


            if (lduCheckbox) {

                lduCheckbox.checked =
                    Boolean(
                        product?.ldu
                    );

            }


            // ------------------------------------------
            // DESCRIPTION
            // ------------------------------------------

            setValue(
                "productDescription",
                product?.description || ""
            );


            setValue(
                "productTip",
                product?.tip || ""
            );


            // ------------------------------------------
            // PHOTO
            // ------------------------------------------

            renderPhotoPreview(
                currentPhoto
            );


            // ------------------------------------------
            // OPEN
            // ------------------------------------------

            modal.classList.add("active");

            document.body.style.overflow =
                "hidden";


            setTimeout(() => {

                const nameInput =
                    document.getElementById(
                        "productName"
                    );

                if (nameInput) {
                    nameInput.focus();
                }

            }, 100);

        }


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        function closeProductModal() {

            if (!modal) {
                return;
            }


            modal.classList.remove("active");


            document.body.style.overflow =
                "";


            editingProductId =
                null;


            currentPhoto =
                "";


            if (productForm) {

                productForm.reset();

            }


            const preview =
                document.getElementById(
                    "photoPreview"
                );


            if (preview) {

                preview.innerHTML = "";

                preview.classList.remove(
                    "active"
                );

            }

        }


        // ==================================================
        // MODAL EVENTS
        // ==================================================

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    closeProductModal();

                }
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    closeProductModal();

                }
            );

        }


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
        // ADD PRODUCT BUTTON
        // ==================================================

        createAddProductButton();


        function createAddProductButton() {

            // Удаляем старую кнопку,
            // если она была создана предыдущим JS

            const oldButton =
                document.getElementById(
                    "addProductButton"
                );


            if (oldButton) {

                oldButton.remove();

            }


            const existingHeaderButton =
                document.getElementById(
                    "openAddProductButton"
                );


            // Старую серую кнопку из header
            // больше не используем

            if (existingHeaderButton) {

                existingHeaderButton.style.display =
                    "none";

            }


            const button =
                document.createElement("button");


            button.type =
                "button";


            button.id =
                "addProductButton";


            button.className =
                "add-product-button";


            button.textContent =
                "＋ Добавить с поставки";


            // Ставим кнопку аккуратно
            // перед блоком товаров

            const productsSection =
                document.querySelector(
                    ".products"
                );


            if (productsSection) {

                productsSection.insertBefore(
                    button,
                    productsSection.firstChild
                );

            } else if (productsList) {

                productsList.parentNode.insertBefore(
                    button,
                    productsList
                );

            }


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    openProductModal();

                }
            );

        }


        // ==================================================
        // FORM SUBMIT
        // ==================================================

        if (productForm) {

            productForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    saveProductFromForm();

                }
            );

        }


        // ==================================================
        // PHOTO
        // ==================================================

        const photoInput =
            document.getElementById(
                "productPhoto"
            );


        if (photoInput) {

            photoInput.addEventListener(
                "change",
                handlePhoto
            );

        }


        function handlePhoto(event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Можно загрузить только изображение."
                );

                event.target.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (loadEvent) {

                    currentPhoto =
                        loadEvent.target.result;


                    renderPhotoPreview(
                        currentPhoto
                    );

                };


            reader.onerror =
                function () {

                    alert(
                        "Не удалось загрузить фотографию."
                    );

                };


            reader.readAsDataURL(file);

        }


        function renderPhotoPreview(image) {

            const preview =
                document.getElementById(
                    "photoPreview"
                );


            if (!preview) {
                return;
            }


            if (!image) {

                preview.innerHTML = "";

                preview.classList.remove(
                    "active"
                );

                return;

            }


            preview.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="Фото товара"
                >

            `;


            preview.classList.add(
                "active"
            );

        }


        // ==================================================
        // SAVE PRODUCT
        // ==================================================

        function saveProductFromForm() {

            const name =
                getValue("productName");


            const category =
                getValue("productCategory");


            const color =
                getValue("productColor");


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
            // SPECS
            // ------------------------------------------

            const storage =
                getValue("specStorage");


            const displaySpec =
                getValue("specDisplay");


            const processor =
                getValue("specProcessor");


            const camera =
                getValue("specCamera");


            const battery =
                getValue("specBattery");


            const ram =
                getValue("specRam");


            const specs = {};


            if (storage) {

                specs["Встроенная память"] =
                    storage;

            }


            if (displaySpec) {

                specs["Дисплей"] =
                    displaySpec;

            }


            if (processor) {

                specs["Процессор"] =
                    processor;

            }


            if (camera) {

                specs["Фотокамера"] =
                    camera;

            }


            if (battery) {

                specs["Емкость аккумулятора"] =
                    battery;

            }


            if (ram) {

                specs["Оперативная память"] =
                    ram;

            }


            if (color) {

                specs["Цвет"] =
                    color;

            }


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

            const lduCheckbox =
                document.getElementById(
                    "productLdu"
                );


            const ldu =
                lduCheckbox
                    ? lduCheckbox.checked
                    : false;


            // ------------------------------------------
            // DESCRIPTION
            // ------------------------------------------

            const description =
                getValue(
                    "productDescription"
                );


            // ------------------------------------------
            // TIP
            // ------------------------------------------

            const tip =
                getValue(
                    "productTip"
                );


            // ------------------------------------------
            // MEMORY DISPLAY
            // ------------------------------------------

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
                            String(item.id) ===
                            String(editingProductId)
                    );


                if (product) {

                    product.name =
                        name;

                    product.category =
                        category;

                    product.color =
                        color;

                    product.memory =
                        memory;

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

            }


            // ==================================================
            // CREATE
            // ==================================================

            else {

                const newProduct = {

                    id:
                        generateProductId(),

                    name:
                        name,

                    category:
                        category,

                    color:
                        color,

                    memory:
                        memory,

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
        // GENERATE ID
        // ==================================================

        function generateProductId() {

            let maxId = 0;


            products.forEach(
                product => {

                    const id =
                        Number(product.id);


                    if (
                        Number.isFinite(id) &&
                        id > maxId
                    ) {

                        maxId = id;

                    }

                }
            );


            return maxId + 1;

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


            return String(
                element.value || ""
            ).trim();

        }


        // ==================================================
        // SET VALUE
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
        // DELETE PRODUCT
        // ==================================================

        function deleteProduct(
            productId
        ) {

            const index =
                products.findIndex(
                    product =>
                        String(product.id) ===
                        String(productId)
                );


            if (index === -1) {
                return;
            }


            const product =
                products[index];


            const confirmed =
                confirm(
                    `Удалить товар "${product.name}"?\n\nЭто действие нельзя отменить.`
                );


            if (!confirmed) {
                return;
            }


            products.splice(
                index,
                1
            );


            saveProducts();


            if (productDetails) {

                window.location.href =
                    "index.html";

                return;

            }


            renderProducts(
                products
            );

        }


        // ==================================================
        // RENDER PRODUCTS
        // ==================================================

        function renderProducts(
            list
        ) {

            if (!productsList) {
                return;
            }


            productsList.innerHTML =
                "";


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
                            Попробуйте изменить запрос
                        </p>

                    </div>

                `;

                return;

            }


            list.forEach(
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

                                <div class="product-image">

                                    <img
                                        src="${escapeHTML(product.image)}"
                                        alt="${escapeHTML(product.name)}"
                                    >

                                </div>

                            `
                            : `

                                <div class="product-image">
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


            const result =
                products.filter(
                    product => {

                        const specsText =
                            product.specs
                                ? Object.values(
                                    product.specs
                                ).join(" ")
                                : "";


                        const text = [

                            product.name,

                            product.category,

                            product.memory,

                            product.color,

                            product.description,

                            product.tip,

                            specsText

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        return text.includes(
                            query
                        );

                    }
                );


            renderProducts(
                result
            );

        }


        if (searchButton) {

            searchButton.addEventListener(
                "click",
                searchProducts
            );

        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchProducts
            );


            searchInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        searchProducts();

                    }

                }
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
                params.get("id");


            const product =
                products.find(
                    item =>
                        String(item.id) ===
                        String(productId)
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
                Object.keys(product.specs).length
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
                            >
                                Редактировать
                            </button>


                            <button
                                type="button"
                                class="delete-product-button"
                                id="deleteProductButton"
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


                        <div class="product-stock">

                            <h2>
                                Наличие
                            </h2>


                            ${createQuantityRow(
                                "Витрина",
                                "display",
                                display
                            )}


                            ${createQuantityRow(
                                "Склад",
                                "warehouse",
                                warehouse
                            )}


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
                                    product.description
                                        ? escapeHTML(
                                            product.description
                                        )
                                        : "Описание пока не добавлено."
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


            document.title =
                `${product.name} — Xiaomi WebBase`;


            // ------------------------------------------
            // EDIT
            // ------------------------------------------

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


            // ------------------------------------------
            // DELETE
            // ------------------------------------------

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


            // ------------------------------------------
            // QUANTITY
            // ------------------------------------------

            setupQuantityButtons(
                product
            );

        }


        // ==================================================
        // QUANTITY ROW
        // ==================================================

        function createQuantityRow(
            title,
            type,
            value
        ) {

            return `

                <div class="stock-control">

                    <span>
                        ${title}
                    </span>


                    <div class="quantity-control">

                        <button
                            type="button"
                            class="quantity-button"
                            data-type="${type}"
                            data-action="minus"
                        >
                            −
                        </button>


                        <strong>
                            ${value}
                        </strong>


                        <button
                            type="button"
                            class="quantity-button"
                            data-type="${type}"
                            data-action="plus"
                        >
                            +
                        </button>

                    </div>

                </div>

            `;

        }


        // ==================================================
        // QUANTITY BUTTONS
        // ==================================================

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
        // ESCAPE HTML
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

    }


    // ======================================================
    // START AFTER DOM
    // ======================================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startApp
        );

    } else {

        startApp();

    }

})();