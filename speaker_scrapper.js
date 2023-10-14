const puppeteer = require("puppeteer");

// https://stackoverflow.com/questions/66953665/how-to-iterate-over-a-table-and-then-hover-on-a-particular-row-having-a-given-co
async function runSpeakerScrapper() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://2023ocpglobal.fnvirtual.app/a/schedule/");

    await page.waitForSelector(".secondGroup___VLWkc", {
      waitUntil: "load",
      timeout: 2 * 60 * 1000,
    });
    await page.click("#view-list");

    speakers = [];
    const num_rows = await page.$$eval(
      ".wrapper___oN_MK",
      (rows) => rows.length
    );
    for (let n = 1; n <= num_rows; n++) {
      try {
        console.log("row", n);
        let row_selector = `.wrapper___oN_MK:nth-child(${n})`;
        await page.waitForSelector(row_selector, { load: true });
        await page.hover(row_selector);

        let detail_button_selector =
          row_selector +
          " > div.eventCard___clBYr > div.detailsButton___EDA6j > button";
        await page.waitForSelector(detail_button_selector, {
          load: true,
        });
        await page.click(detail_button_selector);

        let speakers_selector =
          row_selector +
          " > .eventCard___clBYr.undefined > div > div > div.footer___Pch3G > div.leftCol___Ei91l > div.wrapper___zSrug.withPic___HeFTL > div";
        let num_speaker = await page.$$eval(speakers_selector, (e) => e.length);
        console.log("num_speaker", num_speaker);

        if (num_speaker == 0) continue;

        for (let n = 1; n <= num_speaker; n++) {
          let speaker_selector =
            speakers_selector + `:nth-child(${n}) > .speaker___xnJ7W`;
          await page.hover(speaker_selector);
          await page.waitForSelector(".popover___F25qi", {
            load: true,
            // timeout: 1000 * 60 * 2,
          });
          const content = await page.$eval(".popover___F25qi", (el) => {
            descriptions = Array.from(
              el.querySelectorAll(".description___mwAbr p")
            ).map((wrappers) => wrappers.textContent);

            return {
              speaker_name: el
                .querySelector(".name___QYc5b")
                ?.textContent.trim(),
              company: el.querySelector(".company___lfZVX")?.textContent.trim(),
              description: descriptions.join("\n"),
            };
          });
          speakers.push(content);
          console.log("row scrapped successfully", content);
        }
      } catch (e) {
        console.log(`${n} row error`, e);
      }
    }
    // console.log(JSON.stringify(speakers, null, 2));
    var fs = require("fs");
    fs.writeFileSync(
      "scrapped_speakers.json",
      JSON.stringify(speakers, null, 2)
    );
  } catch (e) {
    console.log("scrape failed", e);
  } finally {
    await browser?.close();
  }
}

runSpeakerScrapper();
