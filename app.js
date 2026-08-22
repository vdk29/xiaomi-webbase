// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================


// ======================================================
// START
// ======================================================

function startApp() {

    if (typeof products === "undefined") {

        console.error("products-data.js не найден.");
        return;

    }

    // Если это страница товара
    if (document.getElementById("productDetails")) {

        initProductPage();

        return;

    }

    // Если это главная страница
    initApp();

}


// ======================================================
// PRODUCTS DATA
// ======================================================

if (typeof products === "undefined") {

    const dataScript =
        document.createElement("script");

    dataScript.src =
        "products-data.js";

    dataScript.onload =
        startApp;

    dataScript.onerror =
        function() {

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

    const addButton =
        document.getElementById(
            "addProductButton"
        ) ||
        document.getElementById(
            "openAddProductButton"
        );

    const categoryButtons =
        document.querySelectorAll(
            ".category-button"
        );

    const STORAGE_KEY =
        typeof PRODUCTS_STORAGE_KEY !== "undefined"
            ? PRODUCTS_STORAGE_KEY
            : "xiaomiWebBaseProducts";


    // ==================================================
    // STORAGE
    // ==================================================

    function saveProducts() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );

    }


    // ==================================================
    // MODAL STATE
    // ==================================================

    let editingProductId = null;

    let currentPhoto = "";


    // ==================================================
    // CREATE MODAL
    // ==================================================

    function createProductModal() {

        // Если модальное окно уже есть в HTML,
        // используем его.
        let overlay =
            document.getElementById(
                "productModalOverlay"
            );

        if (!overlay) {

            const existingModal =
                document.getElementById(
                    "productModal"
                );

            if (existingModal) {

                overlay =
                    existingModal.closest(
                        ".modal-overlay"
                    );

                if (overlay) {

                    overlay.id =
                        "productModalOverlay";

                }

            }

        }


        // Если модального окна вообще нет —
        // создаём его.
        if (!overlay) {

            overlay =
                document.createElement("div");

            overlay.id =
                "productModalOverlay";

            overlay.className =
                "modal-overlay";

            overlay.innerHTML = `

                <div
                    class="modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <div class="modal-header">

                        <div>

                            <h2 id="modalTitle">
                                Добавить товар
                            </h2>

                        </div>

                        <button
                            type="button"
                            class="modal-close"
                            id="closeProductModal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="productForm"
                        class="product-form"
                    >

                        <div class="form-group">

                            <label>
                                Категория
                            </label>

                            <select
                                id="productCategory"
                                required
                            >

                                <option value="">
                                    Выберите категорию
                                </option>

                                <option value="Смартфоны">
                                    Смартфоны
                                </option>

                                <option value="Планшеты">
                                    Планшеты
                                </option>

                                <option value="Смарт-часы">
                                    Смарт-часы
                                </option>

                                <option value="Фитнес-браслеты">
                                    Фитнес-браслеты
                                </option>

                                <option value="Аксессуары">
                                    Аксессуары
                                </option>

                            </select>

                        </div>


                        <div class="form-group">

                            <label>
                                Название товара
                            </label>

                            <input
                                type="text"
                                id="productName"
                                placeholder="Например: Xiaomi 17 Ultra"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Цвет
                            </label>

                            <input
                                type="text"
                                id="productColor"
                                placeholder="Например: Black"
                            >

                        </div>


                        <div class="characteristics">

                            <div class="characteristics-title">
                                Характеристики
                            </div>


                            <div class="characteristics-grid">

                                <div class="form-group">

                                    <label>
                                        Встроенная память
                                    </label>

                                    <input
                                        type="text"
                                        id="specStorage"
                                        placeholder="512 GB"
                                    >

                                </div>


                                <div class="form-group">

                                    <label>
                                        Дисплей
                                    </label>

                                    <input
                                        type="text"
                                        id="specDisplay"
                                        placeholder="6.9 AMOLED"
                                    >

                                </div>


                                <div class="form-group">

                                    <label>
                                        Процессор
                                    </label>

                                    <input
                                        type="text"
                                        id="specProcessor"
                                        placeholder="Snapdragon..."
                                    >

                                </div>


                                <div class="form-group">

                                    <label>
                                        Фотокамера
                                    </label>

                                    <input
                                        type="text"
                                        id="specCamera"
                                        placeholder="200 Мп"
                                    >

                                </div>


                                <div class="form-group">

                                    <label>
                                        Ёмкость аккумулятора
                                    </label>

                                    <input
                                        type="text"
                                        id="specBattery"
                                        placeholder="6000 мАч"
                                    >

                                </div>


                                <div class="form-group">

                                    <label>
                                        Оперативная память
                                    </label>

                                    <input
                                        type="text"
                                        id="specRam"
                                        placeholder="16 GB"
                                    >

                                </div>

                            </div>

                        </div>


                        <div class="characteristics">

                            <div class="characteristics-title">
                                Наличие
                            </div>


                            <div class="stock-form">

                                <div class="form-group">

                                    <label>
                                        На витрине
                                    </label>

                                    <input
                                        type="number"
                                        id="productDisplay"
                                        min="0"
                                        value="0"
                                    >

                                </div>


                                <div class="form-group">

                                    <label>
                                        На складе
                                    </label>

                                    <input
                                        type="number"
                                        id="productWarehouse"
                                        min="0"
                                        value="0"
                                    >

                                </div>

                            </div>


                            <div class="form-group">

                                <label>
                                    LDU
                                </label>

                                <input
                                    type="number"
                                    id="productLdu"
                                    min="0"
                                    value="0"
                                >

                            </div>

                        </div>


                        <div class="form-group">

                            <label>
                                Краткое описание
                            </label>

                            <textarea
                                id="productDescription"
                                placeholder="Краткая информация о товаре..."
                            ></textarea>

                        </div>


                        <div class="form-group">

                            <label>
                                Подсказка продавцу
                            </label>

                            <textarea
                                id="productTip"
                                placeholder="Подсказка продавцу..."
                            ></textarea>

                        </div>


                        <div class="form-group">

                            <label>
                                Фото товара
                            </label>

                            <div class="photo-upload">

                                <input
                                    type="file"
                                    id="productPhoto"
                                    accept="image/*"
                                >

                            </div>


                            <div
                                class="photo-preview"
                                id="photoPreview"
                            >

                                <img
                                    id="photoPreviewImage"
                                    src=""
                                    alt=""
                                >

                            </div>

                        </div>


                        <div class="form-actions">

                            <button
                                type="button"
                                class="form-button cancel"
                                id="cancelProductModal"
                            >
                                Отмена
                            </button>


                            <button
                                type="submit"
                                class="form-button save"
                            >
                                Сохранить товар
                            </button>

                        </div>

                    </form>

                </div>

            `;

            document.body.appendChild(
                overlay
            );

        }


        // ==================================================
        // BUTTONS
        // ==================================================

        const closeButton =
            document.getElementById(
                "closeProductModal"
            );

        const cancelButton =
            document.getElementById(
                "cancelProductModal"
            );


        if (closeButton) {

            closeButton.onclick =
                closeProductModal;

        }


        if (cancelButton) {

            cancelButton.onclick =
                closeProductModal;

        }


        overlay.onclick =
            function(event) {

                if (
                    event.target === overlay
                ) {

                    closeProductModal();

                }

            };


        // ==================================================
        // FORM
        // ==================================================

        const form =
            document.getElementById(
                "productForm"
            );


        if (form) {

            form.onsubmit =
                saveProductFromForm;

        }


        // ==================================================
        // PHOTO
        // ==================================================

        const photoInput =
            document.getElementById(
                "productPhoto"
            );


        if (photoInput) {

            photoInput.onchange =
                handlePhoto;

        }

    }


    // ==================================================
    // OPEN MODAL
    // ==================================================

    function openProductModal(
        product = null
    ) {

        createProductModal();


        const overlay =
            document.getElementById(
                "productModalOverlay"
            );


        if (!overlay) {

            console.error(
                "Модальное окно не найдено."
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
            document.getElementById(
                "modalTitle"
            );


        if (title) {

            title.textContent =
                product
                    ? "Редактировать товар"
                    : "Добавить товар";

        }


        const category =
            document.getElementById(
                "productCategory"
            );

        if (category) {

            category.value =
                product?.category || "";

        }


        const name =
            document.getElementById(
                "productName"
            );

        if (name) {

            name.value =
                product?.name || "";

        }


        const color =
            document.getElementById(
                "productColor"
            );

        if (color) {

            color.value =
                product?.color || "";

        }


        const specs =
            product?.specs || {};


        setValue(
            "specStorage",
            specs["Встроенная память"]
        );

        setValue(
            "specDisplay",
            specs["Дисплей"]
        );

        setValue(
            "specProcessor",
            specs["Процессор"]
        );

        setValue(
            "specCamera",
            specs["Фотокамера"]
        );

        setValue(
            "specBattery",
            specs["Емкость аккумулятора"] ||
            specs["Ёмкость аккумулятора"]
        );

        setValue(
            "specRam",
            specs["Оперативная память"]
        );


        setValue(
            "productDisplay",
            product?.display || 0
        );

        setValue(
            "productWarehouse",
            product?.warehouse || 0
        );

        setValue(
            "productLdu",
            product?.ldu || 0
        );


        setValue(
            "productDescription",
            product?.description || ""
        );

        setValue(
            "productTip",
            product?.tip || ""
        );


        const preview =
            document.getElementById(
                "photoPreview"
            );

        const previewImage =
            document.getElementById(
                "photoPreviewImage"
            );


        if (
            currentPhoto &&
            preview &&
            previewImage
        ) {

            previewImage.src =
                currentPhoto;

            preview.classList.add(
                "active"
            );

        } else if (
            preview &&
            previewImage
        ) {

            previewImage.src =
                "";

            preview.classList.remove(
                "active"
            );

        }


        overlay.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            function() {

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
    // SET VALUE
    // ==================================================

    function setValue(
        id,
        value
    ) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value =
                value ?? "";

        }

    }


    // ==================================================
    // CLOSE MODAL
    // ==================================================

    function closeProductModal() {

        const overlay =
            document.getElementById(
                "productModalOverlay"
            );


        if (!overlay) {

            return;

        }


        overlay.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";


        editingProductId =
            null;


        currentPhoto =
            "";

    }


    // ==================================================
    // ESC
    // ==================================================

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeProductModal();

            }

        }
    );


    // ==================================================
    // PHOTO
    // ==================================================

    function handlePhoto(event) {

        const file =
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

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                currentPhoto =
                    event.target.result;


                const preview =
                    document.getElementById(
                        "photoPreview"
                    );

                const image =
                    document.getElementById(
                        "photoPreviewImage"
                    );


                if (
                    preview &&
                    image
                ) {

                    image.src =
                        currentPhoto;

                    preview.classList.add(
                        "active"
                    );

                }

            };


        reader.readAsDataURL(
            file
        );

    }


    // ==================================================
    // SAVE PRODUCT
    // ==================================================

    function saveProductFromForm(
        event
    ) {

        event.preventDefault();


        const category =
            getValue(
                "productCategory"
            ).trim();


        const name =
            getValue(
                "productName"
            ).trim();


        if (!category) {

            alert(
                "Выберите категорию."
            );

            return;

        }


        if (!name) {

            alert(
                "Введите название товара."
            );

            return;

        }


        const storage =
            getValue(
                "specStorage"
            ).trim();


        const displaySpec =
            getValue(
                "specDisplay"
            ).trim();


        const processor =
            getValue(
                "specProcessor"
            ).trim();


        const camera =
            getValue(
                "specCamera"
            ).trim();


        const battery =
            getValue(
                "specBattery"
            ).trim();


        const ram =
            getValue(
                "specRam"
            ).trim();


        const color =
            getValue(
                "productColor"
            ).trim();


        const display =
            Math.max(
                0,
                Number(
                    getValue(
                        "productDisplay"
                    )
                ) || 0
            );


        const warehouse =
            Math.max(
                0,
                Number(
                    getValue(
                        "productWarehouse"
                    )
                ) || 0
            );


        const ldu =
            Math.max(
                0,
                Number(
                    getValue(
                        "productLdu"
                    )
                ) || 0
            );


        const description =
            getValue(
                "productDescription"
            ).trim();


        const tip =
            getValue(
                "productTip"
            ).trim();


        const specs = {};


        if (storage)
            specs["Встроенная память"] =
                storage;


        if (displaySpec)
            specs["Дисплей"] =
                displaySpec;


        if (processor)
            specs["Процессор"] =
                processor;


        if (camera)
            specs["Фотокамера"] =
                camera;


        if (battery)
            specs["Емкость аккумулятора"] =
                battery;


        if (ram)
            specs["Оперативная память"] =
                ram;


        if (color)
            specs["Цвет"] =
                color;


        specs["LDU"] =
            ldu > 0
                ? `${ldu} шт.`
                : "Нет";


        let memory = "";


        if (
            ram &&
            storage
        ) {

            memory =
                `${ram} / ${storage}`;

        } else {

            memory =
                storage || ram;

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

                product.memory =
                    memory;

                product.color =
                    color;

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

        }


        saveProducts();


        const wasEditing =
            editingProductId !== null;

        const savedId =
            editingProductId;


        closeProductModal();


        // Если редактировали существующий товар —
        // возвращаемся сразу на него.
        if (
            wasEditing &&
            savedId !== null
        ) {

            window.location.href =
                `product.html?id=${savedId}`;

            return;

        }


        renderProducts(
            products
        );

    }


    // ==================================================
    // GET VALUE
    // ==================================================

    function getValue(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value
            : "";

    }


    // ==================================================
    // GENERATE ID
    // ==================================================

    function generateProductId() {

        let maxId = 0;


        products.forEach(
            function(product) {

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
    // ADD BUTTON
    // ==================================================

    if (addButton) {

        addButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                openProductModal();

            };

    } else {

        console.warn(
            "Кнопка добавления товара не найдена."
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
            !list ||
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


        list.forEach(
            function(product) {

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

                        ${
                            product.image

                                ? `

                                    <img
                                        src="${escapeHTML(product.image)}"
                                        alt="${escapeHTML(product.name)}"
                                    >

                                  `

                                : `

                                    Фото товара

                                  `
                        }

                    </div>


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


                card.onclick =
                    function() {

                        window.location.href =
                            `product.html?id=${product.id}`;

                    };


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

        const query =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        if (!query) {

            renderProducts(
                products
            );

            return;

        }


        const result =
            products.filter(
                function(product) {

                    const text = `

                        ${product.name || ""}

                        ${product.category || ""}

                        ${product.memory || ""}

                        ${product.color || ""}

                        ${product.description || ""}

                        ${product.tip || ""}

                    `.toLowerCase();


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

        searchButton.onclick =
            searchProducts;

    }


    if (searchInput) {

        searchInput.oninput =
            searchProducts;


        searchInput.onkeydown =
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    searchProducts();

                }

            };

    }


    // ==================================================
    // CATEGORIES
    // ==================================================

    categoryButtons.forEach(
        function(button) {

            button.onclick =
                function() {

                    categoryButtons.forEach(
                        function(item) {

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


                    const category =
                        button.dataset.category;


                    if (
                        category === "Все"
                    ) {

                        renderProducts(
                            products
                        );

                        return;

                    }


                    renderProducts(
                        products.filter(
                            function(product) {

                                return (
                                    product.category ===
                                    category
                                );

                            }
                        )
                    );

                };

        }
    );


    // ==================================================
    // INIT
    // ==================================================

    createProductModal();


    renderProducts(
        products
    );

}


// ======================================================
// PRODUCT PAGE
// ======================================================

function initProductPage() {

    const container =
        document.getElementById(
            "productDetails"
        );


    if (!container) {

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    if (!productId) {

        container.innerHTML = `

            <div class="empty-result">

                <strong>
                    Товар не найден
                </strong>

                <p>
                    Не указан ID товара.
                </p>

            </div>

        `;

        return;

    }


    const product =
        products.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        container.innerHTML = `

            <div class="empty-result">

                <strong>
                    Товар не найден
                </strong>

                <p>
                    Возможно, товар был удалён.
                </p>

            </div>

        `;

        return;

    }


    renderProductPage(
        container,
        product
    );

}


// ======================================================
// RENDER PRODUCT PAGE
// ======================================================

function renderProductPage(
    container,
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


    const ldu =
        Number(
            product.ldu || 0
        );


    const specs =
        product.specs || {};


    let specsHTML =
        "";


    const specEntries = [
        [
            "Встроенная память",
            specs["Встроенная память"]
        ],
        [
            "Дисплей",
            specs["Дисплей"]
        ],
        [
            "Процессор",
            specs["Процессор"]
        ],
        [
            "Фотокамера",
            specs["Фотокамера"]
        ],
        [
            "Ёмкость аккумулятора",
            specs["Емкость аккумулятора"] ||
            specs["Ёмкость аккумулятора"]
        ],
        [
            "Оперативная память",
            specs["Оперативная память"]
        ]
    ];


    specEntries.forEach(
        function(item) {

            const label =
                item[0];

            const value =
                item[1];


            if (!value) {

                return;

            }


            specsHTML += `

                <div class="spec-row">

                    <span>
                        ${escapeHTML(label)}
                    </span>

                    <strong>
                        ${escapeHTML(value)}
                    </strong>

                </div>

            `;

        }
    );


    container.innerHTML = `

        <div class="product-page">


            <!-- ======================================
                 IMAGE
            ======================================= -->

            <div>

                <div class="product-page-image">

                    ${
                        product.image

                            ? `

                                <img
                                    src="${escapeHTML(product.image)}"
                                    alt="${escapeHTML(product.name)}"
                                >

                              `

                            : `

                                Фото товара

                              `
                    }

                </div>

            </div>



            <!-- ======================================
                 CONTENT
            ======================================= -->

            <div class="product-page-content">


                <div class="product-category">

                    ${escapeHTML(
                        product.category || ""
                    )}

                </div>


                <!-- TITLE + EDIT -->

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:12px;
                        margin-bottom:10px;
                    "
                >

                    <h1
                        style="
                            margin:0;
                        "
                    >
                        ${escapeHTML(
                            product.name
                        )}
                    </h1>


                    <button
                        type="button"
                        id="editProductButton"
                        style="
                            flex-shrink:0;
                            border:1px solid #dddddd;
                            background:#ffffff;
                            color:#444444;
                            padding:7px 11px;
                            border-radius:6px;
                            font-size:13px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Редактировать
                    </button>

                </div>


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
                                ${escapeHTML(
                                    product.color
                                )}

                            </div>

                          `
                        : ""
                }



                <!-- STOCK -->

                <section class="product-stock">

                    <h2>
                        Наличие
                    </h2>


                    <div class="stock-big-row">

                        <span>
                            На витрине
                        </span>

                        <strong>
                            ${display}
                        </strong>

                    </div>


                    <div class="stock-big-row">

                        <span>
                            На складе
                        </span>

                        <strong>
                            ${warehouse}
                        </strong>

                    </div>


                    <div class="stock-big-row">

                        <span>
                            LDU
                        </span>

                        <strong>
                            ${
                                ldu > 0
                                    ? `${ldu} шт.`
                                    : "Нет"
                            }
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

                </section>



                <!-- DESCRIPTION -->

                ${
                    product.description

                        ? `

                            <section class="product-description">

                                <h2>
                                    Описание
                                </h2>

                                <p>
                                    ${escapeHTML(
                                        product.description
                                    )}
                                </p>

                            </section>

                          `

                        : ""
                }



                <!-- SPECS -->

                ${
                    specsHTML

                        ? `

                            <section class="product-specs">

                                <h2>
                                    Характеристики
                                </h2>

                                ${specsHTML}

                            </section>

                          `

                        : ""
                }



                <!-- TIP -->

                ${
                    product.tip

                        ? `

                            <section class="product-tip">

                                <h2>
                                    Подсказка продавцу
                                </h2>

                                <p>
                                    ${escapeHTML(
                                        product.tip
                                    )}
                                </p>

                            </section>

                          `

                        : ""
                }



                <!-- ==================================
                     DELETE
                =================================== -->

                <div
                    style="
                        margin-top:40px;
                        padding-top:20px;
                        border-top:1px solid #eeeeee;
                    "
                >

                    <button
                        type="button"
                        id="deleteProductButton"
                        style="
                            border:1px solid #e3b8b4;
                            background:#ffffff;
                            color:#c62828;
                            padding:8px 12px;
                            border-radius:6px;
                            font-size:12px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Удалить товар
                    </button>

                </div>

            </div>

        </div>

    `;


    // ==================================================
    // EDIT BUTTON
    // ==================================================

    const editButton =
        document.getElementById(
            "editProductButton"
        );


    if (editButton) {

        editButton.onclick =
            function() {

                openEditModalFromProductPage(
                    product
                );

            };

    }


    // ==================================================
    // DELETE BUTTON
    // ==================================================

    const deleteButton =
        document.getElementById(
            "deleteProductButton"
        );


    if (deleteButton) {

        deleteButton.onclick =
            function() {

                deleteProductFromProductPage(
                    product
                );

            };

    }

}


// ======================================================
// OPEN EDIT MODAL FROM PRODUCT PAGE
// ======================================================

function openEditModalFromProductPage(
    product
) {

    let overlay =
        document.getElementById(
            "productModalOverlay"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "productModalOverlay";

        overlay.className =
            "modal-overlay";


        overlay.innerHTML = `

            <div
                class="modal"
                role="dialog"
                aria-modal="true"
            >

                <div class="modal-header">

                    <div>

                        <h2 id="modalTitle">
                            Редактировать товар
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="modal-close"
                        id="closeProductModal"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="productForm"
                    class="product-form"
                >

                    <div class="form-group">

                        <label>
                            Категория
                        </label>

                        <select
                            id="productCategory"
                            required
                        >

                            <option value="Смартфоны">
                                Смартфоны
                            </option>

                            <option value="Планшеты">
                                Планшеты
                            </option>

                            <option value="Смарт-часы">
                                Смарт-часы
                            </option>

                            <option value="Фитнес-браслеты">
                                Фитнес-браслеты
                            </option>

                            <option value="Аксессуары">
                                Аксессуары
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Название товара
                        </label>

                        <input
                            type="text"
                            id="productName"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Цвет
                        </label>

                        <input
                            type="text"
                            id="productColor"
                        >

                    </div>


                    <div class="characteristics">

                        <div class="characteristics-title">
                            Характеристики
                        </div>


                        <div class="characteristics-grid">

                            <div class="form-group">
                                <label>Встроенная память</label>
                                <input
                                    type="text"
                                    id="specStorage"
                                >
                            </div>


                            <div class="form-group">
                                <label>Дисплей</label>
                                <input
                                    type="text"
                                    id="specDisplay"
                                >
                            </div>


                            <div class="form-group">
                                <label>Процессор</label>
                                <input
                                    type="text"
                                    id="specProcessor"
                                >
                            </div>


                            <div class="form-group">
                                <label>Фотокамера</label>
                                <input
                                    type="text"
                                    id="specCamera"
                                >
                            </div>


                            <div class="form-group">
                                <label>Ёмкость аккумулятора</label>
                                <input
                                    type="text"
                                    id="specBattery"
                                >
                            </div>


                            <div class="form-group">
                                <label>Оперативная память</label>
                                <input
                                    type="text"
                                    id="specRam"
                                >
                            </div>

                        </div>

                    </div>


                    <div class="characteristics">

                        <div class="characteristics-title">
                            Наличие
                        </div>


                        <div class="stock-form">

                            <div class="form-group">

                                <label>
                                    На витрине
                                </label>

                                <input
                                    type="number"
                                    id="productDisplay"
                                    min="0"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    На складе
                                </label>

                                <input
                                    type="number"
                                    id="productWarehouse"
                                    min="0"
                                >

                            </div>

                        </div>


                        <div class="form-group">

                            <label>
                                LDU
                            </label>

                            <input
                                type="number"
                                id="productLdu"
                                min="0"
                            >

                        </div>

                    </div>


                    <div class="form-group">

                        <label>
                            Краткое описание
                        </label>

                        <textarea
                            id="productDescription"
                        ></textarea>

                    </div>


                    <div class="form-group">

                        <label>
                            Подсказка продавцу
                        </label>

                        <textarea
                            id="productTip"
                        ></textarea>

                    </div>


                    <div class="form-actions">

                        <button
                            type="button"
                            class="form-button cancel"
                            id="cancelProductModal"
                        >
                            Отмена
                        </button>


                        <button
                            type="submit"
                            class="form-button save"
                        >
                            Сохранить изменения
                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        document.getElementById(
            "closeProductModal"
        ).onclick =
            function() {

                closeStandaloneModal();

            };


        document.getElementById(
            "cancelProductModal"
        ).onclick =
            function() {

                closeStandaloneModal();

            };


        document.getElementById(
            "productForm"
        ).onsubmit =
            function(event) {

                event.preventDefault();

                saveEditedProductFromPage(
                    product
                );

            };

    }


    fillEditForm(
        product
    );


    overlay.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// ======================================================
// FILL EDIT FORM
// ======================================================

function fillEditForm(
    product
) {

    setElementValue(
        "productCategory",
        product.category || ""
    );

    setElementValue(
        "productName",
        product.name || ""
    );

    setElementValue(
        "productColor",
        product.color || ""
    );


    const specs =
        product.specs || {};


    setElementValue(
        "specStorage",
        specs["Встроенная память"] || ""
    );

    setElementValue(
        "specDisplay",
        specs["Дисплей"] || ""
    );

    setElementValue(
        "specProcessor",
        specs["Процессор"] || ""
    );

    setElementValue(
        "specCamera",
        specs["Фотокамера"] || ""
    );

    setElementValue(
        "specBattery",
        specs["Емкость аккумулятора"] ||
        specs["Ёмкость аккумулятора"] ||
        ""
    );

    setElementValue(
        "specRam",
        specs["Оперативная память"] || ""
    );


    setElementValue(
        "productDisplay",
        product.display || 0
    );

    setElementValue(
        "productWarehouse",
        product.warehouse || 0
    );

    setElementValue(
        "productLdu",
        product.ldu || 0
    );


    setElementValue(
        "productDescription",
        product.description || ""
    );

    setElementValue(
        "productTip",
        product.tip || ""
    );

}


// ======================================================
// SAVE EDIT FROM PRODUCT PAGE
// ======================================================

function saveEditedProductFromPage(
    product
) {

    const category =
        getElementValue(
            "productCategory"
        ).trim();


    const name =
        getElementValue(
            "productName"
        ).trim();


    if (!category) {

        alert(
            "Выберите категорию."
        );

        return;

    }


    if (!name) {

        alert(
            "Введите название товара."
        );

        return;

    }


    const storage =
        getElementValue(
            "specStorage"
        ).trim();


    const displaySpec =
        getElementValue(
            "specDisplay"
        ).trim();


    const processor =
        getElementValue(
            "specProcessor"
        ).trim();


    const camera =
        getElementValue(
            "specCamera"
        ).trim();


    const battery =
        getElementValue(
            "specBattery"
        ).trim();


    const ram =
        getElementValue(
            "specRam"
        ).trim();


    const color =
        getElementValue(
            "productColor"
        ).trim();


    const display =
        Math.max(
            0,
            Number(
                getElementValue(
                    "productDisplay"
                )
            ) || 0
        );


    const warehouse =
        Math.max(
            0,
            Number(
                getElementValue(
                    "productWarehouse"
                )
            ) || 0
        );


    const ldu =
        Math.max(
            0,
            Number(
                getElementValue(
                    "productLdu"
                )
            ) || 0
        );


    const description =
        getElementValue(
            "productDescription"
        ).trim();


    const tip =
        getElementValue(
            "productTip"
        ).trim();


    const specs = {};


    if (storage)
        specs["Встроенная память"] =
            storage;


    if (displaySpec)
        specs["Дисплей"] =
            displaySpec;


    if (processor)
        specs["Процессор"] =
            processor;


    if (camera)
        specs["Фотокамера"] =
            camera;


    if (battery)
        specs["Емкость аккумулятора"] =
            battery;


    if (ram)
        specs["Оперативная память"] =
            ram;


    if (color)
        specs["Цвет"] =
            color;


    specs["LDU"] =
        ldu > 0
            ? `${ldu} шт.`
            : "Нет";


    const memory =
        ram && storage
            ? `${ram} / ${storage}`
            : storage || ram;


    product.name =
        name;

    product.category =
        category;

    product.memory =
        memory;

    product.color =
        color;

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


    saveProductsGlobal();


    closeStandaloneModal();


    window.location.reload();

}


// ======================================================
// CLOSE STANDALONE MODAL
// ======================================================

function closeStandaloneModal() {

    const overlay =
        document.getElementById(
            "productModalOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


// ======================================================
// DELETE PRODUCT
// ======================================================

function deleteProductFromProductPage(
    product
) {

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
                String(product.id)
        );


    if (index === -1) {

        alert(
            "Товар не найден."
        );

        return;

    }


    products.splice(
        index,
        1
    );


    saveProductsGlobal();


    window.location.href =
        "index.html";

}


// ======================================================
// GLOBAL SAVE
// ======================================================

function saveProductsGlobal() {

    const key =
        typeof PRODUCTS_STORAGE_KEY !== "undefined"
            ? PRODUCTS_STORAGE_KEY
            : "xiaomiWebBaseProducts";


    localStorage.setItem(
        key,
        JSON.stringify(products)
    );

}


// ======================================================
// GLOBAL VALUE HELPERS
// ======================================================

function setElementValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

    }

}


function getElementValue(
    id
) {

    const element =
        document.getElementById(id);


    return element
        ? element.value
        : "";

}


// ======================================================
// ESCAPE HTML
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