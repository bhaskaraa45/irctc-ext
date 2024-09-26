document.getElementById("bookNow").addEventListener("click", function() {
    const fromStation = document.getElementById("fromStation").value.trim().toUpperCase();
    const toStation = document.getElementById("toStation").value.trim().toUpperCase();
    const trainNumber = document.getElementById("trainNumber").value.trim();
    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const executionTime = document.getElementById("executionTime").value.trim();
    const seatType = document.getElementById("seatType").value.trim();

    if (!fromStation || !toStation || !trainNumber || !fullName || !username || !password || !executionTime || !seatType) {
        alert("Please fill in all fields.");
        return;
    }

    browser.storage.local.set({
        fromStation, 
        toStation, 
        trainNumber, 
        fullName, 
        username, 
        password, 
        executionTime,
        seatType
    });

    browser.tabs.create({ url: "https://www.irctc.co.in/nget/train-search" });

    // scheduleExecution(executionTime);
});

