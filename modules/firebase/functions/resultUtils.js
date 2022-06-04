exports.handleResult = promise =>
  promise
    .then(result => ({ result }))
    .catch(error => {
      console.error(error);
      return {
        error: {
          code: error.code || 'flight-app/custom',
          message: error.message,
        },
      };
    });
