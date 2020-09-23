/**
 * @fileoverview Guild manager
 * @description Manages a guildconfig via the API
 * @param {string} id The guild ID to fetch
 * @module webserver/manage
 */

// Gets the csrf token
const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

// Gets a server's config
async function getGuildConfig(id) {
  const body = await fetch(`/api/getGuildConfig/${id}`, {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => {
      if (res.status === 204) return {};
      return res.json().catch(() => {});
  });
  return body;
}

// Updates a config
async function updateGuildConfig(id, cfg) {
  return fetch(`/api/updateGuildConfig/${id}`, {
    method: "post",
    credentials: "include",
    body: JSON.stringify(cfg),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": token,
    },
  });
}

// Resets a config
async function resetGuildConfig(id) {
  return fetch(`/api/resetGuildConfig/${id}`, {
    method: "post",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": token,
    },
  });
}

let oldcfg;

// Listens on window load
window.addEventListener("load", async () => {
  // Gets items and IDs
  // Hibiki, powered by unreliable and shitty regexes
  const id = /manage\/([\d]{17,19})/.exec(document.URL)[1];

  const fetchedItems = await fetch("/api/getItems", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => res.json());
  const commands = await fetch("/api/getItems?commands=true", { credentials: "include" }).then(res => res.json());
  const configItems = fetchedItems.map(p => p.id);

  if (!id) return;
  let guildConfig = await getGuildConfig(id);
  oldcfg = { ...guildConfig };
  if (!guildConfig) guildConfig = {};

  // Slices content
  [document.getElementById("prefix"), document.getElementById("joinMessage"), document.getElementById("leaveMessage")].forEach(d => {
    d.addEventListener("input", starget => {
      const e = starget.target;
      if (e.id === "prefix" && e.value.length > 15) e.value = e.value.substring(0, 15);
      if (e.id === "joinMessage" && e.value.length > 200) e.value = e.value.substring(0, 200);
      if (e.id === "leaveMessage" && e.value.length > 200) e.value = e.value.substring(0, 200);
    });
  });

  // Gets each element
  Object.keys(guildConfig).forEach(p => {
    const element = document.getElementById(p);
    if (!element && p !== "disabledCategories") return;
    const type = fetchedItems.find(pr => pr.id === p).type;

    // Boolean checker
    if (type === "bool") {
      if (guildConfig[p]) document.getElementById(p).children[0].children[0].checked = true;
      else document.getElementById(p).children[1].children[0].checked = true;
    }

    // Checks number content
    if (type === "number") {
      document.getElementById(p).children[0].value = Array.from(document.getElementById(p).children[0].children).find(n => n.innerText.split(" ")[0] === `${guildConfig[p]}`)
        .innerText;
    }

    // Checks for ticked punishments
    if (type === "punishment") {
      guildConfig[p].forEach(punishment => {
        if (punishment === "Purge") document.getElementById(p).children[0].checked = true;
        if (punishment === "Mute") document.getElementById(p).children[2].checked = true;
        if (punishment === "Warn") document.getElementById(p).children[4].checked = true;
      });
    }

    // Gets the channel/roleID from content
    if (type === "channelID" || type === "roleID") {
      const opt = Array.from(element.children[0].children).find(a => a.id === guildConfig[p]);
      if (!opt) return;
      document.getElementById(p).children[0].value = opt.innerText;
    }

    // Sets string; emoji as content
    if (type === "string") element.value = guildConfig[p];
    if (type === "emoji") element.innerHTML = guildConfig[p];

    // Sets RoleArray as content
    if (type === "roleArray") {
      if (typeof guildConfig[p] !== "object") guildConfig[p] = [guildConfig[p]];
      const roles = [];
      const cc = [];
      const multiselect = Array.from(document.querySelector(`#${p} > div > div > ul`).children);

      // Pushes the roles
      multiselect.forEach(e => {
        if (!e.children[0]) return;
        roles.push(e.children[0].children[0].value);
      });

      // Role IDs
      roles.forEach(r => {
        const id = /.{1,32} \(([0-9]{16,19})\)/.exec(r)[1];
        if (guildConfig[p] && guildConfig[p].includes(id)) cc.push(r);
      });

      // Sets the selected items
      $(document.getElementById(p).children[0]).multipleSelect("setSelects", cc);
    }

    // Sets ChannelArray as content
    if (type === "channelArray") {
      if (typeof guildConfig[p] !== "object") guildConfig[p] = [guildConfig[p]];
      const channels = [];
      const cc = [];
      const multiselect = Array.from(document.querySelector(`#${p} > div > div > ul`).children);

      // Pushes the channels
      multiselect.forEach(e => {
        if (!e.children[0]) return;
        channels.push(e.children[0].children[0].value);
      });

      // Channel IDs
      channels.forEach(c => {
        const id = /.{1,32} \(([0-9]{16,19})\)/.exec(c)[1];
        if (guildConfig[p] && guildConfig[p].includes(id)) cc.push(c);
      });

      // Sets the selected items
      $(document.getElementById(p).children[0]).multipleSelect("setSelects", cc);
    }

    // Disabled command selector
    if (p === "disabledCmds") {
      $("#disabledCmds > select").multipleSelect("setSelects", [...guildConfig[p], ...$("#disabledCmds > select").multipleSelect("getSelects")]);
    }

    // Disabled categories selector
    if (p === "disabledCategories") {
      let cc = $("#disabledCmds > select").multipleSelect("getSelects");
      // Selects disabled cmds
      guildConfig[p].forEach(cat => {
        const disabledCommands = commands.find(cmd => cmd.label === cat).children.map(child => child.value);
        cc = [...disabledCommands, ...cc];
      });
      $("#disabledCmds > select").multipleSelect("setSelects", cc);
    }
  });

  // Refreshes local guildConfig
  function refreshGuildConfig() {
    configItems.forEach(p => {
      // Gets the items
      const type = fetchedItems.find(c => c.id === p).type;
      const element = document.getElementById(p);
      if (!element) return;

      // Sets booleans in guildConfig
      if (type === "bool") {
        guildConfig[p] = document.getElementById(p).children[0].children[0].checked;
      }

      // Sets numbers in guildConfig
      if (type === "number") {
        guildConfig[p] = parseInt(document.getElementById(p).children[0].value.split(" ")[0]);
      }

      // Sets punishment types in guildConfig
      if (type === "punishment") {
        const Purge = document.getElementById(p).children[0].checked;
        const Mute = document.getElementById(p).children[2].checked;
        const Warn = document.getElementById(p).children[4].checked;
        guildConfig[p] = [];
        if (Purge) guildConfig[p].push("Purge");
        if (Mute) guildConfig[p].push("Mute");
        if (Warn) guildConfig[p].push("Warn");
      }

      // Sets channels/roles in guildConfig
      if (type === "channelID" || type === "roleID") {
        const r = Array.from(element.children[0].children).find(a => a.innerText === element.children[0].value).id;
        guildConfig[p] = !r || r.toLowerCase() === "none" ? null : r;
      }

      // Sets string; emoji in guildConfig
      if (type === "string") guildConfig[p] = element.value;
      if (type === "emoji") guildConfig[p] = element.innerHTML;

      // Sets roles in guildConfig
      if (type === "roleArray") {
        const values = $(document.getElementById(p).children[0]).val();
        const ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        guildConfig[p] = ids;
      }

      // Sets channels in guildConfig
      if (type === "channelArray") {
        const values = $(document.getElementById(p).children[0]).val();
        const ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        guildConfig[p] = ids;
      }
    });

    // Selected disabled items
    const disabledcats = [];
    const disabledcmds = $("#disabledCmds > select").multipleSelect("getSelects");

    // Pushes each item
    document.querySelector("#disabledCmds > div > div > ul").children.forEach(c => {
      if (c.children.length && c.children[0].classList[0] && c.children[0].children[0].checked)
        disabledcats.push(c.children[0].innerText.replace(/\s/g, ""));
    });

    // Sets disabled items in guildConfig
    guildConfig.disabledCmds = disabledcmds.filter(cmd => !disabledcats.includes(commands.find(c => c.children.find(child => child.value === cmd)).label));
    guildConfig.disabledCategories = disabledcats;
  }

  // Submission button functionality
  document.getElementById("submit").addEventListener("click", async () => {
    const button = document.getElementById("submit");
    // Loading animation
    button.classList.add("is-loading");
    refreshGuildConfig();
    oldcfg = { ...guildConfig };
    // Updates config
    updateGuildConfig(id, guildConfig).then(res => {
      if (res.status === 200 || res.status === 204) {
        // Button animation & changes
        button.classList.remove("is-loading");
        button.classList.add("is-success");
        document.getElementById("saved").innerText = "Changes saved";
        setTimeout(() => {
          document.getElementById("saved").innerText = "Save changes";
          button.classList.remove("is-success");
        }, 2000);
      } else {
        // Displays if error (user likely not authed)
        document.getElementById("saved").innerText = "Error, please refresh";
        button.classList.add("is-error");
        button.classList.remove("is-success");
      }
    });
  });

  // Deletion button functionality
  document.getElementById("delete").addEventListener("click", async () => {
    const button = document.getElementById("delete");
    // Loading animation
    button.classList.add("is-loading");
    oldcfg = { ...guildConfig };
    // Updates config
    resetGuildConfig(id).then(res => {
      if (res.status === 200) {
        // Button animation & changes
        button.classList.remove("is-loading");
        button.classList.remove("is-light");
        button.classList.add("is-danger");
        document.getElementById("reset").innerText = "Config reset";
        setTimeout(() => {
          document.getElementById("reset").innerText = "Reset config";
          button.classList.remove("is-danger");
        }, 2000);
      } else {
        // Displays if error (user likely not authed)
        document.getElementById("reset").innerText = "Error, please refresh";
        button.classList.add("is-error");
        button.classList.remove("is-danger");
      }

      // Force reloads the window
      return window.location.reload(true);
    });
  });


  // Config changes
  function compareGuildConfig() {
    // Don't ask for confirmation on deletion
    if (JSON.stringify(guildConfig === { id: id })) return;

    refreshGuildConfig();

    // Compares objects; leave confirmation
    if (JSON.stringify(oldcfg) !== JSON.stringify(guildConfig)) window.onbeforeunload = function() {
      return "Do you really want to leave?";
    };

    else window.onbeforeunload = null;
  }

  // Event listeners
  document.addEventListener("click", compareGuildConfig);
  document.addEventListener("input", compareGuildConfig);
});
