const db = {
    methods: {
        find: (id) => { return db.items.find(item => item.id === id); },
        remove: (itemsToRemove) => {  //Para actualizar la cantidad de productos
            itemsToRemove.forEach(element => {
                const product = db.methods.find(element.id);
                product.qty -= element.qty;
            });
        }
    },
    items: [
        {
            id: 0,
            title: "Funko Pop",
            price: 250,
            qty: 5
        },
        {
            id: 1,
            title: "Harry Potter",
            price: 345,
            qty: 50
        },
        {
            id: 2,
            title: "Phillips Hue",
            price: 1300,
            qty: 80
        }
    ]
};

const shoopingCart = {
    items: [],
    methods: {
        add: (id, qty) => {
            const cartItem = shoopingCart.methods.get(id); //Busca si el elemento ya existe en el carrito de compras

            if (cartItem) {
                if (shoopingCart.methods.hasInventory(id, qty + cartItem.qty)) {
                    cartItem.qty += qty;
                } else {
                    alert('No hay inventario suficiente');
                }
            } else {
                shoopingCart.items.push({ id, qty });
            }
        },
        remove: (id, qty) => {
            const cartItem = shoopingCart.methods.get(id); //Busca si el elemento ya esta en el carrito de compras

            if (cartItem.qty - qty > 0) {
                cartItem.qty -= qty;
            } else {
                shoopingCart.items = shoopingCart.items.filter(item => item.id !== id);
            }
        },
        count: () => {
            shoopingCart.items.reduce((acc, item) => acc + item.qty, 0)  //Reduce para sumar las cantidades de cada producto del shopping Cart
        },
        get: (id) => {
            const index = shoopingCart.items.findIndex(item => item.id === id);
            return index >= 0 ? shoopingCart.items[index] : null;
        },
        getTotal: () => {
            const total = shoopingCart.items.reduce((acc, item) => {
                const found = db.methods.find(item.id); //Para buscar el precio en la db
                return (acc + found.price * item.qty);
            }, 0);

            return total;
        },
        hasInventory: (id, qty) => { return db.items.find(item => item.id === id).qty - qty >= 0 },
        purchase: () => {
            db.methods.remove(shoopingCart.items);
            shoopingCart.items = [];
        }
    }
};

renderStore();

function renderStore() {
    const html = db.items.map(item => {
        return `
            <div class="item">
                <div class="title">${item.title}</div>
                <div class="price">${numberToCurrency(item.price)}</div>
                <div class="qty">${item.qty} units</div>
                <div class="actions">
                    <button class="add" data-id="${item.id}">Add to Shopping Cart</button>
                </div>
            </div>
        `;
    });
    document.querySelector('#store-container').innerHTML = html.join('');

    document.querySelectorAll('.item .actions .add').forEach(btn => {
        btn.addEventListener("click", e => {
            const id = parseInt(btn.getAttribute('data-id'));
            const item = db.methods.find(id);

            if (item && item.qty - 1 > 0) {
                shoopingCart.methods.add(id, 1);
                renderShoppingCart();
            } else {
                alert('No hay inventario');
            }
        });
    });
}

function numberToCurrency(n) {
    return new Intl.NumberFormat('en-US', {
        maximumSignificantDigits: 2,
        style: 'currency',
        currency: 'USD'
    }).format(n);
}

function renderShoppingCart() {
    const html = shoopingCart.items.map(item => {
        const dbItem = db.methods.find(item.id);
        return `
        <div class="item">
            <div class="title">${dbItem.title}</div>
            <div class="price">${numberToCurrency(dbItem.price)}</div>
            <div class="qty">${item.qty} units</div>
            <div class="subtotal">Subtotal:${numberToCurrency(item.qty * dbItem.price)}</div>
            <div class="actions">
                <button class="addOne" data-id="${item.id}">+</button>
                <button class="removeOne" data-id="${item.id}">-</button>
            </div>
        </div>
        `;
    });

    const closeButton = `
            <div class="cart-header">
                <button class="bClose">Close</button>
            </div>
            `;

    const purchaseButton = shoopingCart.items.length > 0 ? `
        <div class="cart-actions">
            <button id="bPurchase">Purchase</button>            
        </div>
    `: '';

    const total = shoopingCart.methods.getTotal();
    const totalContainer = `
        <div class="total">Total: ${numberToCurrency(total)}</div>
    `;


    const shoppingCartContainer = document.querySelector('#shopping-cart-container');

    shoppingCartContainer.classList.remove('hide');
    shoppingCartContainer.classList.add('show');

    shoppingCartContainer.innerHTML = closeButton + html.join('') +  totalContainer + purchaseButton;


    document.querySelectorAll('.addOne').forEach(btnAdd => {
        btnAdd.addEventListener('click', e => {
            const id = parseInt(btnAdd.getAttribute('data-id'));
            shoopingCart.methods.add(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelectorAll('.removeOne').forEach(btnAdd => {
        btnAdd.addEventListener('click', e => {
            const id = parseInt(btnAdd.getAttribute('data-id'));
            shoopingCart.methods.remove(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelector('.bClose').addEventListener('click', e => {
        shoppingCartContainer.classList.remove('show');
        shoppingCartContainer.classList.add('hide');
    });

    const bPurchase = document.querySelector('#bPurchase');
    if (bPurchase) {
        bPurchase.addEventListener('click', e => {
            shoopingCart.methods.purchase();            
            renderStore();
            renderShoppingCart();
        });
    }
}