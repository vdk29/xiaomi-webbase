// ======================================================
// XIAOMI WEBBASE
// APP.JS
// Управление товарами через сайт
// ======================================================


// ======================================================
// НАСТРОЙКИ
// ======================================================

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";

const PRODUCTS_VERSION_KEY =
    "xiaomiWebBaseProductsVersion";


// ======================================================
// ЗАГРУЗКА БАЗЫ
// ======================================================

function loadProducts() {

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


        if (Array.isArray(parsedProducts)) {

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

    }

}


// ======================================================
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
    );


    localStorage.setItem(
        PRODUCTS_VERSION_KEY,
        "site-managed"
    );

}


// ======================================================
// ЭЛЕМЕНТЫ
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


const productsCount =
    document.getElementById(
        "productsCount"
    );


// ======================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================================================

function getProductTotal(product) {

    return (
        Number(product.display || 0) +
        Number(product.warehouse || 0)
    );

}


function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// ФОТО
// ======================================================

function getProductImage(product) {

    if (product.image) {

        return `

            <img
                src="${product.image}"
                alt="${escapeHTML(product.name)}"
            >

        `;

    }


    return `
        <span>
            Фото товара
        </span>
    `;

}


// ======================================================
// КАРТОЧКИ
// ======================================================

function renderProducts(
    productsToRender
) {

    if (!productsList) {
        return;
    }


    productsList.innerHTML = "";


    if (productsCount) {

        productsCount.textContent =
            `${productsToRender.length} шт.`;

    }


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
                    Попробуйте изменить запрос или категорию.
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

                    ${getProductImage(product)}

                </div>


                <div class="product-name">

                    ${escapeHTML(product.name)}

                </div>


                <div class="product-info">

                    ${
                        product.memory
                            ? escapeHTML(product.memory)
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
                            ? escapeHTML(product.color)
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

                    ${product.description || ""}

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
// ПОИСК — КНОПКА
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// ПОИСК — ENTER
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
// ПОИСК — ВЖИВУЮ
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
// УПРАВЛЕНИЕ ФОРМОЙ
// ======================================================

const addProductButton =
    document.getElementById(
        "addProductButton"
    );


const productFormWrapper =
    document.getElementById(
        "productFormWrapper"
    );


const productForm =
    document.getElementById(
        "productForm"
    );


const closeFormButton =
    document.getElementById(
        "closeFormButton"
    );


const cancelFormButton =
    document.getElementById(
        "cancelFormButton"
    );


const formTitle =
    document.getElementById(
        "formTitle"
    );


// ======================================================
// ПОЛЯ ФОРМЫ
// ======================================================

const editProductId =
    document.getElementById(
        "editProductId"
    );


const formName =
    document.getElementById(
        "formName"
    );


const formCategory =
    document.getElementById(
        "formCategory"
    );


const formMemory =
    document.getElementById(
        "formMemory"
    );


const formColor =
    document.getElementById(
        "formColor"
    );


const formDisplay =
    document.getElementById(
        "formDisplay"
    );


const formWarehouse =
    document.getElementById(
        "formWarehouse"
    );


const formLdu =
    document.getElementById(
        "formLdu"
    );


const formPhoto =
    document.getElementById(
        "formPhoto"
    );


const photoPreview =
    document.getElementById(
        "photoPreview"
    );


const removePhotoButton =
    document.getElementById(
        "removePhotoButton"
    );


const formDescription =
    document.getElementById(
        "formDescription"
    );


const formTip =
    document.getElementById(
        "formTip"
    );


const specsEditor =
    document.getElementById(
        "specsEditor"
    );


const addSpecButton =
    document.getElementById(
        "addSpecButton"
    );


let currentPhoto =
    "";


// ======================================================
// ОТКРЫТЬ ФОРМ
// ======================================================

function openProductForm(
    product = null
) {

    if (!productFormWrapper) {
        return;
    }


    productFormWrapper.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top:
            productFormWrapper.offsetTop - 20,
        behavior:
            "smooth"
    });


    if (product) {

        formTitle.textContent =
            "Редактировать товар";


        editProductId.value =
            product.id;


        formName.value =
            product.name || "";


        formCategory.value =
            product.category || "Смартфоны";


        formMemory.value =
            product.memory || "";


        formColor.value =
            product.color || "";


        formDisplay.value =
            Number(product.display || 0);


        formWarehouse.value =
            Number(product.warehouse || 0);


        formLdu.value =
            Number(product.ldu || 0);


        formDescription.value =
            product.description || "";


        formTip.value =
            product.tip || "";


        currentPhoto =
            product.image || "";


        renderPhotoPreview(
            currentPhoto
        );


        renderSpecsEditor(
            product.specs || {}
        );

    } else {

        formTitle.textContent =
            "Добавить товар";


        editProductId.value =
            "";


        formName.value =
            "";


        formCategory.value =
            "Смартфоны";


        formMemory.value =
            "";


        formColor.value =
            "";


        formDisplay.value =
            "0";


        formWarehouse.value =
            "0";


        formLdu.value =
            "0";


        formDescription.value =
            "";


        formTip.value =
            "";


        currentPhoto =
            "";


        renderPhotoPreview(
            ""
        );


        renderSpecsEditor(
            {}
        );

    }

}


// ======================================================
// ЗАКРЫТЬ ФОРМ
// ======================================================

function closeProductForm() {

    if (!productFormWrapper) {
        return;
    }


    productFormWrapper.classList.add(
        "hidden"
    );

}


if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        () => {

            openProductForm();

        }
    );

}


if (closeFormButton) {

    closeFormButton.addEventListener(
        "click",
        closeProductForm
    );

}


if (cancelFormButton) {

    cancelFormButton.addEventListener(
        "click",
        closeProductForm
    );

}


// ======================================================
// ФОТО — PREVIEW
// ======================================================

function renderPhotoPreview(
    image
) {

    if (!photoPreview) {
        return;
    }


    if (image) {

        photoPreview.innerHTML = `

            <img
                src="${image}"
                alt="Фото товара"
            >

        `;

    } else {

        photoPreview.innerHTML =
            "Фото не выбрано";

    }

}


// ======================================================
// ВЫБОР ФОТО
// ======================================================

if (formPhoto) {

    formPhoto.addEventListener(
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

                    currentPhoto =
                        reader.result;


                    renderPhotoPreview(
                        currentPhoto
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================================
// УДАЛИТЬ ФОТО
// ======================================================

if (removePhotoButton) {

    removePhotoButton.addEventListener(
        "click",
        () => {

            currentPhoto =
                "";


            if (formPhoto) {

                formPhoto.value =
                    "";

            }


            renderPhotoPreview(
                ""
            );

        }
    );

}


// ======================================================
// ХАРАКТЕРИСТИКИ
// ======================================================

function addSpecRow(
    key = "",
    value = ""
) {

    if (!specsEditor) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "spec-editor-row";


    row.innerHTML = `

        <input
            type="text"
            class="spec-key"
            placeholder="Название"
            value="${escapeHTML(key)}"
        >


        <input
            type="text"
            class="spec-value"
            placeholder="Значение"
            value="${escapeHTML(value)}"
        >


        <button
            type="button"
            class="remove-spec-button"
        >
            ×
        </button>

    `;


    const removeButton =
        row.querySelector(
            ".remove-spec-button"
        );


    removeButton.addEventListener(
        "click",
        () => {

            row.remove();

        }
    );


    specsEditor.appendChild(
        row
    );

}


function renderSpecsEditor(
    specs
) {

    if (!specsEditor) {
        return;
    }


    specsEditor.innerHTML =
        "";


    const entries =
        Object.entries(
            specs || {}
        );


    if (entries.length === 0) {

        addSpecRow();

        return;

    }


    entries.forEach(
        ([key, value]) => {

            addSpecRow(
                key,
                value
            );

        }
    );

}


if (addSpecButton) {

    addSpecButton.addEventListener(
        "click",
        () => {

            addSpecRow();

        }
    );

}


// ======================================================
// СОБРАТЬ ХАРАКТЕРИСТИКИ
// ======================================================

function collectSpecs() {

    const result = {};


    if (!specsEditor) {
        return result;
    }


    const rows =
        specsEditor.querySelectorAll(
            ".spec-editor-row"
        );


    rows.forEach(
        row => {

            const key =
                row.querySelector(
                    ".spec-key"
                ).value.trim();


            const value =
                row.querySelector(
                    ".spec-value"
                ).value.trim();


            if (
                key &&
                value
            ) {

                result[key] =
                    value;

            }

        }
    );


    return result;

}


// ======================================================
// СОХРАНЕНИЕ ТОВАРА
// ======================================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                formName.value.trim();


            if (!name) {

                alert(
                    "Введите название товара."
                );

                return;

            }


            const display =
                Math.max(
                    0,
                    Number(
                        formDisplay.value
                    ) || 0
                );


            const warehouse =
                Math.max(
                    0,
                    Number(
                        formWarehouse.value
                    ) || 0
                );


            const ldu =
                Math.max(
                    0,
                    Number(
                        formLdu.value
                    ) || 0
                );


            const specs =
                collectSpecs();


            const existingId =
                Number(
                    editProductId.value
                );


            if (existingId) {

                const product =
                    products.find(
                        item =>
                            item.id ===
                            existingId
                    );


                if (!product) {
                    return;
                }


                product.name =
                    name;


                product.category =
                    formCategory.value;


                product.memory =
                    formMemory.value.trim();


                product.color =
                    formColor.value.trim();


                product.display =
                    display;


                product.warehouse =
                    warehouse;


                product.ldu =
                    ldu;


                product.quantity =
                    display +
                    warehouse;


                product.description =
                    formDescription.value.trim();


                product.tip =
                    formTip.value.trim();


                product.specs =
                    specs;


                product.image =
                    currentPhoto;


                saveProducts();


                closeProductForm();


                renderProducts(
                    products
                );


                alert(
                    "Товар обновлён."
                );


                return;

            }


            // =========================================
            // НОВЫЙ ID
            // =========================================

            const newId =
                generateProductId(
                    formCategory.value
                );


            const newProduct = {

                id:
                    newId,

                name:
                    name,

                category:
                    formCategory.value,

                memory:
                    formMemory.value.trim(),

                color:
                    formColor.value.trim(),

                quantity:
                    display +
                    warehouse,

                ldu:
                    ldu,

                display:
                    display,

                warehouse:
                    warehouse,

                description:
                    formDescription.value.trim(),

                specs:
                    specs,

                tip:
                    formTip.value.trim(),

                image:
                    currentPhoto

            };


            products.push(
                newProduct
            );


            saveProducts();


            closeProductForm();


            renderProducts(
                products
            );


            alert(
                "Товар добавлен в базу."
            );

        }
    );

}


// ======================================================
// ГЕНЕРАЦИЯ ID
// ======================================================

function generateProductId(
    category
) {

    let base = 5000;


    if (
        category ===
        "Смартфоны"
    ) {

        base = 1000;

    }


    if (
        category ===
        "Планшеты"
    ) {

        base = 2000;

    }


    if (
        category ===
        "Смарт-часы"
    ) {

        base = 3000;

    }


    if (
        category ===
        "Фитнес-браслеты"
    ) {

        base = 4000;

    }


    if (
        category ===
        "Аксессуары"
    ) {

        base = 5000;

    }


    const ids =
        products
            .map(
                product =>
                    Number(product.id)
            )
            .filter(
                id =>
                    id >= base &&
                    id < base + 1000
            );


    if (ids.length === 0) {

        return base + 1;

    }


    return (
        Math.max(...ids) + 1
    );

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


// ======================================================
// СТРАНИЦА ТОВАРА
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


    productDetails.innerHTML = `

        <div class="product-page">


            <div>

                <div class="product-page-image">

                    ${
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
                            `
                    }

                </div>


                <div class="product-page-actions">

                    <button
                        id="editCurrentProduct"
                        class="edit-product-button"
                    >
                        Редактировать
                    </button>


                    <button
                        id="deleteCurrentProduct"
                        class="delete-product-button"
                    >
                        Удалить товар
                    </button>

                </div>

            </div>



            <div class="product-page-content">


                <div class="product-category">

                    ${escapeHTML(product.category)}

                </div>


                <h1>

                    ${escapeHTML(product.name)}

                </h1>


                ${
                    product.memory
                        ? `
                            <div class="product-memory">
                                ${escapeHTML(product.memory)}
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
                                    ${escapeHTML(product.color)}
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


                            <strong>
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


                            <strong>
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


                    <div class="stock-big-row">

                        <span>
                            LDU
                        </span>

                        <strong>
                            ${Number(product.ldu || 0)}
                        </strong>

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


    const editButton =
        document.getElementById(
            "editCurrentProduct"
        );


    const deleteButton =
        document.getElementById(
            "deleteCurrentProduct"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                editProductFromPage(
                    product
                );

            }
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                deleteProduct(
                    product.id
                );

            }
        );

    }

}


// ======================================================
// РЕДАКТИРОВАНИЕ СТРАНИЦЫ ТОВАРА
// ======================================================

function editProductFromPage(
    product
) {

    localStorage.setItem(
        "xiaomiWebBaseEditProductId",
        String(product.id)
    );


    window.location.href =
        "index.html?edit=" +
        product.id;

}


// ======================================================
// УДАЛЕНИЕ ТОВАРА
// ======================================================

function deleteProduct(
    productId
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
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
                Number(item.id) ===
                Number(productId)
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
// РЕДАКТИРОВАНИЕ ИЗ INDEX
// ======================================================

function checkEditRequest() {

    if (!productFormWrapper) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const queryId =
        Number(
            params.get("edit")
        );


    const savedId =
        Number(
            localStorage.getItem(
                "xiaomiWebBaseEditProductId"
            )
        );


    const id =
        queryId ||
        savedId;


    if (!id) {
        return;
    }


    const product =
        products.find(
            item =>
                Number(item.id) ===
                id
        );


    if (!product) {
        return;
    }


    localStorage.removeItem(
        "xiaomiWebBaseEditProductId"
    );


    openProductForm(
        product
    );

}


// ======================================================
// ЗАПУСК
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


if (productFormWrapper) {

    checkEditRequest();

}