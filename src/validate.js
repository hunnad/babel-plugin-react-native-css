import ajvKeywords from 'ajv-keywords';
import Ajv from 'ajv';
import optionsSchema from './schemas/optionsSchema.json';

function validateOption() {
  const ajv = new Ajv();
  ajvKeywords(ajv);
  return ajv.compile(optionsSchema);
}

module.exports = {
  validateOption: validateOption
}
