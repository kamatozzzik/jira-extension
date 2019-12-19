import { HttpBuilder } from "../httpBuilder";
import { baseUrl, baseOptions, BASE_URI, PROJECTS } from "../config";
import { SelectModel } from "../../models/SelectModel";

export class DefaultService {
  constructor() {
    this.http = new HttpBuilder(baseUrl, baseOptions);
    this.projects = [];
  }
  async getProjects() {
    const url = `${BASE_URI}/${PROJECTS}`;
    const response = await this.http.get(url);

    const projects = await response.json();
    this.projects = projects;
    return projects.map(item => new SelectModel(item).getModel());
  }
  async getProjectDetails(projectId) {
    const url = `${BASE_URI}/${PROJECTS}/${projectId}`;
    const response = await this.http.get(url);

    const project = await response.json();

    const { components, issueTypes, versions } = project;
    return {
      components: components.map(item => new SelectModel(item).getModel()),
      issuetype: issueTypes.map(item => new SelectModel(item).getModel()),
      versions: versions.map(item => new SelectModel(item).getModel()),
      fixVersions: versions.map(item => new SelectModel(item).getModel())
    };
  }
}
