(function () {
    // --- Configuration ---
    const fullText = 'SYSTEM INITIALIZING...';
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
    const loadingWrapper = document.querySelector('.loading-wrapper'); // NEW WRAPPER
    const consoleBody = document.querySelector('.console-body');
    const typewriterText = document.querySelector('.typewriter-text');
    const progressText = document.querySelector('.loading-percentage');
    const progressRing = document.querySelector('.progress-ring-progress');

    if (!loadingScreen) return;

    // --- State ---
    let progress = 0;
    let targetProgress = 0;
    let consoleLines = [];
    let isTyping = false;
    let sequenceComplete = false;
    let loaded = false;

    let textInterval = null;
    let smoothProgressInterval = null;
    let randomLineTimeout = null;

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
        if (consoleLines.length > 15) {
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
                if (loaded) break;
                span.textContent += char;
                consoleBody.scrollTop = consoleBody.scrollHeight;
                await new Promise(r => setTimeout(r, typingSpeed));
            }
        }
    }

    // --- Main Sequence ---
    async function runConsoleSequence() {
        isTyping = true;
        const totalLines = initialLines.length;

        for (let i = 0; i < totalLines; i++) {
            if (!loadingScreen.isConnected) break;

            const line = initialLines[i];
            targetProgress = Math.round(((i + 1) / totalLines) * 100);

            await typeLine(line);
            await new Promise(r => setTimeout(r, lineDelay + Math.random() * 50));
        }

        targetProgress = 100;
        sequenceComplete = true;
        isTyping = false;

        checkCompletion();
        if (!loaded) startRandomLines();
    }

    // --- Random Lines ---
    function startRandomLines() {
        if (loaded) return;
        const randomLoop = async () => {
            if (loaded || !loadingScreen.isConnected || loadingScreen.style.display === 'none') return;
            const randomLines = [
                '> Monitoring system status...',
                '> [PING] Server response: 12ms',
                '> Optimizing render queue...',
            ];
            const text = randomLines[Math.floor(Math.random() * randomLines.length)];
            await typeLine(text);
            if (!loaded) {
                randomLineTimeout = setTimeout(randomLoop, 2000 + Math.random() * 1000);
            }
        };
        setTimeout(randomLoop, 1000);
    }

    // --- Typewriter Effect ---
    let charIndex = 0;
    textInterval = setInterval(() => {
        if (charIndex < fullText.length) {
            typewriterText.textContent = fullText.slice(0, charIndex + 1);
            charIndex++;
        } else {
            clearInterval(textInterval);
        }
    }, 100);

    // --- Progress ---
    const circle = progressRing;
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgressDisplay(percent) {
        const offset = circumference - percent / 100 * circumference;
        circle.style.strokeDashoffset = offset;
        progressText.textContent = `${Math.round(percent)}%`;
    }

    smoothProgressInterval = setInterval(() => {
        if (progress < targetProgress) {
            const diff = targetProgress - progress;
            const inc = Math.max(0.5, diff * 0.1);
            progress += inc;
            if (progress > targetProgress) progress = targetProgress;
        } else if (progress > targetProgress) {
            progress = targetProgress;
        }
        setProgressDisplay(progress);
        if (progress >= 99.5 && sequenceComplete) {
            clearInterval(smoothProgressInterval);
            loaded = true;
            checkCompletion();
        }
    }, 20);

    // --- Completion ---
    let completionTriggered = false;

    function checkCompletion() {
        if (completionTriggered) return;

        if (sequenceComplete && loaded) {
            completionTriggered = true;

            if (textInterval) clearInterval(textInterval);
            if (smoothProgressInterval) clearInterval(smoothProgressInterval);
            if (randomLineTimeout) clearTimeout(randomLineTimeout);

            setProgressDisplay(100);

            // 1. CRT Shutdown for ALL content via wrapper
            setTimeout(() => {
                // Must query again or ensure variable is valid
                const wrapper = document.querySelector('.loading-wrapper');

                if (wrapper) {
                    wrapper.classList.add('crt-element-shutdown');

                    // Force Hide Buffer
                    setTimeout(() => {
                        wrapper.style.visibility = 'hidden';
                        wrapper.style.opacity = '0';
                    }, 600);
                }

                // 2. Sleep for 2 seconds (Black Screen)
                setTimeout(() => {
                    // 3. Welcome Message
                    showWelcomeMessage();
                }, 2000);
            }, 500);
        }
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
