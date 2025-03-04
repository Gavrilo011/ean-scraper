document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM je učitan!");

  // Inicijalizacija particles.js
  particlesJS.load("particles-js", "/js/particles-config.json", function () {
    console.log("Particles.js je učitan!");
  });

  // Funkcija za prikazivanje preloader-a
  function showPreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.display = "flex";
    }
  }

  // Funkcija za sakrivanje preloader-a
  function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.display = "none";
    }
  }

  // Slanje forme
  document.getElementById("scrapeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted!");

    const url = document.getElementById("urlInput").value;
    console.log("URL entered:", url);

    // Prikazivanje preloader-a
    showPreloader();

    try {
      console.log("Sending fetch request...");
      const response = await fetch("/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `url=${encodeURIComponent(url)}`,
      });

      console.log("Response received:", response);
      if (response.ok) {
        // Redirekcija na stranicu sa rezultatima
        window.location.href = "/results";
      } else {
        console.log("Došlo je do greške pri skrejpovanju.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // Sakrivanje preloader-a
      hidePreloader();
    }
  });
});