window.onload = () => {
    console.log('Page 4 boi');
    document.getElementById('refreshDropdowns').onclick = refreshDropdowns;
    document.getElementById('assign').onclick = assign;
    document.getElementById('unassign').onclick = unassign;
    courseOfferingsDropDown();
    instructorDropdown();
}

function refreshDropdowns() {
    courseOfferingsDropDown();
    instructorDropdown();
}

function assign() {
    let selectedOffering = document.getElementById('offeringsSelect').value;
    let selectedInstructor = document.getElementById('instructorsSelect').value;
    console.log(selectedOffering);
    console.log('Instructor id:', selectedInstructor);
    //TODO make fancy query here to place value in teaches table
}

function unassign() {
    let selectedOffering = document.getElementById('offeringsSelect').value;
    let selectedInstructor = document.getElementById('instructorsSelect').value;
    console.log(selectedOffering);
    console.log('Instructor id:', selectedInstructor);
    //TODO make fancy query here to remove value in teaches table
}

function courseOfferingsDropDown() {
    let data = {
        query: 'select course_id, course_type, semester, year, section_num from course_offering'
    };
    return fetch('/action/page4', {
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
        populateOfferingDropdown(responseJson);
    });
}

function populateOfferingDropdown(data) {
    let selectDropdown = document.getElementById('offeringsSelect');
    if (!selectDropdown){
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'offeringsSelect');
        document.getElementById('offerings').appendChild(selectDropdown);
    }
    selectDropdown.onchange = offeringOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--){
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
      option = document.createElement('option');
      option.text = `${data[i].course_id}, Section: ${data[i].section_num}, 
      ${data[i].course_type}, ${data[i].semester}, ${data[i].year}`;
      //TODO might want a more helpful value for this dropdown
      option.value = JSON.stringify(data[i]);
      selectDropdown.add(option);
    }
}

function instructorDropdown() {
    let data = {
        query: 'select instructor_id, first_name, last_name from instructor'
    };
    return fetch('/action/page4', {
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
        populateInstructorDropdown(responseJson);
    });
}

function populateInstructorDropdown(data){
    let selectDropdown = document.getElementById('instructorsSelect');
    if (!selectDropdown){
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'instructorsSelect');
        document.getElementById('instructors').appendChild(selectDropdown);
    }
    selectDropdown.onchange = instructorOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--){
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

function offeringOnChange() {
    console.log('offering changed!');
    //TODO query teaches and see if this offering has an instructor attached
}

function instructorOnChange() {
    console.log('instructor changed!');
    //TODO query teaches and see if this instructor has a course attached
}