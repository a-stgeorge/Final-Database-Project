window.onload = async () => {
    await getCourses();
    createCheckboxes();

    document.getElementById('create_cluster').onclick = create_cluster;
    console.log('Page 6 boi');
}

function create_cluster(){
    var checkboxes = document.getElementsByClassName('course_checkbox');

    Array.from(checkboxes).forEach((box, i) => {
            if(box.checked === true){
                console.log(box.value);
            }
    });
}

async function getCourses() {
    return fetch('/action/page6', { method: 'POST' }).then(async response => {
        if (!response.ok) {
            let responseMessage = await response.text();
            document.getElementById('courses').innerHTML = responseMessage;
            return;
        }
        let responseJson = await response.json();
        document.getElementById('courses').innerHTML = '';
        constructTable('#courses', responseJson);
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
            cell.appendChild(input);
            row.appendChild(cell);
        }
    });
}