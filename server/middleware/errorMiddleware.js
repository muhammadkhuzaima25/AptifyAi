export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  let message = err.message || 'Server error';
  let hint = null;

  if (
    err.name === 'MongoServerError' &&
    (err.message?.includes('bad auth') ||
      err.message?.includes('authentication failed'))
  ) {
    message = 'Database authentication failed';
    hint =
      'Atlas user credentials are wrong, or the user lacks permission on this database. ' +
      'Go to Atlas → Database Access → edit "Khuzaimaprince" → grant "readWrite" on "aptifyai" database (or "readWriteAnyDatabase"). ' +
      'Then update MONGO_URI in .env with the correct password.';
  } else if (err.name === 'MongooseServerSelectionError') {
    message = 'Cannot reach MongoDB';
    hint =
      'Check: (1) Atlas → Network Access has your IP whitelisted, ' +
      '(2) cluster is not paused, ' +
      '(3) MONGO_URI username/password are correct.';
  } else if (err.code === 11000) {
    message = 'An account with this email already exists';
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  console.error('❌ [errorHandler]', err.name, '—', err.message);

  res.status(status).json({
    message,
    hint,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
