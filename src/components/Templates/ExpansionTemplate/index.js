import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { Paper } from "@material-ui/core";

const prepareData = value => {
  if (typeof value === "string") {
    return value;
  } else if (Array.isArray(value) && value.length) {
    const result = value.reduce(
      (acc, item) =>
        `${acc}${item.displayName || item.name || item.value || item}, `,
      ""
    );
    return result.slice(0, result.length - 2);
  } else {
    if (value.displayName) {
      return value.displayName
        .split("<b>")
        .join("")
        .split("</b>")
        .join("");
    }
    return value.value || value.name;
  }
};

export class ExpansionTemplate extends React.Component {
  renderTemplateData = ticket => {
    if (ticket) {
      const fieldsList = [];
      for (let key in ticket) {
        if (ticket[key] && ticket[key].value) {
          fieldsList.push(
            <p>
              <b>{ticket[key].label}:</b> {prepareData(ticket[key].value || "")}
            </p>
          );
        }
      }
      return fieldsList;
    }
  };
  renderTicketData = (ticket, template) => {
    if (ticket && template) {
      const fieldList = [];
      for (let key in ticket) {
        if (
          ticket[key] &&
          key !== "attachment" &&
          key !== "issuelinks" &&
          key !== "description" &&
          template[key] &&
          !template[key].value
        ) {
          if (Array.isArray(ticket[key]) && !ticket[key].length) {
            continue;
          }
          fieldList.push(
            <p>
              <b>{template[key].label}:</b> {prepareData(ticket[key])}
            </p>
          );
        }
      }
      return fieldList;
    }
  };
  render() {
    return (
      <ExpansionPanel
        expanded={this.props.expanded === this.props.template.name}
        onChange={this.props.onChange(this.props.template.name)}
        style={{ width: "100%" }}
      >
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography variant="h5">{this.props.template.name}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography style={{ width: "100%" }}>
            <Paper style={{ padding: "5px", background: "#e0e4f7" }}>
              <Typography variant="h6">
                <b>From template: </b>
              </Typography>
              <Typography>
                {this.renderTemplateData(this.props.template.issue)}
              </Typography>
            </Paper>

            <Paper style={{ padding: "5px" }}>
              <Typography variant="h6">
                <b>From current ticket: </b>
              </Typography>
              <Typography>
                {this.renderTicketData(
                  this.props.ticket.fields || {},
                  this.props.template.issue
                )}
              </Typography>
            </Paper>

            <br />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={this.props.handleEdit(this.props.template)}
              >
                Change
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={this.props.deleteTemplate(this.props.template.name)}
              >
                Delete
              </Button>
            </div>
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
