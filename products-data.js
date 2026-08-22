const products = [

    // =========================================================
    // СМАРТФОНЫ
    // =========================================================

    {
        id: 1,
        name: "REDMI 17 4GB+128GB Blue",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Blue",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 17990
    },

    {
        id: 2,
        name: "REDMI 17 4GB+128GB Green",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Green",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 17990
    },

    {
        id: 3,
        name: "REDMI 17 4GB+128GB Purple",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Purple",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 17990
    },

    {
        id: 4,
        name: "REDMI 17 4GB+128GB Dark Black",
        category: "Смартфоны",
        memory: "4 / 128 GB",
        color: "Dark Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 17990,
        ldu: true
    },

    {
        id: 5,
        name: "REDMI 17 8GB+256GB Dark Black",
        category: "Смартфоны",
        memory: "8 / 256 GB",
        color: "Dark Black",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 24990
    },

    {
        id: 6,
        name: "Xiaomi 17 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 74990,
        ldu: true
    },

    {
        id: 7,
        name: "Xiaomi 17 Ultra 16GB+512GB Black",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "Black",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 119990
    },

    {
        id: 8,
        name: "Xiaomi 17 Ultra 16GB+512GB White",
        category: "Смартфоны",
        memory: "16 / 512 GB",
        color: "White",
        stock: 3,
        display: 1,
        warehouse: 2,
        price: 119990,
        ldu: true
    },

    {
        id: 9,
        name: "Xiaomi 17T 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",
        stock: 10,
        display: 1,
        warehouse: 9,
        price: 48990,
        ldu: true
    },

    {
        id: 10,
        name: "Xiaomi 17T 12GB+256GB Blue",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Blue",
        stock: 7,
        display: 0,
        warehouse: 7,
        price: 48990
    },

    {
        id: 11,
        name: "Xiaomi 17T 12GB+256GB Violet",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Violet",
        stock: 6,
        display: 0,
        warehouse: 6,
        price: 48990
    },

    {
        id: 12,
        name: "Xiaomi 17T 12GB+512GB Black",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",
        stock: 9,
        display: 0,
        warehouse: 9,
        price: 53990
    },

    {
        id: 13,
        name: "Xiaomi 17T 12GB+512GB Blue",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Blue",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 53990
    },

    {
        id: 14,
        name: "Xiaomi 17T Pro 12GB+1024GB Black",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Black",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 81990
    },

    {
        id: 15,
        name: "Xiaomi 17T Pro 12GB+1024GB Deep Violet",
        category: "Смартфоны",
        memory: "12 / 1024 GB",
        color: "Deep Violet",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 81990
    },

    {
        id: 16,
        name: "Xiaomi 17T Pro 12GB+256GB Black",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Black",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 66990
    },

    {
        id: 17,
        name: "Xiaomi 17T Pro 12GB+256GB Deep Blue",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Blue",
        stock: 5,
        display: 1,
        warehouse: 4,
        price: 66990,
        ldu: true
    },

    {
        id: 18,
        name: "Xiaomi 17T Pro 12GB+256GB Deep Violet",
        category: "Смартфоны",
        memory: "12 / 256 GB",
        color: "Deep Violet",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 66990
    },

    {
        id: 19,
        name: "Xiaomi 17T Pro 12GB+512GB Black",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Black",
        stock: 8,
        display: 0,
        warehouse: 8,
        price: 71990
    },

    {
        id: 20,
        name: "Xiaomi 17T Pro 12GB+512GB Deep Blue",
        category: "Смартфоны",
        memory: "12 / 512 GB",
        color: "Deep Blue",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 71990
    },


    // =========================================================
    // ПЛАНШЕТЫ
    // =========================================================

    {
        id: 21,
        name: "REDMI Pad 2 4GB+128GB Graphite Gray",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 14390
    },

    {
        id: 22,
        name: "REDMI Pad 2 4G 4GB+256GB Graphite Gray",
        category: "Планшеты",
        memory: "4 / 256 GB",
        color: "Graphite Gray",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 19990
    },

    {
        id: 23,
        name: "REDMI Pad 2 9.7 4G 4GB+128GB Graphite Gray",
        category: "Планшеты",
        memory: "4 / 128 GB",
        color: "Graphite Gray",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 17490
    },

    {
        id: 24,
        name: "REDMI Pad 2 Pro 5G 8GB+256GB Graphite Gray",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Graphite Gray",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 35990
    },

    {
        id: 25,
        name: "REDMI Pad 2 Pro 5G 8GB+256GB Silver",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 35990
    },

    {
        id: 26,
        name: "REDMI Pad 2 Pro 8GB+256GB Silver",
        category: "Планшеты",
        memory: "8 / 256 GB",
        color: "Silver",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 30990
    },

    {
        id: 27,
        name: "Xiaomi Pad 8 8GB+128GB Black",
        category: "Планшеты",
        memory: "8 / 128 GB",
        color: "Black",
        stock: 1,
        display: 0,
        warehouse: 1
    },


    // =========================================================
    // СМАРТ-ЧАСЫ
    // =========================================================

    {
        id: 28,
        name: "Redmi Watch 5 Obsidian Black",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 6990,
        ldu: true
    },

    {
        id: 29,
        name: "Xiaomi Watch S4 41mm Leather Strap White",
        category: "Смарт-часы",
        memory: "",
        color: "White",
        stock: 2,
        display: 2,
        warehouse: 0,
        price: 8990,
        ldu: true
    },

    {
        id: 30,
        name: "REDMI Watch 6 Active Matte Silver",
        category: "Смарт-часы",
        memory: "",
        color: "Matte Silver",
        stock: 6,
        display: 6,
        warehouse: 0,
        price: 3890
    },

    {
        id: 31,
        name: "REDMI Watch 6 Active Midnight Black",
        category: "Смарт-часы",
        memory: "",
        color: "Midnight Black",
        stock: 8,
        display: 8,
        warehouse: 0,
        price: 3890
    },

    {
        id: 32,
        name: "REDMI Watch 6 Active Sunset Orange",
        category: "Смарт-часы",
        memory: "",
        color: "Sunset Orange",
        stock: 4,
        display: 4,
        warehouse: 0,
        price: 3890
    },

    {
        id: 33,
        name: "REDMI Watch 6 Lite Black",
        category: "Смарт-часы",
        memory: "",
        color: "Black",
        stock: 8,
        display: 8,
        warehouse: 0,
        price: 6490
    },

    {
        id: 34,
        name: "REDMI Watch 6 Lite Steel Gray",
        category: "Смарт-часы",
        memory: "",
        color: "Steel Gray",
        stock: 7,
        display: 7,
        warehouse: 0,
        price: 6490
    },

    {
        id: 35,
        name: "Redmi Watch 6 Obsidian Black",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",
        stock: 3,
        display: 3,
        warehouse: 0,
        price: 8990
    },

    {
        id: 36,
        name: "REDMI Watch 6 Obsidian Black Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Obsidian Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        ldu: true,
        demo: true
    },

    {
        id: 37,
        name: "REDMI Watch 6 Silver Gray",
        category: "Смарт-часы",
        memory: "",
        color: "Silver Gray",
        stock: 5,
        display: 5,
        warehouse: 0,
        price: 8990
    },

    {
        id: 38,
        name: "Xiaomi Watch 5 Demo Black Strap",
        category: "Смарт-часы",
        memory: "",
        color: "Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        ldu: true,
        demo: true
    },

    {
        id: 39,
        name: "Xiaomi Watch S4 41mm Fluororubber Strap Black",
        category: "Смарт-часы",
        memory: "",
        color: "Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 11990
    },

    {
        id: 40,
        name: "Xiaomi Watch S5 46mm Black",
        category: "Смарт-часы",
        memory: "",
        color: "Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 15990
    },

    {
        id: 41,
        name: "Xiaomi Watch S5 46mm Ceramic Blue",
        category: "Смарт-часы",
        memory: "",
        color: "Ceramic Blue",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 17990
    },

    {
        id: 42,
        name: "Xiaomi Watch S5 46mm Jungle Green",
        category: "Смарт-часы",
        memory: "",
        color: "Jungle Green",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 17990
    },

    {
        id: 43,
        name: "Xiaomi Watch S5 46mm Silver",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 15990
    },

    {
        id: 44,
        name: "Xiaomi Watch S5 46mm Silver Demo",
        category: "Смарт-часы",
        memory: "",
        color: "Silver",
        stock: 1,
        display: 1,
        warehouse: 0,
        ldu: true,
        demo: true
    },


    // =========================================================
    // ФИТНЕС-БРАСЛЕТЫ
    // =========================================================

    {
        id: 45,
        name: "Xiaomi Smart Band 10 Midnight Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",
        stock: 5,
        display: 5,
        warehouse: 0,
        price: 4690
    },

    {
        id: 46,
        name: "Xiaomi Smart Band 10 Pro Ceramic Edition Pearl White",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pearl White",
        stock: 2,
        display: 2,
        warehouse: 0,
        price: 8790
    },

    {
        id: 47,
        name: "Xiaomi Smart Band 10 Pro Demo Midnight Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        ldu: true,
        demo: true
    },

    {
        id: 48,
        name: "Xiaomi Smart Band 10 Pro Midnight Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Midnight Black",
        stock: 4,
        display: 4,
        warehouse: 0,
        price: 7290
    },

    {
        id: 49,
        name: "Xiaomi Smart Band 11 Active Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",
        stock: 8,
        display: 8,
        warehouse: 0,
        price: 2890
    },

    {
        id: 50,
        name: "Xiaomi Smart Band 11 Active Gray",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Gray",
        stock: 9,
        display: 9,
        warehouse: 0,
        price: 2890
    },

    {
        id: 51,
        name: "Xiaomi Smart Band 11 Active Pomelo Pink",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Pomelo Pink",
        stock: 4,
        display: 4,
        warehouse: 0,
        price: 2890
    },

    {
        id: 52,
        name: "Xiaomi Smart Band 9 Active Black",
        category: "Фитнес-браслеты",
        memory: "",
        color: "Black",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 2390
    },


    // =========================================================
    // НАУШНИКИ
    // =========================================================

    {
        id: 53,
        name: "Xiaomi OpenWear Stereo Pro Graphite Black",
        category: "Наушники",
        memory: "",
        color: "Graphite Black",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 9990
    },

    {
        id: 54,
        name: "Redmi Buds 8 Active Black",
        category: "Наушники",
        memory: "",
        color: "Black",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 1890
    },

    {
        id: 55,
        name: "Redmi Buds 8 Active White",
        category: "Наушники",
        memory: "",
        color: "White",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 1890
    },

    {
        id: 56,
        name: "REDMI Buds 8 Pro Cloud White",
        category: "Наушники",
        memory: "",
        color: "Cloud White",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 6990
    },

    {
        id: 57,
        name: "REDMI Buds 8 Pro Obsidian Black",
        category: "Наушники",
        memory: "",
        color: "Obsidian Black",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 6990
    },

    {
        id: 58,
        name: "Xiaomi OpenWear Stereo Pro Sand Gold",
        category: "Наушники",
        memory: "",
        color: "Sand Gold",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 14990
    },

    {
        id: 59,
        name: "Xiaomi OpenWear Stereo Pro Titan Gray",
        category: "Наушники",
        memory: "",
        color: "Titan Gray",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 14990
    },

    {
        id: 60,
        name: "REDMI Headphones Neo LDU-White",
        category: "Наушники",
        memory: "",
        color: "White",
        stock: 1,
        display: 1,
        warehouse: 0,
        price: 5990,
        ldu: true
    },

    {
        id: 61,
        name: "REDMI Buds 8 Black",
        category: "Наушники",
        memory: "",
        color: "Black",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 4290
    },

    {
        id: 62,
        name: "REDMI Buds 8 White",
        category: "Наушники",
        memory: "",
        color: "White",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 4290
    },

    {
        id: 63,
        name: "REDMI Buds 8 Lite Black",
        category: "Наушники",
        memory: "",
        color: "Black",
        stock: 7,
        display: 0,
        warehouse: 7,
        price: 2490
    },

    {
        id: 64,
        name: "REDMI Buds 8 Lite Blue",
        category: "Наушники",
        memory: "",
        color: "Blue",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 2490
    },

    {
        id: 65,
        name: "REDMI Buds 8 Lite White",
        category: "Наушники",
        memory: "",
        color: "White",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 2490
    },

    {
        id: 66,
        name: "Xiaomi Buds 6 Ceramic White",
        category: "Наушники",
        memory: "",
        color: "Ceramic White",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 10490
    },

    {
        id: 67,
        name: "Xiaomi Buds 6 Graphite Black",
        category: "Наушники",
        memory: "",
        color: "Graphite Black",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 10490
    },

    {
        id: 68,
        name: "Xiaomi Buds 6 Nebula Purple",
        category: "Наушники",
        memory: "",
        color: "Nebula Purple",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 10490
    },

    {
        id: 69,
        name: "Xiaomi Buds 6 Titan Gray",
        category: "Наушники",
        memory: "",
        color: "Titan Gray",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 10490
    },


    // =========================================================
    // ПЫЛЕСОСЫ
    // =========================================================
    // Пока всё считается складом.
    // Витрину потом выставишь вручную.

    {
        id: 70,
        name: "Xiaomi Vacuum Cleaner G30 Max EU",
        category: "Пылесосы",
        memory: "",
        color: "",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 33990
    },

    {
        id: 71,
        name: "Xiaomi Vacuum Cleaner P30 EU",
        category: "Пылесосы",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 6990
    },

    {
        id: 72,
        name: "Xiaomi Dust Mite Vacuum Cleaner Pro EU",
        category: "Пылесосы",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 7990
    },

    {
        id: 73,
        name: "Xiaomi Robot Vacuum 5 EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 57990
    },

    {
        id: 74,
        name: "Xiaomi Robot Vacuum 5 Pro EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 69990
    },

    {
        id: 75,
        name: "Xiaomi Robot Vacuum E5 Black EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 8990
    },

    {
        id: 76,
        name: "Xiaomi Robot Vacuum H40 EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 24990
    },

    {
        id: 77,
        name: "Xiaomi Robot Vacuum H50 EU",
        category: "Роботы-пылесосы",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 31990
    },


    // =========================================================
    // АЭРОГРИЛИ
    // =========================================================

    {
        id: 78,
        name: "Xiaomi Air Fryer Essential 6L EU",
        category: "Аэрогрили",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 7490
    },

    {
        id: 79,
        name: "Xiaomi Dual Zone Air Fryer 10L EU",
        category: "Аэрогрили",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 14990
    },

    {
        id: 80,
        name: "Xiaomi Dual Zone Air Fryer 12L EU",
        category: "Аэрогрили",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 16990
    },

    {
        id: 81,
        name: "Xiaomi Smart Air Fryer 6.5L White",
        category: "Аэрогрили",
        memory: "",
        color: "White",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 11990
    },

    {
        id: 82,
        name: "Xiaomi Smart Air Fryer 6.5L Black EU",
        category: "Аэрогрили",
        memory: "",
        color: "Black",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 11990
    },


    // =========================================================
    // ОЧИСТИТЕЛИ / УВЛАЖНИТЕЛИ
    // =========================================================

    {
        id: 83,
        name: "Mijia Smart Air Purifier 6 EU",
        category: "Очистители воздуха",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 17990
    },

    {
        id: 84,
        name: "Mijia Smart Air Purifier Max EU",
        category: "Очистители воздуха",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 39990
    },

    {
        id: 85,
        name: "Xiaomi Smart Air Purifier 4 Lite EU",
        category: "Очистители воздуха",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 16490
    },

    {
        id: 86,
        name: "Xiaomi Smart Air Purifier Elite",
        category: "Очистители воздуха",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 39990
    },

    {
        id: 87,
        name: "Mijia Smart Evaporative Humidifier Pro EU",
        category: "Увлажнители",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 9990
    },


    // =========================================================
    // ТОВАРЫ ДЛЯ ЖИВОТНЫХ
    // =========================================================

    {
        id: 88,
        name: "Xiaomi Smart Pet Food Feeder 2 EU",
        category: "Товары для животных",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 9990
    },

    {
        id: 89,
        name: "Xiaomi Smart Pet Fountain 2",
        category: "Товары для животных",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 5490
    },


    // =========================================================
    // КАМЕРЫ
    // =========================================================

    {
        id: 90,
        name: "Xiaomi Outdoor Camera BW300",
        category: "Камеры",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 5990
    },

    {
        id: 91,
        name: "Xiaomi Smart Camera C500 EU",
        category: "Камеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4490
    },


    // =========================================================
    // МАРШРУТИЗАТОРЫ
    // =========================================================

    {
        id: 92,
        name: "Xiaomi Mesh System AC1200 RU 1-pack",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2490
    },

    {
        id: 93,
        name: "Xiaomi Mesh System AC1200 RU 2-pack",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4990
    },

    {
        id: 94,
        name: "Xiaomi Mesh System AX3000 NE 2-pack RU",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 9990
    },

    {
        id: 95,
        name: "Xiaomi Router AX1500",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 3490
    },

    {
        id: 96,
        name: "Xiaomi Router AX3000T RU",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4990
    },


    // =========================================================
    // РЕТРАНСЛЯТОРЫ
    // =========================================================

    {
        id: 97,
        name: "Xiaomi Wi-Fi Range Extender AX1500 RU",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2990
    },

    {
        id: 98,
        name: "Mi WiFi Range Extender AC1200 EU",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2490
    },

    {
        id: 99,
        name: "Xiaomi WiFi Range Extender N300 RU",
        category: "Роутеры",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 1490
    },


    // =========================================================
    // ПАУЭРБАНКИ
    // =========================================================

    {
        id: 100,
        name: "Xiaomi Power Bank 20000mAh Integrated Cable",
        category: "Пауэрбанки",
        memory: "20000 mAh",
        color: "Light Gray",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2590
    },

    {
        id: 101,
        name: "Xiaomi 165W Power Bank 10000mAh Integrated Cable",
        category: "Пауэрбанки",
        memory: "10000 mAh",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4190
    },

    {
        id: 102,
        name: "Xiaomi Magnetic Power Bank 6000mAh",
        category: "Пауэрбанки",
        memory: "6000 mAh",
        color: "",
        stock: 8,
        display: 0,
        warehouse: 8,
        price: 3790
    },

    {
        id: 103,
        name: "Xiaomi 33W Power Bank 10000mAh Integrated Cable",
        category: "Пауэрбанки",
        memory: "10000 mAh",
        color: "Tan",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 2490
    },

    {
        id: 104,
        name: "Xiaomi Redmi 18W Fast Charge Power Bank 20000mAh",
        category: "Пауэрбанки",
        memory: "20000 mAh",
        color: "Black",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 2690
    },


    // =========================================================
    // ЗАРЯДНЫЕ УСТРОЙСТВА
    // =========================================================

    {
        id: 105,
        name: "Mi 37W Dual-Port Car Charger",
        category: "Зарядные устройства",
        memory: "",
        color: "",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 1190
    },

    {
        id: 106,
        name: "Xiaomi 67W Car Charger USB-A + Type-C",
        category: "Зарядные устройства",
        memory: "",
        color: "",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 2990
    },


    // =========================================================
    // МАССАЖЁРЫ
    // =========================================================

    {
        id: 107,
        name: "Xiaomi Massage Gun 2",
        category: "Красота и здоровье",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 8990
    },

    {
        id: 108,
        name: "Xiaomi Massage Gun mini 2",
        category: "Красота и здоровье",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 5490
    },


    // =========================================================
    // ФЕН / СТАЙЛЕР
    // =========================================================

    {
        id: 109,
        name: "Xiaomi High-speed Ionic Hair Dryer EU",
        category: "Красота и здоровье",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 6390
    },

    {
        id: 110,
        name: "Xiaomi Cordless Hair Straightener Brush",
        category: "Красота и здоровье",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4890
    },


    // =========================================================
    // ЗУБНЫЕ ЩЁТКИ
    // =========================================================

    {
        id: 111,
        name: "Xiaomi Oscillation Electric Toothbrush Blue",
        category: "Красота и здоровье",
        memory: "",
        color: "Blue",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2490
    },

    {
        id: 112,
        name: "Xiaomi Oscillation Electric Toothbrush White",
        category: "Красота и здоровье",
        memory: "",
        color: "White",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2490
    },


    // =========================================================
    // ВЕНТИЛЯТОРЫ / ОБОГРЕВАТЕЛИ
    // =========================================================

    {
        id: 113,
        name: "Xiaomi Smart Standing Air Circulation Fan EU",
        category: "Климат",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 8990
    },

    {
        id: 114,
        name: "Xiaomi Desktop Heater EU",
        category: "Климат",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 3490
    },


    // =========================================================
    // УМНЫЙ ДОМ
    // =========================================================

    {
        id: 115,
        name: "Mi Temperature and Humidity Monitor Pro",
        category: "Умный дом",
        memory: "",
        color: "",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 2490
    },

    {
        id: 116,
        name: "Xiaomi Mi Light Detection Sensor",
        category: "Умный дом",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 1190
    },

    {
        id: 117,
        name: "Mi Smart Speaker",
        category: "Умный дом",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4990
    },


    // =========================================================
    // ЧАЙНИКИ
    // =========================================================

    {
        id: 118,
        name: "Xiaomi Smart Kettle 2 Pro EU",
        category: "Кухня",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 6490
    },

    {
        id: 119,
        name: "Xiaomi Electric Kettle S1 EU",
        category: "Кухня",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4190
    },


    // =========================================================
    // КОЛОНКИ
    // =========================================================

    {
        id: 120,
        name: "Borofone BR4 Horizon Sports",
        category: "Аудио",
        memory: "",
        color: "Красный",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 999
    },


    // =========================================================
    // ДАЛЬНОМЕР
    // =========================================================

    {
        id: 121,
        name: "Xiaomi Smart Laser Measure",
        category: "Инструменты",
        memory: "",
        color: "",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 4190
    },


    // =========================================================
    // МОНИТОР
    // =========================================================

    {
        id: 122,
        name: "Xiaomi Monitor A24i",
        category: "Мониторы",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 8490
    },


    // =========================================================
    // МЫШИ
    // =========================================================

    {
        id: 123,
        name: "Xiaomi Wireless Mouse 3 Pink",
        category: "Компьютерные аксессуары",
        memory: "",
        color: "Pink",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 1890
    },

    {
        id: 124,
        name: "Xiaomi Gaming Mouse Lite",
        category: "Компьютерные аксессуары",
        memory: "",
        color: "",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 1790
    },

    {
        id: 125,
        name: "Xiaomi Wireless Mouse Comfort Edition White",
        category: "Компьютерные аксессуары",
        memory: "",
        color: "White",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 1390
    },


    // =========================================================
    // СУМКА
    // =========================================================

    {
        id: 126,
        name: "Mi Casual Daypack Pink",
        category: "Аксессуары",
        memory: "",
        color: "Pink",
        stock: 7,
        display: 0,
        warehouse: 7,
        price: 990
    },


    // =========================================================
    // АВТОМОБИЛЬНЫЕ АКСЕССУАРЫ
    // =========================================================

    {
        id: 127,
        name: "Baseus Magnetic Air Vent Car Mount Holder",
        category: "Автоаксессуары",
        memory: "",
        color: "Черный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 799
    },

    {
        id: 128,
        name: "Red Line HOL-07",
        category: "Автоаксессуары",
        memory: "",
        color: "Черный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 399
    },

    {
        id: 129,
        name: "USAMS US-ZJ045",
        category: "Автоаксессуары",
        memory: "",
        color: "Черный",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },


    // =========================================================
    // ПОДСТАВКИ / КАБЕЛИ / АКСЕССУАРЫ
    // =========================================================

    {
        id: 130,
        name: "Xiaomi 3A Braided USB-C to USB-C Cable 1m",
        category: "Кабели",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 690
    },

    {
        id: 131,
        name: "Barn&Hollis USB - Type-C 6A Nylon",
        category: "Кабели",
        memory: "",
        color: "Черный",
        stock: 8,
        display: 0,
        warehouse: 8,
        price: 699
    },

    {
        id: 132,
        name: "Red Line Touch Type-C - Type-C PD 3A",
        category: "Кабели",
        memory: "",
        color: "Черный",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 599
    },

    {
        id: 133,
        name: "Red Line Touch USB - Type-C PD 3A",
        category: "Кабели",
        memory: "",
        color: "Черный",
        stock: 24,
        display: 0,
        warehouse: 24,
        price: 499
    },

    {
        id: 134,
        name: "Red Line Touch USB - Lightning PD 3A",
        category: "Кабели",
        memory: "",
        color: "Черный",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 799
    },


    // =========================================================
    // СТЕКЛА
    // =========================================================

    {
        id: 135,
        name: "Barn&Hollis для Redmi 15 Full Screen",
        category: "Защитные стекла",
        memory: "",
        color: "Черный",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 90
    },

    {
        id: 136,
        name: "Barn&Hollis для Xiaomi 15 Full Screen",
        category: "Защитные стекла",
        memory: "",
        color: "Черный",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 137,
        name: "BLUEO для Xiaomi 15 2.5D Silk Full Cover",
        category: "Защитные стекла",
        memory: "",
        color: "Черный",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 499
    },

    {
        id: 138,
        name: "Borasco для Xiaomi 17T FULL GLUE",
        category: "Защитные стекла",
        memory: "",
        color: "Черный",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 599
    },

    {
        id: 139,
        name: "Borasco для Xiaomi 17T Pro FULL GLUE",
        category: "Защитные стекла",
        memory: "",
        color: "Черный",
        stock: 14,
        display: 0,
        warehouse: 14,
        price: 599
    },


    // =========================================================
    // СТИЛУС
    // =========================================================

    {
        id: 140,
        name: "REDMI Smart Pen",
        category: "Аксессуары для планшетов",
        memory: "",
        color: "White",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 4990
    },


    // =========================================================
    // ЧЕХЛЫ ДЛЯ СМАРТФОНОВ
    // =========================================================

    {
        id: 141,
        name: "Barn&Hollis Redmi Note 14 4G SHOCK EYES Magsafe прозрачный",
        category: "Чехлы",
        memory: "",
        color: "Прозрачный",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 90
    },

    {
        id: 142,
        name: "Barn&Hollis Redmi Note 14 4G SHOCK EYES Magsafe черный",
        category: "Чехлы",
        memory: "",
        color: "Черный",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 90
    },

    {
        id: 143,
        name: "Barn&Hollis Xiaomi 15 Shock Eyes прозрачный",
        category: "Чехлы",
        memory: "",
        color: "Прозрачный",
        stock: 9,
        display: 0,
        warehouse: 9,
        price: 499
    },

    {
        id: 144,
        name: "Barn&Hollis Xiaomi 15T Froasted Case черный",
        category: "Чехлы",
        memory: "",
        color: "Черный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },

    {
        id: 145,
        name: "Barn&Hollis Xiaomi 15T Pro Air Cushion прозрачный",
        category: "Чехлы",
        memory: "",
        color: "Прозрачный",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 146,
        name: "Barn&Hollis Xiaomi 15T Pro Froasted Case черный",
        category: "Чехлы",
        memory: "",
        color: "Черный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },

    {
        id: 147,
        name: "Barn&Hollis Xiaomi 15T Pro Shock Eyes прозрачный",
        category: "Чехлы",
        memory: "",
        color: "Прозрачный",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 499
    },

    {
        id: 148,
        name: "Barn&Hollis Xiaomi 15T Shock Eyes прозрачный",
        category: "Чехлы",
        memory: "",
        color: "Прозрачный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },

    {
        id: 149,
        name: "Borasco Xiaomi 17T Pro Silicone Case синий",
        category: "Чехлы",
        memory: "",
        color: "Синий",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 150,
        name: "Krutoff Redmi Note 15 Pro Clear Case",
        category: "Чехлы",
        memory: "",
        color: "Прозрачный",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },


    // =========================================================
    // ЧЕХЛЫ ДЛЯ ПЛАНШЕТОВ
    // =========================================================

    {
        id: 151,
        name: "Чехол для Redmi Pad 2 Cover Gray",
        category: "Чехлы для планшетов",
        memory: "",
        color: "Gray",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 1990
    },

    {
        id: 152,
        name: "Чехол для Redmi Pad 2 Pro Cover Gray",
        category: "Чехлы для планшетов",
        memory: "",
        color: "Gray",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2490
    },

    {
        id: 153,
        name: "Redmi Pad Pro Keyboard Russia",
        category: "Аксессуары для планшетов",
        memory: "",
        color: "",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 7990
    },


    // =========================================================
    // РЕМЕШКИ ДЛЯ ЧАСОВ
    // =========================================================

    {
        id: 154,
        name: "Barn&Hollis ремешок 20mm керамика белый",
        category: "Ремешки",
        memory: "",
        color: "Белый",
        stock: 8,
        display: 0,
        warehouse: 8,
        price: 999
    },

    {
        id: 155,
        name: "Barn&Hollis ремешок 20mm керамика черный",
        category: "Ремешки",
        memory: "",
        color: "Черный",
        stock: 3,
        display: 0,
        warehouse: 3,
        price: 999
    },

    {
        id: 156,
        name: "Barn&Hollis ремешок 20mm силиконовый белый",
        category: "Ремешки",
        memory: "",
        color: "Белый",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 499
    },

    {
        id: 157,
        name: "Barn&Hollis ремешок 20mm силиконовый магнитный черный",
        category: "Ремешки",
        memory: "",
        color: "Черный",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 499
    },

    {
        id: 158,
        name: "Barn&Hollis ремешок 20mm силиконовый светло-фиолетовый",
        category: "Ремешки",
        memory: "",
        color: "Светло-фиолетовый",
        stock: 6,
        display: 0,
        warehouse: 6,
        price: 499
    },

    {
        id: 159,
        name: "Barn&Hollis ремешок 20mm силиконовый темно-зеленый",
        category: "Ремешки",
        memory: "",
        color: "Темно-зеленый",
        stock: 9,
        display: 0,
        warehouse: 9,
        price: 499
    },

    {
        id: 160,
        name: "Barn&Hollis ремешок 20mm силиконовый темно-серый",
        category: "Ремешки",
        memory: "",
        color: "Темно-серый",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 499
    },

    {
        id: 161,
        name: "Ремешок 20mm силиконовый магнитный бежевый",
        category: "Ремешки",
        memory: "",
        color: "Бежевый",
        stock: 10,
        display: 0,
        warehouse: 10,
        price: 499
    },

    {
        id: 162,
        name: "Ремешок 20mm силиконовый магнитный белый",
        category: "Ремешки",
        memory: "",
        color: "Белый",
        stock: 7,
        display: 0,
        warehouse: 7,
        price: 499
    },

    {
        id: 163,
        name: "Ремешок 20mm силиконовый магнитный изумруд",
        category: "Ремешки",
        memory: "",
        color: "Изумруд",
        stock: 17,
        display: 0,
        warehouse: 17,
        price: 499
    },

    {
        id: 164,
        name: "Ремешок 20mm силиконовый магнитный черный",
        category: "Ремешки",
        memory: "",
        color: "Черный",
        stock: 6,
        display: 0,
        warehouse: 6,
        price: 499
    },

    {
        id: 165,
        name: "Ремешок 20mm силиконовый красный",
        category: "Ремешки",
        memory: "",
        color: "Красный",
        stock: 6,
        display: 0,
        warehouse: 6,
        price: 490
    },

    {
        id: 166,
        name: "Ремешок 20mm силиконовый оранжевый",
        category: "Ремешки",
        memory: "",
        color: "Оранжевый",
        stock: 8,
        display: 0,
        warehouse: 8,
        price: 490
    },

    {
        id: 167,
        name: "Ремешок 20mm универсальный силиконовый темно-синий",
        category: "Ремешки",
        memory: "",
        color: "Темно-синий",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 168,
        name: "Ремешок 22mm металлический магнитный черный",
        category: "Ремешки",
        memory: "",
        color: "Черный",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 169,
        name: "Ремешок 22mm силиконовый магнитный синий",
        category: "Ремешки",
        memory: "",
        color: "Синий",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },

    {
        id: 170,
        name: "Ремешок 22mm силиконовый магнитный черный",
        category: "Ремешки",
        memory: "",
        color: "Черный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },

    {
        id: 171,
        name: "Ремешок для Redmi Watch 4 металлический миланская петля черный",
        category: "Ремешки",
        memory: "",
        color: "Черный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 90
    },

    {
        id: 172,
        name: "Ремешок для Redmi Watch 4 силиконовый темно-синий",
        category: "Ремешки",
        memory: "",
        color: "Темно-синий",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 90
    },


    // =========================================================
    // РЕМЕШКИ MI BAND
    // =========================================================

    {
        id: 173,
        name: "Ремешок для Mi Band 8 Pro нейлон серый",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Серый",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 90
    },

    {
        id: 174,
        name: "Ремешок Mi Band 8/9/10 миланская петля металл черный",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Черный",
        stock: 4,
        display: 0,
        warehouse: 4,
        price: 999
    },

    {
        id: 175,
        name: "Ремешок Mi Band 8/9/10 нейлон волнистый разноцветный",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Разноцветный",
        stock: 18,
        display: 0,
        warehouse: 18,
        price: 90
    },

    {
        id: 176,
        name: "Ремешок Mi Band 8/9/10 силиконовый желтый",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Желтый",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },

    {
        id: 177,
        name: "Ремешок Mi Band 8/9/10 нейлон волнистый белый",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Белый",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 178,
        name: "Ремешок Mi Band 8/9/10 нейлон волнистый оранжевый",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Оранжевый",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 499
    },

    {
        id: 179,
        name: "Ремешок Mi Band 8/9/10 силиконовый красный",
        category: "Ремешки для браслетов",
        memory: "",
        color: "Красный",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 499
    },


    // =========================================================
    // ЩЁТКИ ДЛЯ РОБОТОВ-ПЫЛЕСОСОВ
    // =========================================================

    {
        id: 180,
        name: "Основная щетка Xiaomi Robot Vacuum S20",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 20,
        display: 0,
        warehouse: 20,
        price: 90
    },

    {
        id: 181,
        name: "Основная щетка Xiaomi Robot Vacuum S20+",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 9,
        display: 0,
        warehouse: 9,
        price: 90
    },

    {
        id: 182,
        name: "Основная щетка Xiaomi Robot Vacuum X10/X10 Plus",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 90
    },

    {
        id: 183,
        name: "Основная щетка Xiaomi Robot Vacuum E10/E12",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 5,
        display: 0,
        warehouse: 5,
        price: 90
    },

    {
        id: 184,
        name: "Боковые щетки Xiaomi Robot Vacuum S10/S12 2 шт",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 11,
        display: 0,
        warehouse: 11,
        price: 90
    },

    {
        id: 185,
        name: "Боковые щетки Xiaomi Robot Vacuum S10+ 2 шт",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 10,
        display: 0,
        warehouse: 10,
        price: 90
    },

    {
        id: 186,
        name: "Боковые щетки Xiaomi Robot Vacuum S20 2 шт",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 16,
        display: 0,
        warehouse: 16,
        price: 90
    },

    {
        id: 187,
        name: "Боковые щетки Xiaomi Robot Vacuum S20+ 2 шт",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 9,
        display: 0,
        warehouse: 9,
        price: 90
    },

    {
        id: 188,
        name: "Боковые щетки Xiaomi Robot Vacuum E10/E12 2 шт",
        category: "Аксессуары для пылесосов",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 90
    },


    // =========================================================
    // ПРОЧЕЕ
    // =========================================================

    {
        id: 189,
        name: "Xiaomi SU7 Ultra 1/18 Die-cast Model Car Lightning Yellow",
        category: "Аксессуары",
        memory: "",
        color: "Lightning Yellow",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 13990
    },

    {
        id: 190,
        name: "Умные аудиоочки Mijia Smart Audio Glasses Aviator",
        category: "Умные устройства",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 19990
    },

    {
        id: 191,
        name: "Умные аудиоочки Mijia Smart Audio Glasses Browline",
        category: "Умные устройства",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 19990
    },

    {
        id: 192,
        name: "Xiaomi Instant Photo Paper 3 40 Sheets",
        category: "Аксессуары",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2490
    },

    {
        id: 193,
        name: "Xiaomi Electric Shaver S200 Silver",
        category: "Красота и здоровье",
        memory: "",
        color: "Silver",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 2790
    },

    {
        id: 194,
        name: "Xiaomi Electric Shaver S700",
        category: "Красота и здоровье",
        memory: "",
        color: "",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 8990
    },

    {
        id: 195,
        name: "Mi Smart Scale S200 Dark Grey",
        category: "Красота и здоровье",
        memory: "",
        color: "Dark Grey",
        stock: 1,
        display: 0,
        warehouse: 1,
        price: 1990
    },

    {
        id: 196,
        name: "Xiaomi Body Composition Scale S400",
        category: "Красота и здоровье",
        memory: "",
        color: "",
        stock: 2,
        display: 0,
        warehouse: 2,
        price: 2490
    }

];


// =========================================================
// LOCAL STORAGE
// =========================================================

function saveProducts() {

    localStorage.setItem(
        "xiaomiWebBaseProducts",
        JSON.stringify(products)
    );

}


// =========================================================
// ЗАГРУЗКА
// =========================================================

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


// =========================================================
// ELEMENTS
// =========================================================

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


// =========================================================
// СПИСОК ТОВАРОВ
// =========================================================

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

        const total =
            Number(product.display || 0) +
            Number(product.warehouse || 0);


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

                ${product.memory || ""}

                ${
                    product.memory && product.color
                        ? " · "
                        : ""
                }

                ${product.color || ""}

            </div>


            ${
                product.price
                    ? `
                        <div class="product-price">
                            ${product.price.toLocaleString("ru-RU")} ₽
                        </div>
                      `
                    : ""
            }


            <div class="stock">

                <div class="stock-row">

                    <span>
                        Витрина
                    </span>

                    <span>
                        ${product.display}
                    </span>

                </div>


                <div class="stock-row">

                    <span>
                        Склад
                    </span>

                    <span>
                        ${product.warehouse}
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


// =========================================================
// ПОИСК
// =========================================================

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


// =========================================================
// КНОПКА ПОИСКА
// =========================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


// =========================================================
// ENTER
// =========================================================

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


// =========================================================
// ЖИВОЙ ПОИСК
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// =========================================================
// КАТЕГОРИИ
// =========================================================

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


// =========================================================
// СТРАНИЦА ТОВАРА
// =========================================================

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


// =========================================================
// РЕНДЕР ТОВАРА
// =========================================================

function renderProduct(product) {

    const total =
        Number(product.display || 0) +
        Number(product.warehouse || 0);


    let specsHTML = `

        <p>
            Характеристики пока не добавлены.
        </p>

    `;


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


                ${
                    product.price
                        ? `
                            <div class="product-price">

                                ${product.price.toLocaleString("ru-RU")} ₽

                            </div>
                          `
                        : ""
                }


                <!-- НАЛИЧИЕ -->

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


                            <strong id="displayQuantity">
                                ${product.display}
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


                            <strong id="warehouseQuantity">
                                ${product.warehouse}
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


                <!-- ИНФОРМАЦИЯ -->

                <div class="product-description">

                    <h2>
                        Информация
                    </h2>


                    <p>

                        Остаток товара:
                        <strong>
                            ${product.stock}
                        </strong>
                        шт.

                    </p>

                </div>


                <!-- ПОДСКАЗКА -->

                <div class="product-tip">

                    <h2>
                        Расположение
                    </h2>


                    <p>

                        ${
                            product.display > 0
                                ? `На витрине: ${product.display} шт.`
                                : "На витрине пока нет."
                        }

                        <br>

                        ${
                            product.warehouse > 0
                                ? `На складе: ${product.warehouse} шт.`
                                : "На складе нет."
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


// =========================================================
// КНОПКИ КОЛИЧЕСТВА
// =========================================================

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


                /*
                 * Общий остаток не должен
                 * автоматически исчезать.
                 *
                 * При ручном изменении витрины
                 * мы просто меняем расположение
                 * товара.
                 */


                saveProducts();


                renderProduct(product);

            }
        );

    });

}


// =========================================================
// ЗАПУСК
// =========================================================

loadProducts();


if (productsList) {

    renderProducts(products);

}


if (productDetails) {

    renderProductPage();

}