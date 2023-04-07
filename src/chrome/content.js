/*global chrome*/
if (!chrome.runtime.onMessage.hasListeners())
  chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    const { message } = request;
    const discordOpen = window.location.href.includes("discord.com");
    switch (message) {
      case "INJECT_BUTTON":
        const element =
          document.querySelector('[aria-label="Inbox"]')?.parentElement ||
          document.querySelector('[aria-label="Help"]')?.parentElement;
        if (
          discordOpen &&
          !document.getElementById("injected_iframe_button") &&
          element
        ) {
          element.style.display = "flex";
          element.style.flexDirection = "row-reverse";
          element.style.alignItems = "center";
          element.style.justifyContent = "center";
          const iframe = document.createElement("iframe");
          iframe.id = "injected_iframe_button";
          iframe.src = chrome.runtime.getURL("injected_button.html");
          iframe.scrolling = "no";
          iframe.width = 30;
          iframe.height = 30;
          element.appendChild(iframe);
        }
        break;
      case "INJECT_DIALOG":
        if (discordOpen && !document.getElementById("injected_dialog")) {
          const modal = document.createElement("dialog");
          modal.id = "injected_dialog";
          modal.innerHTML =
            "<style>::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#f1f1f1;}::-webkit-scrollbar-track{background:#888;}</style>";
          modal.style.padding = 0;
          modal.style.border = "none";
          modal.style.backgroundColor = "transparent";
          modal.style.overflow = "auto";
          const iframe = document.createElement("iframe");
          iframe.id = "injected_dialog_iframe";
          iframe.src = chrome.runtime.getURL("injected_dialog.html");
          iframe.height = "800px";
          iframe.width = "1250px";
          // iframe.style.border = "1px dotted gray";
          modal.appendChild(iframe);
          document.body.appendChild(modal);
          document.getElementById("injected_dialog").showModal();
        }
        if (!discordOpen) {
          window.open("https://discord.com", "_blank");
        }
        break;
      case "CLOSE_INJECTED_DIALOG":
        if (discordOpen && document.getElementById("injected_dialog")) {
          document.getElementById("injected_dialog_iframe").remove();
          document.getElementById("injected_dialog").remove();
        }
        break;
      case "GET_TOKEN":
        window.dispatchEvent(new Event("beforeunload"));
        const storage = document.body.appendChild(
          document.createElement("iframe")
        ).contentWindow.localStorage;
        if (storage.token) callback(JSON.parse(storage.token));
        else callback(null);
        return true;
      default:
        break;
    }
  });
