// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
} else {
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    }
}
window.onload = function () {
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 10);
};

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');

    function toggleMenu() {
        if (menuToggle) menuToggle.classList.toggle('active');
        if (navLinks) navLinks.classList.toggle('active');
        if (menuOverlay) menuOverlay.classList.toggle('active');
        document.body.style.overflow = document.body.style.overflow === 'hidden' ? '' : 'hidden';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', toggleMenu);
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close mobile menu when clicking outside (fallback, though overlay usually catches this)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            navLinks.classList.contains('active') &&
            !menuToggle.contains(e.target) &&
            !navLinks.contains(e.target) &&
            !menuOverlay.contains(e.target)) {
            toggleMenu();
        }
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === "") {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });

    // Particles JS Configuration
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 60,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": ["#6c5ce7", "#00cec9", "#dfe6e9"]
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#a29bfe",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.5,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
    }

    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Certificate Modal
    const modal = document.getElementById("image-viewer");
    const modalImg = document.getElementById("full-image");
    const captionText = document.getElementById("caption");
    // Use querySelector to find the close span inside the modal
    const closeBtn = document.querySelector("#image-viewer .close");
    let activeCard = null; // Store the clicked card to reverse animation

    document.querySelectorAll('.certificate-card').forEach(card => {
        card.addEventListener('click', function () {
            const img = this.querySelector('img');
            const title = this.querySelector('h3').innerText;
            const desc = this.querySelector('p').innerText;
            activeCard = this;

            modal.style.display = "flex"; // Use flex to center easily
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.style.flexDirection = "column";

            modalImg.src = img.src;
            captionText.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;

            // FLIP Animation
            // 1. First: Get starting position
            const firstRect = img.getBoundingClientRect();

            // 2. Last: Set final state string but don't show yet (to calculate position)
            // But we need the modal to be visible to calculate lastRect.
            // Transparency is already 0 from CSS or previous state? No, we set it below.

            // Ensure no transition during setup
            modalImg.style.transition = "none";
            modalImg.style.transform = "none";

            // 3. Invert: Calculate difference
            const lastRect = modalImg.getBoundingClientRect();

            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;
            const deltaW = firstRect.width / lastRect.width;
            const deltaH = firstRect.height / lastRect.height;

            // Apply inverted transform to match start position
            modalImg.style.transformOrigin = "top left";
            modalImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
            modalImg.style.opacity = "0.5"; // Start slightly visible to prove it's there

            // FORCE REFLOW
            modalImg.offsetHeight;

            // 4. Play: Animate to final state
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modalImg.style.transition = "transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.4s ease";
                    modalImg.style.transform = "none";
                    modalImg.style.opacity = "1";
                    captionText.classList.add('visible');
                });
            });

            document.body.style.overflow = "hidden";
        });
    });

    function closeModal() {
        if (!activeCard) {
            modal.style.display = "none";
            document.body.style.overflow = "";
            return;
        }

        const img = activeCard.querySelector('img');
        const firstRect = img.getBoundingClientRect();
        const lastRect = modalImg.getBoundingClientRect();

        const deltaX = firstRect.left - lastRect.left;
        const deltaY = firstRect.top - lastRect.top;
        const deltaW = firstRect.width / lastRect.width;
        const deltaH = firstRect.height / lastRect.height;

        modalImg.style.transition = "transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease";
        modalImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        modalImg.style.opacity = "0";
        captionText.classList.remove('visible');

        modalImg.addEventListener('transitionend', function () {
            modal.style.display = "none";
            document.body.style.overflow = "";
            modalImg.style.transform = "";
            modalImg.style.opacity = "";
            modalImg.style.transition = ""; // Reset transition
        }, { once: true });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the image
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });
});
