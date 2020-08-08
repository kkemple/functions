const arc = require("@architect/functions");
const lunr = require("lunr");
const { default: axios } = require("axios");

async function http({ queryStringParameters }) {
  try {
    if (!queryStringParameters) {
      return {
        statusCode: 400,
      };
    }

    const { data: definitions } = await axios.get(
      "https://deploy-preview-213--selfdefined.netlify.app/search-data.json"
    );

    // create a map based on title for faster retrieval in search results
    const definitionMap = definitions.reduce((map, definition) => {
      map[definition.title] = definition;
      return map;
    }, {});

    // create the full text search
    const idx = lunr(function () {
      this.ref("title");
      this.field("title");
      this.field("subterms");
      this.field("content");

      // load definitions into lunr index
      for (definition in definitions) {
        this.add(definitions[definition]);
      }
    });

    const matches = idx.search(queryStringParameters.q);
    const results = matches.map((match) => definitionMap[match.ref]);

    return {
      body: JSON.stringify(results),
      statusCode: 200,
      cors: true,
    };
  } catch (error) {
    console.log(error);
  }
}

exports.handler = arc.http.async(http);
