window.onload = () => {
    console.log('Page 4 boi');
    document.getElementById('refreshDropdowns').onclick = refreshDropdowns;
    document.getElementById('assign').onclick = assign;
    document.getElementById('unassign').onclick = unassign;
    courseOfferingsDropDown().then(() => offeringOnChange());
    instructorDropdown().then(() => instructorOnChange());
}

function refreshDropdowns() {
    courseOfferingsDropDown();
    instructorDropdown();
}

function assign() {
    let selectedOffering = JSON.parse(document.getElementById('offeringsSelect').value);
    let selectedInstructor = document.getElementById('instructorsSelect').value;

    let data = {
        query: `insert into teaches values(${selectedInstructor}, '${selectedOffering.course_id}', 
            '${selectedOffering.course_type}', '${selectedOffering.semester}', ${selectedOffering.year}, 
            ${selectedOffering.section_num}, NULL, NULL)`
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
        instructorOnChange();
        offeringOnChange();
    });
}

//TODO when error occurs make sure it gets cleaned up/goes away...

function unassign() {
    let selectedOffering = JSON.parse(document.getElementById('offeringsSelect').value);
    let selectedInstructor = document.getElementById('instructorsSelect').value;

    let data = {
        query: `delete from teaches where 
        instructor_id = ${selectedInstructor} and
        course_id = '${selectedOffering.course_id}' and
        course_type = '${selectedOffering.course_type}' and
        semester = '${selectedOffering.semester}' and
        year = ${selectedOffering.year} and
        section_num = ${selectedOffering.section_num}`
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
        instructorOnChange();
        offeringOnChange();
    });
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
    let selectedOffering = JSON.parse(document.getElementById('offeringsSelect').value);
    let data = {
        query: `select instructor_id from teaches where 
        course_id = '${selectedOffering.course_id}' 
        and section_num = ${selectedOffering.section_num} 
        and course_type = '${selectedOffering.course_type}' 
        and semester = '${selectedOffering.semester}' 
        and year = ${selectedOffering.year}`
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
        //This means no instructor is teaching this offering
        if (responseJson.length === 0) {
            document.getElementById('assignedInstructor').innerHTML = 'None';
            return;
        }
        document.getElementById('assignedInstructor').innerHTML = JSON.stringify(responseJson[0].instructor_id);
    });
}

function instructorOnChange() {
    let selectedInstructor = JSON.parse(document.getElementById('instructorsSelect').value);
    let data = {
        query: `select course_id, course_type, semester, year, section_num from teaches where 
        instructor_id = ${selectedInstructor}`
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
        document.getElementById('assignedCourses').innerHTML = '';
        //This means no course offerings taught by this instructor
        if (responseJson.length === 0) {
            document.getElementById('assignedCourses').innerHTML = 'None';
            return;
        }
        for (let i = 0; i < responseJson.length; i++){
            let newPTag = document.createElement('p');
            newPTag.style = 'margin: 0';
            newPTag.innerHTML = `${responseJson[i].course_id}, ${responseJson[i].section_num}, ${responseJson[i].course_type}, 
            ${responseJson[i].semester}, ${responseJson[i].year}`;
            document.getElementById('assignedCourses').appendChild(newPTag);
        }
    });
}