export class HttpBuilder {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
  }
  get(path) {
    return fetch(`${this.url}/${path}`, { ...this.options });
  }
  post(path, body) {
    let bodyInfo = "";
    if (typeof body === "string") {
      bodyInfo = body;
    } else {
      bodyInfo = JSON.stringify(body);
    }
    return fetch(`${this.url}/${path}`, {
      ...this.options,
      method: "POST",
      body: bodyInfo
    });
  }
}
