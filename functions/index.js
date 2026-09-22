const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { onValueUpdated } = require("firebase-functions/database");
const { getDatabase } = require("firebase-admin/database");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const Papa = require("papaparse"); 

setGlobalOptions({ maxInstances: 10 });
admin.initializeApp();

exports.helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase!");
});

exports.trigger = onValueUpdated("GEE/climate-data/vegetation/", async (event) => {
  const db = getDatabase();
  const indexList = ["ndvi", "evi", "gci", "psri", "ndre", "cri1"];
  let values = {};

  for (let i of indexList) {
    const snapshot = await db.ref(`GEE/climate-data/vegetation/${i}`).get();
    if (snapshot.exists()) {
      const url = snapshot.val().url;
      logger.info(`Fetching ${i} CSV from ${url}`);
      try {
        const res = await fetch(url);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const lastRow = parsed.data[parsed.data.length - 1]; // latest row

        values[i] = parseFloat(lastRow[i.toLowerCase()] || 0);
      } catch (err) {
        logger.error(`Error fetching/parsing ${i}:`, err);
        values[i] = 0;
      }
    } else {
      values[i] = 0;
    }
  }

  function avg((val, max, min)=>{
    const val=
  });


  // Save to Firebase
  await db.ref("GEE/climate-data/vegetation/key-observations").set(keyObservations);

  logger.info("Updated Key Observations:", keyObservations);
});
