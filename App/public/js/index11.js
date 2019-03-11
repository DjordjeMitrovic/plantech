(function() {
  var connectedSlider, doubleSlider, singleSlider, updateSliderValue, verticalDoubleSlider, verticalSingleSlider;

  updateSliderValue = function(slider, handle) {
    var children, i, results, val, values;
    if (handle == null) {
      handle = 0;
    }
    children = slider.getElementsByClassName('noUi-handle');
    values = slider.noUiSlider.get();
    i = 0;
    results = [];
    while (i < children.length) {
      if (children.length === 1) {
        val = parseInt(values);
      } else {
        val = parseInt(values[i]);
      }
      children[i].dataset.value = val;
      results.push(i++);
    }
    return results;
  };

  singleSlider = document.getElementById('singleSlider');

  noUiSlider.create(singleSlider, {
    animationDuration: 300,
    start: [10],
    step: 1,
    range: {
      'min': 1,
      'max': 14
    }
  });

  singleSlider.noUiSlider.on('update', function() {
    return updateSliderValue(singleSlider);
  });

  doubleSlider = document.getElementById('doubleSlider');

  noUiSlider.create(doubleSlider, {
    animationDuration: 300,
    start: [25, 70],
    step: 1,
    range: {
      'min': 1,
      'max': 200
    }
  });

  doubleSlider.noUiSlider.on('update', function() {
    return updateSliderValue(doubleSlider);
  });

  connectedSlider = document.getElementById('connectedSlider');

  noUiSlider.create(connectedSlider, {
    animationDuration: 300,
    start: [50, 150],
    step: 1,
    connect: true,
    range: {
      'min': 1,
      'max': 200
    }
  });

  connectedSlider.noUiSlider.on('update', function() {
    return updateSliderValue(connectedSlider);
  });

  verticalSingleSlider = document.getElementById('verticalSingleSlider');

  noUiSlider.create(verticalSingleSlider, {
    animationDuration: 300,
    start: [10],
    step: 1,
    orientation: 'vertical',
    range: {
      'min': 1,
      'max': 25
    }
  });

  verticalSingleSlider.noUiSlider.on('update', function() {
    return updateSliderValue(verticalSingleSlider);
  });

  verticalDoubleSlider = document.getElementById('verticalDoubleSlider');

  noUiSlider.create(verticalDoubleSlider, {
    animationDuration: 300,
    start: [50, 150],
    step: 1,
    orientation: 'vertical',
    range: {
      'min': 1,
      'max': 200
    }
  });

  verticalDoubleSlider.noUiSlider.on('update', function() {
    return updateSliderValue(verticalDoubleSlider);
  });

}).call(this);