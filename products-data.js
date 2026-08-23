// ======================================================
// XIAOMI WEBBASE
// PRODUCTS-DATA.JS
// ======================================================
// Единая структура данных товаров.
//
// ВАЖНО:
// Сейчас здесь только ОДИН тестовый товар.
// Позже этот массив будет автоматически
// заполняться из таблицы 1С.
//
// app.js работает именно с массивом products.
// ======================================================


// ======================================================
// ВЕРСИЯ БАЗЫ
// ======================================================

const PRODUCTS_DATABASE_VERSION = "2026-08-23-v1";


// ======================================================
// КЛЮЧИ LOCAL STORAGE
// ======================================================

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";

const PRODUCTS_VERSION_KEY =
    "xiaomiWebBaseProductsVersion";


// ======================================================
// БАЗОВЫЕ ТОВАРЫ
// ======================================================
//
// Сейчас только один товар для настройки системы.
//
// Позже ручные товары отсюда уберём,
// а данные будут загружаться из таблицы 1С.
// ======================================================

const products = [

    {

        // ------------------------------------------------
        // ОСНОВНАЯ ИНФОРМАЦИЯ
        // ------------------------------------------------

        id: 1001,

        name: "Xiaomi 17",

        category: "Смартфоны",

        memory: "12 / 256 GB",

        color: "Black",


        // ------------------------------------------------
        // ОСТАТКИ
        // ------------------------------------------------

        quantity: 3,

        display: 1,

        warehouse: 2,

        ldu: 1,


        // ------------------------------------------------
        // ОПИСАНИЕ
        // ------------------------------------------------

        description:
            "Тестовый товар для настройки Xiaomi WebBase. " +
            "Позже информация будет загружаться автоматически " +
            "из таблицы 1С.",


        // ------------------------------------------------
        // ХАРАКТЕРИСТИКИ
        // ------------------------------------------------

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


        // ------------------------------------------------
        // ПОДСКАЗКА ПРОДАВЦУ
        // ------------------------------------------------

        tip:
            "Тестовая карточка. " +
            "После подключения таблицы 1С " +
            "данные будут формироваться автоматически."

    }

];


// ======================================================
// СОХРАНЕНИЕ БАЗЫ
// ======================================================

function saveProducts() {

    try {

        localStorage.setItem(

            PRODUCTS_STORAGE_KEY,

            JSON.stringify(products)

        );


        localStorage.setItem(

            PRODUCTS_VERSION_KEY,

            PRODUCTS_DATABASE_VERSION

        );


        console.log(
            "Xiaomi WebBase: база товаров сохранена."
        );


    } catch (error) {

        console.error(
            "Xiaomi WebBase: ошибка сохранения базы:",
            error
        );

    }

}


// ======================================================
// ЗАГРУЗКА БАЗЫ
// ======================================================

function loadProducts() {

    try {

        const savedVersion =
            localStorage.getItem(
                PRODUCTS_VERSION_KEY
            );


        // ------------------------------------------------
        // Если версия изменилась —
        // удаляем старую локальную базу.
        // ------------------------------------------------

        if (
            savedVersion &&
            savedVersion !==
                PRODUCTS_DATABASE_VERSION
        ) {

            localStorage.removeItem(
                PRODUCTS_STORAGE_KEY
            );

            localStorage.removeItem(
                PRODUCTS_VERSION_KEY
            );

        }


        const savedProducts =
            localStorage.getItem(
                PRODUCTS_STORAGE_KEY
            );


        // ------------------------------------------------
        // Если сохранённой базы нет —
        // оставляем тестовый товар.
        // ------------------------------------------------

        if (!savedProducts) {

            console.log(
                "Xiaomi WebBase: используется базовая база товаров."
            );

            return;

        }


        const parsedProducts =
            JSON.parse(
                savedProducts
            );


        // ------------------------------------------------
        // Проверяем структуру.
        // ------------------------------------------------

        if (
            !Array.isArray(
                parsedProducts
            )
        ) {

            console.warn(
                "Xiaomi WebBase: сохранённая база имеет неверный формат."
            );

            return;

        }


        // ------------------------------------------------
        // Загружаем сохранённые товары.
        // ------------------------------------------------

        products.length = 0;

        products.push(
            ...parsedProducts
        );


        console.log(

            "Xiaomi WebBase: из LocalStorage загружено",
            products.length,
            "товаров."

        );


    } catch (error) {

        console.error(

            "Xiaomi WebBase: ошибка загрузки базы:",
            error

        );

    }

}


// ======================================================
// ПОДГОТОВКА ТОВАРА
// ======================================================
//
// Эта функция пригодится при импорте таблицы 1С.
//
// Она приводит значения к нормальному формату,
// чтобы app.js всегда получал одинаковую структуру.
// ======================================================

function normalizeProduct(product, index = 0) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    const display =
        Number(
            product.display || 0
        );


    const warehouse =
        Number(
            product.warehouse || 0
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
            Number(
                product.ldu || 0
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
// ПОДГОТОВКА МАССИВА ТОВАРОВ
// ======================================================
//
// Позже сюда можно будет передать товары,
// полученные из таблицы 1С.
//
// Например:
//
// const imported = rows.map(normalizeProduct);
//
// ======================================================

function normalizeProducts(list) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    return list

        .map(
            (product, index) =>
                normalizeProduct(
                    product,
                    index
                )
        )

        .filter(
            product =>
                product !== null
        );

}


// ======================================================
// ЗАМЕНА ТЕКУЩЕЙ БАЗЫ
// ======================================================
//
// Эта функция понадобится для импортера 1С.
//
// Сейчас мы её не вызываем.
// ======================================================

function replaceProducts(newProducts) {

    const normalized =
        normalizeProducts(
            newProducts
        );


    products.length = 0;

    products.push(
        ...normalized
    );


    saveProducts();


    console.log(

        "Xiaomi WebBase: база заменена.",
        products.length,
        "товаров."

    );


    // Если app.js уже загружен,
    // обновляем список на экране.

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
// ОЧИСТКА БАЗЫ
// ======================================================

function clearProducts() {

    products.length = 0;

    saveProducts();


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts(
            products
        );

    }


    console.log(
        "Xiaomi WebBase: база товаров очищена."
    );

}


// ======================================================
// ИНИЦИАЛИЗАЦИЯ
// ======================================================

loadProducts();


// ======================================================
// ПРОВЕРКА
// ======================================================

console.log(
    "Xiaomi WebBase: products-data.js подключён."
);

console.log(
    "Товаров в базе:",
    products.length
);