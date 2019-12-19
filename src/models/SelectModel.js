import { XmlEntities } from "html-entities";

const tities = new XmlEntities();

export class SelectModel {
  constructor(item) {
    this.value = item;
    this.label = item.name || item.key || tities.decode(item.value);
    if (item.displayName) {
      this.label = tities.decode(
        item.displayName
          .split("<b>")
          .join("")
          .split("</b>")
          .join("")
      );
    }
  }
  getModel() {
    return { ...this };
  }
}
