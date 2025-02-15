document.addEventListener('DOMContentLoaded', function () {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    });

    const scrollTopButton = document.getElementById('scroll-top-button');
    if (scrollTopButton) {
        scrollTopButton.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll('.image-gallery img');
    let currentImageIndex = 0;

    document.getElementById('nextButton').addEventListener('click', function () {
        changeImage(1);
    });

    document.getElementById('prevButton').addEventListener('click', function () {
        changeImage(-1);
    });

    function changeImage(step) {
        images[currentImageIndex].style.opacity = 0;
        currentImageIndex = (currentImageIndex + step + images.length) % images.length;
        images[currentImageIndex].style.opacity = 1;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const headerLink = document.getElementById('header-link');
    const navList = document.querySelector('.nav-list');

    // ambot saon ni nag libog nako
    function smoothScroll(target, duration) {
        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    headerLink.addEventListener('click', function (event) {
        event.preventDefault();
        const targetSection = document.querySelector('body');
        const duration = 1000; 
        smoothScroll(targetSection, duration);
    });

    headerLink.addEventListener('mouseenter', function () {
        headerLink.style.transition = 'color 0.3s ease-in-out';
        headerLink.style.color = '#4E7A5B';
    });

    headerLink.addEventListener('mouseout', function () {
        headerLink.style.transition = 'color 0.3s ease-in-out';
        headerLink.style.color = '';
    });

    menuToggle.addEventListener('click', function () {
        navList.classList.toggle('active');
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            navList.classList.remove('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 100,
                    "height": 100
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
});


