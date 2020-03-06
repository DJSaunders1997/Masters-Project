'use strict';

var $ = require('jquery');
var ds = require('./view_models/data_store');

var sendAzn = function(turkId, assignmentId) {
  $.each(ds.data, function(i, d) {
    var formName = d.name;
    var formData = d.data;
    $.each(formData, function(inputName, inputValue) {
      var name = formName + '-' + inputName;
      var val = JSON.stringify(inputValue);
      $('#aws-submit').append('<input type="hidden" name="' + name + '" value=\'' + val + '\'/>');
    });
  });
  $('#aws-submit').append('<input type="hidden" name="workerId" value="' + turkId + '"/>');
  $('#aws-submit').append('<input type="hidden" name="assignmentId" value="' + assignmentId + '"/>');
  
  $('#aws-submit').append('<p>Click the button below to submit to amazon</p>');
  $('#aws-submit').append('<button type="submit">Submit</button>');
  $('.panel.info .status').remove();
};

module.exports = sendAzn;
