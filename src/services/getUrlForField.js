const defaultFields = new Map([
  ["priority", "rest/api/2/priority"],
  ["issuelinks", "rest/api/2/issueLinkType"]
]);
export const getUrlForField = field => {
  if (defaultFields.has(field.id)) {
    return defaultFields.get(field.id);
  } else {
    return `rest/api/2/jql/autocompletedata/suggestions?fieldName=${
      field.custom ? field.name : field.id
    }`;
  }
};
