window.onload = () => {
    console.log('Main page boi');
    document.getElementById('timeWarp1').onclick = timeWarp1;
}

function timeWarp1() {
    fetch('/action/timeWarp/1', { method: 'POST' }).then(async response => {
        if (!response.ok) {
            let responseMessage = await response.text();
            document.getElementById('timeWarpStatus').innerHTML = responseMessage;
            return;
        }
        let responseJson = await response.json();
        document.getElementById('timeWarpStatus').innerHTML = '';
        constructTable('#result', responseJson);
    });
}