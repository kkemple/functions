const arc = require("@architect/functions");

async function http() {
  try {
    return {
      body: "lol, ok.",
      statusCode: 200,
      cors: true,
    };
  } catch (error) {
    console.log(error);
  }
}

exports.handler = arc.http.async(http);
