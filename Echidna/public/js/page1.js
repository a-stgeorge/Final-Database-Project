window.onload = () => {
    document.getElementById('button').onclick = click;
}

async function click() {
    fetch('page1', { method: 'POST' }).then(async response => {
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        constructTable('#result', responseJson);
    });
}