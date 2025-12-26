document.addEventListener('DOMContentLoaded', function() {
    // EmailJS Initialization
    (function() {
        emailjs.init("jbzAVyuRv4Z3HZbqD");
    })();

    // Cart Management
    class CartManager {
        constructor() {
            this.cart = [];
            this.total = 0;
            this.buttons = document.querySelectorAll(".add-btn");
            this.cartList = document.querySelector(".cart-items");
            this.totalBox = document.getElementById("total-price");
            this.emptyBox = document.querySelector(".empty");
            this.bookBtn = document.getElementById("booknow");
            this.confirmationMsg = document.getElementById("confirmation-msg");
            
            this.init();
        }
        
        init() {
            this.setupServiceButtons();
            this.setupBookButton();
        }
        
        setupServiceButtons() {
            this.buttons.forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const serviceDiv = e.target.closest('.service');
                    const serviceName = serviceDiv.dataset.service;
                    const servicePrice = parseFloat(serviceDiv.dataset.price);
                    const serviceId = `${serviceName}-${servicePrice}`;
                    
                    if (e.target.textContent.includes("Add Item")) {
                        this.addToCart(serviceId, serviceName, servicePrice, e.target);
                    } else {
                        this.removeFromCart(serviceId, servicePrice, e.target);
                    }
                });
            });
        }
        
        addToCart(id, name, price, button) {
            this.cart.push({ id, name, price });
            this.total += price;
            
            // Update UI
            this.updateCartUI();
            button.textContent = "Remove ✕";
            button.style.background = "#e74c3c";
            button.style.color = "white";
            button.classList.add('remove-mode');
        }
        
        removeFromCart(id, price, button) {
            this.cart = this.cart.filter(item => item.id !== id);
            this.total -= price;
            
            // Update UI
            this.updateCartUI();
            button.textContent = "Add Item ⊕";
            button.style.background = "";
            button.style.color = "";
            button.classList.remove('remove-mode');
        }
        
        updateCartUI() {
            // Clear cart list
            this.cartList.innerHTML = '';
            
            if (this.cart.length === 0) {
                this.emptyBox.style.display = 'block';
                this.totalBox.textContent = '₹ 0';
                return;
            }
            
            this.emptyBox.style.display = 'none';
            
            // Add items to cart list
            this.cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <span>₹${item.price.toFixed(2)}</span>
                    <button class="remove-item" data-id="${item.id}">✕</button>
                `;
                this.cartList.appendChild(li);
            });
            
            // Update total
            this.totalBox.textContent = `₹ ${this.total.toFixed(2)}`;
            
            // Add event listeners to remove buttons in cart
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const item = this.cart.find(item => item.id === id);
                    if (item) {
                        this.removeFromCart(id, item.price, 
                            document.querySelector(`.service[data-service="${item.name}"] .add-btn`));
                    }
                });
            });
        }
        
        setupBookButton() {
            this.bookBtn.addEventListener('click', async () => {
                await this.handleBooking();
            });
        }
        
        async handleBooking() {
            // Validate cart
            if (this.cart.length === 0) {
                this.showMessage('Please add at least one service', 'error');
                return;
            }
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            // Validate form
            if (!name || !email || !phone) {
                this.showMessage('Please fill all the details', 'error');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            if (!this.validatePhone(phone)) {
                this.showMessage('Please enter a valid phone number', 'error');
                return;
            }
            
            // Prepare services list
            const services = this.cart.map(item => `${item.name} - ₹${item.price}`).join(', ');
            
            // Prepare email parameters
            const params = {
                customer_name: name,
                customer_email: email,
                phone: phone,
                services: services,
                total: this.total.toFixed(2),
                booking_date: new Date().toLocaleDateString(),
                booking_time: new Date().toLocaleTimeString()
            };
            
            try {
                // Show loading state
                this.bookBtn.disabled = true;
                this.bookBtn.textContent = 'Processing...';
                
                // Send email
                const response = await emailjs.send(
                    "laundrywebsite009900",
                    "template_64z29n2",
                    params
                );
                
                if (response.status === 200) {
                    this.showMessage('Booking Successful! Confirmation email has been sent.', 'success');
                    this.resetCart();
                    this.resetForm();
                }
            } catch (error) {
                console.error('Email sending failed:', error);
                this.showMessage('Booking failed. Please try again later.', 'error');
            } finally {
                // Reset button state
                this.bookBtn.disabled = false;
                this.bookBtn.textContent = 'Book now';
            }
        }
        
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        validatePhone(phone) {
            const re = /^[\+]?[1-9][\d]{9,13}$/;
            return re.test(phone);
        }
        
        showMessage(message, type) {
            this.confirmationMsg.textContent = message;
            this.confirmationMsg.style.color = type === 'success' ? '#28a745' : '#dc3545';
            this.confirmationMsg.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
            this.confirmationMsg.style.borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
            this.confirmationMsg.style.display = 'block';
            
            // Hide message after 5 seconds
            setTimeout(() => {
                this.confirmationMsg.style.display = 'none';
            }, 5000);
        }
        
        resetCart() {
            this.cart = [];
            this.total = 0;
            this.updateCartUI();
            
            // Reset all add buttons
            this.buttons.forEach(btn => {
                btn.textContent = "Add Item ⊕";
                btn.style.background = "";
                btn.style.color = "";
                btn.classList.remove('remove-mode');
            });
        }
        
        resetForm() {
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
        }
    }
    
    // Initialize cart manager
    new CartManager();
    
    // Newsletter subscription
    document.querySelector('.subscribe-btn')?.addEventListener('click', function() {
        const nameInput = this.parentElement.querySelector('input[type="text"]');
        const emailInput = this.parentElement.querySelector('input[type="email"]');
        
        if (nameInput.value && emailInput.value) {
            alert('Thank you for subscribing to our newsletter!');
            nameInput.value = '';
            emailInput.value = '';
        } else {
            alert('Please enter both name and email.');
        }
    });
});