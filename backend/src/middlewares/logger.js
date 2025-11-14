const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    };

    // Color code based on status
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                       res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                       res.statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                       '\x1b[32m'; // Green for 2xx

    console.log(
      `${statusColor}${log.method}\x1b[0m ${log.url} - ${statusColor}${log.status}\x1b[0m - ${log.duration}`
    );
  });

  next();
};

module.exports = { requestLogger };
