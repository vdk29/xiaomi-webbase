// ======================================================
// XIAOMI WEBBASE
// APP.JS
// ======================================================


// ======================================================
// ЗАПУСК
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
// АВТОЗАГРУЗКА PRODUCTS-DATA
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
// ОСНОВНОЕ ПРИЛОЖЕНИЕ
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
    // STORAGE
    // ==================================================

    const STORAGE_KEY =
        typeof PRODUCTS_STORAGE_KEY !== "undefined"
            ? PRODUCTS_STORAGE_KEY
            : "xiaomiWebBaseProducts";


    // ==================================================
    // СТИЛИ ДЛЯ НОВОГО ИНТЕРФЕЙСА
    // ==================================================

    function injectAppStyles() {

        if (
            document.getElementById(
                "xiaomiAppStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "xiaomiAppStyles";


        style.textContent = `

            /* ==========================================
               КНОПКА ДОБАВЛЕНИЯ
               ========================================== */

            #addProductButton,
            .add-product-button {

                display: inline-flex !important;

                align-items: center !important;

                justify-content: center !important;

                width: auto !important;

                min-width: 0 !important;

                max-width: 280px !important;

                height: 42px !important;

                padding: 0 16px !important;

                margin: 12px 0 !important;

                border-radius: 12px !important;

                font-size: 14px !important;

                font-weight: 600 !important;

                line-height: 1 !important;

                cursor: pointer !important;

                position: relative !important;

                z-index: 5 !important;

            }


            /* ==========================================
               MODAL
               ========================================== */

            #productModalOverlay {

                position: fixed !important;

                inset: 0 !important;

                width: 100vw !important;

                height: 100vh !important;

                z-index: 999999 !important;

                display: none !important;

                align-items: center !important;

                justify-content: center !important;

                padding: 20px !important;

                box-sizing: border-box !important;

                background:
                    rgba(0, 0, 0, 0.68) !important;

                overflow-y: auto !important;

            }


            #productModalOverlay.active {

                display: flex !important;

            }


            #productModal {

                position: relative !important;

                z-index: 1000000 !important;

                width: min(
                    720px,
                    calc(100vw - 30px)
                ) !important;

                max-height: calc(
                    100vh - 40px
                ) !important;

                overflow-y: auto !important;

                margin: auto !important;

                box-sizing: border-box !important;

                background: #111 !important;

                color: #fff !important;

                border-radius: 18px !important;

                border: 1px solid
                    rgba(255,255,255,.10) !important;

                box-shadow:
                    0 30px 100px
                    rgba(0,0,0,.65) !important;

                pointer-events: auto !important;

            }


            #productModal .modal-header {

                position: sticky !important;

                top: 0 !important;

                z-index: 20 !important;

                display: flex !important;

                align-items: center !important;

                justify-content: space-between !important;

                padding: 18px 20px !important;

                background: #111 !important;

                border-bottom: 1px solid
                    rgba(255,255,255,.08) !important;

            }


            #productModal .modal-header h2 {

                margin: 0 !important;

                font-size: 20px !important;

            }


            /* ==========================================
               КРЕСТИК
               ========================================== */

            #closeProductModal {

                appearance: none !important;

                -webkit-appearance: none !important;

                border: 0 !important;

                outline: none !important;

                width: 38px !important;

                height: 38px !important;

                min-width: 38px !important;

                padding: 0 !important;

                margin: 0 !important;

                display: flex !important;

                align-items: center !important;

                justify-content: center !important;

                border-radius: 50% !important;

                background:
                    rgba(255,255,255,.08) !important;

                color: #fff !important;

                font-size: 25px !important;

                line-height: 1 !important;

                cursor: pointer !important;

                pointer-events: auto !important;

                position: relative !important;

                z-index: 1000001 !important;

            }


            #closeProductModal:hover {

                background:
                    rgba(255,255,255,.16) !important;

            }


            /* ==========================================
               FORM
               ========================================== */

            #productForm {

                padding: 20px !important;

                box-sizing: border-box !important;

            }


            #productForm input,
            #productForm select,
            #productForm textarea {

                width: 100% !important;

                box-sizing: border-box !important;

            }


            #productForm textarea {

                min-height: 90px !important;

                resize: vertical !important;

            }


            .characteristics {

                margin-top: 20px !important;

                padding: 16px !important;

                border-radius: 14px !important;

                background:
                    rgba(255,255,255,.04) !important;

                border: 1px solid
                    rgba(255,255,255,.07) !important;

            }


            .characteristics-title {

                margin-bottom: 15px !important;

                font-size: 16px !important;

                font-weight: 700 !important;

            }


            .characteristics-grid {

                display: grid !important;

                grid-template-columns:
                    repeat(2, minmax(0, 1fr)) !important;

                gap: 12px !important;

            }


            .stock-form {

                display: grid !important;

                grid-template-columns:
                    repeat(2, minmax(0, 1fr)) !important;

                gap: 12px !important;

            }


            .form-actions {

                display: flex !important;

                gap: 10px !important;

                margin-top: 20px !important;

            }


            .form-actions button {

                flex: 1 !important;

                min-height: 46px !important;

                cursor: pointer !important;

            }


            .photo-preview {

                display: none !important;

                margin-top: 12px !important;

                text-align: center !important;

            }


            .photo-preview.active {

                display: block !important;

            }


            .photo-preview img {

                max-width: 220px !important;

                max-height: 220px !important;

                object-fit: contain !important;

                border-radius: 12px !important;

            }


            /* ==========================================
               MOBILE
               ========================================== */

            @media (max-width: 600px) {

                #productModalOverlay {

                    padding: 10px !important;

                    align-items: flex-start !important;

                }


                #productModal {

                    width: 100% !important;

                    max-height:
                        calc(100vh - 20px) !important;

                    margin-top: 10px !important;

                    border-radius: 16px !important;

                }


                .characteristics-grid,
                .stock-form {

                    grid-template-columns:
                        1fr !important;

                }


                #productForm {

                    padding: 16px !important;

                }


                #productModal .modal-header {

                    padding: 15px 16px !important;

                }


                .form-actions {

                    flex-direction: column !important;

                }


                #addProductButton,
                .add-product-button {

                    height: 40px !important;

                    max-width: 250px !important;

                    font-size: 13px !important;

                    padding: 0 14px !important;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    injectAppStyles();


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

        }

    }


    // ==================================================
    // УБРАТЬ СЕРУЮ КНОПКУ "ДОПЛАТИТЬ ТОВАР"
    // ==================================================

    function removePayButton() {

        const allButtons =
            document.querySelectorAll(
                "button, a, div"
            );


        allButtons.forEach(
            element => {

                const text =
                    (
                        element.textContent ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    text === "доплатить товар" ||
                    text === "доплатить товар +" ||
                    text === "доплатить"
                ) {

                    element.remove();

                }

            }
        );

    }


    // ==================================================
    // MODAL
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
                id="productModal"
                role="dialog"
                aria-modal="true"
            >

                <div class="modal-header">

                    <h2 id="modalTitle">
                        Добавить товар
                    </h2>

                    <button
                        type="button"
                        class="modal-close"
                        id="closeProductModal"
                        aria-label="Закрыть"
                    >
                        ×
                    </button>

                </div>


                <form
                    class="product-form"
                    id="productForm"
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
                                    placeholder="128 GB"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Дисплей
                                </label>

                                <input
                                    type="text"
                                    id="specDisplay"
                                    placeholder="6.67 AMOLED"
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
                                    placeholder="50 MP + 50 MP"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Емкость аккумулятора
                                </label>

                                <input
                                    type="text"
                                    id="specBattery"
                                    placeholder="5000 mAh"
                                >

                            </div>


                            <div class="form-group">

                                <label>
                                    Оперативная память
                                </label>

                                <input
                                    type="text"
                                    id="specRam"
                                    placeholder="12 GB"
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

                    </div>


                    <!-- LDU -->

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


                    <!-- ОПИСАНИЕ -->

                    <div class="form-group">

                        <label>
                            Краткое описание
                        </label>

                        <textarea
                            id="productDescription"
                            placeholder="Краткое описание товара..."
                        ></textarea>

                    </div>


                    <!-- ПОДСКАЗКА -->

                    <div class="form-group">

                        <label>
                            Подсказка продавцу
                        </label>

                        <textarea
                            id="productTip"
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

                            <div
                                class="photo-preview"
                                id="photoPreview"
                            >

                                <img
                                    id="photoPreviewImage"
                                    src=""
                                    alt="Предпросмотр"
                                >

                            </div>

                        </div>

                    </div>


                    <!-- ACTIONS -->

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


        /*
         * ВАЖНО:
         * Добавляем modal прямо в BODY,
         * а не внутрь какого-либо блока сайта.
         * Поэтому он всегда поверх интерфейса.
         */

        document.body.appendChild(
            overlay
        );


        setupModalEvents();

    }


    // ==================================================
    // MODAL EVENTS
    // ==================================================

    function setupModalEvents() {

        const overlay =
            document.getElementById(
                "productModalOverlay"
            );


        const modal =
            document.getElementById(
                "productModal"
            );


        const closeButton =
            document.getElementById(
                "closeProductModal"
            );


        const cancelButton =
            document.getElementById(
                "cancelProductModal"
            );


        const form =
            document.getElementById(
                "productForm"
            );


        const photoInput =
            document.getElementById(
                "productPhoto"
            );


        // ----------------------------------------------
        // КРЕСТИК
        // ----------------------------------------------

        if (closeButton) {

            closeButton.onclick =
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    closeProductModal();

                };

        }


        // ----------------------------------------------
        // ОТМЕНА
        // ----------------------------------------------

        if (cancelButton) {

            cancelButton.onclick =
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    closeProductModal();

                };

        }


        // ----------------------------------------------
        // КЛИК ПО ФОНУ
        // ----------------------------------------------

        if (overlay) {

            overlay.onclick =
                function(event) {

                    if (
                        event.target === overlay
                    ) {

                        closeProductModal();

                    }

                };

        }


        // ----------------------------------------------
        // НЕ ЗАКРЫВАЕМ ОКНО ПРИ КЛИКЕ ВНУТРИ
        // ----------------------------------------------

        if (modal) {

            modal.onclick =
                function(event) {

                    event.stopPropagation();

                };

        }


        // ----------------------------------------------
        // ESC
        // ----------------------------------------------

        if (
            !window.__xiaomiModalKeyHandler
        ) {

            window.__xiaomiModalKeyHandler =
                function(event) {

                    if (
                        event.key === "Escape"
                    ) {

                        closeProductModal();

                    }

                };


            document.addEventListener(
                "keydown",
                window.__xiaomiModalKeyHandler
            );

        }


        // ----------------------------------------------
        // FORM
        // ----------------------------------------------

        if (form) {

            form.onsubmit =
                saveProductFromForm;

        }


        // ----------------------------------------------
        // PHOTO
        // ----------------------------------------------

        if (photoInput) {

            photoInput.onchange =
                handlePhoto;

        }

    }


    // ==================================================
    // MODAL STATE
    // ==================================================

    let editingProductId =
        null;


    let currentPhoto =
        "";


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


        const title =
            document.getElementById(
                "modalTitle"
            );


        const form =
            document.getElementById(
                "productForm"
            );


        if (
            !overlay ||
            !form
        ) {

            console.error(
                "Не удалось открыть форму товара."
            );

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


        title.textContent =
            product
                ? "Редактировать товар"
                : "Добавить товар";


        // ----------------------------------------------
        // CATEGORY
        // ----------------------------------------------

        document.getElementById(
            "productCategory"
        ).value =
            product
                ? product.category || ""
                : "";


        // ----------------------------------------------
        // NAME
        // ----------------------------------------------

        document.getElementById(
            "productName"
        ).value =
            product
                ? product.name || ""
                : "";


        // ----------------------------------------------
        // COLOR
        // ----------------------------------------------

        document.getElementById(
            "productColor"
        ).value =
            product
                ? product.color || ""
                : "";


        // ----------------------------------------------
        // SPECS
        // ----------------------------------------------

        const specs =
            product &&
            product.specs
                ? product.specs
                : {};


        document.getElementById(
            "specStorage"
        ).value =
            specs["Встроенная память"] ||
            product?.memory ||
            "";


        document.getElementById(
            "specDisplay"
        ).value =
            specs["Дисплей"] ||
            "";


        document.getElementById(
            "specProcessor"
        ).value =
            specs["Процессор"] ||
            "";


        document.getElementById(
            "specCamera"
        ).value =
            specs["Фотокамера"] ||
            "";


        document.getElementById(
            "specBattery"
        ).value =
            specs["Емкость аккумулятора"] ||
            "";


        document.getElementById(
            "specRam"
        ).value =
            specs["Оперативная память"] ||
            "";


        // ----------------------------------------------
        // STOCK
        // ----------------------------------------------

        document.getElementById(
            "productDisplay"
        ).value =
            product
                ? Number(
                    product.display || 0
                )
                : 0;


        document.getElementById(
            "productWarehouse"
        ).value =
            product
                ? Number(
                    product.warehouse || 0
                )
                : 0;


        document.getElementById(
            "productLdu"
        ).value =
            product
                ? Number(
                    product.ldu || 0
                )
                : 0;


        // ----------------------------------------------
        // DESCRIPTION
        // ----------------------------------------------

        document.getElementById(
            "productDescription"
        ).value =
            product
                ? product.description || ""
                : "";


        // ----------------------------------------------
        // TIP
        // ----------------------------------------------

        document.getElementById(
            "productTip"
        ).value =
            product
                ? product.tip || ""
                : "";


        // ----------------------------------------------
        // PHOTO
        // ----------------------------------------------

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


        // ----------------------------------------------
        // OPEN
        // ----------------------------------------------

        overlay.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";


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


        const form =
            document.getElementById(
                "productForm"
            );


        if (form) {

            form.reset();

        }


        const preview =
            document.getElementById(
                "photoPreview"
            );


        const previewImage =
            document.getElementById(
                "photoPreviewImage"
            );


        if (preview) {

            preview.classList.remove(
                "active"
            );

        }


        if (previewImage) {

            previewImage.src =
                "";

        }

    }


    // ==================================================
    // PHOTO
    // ==================================================

    function handlePhoto(
        event
    ) {

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


                const previewImage =
                    document.getElementById(
                        "photoPreviewImage"
                    );


                if (
                    preview &&
                    previewImage
                ) {

                    previewImage.src =
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


        const wasEditing =
            editingProductId !== null;


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
                "Выберите категорию товара."
            );

            return;

        }


        if (!name) {

            alert(
                "Введите название товара."
            );

            return;

        }


        // ----------------------------------------------
        // CHARACTERISTICS
        // ----------------------------------------------

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


        // ----------------------------------------------
        // STOCK
        // ----------------------------------------------

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


        const quantity =
            display +
            warehouse;


        // ----------------------------------------------
        // DESCRIPTION
        // ----------------------------------------------

        const description =
            document.getElementById(
                "productDescription"
            ).value.trim();


        // ----------------------------------------------
        // TIP
        // ----------------------------------------------

        const tip =
            document.getElementById(
                "productTip"
            ).value.trim();


        // ----------------------------------------------
        // SPECS
        // ----------------------------------------------

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


        // ----------------------------------------------
        // MEMORY
        // ----------------------------------------------

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


        // ----------------------------------------------
        // EDIT
        // ----------------------------------------------

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
                    "Товар для редактирования не найден."
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


            product.ldu =
                ldu;


            product.display =
                display;


            product.warehouse =
                warehouse;


            product.description =
                description;


            product.specs =
                specs;


            product.tip =
                tip;


            if (currentPhoto) {

                product.image =
                    currentPhoto;

            }

        }


        // ----------------------------------------------
        // CREATE
        // ----------------------------------------------

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

                ldu:
                    ldu,

                display:
                    display,

                warehouse:
                    warehouse,

                description:
                    description ||
                    `${name}.`,

                specs:
                    specs,

                tip:
                    tip ||
                    "Подсказка пока не добавлена."

            };


            if (currentPhoto) {

                newProduct.image =
                    currentPhoto;

            }


            products.push(
                newProduct
            );

        }


        // ----------------------------------------------
        // SAVE
        // ----------------------------------------------

        saveProducts();


        closeProductModal();


        // ----------------------------------------------
        // REFRESH
        // ----------------------------------------------

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

        let maxId =
            0;


        products.forEach(
            product => {

                const id =
                    Number(
                        product.id
                    ) || 0;


                if (
                    id >
                    maxId
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

        let button =
            document.getElementById(
                "addProductButton"
            );


        if (!button) {

            button =
                document.querySelector(
                    ".add-product-button"
                );

        }


        if (!button) {

            button =
                document.createElement(
                    "button"
                );


            button.id =
                "addProductButton";


            button.className =
                "add-product-button";


            button.type =
                "button";


            button.textContent =
                "＋ Добавить товар";


            const searchSection =
                document.querySelector(
                    ".search-section"
                );


            if (searchSection) {

                /*
                 * Кнопка теперь находится
                 * непосредственно после поиска,
                 * а не огромным отдельным блоком.
                 */

                searchSection.after(
                    button
                );

            } else if (productsList) {

                productsList.before(
                    button
                );

            } else {

                document.body.prepend(
                    button
                );

            }

        }


        /*
         * Удаляем старые обработчики.
         */

        const newButton =
            button.cloneNode(true);


        button.replaceWith(
            newButton
        );


        newButton.id =
            "addProductButton";


        newButton.className =
            "add-product-button";


        newButton.type =
            "button";


        newButton.textContent =
            "＋ Добавить товар";


        newButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                openProductModal();

            };

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


        if (
            index !== -1
        ) {

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


        if (productsList) {

            renderProducts(
                products
            );

        }

    }


    // ==================================================
    // PRODUCT LIST
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
                            `product.html?id=${product.id}`;

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


        if (
            query === ""
        ) {

            renderProducts(
                products
            );

            return;

        }


        const results =
            products.filter(
                product => {

                    const searchText = `

                        ${product.name || ""}

                        ${product.category || ""}

                        ${product.memory || ""}

                        ${product.color || ""}

                        ${product.description || ""}

                        ${product.tip || ""}

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
    // ENTER
    // ==================================================

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


    // ==================================================
    // LIVE SEARCH
    // ==================================================

    if (searchInput) {

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

            editButton.onclick =
                function(event) {

                    event.preventDefault();

                    openProductModal(
                        product
                    );

                };

        }


        // ----------------------------------------------
        // DELETE
        // ----------------------------------------------

        const deleteButton =
            document.getElementById(
                "deleteProductButton"
            );


        if (deleteButton) {

            deleteButton.onclick =
                function(event) {

                    event.preventDefault();

                    deleteProduct(
                        product.id
                    );

                };

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

                button.onclick =
                    function() {

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

                    };

            }
        );

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
    // START
    // ==================================================

    createProductModal();


    createAddButton();


    removePayButton();


    if (productsList) {

        renderProducts(
            products
        );

    }


    if (productDetails) {

        renderProductPage();

    }

}