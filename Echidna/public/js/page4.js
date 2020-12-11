window.onload = () => {
    document.getElementById('refreshDropdowns').onclick = refreshDropdowns;
    document.getElementById('assign').onclick = assign;
    document.getElementById('unassign').onclick = unassign;

    document.getElementById('offeringsPerInstructor').onclick = offeringsPerInstructor;
    document.getElementById('instructorsPerOfferings').onclick = instructorsPerOfferings;
    document.getElementById('unassignedCourseOfferings').onclick = unassignedCourseOfferings;
    document.getElementById('targetLoads').onclick = targetLoads;
    document.getElementById('clearReport').onclick = clearReport;

    courseOfferingsDropDown().then(() => courseOfferingOnChange());
    instructorDropdown().then(() => instructorOnChange());
}

function offeringsPerInstructor() {
    let data = {
        query: `select instructor_id, first_name, last_name, course_id, course_type, semester, year, section_num 
        from teaches join instructor using(instructor_id) order by instructor_id`
    };
    fetch('/action/page4', {
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
        document.getElementById('report').innerHTML = ''
        constructTable('#report', responseJson);
    });
}

function instructorsPerOfferings() {
    let data = {
        query: `select course_id, course_type, semester, year, section_num, instructor_id, first_name, last_name
        from teaches join instructor using(instructor_id) order by course_id`
    };
    fetch('/action/page4', {
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
        document.getElementById('report').innerHTML = ''
        constructTable('#report', responseJson);
    });
}

function unassignedCourseOfferings() {
    let data = {
        query: `select course_id, course_type, semester, year, section_num 
        from course_offering natural left join teaches where instructor_id is NULL`
    };
    fetch('/action/page4', {
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
        document.getElementById('report').innerHTML = ''
        constructTable('#report', responseJson);
    });
}

function targetLoads() {
    let data = {
        query: `select instructor_id as Instructor_ID, sum(teu_value) as TEU_Value from course_offering natural join 
        teaches right join instructor using (instructor_id) group by instructor_id`
    };
    fetch('/action/page4', {
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
        let sumJson = await response.json();
        document.getElementById('report').innerHTML = '';
        loadHighOrLow(sumJson);
    });
}

function loadHighOrLow(sumJson) {
    let data = {
        query: `select instructor_id, first_name, last_name, desired_load_min, desired_load_max from instructor`
    };
    fetch('/action/page4', {
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
        let loadJson = await response.json();
        document.getElementById('report').innerHTML = '';
        makeLoadTable();
        for (let i = 0; i < loadJson.length; i++) {
            if (sumJson[i].TEU_Value === null) {
                addToLoadTable(sumJson[i].Instructor_ID, loadJson[i].first_name,
                    loadJson[i].last_name, 0.0, 'Too Low');
                continue;
            }

            if (sumJson[i].TEU_Value > loadJson[i].desired_load_max) {
                addToLoadTable(sumJson[i].Instructor_ID, loadJson[i].first_name,
                    loadJson[i].last_name, sumJson[i].TEU_Value, 'Too High');
            }

            if (sumJson[i].TEU_Value < loadJson[i].desired_load_min) {
                addToLoadTable(sumJson[i].Instructor_ID, loadJson[i].first_name,
                    loadJson[i].last_name, sumJson[i].TEU_Value, 'Too Low');
            }
        }
    });
}

function makeLoadTable() {
    let newTable = document.createElement('table');
    newTable.setAttribute('id', 'table');
    let headRow = newTable.insertRow(0);

    let headCell0 = headRow.insertCell(0);
    headCell0.innerHTML = 'Instructor ID';

    let headCell1 = headRow.insertCell(1);
    headCell1.innerHTML = 'First Name';

    let headCell2 = headRow.insertCell(2);
    headCell2.innerHTML = 'Last Name';

    let headCell3 = headRow.insertCell(3);
    headCell3.innerHTML = 'Current TEU Value Sum';

    let headCell4 = headRow.insertCell(4);
    headCell4.innerHTML = 'Too High / Too Low';
    document.getElementById('report').appendChild(newTable);
}

function addToLoadTable(instructorID, firstName, lastName, loadSum, issue) {
    let rowLength = document.getElementById('table').rows.length;
    let newRow = document.getElementById('table').insertRow(rowLength);

    let newCell0 = newRow.insertCell(0);
    newCell0.innerHTML = instructorID;

    let newCell1 = newRow.insertCell(1);
    newCell1.innerHTML = firstName;

    let newCell2 = newRow.insertCell(2);
    newCell2.innerHTML = lastName;

    let newCell3 = newRow.insertCell(3);
    newCell3.innerHTML = loadSum;

    let newCell4 = newRow.insertCell(4);
    newCell4.innerHTML = issue;
}

function refreshDropdowns() {
    courseOfferingsDropDown();
    instructorDropdown();
}

function assign() {
    clearReport();
    if (document.getElementById('offeringsSelect').length === 0
        || document.getElementById('instructorsSelect').length === 0) {
        document.getElementById('result').innerHTML = 'Error: Either course offering or instructor table is empty.';
        clearResultDiv();
        return;
    }
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
            clearResultDiv();
            return;
        }
        instructorOnChange();
        courseOfferingOnChange();
    });
}

function unassign() {
    clearReport();
    if (document.getElementById('offeringsSelect').length === 0
        || document.getElementById('instructorsSelect').length === 0) {
        document.getElementById('result').innerHTML = 'Error: Either course offering or instructor table is empty.';
        clearResultDiv();
        return;
    }
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
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        //This means the delete didn't do anything (ie bad request)
        if (responseJson.affectedRows === 0) {
            document.getElementById('result').innerHTML = `No rows were affected because that instructor doesn't 
            teach that course offering.`;
            clearResultDiv();
        }
        instructorOnChange();
        courseOfferingOnChange();
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
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        populateOfferingDropdown(responseJson);
    });
}

function populateOfferingDropdown(data) {
    let selectDropdown = document.getElementById('offeringsSelect');
    if (!selectDropdown) {
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'offeringsSelect');
        document.getElementById('offerings').appendChild(selectDropdown);
    }
    selectDropdown.onchange = courseOfferingOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--) {
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = `${data[i].course_id}, Section: ${data[i].section_num}, 
      ${data[i].course_type}, ${data[i].semester}, ${data[i].year}`;
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
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        populateInstructorDropdown(responseJson);
    });
}

function populateInstructorDropdown(data) {
    let selectDropdown = document.getElementById('instructorsSelect');
    if (!selectDropdown) {
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'instructorsSelect');
        document.getElementById('instructors').appendChild(selectDropdown);
    }
    selectDropdown.onchange = instructorOnChange;
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

function courseOfferingOnChange() {
    clearReport();
    if (document.getElementById('offeringsSelect').length === 0
        || document.getElementById('instructorsSelect')?.length === 0) {
        return;
    }
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
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        //This means no instructor is teaching this offering
        if (responseJson.length === 0) {
            document.getElementById('assignedInstructor').innerHTML = 'None';
            return;
        }
        let assignedInstructor = document.getElementById('assignedInstructor');
        assignedInstructor.innerHTML = '';
        for (let i = 0; i < responseJson.length; i++) {
            if (responseJson.length === 1) {
                assignedInstructor.innerHTML = JSON.stringify(responseJson[i].instructor_id);
                return;
            }
            if (assignedInstructor.innerHTML === '') {
                assignedInstructor.innerHTML = JSON.stringify(responseJson[i].instructor_id);
                continue;
            }
            assignedInstructor.innerHTML = `${assignedInstructor.innerHTML}, 
            ${JSON.stringify(responseJson[i].instructor_id)}`;
        }
    });
}

function instructorOnChange() {
    clearReport();
    if (document.getElementById('offeringsSelect').length === 0
        || document.getElementById('instructorsSelect').length === 0) {
        return;
    }
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
            clearResultDiv();
            return;
        }
        let responseJson = await response.json();
        document.getElementById('assignedCourses').innerHTML = '';
        //This means no course offerings taught by this instructor
        if (responseJson.length === 0) {
            document.getElementById('assignedCourses').innerHTML = 'None';
            return;
        }
        for (let i = 0; i < responseJson.length; i++) {
            let newPTag = document.createElement('p');
            newPTag.style = 'margin: 0';
            newPTag.innerHTML = `${responseJson[i].course_id}, ${responseJson[i].section_num}, ${responseJson[i].course_type}, 
            ${responseJson[i].semester}, ${responseJson[i].year}`;
            document.getElementById('assignedCourses').appendChild(newPTag);
        }
    });
}

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 10000);
}

function clearReport() {
    document.getElementById('report').innerHTML = '';
}