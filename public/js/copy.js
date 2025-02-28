document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM je učitan!");
  
    // Kopiranje EAN kodova
    if (window.location.pathname == '/results') {
      console.log("Našli smo se na /results stranici!");
  
      $("#copyButton").click(function () {
        console.log("Dugme je kliknuto!");
  
        const eanList = $("#eanList code")[0];
        if (!eanList) {
          console.error("Element #eanList code nije pronađen!");
          return;
        }
  
        const range = document.createRange();
        range.selectNode(eanList);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
  
        $("#copyButton p").text("EAN kodovi su kopirani");
        setTimeout(function () {
          $("#copyButton p").text("Kopiraj EAN kodove");
        }, 2000);
      });
  
      // Resetovanje sesije i redirekcija na naslovnu stranicu
      $("#resetBtn").click(function () {
        console.log("Reset dugme je kliknuto!");
  
        // Pošaljite zahtev serveru da obriše sesiju
        fetch("/clear-session", {
          method: "POST",
        })
          .then((response) => {
            if (response.ok) {
              console.log("Sesija je obrisana!");
              // Redirekcija na naslovnu stranicu
              window.location.href = "/";
            } else {
              console.error("Došlo je do greške pri brisanju sesije.");
            }
          })
          .catch((error) => {
            console.error("Greška pri slanju zahteva:", error);
          });
      });
    }
  });