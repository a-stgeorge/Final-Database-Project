window.onload = () => {
    document.getElementById('button').onclick = courses;
    console.log('Page 5 boi');
}

async function courses() {
    fetch('/action/page5', { method: 'POST' }).then(async response => {
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