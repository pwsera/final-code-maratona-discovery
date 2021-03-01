// Modal-Overlay (abrir e fechar) ===================================
let Modal = {
    open(){
        // Abrir modal
        // Adicionar a class "active" ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        // Fechar modal
        // Remover a class "active" do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

// Local Storage ======================================================
// Salvar Informações no Browser
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // Array -> String
    }
    
}
// =====================================================================

// Funções de transações (somar entradas; somar saídas; Entradas - Saídas)
// Array das minhas transações (espações na tabela)
const Transaction = {
    all: Storage.get(),



    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        // Pegar todas as transações
        // Para cada transação,
        Transaction.all.forEach(transaction => {
        // Se ela for > 0, somar uma variável e retornar
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
       return Transaction.incomes() + Transaction.expenses();
    }

}

// Criar elementos (TR)
// Escreve dentro do TR o valor da const HTML (criada pela função)
// Retorna o valor para fora
// Passa o valor "transactions" para ambas funções (argumento)
// Crio "child" dentro do TBODY e automatizo
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) { // Criar elementos 
        
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense" //automatizar css entrada ou saída (explense class)
        
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove Transaction">
        </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Formatação do valor AMOUNT
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pr-BR", {
            style: "currency",
            currency: "BRL"
        })


        return signal + value
    }
}

const Form = { 
    // Buscar inputs
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    // Obter valor dos input
    getValues() { 
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    validateField() { 
        const{ description, amount, date} = Form.getValues()
        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() == "") {
                throw new Error("[ERRO] Todos os campos devem ser preenchidos")
            }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        
        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        // Alterar comportamento padrão do formulário
        event.preventDefault() 

        try {
            // Validar se os campos foram preenchidos
            Form.validateField()
            // Formatar valores
            const transaction = Form.formatValues()
            // Salvar e Reload
            Transaction.add(transaction)
            // Apagar dados
            Form.clearFields()
            // Fechar modal
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()





