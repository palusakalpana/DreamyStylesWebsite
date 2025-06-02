let searchedProducts = []; 

       
         function toggleSidebar() {
            document.getElementById("sidebar").classList.toggle("active");
            document.getElementById("overlay").classList.toggle("active");
        }
        
        var swiper = new Swiper(".stylingSwiper", {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: false, 
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    }
  }
});

        
  const API_URL = "https://dreamystylesapi.onrender.com/products";
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];


function fetchProducts(category) {
    fetch(API_URL)
        .then(response => response.json())
        .then(products => {
            let filteredProducts;

            if (category === "all") {
                filteredProducts = products;
                document.getElementById("deals-section").style.display = "block";
            } else {
                let categoryMapping = {
                    "men": "men's clothing",
                    "women": "women's clothing",
                    "electronics": "electronics",
                    "jewelery": "jewelery",
                    "footwear" : "footwear"
                };

                filteredProducts = products.filter(product => product.category === categoryMapping[category]);
                document.getElementById("deals-section").style.display = "none";
            }

            displayProducts(filteredProducts);
            window.scrollTo({
                top: 0,
                behavior: "smooth" 
            });

        })
        .catch(error => console.error("Error fetching products:", error));
}

function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const productKey = encodeURIComponent(product.title); 
        const isWishlisted = wishlist.includes(productKey);

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-details">
                <h2 class="product-title">${product.title}</h2>
                <p class="product-price">Price: $${product.price}</p>
                <p class="product-category">${product.category}</p>
                <p class="product-rating">⭐ ${product.rating.rate} (${product.rating.count} reviews)</p>
                
                <a href="javascript:void(0);" class="view-more-link" onclick="toggleDetails(this)">View More</a>

                <div class="product-extra-details" style="display: none; margin-top: 5px;">
                          
                    <p class="product-description">${product.description}</p>
                    <p class="size">${product.size}</p>
                <p class="color">${product.color}</p>
                </div>

                <div class="product-actions">
                    <i class="fas fa-heart wishlist-icon ${isWishlisted ? "active" : ""}" 
   data-product="${product.id}" 
   onclick="toggleWishlist(this, ${product.id})">
</i>
<button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>

                </div>
            </div>
        `;

        productList.appendChild(productCard);
    });
}

function toggleDetails(link) {
    const detailsDiv = link.nextElementSibling; 
    if (detailsDiv.style.display === "none") {
        detailsDiv.style.display = "block";
        link.textContent = "View Less"; 
    } else {
        detailsDiv.style.display = "none";
        link.textContent = "View More"; 
    }

    document.querySelectorAll(".wishlist-icon").forEach(icon => {
        icon.addEventListener("click", function () {
            toggleWishlist(this, this.getAttribute("data-product"));
        });
    });
}

function toggleWishlist(icon, productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const productIndex = wishlist.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        wishlist.splice(productIndex, 1);
        icon.style.color = "white";  
        icon.style.textShadow = "0 0 3px black"; 
    } else {
        fetch("https://dreamystylesapi.onrender.com/products")
            .then(response => response.json())
            .then(products => {
                const product = products.find(p => p.id === productId);
                if (product) {
                    wishlist.push({
                        id: product.id,
                        title: product.title,
                        image: product.image,
                        price: product.price
                    });
                    icon.style.color = "red";  
                    icon.style.textShadow = "none";
                    localStorage.setItem("wishlist", JSON.stringify(wishlist));
                }
            })
            .catch(error => console.error("Error adding to wishlist:", error));
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1, 
    spaceBetween: 20, 
    loop: true, 
    autoplay: {
        delay: 1000, 
        disableOnInteraction: false, 
    },
    speed: 2000, 
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});


function searchProduct() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const dealsSection = document.getElementById("deals-section");

    fetch(API_URL)
        .then(response => response.json())
        .then(products => {
            
            const keywords = searchInput.split(" ");
            searchedProducts = products.filter(product =>
                keywords.some(keyword =>
                    product.title.toLowerCase().includes(keyword) ||
                    product.description?.toLowerCase().includes(keyword) ||
                    product.category?.toLowerCase().includes(keyword)
                )
            );
            dealsSection.style.display = searchInput ? 'none' : 'block';
            displayProducts(searchedProducts);
        });
}
function applySidebarFilters() {
    let filtered = [...searchedProducts];  // assume searchedProducts holds search-based results

    const size = document.getElementById("size").value;
    if (size !== "all") {
        filtered = filtered.filter(product =>
            product.size?.toLowerCase() === size
        );
    }

    const color = document.getElementById("color").value;
    if (color !== "all") {
        filtered = filtered.filter(product =>
            product.color?.toLowerCase() === color
        );
    }

    const priceSort = document.querySelector('input[name="price-sort"]:checked');
    if (priceSort && priceSort.value !== "all") {
        if (priceSort.value === "low-high") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (priceSort.value === "high-low") {
            filtered.sort((a, b) => b.price - a.price);
        }
    }

    displayProducts(filtered);  
}
document.getElementById("size").addEventListener("change", applySidebarFilters);
document.getElementById("color").addEventListener("change", applySidebarFilters);
document.querySelectorAll('input[name="price-sort"]').forEach(radio =>
    radio.addEventListener("change", applySidebarFilters)
);


function addToWishlist(item) {
    if (!wishlist.includes(item)) {
        wishlist.push(item);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishlistIcon(item, true);
    } else {
        wishlist = wishlist.filter(i => i !== item);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishlistIcon(item, false);
    }
}

function updateWishlistIcon(item, isActive) {
    const icons = document.querySelectorAll(".wishlist-icon");
    icons.forEach(icon => {
        if (icon.getAttribute("data-item") === item) {
            icon.classList.toggle("active", isActive);
        }
    });
}

function showWishlist() {
    window.location.href = "wishlist.html";
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    fetch(API_URL)
        .then(response => response.json())
        .then(products => {
            let product = products.find(p => p.id === productId);
            
            if (product) {
                let cartItem = cart.find(item => item.id === product.id);
                
                if (cartItem) {
                    cartItem.quantity += 1;
                } else {
                    cart.push({ 
                        id: product.id,
                        title: product.title, 
                        price: product.price, 
                        image: product.image, 
                        quantity: 1 
                    });
                }

                localStorage.setItem("cart", JSON.stringify(cart));
                alert("✅ Item added to cart!");
            }
        })
        .catch(error => console.error("Error adding to cart:", error));
}


function showCart() {
    window.location.href = "cart.html";
}

        function startCountdown(duration) {
            let timer = duration, hours, minutes, seconds;
            setInterval(() => {
                hours = Math.floor(timer / 3600);
                minutes = Math.floor((timer % 3600) / 60);
                seconds = timer % 60;
                document.getElementById("countdown").textContent = `Deal ends in: ${hours}:${minutes}:${seconds}`;
                if (--timer < 0) timer = duration;
            }, 1000);
        }

        startCountdown(7200); 
        fetchProducts("all");