document.addEventListener("DOMContentLoaded", () => {
    const strips = [...document.querySelectorAll(".strip")];
    const numberSize = 8; // in vmin

    // Check localStorage for theme setting and apply
    const currentTheme = localStorage.getItem("theme");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");

    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleBtn.title = "Light Mode (L)";
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.title = "Dark Mode (D)";
    }

    // Theme toggle button event listener
    themeToggleBtn.addEventListener("click", toggleTheme);

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.title = "Light Mode (L)";
        } else {
            localStorage.setItem("theme", "light");
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.title = "Dark Mode (D)";
        }
    }

    function highlight(strip, d) {
        strips[strip]
            .querySelector(`.number:nth-of-type(${d + 1})`)
            .classList.add("pop");

        setTimeout(() => {
            strips[strip]
                .querySelector(`.number:nth-of-type(${d + 1})`)
                .classList.remove("pop");
        }, 950); // causes ticking
    }

    function stripSlider(strip, number) {
        let d1 = Math.floor(number / 10);
        let d2 = number % 10;

        strips[strip].style.transform = `translateY(${d1 * -numberSize}vmin)`;
        highlight(strip, d1);
        strips[strip + 1].style.transform = `translateY(${d2 * -numberSize}vmin)`;
        highlight(strip + 1, d2);
    }

    function updatePeriod(period) {
        let index = period === 'AM' ? 0 : 1;
        strips[6].style.transform = `translateY(${index * -numberSize}vmin)`;
        highlight(6, index);
    }

    setInterval(() => {
        const time = new Date();

        let hours = time.getHours();
        const mins = time.getMinutes();
        const secs = time.getSeconds();

        // تحويل الساعات إلى نظام 12 ساعة
        let period = hours >= 12 ? 'PM' : 'AM'; // تحديد الفترة AM/PM
        hours = hours % 12 || 12; // إذا كانت الساعة 0 يجب تحويلها إلى 12

        stripSlider(0, hours);
        stripSlider(2, mins);
        stripSlider(4, secs);
        updatePeriod(period); // تحديث مؤشر AM/PM

        console.log(period); // طباعة الفترة AM/PM في وحدة التحكم
    }, 1000);

    const fullscreenBtn = document.getElementById("fullscreen-btn");

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            fullscreenBtn.classList.add("fullscreen");
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.classList.remove("fullscreen");
            }
        }
    }

    fullscreenBtn.addEventListener("click", toggleFullscreen);

    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase(); // Convert key to lowercase for uniformity

        if (key === "escape" && document.fullscreenElement) {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.classList.remove("fullscreen");
        } else if (key === "f") {
            toggleFullscreen();
        } else if (key === "d") {
            enableDarkMode();
        } else if (key === "l") {
            disableDarkMode();
        }
    });

    function enableDarkMode() {
        if (!document.body.classList.contains("dark-mode")) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.title = "Light Mode (L)";
        }
    }

    function disableDarkMode() {
        if (document.body.classList.contains("dark-mode")) {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.title = "Dark Mode (D)";
        }
    }
});
