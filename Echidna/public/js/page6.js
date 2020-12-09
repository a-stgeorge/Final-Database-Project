window.onload = async () => {
    await getCourses();
    createCheckboxes();
    await getCourseClusters();
    setMaxClusterID();
    

    document.getElementById('create_cluster').onclick = createCluster;
    document.getElementById('delete_clusters').onclick = deleteClusters;
    console.log('Page 6 boi');
}

function setMaxClusterID(){
    let data = {
        query: 'select max(cluster_id) as max_cluster_num from course'
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
        if (responseJson[0].max_cluster_num === null){
            localStorage['current_cluster_id'] = 0;
        }
        else{
            localStorage['current_cluster_id'] = responseJson[0].max_cluster_num;
        }
    });
}

async function createCluster(){
    var checkboxes = document.getElementsByClassName('course_checkbox');
    var selectedBoxes = Array.prototype.slice.call(checkboxes).filter(box => box.checked === true);

    if(selectedBoxes.length <= 1){
        document.getElementById('result').innerHTML = 'Select at least 2 courses to cluster';
        clearResultDiv();
        return;
    }    
    selectedBoxes.forEach((box, i) => {
        if(box.checked === true){
            let data = {
                query: `update course set cluster_id = ${localStorage['current_cluster_id']} where course_id = '${box.value}'`
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
                let responseJson = await response.json();
                document.getElementById('result').innerHTML = 'Success!';
                clearResultDiv();
            });
        }
    });
    localStorage['current_cluster_id'] = parseInt(localStorage['current_cluster_id']) + 1;
    await getCourses();
    createCheckboxes();
    await getCourseClusters();
}

async function getCourses() {
    
    let data = {
        query: 'select course_id, title, dept_name, num_credits from course where cluster_id is NULL'
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

async function getCourseClusters(){

    let data = {
        query: 'select * from course where cluster_id is not NULL order by cluster_id'
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
        document.getElementById('courseClusters').innerHTML = '';
        constructTable('#courseClusters', responseJson);
    });
}

function createCheckboxes(){
    var table = document.getElementById('courses');
    var rows = document.querySelectorAll('#courses tr');
    
    rows.forEach((row, i) => {
        if (i === 0){
            var head = document.createElement('th');
            head.append(document.createTextNode('Select courses to cluster'));
            row.append(head);
        }
        else{
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
        query: 'update course set cluster_id = Null'
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
        let responseJson = await response.json();
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
    }, 7000);
}