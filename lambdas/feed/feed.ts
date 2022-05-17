import { promises as fs } from "fs"

exports.handler = async function(event) {
    const now = new Date();
    const day = event.queryStringParameters?.day ?? now.getDay();
    const dayMap = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    const today = dayMap[day];
    const filter = event.queryStringParameters?.filter ?? "all";
    const ts = event.queryStringParameters?.time ?? now.getTime();

    const raw = await (await fs.readFile(`./feed.json`, "utf-8")).toString();
    const json = JSON.parse(raw);
    let filteredJson = json;

    switch(filter) {
      case "today":
        filteredJson.films = json.films.filter(film => film.showing.day == today);
        break;
      case "future":
        filteredJson.films = json.films.filter(film => film.showing.timestamp >= ts);
        break;
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filteredJson)
    };
}