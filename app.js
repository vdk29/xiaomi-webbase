console.log("APP.JS OK");
console.log("PRODUCTS:", products);


const productsList =
    document.getElementById("productsList");


if (productsList) {

    productsList.innerHTML = "";


    products.forEach(function(product) {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.innerHTML = `

            <div class="product-image">
                Фото товара
            </div>

            <div class="product-card-content">

                <div class="product-category">
                    ${product.category}
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
                        <strong>${product.display}</strong>
                    </div>

                    <div class="stock-row">
                        <span>Склад</span>
                        <strong>${product.warehouse}</strong>
                    </div>

                    <div class="stock-row stock-total">
                        <span>Всего</span>
                        <strong>${product.quantity}</strong>
                    </div>

                </div>

            </div>

        `;


        productsList.appendChild(card);

    });

}