// ======================================================
// XIAOMI WEBBASE
// PRODUCTS-DATA.JS
// ======================================================
// ВРЕМЕННАЯ ТЕСТОВАЯ БАЗА
//
// Сейчас используется ОДИН товар.
// LocalStorage специально НЕ используется.
//
// На следующем этапе сюда подключим
// импорт таблицы 1С.
// ======================================================


// ======================================================
// ВЕРСИЯ
// ======================================================

const PRODUCTS_DATABASE_VERSION =
    "2026-08-23-test-1";


// ======================================================
// ТЕСТОВЫЙ ТОВАР
// ======================================================

const products = [

    {

        id: 1001,

        name: "Xiaomi 17",

        category: "Смартфоны",

        memory: "12 / 256 GB",

        color: "Black",


        // Остатки

        quantity: 3,

        display: 1,

        warehouse: 2,

        ldu: 1,


        // Описание

        description:
            "Тестовый товар Xiaomi 17. " +
            "Этот товар используется для настройки системы " +
            "перед подключением загрузки таблицы 1С.",


        // Характеристики

        specs: {

            "Память":
                "12 / 256 GB",

            "Цвет":
                "Black",

            "Витрина":
                "1 шт.",

            "Склад":
                "2 шт.",

            "LDU":
                "1 шт."

        },


        // Подсказка продавцу

        tip:
            "Тестовая карточка товара."

    }

];


// ======================================================
// НОРМАЛИЗАЦИЯ ЧИСЕЛ
// ======================================================

function normalizeNumber(value) {

    const result =
        Number(value);


    if (
        Number.isFinite(result)
    ) {

        return result;

    }


    return 0;

}


// ======================================================
// НОРМАЛИЗАЦИЯ ТОВАРА
// ======================================================
//
// Эта функция будет использоваться,
// когда подключим таблицу 1С.
// ======================================================

function normalizeProduct(
    product,
    index = 0
) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    const display =
        normalizeNumber(
            product.display
        );


    const warehouse =
        normalizeNumber(
            product.warehouse
        );


    return {

        id:
            product.id ??
            Date.now() +
            index,


        name:
            product.name ??
            "Без названия",


        category:
            product.category ??
            "Без категории",


        memory:
            product.memory ??
            "",


        color:
            product.color ??
            "",


        quantity:
            display +
            warehouse,


        display:
            display,


        warehouse:
            warehouse,


        ldu:
            normalizeNumber(
                product.ldu
            ),


        description:
            product.description ??
            "",


        specs:
            product.specs &&
            typeof product.specs === "object"

                ? product.specs

                : {},


        tip:
            product.tip ??
            ""

    };

}


// ======================================================
// НОРМАЛИЗАЦИЯ МАССИВА
// ======================================================

function normalizeProducts(
    list
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    return list

        .map(
            (
                product,
                index
            ) => {

                return normalizeProduct(
                    product,
                    index
                );

            }
        )

        .filter(
            product => {

                return (
                    product !== null
                );

            }
        );

}


// ======================================================
// ЗАМЕНА БАЗЫ
// ======================================================
//
// ЭТО БУДЕТ НУЖНО ДЛЯ ИМПОРТА 1С.
//
// Когда загрузим таблицу:
//
// replaceProducts(товарыИзТаблицы);
//
// ======================================================

function replaceProducts(
    newProducts
) {

    const normalizedProducts =
        normalizeProducts(
            newProducts
        );


    products.length = 0;


    products.push(
        ...normalizedProducts
    );


    console.log(
        "Xiaomi WebBase: база заменена."
    );


    console.log(
        "Товаров:",
        products.length
    );


    // Если список уже существует
    // на странице — обновляем его.

    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts(
            products
        );

    }

}


// ======================================================
// ДОБАВЛЕНИЕ ТОВАРА
// ======================================================

function addProduct(
    product
) {

    const normalized =
        normalizeProduct(
            product,
            products.length
        );


    if (!normalized) {

        return false;

    }


    products.push(
        normalized
    );


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts(
            products
        );

    }


    return true;

}


// ======================================================
// УДАЛЕНИЕ ТОВАРА
// ======================================================

function removeProduct(
    productId
) {

    const index =
        products.findIndex(
            product =>
                String(product.id) ===
                String(productId)
        );


    if (
        index === -1
    ) {

        return false;

    }


    products.splice(
        index,
        1
    );


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts(
            products
        );

    }


    return true;

}


// ======================================================
// ГОТОВО
// ======================================================

console.log(
    "======================================"
);

console.log(
    "Xiaomi WebBase"
);

console.log(
    "products-data.js подключён"
);

console.log(
    "Товаров:",
    products.length
);

console.log(
    "======================================"
);
