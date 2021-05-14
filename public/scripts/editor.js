// const { response } = require("express");

const baseURL = 'http://localhost:8081';
let doctors;
let bNewDoc = false
let newDocObject;

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

// Function to get Doctors from REST API
const getListOfDoctors = async () => {
    // Fetch request
    response = await fetch(`${baseURL}/doctors/`)
    let data = await response.json()
    console.log(data)
    // Store data in global
    doctors = data;
    // Create list of li elements for each doctor
    const listDocs = data.map(item => `
        <li>
            <a href="#" data-id="${item._id}">${item.name}</a>
        </li>`
    );
    // Get front-end element (aside) that holds doctor list
    // Join the list of doctors inside a ul element and append to
    // doctor list element
    document.getElementById('doctor_list').innerHTML = `
        <ul>
            ${listDocs.join('')}
        </ul>`
    
    attachEventHandlers();

    // // Get JSON body from response object
    // .then(response => response.json())
    // // Parse Data and Write to the Front-End
    // .then(data => {
    //     console.log(data)
    //     // Store data in global
    //     doctors = data;
    //     // Create list of li elements for each doctor
    //     const listDocs = data.map(item => `
    //     <li>
    //         <a href="#" data-id="${item._id}">${item.name}</a>
    //     </li>`
    //     );
    //     console.log(listDocs)
    //     // Get front-end element (aside) that holds doctor list
    //     // Join the list of doctors inside a ul element and append to
    //     // doctor list element
    //     document.getElementById('doctor_list').innerHTML = `
    //     <ul>
    //         ${listDocs.join('')}
    //     </ul>`
    // })
    // // Attach Event Handlers
    // .then(attachEventHandlers);
};

// Function to attach event handlers to artist links
const attachEventHandlers = () => {
    console.log('Setting event handlers')
    // Get all the doctor links
    document.querySelectorAll('#doctor_list a').forEach(a => {
        // Attach the detailView function to each link as an onClick event
        a.onclick = detailView;
    })
    
    // Attach Event handler to Add Doctor button
    add_doc_button = document.getElementById('newDoctor');
    add_doc_button.onclick = showDoctorForm; 
    // Attach Event Handler for doctor_list change
    doc_list = document.getElementById('doctor_list')
    console.log("Set Event Handlers");
}

// Function to display detail view of doctor
const detailView = async ev => {
    // Get id of data target that trigged event
    const id = ev.currentTarget.dataset.id;

    // Get the doctor from the specific doctors
    const doctor = doctors.filter(doctor => doctor._id === id)[0];
    
    // Display Info about Doctor
    document.querySelector('#doctor').innerHTML = `
    <h2>Name: ${doctor.name}</h2>
    <p>Seasons: ${doctor.seasons}</p>
    <img src="${doctor.image_url}" />`

    // Get Companions for Doctor
    companions = await getDoctorCompanions(doctor);
    // Create list of li elements containing the companion id and name
    const listCompanions = companions.map(companion => `
        <li>
            <a href="#" data-id="${companion._id}">${companion.name}</a>
        </li>`)
    // Append the list of companions elements to the companions section
    document.getElementById('companions').innerHTML = `
    <ul>
        ${listCompanions.join('')}
    </ul>`
};
// Function to get Doctor's companions
async function getDoctorCompanions(doctor) {
    // Get id of Doctor
    const id = doctor._id
    // Fetch companions from REST API
    let response = await fetch(`${baseURL}/doctors/${id}/companions/`);
    // Return JSON
    return response.json();
}
// Function to show Form 
const showDoctorForm = () => {
    console.log("Showing add Doctor Form")
    doctorListElem = document.getElementById('doctor')
    doctorListElem.innerHTML = `
    <form id="addDoctorForm">
         <!-- Name -->
         <label for="name">Name</label>
         <input type="text" id="name" name="name">

         <!-- Seasons -->
         <label for="seasons">Seasons</label>
         <input type="text" id="seasons" name="seasons">

         <!-- Ordering -->
         <label for="ordering">Ordering</label>
         <input type="text" id="ordering" name="ordering">

        <!-- Image -->
        <label for="image_url">Image</label>
        <input type="text" id="image_url" name="image_url">

        <!-- Buttons -->
        <button class="btn btn-main" id="create">Save</button>
        <button class="btn" id="cancel">Cancel</button>
    </form>`
    // Attach Event Handler to Save Button
    form_submit = document.getElementById('create');
    form_submit.onclick = PostDoctorData;
    form_cancel = document.getElementById('cancel');
    form_cancel.onclick = removeForm;
}
// Function to post Form data to REST API
const PostDoctorData = async ev => {
    // Prevent Default Behavior
    ev.preventDefault();
    
    // Get Form Data
    form = document.getElementById('addDoctorForm')
    let formData = new FormData(form)
    // Get Form Data
    let form_name = formData.get('name')
    let form_seasons = formData.get('seasons')
    let form_ordering = formData.get('ordering')
    let form_image_url = formData.get('image_url')

    form_seasons = form_seasons.split(',');
    // Validate Form Data
    if (form_name == null || form_name == '') {
        document.getElementById('doctor').innerHTML = `
        <h2 class="error">
            Bad Data, check name and try again
        </h2>`
    }
    else if (form_seasons == null || form_seasons == '') {
        document.getElementById('doctor').innerHTML = `
        <h2 class='error'>
            Bad Data, check name and try again
        </h2>`
    }
    else if (form_ordering == null || form_ordering == '') {
         document.getElementById('doctor').innerHTML = `
        <h2 class='error'>
            Bad Data, check name and try again
        </h2>`
    }
    else if (form_image_url == null || form_image_url == '') {
         document.getElementById('doctor').innerHTML = `
        <h2 class='error'>
            Bad Data, check name and try again
        </h2>`
    }
    else {
        let response = await fetch(`${baseURL}/doctors`, {
            // Add Post Method Type
            method: "POST",

            // Add JSON Body
            body: JSON.stringify({
                 name: form_name,
                 seasons: form_seasons,
                 ordering: form_ordering,
                image_url: form_image_url
            }),

            // Add proper Headers
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        newDocObject = await response.json(); 
        // Call function to update doctor_list with new doctor 
        await getListOfDoctors();
        await setDetailView(newDocObject);
    }
}
// Function to remove Form from DOM
const removeForm = ev => {
    ev.preventDefault();
    document.getElementById('doctor').innerHTML = "Selected Doctor Goes Here"
    //getListOfDoctors();
}

const setDetailView = async (doctor) => {
    // Display Info about Doctor
    document.querySelector('#doctor').innerHTML = `
    <h2>Name: ${doctor.name}</h2>
    <p>Seasons: ${doctor.seasons}</p>
    <img src="${doctor.image_url}" />`

    // Get Companions for Doctor
    companions = await getDoctorCompanions(doctor);
    // Create list of li elements containing the companion id and name
    const listCompanions = companions.map(companion => `
        <li>
            <a href="#" data-id="${companion._id}">${companion.name}</a>
        </li>`)
    // Append the list of companions elements to the companions section
    document.getElementById('companions').innerHTML = `
    <ul>
        ${listCompanions.join('')}
    </ul>`
}
// invoke this function when the page loads:
initResetButton();
getListOfDoctors();