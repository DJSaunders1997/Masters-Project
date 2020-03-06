
'use strict';

window.ParsleyConfig = {
  validators: {
    mustequal: {
      fn: function(value, requirement) {
        var target = parseFloat(requirement),
            value = parseFloat(value);
        target = Math.round(target*100)/100;
        value = Math.round(value*100)/100;
        //var valid = val === target;
        return value === target;
      },
      priority: 32
    }
  },
  messages: {
    mustequal: 'This value must equal %s'
  },
  excluded: 'input[type=button], input[type=submit], input[type=reset]',
  inputs: 'input, textarea, select, input[type=hidden]'
};

var $ = require('jquery');
var parsley = require('parsleyjs');
var timing = require('./instrumentation/timing');
var ds = require('./view_models/data_store');

$.listen('parsley:form:validate', function(form) {
  form.submitEvent.preventDefault();
  if(form.isValid()) {
    // Indicate that we're submitting
    var submitButton = $(form.$element).find('button[type=submit]')
    var oldButtonText = submitButton.text();
    submitButton.attr("disabled", true);
    submitButton.text('Submitting...');

    // Submit the timing data
    if(form.$element.data('timing')) {
      timing.stop();
      var turkId = $('input[name=turk_id]').val();
      var step = $('input[name=step]').val();
      timing.save(turkId, step);
    }

    // Submit the form
    var flow = require('./flow');
    var service = form.$element.attr('action').slice(5);
    //var data = ds.addData(service, form.$element.serialize());
    var formInputs = form.$element.serializeArray();
    var formData = {};
    formInputs.forEach(function(ip, i) {
      formData[ip.name] = ip.value;
    });
    var data = ds.addData(service, formData);
    flow.fsm.handle('formSuccess', data);
  }

});

var initForm = function(turkId, assignmentId, step) {
  $('input[name=turk_id]').val(turkId);
  $('input[name=assignment_id]').val(assignmentId);
  $('input[name=step]').val(step);

  $('form').parsley();
  if($('form').data('timing')) {
    timing.start();
  }
};

module.exports = initForm;
