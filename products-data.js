// ======================================================
// XIAOMI WEBBASE — PRODUCTS DATABASE
// Версия: 22.08.2026
// ======================================================
//
// ЛОГИКА НАЛИЧИЯ:
//
// СМАРТФОНЫ:
// LDU = выставочный экземпляр.
// Если LDU = 1 → 1 на витрине, остальные на складе.
// Если LDU = 2 → 2 на витрине, остальные на складе.
//
// ПЛАНШЕТЫ:
// Пока весь остаток считается складом.
// Витрину можно будет выставить вручную.
//
// ЧАСЫ:
// Все имеющиеся часы считаются находящимися на витрине,
// потому что они висят на крючках.
// LDU отдельно не вычитаем.
//
// ФИТНЕС-БРАСЛЕТЫ:
// Та же логика, что и часы.
//
// ПЫЛЕСОСЫ / ОЧИСТИТЕЛИ / УВЛАЖНИТЕЛИ / КОРМУШКИ
// и т.д.:
// Пока склад = весь остаток.
// Витрину потом выставишь вручную.
//
// ПФ:
// Полностью игнорируется.
// ======================================================


// ======================================================
// VERSION
// ======================================================

const DATA_VERSION = "2026-08-22-v2";


// ======================================================
// PRODUCTS
// ======================================================

const products = [

    // ==================================================
    // СМАРТФОНЫ
    // ==================================================

    {
        id: 1,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Dark Black",

        stock: 1,
        ldu: 0,

        description:
            "Смартфон Redmi 17 с большим экраном и хорошей автономностью.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Dark Black"
        },

        tip:
            "Хороший вариант для повседневного использования."
    },

    {
        id: 2,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Blue",

        stock: 1,
        ldu: 0,

        description:
            "Смартфон Redmi 17 в синем цвете.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Blue"
        },

        tip:
            "Подходит для повседневных задач и мультимедиа."
    },

    {
        id: 3,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Green",

        stock: 1,
        ldu: 0,

        description:
            "Смартфон Redmi 17 в зеленом цвете.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Green"
        },

        tip:
            "Хороший вариант для повседневного использования."
    },

    {
        id: 4,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Purple",

        stock: 1,
        ldu: 0,

        description:
            "Смартфон Redmi 17 в фиолетовом цвете.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Purple"
        },

        tip:
            "Можно предложить покупателю, которому важен необычный цвет."
    },

    {
        id: 5,
        name: "REDMI 17",
        category: "Смартфоны",
        memory: "8 / 256 GB",
        color: "Dark Black",

        stock: 1,
        ldu: 0,

        description:
            "Redmi 17 с увеличенным объёмом оперативной и встроенной памяти.",

        specs: {
            "Память": "8 / 256 GB",
            "Цвет": "Dark Black"
        },

        tip:
            "Хороший вариант, если покупателю нужно больше памяти."
    },

    {
        id: 6,
        name: "Xiaomi 17",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        stock: 1,
        ldu: 0,

        description:
            "Флагманский смартфон Xiaomi 17.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Black"
        },

        tip:
            "Для покупателя, который хочет производительный смартфон Xiaomi."
    },

    {
        id: 7,
        name: "Xiaomi 17 Ultra",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "Black",

        stock: 3,
        ldu: 0,

        description:
            "Флагман Xiaomi 17 Ultra с максимальной конфигурацией памяти.",

        specs: {
            "Память": "16 / 512 GB",
            "Цвет": "Black"
        },

        tip:
            "Флагманский вариант для покупателя, которому важны камера и максимальная производительность."
    },

    {
        id: 8,
        name: "Xiaomi 17 Ultra",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "White",

        stock: 2,
        ldu: 0,

        description:
            "Флагман Xiaomi 17 Ultra в белом цвете.",

        specs: {
            "Память": "16 / 512 GB",
            "Цвет": "White"
        },

        tip:
            "Премиальный флагман Xiaomi."
    },

    {
        id: 9,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        stock: 9,
        ldu: 0,

        description:
            "Производительный смартфон Xiaomi 17T.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Black"
        },

        tip:
            "Хороший универсальный смартфон для требовательного пользователя."
    },

    {
        id: 10,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Blue",

        stock: 7,
        ldu: 0,

        description:
            "Xiaomi 17T в синем цвете.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Blue"
        },

        tip:
            "Хороший вариант для производительного повседневного смартфона."
    },

    {
        id: 11,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Violet",

        stock: 6,
        ldu: 0,

        description:
            "Xiaomi 17T в фиолетовом цвете.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Violet"
        },

        tip:
            "Подойдёт покупателю, которому важен необычный внешний вид."
    },

    {
        id: 12,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",

        stock: 9,
        ldu: 0,

        description:
            "Xiaomi 17T с увеличенным объёмом встроенной памяти.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Black"
        },

        tip:
            "Хороший вариант для пользователя, которому требуется много памяти."
    },

    {
        id: 13,
        name: "Xiaomi 17T",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Blue",

        stock: 5,
        ldu: 0,

        description:
            "Xiaomi 17T 12/512 GB в синем цвете.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Blue"
        },

        tip:
            "Большой объём памяти и высокая производительность."
    },

    {
        id: 14,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Black",

        stock: 3,
        ldu: 0,

        description:
            "Xiaomi 17T Pro с 1 ТБ встроенной памяти.",

        specs: {
            "Память": "12 / 1024 GB",
            "Цвет": "Black"
        },

        tip:
            "Для покупателя, которому нужен максимальный объём памяти."
    },

    {
        id: 15,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Deep Violet",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi 17T Pro с 1 ТБ памяти.",

        specs: {
            "Память": "12 / 1024 GB",
            "Цвет": "Deep Violet"
        },

        tip:
            "Премиальная версия с максимальным объёмом памяти."
    },

    {
        id: 16,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",

        stock: 3,
        ldu: 0,

        description:
            "Xiaomi 17T Pro 12/256 GB.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Black"
        },

        tip:
            "Флагманская версия 17T Pro."
    },

    {
        id: 17,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Blue",

        stock: 4,
        ldu: 0,

        description:
            "Xiaomi 17T Pro в синем цвете.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Deep Blue"
        },

        tip:
            "Производительный флагман с ярким цветом корпуса."
    },

    {
        id: 18,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Violet",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi 17T Pro в цвете Deep Violet.",

        specs: {
            "Память": "12 / 256 GB",
            "Цвет": "Deep Violet"
        },

        tip:
            "Премиальный смартфон с необычным цветом."
    },

    {
        id: 19,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",

        stock: 8,
        ldu: 0,

        description:
            "Xiaomi 17T Pro 12/512 GB.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Black"
        },

        tip:
            "Хороший вариант для требовательного пользователя."
    },

    {
        id: 20,
        name: "Xiaomi 17T Pro",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Deep Blue",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi 17T Pro 12/512 GB в синем цвете.",

        specs: {
            "Память": "12 / 512 GB",
            "Цвет": "Deep Blue"
        },

        tip:
            "Производительный смартфон с большим объёмом памяти."
    },


    // ==================================================
    // ПЛАНШЕТЫ
    // ==================================================

    {
        id: 101,
        name: "REDMI Pad 2",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",

        stock: 1,
        ldu: 0,

        description:
            "Планшет Redmi Pad 2 для учёбы, работы и мультимедиа.",

        specs: {
            "Память": "4 / 128 GB",
            "Цвет": "Graphite Gray"
        },

        tip:
            "Хороший вариант для видео, учёбы и повседневных задач."
    },

    {
        id: 102,
        name: "REDMI Pad 2",
        category: "Планшеты",
        memory: "4 / 128 GB 4G",
        color: "Graphite Gray",

        stock: 3,
        ldu: 0,

        description:
            "Версия Redmi Pad 2 с поддержкой мобильной связи.",

        specs: {
            "Память": "4 / 128 GB",
            "Связь": "4G",
            "Цвет": "Graphite Gray"
        },

        tip:
            "Подходит покупателю, которому нужен планшет с мобильным интернетом."
    },

    {
        id: 103,
        name: "REDMI Pad 2",
        category: "Планшеты",
        memory: "4 / 256 GB 4G",
        color: "Graphite Gray",

        stock: 1,
        ldu: 0,

        description:
            "Redmi Pad 2 4G с увеличенным объёмом памяти.",

        specs: {
            "Память": "4 / 256 GB",
            "Связь": "4G",
            "Цвет": "Graphite Gray"
        },

        tip:
            "Хороший выбор при необходимости мобильного интернета и большого объёма памяти."
    },

    {
        id: 104,
        name: "REDMI Pad 2 Pro",
        category: "Планшеты",
        memory: "6 / 128 GB",
        color: "Silver",

        stock: 1,
        ldu: 0,

        description:
            "Планшет Redmi Pad 2 Pro.",

        specs: {
            "Память": "6 / 128 GB",
            "Цвет": "Silver"
        },

        tip:
            "Подходит для мультимедиа, работы и учёбы."
    },

    {
        id: 105,
        name: "REDMI Pad 2 Pro 5G",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Graphite Gray",

        stock: 2,
        ldu: 0,

        description:
            "Redmi Pad 2 Pro 5G с большим экраном и поддержкой мобильной сети.",

        specs: {
            "Память": "8 / 256 GB",
            "Связь": "5G",
            "Цвет": "Graphite Gray"
        },

        tip:
            "Хороший вариант для пользователя, которому нужен мобильный планшет."
    },

    {
        id: 106,
        name: "REDMI Pad 2 Pro 5G",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",

        stock: 2,
        ldu: 0,

        description:
            "Redmi Pad 2 Pro 5G в серебристом цвете.",

        specs: {
            "Память": "8 / 256 GB",
            "Связь": "5G",
            "Цвет": "Silver"
        },

        tip:
            "Подходит для работы, учёбы и мультимедиа."
    },

    {
        id: 107,
        name: "REDMI Pad 2 Pro",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",

        stock: 1,
        ldu: 0,

        description:
            "Redmi Pad 2 Pro с 256 GB памяти.",

        specs: {
            "Память": "8 / 256 GB",
            "Цвет": "Silver"
        },

        tip:
            "Хороший вариант для мультимедиа и повседневных задач."
    },

    {
        id: 108,
        name: "Xiaomi Pad 8",
        category: "Планшеты",
        memory: "8 / 128 GB",
        color: "Black",

        stock: 1,
        ldu: 0,

        description:
            "Планшет Xiaomi Pad 8.",

        specs: {
            "Память": "8 / 128 GB",
            "Цвет": "Black"
        },

        tip:
            "Подходит для работы, учёбы и развлечений."
    },


    // ==================================================
    // СМАРТ-ЧАСЫ
    // ==================================================

    {
        id: 201,
        name: "Redmi Watch 5",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        stock: 1,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 5.",

        specs: {
            "Цвет": "Obsidian Black"
        },

        tip:
            "Можно показать покупателю на витрине."
    },

    {
        id: 202,
        name: "REDMI Watch 6 Active",
        category: "Смарт-часы",
        memory: "",
        color: "Matte Silver",

        stock: 6,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6 Active.",

        specs: {
            "Цвет": "Matte Silver"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 203,
        name: "REDMI Watch 6 Active",
        category: "Смарт-часы",
        memory: "",
        color: "Midnight Black",

        stock: 8,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6 Active.",

        specs: {
            "Цвет": "Midnight Black"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 204,
        name: "REDMI Watch 6 Active",
        category: "Смарт-часы",
        memory: "",
        color: "Sunset Orange",

        stock: 4,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6 Active.",

        specs: {
            "Цвет": "Sunset Orange"
        },

        tip:
            "Яркий вариант для покупателя."
    },

    {
        id: 205,
        name: "REDMI Watch 6 Lite",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        stock: 8,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6 Lite.",

        specs: {
            "Цвет": "Black"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 206,
        name: "REDMI Watch 6 Lite",
        category: "Смарт-часы",
        memory: "",
        color: "Steel Gray",

        stock: 7,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6 Lite.",

        specs: {
            "Цвет": "Steel Gray"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 207,
        name: "Redmi Watch 6",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",

        stock: 3,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6.",

        specs: {
            "Цвет": "Obsidian Black"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 208,
        name: "REDMI Watch 6",
        category: "Смарт-часы",
        memory: "",
        color: "Silver Gray",

        stock: 5,
        ldu: 0,

        description:
            "Смарт-часы Redmi Watch 6.",

        specs: {
            "Цвет": "Silver Gray"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 209,
        name: "Xiaomi Watch S4 41mm",
        category: "Смарт-часы",
        memory: "",
        color: "White Leather",

        stock: 2,
        ldu: 0,

        description:
            "Xiaomi Watch S4 41mm с кожаным ремешком.",

        specs: {
            "Размер": "41 мм",
            "Ремешок": "Leather",
            "Цвет": "White"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 210,
        name: "Xiaomi Watch S4 41mm",
        category: "Смарт-часы",
        memory: "",
        color: "Black Fluororubber",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi Watch S4 41mm с ремешком Fluororubber.",

        specs: {
            "Размер": "41 мм",
            "Ремешок": "Fluororubber",
            "Цвет": "Black"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 211,
        name: "Xiaomi Watch S5",
        category: "Смарт-часы",
        memory: "",
        color: "Black",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Размер": "46 мм",
            "Цвет": "Black"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 212,
        name: "Xiaomi Watch S5",
        category: "Смарт-часы",
        memory: "",
        color: "Ceramic Blue",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Размер": "46 мм",
            "Материал": "Ceramic",
            "Цвет": "Blue"
        },

        tip:
            "Премиальный вариант часов."
    },

    {
        id: 213,
        name: "Xiaomi Watch S5",
        category: "Смарт-часы",
        memory: "",
        color: "Jungle Green",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Размер": "46 мм",
            "Цвет": "Jungle Green"
        },

        tip:
            "Часы находятся на витрине."
    },

    {
        id: 214,
        name: "Xiaomi Watch S5",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi Watch S5 46mm.",

        specs: {
            "Размер": "46 мм",
            "Цвет": "Silver"
        },

        tip:
            "Часы находятся на витрине."
    },


    // ==================================================
    // ФИТНЕС-БРАСЛЕТЫ
    // ==================================================

    {
        id: 301,
        name: "Xiaomi Smart Band 10",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        stock: 5,
        ldu: 0,

        description:
            "Фитнес-браслет Xiaomi Smart Band 10.",

        specs: {
            "Цвет": "Midnight Black"
        },

        tip:
            "Браслет находится на витрине."
    },

    {
        id: 302,
        name: "Xiaomi Smart Band 10 Pro",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pearl White Ceramic",

        stock: 2,
        ldu: 0,

        description:
            "Xiaomi Smart Band 10 Pro Ceramic Edition.",

        specs: {
            "Материал": "Ceramic",
            "Цвет": "Pearl White"
        },

        tip:
            "Премиальная версия браслета."
    },

    {
        id: 303,
        name: "Xiaomi Smart Band 10 Pro",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",

        stock: 4,
        ldu: 0,

        description:
            "Xiaomi Smart Band 10 Pro.",

        specs: {
            "Цвет": "Midnight Black"
        },

        tip:
            "Браслет находится на витрине."
    },

    {
        id: 304,
        name: "Xiaomi Smart Band 11 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",

        stock: 8,
        ldu: 0,

        description:
            "Xiaomi Smart Band 11 Active.",

        specs: {
            "Цвет": "Black"
        },

        tip:
            "Браслет находится на витрине."
    },

    {
        id: 305,
        name: "Xiaomi Smart Band 11 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Gray",

        stock: 9,
        ldu: 0,

        description:
            "Xiaomi Smart Band 11 Active.",

        specs: {
            "Цвет": "Gray"
        },

        tip:
            "Браслет находится на витрине."
    },

    {
        id: 306,
        name: "Xiaomi Smart Band 11 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pomelo Pink",

        stock: 4,
        ldu: 0,

        description:
            "Xiaomi Smart Band 11 Active.",

        specs: {
            "Цвет": "Pomelo Pink"
        },

        tip:
            "Браслет находится на витрине."
    },

    {
        id: 307,
        name: "Xiaomi Smart Band 9 Active",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",

        stock: 1,
        ldu: 0,

        description:
            "Xiaomi Smart Band 9 Active.",

        specs: {
            "Цвет": "Black"
        },

        tip:
            "Браслет находится на витрине."
    },


    // ==================================================
    // ТЕХНИКА — ПОКА БЕЗ РАСПРЕДЕЛЕНИЯ ВИТРИНЫ
    // ==================================================

    {
        id: 401,
        name: "Xiaomi Robot Vacuum 5",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum 5.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 402,
        name: "Xiaomi Robot Vacuum 5 Pro",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        stock: 2,
        ldu: 0,

        manualDisplay: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum 5 Pro.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 403,
        name: "Xiaomi Robot Vacuum E5",
        category: "Роботы-пылесосы",
        memory: "",
        color: "Black",

        stock: 2,
        ldu: 0,

        manualDisplay: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum E5.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 404,
        name: "Xiaomi Robot Vacuum H40",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum H40.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 405,
        name: "Xiaomi Robot Vacuum H50",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",

        stock: 2,
        ldu: 0,

        manualDisplay: true,

        description:
            "Робот-пылесос Xiaomi Robot Vacuum H50.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 406,
        name: "Xiaomi Smart Air Purifier 4 Lite",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        stock: 2,
        ldu: 0,

        manualDisplay: true,

        description:
            "Очиститель воздуха Xiaomi Smart Air Purifier 4 Lite.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 407,
        name: "Xiaomi Smart Air Purifier Elite",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Очиститель воздуха Xiaomi Smart Air Purifier Elite.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 408,
        name: "Mijia Smart Air Purifier 6",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Очиститель воздуха Mijia Smart Air Purifier 6.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 409,
        name: "Mijia Smart Air Purifier Max",
        category: "Очистители воздуха",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Очиститель воздуха Mijia Smart Air Purifier Max.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 410,
        name: "Xiaomi Smart Pet Food Feeder 2",
        category: "Для животных",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Умная кормушка для животных Xiaomi.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    },

    {
        id: 411,
        name: "Xiaomi Smart Pet Fountain 2",
        category: "Для животных",
        memory: "",
        color: "",

        stock: 1,
        ldu: 0,

        manualDisplay: true,

        description:
            "Умная поилка Xiaomi.",

        specs: {},

        tip:
            "Расположение на витрине будет выставлено вручную."
    }

];


// ======================================================
// РАСЧЁТ ВИТРИНЫ И СКЛАДА
// ======================================================

products.forEach(product => {

    const stock =
        Number(product.stock || 0);

    const ldu =
        Number(product.ldu || 0);


    // ----------------------------------------------
    // СМАРТФОНЫ
    // ----------------------------------------------

    if (
        product.category === "Смартфоны"
    ) {

        product.display =
            Math.min(ldu, stock);

        product.warehouse =
            Math.max(
                stock - product.display,
                0
            );

        return;
    }


    // ----------------------------------------------
    // ЧАСЫ
    // ----------------------------------------------

    if (
        product.category === "Смарт-часы"
    ) {

        product.display = stock;

        product.warehouse = 0;

        return;
    }


    // ----------------------------------------------
    // ФИТНЕС-БРАСЛЕТЫ
    // ----------------------------------------------

    if (
        product.category === "Фитнес-браслеты"
    ) {

        product.display = stock;

        product.warehouse = 0;

        return;
    }


    // ----------------------------------------------
    // ПЛАНШЕТЫ
    // ----------------------------------------------

    if (
        product.category === "Планшеты"
    ) {

        product.display = 0;

        product.warehouse = stock;

        return;
    }


    // ----------------------------------------------
    // ОСТАЛЬНЫЕ ТОВАРЫ
    // ----------------------------------------------

    product.display =
        Number(product.display || 0);

    product.warehouse =
        Number(product.warehouse ?? stock);

});


// ======================================================
// LOCAL STORAGE
// ======================================================
//
// ВАЖНО:
// При обновлении версии старые тестовые товары
// автоматически удаляются.
//
// После этого изменения количества сохраняются.
// ======================================================

function loadProducts() {

    const savedVersion =
        localStorage.getItem(
            "xiaomiWebBaseDataVersion"
        );


    const savedProducts =
        localStorage.getItem(
            "xiaomiWebBaseProducts"
        );


    // Новая версия базы
    if (
        savedVersion !== DATA_VERSION
    ) {

        localStorage.removeItem(
            "xiaomiWebBaseProducts"
        );

        localStorage.setItem(
            "xiaomiWebBaseDataVersion",
            DATA_VERSION
        );

        return;
    }


    if (!savedProducts) {
        return;
    }


    try {

        const parsedProducts =
            JSON.parse(savedProducts);


        if (
            Array.isArray(parsedProducts)
        ) {

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

    }

}


// ======================================================
// SAVE
// ======================================================

function saveProducts() {

    localStorage.setItem(
        "xiaomiWebBaseProducts",
        JSON.stringify(products)
    );

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
                display + warehouse;


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

                    ${product.memory}

                    ${product.color}

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
        display + warehouse;


    let specsHTML = "";


    if (
        product.specs &&
        Object.keys(product.specs).length > 0
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


                <!-- =================================
                     STOCK
                     ================================= -->

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


                <!-- =================================
                     DESCRIPTION
                     ================================= -->

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


                <!-- =================================
                     SPECS
                     ================================= -->

                <div class="product-specs">

                    <h2>
                        Характеристики
                    </h2>


                    ${specsHTML}

                </div>


                <!-- =================================
                     TIP
                     ================================= -->

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