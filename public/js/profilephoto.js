var image = document.getElementsByClassName('profile-photo')
const page = document.getElementByClassName('container');
image.addEventListener('load', function() {
    page.style.display = 'block'
  });