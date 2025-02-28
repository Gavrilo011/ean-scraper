const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Omogući CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfiguracija session-a
app.use(
  session({
    secret: "your-secret-key", // Promenite ovo u neki sigurniji ključ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Postavite na true ako koristite HTTPS
  })
);

// Serve Bootstrap
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

// Postavljanje 'ejs' kao view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Funkcija za skrejpovanje jedne stranice
const scrapePage = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const eanCodes = new Set();
    $("section.grid a[href]").each((index, element) => {
      const href = $(element).attr("href");
      const ean = href.split("-").pop();
      if (ean) {
        eanCodes.add(ean);
      }
    });

    return Array.from(eanCodes);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
};

// Funkcija za pronalaženje linkova za paginaciju
const getPaginationLinks = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const paginationLinks = [];
    const buttons = $(".mx-auto.mt-16.flex.w-fit.gap-2.col-span-full button");

    buttons.each((index, element) => {
      if ($(element).attr("aria-label") === "Sledeća strana" && !$(element).attr("disabled")) {
        const href = $(element).attr("href");
        if (href) {
          const fullUrl = new URL(href, url).toString();
          paginationLinks.push(fullUrl);
        }
      }
      if ($(element).text().match(/\d+/)) {
        const pageNum = $(element).text();
        paginationLinks.push(`${url}&page=${pageNum}`);
      }
    });

    return [...new Set(paginationLinks)];
  } catch (error) {
    console.error(`Error fetching pagination links from ${url}:`, error);
    return [];
  }
};

// Scrape route
app.post("/scrape", async (req, res) => {
  console.log("Zahtev primljen:", req.body);
  const { url } = req.body;
  console.log("URL:", url);

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    let eanCodes = new Set();

    // Pronađi sve linkove za paginaciju
    let paginationLinks = await getPaginationLinks(url);

    // Prolazimo kroz sve stranice za paginaciju i skrejpovanje
    for (const link of paginationLinks) {
      const pageEANs = await scrapePage(link);
      pageEANs.forEach((ean) => eanCodes.add(ean));
    }

    console.log("Ukupno EAN kodova:", eanCodes.size);
    console.log("EAN kodovi:", Array.from(eanCodes));

    // Čuvamo EAN kodove u session
    req.session.eanCodes = Array.from(eanCodes);

    // Redirekcija na stranicu sa rezultatima
    res.redirect("/results");
  } catch (error) {
    console.error("Error scraping the page:", error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
});

// Ruta za brisanje sesije
app.post("/clear-session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Greška pri brisanju sesije:", err);
      return res.status(500).send("Došlo je do greške pri brisanju sesije.");
    }
    console.log("Sesija je obrisana!");
    res.sendStatus(200); // Pošaljemo odgovor da je sesija obrisana
  });
});

// Nova ruta za prikazivanje rezultata
app.get("/results", (req, res) => {
  // Dobijamo EAN kodove iz session-a
  const eanCodes = req.session.eanCodes || [];
  res.render("results", { eanCodes: eanCodes });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});