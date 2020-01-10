import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { baseUrl, BASE_URI, baseOptions } from "../../services/config";
import { ExpansionTemplate } from "./ExpansionTemplate";
import Button from "@material-ui/core/Button";
import ArrowRight from "@material-ui/icons/ArrowRightAlt";
import Checkbox from "@material-ui/core/Checkbox";

const toRequestModel = item => {
  let { value, key, name, id } = item;
  const result = {};
  if (id) {
    result.id = id;
  }
  if (name || value) {
    result.name = name || value;
  }
  if (key) {
    result.key = key;
  }
  if (value) {
    result.value = value
      .split('"')
      .join("")
      .trim();
  }
  return result;
};

const getCurrentTicket = () => {
  let ticketIsOpen = document.location.pathname.match(/browse/);

  let key = null;
  if (ticketIsOpen) {
    key = document.location.pathname.split("/")[2];
  } else {
    key = document.location.pathname.split("/")[4];
  }
  return key;
};

const pullTicketData = async key => {
  const data = await fetch(`${baseUrl}/rest/api/2/issue/${key}`);
  const ticketData = await data.json();
  return ticketData;
};

const postTicket = async body => {
  const url = `${baseUrl}/${BASE_URI}/issue`;
  const response = await fetch(url, {
    ...baseOptions,
    method: "POST",
    body: JSON.stringify(body)
  });
  const json = await response.json();
  console.log(json);
  return json;
};

const createIssueLink = async body => {
  try {
    const url = `${baseUrl}/${BASE_URI}/issueLink`;
    const response = await fetch(url, {
      ...baseOptions,
      method: "POST",
      body: JSON.stringify(body)
    });
    return response;
  } catch (e) {
    console.error(e);
  }
};

export class Templates extends React.Component {
  state = {
    templates: JSON.parse(localStorage.getItem("templates")) || [],
    expanded: false,
    chosenTemplates: []
  };

  deleteTemplate = name => event => {
    const templates = this.state.templates;

    this.state.templates.forEach((item, index) => {
      if (item.name === name) {
        templates.splice(index, 1);
      }
    });
    this.setState({ templates: [...templates] });
    localStorage.setItem("templates", JSON.stringify(templates));
  };

  handleChange = template => (event, isExpanded) => {
    this.setState({ expanded: isExpanded ? template : false });
  };

  sendTicket = async event => {
    const ticket = this.state.ticketData.fields;

    for (let template of this.state.templates) {
      if (!this.state.chosenTemplates.includes(template.name)) {
        continue;
      } else {
        const issue = template.issue;
        const issueData = {};
        const result = {};

        for (let name in issue) {
          if (name !== "attachment" && name !== "issuelinks")
            issueData[name] = issue[name].value;
        }

        for (let name in issueData) {
          if (issueData[name] === null && !ticket[name]) {
            continue;
          }
          if (issueData[name] === null && ticket[name]) {
            if (
              issue[name].schema.custom &&
              issue[name].schema.custom.match("io.tempo")
            ) {
              result[name] = ticket[name].id || ticket[name].value;
            } else {
              result[name] = ticket[name];
            }

            continue;
          }
          if (
            issue[name].schema.type === "string" ||
            issue[name].label === "Epic Link"
          ) {
            result[name] = issueData[name].value || issueData[name];
            continue;
          }
          if (issue[name].schema.type === "array") {
            if (issue[name].schema.items === "string") {
              result[name] = issueData[name].map(item => item.value);
            } else {
              result[name] = issueData[name].map(item => toRequestModel(item));
            }
            continue;
          } else {
            if (
              issue[name].schema.custom &&
              issue[name].schema.custom.match("io.tempo")
            ) {
              result[name] = issueData[name].id || issueData[name].value;
            } else result[name] = toRequestModel(issueData[name]);
          }
        }

        const createdTicket = await postTicket({ fields: result });

        window.open(`${baseUrl}/browse/${createdTicket.key}`);
        if (issue.issuelinks) {
          let inwardIssue = {};
          let outwardIssue = {};

          if (issue.issuelinks.value.inward) {
            inwardIssue = { key: createdTicket.key };
            outwardIssue = { key: this.state.currentTicket };
          } else {
            inwardIssue = { key: this.state.currentTicket };
            outwardIssue = { key: createdTicket.key };
          }
          const body = {
            inwardIssue,
            outwardIssue,
            type: { name: issue.issuelinks.value.name }
          };
          await createIssueLink(body);
        }
      }
    }
  };
  handleCheckBox = name => event => {
    const chosenTemplates = this.state.chosenTemplates;

    if (event.currentTarget.checked) {
      chosenTemplates.push(name);
    } else {
      for (let i = 0; i < chosenTemplates.length; i++) {
        if (chosenTemplates[i] === name) {
          chosenTemplates.splice(i, 1);
          break;
        }
      }
    }

    this.setState({ chosenTemplates });
  };

  handleEdit = template => event => {
    localStorage.setItem("editingTemplate", JSON.stringify(template));
    this.props.handleRedirect(event, 1);
  };

  async componentWillMount() {
    const html = document.querySelector("html");
    const ticketData = await pullTicketData(getCurrentTicket());
    this.setState({ currentTicket: getCurrentTicket(), ticketData });
    html.addEventListener("click", async e => {
      if (getCurrentTicket() !== this.state.currentTicket) {
        const ticketData = await pullTicketData(getCurrentTicket());
        this.setState({ currentTicket: getCurrentTicket(), ticketData });
      }
    });
  }
  render() {
    return (
      <div style={{ minHeight: "60vh" }}>
        <Paper>
          <Typography component="p">
            Current ticket: <b>{this.state.currentTicket}</b>
          </Typography>
        </Paper>
        <div style={{ marginTop: "5px" }}>
          {this.state.templates.map(template => (
            <div
              style={{
                display: "flex",
                margin: "3px 0px",
                alignItems: "center"
              }}
            >
              <Checkbox
                checked={this.state.chosenTemplates.includes(template.name)}
                onChange={this.handleCheckBox(template.name)}
                value="primary"
                inputProps={{ "aria-label": "primary checkbox" }}
              />
              <ExpansionTemplate
                handleEdit={this.handleEdit}
                template={template}
                onChange={this.handleChange}
                expanded={this.state.expanded}
                deleteTemplate={this.deleteTemplate}
                ticket={this.state.ticketData || {}}
              />
            </div>
          ))}
        </div>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowRight />}
          onClick={this.sendTicket}
          disabled={
            !this.state.ticketData || !this.state.chosenTemplates.length
          }
        >
          Send
        </Button>
      </div>
    );
  }
}
