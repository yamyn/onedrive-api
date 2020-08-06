const request = require("request-promise");

/**
 * @function listChildren
 * @description List childrens
 *
 * @param {Object} params
 * @param {String} params.accessToken OneDrive access token
 * @param {String} [params.uri] uri to item.list
 *
 * @return {Array} object of children items
 */

function listChildren({ uri, accessToken }) {
  const options = {
    method: "GET",
    uri,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    json: true,
  };

  return request(options);
}

module.exports = listChildren;
