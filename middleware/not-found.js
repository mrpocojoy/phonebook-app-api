// 404 - UNKNOWN ENDPOINT
module.exports = (request, response) => {
  response.status(404).send({ error: 'HTTP404 - Unknown Endpoint.' })
}