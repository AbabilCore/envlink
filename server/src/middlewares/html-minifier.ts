import { RequestHandler } from "express";
import ENV from "@/config";

export const htmlMinifierMiddleware: RequestHandler = (req, res, next) => {
  const originalRender = res.render.bind(res);

  res.render = function (
    view: string,
    options?: Record<string, any>,
    callback?: (err: Error, html: string) => void,
  ): void {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "object" ? options : undefined;

    originalRender(view, opts, async (err: Error | null, html?: string) => {
      if (err) {
        if (cb) return cb(err, "");
        return next(err);
      }

      if (!html) {
        const error = new Error("No HTML rendered");
        if (cb) return cb(error, "");
        return next(error);
      }

      try {
        const { minify } = await import("html-minifier-terser");
        const minified = await minify(html, {
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          preserveLineBreaks: false,
          trimCustomFragments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: {
            compress: {
              dead_code: false,
              unused: false,
              drop_console: ENV.NODE_ENV === "production",
            },
            mangle: false,
          },
          minifyURLs: true,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true,
          caseSensitive: false,
          keepClosingSlash: true,
          continueOnParseError: false,
          removeAttributeQuotes: false,
          ignoreCustomFragments: [
            /<pre[\s\S]*?<\/pre>/,
            /<code[\s\S]*?<\/code>/,
          ],
        });

        if (cb) {
          cb(null as any, minified);
        } else {
          res.send(minified);
        }
      } catch (error: any) {
        if (cb) {
          cb(null as any, html);
        } else {
          res.send(html);
        }
      }
    });
  } as any;

  next();
};
