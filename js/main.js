'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* ======================================================================
       1. HEADER & NAVIGATION
       ====================================================================== */
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.header__link');
    const navCta = document.querySelector('.header__cta');
    const pageLoader = document.getElementById('page-loader');
    const pageLoaderTotalDuration = 2000;
    const pageLoaderFadeDuration = 500;
    let pageLoaderHideTimer = null;

    const hidePageLoader = () => {
        if (!pageLoader || pageLoader.dataset.state === 'hidden') return;

        if (pageLoaderHideTimer !== null) {
            window.clearTimeout(pageLoaderHideTimer);
            pageLoaderHideTimer = null;
        }

        pageLoader.dataset.state = 'hidden';
        document.documentElement.classList.remove('has-loader');
        pageLoader.setAttribute('aria-hidden', 'true');

        window.setTimeout(() => {
            pageLoader.setAttribute('hidden', '');
        }, pageLoaderFadeDuration);
    };

    pageLoaderHideTimer = window.setTimeout(
        hidePageLoader,
        Math.max(0, pageLoaderTotalDuration - pageLoaderFadeDuration - performance.now())
    );

    let floatingViewportWidth = window.innerWidth;
    let floatingViewportHeight = window.innerHeight;
    let floatingUiFrame = null;
    let lastViewportWidth = window.innerWidth;

    const syncFloatingUI = () => {
        floatingUiFrame = null;

        const viewport = window.visualViewport;

        if (!viewport) {
            document.documentElement.style.setProperty('--floating-top-offset', '0px');
            document.documentElement.style.setProperty('--floating-right-offset', '0px');
            document.documentElement.style.setProperty('--floating-bottom-offset', '0px');
            return;
        }

        floatingViewportWidth = Math.max(floatingViewportWidth, window.innerWidth, viewport.width + viewport.offsetLeft);
        floatingViewportHeight = Math.max(floatingViewportHeight, window.innerHeight, viewport.height + viewport.offsetTop);

        const topOffset = Math.max(0, viewport.offsetTop);
        const rightOffset = Math.max(0, floatingViewportWidth - (viewport.width + viewport.offsetLeft));
        const bottomOffset = Math.max(0, floatingViewportHeight - (viewport.height + viewport.offsetTop));

        document.documentElement.style.setProperty('--floating-top-offset', `${Math.round(topOffset)}px`);
        document.documentElement.style.setProperty('--floating-right-offset', `${Math.round(rightOffset)}px`);
        document.documentElement.style.setProperty('--floating-bottom-offset', `${Math.round(bottomOffset)}px`);
    };

    const requestFloatingUISync = (resetBounds = false) => {
        if (resetBounds) {
            floatingViewportWidth = window.innerWidth;
            floatingViewportHeight = window.innerHeight;
        }

        if (floatingUiFrame !== null) return;

        floatingUiFrame = window.requestAnimationFrame(syncFloatingUI);
    };

    requestFloatingUISync(true);

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => requestFloatingUISync());
        window.visualViewport.addEventListener('scroll', () => requestFloatingUISync());
    }

    // Sticky Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const setMobileMenuState = (isOpen) => {
        navMenu.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        document.documentElement.classList.toggle('menu-open', isOpen);
    };

    // Mobile Menu Toggle
    navToggle.addEventListener('click', () => {
        setMobileMenuState(!navMenu.classList.contains('active'));
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setMobileMenuState(false);
        });
    });

    if (navCta) {
        navCta.addEventListener('click', () => {
            setMobileMenuState(false);
        });
    }

    window.addEventListener('resize', () => {
        const widthChanged = Math.abs(window.innerWidth - lastViewportWidth) > 2;

        lastViewportWidth = window.innerWidth;
        requestFloatingUISync(widthChanged);

        if (window.innerWidth > 900 && navMenu.classList.contains('active')) {
            setMobileMenuState(false);
        }
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

    const fieldVisitVideos = document.querySelectorAll('[data-field-visit-video]');

    fieldVisitVideos.forEach((player) => {
        const video = player.querySelector('.field-visit-video__media');
        const playButton = player.querySelector('.field-visit-video__play');
        const section = player.closest('.field-visit-band');
        let isSectionVisible = true;

        if (!video || !playButton) return;

        const playMutedPreviewIfVisible = () => {
            if (!isSectionVisible) return;

            const previewPlayback = video.play();

            if (previewPlayback && typeof previewPlayback.catch === 'function') {
                previewPlayback.catch(() => {});
            }
        };

        const startMutedPreview = () => {
            video.pause();

            try {
                video.currentTime = 0;
            } catch (error) {
                // Some browsers can briefly reject seeking before metadata is ready.
            }

            video.muted = true;
            video.defaultMuted = true;
            video.loop = true;
            video.controls = false;
            player.dataset.playState = 'preview';
            player.classList.remove('is-active');
            playMutedPreviewIfVisible();
        };

        const startWithAudio = () => {
            video.pause();

            try {
                video.currentTime = 0;
            } catch (error) {
                // Ignore transient seek errors and still try to play from the start.
            }

            video.defaultMuted = false;
            video.muted = false;
            video.loop = false;
            video.controls = true;
            player.dataset.playState = 'active';
            player.classList.add('is-active');

            const fullPlayback = video.play();

            if (fullPlayback && typeof fullPlayback.catch === 'function') {
                fullPlayback.catch(() => {
                    startMutedPreview();
                });
            }
        };

        playButton.addEventListener('click', startWithAudio);
        video.addEventListener('ended', startMutedPreview);

        if (section) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    isSectionVisible = entry.isIntersecting && entry.intersectionRatio > 0.22;

                    if (!isSectionVisible) {
                        video.pause();
                        return;
                    }

                    if (player.dataset.playState === 'preview' && video.paused) {
                        playMutedPreviewIfVisible();
                    }
                });
            }, {
                threshold: [0, 0.22, 0.5]
            });

            sectionObserver.observe(section);
        }

        if (video.readyState >= 2) {
            startMutedPreview();
        } else {
            video.addEventListener('loadeddata', startMutedPreview, { once: true });
        }
    });

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
