// ======================================================
// XIAOMI WEBBASE
// APP
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const addProductButton =
    document.getElementById("addProductButton");

const productModal =
    document.getElementById("productModal");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");

const modalTitle =
    document.getElementById("modalTitle");

const specsContainer =
    document.getElementById("specsContainer");

const addSpecButton =
    document.getElementById("addSpecButton");

const productImage =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");


// ======================================================
// EDITING
// ======================================================

let editingProductId = null;

let selectedImage = "";


// ======================================================
// OPEN MODAL
// ======================================================

function openProductModal(product = null) {

    if (!productModal) {
        return;
    }


    productModal.classList.add("active");


    if (product) {

        editingProductId = product.id;

        modalTitle.textContent =
            "Редактировать товар";


        fillProductForm(product);

    } else {

        editingProductId = null;

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

    editingProductId = null;

}


// ======================================================
// RESET FORM
// ======================================================

function resetProductForm() {

    if (!productForm) {
        return;
    }


    productForm.reset();


    const displayInput =
        document.getElementById(
            "productDisplay"
        );


    const warehouseInput =
        document.getElementById(
            "productWarehouse"
        );


    const lduInput =
        document.getElementById(
            "productLdu"
        );


    if (displayInput) {
        displayInput.value = 0;
    }


    if (warehouseInput) {
        warehouseInput.value = 0;
    }


    if (lduInput) {
        lduInput.value = 0;
    }


    selectedImage = "";


    if (imagePreview) {

        imagePreview.innerHTML = "";

    }


    if (specsContainer) {

        specsContainer.innerHTML = `

            <div class="spec-input-row">

                <input
                    type="text"
                    class="spec-key"
                    placeholder="Характеристика"
                >

                <input
                    type="text"
                    class="spec-value"
                    placeholder="Значение"
                >

                <button
                    type="button"
                    class="remove-spec-button"
                >
                    ×
                </button>

            </div>

        `;

        attachSpecRemoveButtons();

    }

}


// ======================================================
// FILL FORM
// ======================================================

function fillProductForm(product) {

    resetProductForm();


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
        Number(product.display || 0);


    document.getElementById(
        "productWarehouse"
    ).value =
        Number(product.warehouse || 0);


    document.getElementById(
        "productLdu"
    ).value =
        Number(product.ldu || 0);


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productTip"
    ).value =
        product.tip || "";


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

    }


    if (specsContainer) {

        specsContainer.innerHTML = "";


        if (
            product.specs &&
            Object.keys(product.specs).length
        ) {

            Object.entries(
                product.specs
            ).forEach(
                ([key, value]) => {

                    addSpecRow(
                        key,
                        value
                    );

                }
            );

        } else {

            addSpecRow();

        }

    }

}


// ======================================================
// ADD SPEC ROW
// ======================================================

function addSpecRow(
    key = "",
    value = ""
) {

    if (!specsContainer) {
        return;
    }


    const row =
        document.createElement("div");


    row.className =
        "spec-input-row";


    row.innerHTML = `

        <input
            type="text"
            class="spec-key"
            placeholder="Характеристика"
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


    specsContainer.appendChild(row);


    attachSpecRemoveButtons();

}


// ======================================================
// REMOVE SPEC
// ======================================================

function attachSpecRemoveButtons() {

    const buttons =
        document.querySelectorAll(
            ".remove-spec-button"
        );


    buttons.forEach(
        button => {

            button.onclick = () => {

                const rows =
                    document.querySelectorAll(
                        ".spec-input-row"
                    );


                if (rows.length <= 1) {

                    const key =
                        button.parentElement
                            .querySelector(".spec-key");

                    const value =
                        button.parentElement
                            .querySelector(".spec-value");


                    if (key) {
                        key.value = "";
                    }


                    if (value) {
                        value.value = "";
                    }


                    return;

                }


                button.parentElement.remove();

            };

        }
    );

}


// ======================================================
// ADD SPEC BUTTON
// ======================================================

if (addSpecButton) {

    addSpecButton.addEventListener(
        "click",
        () => {

            addSpecRow();

        }
    );

}


// ======================================================
// IMAGE
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
            // SPECS
            // ==========================================

            const specs = {};


            const rows =
                document.querySelectorAll(
                    ".spec-input-row"
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


                    if (key) {

                        specs[key] =
                            value;

                    }

                }
            );


            // ==========================================
            // PRODUCT OBJECT
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
            // EDIT EXISTING
            // ==========================================

            if (editingProductId !== null) {

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
            // ADD NEW
            // ==========================================

            else {

                const newProduct = {

                    id:
                        Date.now(),

                    ...productData

                };


                products.push(
                    newProduct
                );

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
            // REFRESH
            // ==========================================

            renderProducts(
                products
            );

        }
    );

}


// ======================================================
// OPEN ADD PRODUCT
// ======================================================

if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

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

if (productModal) {

    const overlay =
        productModal.querySelector(
            ".modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            () => {

                closeProductModal();

            }
        );

    }

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
// DELETE PRODUCT
// ======================================================

function deleteProduct(productId) {

    const index =
        products.findIndex(
            product =>
                product.id === productId
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


    renderProducts(
        products
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

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
// MAKE DELETE / EDIT AVAILABLE GLOBALLY
// ======================================================

window.openProductModal =
    openProductModal;


window.deleteProduct =
    deleteProduct;