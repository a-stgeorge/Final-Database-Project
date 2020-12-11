window.onload = async () => {
    await getCourses();
    createCheckboxes();
    await getCourseClusters();
    setMaxClusterID();

    document.getElementById('create_cluster').onclick = createCluster;
    document.getElementById('delete_clusters').onclick = deleteClusters;
}

function setMaxClusterID() {
    let data = {
        query: 'select max(cluster_id) as max_cluster_num from cluster'
    };
    return fetch('/action/page6',
        {
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
            if (responseJson[0].max_cluster_num === null) {
                localStorage['current_cluster_id'] = 0;
            }
            else {
                localStorage['current_cluster_id'] = responseJson[0].max_cluster_num + 1;
            }
        });
}

async function createCluster() {
    var checkboxes = document.getElementsByClassName('course_checkbox');
    var selectedBoxes = Array.prototype.slice.call(checkboxes).filter(box => box.checked === true);

    if (selectedBoxes.length <= 1) {
        document.getElementById('result').innerHTML = 'Select at least 2 courses to cluster';
        clearResultDiv();
        return;
    }
    for (let i = 0; i < selectedBoxes.length; i++) {
        let data = {
            query: `insert into cluster values(${localStorage['current_cluster_id']}, '${selectedBoxes[i].value}')`
        };
        fetch('/action/page6',
            {
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
                document.getElementById('result').innerHTML = 'Success!';
                clearResultDiv();
            });
        selectedBoxes[i].checked = false;
    }
    localStorage['current_cluster_id'] = parseInt(localStorage['current_cluster_id']) + 1;
    await getCourseClusters();
}

async function getCourses() {

    let data = {
        query: `select course_id, title, dept_name, num_credits from course where course_id != 'NIL000'`
    };
    return fetch('/action/page6',
        {
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
            document.getElementById('courses').innerHTML = '';
            constructTable('#courses', responseJson);
        });
}

async function getCourseClusters() {

    let data = {
        query: 'select * from cluster'
    };
    await fetch('/action/page6',
        {
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
            document.getElementById('courseClusters').innerHTML = '';
            constructTable('#courseClusters', responseJson);
        });
}

function createCheckboxes() {
    var table = document.getElementById('courses');
    var rows = document.querySelectorAll('#courses tr');

    if (rows.length === 0) {
        document.getElementById('result').innerHTML = "The courses table is empty";
        document.getElementById('courseDiv').style.display = "none";
        document.getElementById('courseClustersDiv').style.display = "none";
        return;
    }
    rows.forEach((row, i) => {
        if (i === 0) {
            var head = document.createElement('th');
            head.append(document.createTextNode('Select courses to cluster'));
            row.append(head);
        }
        else {
            var course_id = table.rows[i].cells[0].innerHTML;

            var input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', course_id);
            input.classList.add('course_checkbox');

            var cell = document.createElement('td');
            cell.classList.add('course_checkbox');
            cell.appendChild(input);
            row.appendChild(cell);
        }
    });
}

async function deleteClusters() {
    let data = {
        query: 'delete from cluster'
    };
    fetch('/action/page6',
        {
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
            document.getElementById('result').innerHTML = 'Success!';
            clearResultDiv();
        });
    await getCourses();
    createCheckboxes();
    await getCourseClusters();
    setMaxClusterID();
}

function clearResultDiv() {
    setTimeout(function () {
        document.getElementById('result').innerHTML = '';
    }, 10000);
}