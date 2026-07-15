document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navbar = document.querySelector('nav');

    function setMenu(open) {
        menuToggle?.classList.toggle('active', open);
        navLinks?.classList.toggle('active', open);
        menuOverlay?.classList.toggle('active', open);
        menuToggle?.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
    }

    menuToggle?.addEventListener('click', () => {
        setMenu(!navLinks?.classList.contains('active'));
    });

    menuOverlay?.addEventListener('click', () => setMenu(false));
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setMenu(false);
    });

    function updateNavigation() {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
    }

    updateNavigation();
    window.addEventListener('scroll', updateNavigation, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        if (link.matches('.map-node')) return;

        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });

    const revealTargets = document.querySelectorAll([
        '.section-heading',
        '.system-map',
        '.project-showcase',
        '.project-pair',
        '.project-archive',
        '.experience-item',
        '.capability-grid article',
        '.about-layout',
        '.credential-card',
        '.contact-shell'
    ].join(','));

    revealTargets.forEach(target => target.classList.add('reveal'));

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -8% 0px'
        });

        revealTargets.forEach(target => revealObserver.observe(target));
    } else {
        revealTargets.forEach(target => target.classList.add('is-visible'));
    }

    const observedSections = document.querySelectorAll('main section[id]');
    const navigationAnchors = document.querySelectorAll('.nav-links a');

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navigationAnchors.forEach(anchor => {
                    anchor.classList.toggle('active', anchor.getAttribute('href') === `#${entry.target.id}`);
                });
            });
        }, {
            rootMargin: '-30% 0px -60% 0px',
            threshold: 0
        });

        observedSections.forEach(section => sectionObserver.observe(section));
    }

    const mapField = document.querySelector('.map-field');

    if (mapField) {
        const depthLayers = [...mapField.querySelectorAll('[data-depth]')];
        const mapNodes = [...mapField.querySelectorAll('.map-node')];
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let animationFrame = null;
        let selectedNode = null;
        let orbitAnimationFrame = null;
        let orbitElapsed = 0;
        let lastOrbitTimestamp = 0;
        let orbitPaused = false;
        let mapIsVisible = true;

        depthLayers.forEach(layer => {
            const z = Number(layer.dataset.z) || 0;
            layer.style.setProperty('--layer-z', `${z}px`);
        });

        function depthIsEnabled() {
            return !prefersReducedMotion && finePointer.matches && window.innerWidth > 768;
        }

        function orbitIsEnabled() {
            return !prefersReducedMotion && !orbitPaused && window.innerWidth > 768
                && mapIsVisible && !document.hidden;
        }

        function positionOrbitingNodes() {
            const availableWidth = mapField.clientWidth;
            const systemScale = Math.min(1, Math.max(0.66, (availableWidth - 170) / 850));

            mapNodes.forEach((node, index) => {
                const radius = (Number(node.dataset.orbit) || 140 + index * 64) * systemScale;
                const phase = (Number(node.dataset.phase) || index * 72) * Math.PI / 180;
                const duration = (Number(node.dataset.speed) || 28) * 1000;
                const angle = phase + (orbitElapsed / duration) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius * 0.3;
                const z = Math.sin(angle) * radius * 0.56;

                node.style.setProperty('--orbit-x', `${x.toFixed(2)}px`);
                node.style.setProperty('--orbit-y', `${y.toFixed(2)}px`);
                node.style.setProperty('--orbit-z', `${z.toFixed(2)}px`);
                node.style.zIndex = String(Math.max(2, Math.round(20 + z / 10)));
            });
        }

        function renderOrbits(timestamp) {
            if (!orbitIsEnabled()) {
                orbitAnimationFrame = null;
                lastOrbitTimestamp = 0;
                return;
            }

            if (lastOrbitTimestamp && !orbitPaused) {
                orbitElapsed += Math.min(timestamp - lastOrbitTimestamp, 50);
            }
            lastOrbitTimestamp = timestamp;
            positionOrbitingNodes();
            orbitAnimationFrame = window.requestAnimationFrame(renderOrbits);
        }

        function queueOrbitRender() {
            positionOrbitingNodes();
            if (orbitIsEnabled() && !orbitAnimationFrame) {
                orbitAnimationFrame = window.requestAnimationFrame(renderOrbits);
            }
        }

        function setOrbitPaused(paused) {
            orbitPaused = paused;
            mapField.classList.toggle('is-orbit-paused', paused);
            lastOrbitTimestamp = 0;
            if (paused && orbitAnimationFrame) {
                window.cancelAnimationFrame(orbitAnimationFrame);
                orbitAnimationFrame = null;
            }
            if (!paused) queueOrbitRender();
        }

        function renderDepth() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;

            mapField.style.setProperty('--camera-x', `${currentY * -2.2}deg`);
            mapField.style.setProperty('--camera-y', `${currentX * 3}deg`);

            depthLayers.forEach(layer => {
                const depth = Number(layer.dataset.depth) || 0;
                layer.style.setProperty('--layer-x', `${currentX * 22 * depth}px`);
                layer.style.setProperty('--layer-y', `${currentY * 15 * depth}px`);
            });

            const stillMoving = Math.abs(targetX - currentX) > 0.002
                || Math.abs(targetY - currentY) > 0.002;

            if (stillMoving) {
                animationFrame = window.requestAnimationFrame(renderDepth);
            } else {
                animationFrame = null;
            }
        }

        function queueDepthRender() {
            if (!animationFrame) animationFrame = window.requestAnimationFrame(renderDepth);
        }

        function resetDepth() {
            targetX = 0;
            targetY = 0;
            queueDepthRender();
        }

        function setActiveNode(node) {
            const key = node?.dataset.node;
            mapField.classList.toggle('has-active-node', Boolean(key));
            mapNodes.forEach(item => item.classList.toggle('is-active', item === node));
        }

        function clearActiveNode(force = false) {
            if (selectedNode && !force) return;
            setActiveNode(null);
        }

        mapField.addEventListener('pointermove', event => {
            if (!depthIsEnabled() || event.pointerType === 'touch') return;
            const bounds = mapField.getBoundingClientRect();
            targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
            targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
            queueDepthRender();
        });

        mapField.addEventListener('pointerleave', () => {
            resetDepth();
            if (!selectedNode) setOrbitPaused(false);
            clearActiveNode();
        });

        mapNodes.forEach(node => {
            node.addEventListener('pointerenter', () => {
                setOrbitPaused(true);
                if (!selectedNode) setActiveNode(node);
            });
            node.addEventListener('pointerleave', () => {
                if (!selectedNode) setOrbitPaused(false);
                clearActiveNode();
            });
            node.addEventListener('focus', () => {
                setOrbitPaused(true);
                if (!selectedNode) setActiveNode(node);
            });
            node.addEventListener('blur', () => {
                if (!selectedNode) setOrbitPaused(false);
                clearActiveNode();
            });
            node.addEventListener('click', event => {
                const target = document.querySelector(node.getAttribute('href'));
                if (!target) return;

                event.preventDefault();
                selectedNode = node;
                setActiveNode(node);
                node.classList.add('is-selected');
                mapField.classList.add('is-focusing');
                const focusDelay = depthIsEnabled() ? 360 : 0;
                const resetDelay = depthIsEnabled() ? 1150 : 0;

                window.setTimeout(() => {
                    target.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }, prefersReducedMotion ? 0 : focusDelay);

                window.setTimeout(() => {
                    node.classList.remove('is-selected');
                    mapField.classList.remove('is-focusing');
                    selectedNode = null;
                    setOrbitPaused(false);
                    clearActiveNode(true);
                    resetDepth();
                }, prefersReducedMotion ? 0 : resetDelay);
            });
        });

        window.addEventListener('resize', () => {
            if (!depthIsEnabled()) resetDepth();
            queueOrbitRender();
        });

        if ('IntersectionObserver' in window) {
            const mapVisibilityObserver = new IntersectionObserver(entries => {
                mapIsVisible = entries[0]?.isIntersecting ?? true;
                if (mapIsVisible) queueOrbitRender();
            }, { rootMargin: '180px 0px' });
            mapVisibilityObserver.observe(mapField);
        }

        document.addEventListener('visibilitychange', queueOrbitRender);
        queueOrbitRender();
    }

    if (typeof particlesJS !== 'undefined' && !prefersReducedMotion) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: window.innerWidth < 768 ? 28 : 48,
                    density: { enable: true, value_area: 1000 }
                },
                color: { value: ['#8b5cf6', '#38d9d5', '#d7d2e4'] },
                shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
                opacity: { value: 0.22, random: true, anim: { enable: false } },
                size: { value: 2.4, random: true, anim: { enable: false } },
                line_linked: {
                    enable: true,
                    distance: 165,
                    color: '#8b5cf6',
                    opacity: 0.12,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.75,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: window.innerWidth > 768, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 150, line_linked: { opacity: 0.35 } },
                    push: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
    }

    const scrollToTopButton = document.getElementById('scroll-to-top');
    const pageFooter = document.querySelector('footer');

    function updateScrollButton() {
        const footerIsVisible = pageFooter
            ? pageFooter.getBoundingClientRect().top < window.innerHeight
            : false;

        scrollToTopButton?.classList.toggle('visible', window.scrollY > 600 && !footerIsVisible);
    }

    updateScrollButton();
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    window.addEventListener('resize', updateScrollButton);
    scrollToTopButton?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    document.querySelectorAll('[data-windmill-gallery]').forEach(gallery => {
        const slides = [...gallery.querySelectorAll('.windmill-slide')];
        const previousControl = gallery.querySelector('[data-windmill-prev]');
        const nextControl = gallery.querySelector('[data-windmill-next]');
        const countOutput = gallery.querySelector('[data-windmill-count]');
        const labelOutput = gallery.querySelector('[data-windmill-label-output]');
        let currentIndex = 0;

        if (!slides.length) return;

        function updateWindmill() {
            slides.forEach((slide, index) => {
                let offset = index - currentIndex;

                if (offset > slides.length / 2) offset -= slides.length;
                if (offset < -slides.length / 2) offset += slides.length;

                const slot = Math.abs(offset) <= 2 ? String(offset) : 'hidden';
                slide.dataset.windmillSlot = slot;
                slide.setAttribute('aria-hidden', String(slot === 'hidden'));
                slide.tabIndex = slot === 'hidden' ? -1 : 0;
            });

            if (countOutput) {
                countOutput.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
            }

            if (labelOutput) {
                labelOutput.textContent = slides[currentIndex].dataset.windmillLabel
                    || slides[currentIndex].dataset.title
                    || '';
            }
        }

        function moveWindmill(direction) {
            currentIndex = (currentIndex + direction + slides.length) % slides.length;
            updateWindmill();
        }

        previousControl?.addEventListener('click', () => moveWindmill(-1));
        nextControl?.addEventListener('click', () => moveWindmill(1));

        slides.forEach((slide, index) => {
            slide.addEventListener('click', event => {
                if (index === currentIndex) return;

                event.preventDefault();
                event.stopImmediatePropagation();

                let direction = index - currentIndex;
                if (direction > slides.length / 2) direction -= slides.length;
                if (direction < -slides.length / 2) direction += slides.length;
                moveWindmill(direction > 0 ? 1 : -1);
            });
        });

        gallery.addEventListener('keydown', event => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            moveWindmill(event.key === 'ArrowLeft' ? -1 : 1);
            slides[currentIndex].focus();
        });

        updateWindmill();
    });

    document.querySelectorAll('[data-fade-gallery]').forEach(gallery => {
        const slides = [...gallery.querySelectorAll('.archive-fade-slide')];
        const previousControl = gallery.querySelector('[data-fade-prev]');
        const nextControl = gallery.querySelector('[data-fade-next]');
        const toggleControl = gallery.querySelector('[data-fade-toggle]');
        const countOutput = gallery.querySelector('[data-fade-count]');
        const labelOutput = gallery.querySelector('[data-fade-label-output]');
        const delay = Number(gallery.dataset.fadeDelay) || 5000;
        let currentIndex = 0;
        let timer = null;
        let interactionPaused = false;
        let manuallyPaused = prefersReducedMotion;
        let isInView = !('IntersectionObserver' in window);

        if (!slides.length) return;

        gallery.style.setProperty('--fade-delay', `${delay}ms`);

        function canPlay() {
            return !manuallyPaused && !interactionPaused && isInView && !document.hidden;
        }

        function renderFade() {
            slides.forEach((slide, index) => {
                const active = index === currentIndex;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', String(!active));
                slide.tabIndex = active ? 0 : -1;
            });

            if (countOutput) {
                countOutput.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
            }

            if (labelOutput) {
                labelOutput.textContent = slides[currentIndex].dataset.fadeLabel
                    || slides[currentIndex].dataset.title
                    || '';
            }
        }

        function updateToggle() {
            if (!toggleControl) return;
            toggleControl.textContent = manuallyPaused ? '▶' : 'Ⅱ';
            toggleControl.setAttribute('aria-label', manuallyPaused
                ? 'Play KONEK slideshow'
                : 'Pause KONEK slideshow');
        }

        function scheduleFade() {
            window.clearTimeout(timer);
            gallery.classList.remove('is-playing');

            if (!canPlay()) return;

            void gallery.offsetWidth;
            gallery.classList.add('is-playing');
            timer = window.setTimeout(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                renderFade();
                scheduleFade();
            }, delay);
        }

        function moveFade(direction) {
            currentIndex = (currentIndex + direction + slides.length) % slides.length;
            renderFade();
            scheduleFade();
        }

        previousControl?.addEventListener('click', () => moveFade(-1));
        nextControl?.addEventListener('click', () => moveFade(1));
        toggleControl?.addEventListener('click', () => {
            manuallyPaused = !manuallyPaused;
            updateToggle();
            scheduleFade();
        });

        gallery.addEventListener('pointerenter', () => {
            interactionPaused = true;
            scheduleFade();
        });

        gallery.addEventListener('pointerleave', () => {
            interactionPaused = false;
            scheduleFade();
        });

        gallery.addEventListener('focusin', () => {
            interactionPaused = true;
            scheduleFade();
        });

        gallery.addEventListener('focusout', () => {
            window.setTimeout(() => {
                interactionPaused = gallery.contains(document.activeElement);
                scheduleFade();
            }, 0);
        });

        if ('IntersectionObserver' in window) {
            const fadeObserver = new IntersectionObserver(entries => {
                isInView = entries.some(entry => entry.isIntersecting);
                scheduleFade();
            }, { threshold: 0.18 });

            fadeObserver.observe(gallery);
        }

        document.addEventListener('visibilitychange', scheduleFade);
        renderFade();
        updateToggle();
        scheduleFade();
    });

    const modal = document.getElementById('image-viewer');
    const modalImage = document.getElementById('full-image');
    const caption = document.getElementById('caption');
    const closeButton = modal?.querySelector('.close');
    const previousButton = modal?.querySelector('.modal-prev');
    const nextButton = modal?.querySelector('.modal-next');
    let lastFocusedElement = null;
    let galleryItems = [];
    let galleryIndex = 0;

    function renderModalItem(trigger) {
        const image = trigger.querySelector('img');
        if (!modal || !modalImage || !caption || !image) return;

        modalImage.src = image.currentSrc || image.src;
        modalImage.alt = image.alt;

        const title = document.createElement('h3');
        title.textContent = trigger.dataset.title || image.alt;
        const description = document.createElement('p');
        description.textContent = trigger.dataset.description || '';
        const captionContent = [title, description];

        if (trigger.dataset.document) {
            const documentLink = document.createElement('a');
            documentLink.className = 'modal-document-link';
            documentLink.href = trigger.dataset.document;
            documentLink.target = '_blank';
            documentLink.rel = 'noreferrer';
            documentLink.textContent = 'Open original PDF ↗';
            captionContent.push(documentLink);
        }

        caption.replaceChildren(...captionContent);
    }

    function getGalleryItems(name) {
        return [...document.querySelectorAll('[data-gallery]')]
            .filter(item => item.dataset.gallery === name);
    }

    function openModal(trigger, focusOrigin = trigger) {
        if (!modal || !modalImage || !caption || !trigger) return;

        lastFocusedElement = focusOrigin;
        galleryItems = trigger.dataset.gallery ? getGalleryItems(trigger.dataset.gallery) : [trigger];
        galleryIndex = Math.max(0, galleryItems.indexOf(trigger));
        modal.classList.toggle('has-gallery', galleryItems.length > 1);
        renderModalItem(trigger);

        modal.classList.add('open');
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => modal.classList.add('visible'));
        closeButton?.focus();
    }

    function moveGallery(direction) {
        if (galleryItems.length < 2) return;
        galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
        renderModalItem(galleryItems[galleryIndex]);
    }

    function closeModal() {
        if (!modal?.classList.contains('open')) return;
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');

        window.setTimeout(() => {
            modal.classList.remove('open');
            modal.classList.remove('has-gallery');
            if (modalImage) modalImage.src = '';
            lastFocusedElement?.focus();
            galleryItems = [];
            galleryIndex = 0;
        }, prefersReducedMotion ? 0 : 280);
    }

    document.querySelectorAll('[data-viewer]').forEach(trigger => {
        trigger.addEventListener('click', () => openModal(trigger));
    });

    document.querySelectorAll('[data-gallery-open]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const items = getGalleryItems(trigger.dataset.galleryOpen);
            if (items.length) openModal(items[0], trigger);
        });
    });

    closeButton?.addEventListener('click', closeModal);
    previousButton?.addEventListener('click', () => moveGallery(-1));
    nextButton?.addEventListener('click', () => moveGallery(1));
    modal?.addEventListener('click', event => {
        if (event.target === modal || event.target.classList.contains('modal-stage')) closeModal();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setMenu(false);
            closeModal();
        }

        if (modal?.classList.contains('open') && event.key === 'ArrowLeft') {
            moveGallery(-1);
        }

        if (modal?.classList.contains('open') && event.key === 'ArrowRight') {
            moveGallery(1);
        }
    });
});
