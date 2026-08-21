const products = [
    {
        id: 1,
        name: "Redmi Note 15",
        memory: "8 / 256 GB",
        color: "Чёрный",
        display: 1,
        warehouse: 2
    },
    {
        id: 2,
        name: "Xiaomi 15",
        memory: "12 / 256 GB",
        color: "Белый",
        display: 1,
        warehouse: 0
    },
    {
        id: 3,
        name: "Redmi Pad 2",
        memory: "8 / 256 GB",
        color: "Серый",
        display: 0,
        warehouse: 3
    }
];


const productsList = document.getElementById("productsList");


function renderProducts(productsToRender) {

    productsList.innerHTML = "";

    if (productsToRender.length === 0) {

        productsList.innerHTML = `
            <p style="color: #777;">
                Товары не найдены
            </p>
        `;

        return;
    }


    productsToRender.forEach(product => {

        const total =
            product.display +
            product.warehouse;


        const card = document.createElement("div");

        card.className = "product-card";


        card.innerHTML = `

            <div class="product-image">
                Фото товара
            </div>

            <div class="product-name">
                ${product.name}
            </div>

            <div class="product-info">
                ${product.memory} · ${product.color}
            </div>

            <div class="stock">

                <div class="stock-row">
                    <span>Витрина</span>
                    <span>${product.display}</span>
                </div>

                <div class="stock-row">
                    <span>Склад</span>
                    <span>${product.warehouse}</span>
                </div>

                <div class="stock-row stock-total">
                    <span>Всего</span>
                    <span>${total}</span>
                </div>

            </div>
        `;


        productsList.appendChild(card);

    });
}


renderProducts(products);