window.onload = () => {
    document.getElementById('submit').onclick = addInstructor;
    console.log('Page 1 boi');
}

async function addInstructor() {
    let instructorId = document.getElementById('instructor_id').value;
    let firstName = document.getElementById('firstname').value;
    let lastName = document.getElementById('lastname').value;
    let email = document.getElementById('email').value;
    let deptName = document.getElementById('dept').value;
    let loadMin = document.getElementById('load_min').value;
    let loadMax = document.getElementById('load_min').value;
    
    //TODO Need to do validation here and check fail cases

    let data = {
        query: `insert into instructor values (
            ${instructorId},
            '${firstName}',
            '${lastName}',
            '${email}',
            '${deptName}',
            ${loadMin},
            ${loadMax})`
    };
    fetch('/action/page1', {
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
        document.getElementById('result').innerHTML = 'Success!';
    });
}
