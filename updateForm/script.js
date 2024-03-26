const url = 'https://awarrillm.onrender.com/api/word/createword';
const loginUrl = 'https://awarrillm.onrender.com/api/users/login';
const fetchUrl = 'https://awarrillm.onrender.com/api/word/all';
const deleteUrl = 'https://awarrillm.onrender.com/api/word/delete';


const loginSpinner = document.getElementById('loginSpinner');
const loginBtn = document.getElementById('loginBtn');
const word = document.getElementById('word');
const yoruba = document.getElementById('yoruba');
const definition = document.getElementById('definition');
const igbo = document.getElementById('igbo');
const hausa = document.getElementById('hausa');
const message = document.getElementById('message');
const spinner = document.getElementById('spinner');
const btn = document.getElementById('btn');
const tableBody = document.getElementById('table-body');
const deleteMessage = document.getElementById('deleteMessage');
const userEmail = document.getElementById('userEmail');
const userPassword = document.getElementById('userPassword');
const loginError = document.getElementById('loginError');


const saveDataToCookie = (key, value, expirationDays) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationDays);

  const cookieValue = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expirationDate.toUTCString()}; path=/`;
  document.cookie = cookieValue;
};

const getDataFromCookie = (key) => {
  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.split('=');
    if (decodeURIComponent(cookieKey) === key) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null; // Return null if the key is not found
};




function formSubmission(e) {
    e.preventDefault();
    spinner.style.display="block";
    btn.disabled = true;
    let userWord = word.value;
    let userYoruba = yoruba.value;
    let userIgbo = igbo.value;
    let userHausa = hausa.value;
    let userDefinition = definition.value;

  
      const data = {
        EnglishWord: userWord,
        Yoruba: userYoruba,
        Igbo: userIgbo,
        Hausa: userHausa,
        Definition: userDefinition,
    };
    const token = getDataFromCookie("token");
    fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` ,
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          // Assuming response.json() returns an object
          return response.json();
        })
        .then(data => {
          const message = document.getElementById('message');
          message.innerHTML = data.RespondMessage;
          spinner.style.display="none"
          btn.disabled = false;
          word.value=null;
          yoruba.value=null;
          igbo.value=null;
          hausa.value=null;
          definition.value=null;
          fetchData(); // Update table after successful form submission
          // Reload page after data input
          window.location.reload();

          console.log('Success:', data);
        })
        .catch(error => console.error('Error:', error));
      
      
}


// Function to fetch data from the API
const fetchData = () => {
  
  fetch(fetchUrl)
    .then(response => response.json())
    .then(data => {

      // Clear existing table rows
      tableBody.innerHTML = '';
    
      // Populate table with new data

      data.data.words.forEach((word) => {

        tableBody.innerHTML += `
          <tr>
            <td>${word.EnglishWord}</td>
            <td>${word.Definition}</td>
            <td>${word.Yoruba}</td>
            <td>${word.Igbo}</td>
            <td>${word.Hausa}</td>
            <td><button class="btn btn-danger" onclick="deleteItem('${word._id}')">Delete</button></td>
          </tr>`;
      });

      // Reinitialize DataTables
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
        
      }
      $('#example').DataTable();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
};

// Call fetchData to initially populate the table
 fetchData();




  // Function to delete an item
const deleteItem = (id) => {
  // Ask for confirmation before deletion
  const isConfirmed = window.confirm('Are you sure you want to delete this item?');

  if (!isConfirmed) {
    // If not confirmed, do nothing
    return;
  }

  fetch(`${deleteUrl}/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
      // Display the endpoint response (assuming the response has a property like "message")
      deleteMessage.style = 'flex';
      deleteMessage.innerHTML = data.responseMessage;

      // After successful deletion, fetch data again to update the table
      fetchData();
      window.location.reload();

    })
    .catch(error => {
      console.error('Error deleting data:', error);
    });
};

//log user in

  const login = (e) => {
    e.preventDefault();
    loginError.innerHTML = "";
  
    loginSpinner.style.display = "block";
    loginBtn.disabled = true;
  
    const userEmailInput = userEmail.value;
    const userPasswordInput = userPassword.value;
    const data = {
      "email": userEmailInput,
      "password": userPasswordInput
    };
    const payload=  JSON.stringify(data)
    // console.log(payload);
    const token = getDataFromCookie("token");
    fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body:payload,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Handle the successful response here
        console.log('Success:', data);

        loginError.innerHTML = data.responseMessage;
        if (data.responseMessage === "successful") {
          console.log(data.data.token);
          // To change the text colour of response message
          loginError.style.color = "Green";
          // To store the user login in the browser's storage for a specific time
          saveDataToCookie("token", data.data.token, 1); // Expires in 7 days
          // To make the page reload automatically after any action of updating or deleting
          window.location.reload();
          
        } else {
          // To change the text colour of response message
          loginError.style.color = "Red";
        }
      })
      .catch(error => {
        // Display an error message to the user or take other appropriate actions
        console.error('Error:', error);
      })
      .finally(() => {
        loginSpinner.style.display = "none";
        loginBtn.disabled = false;
      });
  };
  

  
  $(document).ready(function(){
      const tokenFromCookie = getDataFromCookie("token");
      if (tokenFromCookie==null) {
        $('#staticBackdrop').modal('show'); 
      }
  });