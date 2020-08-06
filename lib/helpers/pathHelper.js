const apiUrl = "https://graph.microsoft.com/v1.0/";

function generateUserPath(params) {
  if (params.shared && !params.user) {
    throw new Error("params.shared is set but params.user is missing");
  }
  const userPath = params.shared ? "users/" + params.user + "/" : "me/";

  return apiUrl + userPath + "drive/items/" + params.itemId + "/children" + params.query;
}

module.exports = generateUserPath;
