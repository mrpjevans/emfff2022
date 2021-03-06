import { promises as fs } from "fs"
import * as path from "path"

interface Response {
  statusCode: number,
  headers: {
    "Access-Control-Allow-Origin": string,
    "Access-Control-Allow-Credentials": Boolean,
    "Content-type"?: string
  },
  isBase64Encoded?: Boolean,
  body?: string | Buffer
}

exports.handler = async function (event) {

  switch (event.path) {
    case "/api/2022/schedule":
      return await jsonFeed(event);
    default:
      return await staticFile(event.path);
  }

}

async function staticFile(filepath) {

  const response: Response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-type": "text/html"
    },
  };

  try {

    if (filepath.includes("..")) {
      throw new Error("404");
    }

    if (filepath == '/') {
      filepath = '/index.html';
    }
    
    const ext = path.extname(filepath).toLowerCase().substring(1);

    const mimeTypes = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      jpg: "image/jpg",
      png: "image/png"
    };

    if (!mimeTypes[ext]) {
      throw new Error("404");
    }

    const fullpath = __dirname + "/static" + filepath;
    const stat = await fs.lstat(fullpath);

    if (!stat.isFile()) {
      throw new Error("404");
    }

    response.headers["Content-type"] = mimeTypes[ext];

    if (['html', 'css', 'js'].includes(ext)) {
        response.body = await fs.readFile(fullpath, "utf-8");
    } else {
        const binBuffer = await fs.readFile(fullpath);
        response.body = binBuffer.toString('base64');
        response.isBase64Encoded = true;
    }

  } catch (err) {
    if (err instanceof Error) {
      response.statusCode = parseInt(err.message);
    }
  }

  return response;

}

async function jsonFeed(event) {
  const now = new Date();
  const day = event.queryStringParameters?.day ?? now.getDay();
  const dayMap = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  const today = dayMap[day];
  const filter = event.queryStringParameters?.filter ?? "all";
  const ts = event.queryStringParameters?.time ?? now.getTime();

  const sourceFile = './schedule_prod.json';
  const raw = await (await fs.readFile(sourceFile, "utf-8")).toString();
  const json = JSON.parse(raw);
  let filteredJson = json;
  
  filteredJson.films = json.films.filter(film => film.display);

  switch (filter) {
    case "today":
      filteredJson.films = json.films.filter(film => film.showing.day == today);
      break;
    case "future":
      filteredJson.films = json.films.filter(film => film.showing.timestamp >= ts);
      break;
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-type": "application/json"
    },
    body: JSON.stringify(filteredJson)
  };
}