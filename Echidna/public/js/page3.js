window.onload = () => {
    console.log('Page 3 boi');
    document.getElementById('submit').onclick = addCourseOffering;
    document.getElementById('delete').onclick = deleteCourseOffering;
    document.getElementById('form').onsubmit = (e) => {
        e.preventDefault();
    };
    document.getElementById('clearInput').onclick = clearInputs;
    coursesDropdown();
    courseOfferingsDropdown();
}

//TODO handle non instructional load (needs to allow for entering into course type)
// disable section number when adding NIL
async function addCourseOffering() {
    let courseID = document.getElementById('course_id').value;
    let courseType = document.getElementById('course_type').value;
    let semester = document.getElementById('semester').value;
    let year = document.getElementById('year').value;
    let sectionNum = document.getElementById('section_num').value;
    let numCredits = document.getElementById('num_credits').value;
    if (numCredits === '') {
        numCredits = null;
    }
    let teuValue = document.getElementById('teu').value;
    if (teuValue === '') {
        teuValue = null;
    }
    
    if (await courseExists(courseID)) {
        if (await primaryKeyCourseOfferingExists(courseID, courseType, semester, year, sectionNum)) {
            document.getElementById('result').innerHTML = 'Cannot add course offering, it already exists';
            clearResultDiv();    
        } else {
            let data;
            if (numCredits === null && teuValue === null) {
                data = {
                    query: `insert into course_offering values (
                    '${courseID}',
                    '${courseType}',
                    '${semester}', 
                    ${year},
                    ${sectionNum},
                    NULL,
                    NULL)`
                };
            } else if (numCredits === null) {
                data = {
                    query: `insert into course_offering values (
                    '${courseID}',
                    '${courseType}',
                    '${semester}', 
                    ${year},
                    ${sectionNum},
                    NULL,
                    ${teuValue})`
                };
            } else if (teuValue === null) {
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
    if (numCredits === null && teuValue === null) {
        data = {
            query: `select * from course_offering where
            course_id = '${courseID}'
            and course_type = '${courseType}'
            and semester = '${semester}'
            and year = '${year}'
            and section_num = '${sectionNum}'
            and num_credits is NULL
            and TEU_value is NULL`
        };
    } else if (numCredits === null) {
        data = {
            query: `select * from course_offering where
            course_id = '${courseID}'
            and course_type = '${courseType}'
            and semester = '${semester}'
            and year = '${year}'
            and section_num = '${sectionNum}'
            and num_credits is NULL
            and TEU_value = '${teuValue}'`
        };
    } else if (teuValue === null) {
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
    let numCredits = document.getElementById('num_credits').value;
    if (numCredits === '') {
        numCredits = null;
    }
    let teuValue = document.getElementById('teu').value;
    if (teuValue === '') {
        teuValue = null;
    }

    if (await fullCourseOfferingExists(courseID, courseType, semester, year, sectionNum, numCredits, teuValue)) {
        let data;
        if (numCredits === null && teuValue === null) {
            data = {
                query: `delete from course_offering where
                course_id = '${courseID}'
                and course_type = '${courseType}'
                and semester = '${semester}'
                and year = '${year}'
                and section_num = '${sectionNum}'
                and num_credits is NULL
                and TEU_value is NULL`
            };
        } else if (numCredits === null) {
            data = {
                query: `delete from course_offering where
                course_id = '${courseID}'
                and course_type = '${courseType}'
                and semester = '${semester}'
                and year = '${year}'
                and section_num = '${sectionNum}'
                and num_credits is NULL
                and TEU_value = '${teuValue}'`
            };
        } else if (teuValue === null) {
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
    let data;
    if (selectedCourse.num_credits === null && selectedCourse.dept_name === null) {
        data = {
            query: `select * from course where 
            course_id = '${selectedCourse.course_id}'
            and title = '${selectedCourse.title}'
            and dept_name is NULL
            and num_credits is NULL`
        };
    } else if (selectedCourse.num_credits === null) {
        data = {
            query: `select * from course where 
            course_id = '${selectedCourse.course_id}'
            and title = '${selectedCourse.title}'
            and dept_name = '${selectedCourse.dept_name}'
            and num_credits is NULL`
        };
    } else if (selectedCourse.dept_name === null) {
        data = {
            query: `select * from course where 
            course_id = '${selectedCourse.course_id}'
            and title = '${selectedCourse.title}'
            and dept_name = is NULL
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
        document.getElementById('num_credits').value = responseJson[0].num_credits;
        if (responseJson[0].course_id === 'NIL000') {
            document.getElementById('course_type').selectedIndex = 2;
        }
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

    document.getElementById('course_id').value = selectedCourseOffering.course_id;
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
    document.getElementById('section_num').value = selectedCourseOffering.section_num;
    if (selectedCourseOffering.num_credits === null) {
        document.getElementById('num_credits').value = '';
    } else {
        document.getElementById('num_credits').value = selectedCourseOffering.num_credits;
    }
    if (selectedCourseOffering.TEU_value === null) {
        document.getElementById('teu').value = '';
    } else {
        document.getElementById('teu').value = selectedCourseOffering.TEU_value;
    }
}

function clearInputs() {
    document.getElementById('course_id').readOnly = false;
    document.getElementById('course_id').value = '';
    document.getElementById('course_type').selectedIndex = 0;
    document.getElementById('semester').selectedIndex = 0;
    document.getElementById('year').value = 2020;
    document.getElementById('section_num').value = 1;
    document.getElementById('num_credits').value = 0;
    document.getElementById('teu').value = 3.4;
}

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 10000);
}