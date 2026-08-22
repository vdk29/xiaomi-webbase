// ============================================================
// XIAOMI WEBBASE — PRODUCTS DATABASE
// Остатки на 22.08.2026
// ============================================================
//
// ЛОГИКА:
//
// Смартфоны:
// LDU = количество выставочных аппаратов.
// Остаток без LDU = склад.
//
// Смарт-часы:
// LDU = часы на основной витрине.
// Остальные часы = витрина / крючки.
//
// Фитнес-браслеты:
// LDU = выставочные экземпляры.
// Остальные = витрина / крючки.
//
// Планшеты:
// Пока остаток хранится отдельно.
// display / warehouse можно корректировать вручную.
//
// Пылесосы, очистители, увлажнители, кормушки,
// техника и аксессуары:
// расположение можно выставлять вручную.
//
// ПФ НЕ УЧИТЫВАЕТСЯ.
// ============================================================


const products = [

    // ========================================================
    // СМАРТФОНЫ
    // ========================================================

    {
        id: 1,
        name: "REDMI 17 4GB+128GB Dark Black",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Dark Black",

        display: 1,
        warehouse: 0,

        ldu: 1,

        description:
            "Смартфон Redmi 17 с большим экраном и высокой автономностью.",

        specs: {
            "Память": "4 / 128 GB"
        },

        tip:
            "Выставочный аппарат находится на витрине."
    },

    {
        id: 2,
        name: "REDMI 17 4GB+128GB Blue",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Blue",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Смартфон Redmi 17.",

        specs: {
            "Память": "4 / 128 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 3,
        name: "REDMI 17 4GB+128GB Green",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Green",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Смартфон Redmi 17.",

        specs: {
            "Память": "4 / 128 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 4,
        name: "REDMI 17 4GB+128GB Purple",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Purple",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Смартфон Redmi 17.",

        specs: {
            "Память": "4 / 128 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 5,
        name: "REDMI 17 8GB+256GB Dark Black",
        category: "Смартфоны",
        memory: "8 / 256 GB",
        color: "Dark Black",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Смартфон Redmi 17.",

        specs: {
            "Память": "8 / 256 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 6,
        name: "Xiaomi 17 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        display: 1,
        warehouse: 0,

        ldu: 1,

        description:
            "Флагманский смартфон Xiaomi 17.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Выставочный аппарат находится на витрине."
    },

    {
        id: 7,
        name: "Xiaomi 17 Ultra 16GB+512GB Black",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "Black",

        display: 0,
        warehouse: 3,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17 Ultra.",

        specs: {
            "Память": "16 / 512 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 8,
        name: "Xiaomi 17 Ultra 16GB+512GB White",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "White",

        display: 1,
        warehouse: 1,

        ldu: 1,

        description:
            "Флагманский смартфон Xiaomi 17 Ultra.",

        specs: {
            "Память": "16 / 512 GB"
        },

        tip:
            "Один аппарат выставлен на витрине."
    },

    {
        id: 9,
        name: "Xiaomi 17T 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        display: 1,
        warehouse: 9,

        ldu: 1,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Один аппарат выставлен на витрине."
    },

    {
        id: 10,
        name: "Xiaomi 17T 12GB+256GB Blue",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Blue",

        display: 0,
        warehouse: 7,

        ldu: 0,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 11,
        name: "Xiaomi 17T 12GB+256GB Violet",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Violet",

        display: 0,
        warehouse: 6,

        ldu: 0,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 12,
        name: "Xiaomi 17T 12GB+512GB Black",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",

        display: 0,
        warehouse: 9,

        ldu: 0,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 512 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 13,
        name: "Xiaomi 17T 12GB+512GB Blue",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Blue",

        display: 0,
        warehouse: 5,

        ldu: 0,

        description:
            "Смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 512 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 14,
        name: "Xiaomi 17T Pro 12GB+1024GB Black",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Black",

        display: 0,
        warehouse: 3,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 1024 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 15,
        name: "Xiaomi 17T Pro 12GB+1024GB Deep Violet",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Deep Violet",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 1024 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 16,
        name: "Xiaomi 17T Pro 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        display: 0,
        warehouse: 3,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 17,
        name: "Xiaomi 17T Pro 12GB+256GB Deep Blue",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Blue",

        display: 0,
        warehouse: 4,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 18,
        name: "Xiaomi 17T Pro 12GB+256GB Deep Violet",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Violet",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 256 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 19,
        name: "Xiaomi 17T Pro 12GB+512GB Black",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",

        display: 0,
        warehouse: 8,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 512 GB"
        },

        tip:
            "Товар находится на складе."
    },

    {
        id: 20,
        name: "Xiaomi 17T Pro 12GB+512GB Deep Blue",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Deep Blue",

        display: 0,
        warehouse: 1,

        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17T Pro.",

        specs: {
            "Память": "12 / 512 GB"
        },

        tip:
            "Товар находится на складе."
    },


    // ========================================================
    // ПЛАНШЕТЫ
    // ========================================================

    {
        id: 21,
        name: "REDMI Pad 2 4GB+128GB Graphite Gray",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",

        display: 0,
        warehouse: 1,

        description:
            "Планшет Redmi Pad 2.",

        specs: {
            "Память": "4 / 128 GB"
        },

        tip:
            "Планшет находится на складе."
    },

    {
        id: 22,
        name: "REDMI Pad 2 4G 4GB+256GB Graphite Gray",
        category: "Планшеты",
        memory: "4 / 256 GB",
        color: "Graphite Gray",

        display: 0,
        warehouse: 1,

        description:
            "Планшет Redmi Pad 2 с поддержкой мобильной сети.",

        specs: {
            "Память": "4 / 256 GB",
            "Связь": "4G"
        },

        tip:
            "Планшет находится на складе."
    },

    {
        id: 23,
        name: "REDMI Pad 2 9.7 4G 4GB+128GB Graphite Gray",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",

        display: 0,
        warehouse: 3,

        description:
            "Планшет Redmi Pad 2 4G.",

        specs: {
            "Память": "4 / 128 GB",
            "Связь": "4G"
        },

        tip:
            "Планшеты находятся на складе."
    },

    {
        id: 24,
        name: "REDMI Pad 2 Pro 5G 8GB+256GB Graphite Gray",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Graphite Gray",

        display: 0,
        warehouse: 2,

        description:
            "Планшет Redmi Pad 2 Pro с поддержкой 5G.",

        specs: {
            "Память": "8 / 256 GB",
            "Связь": "5G"
        },

        tip:
            "Планшет находится на складе."
    },

    {
        id: 25,
        name: "REDMI Pad 2 Pro 5G 8GB+256GB Silver",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",

        display: 0,
        warehouse: 2,

        description:
            "Планшет Redmi Pad 2 Pro с поддержкой 5G.",

        specs: {
            "Память": "8 / 256 GB",
            "Связь": "5G"
        },

        tip:
            "Планшет находится на складе."
    },

    {
        id: 26,
        name: "REDMI Pad 2 Pro 6GB+128GB Silver",
        category: "Планшеты",
        memory: "6 / 128 GB",
        color: "Silver",

        display: 0,
        warehouse: 1,

        description:
            "Планшет Redmi Pad 2 Pro.",

        specs: {
            "Память": "6 / 128 GB"
        },

        tip:
            "Планшет находится на складе."
    },

    {
        id: 27,
        name: "REDMI Pad 2 Pro 8GB+256GB Silver",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",

        display: 0,
        warehouse: 1,

        description:
            "Планшет Redmi Pad 2 Pro.",

        specs: {
            "Память": "8 / 256 GB"
        },

        tip:
            "Планшет находится на складе."
    },

    {
        id: 28,
        name: "Xiaomi Pad 8 8GB+128GB Black",
        category: "Планшеты",
        memory: "8 / 128 GB",
        color: "Black",

        display: 0,
        warehouse: 1,

        description:
            "Планшет Xiaomi Pad 8.",

        specs: {
            "Память": "8 / 128 GB"
        },

        tip:
            "Планшет находится на складе."
    },


    // ========================================================
    // СМАРТ-ЧАСЫ
    // ========================================================

    {
        id: 29,
        name: "Redmi Watch 5 Obsidian Black",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        display: 1,
        warehouse: 0,

        ldu: 1,

        description:
            "Смарт-часы Redmi Watch 5.",

        specs: {},

        tip:
            "LDU — выставочный экземпляр."
    },

    {
        id: 30,
        name: "Xiaomi Watch S4 41mm Leather Strap White",
        category: "Смарт-часы",
        memory: "",
        color: "White",

        display: 2,
        warehouse: 0,

        ldu: 2,

        description:
            "Смарт-часы Xiaomi Watch S4 41mm.",

        specs: {},

        tip:
            "Оба экземпляра являются выставочными."
    },

    {
        id: 31,
        name: "REDMI Watch 6 Active Matte Silver",
        category: "Смарт-часы",
        memory: "",
        color: "Matte Silver",

        display: 6,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6 Active.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 32,
        name: "REDMI Watch 6 Active Midnight Black",
        category: "Смарт-часы",
        memory: "",
        color: "Midnight Black",

        display: 8,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6 Active.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 33,
        name: "REDMI Watch 6 Active Sunset Orange",
        category: "Смарт-часы",
        memory: "",
        color: "Sunset Orange",

        display: 4,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6 Active.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 34,
        name: "REDMI Watch 6 Lite Black",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        display: 8,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6 Lite.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 35,
        name: "REDMI Watch 6 Lite Steel Gray",
        category: "Смарт-часы",
        memory: "",
        color: "Steel Gray",

        display: 7,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6 Lite.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 36,
        name: "Redmi Watch 6 Obsidian Black",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        display: 3,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 37,
        name: "REDMI Watch 6 Obsidian Black Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        display: 1,
        warehouse: 0,

        description:
            "Демонстрационные смарт-часы Redmi Watch 6.",

        specs: {},

        tip:
            "Демонстрационный экземпляр."
    },

    {
        id: 38,
        name: "REDMI Watch 6 Silver Gray",
        category: "Смарт-часы",
        memory: "",
        color: "Silver Gray",

        display: 5,
        warehouse: 0,

        description:
            "Смарт-часы Redmi Watch 6.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючках."
    },

    {
        id: 39,
        name: "Xiaomi Watch 5 Demo Black Strap",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        display: 1,
        warehouse: 0,

        description:
            "Демонстрационные смарт-часы Xiaomi Watch 5.",

        specs: {},

        tip:
            "Демонстрационный экземпляр."
    },

    {
        id: 40,
        name: "Xiaomi Watch S4 41mm Fluororubber Strap Black",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        display: 1,
        warehouse: 0,

        description:
            "Смарт-часы Xiaomi Watch S4 41mm.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючке."
    },

    {
        id: 41,
        name: "Xiaomi Watch S5 46mm Black",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        display: 1,
        warehouse: 0,

        description:
            "Смарт-часы Xiaomi Watch S5.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючке."
    },

    {
        id: 42,
        name: "Xiaomi Watch S5 46mm Ceramic Blue",
        category: "Смарт-часы",
        memory: "",
        color: "Ceramic Blue",

        display: 1,
        warehouse: 0,

        description:
            "Смарт-часы Xiaomi Watch S5.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючке."
    },

    {
        id: 43,
        name: "Xiaomi Watch S5 46mm Jungle Green",
        category: "Смарт-часы",
        memory: "",
        color: "Jungle Green",

        display: 1,
        warehouse: 0,

        description:
            "Смарт-часы Xiaomi Watch S5.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючке."
    },

    {
        id: 44,
        name: "Xiaomi Watch S5 46mm Silver",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",

        display: 1,
        warehouse: 0,

        description:
            "Смарт-часы Xiaomi Watch S5.",

        specs: {},

        tip:
            "Часы находятся на витрине / крючке."
    },

    {
        id: 45,
        name: "Xiaomi Watch S5 46mm Silver Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",

        display: 1,
        warehouse: 0,

        description:
            "Демонстрационные смарт-часы Xiaomi Watch S5.",

        specs: {},

        tip:
            "Демонстрационный экземпляр."
    },


    // ========================================================
    // ФИТНЕС-БРАСЛЕТЫ
    // ========================================================

    {
        id: 46,
        name: "Xiaomi Smart Band 10 Midnight Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        display: 5,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 10.",

        specs: {},

        tip:
            "Браслеты находятся на витрине / крючках."
    },

    {
        id: 47,
        name: "Xiaomi Smart Band 10 Pro Ceramic Edition Pearl White",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pearl White",

        display: 2,
        warehouse: 0,

        description:
            "Xiaomi Smart Band 10 Pro Ceramic Edition.",

        specs: {},

        tip:
            "Браслеты находятся на витрине / крючках."
    },

    {
        id: 48,
        name: "Xiaomi Smart Band 10 Pro Demo Midnight Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        display: 1,
        warehouse: 0,

        description:
            "Демонстрационный Xiaomi Smart Band 10 Pro.",

        specs: {},

        tip:
            "Демонстрационный экземпляр."
    },

    {
        id: 49,
        name: "Xiaomi Smart Band 10 Pro Midnight Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        display: 4,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 10 Pro.",

        specs: {},

        tip:
            "Браслеты находятся на витрине / крючках."
    },

    {
        id: 50,
        name: "Xiaomi Smart Band 11 Active Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",

        display: 8,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 11 Active.",

        specs: {},

        tip:
            "Браслеты находятся на витрине / крючках."
    },

    {
        id: 51,
        name: "Xiaomi Smart Band 11 Active Gray",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Gray",

        display: 9,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 11 Active.",

        specs: {},

        tip:
            "Браслеты находятся на витрине / крючках."
    },

    {
        id: 52,
        name: "Xiaomi Smart Band 11 Active Pomelo Pink",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pomelo Pink",

        display: 4,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 11 Active.",

        specs: {},

        tip:
            "Браслеты находятся на витрине / крючках."
    },

    {
        id: 53,
        name: "Xiaomi Smart Band 9 Active Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",

        display: 1,
        warehouse: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 9 Active.",

        specs: {},

        tip:
            "Браслет находится на витрине / крючке."
    },


    // ========================================================
    // НАУШНИКИ
    // ========================================================

    {
        id: 54,
        name: "Redmi Buds 8 Active Black",
        category: "Наушники",
        memory: "",
        color: "Black",

        display: 0,
        warehouse: 4,

        description:
            "Беспроводные наушники Redmi Buds 8 Active.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 55,
        name: "Redmi Buds 8 Active White",
        category: "Наушники",
        memory: "",
        color: "White",

        display: 0,
        warehouse: 4,

        description:
            "Беспроводные наушники Redmi Buds 8 Active.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 56,
        name: "REDMI Buds 8 Pro Cloud White",
        category: "Наушники",
        memory: "",
        color: "Cloud White",

        display: 0,
        warehouse: 3,

        description:
            "Беспроводные наушники Redmi Buds 8 Pro.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 57,
        name: "REDMI Buds 8 Pro Obsidian Black",
        category: "Наушники",
        memory: "",
        color: "Obsidian Black",

        display: 0,
        warehouse: 3,

        description:
            "Беспроводные наушники Redmi Buds 8 Pro.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 58,
        name: "Наушники беспроводные REDMI Buds 8 Black",
        category: "Наушники",
        memory: "",
        color: "Black",

        display: 0,
        warehouse: 4,

        description:
            "Беспроводные наушники Redmi Buds 8.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 59,
        name: "Наушники беспроводные REDMI Buds 8 White",
        category: "Наушники",
        memory: "",
        color: "White",

        display: 0,
        warehouse: 4,

        description:
            "Беспроводные наушники Redmi Buds 8.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 60,
        name: "Наушники беспроводные REDMI Buds 8 Lite Black",
        category: "Наушники",
        memory: "",
        color: "Black",

        display: 0,
        warehouse: 7,

        description:
            "Беспроводные наушники Redmi Buds 8 Lite.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 61,
        name: "Наушники беспроводные REDMI Buds 8 Lite Blue",
        category: "Наушники",
        memory: "",
        color: "Blue",

        display: 0,
        warehouse: 4,

        description:
            "Беспроводные наушники Redmi Buds 8 Lite.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 62,
        name: "Наушники беспроводные REDMI Buds 8 Lite White",
        category: "Наушники",
        memory: "",
        color: "White",

        display: 0,
        warehouse: 3,

        description:
            "Беспроводные наушники Redmi Buds 8 Lite.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 63,
        name: "Xiaomi Buds 6 Ceramic White",
        category: "Наушники",
        memory: "",
        color: "Ceramic White",

        display: 0,
        warehouse: 1,

        description:
            "Беспроводные наушники Xiaomi Buds 6.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 64,
        name: "Xiaomi Buds 6 Graphite Black",
        category: "Наушники",
        memory: "",
        color: "Graphite Black",

        display: 0,
        warehouse: 2,

        description:
            "Беспроводные наушники Xiaomi Buds 6.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 65,
        name: "Xiaomi Buds 6 Nebula Purple",
        category: "Наушники",
        memory: "",
        color: "Nebula Purple",

        display: 0,
        warehouse: 2,

        description:
            "Беспроводные наушники Xiaomi Buds 6.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 66,
        name: "Xiaomi Buds 6 Titan Gray",
        category: "Наушники",
        memory: "",
        color: "Titan Gray",

        display: 0,
        warehouse: 1,

        description:
            "Беспроводные наушники Xiaomi Buds 6.",

        specs: {},

        tip:
            "Товар находится на складе."
    },


    // ========================================================
    // POWER BANK
    // ========================================================

    {
        id: 67,
        name: "Xiaomi Power Bank 20000mAh Integrated Cable",
        category: "Power Bank",
        memory: "",
        color: "Light Gray",

        display: 0,
        warehouse: 1,

        description:
            "Внешний аккумулятор Xiaomi 20000 мА·ч со встроенным кабелем.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 68,
        name: "Xiaomi 165W Power Bank 10000mAh Integrated Cable",
        category: "Power Bank",
        memory: "",
        color: "Gray",

        display: 0,
        warehouse: 1,

        description:
            "Портативный аккумулятор Xiaomi 165W.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 69,
        name: "Xiaomi Magnetic Power Bank 6000mAh",
        category: "Power Bank",
        memory: "",
        color: "",

        display: 0,
        warehouse: 8,

        description:
            "Магнитный внешний аккумулятор Xiaomi.",

        specs: {},

        tip:
            "Товар находится на складе."
    },

    {
        id: 70,
        name: "Xiaomi 33W Power Bank 10000mAh Integrated Cable",
        category: "Power Bank",
        memory: "",
        color: "Tan",

        display: 0,
        warehouse: 3,

        description:
            "Портативный аккумулятор Xiaomi 33W.",

        specs: {},

        tip:
            "Товар находится на складе."
    },


    // ========================================================
    // РОБОТЫ-ПЫЛЕСОСЫ
    // ========================================================

    // Здесь display специально НЕ считается автоматически.
    // Ты потом сам выставишь расположение.

    {
        id: 71,
        name: "Xiaomi Robot Vacuum 5 EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum 5.",

        specs: {},

        tip:
            "Расположение на витрине выставляется вручную."
    },

    {
        id: 72,
        name: "Xiaomi Robot Vacuum 5 Pro EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum 5 Pro.",

        specs: {},

        tip:
            "Расположение на витрине выставляется вручную."
    },

    {
        id: 73,
        name: "Xiaomi Robot Vacuum E5 Black EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "Black",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum E5.",

        specs: {},

        tip:
            "Расположение на витрине выставляется вручную."
    },

    {
        id: 74,
        name: "Xiaomi Robot Vacuum H40 EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum H40.",

        specs: {},

        tip:
            "Расположение на витрине выставляется вручную."
    },

    {
        id: 75,
        name: "Xiaomi Robot Vacuum H50 EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum H50.",

        specs: {},

        tip:
            "Расположение на витрине выставляется вручную."
    },


    // ========================================================
    // ОЧИСТИТЕЛИ ВОЗДУХА
    // ========================================================

    {
        id: 76,
        name: "Mijia Smart Air Purifier 6 EU",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умный очиститель воздуха Mijia.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 77,
        name: "Mijia Smart Air Purifier Max EU",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Мощный умный очиститель воздуха Mijia.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 78,
        name: "Xiaomi Smart Air Purifier 4 Lite EU",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Очиститель воздуха Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 79,
        name: "Xiaomi Smart Air Purifier Elite",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Очиститель воздуха Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // УВЛАЖНИТЕЛИ
    // ========================================================

    {
        id: 80,
        name: "Mijia Smart Evaporative Humidifier Pro EU",
        category: "Увлажнители",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Умный испарительный увлажнитель воздуха Mijia.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // УМНЫЕ ТОВАРЫ ДЛЯ ЖИВОТНЫХ
    // ========================================================

    {
        id: 81,
        name: "Xiaomi Smart Pet Food Feeder 2 EU",
        category: "Для животных",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умная кормушка для животных Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 82,
        name: "Xiaomi Smart Pet Fountain 2",
        category: "Для животных",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умная поилка для животных Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // АЭРОГРИЛИ
    // ========================================================

    {
        id: 83,
        name: "Xiaomi Air Fryer Essential 6L EU",
        category: "Кухня",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Аэрогриль Xiaomi Air Fryer Essential 6L.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 84,
        name: "Xiaomi Dual Zone Air Fryer 10L EU",
        category: "Кухня",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Аэрогриль Xiaomi Dual Zone Air Fryer 10L.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 85,
        name: "Xiaomi Dual Zone Air Fryer 12L EU",
        category: "Кухня",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Аэрогриль Xiaomi Dual Zone Air Fryer 12L.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 86,
        name: "Xiaomi Smart Air Fryer 6.5L White",
        category: "Кухня",
        memory: "",
        color: "White",

        display: 0,
        warehouse: 4,

        manualLocation: true,

        description:
            "Умный аэрогриль Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 87,
        name: "Xiaomi Smart Air Fryer 6.5L Black EU",
        category: "Кухня",
        memory: "",
        color: "Black",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умный аэрогриль Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // УХОД ЗА СОБОЙ
    // ========================================================

    {
        id: 88,
        name: "Xiaomi Oscillation Electric Toothbrush BLUE",
        category: "Красота и здоровье",
        memory: "",
        color: "Blue",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Электрическая зубная щётка Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 89,
        name: "Xiaomi Oscillation Electric Toothbrush WHITE",
        category: "Красота и здоровье",
        memory: "",
        color: "White",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Электрическая зубная щётка Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 90,
        name: "Xiaomi Electric Shaver S200 Silver",
        category: "Красота и здоровье",
        memory: "",
        color: "Silver",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Электробритва Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 91,
        name: "Xiaomi Electric Shaver S700",
        category: "Красота и здоровье",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Электробритва Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 92,
        name: "Xiaomi High-speed Ionic Hair Dryer EU",
        category: "Красота и здоровье",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Фен Xiaomi с ионизацией.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // УМНЫЙ ДОМ
    // ========================================================

    {
        id: 93,
        name: "Xiaomi Outdoor Camera BW300",
        category: "Умный дом",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Уличная камера видеонаблюдения Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 94,
        name: "Xiaomi Smart Camera C500 EU",
        category: "Умный дом",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умная камера Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 95,
        name: "Mi Smart Speaker",
        category: "Умный дом",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умная колонка Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 96,
        name: "Xiaomi Smart Standing Air Circulation Fan EU",
        category: "Умный дом",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умный вентилятор Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 97,
        name: "Xiaomi Smart Kettle 2 Pro EU",
        category: "Умный дом",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умный чайник Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // МАРШРУТИЗАТОРЫ
    // ========================================================

    {
        id: 98,
        name: "Xiaomi Mesh System AC1200 RU 1-pack",
        category: "Сеть",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Mesh-система Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 99,
        name: "Xiaomi Mesh System AC1200 RU 2-pack",
        category: "Сеть",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Mesh-система Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 100,
        name: "Xiaomi Mesh System AX3000 NE 2-pack RU",
        category: "Сеть",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Mesh-система Xiaomi AX3000.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 101,
        name: "Xiaomi Router AX1500",
        category: "Сеть",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Wi-Fi роутер Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 102,
        name: "Xiaomi Router AX3000T RU",
        category: "Сеть",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Wi-Fi роутер Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // МАССАЖЕРЫ
    // ========================================================

    {
        id: 103,
        name: "Xiaomi Massage Gun 2",
        category: "Красота и здоровье",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Массажный пистолет Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 104,
        name: "Xiaomi Massage Gun mini 2",
        category: "Красота и здоровье",
        memory: "",
        color: "",

        display: 0,
        warehouse: 2,

        manualLocation: true,

        description:
            "Компактный массажер Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // ДАЛЬНОМЕР
    // ========================================================

    {
        id: 105,
        name: "Xiaomi Smart Laser Measure",
        category: "Инструменты",
        memory: "",
        color: "",

        display: 0,
        warehouse: 4,

        manualLocation: true,

        description:
            "Лазерный дальномер Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // АКСЕССУАРЫ — ЗАРЯДКИ
    // ========================================================

    {
        id: 106,
        name: "Xiaomi 67W Car Charger USB-A + Type-C",
        category: "Зарядные устройства",
        memory: "",
        color: "",

        display: 0,
        warehouse: 3,

        manualLocation: true,

        description:
            "Автомобильное зарядное устройство Xiaomi 67W.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 107,
        name: "Mi 37W Dual-Port Car Charger",
        category: "Зарядные устройства",
        memory: "",
        color: "",

        display: 0,
        warehouse: 3,

        manualLocation: true,

        description:
            "Автомобильное зарядное устройство Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },


    // ========================================================
    // ПРОЧЕЕ
    // ========================================================

    {
        id: 108,
        name: "Xiaomi Monitor A24i",
        category: "Мониторы",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Монитор Xiaomi A24i.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 109,
        name: "Xiaomi Gaming Mouse Lite",
        category: "Компьютерные аксессуары",
        memory: "",
        color: "",

        display: 0,
        warehouse: 4,

        manualLocation: true,

        description:
            "Игровая компьютерная мышь Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 110,
        name: "Xiaomi Wireless Mouse 3 Pink",
        category: "Компьютерные аксессуары",
        memory: "",
        color: "Pink",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Беспроводная мышь Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 111,
        name: "Xiaomi Wireless Mouse Comfort Edition White",
        category: "Компьютерные аксессуары",
        memory: "",
        color: "White",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Беспроводная мышь Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 112,
        name: "Xiaomi Desktop Heater EU",
        category: "Климат",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Настольный обогреватель Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 113,
        name: "Xiaomi Smart Water Dispenser Hot and Cold",
        category: "Кухня",
        memory: "",
        color: "",

        display: 0,
        warehouse: 1,

        manualLocation: true,

        description:
            "Умный диспенсер для воды Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    },

    {
        id: 114,
        name: "Xiaomi Smart Filtered Water Dispenser Pro EU",
        category: "Кухня",
        memory: "",
        color: "",

        display: 0,
        warehouse: 3,

        manualLocation: true,

        description:
            "Умный диспенсер для фильтрованной воды Xiaomi.",

        specs: {},

        tip:
            "Расположение выставляется вручную."
    }

];


// ============================================================
// LOCAL STORAGE
// ============================================================

function saveProducts() {

    localStorage.setItem(
        "xiaomiWebBaseProducts",
        JSON.stringify(products)
    );

}


function loadProducts() {

    const savedProducts =
        localStorage.getItem(
            "xiaomiWebBaseProducts"
        );


    if (!savedProducts) {
        return;
    }


    try {

        const parsedProducts =
            JSON.parse(savedProducts);


        if (Array.isArray(parsedProducts)) {

            products.length = 0;

            products.push(...parsedProducts);

        }

    } catch (error) {

        console.error(
            "Ошибка загрузки товаров:",
            error
        );

    }

}


// ============================================================
// ELEMENTS
// ============================================================

const productsList =
    document.getElementById("productsList");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const productDetails =
    document.getElementById("productDetails");

const categoryButtons =
    document.querySelectorAll(".category-button");


// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts(productsToRender) {

    if (!productsList) {
        return;
    }


    productsList.innerHTML = "";


    if (productsToRender.length === 0) {

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


    productsToRender.forEach(product => {

        const display =
            Number(product.display || 0);

        const warehouse =
            Number(product.warehouse || 0);

        const total =
            display + warehouse;


        const card =
            document.createElement("div");


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
                        ? product.memory + " · "
                        : ""
                }

                ${product.color || ""}

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


        productsList.appendChild(card);

    });

}


// ============================================================
// SEARCH
// ============================================================

function searchProducts() {

    if (!searchInput) {
        return;
    }


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (query === "") {

        renderProducts(products);

        return;

    }


    const results =
        products.filter(product => {

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


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchProducts();

            }

        }
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ============================================================
// CATEGORIES
// ============================================================

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const category =
                button.dataset.category;


            categoryButtons.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            if (searchInput) {

                searchInput.value = "";

            }


            if (category === "Все") {

                renderProducts(products);

                return;

            }


            const filteredProducts =
                products.filter(product => {

                    return (
                        product.category ===
                        category
                    );

                });


            renderProducts(
                filteredProducts
            );

        }
    );

});


// ============================================================
// PRODUCT PAGE
// ============================================================

function renderProductPage() {

    if (!productDetails) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        Number(params.get("id"));


    const product =
        products.find(
            item => item.id === productId
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


    renderProduct(product);

}


// ============================================================
// PRODUCT DETAILS
// ============================================================

function renderProduct(product) {

    const display =
        Number(product.display || 0);

    const warehouse =
        Number(product.warehouse || 0);

    const total =
        display + warehouse;


    let specsHTML = "";


    if (
        product.specs &&
        Object.keys(product.specs).length > 0
    ) {

        specsHTML =
            Object.entries(product.specs)

                .map(([key, value]) => `

                    <div class="spec-row">

                        <span>
                            ${key}
                        </span>

                        <strong>
                            ${value}
                        </strong>

                    </div>

                `)

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


    setupQuantityButtons(product);

}


// ============================================================
// QUANTITY BUTTONS
// ============================================================

function setupQuantityButtons(product) {

    const buttons =
        document.querySelectorAll(
            ".quantity-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.type;


                const action =
                    button.dataset.action;


                if (action === "plus") {

                    product[type] =
                        Number(product[type]) + 1;

                }


                if (action === "minus") {

                    if (
                        Number(product[type]) > 0
                    ) {

                        product[type] =
                            Number(product[type]) - 1;

                    }

                }


                saveProducts();

                renderProduct(product);

            }
        );

    });

}


// ============================================================
// START
// ============================================================

loadProducts();


if (productsList) {

    renderProducts(products);

}


if (productDetails) {

    renderProductPage();

}