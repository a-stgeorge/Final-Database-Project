window.onload = () => {
    document.getElementById('assign').onclick = assign;
    document.getElementById('unassign').onclick = unassign;
    document.getElementById('clearReport').onclick = clearReport;
    document.getElementById('unassignedCourses').onclick = unassignedCourses;
    document.getElementById('assignedTimes').onclick = assignedTimes;
    document.getElementById('instructorTimes').onclick = instructorTimes;
    document.getElementById('clusterConflict').onclick = clusterConflict;
    courseOfferingsDropDown().then(() => courseOfferingOnChange());
    timeslotDropDown().then(() => timeslotOnChange());
}

function assign() {
    if (document.getElementById('timeslotsSelect').length === 0
        || document.getElementById('offeringsSelect').length === 0) {
        document.getElementById('result').innerHTML = 'Error: Either time slot or course offering table is empty.';
        clearResultDiv();
        return;
    }
    let selectedTimeSlot = JSON.parse(document.getElementById('timeslotsSelect').value);
    let selectedOffering = JSON.parse(document.getElementById('offeringsSelect').value);
    let data = {
        query: `update teaches set
        mod_name = '${selectedTimeSlot.mod_name}',
        mod_credits = '${selectedTimeSlot.mod_credits}'
        where course_id = '${selectedOffering.course_id}'
        and course_type = '${selectedOffering.course_type}'
        and semester = '${selectedOffering.semester}'
        and year = '${selectedOffering.year}'
        and section_num = '${selectedOffering.section_num}'`
    };
    return fetch('/action/page5', {
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
        if (responseJson.affectedRows === 0) {
            document.getElementById('result').innerHTML = 'No updates made... (no instructor teaching this course offering)';
            clearResultDiv();
            return;
        }
        document.getElementById('result').innerHTML = 'Success! Course offering assigned to selected timeslot.';
        clearResultDiv();
        timeslotOnChange();
        courseOfferingOnChange();
    });
}

function unassign() {
    if (document.getElementById('timeslotsSelect').length === 0
        || document.getElementById('offeringsSelect').length === 0) {
        document.getElementById('result').innerHTML = 'Error: Either time slot or course offering table is empty.';
        clearResultDiv();
        return;
    }
    let selectedOffering = JSON.parse(document.getElementById('offeringsSelect').value);
    let data = {
        query: `update teaches set
        mod_name = NULL,
        mod_credits = NULL
        where course_id = '${selectedOffering.course_id}'
        and course_type = '${selectedOffering.course_type}'
        and semester = '${selectedOffering.semester}'
        and year = '${selectedOffering.year}'
        and section_num = '${selectedOffering.section_num}'`
    };
    return fetch('/action/page5', {
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
        if (responseJson.affectedRows === 0) {
            document.getElementById('result').innerHTML = `No updates made... (no instructor teaching this course offering)
            (or this offering was already not assigned to a time slot)`;
            clearResultDiv();
            return;
        }
        document.getElementById('result').innerHTML = `Success! What ever timeslot was assigned to that 
        course offering is now un-assigned.`;
        clearResultDiv();
        timeslotOnChange();
        courseOfferingOnChange();
    });
}

function courseOfferingsDropDown() {
    let data = {
        query: 'select course_id, course_type, semester, year, section_num, num_credits from course_offering'
    };
    return fetch('/action/page5', {
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
        document.getElementById('courseOfferings').appendChild(selectDropdown);
    }
    selectDropdown.onchange = courseOfferingOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--) {
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = `${data[i].course_id}, Section: ${data[i].section_num}, Credits: ${data[i].num_credits},
      ${data[i].course_type}, ${data[i].semester}, ${data[i].year}`;
        option.value = JSON.stringify(data[i]);
        selectDropdown.add(option);
    }
}

function courseOfferingOnChange() {
    clearReport();
    if (document.getElementById('offeringsSelect').length === 0
        || document.getElementById('timeslotsSelect')?.length === 0) {
        return;
    }
    let selectedOffering = JSON.parse(document.getElementById('offeringsSelect').value);
    let data = {
        query: `select * from teaches where 
        course_id = '${selectedOffering.course_id}' 
        and section_num = ${selectedOffering.section_num} 
        and course_type = '${selectedOffering.course_type}' 
        and semester = '${selectedOffering.semester}' 
        and year = ${selectedOffering.year}`
    };
    return fetch('/action/page5', {
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
        document.getElementById('assignedTimeslot').innerHTML = '';
        if (responseJson.length === 0) {
            document.getElementById('assignedTimeslot').innerHTML = 'None';
            return;
        }
        showMod(responseJson[0].mod_name, responseJson[0].mod_credits);
    });
}

async function showMod(modName, modCredits) {
    let data = {
        query: `select * from mod_table where 
        mod_name = '${modName}' 
        and mod_credits = ${modCredits}`
    };
    return fetch('/action/page5', {
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
        if (responseJson.length === 0) {
            document.getElementById('assignedTimeslot').innerHTML = 'None';
            return;
        }
        document.getElementById('assignedTimeslot').innerHTML = `${responseJson[0].mod_name}${responseJson[0].mod_credits},
        ${responseJson[0].start_time} - ${responseJson[0].end_time}, ${responseJson[0].days_of_week}`;
    });
}

function timeslotDropDown() {
    let data = {
        query: 'select * from mod_table'
    };
    return fetch('/action/page5', {
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
        populateTimeslotDropdown(responseJson);
    });
}

function populateTimeslotDropdown(data) {
    let selectDropdown = document.getElementById('timeslotsSelect');
    if (!selectDropdown) {
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'timeslotsSelect');
        document.getElementById('timeslots').appendChild(selectDropdown);
    }
    selectDropdown.onchange = timeslotOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--) {
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = `${data[i].mod_name}${data[i].mod_credits}, ${data[i].start_time} - 
        ${data[i].end_time}, ${data[i].days_of_week}`;
        option.value = JSON.stringify(data[i]);
        selectDropdown.add(option);
    }
}

function timeslotOnChange() {
    clearReport();
    if (document.getElementById('timeslotsSelect').length === 0
        || document.getElementById('offeringsSelect').length === 0) {
        return;
    }
    let selectedTimeSlot = JSON.parse(document.getElementById('timeslotsSelect').value);
    let data = {
        query: `select course_id, course_type, semester, year, section_num from teaches where
        mod_name = '${selectedTimeSlot.mod_name}' 
        and mod_credits = ${selectedTimeSlot.mod_credits}`
    };
    return fetch('/action/page5', {
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
        if (responseJson.length === 0) {
            document.getElementById('assignedCourses').innerHTML = 'None';
            return;
        }
        for (let i = 0; i < responseJson.length; i++) {
            let newPTag = document.createElement('p');
            newPTag.style = 'margin: 0';
            newPTag.innerHTML = `${responseJson[i].course_id}, Section: ${responseJson[i].section_num}, 
            ${responseJson[i].course_type}, ${responseJson[i].semester}, ${responseJson[i].year}`;
            document.getElementById('assignedCourses').appendChild(newPTag);
        }
    });
}

function unassignedCourses() {
    let data = {
        query: `select * from teaches natural right join course_offering where mod_name is NULL and course_id != 'NIL000'`
    };
    fetch('/action/page5', {
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

function assignedTimes() {
    let data = {
        query: `select course_id, course_type, semester, year, section_num, 
        mod_name, mod_credits, start_time, end_time, days_of_week
        from teaches natural join mod_table`
    };
    fetch('/action/page5', {
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

function instructorTimes() {
    let data = {
        query: `select instructor_id, first_name, last_name, 
        course_id, section_num, 
        mod_name, mod_credits, start_time, end_time, days_of_week
        from teaches join instructor using (instructor_id) 
        join mod_table using (mod_name, mod_credits)
        order by instructor_id`
    };
    fetch('/action/page5', {
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

function clusterConflict() {
    let data = {
        query: `select conflicts.* from 
        (select * from teaches natural join cluster) as conflicts join 
        (select semester, year, mod_name, cluster_id, count(*) as num_duplicates from teaches 
        natural join cluster group by semester, year, mod_name, cluster_id having num_duplicates > 1) 
        sum_conflicts on conflicts.semester = sum_conflicts.semester and conflicts.year = sum_conflicts.year 
        and conflicts.mod_name = sum_conflicts.mod_name and conflicts.cluster_id = sum_conflicts.cluster_id 
        order by mod_name, cluster_id, semester`
    };
    fetch('/action/page5', {
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

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 10000);
}

function clearReport() {
    document.getElementById('report').innerHTML = '';
}