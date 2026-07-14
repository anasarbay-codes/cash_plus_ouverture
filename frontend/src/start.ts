import { createStart, createMiddleware } from "@tanstack/react-start";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    const html = `<!DOCTYPE html><html><head><title>Internal Server Error</title></head><body><h1>500 - Internal Server Error</h1><p>Something went wrong on our end.</p></body></html>`;
    return new Response(html, {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
