(function () {
    // --- Configuration ---
    const typingSpeed = 15;
    const lineDelay = 50;
    const initialLines = [
        '> Booting Portfolio OS v2.0.26...',
        '> Initializing core modules...',
        '> [OK] User Interface loaded',
        '> [OK] Glassmorphism Engine active',
        '> Connecting to server...',
        '> Fetching developer profile...',
        '> Subject: Yohan Lukin Callanta',
        '> Role: Software Engineer',
        '> Location: Philippines',
        '> Loading skill matrix...',
        '> [INFO] Python detected',
        '> [INFO] Vue.js framework ready',
        '> [INFO] React Native module loaded',
        '> Compiling project data...',
        '> [SUCCESS] Database connection established',
        '> Optimizing assets for retina display...',
        '> Checking system integrity...',
        '> 0 vulnerabilities found.',
        '> Establishing secure session...',
        '> [READY] System optimization complete',
        '> Launching main interface...',
    ];

    // --- Elements ---
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingWrapper = document.querySelector('.loading-wrapper');
    const consoleBody = document.querySelector('.console-body');

    if (!loadingScreen) return;

    // --- State ---
    let consoleLines = [];

    // --- Helper: Parse Text for Colors ---
    function parseText(text) {
        const chunks = [];
        let remaining = text;
        const regex = /^(.*?)(\[(?:OK|INFO|SUCCESS|READY|PING|WARNING)\])(.*)$/;

        while (remaining.length > 0) {
            const match = remaining.match(regex);

            if (match) {
                if (match[1]) {
                    chunks.push({ text: match[1], color: null });
                }

                let color = '#00cec9';
                const tag = match[2];
                if (tag === '[OK]' || tag === '[SUCCESS]' || tag === '[READY]') {
                    color = '#55efc4';
                } else if (tag === '[WARNING]') {
                    color = '#ffeaa7';
                }

                chunks.push({ text: tag, color: color });
                remaining = match[3];
            } else {
                chunks.push({ text: remaining, color: null });
                remaining = '';
            }
        }
        return chunks;
    }

    // --- Helper: Type a single line ---
    async function typeLine(text) {
        if (!loadingScreen.isConnected) return;

        const line = document.createElement('div');
        line.className = 'console-line';
        const cursor = consoleBody.querySelector('.console-cursor');
        if (cursor && cursor.parentNode === consoleBody) {
            consoleBody.insertBefore(line, cursor);
        } else {
            consoleBody.appendChild(line);
        }

        consoleLines.push(line);
        if (consoleLines.length > 50) {
            if (consoleLines[0] && consoleLines[0].parentNode) {
                consoleLines[0].remove();
            }
            consoleLines.shift();
        }

        const chunks = parseText(text);
        for (const chunk of chunks) {
            const span = document.createElement('span');
            if (chunk.color) { span.style.color = chunk.color; }
            line.appendChild(span);
            for (const char of chunk.text) {
                span.textContent += char;
                consoleBody.scrollTop = consoleBody.scrollHeight;
                await new Promise(r => setTimeout(r, typingSpeed));
            }
        }
    }

    // --- Main Sequence ---
    async function runConsoleSequence() {
        const totalLines = initialLines.length;

        for (let i = 0; i < totalLines; i++) {
            if (!loadingScreen.isConnected) break;

            const line = initialLines[i];
            await typeLine(line);
            await new Promise(r => setTimeout(r, lineDelay + Math.random() * 50));
        }

        checkCompletion();
    }

    // --- Completion ---
    function checkCompletion() {
        // 1. CRT Shutdown for ALL content via wrapper
        setTimeout(() => {
            // Must query again or ensure variable is valid
            const wrapper = document.querySelector('.loading-wrapper');

            // Create CRT Flash Overlay
            const overlay = document.createElement('div');
            overlay.className = 'crt-overlay';
            loadingScreen.appendChild(overlay);

            if (wrapper) {
                wrapper.classList.add('crt-element-shutdown');

                // Force Hide Buffer
                setTimeout(() => {
                    wrapper.style.visibility = 'hidden';
                    wrapper.style.opacity = '0';
                    // Cleanup overlay
                    if (overlay.parentNode) overlay.remove();
                }, 600);
            }

            // 2. Sleep for 2 seconds (Black Screen)
            setTimeout(() => {
                // 3. Welcome Message
                showWelcomeMessage();
            }, 2000);
        }, 500);
    }

    function showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-text';
        welcome.innerHTML = 'Welcome, visitor...';
        loadingScreen.appendChild(welcome);

        void welcome.offsetWidth;
        welcome.classList.add('visible');

        // 4. Wait for user to read
        setTimeout(() => {
            // 5. Fade OUT Welcome Text first
            welcome.classList.remove('visible');

            // 6. Wait for text to fade (1.5s transition), then fade screen
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');

                // 7. Remove from DOM
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 1500);
            }, 1000); // 1.0s delay allows text to fade before screen fades
        }, 2000); // Read time
    }

    runConsoleSequence();
})();
