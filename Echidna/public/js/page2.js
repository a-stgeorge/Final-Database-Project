window.onload = () => {
    console.log('Page 2 boi');
    document.getElementById('button').onclick = click2;
}

async function click2() {
    let data = {
        query: document.getElementById('query').value
    };
    fetch('/action/page2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    ).then(async response => {
        if (!response.ok) {
            let responseMessage = await response.text();
            document.getElementById('result').innerHTML = responseMessage;
            return;
        }
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        constructTable('#result', responseJson);
    });
};