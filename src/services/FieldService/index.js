import { HttpBuilder } from "../httpBuilder";
import {
  baseUrl,
  baseOptions,
  BASE_URI,
  FIELDS,
  USING_FIELDS
} from "../config";
import { ItemsService } from "../ItemsService";

export class FieldService {
  constructor() {
    this.http = new HttpBuilder(baseUrl, baseOptions);
    this._fields = [];
  }
  async _pullFields() {
    const url = `${BASE_URI}/${FIELDS}`;
    const response = await this.http.get(url);

    this._fields = await response.json();

    return this._fields;
  }
  async _pullUsingFields() {
    const response = await this.http.post(USING_FIELDS);

    const json = await response.json();

    this._userPreferences = json.userPreferences.fields;

    this._userPreferences.push("issuetype");
    this._userPreferences.push("project");

    const fieldMap = new Set(json.fields.map(field => field.id));

    this._usingFields = this._fields.filter(field => fieldMap.has(field.id));

    this._usingFields = await Promise.all(
      this._usingFields.map(async field => {
        const service = new ItemsService(field);
        return { ...field, items: await service.getItemsForField() };
      })
    );
    return this._usingFields;
  }
  async initService() {
    await this._pullFields();
    await this._pullUsingFields();
    return this;
  }
  getUserPreferences() {
    return this._userPreferences;
  }
  getAllFieldsMap() {
    return this._usingFields.map(item => item.id);
  }
  getFields() {
    return this._usingFields;
  }
}
