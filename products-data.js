// ======================================================
// XIAOMI WEBBASE
// PRODUCTS DATA
// Версия базы: 22.08.2026
// ======================================================


// ======================================================
// НАСТРОЙКИ
// ======================================================

// При изменении этой цифры старая локальная база
// автоматически заменяется новой.
const PRODUCTS_DATABASE_VERSION = "2026-08-22-v2";

const PRODUCTS_STORAGE_KEY =
    "xiaomiWebBaseProducts";

const PRODUCTS_VERSION_KEY =
    "xiaomiWebBaseProductsVersion";


// ======================================================
// ТОВАРЫ
// ======================================================

const products = [

    // ==================================================
    // СМАРТФОНЫ
    // ==================================================

    {
        id: 1001,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Dark Black",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Смартфон REDMI 17 с 4 ГБ оперативной и 128 ГБ встроенной памяти.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Dark Black",
            "LDU": "1 шт."
        },

        tip:
            "Выставочный экземпляр."
    },


    {
        id: 1002,
        name: "Xiaomi 17",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Флагманский смартфон Xiaomi 17 с 12 ГБ оперативной и 256 ГБ встроенной памяти.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Black",
            "LDU": "1 шт."
        },

        tip:
            "Выставочный экземпляр."
    },


    {
        id: 1003,
        name: "Xiaomi 17 Ultra",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "White",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Флагманский смартфон Xiaomi 17 Ultra.",

        specs: {
            "Память": "16 / 512 GB",
            "Цвет": "White",
            "LDU": "1 шт."
        },

        tip:
            "Выставочный экземпляр."
    },


    {
        id: 1004,
        name: "Xiaomi 17 Ultra",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "Black",

        quantity: 3,
        ldu: 0,
        display: 0,
        warehouse: 3,

        description:
            "Флагманский смартфон Xiaomi 17 Ultra.",

        specs: {
            "Память": "16 / 512 GB",
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    {
        id: 1005,
        name: "Xiaomi 17 Ultra",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "White",

        quantity: 2,
        ldu: 1,
        display: 1,
        warehouse: 1,

        description:
            "Флагманский смартфон Xiaomi 17 Ultra.",

        specs: {
            "Память": "16 / 512 GB",
            "Цвет": "White",
            "LDU": "1 шт."
        },

        tip:
            "Один экземпляр на витрине, один на складе."
    },


    {
        id: 1006,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        quantity: 10,
        ldu: 1,
        display: 1,
        warehouse: 9,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Black",
            "LDU": "1 шт."
        },

        tip:
            "Один экземпляр на витрине, остальные на складе."
    },


    {
        id: 1007,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Blue",

        quantity: 7,
        ldu: 0,
        display: 0,
        warehouse: 7,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Blue",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1008,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Violet",

        quantity: 6,
        ldu: 0,
        display: 0,
        warehouse: 6,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Violet",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1009,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",

        quantity: 9,
        ldu: 0,
        display: 0,
        warehouse: 9,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1010,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Blue",

        quantity: 5,
        ldu: 0,
        display: 0,
        warehouse: 5,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Blue",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1011,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Black",

        quantity: 3,
        ldu: 0,
        display: 0,
        warehouse: 3,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 1024 GB",
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1012,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Deep Violet",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 1024 GB",
            "Цвет": "Deep Violet",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1013,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        quantity: 3,
        ldu: 0,
        display: 0,
        warehouse: 3,

        description:
            "Смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1014,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Blue",

        quantity: 4,
        ldu: 0,
        display: 0,
        warehouse: 4,

        description:
            "Смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Deep Blue",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1015,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Violet",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Deep Violet",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1016,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",

        quantity: 8,
        ldu: 0,
        display: 0,
        warehouse: 8,

        description:
            "Смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1017,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Deep Blue",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Deep Blue",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 1018,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Blue",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Смартфон REDMI 17.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Blue",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    {
        id: 1019,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Green",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Смартфон REDMI 17.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Green",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    {
        id: 1020,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Purple",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Смартфон REDMI 17.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Purple",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    {
        id: 1021,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "8 / 256 GB",
        color: "Dark Black",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Смартфон REDMI 17.",

        specs: {
            "Память": "8 / 256 GB",
            "Цвет": "Dark Black",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    // ==================================================
    // ПЛАНШЕТЫ
    // ==================================================

    {
        id: 2001,
        name: "REDMI Pad 2",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Планшет REDMI Pad 2.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Graphite Gray",
            "LDU": "1 шт."
        },

        tip:
            "Выставочный экземпляр."
    },


    {
        id: 2002,
        name: "REDMI Pad 2 Pro",
        category: "Планшеты",
        memory: "6 / 128 GB",
        color: "Silver",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Планшет REDMI Pad 2 Pro.",

        specs: {
            "Память": "6 / 128 GB",
            "Цвет": "Silver",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    {
        id: 2003,
        name: "Xiaomi Pad 8",
        category: "Планшеты",
        memory: "8 / 128 GB",
        color: "Black",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Планшет Xiaomi Pad 8.",

        specs: {
            "Память": "8 / 128 GB",
            "Цвет": "Black",
            "LDU": "1 шт."
        },

        tip:
            "Выставочный экземпляр."
    },


    {
        id: 2004,
        name: "REDMI Pad 2 4G",
        category: "Планшеты",
        memory: "4 / 256 GB",
        color: "Graphite Gray",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Планшет REDMI Pad 2 с поддержкой 4G.",

        specs: {
            "Память": "4 / 256 GB",
            "Цвет": "Graphite Gray",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    {
        id: 2005,
        name: "REDMI Pad 2 9.7 4G",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",

        quantity: 3,
        ldu: 0,
        display: 0,
        warehouse: 3,

        description:
            "Планшет REDMI Pad 2 9.7 4G.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Graphite Gray",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 2006,
        name: "REDMI Pad 2 Pro 5G",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Graphite Gray",

        quantity: 2,
        ldu: 0,
        display: 0,
        warehouse: 2,

        description:
            "Планшет REDMI Pad 2 Pro 5G.",

        specs: {
            "Память": "8 / 256 GB",
            "Цвет": "Graphite Gray",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 2007,
        name: "REDMI Pad 2 Pro 5G",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",

        quantity: 2,
        ldu: 0,
        display: 0,
        warehouse: 2,

        description:
            "Планшет REDMI Pad 2 Pro 5G.",

        specs: {
            "Память": "8 / 256 GB",
            "Цвет": "Silver",
            "LDU": "Нет"
        },

        tip:
            "Весь остаток находится на складе."
    },


    {
        id: 2008,
        name: "REDMI Pad 2 Pro",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",

        quantity: 1,
        ldu: 0,
        display: 0,
        warehouse: 1,

        description:
            "Планшет REDMI Pad 2 Pro.",

        specs: {
            "Память": "8 / 256 GB",
            "Цвет": "Silver",
            "LDU": "Нет"
        },

        tip:
            "Товар находится на складе."
    },


    // ==================================================
    // СМАРТ-ЧАСЫ
    // ==================================================

    {
        id: 3001,
        name: "Redmi Watch 5",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 5.",

        specs: {
            "Цвет": "Obsidian Black",
            "LDU": "1 шт."
        },

        tip:
            "Часы находятся на витрине."
    },


    {
        id: 3002,
        name: "Xiaomi Watch S4 41mm",
        category: "Смарт-часы",
        memory: "",
        color: "White",

        quantity: 2,
        ldu: 2,
        display: 2,
        warehouse: 0,

        description:
            "Xiaomi Watch S4 41mm с кожаным ремешком.",

        specs: {
            "Ремешок": "Leather Strap",
            "Цвет": "White",
            "LDU": "2 шт."
        },

        tip:
            "Часы находятся на витрине."
    },


    {
        id: 3003,
        name: "REDMI Watch 6 Active",
        category: "Смарт-часы",
        memory: "",
        color: "Matte Silver",

        quantity: 6,
        ldu: 0,
        display: 6,
        warehouse: 0,

        description:
            "Смарт-часы REDMI Watch 6 Active.",

        specs: {
            "Цвет": "Matte Silver",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3004,
        name: "REDMI Watch 6 Active",
        category: "Смарт-часы",
        memory: "",
        color: "Midnight Black",

        quantity: 8,
        ldu: 0,
        display: 8,
        warehouse: 0,

        description:
            "Смарт-часы REDMI Watch 6 Active.",

        specs: {
            "Цвет": "Midnight Black",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3005,
        name: "REDMI Watch 6 Active",
        category: "Смарт-часы",
        memory: "",
        color: "Sunset Orange",

        quantity: 4,
        ldu: 0,
        display: 4,
        warehouse: 0,

        description:
            "Смарт-часы REDMI Watch 6 Active.",

        specs: {
            "Цвет": "Sunset Orange",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3006,
        name: "REDMI Watch 6 Lite",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        quantity: 8,
        ldu: 0,
        display: 8,
        warehouse: 0,

        description:
            "Смарт-часы REDMI Watch 6 Lite.",

        specs: {
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3007,
        name: "REDMI Watch 6 Lite",
        category: "Смарт-часы",
        memory: "",
        color: "Steel Gray",

        quantity: 7,
        ldu: 0,
        display: 7,
        warehouse: 0,

        description:
            "Смарт-часы REDMI Watch 6 Lite.",

        specs: {
            "Цвет": "Steel Gray",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3008,
        name: "Redmi Watch 6",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        quantity: 3,
        ldu: 0,
        display: 3,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6.",

        specs: {
            "Цвет": "Obsidian Black",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3009,
        name: "REDMI Watch 6 Obsidian Black Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Демонстрационный экземпляр REDMI Watch 6.",

        specs: {
            "Цвет": "Obsidian Black",
            "Тип": "Demo",
            "LDU": "1 шт."
        },

        tip:
            "Демонстрационный экземпляр на витрине."
    },


    {
        id: 3010,
        name: "REDMI Watch 6",
        category: "Смарт-часы",
        memory: "",
        color: "Silver Gray",

        quantity: 5,
        ldu: 0,
        display: 5,
        warehouse: 0,

        description:
            "Смарт-часы REDMI Watch 6.",

        specs: {
            "Цвет": "Silver Gray",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3011,
        name: "Xiaomi Watch 5 Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Black Strap",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Демонстрационные часы Xiaomi Watch 5.",

        specs: {
            "Цвет": "Black Strap",
            "Тип": "Demo",
            "LDU": "1 шт."
        },

        tip:
            "Демонстрационный экземпляр."
    },


    {
        id: 3012,
        name: "Xiaomi Watch S4 41mm",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        quantity: 1,
        ldu: 0,
        display: 1,
        warehouse: 0,

        description:
            "Xiaomi Watch S4 41mm с фторкаучуковым ремешком.",

        specs: {
            "Ремешок": "Fluororubber Strap",
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3013,
        name: "Xiaomi Watch S5 46mm",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        quantity: 1,
        ldu: 0,
        display: 1,
        warehouse: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3014,
        name: "Xiaomi Watch S5 46mm",
        category: "Смарт-часы",
        memory: "",
        color: "Ceramic Blue",

        quantity: 1,
        ldu: 0,
        display: 1,
        warehouse: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Цвет": "Ceramic Blue",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3015,
        name: "Xiaomi Watch S5 46mm",
        category: "Смарт-часы",
        memory: "",
        color: "Jungle Green",

        quantity: 1,
        ldu: 0,
        display: 1,
        warehouse: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Цвет": "Jungle Green",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3016,
        name: "Xiaomi Watch S5 46mm",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",

        quantity: 1,
        ldu: 0,
        display: 1,
        warehouse: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Цвет": "Silver",
            "LDU": "Нет"
        },

        tip:
            "Часы находятся на витрине/крючках."
    },


    {
        id: 3017,
        name: "Xiaomi Watch S5 46mm Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Демонстрационный экземпляр Xiaomi Watch S5.",

        specs: {
            "Цвет": "Silver",
            "Тип": "Demo",
            "LDU": "1 шт."
        },

        tip:
            "Демонстрационный экземпляр."
    },


    // ==================================================
    // ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

    {
        id: 4001,
        name: "Xiaomi Smart Band 10",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        quantity: 5,
        ldu: 0,
        display: 5,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 10.",

        specs: {
            "Цвет": "Midnight Black",
            "LDU": "Нет"
        },

        tip:
            "Браслеты находятся на витрине."
    },


    {
        id: 4002,
        name: "Xiaomi Smart Band 10 Pro",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pearl White",

        quantity: 2,
        ldu: 0,
        display: 2,
        warehouse: 0,

        description:
            "Xiaomi Smart Band 10 Pro Ceramic Edition.",

        specs: {
            "Цвет": "Pearl White",
            "Версия": "Ceramic Edition",
            "LDU": "Нет"
        },

        tip:
            "Браслеты находятся на витрине."
    },


    {
        id: 4003,
        name: "Xiaomi Smart Band 10 Pro Demo",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        quantity: 1,
        ldu: 1,
        display: 1,
        warehouse: 0,

        description:
            "Демонстрационный экземпляр Xiaomi Smart Band 10 Pro.",

        specs: {
            "Цвет": "Midnight Black",
            "Тип": "Demo",
            "LDU": "1 шт."
        },

        tip:
            "Демонстрационный экземпляр."
    },


    {
        id: 4004,
        name: "Xiaomi Smart Band 10 Pro",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        quantity: 4,
        ldu: 0,
        display: 4,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 10 Pro.",

        specs: {
            "Цвет": "Midnight Black",
            "LDU": "Нет"
        },

        tip:
            "Браслеты находятся на витрине."
    },


    {
        id: 4005,
        name: "Xiaomi Smart Band 11 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",

        quantity: 8,
        ldu: 0,
        display: 8,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 11 Active.",

        specs: {
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Браслеты находятся на витрине."
    },


    {
        id: 4006,
        name: "Xiaomi Smart Band 11 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Gray",

        quantity: 9,
        ldu: 0,
        display: 9,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 11 Active.",

        specs: {
            "Цвет": "Gray",
            "LDU": "Нет"
        },

        tip:
            "Браслеты находятся на витрине."
    },


    {
        id: 4007,
        name: "Xiaomi Smart Band 11 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pomelo Pink",

        quantity: 4,
        ldu: 0,
        display: 4,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 11 Active.",

        specs: {
            "Цвет": "Pomelo Pink",
            "LDU": "Нет"
        },

        tip:
            "Браслеты находятся на витрине."
    },


    {
        id: 4008,
        name: "Xiaomi Smart Band 9 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",

        quantity: 1,
        ldu: 0,
        display: 1,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 9 Active.",

        specs: {
            "Цвет": "Black",
            "LDU": "Нет"
        },

        tip:
            "Браслет находится на витрине."
    }

];


// ======================================================
// LOCAL STORAGE
// ======================================================

function saveProducts() {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
    );

    localStorage.setItem(
        PRODUCTS_VERSION_KEY,
        PRODUCTS_DATABASE_VERSION
    );
}


function loadProducts() {

    const savedVersion =
        localStorage.getItem(
            PRODUCTS_VERSION_KEY
        );


    // ================================================
    // ЕСЛИ ВЕРСИЯ СТАРАЯ —
    // ПОЛНОСТЬЮ УДАЛЯЕМ СТАРУЮ БАЗУ
    // ================================================

    if (
        savedVersion !==
        PRODUCTS_DATABASE_VERSION
    ) {

        localStorage.removeItem(
            PRODUCTS_STORAGE_KEY
        );

        localStorage.setItem(
            PRODUCTS_VERSION_KEY,
            PRODUCTS_DATABASE_VERSION
        );

        return;
    }


    const savedProducts =
        localStorage.getItem(
            PRODUCTS_STORAGE_KEY
        );


    if (!savedProducts) {
        return;
    }


    try {

        const parsedProducts =
            JSON.parse(savedProducts);


        if (Array.isArray(parsedProducts)) {

            products.length = 0;

            products.push(
                ...parsedProducts
            );

        }

    } catch (error) {

        console.error(
            "Ошибка загрузки товаров:",
            error
        );

        localStorage.removeItem(
            PRODUCTS_STORAGE_KEY
        );

    }

}


// ======================================================
// ELEMENTS
// ======================================================

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


// ======================================================
// PRODUCT LIST
// ======================================================

function renderProducts(
    productsToRender
) {

    if (!productsList) {
        return;
    }


    productsList.innerHTML = "";


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


            card.innerHTML = `

                <div class="product-image">
                    Фото товара
                </div>


                <div class="product-name">
                    ${product.name}
                </div>


                <div class="product-info">

                    ${
                        product.memory
                            ? product.memory
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
                            ? product.color
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
                () => {

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


// ======================================================
// SEARCH
// ======================================================

function searchProducts() {

    if (!searchInput) {
        return;
    }


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (query === "") {

        renderProducts(
            products
        );

        return;
    }


    const results =
        products.filter(
            product => {

                const searchText = `

                    ${product.name}

                    ${product.category}

                    ${product.memory || ""}

                    ${product.color || ""}

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


// ======================================================
// SEARCH BUTTON
// ======================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// ======================================================
// ENTER
// ======================================================

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


// ======================================================
// LIVE SEARCH
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ======================================================
// CATEGORIES
// ======================================================

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

                    searchInput.value = "";

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


// ======================================================
// PRODUCT PAGE
// ======================================================

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
                item.id === productId
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


// ======================================================
// RENDER PRODUCT
// ======================================================

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


    let specsHTML = "";


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
                            ${key}
                        </span>

                        <strong>
                            ${value}
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


    productDetails.innerHTML = `

        <div class="product-page">


            <div class="product-page-image">

                Фото товара

            </div>


            <div class="product-page-content">


                <div class="product-category">

                    ${product.category}

                </div>


                <h1>

                    ${product.name}

                </h1>


                ${
                    product.memory
                        ? `
                            <div class="product-memory">
                                ${product.memory}
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
                                    ${product.color}
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
                            product.description ||
                            "Описание пока не добавлено."
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
                            product.tip ||
                            "Подсказка пока не добавлена."
                        }

                    </p>

                </div>


            </div>

        </div>

    `;


    document.title =
        `${product.name} — Xiaomi WebBase`;


    setupQuantityButtons(
        product
    );

}


// ======================================================
// QUANTITY BUTTONS
// ======================================================

function setupQuantityButtons(
    product
) {

    const buttons =
        document.querySelectorAll(
            ".quantity-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const type =
                        button.dataset.type;


                    const action =
                        button.dataset.action;


                    if (
                        action === "plus"
                    ) {

                        product[type] =
                            Number(
                                product[type]
                            ) + 1;

                    }


                    if (
                        action === "minus"
                    ) {

                        if (
                            Number(
                                product[type]
                            ) > 0
                        ) {

                            product[type] =
                                Number(
                                    product[type]
                                ) - 1;

                        }

                    }


                    // Обновляем общее количество
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

                }
            );

        }
    );

}


// ======================================================
// START
// ======================================================

loadProducts();


if (productsList) {

    renderProducts(
        products
    );

}


if (productDetails) {

    renderProductPage();

}