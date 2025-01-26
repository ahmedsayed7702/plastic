let machineRunning = false;
let copiesProduced = 0;
let startTime = null;
let timerInterval = null;
let copiesToProduce = 0;
let machineLogs = JSON.parse(localStorage.getItem('machineLogs')) || [];
let operationName = '';
let paused = false;
let repairStartTime = null;
let repairTime = 0;
let repairTimerInterval = null;

function showError(message) {
    const errorElement = document.getElementById("error");
    errorElement.innerText = message;
    errorElement.style.display = "block";
}

function clearError() {
    const errorElement = document.getElementById("error");
    errorElement.innerText = "";
    errorElement.style.display = "none";
}

function setOperationName() {
    operationName = document.getElementById("operationNameInput").value.trim();
    if (operationName) {
        const buttons = document.querySelectorAll("#startButton, #stopButton, #pauseButton, #continueButton");
        buttons.forEach(button => button.style.display = "inline-block");
        document.getElementById("setOperationNameButton").style.display = "none";
        document.getElementById("operationNameInput").disabled = true;
    } else {
        showError("Operation name is required.");
    }
}

function startMachine() {
    try {
        if (!machineRunning) {
            if (!operationName) {
                showError("Operation name is required to start the machine.");
                return;
            }
            machineRunning = true;
            startTime = new Date();
            timerInterval = setInterval(updateTimer, 1000);
            document.getElementById("machineStatus").innerText = "Running";
            document.getElementById("status").style.backgroundColor = "green"; // Change background to green
            clearError();
            console.log("Machine started");
            produceCopy(); // Start producing copies when the machine starts
        }
    } catch (error) {
        showError("Failed to start the machine.");
        console.error(error);
    }
}

function stopMachine() {
    try {
        if (machineRunning) {
            machineRunning = false;
            clearInterval(timerInterval);
            clearInterval(repairTimerInterval);
            document.getElementById("machineStatus").innerText = "Stopped";
            document.getElementById("status").style.backgroundColor = "red"; // Change background to red
            const stopTime = new Date();
            const elapsedTime = Math.floor((stopTime - startTime) / 1000);
            machineLogs.push({
                operationName: operationName,
                startTime: startTime.toLocaleString(),
                stopTime: stopTime.toLocaleString(),
                elapsedTime: elapsedTime,
                copiesProduced: copiesProduced,
                repairTime: repairTime
            });
            localStorage.setItem('machineLogs', JSON.stringify(machineLogs));
            updateAdminPage();
            updateOperationsPage();
            clearError();
            console.log("Machine stopped");
            document.getElementById("nicePartMessage").style.display = "block"; // Show the nice part message
        }
    } catch (error) {
        showError("Nice part, check the details.");
        console.error(error);
    }
}

function pauseMachine() {
    try {
        if (machineRunning && !paused) {
            paused = true;
            clearInterval(timerInterval);
            repairStartTime = new Date();
            repairTimerInterval = setInterval(updateRepairTimer, 1000);
            document.getElementById("machineStatus").innerText = "Paused";
            document.getElementById("status").style.backgroundColor = "red"; // Change background to red
            document.getElementById("repairTime").style.display = "block";
            console.log("Machine paused");
        }
    } catch (error) {
        showError("Failed to pause the machine.");
        console.error(error);
    }
}

function continueMachine() {
    try {
        if (machineRunning && paused) {
            paused = false;
            const repairEndTime = new Date();
            repairTime += Math.floor((repairEndTime - repairStartTime) / 1000);
            clearInterval(repairTimerInterval);
            document.getElementById("repairTime").style.display = "none";
            timerInterval = setInterval(updateTimer, 1000);
            document.getElementById("machineStatus").innerText = "Running";
            document.getElementById("status").style.backgroundColor = "green"; // Change background to green
            produceCopy(); // Continue producing copies
            console.log("Machine continued");
        }
    } catch (error) {
        showError("Failed to continue the machine.");
        console.error(error);
    }
}

function updateCopiesToProduce() {
    copiesToProduce = parseInt(document.getElementById("copiesInput").value, 10);
}

function showFireworks() {
    const fireworks = document.getElementById("fireworks");
    fireworks.style.display = "block";
    setTimeout(() => {
        fireworks.style.display = "none";
    }, 2000); // Show fireworks for 2 seconds
}

function produceCopy() {
    try {
        if (machineRunning && !paused && copiesToProduce > 0) {
            copiesProduced++;
            copiesToProduce--;
            document.getElementById("copiesProduced").innerText = copiesProduced;
            document.getElementById("copiesInput").value = copiesToProduce;
            clearError();
            console.log(`Copies produced: ${copiesProduced}`);
            const copiesLeft = 30 - (copiesProduced % 30);
            document.getElementById("copiesLeft").innerText = `You can produce ${copiesLeft} more copies before needing to add more plastic.`;
            showFireworks();
            if (copiesProduced % 30 === 0) {
                showError("Please add more plastic.");
                stopMachine(); // Stop the machine when it needs more plastic
            } else {
                setTimeout(produceCopy, 5000); // Each copy takes 5 seconds
            }
        }
    } catch (error) {
        showError("Failed to produce a copy.");
        console.error(error);
    }
}

function updateTimer() {
    if (machineRunning && !paused) {
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        document.getElementById("runningTime").innerText = elapsedTime;
        console.log(`Machine running for: ${elapsedTime} seconds`);
    }
}

function updateRepairTimer() {
    const currentTime = new Date();
    const elapsedRepairTime = Math.floor((currentTime - repairStartTime) / 1000);
    document.getElementById("repairTimeValue").innerText = elapsedRepairTime;
    console.log(`Repair time: ${elapsedRepairTime} seconds`);
}

function updateTemperature(sensor, temperature) {
    document.getElementById(`temperature${sensor}`).innerText = `${temperature} °C`;
}

// Simulate receiving temperature data from ESP32
function simulateTemperatureData() {
    for (let i = 1; i <= 4; i++) {
        const temperature = (Math.random() * 30 + 20).toFixed(2); // Random temperature between 20 and 50 °C
        updateTemperature(i, temperature);
    }
    setTimeout(simulateTemperatureData, 5000); // Update every 5 seconds
}

function updateAdminPage() {
    const adminTable = document.getElementById("adminTable");
    adminTable.innerHTML = `
        <tr>
            <th>Operation Name</th>
            <th>Start Time</th>
            <th>Stop Time</th>
            <th>Elapsed Time (seconds)</th>
            <th>Copies Produced</th>
            <th>Repair Time (seconds)</th>
        </tr>
    `;
    machineLogs.forEach(log => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${log.operationName}</td>
            <td>${log.startTime}</td>
            <td>${log.stopTime}</td>
            <td>${log.elapsedTime}</td>
            <td>${log.copiesProduced}</td>
            <td>${log.repairTime}</td>
        `;
        adminTable.appendChild(row);
    });
}

function updateOperationsPage() {
    const operationList = document.getElementById("operationList");
    operationList.innerHTML = '';
    machineLogs.forEach(log => {
        const li = document.createElement("li");
        li.textContent = `${log.operationName} - ${log.startTime} - ${log.stopTime} - Copies: ${log.copiesProduced} - Repair Time: ${log.repairTime} seconds`;
        operationList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    simulateTemperatureData();
    updateAdminPage();
    updateOperationsPage();
});

document.getElementById("setOperationNameButton").addEventListener("click", setOperationName);
document.getElementById("startButton").addEventListener("click", startMachine);
document.getElementById("stopButton").addEventListener("click", stopMachine);
document.getElementById("pauseButton").addEventListener("click", pauseMachine);
document.getElementById("continueButton").addEventListener("click", continueMachine);
document.getElementById("copiesInput").addEventListener("change", updateCopiesToProduce);
