document.addEventListener('DOMContentLoaded', () => {

    // === GSAP Setup ===
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // === Cursor Glow (ambient) ===
    const glow = document.getElementById('cursorGlow');
    if (window.matchMedia('(hover: hover)').matches && glow) {
        let glowX = 0, glowY = 0, glowPending = false;
        document.addEventListener('mousemove', (e) => {
            glowX = e.clientX;
            glowY = e.clientY;
            if (!glowPending) {
                glowPending = true;
                requestAnimationFrame(() => {
                    glow.style.transform = `translate3d(${glowX - 250}px, ${glowY - 250}px, 0)`;
                    glowPending = false;
                });
            }
        });
    }

    // === Nav Scroll Effect ===
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const progressBar = document.getElementById('scrollProgress');
    let scrollTick = false;
    const onScroll = () => {
        const sy = window.scrollY;
        // Nav scroll state
        nav.classList.toggle('scrolled', sy > 50);

        // Active nav link
        let current = '';
        sections.forEach(section => {
            if (sy >= section.offsetTop - 120) current = section.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });

        // Progress bar — combined to avoid a second scroll listener
        if (progressBar) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = `${Math.min((sy / total) * 100, 100)}%`;
        }

        scrollTick = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTick) {
            scrollTick = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    // === Mobile Menu ===
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // === Theme Toggle ===
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (!prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // === Reveal on Scroll (CSS-transition approach, only for non-GSAP elements) ===
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply transition dynamically so CSS transition never fights GSAP
                entry.target.style.transition =
                    'opacity 0.75s cubic-bezier(0.4,0,0.2,1), ' +
                    'transform 0.75s cubic-bezier(0.4,0,0.2,1), ' +
                    'filter 0.75s cubic-bezier(0.4,0,0.2,1)';
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // === Counter Animation ===
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 1200;
                const startTime = performance.now();
                const tick = (now) => {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

    // === Project Filtering (animated) ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            let delay = 0;
            projectCards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                if (match) {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                    // stagger entrance
                    card.style.animationDelay = `${delay * 0.05}s`;
                    card.classList.remove('card-enter');
                    void card.offsetWidth; // reflow
                    card.classList.add('card-enter');
                    delay++;
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
        });
    });

    // === Contact Form ===
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

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
            if (input.classList.contains('invalid') && input.value.trim()) {
                input.classList.remove('invalid');
                input.classList.add('valid');
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

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

        const emailInput = form.querySelector('#email');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.classList.add('invalid');
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form)
            });

            if (response.ok) {
                showToast('Message sent! I\'ll get back to you soon.');
                form.reset();
                inputs.forEach(input => input.classList.remove('valid', 'invalid'));
            } else {
                throw new Error('Failed');
            }
        } catch {
            showToast('Failed to send. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // ============================================================
    //  SCROLL PROGRESS BAR — merged into combined onScroll above
    // ============================================================

    // ============================================================
    //  CUSTOM CURSOR
    // ============================================================
    const dot = document.getElementById('cursorDot');
    const follower = document.getElementById('cursorFollower');

    if (dot && follower && window.matchMedia('(hover: hover)').matches) {
        let fx = -200, fy = -200;
        let cx = -200, cy = -200;

        // Use transform3d — runs on compositor, zero layout reflow
        document.addEventListener('mousemove', (e) => {
            cx = e.clientX;
            cy = e.clientY;
            dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        });

        (function animateFollower() {
            fx += (cx - fx) * 0.12;
            fy += (cy - fy) * 0.12;
            follower.style.transform = `translate3d(${fx}px, ${fy}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(animateFollower);
        })();

        // Hover state on interactive elements
        const hoverTargets = 'a, button, .project-card, .skill-tag, .filter-btn, input, textarea';
        document.querySelectorAll(hoverTargets).forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // ============================================================
    //  HERO NAME — GSAP Letter Animation
    // ============================================================
    const heroNameEl = document.getElementById('heroName');
    if (heroNameEl && typeof gsap !== 'undefined') {
        const nameLines = heroNameEl.querySelectorAll('.name-line');

        nameLines.forEach((line) => {
            const isOutline = line.classList.contains('name-outline');
            // Collect raw text before the blink span
            const blinkEl = line.querySelector('.blink');
            const rawText = blinkEl
                ? line.childNodes[0].textContent.trim()
                : line.textContent.trim();

            // Clear line and rebuild with char spans
            if (blinkEl) {
                line.innerHTML = '';
            } else {
                line.textContent = '';
            }

            rawText.split('').forEach((ch, i) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = ch === ' ' ? '\u00a0' : ch;
                line.appendChild(span);
            });

            if (blinkEl) line.appendChild(blinkEl);
        });

        gsap.fromTo(
            '#heroName .char',
            { y: '110%', opacity: 0, rotationX: -80, transformOrigin: 'top center' },
            {
                y: '0%',
                opacity: 1,
                rotationX: 0,
                duration: 0.8,
                ease: 'back.out(2)',
                stagger: { amount: 0.6, from: 'start' },
                delay: 0.3,
            }
        );
    } else if (heroNameEl) {
        // Fallback CSS animation if GSAP not loaded
        heroNameEl.querySelectorAll('.name-line').forEach((line, i) => {
            line.style.opacity = '0';
            line.style.transform = 'translateY(40px)';
            setTimeout(() => {
                line.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
            }, 300 + i * 200);
        });
    }

    // ============================================================
    //  HERO LABEL + CTA reveal
    // ============================================================
    if (typeof gsap !== 'undefined') {
        // ── Hero elements ─────────────────────────────────────────
        // Use fromTo() with explicit targets so GSAP never reads opacity:0
        // from the CSS .reveal class as the "to" value.
        gsap.fromTo('.hero-label',
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.7, delay: 1.2, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo('.hero-desc',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: 1.5, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo('.hero-cta',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: 1.7, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo('.hero-stats',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: 1.9, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo('.hero-visual',
            { opacity: 0, x: 40, scale: 0.94 },
            { opacity: 1, x: 0, scale: 1, duration: 0.9, delay: 0.8, ease: 'back.out(1.5)', clearProps: 'transform' }
        );

        // ── Section headers via ScrollTrigger ─────────────────────
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.fromTo(header,
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                    clearProps: 'transform',
                    scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' }
                }
            );
        });

        // ── Skill groups stagger ───────────────────────────────────
        gsap.fromTo('.skill-group',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
                clearProps: 'transform',
                scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' }
            }
        );

        // ── About detail cards ─────────────────────────────────────
        gsap.fromTo('.detail-card',
            { opacity: 0, y: 30, scale: 0.96 },
            {
                opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.4)',
                clearProps: 'transform',
                scrollTrigger: { trigger: '.about-details', start: 'top 80%' }
            }
        );

        // ── Project cards stagger via ScrollTrigger ────────────────
        gsap.fromTo('.projects-masonry .project-card',
            { opacity: 0, y: 40, scale: 0.96 },
            {
                opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06, ease: 'back.out(1.4)',
                clearProps: 'transform',
                scrollTrigger: { trigger: '.projects-masonry', start: 'top 85%' }
            }
        );
    }

    // ============================================================
    //  PROJECT CARDS — 3D TILT + SPOTLIGHT
    // ============================================================
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        let tiltPending = false;
        card.addEventListener('mousemove', (e) => {
            if (tiltPending) return;
            tiltPending = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotX = ((y - cy) / cy) * -7;
                const rotY = ((x - cx) / cx) * 7;
                card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
                tiltPending = false;
            });
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });

        // Touch: no tilt but keep spotlight
        card.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${touch.clientX - rect.left}px`);
            card.style.setProperty('--my', `${touch.clientY - rect.top}px`);
        }, { passive: true });
    });

    // ============================================================
    //  MAGNETIC BUTTONS
    // ============================================================
    document.querySelectorAll('.btn').forEach(btn => {
        let btnPending = false;
        btn.addEventListener('mousemove', (e) => {
            if (btnPending) return;
            btnPending = true;
            requestAnimationFrame(() => {
                const rect = btn.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
                btnPending = false;
            });
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ============================================================
    //  NAV ACTIVE + SCROLL (already handled above — no duplicate)
    // ============================================================

}); // end DOMContentLoaded
