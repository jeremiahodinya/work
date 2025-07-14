function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    navLinks.classList.toggle("active");
}

document.getElementById('landForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    // Get form values
    let ownerName = document.getElementById('ownerName').value;
    let landSize = document.getElementById('landSize').value;
    let location = document.getElementById('location').value;
    let price = document.getElementById('price').value;
    let description = document.getElementById('description').value;

    // Display the submitted land details
    let postContainer = document.getElementById('postContainer');
    let newPost = document.createElement('div');
    newPost.innerHTML = `
        <h3>${ownerName}'s Land</h3>
        <p><strong>Size:</strong> ${landSize} acres</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Price:</strong> $${price}</p>
        <p><strong>Description:</strong> ${description}</p>
        <hr>
    `;
    postContainer.appendChild(newPost);

    // Clear the form
    document.getElementById('landForm').reset();
});
