export function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const submitBtn = document.getElementById('form-submit-btn') as HTMLButtonElement;
  const feedbackEl = document.getElementById('form-feedback') as HTMLElement;

  if (!form || !submitBtn || !feedbackEl) return;

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    // 1. Gather Inputs
    const nameInput = document.getElementById('form-name') as HTMLInputElement;
    const phoneInput = document.getElementById('form-phone') as HTMLInputElement;
    const messageInput = document.getElementById('form-message') as HTMLTextAreaElement;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    // Reset feedback
    feedbackEl.className = 'form-feedback';
    feedbackEl.textContent = '';

    // 2. Client Side Validation
    if (!name || name.length < 2) {
      showFeedback('Please enter a valid name (at least 2 characters).', 'error');
      nameInput.focus();
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phone || !phoneRegex.test(phone)) {
      showFeedback('Please enter a valid phone number.', 'error');
      phoneInput.focus();
      return;
    }

    if (!message || message.length < 5) {
      showFeedback('Please enter a message (at least 5 characters).', 'error');
      messageInput.focus();
      return;
    }

    // 3. Loading State
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending Message... <span class="badge-dot" style="margin-left: 8px;"></span>';

    try {
      // Formspree connection
      const formAction = form.getAttribute('action') || 'https://formspree.io/f/placeholder';
      
      // If the action is a placeholder, simulate a highly realistic successful network delay!
      if (formAction.includes('placeholder')) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } else {
        const response = await fetch(formAction, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ name, phone, message })
        });
        
        if (!response.ok) {
          throw new Error('Server returned an error');
        }
      }

      // 4. Success State & WhatsApp Redirection
      showFeedback('✓ Details submitted! Redirecting to WhatsApp to complete your Free Audit booking...', 'success');
      
      const whatsappText = encodeURIComponent(
        `Hello Rainbow Media! I just submitted a booking request for a Free Digital Brand Audit on your site. Here are my details:\n\n` +
        `🏢 Company & Name: ${name}\n` +
        `📞 Phone Number: ${phone}\n` +
        `🎯 Marketing Goals: ${message}`
      );
      const whatsappUrl = `https://wa.me/919791056969?text=${whatsappText}`;

      form.reset();

      // Open WhatsApp booking link after 1.2 seconds so they can see the submit confirmation
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1200);

      // Clear success feedback after 6 seconds
      setTimeout(() => {
        feedbackEl.className = 'form-feedback';
        feedbackEl.textContent = '';
      }, 6000);

    } catch (err) {
      console.error(err);
      showFeedback('There was a problem sending your message. Please try again.', 'error');
    } finally {
      // Restore Button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });

  function showFeedback(text: string, type: 'success' | 'error'): void {
    feedbackEl.textContent = text;
    feedbackEl.className = `form-feedback ${type}`;
  }
}
