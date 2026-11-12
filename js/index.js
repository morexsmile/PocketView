// POCKETVIEW - MAIN JAVASCRIPT
// ELEMENTOS DEL DOM

const sidebar = document.querySelector(".sidebar");
const expenseModal = document.getElementById("expenseModal");
const expenseForm = document.querySelector("#expenseForm");
const budgetList = document.getElementById("budgetList");
const transactionList = document.getElementById("transactionList");

// DATOS INICIALES

const initialTransactions = [
    {
        id: 1,
        name: "Supermercado",
        category: "Food",
        amount: 65.40,
        date: "2026-09-14"
    },
    {
        id: 2,
        name: "Netflix",
        category: "Entertainment",
        amount: 12.99,
        date: "2026-09-12"
    },
    {
        id: 3,
        name: "Transporte",
        category: "Transport",
        amount: 25.00,
        date: "2026-09-10"
    },
    {
        id: 4,
        name: "Restaurante",
        category: "Food",
        amount: 38.50,
        date: "2026-09-08"
    }
];

let transactions = JSON.parse(localStorage.getItem("pocketviewTransactions")) || initialTransactions;

// GUARDAR DATOS

function saveTransactions() {
    localStorage.setItem(
        "pocketviewTransactions",
        JSON.stringify(transactions)
    );
}

// FORMATO DE MONEDA

function formatCurrency(amount) {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(amount);
}

// FORMATO DE FECHA

function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// ABRIR Y CERRAR EL MODAL

function openExpenseModal() {
    if (!expenseModal) return;
    expenseModal.classList.add("active");
    expenseModal.setAttribute("aria-hidden", "false");
}

function closeExpenseModal() {
    if (!expenseModal) return;
    expenseModal.classList.remove("active");
    expenseModal.setAttribute("aria-hidden", "true");
    if (expenseForm) {
        expenseForm.reset();
    }
}

// Botones para abrir el modal

document.querySelectorAll(
    "#addExpenseBtn, #addExpenseButton, .add-expense-btn"
).forEach(button => {
    button.addEventListener("click", openExpenseModal);
});

// Botones para cerrar el modal

document.querySelectorAll(
    "#closeExpenseModal, #closeModalBtn, #cancelExpense"
).forEach(button => {
    button.addEventListener("click", closeExpenseModal);
});

// Cerrar al hacer clic fuera del formulario

if (expenseModal) {
    expenseModal.addEventListener("click", event => {
        if (event.target === expenseModal) {
            closeExpenseModal();
        }
    });
}


// Cerrar con la tecla Escape

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeExpenseModal();
    }
});

// AÑADIR UN GASTO

if (expenseForm) {
    expenseForm.addEventListener("submit", event => {
        event.preventDefault();
        const name = expenseForm.querySelector('[name="name"]')?.value.trim();
        const amount = parseFloat(
            expenseForm.querySelector('[name="amount"]')?.value
        );
        const category = expenseForm.querySelector('[name="category"]')?.value;
        const date = expenseForm.querySelector('[name="date"]')?.value;
        if (!name || !category || !date || !Number.isFinite(amount) || amount <= 0) {
            alert("Please enter valid expense details.");
            return;
        }

        const newTransaction = {
            id: Date.now(),
            name: name,
            category: category,
            amount: amount,
            date: date
        };

        transactions.unshift(newTransaction);
        saveTransactions();
        renderTransactions();
        updateSummary();
        closeExpenseModal();
    });
}

// MOSTRAR TRANSACCIONES

function renderTransactions() {
    if (!transactionList) return;

    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <p class="empty-message">No transactions yet.</p>
        `;
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
                -${formatCurrency(transaction.amount)}
            </div>

        </div>
    `).join("");
}

// ICONOS POR CATEGORÍA

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

// SEGURIDAD DEL TEXTO

function escapeHTML(text) {
    const element = document.createElement("span");
    element.textContent = text;
    return element.innerHTML;
}

// ACTUALIZAR RESUMEN

function updateSummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date + "T00:00:00");

        return (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
        );
    });

    const totalExpenses = monthlyTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
    );

    const expenseElements = document.querySelectorAll(
        "#totalExpenses, #monthlyExpenses, .total-expenses"
    );

    expenseElements.forEach(element => {
        element.textContent = formatCurrency(totalExpenses);
    });
}

// MENÚ LATERAL PARA MÓVILES

const menuButton = document.querySelector(
    "#menuToggle, #mobileMenuBtn, .menu-toggle"
);

if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

// Cerrar menú al seleccionar una opción

if (sidebar) {
    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            sidebar.classList.remove("open");
        });
    });
}

// NAVEGACIÓN ENTRE SECCIONES

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

// AÑO AUTOMÁTICO EN EL FOOTER

const footerYear = document.querySelector("#currentYear");
if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
}

// INICIALIZAR DASHBOARD

renderTransactions();
updateSummary();

saveTransactions();

