document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       THEME TOGGLE (LIGHT / DARK MODE)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check for saved theme, otherwise use system preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    htmlElement.setAttribute('data-theme', initialTheme);

    // Click handler to toggle theme
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        
        // Dynamic rotate transition on toggle button
        themeToggleBtn.style.transform = 'rotate(30deg)';
        setTimeout(() => {
            themeToggleBtn.style.transform = 'none';
        }, 200);
    });

    /* ==========================================================================
       MOBILE NAVIGATION MENU
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const mobileMenuOpenSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"></svg>';
    const mobileMenuCloseSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"></svg>';

    // Toggle menu
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to document which closes the menu immediately due to detached icons
        navMenu.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        mobileToggle.innerHTML = isOpen ? mobileMenuCloseSVG : mobileMenuOpenSVG;
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.innerHTML = mobileMenuOpenSVG;
            }
        });
    });

    // Close menu when clicking outside of navbar
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle.innerHTML = mobileMenuOpenSVG;
        }
    });

    /* ==========================================================================
       NAVBAR SCROLL EFFECT
       ========================================================================== */
    const navbarContainer = document.querySelector('.navbar-container');
    
    const handleNavbarScroll = () => {
        if (window.scrollY > 50) {
            navbarContainer.classList.add('scrolled');
        } else {
            navbarContainer.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Trigger check on load in case page was refreshed scrolled down

    /* ==========================================================================
       SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once it has animated in, we can stop observing it
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters view fully
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* ==========================================================================
       CONTACT FORM VALIDATION & FEEDBACK
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Clear previous feedback
            formFeedback.className = 'form-feedback hidden';
            formFeedback.textContent = '';

            // Basic validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                showFeedback('All fields are required.', 'error');
                return;
            }

            // Disable form and show loading state
            submitBtn.disabled = true;
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span><span class="spinner"></span>';
            
            // Add spin animation style on the fly if needed
            const spinner = submitBtn.querySelector('.spinner');
            spinner.style.display = 'inline-block';
            spinner.style.border = '2px solid rgba(18, 18, 18, 0.2)';
            spinner.style.borderTop = '2px solid #121212';
            spinner.style.borderRadius = '50%';
            spinner.style.width = '14px';
            spinner.style.height = '14px';
            spinner.style.animation = 'spin 0.8s linear infinite';
            
            // Inject spin style if not in CSS
            if (!document.getElementById('spin-style')) {
                const style = document.createElement('style');
                style.id = 'spin-style';
                style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }

            // Web3Forms AJAX submission
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let jsonRes = await response.json();
                if (response.status == 200) {
                    showFeedback('Thank you! Your message was sent successfully. I will receive it shortly.', 'success');
                    contactForm.reset();
                } else {
                    showFeedback(jsonRes.message || 'Something went wrong. Please try again.', 'error');
                }
            })
            .catch(error => {
                showFeedback('Network error. Please check your connection and try again.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            });
        });
    }

    const showFeedback = (text, type) => {
        formFeedback.textContent = text;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    /* ==========================================================================
       SMOOTH IN-PAGE ANCHOR LINK NAVIGATION
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Let default behavior handle the top link
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ==========================================================================
       MEDIA CAROUSEL LOGIC
       ========================================================================== */
    const mediaTrack = document.getElementById('media-track');
    const mediaPrevBtn = document.getElementById('media-prev');
    const mediaNextBtn = document.getElementById('media-next');

    if (mediaTrack && mediaPrevBtn && mediaNextBtn) {
        const getScrollAmount = () => {
            const firstCard = mediaTrack.querySelector('.media-card');
            if (firstCard) {
                // Scroll by one card width + the gap (30px)
                return firstCard.clientWidth + 30;
            }
            return 300; // Fallback
        };

        // Scroll next
        mediaNextBtn.addEventListener('click', () => {
            mediaTrack.scrollBy({
                left: getScrollAmount(),
                behavior: 'smooth'
            });
        });

        // Scroll prev
        mediaPrevBtn.addEventListener('click', () => {
            mediaTrack.scrollBy({
                left: -getScrollAmount(),
                behavior: 'smooth'
            });
        });

        // Update button visibility states based on scroll position
        const updateCarouselButtons = () => {
            const scrollLeft = mediaTrack.scrollLeft;
            const maxScroll = mediaTrack.scrollWidth - mediaTrack.clientWidth;
            
            // Show/hide prev button
            if (scrollLeft <= 5) {
                mediaPrevBtn.classList.add('hidden');
            } else {
                mediaPrevBtn.classList.remove('hidden');
            }
            
            // Show/hide next button
            if (scrollLeft >= maxScroll - 5) {
                mediaNextBtn.classList.add('hidden');
            } else {
                mediaNextBtn.classList.remove('hidden');
            }
        };

        // Listen to scroll event and window resize
        mediaTrack.addEventListener('scroll', updateCarouselButtons);
        window.addEventListener('resize', updateCarouselButtons);
        
        // Initial button check
        setTimeout(updateCarouselButtons, 100);
    }
});
