// ======================================================
// XIAOMI WEBBASE
// PRODUCTS-DATA.JS
// ======================================================

// Тестовый товар.
// Он нужен до первой загрузки файла 1С.

let products = [
    {
        id: "test-001",
        name: "Xiaomi 17 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12GB+256GB",
        color: "Black",

        display: 1,
        warehouse: 2,

        description: "Тестовый товар для настройки системы.",
        tip: "Тестовая карточка.",

        specs: {
            "Память": "12GB+256GB",
            "Цвет": "Black"
        }
    }
];


// ======================================================
// ЗАГРУЗКА СОХРАНЁННЫХ ДАННЫХ
// ======================================================

try {

    const saved =
        localStorage.getItem(
            "xiaomiWebBaseProducts"
        );

    if (saved) {

        const parsed =
            JSON.parse(saved);

        if (
            Array.isArray(parsed) &&
            parsed.length > 0
        ) {

            products = parsed;

        }

    }

} catch (error) {

    console.error(
        "Ошибка загрузки сохранённых товаров:",
        error
    );

}