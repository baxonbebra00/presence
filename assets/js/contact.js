(() => {
  const form = document.getElementById("contact-form");
  const status = document.querySelector("[data-contact-status]");
  if (!(form instanceof HTMLFormElement) || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Please complete the required fields.";
      return;
    }

    const data = new FormData(form);
    const destination = form.dataset.contactEmail || "contact@presence.media";
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const reason = String(data.get("reason") || "General question").trim();
    const subject = String(data.get("subject") || "Website enquiry").trim();
    const message = String(data.get("message") || "").trim();
    const mailSubject = `[${reason}] ${subject}`;
    const mailBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Reason: ${reason}`,
      "",
      message
    ].join("\n");

    status.textContent = "Your email draft is ready. Complete the send in your email app.";
    window.location.href = `mailto:${destination}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
  });
})();
