if(!navigator.maxTouchPoints) document.addEventListener("DOMContentLoaded", function () {
    //const cards = document.querySelectorAll(".card");
    const cards = projects.querySelectorAll(".card");
    console.log(cards);

    cards.forEach(card => {
        const img = card.querySelector("img"); // Get the image inside the card
        let imageUrl = img ? img.src : ""; // Extract the image source
        if(imageUrl.endsWith('-small.jpg')) imageUrl = imageUrl.substr(0, imageUrl.length - 10) + '-big.jpg';

        card.addEventListener("mouseenter", () => {
            projects.style.opacity = "0.5"; // Start fade-out effect
            setTimeout(() => {
                projects.style.backgroundImage = `url('${imageUrl}')`; // Change background image
                projects.style.opacity = "1"; // Fade back in
            }, 200);
        });

        card.addEventListener("mouseleave", () => {
            projects.style.opacity = "0.5"; // Fade out before resetting
            setTimeout(() => {
                projects.style.backgroundImage = ""; // Remove background
                projects.style.opacity = "1"; // Fade back in
            }, 200);
        });
    });
});
