
// ========================================
// POCKETVIEW - MAIN JAVASCRIPT
// ========================================


// ========================================
// 1. ELEMENTOS DEL DOM
// ========================================

const sidebar = document.querySelector(".sidebar");
const expenseModal = document.getElementById("expenseModal");
const expenseForm = document.getElementById("expenseForm");
const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");

const menuButton = document.getElementById("menuToggle");


// ========================================
// 2. DATOS INICIALES
// ========================================

const initialTransactions = [
    {
        id: 1,
        name: "Supermercado",
        category: "Food",
        amount: 65.40,
        date: "2026-11-10"
    },
    {
        id: 2,
        name: "Netflix",
        category: "Entertainment",
        amount: 12.99,
        date: "2026-11-09"
    },
    {
        id: 3,
        name: "Transporte",
        category: "Transport",
        amount: 25.00,
        date: "2026-11-07"
    },
    {
        id: 4,
        name: "Restaurante",
        category: "Food",
        amount: 38.50,
        date: "2026-11-05"
    }
];


// ========================================
// 3. CARGAR DATOS GUARDADOS
// ========================================

function loadTransactions() {
    try {
        const savedTransactions = localStorage.getItem(
            "pocketviewTransactions"
        );

        if (savedTransactions === null) {
            return initialTransactions;
        }

        const parsedTransactions = JSON.parse(savedTransactions);

        if (!Array.isArray(parsedTransactions)) {
            return initialTransactions;
        }

        return parsedTransactions.filter(transaction =>
            transaction &&
            typeof transaction.name === "string" &&
            typeof transaction.category === "string" &&
            Number.isFinite(Number(transaction.amount)) &&
            typeof transaction.date === "string"
        );

    } catch (error) {
        console.error("Error loading transactions:", error);
        return initialTransactions;
    }
}

let transactions = loadTransactions();


// ========================================
// 4. GUARDAR DATOS
// ========================================

function saveTransactions() {
    try {
        localStorage.setItem(
            "pocketviewTransactions",
            JSON.stringify(transactions)
        );
    } catch (error) {
        console.error("Error saving transactions:", error);
        alert("Your changes could not be saved in this browser.");
    }
}


// ========================================
// 5. FORMATO DE MONEDA
// ========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(amount);
}


// ========================================
// 6. FORMATO DE FECHA
// ========================================

function formatDate(date) {
    const parsedDate = new Date(date + "T00:00:00");

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// ========================================
// 7. ABRIR Y CERRAR MODAL
// ========================================

function openExpenseModal() {
    if (!expenseModal) return;

    expenseModal.classList.add("active");
    expenseModal.setAttribute("aria-hidden", "false");

    const firstInput = expenseModal.querySelector(
        'input[name="name"]'
    );

    if (firstInput) {
        firstInput.focus();
    }
}

function closeExpenseModal() {
    if (!expenseModal) return;

    expenseModal.classList.remove("active");
    expenseModal.setAttribute("aria-hidden", "true");

    if (expenseForm) {
        expenseForm.reset();
    }
}


// Abrir modal

document.querySelectorAll(
    "#addExpenseBtn, #addExpenseButton, .add-expense-btn"
).forEach(button => {
    button.addEventListener("click", openExpenseModal);
});


// Cerrar modal

document.querySelectorAll(
    "#closeExpenseModal, #closeModalBtn, #cancelExpense"
).forEach(button => {
    button.addEventListener("click", closeExpenseModal);
});


// Cerrar al pulsar fuera del formulario

if (expenseModal) {
    expenseModal.addEventListener("click", event => {
        if (event.target === expenseModal) {
            closeExpenseModal();
        }
    });
}


// Cerrar con Escape

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeExpenseModal();
    }
});


// ========================================
// 8. AÑADIR GASTOS
// ========================================

if (expenseForm) {
    expenseForm.addEventListener("submit", event => {

        event.preventDefault();

        const name = expenseForm.querySelector(
            '[name="name"]'
        ).value.trim();

        const amount = Number(
            expenseForm.querySelector('[name="amount"]').value
        );

        const category = expenseForm.querySelector(
            '[name="category"]'
        ).value;

        const date = expenseForm.querySelector(
            '[name="date"]'
        ).value;


        if (
            !name ||
            !category ||
            !date ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            alert("Please enter valid expense details.");
            return;
        }


        const newTransaction = {
            id: Date.now(),
            name,
            amount,
            category,
            date
        };


        transactions.unshift(newTransaction);

        saveTransactions();

        renderTransactions();

        updateSummary();

        closeExpenseModal();

    });
}


// ========================================
// 9. MOSTRAR TRANSACCIONES
// ========================================

function renderTransactions() {

    if (!transactionList) return;


    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <p class="empty-message">
                No transactions yet.
            </p>
        `;

        updateTransactionCount();

        return;
    }


    transactionList.innerHTML = transactions.map(transaction => `

        <div class="transaction-item">

            <div class="transaction-icon">
                ${getCategoryIcon(transaction.category)}
            </div>

            <div class="transaction-info">

                <div class="transaction-name">
                    ${escapeHTML(transaction.name)}
                </div>

                <div class="transaction-date">
                    ${formatDate(transaction.date)}
                </div>

            </div>

            <div class="transaction-amount">
                -${formatCurrency(Number(transaction.amount))}
            </div>

        </div>

    `).join("");


    updateTransactionCount();

}


// ========================================
// 10. ACTUALIZAR CONTADOR
// ========================================

function updateTransactionCount() {

    if (!transactionCount) return;

    const now = new Date();

    const monthlyTransactions = transactions.filter(transaction => {

        const date = new Date(transaction.date + "T00:00:00");

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );

    });

    const count = monthlyTransactions.length;

    transactionCount.textContent =
        count === 1
            ? "1 this month"
            : `${count} this month`;

}


// ========================================
// 11. ICONOS POR CATEGORÍA
// ========================================

function getCategoryIcon(category) {

    const icons = {
        Food: "🍽️",
        Transport: "🚗",
        Entertainment: "🎬",
        Shopping: "🛍️",
        Health: "💊",
        Housing: "🏠",
        Other: "📌"
    };

    return icons[category] || "📌";

}


// ========================================
// 12. SEGURIDAD DEL TEXTO
// ========================================

function escapeHTML(text) {

    const element = document.createElement("span");

    element.textContent = text;

    return element.innerHTML;

}


// ========================================
// 13. ACTUALIZAR RESUMEN
// ========================================

function updateSummary() {

    const now = new Date();

    const monthlyTransactions = transactions.filter(transaction => {

        const date = new Date(transaction.date + "T00:00:00");

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );

    });


    const totalExpenses = monthlyTransactions.reduce(
        (total, transaction) =>
            total + Number(transaction.amount),
        0
    );


    const expenseElements = document.querySelectorAll(
        "#totalExpenses, #monthlyExpenses, .total-expenses"
    );


    expenseElements.forEach(element => {
        element.textContent = formatCurrency(totalExpenses);
    });

}


// ========================================
// 14. MENÚ LATERAL MÓVIL
// ========================================

if (menuButton && sidebar) {

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });


    document.addEventListener("click", event => {

        const clickedInsideSidebar = sidebar.contains(event.target);

        const clickedMenuButton = menuButton.contains(event.target);

        if (
            !clickedInsideSidebar &&
            !clickedMenuButton &&
            sidebar.classList.contains("open")
        ) {
            sidebar.classList.remove("open");
        }

    });

}


// Cerrar menú al seleccionar navegación

if (sidebar) {

    sidebar.querySelectorAll(".nav-link").forEach(link => {

        link.addEventListener("click", () => {

            sidebar.classList.remove("open");

        });

    });

}


// ========================================
// 15. NAVEGACIÓN
// ========================================

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", event => {

        const target = link.getAttribute("href");

        if (target && target.startsWith("#")) {

            const section = document.querySelector(target);

            if (section) {

                event.preventDefault();

                section.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }


        document.querySelectorAll(".nav-link").forEach(item => {

            item.classList.remove("active");

        });


        link.classList.add("active");

    });

});


// ========================================
// 16. FECHA ACTUAL
// ========================================

const currentDate = document.getElementById("currentDate");

if (currentDate) {

    currentDate.textContent = new Date().toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ========================================
// 17. AÑO DEL FOOTER
// ========================================

const footerYear = document.getElementById("currentYear");

if (footerYear) {

    footerYear.textContent = new Date().getFullYear();

}


// ========================================
// 18. INICIALIZAR DASHBOARD
// ========================================

renderTransactions();

updateSummary();

saveTransactions();

console.log("PocketView JavaScript loaded successfully.");

