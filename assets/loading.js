(function () {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingWrapper = document.querySelector('.loading-wrapper');
    const nameReveal = document.querySelector('.name-reveal');
    const nameLayers = document.querySelectorAll('.name-trail, .name-trace');

    if (!loadingScreen || !loadingWrapper || !nameReveal) return;

    function prepareNameCharacters(layer) {
        const characters = Array.from(layer.textContent);
        const visibleCharacterCount = characters.filter((character) => character !== ' ').length;
        const centerIndex = (visibleCharacterCount - 1) / 2;
        let visibleIndex = 0;

        layer.textContent = '';

        characters.forEach((character) => {
            const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            span.classList.add('name-char');
            span.textContent = character === ' ' ? '\u00a0' : character;

            if (character !== ' ') {
                const delay = Math.abs(visibleIndex - centerIndex) * 0.07;
                span.style.setProperty('--light-delay', `${delay.toFixed(2)}s`);
                visibleIndex += 1;
            }

            layer.appendChild(span);
        });
    }

    nameLayers.forEach(prepareNameCharacters);

    document.body.style.overflow = 'hidden';

    function showNameReveal() {
        // Commit the hidden state before transitioning to visible. Without this,
        // some browsers combine both states and skip the entrance animation.
        void nameReveal.offsetWidth;
        requestAnimationFrame(() => {
            nameReveal.classList.add('visible');
        });

        setTimeout(() => {
            nameReveal.classList.add('leaving');
            nameReveal.classList.remove('visible');

            setTimeout(() => {
                function removeLoadingScreen(event) {
                    if (event.target !== loadingScreen) return;
                    loadingScreen.removeEventListener('transitionend', removeLoadingScreen);
                    loadingScreen.remove();
                }

                loadingScreen.addEventListener('transitionend', removeLoadingScreen);
                loadingScreen.classList.add('fade-out');
                document.body.style.overflow = '';
            }, 100);
        }, 5800);
    }

    function playCrtShutdown() {
        const flash = document.createElement('div');
        flash.className = 'crt-overlay';
        loadingScreen.appendChild(flash);
        loadingWrapper.classList.add('crt-element-shutdown');

        setTimeout(() => {
            loadingWrapper.style.visibility = 'hidden';
            flash.remove();

            // Brief black-screen beat between the CRT shutdown and name reveal.
            setTimeout(showNameReveal, 500);
        }, 700);
    }

    // Let the first frame paint before immediately playing the CRT transition.
    requestAnimationFrame(() => requestAnimationFrame(playCrtShutdown));
})();
