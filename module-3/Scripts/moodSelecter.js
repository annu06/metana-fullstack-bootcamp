// Initialize Mood Selector
function initializeMoodSelector() {
  createMoodSelectorDialog();
  updateMoodDisplay();
}

// Create the mood selector dialog
function createMoodSelectorDialog() {
  // Create dialog if it doesn't exist
  if (!document.getElementById('mood-dialog')) {
    const dialog = document.createElement('div');
    dialog.id = 'mood-dialog';
    dialog.className = 'dialog-overlay';
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="mood-selector">
          <h2>How are you feeling today?</h2>
          <div class="mood-options">
            <div class="mood-option" data-mood="😀">
              <div class="mood-emoji">😀</div>
              <div class="mood-label">Great</div>
            </div>
            <div class="mood-option" data-mood="🙂">
              <div class="mood-emoji">🙂</div>
              <div class="mood-label">Good</div>
            </div>
            <div class="mood-option" data-mood="😐">
              <div class="mood-emoji">😐</div>
              <div class="mood-label">Neutral</div>
            </div>
            <div class="mood-option" data-mood="😔">
              <div class="mood-emoji">😔</div>
              <div class="mood-label">Down</div>
            </div>
            <div class="mood-option" data-mood="😢">
              <div class="mood-emoji">😢</div>
              <div class="mood-label">Sad</div>
            </div>
          </div>
          <div class="mood-actions">
            <button type="button" id="save-mood-btn">Save Mood</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Set up event listeners for mood options
    dialog.querySelectorAll('.mood-option').forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        dialog.querySelectorAll('.mood-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
      });
    });
    
    // Set up save button event listener
    document.getElementById('save-mood-btn').addEventListener('click', () => {
      saveMood();
      dialog.style.display = 'none';
    });
    
    // Select default mood (neutral or previously saved)
    const savedMood = localStorage.getItem('userMood') || '🙂';
    const defaultOption = dialog.querySelector(`.mood-option[data-mood="${savedMood}"]`);
    if (defaultOption) {
      defaultOption.classList.add('selected');
    }
  }
}

// Save selected mood to localStorage
function saveMood() {
  const selectedOption = document.querySelector('.mood-option.selected');
  
  if (selectedOption) {
    const mood = selectedOption.dataset.mood;
    localStorage.setItem('userMood', mood);
    
    // Update mood button in header
    updateMoodDisplay();
    
    // Update suggested tasks based on new mood
    loadSuggestedTasks();
    
    showToast('Mood updated successfully');
  }
}

// Update the mood display in the header
function updateMoodDisplay() {
  const moodBtn = document.querySelector('.mood-btn');
  const savedMood = localStorage.getItem('userMood') || '🙂';
  
  moodBtn.textContent = `Mood: ${savedMood}`;
}