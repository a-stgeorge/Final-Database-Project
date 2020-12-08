window.onload = () => {
    console.log('Main page boi');
    document.getElementById('timeWarp1').onclick = timeWarp1;
    document.getElementById('timeWarp2').onclick = timeWarp2;
    document.getElementById('timeWarp3').onclick = timeWarp3;
    document.getElementById('timeWarp4').onclick = timeWarp4;
    document.getElementById('timeWarp5').onclick = timeWarp5;
}

async function timeWarp1() {
    return fetch('/action/timeWarp/1', { method: 'POST' }).then(async response => {
        if (!response.ok) {
            let responseMessage = await response.text();
            document.getElementById('timeWarpStatus').innerHTML = responseMessage;
            return;
        }
        document.getElementById('timeWarpStatus').innerHTML = 'Time Warp 1 was a success. Empty tables created.';
    });
}

async function timeWarp2() {
    return timeWarp1().then(() => {
        fetch('/action/timeWarp/2', { method: 'POST' }).then(async response => {
            if (!response.ok) {
                let responseMessage = await response.text();
                document.getElementById('timeWarpStatus').innerHTML = responseMessage;
                return;
            }
            document.getElementById('timeWarpStatus').innerHTML = 
            'Time Warp 2 was a success. At least 10 instructors, and at least 30 courses were added.';
        });
    });
}

async function timeWarp3() {
    return timeWarp2().then(() => {
        fetch('/action/timeWarp/3', { method: 'POST' }).then(async response => {
            if (!response.ok) {
                let responseMessage = await response.text();
                document.getElementById('timeWarpStatus').innerHTML = responseMessage;
                return;
            }
            document.getElementById('timeWarpStatus').innerHTML =
                'Time Warp 3 was a success. At least 10 instructors, at least 30 courses, and at least 70 course offerings were added.';
        });
    });
    console.log("Ending 3");
}

async function timeWarp4() {
    return timeWarp3().then(() => {
        fetch('/action/timeWarp/4', { method: 'POST' }).then(async response => {
            if (!response.ok) {
                let responseMessage = await response.text();
                document.getElementById('timeWarpStatus').innerHTML = responseMessage;
                return;
            }
            document.getElementById('timeWarpStatus').innerHTML =
                `Time Warp 4 was a success. At least 10 instructors, at least 30 courses, and at least 70 course offerings were
        created. All course offerings have been assigned to instructors.`;
        });
    });
}

async function timeWarp5() {
    return timeWarp3().then(() => {
        fetch('/action/timeWarp/5', { method: 'POST' }).then(async response => {
            if (!response.ok) {
                let responseMessage = await response.text();
                document.getElementById('timeWarpStatus').innerHTML = responseMessage;
                return;
            }
            document.getElementById('timeWarpStatus').innerHTML =
            `Time Warp 5 was a success. 10+ instructors, 30+ courses, and 70+ course offerings were made. Each course 
            was assigned to an instructor and time. The database is fully populated for a year.`;
        });
    });
}