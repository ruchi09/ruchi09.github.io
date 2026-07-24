// Desktop Homepage JavaScript
console.log("🖥️ Desktop Homepage Loaded!");

// Update time and date in taskbar
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeElement = document.getElementById("current-time");
  const dateElement = document.getElementById("current-date");

  if (timeElement) {
    timeElement.textContent = timeString;
  }
  if (dateElement) {
    dateElement.textContent = dateString;
  }
}

// Handle taskbar buttons
function initializeTaskbar() {
  const menuBtn = document.querySelector(".menu-btn");
  const searchInput = document.getElementById("search-input");
  const taskbarButtons = document.querySelectorAll(".taskbar-icon-btn");

  // Menu button
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      console.log("📋 Start Menu clicked");
    });
  }

  // Search bar
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchTerm = searchInput.value;
        console.log(`🔍 Searching for: ${searchTerm}`);
        searchInput.value = "";
      }
    });
  }

  // Taskbar icon buttons
  taskbarButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("title");
      console.log(`📌 Taskbar button clicked: ${title}`);
    });
  });

  document.querySelectorAll(".mail-btn, .resume-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".taskbar-app-btn")
        .forEach((appButton) => appButton.classList.remove("active"));
      btn.classList.add("app-open", "active");
      setTerminalFocused(false);
    });
  });

  document.querySelector(".resume-btn")?.addEventListener("click", (e) => {
    const resumeUrl = e.currentTarget.dataset.resume;
    if (resumeUrl) {
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    }
  });
}

// Initialize drag and drop for desktop icons
function initializeDrag() {
  const icons = [...document.querySelectorAll(".desktop-icon")];
  const actionsDiv = document.querySelector(".actionsDiv");
  let draggedIcon = null;
  let offsetX = 0;
  let offsetY = 0;
  let dragStartPosition = null;

  const positionsOverlap = (icon, x, y) => {
    const width = icon.offsetWidth;
    const height = icon.offsetHeight;

    return icons.some((otherIcon) => {
      if (otherIcon === icon) return false;

      const otherX = Number.parseFloat(otherIcon.style.left);
      const otherY = Number.parseFloat(otherIcon.style.top);

      return !(
        x + width <= otherX ||
        x >= otherX + otherIcon.offsetWidth ||
        y + height <= otherY ||
        y >= otherY + otherIcon.offsetHeight
      );
    });
  };

  // Absolute positioning keeps every shortcut fixed when another one moves.
  icons.forEach((icon, index) => {
    icon.style.left = 20 + (index % 2) * 120 + "px";
    icon.style.top = 20 + Math.floor(index / 2) * 120 + "px";
  });

  icons.forEach((icon) => {
    icon.addEventListener("mousedown", (e) => {
      draggedIcon = icon;
      const rect = icon.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragStartPosition = {
        x: Number.parseFloat(icon.style.left),
        y: Number.parseFloat(icon.style.top),
      };
      icon.classList.add("dragging");
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (draggedIcon && actionsDiv) {
      const actionsDivRect = actionsDiv.getBoundingClientRect();
      let x = e.clientX - actionsDivRect.left - offsetX;
      let y = e.clientY - actionsDivRect.top - offsetY;

      // Constrain within actionsDiv
      x = Math.max(
        10,
        Math.min(x, actionsDivRect.width - draggedIcon.offsetWidth - 10),
      );
      y = Math.max(
        10,
        Math.min(y, actionsDivRect.height - draggedIcon.offsetHeight - 10),
      );

      draggedIcon.style.left = x + "px";
      draggedIcon.style.top = y + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (draggedIcon) {
      const x = Number.parseFloat(draggedIcon.style.left);
      const y = Number.parseFloat(draggedIcon.style.top);

      if (positionsOverlap(draggedIcon, x, y) && dragStartPosition) {
        draggedIcon.style.left = dragStartPosition.x + "px";
        draggedIcon.style.top = dragStartPosition.y + "px";
      }
      draggedIcon.classList.remove("dragging");
      draggedIcon = null;
      dragStartPosition = null;
    }
  });
}

// Initialize desktop icons with click handlers
function initializeIcons() {
  const icons = document.querySelectorAll(".desktop-icon");

  icons.forEach((icon) => {
    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      const category = this.dataset.category;
      const label = this.querySelector(".icon-label").textContent;

      // Remove active state from all icons
      icons.forEach((i) => i.classList.remove("active"));

      // Add active state to clicked icon
      this.classList.add("active");

      console.log(`📁 Selected: ${label}`);
    });
  });

  // Deselect icon when clicking on desktop
  const desktop = document.querySelector(".desktop");
  desktop.addEventListener("click", function (e) {
    if (
      e.target === desktop ||
      e.target === desktop.querySelector(".wallpaper")
    ) {
      icons.forEach((i) => i.classList.remove("active"));
    }
  });
}

// Handle double-click to "open" an icon
function initializeDoubleClick() {
  const icons = document.querySelectorAll(".desktop-icon");
  icons.forEach((icon) => {
    icon.addEventListener("dblclick", function (e) {
      e.stopPropagation();
      const category = this.dataset.category;
      const label = this.querySelector(".icon-label").textContent;

      console.log(`🚀 Launching: ${label}`);

      // Special handling for backend icon
      if (category === "backend") {
        openBackendTerminal();
      } else if (category === "linkedin") {
        window.open(this.dataset.url, "_blank", "noopener,noreferrer");
      }
    });
  });
}

function setTerminalFocused(isFocused) {
  const terminal = document.getElementById("backend-terminal");
  const taskbarButton = document.getElementById("terminal-taskbar-button");

  if (!terminal || !taskbarButton) return;

  terminal.classList.toggle("focused", isFocused);
  if (isFocused) {
    document
      .querySelectorAll(".taskbar-app-btn")
      .forEach((appButton) => appButton.classList.remove("active"));
  }
  taskbarButton.classList.toggle("active", isFocused);
  taskbarButton.setAttribute("aria-pressed", String(isFocused));

  const taskbarAction = isFocused
    ? "Minimize terminal"
    : terminal.classList.contains("minimized")
      ? "Restore terminal"
      : "Focus terminal";
  taskbarButton.title = taskbarAction;
  taskbarButton.setAttribute("aria-label", taskbarAction);
}

// Open backend terminal window
function openBackendTerminal() {
  const terminal = document.getElementById("backend-terminal");
  const taskbarButton = document.getElementById("terminal-taskbar-button");

  if (!terminal || !taskbarButton) return;

  terminal.classList.add("open");
  terminal.classList.remove("minimized");
  taskbarButton.hidden = false;
  taskbarButton.classList.add("app-open");
  setTerminalFocused(true);
  console.log("⚙️ Backend terminal opened");
}

function minimizeBackendTerminal() {
  const terminal = document.getElementById("backend-terminal");

  if (!terminal?.classList.contains("open")) return;

  terminal.classList.add("minimized");
  setTerminalFocused(false);
  console.log("⚙️ Backend terminal minimized");
}

function toggleBackendTerminalMaximize() {
  const terminal = document.getElementById("backend-terminal");
  const maximizeButton = document.querySelector(".terminal-maximize");

  if (!terminal) return;

  terminal.classList.add("open");
  terminal.classList.remove("minimized");
  terminal.classList.toggle("maximized");
  const maximizeAction = terminal.classList.contains("maximized")
    ? "Exit full screen"
    : "Toggle full screen";
  if (maximizeButton) {
    maximizeButton.title = maximizeAction;
    maximizeButton.setAttribute("aria-label", maximizeAction);
  }
  setTerminalFocused(true);
  console.log("⚙️ Backend terminal full screen toggled");
}

// Close backend terminal window
function closeBackendTerminal() {
  const terminal = document.getElementById("backend-terminal");
  const taskbarButton = document.getElementById("terminal-taskbar-button");

  if (!terminal || !taskbarButton) return;

  terminal.classList.remove("open");
  terminal.classList.remove("minimized", "maximized", "focused");
  taskbarButton.classList.remove("active");
  taskbarButton.classList.remove("app-open");
  taskbarButton.setAttribute("aria-pressed", "false");
  taskbarButton.title = "Open terminal";
  taskbarButton.setAttribute("aria-label", "Open terminal");
  taskbarButton.hidden = true;
  console.log("⚙️ Backend terminal closed");
}

// Language toggle functionality
function initializeLanguageToggle() {
  const languageBtn = document.getElementById("language-btn");
  const languages = ["ENG", "HIN", "SPA"];
  let currentLangIndex = 0;

  if (languageBtn) {
    languageBtn.addEventListener("click", () => {
      currentLangIndex = (currentLangIndex + 1) % languages.length;
      languageBtn.textContent = languages[currentLangIndex];
      console.log(`🌐 Language changed to: ${languages[currentLangIndex]}`);
    });
  }
}

// Theme toggle functionality
function initializeThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  let isDarkMode = false; // Light mode is default

  // Initialize light mode on page load
  body.classList.add("light-mode");
  if (themeToggle) {
    themeToggle.textContent = "🌙"; // Moon icon indicates light mode is active
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      isDarkMode = !isDarkMode;

      if (isDarkMode) {
        // Dark mode
        themeToggle.textContent = "☀️";
        body.classList.remove("light-mode");
        console.log("🌙 Dark mode enabled");
      } else {
        // Light mode
        themeToggle.textContent = "🌙";
        body.classList.add("light-mode");
        console.log("☀️ Light mode enabled");
      }
    });
  }
}

// Get real internet speed
function getInternetSpeed() {
  const speedValue = document.getElementById("speed-value");

  // Fetch a small image to measure speed
  const imageUrl =
    "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
  const startTime = performance.now();
  let fileSize = 0;

  // Try to fetch file and measure speed
  fetch(imageUrl, { mode: "no-cors" })
    .then((response) => response.blob())
    .then((blob) => {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds
      fileSize = blob.size / 1024; // Convert to KB
      const speedMbps = (fileSize * 8) / (duration * 1024); // Convert to Mbps

      if (speedValue) {
        if (speedMbps > 1000) {
          speedValue.textContent = (speedMbps / 1000).toFixed(1) + "G";
        } else if (speedMbps > 100) {
          speedValue.textContent = speedMbps.toFixed(0) + "M";
        } else {
          speedValue.textContent = speedMbps.toFixed(1) + "M";
        }
      }

      console.log(
        `📶 Internet Speed: ${speedMbps.toFixed(2)} Mbps (${fileSize.toFixed(
          2,
        )} KB in ${duration.toFixed(2)}s)`,
      );
    })
    .catch(() => {
      if (speedValue) {
        speedValue.textContent = "N/A";
      }
      console.log("📶 Could not measure internet speed");
    });
}

// Initialize internet speed monitoring
function initializeSpeedMonitor() {
  const speedIndicator = document.getElementById("speed-indicator");

  // Get speed on startup
  getInternetSpeed();

  // Refresh speed every 30 seconds
  setInterval(getInternetSpeed, 30000);

  // Click to manually refresh
  if (speedIndicator) {
    speedIndicator.addEventListener("click", () => {
      const speedValue = document.getElementById("speed-value");
      if (speedValue) {
        speedValue.textContent = "...";
      }
      getInternetSpeed();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("🖥️ Desktop environment ready!");

  // Update time immediately and then every second
  updateTime();
  setInterval(updateTime, 1000);

  // Initialize taskbar
  initializeTaskbar();

  // Initialize taskbar enhancements
  initializeLanguageToggle();
  initializeThemeToggle();
  initializeSpeedMonitor();

  // Initialize drag and drop for icons
  initializeDrag();

  // Initialize icon interactions
  initializeIcons();
  initializeDoubleClick();

  // Setup terminal close button
  const closeBtn = document.querySelector(".terminal-close-btn");
  const minimizeBtn = document.querySelector(".terminal-minimize");
  const maximizeBtn = document.querySelector(".terminal-maximize");
  const terminal = document.getElementById("backend-terminal");
  const terminalTaskbarButton = document.getElementById(
    "terminal-taskbar-button",
  );
  if (closeBtn) {
    closeBtn.addEventListener("click", closeBackendTerminal);
  }
  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", minimizeBackendTerminal);
  }
  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", toggleBackendTerminalMaximize);
  }
  if (terminal) {
    terminal.addEventListener("mousedown", () => setTerminalFocused(true));
  }
  if (terminalTaskbarButton) {
    terminalTaskbarButton.addEventListener("click", () => {
      if (terminal?.classList.contains("minimized")) {
        openBackendTerminal();
      } else if (terminal?.classList.contains("focused")) {
        minimizeBackendTerminal();
      } else {
        setTerminalFocused(true);
      }
    });
  }

  document.querySelector(".wallpaper")?.addEventListener("mousedown", (e) => {
    if (
      terminal?.classList.contains("open") &&
      !terminal.classList.contains("minimized") &&
      !terminal.contains(e.target)
    ) {
      setTerminalFocused(false);
    }
  });
});
