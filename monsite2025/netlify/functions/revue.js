exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      status: "OK",
      message: "Fonction revue active sans dépendances",
      data: []
    })
  };
};
