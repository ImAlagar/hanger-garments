import React from 'react'

const generateBreadcrumb = () => {
  const path = location.pathname
    .replace("/dashboard", "")  // remove the base
    .split("/")
    .filter(Boolean);          // remove empty

  if (path.length === 0) return ["Dashboard"];

  // Convert slug → Title Case
  const format = (str) =>
    str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return ["Dashboard", ...path.map(format)];
};


export default generateBreadcrumb