import React from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import TextField from "@material-ui/core/TextField";
import { baseUrl, BASE_URI, baseOptions } from "../../../services/config";
import { SelectModel } from "../../../models/SelectModel";
import Checkbox from "@material-ui/core/Checkbox";

const fieldMap = new Set([
  "issuetype",
  "project",
  "components",
  "versions",
  "fixVersions",
  "priority",
  "issuelinks"
]);

const blockedFields = new Set(["project", "issuetype", "summary"]);

const getDefaultValue = value => {
  if (Array.isArray(value)) {
    return value.map(item => new SelectModel(item).getModel());
  } else if (value) {
    return new SelectModel(value).getModel();
  } else {
    return undefined;
  }
};

export class Field extends React.Component {
  state = {
    options: this.props.options || []
  };
  handleInputChange = newValue => {
    return newValue;
  };
  loadOptions = async (inputValue, callback) => {
    const url = `${baseUrl}/${BASE_URI}/jql/autocompletedata/suggestions?fieldName=${this.props.label}&fieldValue=${inputValue}`;
    const response = await fetch(url, { ...baseOptions });
    const json = await response.json();
    const options = json.results.map(item => new SelectModel(item).getModel());
    callback(options);
  };
  render() {
    return (
      <div className="field-container">
        {this.props.isSelect ? (
          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <label>{this.props.label}</label>
            {fieldMap.has(this.props.name) ? (
              <Select
                defaultValue={getDefaultValue(this.props.value)}
                isDisabled={this.props.isDisabled}
                cacheOptions
                options={this.props.options}
                onChange={this.props.onChange}
                isMulti={this.props.isMulti}
                name={this.props.name}
                isClearable={true}
              />
            ) : (
              <AsyncSelect
                defaultValue={getDefaultValue(this.props.value)}
                isDisabled={this.props.isDisabled}
                defaultOptions={this.props.options}
                cacheOptions
                options={this.props.options}
                loadOptions={this.loadOptions}
                onChange={this.props.onChange}
                isMulti={this.props.isMulti}
                name={this.props.name}
                onInputChange={this.handleInputChange}
                isClearable={true}
              />
            )}
          </div>
        ) : (
          <TextField
            disabled={this.props.isDisabled}
            id="outlined-full-width"
            label={this.props.label}
            style={{ margin: 8 }}
            name={this.props.name}
            placeholder={this.props.label}
            fullWidth
            onChange={this.props.onChange}
            multiline
            margin="normal"
            value={this.props.value || undefined}
            InputLabelProps={{
              shrink: true
            }}
          />
        )}
        <Checkbox
          style={{ alignSelf: "flex-end" }}
          defaultChecked
          disabled={blockedFields.has(this.props.name)}
          color="default"
          value="default"
          checked={!this.props.isDisabled}
          onChange={this.props.disableField}
          inputProps={{ "aria-label": "checkbox with default color" }}
        />
      </div>
    );
  }
}
