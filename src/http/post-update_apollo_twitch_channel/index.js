const axios = require("axios");
const arc = require("@architect/functions");
const parseBody = arc.http.helpers.bodyParser;

exports.handler = async function http(req) {
  const userURL = "https://api.twitch.tv/helix/users";
  const updateChannelURL = "https://api.twitch.tv/v5/channels/";
  const body = parseBody(req.body);

  try {
    const { data: userData } = await axios.get(userURL, {
      headers: {
        authorization: `Bearer ${process.env.TWITCH_OAUTH_TOKEN_HELIX}`,
      },
    });

    const { data: mutationData } = await axios.put(
      `${updateChannelURL}${userData.data[0].id}`,
      {
        channel: {
          status: body.status,
        },
      },
      {
        headers: {
          authorization: `OAuth ${process.env.TWITCH_OAUTH_TOKEN_KRAKEN}`,
          "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
      }
    );
  } catch (error) {
    console.log(error.message);
    return {
      statusCode: 400,
      statusText: error.message,
    };
  }

  return {
    statusCode: 200,
  };
};
