import fasteerExceptions, { createExceptionHandler } from "@fasteerjs/exceptions";
import type { FasteerInstance } from "@fasteerjs/fasteer";

export const exceptionHandler = (app: FasteerInstance) => {
  const isDev = process.env.NODE_ENV === "development";

  app.fastify.setErrorHandler(
    createExceptionHandler({
      errorHandler: (err, req, res) => {
        // TODO: logging

        if (err.validation) {
          // Validation error
          return res.status(400).send({
            success: false,
            error: {
              kind: "validation",
              message: "Invalid Request",
            },
          });
        }

        if (isDev) {
          app.logger.error(`An error occurred while handling the ${req.method} ${req.url} route (Status Code: ${err.statusCode}):`);
          app.logger.error(err.stack);
        }

        res.send({
          success: false,
          error: {
            kind: "internal",
            message: "Internal Server Error",
            ...(isDev ? { stack: err.stack } : {}),
          },
        });
      },
    }),
  );

  app.fastify.setNotFoundHandler((req, res) => {
    const acceptedType = req.accepts().type(["json", "html", "text"]);

    // Given what fucked up return value can type be, this first checks
    // whether type is an array, which it shouldn't as supported accept types
    // have been specified, if it is though it uses the first match, otherwise it's
    // a string, unless it's `false` (if neither of the allowed types are in `Accept`)
    // in which case it falls back to json.
    // Also it would definitely easier if it returned the god damn MIME type,
    // but no, fuck that, let's return `html`, etc.. instead, because fuck you WRITE MORE CODE instead.
    // Why are some developers so fucking stupid and design a library that makes it in the end harder.
    // I think that parsing the stupid `Accept` header might actually be fucking easier than using this stupid
    // fucking abstraction. Needless to say, I'm not a fan of the `accepts` library.
    const type = acceptedType ? (Array.isArray(acceptedType) ? acceptedType[0] : acceptedType) : "json";

    const responses = {
      text: "404 Not Found",
      json: {
        success: false,
        error: {
          kind: "user_input",
          message: "Not Found",
        },
      },
    };

    // Please refer to above comment.
    const mimeTypes = {
      json: "application/json",
      text: "text/plain",
    };

    res.status(404);

    if (type === "html") {
      return res.view("404");
    }

    res.type(mimeTypes[type] ?? mimeTypes["text"]).send(responses[type] ?? responses["text"]);
  });
};
