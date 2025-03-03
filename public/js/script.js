document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM je učitan!");

  // Inicijalizacija particles.js
  particlesJS.load("particles-js", "/js/particles-config.json", function () {
    console.log("Particles.js je učitan!");
  });

  // Ostali JavaScript kod (npr. za slanje forme)
  document.getElementById("scrapeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted!");

    const url = document.getElementById("urlInput").value;
    console.log("URL entered:", url); // Dodato za debagovanje

    try {
      console.log("Sending fetch request...");
      const response = await fetch("/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `url=${encodeURIComponent(url)}`,
      });

      console.log("Response received:", response); // Dodato za debagovanje
      if (response.ok) {
        // Redirekcija na stranicu sa rezultatima
        window.location.href = "/results";
      } else {
        console.log("Došlo je do greške pri skrejpovanju.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});