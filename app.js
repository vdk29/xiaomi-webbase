// ======================================================
// XIAOMI WEBBASE
// APP.JS
// Управление товарами, поиск, категории,
// добавление, редактирование, удаление и фото
// ======================================================


// ======================================================
// НАСТРОЙКИ
// ======================================================

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";


// ======================================================
// СОСТОЯНИЕ
// ======================================================

let editingProductId = null;

let selectedPhoto = "";


// ======================================================
// ЭЛЕМЕНТЫ
// ======================================================

const productsList =
    document.getElementById("productsList");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const categoryButtons =
    document.querySelectorAll(".category-button");


// Модальное окно

const productModal =
    document.getElementById("productModal");

const openAddProductButton =
    document.getElementById("openAddProductButton");

const closeProductModal =
    document.getElementById("closeProductModal");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");


// Заголовок окна

const modalTitle =
    document.getElementById("modalTitle");


// Основные поля

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productColor =
    document.getElementById("productColor");


// Характеристики

const specStorage =
    document.getElementById("specStorage");

const specDisplay =
    document.getElementById("specDisplay");

const specProcessor =
    document.getElementById("specProcessor");

const specCamera =
    document.getElementById("specCamera");

const specBattery =
    document.getElementById("specBattery");

const specRam =
    document.getElementById("specRam");


// Наличие

const productDisplay =
    document.getElementById("productDisplay");

const productWarehouse =
    document.getElementById("productWarehouse");

const productLdu =
    document.getElementById("productLdu");


// Дополнительная информация

const productDescription =
    document.getElementById("productDescription");

const productTip =
    document.getElementById("productTip");


// Фото

const productPhoto =
    document.getElementById("productPhoto");

const photoPreview =
    document.getElementById("photoPreview");


// ======================================================
// LOCAL STORAGE
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(
            PRODUCTS_STORAGE_KEY,
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


// ======================================================
// ЗАГРУЗКА СОХРАНЁННОЙ БАЗЫ
// ======================================================

function loadSavedProducts() {

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
            Array.isArray(parsedProducts) &&
            parsedProducts.length > 0
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

    }

}


// ======================================================
// ОТКРЫТИЕ ОКНА
// ======================================================

function openProductModal() {

    if (!productModal) {
        return;
    }


    productModal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );


    setTimeout(
        () => {

            if (productName) {

                productName.focus();

            }

        },
        100
    );

}


// ======================================================
// ЗАКРЫТИЕ ОКНА
// ======================================================

function closeModal() {

    if (!productModal) {
        return;
    }


    productModal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );


    editingProductId = null;

    selectedPhoto = "";

    resetProductForm();

}


// ======================================================
// СБРОС ФОРМЫ
// ======================================================

function resetProductForm() {

    if (!productForm) {
        return;
    }


    productForm.reset();


    if (productDisplay) {

        productDisplay.value = 0;

    }


    if (productWarehouse) {

        productWarehouse.value = 0;

    }


    if (productLdu) {

        productLdu.checked = false;

    }


    if (photoPreview) {

        photoPreview.innerHTML = "";

    }


    selectedPhoto = "";


    if (modalTitle) {

        modalTitle.textContent =
            "Добавить товар";

    }

}


// ======================================================
// КНОПКА ДОБАВИТЬ
// ======================================================

if (openAddProductButton) {

    openAddProductButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            editingProductId = null;

            resetProductForm();

            openProductModal();

        }
    );

}


// ======================================================
// КНОПКА ЗАКРЫТЬ
// ======================================================

if (closeProductModal) {

    closeProductModal.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeModal();

        }
    );

}


// ======================================================
// ОТМЕНА
// ======================================================

if (cancelProductButton) {

    cancelProductButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeModal();

        }
    );

}


// ======================================================
// ЗАКРЫТИЕ ПО ФОНУ
// ======================================================

if (productModal) {

    productModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                productModal
            ) {

                closeModal();

            }

        }
    );

}


// ======================================================
// ESC
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            productModal &&
            productModal.classList.contains("active")
        ) {

            closeModal();

        }

    }
);


// ======================================================
// ФОТО
// ======================================================

if (productPhoto) {

    productPhoto.addEventListener(
        "change",
        function() {

            const file =
                productPhoto.files[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Можно выбрать только изображение."
                );

                productPhoto.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    selectedPhoto =
                        event.target.result;


                    renderPhotoPreview(
                        selectedPhoto
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================================
// ПРЕВЬЮ ФОТО
// ======================================================

function renderPhotoPreview(
    image
) {

    if (!photoPreview) {
        return;
    }


    if (!image) {

        photoPreview.innerHTML = "";

        return;

    }


    photoPreview.innerHTML = `

        <div class="photo-preview-inner">

            <img
                src="${image}"
                alt="Фото товара"
            >

            <button
                type="button"
                class="remove-photo-button"
                id="removePhotoButton"
            >
                Удалить фото
            </button>

        </div>

    `;


    const removePhotoButton =
        document.getElementById(
            "removePhotoButton"
        );


    if (removePhotoButton) {

        removePhotoButton.addEventListener(
            "click",
            function() {

                selectedPhoto = "";

                if (productPhoto) {

                    productPhoto.value = "";

                }

                renderPhotoPreview("");

            }
        );

    }

}


// ======================================================
// ПОЛУЧЕНИЕ ХАРАКТЕРИСТИК
// ======================================================

function buildSpecs() {

    const specs = {};


    if (
        specStorage &&
        specStorage.value.trim()
    ) {

        specs["Встроенная память"] =
            specStorage.value.trim();

    }


    if (
        specDisplay &&
        specDisplay.value.trim()
    ) {

        specs["Дисплей"] =
            specDisplay.value.trim();

    }


    if (
        specProcessor &&
        specProcessor.value.trim()
    ) {

        specs["Процессор"] =
            specProcessor.value.trim();

    }


    if (
        specCamera &&
        specCamera.value.trim()
    ) {

        specs["Фотокамера"] =
            specCamera.value.trim();

    }


    if (
        specBattery &&
        specBattery.value.trim()
    ) {

        specs["Ёмкость аккумулятора"] =
            specBattery.value.trim();

    }


    if (
        specRam &&
        specRam.value.trim()
    ) {

        specs["Оперативная память"] =
            specRam.value.trim();

    }


    return specs;

}


// ======================================================
// СОХРАНЕНИЕ ТОВАРА
// ======================================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                productName.value.trim();


            if (!name) {

                alert(
                    "Введите название товара."
                );

                productName.focus();

                return;

            }


            const category =
                productCategory.value;


            const color =
                productColor.value.trim();


            const display =
                Math.max(
                    0,
                    Number(
                        productDisplay.value
                    ) || 0
                );


            const warehouse =
                Math.max(
                    0,
                    Number(
                        productWarehouse.value
                    ) || 0
                );


            const quantity =
                display +
                warehouse;


            const ldu =
                productLdu.checked
                    ? 1
                    : 0;


            const specs =
                buildSpecs();


            const description =
                productDescription.value.trim();


            const tip =
                productTip.value.trim();


            // ==========================================
            // РЕДАКТИРОВАНИЕ
            // ==========================================

            if (
                editingProductId !== null
            ) {

                const existingProduct =
                    products.find(
                        product =>
                            Number(product.id) ===
                            Number(editingProductId)
                    );


                if (!existingProduct) {

                    alert(
                        "Товар не найден."
                    );

                    return;

                }


                existingProduct.name =
                    name;

                existingProduct.category =
                    category;

                existingProduct.memory =
                    specs["Встроенная память"] || "";

                existingProduct.color =
                    color;

                existingProduct.quantity =
                    quantity;

                existingProduct.ldu =
                    ldu;

                existingProduct.display =
                    display;

                existingProduct.warehouse =
                    warehouse;

                existingProduct.description =
                    description;

                existingProduct.specs =
                    specs;

                existingProduct.tip =
                    tip;


                if (selectedPhoto) {

                    existingProduct.image =
                        selectedPhoto;

                }


                saveProducts();

                closeModal();

                renderProducts(
                    products
                );

                return;

            }


            // ==========================================
            // НОВЫЙ ТОВАР
            // ==========================================

            const newProduct =
                createNewProduct({
                    name,
                    category,
                    color,
                    display,
                    warehouse,
                    quantity,
                    ldu,
                    specs,
                    description,
                    tip,
                    image: selectedPhoto
                });


            products.push(
                newProduct
            );


            saveProducts();


            closeModal();


            // Показываем все товары

            categoryButtons.forEach(
                button => {

                    button.classList.remove(
                        "active"
                    );

                }
            );


            const allButton =
                document.querySelector(
                    '.category-button[data-category="Все"]'
                );


            if (allButton) {

                allButton.classList.add(
                    "active"
                );

            }


            if (searchInput) {

                searchInput.value = "";

            }


            renderProducts(
                products
            );

        }
    );

}


// ======================================================
// СОЗДАНИЕ ID
// ======================================================

function generateProductId() {

    const ids =
        products
            .map(
                product =>
                    Number(product.id) || 0
            );


    const maxId =
        ids.length > 0
            ? Math.max(...ids)
            : 0;


    return maxId + 1;

}


// ======================================================
// СОЗДАНИЕ НОВОГО ТОВАРА
// ======================================================

function createNewProduct(
    data
) {

    return {

        id:
            generateProductId(),

        name:
            data.name,

        category:
            data.category,

        memory:
            data.specs["Встроенная память"] || "",

        color:
            data.color,

        quantity:
            data.quantity,

        ldu:
            data.ldu,

        display:
            data.display,

        warehouse:
            data.warehouse,

        description:
            data.description,

        specs:
            data.specs,

        tip:
            data.tip,

        image:
            data.image || ""

    };

}


// ======================================================
// РЕНДЕР ТОВАРОВ
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
                    или добавить новый товар.
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
                            alt="${product.name}"
                            class="product-card-photo"
                        >
                    `
                    : `
                        <div class="product-image">
                            Фото товара
                        </div>
                    `;


            card.innerHTML = `

                ${imageHTML}


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


                <div class="product-card-actions">

                    <button
                        type="button"
                        class="card-edit-button"
                        data-id="${product.id}"
                    >
                        Изменить
                    </button>


                    <button
                        type="button"
                        class="card-delete-button"
                        data-id="${product.id}"
                    >
                        Удалить
                    </button>

                </div>

            `;


            // ==========================================
            // ОТКРЫТИЕ ТОВАРА
            // ==========================================

            card.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target.closest(
                            ".card-edit-button"
                        ) ||
                        event.target.closest(
                            ".card-delete-button"
                        )
                    ) {

                        return;

                    }


                    window.location.href =
                        `product.html?id=${product.id}`;

                }
            );


            // ==========================================
            // РЕДАКТИРОВАНИЕ
            // ==========================================

            const editButton =
                card.querySelector(
                    ".card-edit-button"
                );


            if (editButton) {

                editButton.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        openEditProduct(
                            product.id
                        );

                    }
                );

            }


            // ==========================================
            // УДАЛЕНИЕ
            // ==========================================

            const deleteButton =
                card.querySelector(
                    ".card-delete-button"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        deleteProduct(
                            product.id
                        );

                    }
                );

            }


            productsList.appendChild(
                card
            );

        }
    );

}


// ======================================================
// РЕДАКТИРОВАНИЕ ТОВАРА
// ======================================================

function openEditProduct(
    productId
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        alert(
            "Товар не найден."
        );

        return;

    }


    editingProductId =
        product.id;


    if (modalTitle) {

        modalTitle.textContent =
            "Редактировать товар";

    }


    // Основные поля

    productName.value =
        product.name || "";


    productCategory.value =
        product.category || "Смартфоны";


    productColor.value =
        product.color || "";


    // Характеристики

    const specs =
        product.specs || {};


    specStorage.value =
        specs["Встроенная память"] ||
        product.memory ||
        "";


    specDisplay.value =
        specs["Дисплей"] ||
        "";


    specProcessor.value =
        specs["Процессор"] ||
        "";


    specCamera.value =
        specs["Фотокамера"] ||
        "";


    specBattery.value =
        specs["Ёмкость аккумулятора"] ||
        "";


    specRam.value =
        specs["Оперативная память"] ||
        "";


    // Наличие

    productDisplay.value =
        Number(
            product.display || 0
        );


    productWarehouse.value =
        Number(
            product.warehouse || 0
        );


    productLdu.checked =
        Number(
            product.ldu || 0
        ) > 0;


    // Описание

    productDescription.value =
        product.description || "";


    productTip.value =
        product.tip || "";


    // Фото

    selectedPhoto =
        product.image || "";


    if (selectedPhoto) {

        renderPhotoPreview(
            selectedPhoto
        );

    } else {

        renderPhotoPreview("");

    }


    openProductModal();

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
            `Удалить товар "${product.name}"?`
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


    if (index === -1) {
        return;
    }


    products.splice(
        index,
        1
    );


    saveProducts();


    renderProducts(
        products
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

                const specsText =
                    product.specs
                        ? Object.values(
                            product.specs
                        ).join(" ")
                        : "";


                const searchText = `

                    ${product.name}

                    ${product.category}

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


// ======================================================
// КНОПКА ПОИСКА
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// ENTER В ПОИСКЕ
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function(event) {

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
                        product =>
                            product.category ===
                            category
                    );


                renderProducts(
                    filteredProducts
                );

            }
        );

    }
);


// ======================================================
// HTML-БЕЗОПАСНОСТЬ
// ======================================================

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


// ======================================================
// ЗАПУСК
// ======================================================

loadSavedProducts();


if (productsList) {

    renderProducts(
        products
    );

}


// ======================================================
// КОНСОЛЬ
// ======================================================

console.log(
    "Xiaomi WebBase запущена."
);

console.log(
    "Товаров в базе:",
    products.length
);