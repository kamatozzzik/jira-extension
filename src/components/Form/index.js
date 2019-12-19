import React from "react";
import { Field } from "./Field";
import { DefaultService } from "../../services/DefaultService";
import { FieldService } from "../../services/FieldService";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const getTemplate = () => {
  const template = JSON.parse(localStorage.getItem("editingTemplate"));
  return template || null;
};

export class Form extends React.Component {
  constructor(props) {
    super(props);
    this.defaultService = new DefaultService();
    this.fieldService = new FieldService();
  }
  state = {
    projects: [],
    isCustom: JSON.parse(localStorage.getItem("isCustom") || false),
    currentFields: [],
    fields: [],
    isError: false,
    issue: getTemplate() ? getTemplate().issue : {},
    template: getTemplate(),
    name: getTemplate() ? getTemplate().name : ""
  };

  handleProjectChange = label => async (item, event) => {
    if (item) {
      const name = event.name;
      const issue = this.state.issue || {};
      issue[name] = { value: item.value, label, schema: { type: "any" } };

      const details = await this.defaultService.getProjectDetails(
        item.value.id
      );
      this.setState({ issue, ...details });
    }
  };
  handleItemsChange = (label, schema) => (item, event) => {
    const issue = this.state.issue || {};
    if (label === "Linked Issues") {
      if (!item) {
        issue[event.name] = { value: item, label, schema };
      } else if (item.label === item.value.inward) {
        issue[event.name] = {
          value: { ...item.value, inward: true },
          label,
          schema
        };
      } else {
        issue[event.name] = {
          value: { ...item.value, outward: true },
          label,
          schema
        };
      }
    } else {
      if (!item) {
        issue[event.name] = { value: item, label, schema };
      } else if (item.target) {
        issue[item.target.name] = { value: item.target.value, label, schema };
      } else {
        issue[event.name] = {
          value: item.value || item.map(item => item.value),
          label,
          schema
        };
      }
    }
    this.setState({ issue });
  };
  filterFields = name => event => {
    const checked = event.currentTarget.checked;
    const currentFields = checked
      ? this.state.preferences
      : this.state.fieldMap;

    const issue = {};

    currentFields.forEach(field => {
      issue[field] = this.state.issue[field] || null;
    });

    this.setState({
      [name]: checked,
      currentFields,
      issue
    });

    localStorage.setItem(
      "isCustom",
      JSON.stringify(event.currentTarget.checked)
    );
  };
  setName = name => event => {
    this.setState({ [name]: event.currentTarget.value });
  };
  addTemplate = () => {
    const templates = JSON.parse(localStorage.getItem("templates")) || [];

    for (let item of templates) {
      if (item.name === this.state.name) {
        this.setState({
          validationMessage: "This name is already taken",
          isError: true
        });
        return;
      }
    }
    if (!this.state.name) {
      this.setState({ validationMessage: "Name is required", isError: true });
      return;
    } else {
      templates.push({
        name: this.state.name,
        issue: this.state.issue
      });
      this.setState({ validationMessage: "", isError: false, name: "" });
      localStorage.setItem("templates", JSON.stringify(templates));
    }
  };

  disableField = field => event => {
    const issue = this.state.issue;
    if (!event.target.checked) {
      delete issue[field.id];
    } else {
      issue[field.id] = {
        label: field.name,
        value: null,
        schema: field.schema
      };
    }
    this.setState({ issue });
  };

  editTemplate = event => {
    const templates = JSON.parse(localStorage.getItem("templates")) || [];

    for (let i = 0; i < templates.length; i++) {
      if (templates[i].name === this.state.template.name) {
        templates.splice(i, 1, {
          name: this.state.name,
          issue: this.state.issue
        });
        break;
      }
    }
    localStorage.setItem("templates", JSON.stringify(templates));
    localStorage.removeItem("editingTemplate");
    this.props.handleRedirect(event, 0);
  };
  ////////////////////////////////////////////////////////////////////////////////////////////

  async componentDidMount() {
    const fieldService = await this.fieldService.initService();
    const projects = await this.defaultService.getProjects();
    const issue = this.state.issue;

    const currentFields = this.state.isCustom
      ? fieldService.getUserPreferences()
      : fieldService.getAllFieldsMap();

    const fields = fieldService.getFields();

    if (!this.state.template) {
      fields.forEach(field => {
        if (currentFields.includes(field.id)) {
          issue[field.id] = {
            label: field.name,
            value: null,
            schema: field.schema
          };
        }
      });
    }

    this.setState({
      projects: projects.map(item => {
        return { ...item, schema: { type: "any" } };
      }),
      fields,
      fieldMap: fieldService.getAllFieldsMap(),
      preferences: fieldService.getUserPreferences(),
      currentFields,
      issue
    });
  }
  render() {
    return (
      <>
        <form style={{ marginBottom: "33vh" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.isCustom}
                onChange={this.filterFields("isCustom")}
                value="isCustom"
                inputProps={{
                  "aria-label": "primary checkbox"
                }}
              />
            }
            label="Custom"
          />
          {this.state.currentFields.includes("project") && (
            <Field
              onChange={this.handleProjectChange("Project")}
              options={this.state.projects}
              value={
                this.state.issue["project"] && this.state.issue["project"].value
              }
              label={"Project"}
              name={"project"}
              isSelect={true}
            />
          )}

          {this.state.fields.length ? (
            ""
          ) : (
            <div className="spinner-container">
              <CircularProgress color="secondary" />
            </div>
          )}

          {this.state.fields.map(field => {
            let isMulti =
              field.schema.type === "array" && !(field.id === "issuelinks");

            let isSelect =
              field.schema.type !== "string" && field.schema.type !== "number";
            if (
              this.state.currentFields.includes(field.id) &&
              field.id !== "project" &&
              field.id !== "attachment"
            ) {
              return (
                <Field
                  onChange={this.handleItemsChange(field.name, field.schema)}
                  label={field.name}
                  name={field.id}
                  options={this.state[field.id] || field.items || []}
                  value={
                    this.state.issue[field.id] &&
                    this.state.issue[field.id].value
                  }
                  isSelect={isSelect}
                  isMulti={isMulti}
                  disableField={this.disableField(field)}
                  isDisabled={!this.state.issue[field.id]}
                />
              );
            } else {
              return "";
            }
          })}
        </form>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
            position: "sticky",
            bottom: "0",
            paddingBottom: "10px",
            zIndex: "100",
            background: "#ffffff"
          }}
        >
          <TextField
            error={this.state.isError}
            id="outlined-full-width"
            label="Template name"
            style={{ margin: 8 }}
            placeholder="Type here..."
            helperText={this.state.validationMessage}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            value={this.state.name}
            onChange={this.setName("name")}
          />
          {this.state.template ? (
            <Fab
              color="secondary"
              aria-label="edit"
              onClick={this.editTemplate}
            >
              <EditIcon />
            </Fab>
          ) : (
            <Fab color="primary" aria-label="add" onClick={this.addTemplate}>
              <AddIcon />
            </Fab>
          )}
        </div>
      </>
    );
  }
}
