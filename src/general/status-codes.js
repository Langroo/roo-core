
// -- STATUS CODES
const statusCodes = {
  200: {
    code: 200,
    name: 'SUCCESS',
    message: 'Resource rendered with success',
  },
  201: {
    code: 201,
    name: 'CREATED',
    message: 'Resource created with success',
  },
  206: {
    code: 206,
    name: 'PARTIAL CONTENT',
    message: 'Partial resource rendered with success',
  },
  400: {
    code: 400,
    name: 'BAD REQUEST',
    message: 'Request is invalid',
  },
  401: {
    code: 401,
    name: 'UNAUTHORIZED',
    message: 'Request can not be processed without authentication',
  },
  403: {
    code: 403,
    name: 'FORBIDDEN',
    message: 'Request can not be processed with your role',
  },
  404: {
    code: 404,
    name: 'NOT FOUND',
    message: 'Resource not found',
  },
  413: {
    code: 413,
    name: 'TOO LARGE',
    message: 'Request entity too large',
  },
  415: {
    code: 415,
    name: 'UNSUPPORTED MEDIA TYPE',
    message: 'Request media type not supported',
  },
  500: {
    code: 500,
    name: 'INTERNAL SERVER ERROR',
    message: 'Internal server error',
  },
  503: {
    code: 503,
    name: 'EXTERNAL SERVICE UNAVAILABLE',
    message: 'Service unavailable',
  },
  504: {
    code: 504,
    name: 'TIMEOUT',
    message: 'Service timeout',
  },
};

module.exports = function(code, data) {
  return {
    status: statusCodes[code] || statusCodes[500],
    data,
  };
};
