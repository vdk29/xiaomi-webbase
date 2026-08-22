// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================


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


// ======================================================
// APP
// ======================================================

function initApp() {


    // ==================================================
    // STORAGE
    // ==================================================

    const STORAGE_KEY =
        typeof PRODUCTS_STORAGE_KEY !== "undefined"
            ? PRODUCTS_STORAGE_KEY
            : "xiaomiWebBaseProducts";


    function saveProducts() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );

    }


    // ==================================================
    // STATE
    // ==================================================

    let editingProductId = null;

    let currentPhoto = "";


    // ==================================================
    // GET ELEMENTS
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

    const categoryButtons =
        document.querySelectorAll(
            ".category-button"
        );


    // ==================================================
    // ADD BUTTON
    // ==================================================

    function ensureAddButton() {

        let addButton =
            document.getElementById(
                "openAddProductButton"
            );


        if (!addButton) {

            addButton =
                document.getElementById(
                    "addProductButton"
                );

        }


        if (!addButton) {

            const headerContainer =
                document.querySelector(
                    ".header-container"
                );


            if (headerContainer) {

                addButton =
                    document.createElement(
                        "button"
                    );


                addButton.type =
                    "button";


                addButton.id =
                    "openAddProductButton";


                addButton.className =
                    "header-add-button";


                addButton.textContent =
                    "+ Добавить товар";


                headerContainer.appendChild(
                    addButton
                );

            }

        }


        if (addButton) {

            addButton.onclick =
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    openProductModal();

                };

        }

    }


    // ==================================================
    // CREATE MODAL
    // ==================================================

    function createProductModal() {

        if (
            document.getElementById(
                "productModalOverlay"
            )
        ) {

            return;

        }


        const overlay =
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
                id="dynamicProductModal"
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


                    <!-- ОСНОВНАЯ ИНФОРМАЦИЯ -->

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



                    <!-- ХАРАКТЕРИСТИКИ -->

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



                    <!-- НАЛИЧИЕ -->

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
                                LDU / демонстрационные экземпляры
                            </label>

                            <input
                                type="number"
                                id="productLdu"
                                min="0"
                                value="0"
                            >

                        </div>

                    </div>



                    <!-- ОПИСАНИЕ -->

                    <div class="form-group">

                        <label>
                            Краткое описание
                        </label>

                        <textarea
                            id="productDescription"
                            rows="4"
                            placeholder="Краткая информация о товаре..."
                        ></textarea>

                    </div>



                    <!-- ПОДСКАЗКА -->

                    <div class="form-group">

                        <label>
                            Подсказка продавцу
                        </label>

                        <textarea
                            id="productTip"
                            rows="4"
                            placeholder="Подсказка продавцу..."
                        ></textarea>

                    </div>



                    <!-- ФОТО -->

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



                    <!-- КНОПКИ -->

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


        // ==================================================
        // CLOSE
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
            function (event) {

                if (
                    event.target ===
                    overlay
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

            return;

        }


        editingProductId =
            product
                ? product.id
                : null;


        currentPhoto =
            product &&
            product.image
                ? product.image
                : "";


        // ==================================================
        // TITLE
        // ==================================================

        const modalTitle =
            document.getElementById(
                "modalTitle"
            );


        if (modalTitle) {

            modalTitle.textContent =
                product
                    ? "Редактировать товар"
                    : "Добавить товар";

        }


        // ==================================================
        // VALUES
        // ==================================================

        document.getElementById(
            "productCategory"
        ).value =
            product?.category || "";


        document.getElementById(
            "productName"
        ).value =
            product?.name || "";


        document.getElementById(
            "productColor"
        ).value =
            product?.color || "";


        const specs =
            product?.specs || {};


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
            specs["Емкость аккумулятора"] ||
            specs["Ёмкость аккумулятора"] ||
            "";


        document.getElementById(
            "specRam"
        ).value =
            specs["Оперативная память"] || "";


        document.getElementById(
            "productDisplay"
        ).value =
            product?.display || 0;


        document.getElementById(
            "productWarehouse"
        ).value =
            product?.warehouse || 0;


        document.getElementById(
            "productLdu"
        ).value =
            product?.ldu || 0;


        document.getElementById(
            "productDescription"
        ).value =
            product?.description || "";


        document.getElementById(
            "productTip"
        ).value =
            product?.tip || "";


        // ==================================================
        // PHOTO
        // ==================================================

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

        } else {

            if (previewImage) {

                previewImage.src =
                    "";

            }

            if (preview) {

                preview.classList.remove(
                    "active"
                );

            }

        }


        // ==================================================
        // OPEN
        // ==================================================

        overlay.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            function () {

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
        function (event) {

            if (
                event.key ===
                "Escape"
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
            function (event) {

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
            document.getElementById(
                "productCategory"
            ).value.trim();


        const name =
            document.getElementById(
                "productName"
            ).value.trim();


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
            document.getElementById(
                "specStorage"
            ).value.trim();


        const displaySpec =
            document.getElementById(
                "specDisplay"
            ).value.trim();


        const processor =
            document.getElementById(
                "specProcessor"
            ).value.trim();


        const camera =
            document.getElementById(
                "specCamera"
            ).value.trim();


        const battery =
            document.getElementById(
                "specBattery"
            ).value.trim();


        const ram =
            document.getElementById(
                "specRam"
            ).value.trim();


        const color =
            document.getElementById(
                "productColor"
            ).value.trim();


        const display =
            Math.max(
                0,
                Number(
                    document.getElementById(
                        "productDisplay"
                    ).value
                ) || 0
            );


        const warehouse =
            Math.max(
                0,
                Number(
                    document.getElementById(
                        "productWarehouse"
                    ).value
                ) || 0
            );


        const ldu =
            Math.max(
                0,
                Number(
                    document.getElementById(
                        "productLdu"
                    ).value
                ) || 0
            );


        const description =
            document.getElementById(
                "productDescription"
            ).value.trim();


        const tip =
            document.getElementById(
                "productTip"
            ).value.trim();


        // ==================================================
        // SPECS
        // ==================================================

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


        specs["LDU"] =
            ldu > 0
                ? `${ldu} шт.`
                : "Нет";


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

        } else {

            memory =
                storage ||
                ram;

        }


        // ==================================================
        // EDIT EXISTING
        // ==================================================

        if (
            editingProductId !== null
        ) {

            const product =
                products.find(
                    item =>
                        Number(item.id) ===
                        Number(editingProductId)
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
        // CREATE NEW
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


        // ==================================================
        // SAVE
        // ==================================================

        saveProducts();


        closeProductModal();


        // ==================================================
        // CURRENT PAGE
        // ==================================================

        if (
            document.getElementById(
                "productDetails"
            )
        ) {

            renderProductPage();

        } else {

            renderProducts(
                products
            );

        }

    }


    // ==================================================
    // GENERATE ID
    // ==================================================

    function generateProductId() {

        let maxId = 0;


        products.forEach(
            function (product) {

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
    // DELETE PRODUCT
    // ==================================================

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


        if (
            index === -1
        ) {

            return;

        }


        products.splice(
            index,
            1
        );


        saveProducts();


        window.location.href =
            "index.html";

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
            function (product) {

                const display =
                    Number(
                        product.display ||
                        0
                    );


                const warehouse =
                    Number(
                        product.warehouse ||
                        0
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
                    function () {

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
                function (product) {

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
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    searchProducts();

                }

            };

    }


    // ==================================================
    // CATEGORIES
    // ==================================================

    categoryButtons.forEach(
        function (button) {

            button.onclick =
                function () {

                    categoryButtons.forEach(
                        function (item) {

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
                        category ===
                        "Все"
                    ) {

                        renderProducts(
                            products
                        );

                        return;

                    }


                    renderProducts(
                        products.filter(
                            function (product) {

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
    // PRODUCT PAGE
    // ==================================================

    function renderProductPage() {

        const productDetails =
            document.getElementById(
                "productDetails"
            );


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


        const display =
            Number(
                product.display ||
                0
            );


        const warehouse =
            Number(
                product.warehouse ||
                0
            );


        const total =
            display +
            warehouse;


        const specs =
            product.specs ||
            {};


        productDetails.innerHTML = `

            <div class="product-page">


                <!-- IMAGE -->

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



                <!-- CONTENT -->

                <div class="product-page-content">


                    <div class="product-category">

                        ${escapeHTML(
                            product.category ||
                            ""
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
                                    ${escapeHTML(
                                        product.color
                                    )}

                                </div>

                              `

                            : ""
                    }



                    <!-- ACTIONS -->

                    <div
                        class="product-page-actions"
                        style="
                            display:flex;
                            gap:10px;
                            margin-bottom:25px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            type="button"
                            id="editProductButton"
                            class="form-button save"
                        >
                            Редактировать товар
                        </button>


                        <button
                            type="button"
                            id="deleteProductButton"
                            class="delete-product-button"
                        >
                            Удалить товар
                        </button>

                    </div>



                    <!-- STOCK -->

                    <div class="product-stock">

                        <h2>
                            Наличие
                        </h2>


                        <div class="stock-big-row">

                            <span>
                                На витрине
                            </span>

                            <strong>
                                ${display} шт.
                            </strong>

                        </div>


                        <div class="stock-big-row">

                            <span>
                                На складе
                            </span>

                            <strong>
                                ${warehouse} шт.
                            </strong>

                        </div>


                        <div class="stock-big-row total">

                            <span>
                                Всего
                            </span>

                            <strong>
                                ${total} шт.
                            </strong>

                        </div>


                        <div class="stock-big-row">

                            <span>
                                LDU
                            </span>

                            <strong>

                                ${
                                    Number(
                                        product.ldu ||
                                        0
                                    ) > 0

                                        ? `${Number(
                                            product.ldu
                                        )} шт.`

                                        : "Нет"
                                }

                            </strong>

                        </div>

                    </div>



                    <!-- DESCRIPTION -->

                    ${
                        product.description

                            ? `

                                <div class="product-description">

                                    <h2>
                                        Описание
                                    </h2>

                                    <p>

                                        ${escapeHTML(
                                            product.description
                                        )}

                                    </p>

                                </div>

                              `

                            : ""
                    }



                    <!-- SPECS -->

                    ${
                        Object.keys(
                            specs
                        ).length > 0

                            ? `

                                <div class="product-specs">

                                    <h2>
                                        Характеристики
                                    </h2>


                                    ${
                                        Object.entries(
                                            specs
                                        )
                                        .map(
                                            function (
                                                [key, value]
                                            ) {

                                                return `

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

                                                `;

                                            }
                                        )
                                        .join("")
                                    }

                                </div>

                              `

                            : ""
                    }



                    <!-- SELLER TIP -->

                    ${
                        product.tip

                            ? `

                                <div class="product-tip">

                                    <h2>
                                        Подсказка продавцу
                                    </h2>

                                    <p>

                                        ${escapeHTML(
                                            product.tip
                                        )}

                                    </p>

                                </div>

                              `

                            : ""
                    }


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
                function () {

                    openProductModal(
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
                function () {

                    deleteProduct(
                        product.id
                    );

                };

        }

    }


    // ==================================================
    // CREATE MODAL
    // ==================================================

    createProductModal();


    // ==================================================
    // ADD BUTTON
    // ==================================================

    ensureAddButton();


    // ==================================================
    // RENDER
    // ==================================================

    if (
        document.getElementById(
            "productDetails"
        )
    ) {

        renderProductPage();

    } else {

        renderProducts(
            products
        );

    }

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