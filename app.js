// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================


// ======================================================
// STORAGE
// ======================================================

const STORAGE_KEY =
    typeof PRODUCTS_STORAGE_KEY !== "undefined"
        ? PRODUCTS_STORAGE_KEY
        : "xiaomiWebBaseProducts";


// ======================================================
// START
// ======================================================

function startApp() {

    if (typeof products === "undefined") {

        console.error(
            "products-data.js не найден."
        );

        return;
    }

    initApp();
}


// ======================================================
// AUTO LOAD PRODUCTS-DATA
// ======================================================

if (typeof products === "undefined") {

    const dataScript =
        document.createElement("script");

    dataScript.src =
        "products-data.js";

    dataScript.onload =
        startApp;

    dataScript.onerror =
        () => {

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


// ======================================================
// MAIN APP
// ======================================================

function initApp() {


    // ==================================================
    // ELEMENTS
    // ==================================================

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


    // ==================================================
    // STATE
    // ==================================================

    let editingProductId = null;

    let currentPhoto = "";


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
                "Не удалось сохранить товар. Возможно, изображение слишком большое."
            );

        }

    }


    // ==================================================
    // NORMALIZE PRODUCT
    // ==================================================

    function normalizeProduct(product) {

        if (!product) {
            return product;
        }


        if (!product.specs) {
            product.specs = {};
        }


        if (
            typeof product.display !== "number"
        ) {

            product.display =
                Number(
                    product.display || 0
                );

        }


        if (
            typeof product.warehouse !== "number"
        ) {

            product.warehouse =
                Number(
                    product.warehouse || 0
                );

        }


        if (
            typeof product.ldu !== "number"
        ) {

            if (
                typeof product.ldu === "boolean"
            ) {

                product.ldu =
                    product.ldu
                        ? 1
                        : 0;

            } else {

                product.ldu =
                    Number(
                        product.ldu || 0
                    );

            }

        }


        product.quantity =
            Number(product.display || 0) +
            Number(product.warehouse || 0);


        return product;

    }


    // ==================================================
    // NORMALIZE ALL
    // ==================================================

    products.forEach(
        normalizeProduct
    );


    // ==================================================
    // MODAL
    // ==================================================

    const modal =
        document.getElementById(
            "productModal"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const productForm =
        document.getElementById(
            "productForm"
        );


    const closeProductModalButton =
        document.getElementById(
            "closeProductModal"
        );


    const cancelProductButton =
        document.getElementById(
            "cancelProductButton"
        );


    // ==================================================
    // PHOTO
    // ==================================================

    const productPhoto =
        document.getElementById(
            "productPhoto"
        );


    const photoPreview =
        document.getElementById(
            "photoPreview"
        );


    // ==================================================
    // RESET FORM
    // ==================================================

    function resetProductForm() {

        if (!productForm) {
            return;
        }


        productForm.reset();


        const category =
            document.getElementById(
                "productCategory"
            );


        if (category) {

            category.value =
                "Смартфоны";

        }


        const display =
            document.getElementById(
                "productDisplay"
            );


        if (display) {

            display.value =
                0;

        }


        const warehouse =
            document.getElementById(
                "productWarehouse"
            );


        if (warehouse) {

            warehouse.value =
                0;

        }


        const ldu =
            document.getElementById(
                "productLdu"
            );


        if (ldu) {

            ldu.checked =
                false;

        }


        currentPhoto =
            "";


        if (photoPreview) {

            photoPreview.innerHTML =
                "";

            photoPreview.classList.remove(
                "active"
            );

        }


        if (productPhoto) {

            productPhoto.value =
                "";

        }

    }


    // ==================================================
    // SHOW PHOTO
    // ==================================================

    function showPhotoPreview(
        image
    ) {

        if (!photoPreview) {
            return;
        }


        if (!image) {

            photoPreview.innerHTML =
                "";

            photoPreview.classList.remove(
                "active"
            );

            return;

        }


        photoPreview.innerHTML = `

            <img
                src="${image}"
                alt="Фото товара"
            >

        `;


        photoPreview.classList.add(
            "active"
        );

    }


    // ==================================================
    // OPEN MODAL
    // ==================================================

    function openProductModal(
        product = null
    ) {

        if (!modal) {

            console.error(
                "Модальное окно #productModal не найдено."
            );

            return;

        }


        resetProductForm();


        editingProductId =
            product
                ? product.id
                : null;


        if (modalTitle) {

            modalTitle.textContent =
                product
                    ? "Редактировать товар"
                    : "Добавить товар";

        }


        if (product) {

            normalizeProduct(
                product
            );


            // ------------------------------------------
            // NAME
            // ------------------------------------------

            const name =
                document.getElementById(
                    "productName"
                );

            if (name) {

                name.value =
                    product.name || "";

            }


            // ------------------------------------------
            // CATEGORY
            // ------------------------------------------

            const category =
                document.getElementById(
                    "productCategory"
                );

            if (category) {

                category.value =
                    product.category ||
                    "Смартфоны";

            }


            // ------------------------------------------
            // COLOR
            // ------------------------------------------

            const color =
                document.getElementById(
                    "productColor"
                );

            if (color) {

                color.value =
                    product.color || "";

            }


            // ------------------------------------------
            // SPECS
            // ------------------------------------------

            const specs =
                product.specs || {};


            const storage =
                document.getElementById(
                    "specStorage"
                );

            if (storage) {

                storage.value =
                    specs["Встроенная память"] ||
                    product.memory ||
                    "";

            }


            const displaySpec =
                document.getElementById(
                    "specDisplay"
                );

            if (displaySpec) {

                displaySpec.value =
                    specs["Дисплей"] ||
                    "";

            }


            const processor =
                document.getElementById(
                    "specProcessor"
                );

            if (processor) {

                processor.value =
                    specs["Процессор"] ||
                    "";

            }


            const camera =
                document.getElementById(
                    "specCamera"
                );

            if (camera) {

                camera.value =
                    specs["Фотокамера"] ||
                    "";

            }


            const battery =
                document.getElementById(
                    "specBattery"
                );

            if (battery) {

                battery.value =
                    specs["Ёмкость аккумулятора"] ||
                    specs["Емкость аккумулятора"] ||
                    "";

            }


            const ram =
                document.getElementById(
                    "specRam"
                );

            if (ram) {

                ram.value =
                    specs["Оперативная память"] ||
                    "";

            }


            // ------------------------------------------
            // STOCK
            // ------------------------------------------

            const display =
                document.getElementById(
                    "productDisplay"
                );

            if (display) {

                display.value =
                    Number(
                        product.display || 0
                    );

            }


            const warehouse =
                document.getElementById(
                    "productWarehouse"
                );

            if (warehouse) {

                warehouse.value =
                    Number(
                        product.warehouse || 0
                    );

            }


            // ------------------------------------------
            // LDU
            // ------------------------------------------

            const ldu =
                document.getElementById(
                    "productLdu"
                );

            if (ldu) {

                ldu.checked =
                    Number(
                        product.ldu || 0
                    ) > 0;

            }


            // ------------------------------------------
            // DESCRIPTION
            // ------------------------------------------

            const description =
                document.getElementById(
                    "productDescription"
                );

            if (description) {

                description.value =
                    product.description || "";

            }


            // ------------------------------------------
            // TIP
            // ------------------------------------------

            const tip =
                document.getElementById(
                    "productTip"
                );

            if (tip) {

                tip.value =
                    product.tip || "";

            }


            // ------------------------------------------
            // PHOTO
            // ------------------------------------------

            currentPhoto =
                product.image ||
                "";


            showPhotoPreview(
                currentPhoto
            );

        }


        // ----------------------------------------------
        // OPEN
        // ----------------------------------------------

        modal.classList.add(
            "active"
        );


        modal.style.display =
            "flex";


        document.body.classList.add(
            "modal-open"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            () => {

                const name =
                    document.getElementById(
                        "productName"
                    );

                if (name) {

                    name.focus();

                }

            },
            150
        );

    }


    // ==================================================
    // CLOSE MODAL
    // ==================================================

    function closeProductModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        modal.style.display =
            "none";


        document.body.classList.remove(
            "modal-open"
        );


        document.body.style.overflow =
            "";


        editingProductId =
            null;


        currentPhoto =
            "";

    }


    // ==================================================
    // MODAL BUTTONS
    // ==================================================

    if (closeProductModalButton) {

        closeProductModalButton.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                closeProductModal();

            };

    }


    if (cancelProductButton) {

        cancelProductButton.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                closeProductModal();

            };

    }


    // ==================================================
    // CLICK OUTSIDE MODAL
    // ==================================================

    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

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
        function(event) {

            if (
                event.key === "Escape" &&
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                closeProductModal();

            }

        }
    );


    // ==================================================
    // PHOTO UPLOAD
    // ==================================================

    if (productPhoto) {

        productPhoto.addEventListener(
            "change",
            function(event) {

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

                    productPhoto.value =
                        "";

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function(readerEvent) {

                        currentPhoto =
                            readerEvent.target.result;


                        showPhotoPreview(
                            currentPhoto
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    // ==================================================
    // SAVE FORM
    // ==================================================

    if (productForm) {

        productForm.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();


                const nameElement =
                    document.getElementById(
                        "productName"
                    );


                const categoryElement =
                    document.getElementById(
                        "productCategory"
                    );


                const colorElement =
                    document.getElementById(
                        "productColor"
                    );


                const storageElement =
                    document.getElementById(
                        "specStorage"
                    );


                const displaySpecElement =
                    document.getElementById(
                        "specDisplay"
                    );


                const processorElement =
                    document.getElementById(
                        "specProcessor"
                    );


                const cameraElement =
                    document.getElementById(
                        "specCamera"
                    );


                const batteryElement =
                    document.getElementById(
                        "specBattery"
                    );


                const ramElement =
                    document.getElementById(
                        "specRam"
                    );


                const displayElement =
                    document.getElementById(
                        "productDisplay"
                    );


                const warehouseElement =
                    document.getElementById(
                        "productWarehouse"
                    );


                const lduElement =
                    document.getElementById(
                        "productLdu"
                    );


                const descriptionElement =
                    document.getElementById(
                        "productDescription"
                    );


                const tipElement =
                    document.getElementById(
                        "productTip"
                    );


                const name =
                    nameElement
                        ? nameElement.value.trim()
                        : "";


                const category =
                    categoryElement
                        ? categoryElement.value.trim()
                        : "";


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


                const color =
                    colorElement
                        ? colorElement.value.trim()
                        : "";


                const storage =
                    storageElement
                        ? storageElement.value.trim()
                        : "";


                const displaySpec =
                    displaySpecElement
                        ? displaySpecElement.value.trim()
                        : "";


                const processor =
                    processorElement
                        ? processorElement.value.trim()
                        : "";


                const camera =
                    cameraElement
                        ? cameraElement.value.trim()
                        : "";


                const battery =
                    batteryElement
                        ? batteryElement.value.trim()
                        : "";


                const ram =
                    ramElement
                        ? ramElement.value.trim()
                        : "";


                const display =
                    Math.max(
                        0,
                        Number(
                            displayElement
                                ? displayElement.value
                                : 0
                        ) || 0
                    );


                const warehouse =
                    Math.max(
                        0,
                        Number(
                            warehouseElement
                                ? warehouseElement.value
                                : 0
                        ) || 0
                    );


                const ldu =
                    lduElement &&
                    lduElement.checked
                        ? 1
                        : 0;


                const description =
                    descriptionElement
                        ? descriptionElement.value.trim()
                        : "";


                const tip =
                    tipElement
                        ? tipElement.value.trim()
                        : "";


                // --------------------------------------
                // SPECS
                // --------------------------------------

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
                        "Ёмкость аккумулятора"
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

                    specs[
                        "LDU"
                    ] =
                        "Есть";

                }


                // --------------------------------------
                // MEMORY
                // --------------------------------------

                let memory =
                    "";


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


                // --------------------------------------
                // EXISTING PRODUCT
                // --------------------------------------

                if (
                    editingProductId !== null
                ) {

                    const product =
                        products.find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    editingProductId
                                )
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


                    product.color =
                        color;


                    product.memory =
                        memory;


                    product.display =
                        display;


                    product.warehouse =
                        warehouse;


                    product.quantity =
                        display +
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


                    saveProducts();


                    closeProductModal();


                    refreshPage();


                    alert(
                        "Товар обновлён."
                    );


                    return;

                }


                // --------------------------------------
                // NEW PRODUCT
                // --------------------------------------

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

                    display:
                        display,

                    warehouse:
                        warehouse,

                    quantity:
                        display +
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


                saveProducts();


                closeProductModal();


                refreshPage();


                alert(
                    "Товар добавлен."
                );

            }
        );

    }


    // ==================================================
    // GENERATE ID
    // ==================================================

    function generateProductId() {

        let maxId =
            0;


        products.forEach(
            product => {

                const id =
                    Number(
                        product.id
                    ) || 0;


                if (
                    id > maxId
                ) {

                    maxId =
                        id;

                }

            }
        );


        return maxId + 1;

    }


    // ==================================================
    // ADD PRODUCT BUTTON
    // ==================================================

    function createAddButton() {

        // Удаляем старую автоматически созданную
        // кнопку, если она осталась

        const oldButton =
            document.getElementById(
                "addProductButton"
            );


        if (oldButton) {

            oldButton.remove();

        }


        const oldButtons =
            document.querySelectorAll(
                ".add-product-button"
            );


        oldButtons.forEach(
            button => {

                if (
                    button.id !==
                    "editProductButton"
                ) {

                    if (
                        button.closest(
                            ".products"
                        ) ||
                        button.textContent.includes(
                            "Добавить"
                        )
                    ) {

                        // Не удаляем кнопку редактирования
                        if (
                            button.id !==
                            "editProductButton"
                        ) {

                            button.remove();

                        }

                    }

                }

            }
        );


        if (!productsList) {
            return;
        }


        const productsSection =
            productsList.closest(
                ".products"
            );


        if (!productsSection) {
            return;
        }


        const sectionTitle =
            productsSection.querySelector(
                ".section-title"
            );


        if (!sectionTitle) {
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.id =
            "addProductButton";


        button.className =
            "compact-add-product";


        button.innerHTML =
            "＋ Добавить с поставки";


        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                openProductModal();

            }
        );


        sectionTitle.appendChild(
            button
        );

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
                    String(item.id) ===
                    String(productId)
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
                    String(item.id) ===
                    String(productId)
            );


        if (index !== -1) {

            products.splice(
                index,
                1
            );

        }


        saveProducts();


        if (productDetails) {

            window.location.href =
                "index.html";

            return;

        }


        refreshPage();

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

                normalizeProduct(
                    product
                );


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
                    function() {

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


                    const searchText = `

                        ${product.name || ""}

                        ${product.category || ""}

                        ${product.memory || ""}

                        ${product.color || ""}

                        ${product.description || ""}

                        ${product.tip || ""}

                        ${specsText}

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


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchProducts
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

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
                function() {

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
            params.get(
                "id"
            );


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


        normalizeProduct(
            product
        );


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


        let specsHTML =
            "";


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
                                ${escapeHTML(
                                    key
                                )}
                            </span>

                            <strong>
                                ${escapeHTML(
                                    value
                                )}
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

                : `

                    Фото товара

                `;


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


                    <!-- DESCRIPTION -->

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


        // ----------------------------------------------
        // EDIT
        // ----------------------------------------------

        const editButton =
            document.getElementById(
                "editProductButton"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    openProductModal(
                        product
                    );

                }
            );

        }


        // ----------------------------------------------
        // DELETE
        // ----------------------------------------------

        const deleteButton =
            document.getElementById(
                "deleteProductButton"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    deleteProduct(
                        product.id
                    );

                }
            );

        }


        // ----------------------------------------------
        // QUANTITY
        // ----------------------------------------------

        setupQuantityButtons(
            product
        );

    }


    // ==================================================
    // QUANTITY
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
                    function(event) {

                        event.preventDefault();


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

                            const current =
                                Number(
                                    product[type] || 0
                                );


                            if (
                                current > 0
                            ) {

                                product[type] =
                                    current - 1;

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


    // ==================================================
    // REFRESH
    // ==================================================

    function refreshPage() {

        if (productsList) {

            const activeCategory =
                document.querySelector(
                    ".category-button.active"
                );


            if (
                activeCategory &&
                activeCategory.dataset.category !==
                "Все"
            ) {

                const category =
                    activeCategory.dataset.category;


                renderProducts(
                    products.filter(
                        product =>
                            product.category ===
                            category
                    )
                );

            } else {

                renderProducts(
                    products
                );

            }

        }


        if (productDetails) {

            renderProductPage();

        }

    }


    // ==================================================
    // ESCAPE HTML
    // ==================================================

    function escapeHTML(
        value
    ) {

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
    // INITIALIZE MODAL STATE
    // ==================================================

    if (modal) {

        modal.classList.remove(
            "active"
        );

        modal.style.display =
            "none";

    }


    // ==================================================
    // INITIAL RENDER
    // ==================================================

    createAddButton();


    if (productsList) {

        renderProducts(
            products
        );

    }


    if (productDetails) {

        renderProductPage();

    }


    // ==================================================
    // HEADER OLD BUTTON
    // ==================================================

    const oldHeaderButton =
        document.getElementById(
            "openAddProductButton"
        );


    if (oldHeaderButton) {

        oldHeaderButton.remove();

    }

}