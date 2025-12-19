/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, quantity, sale_price } = purchase;

    const discountDecimal = discount * (1 / 100) * sale_price;
    return (sale_price - discountDecimal) * quantity;

    // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;

    const position = index;

    if (position === 0) {
        return profit * 0.15;
    } else if (position === 1 || position === 2) {
        return profit * 0.10;
    } else if (position === total - 1) {
        return profit * 0;
    } else {
        return profit * 0.05;
    }
    // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data || typeof data !== "object") {
        throw new Error('Данные должны быть объектом');
    }
    // @TODO: Проверка наличия опций
    if (!options || typeof options !== "object") {
        throw new Error('Не переданы опции');
    }
    if (!data.sellers || !data.products || !data.purchase_records || !data.purchase_records.length) {
        throw new Error('Дата должная содержать свойства sellers, products, purchase_records');
    }
    // @TODO: Подготовка промежуточных данных для сбора статистики

    const sellersStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        profit: 0,
        revenue: 0,
        sales_count: 0,
        products_sold: {}
    }));
    const productsIndex = {};
    const sellersIndex = {};
    const { calculateRevenue, calculateBonus } = options;
    if (typeof calculateRevenue !== "function" || typeof calculateBonus !== "function") {
        throw new Error('Опции должны быть функцией');
    };

    // @TODO: Индексация продавцов и товаров для быстрого доступа


    sellersStats.forEach(seller => {
        sellersIndex[seller.id] = seller;
    });

    data.products.forEach(product => {
        productsIndex[product.sku] = product;
    });

    // @TODO: Расчет выручки и прибыли для каждого продавца

    data.purchase_records.forEach(record => {
        const seller = sellersIndex[record.seller_id];

        seller.sales_count++;
        seller.revenue += record.total_amount - record.total_discount;
        record.items.forEach(item => {
            const product = productsIndex[item.sku];
            const cost = product.purchase_price * item.quantity;
            const revenue = calculateRevenue(item, product);
            const profit = revenue - cost;
            seller.profit += profit;

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        })
    });
    // @TODO: Сортировка продавцов по прибыли

    sellersStats.sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования

    sellersStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellersStats.length, seller);

        const array = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10)
        seller.top_products = array;
    });

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellersStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }))
};


