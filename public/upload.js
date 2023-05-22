var fileUpload = document.getElementsByClassName("fileUpload");


Array.from(fileUpload).forEach(function(element) {
      element.addEventListener('change', function(){
       console.log('element', element, element.value)

       const hiddenInput = element.parentNode.childNodes[5]
       console.log('hiddenInput', hiddenInput)
       hiddenInput.value = element.value
      });
});

