// hooks/useFormCalculations.js
export const useFormCalculations = (form) => {
    const calculateTotals = () => {
        const itemsSubtotal = form.items.reduce((sum, item) => {
            return sum + (parseFloat(item.total) || 0);
        }, 0);

        const globalDiscountPercent = parseFloat(form.discount_percent) || 0;
        const globalDiscount = itemsSubtotal * (globalDiscountPercent / 100);

        const subtotalAfterDiscount = itemsSubtotal - globalDiscount;

        const additionalExpensesPercent = parseFloat(form.additional_expenses_percent) || 0;
        const additionalExpenses = subtotalAfterDiscount * (additionalExpensesPercent / 100);

        const taxBase = subtotalAfterDiscount + additionalExpenses;

        let tax = 0;
        if (itemsSubtotal > 0) {
            form.items.forEach(item => {
                const itemTotal = parseFloat(item.total) || 0;
                const itemProportion = itemTotal / itemsSubtotal;
                const itemTaxBase = taxBase * itemProportion;
                const itemTaxRate = parseFloat(item.tax_rate) || 0;
                const itemTax = itemTaxBase * (itemTaxRate / 100);
                tax += itemTax;
            });
        }

        let total = taxBase + tax;

        if (form.rounding) {
            total = Math.round(total);
        }

        return {
            itemsSubtotal,
            globalDiscount,
            subtotalAfterDiscount,
            additionalExpenses,
            taxBase,
            tax,
            total
        };
    };

    return calculateTotals();
};
