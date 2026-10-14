import type { Application, Response } from "express";

interface RenderOptions {
  title: string;
  description: string;
  canonicalPath: string;
  page: string;
  status?: number;
  [key: string]: any;
}

export const renderWithLayout = (
  app: Application,
  res: Response,
  view: string,
  options: RenderOptions,
  callback?: (err: Error | null) => void,
): void => {
  const { title, description, canonicalPath, page, status, ...viewLocals } =
    options;

  if (status) {
    res.status(status);
  }

  app.render(
    view,
    {
      ...res.locals,
      page,
      description,
      canonicalPath,
      ...viewLocals,
    },
    (err, bodyHtml) => {
      if (err) {
        if (callback) return callback(err);
        throw err;
      }

      res.render(
        "main",
        {
          title,
          description,
          canonicalPath,
          page,
          body: bodyHtml,
        },
        (renderErr, html) => {
          if (renderErr) {
            if (callback) return callback(renderErr);
            throw renderErr;
          }

          // Actually send the response
          if (!res.headersSent) {
            res.send(html);
          }

          if (callback) {
            callback(null);
          }
        },
      );
    },
  );
};
