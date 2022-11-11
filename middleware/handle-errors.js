// 400 - BAD CLIENT REQUEST
module.exports = (error, request, response, next) => {
  console.error("Error message:")
  console.error(error.message || error)

  if (error.name === 'CastError')
    return response.status(400).send({
      title: 'Wrong ID Format',
      message: error.message
    })

  if (error.name === 'ValidationError') {
    return response.status(400).json({
      title: 'Validation Error',
      issues: Object.keys(error.errors).map(fieldKey => ({
        path: error.errors[fieldKey].path,
        issue: error.errors[fieldKey].name,
        value: error.errors[fieldKey].value,
        message: error.errors[fieldKey].message,
      }))
    })
  }


  return response.status(500).send({ error })
}
