// პროდუქტების მონაცემები
const products = [
    {
        id: 1,
        title: "VAPEORIA",
        price: 60.99,
        image: "https://www.misteliquid.co.uk/blog/wp-content/uploads/2023/01/claretred_geekvapet200podkit-500x500-Background-Removed.png",
        category: "electronics"
    },
    {
        id: 2,
        title: "VOZOL VAPE",
        price: 250.99,
        image: "https://www.ecigwizard.com/cdn/shop/files/voopoo-drag-5-kit-gradient-blue.png?height=1000&v=1719991910&width=1000",
        category: "electronics"
    },
    {
        id: 3,
        title: "VAPE SOUL",
        price: 19.99,
        image: "https://www.jsbvape.com/wp-content/uploads/2019/10/lupin.png.webp",
        category: "electronics"
    },
];

// კალათის ცვლადები
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartModal = document.getElementById('cart-modal');
const cartLink = document.getElementById('cart-link');
const cartCount = document.getElementById('cart-count');
const closeModal = document.querySelector('.close');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// გვერდის დატვირთვისას
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // მთავარ გვერდზე რეკომენდირებული პროდუქტების ჩვენება
    if (document.querySelector('.featured-products .products-container')) {
        displayFeaturedProducts();
    }
    
    // პროდუქტების გვერდზე ყველა პროდუქტის ჩვენება
    if (document.querySelector('.products .products-container')) {
        displayAllProducts();
        setupFilters();
    }
    
    // კალათის მოვლენების დაყენება
    setupCart();
});

// რეკომენდირებული პროდუქტების ჩვენება
function displayFeaturedProducts() {
    const container = document.querySelector('.featured-products .products-container');
    const featuredProducts = products.slice(0, 4); // პირველი 4 პროდუქტი რეკომენდირებულად
    
    featuredProducts.forEach(product => {
        container.appendChild(createProductCard(product));
    });
}

// ყველა პროდუქტის ჩვენება
function displayAllProducts(filteredProducts = products) {
    const container = document.querySelector('.products .products-container');
    container.innerHTML = '';
    
    filteredProducts.forEach(product => {
        container.appendChild(createProductCard(product));
    });
}

// პროდუქტის კარტის შექმნა
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">₾${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">კალათაში დამატება</button>
        </div>
    `;
    
    return card;
}

// ფილტრების დაყენება
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const searchBox = document.getElementById('search-box');
    
    categoryFilter.addEventListener('change', filterProducts);
    searchBox.addEventListener('input', filterProducts);
}

// პროდუქტების ფილტრაცია
function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('search-box').value.toLowerCase();
    
    let filtered = products;
    
    if (category !== 'all') {
        filtered = filtered.filter(product => product.category === category);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.title.toLowerCase().includes(searchTerm)
        );
    }
    
    displayAllProducts(filtered);
}

// კალათის ფუნქციონალის დაყენება
function setupCart() {
    // კალათის ღილაკზე დაჭერა
    cartLink.addEventListener('click', function(e) {
        e.preventDefault();
        openCartModal();
    });
    
    // მოდალური ფანჯრის დახურვა
    closeModal.addEventListener('click', closeCartModal);
    
    // მოდალური ფანჯრის დახურვა გარეთ დაჭერით
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    // გადახდის ღილაკი
    checkoutBtn.addEventListener('click', checkout);
    
    // პროდუქტის დამატება კალათაში
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
        
        // პროდუქტის წაშლა კალათიდან
        if (e.target.classList.contains('remove-item')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });
}

// კალათის მოდალური ფანჯრის გახსნა
function openCartModal() {
    updateCartModal();
    cartModal.style.display = 'block';
}

// კალათის მოდალური ფანჯრის დახურვა
function closeCartModal() {
    cartModal.style.display = 'none';
}

// კალათის რაოდენობის განახლება
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// კალათის მოდალური ფანჯრის განახლება
function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>თქვენი კალათა ცარიელია</p>';
        cartTotal.textContent = 'ჯამი: ₾0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="cart-item-info">
                <p class="cart-item-title">${product.title}</p>
                <p class="cart-item-price">₾${product.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <p class="cart-item-total">₾${itemTotal.toFixed(2)}</p>
            <span class="remove-item" data-id="${product.id}">&times;</span>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartTotal.textContent = `ჯამი: ₾${total.toFixed(2)}`;
}

// პროდუქტის კალათაში დამატება
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    
    // თუ კალათის მოდალური ფანჯარა ღიაა, განაახლე
    if (cartModal.style.display === 'block') {
        updateCartModal();
    }
}

// პროდუქტის კალათიდან წაშლა
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartModal();
}

// კალათის შენახვა localStorage-ში
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// გადახდის ფუნქციონალი
function checkout() {
    if (cart.length === 0) {
        alert('თქვენი კალათა ცარიელია!');
        return;
    }
    
    alert('გადახდა წარმატებით დასრულდა!');
    cart = [];
    saveCart();
    updateCartCount();
    updateCartModal();
    closeCartModal();
}
// პროდუქტის დამატების ანიმაცია
function animateAddToCart(button) {
    button.textContent = '✅ დამატებულია!';
    button.style.backgroundColor = 'var(--success-color)';
    
    setTimeout(() => {
        button.textContent = 'კალათაში დამატება';
        button.style.backgroundColor = 'var(--primary-color)';
    }, 2000);
}

// განაახლეთ addToCart ფუნქცია
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    
    // ანიმაცია
    const addButton = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
    if (addButton) {
        animateAddToCart(addButton);
    }
    
    // თუ კალათის მოდალური ფანჯარა ღიაა, განაახლე
    if (cartModal.style.display === 'block') {
        updateCartModal();
    }
}

// დამატებითი ანიმაციები კალათისთვის
function openCartModal() {
    updateCartModal();
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // აკრძალეთ სქროლი მოდალური ფანჯრის გახსნისას
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // აღადგინეთ სქროლი
}