// Debug logging function
function debug(message) {
  const debugContent = document.getElementById('debug-content');
  debugContent.innerHTML += message + '<br>';
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', function() {
  debug('Script started');
  const button = document.getElementById('toggle-analysis');
  const resultsDiv = document.getElementById('analysis-results');

  // Load initial state
  chrome.storage.local.get(['analysisEnabled'], function(result) {
    const isEnabled = result.analysisEnabled || false;
    updateButtonState(button, isEnabled);
    debug('Initial state loaded: ' + (isEnabled ? 'ON' : 'OFF'));
  });

  // Button click handler
  button.addEventListener('click', function() {
    debug('Button clicked');
    chrome.storage.local.get(['analysisEnabled'], function(result) {
      const newState = !result.analysisEnabled;
      updateButtonState(button, newState);
      
      // Save the new state
      chrome.storage.local.set({ analysisEnabled: newState }, function() {
        debug('State saved to storage');
        
        // Send message to content script
        debug('Sending message to content script...');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "toggleAnalysis",
              enabled: newState
            }).catch(function(error) {
              debug('Error: ' + error.message);
            });
          }
        });
      });
    });
  });
});

// Update button state and appearance
function updateButtonState(button, isEnabled) {
  button.textContent = isEnabled ? 'ON' : 'OFF';
  button.style.backgroundColor = isEnabled ? '#4CAF50' : '#F44336';
  button.style.color = 'white';
  debug('Button state updated: ' + (isEnabled ? 'ON' : 'OFF'));
}

// Display analysis results
function displayResults(results) {
  const resultsContent = document.getElementById('results-content');
  const finalScoreDiv = document.getElementById('final-score');
  
  resultsContent.innerHTML = '';
  
  // Display each category
  for (const [categoryName, category] of Object.entries(results.categoryScores)) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    
    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = formatCategoryName(categoryName);
    categoryDiv.appendChild(categoryTitle);
    
    // Display subcategories
    for (const [subName, subScore] of Object.entries(category.subScores)) {
      const subDiv = document.createElement('div');
      subDiv.className = 'subcategory';
      subDiv.innerHTML = `${formatCategoryName(subName)}: <span class="grade-${subScore.grade}">${subScore.grade}</span>`;
      categoryDiv.appendChild(subDiv);
    }
    
    resultsContent.appendChild(categoryDiv);
  }
  
  // Display final score and grade
  finalScoreDiv.innerHTML = `
    <div class="category">
      <h4>Final Results</h4>
      <div>Score: ${results.finalScore}/100</div>
      <div>Grade: <span class="grade-${results.finalGrade}">${results.finalGrade}</span></div>
    </div>
  `;
}

// Helper function to format category names
function formatCategoryName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
