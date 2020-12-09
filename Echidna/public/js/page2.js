window.onload = () => {
    console.log('Page 2 boi');
    document.getElementById('form').onsubmit = (e) => {
        e.preventDefault();
    };
    document.getElementById('submit').onclick = addCourse;
    document.getElementById('clearInput').onclick = clearInputs;
    coursesDropdown();
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isInt(str) {
    return str.length === 1 && /^\d$/.test(str);
}

function isValidCourseId(str) {
    return isLetter(str.charAt(0)) && isLetter(str.charAt(1)) && isLetter(str.charAt(2)) && isInt(str.charAt(3))
        && isInt(str.charAt(4)) && isInt(str.charAt(5));
}

//TODO numCredits cannot be null anymore, need to update all corresponding checks

async function addCourse() {
    let courseId = document.getElementById('course_id').value.toUpperCase();
    let courseTitle = document.getElementById('title').value;
    let department = document.getElementById('department').value;
    if (department === '') {
        department = null;
    }
    let numCredits = document.getElementById('num_credits').value;
    if (numCredits === '') {
        numCredits = null;
    }

    if (!document.getElementById('form').checkValidity()) {
        document.getElementById('result').innerHTML = 'Bad data in form, offending field(s) is bordered red.';
        clearResultDiv();
        return;
    }

    if (courseId.length !== 6 || !isValidCourseId(courseId)) {
        document.getElementById('result').innerHTML = `Bad data in form, Course ID must be 6 characters 
        and be similar to COS101 in format (3 letters then 3 numbers).`;
        clearResultDiv();
        return;
    }

    let data;
    if (department === null) {
        data = {
            query: `insert into course values (
                '${courseId}',
                '${courseTitle}',
                NULL,
                '${numCredits}',
                NULL)`
        };
    } else {
        data = {
            query: `insert into course values (
                '${courseId}',
                '${courseTitle}',
                '${department}',
                '${numCredits}',
                NULL)`
        };
    }


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
            if (responseMessage.includes('Duplicate entry')) {
                overwriteFlow(courseId, courseTitle, department, numCredits);
                return;
            }
            document.getElementById('result').innerHTML = responseMessage;
            clearResultDiv();
            return;
        }
        document.getElementById('result').innerHTML = 'Success!';
        clearResultDiv();
        clearInputs();
        coursesDropdown();
    });
}

async function overwriteFlow(courseId, courseTitle, department, numCredits) {
    if (confirm('ID already exists. Would you like to overwrite this course with the values you provided?')) {
        let data;
        if (department === null) {
            data = {
                query: `update course set
                course_id = '${courseId}',
                title = '${courseTitle}',
                dept_name = NULL,
                num_credits = '${numCredits}',
                where course_id = '${courseId}'`
            };
        } else {
            data = {
                query: `update course set
                course_id = '${courseId}',
                title = '${courseTitle}',
                dept_name = '${department}',
                num_credits = '${numCredits}'
                where course_id = '${courseId}'`
            };
        }
        await fetch('/action/page2', {
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
            document.getElementById('result').innerHTML = 'Success! Course updated';
            clearResultDiv();
            clearInputs();
            coursesDropdown();
        });
    }
}

function coursesDropdown() {
    let data = {
        query: 'select course_id, title, dept_name, num_credits from course'
    };
    return fetch('/action/page2', {
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
    let selectedcourse = JSON.parse(document.getElementById('coursesSelect').value);
    
    let data; 
    if (selectedcourse.dept_name === null) {
        data = {
            query: `select * from course where 
            course_id = '${selectedcourse.course_id}'
            and title = '${selectedcourse.title}'
            and dept_name is NULL
            and num_credits is NULL`
        }; 
    } else {
        data = {
            query: `select * from course where 
            course_id = '${selectedcourse.course_id}'
            and title = '${selectedcourse.title}'
            and dept_name = '${selectedcourse.dept_name}'
            and num_credits = '${selectedcourse.num_credits}'`
        };
    }
    fetch('/action/page2', {
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
        document.getElementById('title').value = responseJson[0].title;
        document.getElementById('department').value = responseJson[0].dept_name;
        document.getElementById('num_credits').value = responseJson[0].num_credits;
    });
}

function clearInputs() {
    document.getElementById('course_id').readOnly = false;
    document.getElementById('course_id').value = '';
    document.getElementById('title').value = '';
    document.getElementById('department').value = '';
    document.getElementById('num_credits').value = '';
}

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 10000);
}