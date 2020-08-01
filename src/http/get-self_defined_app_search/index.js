const arc = require("@architect/functions");
const lunr = require("lunr");
const { default: axios } = require("axios");

let idx;

async function http({ queryStringParameters }) {
  let definitionMap;

  if (!queryStringParameters) {
    return {
      statusCode: 400,
    };
  }

  if (!idx) {
    const { data: definitions } = await axios.get(
      "https://deploy-preview-213--selfdefined.netlify.app/search.json"
    );

    // create a map based on title for faster retrieval in search results
    definitionMap = definitions.reduce((map, definition) => {
      map[definition.title] = definition;
      return map;
    }, {});

    // create the full text search
    idx = lunr(function () {
      this.ref("title");
      this.field("title");
      this.field("subterms");
      this.field("content");

      // load definitions into lunr index
      for (definition in definitions) {
        this.add(definitions[definition]);
      }
    });
  }

  const matches = idx.search(queryStringParameters.q);
  const results = matches.map((match) => definitionMap[match.ref]);

  return {
    body: JSON.stringify(results),
    statusCode: 200,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}

exports.handler = arc.http.async(http);
