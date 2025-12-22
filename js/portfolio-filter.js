// Simple CSS-based portfolio filtering
document.addEventListener('DOMContentLoaded', function() {
  const filterLinks = document.querySelectorAll('.portfolio-filters a.filter');
  
  filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all li elements
      document.querySelectorAll('.portfolio-filters li').forEach(li => {
        li.classList.remove('active');
      });
      
      // Add active class to parent li
      this.parentElement.classList.add('active');
      
      // The CSS will handle showing/hiding based on data-filter attribute
    });
  });
});
