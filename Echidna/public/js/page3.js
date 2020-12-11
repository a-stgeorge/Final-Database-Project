window.onload = () => {
    document.getElementById('submit').onclick = addCourseOffering;
    document.getElementById('delete').onclick = deleteCourseOffering;
    document.getElementById('form').onsubmit = (e) => {
        e.preventDefault();
    };
    document.getElementById('clearInput').onclick = clearInputs;
    document.getElementById('course_type').onchange = courseTypeOnChange;
    document.getElementById('course_id').onchange = courseIdOnChange;
    coursesDropdown();
    courseOfferingsDropdown();
}

function courseTypeOnChange() {
    let courseType = document.getElementById('course_type').value;
    if (courseType === '') {
        document.getElementById('course_id').value = 'NIL000';
        document.getElementById('course_id').readOnly = true;
        document.getElementById('nilDescriptionLabel').hidden = false;
        document.getElementById('nilDescription').hidden = false;
        document.getElementById('num_credits').hidden = true;
    } else {
        document.getElementById('course_id').readOnly = false;
        document.getElementById('nilDescriptionLabel').hidden = true;
        document.getElementById('nilDescription').hidden = true;
        document.getElementById('num_credits').hidden = false;
        courseIdOnChange()
    }
}

async function courseIdOnChange() {
    let courseID = document.getElementById("course_id").value;
    let credits = await getCreditsForCourse(courseID);
    if (credits !== null) {
        document.getElementById("num_credits").innerHTML = `Credits: ${credits}`;
    } else {
        document.getElementById("num_credits").innerHTML = `Course does not exist.`;
    }
}

async function addCourseOffering() {
    let courseID = document.getElementById('course_id').value;
    let courseType = document.getElementById('course_type').value;
    let semester = document.getElementById('semester').value;
    let year = document.getElementById('year').value;
    let sectionNum = document.getElementById('section_num').value;

    let teuValue = document.getElementById('teu').value;

    if (teuValue === '') {
        teuValue = null;
    }

    if (courseID === 'NIL000') {
        if (document.getElementById('nilDescription').value === '') {
            document.getElementById('result').innerHTML = 'For Non-Instructional Load you must specify a description';
            clearResultDiv();
            return;
        }
        courseType = document.getElementById("nilDescription").value;
    }

    if (await courseExists(courseID)) {
        if (await primaryKeyCourseOfferingExists(courseID, courseType, semester, year, sectionNum)) {
            document.getElementById('result').innerHTML = 'Cannot add course offering, it already exists';
            clearResultDiv();
            return;
        } else {
            let numCredits = await getCreditsForCourse(courseID); // Get credits from corresponding course;
            let data;
            if (teuValue === null) {
                data = {
                    query: `insert into course_offering values (
                    '${courseID}',
                    '${courseType}',
                    '${semester}', 
                    ${year},
                    ${sectionNum},
                    ${numCredits},
                    NULL)`
                };
            } else {
                data = {
                    query: `insert into course_offering values (
                    '${courseID}',
                    '${courseType}',
                    '${semester}', 
                    ${year},
                    ${sectionNum},
                    ${numCredits},
                    ${teuValue})`
                };
            }

            return fetch('/action/page3', {
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
                document.getElementById('result').innerHTML = 'Success! Course offering inserted';
                clearResultDiv();
                clearInputs();
                courseOfferingsDropdown();
            });
        }
    } else {
        document.getElementById('result').innerHTML = 'Cannot add course offering, no matching Course ID available';
        clearResultDiv();
    }
}

async function courseExists(courseID) {
    let data = {
        query: `select * from course where
        course_id = '${courseID}'`
    };
    return fetch('/action/page3', {
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
            return false;
        }
        return true;
    });
}

async function getCreditsForCourse(courseID) {
    let data = {
        query: `select num_credits from course where
        course_id = '${courseID}'`
    };
    return fetch('/action/page3', {
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
        if (responseJson.length > 0) {
            return responseJson[0].num_credits;
        } else {
            return null;
        }
    });
}

async function primaryKeyCourseOfferingExists(courseID, courseType, semester, year, sectionNum) {
    let data = {
        query: `select * from course_offering where
        course_id = '${courseID}'
        and course_type = '${courseType}'
        and semester = '${semester}'
        and year = '${year}'
        and section_num = '${sectionNum}'`
    };
    return fetch('/action/page3', {
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
            return false;
        }
        return true;
    });
}

async function fullCourseOfferingExists(courseID, courseType, semester, year, sectionNum, numCredits, teuValue) {
    let data;
    if (teuValue === null) {
        data = {
            query: `select * from course_offering where
            course_id = '${courseID}'
            and course_type = '${courseType}'
            and semester = '${semester}'
            and year = '${year}'
            and section_num = '${sectionNum}'
            and num_credits = '${numCredits}'
            and TEU_value is NULL`
        };
    } else {
        data = {
            query: `select * from course_offering where
            course_id = '${courseID}'
            and course_type = '${courseType}'
            and semester = '${semester}'
            and year = '${year}'
            and section_num = '${sectionNum}'
            and num_credits = '${numCredits}'
            and TEU_value = '${teuValue}'`
        };
    }
    return fetch('/action/page3', {
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
            return false;
        }
        return true;
    });
}

async function deleteCourseOffering() {
    let courseID = document.getElementById('course_id').value;
    let courseType = document.getElementById('course_type').value;
    let semester = document.getElementById('semester').value;
    let year = document.getElementById('year').value;
    let sectionNum = document.getElementById('section_num').value;
    let teuValue = document.getElementById('teu').value;
    let numCredits = await getCreditsForCourse(courseID); // Get credits from corresponding course;

    if (teuValue === '') {
        teuValue = null;
    }

    if (courseID === 'NIL000') {
        courseType = document.getElementById('nilDescription').value;
    }

    if (await fullCourseOfferingExists(courseID, courseType, semester, year, sectionNum, numCredits, teuValue)) {
        let data;
        if (teuValue === null) {
            data = {
                query: `delete from course_offering where
                course_id = '${courseID}'
                and course_type = '${courseType}'
                and semester = '${semester}'
                and year = '${year}'
                and section_num = '${sectionNum}'
                and num_credits = '${numCredits}'
                and TEU_value is NULL`
            };
        } else {
            data = {
                query: `delete from course_offering where
                course_id = '${courseID}'
                and course_type = '${courseType}'
                and semester = '${semester}'
                and year = '${year}'
                and section_num = '${sectionNum}'
                and num_credits = '${numCredits}'
                and TEU_value = '${teuValue}'`
            };
        }
        return fetch('/action/page3', {
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
            document.getElementById('result').innerHTML = 'Success! Course offering deleted';
            clearResultDiv();
            clearInputs();
            courseOfferingsDropdown();
        });
    } else {
        document.getElementById('result').innerHTML = 'Cannot delete course offering, does not exist in DB';
        clearResultDiv();
    }
}

function coursesDropdown() {
    let data = {
        query: 'select course_id, title, dept_name, num_credits from course'
    };
    return fetch('/action/page3', {
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
        populateCoursesDropdown(responseJson);
    });
}

function populateCoursesDropdown(data) {
    let selectDropdown = document.getElementById('coursesSelect');
    if (!selectDropdown) {
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'coursesSelect');
        document.getElementById('courses').appendChild(selectDropdown);
    }
    selectDropdown.onchange = coursesOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--) {
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = `${data[i].course_id}, ${data[i].title}, 
      ${data[i].dept_name}, ${data[i].num_credits}`;
        option.value = JSON.stringify(data[i]);
        selectDropdown.add(option);
    }
}

function coursesOnChange() {
    document.getElementById('course_id').readOnly = true;
    let selectedCourse = JSON.parse(document.getElementById('coursesSelect').value);
    if (selectedCourse.course_id === 'NIL000') {
        document.getElementById('nilDescriptionLabel').hidden = false;
        document.getElementById('nilDescription').hidden = false;
        document.getElementById('nilDescription').value = '';
        document.getElementById('num_credits').hidden = true;
    } else {
        document.getElementById('nilDescriptionLabel').hidden = true;
        document.getElementById('nilDescription').hidden = true;
        document.getElementById('nilDescription').value = '';
        document.getElementById('course_type').selectedIndex = 0;
        document.getElementById('num_credits').hidden = false;
    }

    let data;
    if (selectedCourse.dept_name === null) {
        data = {
            query: `select * from course where 
            course_id = '${selectedCourse.course_id}'
            and title = '${selectedCourse.title}'
            and dept_name is NULL
            and num_credits = '${selectedCourse.num_credits}'`
        };
    } else {
        data = {
            query: `select * from course where 
            course_id = '${selectedCourse.course_id}'
            and title = '${selectedCourse.title}'
            and dept_name = '${selectedCourse.dept_name}'
            and num_credits = '${selectedCourse.num_credits}'`
        };
    }
    fetch('/action/page3', {
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
        document.getElementById('course_id').value = responseJson[0].course_id;
        if (responseJson[0].course_id === 'NIL000') {
            document.getElementById('course_type').selectedIndex = 2;
        }
        courseIdOnChange();
    });
}

function courseOfferingsDropdown() {
    let data = {
        query: 'select * from course_offering'
    };
    return fetch('/action/page3', {
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
        populateCourseOfferingsDropdown(responseJson);
    });
}

function populateCourseOfferingsDropdown(data) {
    let selectDropdown = document.getElementById('courseOfferingsSelect');
    if (!selectDropdown) {
        selectDropdown = document.createElement('select');
        selectDropdown.setAttribute('id', 'courseOfferingsSelect');
        document.getElementById('courseOfferings').appendChild(selectDropdown);
    }
    selectDropdown.onchange = courseOfferingsOnChange;
    //clear any options in the select dropdown if present
    for (let i = selectDropdown.length - 1; i >= 0; i--) {
        selectDropdown.remove(i);
    }
    let option;
    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = `${data[i].course_id}, ${data[i].course_type}, 
      ${data[i].semester}, ${data[i].year}, ${data[i].section_num}, ${data[i].num_credits}, ${data[i].TEU_value}`;
        option.value = JSON.stringify(data[i]);
        selectDropdown.add(option);
    }
}

function courseOfferingsOnChange() {
    document.getElementById('course_id').readOnly = true;
    let selectedCourseOffering = JSON.parse(document.getElementById('courseOfferingsSelect').value);

    if (selectedCourseOffering.course_id === 'NIL000') {
        document.getElementById('nilDescriptionLabel').hidden = false;
        document.getElementById('nilDescription').hidden = false;
        document.getElementById('nilDescription').value = selectedCourseOffering.course_type;
        document.getElementById('num_credits').hidden = true;
    } else {
        document.getElementById('nilDescriptionLabel').hidden = true;
        document.getElementById('nilDescription').hidden = true;
        document.getElementById('nilDescription').value = '';
        document.getElementById('num_credits').hidden = false;
    }

    document.getElementById('course_id').value = selectedCourseOffering.course_id;
    courseIdOnChange();

    switch (selectedCourseOffering.course_type) {
        case 'InPerson':
            document.getElementById('course_type').selectedIndex = 0;
            break;
        case 'Online':
            document.getElementById('course_type').selectedIndex = 1;
            break;
        default:
            document.getElementById('course_type').selectedIndex = 2;
    }

    switch (selectedCourseOffering.semester) {
        case 'Fall':
            document.getElementById('semester').selectedIndex = 0;
            break;
        case 'Interim':
            document.getElementById('semester').selectedIndex = 1;
            break;
        case 'Spring':
            document.getElementById('semester').selectedIndex = 2;
            break;
        case 'Summer':
            document.getElementById('semester').selectedIndex = 3;
            break;
        default:
            break;
    }

    document.getElementById('year').value = selectedCourseOffering.year;

    if (selectedCourseOffering.TEU_value === null) {
        document.getElementById('teu').value = '';
    } else {
        document.getElementById('teu').value = selectedCourseOffering.TEU_value;
    }
}

function clearInputs() {
    document.getElementById('course_id').readOnly = false;
    document.getElementById('course_id').value = '';
    document.getElementById('num_credits').innerHTML = 'Credits:';
    document.getElementById('course_type').selectedIndex = 0;
    document.getElementById('semester').selectedIndex = 0;
    document.getElementById('year').value = 2020;
    document.getElementById('section_num').value = 1;
    document.getElementById('teu').value = 3.4;
    document.getElementById('nilDescriptionLabel').hidden = true;
    document.getElementById('nilDescription').hidden = true;
    document.getElementById('nilDescription').value = '';
    document.getElementById('num_credits').hidden = false;
}

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 10000);
}