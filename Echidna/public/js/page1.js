window.onload = () => {
    document.getElementById('submit').onclick = addInstructor;
    document.getElementById('clearInputs').onclick = clearInputs;
    document.getElementById('minPlus').onclick = minPlus;
    document.getElementById('minMinus').onclick = minMinus;
    document.getElementById('maxPlus').onclick = maxPlus;
    document.getElementById('maxMinus').onclick = maxMinus;
    document.getElementById('load_min').onchange = loadMinOnChange;
    document.getElementById('load_max').onchange = loadMaxOnChange;
    document.getElementById('form').onsubmit = (e) => {
        e.preventDefault();
    };
    instructorsDropdown();
}

function loadMinOnChange() {
    let loadMin = document.getElementById('load_min');
    let regex = RegExp(/^\d*\.?\d*$/);
    if (regex.test(loadMin.value)) {
        loadMin.setCustomValidity('');
        loadMin.value = parseFloat(loadMin.value).toFixed(1);
    } else {
        loadMin.setCustomValidity('Invalid Number');
    }
}

function loadMaxOnChange() {
    let loadMax = document.getElementById('load_max');
    let regex = RegExp(/^\d*\.?\d*$/);
    if (regex.test(loadMax.value)) {
        loadMax.setCustomValidity('');
        loadMax.value = parseFloat(loadMax.value).toFixed(1);
    } else {
        loadMax.setCustomValidity('Invalid Number');
    }
}

function minPlus() {
    let minValue = document.getElementById('load_min');
    if (parseFloat(minValue.value).toFixed(1) !== 'NaN'
        && parseFloat(minValue.value) < 97.0) {
        minValue.value = parseFloat(parseFloat(minValue.value) + 3.4).toFixed(1);
    }
}

function minMinus() {
    let minValue = document.getElementById('load_min');
    if (parseFloat(minValue.value).toFixed(1) !== 'NaN'
        && parseFloat(minValue.value) > 3.3) {
        minValue.value = parseFloat(parseFloat(minValue.value) - 3.4).toFixed(1);
    }
}

function maxPlus() {
    let maxValue = document.getElementById('load_max');
    if (parseFloat(maxValue.value).toFixed(1) !== 'NaN'
        && parseFloat(maxValue.value) < 97.0) {
        maxValue.value = parseFloat(parseFloat(maxValue.value) + 3.4).toFixed(1);
    }
}

function maxMinus() {
    let maxValue = document.getElementById('load_max');
    if (parseFloat(maxValue.value).toFixed(1) !== 'NaN'
        && parseFloat(maxValue.value) > 3.3) {
        maxValue.value = parseFloat(parseFloat(maxValue.value) - 3.4).toFixed(1);
    }
}

function clearInputs() {
    document.getElementById('instructor_id').value = 0;
    document.getElementById('instructor_id').readOnly = false;
    document.getElementById('firstname').value = '';
    document.getElementById('lastname').value = '';
    document.getElementById('email').value = '';
    document.getElementById('dept').value = 'MathCs';
    document.getElementById('load_min').value = 23.5;
    document.getElementById('load_max').value = 23.8;
}

async function addInstructor() {
    let instructorId = document.getElementById('instructor_id').value;
    let firstName = document.getElementById('firstname').value;
    let lastName = document.getElementById('lastname').value;
    let email = document.getElementById('email').value;
    let deptName = document.getElementById('dept').value;
    let loadMin = document.getElementById('load_min').value;
    let loadMax = document.getElementById('load_max').value;
    
    if (!document.getElementById('form').checkValidity()) {
        document.getElementById('result').innerHTML = 'Bad data in form, offending field(s) is bordered red.';
        clearResultDiv();
        return;
    }

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
            if (responseMessage.includes('Duplicate entry')) {
                overwriteFlow(instructorId, firstName, lastName, email, deptName, loadMin, loadMax);
                return;
            }
            document.getElementById('result').innerHTML = responseMessage;
            clearResultDiv();
            return;
        }
        document.getElementById('result').innerHTML = 'Success!';
        clearResultDiv();
        clearInputs();
        instructorsDropdown();
    });
}

async function overwriteFlow(instructorId, firstName, lastName, email, deptName, loadMin, loadMax) {
    if (confirm('ID already exists. Would you like to overwrite this instructor with the values you provided?')) {
        let data = {
            query: `update instructor set  
            first_name = '${firstName}',
            last_name = '${lastName}',
            email = '${email}',
            dept_name = '${deptName}',
            desired_load_min = '${loadMin}',
            desired_load_max = '${loadMax}'
            where instructor_id = ${instructorId}`
        };
        await fetch('/action/page1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(async response => {
            if (!response.ok) {
                let responseMessage = await response.text();
                document.getElementById('result').innerHTML = responseMessage;
                clearResultDiv();
                return;
            }
            document.getElementById('result').innerHTML = 'Success! Instructor updated';
            clearResultDiv();
            clearInputs();
            instructorsDropdown();
        });
    }
}

function instructorsDropdown() {
    let data = {
        query: 'select instructor_id, first_name, last_name from instructor'
    };
    return fetch('/action/page1', {
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
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        clearResultDiv();
        populateInstructorsDropdown(responseJson);
    });
}

function populateInstructorsDropdown(data) {
    let selectDropdown = document.getElementById('instructorsSelect');
    if (!selectDropdown) {
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'instructorsSelect');
        document.getElementById('instructors').appendChild(selectDropdown);
    }
    selectDropdown.onchange = instructorsOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--) {
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = `${data[i].instructor_id}, ${data[i].first_name}, 
      ${data[i].last_name}`;
        option.value = data[i].instructor_id;
        selectDropdown.add(option);
    }
}

function instructorsOnChange() {
    document.getElementById('instructor_id').readOnly = true;
    let selectedInstructor = JSON.parse(document.getElementById('instructorsSelect').value);
    let data = {
        query: `select * from instructor where 
        instructor_id = ${selectedInstructor}`
    };
    fetch('/action/page1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(async response => {
        if (!response.ok) {
            let responseMessage = await response.text();
            document.getElementById('result').innerHTML = responseMessage;
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        document.getElementById('instructor_id').value = responseJson[0].instructor_id;
        document.getElementById('firstname').value = responseJson[0].first_name;
        document.getElementById('lastname').value = responseJson[0].last_name;
        document.getElementById('email').value = responseJson[0].email;
        document.getElementById('dept').value = responseJson[0].dept_name;
        document.getElementById('load_min').value = responseJson[0].desired_load_min;
        document.getElementById('load_max').value = responseJson[0].desired_load_max;
    });
}

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 7000);
}