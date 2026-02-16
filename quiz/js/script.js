document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const form = document.getElementById('profile-form');
    const steps = document.querySelectorAll('.form-step');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentStepEl = document.getElementById('current-step');
    const totalStepsEl = document.getElementById('total-steps');
    const successScreen = document.getElementById('success-screen');
    const quizHeader = document.querySelector('.quiz-header');
    
    let currentStep = 1;
    const totalSteps = steps.length;
    
    // Mask / Validation Logic
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            // Format: (XX) XXXXX-XXXX
            let formatted = '';
            if (value.length > 0) {
                formatted = '(' + value.substring(0, 2);
            }
            if (value.length > 2) {
                formatted += ') ' + value.substring(2, 7);
            }
            if (value.length > 7) {
                formatted += '-' + value.substring(7, 11);
            }
            
            e.target.value = formatted;
        });
    }

    // Initialize
    updateProgress();
    
    // Next Button Click
    nextBtn.addEventListener('click', () => {
        goToNextStep();
    });
    
    // Prev Button Click
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // Option selection auto-advance
    const radioOptions = document.querySelectorAll('input[type="radio"]');
    radioOptions.forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentStep < totalSteps) {
                setTimeout(() => goToNextStep(), 250);
                
                const currentStepDiv = document.querySelector(`.form-step[data-step="${currentStep}"]`);
                const errorMsg = currentStepDiv.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            // Simulate submission
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Data:', data);
            
            // Show Success Screen
            form.classList.add('hidden');
            // Hide progress bar container for cleaner look
            document.querySelector('.progress-container').style.display = 'none';
            // Hide step indicator in header, keep brand
            document.querySelector('.step-indicator').style.display = 'none';
            
            if(successScreen) successScreen.classList.remove('hidden');
        }
    });

    // Functions
    function showStep(step) {
        // Update Step Visibility
        steps.forEach(s => {
            s.classList.remove('active');
            if (parseInt(s.dataset.step) === step) {
                s.classList.add('active');
            }
        });
        
        // Update Header Info
        currentStepEl.textContent = step;
        updateProgress();
    }

    function goToNextStep() {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    }
    
    function updateProgress() {
        // Option 1: Start at 0%
        // const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        
        // Option 2: Step-based progress (better visible feedback)
        const percent = (currentStep / totalSteps) * 100;
        
        progressBar.style.width = `${percent}%`;
        
        // Update text
        if(currentStepEl) currentStepEl.textContent = currentStep;
        if(totalStepsEl) totalStepsEl.textContent = totalSteps;
        
        // Show/Hide buttons based on step
        
        // Prev button logic
        if (currentStep === 1) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }
        
        // Next/Submit button logic
        // "Continuar" only on Step 1
        if (currentStep === 1) {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        } else if (currentStep === totalSteps) {
            // Last step: Show Submit, Hide Next
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            // Middle steps (Quiz): Hide both (Auto-advance)
            nextBtn.classList.add('hidden');
            submitBtn.classList.add('hidden');
        }
    }
    
    function validateStep(step) {
        let isValid = true;
        const currentStepDiv = document.querySelector(`.form-step[data-step="${step}"]`);
        
        // Remove existing error messages
        const existingErrors = currentStepDiv.querySelectorAll('.error-message');
        existingErrors.forEach(el => el.remove());
        
        // Check required inputs
        const inputs = currentStepDiv.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Group radios/checkboxes by name to validate groups
        const radioGroups = {};
        
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                if (!radioGroups[input.name]) {
                    radioGroups[input.name] = [];
                }
                radioGroups[input.name].push(input);
            } else {
                // Text, Email, etc.
                if (!input.value.trim()) {
                    isValid = false;
                    highlightError(input, 'Campo obrigatório');
                } else if (input.type === 'email') {
                     // Simple Email Validation
                    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!re.test(input.value)){
                        isValid = false;
                        highlightError(input, 'E-mail inválido');
                    }
                } else if (input.id === 'phone') {
                    // Simple Phone Validation (check length)
                    const digits = input.value.replace(/\D/g, '');
                    if (digits.length < 10) {
                        isValid = false;
                        highlightError(input, 'Número de telefone inválido');
                    }
                }
            }
        });
        
        // Validate Radio Groups
        for (const name in radioGroups) {
            const group = radioGroups[name];
            const isChecked = group.some(input => input.checked);
            if (!isChecked) {
                isValid = false;
                // Highlight the container of the options usually
                const container = group[0].closest('.input-group');
                showGroupError(container, 'Por favor, selecione uma opção.');
            }
        }
        
        if (!isValid) {
            // Shake effect
            currentStepDiv.classList.add('shake');
            setTimeout(() => currentStepDiv.classList.remove('shake'), 500);
        }

        return isValid;
    }
    
    function highlightError(input, msg) {
        input.classList.add('input-error');

        const parent = input.closest('.input-group') || input.parentElement;
        let errorMsg = parent.querySelector('.error-message');

        if (!errorMsg && msg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.color = '#D32F2F';
            errorMsg.style.fontSize = '0.75rem';
            errorMsg.style.marginTop = '6px';
            errorMsg.style.textAlign = 'left';
            errorMsg.textContent = msg;
            parent.appendChild(errorMsg);
        } else if (errorMsg && msg) {
            errorMsg.textContent = msg;
        }

        input.addEventListener('input', () => {
            input.classList.remove('input-error');
            const existing = parent.querySelector('.error-message');
            if (existing) existing.remove();
        }, { once: true });
    }
    
    function showGroupError(container, msg) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#D32F2F';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = msg;
        
        container.appendChild(errorDiv);
        
        // Clear on change
        const inputs = container.querySelectorAll('input');
        inputs.forEach(i => {
            i.addEventListener('change', () => errorDiv.remove(), { once: true });
        });
    }

});
