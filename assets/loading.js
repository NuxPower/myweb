(function () {
    // --- Configuration ---
    const typingSpeed = 25; // Slightly slower for drama
    const lineDelay = 100;

    // Mix of strings (lines) and numbers (pause in ms)
    const sequenceConfig = [
        '> Booting Portfolio OS v2.0.26...',
        500,
        '> Initializing core modules...',
        200,
        '> [OK] User Interface loaded',
        '> [OK] Glassmorphism Engine active',
        800, // Dramatic pause before connecting
        '> Connecting to server...',
        1500, // Long pause for "connection"
        '> Fetching developer profile...',
        '> Subject: Yohan Lukin Callanta',
        '> Role: Software Engineer',
        '> Location: Philippines',
        500,
        '> Loading skill matrix...',
        200,
        '> [INFO] Python detected',
        '> [INFO] Vue.js framework ready',
        '> [INFO] React Native module loaded',
        800,
        '> Compiling project data...',
        1200, // Compiling takes time
        '> [SUCCESS] Database connection established',
        '> Optimizing assets for retina display...',
        '> Checking system integrity...',
        500,
        '> 0 vulnerabilities found.',
        '> Establishing secure session...',
        1000,
        '> [READY] System optimization complete',
        500,
        '> Launching main interface...',
        1000 // Final pause before visuals
    ];

    // --- Elements ---
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingWrapper = document.querySelector('.loading-wrapper');
    const consoleBody = document.querySelector('.console-body');

    if (!loadingScreen) return;

    // --- State ---
    let consoleLines = [];

    // Clear initial static cursor since we'll manage it dynamically
    const staticCursor = consoleBody.querySelector('.console-cursor');
    if (staticCursor) staticCursor.remove();

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

        // Add active blinking cursor to THIS line
        const cursor = document.createElement('span');
        cursor.className = 'console-cursor';
        cursor.textContent = '|';
        line.appendChild(cursor);

        consoleBody.appendChild(line);

        consoleLines.push(line);
        if (consoleLines.length > 50) {
            if (consoleLines[0] && consoleLines[0].parentNode) {
                consoleLines[0].remove();
            }
            consoleLines.shift();
        }

        const chunks = parseText(text);

        // Scroll to bottom
        consoleBody.scrollTop = consoleBody.scrollHeight;

        for (const chunk of chunks) {
            const span = document.createElement('span');
            if (chunk.color) { span.style.color = chunk.color; }

            // Insert text BEFORE the cursor
            line.insertBefore(span, cursor);

            for (const char of chunk.text) {
                span.textContent += char;
                consoleBody.scrollTop = consoleBody.scrollHeight;
                await new Promise(r => setTimeout(r, typingSpeed));
            }
        }

        // Slight pause at end of line before removing cursor
        await new Promise(r => setTimeout(r, 100));

        // Remove cursor from this line (it will appear on the next line or stay if it's the last one)
        // We'll leave it here and only remove it when the NEXT line starts, 
        // implies we should return the cursor element or handle removal in main loop.
        // Or simpler: remove it now, and the main loop delay will happen, then next line starts with cursor.
        // BUT for the "blinking" effect during the pause, we want the cursor to stay.

        return cursor;
    }

    // --- Main Sequence ---
    async function runConsoleSequence() {
        let previousCursor = null;

        for (const item of sequenceConfig) {
            if (!loadingScreen.isConnected) break;

            if (typeof item === 'number') {
                // It's a pause. The cursor from the previous line should still be blinking there.
                await new Promise(r => setTimeout(r, item));
            } else {
                // It's a text line.
                // First, remove cursor from previous line if it exists
                if (previousCursor) {
                    previousCursor.remove();
                }

                // Type the new line and get its cursor
                previousCursor = await typeLine(item);

                // Small delay after finishing typing a line before processing next item
                await new Promise(r => setTimeout(r, lineDelay));
            }
        }

        // Sequence finished. Keep the last cursor blinking for a moment?
        // Or proceed to completion.

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
