
document.addEventListener("DOMContentLoaded", function () {

    const dateElement = document.querySelector(".date");
    const timeElement = document.querySelector(".current-time");

    const timerElement = document.querySelector(".timer");
    const startPauseButton = document.querySelector("#startPauseButton");
    const resetButton = document.querySelector("#resetButton");
    const saveButton = document.querySelector("#saveButton");

    const historyButton = document.querySelector("#historyButton");
    const historySection = document.querySelector("#historySection");
    const historyList = document.querySelector("#historyList");

    const todayTotalElement = document.querySelector("#todayTotal");
    const todaySessionsElement = document.querySelector("#todaySessions");

    const weekTotalElement = document.querySelector("#weekTotal");
    const weekSessionsElement = document.querySelector("#weekSessions");

    const monthTotalElement = document.querySelector("#monthTotal");
    const monthSessionsElement = document.querySelector("#monthSessions");

    let isRunning = false;
    let startTimestamp = null;
    let firstStartTime = null;
    let elapsedTime = 0;
    let timerInterval = null;

    function updateDateTime() {
        const now = new Date();

        dateElement.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        timeElement.textContent = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    }

    function getCurrentElapsedTime() {
        if (isRunning) {
            return elapsedTime + Math.floor(
                (Date.now() - startTimestamp) / 1000
            );
        }

        return elapsedTime;
    }

    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return (
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }

    function updateTimer() {
        timerElement.textContent =
            formatDuration(getCurrentElapsedTime());
    }

    function getSessionDate(session) {
        const parts = session.date.split("/");

        return new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        );
    }

    function updateStatistics() {

        const sessions =
            JSON.parse(localStorage.getItem("studySessions")) || [];

        const now = new Date();

        const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const tomorrowStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );

        const weekStart = new Date(todayStart);
        const dayOfWeek = todayStart.getDay();

        const daysSinceMonday =
            dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        weekStart.setDate(
            todayStart.getDate() - daysSinceMonday
        );

        const monthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const nextMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        let todayTotal = 0;
        let weekTotal = 0;
        let monthTotal = 0;

        let todaySessions = 0;
        let weekSessions = 0;
        let monthSessions = 0;

        sessions.forEach(function (session) {

            const sessionDate = getSessionDate(session);

            if (
                sessionDate >= todayStart &&
                sessionDate < tomorrowStart
            ) {
                todayTotal += session.duration;
                todaySessions++;
            }

            if (
                sessionDate >= weekStart &&
                sessionDate < tomorrowStart
            ) {
                weekTotal += session.duration;
                weekSessions++;
            }

            if (
                sessionDate >= monthStart &&
                sessionDate < nextMonthStart
            ) {
                monthTotal += session.duration;
                monthSessions++;
            }
        });

        todayTotalElement.textContent =
            formatDuration(todayTotal);

        weekTotalElement.textContent =
            formatDuration(weekTotal);

        monthTotalElement.textContent =
            formatDuration(monthTotal);

        todaySessionsElement.textContent =
            todaySessions +
            (todaySessions === 1 ? " session" : " sessions");

        weekSessionsElement.textContent =
            weekSessions +
            (weekSessions === 1 ? " session" : " sessions");

        monthSessionsElement.textContent =
            monthSessions +
            (monthSessions === 1 ? " session" : " sessions");
    }

    function displayHistory() {

        const sessions =
            JSON.parse(localStorage.getItem("studySessions")) || [];

        updateStatistics();

        historyList.innerHTML = "";

        if (sessions.length === 0) {
            historyList.textContent = "No study sessions saved yet.";
            return;
        }

        const groupedSessions = {};

        sessions.forEach(function (session) {

            if (!groupedSessions[session.date]) {
                groupedSessions[session.date] = [];
            }

            groupedSessions[session.date].push(session);
        });

        Object.keys(groupedSessions).reverse().forEach(function (date) {

            const dayContainer = document.createElement("div");
            dayContainer.className = "history-day";

            const dateHeading = document.createElement("h2");
            dateHeading.textContent = date;

            dayContainer.appendChild(dateHeading);

            let dailyTotal = 0;

            groupedSessions[date].forEach(function (session, index) {

                dailyTotal += session.duration;

                const sessionElement = document.createElement("div");
                sessionElement.className = "history-session";

                const sessionNumber = document.createElement("div");
                sessionNumber.className = "session-number";
                sessionNumber.textContent = "Session " + (index + 1);

                const sessionInfo = document.createElement("div");
                sessionInfo.className = "session-info";
                sessionInfo.textContent =
                    session.startTime + " → " + session.endTime;

                const durationElement = document.createElement("div");
                durationElement.className = "session-duration";
                durationElement.textContent =
                    formatDuration(session.duration);

                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-button";
                deleteButton.textContent = "Delete";

                deleteButton.addEventListener("click", function () {

                    const confirmed = confirm(
                        "Are you sure you want to delete this session?"
                    );

                    if (!confirmed) {
                        return;
                    }

                    const sessionIndex = sessions.indexOf(session);

                    if (sessionIndex !== -1) {
                        sessions.splice(sessionIndex, 1);
                    }

                    localStorage.setItem(
                        "studySessions",
                        JSON.stringify(sessions)
                    );

                    displayHistory();
                });

                sessionElement.appendChild(sessionNumber);
                sessionElement.appendChild(sessionInfo);
                sessionElement.appendChild(durationElement);
                sessionElement.appendChild(deleteButton);

                dayContainer.appendChild(sessionElement);
            });

            const totalElement = document.createElement("div");
            totalElement.className = "daily-total";

            totalElement.textContent =
                "Total study time: " + formatDuration(dailyTotal);

            dayContainer.appendChild(totalElement);

            historyList.appendChild(dayContainer);
        });
    }

    startPauseButton.addEventListener("click", function () {

        if (!isRunning) {

            const now = Date.now();

            if (firstStartTime === null) {
                firstStartTime = now;
            }

            startTimestamp = now;
            isRunning = true;

            timerInterval = setInterval(updateTimer, 250);

            startPauseButton.textContent = "Pause";

        } else {

            elapsedTime += Math.floor(
                (Date.now() - startTimestamp) / 1000
            );

            startTimestamp = null;
            isRunning = false;

            clearInterval(timerInterval);

            updateTimer();

            startPauseButton.textContent = "Start";
        }
    });

    resetButton.addEventListener("click", function () {

        clearInterval(timerInterval);

        isRunning = false;
        startTimestamp = null;
        firstStartTime = null;
        elapsedTime = 0;
        timerInterval = null;

        updateTimer();

        startPauseButton.textContent = "Start";
    });

    saveButton.addEventListener("click", function () {

        const currentElapsedTime = getCurrentElapsedTime();

        if (
            firstStartTime === null ||
            currentElapsedTime === 0
        ) {
            alert("Start the timer before saving.");
            return;
        }

        const now = Date.now();

        const session = {
            date: new Date(firstStartTime).toLocaleDateString("en-IN"),
            startTime: new Date(firstStartTime).toLocaleTimeString("en-IN"),
            endTime: new Date(now).toLocaleTimeString("en-IN"),
            duration: currentElapsedTime
        };

        const sessions =
            JSON.parse(localStorage.getItem("studySessions")) || [];

        sessions.push(session);

        localStorage.setItem(
            "studySessions",
            JSON.stringify(sessions)
        );

        clearInterval(timerInterval);

        isRunning = false;
        startTimestamp = null;
        firstStartTime = null;
        elapsedTime = 0;
        timerInterval = null;

        timerElement.textContent = "00:00:00";
        startPauseButton.textContent = "Start";

        displayHistory();

        alert("Study session saved.");
    });

    historyButton.addEventListener("click", function () {

        historySection.classList.toggle("visible");

        if (historySection.classList.contains("visible")) {
            displayHistory();
        }
    });

    updateDateTime();
    updateTimer();

    setInterval(updateDateTime, 1000);

});

