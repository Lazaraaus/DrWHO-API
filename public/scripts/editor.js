
// Globals
const baseURL = 'http://localhost:8081';
let doctors;
// Ideally you wouldn't be using globals to hold state which could (read: should) be passed around at the function level
let newDocObject;
let currDocObject;

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
            <button id="newDoctor" class="btn">Add Doctor</button>
        </ul>`
    
    attachEventHandlers();
};
// Function to attach event handlers to doctor links
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
    // Set the global to the current doctor
    currDocObject = doctor;
    
    // Display Info about Doctor
    document.querySelector('#doctor').innerHTML = `
    <h2>Name: ${doctor.name}</h2> <button class="btn" id="editButton">edit</button> <button class="btn" id="deleteButton">delete</button>
    <p>Seasons: ${doctor.seasons}</p>
    <img src="${doctor.image_url}" />`

    // Get Companions for Doctor
    companions = await getDoctorCompanions(doctor);
    // Create list of li elements containing the companion id and name
    const listCompanions = companions.map(companion => `
        <li>
            <a href="#" data-id="${companion._id}">${companion.name}</a>
            <img src="${companion.image_url}" />
        </li>`)
    // Append the list of companions elements to the companions section
    document.getElementById('companions').innerHTML = `
    <ul>
        ${listCompanions.join('')}
    </ul>`

    // Get elem for edit button and attach ev handler
    edit_doc = document.getElementById('editButton');
    edit_doc.onclick = showEditForm;

    // Get elem for delete button and attach ev handler
    delete_doc = document.getElementById('deleteButton');
    delete_doc.onclick = deleteDoctor;

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
    document.getElementById('companions').innerHTML = "Selected doctor's companions go here"
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
// Function epression to post Form data to REST API
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
    // Validate Form Data, the Hard Way
    if (form_name == null || form_name == '') {
        document.getElementById('companions').innerHTML = `
        <h2 class="error">
            Bad Data, check name and try again
        </h2>`
    }
    else if (form_seasons == null || form_seasons == '') {
        document.getElementById('companions').innerHTML = `
        <h2 class='error'>
            Bad Data, check seasons and try again
        </h2>`
    }
    else if (form_ordering == null || form_ordering == '') {
         document.getElementById('companions').innerHTML = `
        <h2 class='error'>
            Bad Data, check ordering and try again
        </h2>`
    }
    else if (form_image_url == null || form_image_url == '') {
         document.getElementById('companions').innerHTML = `
        <h2 class='error'>
            Bad Data, check image_url and try again
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
// Function expression to remove Form from DOM
const removeForm = ev => {
    ev.preventDefault();
    document.getElementById('doctor').innerHTML = "Selected Doctor Goes Here"
}
// Function expression to setDetailView to a specific doctor
const setDetailView = async (doctor) => {
    // Set global currDocObj
    currDocObject = doctor;
    // Display Info about Doctor
    document.querySelector('#doctor').innerHTML = `
    <h2>Name: ${doctor.name}</h2> <button class="btn" id="editButton">edit</button> <button class="btn" id="deleteButton">delete</button>
    <p>Seasons: ${doctor.seasons}</p>
    <img src="${doctor.image_url}" />`

    // Get Companions for Doctor
    companions = await getDoctorCompanions(doctor);
    // Create list of li elements containing the companion id and name
    const listCompanions = companions.map(companion => `
        <li>
            <a href="#" data-id="${companion._id}">${companion.name}</a>
            <img src="${companion.image_url}" />
        </li>`)
    // Append the list of companions elements to the companions section
    document.getElementById('companions').innerHTML = `
    <ul>
        ${listCompanions.join('')}
    </ul>`
    
    // Get elem for edit button and attach ev handler
    edit_doc = document.getElementById('editButton');
    edit_doc.onclick = showEditForm;

    // Get elem for delete button and attach ev handler
    delete_doc = document.getElementById('deleteButton');
    delete_doc.onclick = deleteDoctor;
}
// Function expression to show edit form
const showEditForm = () => {
    console.log("Showing edit doctor form");
    // Get doctor information
    doctor_name = currDocObject.name;
    doctor_seasons = currDocObject.seasons;
    doctor_ordering = currDocObject.ordering;
    doctor_img_url = currDocObject.image_url;
    // Get element where form will live
    docElem = document.getElementById('doctor')
    // Change the Markup 
    docElem.innerHTML =`
     <form id="editDoctorForm">
         <!-- Name -->
         <label for="name">Name</label>
         <input type="text" id="name" name="name" required="required">

         <!-- Seasons -->
         <label for="seasons">Seasons</label>
         <input type="text" id="seasons" name="seasons" required="required">

         <!-- Ordering -->
         <label for="ordering">Ordering</label>
         <input type="text" id="ordering" name="ordering" required="required">

        <!-- Image -->
        <label for="image_url">Image</label>
        <input type="text" id="image_url" name="image_url" required="required">

        <!-- Buttons -->
        <button class="btn btn-main" id="edit">Edit</button>
        <button class="btn" id="cancel">Cancel</button>
    </form>`

    // Attach Event Handler to Save and Cancel button
    form_submit = document.getElementById('edit');
    form_submit.onclick = updateDoctorData;
    form_cancel = document.getElementById('cancel');
    form_cancel.onclick = cancelEdit;

    // Attach doctor data to inputs
    name_input = document.getElementById('name');
    seasons_input = document.getElementById('seasons');
    ordering_input = document.getElementById('ordering');
    image_input = document.getElementById('image_url');

    name_input.value = doctor_name;
    seasons_input.value = doctor_seasons;
    ordering_input.value = doctor_ordering;
    image_input.value = doctor_img_url;
}
// Function expression to submit form data to PATCH REST API endpoint
const updateDoctorData = async ev => {
    // Prevent default behavior
    ev.preventDefault();

    // Get Doctor Data
    form = document.getElementById('editDoctorForm')
    let formData = new FormData(form)
    // Get Form Data
    let form_name = formData.get('name')
    console.log(form_name);
    let form_seasons = formData.get('seasons')
    let form_ordering = formData.get('ordering')
    let form_image_url = formData.get('image_url')

    // Validate
    // The better way to do this is with HTML5 required attribute but I wanted to keep with the spirit
    // of the homework and use as little shortcuts as possible
    if (formData.has('name') && form_name == '') {
         document.getElementById('companions').innerHTML = `
        <h2 class="error">
            Bad Data, check name and try again
        </h2>`
    }
    else if (formData.has('seasons') && form_seasons == '') {
         document.getElementById('companions').innerHTML = `
        <h2 class="error">
            Bad Data, check seasons and try again
        </h2>`
    }
    else if (formData.has('ordering') && form_ordering == ''){
         document.getElementById('companions').innerHTML = `
        <h2 class="error">
            Bad Data, check ordering and try again
        </h2>`
    }
    else if (formData.has('image_url') && form_image_url == '') {
         document.getElementById('companions').innerHTML = `
        <h2 class="error">
            Bad Data, check image url and try again
        </h2>`
    }
    else {
        form_seasons = form_seasons.split(',');
        console.log('Updating Doctor');
        let response = await fetch(`${baseURL}/doctors/${currDocObject._id}`, {
            // Add Post Method Type
            method: "PATCH",

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
        currDocObject = await response.json(); 
        // Call function to update doctor_list with new doctor 
        await getListOfDoctors();
        await setDetailView(currDocObject);
    }
}
// Function to dynamically remove placeholder attribute
const removePlaceholderAttribute = (ev) => {
    // Remove placeholder attribute
    console.log('removing placeholder');
    console.log(`${ev.target}`);
    console.log(`${ev.target.innerText}`);
    ev.target.removeAttribute('placeholder')
}
// Function expression to reset to DetailView
const cancelEdit = async ev => {
ev.preventDefault();
setDetailView(currDocObject);
}
// Function expression to reset Doctor and Companion Panes
const resetPanes = async ev => {
    document.getElementById('doctor').innerHTML = 'Selected doctor goes here'
    document.getElementById('companions').innerHTML = "Selected doctor's companions go here"
}
// Function expression to Delete a Doctor
const deleteDoctor = async ev => {
    ev.preventDefault();
    confirmation = window.confirm("Do you really want to delete this doctor?");
    if (confirmation) {
       let response = await fetch(`${baseURL}/doctors/${currDocObject._id}`, {
           // Add DELETE Method type
           method: "DELETE"
       }) 
       status = response.status;
       console.log(status);

       await resetPanes();
       await getListOfDoctors();
    }
}
// invoke these function when the page loads:
initResetButton();
getListOfDoctors();