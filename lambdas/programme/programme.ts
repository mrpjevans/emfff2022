import { promises as fs } from "fs"

exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const json = await fs.readFile("./programme.json", "utf-8");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: json
    };
}