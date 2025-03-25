document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.querySelectorAll(".learnMoreBtn");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            let details = this.closest(".car").querySelector(".details");

            if (details.style.display === "none" || details.style.display === "") {
                details.style.display = "block";
                this.innerHTML = "<span>Show Less</span>";
            } else {
                details.style.display = "none";
                this.innerHTML = "<span>Learn More</span>";
            }
        });
    });
});
