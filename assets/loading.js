(function () {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingWrapper = document.querySelector('.loading-wrapper');

    if (!loadingScreen || !loadingWrapper) return;

    document.body.style.overflow = 'hidden';

    function showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-text';
        welcome.textContent = 'Welcome, visitor...';
        loadingScreen.appendChild(welcome);

        // Commit the hidden state before transitioning to visible. Without this,
        // some browsers combine both states and skip the entrance animation.
        void welcome.offsetWidth;
        requestAnimationFrame(() => {
            welcome.classList.add('visible');
        });

        setTimeout(() => {
            welcome.classList.add('leaving');
            welcome.classList.remove('visible');

            setTimeout(() => {
                function removeLoadingScreen(event) {
                    if (event.target !== loadingScreen) return;
                    loadingScreen.removeEventListener('transitionend', removeLoadingScreen);
                    loadingScreen.remove();
                }

                loadingScreen.addEventListener('transitionend', removeLoadingScreen);
                loadingScreen.classList.add('fade-out');
                document.body.style.overflow = '';
            }, 900);
        }, 3200);
    }

    function playCrtShutdown() {
        const flash = document.createElement('div');
        flash.className = 'crt-overlay';
        loadingScreen.appendChild(flash);
        loadingWrapper.classList.add('crt-element-shutdown');

        setTimeout(() => {
            loadingWrapper.style.visibility = 'hidden';
            flash.remove();

            // Brief black-screen beat between the CRT shutdown and welcome.
            setTimeout(showWelcomeMessage, 500);
        }, 700);
    }

    // Let the first frame paint before immediately playing the CRT transition.
    requestAnimationFrame(() => requestAnimationFrame(playCrtShutdown));
})();
