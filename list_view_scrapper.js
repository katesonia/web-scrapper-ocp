const puppeteer = require("puppeteer");

async function runListViewScrapper() {
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
    await page.waitForSelector(".eventList___bjqDo", {
      waitUntil: "load",
      timeout: 2 * 60 * 1000,
    });

    const result = await page.evaluate(() => {
      const events = Array.from(
        document.querySelectorAll(".wrapper___oN_MK")
      ).map((eventWrapper) => {
        const eventTime = eventWrapper.querySelector(
          ".locationWrapper___Sf7Jb"
        )?.textContent;
        const eventTitle =
          eventWrapper.querySelector(".title___rr1Kz")?.textContent;
        const speakers = Array.from(
          eventWrapper.querySelectorAll(".name___OW76B")
        ).map((element) => element.textContent);

        const eventIdElement = eventWrapper.querySelector(".wrapper___oN_MK");
        const eventId = eventIdElement?.id;

        const details = Array.from(
          eventWrapper.querySelectorAll(".detailWrapper___qjCKa > span > p")
        ).map((element) => element.textContent);

        return {
          event_time: eventTime,
          event_title: eventTitle,
          event_detials: details.join(""),
          event_speaker_list: speakers.join("\n"),
          event_id: eventId,
        };
      });

      return events;
    });

    // console.log(JSON.stringify(result, null, 2));
    var fs = require("fs");
    fs.writeFileSync(
      "scrapped_list_view_data.json",
      JSON.stringify(result, null, 2)
    );
  } catch (e) {
    console.log("scrape failed", e);
  } finally {
    await browser?.close();
  }
}

runListViewScrapper();
