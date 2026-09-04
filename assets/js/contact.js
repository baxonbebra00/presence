(() => {
  const form = document.getElementById("contact-form");
  const status = document.querySelector("[data-contact-status]");
  const telegramUrl = "https://t.me/presencemedia";
  if (!(form instanceof HTMLFormElement) || !status) return;

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    return copied;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Please complete the required fields.";
      return;
    }

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const reason = String(data.get("reason") || "General question").trim();
    const subject = String(data.get("subject") || "Website enquiry").trim();
    const message = String(data.get("message") || "").trim();
    const telegramMessage = [
      "PRESENCE website message",
      "",
      `Name: ${name}`,
      ...(email ? [`Reply email: ${email}`] : []),
      `Reason: ${reason}`,
      `Subject: ${subject}`,
      "",
      message
    ].join("\n");

    const telegramWindow = window.open(telegramUrl, "_blank");
    if (telegramWindow) telegramWindow.opener = null;

    try {
      const copied = await copyText(telegramMessage);
      status.textContent = copied
        ? "Message copied. Paste it into the Telegram chat and press Send."
        : "Telegram is open. Copy your message from the form and send it there.";
    } catch (_) {
      status.textContent = "Telegram is open. Copy your message from the form and send it there.";
    }

    if (!telegramWindow) {
      window.location.href = telegramUrl;
    }
  });
})();
