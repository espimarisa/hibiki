/**
 * @fileoverview Profile manager
 * @description Manages a profile via the API
 * @module webserver/public/profile
 */

"use strict";

// Gets the csrf token and userID
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
const userID = document.querySelector('meta[name="user-id"]').getAttribute("content");
const userConfig = {};

/**
 * Updates a userConfig
 */

async function updateUserConfig(id, cfg) {
  return fetch(`/api/updateUserConfig/${id}`, {
    method: "post",
    credentials: "include",
    body: JSON.stringify(cfg),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
  });
}

/**
 * Deletes a userConfig
 */

async function deleteUserConfig(id) {
  return fetch(`/api/deleteUserConfig/${id}`, {
    method: "post",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
  });
}

window.addEventListener("load", async () => {
  // Gets items and IDs
  const fetchedItems = await fetch("/api/getItems?profile=true", {
    credentials: "include",
    headers: {
      "CSRF-Token": csrfToken,
    },
  }).then((res) => res.json());

  const configItems = fetchedItems.map((setting) => setting.id);
  if (!userID) return;

  // Sets locale info
  const localeInfo = Intl.DateTimeFormat().resolvedOptions();
  document.getElementById("timezone").value = localeInfo.timeZone;

  const bioElement = document.getElementById("bio");
  const bioMaximum = fetchedItems.find((a) => a.id === "bio").maximum;
  bioElement.addEventListener("input", (element) => {
    const setting = element.target;
    if (setting.value.length > bioMaximum) setting.value = setting.value.substring(0, bioMaximum);
    setting.value = setting.value.replace(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discord(?:app)?\.com\/invite)\/.+\w/i, "");
  });

  /**
   * Refreshes the locale userConfig
   */

  function refreshUserConfig() {
    configItems.forEach((item) => {
      const type = fetchedItems.find((c) => c.id === item).type;
      const element = document.getElementById(item);
      if (!element) return;

      switch (type) {
        // Booleans
        case "boolean": {
          userConfig[item] = document.getElementById(item).children[0].checked;
          break;
        }

        // Numbers
        case "number": {
          userConfig[item] = parseInt(document.getElementById(item).value);
          // userConfig[item] = parseInt(document.getElementById(item).children[0].value.split(" ")[0]);
          break;
        }

        // Strings
        case "string": {
          userConfig[item] = element.value;
          break;
        }

        // Locale
        case "locale": {
          const locales = Array.from(element.children[0].children);
          const setting = locales.find((a) => a.innerText === element.children[0].value).id;
          userConfig[item] = setting;
          break;
        }

        // Timezone
        case "timezone": {
          userConfig[item] = localeInfo.timeZone;
          break;
        }

        // Pronouns
        case "pronouns": {
          const pronouns = Array.from(element.children[0].children);
          const setting = pronouns.indexOf(pronouns.find((a) => a.innerText === element.children[0].value));
          userConfig[item] = setting;
        }
      }
    });
  }

  // Submission button functionality
  document.getElementById("submit").addEventListener("click", async () => {
    const button = document.getElementById("submit");

    // Makes the button "animated" (its not but i like to think it is)
    button.classList.add("is-loading");
    refreshUserConfig();

    // Updates config
    updateUserConfig(userID, userConfig).then((res) => {
      if (res.status === 200 || res.status === 204) {
        // Makes the button "animated"
        button.classList.remove("is-loading");
        button.classList.add("is-success");
        document.getElementById("saved").innerText = "Changes saved";
        setTimeout(() => {
          // Sets the inner content back to the original text
          document.getElementById("saved").innerText = "Save changes";
          button.classList.remove("is-success");
        }, 3000);
      }
    });
  });

  // Deletion button functionality
  document.getElementById("delete").addEventListener("click", async () => {
    const button = document.getElementById("delete");
    button.classList.add("is-loading");

    // Deletes the userConfig
    deleteUserConfig(userID).then((res) => {
      if (res.status === 200) {
        // Button animation & changes
        button.classList.remove("is-loading");
        button.classList.remove("is-light");
        button.classList.add("is-success");
        document.getElementById("reset").innerText = "Profile data deleted";
        setTimeout(() => {
          // Sets the button content back to the original text
          document.getElementById("reset").innerText = "Delete profile data";
          button.classList.remove("is-success");
        }, 3000);
      }

      // "Reloads" the window (in a non-deprecated way)
      return window.location.replace(window.location.href.replace("#", ""));
    });
  });
});
