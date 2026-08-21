const products = [
    {
        id: 1,
        name: "Redmi Note 15",
        category: "Смартфоны",
        memory: "8 / 256 GB",
        color: "Чёрный",
        display: 1,
        warehouse: 2
    },
    {
        id: 2,
        name: "Xiaomi 15",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Белый",
        display: 1,
        warehouse: 0
    },
    {
        id: 3,
        name: "Redmi Pad 2",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Серый",
        display: 0,
        warehouse: 3
    }
];


const productsList = document.getElementById("productsList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");


function renderProducts(productsToRender) {

    productsList.innerHTML = "";

    if (productsToRender.length === 0) {

        productsList.innerHTML = `
            <div class="empty-result">
                <strong>Ничего не найдено</strong>
                <p>Попробуйте изменить запрос</p>
            </div>
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


/* ПОИСК */

function searchProducts() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (query === "") {

        renderProducts(products);

        return;
    }


    const results = products.filter(product => {

        const searchText = `
            ${product.name}
            ${product.category}
            ${product.memory}
            ${product.color}
        `.toLowerCase();


        return searchText.includes(query);

    });


    renderProducts(results);
}


/* КНОПКА ПОИСКА */

searchButton.addEventListener("click", searchProducts);


/* ПОИСК ПРИ НАЖАТИИ ENTER */

searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        searchProducts();
    }

});


/* ПОИСК В РЕАЛЬНОМ ВРЕМЕНИ */

searchInput.addEventListener("input", searchProducts);


/* ПЕРВОНАЧАЛЬНЫЙ ВЫВОД */

renderProducts(products);