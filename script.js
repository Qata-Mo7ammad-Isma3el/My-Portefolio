document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes
    const animateElements = () => {
        // Animate elements when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe elements
        document.querySelectorAll('.skill-category, .projects-body > *, .my-info, .my-photo, .contact-form').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });

        // Special animations for the navigation
        const nav = document.querySelector('.nav');
        nav.classList.add('animate-fade-down');
    };

    // Run animations
    animateElements();
    // Theme toggling
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    const form = document.querySelector('.contact-form');
    const inputs = form.querySelectorAll('input, textarea');
    
    // Show success toast
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add validation classes on input
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                input.classList.add('valid');
                input.classList.remove('invalid');
            } else if (input.required) {
                input.classList.add('invalid');
                input.classList.remove('valid');
            }
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                if (input.value.trim()) {
                    input.classList.remove('invalid');
                    input.classList.add('valid');
                }
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic validation
        let isValid = true;
        inputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                input.classList.add('invalid');
                isValid = false;
            }
        });

        if (!isValid) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        // Email validation
        const emailInput = form.querySelector('#email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.classList.add('invalid');
            showToast('Please enter a valid email address', 'error');
            return;
        }

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast('Message sent successfully! I will get back to you soon.');
                form.reset();
                inputs.forEach(input => {
                    input.classList.remove('valid');
                });
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            showToast('Failed to send message. Please try again later.', 'error');
        }
    });
});