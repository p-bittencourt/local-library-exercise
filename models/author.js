const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual('name').get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We eant to make sure we handle the exception by returning an empty string for that case
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
  // we don't use an arrow function as we'll need the 'this' object
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('lifespan').get(function () {
  let birth = this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
    : '';
  let death = this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    : '';

  if (birth && death) {
    return `${birth} - ${death}`;
  } else if (birth) {
    return birth;
  } else {
    return '';
  }
});

AuthorSchema.virtual('formatted_dob').get(function () {
  return this.date_of_birth
    ? this.date_of_birth.toISOString().slice(0, 10)
    : '';
});

AuthorSchema.virtual('formatted_dod').get(function () {
  return this.date_of_death
    ? this.date_of_death.toISOString().slice(0, 10)
    : '';
});

// export the model
module.exports = mongoose.model('Author', AuthorSchema);
