console.log("================================");
console.log("APP.JS РАБОТАЕТ");
console.log("products:", products);
console.log("================================");


const productsList =
    document.getElementById("productsList");


if (productsList) {

    productsList.innerHTML = `

        <div style="
            padding: 30px;
            margin: 20px;
            background: white;
            color: black;
            border: 3px solid orange;
            border-radius: 15px;
            font-size: 20px;
        ">

            <h2>
                ТЕСТОВЫЙ ТОВАР
            </h2>

            <p>
                ${products[0].name}
            </p>

            <p>
                ${products[0].memory}
            </p>

            <p>
                Цвет: ${products[0].color}
            </p>

            <p>
                Витрина: ${products[0].display}
            </p>

            <p>
                Склад: ${products[0].warehouse}
            </p>

            <p>
                Всего: ${products[0].quantity}
            </p>

        </div>

    `;

}