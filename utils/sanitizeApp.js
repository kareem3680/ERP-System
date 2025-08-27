const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return DOMPurify.sanitize(input);
  } else if (typeof input === "object" && input !== null) {
    for (const key in input) {
      input[key] = sanitizeInput(input[key]);
    }
    return input;
  }
  return input;
};

module.exports = sanitizeInput;
