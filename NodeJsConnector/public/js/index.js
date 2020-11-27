window.onload = () => {
    document.getElementById('button').onclick = click2;
}

async function click() {
    fetch('boi').then(async response => {
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        constructTable('#result', responseJson);
        // let resultDiv = document.getElementById('result');
        // for(let i = 0; i < responseJson.length; i++) {
        //     let newP = document.createElement('p');
        //     newP.innerHTML = JSON.stringify(responseJson[i]);
        //     resultDiv.appendChild(newP);
        // }
    });
}

async function click2() {
    let data = {
        query: document.getElementById('query').value
    };
    fetch('test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    ).then(async response => {
        let responseJson = await response.json();
        document.getElementById('result').innerHTML = '';
        constructTable('#result', responseJson);
    });
};

//Credit: GeeksForGeeks
function constructTable(selector, list) { 
      
    // Getting the all column names 
    var cols = Headers(list, selector);   

    // Traversing the JSON data 
    for (var i = 0; i < list.length; i++) { 
        var row = $('<tr/>');    
        for (var colIndex = 0; colIndex < cols.length; colIndex++) 
        { 
            var val = list[i][cols[colIndex]]; 
              
            // If there is any key, which is matching 
            // with the column name 
            if (val == null) val = "";   
                row.append($('<td/>').html(val)); 
        } 
          
        // Adding each row to the table 
        $(selector).append(row); 
    } 
} 
//Credit: GeeksForGeeks
function Headers(list, selector) { 
    var columns = []; 
    var header = $('<tr/>'); 
      
    for (var i = 0; i < list.length; i++) { 
        var row = list[i]; 
          
        for (var k in row) { 
            if ($.inArray(k, columns) == -1) { 
                columns.push(k); 
                  
                // Creating the header 
                header.append($('<th/>').html(k)); 
            } 
        } 
    } 
      
    // Appending the header to the table 
    $(selector).append(header); 
        return columns; 
}