window.onload = () => {
    console.log('Page 6 boi');
    document.getElementById('button').onclick = courses;
}

async function courses() {
    fetch('/action/page6', { method: 'POST' }).then(async response => {
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