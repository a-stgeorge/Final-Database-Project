window.onload = () => {
    document.getElementById('button').onclick = click;
    console.log('Page 1 boi');
}

async function click() {
    fetch('/action/page1', { method: 'POST' }).then(async response => {
        if (!response.ok) {
            let responseMessage = await response.text();
            document.getElementById('result').innerHTML = responseMessage;
            return;
        }
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        constructTable('#result', responseJson);
    });
}