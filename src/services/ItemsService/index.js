import { HttpBuilder } from "../httpBuilder";
import { baseOptions, baseUrl } from "../config";
import { getUrlForField } from "../getUrlForField";
import { SelectModel } from "../../models/SelectModel";

export class ItemsService {
  constructor(field) {
    this.field = field;
    this.isText =
      field.schema.type === "string" || field.schema.type === "number";

    this.http = new HttpBuilder(baseUrl, baseOptions);
  }
  async getItemsForField() {
    if (!this.isText) {
      const url = getUrlForField(this.field);
      const response = await this.http.get(url);

      const json = await response.json();

      if (json.issueLinkTypes) {
        const items = [];
        json.issueLinkTypes.forEach(item => {
          if (item.outward !== item.inward) {
            items.push({
              label: item.outward,
              value: { outward: true, ...item }
            });
            items.push({
              label: item.inward,
              value: { inward: true, ...item }
            });
          } else {
            items.push({ label: item.inward, value: item });
          }
        });
        return items;
      }
      if (json.results) {
        return json.results.map(item => new SelectModel(item).getModel());
      } else {
        return json.map(item => new SelectModel(item).getModel());
      }
    } else {
      return null;
    }
  }
}
