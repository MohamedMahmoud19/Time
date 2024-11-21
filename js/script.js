class DigitalClock {
    constructor() {
        this.strips = [...document.querySelectorAll(".strip")];
        this.numberSize = 8;
        this.format24Hour = localStorage.getItem("timeFormat") === "24";
        this.displayFormat = localStorage.getItem("displayFormat") || 'full';
        this.lastUpdate = 0;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupFullscreen();
        this.setupKeyboardControls();
        this.setupSettings();
        this.startClock();
    }

    setupTheme() {
        this.themeToggleBtn = document.getElementById("theme-toggle-btn");
        const currentTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (currentTheme === "dark" || (!currentTheme && prefersDark.matches)) {
            this.enableDarkMode();
        }
        
        this.themeToggleBtn.addEventListener("click", () => this.toggleTheme());
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                e.matches ? this.enableDarkMode() : this.disableDarkMode();
            }
        });
    }

    setupFullscreen() {
        this.fullscreenBtn = document.getElementById("fullscreen-btn");
        this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
    }

    setupSettings() {
        this.settingsBtn = document.getElementById("settings-btn");
        this.settingsPanel = document.getElementById("settings-panel");
        this.timeFormatSelect = document.getElementById("timeFormat");
        this.displayFormatSelect = document.getElementById("displayFormat");

        if (!this.settingsBtn || !this.settingsPanel || 
            !this.timeFormatSelect || !this.displayFormatSelect) {
            console.error("Required settings elements not found");
            return;
        }

        // Load saved settings
        if (this.format24Hour) {
            this.timeFormatSelect.checked = true;
        }
        if (this.displayFormat === 'simple') {
            this.displayFormatSelect.checked = false;
        }

        // Event listeners
        this.settingsBtn.addEventListener("click", () => {
            this.settingsPanel.classList.toggle("active");
        });

        this.timeFormatSelect.addEventListener("change", (e) => {
            this.format24Hour = e.target.checked;
            localStorage.setItem("timeFormat", e.target.checked ? "24" : "12");
            
            // Add data attribute for time format
            document.querySelector(".clock").setAttribute(
                "data-time-format", 
                e.target.checked ? "24" : "12"
            );
            
            // Force immediate update of the display
            this.updateTimeDisplay();
        });

        // Initialize time format
        document.querySelector(".clock").setAttribute(
            "data-time-format", 
            this.format24Hour ? "24" : "12"
        );

        this.displayFormatSelect.addEventListener("change", (e) => {
            this.displayFormat = e.target.checked ? 'full' : 'simple';
            localStorage.setItem("displayFormat", this.displayFormat);
            
            const clockElement = document.querySelector(".clock");
            clockElement.setAttribute("data-display", this.displayFormat);
            
            this.updateTimeDisplay();
        });

        document.querySelector(".clock").setAttribute("data-display", this.displayFormat);

        document.addEventListener("click", (e) => {
            if (!this.settingsPanel.contains(e.target) && !this.settingsBtn.contains(e.target)) {
                this.settingsPanel.classList.remove("active");
            }
        });
    }

    startClock() {
        let lastUpdate = 0;
        const updateTime = (timestamp) => {
            if (timestamp - lastUpdate >= 1000) {
                const time = new Date();
                let hours = time.getHours();
                const mins = time.getMinutes();
                const secs = time.getSeconds();
                const period = hours >= 12 ? 'PM' : 'AM';

                if (!this.format24Hour) {
                    hours = hours % 12 || 12;
                }

                this.updateDisplay(hours, mins, secs, period);
                lastUpdate = timestamp;
            }
            requestAnimationFrame(updateTime);
        };
        requestAnimationFrame(updateTime);
    }

    updateDisplay(hours, mins, secs, period) {
        this.stripSlider(0, hours);
        if (this.displayFormat !== 'h') {
            this.stripSlider(2, mins);
        }
        if (this.displayFormat === 'full') {
            this.stripSlider(4, secs);
        }
        if (!this.format24Hour) {
            this.updatePeriod(period);
        }
    }

    stripSlider(strip, number) {
        const d1 = Math.floor(number / 10);
        const d2 = number % 10;
        this.updateStrip(strip, d1);
        this.updateStrip(strip + 1, d2);
    }

    updateStrip(strip, digit) {
        if (this.strips[strip]) {
            this.strips[strip].style.transform = `translateY(${digit * -this.numberSize}vmin)`;
            this.highlight(strip, digit);
        }
    }

    highlight(strip, digit) {
        const number = this.strips[strip].querySelector(`.number:nth-of-type(${digit + 1})`);
        if (number) {
            number.classList.add("pop");
            setTimeout(() => number.classList.remove("pop"), 950);
        }
    }

    updatePeriod(period) {
        const index = period === 'AM' ? 0 : 1;
        this.updateStrip(6, index);
    }

    toggleTheme() {
        document.body.classList.contains("dark-mode") ? 
            this.disableDarkMode() : this.enableDarkMode();
    }

    enableDarkMode() {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
        this.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        this.themeToggleBtn.title = "Light Mode (L)";
    }

    disableDarkMode() {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
        this.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        this.themeToggleBtn.title = "Dark Mode (D)";
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            this.fullscreenBtn.classList.add("fullscreen");
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            this.fullscreenBtn.classList.remove("fullscreen");
        }
    }

    setupKeyboardControls() {
        const shortcuts = {
            'escape': () => {
                if (document.fullscreenElement) this.toggleFullscreen();
                this.settingsPanel.classList.remove("active");
            },
            'f': () => this.toggleFullscreen(),
            'd': () => this.enableDarkMode(),
            'l': () => this.disableDarkMode(),
            's': () => this.settingsPanel.classList.toggle("active"),
            'h': () => {
                this.displayFormatSelect.checked = false;
                this.displayFormatSelect.dispatchEvent(new Event('change'));
            },
            'm': () => {
                this.displayFormatSelect.checked = true;
                this.displayFormatSelect.dispatchEvent(new Event('change'));
            },
            'a': () => {
                this.displayFormatSelect.checked = true;
                this.displayFormatSelect.dispatchEvent(new Event('change'));
            }
        };

        document.addEventListener("keydown", (event) => {
            const handler = shortcuts[event.key.toLowerCase()];
            if (handler) {
                event.preventDefault();
                handler();
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new DigitalClock();
});