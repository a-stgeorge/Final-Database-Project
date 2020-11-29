window.onload = () => {
    console.log('Page 2 boi');
    document.getElementById('button').onclick = click2;
}

async function click2() {
    let data = {
        query: document.getElementById('query').value
    };
    fetch('page2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    ).then(async response => {
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        constructTable('#result', responseJson);
    });
};