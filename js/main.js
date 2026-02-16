'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ======================================================================
       1. HEADER & NAVIGATION
       ====================================================================== */
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.header__link');

    // Sticky Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Change toggle icon
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
             spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
             spans[1].style.opacity = '0';
             spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
             spans[0].style.transform = 'none';
             spans[1].style.opacity = '1';
             spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            
            // Reset icon
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ======================================================================
       2. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
       ====================================================================== */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .reveal-on-scroll, .reveal-from-left, .reveal-from-right');
    animatedElements.forEach(el => observer.observe(el));

    /* ======================================================================
       3. PARALLAX EFFECT (HERO)
       ====================================================================== */
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroBg = document.querySelector('.hero__bg');
        if (scrolled < window.innerHeight) {
            heroBg.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
        }
    });

    /* ======================================================================
       4. METRIC COUNTER ANIMATION
       ====================================================================== */
    const counters = document.querySelectorAll('.metric-value');
    let hasCounted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasCounted) {
            hasCounted = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                
                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
        }
    }, { threshold: 0.5 });

    const metricsSection = document.querySelector('.metrics');
    if (metricsSection) {
        counterObserver.observe(metricsSection);
    }

    /* ======================================================================
       5. FAQ ACCORDION
       ====================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion__header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion__content');
            
            // Close other items
            document.querySelectorAll('.accordion__item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion__content').style.maxHeight = null;
                }
            });

            // Toggle current
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    /* ======================================================================
       6. FORM VALIDATION & SUBMIT SIMULATION
       ====================================================================== */
    const form = document.getElementById('leadForm');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Simple validation
            const inputs = form.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                
                if (!input.value || (input.type === 'checkbox' && !input.checked)) {
                    // Logic to find the closest .form-group
                    const fGroup = input.closest('.form-group');
                    fGroup.classList.add('error');
                    isValid = false;
                    
                    // Remove error on input
                    input.addEventListener('input', () => {
                        fGroup.classList.remove('error');
                    }, { once: true });
                }
            });

            if (isValid) {
                const btn = form.querySelector('button[type="submit"]');
                const btnText = btn.querySelector('.btn-text');
                const loader = btn.querySelector('.loader');
                const successMsg = document.querySelector('.success-msg');

                // Loading State
                btnText.style.display = 'none';
                loader.style.display = 'block';
                btn.disabled = true;

                // Simulate API call
                setTimeout(() => {
                    // Success State
                    form.reset();
                    loader.style.display = 'none';
                    btnText.style.display = 'block';
                    btn.disabled = false; // Reset button generally, but we hide form
                    
                    // Hide form fields, show success message
                    Array.from(form.children).forEach(child => {
                        if (!child.classList.contains('success-msg')) {
                            child.style.display = 'none';
                        }
                    });
                    
                    successMsg.removeAttribute('hidden');
                    successMsg.style.display = 'block';
                    
                }, 2000);
            }
        });
        
        // Add functionality to reset form (Nova Inscrição button)
        // Check if there is already a reset button, if not add it
        const successBlock = document.querySelector('.success-msg');
        if (successBlock) {
             const resetBtn = document.createElement('button');
             resetBtn.className = 'btn btn--outline mt-4';
             resetBtn.textContent = 'Enviar Nova Inscrição';
             resetBtn.style.marginTop = '1rem';
             resetBtn.addEventListener('click', (e) => {
                 e.preventDefault();
                 // Show form fields
                 Array.from(form.children).forEach(child => {
                    if (!child.classList.contains('success-msg')) {
                        child.style.display = ''; // Reset display style
                    }
                 });
                 // Hide success msg
                 successBlock.style.display = 'none';
                 successBlock.setAttribute('hidden', '');
             });
             successBlock.appendChild(resetBtn);
        }
    }

    /* ======================================================================
       7. DYNAMIC DATES (DASHBOARD)
       ====================================================================== */
    const dateElement = document.getElementById('current-cycle-date');
    if (dateElement) {
        const now = new Date();
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentMonth = months[now.getMonth()];
        const currentYear = now.getFullYear();
        dateElement.textContent = `${currentMonth}/${currentYear} - Ciclo V`;
    }

});
